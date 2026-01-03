<template>
  <div class="min-h-screen bg-background flex flex-col">
    <!-- Header -->
    <header class="border-b bg-card">
      <div class="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition-opacity">
          <div class="bg-primary text-primary-foreground p-1.5 rounded-md">
            <Icon name="lucide:box" class="h-5 w-5" />
          </div>
          <span class="text-foreground">MultiBox</span>
        </NuxtLink>
        <div class="flex items-center gap-4">
        </div>
      </div>
    </header>

    <main class="flex-1 flex items-center justify-center p-4">
      <div class="w-full max-w-xl space-y-6">
        <!-- Title & Desc -->
        <div class="text-center space-y-2">
          <h1 class="text-3xl font-bold tracking-tight">Upload Files</h1>
          <p class="text-muted-foreground">Share files securely without an account. Max {{ formatBytes(MAX_TOTAL_SIZE) }} total.</p>
        </div>

        <!-- Upload Area -->
        <div 
          v-if="!uploadResult"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
          :class="[
            'relative border-2 border-dashed rounded-xl p-8 text-center transition-all bg-card',
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
          ]"
        >
          <!-- Uploading State -->
          <div v-if="isUploading" class="space-y-4">
            <div class="flex items-center justify-center gap-2 text-primary">
              <Icon name="lucide:loader-2" class="w-6 h-6 animate-spin" />
              <span class="text-lg font-medium">Uploading {{ fileQueue.length }} file{{ fileQueue.length > 1 ? 's' : '' }}...</span>
            </div>

            <!-- Overall Progress -->
            <div class="space-y-2">
              <div class="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div 
                  class="bg-primary h-full transition-all duration-300 ease-out"
                  :style="{ width: `${overallProgress}%` }"
                />
              </div>
              <div class="flex justify-between text-sm text-muted-foreground">
                <span>{{ completedFiles }} / {{ fileQueue.length }} files</span>
                <span class="font-mono">{{ overallProgress }}%</span>
              </div>
            </div>

            <!-- Per-file progress -->
            <div class="space-y-2 max-h-40 overflow-auto text-left">
              <div 
                v-for="(file, idx) in fileQueue" 
                :key="idx"
                class="flex items-center gap-3 text-sm p-2 rounded-md bg-muted/50"
              >
                <Icon 
                  :name="file.status === 'done' ? 'lucide:check-circle' : file.status === 'error' ? 'lucide:x-circle' : 'lucide:file'"
                  :class="[
                    'h-4 w-4 flex-shrink-0',
                    file.status === 'done' ? 'text-green-500' : file.status === 'error' ? 'text-destructive' : 'text-muted-foreground'
                  ]"
                />
                <span class="flex-1 truncate">{{ file.file.name }}</span>
                <span class="text-xs text-muted-foreground font-mono">
                  {{ file.status === 'uploading' ? `${file.progress}%` : file.status === 'done' ? '✓' : file.status === 'error' ? '✗' : 'Pending' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Ready State -->
          <div v-else class="space-y-4">
            <div class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Icon name="lucide:upload-cloud" class="h-8 w-8 text-muted-foreground" />
            </div>
            <div class="space-y-1">
              <p class="text-lg font-medium">Drop files here</p>
              <p class="text-sm text-muted-foreground">or click to browse (multiple files allowed)</p>
            </div>
            <input 
              type="file" 
              ref="fileInput"
              @change="handleFileSelect"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              multiple
            />
          </div>
        </div>

        <!-- Expiration Selection -->
        <div v-if="!uploadResult && !isUploading" class="text-center">
          <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Link Expires In</p>
          <div class="flex gap-2 justify-center flex-wrap">
            <button
              v-for="option in expirationOptions"
              :key="option.label"
              @click="selectedExpiration = option.days; selectedExpirationUnit = option.unit"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors border',
                (selectedExpiration === option.days && selectedExpirationUnit === option.unit)
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                  : 'bg-card hover:bg-muted border-input'
              ]"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- Upload Result -->
        <div v-if="uploadResult" class="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div class="p-6 text-center space-y-4">
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
              <Icon name="lucide:check" class="h-6 w-6" />
            </div>
            <div>
              <h2 class="text-lg font-semibold">Upload Complete</h2>
              <p class="text-sm text-muted-foreground mt-1">{{ uploadResult.fileCount }} file{{ uploadResult.fileCount > 1 ? 's' : '' }} uploaded</p>
            </div>

            <div class="space-y-2 pt-2">
              <label class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Share Link</label>
              <div class="flex gap-2">
                <input 
                  type="text" 
                  :value="uploadResult.url" 
                  readonly
                  class="flex-1 h-10 px-3 rounded-md border bg-muted/50 text-sm font-mono"
                />
                <button 
                  @click="copyUrl"
                  :class="[
                    'h-10 px-4 rounded-md font-medium transition-colors flex items-center gap-2 border',
                    copied 
                      ? 'bg-green-600 border-green-600 text-white hover:bg-green-700' 
                      : 'bg-background hover:bg-muted border-input'
                  ]"
                >
                  <Icon :name="copied ? 'lucide:check' : 'lucide:copy'" class="h-4 w-4" />
                  {{ copied ? 'Copied' : 'Copy' }}
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between text-sm pt-4 border-t">
              <span class="text-muted-foreground">Expires on</span>
              <span class="font-medium">{{ formatExpiry(uploadResult.expiresAt) }}</span>
            </div>
            
            <div class="pt-2">
              <UiButton 
                @click="resetUpload"
                variant="outline"
                class="w-full"
              >
                Upload More Files
              </UiButton>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="text-center text-xs text-muted-foreground">
          <p>&copy; {{ new Date().getFullYear() }} MultiBox. Secure & Anonymous.</p>
        </div>
      </div>

      <!-- Error Modal -->
      <Teleport to="body">
        <div v-if="errorMessage" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div class="bg-card w-full max-w-sm rounded-lg shadow-lg border p-6">
            <div class="flex items-center gap-4 mb-4 text-destructive">
              <div class="p-2 bg-destructive/10 rounded-full">
                <Icon name="lucide:alert-circle" class="h-6 w-6" />
              </div>
              <h3 class="font-semibold text-lg text-foreground">Error</h3>
            </div>
            <p class="text-muted-foreground mb-6">{{ errorMessage }}</p>
            <div class="flex justify-end">
              <button 
                @click="errorMessage = null"
                class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </main>
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
  { days: 1800, unit: 'seconds', label: '30 Min' },
  { days: 1, unit: 'days', label: '1 Day' },
  { days: 3, unit: 'days', label: '3 Days' },
  { days: 7, unit: 'days', label: '7 Days' },
  { days: 30, unit: 'days', label: '1 Month' },
  { days: 'never', unit: 'days', label: 'Never' }
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

// Sanitize filename for HTTP headers (replace non-ASCII characters)
const sanitizeFilename = (filename: string): string => {
  // Replace any character outside ISO-8859-1 range with underscore
  // This prevents "String contains non ISO-8859-1 code point" errors
  return filename.replace(/[^\x00-\xFF]/g, '_')
}

const formatExpiry = (date?: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
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
  // Validate total size
  const totalSize = files.reduce((sum, f) => sum + f.size, 0)
  if (totalSize > MAX_TOTAL_SIZE) {
    errorMessage.value = `Total size (${formatBytes(totalSize)}) exceeds limit of ${formatBytes(MAX_TOTAL_SIZE)}`
    return
  }

  // Initialize queue
  fileQueue.value = files.map(file => ({
    file,
    status: 'pending',
    progress: 0
  }))

  isUploading.value = true

  try {
    // Get session once for all files
    const session = await $fetch<{
      accessToken: string
      accountId: string
      accountName: string
      uploadPath: string
    }>('/api/anonymous/session', {
      params: { fileSize: totalSize }
    })

    // Create unique folder for this batch
    const batchFolder = `${session.uploadPath}/${Date.now()}_batch`

    // Upload files with concurrency limit
    const CHUNK_SIZE = 8 * 1024 * 1024 // 8MB
    const UPLOAD_THRESHOLD = 145 * 1024 * 1024 // 145MB

    const uploadFile = async (item: FileQueueItem, index: number) => {
      item.status = 'uploading'
      // Sanitize filename to prevent HTTP header encoding errors
      const safeFilename = sanitizeFilename(item.file.name)
      const filePath = `${batchFolder}/${safeFilename}`

      try {
        let actualPath = ''
        
        if (item.file.size > UPLOAD_THRESHOLD) {
          actualPath = await uploadChunked(item, session.accessToken, filePath)
        } else {
          actualPath = await uploadSimple(item, session.accessToken, filePath)
        }

        item.status = 'done'
        item.progress = 100
        item.path = actualPath
      } catch (err) {
        item.status = 'error'
        console.error(`Failed to upload ${item.file.name}:`, err)
      }
    }

    const uploadSimple = (item: FileQueueItem, accessToken: string, filePath: string): Promise<string> => {
      return new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            item.progress = Math.round((e.loaded / e.total) * 100)
          }
        }
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText)
              resolve(response.path_lower || response.path_display || filePath)
            } catch {
              resolve(filePath)
            }
          } else {
            let errorMsg = `Upload failed: ${xhr.status}`
            try {
              const errorResponse = JSON.parse(xhr.responseText)
              const errorSummary = errorResponse?.error_summary || errorResponse?.error?.['.tag']
              if (errorSummary) errorMsg = `Upload failed: ${errorSummary}`
              console.error('Dropbox upload error:', errorResponse)
            } catch {}
            reject(new Error(errorMsg))
          }
        }
        
        xhr.onerror = () => reject(new Error('Network error'))
        xhr.ontimeout = () => reject(new Error('Timeout'))
        
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

    const uploadChunked = async (item: FileQueueItem, accessToken: string, filePath: string): Promise<string> => {
      const totalSize = item.file.size
      let offset = 0
      let sessionId = ''
      let finalPath = filePath

      while (offset < totalSize) {
        const chunk = item.file.slice(offset, offset + CHUNK_SIZE)
        const isLast = offset + chunk.size >= totalSize
        
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const currentChunkProgress = e.loaded
              const totalUploaded = offset + currentChunkProgress
              item.progress = Math.round((totalUploaded / totalSize) * 100)
            }
          }

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText)
                if (offset === 0) sessionId = response.session_id
                
                // Capture final path from finish response
                if (isLast) {
                  finalPath = response.path_lower || response.path_display || filePath
                }
                
                resolve()
              } catch (e) {
                // If parsing fails but status is OK, resolve anyway (unless crucial)
                if (isLast) resolve() 
                else reject(new Error('Failed to parse session ID'))
              }
            } else {
              reject(new Error(`Chunk upload failed: ${xhr.status}`))
            }
          }
          
          xhr.onerror = () => reject(new Error('Network error'))

          if (offset === 0) {
            // Start session
            xhr.open('POST', 'https://content.dropboxapi.com/2/files/upload_session/start')
            xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`)
            xhr.setRequestHeader('Dropbox-API-Arg', JSON.stringify({
                close: false
            }))
            xhr.setRequestHeader('Content-Type', 'application/octet-stream')
          } else if (!isLast) {
            // Append
            xhr.open('POST', 'https://content.dropboxapi.com/2/files/upload_session/append_v2')
            xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`)
            xhr.setRequestHeader('Dropbox-API-Arg', JSON.stringify({
              cursor: {
                session_id: sessionId,
                offset: offset
              },
              close: false
            }))
            xhr.setRequestHeader('Content-Type', 'application/octet-stream')
          } else {
            // Finish
            xhr.open('POST', 'https://content.dropboxapi.com/2/files/upload_session/finish')
            xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`)
            xhr.setRequestHeader('Dropbox-API-Arg', JSON.stringify({
              cursor: {
                session_id: sessionId,
                offset: offset
              },
              commit: {
                path: filePath,
                mode: 'add',
                autorename: true,
                mute: false
              }
            }))
            xhr.setRequestHeader('Content-Type', 'application/octet-stream')
          }
          
          xhr.send(chunk)
        })

        offset += chunk.size
      }
      
      return finalPath
    }

    // Process with concurrency limit
    const queue = [...fileQueue.value]
    const workers: Promise<void>[] = []
    
    const processNext = async (): Promise<void> => {
      const item = queue.find(i => i.status === 'pending')
      if (!item) return
      
      const index = fileQueue.value.indexOf(item)
      await uploadFile(item, index)
      await processNext()
    }

    // Start up to MAX_CONCURRENT workers
    for (let i = 0; i < Math.min(MAX_CONCURRENT, queue.length); i++) {
      workers.push(processNext())
    }

    await Promise.all(workers)

    // Check if all succeeded
    const successfulFiles = fileQueue.value.filter(f => f.status === 'done')
    if (successfulFiles.length === 0) {
      throw new Error('All uploads failed')
    }

    // Create share with files array
    const shareResult = await $fetch<{
      success: boolean
      share: {
        id: string
        url: string
        fileCount: number
        expiresAt: string
      }
    }>('/api/anonymous/complete', {
      method: 'POST',
      body: {
        accountId: session.accountId,
        folderPath: batchFolder,
        files: successfulFiles.map(f => ({
          name: f.file.name,
          path: f.path,
          size: f.file.size
        })),
        expirationDays: selectedExpiration.value,
        expirationUnit: selectedExpirationUnit.value
      }
    })

    uploadResult.value = {
      url: shareResult.share.url,
      fileCount: successfulFiles.length,
      expiresAt: shareResult.share.expiresAt
    }

  } catch (err: any) {
    console.error('Upload error:', err)
    errorMessage.value = err.message || 'Upload failed'
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



