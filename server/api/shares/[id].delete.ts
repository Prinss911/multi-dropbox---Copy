import { serverSupabaseUser } from '#supabase/server'
import { getShareById, deleteShare } from '../../utils/shares'
import { useSupabaseAdmin } from '../../utils/supabase-admin'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing ID' })

    const share = await getShareById(id)
    if (!share) throw createError({ statusCode: 404, statusMessage: 'Share not found' })

    // Check ownership or Admin role
    let isAdmin = false

    // Verify Admin Role via DB
    const supabase = useSupabaseAdmin()
    const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    if (roleData && roleData.role === 'admin') {
        isAdmin = true
    }

    // Allow if owner or admin
    if (share.userId !== user.id && !isAdmin) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    const success = await deleteShare(id)
    if (!success) {
        throw createError({ statusCode: 500, statusMessage: 'Failed to delete share' })
    }

    return { success: true }
})
