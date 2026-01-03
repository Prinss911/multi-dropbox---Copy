export default defineNuxtRouteMiddleware(async (to, from) => {
    // Skip auth check during SSR - will be handled on client
    if (import.meta.server) {
        return
    }

    // Wait for auth to initialize (check localStorage)
    await waitForAuthInit()

    const { user, isAdmin, fetchRole } = useAuth()

    // Public routes (Login, Invite Confirm, Anonymous Upload)
    const publicRoutes = ['/login', '/auth/confirm', '/upload', '/access-denied']
    const isPublic = publicRoutes.some(path => to.path.startsWith(path))

    if (!user.value && !isPublic) {
        return navigateTo('/login')
    }

    // If user is logged in and trying to access login page, redirect to home/files
    if (user.value && to.path === '/login') {
        return navigateTo('/files')
    }

    // Admin routes
    const adminRoutes = ['/users', '/admin']
    if (adminRoutes.some(path => to.path.startsWith(path))) {
        if (!user.value) return navigateTo('/login')

        // Ensure role is loaded
        await fetchRole()

        if (!isAdmin.value) {
            return navigateTo('/access-denied')
        }
    }
})
