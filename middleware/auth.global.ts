export default defineNuxtRouteMiddleware(async (to, from) => {
    const { user, isAdmin, fetchRole } = useAuth()

    // Public routes (Login, Invite Confirm, Anonymous Upload)
    const publicRoutes = ['/login', '/auth/confirm', '/upload', '/access-denied']
    const isPublic = publicRoutes.some(path => to.path.startsWith(path))

    if (!user.value && !isPublic) {
        return navigateTo('/login')
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
