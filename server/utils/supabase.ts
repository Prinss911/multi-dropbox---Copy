import { createClient } from '@supabase/supabase-js'

let supabaseInstance: ReturnType<typeof createClient> | null = null

export const useSupabase = () => {
    if (supabaseInstance) return supabaseInstance

    const config = useRuntimeConfig()
    const supabaseUrl = config.supabaseUrl
    const supabaseKey = config.supabaseServiceKey

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase credentials in runtime config')
    }

    supabaseInstance = createClient(supabaseUrl, supabaseKey)
    return supabaseInstance
}
