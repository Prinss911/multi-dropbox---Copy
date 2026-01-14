<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg bg-primary/10">
          <Icon name="lucide:users" class="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 class="text-xl font-semibold">Account Management</h1>
          <p class="text-sm text-muted-foreground">Manage your connected Dropbox accounts</p>
        </div>
      </div>
      <UiButton @click="openAddAccountModal">
        <Icon name="lucide:plus" class="h-4 w-4 mr-2" />
        Add Account
      </UiButton>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="rounded-md border bg-card p-8">
      <div class="flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <Icon name="lucide:loader-2" class="h-8 w-8 animate-spin" />
        <p>Loading accounts...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="accounts.length === 0" class="rounded-md border-2 border-dashed bg-card p-12">
      <div class="flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Icon name="lucide:cloud-off" class="h-16 w-16" />
        <p class="font-medium text-lg">No accounts connected</p>
        <p class="text-sm">Add a Dropbox account to get started</p>
        <UiButton class="mt-2" @click="openAddAccountModal">
          <Icon name="lucide:plus" class="h-4 w-4 mr-2" />
          Add Account
        </UiButton>
      </div>
    </div>

    <!-- Account List -->
    <div v-else class="space-y-4">
      <!-- Stats -->
      <div class="grid grid-cols-3 gap-4">
        <div class="rounded-lg border bg-card p-4">
          <p class="text-sm text-muted-foreground">Total Accounts</p>
          <p class="text-2xl font-bold">{{ accounts.length }}</p>
        </div>
        <div class="rounded-lg border bg-card p-4">
          <p class="text-sm text-muted-foreground">Total Storage</p>
          <p class="text-2xl font-bold">{{ formatBytes(combinedStorage?.totalAllocated || 0) }}</p>
        </div>
        <div class="rounded-lg border bg-card p-4">
          <p class="text-sm text-muted-foreground">Used Storage</p>
          <p class="text-2xl font-bold">{{ formatBytes(combinedStorage?.totalUsed || 0) }}</p>
        </div>
      </div>

      <!-- Account Cards -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div 
          v-for="account in accountsWithStorage" 
          :key="account.id"
          :class="[
            'rounded-lg border bg-card p-4 transition-all cursor-pointer',
            account.isActive ? 'ring-2 ring-primary' : 'hover:border-muted-foreground/50'
          ]"
          @click="handleSwitchAccount(account.id)"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div :class="[
                'p-2 rounded-full',
                account.isActive ? 'bg-primary/10' : 'bg-muted'
              ]">
                <Icon name="simple-icons:dropbox" :class="[
                  'h-5 w-5',
                  account.isActive ? 'text-primary' : 'text-muted-foreground'
                ]" />
              </div>
              <div>
                <h3 class="font-semibold">{{ account.name }}</h3>
                <p class="text-xs text-muted-foreground">{{ account.email || 'No email' }}</p>
              </div>
            </div>
            <!-- Storage Badge -->
            <span 
              v-if="account.storagePercent !== null"
              :class="[
                'px-2 py-0.5 rounded-full text-xs font-medium',
                account.storagePercent > 90 ? 'bg-destructive/10 text-destructive' :
                account.storagePercent > 70 ? 'bg-yellow-500/10 text-yellow-600' :
                'bg-green-500/10 text-green-600'
              ]"
            >
              {{ Math.round(account.storagePercent) }}% used
            </span>
          </div>

          <!-- Storage Bar -->
          <div v-if="account.used !== null" class="mb-3">
            <div class="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{{ formatBytes(account.used) }} used</span>
              <span>{{ formatBytes(account.total) }}</span>
            </div>
            <div class="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div 
                class="h-full bg-primary transition-all"
                :style="{ width: `${Math.min(account.storagePercent || 0, 100)}%` }"
              />
            </div>
          </div>

          <p class="text-xs text-muted-foreground mb-3">
            Added {{ formatDate(account.createdAt) }}
          </p>

          <div class="flex justify-end">
            <UiButton 
              variant="ghost" 
              size="sm"
              @click.stop="confirmDelete(account)"
            >
              <Icon name="lucide:trash-2" class="h-4 w-4 text-destructive" />
            </UiButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirm Dialog -->
    <Teleport to="body">
      <div 
        v-if="deleteTarget" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="deleteTarget = null"
      >
        <div class="bg-card w-full max-w-sm rounded-lg shadow-lg border p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 rounded-full bg-destructive/10">
              <Icon name="lucide:alert-triangle" class="h-5 w-5 text-destructive" />
            </div>
            <h3 class="font-semibold text-lg">Delete Account</h3>
          </div>
          <p class="text-muted-foreground mb-6">
            Are you sure you want to delete <strong>{{ deleteTarget.name }}</strong>? 
            This will remove the account from MultiBox but won't affect your Dropbox data.
          </p>
          <div class="flex gap-3 justify-end">
            <UiButton variant="outline" @click="deleteTarget = null">
              Cancel
            </UiButton>
            <UiButton 
              variant="destructive"
              :disabled="isDeleting"
              @click="handleDeleteAccount"
            >
              <Icon v-if="isDeleting" name="lucide:loader-2" class="h-4 w-4 mr-2 animate-spin" />
              Delete
            </UiButton>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Add Account Modal -->
    <Teleport to="body">
      <div 
        v-if="showAddModal" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="closeAddModal"
      >
        <div class="bg-card w-full max-w-md rounded-lg shadow-lg border p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 rounded-full bg-primary/10">
              <Icon name="simple-icons:dropbox" class="h-5 w-5 text-primary" />
            </div>
            <h3 class="font-semibold text-lg">Add Dropbox Account</h3>
          </div>
          
          <!-- Step: Auth -->
          <div v-if="addStep === 'auth'" class="space-y-4">
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
              <UiButton variant="outline" class="flex-1" @click="closeAddModal">
                Cancel
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
          
          <!-- Step: Success -->
          <div v-else-if="addStep === 'success'" class="text-center space-y-4">
            <div class="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <Icon name="lucide:check" class="h-6 w-6 text-green-600" />
            </div>
            <p class="font-medium">Account added successfully!</p>
            <UiButton class="w-full" @click="closeAddModal">
              Done
            </UiButton>
          </div>
          
          <!-- Step: Error -->
          <div v-else-if="addStep === 'error'" class="text-center space-y-4">
            <div class="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <Icon name="lucide:x" class="h-6 w-6 text-red-600" />
            </div>
            <p class="font-medium text-destructive">{{ addError }}</p>
            <UiButton class="w-full" @click="addStep = 'auth'">
              Try Again
            </UiButton>
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
  window.open(getAuthUrl(keyToUse), '_blank', 'width=600,height=800')
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
