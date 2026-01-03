<template>
  <div class="min-h-screen bg-background font-sans antialiased text-foreground flex">
    <!-- Sidebar -->
    <aside class="w-64 border-r bg-card hidden md:flex flex-col h-screen sticky top-0 overflow-hidden">
      <div class="h-14 flex items-center px-6 border-b">
        <a class="flex items-center gap-2 font-semibold text-lg" href="/">
          <div class="bg-blue-600 text-white p-1.5 rounded">
             <Icon name="lucide:hard-drive" class="h-4 w-4" />
          </div>
          <span>MultiBox</span>
        </a>
      </div>
      
      <!-- Account Selector -->
      <div class="p-3 border-b">
        <div class="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-2 px-1">
          Accounts
        </div>
        <div class="space-y-1 max-h-32 overflow-auto">
          <button
            v-for="account in accounts"
            :key="account.id"
            @click="handleSwitchAccount(account.id)"
            :class="[
              'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left',
              account.isActive 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted text-foreground'
            ]"
          >
            <div :class="[
              'h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
              account.isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
            ]">
              {{ account.name.charAt(0).toUpperCase() }}
            </div>
            <span class="truncate flex-1">{{ account.name }}</span>
            <Icon v-if="account.isActive" name="lucide:check" class="h-4 w-4 shrink-0" />
          </button>
        </div>
        
        <!-- Add Account Button (outside scrollable area) -->
        <button
          @click="openAddAccountModal"
          class="w-full flex items-center gap-2 px-2 py-1.5 mt-1 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <div class="h-6 w-6 rounded-full flex items-center justify-center border-2 border-dashed border-muted-foreground/50">
            <Icon name="lucide:plus" class="h-3 w-3" />
          </div>
          <span>Add Account</span>
        </button>
      </div>
      
      <!-- Navigation (scrollable) -->
      <div class="flex-1 py-4 px-3 space-y-1 overflow-auto min-h-0">
         <div class="px-2 mb-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">Storage</div>
         <nav class="space-y-1">
            <NuxtLink 
              to="/files" 
              :class="[
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                route.path.startsWith('/files') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              ]"
            >
               <Icon name="lucide:hard-drive" class="h-4 w-4" />
               My Files
            </NuxtLink>
            <NuxtLink 
              to="/recent" 
              :class="[
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                route.path === '/recent' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              ]"
            >
               <Icon name="lucide:clock" class="h-4 w-4" />
               Recent
            </NuxtLink>
            <NuxtLink 
              to="/trash" 
              :class="[
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                route.path === '/trash' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              ]"
            >
               <Icon name="lucide:trash-2" class="h-4 w-4" />
               Trash
            </NuxtLink>
            <NuxtLink 
              to="/accounts" 
              :class="[
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                route.path === '/accounts' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              ]"
            >
               <Icon name="lucide:users" class="h-4 w-4" />
               Accounts
            </NuxtLink>
         </nav>
      </div>
      
      <!-- Active Account & Combined Storage -->
      <div class="p-3 border-t space-y-3">
        <!-- Combined Storage (All Accounts) -->
        <div class="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-3 space-y-2">
          <div class="flex items-center gap-2">
            <Icon name="lucide:database" class="h-4 w-4 text-primary" />
            <span class="text-xs font-semibold uppercase tracking-wider">Total Storage</span>
          </div>
          
          <div v-if="combinedStorage" class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-2xl font-bold">{{ formatBytes(combinedStorage.totalUsed) }}</span>
              <span class="text-xs text-muted-foreground">of {{ formatBytes(combinedStorage.totalAllocated) }}</span>
            </div>
            <div class="w-full bg-muted rounded-full h-2">
              <div 
                class="h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-500"
                :style="{ width: combinedStoragePercentage + '%' }"
              ></div>
            </div>
            <div class="text-xs text-muted-foreground">
              {{ combinedStoragePercentage.toFixed(1) }}% used across {{ combinedStorage.accounts.length }} account(s)
            </div>
            
            <!-- Per-account breakdown (scrollable) -->
            <div class="pt-2 space-y-1.5 border-t border-border/50 mt-2 max-h-20 overflow-auto">
              <div 
                v-for="acc in combinedStorage.accounts" 
                :key="acc.accountId"
                class="flex items-center justify-between text-xs"
              >
                <span class="text-muted-foreground truncate flex-1">{{ acc.accountName }}</span>
                <span class="font-medium ml-2">{{ formatBytes(acc.used) }}</span>
              </div>
            </div>
          </div>
          <div v-else-if="isLoadingStorage" class="flex items-center gap-2 text-xs text-muted-foreground py-2">
            <Icon name="lucide:loader-2" class="h-4 w-4 animate-spin" />
            Loading storage info...
          </div>
        </div>
        
        <!-- Active Account Info -->
        <div v-if="activeAccount" class="bg-muted/50 rounded-lg p-3">
           <div class="flex items-center gap-3">
              <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                 {{ activeAccount.name.charAt(0).toUpperCase() }}
              </div>
              <div class="text-sm overflow-hidden flex-1">
                 <p class="font-medium truncate">{{ activeAccount.name }}</p>
                 <p class="text-xs text-muted-foreground truncate">{{ activeAccount.email || 'Active account' }}</p>
              </div>
           </div>
           <UiButton 
             v-if="accounts.length > 1"
             variant="outline" 
             size="sm" 
             class="w-full text-xs h-7 text-destructive hover:text-destructive mt-3"
             @click="handleRemoveAccount(activeAccount.id)"
           >
              Remove Account
           </UiButton>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
        <header class="h-14 border-b bg-background/95 backdrop-blur flex items-center justify-between px-6 sticky top-0 z-10">
           <div class="flex items-center gap-4">
              <h1 class="font-semibold text-lg">
                {{ activeAccount?.name || 'My Files' }}
              </h1>
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
        <main class="flex-1 overflow-auto bg-muted/10 p-6">
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

const {
  accounts,
  activeAccount,
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

// Fetch accounts and storage on mount
onMounted(() => {
  fetchAccounts()
  fetchStorageInfo()
})

// Refetch storage when accounts change (add/remove)
watch(accounts, () => {
  fetchStorageInfo()
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
    await removeAccount(accountId)
  }
}
</script>
