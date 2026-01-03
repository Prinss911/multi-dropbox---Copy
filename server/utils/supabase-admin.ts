import { createClient } from '@supabase/supabase-js'

export const useSupabaseAdmin = () => {
    const config = useRuntimeConfig()

    // Ensure we have the service key
    if (!process.env.SUPABASE_SERVICE_KEY && !config.supabaseServiceKey) {
        throw new Error('Missing SUPABASE_SERVICE_KEY')
    }

    return createClient(
        process.env.SUPABASE_URL || config.public.supabase.url,
        process.env.SUPABASE_SERVICE_KEY || config.supabaseServiceKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
}
