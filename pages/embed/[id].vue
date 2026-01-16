<template>
  <div class="h-screen w-screen bg-black overflow-hidden relative font-sans">
    
    <!-- Loading State -->
    <div v-if="isLoading" class="absolute inset-0 flex flex-col items-center justify-center text-white z-50 bg-black">
      <Icon name="lucide:loader-2" class="w-10 h-10 animate-spin mb-4 text-blue-500" />
      <p class="text-sm text-gray-400">Loading media...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="absolute inset-0 flex flex-col items-center justify-center text-white z-50 bg-black p-4 text-center">
      <div class="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mb-4">
          <Icon name="lucide:alert-circle" class="w-8 h-8 text-red-500" />
      </div>
      <h3 class="text-lg font-bold mb-2">Media Unavailable</h3>
      <p class="text-gray-400 max-w-md">{{ error }}</p>
    </div>

    <!-- Content -->
    <div v-else-if="fileInfo" class="w-full h-full">
        
         <!-- Video Player -->
         <div v-if="isVideo" class="w-full h-full relative group">
             <!-- Preparing Overlay -->
             <div v-if="isLoadingStream" class="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm text-white">
                 <Icon name="lucide:loader-2" class="w-10 h-10 animate-spin text-blue-500" />
                 <span class="ml-3 font-medium">Preparing stream...</span>
             </div>

             <MediaVideoPlayer 
                 v-if="videoSrc"
                 :src="videoSrc"
                 :type="videoType"
                 :title="fileInfo.fileName"
                 class="w-full h-full [&>.video-js]:w-full [&>.video-js]:h-full"
                 autoplay
             />
         </div>

         <!-- Audio Player -->
         <div v-else-if="isAudio" class="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-8">
             <div class="w-32 h-32 bg-indigo-500/20 rounded-full flex items-center justify-center mb-8 animate-pulse">
                 <Icon name="lucide:music" class="w-16 h-16 text-indigo-400" />
             </div>
             <h1 class="text-xl font-bold mb-8 text-center px-4">{{ fileInfo.fileName }}</h1>
             <audio :src="streamUrl(0)" controls class="w-full max-w-md" autoplay></audio>
         </div>

         <!-- Non-playable -->
         <div v-else class="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white">
             <Icon name="lucide:file-question" class="w-16 h-16 text-gray-500 mb-4" />
             <p class="text-lg mb-4">This file type cannot be embedded.</p>
             <a :href="`/file/${shareId}`" target="_blank" class="px-6 py-2 bg-blue-600 rounded-full text-sm hover:bg-blue-700 transition flex items-center">
                 <Icon name="lucide:external-link" class="w-4 h-4 mr-2" />
                 View File Page
             </a>
         </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const route = useRoute()
const shareId = route.params.id as string

// Types
interface ShareFile {
  name: string
  path: string
  size: number
  available?: boolean
}

interface FileInfo {
  fileName: string
  files?: ShareFile[]
  isBatch?: boolean
  expiresAt: string
}

// Extensions
const videoExtensions = ['mp4', 'webm', 'mkv', 'avi', 'mov']
const audioExtensions = ['mp3', 'wav', 'ogg', 'flac', 'm4a']

const getFileExt = (name: string) => name.split('.').pop()?.toLowerCase() || ''

// State
const fileInfo = ref<FileInfo | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const isLoadingStream = ref(false)
const videoSrc = ref<string>('')
const videoType = ref<string>('video/mp4')

// Computeds
const files = computed(() => fileInfo.value?.files || [])
const isBatch = computed(() => files.value.length > 1)

const isVideo = computed(() => {
  if (files.value.length !== 1) return false
  return videoExtensions.includes(getFileExt(files.value[0].name))
})

const isAudio = computed(() => {
  if (files.value.length !== 1) return false
  return audioExtensions.includes(getFileExt(files.value[0].name))
})

// Methods
const streamUrl = (index: number) => `/api/shares/${shareId}/stream?fileIndex=${index}`

const prepareVideoStream = async () => {
    if (!isVideo.value || isBatch.value || !files.value.length) return

    const file = files.value[0]
    const ext = getFileExt(file.name)
    
    // Reset state
    videoSrc.value = ''
    isLoadingStream.value = true

    try {
        // Enforce HLS for MP4, MKV, MOV (supported by Dropbox Preview)
        if (['mkv', 'mp4', 'mov'].includes(ext)) {
            videoType.value = 'application/x-mpegURL' // HLS
            const data = await $fetch<{ url: string }>(`/api/shares/${shareId}/transcode`, {
                query: { fileIndex: 0 }
            })
            // Proxy HLS to avoid CORS and hide real URL
            const proxyBase = `/api/proxy/hls?url=`
            videoSrc.value = proxyBase + encodeURIComponent(data.url)
        } else {
            // Direct Play fallback
            if (ext === 'webm') videoType.value = 'video/webm'
            else if (ext === 'avi') videoType.value = 'video/x-msvideo'
            else videoType.value = 'video/mp4' // Default
            videoSrc.value = streamUrl(0)
        }
    } catch (e: any) {
        console.error('Failed to prepare stream:', e)
        // Fallback
        videoType.value = 'video/mp4'
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
    
    // Track view (fire and forget - don't block loading)
    trackView()
    
    if (isVideo.value && !isBatch.value) {
        await prepareVideoStream()
    }
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Failed to load file'
  } finally {
    isLoading.value = false
  }
}

// Track view count (only once per page load)
const viewTracked = ref(false)
const trackView = async () => {
    if (viewTracked.value) return
    viewTracked.value = true
    
    try {
        await $fetch(`/api/shares/${shareId}/view`, { method: 'POST' })
    } catch (e) {
        // Silently fail - view tracking is not critical
        console.warn('Failed to track view:', e)
    }
}

onMounted(() => {
  fetchFileInfo()
})
</script>
