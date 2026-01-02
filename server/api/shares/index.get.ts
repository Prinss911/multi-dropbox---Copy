import { getSharesByAccount, cleanExpiredShares } from '../../utils/shares'

export default defineEventHandler(async (event) => {
    try {
        const { getActiveClient } = useDropboxServer()
        const { account } = await getActiveClient()

        // Clean expired shares first
        await cleanExpiredShares()

        // Get shares for active account (Async)
        const accountShares = await getSharesByAccount(account.id)

        // Get base URL
        const host = getHeader(event, 'host') || 'localhost:3000'
        const protocol = host.includes('localhost') ? 'http' : 'https'

        // Add URL to each share
        const sharesWithUrl = accountShares.map(share => ({
            ...share,
            url: `${protocol}://${host}/download/${share.id}`,
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
