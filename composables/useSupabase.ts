import { createClient } from '@supabase/supabase-js'

let supabaseClient: ReturnType<typeof createClient> | null = null

/**
 * Client-side Supabase composable.
 * Replaces useSupabaseClient from @nuxtjs/supabase module.
 */
export const useSupabaseClient = () => {
    if (supabaseClient) return supabaseClient

    const config = useRuntimeConfig()

    // Use public URL and anon key for client-side
    const supabaseUrl = config.public.supabaseUrl as string
    const supabaseAnonKey = config.public.supabaseAnonKey as string

    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase URL or Anon Key not configured')
    }

    supabaseClient = createClient(supabaseUrl || '', supabaseAnonKey || '', {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    })

    return supabaseClient
}

/**
 * Get current authenticated user from client-side session.
 */
export const useSupabaseUser = () => {
    const user = ref<any>(null)
    const client = useSupabaseClient()

    // Get initial user
    client.auth.getUser().then(({ data }) => {
        user.value = data.user
    })

    // Listen for auth changes
    client.auth.onAuthStateChange((event, session) => {
        user.value = session?.user || null
    })

    return user
}
