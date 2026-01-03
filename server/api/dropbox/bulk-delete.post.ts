export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { paths, accountId } = body

    if (!paths || !Array.isArray(paths) || paths.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'paths array is required'
        })
    }

    try {
        const { getClientForAccount, getActiveClient } = useDropboxServer()

        let dbx
        if (accountId) {
            dbx = await getClientForAccount(accountId)
        } else {
            const result = await getActiveClient()
            dbx = result.client
        }

        // Delete files in batch
        const entries = paths.map(path => ({ path }))

        const response = await dbx.filesDeleteBatch({
            entries
        })

        // If async job, wait for completion
        if (response.result['.tag'] === 'async_job_id') {
            let jobStatus = await dbx.filesDeleteBatchCheck({
                async_job_id: response.result.async_job_id
            })

            // Poll until complete (max 30 seconds)
            let attempts = 0
            while (jobStatus.result['.tag'] === 'in_progress' && attempts < 30) {
                await new Promise(resolve => setTimeout(resolve, 1000))
                jobStatus = await dbx.filesDeleteBatchCheck({
                    async_job_id: response.result.async_job_id
                })
                attempts++
            }

            if (jobStatus.result['.tag'] === 'complete') {
                return {
                    success: true,
                    deleted: jobStatus.result.entries.length
                }
            } else {
                throw new Error('Batch delete timed out or failed')
            }
        }

        return {
            success: true,
            deleted: paths.length
        }
    } catch (error: any) {
        console.error('Bulk delete error:', error)

        throw createError({
            statusCode: error.status || 500,
            statusMessage: error.error?.error_summary || error.message || 'Failed to delete files'
        })
    }
})
