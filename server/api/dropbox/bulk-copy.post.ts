export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { entries } = body // [{ from_path, to_path }, ...]

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'entries array is required'
        })
    }

    try {
        const { getActiveClient } = useDropboxServer()
        const { client: dbx } = await getActiveClient()

        // Copy files in batch
        const response = await dbx.filesCopyBatchV2({
            entries: entries.map(e => ({
                from_path: e.from_path,
                to_path: e.to_path
            })),
            autorename: true
        })

        // If async job, wait for completion
        if (response.result['.tag'] === 'async_job_id') {
            let jobStatus = await dbx.filesCopyBatchCheckV2({
                async_job_id: response.result.async_job_id
            })

            // Poll until complete (max 30 seconds)
            let attempts = 0
            while (jobStatus.result['.tag'] === 'in_progress' && attempts < 30) {
                await new Promise(resolve => setTimeout(resolve, 1000))
                jobStatus = await dbx.filesCopyBatchCheckV2({
                    async_job_id: response.result.async_job_id
                })
                attempts++
            }

            if (jobStatus.result['.tag'] === 'complete') {
                return {
                    success: true,
                    copied: jobStatus.result.entries.length
                }
            } else {
                throw new Error('Batch copy timed out or failed')
            }
        }

        return {
            success: true,
            copied: entries.length
        }
    } catch (error: any) {
        console.error('Bulk copy error:', error)

        throw createError({
            statusCode: error.status || 500,
            statusMessage: error.error?.error_summary || error.message || 'Failed to copy files'
        })
    }
})
