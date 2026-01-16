import { getAuthUser } from '../../utils/auth'
import { getShareById, deleteShare } from '../../utils/shares'
import { useSupabaseAdmin } from '../../utils/supabase-admin'

export default defineEventHandler(async (event) => {
    const user = await getAuthUser(event)
    if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing ID' })

    const share = await getShareById(id)
    if (!share) throw createError({ statusCode: 404, statusMessage: 'Share not found' })

    const supabase = useSupabaseAdmin()

    // Check if user is Admin
    let isAdmin = false
    const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profileData && profileData.role === 'admin') {
        isAdmin = true
    }

    // Check if user is the share owner (if userId exists)
    const isShareOwner = share.userId && share.userId === user.id

    // Check if user owns the file (fallback for legacy shares without userId)
    let isFileOwner = false
    if (!isShareOwner && share.filePath) {
        const { data: fileData } = await supabase
            .from('files')
            .select('user_id')
            .eq('dropbox_path', share.filePath)
            .single()

        if (fileData && fileData.user_id === user.id) {
            isFileOwner = true
        }
    }

    // Allow if owner (share or file) or admin
    if (!isShareOwner && !isFileOwner && !isAdmin) {
        console.log('[Share Delete] Access denied:', {
            userId: user.id,
            shareUserId: share.userId,
            isShareOwner,
            isFileOwner,
            isAdmin
        })
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    const success = await deleteShare(id)
    if (!success) {
        throw createError({ statusCode: 500, statusMessage: 'Failed to delete share' })
    }

    console.log('[Share Delete] Share deleted successfully:', id)
    return { success: true }
})
