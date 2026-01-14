<template>
  <div class="min-h-screen bg-background flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-4xl">
      <!-- Loading -->
      <div v-if="isLoading" class="bg-card border rounded-xl p-8 text-center shadow-sm">
        <div class="relative w-12 h-12 mx-auto mb-4">
           <Icon name="lucide:loader-2" class="w-12 h-12 text-primary animate-spin" />
        </div>
        <p class="text-muted-foreground">Loading file info...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-card border rounded-xl p-8 text-center shadow-sm">
        <div class="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="lucide:x-circle" class="h-8 w-8 text-destructive" />
        </div>
        <h1 class="text-xl font-bold text-foreground mb-2">Link Not Available</h1>
        <p class="text-muted-foreground mb-6">{{ error }}</p>
        <NuxtLink to="/" class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
          <Icon name="lucide:home" class="h-4 w-4 mr-2" />
          Go to Home
        </NuxtLink>
      </div>

      <!-- File Info -->
      <div v-else-if="fileInfo" class="bg-card border rounded-xl shadow-sm overflow-hidden">
        <!-- Header -->
        <div class="bg-primary/5 border-b p-6 text-center">
          <div class="w-16 h-16 bg-background border rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Icon :name="isBatch ? 'lucide:folder' : 'lucide:file-text'" class="h-8 w-8 text-primary" />
          </div>
          <h1 class="text-lg font-bold text-foreground">{{ fileInfo.fileName }}</h1>
          <p class="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
            {{ isBatch ? `${files.length} Files` : 'Shared File' }}
          </p>
        </div>

        <!-- Content -->
        <div class="p-4 space-y-4">
          <!-- Expiry & Download Count -->
          <div class="flex justify-between text-sm">
            <div class="flex items-center gap-2">
              <Icon name="lucide:clock" class="h-4 w-4 text-muted-foreground" />
              <span :class="isExpiringSoon ? 'text-destructive font-medium' : 'text-muted-foreground'">{{ timeRemaining }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon name="lucide:download" class="h-4 w-4 text-muted-foreground" />
              <span class="text-muted-foreground">{{ fileInfo.downloadCount }} downloads</span>
            </div>
          </div>

          <!-- Missing Files Warning -->
          <div 
            v-if="missingCount > 0" 
            class="flex items-center gap-2 p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-md text-sm"
          >
            <Icon name="lucide:alert-triangle" class="h-4 w-4 flex-shrink-0" />
            <span>{{ missingCount }} file(s) unavailable - may have been deleted</span>
          </div>

          <!-- Video Player (for single video file) -->
          <div v-if="isVideo && !isBatch" class="rounded-lg overflow-hidden relative">
            <div v-if="isLoadingStream" class="flex items-center justify-center h-64 bg-gray-900 text-white">
                <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mr-2" />
                <span>Preparing stream...</span>
            </div>
            <div v-else-if="streamError" class="flex items-center justify-center h-64 bg-gray-900 text-red-500">
                <Icon name="lucide:alert-circle" class="w-8 h-8 mr-2" />
                <span>{{ streamError }}</span>
            </div>
            <MediaVideoPlayer 
                v-else-if="videoSrc"
                :src="videoSrc"
                :type="videoType"
                :title="fileInfo.fileName"
            />
          </div>

          <!-- Audio Player (for single audio file) -->
          <div v-else-if="isAudio && !isBatch" class="bg-muted/50 rounded-lg p-4">
            <audio 
              :src="streamUrl(0)"
              controls
              preload="metadata"
              class="w-full"
            >
              Your browser does not support audio playback.
            </audio>
          </div>

          <!-- Image Preview (for single image file) -->
          <div v-else-if="isImage && !isBatch" class="rounded-lg overflow-hidden">
            <img 
              :src="streamUrl(0)"
              :alt="fileInfo.fileName"
              class="w-full max-h-64 object-contain bg-muted/50"
            />
          </div>

          <!-- File List (Batch) -->
          <div v-if="isBatch" class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Files</p>
            <div class="space-y-1 max-h-48 overflow-auto">
              <div 
                v-for="(file, idx) in files" 
                :key="idx"
                :class="[
                  'flex items-center gap-3 p-2 rounded-md transition-colors',
                  file.available ? 'bg-muted/50 hover:bg-muted' : 'bg-destructive/10 opacity-60'
                ]"
              >
                <Icon 
                  :name="getFileIcon(file.name)" 
                  :class="['h-4 w-4 flex-shrink-0', file.available ? 'text-muted-foreground' : 'text-destructive']" 
                />
                <span :class="['flex-1 text-sm truncate', !file.available && 'line-through']">{{ file.name }}</span>
                <span v-if="file.available" class="text-xs text-muted-foreground">{{ formatBytes(file.size) }}</span>
                <span v-else class="text-xs text-destructive">Deleted</span>
                <!-- Preview button for video/audio -->
                <button 
                  v-if="file.available && isMediaFile(file.name)"
                  @click="previewFile = idx"
                  class="p-1 hover:bg-background rounded transition-colors"
                  title="Preview"
                >
                  <Icon name="lucide:play-circle" class="h-4 w-4 text-primary" />
                </button>
                <button 
                  v-if="file.available"
                  @click="downloadSingleFile(idx)"
                  class="p-1 hover:bg-background rounded transition-colors"
                  title="Download"
                >
                  <Icon name="lucide:download" class="h-4 w-4 text-primary" />
                </button>
              </div>
            </div>
          </div>

          <!-- Download Buttons -->
          <div class="space-y-2 pt-2">
            <!-- Download All (Batch) -->
            <UiButton
              v-if="isBatch"
              @click="downloadAll"
              :disabled="isDownloading"
              class="w-full h-11"
            >
              <Icon :name="isDownloading ? 'lucide:loader-2' : 'lucide:archive'" :class="isDownloading && 'animate-spin'" class="h-5 w-5 mr-2" />
              {{ isDownloading ? 'Preparing ZIP...' : 'Download All as ZIP' }}
            </UiButton>

            <!-- Single File Download -->
            <UiButton
              v-else
              @click="downloadSingleFile(0)"
              :disabled="isDownloading"
              class="w-full h-11"
            >
              <Icon :name="isDownloading ? 'lucide:loader-2' : 'lucide:download'" :class="isDownloading && 'animate-spin'" class="h-5 w-5 mr-2" />
              {{ isDownloading ? 'Preparing...' : 'Download File' }}
            </UiButton>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-muted/30 px-4 py-3 text-center border-t">
          <p class="text-xs text-muted-foreground">
            Trusted file sharing via <span class="font-semibold text-foreground">MultiBox</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No need to import video.js here anymore
// File type helpers
const videoExtensions = ['mp4', 'webm', 'mkv', 'avi', 'mov']
const audioExtensions = ['mp3', 'wav', 'ogg', 'flac', 'm4a']
const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']


definePageMeta({
  layout: 'empty'
})

const getFileExt = (name: string) => name.split('.').pop()?.toLowerCase() || ''

// State & Refs
const route = useRoute()
const shareId = route.params.id as string

interface ShareFile {
  name: string
  path: string
  size: number
  available?: boolean
}

interface FileInfo {
  fileName: string
  downloadUrl?: string
  files?: ShareFile[]
  isBatch?: boolean
  expiresAt: string
  downloadCount: number
}

const fileInfo = ref<FileInfo | null>(null)
const isLoading = ref(true)
const isDownloading = ref(false)
const error = ref<string | null>(null)
const timeRemaining = ref('')
const isExpiringSoon = ref(false)

const isLoadingStream = ref(false)
const streamError = ref('')
const previewFile = ref<number | null>(null)

// Video Source State
const videoSrc = ref<string>('')
const videoType = ref<string>('video/mp4')

let timer: any

// Computed
const files = computed(() => fileInfo.value?.files || [])
const isBatch = computed(() => files.value.length > 1)
const missingCount = computed(() => files.value.filter(f => f.available === false).length)


const isVideo = computed(() => {
  if (files.value.length !== 1) return false
  return videoExtensions.includes(getFileExt(files.value[0].name))
})

const isAudio = computed(() => {
  if (files.value.length !== 1) return false
  return audioExtensions.includes(getFileExt(files.value[0].name))
})

const isImage = computed(() => {
  if (files.value.length !== 1) return false
  return imageExtensions.includes(getFileExt(files.value[0].name))
})

// Methods
const isMediaFile = (name: string) => {
  const ext = getFileExt(name)
  return videoExtensions.includes(ext) || audioExtensions.includes(ext)
}

const getFileIcon = (name: string) => {
  const ext = getFileExt(name)
  if (videoExtensions.includes(ext)) return 'lucide:video'
  if (audioExtensions.includes(ext)) return 'lucide:music'
  if (imageExtensions.includes(ext)) return 'lucide:image'
  if (['pdf'].includes(ext)) return 'lucide:file-text'
  if (['zip', 'rar', '7z'].includes(ext)) return 'lucide:archive'
  return 'lucide:file'
}

const streamUrl = (index: number) => `/api/shares/${shareId}/stream?fileIndex=${index}`

const formatBytes = (bytes: number) => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const updateTimeRemaining = () => {
  if (!fileInfo.value) return
  
  // Handle "Never expires" (null expiresAt)
  if (!fileInfo.value.expiresAt) {
    timeRemaining.value = 'Never expires'
    isExpiringSoon.value = false
    return
  }
  
  const expiry = new Date(fileInfo.value.expiresAt)
  const now = new Date()
  const diff = expiry.getTime() - now.getTime()
  
  if (diff <= 0) {
    timeRemaining.value = 'Expired'
    isExpiringSoon.value = true
    error.value = 'This share link has expired'
    return
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  if (days > 0) {
    timeRemaining.value = `${days}d ${hours}h`
    isExpiringSoon.value = false
  } else if (hours > 0) {
    timeRemaining.value = `${hours}h ${minutes}m`
    isExpiringSoon.value = false
  } else if (minutes > 0) {
    timeRemaining.value = `${minutes}m ${seconds}s`
    isExpiringSoon.value = true
  } else {
    timeRemaining.value = `${seconds}s`
    isExpiringSoon.value = true
  }
}

// Logic to prepare video stream
const prepareVideoStream = async () => {
    if (!isVideo.value || isBatch.value || !files.value.length) return

    const file = files.value[0]
    const ext = getFileExt(file.name)
    
    // Reset state
    videoSrc.value = ''
    streamError.value = ''
    isLoadingStream.value = true

    try {
        // Enforce HLS for MP4, MKV, MOV (supported by Dropbox Preview)
        // This scrapes the HLS url from Dropbox Shared Link
        if (['mkv', 'mp4', 'mov'].includes(ext)) {
            videoType.value = 'application/x-mpegURL' // HLS
            const data = await $fetch<{ url: string }>(`/api/shares/${shareId}/transcode`, {
                query: { fileIndex: 0 }
            })
            const proxyBase = `/api/proxy/hls?url=`
            videoSrc.value = proxyBase + encodeURIComponent(data.url)
        } else {
             // Direct Play fallback for others or if scraping fails (handled by catch?)
             // Actually if scraping fails, we catch error.
             // Maybe we should fallback to streamUrl(0) in catch block?
            if (ext === 'webm') videoType.value = 'video/webm'
            else if (ext === 'avi') videoType.value = 'video/x-msvideo'
            else videoType.value = 'video/mp4' // Default

            videoSrc.value = streamUrl(0)
        }
    } catch (e: any) {
        console.error('Failed to prepare stream:', e)
        // Fallback to direct stream if HLS/Transcode fails
        console.warn('Falling back to direct stream...')
        videoType.value = 'video/mp4' // Default assumption
        if (ext === 'webm') videoType.value = 'video/webm'
        videoSrc.value = streamUrl(0)
    } finally {
        isLoadingStream.value = false
    }
}

const fetchFileInfo = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const response = await $fetch<FileInfo>(`/api/shares/${shareId}/download`)
    fileInfo.value = response
    updateTimeRemaining()
    timer = setInterval(updateTimeRemaining, 1000)
    
    // Wait for Vue to recalculate computed properties
    await nextTick()
    
    // Debug logging
    console.log('[File Viewer] fileInfo:', response)
    console.log('[File Viewer] files:', files.value)
    console.log('[File Viewer] isVideo:', isVideo.value, 'isBatch:', isBatch.value)
    
    // If it's a video, prepare it
    if (isVideo.value && !isBatch.value) {
        console.log('[File Viewer] Preparing video stream...')
        await prepareVideoStream()
    }
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Failed to load file'
  } finally {
    isLoading.value = false
  }
}

const downloadSingleFile = async (index: number) => {
  if (!fileInfo.value) return
  
  isDownloading.value = true
  try {
    // Use proxy stream endpoint (hides Dropbox URL)
    window.location.href = `/api/shares/${shareId}/stream?fileIndex=${index}`
  } finally {
    setTimeout(() => {
      isDownloading.value = false
    }, 2000)
  }
}

const downloadAll = async () => {
  isDownloading.value = true
  
  // Redirect to ZIP download endpoint
  window.location.href = `/api/shares/${shareId}/download-all`
  
  setTimeout(() => {
    isDownloading.value = false
  }, 3000)
}

// Lifecycle
onMounted(() => {
  fetchFileInfo()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
