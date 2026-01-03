import { createClient } from '@supabase/supabase-js'
import type { H3Event } from 'h3'

/**
 * Get authenticated user from Supabase session cookies.
 * Replaces serverSupabaseUser from @nuxtjs/supabase module.
 */
export async function getAuthUser(event: H3Event) {
    const config = useRuntimeConfig()

    // Get access token from cookie
    const cookies = parseCookies(event)
    const accessToken = cookies['sb-access-token'] || cookies['sb-token']

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
