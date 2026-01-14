<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-semibold">All Files</h1>
        <p class="text-sm text-muted-foreground">
          {{ totalFiles }} files from {{ totalAccounts }} account(s)
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

        <!-- Sort -->
        <select 
          v-model="sortBy" 
          class="h-9 px-3 rounded-md border bg-background text-sm"
        >
          <option value="modified">Newest</option>
          <option value="name">Name</option>
          <option value="size">Size</option>
        </select>
        
        <UiButton variant="outline" size="sm" @click="refresh" :disabled="pending">
          <Icon :name="pending ? 'lucide:loader-2' : 'lucide:refresh-cw'" :class="{ 'animate-spin': pending }" class="h-4 w-4" />
        </UiButton>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="text-center py-12">
      <Icon name="lucide:loader-2" class="animate-spin h-8 w-8 text-primary mx-auto" />
      <p class="mt-2 text-sm text-muted-foreground">Loading all files from accounts...</p>
      <p class="text-xs text-muted-foreground mt-1">This may take a moment...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
      <div class="flex items-center gap-2 text-destructive">
        <Icon name="lucide:alert-circle" class="h-5 w-5" />
        <span>{{ error.message || 'Failed to load files' }}</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="sortedFiles.length === 0" class="text-center py-12 bg-card rounded-lg border">
      <Icon name="lucide:file-x" class="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 class="mt-4 text-lg font-medium">No files found</h3>
      <p class="mt-1 text-sm text-muted-foreground">
        {{ searchQuery || filterAccount ? 'Try adjusting your filters.' : 'No files uploaded yet across all accounts.' }}
      </p>
    </div>

    <!-- Files Grid/Table -->
    <div v-else class="bg-card rounded-lg border overflow-hidden">
      <table class="w-full">
        <thead class="bg-muted/50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">File</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Account</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Location</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Size</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Modified</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr 
            v-for="file in paginatedFiles" 
            :key="file.id" 
            class="hover:bg-muted/30 transition-colors"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div :class="['h-10 w-10 rounded-lg flex items-center justify-center shrink-0', getIconColor(file.extension)]">
                  <Icon :name="getFileIcon(file.extension)" class="h-5 w-5" />
                </div>
                <div class="min-w-0">
                  <p class="font-medium truncate max-w-xs" :title="file.name">{{ file.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ file.extension?.toUpperCase() || 'FILE' }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3">
              <span 
                class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
                :style="{ 
                  backgroundColor: getAccountColor(file.accountId) + '20', 
                  color: getAccountColor(file.accountId) 
                }"
              >
                <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: getAccountColor(file.accountId) }"></span>
                {{ file.accountName }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
              <span class="truncate block max-w-[150px]" :title="file.path">
                {{ getFolder(file.path) }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
              {{ formatBytes(file.size) }}
            </td>
            <td class="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
              {{ formatDate(file.modified) }}
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-1">
                <UiButton 
                  variant="ghost" 
                  size="icon" 
                  class="h-8 w-8"
                  title="Download"
                  @click="handleDownload(file)"
                >
                  <Icon name="lucide:download" class="h-4 w-4" />
                </UiButton>
                <UiButton 
                  variant="ghost" 
                  size="icon" 
                  class="h-8 w-8"
                  title="Share"
                  @click="openShareModal(file)"
                >
                  <Icon name="lucide:share-2" class="h-4 w-4" />
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
        Showing {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, sortedFiles.length) }} of {{ sortedFiles.length }}
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

    <!-- Share Modal -->
    <Teleport to="body">
      <div 
        v-if="shareTarget" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="closeShareModal"
      >
        <div class="bg-card w-full max-w-md rounded-lg shadow-lg border p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 rounded-full bg-primary/10">
              <Icon name="lucide:share-2" class="h-5 w-5 text-primary" />
            </div>
            <h3 class="font-semibold text-lg">Share File</h3>
          </div>
          
          <!-- File Info -->
          <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg mb-4">
            <Icon :name="getFileIcon(shareTarget.extension)" class="h-8 w-8 text-muted-foreground" />
            <div class="flex-1 min-w-0">
              <p class="font-medium truncate">{{ shareTarget.name }}</p>
              <p class="text-xs text-muted-foreground">{{ formatBytes(shareTarget.size) }} • {{ shareTarget.accountName }}</p>
            </div>
          </div>

          <!-- Share Link Generated -->
          <div v-if="shareResult" class="space-y-4">
            <div class="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <Icon name="lucide:check-circle" class="h-5 w-5 text-green-600" />
              <span class="text-sm text-green-700 dark:text-green-400">Share link created!</span>
            </div>
            
            <div class="space-y-2">
              <label class="text-xs font-medium text-muted-foreground uppercase">Share Link</label>
              <div class="flex gap-2">
                <input 
                  type="text" 
                  :value="shareResult.url" 
                  readonly
                  class="flex-1 h-10 px-3 rounded-md border bg-muted/50 text-sm font-mono"
                />
                <UiButton @click="copyShareLink" :variant="copied ? 'default' : 'outline'">
                  <Icon :name="copied ? 'lucide:check' : 'lucide:copy'" class="h-4 w-4" />
                </UiButton>
              </div>
            </div>

            <p class="text-xs text-muted-foreground">
              Expires: {{ formatExpiry(shareResult.expiresAt) }}
            </p>

            <div class="flex gap-2 pt-2">
              <UiButton variant="outline" class="flex-1" @click="closeShareModal">
                Close
              </UiButton>
            </div>
          </div>

          <!-- Expiration Selection -->
          <div v-else class="space-y-4">
            <div>
              <label class="text-sm font-medium mb-2 block">Link Expires In</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="option in expirationOptions"
                  :key="option.label"
                  @click="selectedExpiration = option.days; selectedExpirationUnit = option.unit"
                  :class="[
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors border',
                    (selectedExpiration === option.days && selectedExpirationUnit === option.unit)
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-card hover:bg-muted border-input'
                  ]"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div class="flex gap-2 pt-2">
              <UiButton variant="outline" class="flex-1" @click="closeShareModal">
                Cancel
              </UiButton>
              <UiButton 
                class="flex-1"
                :disabled="isSharing"
                @click="handleShare"
              >
                <Icon v-if="isSharing" name="lucide:loader-2" class="h-4 w-4 mr-2 animate-spin" />
                <Icon v-else name="lucide:link" class="h-4 w-4 mr-2" />
                Create Link
              </UiButton>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
interface FileEntry {
  id: string
  name: string
  path: string
  size: number
  modified: string
  extension: string | null
  accountId: string
  accountName: string
}

interface AllFilesResponse {
  files: FileEntry[]
  accounts: { id: string; name: string }[]
  totalFiles: number
  totalAccounts: number
}

// Filters
const searchQuery = ref('')
const filterAccount = ref('')
const sortBy = ref('modified')
const currentPage = ref(1)
const pageSize = 50

// Fetch files
const { data, pending, error, refresh } = await useFetch<AllFilesResponse>('/api/dropbox/all-files', {
  server: false
})

const files = computed(() => data.value?.files || [])
const accounts = computed(() => data.value?.accounts || [])
const totalFiles = computed(() => data.value?.totalFiles || 0)
const totalAccounts = computed(() => data.value?.totalAccounts || 0)

// Filter and sort
const sortedFiles = computed(() => {
  let result = [...files.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(f => 
      f.name.toLowerCase().includes(query) || 
      f.path.toLowerCase().includes(query)
    )
  }

  // Account filter
  if (filterAccount.value) {
    result = result.filter(f => f.accountId === filterAccount.value)
  }

  // Sort
  if (sortBy.value === 'name') {
    result.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortBy.value === 'size') {
    result.sort((a, b) => b.size - a.size)
  } else {
    result.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())
  }

  return result
})

// Pagination
const totalPages = computed(() => Math.ceil(sortedFiles.value.length / pageSize))
const paginatedFiles = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return sortedFiles.value.slice(start, start + pageSize)
})

// Reset page when filters change
watch([searchQuery, filterAccount, sortBy], () => {
  currentPage.value = 1
})

// Get folder from path
const getFolder = (path: string): string => {
  const parts = path.split('/')
  parts.pop() // Remove filename
  return parts.join('/') || '/'
}

// Actions
const handleDownload = async (file: FileEntry) => {
  try {
    const { link } = await $fetch<{ link: string }>('/api/dropbox/download', {
      query: { path: file.path, accountId: file.accountId }
    })
    window.open(link, '_blank')
  } catch (err: any) {
    alert('Download failed: ' + err.message)
  }
}

// Share Modal State
const shareTarget = ref<FileEntry | null>(null)
const shareResult = ref<{ url: string; expiresAt: string | null } | null>(null)
const isSharing = ref(false)
const copied = ref(false)

// Expiration options (Admin has "Never" option)
const expirationOptions = [
  { days: 1, unit: 'days', label: '1 Day' },
  { days: 3, unit: 'days', label: '3 Days' },
  { days: 7, unit: 'days', label: '7 Days' },
  { days: 30, unit: 'days', label: '1 Month' },
  { days: 90, unit: 'days', label: '3 Months' },
  { days: 'never', unit: 'days', label: 'Never' }
]
const selectedExpiration = ref<number | string>(7)
const selectedExpirationUnit = ref('days')

// Open share modal
const openShareModal = (file: FileEntry) => {
  shareTarget.value = file
  shareResult.value = null
  copied.value = false
  selectedExpiration.value = 7
}

// Close share modal
const closeShareModal = () => {
  shareTarget.value = null
  shareResult.value = null
}

// Handle share
const handleShare = async () => {
  if (!shareTarget.value) return

  isSharing.value = true
  try {
    const result = await $fetch<{
      success: boolean
      share: {
        id: string
        url: string
        expiresAt: string | null
      }
    }>('/api/shares/create', {
      method: 'POST',
      body: {
        accountId: shareTarget.value.accountId,
        filePath: shareTarget.value.path,
        fileName: shareTarget.value.name,
        expirationDays: selectedExpiration.value,
        expirationUnit: selectedExpirationUnit.value
      }
    })

    shareResult.value = {
      url: result.share.url,
      expiresAt: result.share.expiresAt
    }
  } catch (err: any) {
    console.error('Share failed:', err)
    alert('Failed to create share link: ' + (err.message || 'Unknown error'))
  } finally {
    isSharing.value = false
  }
}

// Copy share link
const copyShareLink = async () => {
  if (!shareResult.value) return
  await navigator.clipboard.writeText(shareResult.value.url)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

// Format expiry date
const formatExpiry = (dateStr: string | null): string => {
  if (!dateStr) return 'Never'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Helpers
const formatBytes = (bytes: number): string => {
  if (!bytes || bytes === 0) return '-'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getFileIcon = (ext: string | null): string => {
  if (!ext) return 'lucide:file'
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

const getIconColor = (ext: string | null): string => {
  const colorMap: Record<string, string> = {
    pdf: 'text-red-600 bg-red-50 dark:bg-red-900/30',
    doc: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30',
    docx: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30',
    xls: 'text-green-600 bg-green-50 dark:bg-green-900/30',
    xlsx: 'text-green-600 bg-green-50 dark:bg-green-900/30',
    jpg: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
    jpeg: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
    png: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
    gif: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
    webp: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
    mp4: 'text-pink-600 bg-pink-50 dark:bg-pink-900/30',
    mkv: 'text-pink-600 bg-pink-50 dark:bg-pink-900/30',
    avi: 'text-pink-600 bg-pink-50 dark:bg-pink-900/30',
    mov: 'text-pink-600 bg-pink-50 dark:bg-pink-900/30',
    mp3: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30',
    wav: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30',
    flac: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30',
    zip: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30',
    rar: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30',
    '7z': 'text-amber-600 bg-amber-50 dark:bg-amber-900/30',
  }
  return colorMap[ext || ''] || 'text-gray-600 bg-gray-50 dark:bg-gray-900/30'
}

const accountColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']
const getAccountColor = (accountId: string): string => {
  const index = accounts.value.findIndex(a => a.id === accountId)
  return accountColors[index % accountColors.length]
}
</script>
