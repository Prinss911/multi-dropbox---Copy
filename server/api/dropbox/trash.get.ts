import type { files } from 'dropbox'

export default defineEventHandler(async (event) => {
    try {
        const { getActiveClient } = useDropboxServer()
        const { client: dbx, account } = await getActiveClient()

        // List all files including deleted
        const response = await dbx.filesListFolder({
            path: '',
            recursive: true,
            include_deleted: true,
            limit: 100,
        })

        // Filter only deleted entries and get their deletion info
        const deletedEntries = response.result.entries.filter(entry => entry['.tag'] === 'deleted')

        // For each deleted entry, try to get the deletion date from revisions
        const entriesWithDates = await Promise.all(
            deletedEntries.slice(0, 30).map(async (entry) => {
                const deletedEntry = entry as files.DeletedMetadata
                let deletedAt: string | null = null
                let daysRemaining: number | null = null

                try {
                    // Get revisions to find when it was deleted
                    const revisions = await dbx.filesListRevisions({
                        path: deletedEntry.path_lower || '',
                        limit: 5
                    })

                    // Find the last revision before deletion
                    if (revisions.result.entries.length > 0) {
                        const lastRevision = revisions.result.entries[0]
                        deletedAt = lastRevision.server_modified

                        // Calculate days remaining (30 days retention for personal accounts)
                        const deletedDate = new Date(deletedAt)
                        const expiryDate = new Date(deletedDate.getTime() + 30 * 24 * 60 * 60 * 1000)
                        const now = new Date()
                        const msRemaining = expiryDate.getTime() - now.getTime()
                        daysRemaining = Math.max(0, Math.ceil(msRemaining / (24 * 60 * 60 * 1000)))
                    }
                } catch (err) {
                    // Revisions might not be available for all files
                    console.log('Could not get revisions for:', deletedEntry.name)
                }

                return {
                    id: deletedEntry.path_lower || deletedEntry.name,
                    name: deletedEntry.name,
                    path: deletedEntry.path_lower || '',
                    type: 'deleted' as const,
                    size: null,
                    deletedAt,
                    daysRemaining,
                    extension: deletedEntry.name.split('.').pop()?.toLowerCase() || null,
                }
            })
        )

        return {
            entries: entriesWithDates,
            accountId: account.id,
            accountName: account.name
        }
    } catch (error: any) {
        console.error('Trash files error:', error)

        throw createError({
            statusCode: error.status || 500,
            statusMessage: error.error?.error_summary || error.message || 'Failed to get trash files'
        })
    }
})
