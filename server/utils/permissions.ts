import type { H3Event } from 'h3'
import { serverSupabaseUser, serverSupabaseClient } from './supabase'
import type { Database } from '~/types/supabase'

export const getUserRole = async (event: H3Event): Promise<'admin' | 'user' | null> => {
    // 1. Check if we already have the user in context (from middleware)
    if (event.context.user?.role) {
        return event.context.user.role
    }

    // 2. Fetch User from Supabase Auth
    const user = await serverSupabaseUser(event)
    if (!user) return null

    // 3. Fetch Role from Database
    // We use service role client here if we want to bypass RLS, OR user client.
    // However, simplest is to just read from profiles.
    // If we use serverSupabaseClient(event), it uses the user's session. RLS allows reading own profile.
    const client = await serverSupabaseClient<Database>(event)

    // Check metadata first (future optimization)
    // if (user.app_metadata?.role) return user.app_metadata.role

    const { data } = await client
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    return data?.role || 'user'
}

export const requireAdmin = async (event: H3Event) => {
    const role = await getUserRole(event)
    if (role !== 'admin') {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden: Admin access required'
        })
    }
}

export const requireUser = async (event: H3Event) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }
    return user
}
