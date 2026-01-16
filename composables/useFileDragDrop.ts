import { ref } from 'vue'
import { useToast } from '~/composables/useToast'

export function useFileDragDrop(refreshFiles: () => Promise<void>) {
  const { toast } = useToast()
  const supabase = useSupabaseClient()
  
  // State
  const draggedFile = ref<any | null>(null)
  const dropTargetId = ref<string | null>(null)
  const isMoving = ref(false)
  const isLongPress = ref(false)
  const longPressTimer = ref<any>(null)

  // Long Press Logic
  const startLongPress = (e: MouseEvent, file: any) => {
    // Only left click
    if (e.button !== 0) return
    
    const target = e.currentTarget as HTMLElement

    longPressTimer.value = setTimeout(() => {
      isLongPress.value = true
      if (navigator.vibrate) navigator.vibrate(50)
      // Visual indicator that drag is ready
      target.classList.add('ring-2', 'ring-blue-400', 'scale-[1.02]')
    }, 400) // 400ms delay for long press
  }

  const cancelLongPress = (e?: Event) => {
    if (longPressTimer.value) {
      clearTimeout(longPressTimer.value)
      longPressTimer.value = null
    }
    
    if (isLongPress.value) {
      // If it was active, remove visual indicator from current target context if possible
      if (e && e.currentTarget) {
         (e.currentTarget as HTMLElement).classList.remove('ring-2', 'ring-blue-400', 'scale-[1.02]')
      }
    }
    
    if (!draggedFile.value) {
        isLongPress.value = false
    }
  }

  // Drag & Drop Handlers
  const handleDragStart = (event: DragEvent, file: any) => {
    // Enforce long press
    if (!isLongPress.value) {
      event.preventDefault()
      return
    }

    event.stopPropagation() // Prevent triggering parent's drag handlers
    draggedFile.value = file
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('application/x-file-move', file.id) // Custom type to distinguish from file upload
    }
    // Add visual feedback
    const target = event.target as HTMLElement
    target.style.opacity = '0.5'
  }

  const handleDragEnd = (event: DragEvent) => {
    draggedFile.value = null
    dropTargetId.value = null
    isLongPress.value = false // Reset state
    
    const target = event.target as HTMLElement
    target.style.opacity = '1'
    target.classList.remove('ring-2', 'ring-blue-400', 'scale-[1.02]')
  }

  const handleDragOver = (event: DragEvent, file: any) => {
    if (!draggedFile.value) return
    if (file.type !== 'folder') return
    if (draggedFile.value.id === file.id) return
    
    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
    dropTargetId.value = file.id
  }

  const handleDragLeave = (_event: DragEvent) => {
    dropTargetId.value = null
  }

  // Move file logic
  const moveFile = async (file: any, targetFolder: any) => {
    isMoving.value = true
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      // Determine the new virtual folder path
      const newVirtualFolder = targetFolder.path === '/' 
        ? null // Root folder = no virtual folder
        : targetFolder.name // Use folder name as virtual folder
      
      console.log('[Move] Organizing file:', {
        fileId: file.id,
        fileName: file.name,
        targetFolder: newVirtualFolder
      })
      
      await $fetch('/api/files/update-folder', {
        method: 'POST',
        body: {
          fileId: file.id,
          virtualFolder: newVirtualFolder
        },
        headers: session?.access_token 
          ? { Authorization: `Bearer ${session.access_token}` } 
          : undefined
      })
      
      console.log(`[Move] Success: "${file.name}" -> "${targetFolder.name}"`)
      toast.success(`Moved "${file.name}" to "${targetFolder.name}"`)
      
      await refreshFiles()
      
    } catch (err: any) {
      console.error('[Move] Failed:', err)
      toast.error('Failed to organize file', err.data?.statusMessage || err.message || 'Unknown error')
    } finally {
      isMoving.value = false
    }
  }

  const handleFileDrop = async (event: DragEvent, targetFolder: any) => {
    event.preventDefault()
    dropTargetId.value = null
    
    if (!draggedFile.value) return
    if (targetFolder.type !== 'folder') return
    if (draggedFile.value.id === targetFolder.id) return
    
    // Prevent moving folder into itself
    if (targetFolder.path.startsWith(draggedFile.value.path + '/')) {
      toast.error('Cannot move a folder into itself')
      draggedFile.value = null
      return
    }
    
    await moveFile(draggedFile.value, targetFolder)
    draggedFile.value = null
  }

  const handleBreadcrumbDrop = async (event: DragEvent, crumb: { name: string; path: string; isVirtual: boolean }) => {
    const target = event.currentTarget as HTMLElement
    target.classList.remove('bg-blue-100', 'text-blue-600', 'dark:bg-blue-900/40', 'dark:text-blue-400')
    
    if (!draggedFile.value) return
  
    // Create a pseudo-folder entry for the move logic
    const targetFolder = {
        id: crumb.path === '/' ? 'root' : `vf-${crumb.name}`,
        name: crumb.name,
        path: crumb.path,
        type: 'folder' as const,
        isVirtual: crumb.isVirtual,
        size: 0,
        modified: '',
        extension: null,
        accountId: ''
    }
  
    await moveFile(draggedFile.value, targetFolder)
    draggedFile.value = null
  }

  const removeFromFolder = async (file: any) => {
    if (!file.virtualFolder) return
    
    isMoving.value = true
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      await $fetch('/api/files/update-folder', {
        method: 'POST',
        body: {
          fileId: file.id,
          virtualFolder: null // Remove from folder
        },
        headers: session?.access_token 
          ? { Authorization: `Bearer ${session.access_token}` } 
          : undefined
      })
      
      console.log(`[Move] Removed "${file.name}" from folder`)
      toast.success(`Removed "${file.name}" from folder`)
      await refreshFiles()
      
    } catch (err: any) {
      console.error('[Move] Failed to remove from folder:', err)
      toast.error('Failed to remove from folder', err.data?.statusMessage || err.message || 'Unknown error')
    } finally {
      isMoving.value = false
    }
  }

  return {
    draggedFile,
    dropTargetId,
    isMoving,
    isLongPress,
    startLongPress,
    cancelLongPress,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleFileDrop,
    handleBreadcrumbDrop,
    removeFromFolder
  }
}
