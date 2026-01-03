export default defineEventHandler(async (event) => {
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

        // Permanently delete from trash
        const response = await dbx.filesDeleteV2({
            path: path
        })

        return {
            success: true,
            metadata: response.result.metadata
        }
    } catch (error: any) {
        console.error('Permanent delete error:', error)

        throw createError({
            statusCode: error.status || 500,
            statusMessage: error.error?.error_summary || error.message || 'Failed to permanently delete'
        })
    }
})
