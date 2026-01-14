<template>
  <div class="h-full flex flex-col bg-background/50">
    <!-- Sticky Header & Stats -->
    <div class="sticky top-0 z-20 bg-background/95 backdrop-blur border-b px-6 py-4">
      <div class="w-full">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
             <h1 class="text-xl font-semibold text-[#1E1919] dark:text-foreground">Connected Accounts</h1>
             <p class="text-sm text-muted-foreground">{{ accounts.length }} active connections</p>
           </div>
           <!-- Header logic preserved -->
           <div class="flex items-center gap-6">
              <!-- Total Storage Stat -->
              <div class="hidden md:flex items-center gap-3">
                 <div class="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0061FE]">
                    <Icon name="lucide:hard-drive" class="h-5 w-5" />
                 </div>
                 <div class="text-right sm:text-left">
                    <p class="text-sm font-semibold text-[#1E1919] dark:text-foreground">
                        {{ formatBytes(combinedStorage?.totalUsed || 0) }} used
                    </p>
                    <p class="text-xs text-muted-foreground">
                        of {{ formatBytes(combinedStorage?.totalAllocated || 0) }} total
                    </p>
                 </div>
              </div>

              <div class="w-px h-8 bg-border hidden md:block"></div>

              <UiButton @click="openAddAccountModal" class="bg-[#0061FE] hover:bg-[#0057E5] text-white">
                <Icon name="lucide:plus" class="h-4 w-4 mr-2" />
                Connect New Account
              </UiButton>
           </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-auto px-4 md:px-6 py-8 transition-all">
       <div class="w-full">

        <!-- Loading -->
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Icon name="lucide:loader-2" class="animate-spin h-8 w-8 text-[#0061FE] mb-4" />
          <p class="text-sm">Fetching metrics...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="accounts.length === 0" class="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl bg-muted/10">
           <div class="h-24 w-24 mb-4 flex items-center justify-center rounded-full bg-blue-50 text-[#0061FE]">
             <Icon name="simple-icons:dropbox" class="h-10 w-10" />
           </div>
           <h3 class="text-lg font-semibold text-[#1E1919] dark:text-foreground mb-2">No accounts connected</h3>
           <p class="text-muted-foreground text-sm max-w-sm mb-6">
             Connect your Dropbox accounts to start pooling your storage space and managing files centrally.
           </p>
           <UiButton @click="openAddAccountModal" size="lg" class="bg-[#0061FE] hover:bg-[#0057E5] text-white">
              Connect First Account
           </UiButton>
        </div>

        <!-- Accounts Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
           <div 
              v-for="account in accountsWithStorage" 
              :key="account.id"
              class="group relative bg-card hover:bg-muted/20 border rounded-xl p-5 transition-all shadow-sm hover:shadow-md"
              :class="{ 'ring-2 ring-[#0061FE] ring-offset-2 dark:ring-offset-background': account.isActive }"
              @click="handleSwitchAccount(account.id)"
           >
              <!-- Active Badge -->
              <div v-if="account.isActive" class="absolute top-4 right-4">
                 <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#0061FE]/10 text-[#0061FE] text-xs font-bold uppercase tracking-wider">
                    Active
                 </span>
              </div>
              
              <!-- Header -->
              <div class="flex items-start gap-4 mb-6">
                 <div class="h-12 w-12 rounded-xl bg-[#0061FE]/5 flex items-center justify-center shrink-0">
                    <Icon name="simple-icons:dropbox" class="h-6 w-6 text-[#0061FE]" />
                 </div>
                 <div class="min-w-0 pr-12">
                    <h3 class="font-semibold text-base truncate text-[#1E1919] dark:text-foreground" :title="account.name">{{ account.name }}</h3>
                    <p class="text-sm text-muted-foreground truncate" :title="account.email || ''">{{ account.email || 'No email' }}</p>
                 </div>
              </div>

              <!-- Storage Metrics -->
              <div class="mb-6">
                 <div class="flex items-end justify-between mb-2">
                    <div>
                       <span class="text-2xl font-bold block text-[#1E1919] dark:text-foreground">{{ account.storagePercent !== null ? Math.round(account.storagePercent) : 0 }}%</span>
                       <span class="text-xs text-muted-foreground font-medium uppercase tracking-wide">Usage</span>
                    </div>
                    <div class="text-right text-xs text-muted-foreground">
                       <p><span class="font-medium text-foreground">{{ formatBytes(account.used || 0) }}</span> used</p>
                       <p>of {{ formatBytes(account.total || 0) }}</p>
                    </div>
                 </div>
                 
                 <!-- Progress Bar -->
                 <div class="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                    <div 
                       class="h-full rounded-full transition-all duration-700 ease-out"
                       :class="[
                          account.storagePercent > 90 ? 'bg-red-500' : 
                          account.storagePercent > 75 ? 'bg-amber-500' : 'bg-[#0061FE]'
                       ]"
                       :style="{ width: `${Math.min(account.storagePercent || 0, 100)}%` }"
                    ></div>
                 </div>
              </div>

              <!-- Footer -->
              <div class="flex items-center justify-between pt-4 border-t border-dashed">
                 <span class="text-xs text-muted-foreground">
                    Added {{ formatDate(account.createdAt) }}
                 </span>
                 
                 <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                       v-if="!account.isActive"
                       @click.stop="handleSwitchAccount(account.id)"
                       class="p-2 h-8 w-8 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-[#0061FE] transition-colors"
                       title="Switch to this account"
                    >
                       <Icon name="lucide:arrow-right-left" class="h-4 w-4" />
                    </button>
                    <button 
                       @click.stop="confirmDelete(account)"
                       class="p-2 h-8 w-8 flex items-center justify-center rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                       title="Remove account"
                    >
                       <Icon name="lucide:trash-2" class="h-4 w-4" />
                    </button>
                 </div>
              </div>
           </div>
        </div>

       </div>
    </div>

    <!-- Delete Confirm Dialog -->
    <Teleport to="body">
      <div 
        v-if="deleteTarget" 
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1E1919]/60 backdrop-blur-[2px]"
        @click.self="deleteTarget = null"
      >
        <div class="bg-card w-full max-w-[400px] rounded-xl shadow-2xl border-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6">
           <div class="flex flex-col items-center text-center gap-4">
              <div class="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-2">
                 <Icon name="lucide:alert-triangle" class="h-6 w-6" />
              </div>
              <div>
                 <h3 class="text-lg font-semibold text-[#1E1919] dark:text-foreground">Remove Account?</h3>
                 <p class="text-sm text-muted-foreground mt-2 px-4">
                    Are you sure you want to remove <span class="font-medium text-foreground">{{ deleteTarget.name }}</span>? 
                    <br>This will disconnect it from MultiBox. Your files on Dropbox will remain safe.
                 </p>
              </div>
              
              <div class="flex gap-3 w-full mt-4">
                 <button 
                    @click="deleteTarget = null"
                    class="flex-1 h-10 rounded-lg border hover:bg-muted transition-colors text-sm font-medium"
                 >
                    Cancel
                 </button>
                 <button 
                    @click="handleDeleteAccount"
                    :disabled="isDeleting"
                    class="flex-1 h-10 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-70"
                 >
                    <Icon v-if="isDeleting" name="lucide:loader-2" class="h-4 w-4 animate-spin" />
                    {{ isDeleting ? 'Removing...' : 'Remove' }}
                 </button>
              </div>
           </div>
        </div>
      </div>
    </Teleport>

    <!-- Add Account Modal -->
    <Teleport to="body">
      <div 
        v-if="showAddModal" 
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1E1919]/60 backdrop-blur-[2px]"
        @click.self="closeAddModal"
      >
        <div class="bg-card w-full max-w-[480px] rounded-xl shadow-2xl border-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
           <div class="px-6 py-5 border-b bg-background flex items-center justify-between">
             <h3 class="font-semibold text-lg text-[#1E1919] dark:text-foreground flex items-center gap-2">
                <Icon name="simple-icons:dropbox" class="h-5 w-5 text-[#0061FE]" />
                Connect Dropbox
             </h3>
             <button @click="closeAddModal" class="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors">
                <Icon name="lucide:x" class="h-5 w-5" />
             </button>
          </div>
          
          <div class="p-6">
            <!-- Step: Auth -->
            <div v-if="addStep === 'auth'" class="space-y-6">
              <div class="p-4 bg-muted/20 rounded-lg border border-dashed text-sm text-muted-foreground">
                <p class="mb-2 font-medium text-foreground">Instructions:</p>
                <ol class="list-decimal pl-4 space-y-1">
                   <li>Click <strong>Authorize</strong> below to open Dropbox login.</li>
                   <li>Allow access to MultiBox app.</li>
                   <li>Copy the generated <strong>Access Code</strong>.</li>
                   <li>Paste the code in the field below.</li>
                </ol>
              </div>

              <button 
                  @click="openAuthUrl"
                  class="w-full h-11 rounded-lg border-2 border-[#0061FE] text-[#0061FE] hover:bg-[#0061FE]/5 font-semibold text-sm transition-all flex items-center justify-center gap-2"
               >
                  Authorize with Dropbox
                  <Icon name="lucide:external-link" class="h-4 w-4" />
               </button>

              <div class="relative py-2">
                 <div class="absolute inset-0 flex items-center">
                    <span class="w-full border-t" />
                 </div>
                 <div class="relative flex justify-center text-xs uppercase tracking-wider font-semibold">
                    <span class="bg-card px-3 text-muted-foreground">Verification</span>
                 </div>
              </div>

              <div class="space-y-4">
                 <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase text-muted-foreground">Access Code</label>
                    <input 
                       v-model="authCode" 
                       placeholder="Paste the code here..."
                       class="w-full h-10 px-3 rounded-lg border bg-background focus:ring-2 focus:ring-[#0061FE]/20 focus:border-[#0061FE] transition-all font-mono text-sm"
                    />
                 </div>
                 
                 <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase text-muted-foreground">Account Alias (Optional)</label>
                    <input 
                       v-model="accountName" 
                       placeholder="e.g. 'Personal' or 'Design Team'"
                       class="w-full h-10 px-3 rounded-lg border bg-background focus:ring-2 focus:ring-[#0061FE]/20 focus:border-[#0061FE] transition-all text-sm"
                    />
                 </div>
              </div>

              <button 
                  @click="handleAddAccount"
                  :disabled="!authCode || isAddingAccount"
                  class="w-full h-11 mt-2 rounded-lg bg-[#0061FE] hover:bg-[#0057E5] text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
               >
                  <Icon v-if="isAddingAccount" name="lucide:loader-2" class="h-5 w-5 animate-spin" />
                  <span v-else>Connect Account</span>
               </button>
            </div>
            
            <!-- Step: Success -->
            <div v-else-if="addStep === 'success'" class="text-center py-8">
              <div class="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                <Icon name="lucide:check" class="h-8 w-8 text-green-600" />
              </div>
              <h3 class="text-xl font-bold text-[#1E1919] dark:text-foreground mb-2">Account Connected!</h3>
              <p class="text-muted-foreground mb-8">
                 Your Dropbox account has been successfully linked.
              </p>
              <button 
                 @click="closeAddModal"
                 class="w-full h-11 rounded-lg bg-[#0061FE] hover:bg-[#0057E5] text-white font-semibold text-sm transition-all"
              >
                Done
              </button>
            </div>
            
            <!-- Step: Error -->
            <div v-else-if="addStep === 'error'" class="text-center py-6">
              <div class="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Icon name="lucide:x" class="h-7 w-7 text-red-600" />
              </div>
              <h3 class="text-lg font-bold text-red-600 mb-2">Connection Failed</h3>
              <p class="text-muted-foreground text-sm mb-6">{{ addError }}</p>
              
              <button 
                 @click="addStep = 'auth'"
                 class="w-full h-11 rounded-lg border hover:bg-muted font-semibold text-sm transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
// Use the shared composable
const {
  accounts,
  activeAccountId,
  isLoading,
  isAddingAccount,
  fetchAccounts,
  switchAccount,
  getAuthUrl,
  addAccount,
  removeAccount
} = useAccounts()

const { fetchFiles } = useDropboxFiles()

// Runtime config for default App Key
const runtimeConfig = useRuntimeConfig()

// Storage info
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

const fetchStorageInfo = async () => {
  try {
    const response = await $fetch<CombinedStorageInfo>('/api/dropbox/storage-all')
    combinedStorage.value = response
  } catch (err) {
    console.error('Error fetching storage:', err)
  }
}

// Merge accounts with storage info
const accountsWithStorage = computed(() => {
  return accounts.value.map(account => {
    const storageInfo = combinedStorage.value?.accounts.find(s => s.accountId === account.id)
    return {
      ...account,
      used: storageInfo?.used ?? null,
      total: storageInfo?.total ?? null,
      storagePercent: storageInfo && storageInfo.total > 0 
        ? (storageInfo.used / storageInfo.total) * 100 
        : null
    }
  })
})

// Delete account
const deleteTarget = ref<typeof accounts.value[0] | null>(null)
const isDeleting = ref(false)

const confirmDelete = (account: typeof accounts.value[0]) => {
  deleteTarget.value = account
}

const handleDeleteAccount = async () => {
  if (!deleteTarget.value) return
  
  isDeleting.value = true
  try {
    const wasActive = activeAccountId.value === deleteTarget.value.id
    const success = await removeAccount(deleteTarget.value.id)
    
    if (success) {
      deleteTarget.value = null
      await fetchStorageInfo()
      
      // If the removed account was active, switch to another one
      if (wasActive && accounts.value.length > 0) {
        await switchAccount(accounts.value[0].id)
        await fetchFiles('', true)
      }
    }
  } finally {
    isDeleting.value = false
  }
}

// Add account modal
const showAddModal = ref(false)
const addStep = ref<'auth' | 'success' | 'error'>('auth')
const addError = ref('')
const authCode = ref('')
const accountName = ref('')

const openAddAccountModal = () => {
  showAddModal.value = true
  addStep.value = 'auth'
  authCode.value = ''
  accountName.value = ''
  addError.value = ''
}

const closeAddModal = () => {
  showAddModal.value = false
  addStep.value = 'auth'
  authCode.value = ''
  accountName.value = ''
  addError.value = ''
}

const openAuthUrl = () => {
  const keyToUse = runtimeConfig.public.dropboxAppKey as string
  if (typeof window !== 'undefined') {
    window.open(getAuthUrl(keyToUse), '_blank', 'width=600,height=800')
  }
}

const handleAddAccount = async () => {
  const keyToUse = runtimeConfig.public.dropboxAppKey as string
  const result = await addAccount(authCode.value, keyToUse, '', accountName.value || undefined)
  
  if (result.success) {
    addStep.value = 'success'
    await fetchStorageInfo()
    await fetchFiles('')
  } else {
    addError.value = result.error || 'Failed to add account'
    addStep.value = 'error'
  }
}

// Switch account
const handleSwitchAccount = async (accountId: string) => {
  if (activeAccountId.value === accountId) return
  
  await switchAccount(accountId)
  await fetchFiles('', true)
}

// Helpers
const formatBytes = (bytes: number) => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (date: string | null) => {
  if (!date) return 'Unknown'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// Fetch on mount
onMounted(() => {
  fetchAccounts()
  fetchStorageInfo()
})

// Watch for accounts changes to refresh storage
watch(accounts, () => {
  fetchStorageInfo()
}, { deep: true })
</script>
