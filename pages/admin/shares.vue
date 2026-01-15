<template>
  <div class="h-full flex flex-col bg-background/50">
    <!-- Sticky Header & Controls -->
    <div class="sticky top-0 z-20 bg-background/95 backdrop-blur border-b px-6 py-4">
      <div class="w-full">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
             <h1 class="text-xl font-semibold text-[#1E1919] dark:text-foreground">Shared Links</h1>
             <p class="text-sm text-muted-foreground">
               {{ selectedIds.size > 0 ? `${selectedIds.size} selected` : `${total} active links across all accounts` }}
             </p>
           </div>
           
           <!-- Toolbar -->
           <div class="flex flex-wrap items-center gap-3">
              <!-- Search -->
              <div class="relative group">
                <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search links..."
                  class="h-10 pl-9 pr-4 w-full md:w-64 rounded-full border bg-muted/20 hover:bg-muted/40 focus:bg-background focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>

              <div class="h-6 w-px bg-border mx-1 hidden md:block"></div>

              <!-- Filter Account -->
              <div class="relative">
                 <select 
                  v-model="filterAccount" 
                  class="h-10 pl-3 pr-8 rounded-full border bg-muted/20 hover:bg-muted/40 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none cursor-pointer min-w-[140px]"
                >
                  <option value="">All Accounts</option>
                  <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
                    {{ acc.name }}
                  </option>
                </select>
                <Icon name="lucide:chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>

               <!-- Filter Status -->
              <div class="relative">
                 <select 
                  v-model="filterStatus" 
                  class="h-10 pl-3 pr-8 rounded-full border bg-muted/20 hover:bg-muted/40 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none cursor-pointer"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="never">Never Expires</option>
                </select>
                <Icon name="lucide:filter" class="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
              </div>

              <button 
                @click="() => refresh()" 
                :disabled="pending"
                class="h-10 w-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground"
              >
                <Icon :name="pending ? 'lucide:loader-2' : 'lucide:refresh-cw'" :class="{ 'animate-spin': pending }" class="h-4 w-4" />
              </button>
           </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-auto px-4 md:px-6 py-6 transition-all">
       <div class="w-full h-full">

        <!-- Floating Bulk Action Bar -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-200 ease-in"
          enter-from-class="opacity-0 translate-y-4"
          leave-to-class="opacity-0 translate-y-4"
        >
          <div 
            v-if="selectedIds.size > 0" 
            class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-[#1E1919] dark:bg-card rounded-full shadow-2xl border dark:border-border"
          >
            <!-- Selection Count -->
            <div class="flex items-center gap-2 text-white dark:text-foreground">
              <div class="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                {{ selectedIds.size }}
              </div>
              <span class="text-sm font-medium">selected</span>
            </div>

            <div class="w-px h-6 bg-white/20 dark:bg-border"></div>

            <!-- Bulk Actions -->
            <button 
              @click="handleBulkCopyLinks"
              class="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
            >
              <Icon name="lucide:copy" class="h-4 w-4" />
              <span class="hidden sm:inline">Copy Links</span>
            </button>

            <button 
              @click="showBulkDeleteModal = true"
              :disabled="isBulkDeleting"
              class="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Icon v-if="isBulkDeleting" name="lucide:loader-2" class="h-4 w-4 animate-spin" />
              <Icon v-else name="lucide:trash-2" class="h-4 w-4" />
              <span class="hidden sm:inline">Delete</span>
            </button>

            <div class="w-px h-6 bg-white/20 dark:bg-border"></div>

            <!-- Clear Selection -->
            <button 
              @click="clearSelection"
              class="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              title="Clear selection"
            >
              <Icon name="lucide:x" class="h-4 w-4" />
            </button>
          </div>
        </Transition>

        <!-- Loading -->
        <div v-if="pending" class="h-full flex flex-col items-center justify-center text-muted-foreground">
          <Icon name="lucide:loader-2" class="animate-spin h-8 w-8 text-[#0061FE] mb-4" />
          <p class="text-sm">Loading share links...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="p-6 rounded-lg bg-red-50 text-red-600 border border-red-100 text-center mx-auto max-w-lg mt-10">
           <Icon name="lucide:alert-circle" class="h-8 w-8 mb-2 mx-auto" />
           <h3 class="font-medium">Failed to load shares</h3>
           <p class="text-sm opacity-80 mt-1">{{ error.message }}</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredShares.length === 0" class="h-full flex flex-col items-center justify-center p-12 text-center">
          <div class="h-24 w-24 mb-4 flex items-center justify-center rounded-full bg-muted/30 text-muted-foreground">
             <Icon name="lucide:link-2-off" class="h-10 w-10 opacity-50" />
          </div>
          <h3 class="text-lg font-semibold text-[#1E1919] dark:text-foreground mb-2">No share links found</h3>
          <p class="text-muted-foreground text-sm max-w-xs">
            {{ searchQuery || filterAccount || filterStatus ? 'Try adjusting your filters.' : 'You haven\'t created any share links yet.' }}
          </p>
           <button 
            v-if="searchQuery || filterAccount || filterStatus"
            @click="searchQuery = ''; filterAccount = ''; filterStatus = ''"
            class="mt-4 text-[#0061FE] text-sm hover:underline"
          >
            Clear all filters
          </button>
        </div>

        <!-- Shares Table -->
        <div v-else class="w-full pb-8">
           <table class="w-full text-left border-collapse">
            <thead class="sticky top-0 bg-background/95 backdrop-blur z-10">
              <tr>
                <th class="py-3 px-2 border-b w-10">
                   <input 
                     type="checkbox"
                     :checked="isAllSelected"
                     :indeterminate="isPartiallySelected"
                     @change="toggleSelectAll"
                     class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                   />
                </th>
                <th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-[35%]">File Info</th>
                <th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-32 hidden sm:table-cell">Account</th>
                <th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b hidden md:table-cell">Created</th>
                <th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">Status / Expires</th>
                <th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-24 hidden lg:table-cell">Downloads</th>
                <th class="py-3 px-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-28">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border/40">
              <tr v-for="share in paginatedShares" :key="share.id" class="group hover:bg-[#F7F9FA] dark:hover:bg-muted/20 transition-colors" :class="{ 'bg-blue-50 dark:bg-blue-500/10': selectedIds.has(share.id) }">
                <td class="py-3 px-2">
                   <input 
                     type="checkbox"
                     :checked="selectedIds.has(share.id)"
                     @change="toggleSelect(share.id)"
                     class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                   />
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-4">
                    <div class="relative shrink-0">
                       <Icon :name="getFileIcon(getExtension(share.fileName))" :class="['h-8 w-8', getIconColor(getExtension(share.fileName))]" />
                    </div>
                    <div class="min-w-0">
                      <p class="font-medium text-sm text-[#1E1919] dark:text-foreground truncate" :title="share.fileName">{{ share.fileName }}</p>
                      <p class="text-xs text-muted-foreground font-mono truncate opacity-60 mt-0.5">ID: {{ share.id.substring(0, 8) }}...</p>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-4 hidden sm:table-cell">
                   <span 
                       class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium"
                       :style="{ 
                          backgroundColor: getAccountColor(share.accountId) + '15', 
                          color: getAccountColor(share.accountId)
                       }"
                    >
                       <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: getAccountColor(share.accountId) }"></span>
                       {{ share.accountName }}
                    </span>
                </td>
                <td class="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">
                  {{ formatDate(share.createdAt) }}
                </td>
                <td class="py-3 px-4">
                   <span 
                      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary"
                      :class="getExpiryClass(share.expiresAt)"
                   >
                      <span class="h-1.5 w-1.5 rounded-full bg-current opacity-60"></span>
                      {{ formatExpiry(share.expiresAt) }}
                   </span>
                </td>
                <td class="py-3 px-4 text-sm hidden lg:table-cell text-muted-foreground">
                  <div class="flex items-center gap-1.5">
                    <Icon name="lucide:download" class="h-3 w-3 opacity-50" />
                    <span class="font-mono">{{ share.downloadCount }}</span>
                  </div>
                </td>
                <td class="py-3 px-4 text-right">
                  <div class="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      @click="() => openShare(share)"
                      title="Open Link"
                      class="h-8 w-8 flex items-center justify-center rounded hover:bg-white hover:text-[#0061FE] hover:shadow-sm transition-all text-muted-foreground"
                    >
                      <Icon name="lucide:external-link" class="h-4 w-4" />
                    </button>
                    <button 
                      @click="() => copyLink(share)"
                      title="Copy Link"
                      class="h-8 w-8 flex items-center justify-center rounded hover:bg-white hover:text-green-600 hover:shadow-sm transition-all text-muted-foreground"
                    >
                      <Icon :name="copiedId === share.id ? 'lucide:check' : 'lucide:copy'" class="h-4 w-4" />
                    </button>
                    <button 
                      @click="() => confirmDelete(share)"
                      title="Delete Link"
                      class="h-8 w-8 flex items-center justify-center rounded hover:bg-white hover:text-red-600 hover:shadow-sm transition-all text-muted-foreground"
                    >
                      <Icon name="lucide:trash-2" class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center mt-4 pb-8">
           <div class="flex items-center gap-1 bg-muted/30 p-1 rounded-full">
              <button 
                 @click="currentPage--"
                 :disabled="currentPage === 1"
                 class="h-8 w-8 flex items-center justify-center rounded-full hover:bg-background disabled:opacity-50 transition-all text-muted-foreground"
              >
                 <Icon name="lucide:chevron-left" class="h-4 w-4" />
              </button>
              <div class="px-4 text-xs font-medium text-muted-foreground">
                 Page {{ currentPage }} of {{ totalPages }}
              </div>
              <button 
                 @click="currentPage++"
                 :disabled="currentPage === totalPages"
                 class="h-8 w-8 flex items-center justify-center rounded-full hover:bg-background disabled:opacity-50 transition-all text-muted-foreground"
              >
                 <Icon name="lucide:chevron-right" class="h-4 w-4" />
              </button>
           </div>
        </div>

       </div>
    </div>

    <!-- Delete Confirmation Modal (Clean) -->
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
                 <h3 class="text-lg font-semibold text-[#1E1919] dark:text-foreground">Delete Share Link?</h3>
                 <p class="text-sm text-muted-foreground mt-2 px-4">
                    This will permanently remove the share link for <br>
                    <span class="font-medium text-foreground">{{ deleteTarget.fileName }}</span>.
                 </p>
                 <p class="text-xs text-red-500/80 mt-2 font-medium">This action cannot be undone.</p>
              </div>
              
              <div class="flex gap-3 w-full mt-2">
                 <button 
                    @click="deleteTarget = null"
                    class="flex-1 h-10 rounded-lg border hover:bg-muted transition-colors text-sm font-medium"
                 >
                    Cancel
                 </button>
                 <button 
                    @click="handleDelete"
                    :disabled="isDeleting"
                    class="flex-1 h-10 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-70"
                 >
                    <Icon v-if="isDeleting" name="lucide:loader-2" class="h-4 w-4 animate-spin" />
                    {{ isDeleting ? 'Deleting...' : 'Delete' }}
                 </button>
              </div>
           </div>
        </div>
      </div>
    </Teleport>
    
    <!-- Bulk Delete Confirmation Modal -->
    <Teleport to="body">
      <div 
        v-if="showBulkDeleteModal" 
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1E1919]/60 backdrop-blur-[2px]"
        @click.self="showBulkDeleteModal = false"
      >
        <div class="bg-card w-full max-w-[400px] rounded-xl shadow-2xl border-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6">
           <div class="flex flex-col items-center text-center gap-4">
              <div class="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-2">
                 <Icon name="lucide:trash-2" class="h-6 w-6" />
              </div>
              <div>
                 <h3 class="text-lg font-semibold text-[#1E1919] dark:text-foreground">Delete {{ selectedIds.size }} Share Links?</h3>
                 <p class="text-sm text-muted-foreground mt-2 px-4">
                    This will permanently remove all selected share links. The original files will not be deleted.
                 </p>
                 <p class="text-xs text-red-500/80 mt-2 font-medium">This action cannot be undone.</p>
              </div>
              
              <div class="flex gap-3 w-full mt-2">
                 <button 
                    @click="showBulkDeleteModal = false"
                    class="flex-1 h-10 rounded-lg border hover:bg-muted transition-colors text-sm font-medium"
                 >
                    Cancel
                 </button>
                 <button 
                    @click="handleBulkDelete"
                    :disabled="isBulkDeleting"
                    class="flex-1 h-10 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-70"
                 >
                    <Icon v-if="isBulkDeleting" name="lucide:loader-2" class="h-4 w-4 animate-spin" />
                    {{ isBulkDeleting ? 'Deleting...' : 'Delete All' }}
                 </button>
              </div>
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

// Bulk selection state
const selectedIds = ref<Set<string>>(new Set())
const showBulkDeleteModal = ref(false)
const isBulkDeleting = ref(false)

// Selection helpers
const isAllSelected = computed(() => {
  return paginatedShares.value.length > 0 && paginatedShares.value.every(s => selectedIds.value.has(s.id))
})

const isPartiallySelected = computed(() => {
  const selectedCount = paginatedShares.value.filter(s => selectedIds.value.has(s.id)).length
  return selectedCount > 0 && selectedCount < paginatedShares.value.length
})

const toggleSelect = (id: string) => {
  const newSet = new Set(selectedIds.value)
  if (newSet.has(id)) {
    newSet.delete(id)
  } else {
    newSet.add(id)
  }
  selectedIds.value = newSet
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // Deselect all on current page
    const newSet = new Set(selectedIds.value)
    paginatedShares.value.forEach(s => newSet.delete(s.id))
    selectedIds.value = newSet
  } else {
    // Select all on current page
    const newSet = new Set(selectedIds.value)
    paginatedShares.value.forEach(s => newSet.add(s.id))
    selectedIds.value = newSet
  }
}

const clearSelection = () => {
  selectedIds.value = new Set()
}

// Bulk copy links
const handleBulkCopyLinks = async () => {
  const selectedShares = shares.value.filter(s => selectedIds.value.has(s.id))
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const urls = selectedShares.map(s => `${baseUrl}/file/${s.id}`).join('\n')
  
  try {
    await navigator.clipboard.writeText(urls)
    alert(`${selectedShares.length} link(s) copied to clipboard!`)
  } catch (err) {
    console.error('Failed to copy links:', err)
    alert('Failed to copy links to clipboard')
  }
}

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
  if (!expiresAt) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
  
  const expiry = new Date(expiresAt)
  const now = new Date()
  
  if (expiry <= now) return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
  
  const diff = expiry.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days < 3) return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
  return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
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
    pdf: 'text-red-600',
    doc: 'text-blue-600',
    docx: 'text-blue-600',
    mp4: 'text-pink-600',
    mkv: 'text-pink-600',
    jpg: 'text-purple-600',
    png: 'text-purple-600',
  }
  return colorMap[ext] || 'text-gray-600'
}

const accountColors = ['#0061FE', '#0070E0', '#007EE5', '#248CF2', '#4D9BF7', '#76ABFC']
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
  if (typeof window !== 'undefined') {
    window.open(getShareUrl(share), '_blank')
  }
}

const copyLink = async (share: ShareLink) => {
  if (typeof window !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(getShareUrl(share))
    copiedId.value = share.id
    setTimeout(() => copiedId.value = null, 2000)
  }
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

const handleBulkDelete = async () => {
  if (selectedIds.value.size === 0) return
  
  isBulkDeleting.value = true
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const headers = session?.access_token ? {
      'Authorization': `Bearer ${session.access_token}`
    } : {}

    // Delete all selected shares in parallel (with limit to avoid overwhelming)
    const idsToDelete = Array.from(selectedIds.value)
    const batchSize = 10
    
    for (let i = 0; i < idsToDelete.length; i += batchSize) {
      const batch = idsToDelete.slice(i, i + batchSize)
      await Promise.all(
        batch.map(id => 
          $fetch(`/api/shares/${id}`, { method: 'DELETE', headers }).catch(err => {
            console.error(`Failed to delete ${id}:`, err)
          })
        )
      )
    }

    // Clear selection and refresh
    selectedIds.value = new Set()
    showBulkDeleteModal.value = false
    await refresh()
  } catch (err: any) {
    alert('Bulk delete failed: ' + (err.message || 'Unknown error'))
  } finally {
    isBulkDeleting.value = false
  }
}
</script>
