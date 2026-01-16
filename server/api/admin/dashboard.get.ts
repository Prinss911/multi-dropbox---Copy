import { getAccounts } from '../../utils/accounts'
import { useSupabase } from '../../utils/supabase'
import { requireAdmin } from '../../utils/permissions'

export default defineEventHandler(async (event) => {
    // SECURITY: Only admins can view dashboard
    await requireAdmin(event)

    try {
        const { getClientForAccount } = useDropboxServer()
        const accounts = await getAccounts()
        const supabase = useSupabase()

        // Get storage info per account
        const accountStats = await Promise.all(
            accounts.map(async (account) => {
                try {
                    const dbx = await getClientForAccount(account.id)
                    const usage = await dbx.usersGetSpaceUsage()

                    return {
                        id: account.id,
                        name: account.name,
                        email: account.email,
                        used: usage.result.used,
                        allocated: usage.result.allocation?.allocated || 0
                    }
                } catch (err) {
                    console.error(`Error getting storage for ${account.name}:`, err)
                    return {
                        id: account.id,
                        name: account.name,
                        email: account.email,
                        used: 0,
                        allocated: 0,
                        error: true
                    }
                }
            })
        )

        // Calculate totals
        const totalUsed = accountStats.reduce((sum, a) => sum + (a.used || 0), 0)
        const totalAllocated = accountStats.reduce((sum, a) => sum + (a.allocated || 0), 0)

        // Get share stats from database
        const { data: shares } = await supabase
            .from('shares')
            .select('id, created_at, expires_at, download_count, file_name, account_name, account_id')
            .order('created_at', { ascending: false })

        const allShares = (shares || []) as any[]
        const now = new Date()

        const activeShares = allShares.filter(s =>
            !s.expires_at || new Date(s.expires_at) > now
        )

        const expiredShares = allShares.filter(s =>
            s.expires_at && new Date(s.expires_at) <= now
        )

        const totalDownloads = allShares.reduce((sum, s) => sum + (s.download_count || 0), 0)

        // Top downloaded files
        const topDownloaded = [...allShares]
            .filter(s => s.download_count > 0)
            .sort((a, b) => b.download_count - a.download_count)
            .slice(0, 5)
            .map(s => ({
                fileName: s.file_name,
                accountName: s.account_name,
                accountId: s.account_id,
                downloads: s.download_count
            }))

        // Recent shares (last 5)
        const recentShares = allShares.slice(0, 5).map(s => ({
            id: s.id,
            fileName: s.file_name,
            accountName: s.account_name,
            accountId: s.account_id,
            createdAt: s.created_at,
            expiresAt: s.expires_at,
            downloads: s.download_count
        }))

        return {
            accounts: accountStats,
            storage: {
                used: totalUsed,
                allocated: totalAllocated,
                percentage: totalAllocated > 0 ? Math.round((totalUsed / totalAllocated) * 100) : 0
            },
            shares: {
                total: allShares.length,
                active: activeShares.length,
                expired: expiredShares.length,
                totalDownloads
            },
            topDownloaded,
            recentShares,
            accountCount: accounts.length
        }

    } catch (error: any) {
        console.error('Dashboard API error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to load dashboard data'
        })
    }
})
