<template>
  <div>
    <!-- Global Auth Loading State -->
    <ClientOnly>
      <div 
        v-if="!isAuthReady && !isPublicRoute" 
        class="fixed inset-0 z-[100] flex items-center justify-center bg-background"
      >
        <div class="flex flex-col items-center gap-4">
          <div class="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <p class="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
      <template #fallback>
        <!-- SSR fallback - show loading -->
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-background">
          <div class="flex flex-col items-center gap-4">
            <div class="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </template>
    </ClientOnly>

    <!-- Main App Content - Only show when auth is ready or on public routes -->
    <NuxtLayout v-if="isAuthReady || isPublicRoute">
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

// Track auth readiness
const isAuthReady = useState<boolean>('auth-ready', () => false)

// Check if current route is public
const publicRoutes = ['/login', '/auth/confirm', '/upload', '/drive/upload', '/access-denied', '/download', '/file', '/embed']
const isPublicRoute = computed(() => {
  return publicRoutes.some(path => route.path.startsWith(path))
})

// Initialize auth on client side
if (import.meta.client) {
  const client = useSupabaseClient()
  
  // Check session on mount
  onMounted(async () => {
    try {
      // Initialize user state
      const { user } = useAuth()
      
      // Wait for session check
      const { data: { session } } = await client.auth.getSession()
      
      console.log('[App] Auth initialized, session:', session ? session.user.email : 'none')
      
      // Mark auth as ready
      isAuthReady.value = true
    } catch (err) {
      console.error('[App] Auth init error:', err)
      isAuthReady.value = true // Still mark ready to prevent infinite loading
    }
  })
}
</script>
