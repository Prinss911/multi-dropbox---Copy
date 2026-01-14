export const useAuth = () => {
    const user = useSupabaseUser()
    const client = useSupabaseClient()
    const role = useState<string | null>('user-role', () => null)

    // Verify role fetching
    const fetchRole = async () => {
        if (!user.value) {
            console.log('[fetchRole] No user, skipping')
            return
        }

        // Try to get from JWT first (if hook worked)
        const jwtRole = user.value.app_metadata?.claims?.user_role
        console.log('[fetchRole] JWT Role check:', jwtRole)

        if (jwtRole) {
            role.value = jwtRole
            return
        }

        // Fallback/Verify with DB (using RLS policy)
        console.log('[fetchRole] Fetching from DB (profiles) for user:', user.value.id)
        const { data, error } = await client
            .from('profiles')
            .select('role')
            .eq('id', user.value.id)
            .single()

        if (error) {
            console.error('[fetchRole] DB Error:', error)
        }

        if (data && data.role) {
            console.log('[fetchRole] DB Role found:', data.role)
            role.value = data.role
            return data.role
        } else {
            console.log('[fetchRole] No role found in DB, defaulting to user')
            role.value = 'user'
            return 'user'
        }
    }

    // Fetch role on init or user change - only on client side
    if (import.meta.client) {
        watch(user, async (u) => {
            if (u) {
                await fetchRole()
            } else {
                role.value = null
            }
        }, { immediate: true })
    }

    const isAdmin = computed(() => role.value === 'admin')

    const login = async (email: string, password: string) => {
        const { error } = await client.auth.signInWithPassword({
            email,
            password
        })
        if (error) throw error
    }

    const logout = async () => {
        const { error } = await client.auth.signOut()
        if (error) throw error
        role.value = null
        // Use navigateTo only on client side
        if (import.meta.client) {
            await navigateTo('/login')
        }
    }

    return {
        user,
        role,
        isAdmin,
        login,
        logout,
        fetchRole
    }
}
