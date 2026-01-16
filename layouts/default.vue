<template>
  <div class="min-h-screen bg-background font-sans antialiased text-foreground flex">
    <!-- Mobile Backdrop -->
    <div 
      v-if="isMobileMenuOpen" 
      class="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
      @click="isMobileMenuOpen = false"
    ></div>

    <!-- Sidebar -->
    <aside 
      class="fixed inset-y-0 left-0 z-50 w-64 border-r bg-card flex flex-col h-screen transition-transform duration-300 md:translate-x-0 md:sticky md:top-0 overflow-hidden shadow-xl md:shadow-none"
      :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="h-14 flex items-center px-6 border-b">
        <a class="flex items-center gap-2 font-semibold text-lg" href="/">
          <div class="bg-blue-600 text-white p-1.5 rounded">
             <Icon name="lucide:hard-drive" class="h-4 w-4" />
          </div>
          <span>MultiBox</span>
        </a>
      </div>
      
      <!-- Navigation (scrollable) -->
      <div class="flex-1 py-4 px-3 space-y-1 overflow-auto min-h-0">
         <div class="px-2 mb-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">Menu</div>
         <ClientOnly>
         <nav class="space-y-1">
            <!-- Admin Dashboard Link -->
            <NuxtLink 
              v-if="isAdmin"
              to="/drive" 
              :class="[
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                route.path === '/drive' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              ]"
            >
               <Icon name="lucide:layout-dashboard" class="h-4 w-4" />
               Dashboard
            </NuxtLink>

            <!-- My Files - For regular users only -->
            <NuxtLink 
              v-if="!isAdmin"
              to="/drive" 
              :class="[
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                route.path.startsWith('/drive') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              ]"
            >
               <Icon name="lucide:folder" class="h-4 w-4" />
               My Files
            </NuxtLink>
            
            <!-- Admin Storage Section -->
            <template v-if="isAdmin">
            <div class="px-2 mt-4 mb-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">Storage</div>
            <NuxtLink 
              to="/admin/files" 
              :class="[
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                route.path === '/admin/files' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              ]"
            >
               <Icon name="lucide:hard-drive" class="h-4 w-4" />
               File Manager
            </NuxtLink>
            <NuxtLink 
              to="/admin/split" 
              :class="[
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                route.path === '/admin/split' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              ]"
            >
               <Icon name="lucide:columns" class="h-4 w-4" />
               Split View
            </NuxtLink>
            <NuxtLink 
              to="/admin/shares" 
              :class="[
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                route.path === '/admin/shares' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              ]"
            >
               <Icon name="lucide:link-2" class="h-4 w-4" />
               Shared Links
            </NuxtLink>
            <NuxtLink 
              to="/admin/trash" 
              :class="[
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                route.path === '/admin/trash' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              ]"
            >
               <Icon name="lucide:trash-2" class="h-4 w-4" />
               Trash
            </NuxtLink>
            </template>
          </nav>
          <template #fallback>
            <!-- Skeleton loader for navigation -->
            <nav class="space-y-1">
              <div class="flex items-center gap-3 px-3 py-2 rounded-md">
                <div class="h-4 w-4 bg-muted rounded animate-pulse"></div>
                <div class="h-4 w-20 bg-muted rounded animate-pulse"></div>
              </div>
              <div class="flex items-center gap-3 px-3 py-2 rounded-md">
                <div class="h-4 w-4 bg-muted rounded animate-pulse"></div>
                <div class="h-4 w-24 bg-muted rounded animate-pulse"></div>
              </div>
            </nav>
          </template>
          </ClientOnly>
          
          <ClientOnly>
          <div v-if="isAdmin">
           <div class="px-2 mt-4 mb-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">Management</div>
           <nav class="space-y-1">
              <NuxtLink 
               to="/admin/users" 
               :class="[
                 'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                 route.path === '/admin/users' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
               ]"
             >
                <Icon name="lucide:users" class="h-4 w-4" />
                Users
             </NuxtLink>
             <NuxtLink 
               to="/admin/accounts" 
               :class="[
                 'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                 route.path === '/admin/accounts' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
               ]"
             >
                <Icon name="lucide:settings" class="h-4 w-4" />
                Accounts
             </NuxtLink>
           </nav>
          </div>
          </ClientOnly>
      </div>
      
      <!-- User Profile & Logout -->
      <div class="p-3 border-t">
        <ClientOnly>
        <div class="flex items-center gap-3 mb-3">
          <div class="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-sm">
            {{ user?.email?.charAt(0).toUpperCase() || 'U' }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ user?.email || 'User' }}</p>
            <p class="text-xs text-muted-foreground">{{ isAdmin ? 'Administrator' : 'User' }}</p>
          </div>
        </div>
        <template #fallback>
          <div class="flex items-center gap-3 mb-3">
            <div class="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
            <div class="flex-1 min-w-0">
              <div class="h-4 w-24 bg-muted rounded animate-pulse mb-1"></div>
              <div class="h-3 w-16 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </template>
        </ClientOnly>
        <UiButton 
          variant="outline" 
          size="sm" 
          class="w-full text-xs h-8"
          @click="handleLogout"
        >
          <Icon name="lucide:log-out" class="h-3.5 w-3.5 mr-2" />
          Logout
        </UiButton>
      </div>
      
      <!-- Storage Info (Admin only) - Compact version -->
      <ClientOnly>
      <div v-if="isAdmin && combinedStorage" class="p-3 border-t">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <Icon name="lucide:database" class="h-4 w-4 text-primary" />
            <span class="text-xs font-semibold uppercase tracking-wider">Storage</span>
          </div>
          <span class="text-xs text-muted-foreground">{{ combinedStoragePercentage.toFixed(0) }}%</span>
        </div>
        <div class="flex items-baseline gap-1.5 mb-2">
          <span class="text-sm font-bold">{{ formatBytes(combinedStorage.totalUsed) }}</span>
          <span class="text-xs text-muted-foreground">of {{ formatBytes(combinedStorage.totalAllocated) }}</span>
        </div>
        <div class="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div 
            class="h-full rounded-full bg-[#0061FE]"
            :style="{ width: combinedStoragePercentage + '%' }"
          ></div>
        </div>
      </div>
      </ClientOnly>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
        <header class="h-14 border-b bg-background/95 backdrop-blur flex items-center justify-between px-6 sticky top-0 z-10">
           <div class="flex items-center gap-4">
              <h1 class="font-semibold text-xl tracking-tight text-[#1E1919] dark:text-foreground">
                <ClientOnly>
                  {{ isAdmin ? 'File Explorer' : 'My Files' }}
                  <template #fallback>Files</template>
                </ClientOnly>
              </h1>
              
              <!-- Connected Accounts Badge (Admin Only) -->
              <ClientOnly>
              <NuxtLink v-if="isAdmin && accounts.length > 0" to="/admin/accounts" class="hidden md:flex items-center h-7 px-3 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/20 text-xs font-medium shadow-sm hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
                 <Icon name="lucide:hard-drive" class="h-3 w-3 mr-1.5" />
                 <span>{{ accounts.length }} Account{{ accounts.length > 1 ? 's' : '' }}</span>
              </NuxtLink>
              </ClientOnly>
           </div>
           <div class="flex items-center gap-2">
               <div class="relative hidden sm:block">
                  <Icon name="lucide:search" class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <UiInput placeholder="Search files..." class="w-64 pl-9 h-9 bg-muted/30 border-none focus-visible:bg-background focus-visible:ring-1" />
               </div>
               <UiButton variant="ghost" size="icon" class="rounded-full">
                  <Icon name="lucide:bell" class="h-5 w-5" />
               </UiButton>
           </div>
        </header>
        <main class="flex-1 overflow-auto bg-muted/10 p-4 md:p-6">
            <slot />
        </main>
    </div>
    
    <!-- Add Account Modal -->
    <Teleport to="body">
      <div v-if="showAddAccountModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closeAddAccountModal">
        <div class="bg-card rounded-lg shadow-lg w-full max-w-md p-6 m-4">
          <h2 class="text-lg font-semibold mb-4">Add Dropbox Account</h2>
          
          <div v-if="addAccountStep === 'credentials'" class="space-y-4">
            <p class="text-sm text-muted-foreground">
              Enter your Dropbox App credentials. Get them from 
              <a href="https://www.dropbox.com/developers/apps" target="_blank" class="text-primary underline">Dropbox App Console</a>.
            </p>
            
            <div class="space-y-2">
              <label class="text-sm font-medium">App Key</label>
              <UiInput 
                v-model="appKey" 
                placeholder="e.g. szgdfklmefwr8nr"
                class="font-mono text-sm"
              />
            </div>
            
            <div class="space-y-2">
              <label class="text-sm font-medium">App Secret</label>
              <UiInput 
                v-model="appSecret" 
                placeholder="e.g. fjcbzjokakc65qs"
                type="password"
                class="font-mono text-sm"
              />
            </div>
            
            <div class="flex gap-2">
              <UiButton variant="outline" class="flex-1" @click="closeAddAccountModal">
                Cancel
              </UiButton>
              <UiButton 
                class="flex-1" 
                :disabled="!appKey || !appSecret"
                @click="addAccountStep = 'auth'"
              >
                Next
                <Icon name="lucide:arrow-right" class="ml-2 h-4 w-4" />
              </UiButton>
            </div>
          </div>
          
          <div v-else-if="addAccountStep === 'auth'" class="space-y-4">
            <p class="text-sm text-muted-foreground">
              Click the button below to authorize. After authorizing, copy the code and paste it here.
            </p>
            <UiButton class="w-full" @click="openAuthUrl">
              <Icon name="logos:dropbox" class="mr-2 h-4 w-4" />
              Authorize with Dropbox
            </UiButton>
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <span class="w-full border-t" />
              </div>
              <div class="relative flex justify-center text-xs uppercase">
                <span class="bg-card px-2 text-muted-foreground">Then paste code below</span>
              </div>
            </div>
            <UiInput 
              v-model="authCode" 
              placeholder="Paste authorization code here..."
              class="font-mono text-sm"
            />
            <UiInput 
              v-model="accountName" 
              placeholder="Account name (optional)"
            />
            <div class="flex gap-2">
              <UiButton variant="outline" class="flex-1" @click="addAccountStep = 'credentials'">
                <Icon name="lucide:arrow-left" class="mr-2 h-4 w-4" />
                Back
              </UiButton>
              <UiButton 
                class="flex-1" 
                :disabled="!authCode || isAddingAccount"
                @click="handleAddAccount"
              >
                <Icon v-if="isAddingAccount" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
                Add Account
              </UiButton>
            </div>
          </div>
          
          <div v-else-if="addAccountStep === 'success'" class="text-center space-y-4">
            <div class="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <Icon name="lucide:check" class="h-6 w-6 text-green-600" />
            </div>
            <p class="font-medium">Account added successfully!</p>
            <UiButton class="w-full" @click="closeAddAccountModal">
              Done
            </UiButton>
          </div>
          
          <div v-else-if="addAccountStep === 'error'" class="text-center space-y-4">
            <div class="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <Icon name="lucide:x" class="h-6 w-6 text-red-600" />
            </div>
            <p class="font-medium text-destructive">{{ addAccountError }}</p>
            <UiButton class="w-full" @click="addAccountStep = 'auth'">
              Try Again
            </UiButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { user, isAdmin, logout } = useAuth()

// Handle logout
const handleLogout = async () => {
  try {
    await logout()
  } catch (err) {
    console.error('Logout failed:', err)
  }
}


const {
  accounts,
  activeAccount,
  activeAccountId,
  isAddingAccount,
  fetchAccounts,
  switchAccount,
  getAuthUrl,
  addAccount,
  removeAccount
} = useAccounts()

const { fetchFiles } = useDropboxFiles()

// Combined Storage info (all accounts)
interface AccountStorageInfo {
  accountId: string
  accountName: string
  used: number
  total: number
  error: string | null
}
interface CombinedStorageInfo {
  accounts: AccountStorageInfo[]
  totalUsed: number
  totalAllocated: number
}
const combinedStorage = ref<CombinedStorageInfo | null>(null)
const isLoadingStorage = ref(false)
const showStorageDetails = ref(false)

const fetchStorageInfo = async () => {
  isLoadingStorage.value = true
  try {
    const response = await $fetch<CombinedStorageInfo>('/api/dropbox/storage-all')
    combinedStorage.value = response
  } catch (err) {
    console.error('Error fetching storage:', err)
    combinedStorage.value = null
  } finally {
    isLoadingStorage.value = false
  }
}

const combinedStoragePercentage = computed(() => {
  if (!combinedStorage.value || combinedStorage.value.totalAllocated === 0) return 0
  return (combinedStorage.value.totalUsed / combinedStorage.value.totalAllocated) * 100
})

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// Fetch accounts and storage on mount (admin only)
onMounted(() => {
  // Wait for role check then fetch if admin
  watch(isAdmin, (admin) => {
    if (admin) {
      fetchAccounts()
      fetchStorageInfo()
    }
  }, { immediate: true })
})

// Refetch storage when accounts change (add/remove) - admin only
watch(accounts, () => {
  if (isAdmin.value) {
    fetchStorageInfo()
  }
}, { deep: true })

// Runtime config for default App Key
const runtimeConfig = useRuntimeConfig()
const hasDefaultCredentials = computed(() => !!runtimeConfig.public.dropboxAppKey)

// Add account modal state
const showAddAccountModal = ref(false)
const addAccountStep = ref<'credentials' | 'auth' | 'success' | 'error'>('credentials')
const addAccountError = ref('')
const appKey = ref('')
const appSecret = ref('')
const authCode = ref('')
const accountName = ref('')

// When opening modal, skip to auth if default credentials exist
const openAddAccountModal = () => {
  showAddAccountModal.value = true
  if (hasDefaultCredentials.value) {
    appKey.value = runtimeConfig.public.dropboxAppKey as string
    addAccountStep.value = 'auth'
  } else {
    addAccountStep.value = 'credentials'
  }
}

const openAuthUrl = () => {
  const keyToUse = appKey.value || runtimeConfig.public.dropboxAppKey as string
  window.open(getAuthUrl(keyToUse), '_blank', 'width=600,height=800')
}

const handleAddAccount = async () => {
  const result = await addAccount(authCode.value, appKey.value, appSecret.value, accountName.value || undefined)
  
  if (result.success) {
    addAccountStep.value = 'success'
    // Refresh accounts list and storage info
    await fetchAccounts()
    await fetchStorageInfo()
    await fetchFiles('')
  } else {
    addAccountError.value = result.error || 'Failed to add account'
    addAccountStep.value = 'error'
  }
}

const closeAddAccountModal = () => {
  showAddAccountModal.value = false
  addAccountStep.value = 'credentials'
  appKey.value = ''
  appSecret.value = ''
  authCode.value = ''
  accountName.value = ''
}

const isSwitching = ref(false)

const handleSwitchAccount = async (accountId: string) => {
  if (isSwitching.value) return
  
  isSwitching.value = true
  try {
    const success = await switchAccount(accountId)
    if (success) {
      // Reset to root folder when switching accounts
      // Pass true to clear files immediately and show loading state
      await fetchFiles('', true)
    }
  } finally {
    isSwitching.value = false
  }
}

const handleRemoveAccount = async (accountId: string) => {
  if (confirm('Are you sure you want to remove this account?')) {
    const wasActive = activeAccountId.value === accountId
    const success = await removeAccount(accountId)
    
    if (success) {
      // Refresh storage info
      await fetchStorageInfo()
      
      // If the removed account was active, switch to another one
      if (wasActive && accounts.value.length > 0) {
        await switchAccount(accounts.value[0].id)
        await fetchFiles('', true)
      }
    }
  }
}

// Mobile Menu State
const isMobileMenuOpen = ref(false)

// Close menu on route change
watch(() => route.path, () => {
  isMobileMenuOpen.value = false
})
</script>
