<template>
  <div class="h-full flex flex-col bg-background/50">
    <ClientOnly>
    <!-- Redirect non-admin users to their files page -->
    <div v-if="!isAdmin" class="h-full flex items-center justify-center">
      <div class="flex flex-col items-center gap-3">
         <Icon name="lucide:loader-2" class="animate-spin h-8 w-8 text-[#0061FE]" />
         <p class="text-sm text-muted-foreground">Redirecting...</p>
      </div>
    </div>

    <!-- Admin Dashboard -->
    <div v-else class="flex-1 overflow-auto">
      <!-- Top Stats Bar (Sticky) -->
      <div class="sticky top-0 z-20 bg-background/95 backdrop-blur border-b px-6 py-4">
      <div class="w-full">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <!-- Left: Title -->
           <div>
             <h1 class="text-xl font-semibold text-[#1E1919] dark:text-foreground">Overview</h1>
             <p class="text-sm text-muted-foreground">Admin Dashboard</p>
           </div>
           
           <!-- Right: Stats & Actions -->
           <div class="flex items-center gap-6">
              <!-- Users Stat -->
              <div class="flex items-center gap-3">
                 <div class="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                    <Icon name="lucide:users" class="h-5 w-5" />
                 </div>
                 <div class="text-right sm:text-left">
                    <p class="text-sm font-semibold text-[#1E1919] dark:text-foreground">{{ data?.accountCount || 0 }} Accounts</p>
                    <p class="text-xs text-muted-foreground">Connected</p>
                 </div>
              </div>

              <div class="w-px h-8 bg-border hidden sm:block"></div>

              <!-- Active Shares -->
              <div class="flex items-center gap-3">
                 <div class="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                    <Icon name="lucide:link" class="h-5 w-5" />
                 </div>
                 <div>
                    <p class="text-sm font-semibold text-[#1E1919] dark:text-foreground">{{ data?.shares?.active || 0 }} Active Links</p>
                    <p class="text-xs text-muted-foreground">{{ data?.shares?.totalDownloads || 0 }} Total Downloads</p>
                 </div>
              </div>
           </div>
           
           <UiButton variant="ghost" size="icon" @click="refresh" :disabled="pending" class="ml-4">
             <Icon :name="pending ? 'lucide:loader-2' : 'lucide:refresh-cw'" :class="{ 'animate-spin': pending }" class="h-4 w-4" />
           </UiButton>
        </div>
      </div>
    </div>

    <div class="px-4 md:px-6 py-8 w-full space-y-8">
        <!-- Loading -->
        <div v-if="pending" class="py-12 flex justify-center text-muted-foreground">
           <div class="flex flex-col items-center gap-2">
              <Icon name="lucide:loader-2" class="animate-spin h-8 w-8 text-[#0061FE]" />
              <p class="text-sm">Loading dashboard data...</p>
           </div>
        </div>

        <div v-else-if="error" class="p-6 rounded-lg bg-red-50 border border-red-100 text-center text-red-600">
           <Icon name="lucide:alert-triangle" class="h-8 w-8 mb-2 mx-auto" />
           <p class="font-medium">Failed to load dashboard data</p>
           <p class="text-sm opacity-80 mt-1">{{ error.message }}</p>
        </div>

        <template v-else-if="data">
           <!-- Charts / Detail Row -->
           <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Storage Distribution -->
              <div class="bg-card rounded-xl border p-6 shadow-sm">
                 <h3 class="font-semibold text-base mb-6 flex items-center gap-2">
                    <Icon name="lucide:pie-chart" class="h-4 w-4 text-muted-foreground" />
                    Storage Breakdown
                 </h3>
                 <div class="space-y-4">
                    <div 
                       v-for="(account, idx) in data.accounts" 
                       :key="account.id"
                       class="group"
                    >
                       <div class="flex items-center justify-between mb-2 text-sm">
                          <div class="flex items-center gap-2">
                             <div 
                                class="w-2.5 h-2.5 rounded-full shrink-0"
                                :style="{ backgroundColor: accountColors[idx % accountColors.length] }"
                             ></div>
                             <span class="font-medium text-[#1E1919] dark:text-foreground">{{ account.name }}</span>
                          </div>
                          <div class="text-muted-foreground font-mono text-xs">
                             {{ formatBytes(account.used) }} / {{ formatBytes(account.allocated) }}
                          </div>
                       </div>
                       <div class="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                          <div 
                             class="h-full rounded-full transition-all duration-500"
                             :style="{ 
                                backgroundColor: accountColors[idx % accountColors.length],
                                width: `${account.allocated > 0 ? (account.used / account.allocated) * 100 : 0}%`
                             }"
                          ></div>
                       </div>
                    </div>
                 </div>
              </div>

              <!-- Top Downloads -->
              <div class="bg-card rounded-xl border p-6 shadow-sm flex flex-col">
                 <h3 class="font-semibold text-base mb-6 flex items-center gap-2">
                    <Icon name="lucide:trending-up" class="h-4 w-4 text-muted-foreground" />
                    Popular Files
                 </h3>
                 
                 <div v-if="data.topDownloaded.length === 0" class="flex-1 flex flex-col items-center justify-center text-muted-foreground py-10">
                    <Icon name="lucide:bar-chart-2" class="h-10 w-10 opacity-20 mb-3" />
                    <p class="text-sm">No download data available yet</p>
                 </div>
                 
                 <div v-else class="space-y-1">
                    <div 
                       v-for="(file, idx) in data.topDownloaded" 
                       :key="idx"
                       class="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                       <span class="text-sm font-bold text-muted-foreground/50 w-4">{{ idx + 1 }}</span>
                       <div class="h-8 w-8 rounded bg-blue-50 flex items-center justify-center text-[#0061FE] shrink-0">
                          <Icon name="lucide:file" class="h-4 w-4" />
                       </div>
                       <div class="flex-1 min-w-0">
                          <p class="text-sm font-medium truncate text-[#1E1919] dark:text-foreground" :title="file.fileName">{{ file.fileName }}</p>
                          <p class="text-xs text-muted-foreground">{{ file.accountName }}</p>
                       </div>
                       <div class="text-sm font-medium bg-muted/50 px-2 py-1 rounded text-muted-foreground">
                          {{ file.downloads }} ↓
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <!-- Recent Shares Table -->
           <div class="bg-card rounded-xl border shadow-sm overflow-hidden">
              <div class="px-6 py-5 border-b flex items-center justify-between">
                 <h3 class="font-semibold text-base">Recent Share Links</h3>
                 <NuxtLink to="/admin/shares" class="text-xs font-medium text-[#0061FE] hover:underline flex items-center gap-1">
                    Manage all shares
                    <Icon name="lucide:arrow-right" class="h-3 w-3" />
                 </NuxtLink>
              </div>

              <div class="overflow-x-auto">
                 <table class="w-full text-left">
                    <thead class="bg-muted/20">
                       <tr>
                          <th class="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">File Name</th>
                          <th class="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Account</th>
                          <th class="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Created</th>
                          <th class="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                          <th class="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Downloads</th>
                       </tr>
                    </thead>
                    <tbody class="divide-y divide-border/50">
                       <tr v-if="data.recentShares.length === 0">
                          <td colspan="5" class="px-6 py-12 text-center text-muted-foreground">
                             No share links created yet.
                          </td>
                       </tr>
                       <tr 
                          v-for="share in data.recentShares" 
                          :key="share.id"
                          class="hover:bg-muted/20 transition-colors group"
                       >
                          <td class="px-6 py-3">
                             <div class="flex items-center gap-3">
                                <Icon name="lucide:file-text" class="h-4 w-4 text-muted-foreground" />
                                <span class="text-sm font-medium text-[#1E1919] dark:text-foreground truncate max-w-[200px]">{{ share.fileName }}</span>
                             </div>
                          </td>
                          <td class="px-6 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                              <span 
                                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                                  :style="{ 
                                    backgroundColor: getAccountColor(share.accountId, share.accountName) + '15', 
                                    color: getAccountColor(share.accountId, share.accountName)
                                  }"
                              >
                                  <span class="w-1.5 h-1.5 rounded-full shrink-0" :style="{ backgroundColor: getAccountColor(share.accountId, share.accountName) }"></span>
                                  <span class="truncate max-w-[120px]">{{ share.accountName }}</span>
                              </span>
                          </td>
                          <td class="px-6 py-3 text-sm text-muted-foreground hidden md:table-cell">
                             {{ formatDate(share.createdAt) }}
                          </td>
                          <td class="px-6 py-3">
                             <span 
                                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
                                :class="getStatusClass(share.expiresAt)"
                             >
                                <span class="h-1.5 w-1.5 rounded-full bg-current opacity-60"></span>
                                {{ formatExpiry(share.expiresAt) }}
                             </span>
                          </td>
                          <td class="px-6 py-3 text-right text-sm font-mono text-muted-foreground">
                             {{ share.downloads }}
                          </td>
                       </tr>
                    </tbody>
                 </table>
              </div>
           </div>

           <!-- Quick Links Grid -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <NuxtLink to="/drive/upload" class="bg-card hover:bg-muted/40 p-4 rounded-xl border transition-all text-center group">
                 <div class="h-10 w-10 rounded-full bg-blue-50 text-[#0061FE] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Icon name="lucide:upload" class="h-5 w-5" />
                 </div>
                 <p class="font-medium text-sm">Upload File</p>
              </NuxtLink>
              
              <NuxtLink to="/admin/files" class="bg-card hover:bg-muted/40 p-4 rounded-xl border transition-all text-center group">
                 <div class="h-10 w-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Icon name="lucide:folder-cog" class="h-5 w-5" />
                 </div>
                 <p class="font-medium text-sm">File Manager</p>
              </NuxtLink>

              <NuxtLink to="/admin/shares" class="bg-card hover:bg-muted/40 p-4 rounded-xl border transition-all text-center group">
                 <div class="h-10 w-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Icon name="lucide:share-2" class="h-5 w-5" />
                 </div>
                 <p class="font-medium text-sm">Shared Links</p>
              </NuxtLink>

              <NuxtLink to="/admin/accounts" class="bg-card hover:bg-muted/40 p-4 rounded-xl border transition-all text-center group">
                 <div class="h-10 w-10 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Icon name="lucide:settings-2" class="h-5 w-5" />
                 </div>
                 <p class="font-medium text-sm">Settings</p>
              </NuxtLink>
           </div>

        </template>
      </div>
    </div>
    
    <template #fallback>
      <div class="h-full flex items-center justify-center">
        <div class="flex flex-col items-center gap-3">
           <Icon name="lucide:loader-2" class="animate-spin h-8 w-8 text-[#0061FE]" />
           <p class="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const { isAdmin, role } = useAuth()

// Track if we're still checking the role
const isCheckingRole = computed(() => role.value === null)

interface DashboardData {
  accounts: {
    id: string
    name: string
    email?: string
    used: number
    allocated: number
    error?: boolean
  }[]
  storage: {
    used: number
    allocated: number
    percentage: number
  }
  shares: {
    total: number
    active: number
    expired: number
    totalDownloads: number
  }
  topDownloaded: {
    fileName: string
    accountName: string
    accountId?: string
    downloads: number
  }[]
  recentShares: {
    id: string
    fileName: string
    accountName: string
    accountId?: string
    createdAt: string
    expiresAt: string | null
    downloads: number
  }[]
  accountCount: number
}

// Get Supabase client for access token
const supabase = useSupabaseClient()

// Dashboard data state (manual fetch to avoid SSR issues with auth)
const data = ref<DashboardData | null>(null)
const pending = ref(false)
const error = ref<Error | null>(null)

// Flag to prevent updates after unmount (fixes "Cannot set properties of null" error)
const isMounted = ref(true)

onBeforeUnmount(() => {
  isMounted.value = false
})

// Fetch dashboard only when admin
const fetchDashboard = async () => {
  if (!isAdmin.value || !isMounted.value) return
  
  pending.value = true
  error.value = null
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      throw new Error('Not authenticated')
    }
    
    const result = await $fetch<DashboardData>('/api/admin/dashboard', {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })
    
    // Only update state if component is still mounted
    if (isMounted.value) {
      data.value = result
    }
  } catch (err: any) {
    console.error('Dashboard fetch error:', err)
    if (isMounted.value) {
      error.value = err
    }
  } finally {
    if (isMounted.value) {
      pending.value = false
    }
  }
}

const refresh = () => fetchDashboard()

// Only fetch when confirmed admin
let stopWatcher: (() => void) | null = null

onMounted(() => {
  stopWatcher = watch(role, async (newRole) => {
    if (!isMounted.value) return
    
    if (newRole === 'admin') {
      await fetchDashboard()
    } else if (newRole !== null) {
      // Redirect non-admin users
      await navigateTo('/drive/files', { replace: true })
    }
  }, { immediate: true })
})

onBeforeUnmount(() => {
  if (stopWatcher) {
    stopWatcher()
  }
})

const accountColors = ['#0061FE', '#0070E0', '#007EE5', '#248CF2', '#4D9BF7', '#76ABFC']

const getAccountColor = (accountId?: string, accountName?: string): string => {
  if (!accountId && !accountName) return accountColors[0]
  
  // Try finding by ID first
  let index = -1
  if (data.value?.accounts) {
      if (accountId) {
          index = data.value.accounts.findIndex(a => a.id === accountId)
      }
      // Fallback to name match
      if (index === -1 && accountName) {
          index = data.value.accounts.findIndex(a => a.name === accountName)
      }
  }
  
  if (index === -1) return accountColors[0]
  return accountColors[index % accountColors.length]
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short'
  })
}

const formatExpiry = (expiresAt: string | null): string => {
  if (!expiresAt) return 'Never'
  
  const expiry = new Date(expiresAt)
  const now = new Date()
  
  if (expiry <= now) return 'Expired'
  
  const diff = expiry.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days > 0) return `In ${days} days`
  return 'Today'
}

const getStatusClass = (expiresAt: string | null): string => {
  if (!expiresAt) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
  
  const expiry = new Date(expiresAt)
  const now = new Date()
  
  if (expiry <= now) return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
  
  const diff = expiry.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days < 3) return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
  return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
}
</script>
