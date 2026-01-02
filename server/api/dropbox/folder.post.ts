export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { path, name } = body

    if (!name) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Folder name is required'
        })
    }

    // Validate folder name
    const invalidChars = /[<>:"/\\|?*]/
    if (invalidChars.test(name)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Folder name contains invalid characters'
        })
    }

    try {
        const { getActiveClient } = useDropboxServer()
        const { client: dbx } = await getActiveClient()

        const folderPath = path ? `${path}/${name}` : `/${name}`

        const response = await dbx.filesCreateFolderV2({
            path: folderPath,
            autorename: false
        })

        return {
            success: true,
            folder: {
                id: response.result.metadata.id,
                name: response.result.metadata.name,
                path: response.result.metadata.path_lower
            }
        }
    } catch (error: any) {
        console.error('Create folder error:', error)

        const errorSummary = error.error?.error_summary || ''

        // Handle duplicate folder name
        if (errorSummary.includes('conflict')) {
            throw createError({
                statusCode: 409,
                statusMessage: 'A folder with this name already exists'
            })
        }

        throw createError({
            statusCode: error.status || 500,
            statusMessage: errorSummary || error.message || 'Failed to create folder'
        })
    }
})
