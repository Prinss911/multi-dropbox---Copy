export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { paths } = body

    if (!paths || !Array.isArray(paths) || paths.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'paths array is required'
        })
    }

    try {
        const { getActiveClient } = useDropboxServer()
        const { client: dbx } = await getActiveClient()

        // For single file, get temporary link
        if (paths.length === 1) {
            const response = await dbx.filesGetTemporaryLink({
                path: paths[0]
            })
            return {
                type: 'single',
                link: response.result.link,
                name: response.result.metadata.name
            }
        }

        // For multiple files, create a zip download link
        const response = await dbx.filesDownloadZip({
            path: paths[0].split('/').slice(0, -1).join('/') || '/' // Use parent folder
        })

        // Actually for multiple files we need to return individual links
        const links = await Promise.all(
            paths.map(async (path) => {
                try {
                    const result = await dbx.filesGetTemporaryLink({ path })
                    return {
                        path,
                        link: result.result.link,
                        name: result.result.metadata.name
                    }
                } catch (e) {
                    // Skip folders (can't get direct link)
                    return null
                }
            })
        )

        return {
            type: 'multiple',
            links: links.filter(Boolean)
        }
    } catch (error: any) {
        console.error('Bulk download error:', error)

        throw createError({
            statusCode: error.status || 500,
            statusMessage: error.error?.error_summary || error.message || 'Failed to get download links'
        })
    }
})
