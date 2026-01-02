import type { files } from 'dropbox'

export default defineEventHandler(async (event) => {
    try {
        const { getActiveClient } = useDropboxServer()
        const { client: dbx, account } = await getActiveClient()

        // Get recently modified files using search
        // Dropbox doesn't have a direct "recent" API, so we search for recent modifications
        const response = await dbx.filesListFolder({
            path: '',
            recursive: true,
            include_media_info: true,
            include_deleted: false,
            limit: 100,
        })

        // Transform and sort by modified date
        const entries = response.result.entries
            .filter(entry => entry['.tag'] === 'file')
            .map((entry) => {
                const fileEntry = entry as files.FileMetadata
                return {
                    id: fileEntry.id,
                    name: fileEntry.name,
                    path: fileEntry.path_lower,
                    type: 'file' as const,
                    size: fileEntry.size,
                    modified: fileEntry.server_modified,
                    extension: fileEntry.name.split('.').pop()?.toLowerCase() || null,
                }
            })
            .sort((a, b) => {
                const dateA = new Date(a.modified || 0).getTime()
                const dateB = new Date(b.modified || 0).getTime()
                return dateB - dateA // Most recent first
            })
            .slice(0, 20) // Top 20 recent files

        return {
            entries,
            accountId: account.id,
            accountName: account.name
        }
    } catch (error: any) {
        console.error('Recent files error:', error)

        throw createError({
            statusCode: error.status || 500,
            statusMessage: error.error?.error_summary || error.message || 'Failed to get recent files'
        })
    }
})
