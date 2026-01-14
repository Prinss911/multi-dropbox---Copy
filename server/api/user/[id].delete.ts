import { getAuthUser } from '../../utils/auth'
// @ts-ignore
import { useSupabaseAdmin } from '../../utils/supabase-admin'

export default defineEventHandler(async (event) => {
    // 1. Authenticate the request
    const currentUser = await getAuthUser(event)
    if (!currentUser) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const supabase = useSupabaseAdmin()

    // 2. Verify the requester is an admin
    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single()

    if (!adminProfile || adminProfile.role !== 'admin') {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden - Admin access required' })
    }

    // 3. Get the user ID to delete from route params
    const userIdToDelete = getRouterParam(event, 'id')

    if (!userIdToDelete) {
        throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
    }

    // 4. Prevent self-deletion
    if (userIdToDelete === currentUser.id) {
        throw createError({ statusCode: 400, statusMessage: 'Cannot delete your own account' })
    }

    // 5. Delete from profiles table first (due to foreign key)
    const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userIdToDelete)

    if (profileError) {
        console.error('[DeleteUser] Profile deletion error:', profileError)
        // Don't throw - profile might not exist, continue with auth deletion
    }

    // 6. Delete user files records (if any)
    const { error: filesError } = await supabase
        .from('files')
        .delete()
        .eq('user_id', userIdToDelete)

    if (filesError) {
        console.error('[DeleteUser] Files deletion error:', filesError)
        // Don't throw - continue with auth deletion
    }

    // 8. Delete the auth user (using Admin API)
    const { error: authError } = await supabase.auth.admin.deleteUser(userIdToDelete)

    if (authError) {
        console.error('[DeleteUser] Auth user deletion error:', authError)
        throw createError({
            statusCode: 500,
            statusMessage: `Failed to delete user: ${authError.message}`
        })
    }

    console.log(`[DeleteUser] Successfully deleted user: ${userIdToDelete}`)

    return {
        success: true,
        message: 'User deleted successfully'
    }
})
