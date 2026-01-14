<template>
  <div class="h-full flex flex-col bg-background/50">
    <!-- Top Stats & Controls Bar (Clean & Integrated) -->
    <div class="sticky top-0 z-20 bg-background/95 backdrop-blur border-b px-6 py-4">
      <div class="w-full">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <!-- Stats Summary (Minimalist) -->
          <div class="flex items-center gap-6 text-sm">
            <div class="flex flex-col">
              <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Storage</span>
              <span class="font-medium text-foreground">{{ totalSizeFormatted }} Used</span>
            </div>
            <div class="w-px h-8 bg-border hidden md:block"></div>
            <div class="flex flex-col">
               <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Files</span>
               <span class="font-medium text-foreground">{{ files.length }} Items</span>
            </div>
            <div class="w-px h-8 bg-border hidden md:block"></div>
             <div class="flex flex-col">
               <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Shared</span>
               <span class="font-medium text-foreground">{{ activeSharesCount }} Active</span>
            </div>
          </div>

          <!-- Actions Toolbar -->
          <div class="flex items-center gap-3">
             <div class="relative group">
                <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search files..."
                  class="h-10 pl-9 pr-4 w-full md:w-64 rounded-full border bg-muted/20 hover:bg-muted/40 focus:bg-background focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
             </div>

             <div class="h-6 w-px bg-border mx-1"></div>

             <button 
                class="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                @click="viewMode = viewMode === 'list' ? 'grid' : 'list'"
                :title="viewMode === 'list' ? 'Switch to Grid' : 'Switch to List'"
             >
                <Icon :name="viewMode === 'list' ? 'lucide:layout-grid' : 'lucide:align-justify'" class="h-5 w-5" />
             </button>

             <NuxtLink to="/drive/upload">
               <button class="h-10 px-5 rounded-full bg-[#0061FE] hover:bg-[#0057E5] text-white font-medium text-sm shadow-sm transition-all hover:shadow-md flex items-center gap-2 active:scale-95">
                 <Icon name="lucide:upload" class="h-4 w-4" />
                 <span>Upload</span>
               </button>
             </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 overflow-auto px-4 md:px-6 py-6 transition-all">
       <div class="w-full h-full">

        <!-- Loading -->
        <div v-if="pending" class="h-full flex flex-col items-center justify-center text-muted-foreground">
          <Icon name="lucide:loader-2" class="animate-spin h-8 w-8 text-[#0061FE] mb-4" />
          <p class="text-sm">Loading your content...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="p-6 rounded-lg bg-red-50 text-red-600 border border-red-100 text-center mx-auto max-w-lg mt-10">
           <Icon name="lucide:alert-circle" class="h-8 w-8 mb-2 mx-auto" />
           <h3 class="font-medium">Failed to load files</h3>
           <p class="text-sm opacity-80 mt-1">{{ error.message }}</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="sortedFiles.length === 0" class="h-full flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in-95 duration-500">
          <div class="h-32 w-32 mb-6 opacity-30">
             <!-- Abstract Empty Illustration -->
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="w-full h-full text-blue-300">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                <polyline points="13 2 13 9 20 9"></polyline>
             </svg>
          </div>
          <h3 class="text-xl font-semibold text-[#1E1919] mb-2">{{ searchQuery ? 'No results found' : 'Your folder is empty' }}</h3>
          <p class="text-muted-foreground max-w-xs mb-8">
            {{ searchQuery ? 'Try adjusting your search terms.' : 'Drag and drop files here to upload, or use the upload button.' }}
          </p>
          <NuxtLink v-if="!searchQuery" to="/drive/upload">
            <button class="h-11 px-8 rounded-full bg-blue-50 text-[#0061FE] hover:bg-blue-100 font-medium transition-colors">
              Import Files
            </button>
          </NuxtLink>
        </div>

        <!-- List View (Dropbox Style) -->
        <div v-else-if="viewMode === 'list'" class="w-full">
           <table class="w-full text-left border-collapse">
              <thead class="sticky top-0 bg-background/95 backdrop-blur z-10">
                 <tr>
                    <th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-1/2 cursor-pointer hover:text-foreground group" @click="sortBy = 'name'">
                      Name
                      <Icon v-if="sortBy === 'name'" name="lucide:chevron-down" class="inline h-3 w-3 ml-1" />
                    </th>
                    <th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-32 hidden md:table-cell hover:bg-muted/50 cursor-pointer" @click="sortBy = 'size'">
                       Size
                       <Icon v-if="sortBy === 'size'" name="lucide:chevron-down" class="inline h-3 w-3 ml-1" />
                    </th>
                    <th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-40 hidden lg:table-cell hover:bg-muted/50 cursor-pointer" @click="sortBy = 'modified'">
                       Modified
                       <Icon v-if="sortBy === 'modified'" name="lucide:chevron-down" class="inline h-3 w-3 ml-1" />
                    </th>
                    <th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-32 hidden lg:table-cell">Members</th>
                    <th class="py-3 px-6 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-24">Running Actions</th>
                 </tr>
              </thead>
              <tbody class="divide-y divide-border/40">
                 <tr 
                    v-for="file in paginatedFiles" 
                    :key="file.id" 
                    class="group hover:bg-[#F7F9FA] dark:hover:bg-muted/20 transition-colors"
                 >
                    <td class="py-3 px-4">
                       <div class="flex items-center gap-4">
                          <!-- Minimalist Icon -->
                          <div class="relative shrink-0">
                             <Icon :name="getFileIcon(file.extension)" :class="['h-8 w-8', getIconColor(file.extension)]" />
                             <!-- Verified/Shared Badge -->
                             <span v-if="file.shareUrl" class="absolute -bottom-1 -right-1 block h-3 w-3 rounded-full bg-green-500 border-2 border-background ring-1 ring-green-100"></span>
                          </div>
                          <div class="min-w-0 pr-4">
                             <p class="font-medium text-sm text-[#1E1919] dark:text-foreground truncate cursor-pointer hover:text-[#0061FE] transition-colors" :title="file.name">
                                {{ file.name }}
                             </p>
                             <div class="flex items-center gap-2 mt-0.5 md:hidden">
                                <span class="text-xs text-muted-foreground">{{ formatBytes(file.size) }}</span>
                                <span class="text-xs text-muted-foreground">•</span>
                                <span class="text-xs text-muted-foreground">{{ formatDate(file.modified) }}</span>
                             </div>
                          </div>
                       </div>
                    </td>
                    <td class="py-3 px-4 text-sm text-[#52555A] hidden md:table-cell font-mono text-xs">
                       {{ formatBytes(file.size) }}
                    </td>
                    <td class="py-3 px-4 text-sm text-[#52555A] hidden lg:table-cell">
                       {{ formatDate(file.modified) }}
                    </td>
                    <td class="py-3 px-4 text-sm hidden lg:table-cell">
                       <div v-if="file.shareUrl" class="flex items-center gap-1.5 text-xs text-green-600 font-medium px-2 py-1 bg-green-50 rounded-full w-fit">
                          <Icon name="lucide:globe" class="h-3 w-3" />
                          <span>Link active</span>
                       </div>
                       <div v-else class="text-xs text-muted-foreground italic">Only you</div>
                    </td>
                    <td class="py-3 px-4 text-right">
                       <!-- Actions only show on hover (desktop) -->
                       <div class="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                             v-if="file.shareUrl"
                             @click="copyExistingLink(file)"
                             :title="copiedFileId === file.id ? 'Copied' : 'Copy link'"
                             class="h-8 w-8 flex items-center justify-center rounded hover:bg-white hover:text-green-600 hover:shadow-sm transition-all"
                             :class="copiedFileId === file.id ? 'text-green-600 bg-green-50' : 'text-muted-foreground'"
                          >
                             <Icon :name="copiedFileId === file.id ? 'lucide:check' : 'lucide:link'" class="h-4 w-4" />
                          </button>

                          <button 
                             @click="openShareModal(file)"
                             title="Share"
                             class="h-8 w-8 flex items-center justify-center rounded hover:bg-[#0061FE] hover:text-white hover:shadow-sm transition-all text-muted-foreground"
                          >
                             <Icon name="lucide:share-2" class="h-4 w-4" />
                          </button>
                          
                          <button 
                             @click="handleDownload(file)"
                             title="Download"
                             class="h-8 w-8 flex items-center justify-center rounded hover:bg-white hover:text-[#0061FE] hover:shadow-sm transition-all text-muted-foreground"
                          >
                             <Icon name="lucide:download" class="h-4 w-4" />
                          </button>
                       </div>
                    </td>
                 </tr>
              </tbody>
           </table>
        </div>

        <!-- Grid View -->
        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
           <!-- Card Items -->
           <div 
              v-for="file in paginatedFiles" 
              :key="file.id"
              class="group relative bg-card hover:bg-muted/30 border border-transparent hover:border-border/50 rounded-[10px] p-4 flex flex-col items-center text-center transition-all duration-200 cursor-pointer"
           >
              <!-- Absolute Checkbox/Selection (Visually) -->
              <div class="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div class="h-5 w-5 rounded border border-input bg-background flex items-center justify-center cursor-pointer">
                    <!-- Placeholder selection logic -->
                 </div>
              </div>

               <!-- Absolute Actions (Top Right) -->
              <div class="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                 <button v-if="file.shareUrl" @click.stop="copyExistingLink(file)" class="h-7 w-7 rounded bg-background shadow-sm border flex items-center justify-center hover:bg-green-50 text-green-600">
                    <Icon name="lucide:link" class="h-3.5 w-3.5" />
                 </button>
                  <button @click.stop="openShareModal(file)" class="h-7 w-7 rounded bg-background shadow-sm border flex items-center justify-center hover:bg-blue-50 text-blue-600">
                    <Icon name="lucide:share-2" class="h-3.5 w-3.5" />
                 </button>
              </div>

              <!-- Icon Preview -->
              <div class="h-24 w-full flex items-center justify-center mb-3">
                 <Icon :name="getFileIcon(file.extension)" :class="['h-16 w-16 drop-shadow-sm', getIconColor(file.extension)]" />
                 <span v-if="isVideoFile(file.extension)" class="absolute bottom-16 right-4 text-[10px] font-bold bg-black/70 text-white px-1.5 py-0.5 rounded">
                    {{ file.duration || 'VIDEO' }}
                 </span>
              </div>
              
              <!-- File Name -->
              <h4 class="font-medium text-sm text-[#1E1919] dark:text-foreground w-full truncate px-1" :title="file.name">
                 {{ file.name }}
              </h4>
              
              <!-- Meta -->
              <div class="text-xs text-[#52555A] mt-1 space-x-1">
                 <span>{{ file.extension?.toUpperCase() }}</span>
                 <span>•</span>
                 <span>{{ formatBytes(file.size) }}</span>
              </div>
           </div>
        </div>

        <!-- Pagination (Simple & Centered) -->
        <div v-if="totalPages > 1" class="flex justify-center mt-8 pb-8">
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

    <!-- Share Modal (Clean & Consistent) -->
    <Teleport to="body">
      <div 
        v-if="shareTarget" 
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1E1919]/60 backdrop-blur-[2px]"
        @click.self="closeShareModal"
      >
        <div class="bg-card w-full max-w-[480px] rounded-xl shadow-2xl border-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <!-- Modal Header -->
          <div class="px-6 py-5 border-b bg-background flex items-center justify-between">
             <h3 class="font-semibold text-lg text-[#1E1919] dark:text-foreground">Share details</h3>
             <button @click="closeShareModal" class="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors">
                <Icon name="lucide:x" class="h-5 w-5" />
             </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6">
            <!-- File Info Preview -->
            <div class="flex items-center gap-4 mb-6">
               <div class="h-10 w-10 flex items-center justify-center">
                  <Icon :name="getFileIcon(shareTarget.extension)" class="h-10 w-10" :class="getIconColor(shareTarget.extension)" />
               </div>
               <div class="min-w-0">
                  <h4 class="font-medium text-sm truncate">{{ shareTarget.name }}</h4>
                  <div class="flex text-xs text-muted-foreground gap-2">
                     <span>{{ formatBytes(shareTarget.size) }}</span>
                     <span>•</span>
                     <span>Last modified {{ formatDate(shareTarget.modified) }}</span>
                  </div>
               </div>
            </div>

            <!-- Share Result State -->
            <div v-if="shareResult" class="space-y-5">
               <div class="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg flex gap-3 border border-green-100 dark:border-green-800/30">
                  <div class="mt-0.5">
                     <Icon name="lucide:check-circle-2" class="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                     <p class="text-sm font-medium text-green-800 dark:text-green-300">Link created</p>
                     <p class="text-xs text-green-600 dark:text-green-400 mt-0.5">Anyone with this link can view this file.</p>
                  </div>
               </div>
               
               <div class="space-y-2">
                  <label class="text-xs font-bold uppercase text-muted-foreground tracking-wider">Link to file</label>
                  <div class="flex gap-2">
                     <div class="flex-1 relative">
                        <input 
                           type="text" 
                           :value="shareResult.url" 
                           readonly
                           class="w-full h-11 pl-3 pr-10 bg-muted/30 border rounded-md text-sm font-mono text-foreground focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
                        />
                     </div>
                     <button 
                        @click="copyShareLink"
                        class="h-11 px-6 rounded-md bg-[#0061FE] hover:bg-[#0057E5] text-white font-medium text-sm transition-colors flex items-center gap-2"
                     >
                        <Icon v-if="copied" name="lucide:check" class="h-4 w-4" />
                        <Icon v-else name="lucide:copy" class="h-4 w-4" />
                        {{ copied ? 'Copied' : 'Copy' }}
                     </button>
                  </div>
               </div>

               <div class="flex items-center justify-between pt-2">
                  <span class="text-xs text-muted-foreground">Expires: <span class="font-medium text-foreground">{{ formatExpiry(shareResult.expiresAt) }}</span></span>
                  <button @click="closeShareModal" class="text-sm text-muted-foreground hover:text-foreground hover:underline">Done</button>
               </div>
            </div>

            <!-- Create Share State -->
            <div v-else class="space-y-6">
              <div>
                 <label class="text-sm font-medium text-foreground mb-3 block">Link settings</label>
                 <div class="space-y-3">
                     <div class="flex items-center justify-between p-3 rounded-lg border hover:border-[#0061FE] cursor-pointer bg-card transition-colors">
                        <div class="flex items-center gap-3">
                           <div class="p-2 bg-blue-50 rounded-full text-blue-600">
                              <Icon name="lucide:clock" class="h-4 w-4" />
                           </div>
                           <div class="text-sm">
                              <p class="font-medium">Expiration</p>
                              <p class="text-xs text-muted-foreground">When should this link expire?</p>
                           </div>
                        </div>
                        <select 
                           v-model="selectedExpiration" 
                           class="bg-transparent text-sm font-medium text-right border-none focus:ring-0 cursor-pointer text-[#0061FE] outline-none"
                        >
                           <option v-for="opt in expirationOptions" :key="opt.label" :value="opt.days">
                              {{ opt.label }}
                           </option>
                        </select>
                     </div>
                 </div>
              </div>

               <button 
                  @click="handleShare"
                  :disabled="isSharing"
                  class="w-full h-12 rounded-lg bg-[#0061FE] hover:bg-[#0057E5] text-white font-semibold text-base shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
               >
                  <Icon v-if="isSharing" name="lucide:loader-2" class="h-5 w-5 animate-spin" />
                  <span v-else>Create Link</span>
               </button>
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
  shareId: string | null
  shareUrl: string | null
  duration?: string | null
}

// Get Supabase client for access token
const supabase = useSupabaseClient()

// Filters
const searchQuery = ref('')
const sortBy = ref('modified')
const viewMode = ref<'list' | 'grid'>('list')
const currentPage = ref(1)
const pageSize = 50

// Fetch user's files with auth header
const { data, pending, error, refresh } = await useFetch<FileEntry[]>('/api/my-files', {
  server: false,
  async onRequest({ options }) {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      const existingHeaders = (options.headers || {}) as any
      options.headers = {
        ...existingHeaders,
        Authorization: `Bearer ${session.access_token}`
      } as any
    }
  }
})

const files = computed(() => data.value || [])

// Stats computed
const totalSizeFormatted = computed(() => {
  const total = files.value.reduce((acc, file) => acc + file.size, 0)
  return formatBytes(total)
})

const activeSharesCount = computed(() => {
  return files.value.filter(f => f.shareUrl).length
})

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
watch([searchQuery, sortBy], () => {
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
    const { data: { session } } = await supabase.auth.getSession()
    const { link } = await $fetch<{ link: string }>('/api/dropbox/download', {
      query: { path: file.path, accountId: file.accountId },
      headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
    })
    window.open(link, '_blank')
  } catch (err: any) {
    alert('Download failed: ' + err.message)
  }
}

// Check if file is a video
const isVideoFile = (ext: string | null): boolean => {
  if (!ext) return false
  return ['mp4', 'mkv', 'avi', 'mov', 'webm', 'wmv', 'flv'].includes(ext.toLowerCase())
}

// Copy existing share link
const copiedFileId = ref<string | null>(null)
const copyExistingLink = async (file: FileEntry) => {
  if (!file.shareUrl) return
  const fullUrl = `${window.location.origin}${file.shareUrl}`
  await navigator.clipboard.writeText(fullUrl)
  copiedFileId.value = file.id
  setTimeout(() => copiedFileId.value = null, 2000)
}

// Share Modal State
const shareTarget = ref<FileEntry | null>(null)
const shareResult = ref<{ url: string; expiresAt: string | null } | null>(null)
const isSharing = ref(false)
const copied = ref(false)

// Expiration options
const expirationOptions = [
  { days: 1, label: '1 Day' },
  { days: 3, label: '3 Days' },
  { days: 7, label: '7 Days' },
  { days: 30, label: '1 Month' },
  { days: 90, label: '3 Months' },
  { days: 'never', label: 'Never' }
]
const selectedExpiration = ref<number | string>(7)

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
    const { data: { session } } = await supabase.auth.getSession()
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
        expirationDays: selectedExpiration.value === 'never' ? null : selectedExpiration.value,
        expirationUnit: 'days'
      },
      headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
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
</script>
