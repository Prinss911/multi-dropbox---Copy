export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const path = query.path as string

    if (!path) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Path is required',
        })
    }

    try {
        const { getActiveClient } = useDropboxServer()
        const { client: dbx, account } = await getActiveClient()

        console.log(`[Download API] Getting link for account: ${account.name}, path: ${path}`)

        const response = await dbx.filesGetTemporaryLink({
            path: path,
        })

        return {
            link: response.result.link,
            metadata: {
                name: response.result.metadata.name,
                size: response.result.metadata.size,
            },
        }
    } catch (error: any) {
        console.error('Dropbox Download Error:', error)

        const errorSummary = error.error?.error_summary || ''

        if (errorSummary.includes('not_found')) {
            throw createError({
                statusCode: 404,
                statusMessage: 'File not found'
            })
        }

        throw createError({
            statusCode: error.status || 500,
            statusMessage: errorSummary || error.message || 'Failed to get download link',
        })
    }
})
