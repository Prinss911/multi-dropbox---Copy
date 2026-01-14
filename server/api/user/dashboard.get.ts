import { serverSupabaseUser, useSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    try {
        const supabase = useSupabase()

        // Get user's files (to calculate storage usage per account)
        const { data: userFiles } = await supabase
            .from('files')
            .select('*')
            .eq('user_id', user.id)

        const files = (userFiles || []) as { dropbox_account_id: string; size: number }[]

        // Group storage by account
        const storageByAccount = new Map<string, {
            accountId: string
            accountName: string
            used: number
        }>()

        for (const file of files) {
            const existing = storageByAccount.get(file.dropbox_account_id) || {
                accountId: file.dropbox_account_id,
                accountName: '', // Will be populated from shares or accounts
                used: 0
            }
            existing.used += file.size || 0
            storageByAccount.set(file.dropbox_account_id, existing)
        }

        // Get user's shares
        const { data: userShares } = await supabase
            .from('shares')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        const allShares = (userShares || []) as any[]
        const now = new Date()

        // Get account names from shares
        for (const share of allShares) {
            if (storageByAccount.has(share.account_id)) {
                const account = storageByAccount.get(share.account_id)!
                if (!account.accountName && share.account_name) {
                    account.accountName = share.account_name
                }
            }
        }

        // Convert to array
        const accounts = Array.from(storageByAccount.values()).map(acc => ({
            id: acc.accountId,
            name: acc.accountName || 'Unknown Account',
            used: acc.used,
            allocated: 2 * 1024 * 1024 * 1024 // 2GB default allocation per account (user's quota)
        }))

        // Calculate total storage
        const totalUsed = accounts.reduce((sum, a) => sum + a.used, 0)
        // For user, we give them a default quota (e.g., 4GB total)
        const userQuota = 4 * 1024 * 1024 * 1024 // 4GB

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
                downloads: s.download_count
            }))

        // Recent shares (last 5)
        const recentShares = allShares.slice(0, 5).map(s => ({
            id: s.id,
            fileName: s.file_name,
            accountName: s.account_name,
            createdAt: s.created_at,
            expiresAt: s.expires_at,
            downloads: s.download_count
        }))

        // Count unique accounts user has uploaded to
        const uniqueAccountIds = new Set(files.map(f => f.dropbox_account_id))

        return {
            accounts,
            storage: {
                used: totalUsed,
                allocated: userQuota,
                percentage: userQuota > 0 ? Math.round((totalUsed / userQuota) * 100) : 0
            },
            shares: {
                total: allShares.length,
                active: activeShares.length,
                expired: expiredShares.length,
                totalDownloads
            },
            topDownloaded,
            recentShares,
            accountCount: uniqueAccountIds.size
        }

    } catch (error: any) {
        console.error('User Dashboard API error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to load dashboard data'
        })
    }
})
