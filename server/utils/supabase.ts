import { createClient } from '@supabase/supabase-js'
import type { H3Event } from 'h3'

// Admin Client (Service Role) - Keep singleton
let adminInstance: ReturnType<typeof createClient> | null = null

export const useAdminSupabase = () => {
    if (adminInstance) return adminInstance
    const config = useRuntimeConfig()
    // Use Server-side keys
    const { supabaseUrl, supabaseServiceKey } = config

    if (!supabaseUrl || !supabaseServiceKey) {
        // Only throw if trying to use it.
        // This allows build to pass if env vars are missing at build time.
        if (process.env.NODE_ENV === 'development') {
            console.warn('Supabase admin credentials missing (server-side)')
        }
    }

    // Fallback strings to prevent crash during init, but calls will fail
    adminInstance = createClient(supabaseUrl || '', supabaseServiceKey || '')
    return adminInstance
}

// Deprecated alias for backward compatibility
export const useSupabase = useAdminSupabase

// Helper to get token from header or cookies
const getAuthToken = (event: H3Event) => {
    // First try Authorization header
    const authHeader = getHeader(event, 'Authorization')
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7)
    }

    // Fallback to cookies
    const cookies = parseCookies(event)

    // Try various cookie names Supabase might use
    let accessToken = cookies['sb-access-token']
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

    return accessToken || null
}

export const serverSupabaseClient = async <T = any>(event: H3Event) => {
    const token = getAuthToken(event)
    const config = useRuntimeConfig()

    // Get values with fallback
    const supabaseUrl = config.supabaseUrl || process.env.SUPABASE_URL
    const supabaseAnonKey = config.public?.supabaseAnonKey || process.env.SUPABASE_ANON_KEY

    // Validate required credentials
    if (!supabaseUrl) {
        console.error('[supabase.ts] SUPABASE_URL is missing!')
        throw new Error('Missing SUPABASE_URL configuration')
    }

    if (!supabaseAnonKey) {
        console.error('[supabase.ts] SUPABASE_ANON_KEY is missing!')
        throw new Error('Missing SUPABASE_ANON_KEY configuration')
    }

    const options: any = {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    }

    if (token) {
        options.global = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    }

    return createClient<T>(supabaseUrl, supabaseAnonKey, options)
}

export const serverSupabaseUser = async (event: H3Event) => {
    const client = await serverSupabaseClient(event)
    const { data: { user }, error } = await client.auth.getUser()
    if (error || !user) return null
    return user
}
