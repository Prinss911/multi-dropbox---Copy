<script setup lang="ts">
import videojs from 'video.js'
import {
    SliderRoot,
    SliderTrack,
    SliderRange,
    SliderThumb,
} from 'reka-ui'
import { 
    Play, 
    Pause, 
    Volume2, 
    VolumeX, 
    Maximize, 
    Minimize, 
    Settings, 
    ChevronRight, 
    Check,
    Loader2,
    RotateCcw,
    RotateCw,
    ChevronsRight,
    ChevronsLeft,
    Activity,
    X,
    Info,
    BarChart3
} from 'lucide-vue-next'

const props = defineProps<{
    src: string
    type?: string
    poster?: string
    autoplay?: boolean
    title?: string
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const playerContainerRef = ref<HTMLElement | null>(null)
const player = shallowRef<any | null>(null)

// --- State ---
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)
const isMuted = ref(false)
const isFullscreen = ref(false)
const isBuffering = ref(false)
const isHovering = ref(false)
const bufferedPercent = ref(0)
const showControlsForce = ref(false)
const currentBitrate = ref<string>('')
const isSettingsOpen = ref(false)
const showStats = ref(false)

// Live Statistics Data
const stats = ref({
    resolution: '-',
    bitrate: '-',           // Bitrate of current quality level
    bufferHealth: 0,        // Seconds of buffer ahead
    droppedFrames: 0,
    totalFrames: 0,
    downloadSpeed: '-',     // Current network throughput
    currentQuality: 'Auto',
    bufferedMB: 0           // Buffered data size in MB
})
let statsInterval: any = null

const showControls = computed(() => {
    return isHovering.value || !isPlaying.value || showControlsForce.value || isSettingsOpen.value
})

const qualityLevels = ref<any[]>([])
const selectedQuality = ref<number>(-1)
const displayQualityLevels = computed(() => {
    if (qualityLevels.value.length > 0) return qualityLevels.value
    return [{ label: 'Source', index: -1, isPlaceholder: true }]
})

const playbackRate = ref(1)
const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2]

const osd = ref({
    visible: false,
    icon: null as any,
    text: '',
    timeout: null as any
})

// --- Utilities ---
const vibrate = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(20)
    }
}

const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    const mStr = m.toString().padStart(h > 0 ? 2 : 1, '0')
    const sStr = s.toString().padStart(2, '0')
    return h > 0 ? `${h}:${mStr}:${sStr}` : `${mStr}:${sStr}`
}

const formatBitrate = (bits: number) => {
    if (!bits) return ''
    const mbps = bits / 1000000
    return `${mbps.toFixed(2)} Mbps`
}

const showOsd = (icon: any, text: string) => {
    if (osd.value.timeout) clearTimeout(osd.value.timeout)
    osd.value = {
        visible: true,
        icon,
        text,
        timeout: setTimeout(() => {
            osd.value.visible = false
        }, 800)
    }
}

const sliderValue = computed({
    get: () => [currentTime.value],
    set: (val: number[]) => {
        if (val && val.length > 0) currentTime.value = val[0]
    }
})

// --- Lifecycle ---
onMounted(() => {
    if (!videoRef.value) return

    player.value = videojs(videoRef.value, {
        controls: false,
        autoplay: props.autoplay,
        preload: 'auto',
        fluid: true,
        poster: props.poster,
        sources: [{ src: props.src, type: props.type || 'video/mp4' }],
        html5: {
            vhs: {
                overrideNative: true,
                enableLowInitialPlaylist: true,
                // Removed smoothQualityChange to force faster switches
            },
            nativeVideoTracks: false,
            nativeAudioTracks: false,
            nativeTextTracks: false,
        }
    })

    const p = player.value

    p.on('play', () => { isPlaying.value = true; resetControlsTimer() })
    p.on('pause', () => isPlaying.value = false)
    p.on('timeupdate', () => currentTime.value = p.currentTime() || 0)
    p.on('durationchange', () => duration.value = p.duration() || 0)
    p.on('volumechange', () => { volume.value = p.volume(); isMuted.value = p.muted() })
    p.on('waiting', () => isBuffering.value = true)
    p.on('playing', () => isBuffering.value = false)
    p.on('canplay', () => isBuffering.value = false)
    p.on('fullscreenchange', () => isFullscreen.value = p.isFullscreen())
    
    p.on('progress', () => {
        const d = p.duration()
        if (d > 0) bufferedPercent.value = (p.bufferedEnd() / d) * 100
    })

    p.ready(() => {
        // @ts-ignore
        const levels = p.qualityLevels()
        
        const updateLevels = () => {
            const tempLevels = []
            tempLevels.push({ label: 'Auto', index: -1, height: 'Auto' })
            for(let i=0; i < levels.length; i++) {
                if (levels[i].height) {
                    tempLevels.push({
                        label: `${levels[i].height}p`,
                        index: i,
                        height: levels[i].height,
                        bitrate: levels[i].bitrate
                    })
                }
            }
            tempLevels.sort((a, b) => {
                if(a.index === -1) return -1
                if(b.index === -1) return 1
                // @ts-ignore
                return b.height - a.height
            })
            qualityLevels.value = tempLevels
        }

        const updateCurrentBitrate = () => {
             const idx = levels.selectedIndex
             if (idx !== -1 && levels[idx]) {
                 currentBitrate.value = formatBitrate(levels[idx].bitrate)
             } else {
                 currentBitrate.value = ''
             }
        }

        levels.on('addqualitylevel', updateLevels)
        levels.on('removequalitylevel', updateLevels)
        levels.on('change', updateCurrentBitrate)
        
        if (levels.length > 0) {
            updateLevels()
            updateCurrentBitrate()
        }
    })

    document.addEventListener('fullscreenchange', updateFullscreenState)
})

// --- Stats Update Logic ---
const updateStats = () => {
    if (!player.value) return
    
    try {
        // @ts-ignore
        const levels = player.value.qualityLevels()
        const videoEl = videoRef.value
        
        // Get current quality level info (nominal/advertised bitrate)
        const selectedIdx = levels.selectedIndex
        if (selectedIdx !== -1 && levels[selectedIdx]) {
            const level = levels[selectedIdx]
            stats.value.resolution = `${level.width || '?'}x${level.height || '?'}`
            stats.value.bitrate = formatBitrate(level.bitrate)
            stats.value.currentQuality = `${level.height}p`
        } else {
            stats.value.resolution = videoEl ? `${videoEl.videoWidth}x${videoEl.videoHeight}` : '-'
            stats.value.currentQuality = 'Auto'
        }
        
        // Buffer health (seconds of buffer ahead)
        const buffered = player.value.buffered()
        const ct = player.value.currentTime()
        if (buffered.length > 0) {
            const bufferedEnd = buffered.end(buffered.length - 1)
            const bufferAhead = Math.max(0, bufferedEnd - ct)
            stats.value.bufferHealth = Math.round(bufferAhead * 10) / 10
        }
        
        // Dropped frames (if available via videoPlaybackQuality API)
        if (videoEl && typeof videoEl.getVideoPlaybackQuality === 'function') {
            const quality = videoEl.getVideoPlaybackQuality()
            stats.value.droppedFrames = quality.droppedVideoFrames || 0
            stats.value.totalFrames = quality.totalVideoFrames || 0
        }
        
        // Get VHS internal stats for REAL-TIME measurements
        // @ts-ignore
        const tech = player.value.tech({ IWillNotUseThisInPlugins: true })
        if (tech && tech.vhs) {
            // Network bandwidth/download speed (real-time)
            if (tech.vhs.bandwidth) {
                stats.value.downloadSpeed = formatBitrate(tech.vhs.bandwidth)
            } else if (tech.vhs.systemBandwidth) {
                stats.value.downloadSpeed = formatBitrate(tech.vhs.systemBandwidth)
            }
            
            // Get buffered MB from stats if available
            if (tech.vhs.stats && tech.vhs.stats.mediaBytesTransferred) {
                stats.value.bufferedMB = Math.round(tech.vhs.stats.mediaBytesTransferred / (1024 * 1024) * 10) / 10
            }
        }
        
    } catch (e) {
        // Silently fail
        console.debug('Stats update error:', e)
    }
}

const startStatsUpdate = () => {
    if (statsInterval) clearInterval(statsInterval)
    statsInterval = setInterval(updateStats, 500)
    updateStats() // Initial update
}

const stopStatsUpdate = () => {
    if (statsInterval) {
        clearInterval(statsInterval)
        statsInterval = null
    }
}

const toggleStats = () => {
    showStats.value = !showStats.value
    if (showStats.value) {
        startStatsUpdate()
    } else {
        stopStatsUpdate()
    }
}

onBeforeUnmount(() => {
    stopStatsUpdate()
    document.removeEventListener('fullscreenchange', updateFullscreenState)
    if (player.value) {
        player.value.dispose()
        player.value = null
    }
})

// --- Controls Logic ---
const toggleFullscreen = async () => {
    if (!playerContainerRef.value) return
    if (!document.fullscreenElement) {
        try {
            if (playerContainerRef.value.requestFullscreen) {
                await playerContainerRef.value.requestFullscreen()
                if (screen.orientation && (screen.orientation.lock as any)) {
                    try { await (screen.orientation.lock as any)('landscape') } catch (e) {}
                }
            }
        } catch (err) { console.error(err) }
    } else {
        if (document.exitFullscreen) {
            await document.exitFullscreen()
            if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock()
        }
    }
}

const updateFullscreenState = () => isFullscreen.value = !!document.fullscreenElement

const togglePlay = () => {
    if (!player.value) return
    vibrate()
    if (player.value.paused()) player.value.play()
    else player.value.pause()
}

const seek = (value: number[]) => {
    if (!player.value) return
    player.value.currentTime(value[0])
    resetControlsTimer()
}

const changeVolume = (value: number[]) => {
    if (!player.value) return
    player.value.volume(value[0])
    if (value[0] > 0 && isMuted.value) player.value.muted(false)
    resetControlsTimer()
}

const toggleMute = () => {
    if (!player.value) return
    vibrate()
    player.value.muted(!player.value.muted())
    resetControlsTimer()
}

const setQuality = (index: number) => {
    if (!player.value) return
    vibrate()
    
    // @ts-ignore
    const levels = player.value.qualityLevels()
    const wasPlaying = !player.value.paused()
    const ct = player.value.currentTime()
    
    // Method 1: Lock quality levels (for ABR reference)
    if (index === -1) {
        for(let i=0; i < levels.length; i++) levels[i].enabled = true
    } else {
        for(let i=0; i < levels.length; i++) levels[i].enabled = (i === index)
    }
    selectedQuality.value = index
    isSettingsOpen.value = false 
    
    // Show feedback
    if (index === -1) {
        showOsd(Activity, 'Auto')
    } else if (levels[index]) {
        showOsd(Activity, `${levels[index].height}p`)
    }
    
    // Method 2: Access VHS representations directly for INSTANT switch
    try {
        // @ts-ignore
        const tech = player.value.tech({ IWillNotUseThisInPlugins: true })
        if (tech && tech.vhs) {
            const representations = tech.vhs.representations()
            if (representations && representations.length > 0) {
                if (index === -1) {
                    // Auto: enable all representations
                    representations.forEach((rep: any) => rep.enabled(true))
                } else {
                    // Lock to specific representation
                    representations.forEach((rep: any, i: number) => {
                        rep.enabled(i === index)
                    })
                }
            }
        }
    } catch (e) {
        // VHS not available or error, fallback to qualityLevels only
        console.warn('VHS representations not available:', e)
    }
    
    // Pause to interrupt buffering, then seek to force new segment
    player.value.pause()
    
    setTimeout(() => {
        if (!player.value) return
        // Seek slightly forward to cross segment boundary
        player.value.currentTime(Math.min(ct + 0.1, player.value.duration() - 1))
        
        // Resume playback
        if (wasPlaying) {
            player.value.play().catch(() => {})
        }
    }, 50)
}

const setPlaybackRate = (rate: number) => {
    if (!player.value) return
    vibrate()
    player.value.playbackRate(rate)
    playbackRate.value = rate
    isSettingsOpen.value = false
}

// --- Gestures & Interaction ---
let hideControlsTimeout: any
const resetControlsTimer = () => {
    if (hideControlsTimeout) clearTimeout(hideControlsTimeout)
    if (isPlaying.value && !isSettingsOpen.value) {
        hideControlsTimeout = setTimeout(() => {
            isHovering.value = false
            if (!isHovering.value) showControlsForce.value = false
        }, 3000)
    }
}

const onMouseMove = () => {
    if (!window.matchMedia('(hover: none)').matches) {
        isHovering.value = true
        resetControlsTimer()
    }
}

const onMouseLeave = () => {
    if (isPlaying.value && !isSettingsOpen.value) isHovering.value = false
}

// Mobile Gestures (Brightness & Volume)
const touchState = ref({
    startX: 0,
    startY: 0,
    startTime: 0,
    activeType: null as 'volume' | 'brightness' | null,
    startValue: 0, // Volume or Brightness at start
    isMoving: false
})

const brightness = ref(1) // 1.0 = 100%

// Brightness & Volume Icons
import { Sun, Moon } from 'lucide-vue-next'

const onTouchStart = (e: TouchEvent) => {
    if (isSettingsOpen.value) return
    const touch = e.touches[0]
    const rect = playerContainerRef.value?.getBoundingClientRect()
    if (!rect) return
    
    touchState.value = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
        activeType: null,
        startValue: 0,
        isMoving: false
    }

    // Determine zone immediately (Left 50% = Brightness, Right 50% = Volume)
    // We only activate if the user drags VERTICALLY.
    const x = touch.clientX - rect.left
    const width = rect.width
    
    if (x < width / 2) {
        touchState.value.activeType = 'brightness'
        touchState.value.startValue = brightness.value
    } else {
        touchState.value.activeType = 'volume'
        touchState.value.startValue = volume.value
    }
}

const onTouchMove = (e: TouchEvent) => {
    if (isSettingsOpen.value || !touchState.value.activeType || !player.value) return
    
    const touch = e.touches[0]
    const deltaY = touchState.value.startY - touch.clientY // Up is positive
    const deltaX = touch.clientX - touchState.value.startX
    
    // Threshold to detect "Swipe" vs "Tap/Scroll"
    if (!touchState.value.isMoving) {
        if (Math.abs(deltaY) > 10 && Math.abs(deltaY) > Math.abs(deltaX)) {
            touchState.value.isMoving = true
            // Disable native scroll if needed? preventDefault handled by wrapper if possible
            if (e.cancelable) e.preventDefault()
        } else {
            return // Not valid swipe yet
        }
    }
    
    if (e.cancelable) e.preventDefault() // Lock scroll
    
    const rect = playerContainerRef.value!.getBoundingClientRect()
    const percentChange = deltaY / (rect.height * 0.8) // Full swipe = 100% change safely
    
    if (touchState.value.activeType === 'brightness') {
        let newVal = touchState.value.startValue + percentChange
        newVal = Math.min(1, Math.max(0.1, newVal)) // Min 0.1 brightness
        brightness.value = newVal
        showOsd(Sun, `${Math.round(newVal * 100)}%`)
    } else if (touchState.value.activeType === 'volume') {
        let newVal = touchState.value.startValue + percentChange
        newVal = Math.min(1, Math.max(0, newVal))
        volume.value = newVal
        player.value.volume(newVal)
        isMuted.value = newVal === 0
        showOsd(newVal === 0 ? VolumeX : Volume2, `${Math.round(newVal * 100)}%`)
    }
}

const onTouchEnd = (e: TouchEvent) => {
    // If we moved, it was a gesture, so we stop here.
    if (touchState.value.isMoving) {
        touchState.value.isMoving = false
        touchState.value.activeType = null
        // Restart auto-hide timer after gesture
        resetControlsTimer()
        e.stopPropagation() // Prevent click
        return
    }
    
    // Otherwise, treat as Tap (pass through to Click Handler via event bubbling)
    // Reset timer for any touch interaction
    resetControlsTimer()
}


// Intelligent Click/Tap Handler
let lastTapTime = 0
let singleTapTimeout: any

const handleZoneClick = (e: MouseEvent) => {
    // If it was a swipe, ignore click
    if (touchState.value.isMoving) return 

    if (isSettingsOpen.value) {
        isSettingsOpen.value = false
        return
    }

    e.stopPropagation() 
    const now = Date.now()
    const isDoubleTap = (now - lastTapTime) < 300
    lastTapTime = now

    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const width = rect.width
    const percent = (x / width) * 100

    if (isDoubleTap) {
        clearTimeout(singleTapTimeout)
        vibrate()
        if (percent < 30) {
            if (player.value) {
                player.value.currentTime(Math.max(0, player.value.currentTime() - 10))
                showOsd(ChevronsLeft, '-10s')
                resetControlsTimer()
            }
        } else if (percent > 70) {
            if (player.value) {
                player.value.currentTime(Math.min(duration.value, player.value.currentTime() + 10))
                showOsd(ChevronsRight, '+10s')
                resetControlsTimer()
            }
        } else {
            toggleFullscreen()
        }
    } else {
        const isTouch = window.matchMedia('(pointer: coarse)').matches
        if (isTouch) {
            // Mobile: Toggle controls visibility
            showControlsForce.value = !showControlsForce.value
            // Always reset timer (whether showing or hiding)
            resetControlsTimer()
        } else {
            togglePlay()
            showOsd(isPlaying.value ? Play : Pause, isPlaying.value ? 'Play' : 'Pause')
        }
    }
}

const handleKeydown = (e: KeyboardEvent) => {
    if (!player.value) return
    if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return

    if (e.code === 'Escape' && isSettingsOpen.value) {
        isSettingsOpen.value = false
        return
    }

    resetControlsTimer()

    switch(e.code) {
        case 'Space': case 'KeyK': e.preventDefault(); togglePlay(); showOsd(isPlaying.value ? Play : Pause, isPlaying.value ? 'Play' : 'Pause'); break
        case 'ArrowLeft': e.preventDefault(); player.value.currentTime(player.value.currentTime() - 5); showOsd(ChevronRight, '-5s'); break
        case 'ArrowRight': e.preventDefault(); player.value.currentTime(player.value.currentTime() + 5); showOsd(ChevronRight, '+5s'); break
        case 'ArrowUp': e.preventDefault(); const vUp = Math.min(1, player.value.volume() + 0.1); player.value.volume(vUp); if(vUp>0) isMuted.value=false; showOsd(vUp===0?VolumeX:Volume2, `${Math.round(vUp*100)}%`); break
        case 'ArrowDown': e.preventDefault(); const vDn = Math.max(0, player.value.volume() - 0.1); player.value.volume(vDn); showOsd(vDn===0?VolumeX:Volume2, `${Math.round(vDn*100)}%`); break
        case 'KeyF': e.preventDefault(); toggleFullscreen(); break
        case 'KeyM': e.preventDefault(); toggleMute(); showOsd(isMuted.value?VolumeX:Volume2, isMuted.value?'Muted':'Unmuted'); break
        case 'KeyI': e.preventDefault(); toggleStats(); break
    }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
    <div 
        ref="playerContainerRef"
        class="group relative w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl isolate aspect-video font-sans select-none"
        :class="{'fixed inset-0 z-[100] rounded-none': isFullscreen}"
        @mousemove="onMouseMove"
        @mouseleave="onMouseLeave"
        @contextmenu.prevent
    >
        <div data-vjs-player class="w-full h-full pointer-events-none">
             <!-- Apply Brightness Filter -->
             <video ref="videoRef" class="video-js w-full h-full object-contain" :style="{ filter: `brightness(${brightness})` }" playsinline />
        </div>

        <!-- Touch / Click Zone -->
        <div 
            class="absolute inset-0 z-10 bg-transparent cursor-pointer touch-none" 
            @click="handleZoneClick"
            @touchstart="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
        ></div>
        
        <!-- Setting Menu Backdrop -->
        <div 
            v-if="isSettingsOpen" 
            class="absolute inset-0 z-50 bg-transparent cursor-default" 
            @click="isSettingsOpen = false"
        ></div>

        <!-- Live Stats Panel (Toggle with 'i' key) -->
        <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 -translate-x-4"
            enter-to-class="opacity-100 translate-x-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-x-0"
            leave-to-class="opacity-0 -translate-x-4"
        >
            <div 
                v-if="showStats" 
                class="absolute top-2 left-2 md:top-4 md:left-4 z-[70] bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-2 md:p-3 text-white font-mono text-[10px] md:text-xs shadow-xl pointer-events-auto min-w-[180px] md:min-w-[220px]"
            >
                <div class="flex items-center justify-between mb-2 pb-1 border-b border-white/10">
                    <div class="flex items-center gap-1.5">
                        <BarChart3 class="w-3 h-3 md:w-4 md:h-4 text-indigo-400" />
                        <span class="font-semibold text-[10px] md:text-xs uppercase tracking-wider text-white/70">Stats</span>
                    </div>
                    <button @click="showStats = false; stopStatsUpdate()" class="p-0.5 hover:bg-white/10 rounded transition-colors">
                        <X class="w-3 h-3" />
                    </button>
                </div>
                <div class="space-y-1">
                    <div class="flex justify-between">
                        <span class="text-white/50">Resolution</span>
                        <span class="text-green-400">{{ stats.resolution }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-white/50">Quality</span>
                        <span class="text-indigo-400">{{ stats.currentQuality }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-white/50">Bitrate</span>
                        <span class="text-cyan-400">{{ stats.bitrate }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-white/50">Buffer</span>
                        <span :class="stats.bufferHealth > 3 ? 'text-green-400' : stats.bufferHealth > 1 ? 'text-yellow-400' : 'text-red-400'">{{ stats.bufferHealth }}s</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-white/50">Downloaded</span>
                        <span class="text-blue-400">{{ stats.bufferedMB }} MB</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-white/50">Dropped</span>
                        <span :class="stats.droppedFrames > 0 ? 'text-red-400' : 'text-green-400'">{{ stats.droppedFrames }} / {{ stats.totalFrames }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-white/50">Speed</span>
                        <span class="text-purple-400 animate-pulse">{{ stats.downloadSpeed }}</span>
                    </div>
                </div>
                <div class="mt-2 pt-1 border-t border-white/10 text-[8px] md:text-[10px] text-white/30 text-center">
                    Press 'i' to close
                </div>
            </div>
        </Transition>

        <!-- Custom Settings Menu (Overlay) -->
        <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 translate-y-4 md:translate-y-0 md:scale-95"
            enter-to-class="opacity-100 translate-y-0 md:scale-100"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0 md:scale-100"
            leave-to-class="opacity-0 translate-y-4 md:translate-y-0 md:scale-95"
        >
            <div 
                v-if="isSettingsOpen" 
                class="absolute z-[60] bottom-14 right-2 md:bottom-20 md:right-4 w-60 md:w-64 max-h-[70%] md:max-h-[80%] overflow-hidden flex flex-col bg-black/95 backdrop-blur-xl border border-white/10 shadow-3xl rounded-xl text-white pointer-events-auto"
            >
                <div class="flex items-center justify-between px-3 py-2 border-b border-white/10 shrink-0">
                    <span class="text-xs font-semibold text-white/60 uppercase tracking-wider">Settings</span>
                    <button @click="isSettingsOpen = false" class="p-1 hover:bg-white/10 rounded-full transition-colors">
                        <X class="w-4 h-4" />
                    </button>
                </div>
                <div class="overflow-y-auto custom-scrollbar p-2 space-y-3">
                    <div class="flex items-center justify-between px-2">
                        <span class="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Bitrate</span>
                        <div class="flex items-center gap-1.5" v-if="currentBitrate">
                            <Activity class="w-3 h-3 text-indigo-400" />
                            <span class="text-xs font-mono text-indigo-100">{{ currentBitrate }}</span>
                        </div>
                         <span v-else class="text-xs text-white/30">-</span>
                    </div>
                    <div>
                        <div class="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2 px-1">Speed</div>
                        <div class="grid grid-cols-4 gap-1">
                            <button v-for="rate in playbackRates" :key="rate" @click="setPlaybackRate(rate)" class="px-1 py-1.5 text-xs font-medium rounded transition-colors hover:bg-white/10" :class="rate === playbackRate ? 'bg-indigo-600 text-white' : 'text-white/70'">{{ rate }}x</button>
                        </div>
                    </div>
                    <div>
                        <div class="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2 px-1">Quality</div>
                        <div class="space-y-0.5">
                                <button v-for="q in displayQualityLevels" :key="q.index" @click="!q.isPlaceholder && setQuality(q.index)" class="w-full px-2 py-2 text-xs text-left rounded hover:bg-white/10 flex items-center justify-between" :class="selectedQuality === q.index ? 'text-indigo-300' : 'text-white/80'">
                                <div class="flex flex-col">
                                    <span>{{ q.label }}</span>
                                    <span v-if="q.bitrate" class="text-[10px] text-white/40 font-mono">{{ formatBitrate(q.bitrate) }}</span>
                                </div>
                                <Check v-if="selectedQuality === q.index" class="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>

        <!-- OSD / Notifications -->
        <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 scale-75"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-75"
        >
            <div v-if="osd.visible" class="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                <div class="bg-black/60 backdrop-blur-md px-6 py-4 rounded-full flex flex-col items-center gap-2 text-white shadow-2xl border border-white/10 min-w-[100px]">
                    <component :is="osd.icon" v-if="osd.icon" class="w-8 h-8" :class="{'rotate-180': osd.text === '-5s' && osd.icon === ChevronRight}" />
                    <span class="font-bold text-lg tracking-wide">{{ osd.text }}</span>
                </div>
            </div>
        </Transition>

        <div v-if="isBuffering" class="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
             <div class="bg-black/40 backdrop-blur-sm p-4 rounded-full">
                <Loader2 class="w-10 h-10 text-white animate-spin" />
             </div>
        </div>
             
         <!-- Center Controls (Compact) -->
         <div 
            class="absolute inset-0 z-20 flex items-center justify-center pointer-events-none transition-all duration-300"
            :class="(!isPlaying || showControls) ? 'opacity-100 visible' : 'opacity-0 invisible'"
         >
             <div class="flex items-center gap-6 md:gap-12 pointer-events-auto">
                 <!-- Reduced padding for mobile buttons significantly (p-2) to make them smaller -->
                <button @click.stop="seek([currentTime - 10]); showOsd(RotateCcw, '-10s'); vibrate()" class="p-2 md:p-6 rounded-full bg-black/40 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 shadow-lg transition-all hover:scale-105 active:scale-95 touch-manipulation z-50">
                    <RotateCcw class="w-5 h-5 md:w-10 md:h-10 fill-white/10" />
                </button>
                <button @click.stop="togglePlay" class="bg-indigo-600/90 hover:bg-indigo-500 backdrop-blur-md p-3 md:p-8 rounded-full border border-white/10 shadow-2xl transform transition-all hover:scale-110 active:scale-95 touch-manipulation z-50 flex items-center justify-center">
                    <Play v-if="!isPlaying" class="w-6 h-6 md:w-14 md:h-14 text-white fill-white ml-0.5" />
                    <Pause v-else class="w-6 h-6 md:w-14 md:h-14 text-white fill-white" />
                </button>
                <button @click.stop="seek([currentTime + 10]); showOsd(RotateCw, '+10s'); vibrate()" class="p-2 md:p-6 rounded-full bg-black/40 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 shadow-lg transition-all hover:scale-105 active:scale-95 touch-manipulation z-50">
                    <RotateCw class="w-5 h-5 md:w-10 md:h-10 fill-white/10" />
                </button>
             </div>
        </div>

        <!-- Bottom Controls -->
        <div 
            class="absolute bottom-0 left-0 right-0 z-30 pt-10 md:pt-24 pb-1 md:pb-6 px-3 md:px-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-all duration-300 pointer-events-none"
            :class="showControls ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-4'"
        >
            <div class="pointer-events-auto flex flex-col gap-1 md:gap-2">
                 <!-- Seek Bar -->
                 <div class="relative group/slider w-full flex items-center h-4 md:h-5">
                     <SliderRoot v-model:modelValue="sliderValue" :max="duration" :step="0.1" class="relative flex items-center select-none touch-none w-full h-5 cursor-pointer z-50" @valueCommit="seek">
                        <SliderTrack class="bg-white/20 relative grow rounded-full h-[3px] md:h-[4px] group-hover/slider:h-[6px] transition-all overflow-hidden">
                            <div class="absolute top-0 bottom-0 left-0 bg-white/30 transition-all duration-500 ease-out" :style="{ width: `${bufferedPercent}%` }"></div>
                            <SliderRange class="absolute bg-indigo-500 rounded-full h-full" />
                        </SliderTrack>
                        <SliderThumb class="block w-4 h-4 bg-white shadow-lg rounded-full hover:bg-gray-50 focus:outline-none ring-4 ring-transparent hover:ring-white/30 transition-all scale-0 group-hover/slider:scale-100" />
                     </SliderRoot>
                 </div>

                <!-- Buttons Row -->
                <div class="flex items-center justify-between">
                     <div class="flex items-center gap-3">
                        <div class="text-white/90 text-[10px] md:text-sm font-medium font-mono">
                            <span class="text-white">{{ formatTime(currentTime) }}</span>
                            <span class="text-white/50 mx-1">/</span>
                            <span>{{ formatTime(duration) }}</span>
                        </div>
                        
                        <div class="hidden md:flex items-center gap-2 group/vol">
                            <button @click.stop="toggleMute" class="text-white hover:text-indigo-400 transition-colors focus:outline-none">
                                <VolumeX v-if="isMuted || volume === 0" class="w-5 h-5" />
                                <Volume2 v-else class="w-5 h-5" />
                            </button>
                            <div class="w-0 overflow-hidden group-hover/vol:w-24 transition-all duration-300 ease-out">
                                <SliderRoot :modelValue="[isMuted ? 0 : volume]" :max="1" :step="0.01" class="relative flex items-center select-none touch-none w-20 h-5 cursor-pointer ml-2" @valueCommit="changeVolume">
                                    <SliderTrack class="bg-white/20 relative grow rounded-full h-[3px]">
                                        <SliderRange class="absolute bg-white rounded-full h-full" />
                                    </SliderTrack>
                                    <SliderThumb class="block w-3 h-3 bg-white shadow rounded-full" />
                                </SliderRoot>
                            </div>
                        </div>
                     </div>

                     <div class="flex items-center gap-2">
                         <div v-if="currentBitrate" class="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-md border border-white/5">
                             <Activity class="w-3 h-3 text-indigo-400" />
                             <span class="text-[10px] font-mono font-medium text-white/90 tracking-wide">{{ currentBitrate }}</span>
                         </div>

                         <!-- Stats Toggle (for mobile and desktop) -->
                         <button 
                             @click.stop="toggleStats" 
                             class="p-1.5 md:p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors focus:outline-none touch-manipulation"
                             :class="showStats ? 'text-indigo-400 bg-white/10' : ''"
                             title="Toggle Stats (i)"
                         >
                             <BarChart3 class="w-4 h-4 md:w-5 md:h-5" />
                         </button>
                        
                        <!-- Settings Toggle -->
                        <button 
                            @click.stop="isSettingsOpen = !isSettingsOpen" 
                            class="p-1.5 md:p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors focus:outline-none touch-manipulation"
                            :class="isSettingsOpen ? 'text-white bg-white/10' : ''"
                        >
                            <Settings class="w-4 h-4 md:w-5 md:h-5" />
                        </button>

                        <button @click.stop="toggleFullscreen" class="p-1.5 md:p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors focus:outline-none touch-manipulation">
                            <Minimize v-if="isFullscreen" class="w-4 h-4 md:w-5 md:h-5" />
                            <Maximize v-else class="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                     </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 3px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
}
</style>
