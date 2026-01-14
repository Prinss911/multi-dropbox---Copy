<template>
  <div class="space-y-4">
    <!-- Header Controls -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-semibold">My Files</h1>
        <p class="text-sm text-muted-foreground">
          Files you've uploaded
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
            class="h-9 pl-9 pr-3 w-40 sm:w-64 rounded-md border bg-background text-sm"
          />
        </div>

        <!-- Sort -->
        <select 
          v-model="sortBy" 
          class="h-9 px-3 rounded-md border bg-background text-sm hidden sm:block"
        >
          <option value="modified">Newest</option>
          <option value="name">Name</option>
          <option value="size">Size</option>
        </select>

        <UiButton @click="fileInput?.click()" :disabled="isUploading" size="sm">
          <Icon v-if="isUploading" name="lucide:loader-2" class="h-4 w-4 mr-2 animate-spin" />
          <Icon v-else name="lucide:upload" class="h-4 w-4 mr-2" />
          Upload
        </UiButton>
        
        <!-- Hidden File Input -->
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          @change="handleFileSelect"
        />
      </div>
    </div>

    <!-- Upload Progress -->
    <div v-if="isUploading" class="bg-card border rounded-lg p-4 shadow-sm animate-in fade-in slide-in-from-top-2">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium flex items-center gap-2">
          <Icon name="lucide:upload-cloud" class="h-4 w-4 text-primary" />
          Uploading <span class="text-foreground">{{ uploadingFileName }}</span>
        </span>
        <span class="text-sm text-muted-foreground">{{ uploadProgress }}%</span>
      </div>
      <div class="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div 
          class="h-full bg-primary transition-all duration-300 ease-out" 
          :style="{ width: `${uploadProgress}%` }"
        ></div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="text-center py-12">
      <Icon name="lucide:loader-2" class="animate-spin h-8 w-8 text-primary mx-auto" />
      <p class="mt-2 text-sm text-muted-foreground">Loading your files...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
      <div class="flex items-center gap-2 text-destructive">
        <Icon name="lucide:alert-circle" class="h-5 w-5" />
        <span>{{ error.message || 'Failed to load files' }}</span>
        <UiButton variant="outline" size="sm" class="ml-auto h-8" @click="refresh">Retry</UiButton>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="sortedFiles.length === 0" class="text-center py-12 bg-card rounded-lg border">
      <Icon name="lucide:folder-open" class="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 class="mt-4 text-lg font-medium">No files found</h3>
      <p class="mt-1 text-sm text-muted-foreground">
        {{ searchQuery ? 'Try adjusting your search.' : 'Upload your first file to get started.' }}
      </p>
      <div class="mt-4" v-if="!searchQuery">
        <UiButton @click="fileInput?.click()">
          <Icon name="lucide:upload" class="h-4 w-4 mr-2" />
          Upload File
        </UiButton>
      </div>
    </div>

    <!-- Files Table - Responsive -->
    <div v-else class="bg-card rounded-lg border overflow-hidden">
      <!-- Desktop Table -->
      <table class="w-full hidden sm:table">
        <thead class="bg-muted/50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">File</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Format</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Size</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Uploaded</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-for="file in paginatedFiles" :key="file.id" class="hover:bg-muted/30 transition-colors">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div :class="['h-10 w-10 rounded-lg flex items-center justify-center shrink-0', getIconColor(file.extension)]">
                  <Icon :name="getFileIcon(file.extension)" class="h-5 w-5" />
                </div>
                <span class="font-medium truncate max-w-[200px] lg:max-w-[300px]" :title="file.name">{{ file.name }}</span>
              </div>
            </td>
            <td class="px-4 py-3">
              <span class="inline-flex px-2 py-1 rounded text-xs font-medium bg-muted">
                {{ file.extension?.toUpperCase() || 'FILE' }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-muted-foreground">
              {{ formatBytes(file.size) }}
            </td>
            <td class="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
              {{ formatDate(file.modified) }}
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-1">
                <UiButton variant="ghost" size="icon" class="h-8 w-8" title="Share" @click="openShareModal(file)">
                  <Icon name="lucide:share-2" class="h-4 w-4" />
                </UiButton>
                <UiButton variant="ghost" size="icon" class="h-8 w-8" title="Download" @click="handleDownload(file)">
                  <Icon name="lucide:download" class="h-4 w-4" />
                </UiButton>
                <UiButton variant="ghost" size="icon" class="h-8 w-8 text-destructive hover:text-destructive" title="Delete" @click="confirmDelete(file)">
                  <Icon name="lucide:trash-2" class="h-4 w-4" />
                </UiButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Mobile Card View -->
      <div class="sm:hidden divide-y divide-border">
        <div 
          v-for="file in paginatedFiles" 
          :key="file.id" 
          class="p-4 hover:bg-muted/30 transition-colors"
        >
          <div class="flex items-start gap-3">
            <div :class="['h-12 w-12 rounded-lg flex items-center justify-center shrink-0', getIconColor(file.extension)]">
              <Icon :name="getFileIcon(file.extension)" class="h-6 w-6" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium truncate" :title="file.name">{{ file.name }}</p>
              <div class="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span class="px-1.5 py-0.5 rounded bg-muted font-medium">
                  {{ file.extension?.toUpperCase() || 'FILE' }}
                </span>
                <span>{{ formatBytes(file.size) }}</span>
                <span>•</span>
                <span>{{ formatDate(file.modified) }}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-end gap-2 mt-3 pt-3 border-t">
            <UiButton variant="outline" size="sm" @click="openShareModal(file)">
              <Icon name="lucide:share-2" class="h-4 w-4 mr-1" />
              Share
            </UiButton>
            <UiButton variant="outline" size="sm" @click="handleDownload(file)">
              <Icon name="lucide:download" class="h-4 w-4 mr-1" />
              Download
            </UiButton>
            <UiButton variant="outline" size="sm" class="text-destructive hover:text-destructive" @click="confirmDelete(file)">
              <Icon name="lucide:trash-2" class="h-4 w-4" />
            </UiButton>
          </div>
        </div>
      </div>
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
            <h3 class="font-semibold text-lg">Delete File</h3>
          </div>
          <p class="text-muted-foreground mb-6">
            Are you sure you want to delete <strong>{{ deleteTarget.name }}</strong>?
            <br><br>
            <span class="text-destructive text-sm">This action cannot be undone.</span>
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

    <!-- Share Modal -->
    <Teleport to="body">
      <div 
        v-if="shareTarget" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="shareTarget = null"
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
              <p class="text-xs text-muted-foreground">{{ formatBytes(shareTarget.size) }}</p>
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
              <UiButton variant="outline" class="flex-1" @click="shareTarget = null; shareResult = null">
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
              <UiButton variant="outline" class="flex-1" @click="shareTarget = null">
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
interface MyFile {
  id: string
  name: string
  path: string
  size: number
  modified: string
  extension: string | null
  accountId: string
}

const { authFetch } = useAuthFetch()
const { activeAccountId } = useAccounts()

// File input ref
const fileInput = ref<HTMLInputElement | null>(null)

// States
const searchQuery = ref('')
const sortBy = ref('modified')
const currentPage = ref(1)
const pageSize = 50

// Computed & Filtered Files
const sortedFiles = computed(() => {
  if (!files.value) return []
  
  let result = [...files.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(f => 
      f.name.toLowerCase().includes(query)
    )
  }

  // Sort
  if (sortBy.value === 'name') {
    result.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortBy.value === 'size') {
    result.sort((a, b) => b.size - a.size)
  } else {
    // Default: Newest first
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
watch([searchQuery, sortBy], () => {
  currentPage.value = 1
})

const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadingFileName = ref('')
const deleteTarget = ref<MyFile | null>(null)
const isDeleting = ref(false)

// Share states
const shareTarget = ref<MyFile | null>(null)
const shareResult = ref<{ url: string; expiresAt: string } | null>(null)
const isSharing = ref(false)
const copied = ref(false)

// Expiration options
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

// File list state
const files = ref<MyFile[]>([])
const pending = ref(true)
const error = ref<Error | null>(null)

// Fetch files function
const refresh = async () => {
  pending.value = true
  error.value = null
  try {
    const data = await authFetch<MyFile[]>('/api/my-files')
    files.value = data || []
  } catch (err: any) {
    console.error('Error fetching files:', err)
    error.value = err
  } finally {
    pending.value = false
  }
}

// Initial fetch on mount
onMounted(() => {
  refresh()
})

// Trigger file input
const triggerUpload = () => {
  fileInput.value?.click()
}

// Handle file selection
const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const selectedFiles = input.files
  
  if (!selectedFiles || selectedFiles.length === 0) return

  for (const file of Array.from(selectedFiles)) {
    await uploadSingleFile(file)
  }

  // Clear input
  input.value = ''
}

// Upload single file using the proper Dropbox upload flow with real progress
const uploadSingleFile = async (file: File) => {
  isUploading.value = true
  uploadingFileName.value = file.name
  uploadProgress.value = 0

  try {
    // 1. Get upload session with access token
    const session = await $fetch<{ accessToken: string; uploadPath: string; accountId: string }>('/api/dropbox/upload-session', {
      query: { path: '/Uploads', accountId: activeAccountId.value }
    })

    // 2. Upload to Dropbox using XMLHttpRequest for real progress
    const filePath = `/Uploads/${file.name}`
    
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          uploadProgress.value = Math.round((event.loaded / event.total) * 100)
        }
      })
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve()
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText)
            reject(new Error(errorData.error_summary || `Failed to upload ${file.name}`))
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        }
      })
      
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'))
      })
      
      xhr.open('POST', 'https://content.dropboxapi.com/2/files/upload')
      xhr.setRequestHeader('Authorization', `Bearer ${session.accessToken}`)
      xhr.setRequestHeader('Dropbox-API-Arg', JSON.stringify({
        path: filePath,
        mode: 'add',
        autorename: true,
        mute: false
      }))
      xhr.setRequestHeader('Content-Type', 'application/octet-stream')
      xhr.send(file)
    })

    // 3. Record upload in database
    await authFetch('/api/dropbox/record-upload', {
      method: 'POST',
      body: {
        filename: file.name,
        dropboxPath: filePath,
        size: file.size,
        contentType: file.type,
        dropboxAccountId: session.accountId || activeAccountId.value
      }
    })

    uploadProgress.value = 100

    // 5. Refresh file list
    await refresh()

    // Reset after delay
    setTimeout(() => {
      uploadProgress.value = 0
      uploadingFileName.value = ''
    }, 1000)
  } catch (err: any) {
    console.error('Upload failed:', err)
    alert('Upload failed: ' + (err.message || 'Unknown error'))
    uploadProgress.value = 0
    uploadingFileName.value = ''
  } finally {
    isUploading.value = false
  }
}

// Handle download
const handleDownload = async (file: MyFile) => {
  try {
    const { link } = await $fetch<{ link: string }>('/api/dropbox/download', {
      query: { path: file.path, accountId: file.accountId }
    })
    window.open(link, '_blank')
  } catch (err: any) {
    alert('Download failed: ' + err.message)
  }
}

// Confirm delete
const confirmDelete = (file: MyFile) => {
  deleteTarget.value = file
}

// Handle delete
const handleDelete = async () => {
  if (!deleteTarget.value) return

  isDeleting.value = true
  try {
    await authFetch('/api/dropbox/delete', {
      method: 'POST',
      body: {
        path: deleteTarget.value.path,
        accountId: deleteTarget.value.accountId
      }
    })

    deleteTarget.value = null
    await refresh()
  } catch (err: any) {
    alert('Delete failed: ' + (err.message || 'Unknown error'))
  } finally {
    isDeleting.value = false
  }
}

// Helpers
const formatBytes = (bytes: number | null): string => {
  if (!bytes || bytes === 0) return '-'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
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

// Share functions
const openShareModal = (file: MyFile) => {
  shareTarget.value = file
  shareResult.value = null
  copied.value = false
}

const handleShare = async () => {
  if (!shareTarget.value) return

  isSharing.value = true
  try {
    const result = await authFetch<{
      success: boolean
      share: {
        id: string
        url: string
        expiresAt: string
      }
    }>('/api/shares/create', {
      method: 'POST',
      body: {
        accountId: shareTarget.value.accountId,
        filePath: shareTarget.value.path,
        fileName: shareTarget.value.name,
        fileId: shareTarget.value.id,
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

const copyShareLink = async () => {
  if (!shareResult.value) return
  await navigator.clipboard.writeText(shareResult.value.url)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

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
</script>
