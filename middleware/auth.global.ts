export default defineNuxtRouteMiddleware(async (to, from) => {
    // Skip auth check during SSR - will be handled on client
    if (import.meta.server) {
        return
    }

    // Wait for auth to initialize (check localStorage)
    await waitForAuthInit()

    const { user, isAdmin, fetchRole, role } = useAuth()

    console.log('[Middleware] Route:', to.path, '| User:', user.value?.email || 'none', '| Role:', role.value)

    // Public routes (Login, Invite Confirm, Anonymous Upload, Public Downloads)
    const publicRoutes = ['/login', '/auth/confirm', '/upload', '/drive/upload', '/access-denied', '/download', '/file']
    const isPublic = publicRoutes.some(path => to.path.startsWith(path))

    // No user and not public route - redirect to login
    if (!user.value && !isPublic) {
        console.log('[Middleware] No user, not public route -> /login')
        return navigateTo('/login')
    }

    // If user is logged in and trying to access login page, redirect to drive
    if (user.value && to.path === '/login') {
        console.log('[Middleware] Logged in user on /login -> /drive')
        return navigateTo('/drive')
    }

    // Admin-only routes (all pages under /admin/)
    const adminRoutes = ['/admin']
    const isAdminRoute = adminRoutes.some(path => to.path.startsWith(path))

    if (isAdminRoute) {
        if (!user.value) {
            console.log('[Middleware] Admin route, no user -> /login')
            return navigateTo('/login')
        }

        // Fetch role if not already loaded
        if (!role.value) {
            console.log('[Middleware] Fetching role for admin check...')
            await fetchRole()
        }

        console.log('[Middleware] Admin route check. Role:', role.value, 'isAdmin:', isAdmin.value)

        if (role.value !== 'admin') {
            console.log('[Middleware] Not admin, access denied for:', to.path)
            return navigateTo('/access-denied')
        }
    }

    // All other authenticated routes are accessible by any logged-in user
    console.log('[Middleware] Access granted to:', to.path)
})

