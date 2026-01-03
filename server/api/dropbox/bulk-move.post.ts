export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { entries, accountId } = body // [{ from_path, to_path }, ...]

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'entries array is required'
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

        // Move files in batch
        const response = await dbx.filesMoveBatchV2({
            entries: entries.map(e => ({
                from_path: e.from_path,
                to_path: e.to_path
            })),
            autorename: true
        })

        // If async job, wait for completion
        if (response.result['.tag'] === 'async_job_id') {
            let jobStatus = await dbx.filesMoveBatchCheckV2({
                async_job_id: response.result.async_job_id
            })

            // Poll until complete (max 30 seconds)
            let attempts = 0
            while (jobStatus.result['.tag'] === 'in_progress' && attempts < 30) {
                await new Promise(resolve => setTimeout(resolve, 1000))
                jobStatus = await dbx.filesMoveBatchCheckV2({
                    async_job_id: response.result.async_job_id
                })
                attempts++
            }

            if (jobStatus.result['.tag'] === 'complete') {
                return {
                    success: true,
                    moved: jobStatus.result.entries.length
                }
            } else {
                throw new Error('Batch move timed out or failed')
            }
        }

        return {
            success: true,
            moved: entries.length
        }
    } catch (error: any) {
        console.error('Bulk move error:', error)

        throw createError({
            statusCode: error.status || 500,
            statusMessage: error.error?.error_summary || error.message || 'Failed to move files'
        })
    }
})
