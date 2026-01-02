export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { fromPath, toPath } = body

    if (!fromPath || !toPath) {
        throw createError({
            statusCode: 400,
            statusMessage: 'fromPath and toPath are required'
        })
    }

    try {
        const { getActiveClient } = useDropboxServer()
        const { client: dbx } = await getActiveClient()

        const response = await dbx.filesMoveV2({
            from_path: fromPath,
            to_path: toPath,
            autorename: false
        })

        return {
            success: true,
            metadata: response.result.metadata
        }
    } catch (error: any) {
        console.error('Rename/Move error:', error)

        const errorSummary = error.error?.error_summary || ''

        if (errorSummary.includes('conflict')) {
            throw createError({
                statusCode: 409,
                statusMessage: 'A file or folder with this name already exists'
            })
        }

        if (errorSummary.includes('not_found')) {
            throw createError({
                statusCode: 404,
                statusMessage: 'File or folder not found'
            })
        }

        throw createError({
            statusCode: error.status || 500,
            statusMessage: errorSummary || error.message || 'Failed to rename/move'
        })
    }
})
