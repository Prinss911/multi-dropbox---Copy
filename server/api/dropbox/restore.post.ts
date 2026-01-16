import { requireAdmin } from '../../utils/permissions'

export default defineEventHandler(async (event) => {
    // SECURITY: Only admins can restore files
    await requireAdmin(event)

    const body = await readBody(event)
    const { path } = body

    if (!path) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Path is required'
        })
    }

    try {
        const { getActiveClient, getClientForAccount } = useDropboxServer()

        let dbx
        if (body.accountId) {
            dbx = await getClientForAccount(body.accountId)
        } else {
            const res = await getActiveClient()
            dbx = res.client
        }

        // Get the revisions of the file
        const revisions = await dbx.filesListRevisions({
            path: path,
            limit: 10
        })

        // The first entry should be a valid revision
        const validRevision = revisions.result.entries[0]

        if (!validRevision) {
            throw createError({
                statusCode: 404,
                statusMessage: 'No valid revision found to restore'
            })
        }

        const response = await dbx.filesRestore({
            path: path,
            rev: validRevision.rev
        })

        return {
            success: true,
            metadata: response.result
        }
    } catch (error: any) {
        console.error('Restore error:', error)

        if (error.statusCode) throw error

        throw createError({
            statusCode: error.status || 500,
            statusMessage: error.error?.error_summary || error.message || 'Failed to restore file'
        })
    }
})
