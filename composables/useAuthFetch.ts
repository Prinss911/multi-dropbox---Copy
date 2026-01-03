/**
 * Composable untuk fetch dengan authentication header.
 * Otomatis menambahkan Authorization header dari Supabase session.
 */
export const useAuthFetch = () => {
    const client = useSupabaseClient()

    const authFetch = async <T = any>(
        url: string,
        options: {
            method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
            body?: any
            headers?: Record<string, string>
        } = {}
    ): Promise<T> => {
        // Get current session
        const { data: { session } } = await client.auth.getSession()

        if (!session?.access_token) {
            throw new Error('Not authenticated')
        }

        // Merge headers with auth
        const headers: Record<string, string> = {
            ...options.headers,
            'Authorization': `Bearer ${session.access_token}`
        }

        return await $fetch(url, {
            method: options.method || 'GET',
            body: options.body,
            headers
        }) as T
    }

    return { authFetch }
}
