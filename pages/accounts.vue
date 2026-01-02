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
      <UiButton @click="showAddModal = true">
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

    <!-- Error -->
    <div v-else-if="error" class="rounded-md border border-destructive/50 bg-destructive/10 p-8">
      <div class="flex flex-col items-center justify-center gap-2 text-destructive">
        <Icon name="lucide:alert-circle" class="h-8 w-8" />
        <p class="font-medium">Failed to load accounts</p>
        <UiButton variant="outline" size="sm" @click="fetchAccounts">
          <Icon name="lucide:refresh-cw" class="mr-2 h-4 w-4" />
          Retry
        </UiButton>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="accounts.length === 0" class="rounded-md border-2 border-dashed bg-card p-12">
      <div class="flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Icon name="lucide:cloud-off" class="h-16 w-16" />
        <p class="font-medium text-lg">No accounts connected</p>
        <p class="text-sm">Add a Dropbox account to get started</p>
        <UiButton class="mt-2" @click="showAddModal = true">
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
          <p class="text-2xl font-bold">{{ formatBytes(totalStorage) }}</p>
        </div>
        <div class="rounded-lg border bg-card p-4">
          <p class="text-sm text-muted-foreground">Used Storage</p>
          <p class="text-2xl font-bold">{{ formatBytes(usedStorage) }}</p>
        </div>
      </div>

      <!-- Account Cards -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div 
          v-for="account in accounts" 
          :key="account.id"
          :class="[
            'rounded-lg border bg-card p-4 transition-all',
            account.isActive ? 'ring-2 ring-primary' : 'hover:border-muted-foreground/50'
          ]"
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
              v-if="account.storage"
              :class="[
                'px-2 py-0.5 rounded-full text-xs font-medium',
                getStoragePercent(account) > 90 ? 'bg-destructive/10 text-destructive' :
                getStoragePercent(account) > 70 ? 'bg-yellow-500/10 text-yellow-600' :
                'bg-green-500/10 text-green-600'
              ]"
            >
              {{ Math.round(getStoragePercent(account)) }}% used
            </span>
          </div>

          <!-- Storage Bar -->
          <div v-if="account.storage" class="mb-3">
            <div class="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{{ formatBytes(account.storage.used) }} used</span>
              <span>{{ formatBytes(account.storage.total) }}</span>
            </div>
            <div class="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div 
                class="h-full bg-primary transition-all"
                :style="{ width: `${Math.min((account.storage.used / account.storage.total) * 100, 100)}%` }"
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
              @click="confirmDelete(account)"
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
            <button 
              @click="deleteTarget = null"
              class="px-4 py-2 rounded-md text-sm font-medium border border-input bg-background hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button 
              @click="deleteAccount"
              :disabled="isDeleting"
              class="px-4 py-2 rounded-md text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
            >
              <Icon v-if="isDeleting" name="lucide:loader-2" class="h-4 w-4 mr-2 animate-spin inline" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Add Account Modal (OAuth Flow) -->
    <Teleport to="body">
      <div 
        v-if="showAddModal" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <div class="bg-card w-full max-w-sm rounded-lg shadow-lg border p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 rounded-full bg-primary/10">
              <Icon name="simple-icons:dropbox" class="h-5 w-5 text-primary" />
            </div>
            <h3 class="font-semibold text-lg">Connect Dropbox</h3>
          </div>
          
          <p class="text-muted-foreground mb-6">
            Click the button below to connect your Dropbox account. You'll be redirected to Dropbox to authorize access.
          </p>

          <div class="flex flex-col gap-3">
            <a 
              href="/api/auth/dropbox/authorize"
              class="flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium bg-[#0061FF] text-white hover:bg-[#0052D9] transition-colors"
            >
              <Icon name="simple-icons:dropbox" class="h-5 w-5" />
              Connect with Dropbox
            </a>
            <button 
              @click="showAddModal = false"
              class="px-4 py-2 rounded-md text-sm font-medium border border-input bg-background hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
interface Account {
  id: string
  name: string
  email: string | null
  isActive: boolean
  createdAt: string
  storage?: {
    used: number
    total: number
  }
}

const accounts = ref<Account[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const isSetting = ref<string | null>(null)
const isDeleting = ref(false)
const isAdding = ref(false)
const deleteTarget = ref<Account | null>(null)
const showAddModal = ref(false)

const newAccount = reactive({
  name: '',
  appKey: '',
  appSecret: '',
  refreshToken: ''
})

const totalStorage = computed(() => accounts.value.reduce((sum, a) => sum + (a.storage?.total || 0), 0))
const usedStorage = computed(() => accounts.value.reduce((sum, a) => sum + (a.storage?.used || 0), 0))
const canAdd = computed(() => newAccount.name && newAccount.appKey && newAccount.appSecret && newAccount.refreshToken)

const getStoragePercent = (account: Account) => {
  if (!account.storage || !account.storage.total) return 0
  return (account.storage.used / account.storage.total) * 100
}

const formatBytes = (bytes: number) => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const fetchAccounts = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const response = await $fetch<{ accounts: Account[] }>('/api/accounts')
    accounts.value = response.accounts
    
    // Fetch storage for each account
    const storageData = await $fetch<{ accounts: any[] }>('/api/dropbox/storage-all')
    if (storageData.accounts) {
      for (const storage of storageData.accounts) {
        const account = accounts.value.find(a => a.id === storage.id)
        if (account) {
          account.storage = {
            used: storage.used,
            total: storage.total
          }
        }
      }
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load accounts'
  } finally {
    isLoading.value = false
  }
}

const setActive = async (id: string) => {
  isSetting.value = id
  try {
    await $fetch('/api/accounts/active', {
      method: 'POST',
      body: { accountId: id }
    })
    await fetchAccounts()
  } catch (err) {
    console.error('Failed to set active:', err)
  } finally {
    isSetting.value = null
  }
}

const confirmDelete = (account: Account) => {
  deleteTarget.value = account
}

const deleteAccount = async () => {
  if (!deleteTarget.value) return
  
  isDeleting.value = true
  try {
    await $fetch(`/api/accounts/${deleteTarget.value.id}`, {
      method: 'DELETE'
    })
    accounts.value = accounts.value.filter(a => a.id !== deleteTarget.value!.id)
    deleteTarget.value = null
  } catch (err) {
    console.error('Failed to delete:', err)
  } finally {
    isDeleting.value = false
  }
}

const resetNewAccount = () => {
  newAccount.name = ''
  newAccount.appKey = ''
  newAccount.appSecret = ''
  newAccount.refreshToken = ''
}

const addAccount = async () => {
  isAdding.value = true
  try {
    await $fetch('/api/accounts', {
      method: 'POST',
      body: {
        name: newAccount.name,
        app_key: newAccount.appKey,
        app_secret: newAccount.appSecret,
        refresh_token: newAccount.refreshToken
      }
    })
    showAddModal.value = false
    resetNewAccount()
    await fetchAccounts()
  } catch (err) {
    console.error('Failed to add account:', err)
  } finally {
    isAdding.value = false
  }
}

onMounted(() => {
  fetchAccounts()
})
</script>
