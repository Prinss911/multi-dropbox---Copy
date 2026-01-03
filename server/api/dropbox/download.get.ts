export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const path = query.path as string
    const accountId = query.accountId as string

    if (!path) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Path is required',
        })
    }

    try {
        const { getClientForAccount, getActiveClient } = useDropboxServer()

        let dbx, account

        if (accountId) {
            const { getAccountById } = await import('../../utils/accounts')
            account = await getAccountById(accountId)
            if (!account) {
                throw createError({ statusCode: 404, statusMessage: 'Account not found' })
            }
            dbx = await getClientForAccount(accountId)
        } else {
            const result = await getActiveClient()
            dbx = result.client
            account = result.account
        }

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
