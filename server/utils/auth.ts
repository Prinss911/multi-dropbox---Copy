import { createClient } from '@supabase/supabase-js'
import type { H3Event } from 'h3'

/**
 * Get authenticated user from Authorization header or cookies.
 * Supports both Bearer token from header and Supabase session cookies.
 */
export async function getAuthUser(event: H3Event) {
    const config = useRuntimeConfig()

    // First try Authorization header (for explicit API calls)
    const authHeader = getHeader(event, 'authorization')
    let accessToken = authHeader?.replace('Bearer ', '')

    // Fallback to cookie-based auth
    if (!accessToken) {
        const cookies = parseCookies(event)
        accessToken = cookies['sb-access-token'] || cookies['sb-token']
    }

    if (!accessToken) {
        return null
    }

    // Create Supabase client with the user's token
    const supabase = createClient(
        config.supabaseUrl,
        config.supabaseServiceKey, // Use service key to verify
        {
            global: {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        }
    )

    // Verify token and get user
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
        return null
    }

    return user
}
