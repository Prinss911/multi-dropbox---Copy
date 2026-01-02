export default defineEventHandler(async (event) => {
    try {
        const { getActiveClient } = useDropboxServer()
        const { client: dbx, account } = await getActiveClient()

        const response = await dbx.usersGetSpaceUsage()

        const used = response.result.used
        const allocated = response.result.allocation

        let total = 0
        if (allocated['.tag'] === 'individual') {
            total = allocated.allocated
        } else if (allocated['.tag'] === 'team') {
            total = allocated.allocated
        }

        return {
            used,
            total,
            accountId: account.id,
            accountName: account.name
        }
    } catch (error: any) {
        console.error('Storage info error:', error)

        throw createError({
            statusCode: error.status || 500,
            statusMessage: error.error?.error_summary || error.message || 'Failed to get storage info'
        })
    }
})
