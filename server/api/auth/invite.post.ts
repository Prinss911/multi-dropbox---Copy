import { getAuthUser } from '../../utils/auth'
// @ts-ignore
import { useSupabaseAdmin } from '../../utils/supabase-admin'

export default defineEventHandler(async (event) => {
    const user = await getAuthUser(event)
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const supabase = useSupabaseAdmin()

    // Verify Admin Role from profiles table
    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!adminProfile || adminProfile.role !== 'admin') {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    const body = await readBody(event)
    const { email, role = 'user' } = body

    if (!email) {
        throw createError({ statusCode: 400, statusMessage: 'Email is required' })
    }

    // Standard Supabase Email Flow for robustness:
    // We prioritize EMAIL DELIVERY as requested.

    const origin = event.node.req.headers.origin || 'http://localhost:3000'
    const redirectUrl = `${origin}/auth/confirm`

    let userData = null
    let finalLinkType = 'invite'

    // 1. Attempt Invite (This sends email for NEW users)
    let inviteData = { user: null }
    let inviteError = null

    try {
        const res = await supabase.auth.admin.inviteUserByEmail(email, {
            redirectTo: redirectUrl
        })
        inviteData = res.data
        inviteError = res.error
    } catch (e: any) {
        inviteError = e
    }

    // Explicitly ignore "already registered" error.
    if (inviteError && inviteError.message?.includes('already been registered')) {
        console.log(`[Invite] User ${email} already registered (caught error). Proceeding to check confirmation/reset.`)
        inviteError = null
    }

    if (inviteError) {
        throw createError({ statusCode: 500, statusMessage: inviteError.message })
    }

    userData = inviteData?.user

    // If userData is null (e.g. because of 'already registered' error suppression where data is often null),
    // we try to fetch the user by email to proceed with Reset Password flow.
    if (!userData) {
        // We can't use admin.getUserByEmail directly depending on version, 
        // but let's assume we proceed to RESET flow which doesn't strictly need the ID, just email.
        // However, we need ID for Profile Upsert.
        // Let's try ListUsers to find them.
        const { data: usersData } = await supabase.auth.admin.listUsers()
        const foundUser = usersData.users.find((u: any) => u.email === email)
        if (foundUser) {
            userData = foundUser
        }
    }

    // 2. Check if user was already confirmed (Existing User)
    const isConfirmed = userData?.email_confirmed_at || userData?.phone_confirmed_at

    if (isConfirmed || !userData) {
        // If confirmed OR if we couldn't get user data (likely existing but invite failed to return it),
        // we assume existing and send Reset Password.

        finalLinkType = 'recovery'
        console.log(`[Invite] User ${email} exists/confirmed. Sending Password Reset email.`)

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl
        })

        if (resetError) {
            console.error('[Invite] Reset password error:', resetError)
            throw createError({ statusCode: 500, statusMessage: resetError.message })
        }
    } else {
        console.log(`[Invite] User ${email} is new. Invite email sent by Supabase.`)
    }

    // Upsert Profile (Ensure role is correct)
    if (userData) {
        const { error: profileError } = await supabase.from('profiles').upsert({
            id: userData.id,
            email: email,
            role: role
        }, { onConflict: 'id' })

        if (profileError) {
            console.error('Failed to create profile with role:', profileError)
        }
    }

    // We do NOT return a manual link because 'generateLink' invalidates the tokens sent in the emails above.
    return {
        success: true,
        user: userData,
        link: null,
        type: finalLinkType
    }
})
