export default defineNuxtRouteMiddleware(async (to, from) => {
    // Skip auth check during SSR - will be handled on client
    if (import.meta.server) {
        return
    }

    // Wait for auth to initialize (check localStorage)
    await waitForAuthInit()

    const { user, isAdmin, fetchRole, role } = useAuth()

    console.log('[Middleware] Checking route:', to.path, 'User:', user.value?.email)

    // Public routes (Login, Invite Confirm, Anonymous Upload)
    const publicRoutes = ['/login', '/auth/confirm', '/upload', '/access-denied']
    const isPublic = publicRoutes.some(path => to.path.startsWith(path))

    if (!user.value && !isPublic) {
        console.log('[Middleware] No user, redirecting to login')
        return navigateTo('/login')
    }

    // If user is logged in and trying to access login page, redirect to home/files
    if (user.value && to.path === '/login') {
        console.log('[Middleware] Already logged in, redirecting to files')
        return navigateTo('/files')
    }

    // Admin routes
    const adminRoutes = ['/users', '/admin', '/files']
    if (adminRoutes.some(path => to.path.startsWith(path))) {
        if (!user.value) return navigateTo('/login')

        // Ensure role is loaded - fetchRole returns the role directly now
        console.log('[Middleware] Admin route detected, fetching role...')
        const fetchedRole = await fetchRole()

        console.log('[Middleware] Role check. Fetched:', fetchedRole, 'Computed isAdmin:', isAdmin.value, 'State Role:', role.value)

        if (!isAdmin.value && role.value !== 'admin' && fetchedRole !== 'admin') {
            console.log('[Middleware] Access denied for user:', user.value.email)
            return navigateTo('/access-denied')
        }
    }
})
