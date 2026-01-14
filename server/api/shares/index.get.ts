import { getSharesByAccount, findActiveShare, cleanExpiredShares } from '../../utils/shares'

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event)
        const accountId = query.accountId as string
        const filePath = query.filePath as string

        // Clean expired shares first
        await cleanExpiredShares()

        let accountShares: any[] = []

        if (accountId && filePath) {
            // Find specific active share
            const share = await findActiveShare(accountId, filePath)
            if (share) accountShares = [share]
        } else if (accountId) {
            // List all for account
            accountShares = await getSharesByAccount(accountId)
        } else {
            // Get shares for active account (Legacy default)
            const { getActiveClient } = useDropboxServer()
            const { account } = await getActiveClient()
            accountShares = await getSharesByAccount(account.id)
        }

        // Get base URL
        const host = getHeader(event, 'host') || 'localhost:3000'
        const protocol = host.includes('localhost') ? 'http' : 'https'

        // Add URL to each share
        const sharesWithUrl = accountShares.map(share => ({
            ...share,
            url: `${protocol}://${host}/file/${share.id}`,
            isExpired: new Date(share.expiresAt) < new Date()
        }))

        return {
            shares: sharesWithUrl,
            total: sharesWithUrl.length
        }
    } catch (error: any) {
        console.error('List shares error:', error)

        throw createError({
            statusCode: error.status || 500,
            statusMessage: error.message || 'Failed to list shares'
        })
    }
})
