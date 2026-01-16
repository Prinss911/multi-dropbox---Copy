import { ref, onMounted, onUnmounted, Ref } from 'vue'
import { useToast } from '~/composables/useToast'

export function useFileUpload(currentPath: Ref<string>, refreshFiles: () => Promise<void>) {
  const { toast } = useToast()
  const supabase = useSupabaseClient()
  
  // State
  const isDragging = ref(false)
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const uploadingFileName = ref('')
  const uploadedCount = ref(0)
  const totalUploadCount = ref(0)
  const uploadError = ref('')
  const fileInput = ref<HTMLInputElement | null>(null)
  
  // Configuration
  const CHUNK_SIZE = 8 * 1024 * 1024 // 8MB chunks
  const LARGE_FILE_THRESHOLD = 150 * 1024 * 1024 // 150MB
  const MAX_RETRIES = 3

  // Wake Lock & Network
  let wakeLock: WakeLockSentinel | null = null
  const isOnline = ref(true)

  // Wake Lock helpers
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLock = await (navigator as any).wakeLock.request('screen')
      }
    } catch (err) {
      console.warn('Wake lock not available:', err)
    }
  }

  const releaseWakeLock = () => {
    if (wakeLock) {
      wakeLock.release()
      wakeLock = null
    }
  }

  // Network helpers
  const waitForOnline = (timeoutMs: number = 30000): Promise<boolean> => {
    if (import.meta.server) return Promise.resolve(true)
    return new Promise((resolve) => {
      if (navigator.onLine) {
        resolve(true)
        return
      }
      const timeout = setTimeout(() => {
        window.removeEventListener('online', onOnline)
        resolve(false)
      }, timeoutMs)
      const onOnline = () => {
        clearTimeout(timeout)
        window.removeEventListener('online', onOnline)
        resolve(true)
      }
      window.addEventListener('online', onOnline)
    })
  }

  const withRetry = async <T>(
    fn: () => Promise<T>,
    maxRetries: number = MAX_RETRIES,
    delayMs: number = 1000
  ): Promise<T> => {
    let lastError: Error | null = null
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        if (!isOnline.value) {
          const backOnline = await waitForOnline()
          if (!backOnline) throw new Error('Network offline timeout')
        }
        return await fn()
      } catch (err: any) {
        lastError = err
        if (!navigator.onLine) await waitForOnline()
        if (attempt < maxRetries - 1) {
          await new Promise(r => setTimeout(r, delayMs * Math.pow(2, attempt)))
        }
      }
    }
    throw lastError
  }

  // Upload Logic
  const sanitizeFilename = (name: string): string => name.replace(/[<>:"/\\|?*]/g, '_')

  const uploadSmallFile = async (file: File, accessToken: string, uploadPath: string, onProgress: (p: number) => void): Promise<{ path_display: string }> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', 'https://content.dropboxapi.com/2/files/upload')
      xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`)
      xhr.setRequestHeader('Dropbox-API-Arg', JSON.stringify({
        path: uploadPath,
        mode: 'add',
        autorename: true,
        mute: false
      }))
      xhr.setRequestHeader('Content-Type', 'application/octet-stream')
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress((e.loaded / e.total) * 100)
      }
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try { resolve(JSON.parse(xhr.responseText)) } catch { resolve({ path_display: uploadPath }) }
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`))
        }
      }
      
      xhr.onerror = () => reject(new Error('Network error'))
      xhr.send(file)
    })
  }

  const uploadLargeFile = async (file: File, accessToken: string, uploadPath: string, onProgress: (p: number) => void): Promise<{ path_display: string }> => {
    // Session Start
    const startChunk = file.slice(0, Math.min(CHUNK_SIZE, file.size))
    const startRes = await fetch('https://content.dropboxapi.com/2/files/upload_session/start', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Dropbox-API-Arg': JSON.stringify({ close: false }),
        'Content-Type': 'application/octet-stream'
      },
      body: startChunk
    })
    if (!startRes.ok) throw new Error(`Start session failed: ${startRes.status}`)
    
    const startData = await startRes.json()
    const sessionId = startData.session_id
    let offset = startChunk.size
    onProgress((offset / file.size) * 100)

    // Append Chunks
    while (offset < file.size - CHUNK_SIZE) {
      const chunk = file.slice(offset, offset + CHUNK_SIZE)
      const appendRes = await fetch('https://content.dropboxapi.com/2/files/upload_session/append_v2', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Dropbox-API-Arg': JSON.stringify({
            cursor: { session_id: sessionId, offset },
            close: false
          }),
          'Content-Type': 'application/octet-stream'
        },
        body: chunk
      })
      if (!appendRes.ok) throw new Error(`Append failed: ${appendRes.status}`)
      offset += chunk.size
      onProgress((offset / file.size) * 100)
    }

    // Finish
    const finalChunk = file.slice(offset)
    const finishRes = await fetch('https://content.dropboxapi.com/2/files/upload_session/finish', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Dropbox-API-Arg': JSON.stringify({
          cursor: { session_id: sessionId, offset },
          commit: { path: uploadPath, mode: 'add', autorename: true, mute: false }
        }),
        'Content-Type': 'application/octet-stream'
      },
      body: finalChunk
    })
    if (!finishRes.ok) throw new Error(`Finish failed: ${finishRes.status}`)
    
    const result = await finishRes.json()
    onProgress(100)
    return result
  }

  const processUpload = async (filesToUpload: File[]) => {
    if (filesToUpload.length === 0) return
    
    await requestWakeLock()
    isUploading.value = true
    uploadProgress.value = 0
    uploadedCount.value = 0
    totalUploadCount.value = filesToUpload.length
    uploadError.value = ''
    
    const failedFiles: string[] = []

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const headers: Record<string, string> = session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}
      
      const allocation = await withRetry(() => $fetch<{
        success: boolean
        allocations: { index: number; accountId: string; accessToken: string }[]
      }>('/api/upload/allocate', {
        method: 'POST',
        headers,
        body: { files: filesToUpload.map((f, i) => ({ index: i, name: f.name, size: f.size })) }
      }))
      
      if (!allocation.success) throw new Error('Allocation failed')
      
      const CONCURRENCY_LIMIT = 5
      const queue = allocation.allocations.map(alloc => ({ file: filesToUpload[alloc.index], alloc }))
      const fileProgressMap = new Map<number, number>()

      const processSingleFile = async (item: { file: File, alloc: any }) => {
        const { file, alloc } = item
        const index = filesToUpload.indexOf(file)
        
        try {
          uploadingFileName.value = file.name
          const basePath = currentPath.value === '/' ? '/uploads' : currentPath.value
          const uploadPath = `${basePath}/${sanitizeFilename(file.name)}`
          const uploadFn = file.size > LARGE_FILE_THRESHOLD ? uploadLargeFile : uploadSmallFile
          
          const dropboxResult = await withRetry(() => 
            uploadFn(file, alloc.accessToken, uploadPath, (percent) => {
              fileProgressMap.set(index, percent)
              const totalPercent = Array.from(fileProgressMap.values()).reduce((a, b) => a + b, 0)
              uploadProgress.value = (totalPercent / filesToUpload.length)
            })
          )
          
          await withRetry(() => $fetch('/api/dropbox/record-upload', {
            method: 'POST',
            headers,
            body: {
              filename: file.name,
              dropboxPath: dropboxResult.path_display || uploadPath,
              size: file.size,
              contentType: file.type || 'application/octet-stream',
              dropboxAccountId: alloc.accountId
            }
          }))
          
          uploadedCount.value++
        } catch (err: any) {
          console.error(`Failed to upload ${file.name}:`, err)
          failedFiles.push(file.name)
        }
      }

      const activePromises: Promise<void>[] = []
      for (const item of queue) {
        const p = processSingleFile(item).then(() => {
          activePromises.splice(activePromises.indexOf(p), 1)
        })
        activePromises.push(p)
        if (activePromises.length >= CONCURRENCY_LIMIT) await Promise.race(activePromises)
      }
      await Promise.all(activePromises)
      
      if (failedFiles.length > 0) {
        uploadError.value = `${failedFiles.length} file(s) failed`
      }
      
      await refreshFiles()
      
    } catch (err: any) {
      uploadError.value = err.message || 'Upload failed'
    } finally {
      isUploading.value = false
      releaseWakeLock()
    }
  }

  // External Drag Handlers
  const handleExternalDragOver = (e: DragEvent) => {
    if (e.dataTransfer?.types.includes('Files')) {
      isDragging.value = true
    }
  }

  const handleExternalDragLeave = () => {
    isDragging.value = false
  }

  const handleDrop = (e: DragEvent) => {
    isDragging.value = false
    const droppedFiles = e.dataTransfer?.files
    if (droppedFiles && droppedFiles.length > 0) {
      processUpload(Array.from(droppedFiles))
    }
  }

  const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
      processUpload(Array.from(target.files))
      target.value = ''
    }
  }

  const triggerFileInput = () => {
    fileInput.value?.click()
  }

  // Lifecycle
  onMounted(() => {
    isOnline.value = navigator.onLine
    window.addEventListener('online', () => isOnline.value = true)
    window.addEventListener('offline', () => isOnline.value = false)
    window.addEventListener('beforeunload', (e) => {
      if (isUploading.value) {
        e.preventDefault()
        e.returnValue = 'Upload in progress'
      }
    })
  })

  onUnmounted(() => {
    releaseWakeLock()
  })

  return {
    isDragging,
    isUploading,
    uploadProgress,
    uploadingFileName,
    uploadedCount,
    totalUploadCount,
    uploadError,
    fileInput,
    handleExternalDragOver,
    handleExternalDragLeave,
    handleDrop,
    handleFileSelect,
    triggerFileInput
  }
}
