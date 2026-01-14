<template>
  <div class="min-h-screen bg-background font-sans text-foreground flex flex-col">
    <!-- Navbar -->
    <header class="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="/" class="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
          <div class="bg-[#0061FE] text-white p-1.5 rounded-lg">
             <Icon name="lucide:hard-drive" class="h-5 w-5" />
          </div>
          <span>MultiBox</span>
        </a>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8 md:py-12">
      
      <!-- Loading -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center min-h-[50vh]">
        <Icon name="lucide:loader-2" class="w-10 h-10 text-[#0061FE] animate-spin mb-4" />
        <p class="text-muted-foreground font-medium">Loading file...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto">
        <div class="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
          <Icon name="lucide:file-warning" class="h-10 w-10 text-red-500" />
        </div>
        <h1 class="text-2xl font-bold mb-3">Link Unavailable</h1>
        <p class="text-muted-foreground mb-8">{{ error }}</p>
        <NuxtLink to="/" class="inline-flex items-center justify-center h-11 px-8 rounded-full bg-[#0061FE] text-white font-medium hover:bg-[#0057E5] transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200">
          <Icon name="lucide:arrow-left" class="h-4 w-4 mr-2" />
          Back to Home
        </NuxtLink>
      </div>

      <!-- Content -->
      <div v-else-if="fileInfo" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <!-- Header Section -->
        <div class="flex flex-col md:flex-row md:items-start justify-between gap-6">
           <div class="flex-1 min-w-0">
             <div class="flex items-center gap-3 mb-2">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                   {{ isBatch ? 'Folder Share' : 'Shared File' }}
                </span>
                <span v-if="isExpiringSoon" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                   Expires {{ timeRemaining }}
                </span>
             </div>
             <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-foreground break-words leading-tight">{{ fileInfo.fileName }}</h1>
             <div class="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm text-muted-foreground">
                <div class="flex items-center gap-1.5">
                   <Icon name="lucide:hard-drive" class="h-4 w-4" />
                   {{ isBatch ? `${files.length} items` : formatBytes(files[0]?.size) }}
                </div>
                <div class="h-1 w-1 rounded-full bg-border"></div>
                <div class="flex items-center gap-1.5">
                   <Icon name="lucide:download-cloud" class="h-4 w-4" />
                   {{ fileInfo.downloadCount }} downloads
                </div>
                <div class="h-1 w-1 rounded-full bg-border"></div>
                <div class="flex items-center gap-1.5">
                   <Icon name="lucide:clock" class="h-4 w-4" />
                   {{ !fileInfo.expiresAt ? 'Never expires' : timeRemaining }}
                </div>
             </div>
           </div>

           <!-- Desktop Download Action -->
           <div class="hidden md:block shrink-0">
              <UiButton 
                @click="isBatch ? downloadAll() : downloadSingleFile(0)" 
                :disabled="isDownloading"
                size="lg" 
                class="h-12 px-8 text-base bg-[#0061FE] hover:bg-[#0057E5] text-white shadow-lg shadow-blue-500/20 rounded-full"
              >
                 <Icon :name="isDownloading ? 'lucide:loader-2' : 'lucide:download'" :class="isDownloading ? 'animate-spin' : ''" class="mr-2 h-5 w-5" />
                 {{ isDownloading ? 'Downloading...' : 'Download Now' }}
              </UiButton>
           </div>
        </div>

        <!-- Warning Banner -->
        <div v-if="missingCount > 0" class="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4">
           <div class="flex">
              <div class="flex-shrink-0">
                 <Icon name="lucide:alert-triangle" class="h-5 w-5 text-yellow-500" />
              </div>
              <div class="ml-3">
                 <p class="text-sm text-yellow-700 dark:text-yellow-200">
                    {{ missingCount }} file(s) in this share are no longer available.
                 </p>
              </div>
           </div>
        </div>

        <!-- Main Preview Area -->
        <div class="w-full">
           <!-- Video Player (UNTOUCHED LOGIC) -->
           <div v-if="isVideo && !isBatch" class="rounded-2xl overflow-hidden relative shadow-2xl bg-black ring-1 ring-white/10">
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

           <!-- Audio Player -->
           <div v-else-if="isAudio && !isBatch" class="bg-card border rounded-2xl p-8 shadow-sm flex flex-col items-center">
              <div class="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6 text-[#0061FE]">
                 <Icon name="lucide:music" class="h-10 w-10" />
              </div>
              <h3 class="text-lg font-medium mb-6">{{ fileInfo.fileName }}</h3>
              <audio 
                :src="streamUrl(0)"
                controls
                preload="metadata"
                class="w-full max-w-2xl"
              >
                Your browser does not support audio playback.
              </audio>
           </div>

           <!-- Image Preview -->
           <div v-else-if="isImage && !isBatch" class="bg-muted/10 rounded-2xl overflow-hidden border shadow-sm flex justify-center">
              <img 
                :src="streamUrl(0)"
                :alt="fileInfo.fileName"
                class="max-w-full max-h-[80vh] object-contain shadow-md"
              />
           </div>

           <!-- Batch File List -->
           <div v-if="isBatch" class="bg-card border rounded-xl overflow-hidden shadow-sm">
              <div class="px-6 py-4 border-b bg-muted/30 flex items-center justify-between">
                 <h3 class="font-semibold">Contains {{ files.length }} Files</h3>
              </div>
              <div class="divide-y max-h-[500px] overflow-auto">
                 <div 
                   v-for="(file, idx) in files" 
                   :key="idx"
                   class="group flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors"
                 >
                    <div class="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#0061FE] shrink-0">
                       <Icon :name="getFileIcon(file.name)" class="h-5 w-5" />
                    </div>
                    
                    <div class="flex-1 min-w-0">
                       <h4 :class="['font-medium text-sm truncate', !file.available && 'text-muted-foreground line-through']">{{ file.name }}</h4>
                       <p class="text-xs text-muted-foreground mt-0.5">{{ formatBytes(file.size) }}</p>
                    </div>

                    <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                          v-if="file.available && isMediaFile(file.name)"
                          @click="previewFile = idx"
                          class="p-2 rounded-full hover:bg-background text-[#0061FE] transition-colors"
                          title="Preview"
                       >
                          <Icon name="lucide:play-circle" class="h-5 w-5" />
                       </button>
                       <button 
                          v-if="file.available"
                          @click="downloadSingleFile(idx)"
                          class="p-2 rounded-full hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
                          title="Download"
                       >
                          <Icon name="lucide:download" class="h-5 w-5" />
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
        
        <!-- Mobile Download Button -->
        <div class="md:hidden pt-4">
           <UiButton 
              @click="isBatch ? downloadAll() : downloadSingleFile(0)" 
              :disabled="isDownloading"
              class="w-full h-12 text-base rounded-full bg-[#0061FE]"
           >
              {{ isDownloading ? 'Downloading...' : 'Download File' }}
           </UiButton>
        </div>

      </div>

    </main>
    
    <!-- Footer -->
    <footer class="py-8 text-center text-sm text-muted-foreground border-t mt-auto">
       <p>© 2026 MultiBox. Secure file sharing.</p>
    </footer>

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
