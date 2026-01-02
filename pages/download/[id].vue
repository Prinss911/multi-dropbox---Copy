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
          <div v-if="isVideo && !isBatch" class="rounded-lg overflow-hidden bg-black">
            <div data-vjs-player>
              <video 
                ref="videoPlayer"
                class="video-js vjs-big-play-centered" 
                playsinline
              />
            </div>
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
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
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
const videoPlayer = ref<HTMLElement | null>(null)
const isLoadingStream = ref(false)
const streamError = ref('')
const previewFile = ref<number | null>(null)

let timer: any
let player: any = null

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

const fetchFileInfo = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const response = await $fetch<FileInfo>(`/api/shares/${shareId}/download`)
    fileInfo.value = response
    updateTimeRemaining()
    timer = setInterval(updateTimeRemaining, 1000)
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
  if (player) {
    player.dispose()
  }
})

// Watchers
watch([() => fileInfo.value, videoPlayer], async ([info, el]) => {
  if (info && isVideo.value && !isBatch.value && el && !player) {
    // Determine mime type
    const ext = getFileExt(info.files![0].name)
    let type = 'video/mp4'
    let src = streamUrl(0)
    
    if (ext === 'mkv') {
        type = 'application/x-mpegURL' // HLS
        // We need to fetch the HLS URL from the server
        isLoadingStream.value = true
        streamError.value = ''
        try {
            const data = await $fetch<{ url: string }>(`/api/shares/${route.params.id}/transcode`, {
                query: { fileIndex: 0 }
            })
            // Use proxy to avoid CORS
            // Construct proxy URL relative to current origin
            const proxyBase = `/api/proxy/hls?url=`
            src = proxyBase + encodeURIComponent(data.url)
            
            console.log('MKV Stream Source (Proxied):', src)
        } catch (e: any) {
            console.error('Failed to get transcode URL:', e)
            streamError.value = e.data?.statusMessage || 'Failed to load video stream.'
            isLoadingStream.value = false
            return
        } finally {
            isLoadingStream.value = false
        }
    }
    else if (ext === 'webm') type = 'video/webm'
    else if (ext === 'avi') type = 'video/x-msvideo'
    else if (ext === 'mov') type = 'video/quicktime'

    player = videojs(el, {
      controls: true,
      autoplay: false,
      preload: 'auto',
      fluid: true,
      html5: {
        hls: {
          overrideNative: true
        }
      },
      sources: [{
        src: src,
        type: type
      }]
    })

    // Custom Quality Selector Implementation
    if (ext === 'mkv') {
      player.ready(() => {
        const qualityLevels = player.qualityLevels()
        
        // Define Custom Button Logic
        const setupQualityButton = () => {
            const VideoJSButton = videojs.getComponent('MenuButton')
            const VideoJSMenuItem = videojs.getComponent('MenuItem')

            // Register Setup only once to avoid "already registered" warning
            if (!videojs.getComponent('HlsQualitySelector')) {
                 // @ts-ignore
                class HlsQualitySelector extends VideoJSButton {
                    constructor(player: any, options: any) {
                        super(player, options)
                        this.controlText('Quality')
                        this.addClass('vjs-quality-selector')

                        // Listen to quality level changes to update menu
                        const qualityLevels = player.qualityLevels()
                        const updateMenu = () => {
                             // @ts-ignore
                             this.update()
                        }
                        
                        qualityLevels.on('addqualitylevel', updateMenu)
                        qualityLevels.on('removequalitylevel', updateMenu)
                        
                        // Also update on source change
                        player.on('loadstart', updateMenu)
                    }

                    // Don't override handleClick - let parent MenuButton handle it
                    // with pressButton() and unpressButton() which properly control menu visibility

                    createItems() {
                        const items: any[] = []
                         // @ts-ignore
                        const qualityLevels = this.player().qualityLevels()

                        if (!qualityLevels || qualityLevels.length === 0) {
                            return items
                        }

                        // Helper to format bitrate
                        const formatBitrate = (bitrate: number) => {
                            if (!bitrate) return ''
                            const mbps = bitrate / 1000000
                            if (mbps >= 1) {
                                return `${mbps.toFixed(1)} Mbps`
                            } else {
                                return `${(bitrate / 1000).toFixed(0)} Kbps`
                            }
                        }
                        
                        // Auto Option
                        // @ts-ignore
                        class AutoMenuItem extends VideoJSMenuItem {
                            handleClick() {
                                for (let i = 0; i < qualityLevels.length; i++) {
                                    qualityLevels[i].enabled = true
                                }
                                this.selected(true)
                            }
                        }
                         // @ts-ignore
                        items.push(new AutoMenuItem(this.player(), {
                            label: 'Auto',
                            selectable: true,
                            selected: true
                        }))

                         // Resolution Options - sort by height descending
                        const levels: any[] = []
                        for (let i = 0; i < qualityLevels.length; i++) {
                            const level = qualityLevels[i]
                            if (level.height) {
                                levels.push({ index: i, height: level.height, bitrate: level.bitrate })
                            }
                        }
                        levels.sort((a, b) => b.height - a.height) // Highest first

                        for (const level of levels) {
                            const bitrateStr = formatBitrate(level.bitrate)
                            const label = bitrateStr 
                                ? `${level.height}p (${bitrateStr})`
                                : `${level.height}p`
                            
                            const levelIndex = level.index
                             // @ts-ignore
                            class QualityMenuItem extends VideoJSMenuItem {
                                handleClick() {
                                    // Enable ONLY this level, disable others
                                    for (let j = 0; j < qualityLevels.length; j++) {
                                        qualityLevels[j].enabled = j === levelIndex
                                    }
                                    this.selected(true)
                                }
                            }
                             // @ts-ignore
                            items.push(new QualityMenuItem(this.player(), {
                                label: label,
                                selectable: true,
                                selected: false
                            }))
                        }
                        return items
                    }
                }
                videojs.registerComponent('HlsQualitySelector', HlsQualitySelector)
            }

            // Check if button already exists in this player instance
            // We use a timeout to let HLS load levels, or just add it. 
            // Better to add it immediately, it will populate items when clicked.
            if (!player.controlBar.getChild('HlsQualitySelector')) {
                 player.controlBar.addChild('HlsQualitySelector', {}, 0) // Add as first item
                 const btn = player.controlBar.getChild('HlsQualitySelector')
                 if (btn) {
                    // Add icon manually
                    const icon = document.createElement('span')
                    icon.className = 'vjs-icon-cog'
                    if(!btn.el().querySelector('.vjs-icon-cog')) {
                        btn.el().insertBefore(icon, btn.el().firstChild)
                    }
                 }
            }
        }

        setupQualityButton()
        
        // Re-setup on new levels (optional, but good for adaptive streams)
        qualityLevels.on('addqualitylevel', () => {
           console.log('Quality level added:', qualityLevels[qualityLevels.length-1].height)
        })
      })
    }

    player.on('error', () => {
      const err = player.error()
       if (err) {
         console.error('VideoJS Error:', err)
         if (ext === 'mkv') {
            error.value = "Playback Error: Transcoding failure or stream expired."
         } else {
             error.value = "Playback Error: Unsupported format or missing permissions."
         }
         player.dispose()
         player = null
       }
    })
  }
})
</script>

<style>
/* VideoJS Modern Premium Theme */
.video-js {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #fff;
}

/* Big Play Button - Modern Circular Glass */
.video-js .vjs-big-play-button {
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  width: 80px;
  height: 80px;
  line-height: 80px;
  font-size: 3em;
  margin-left: -40px; /* Center alignment adjustment */
  margin-top: -40px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
}

.video-js:hover .vjs-big-play-button {
  background-color: rgba(99, 102, 241, 0.8); /* Primary color accent */
  border-color: rgba(99, 102, 241, 0.4);
  transform: scale(1.1);
  box-shadow: 0 0 30px rgba(99, 102, 241, 0.4);
}

/* Control Bar - Floating Glass Dock */
.video-js .vjs-control-bar {
  background: rgba(15, 15, 20, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  height: 48px; /* Slightly taller for better touch */
  padding: 0 10px;
  display: flex;
  align-items: center;
  transition: opacity 0.3s ease;
  
  /* Floating Effect */
  width: 96%;
  left: 2%;
  bottom: 12px;
  border-radius: 12px;
  margin-bottom: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

/* Hide control bar when inactive/not hovered */
.video-js.vjs-user-inactive.vjs-playing .vjs-control-bar {
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.4s ease;
}

/* Progress Control */
.video-js .vjs-progress-control {
  position: absolute;
  top: -14px; /* Move above the control bar */
  left: 0;
  width: 100%;
  height: 14px; /* Hit area */
  display: flex;
  align-items: center;
}

.video-js .vjs-progress-holder {
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  margin: 0 12px; /* Indent slightly from edges */
  transition: height 0.2s;
}

.video-js .vjs-progress-control:hover .vjs-progress-holder {
  height: 6px; /* Expand on hover */
}

.video-js .vjs-play-progress {
  background: #6366f1; /* Primary Color */
  border-radius: 10px;
}

.video-js .vjs-play-progress:before {
  font-size: 1em;
  color: #fff;
  top: -3px;
  text-shadow: 0 0 5px rgba(99, 102, 241, 0.8);
  display: none; /* Hide the default circle indicator usually */
}

/* Show circle indicator on hover */
.video-js .vjs-progress-control:hover .vjs-play-progress:before {
  display: block;
  transform: scale(1.2);
}

/* Volume Panel */
.video-js .vjs-volume-panel {
  margin-left: 10px;
}

.video-js .vjs-volume-level {
  background: #fff;
}

/* Buttons & Icons */
.video-js .vjs-button {
  width: 36px;
  color: rgba(255, 255, 255, 0.85);
  transition: color 0.2s;
}

.video-js .vjs-button:hover {
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

/* Time Display */
.video-js .vjs-time-control {
  font-size: 0.9em;
  font-weight: 500;
  line-height: 48px;
  min-width: auto;
  padding: 0 5px;
}

/* --- Menu / Quality Selector Styling (Glassmorphism) --- */

/* Wrapper */
.vjs-quality-selector.vjs-menu-button-popup {
  position: relative;
}

/* Base menu - Glassmorphism style */
.vjs-quality-selector.vjs-menu-button-popup .vjs-menu {
  display: none;
  position: absolute;
  left: 50%; 
  transform: translateX(-50%);
  bottom: 60px; /* Position above floating bar */
  width: auto;
  min-width: 160px;
  z-index: 9999;
  background: rgba(20, 20, 25, 0.9);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 6px;
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  animation: menuFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  height: auto !important;
  max-height: none !important;
}

@keyframes menuFadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, 10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
}

/* Arrow pointer */
.vjs-quality-selector.vjs-menu-button-popup .vjs-menu::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  margin-left: -6px;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid rgba(20, 20, 25, 0.9);
}

/* Show menu states */
.vjs-quality-selector.vjs-menu-button-popup:hover .vjs-menu,
.vjs-quality-selector.vjs-menu-button-popup .vjs-menu:hover,
.vjs-quality-selector.vjs-menu-button-popup .vjs-menu.vjs-lock-showing {
  display: block !important;
}

.vjs-quality-selector .vjs-menu-content {
  background-color: transparent;
  padding: 0;
  max-height: 300px;
  overflow: auto;
  display: flex !important;
  flex-direction: column;
}

/* Menu items */
.vjs-quality-selector .vjs-menu-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 10px 16px 10px 20px;
  min-height: 38px;
  line-height: 1.4;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  white-space: nowrap;
  background: transparent;
  margin: 2px 4px;
  border-radius: 8px;
  transition: all 0.15s ease;
  position: relative;
  text-transform: none !important;
}

/* First item (Auto) - special styling with divider */
.vjs-quality-selector .vjs-menu-item:first-child {
  color: #a5b4fc; /* Lighter indigo for Auto */
  font-weight: 600;
  margin-bottom: 6px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px 8px 0 0;
}

/* Hover effect */
.vjs-quality-selector .vjs-menu-item:hover,
.vjs-quality-selector .vjs-menu-item:focus {
  background: rgba(99, 102, 241, 0.12);
  color: #fff;
  outline: none;
}

/* Selected item */
.vjs-quality-selector .vjs-menu-item.vjs-selected {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  font-weight: 600;
}

.vjs-quality-selector .vjs-menu-item.vjs-selected::before {
  content: '✓';
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: #a5b4fc;
}

.vjs-quality-selector .vjs-menu-item.vjs-selected .vjs-menu-item-text {
  margin-left: 0;
}

/* Scroller styling */
.vjs-quality-selector .vjs-menu-content::-webkit-scrollbar {
  width: 4px;
}
.vjs-quality-selector .vjs-menu-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

/* Cog Icon */
.vjs-quality-selector .vjs-icon-cog {
  font-size: 1.25em; /* Slightly smaller for elegance */
  color: rgba(255, 255, 255, 0.7);
  transition: transform 0.4s ease, color 0.2s;
}

.vjs-quality-selector:hover .vjs-icon-cog {
  color: #fff;
  transform: rotate(45deg);
}

.vjs-quality-selector .vjs-icon-cog:before {
  content: '\f114';
  font-family: VideoJS;
}
</style>
