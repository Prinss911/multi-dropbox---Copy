import { createClient } from '@supabase/supabase-js'

export const useSupabaseAdmin = () => {
    const config = useRuntimeConfig()

    // Get values with fallbacks
    const supabaseUrl = process.env.SUPABASE_URL || config.supabaseUrl
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || config.supabaseServiceKey

    // Debug logging
    console.log('[SupabaseAdmin] URL exists:', !!supabaseUrl)
    console.log('[SupabaseAdmin] Service Key exists:', !!supabaseServiceKey)

    // Validate required credentials
    if (!supabaseUrl) {
        console.error('[SupabaseAdmin] SUPABASE_URL is missing!')
        throw new Error('Missing SUPABASE_URL')
    }

    if (!supabaseServiceKey) {
        console.error('[SupabaseAdmin] SUPABASE_SERVICE_KEY is missing!')
        throw new Error('Missing SUPABASE_SERVICE_KEY')
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}
