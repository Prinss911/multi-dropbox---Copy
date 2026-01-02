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
        const { getActiveClient } = useDropboxServer()
        const { client: dbx } = await getActiveClient()

        const response = await dbx.filesDeleteV2({
            path: path
        })

        return {
            success: true,
            metadata: response.result.metadata
        }
    } catch (error: any) {
        console.error('Delete error:', error)

        // Handle specific Dropbox errors
        const errorTag = error.error?.error?.['.tag']

        if (errorTag === 'path_lookup') {
            throw createError({
                statusCode: 404,
                statusMessage: 'File or folder not found'
            })
        }

        if (errorTag === 'path_write') {
            const writeError = error.error?.error?.path_write?.['.tag']
            if (writeError === 'conflict') {
                throw createError({
                    statusCode: 409,
                    statusMessage: 'Cannot delete: file is in use or conflict detected'
                })
            }
        }

        throw createError({
            statusCode: error.status || 500,
            statusMessage: error.error?.error_summary || error.message || 'Failed to delete'
        })
    }
})
