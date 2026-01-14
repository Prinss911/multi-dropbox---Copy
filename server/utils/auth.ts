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

        // Debug: log available cookies (without values for security)
        console.log('[getAuthUser] Available cookies:', Object.keys(cookies))

        // Try various cookie names Supabase might use
        accessToken = cookies['sb-access-token']
            || cookies['sb-token']
            || cookies['supabase-auth-token']

        // Also check for cookies with project reference pattern
        // e.g., sb-<project-ref>-auth-token
        if (!accessToken) {
            const authCookie = Object.entries(cookies).find(([key]) =>
                key.includes('-auth-token') || key.includes('access-token')
            )
            if (authCookie) {
                // Parse JSON if it's the auth-token format [access, refresh]
                try {
                    const parsed = JSON.parse(authCookie[1])
                    accessToken = Array.isArray(parsed) ? parsed[0] : parsed.access_token || parsed
                } catch {
                    accessToken = authCookie[1]
                }
            }
        }
    }

    if (!accessToken) {
        console.log('[getAuthUser] No access token found')
        return null
    }

    // Validate config
    const supabaseUrl = config.supabaseUrl as string
    const supabaseServiceKey = config.supabaseServiceKey as string

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('[getAuthUser] Missing Supabase credentials', {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseServiceKey
        })
        return null
    }

    // Create Supabase client with the user's token
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    })

    // Verify token and get user
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
        return null
    }

    return user
}
