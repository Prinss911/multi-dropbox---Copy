<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-semibold">Shared Links</h1>
        <p class="text-sm text-muted-foreground">
          {{ total }} active share links
        </p>
      </div>
      <div class="flex items-center gap-2">
        <!-- Search -->
        <div class="relative">
          <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Search files..."
            class="h-9 pl-9 pr-3 w-48 rounded-md border bg-background text-sm"
          />
        </div>

        <!-- Account Filter -->
        <select 
          v-model="filterAccount" 
          class="h-9 px-3 rounded-md border bg-background text-sm"
        >
          <option value="">All Accounts</option>
          <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
            {{ acc.name }}
          </option>
        </select>

        <!-- Status Filter -->
        <select 
          v-model="filterStatus" 
          class="h-9 px-3 rounded-md border bg-background text-sm"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="never">Never Expires</option>
        </select>
        
        <UiButton variant="outline" size="sm" @click="refresh" :disabled="pending">
          <Icon :name="pending ? 'lucide:loader-2' : 'lucide:refresh-cw'" :class="{ 'animate-spin': pending }" class="h-4 w-4" />
        </UiButton>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="text-center py-12">
      <Icon name="lucide:loader-2" class="animate-spin h-8 w-8 text-primary mx-auto" />
      <p class="mt-2 text-sm text-muted-foreground">Loading share links...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
      <div class="flex items-center gap-2 text-destructive">
        <Icon name="lucide:alert-circle" class="h-5 w-5" />
        <span>{{ error.message || 'Failed to load shares' }}</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredShares.length === 0" class="text-center py-12 bg-card rounded-lg border">
      <Icon name="lucide:link-2-off" class="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 class="mt-4 text-lg font-medium">No share links found</h3>
      <p class="mt-1 text-sm text-muted-foreground">
        {{ searchQuery || filterAccount || filterStatus ? 'Try adjusting your filters.' : 'No files have been shared yet.' }}
      </p>
    </div>

    <!-- Shares Table -->
    <div v-else class="bg-card rounded-lg border overflow-hidden">
      <table class="w-full">
        <thead class="bg-muted/50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">File</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Account</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Created</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Expires</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Downloads</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-for="share in paginatedShares" :key="share.id" class="hover:bg-muted/30 transition-colors">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div :class="['h-10 w-10 rounded-lg flex items-center justify-center shrink-0', getIconColor(getExtension(share.fileName))]">
                  <Icon :name="getFileIcon(getExtension(share.fileName))" class="h-5 w-5" />
                </div>
                <div class="min-w-0">
                  <p class="font-medium truncate max-w-[200px]" :title="share.fileName">{{ share.fileName }}</p>
                  <p class="text-xs text-muted-foreground font-mono truncate max-w-[200px]">{{ share.id }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3">
              <span 
                class="inline-flex px-2 py-1 rounded text-xs font-medium text-white"
                :style="{ backgroundColor: getAccountColor(share.accountId) }"
              >
                {{ share.accountName }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
              {{ formatDate(share.createdAt) }}
            </td>
            <td class="px-4 py-3">
              <span :class="getExpiryClass(share.expiresAt)">
                {{ formatExpiry(share.expiresAt) }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm hidden sm:table-cell">
              <div class="flex items-center gap-1">
                <Icon name="lucide:download" class="h-4 w-4 text-muted-foreground" />
                <span>{{ share.downloadCount }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-1">
                <UiButton 
                  variant="ghost" 
                  size="icon" 
                  class="h-8 w-8"
                  title="Open"
                  @click="openShare(share)"
                >
                  <Icon name="lucide:external-link" class="h-4 w-4" />
                </UiButton>
                <UiButton 
                  variant="ghost" 
                  size="icon" 
                  class="h-8 w-8"
                  title="Copy Link"
                  @click="copyLink(share)"
                >
                  <Icon :name="copiedId === share.id ? 'lucide:check' : 'lucide:copy'" class="h-4 w-4" />
                </UiButton>
                <UiButton 
                  variant="ghost" 
                  size="icon" 
                  class="h-8 w-8 text-destructive hover:text-destructive"
                  title="Delete"
                  @click="confirmDelete(share)"
                >
                  <Icon name="lucide:trash-2" class="h-4 w-4" />
                </UiButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between">
      <p class="text-sm text-muted-foreground">
        Showing {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredShares.length) }} of {{ filteredShares.length }}
      </p>
      <div class="flex items-center gap-2">
        <UiButton 
          variant="outline" 
          size="sm" 
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          <Icon name="lucide:chevron-left" class="h-4 w-4" />
        </UiButton>
        <span class="text-sm">Page {{ currentPage }} of {{ totalPages }}</span>
        <UiButton 
          variant="outline" 
          size="sm" 
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          <Icon name="lucide:chevron-right" class="h-4 w-4" />
        </UiButton>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
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
            <h3 class="font-semibold text-lg">Delete Share Link</h3>
          </div>
          <p class="text-muted-foreground mb-6">
            Are you sure you want to delete the share link for <strong>{{ deleteTarget.fileName }}</strong>?
            <br><br>
            <span class="text-destructive text-sm">This will make the link inaccessible.</span>
          </p>
          <div class="flex gap-3 justify-end">
            <UiButton variant="outline" @click="deleteTarget = null">
              Cancel
            </UiButton>
            <UiButton 
              variant="destructive"
              :disabled="isDeleting"
              @click="handleDelete"
            >
              <Icon v-if="isDeleting" name="lucide:loader-2" class="h-4 w-4 mr-2 animate-spin" />
              Delete
            </UiButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
interface ShareLink {
  id: string
  fileId: string
  fileName: string
  filePath: string
  files: any[]
  accountId: string
  accountName: string
  createdAt: string
  expiresAt: string | null
  downloadCount: number
  userId?: string | null
}

interface SharesResponse {
  shares: ShareLink[]
  accounts: { id: string; name: string }[]
  total: number
}

// Filters
const searchQuery = ref('')
const filterAccount = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = 30

// State
const copiedId = ref<string | null>(null)
const deleteTarget = ref<ShareLink | null>(null)
const isDeleting = ref(false)

// Fetch shares
const { data, pending, error, refresh } = await useFetch<SharesResponse>('/api/admin/shares', {
  server: false
})

const shares = computed(() => data.value?.shares || [])
const accounts = computed(() => data.value?.accounts || [])
const total = computed(() => data.value?.total || 0)

// Filtered shares
const filteredShares = computed(() => {
  let result = [...shares.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(s => 
      s.fileName.toLowerCase().includes(query) || 
      s.id.toLowerCase().includes(query)
    )
  }

  // Account filter
  if (filterAccount.value) {
    result = result.filter(s => s.accountId === filterAccount.value)
  }

  // Status filter
  if (filterStatus.value) {
    const now = new Date()
    if (filterStatus.value === 'active') {
      result = result.filter(s => !s.expiresAt || new Date(s.expiresAt) > now)
    } else if (filterStatus.value === 'expired') {
      result = result.filter(s => s.expiresAt && new Date(s.expiresAt) <= now)
    } else if (filterStatus.value === 'never') {
      result = result.filter(s => !s.expiresAt)
    }
  }

  return result
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredShares.value.length / pageSize))
const paginatedShares = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredShares.value.slice(start, start + pageSize)
})

// Reset page when filters change
watch([searchQuery, filterAccount, filterStatus], () => {
  currentPage.value = 1
})

// Helpers
const getExtension = (name: string): string => {
  return name.split('.').pop()?.toLowerCase() || ''
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatExpiry = (expiresAt: string | null): string => {
  if (!expiresAt) return 'Never'
  
  const expiry = new Date(expiresAt)
  const now = new Date()
  
  if (expiry <= now) return 'Expired'
  
  const diff = expiry.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h`
  return 'Soon'
}

const getExpiryClass = (expiresAt: string | null): string => {
  if (!expiresAt) return 'text-green-600 dark:text-green-400 text-sm font-medium'
  
  const expiry = new Date(expiresAt)
  const now = new Date()
  
  if (expiry <= now) return 'text-destructive text-sm font-medium'
  
  const diff = expiry.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days < 1) return 'text-amber-600 dark:text-amber-400 text-sm font-medium'
  return 'text-muted-foreground text-sm'
}

const getFileIcon = (ext: string): string => {
  const map: Record<string, string> = {
    png: 'lucide:image', jpg: 'lucide:image', jpeg: 'lucide:image', gif: 'lucide:image', webp: 'lucide:image',
    pdf: 'lucide:file-text',
    doc: 'lucide:file-text', docx: 'lucide:file-text',
    xls: 'lucide:file-spreadsheet', xlsx: 'lucide:file-spreadsheet',
    mp4: 'lucide:file-video', mkv: 'lucide:file-video', avi: 'lucide:file-video', mov: 'lucide:file-video',
    mp3: 'lucide:file-audio', wav: 'lucide:file-audio', flac: 'lucide:file-audio',
    zip: 'lucide:file-archive', rar: 'lucide:file-archive', '7z': 'lucide:file-archive'
  }
  return map[ext] || 'lucide:file'
}

const getIconColor = (ext: string): string => {
  const colorMap: Record<string, string> = {
    pdf: 'text-red-600 bg-red-50 dark:bg-red-900/30',
    doc: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30',
    docx: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30',
    mp4: 'text-pink-600 bg-pink-50 dark:bg-pink-900/30',
    mkv: 'text-pink-600 bg-pink-50 dark:bg-pink-900/30',
    jpg: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
    png: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
  }
  return colorMap[ext] || 'text-gray-600 bg-gray-50 dark:bg-gray-900/30'
}

const accountColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']
const getAccountColor = (accountId: string): string => {
  const index = accounts.value.findIndex(a => a.id === accountId)
  return accountColors[index % accountColors.length]
}

// Actions
const getShareUrl = (share: ShareLink): string => {
  const host = window.location.host
  const protocol = window.location.protocol
  return `${protocol}//${host}/file/${share.id}`
}

const openShare = (share: ShareLink) => {
  window.open(getShareUrl(share), '_blank')
}

const copyLink = async (share: ShareLink) => {
  await navigator.clipboard.writeText(getShareUrl(share))
  copiedId.value = share.id
  setTimeout(() => copiedId.value = null, 2000)
}

const confirmDelete = (share: ShareLink) => {
  deleteTarget.value = share
}

// Get Supabase client for auth token
const supabase = useSupabaseClient()

const handleDelete = async () => {
  if (!deleteTarget.value) return
  
  isDeleting.value = true
  try {
    // Get current session token
    const { data: { session } } = await supabase.auth.getSession()
    
    await $fetch(`/api/shares/${deleteTarget.value.id}`, {
      method: 'DELETE',
      headers: session?.access_token ? {
        'Authorization': `Bearer ${session.access_token}`
      } : {}
    })
    deleteTarget.value = null
    await refresh()
  } catch (err: any) {
    alert('Failed to delete: ' + (err.message || 'Unknown error'))
  } finally {
    isDeleting.value = false
  }
}
</script>
