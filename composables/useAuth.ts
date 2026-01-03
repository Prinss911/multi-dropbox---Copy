export const useAuth = () => {
    const user = useSupabaseUser()
    const client = useSupabaseClient()
    const role = useState<string | null>('user-role', () => null)

    // Fetch role on init or user change
    watch(user, async (u) => {
        if (u) {
            await fetchRole()
        } else {
            role.value = null
        }
    }, { immediate: true })

    const fetchRole = async () => {
        if (!user.value) return

        // Try to get from JWT first (if hook worked)
        const jwtRole = user.value.app_metadata?.claims?.user_role
        if (jwtRole) {
            role.value = jwtRole
            return
        }

        // Fallback/Verify with DB (using RLS policy)
        const { data } = await client
            .from('user_roles')
            .select('role')
            .eq('user_id', user.value.id)
            .single()

        if (data) {
            role.value = data.role
        }
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
        navigateTo('/login')
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
