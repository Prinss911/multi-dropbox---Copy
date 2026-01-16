import { describe, it, expect, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useFileSelection } from '../../composables/useFileSelection'

describe('useFileSelection', () => {
  const mockFiles = [
    { id: '1', name: 'file1.txt', type: 'file' },
    { id: '2', name: 'file2.jpg', type: 'file' },
    { id: '3', name: 'folder1', type: 'folder' }
  ]

  it('should initialize with empty selection', () => {
    const files = ref(mockFiles)
    const { selectedFiles, selectedCount } = useFileSelection(files)
    
    expect(selectedFiles.value.size).toBe(0)
    expect(selectedCount.value).toBe(0)
  })

  it('should toggle selection for a single file', () => {
    const files = ref(mockFiles)
    const { toggleFileSelection, selectedFiles, selectedCount } = useFileSelection(files)

    // Select
    toggleFileSelection(mockFiles[0])
    expect(selectedFiles.value.has('1')).toBe(true)
    expect(selectedCount.value).toBe(1)

    // Deselect
    toggleFileSelection(mockFiles[0])
    expect(selectedFiles.value.has('1')).toBe(false)
    expect(selectedCount.value).toBe(0)
  })

  it('should NOT select folders', () => {
    const files = ref(mockFiles)
    const { toggleFileSelection, selectedFiles } = useFileSelection(files)

    toggleFileSelection(mockFiles[2]) // Folder
    expect(selectedFiles.value.has('3')).toBe(false)
  })

  it('should select all files (excluding folders)', () => {
    const files = ref(mockFiles)
    const { toggleSelectAll, selectedFiles, isAllSelected } = useFileSelection(files)

    toggleSelectAll()
    expect(selectedFiles.value.size).toBe(2) // Only 2 files
    expect(selectedFiles.value.has('1')).toBe(true)
    expect(selectedFiles.value.has('2')).toBe(true)
    expect(selectedFiles.value.has('3')).toBe(false)
    expect(isAllSelected.value).toBe(true)
  })

  it('should deselect all if all are selected', () => {
    const files = ref(mockFiles)
    const { toggleSelectAll, selectedFiles, isAllSelected } = useFileSelection(files)

    // Select All
    toggleSelectAll()
    expect(isAllSelected.value).toBe(true)

    // Deselect All
    toggleSelectAll()
    expect(selectedFiles.value.size).toBe(0)
    expect(isAllSelected.value).toBe(false)
  })

  it('should clear selection', () => {
    const files = ref(mockFiles)
    const { toggleFileSelection, clearSelection, selectedFiles } = useFileSelection(files)

    toggleFileSelection(mockFiles[0])
    expect(selectedFiles.value.size).toBe(1)

    clearSelection()
    expect(selectedFiles.value.size).toBe(0)
  })

  it('should correctly identify partial selection', () => {
    const files = ref(mockFiles)
    const { toggleFileSelection, isPartiallySelected, isAllSelected } = useFileSelection(files)

    toggleFileSelection(mockFiles[0])
    expect(isPartiallySelected.value).toBe(true)
    expect(isAllSelected.value).toBe(false)

    toggleFileSelection(mockFiles[1])
    expect(isPartiallySelected.value).toBe(false) // All selected, not partial
    expect(isAllSelected.value).toBe(true)
  })
})
