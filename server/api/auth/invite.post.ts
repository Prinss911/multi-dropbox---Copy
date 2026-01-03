import { getAuthUser } from '../../utils/auth'
// @ts-ignore
import { useSupabaseAdmin } from '../../utils/supabase-admin'

export default defineEventHandler(async (event) => {
    const user = await getAuthUser(event)
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const supabase = useSupabaseAdmin()

    // Verify Admin Role
    const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    if (!roleData || roleData.role !== 'admin') {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    const body = await readBody(event)
    const { email, role = 'user' } = body

    if (!email) {
        throw createError({ statusCode: 400, statusMessage: 'Email is required' })
    }

    // Invite User via Supabase Admin
    const origin = event.node.req.headers.origin || 'http://localhost:3000'
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${origin}/auth/confirm`
    })

    if (inviteError) {
        throw createError({ statusCode: 500, statusMessage: inviteError.message })
    }

    // Assign Role & Create Profile
    if (inviteData.user) {
        const { error: roleError } = await supabase.from('user_roles').upsert({
            user_id: inviteData.user.id,
            role: role
        }, { onConflict: 'user_id' })

        if (roleError) {
            console.error('Failed to assign role:', roleError)
        }

        const { error: profileError } = await supabase.from('profiles').upsert({
            id: inviteData.user.id,
            email: email
        }, { onConflict: 'id' })

        if (profileError) {
            console.error('Failed to create profile:', profileError)
        }
    }

    return { success: true, user: inviteData.user }
})
