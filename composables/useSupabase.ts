import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Use useState for SSR-safe shared state
let clientInstance: SupabaseClient | null = null

/**
 * Client-side Supabase composable.
 * Creates a singleton Supabase client instance that persists across the app.
 */
export const useSupabaseClient = () => {
    // Only create client on client-side to avoid SSR issues
    if (import.meta.server) {
        // Return a minimal object during SSR - actual calls should use server utils
        const config = useRuntimeConfig()
        return createClient(
            config.public.supabaseUrl as string || '',
            config.public.supabaseAnonKey as string || '',
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false
                }
            }
        )
    }

    if (clientInstance) return clientInstance

    const config = useRuntimeConfig()

    const supabaseUrl = config.public.supabaseUrl as string
    const supabaseAnonKey = config.public.supabaseAnonKey as string

    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('[useSupabase] Supabase URL or Anon Key not configured')
    }

    clientInstance = createClient(supabaseUrl || '', supabaseAnonKey || '', {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: typeof window !== 'undefined' ? window.localStorage : undefined,
            storageKey: 'sb-auth-token',
            flowType: 'pkce'
        }
    })

    return clientInstance
}

/**
 * Global promise to track auth initialization
 */
let initPromise: Promise<void> | null = null

/**
 * Wait for Supabase auth to initialize (check local storage)
 */
export const waitForAuthInit = async () => {
    if (import.meta.server) return
    if (initPromise) await initPromise
}

/**
 * Get current authenticated user from client-side session.
 * Uses useState to share user state across components.
 */
export const useSupabaseUser = () => {
    // Use useState for SSR-safe shared state
    const user = useState<any>('supabase-user', () => null)
    const isInitialized = useState<boolean>('supabase-auth-initialized', () => false)

    // Only initialize on client-side
    if (import.meta.client && !isInitialized.value && !initPromise) {
        const client = useSupabaseClient()

        // Create initialization promise
        initPromise = new Promise<void>((resolve) => {
            // Get initial session
            client.auth.getSession().then(({ data: { session } }) => {
                console.log('[useSupabaseUser] Initial session:', session ? 'Found: ' + session.user.email : 'None')
                if (session) {
                    user.value = session.user
                }
                isInitialized.value = true
                resolve()
            })
        })

        // Listen for auth changes
        client.auth.onAuthStateChange((event, session) => {
            console.log('[useSupabaseUser] Auth state changed:', event, session?.user?.email)
            user.value = session?.user || null
        })
    }

    return user
}
