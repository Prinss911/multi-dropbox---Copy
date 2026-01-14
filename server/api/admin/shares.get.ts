import { useSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
    try {
        const supabase = useSupabase()

        // Fetch all shares (admin only - no user filter)
        const { data, error } = await supabase
            .from('shares')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        // Transform to camelCase
        const shares = ((data || []) as any[]).map(item => ({
            id: item.id,
            fileId: item.file_id,
            fileName: item.file_name,
            filePath: item.file_path,
            files: item.files || [],
            accountId: item.account_id,
            accountName: item.account_name,
            createdAt: item.created_at,
            expiresAt: item.expires_at,
            downloadCount: item.download_count,
            userId: item.user_id
        }))

        // Get unique accounts for filter
        const accounts = [...new Map(shares.map(s => [s.accountId, { id: s.accountId, name: s.accountName }])).values()]

        return {
            shares,
            accounts,
            total: shares.length
        }

    } catch (error: any) {
        console.error('Fetch shares error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to fetch shares'
        })
    }
})
