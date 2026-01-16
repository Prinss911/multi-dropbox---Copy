import { ref, computed, type Ref } from 'vue'

export function useFileSelection(files: Ref<any[]>) {
  const selectedFiles = ref<Set<string>>(new Set())

  const isAllSelected = computed(() => {
    const currentFiles = files.value.filter(f => f.type !== 'folder')
    return currentFiles.length > 0 && currentFiles.every(f => selectedFiles.value.has(f.id))
  })

  const isPartiallySelected = computed(() => {
    const currentFiles = files.value.filter(f => f.type !== 'folder')
    const selectedCount = currentFiles.filter(f => selectedFiles.value.has(f.id)).length
    return selectedCount > 0 && selectedCount < currentFiles.length
  })

  const selectedCount = computed(() => selectedFiles.value.size)

  const toggleSelectAll = () => {
    const currentFiles = files.value.filter(f => f.type !== 'folder')
    if (isAllSelected.value) {
      // Deselect all
      currentFiles.forEach(f => selectedFiles.value.delete(f.id))
    } else {
      // Select all
      currentFiles.forEach(f => selectedFiles.value.add(f.id))
    }
    // Force reactivity
    selectedFiles.value = new Set(selectedFiles.value)
  }

  const toggleFileSelection = (file: any) => {
    if (file.type === 'folder') return
    
    if (selectedFiles.value.has(file.id)) {
      selectedFiles.value.delete(file.id)
    } else {
      selectedFiles.value.add(file.id)
    }
    // Force reactivity
    selectedFiles.value = new Set(selectedFiles.value)
  }

  const clearSelection = () => {
    selectedFiles.value = new Set()
  }

  return {
    selectedFiles,
    isAllSelected,
    isPartiallySelected,
    selectedCount,
    toggleSelectAll,
    toggleFileSelection,
    clearSelection
  }
}
