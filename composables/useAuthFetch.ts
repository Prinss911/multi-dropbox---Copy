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
        let { data: { session } } = await client.auth.getSession()

        // If no session, try to refresh
        if (!session?.access_token) {
            console.log('[authFetch] No session found, attempting refresh...')
            const { data: refreshData, error: refreshError } = await client.auth.refreshSession()
            if (refreshError) {
                console.error('[authFetch] Session refresh failed:', refreshError.message)
                throw new Error('Not authenticated - please login again')
            }
            session = refreshData.session
        }

        if (!session?.access_token) {
            console.error('[authFetch] No access token available after refresh attempt')
            throw new Error('Not authenticated - please login again')
        }

        console.log('[authFetch] Making request to:', url, 'Method:', options.method || 'GET')

        // Merge headers with auth
        const headers: Record<string, string> = {
            ...options.headers,
            'Authorization': `Bearer ${session.access_token}`
        }

        try {
            const result = await $fetch(url, {
                method: options.method || 'GET',
                body: options.body,
                headers
            }) as T

            console.log('[authFetch] Request successful')
            return result
        } catch (err: any) {
            console.error('[authFetch] Request failed:', err.message || err)
            throw err
        }
    }

    return { authFetch }
}
