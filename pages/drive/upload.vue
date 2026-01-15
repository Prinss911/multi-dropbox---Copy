<template>
  <div class="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
    <!-- Ambient Background -->
    <div class="absolute inset-0 z-0 pointer-events-none">
       <div class="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#0061FE]/10 rounded-full blur-[100px]"></div>
       <div class="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]"></div>
    </div>

    <!-- Header -->
    <header class="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
        <NuxtLink to="/" class="flex items-center gap-2.5 font-semibold text-xl tracking-tight hover:opacity-80 transition-opacity">
          <div class="h-9 w-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Icon name="lucide:hard-drive" class="h-5 w-5" />
          </div>
          <span class="text-foreground">MultiBox</span>
        </NuxtLink>
    </header>

    <main class="w-full max-w-2xl px-4 relative z-10">
      
      <!-- Main Card -->
      <div class="bg-card/50 backdrop-blur-xl border shadow-xl rounded-2xl overflow-hidden transition-all duration-500">
        
        <!-- State 1: Ready to Upload -->
        <div v-if="!uploadResult && !isUploading" class="p-8 sm:p-12 animate-in fade-in zoom-in-95 duration-300">
           <div class="text-center space-y-3 mb-10">
             <h1 class="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
               Upload & Share
             </h1>
             <p class="text-muted-foreground text-lg">
               Secure anonymous file sharing.
             </p>
           </div>

           <!-- Modern Dropzone -->
           <div 
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
              :class="[
                'group relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer',
                isDragging 
                  ? 'border-[#0061FE] bg-[#0061FE]/5 scale-[1.02]' 
                  : 'border-muted-foreground/20 hover:border-[#0061FE]/50 hover:bg-muted/30'
              ]"
              @click="$refs.fileInput.click()"
           >
              <input 
                type="file" 
                ref="fileInput"
                @change="handleFileSelect"
                class="hidden"
                multiple
              />
              
              <div class="flex flex-col items-center gap-4 transition-transform duration-300 group-hover:-translate-y-1">
                 <div class="h-16 w-16 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-[#0061FE]">
                    <Icon name="lucide:cloud-upload" class="h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
                 </div>
                 <div class="space-y-1">
                    <p class="font-semibold text-lg">Click to browse or drag files here</p>
                    <p class="text-sm text-muted-foreground">Up to {{ formatBytes(MAX_TOTAL_SIZE) }} total</p>
                 </div>
              </div>
           </div>

           <!-- Expiration Config -->
           <div class="mt-10">
              <div class="flex items-center justify-center gap-2 mb-4">
                 <Icon name="lucide:clock" class="h-4 w-4 text-muted-foreground" />
                 <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Auto-Expire In</span>
              </div>
              <div class="flex flex-wrap justify-center gap-2">
                 <button
                    v-for="option in expirationOptions"
                    :key="option.label"
                    @click="selectedExpiration = option.days; selectedExpirationUnit = option.unit"
                    :class="[
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border',
                      (selectedExpiration === option.days && selectedExpirationUnit === option.unit)
                        ? 'bg-[#0061FE] text-white border-[#0061FE] shadow-md shadow-blue-500/20' 
                        : 'bg-background hover:bg-muted border-border hover:border-foreground/20 text-muted-foreground hover:text-foreground'
                    ]"
                  >
                    {{ option.label }}
                  </button>
              </div>
           </div>
        </div>

        <!-- State 2: Uploading -->
        <div v-else-if="isUploading" class="p-8 sm:p-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
           <div class="text-center mb-8">
              <div class="flex items-center justify-center gap-3 text-[#0061FE] mb-2">
                 <Icon name="lucide:loader-2" class="h-6 w-6 animate-spin" />
                 <span class="text-xl font-semibold">Uploading...</span>
              </div>
              <p class="text-muted-foreground">{{ completedFiles }} of {{ fileQueue.length }} files uploaded</p>
           </div>

           <!-- Master Progress -->
           <div class="bg-muted/50 rounded-full h-2 w-full overflow-hidden mb-8">
              <div 
                class="bg-[#0061FE] h-full transition-all duration-300 ease-out rounded-full"
                :style="{ width: `${overallProgress}%` }"
              ></div>
           </div>

           <!-- Detailed List -->
           <div class="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              <div 
                 v-for="(file, idx) in fileQueue" 
                 :key="idx"
                 class="flex items-center gap-4 p-3 rounded-xl bg-muted/30 border border-transparent"
                 :class="{ 'border-red-500/20 bg-red-500/5': file.status === 'error' }"
              >
                 <div class="h-10 w-10 rounded-lg bg-background flex items-center justify-center shrink-0 shadow-sm">
                    <Icon :name="getFileIcon(file.file.name)" class="h-5 w-5 text-muted-foreground" />
                 </div>
                 
                 <div class="flex-1 min-w-0">
                    <div class="flex justify-between mb-1">
                       <span class="font-medium text-sm truncate">{{ file.file.name }}</span>
                       <span class="text-xs font-mono text-muted-foreground ml-2 shrink-0">
                          {{ file.status === 'uploading' ? `${file.progress}%` : file.status === 'done' ? 'Done' : file.status === 'error' ? 'Failed' : 'Pending' }}
                       </span>
                    </div>
                    <!-- Mini progress -->
                    <div class="h-1 w-full bg-muted rounded-full overflow-hidden">
                       <div 
                          class="h-full transition-all duration-300"
                          :class="[
                             file.status === 'done' ? 'bg-green-500' : file.status === 'error' ? 'bg-red-500' : 'bg-[#0061FE]'
                          ]"
                          :style="{ width: `${file.progress}%` }"
                       ></div>
                    </div>
                 </div>

                 <div class="shrink-0">
                     <Icon v-if="file.status === 'done'" name="lucide:check-circle-2" class="h-5 w-5 text-green-500" />
                     <Icon v-else-if="file.status === 'error'" name="lucide:alert-circle" class="h-5 w-5 text-red-500" />
                     <div v-else class="h-5 w-5 rounded-full border-2 border-muted border-t-transparent animate-spin" v-show="file.status === 'uploading'"></div>
                 </div>
              </div>
           </div>
        </div>

        <!-- State 3: Success -->
        <div v-else-if="uploadResult" class="p-8 sm:p-12 text-center animate-in zoom-in-95 duration-500">
           <div class="w-20 h-20 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(34,197,94,0.3)] animate-bounce-slow">
              <Icon name="lucide:check" class="h-10 w-10" />
           </div>
           
           <h2 class="text-2xl font-bold mb-2">Upload Complete!</h2>
           <p class="text-muted-foreground mb-8">Your files are ready to share.</p>

           <div class="bg-muted/30 rounded-xl p-1 mb-8 border">
              <div class="flex items-center gap-2 p-3">
                 <div class="h-10 w-10 bg-background rounded-lg flex items-center justify-center text-[#0061FE] shrink-0 border">
                    <Icon name="lucide:link-2" class="h-5 w-5" />
                 </div>
                 <input 
                    type="text" 
                    :value="uploadResult.url" 
                    readonly
                    class="flex-1 bg-transparent border-none focus:ring-0 font-mono text-sm text-foreground overflow-ellipsis"
                    @click="$event.target.select()"
                 />
                 <button 
                    @click="copyUrl"
                    class="h-10 px-5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm"
                    :class="[
                      copied 
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                        : 'bg-[#0061FE] text-white hover:bg-[#0057E5] shadow-lg shadow-blue-500/20'
                    ]"
                  >
                    <Icon :name="copied ? 'lucide:check' : 'lucide:copy'" class="h-4 w-4" />
                    {{ copied ? 'Copied' : 'Copy' }}
                  </button>
              </div>
              <div class="px-4 py-2 border-t flex justify-between text-xs text-muted-foreground bg-muted/20">
                 <span>Expires: <span class="font-medium text-foreground">{{ formatExpiry(uploadResult.expiresAt) }}</span></span>
                 <span>{{ uploadResult.fileCount }} files</span>
              </div>
           </div>

           <button 
              @click="resetUpload"
              class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 mx-auto"
           >
              <Icon name="lucide:refresh-ccw" class="h-3 w-3" />
              Upload more files
           </button>
        </div>

      </div>

      <!-- Footer -->
      <p class="text-center text-xs text-muted-foreground mt-8 opacity-60">
        &copy; {{ new Date().getFullYear() }} MultiBox. Secure, fast, and anonymous file sharing.
      </p>

    </main>

    <!-- Error Modal (Teleport) -->
    <Teleport to="body">
      <div v-if="errorMessage" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div class="bg-card w-full max-w-sm rounded-xl shadow-2xl border p-6 animate-in zoom-in-95 duration-200">
          <div class="flex items-center gap-4 mb-4 text-red-500">
            <div class="p-2 bg-red-100 dark:bg-red-500/10 rounded-full">
              <Icon name="lucide:alert-triangle" class="h-6 w-6" />
            </div>
            <h3 class="font-semibold text-lg text-foreground">Upload Error</h3>
          </div>
          <p class="text-muted-foreground mb-6 text-sm leading-relaxed">{{ errorMessage }}</p>
          <div class="flex justify-end">
            <button 
              @click="errorMessage = null"
              class="px-4 py-2 bg-background border hover:bg-muted text-foreground rounded-lg text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const isUploading = ref(false)
const copied = ref(false)
const errorMessage = ref<string | null>(null)

const MAX_TOTAL_SIZE = 1024 * 1024 * 1024 // 1GB
const MAX_CONCURRENT = 5

const expirationOptions = [
  { days: 1800, unit: 'seconds', label: '30m' },
  { days: 1, unit: 'days', label: '1d' },
  { days: 3, unit: 'days', label: '3d' },
  { days: 7, unit: 'days', label: '7d' },
  { days: 30, unit: 'days', label: '1mo' },
]
const selectedExpiration = ref<number | string>(7)
const selectedExpirationUnit = ref('days')

interface FileQueueItem {
  file: File
  status: 'pending' | 'uploading' | 'done' | 'error'
  progress: number
  path?: string
}

interface UploadResult {
  url: string
  fileCount: number
  expiresAt: string
}

const fileQueue = ref<FileQueueItem[]>([])
const uploadResult = ref<UploadResult | null>(null)

const completedFiles = computed(() => fileQueue.value.filter(f => f.status === 'done').length)
const overallProgress = computed(() => {
  if (fileQueue.value.length === 0) return 0
  const total = fileQueue.value.reduce((sum, f) => sum + f.progress, 0)
  return Math.round(total / fileQueue.value.length)
})

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Simple logic to guess icon based on name
const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    if (['png','jpg','jpeg','gif','webp'].includes(ext || '')) return 'lucide:image'
    if (['pdf'].includes(ext || '')) return 'lucide:file-text'
    if (['mp4','mov','avi','mkv'].includes(ext || '')) return 'lucide:video'
    if (['zip','rar','7z'].includes(ext || '')) return 'lucide:archive'
    if (['mp3','wav'].includes(ext || '')) return 'lucide:music'
    return 'lucide:file'
}

const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^\x00-\xFF]/g, '_')
}

const formatExpiry = (date?: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleDrop = async (e: DragEvent) => {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files?.length) {
    await processFiles(Array.from(files))
  }
}

const handleFileSelect = async (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files?.length) {
    await processFiles(Array.from(input.files))
  }
}

const processFiles = async (files: File[]) => {
  const totalSize = files.reduce((sum, f) => sum + f.size, 0)
  if (totalSize > MAX_TOTAL_SIZE) {
    errorMessage.value = `Total size (${formatBytes(totalSize)}) exceeds limit of ${formatBytes(MAX_TOTAL_SIZE)}`
    return
  }

  fileQueue.value = files.map(file => ({
    file,
    status: 'pending',
    progress: 0
  }))

  isUploading.value = true

  try {
    // Step 1: Get smart allocation from server
    const allocationResult = await $fetch<{
      success: boolean
      allocations: Array<{
        index: number
        name: string
        size: number
        accountId: string
        accountName: string
        accessToken: string
      }>
      summary: {
        totalFiles: number
        accountsUsed: number
        distribution: Record<string, number>
      }
    }>('/api/upload/allocate', {
      method: 'POST',
      body: {
        files: files.map((f, i) => ({
          index: i,
          name: f.name,
          size: f.size
        }))
      }
    })

    console.log(`[Upload] Allocated to ${allocationResult.summary.accountsUsed} accounts:`, allocationResult.summary.distribution)

    // Step 2: Group allocations by account
    const byAccount = new Map<string, {
      accountId: string
      accountName: string
      accessToken: string
      files: Array<{ index: number; file: File }>
    }>()

    allocationResult.allocations.forEach(alloc => {
      if (!byAccount.has(alloc.accountId)) {
        byAccount.set(alloc.accountId, {
          accountId: alloc.accountId,
          accountName: alloc.accountName,
          accessToken: alloc.accessToken,
          files: []
        })
      }
      byAccount.get(alloc.accountId)!.files.push({
        index: alloc.index,
        file: files[alloc.index]
      })
    })

    // Step 3: Upload files grouped by account
    const CHUNK_SIZE = 8 * 1024 * 1024
    const UPLOAD_THRESHOLD = 145 * 1024 * 1024

    // Track uploaded files with their account info
    interface UploadedFile {
      name: string
      path: string
      size: number
      accountId: string
      accountName: string
    }
    const uploadedFiles: UploadedFile[] = []

    // Process each account group
    for (const [accountId, group] of byAccount) {
      const { accessToken, accountName } = group
      const batchFolder = `/Uploads/${Date.now()}_batch_${accountId.substring(0, 8)}`
      console.log(`[Upload] Uploading ${group.files.length} files to ${accountName}...`)

      // Upload each file in this group
      for (const { index, file } of group.files) {
        const item = fileQueue.value[index]
        item.status = 'uploading'
        const safeFilename = sanitizeFilename(file.name)
        const filePath = `${batchFolder}/${safeFilename}`

        try {
          let actualPath = ''
          if (file.size > UPLOAD_THRESHOLD) {
            actualPath = await uploadChunked(item, accessToken, filePath, CHUNK_SIZE)
          } else {
            actualPath = await uploadSimple(item, accessToken, filePath)
          }
          item.status = 'done'
          item.progress = 100
          item.path = actualPath

          uploadedFiles.push({
            name: file.name,
            path: actualPath,
            size: file.size,
            accountId,
            accountName
          })
        } catch (err) {
          item.status = 'error'
          console.error(`Failed to upload ${file.name}:`, err)
        }
      }
    }

    // Helper: Simple upload
    async function uploadSimple(item: FileQueueItem, accessToken: string, filePath: string): Promise<string> {
      return new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) item.progress = Math.round((e.loaded / e.total) * 100)
        }
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText)
              resolve(response.path_lower || response.path_display || filePath)
            } catch { resolve(filePath) }
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`))
          }
        }
        xhr.onerror = () => reject(new Error('Network error'))
        xhr.open('POST', 'https://content.dropboxapi.com/2/files/upload')
        xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`)
        xhr.setRequestHeader('Dropbox-API-Arg', JSON.stringify({
          path: filePath,
          mode: 'add',
          autorename: true,
          mute: false
        }))
        xhr.setRequestHeader('Content-Type', 'application/octet-stream')
        xhr.send(item.file)
      })
    }

    // Helper: Chunked upload
    async function uploadChunked(item: FileQueueItem, accessToken: string, filePath: string, chunkSize: number): Promise<string> {
      const totalSize = item.file.size
      let offset = 0
      let sessionId = ''
      let finalPath = filePath

      while (offset < totalSize) {
        const chunk = item.file.slice(offset, offset + chunkSize)
        const isLast = offset + chunk.size >= totalSize

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const totalUploaded = offset + e.loaded
              item.progress = Math.round((totalUploaded / totalSize) * 100)
            }
          }

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText)
                if (offset === 0) sessionId = response.session_id
                if (isLast) finalPath = response.path_lower || response.path_display || filePath
                resolve()
              } catch (e) {
                if (isLast) resolve()
                else reject(new Error('Failed to parse session ID'))
              }
            } else {
              reject(new Error(`Chunk upload failed: ${xhr.status}`))
            }
          }
          xhr.onerror = () => reject(new Error('Network error'))

          if (offset === 0) {
            xhr.open('POST', 'https://content.dropboxapi.com/2/files/upload_session/start')
            xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`)
            xhr.setRequestHeader('Dropbox-API-Arg', JSON.stringify({ close: false }))
            xhr.setRequestHeader('Content-Type', 'application/octet-stream')
          } else if (!isLast) {
            xhr.open('POST', 'https://content.dropboxapi.com/2/files/upload_session/append_v2')
            xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`)
            xhr.setRequestHeader('Dropbox-API-Arg', JSON.stringify({
              cursor: { session_id: sessionId, offset: offset },
              close: false
            }))
            xhr.setRequestHeader('Content-Type', 'application/octet-stream')
          } else {
            xhr.open('POST', 'https://content.dropboxapi.com/2/files/upload_session/finish')
            xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`)
            xhr.setRequestHeader('Dropbox-API-Arg', JSON.stringify({
              cursor: { session_id: sessionId, offset: offset },
              commit: { path: filePath, mode: 'add', autorename: true, mute: false }
            }))
            xhr.setRequestHeader('Content-Type', 'application/octet-stream')
          }
          xhr.send(chunk)
        })
        offset += chunk.size
      }
      return finalPath
    }

    // Step 4: Create share(s)
    if (uploadedFiles.length === 0) throw new Error('All uploads failed')

    // Group by account for share creation
    const sharesByAccount = new Map<string, UploadedFile[]>()
    uploadedFiles.forEach(f => {
      if (!sharesByAccount.has(f.accountId)) {
        sharesByAccount.set(f.accountId, [])
      }
      sharesByAccount.get(f.accountId)!.push(f)
    })

    // Create a share for the first account (primary share)
    // Note: For multi-account uploads, files are tracked per-account in database
    const firstAccountId = uploadedFiles[0].accountId
    const firstAccountFiles = sharesByAccount.get(firstAccountId)!

    const shareResult = await $fetch<{
      success: boolean
      share: { id: string, url: string, fileCount: number, expiresAt: string }
    }>('/api/anonymous/complete', {
      method: 'POST',
      body: {
        accountId: firstAccountId,
        folderPath: `/Uploads/${Date.now()}_batch`,
        files: uploadedFiles.map(f => ({ 
          name: f.name, 
          path: f.path, 
          size: f.size,
          accountId: f.accountId 
        })),
        expirationDays: selectedExpiration.value,
        expirationUnit: selectedExpirationUnit.value
      }
    })

    uploadResult.value = {
      url: shareResult.share.url,
      fileCount: uploadedFiles.length,
      expiresAt: shareResult.share.expiresAt
    }

  } catch (err: any) {
    console.error('Upload error:', err)
    errorMessage.value = err.data?.statusMessage || err.message || 'Upload failed'
  } finally {
    isUploading.value = false
  }
}

const copyUrl = async () => {
  if (!uploadResult.value) return
  await navigator.clipboard.writeText(uploadResult.value.url)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

const resetUpload = () => {
  uploadResult.value = null
  fileQueue.value = []
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}

.animate-pulse-slow {
    animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-bounce-slow {
    animation: bounce 2s infinite;
}
</style>



