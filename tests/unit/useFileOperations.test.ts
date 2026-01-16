import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useFileOperations } from '../../composables/useFileOperations'

// Mocks
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn()
}

const mockSupabase = {
  auth: {
    getSession: vi.fn().mockResolvedValue({
      data: {
        session: { access_token: 'mock-token' }
      }
    })
  }
}

vi.mock('../../composables/useToast', () => ({
  useToast: () => ({ toast: mockToast })
}))

// Stub global useSupabaseClient
const mockSupabaseClient = () => mockSupabase
vi.stubGlobal('useSupabaseClient', mockSupabaseClient)
vi.stubGlobal('$fetch', vi.fn())

describe('useFileOperations', () => {
  let files: any
  let selectedFiles: any
  let refreshFiles: any
  let clearSelection: any

  beforeEach(() => {
    vi.clearAllMocks()
    files = ref([])
    selectedFiles = ref(new Set())
    refreshFiles = vi.fn().mockResolvedValue(undefined)
    clearSelection = vi.fn()
  })

  describe('createFolder', () => {
    it('should create a folder successfully', async () => {
      const { createFolder, newFolderName, createFolderModalOpen } = useFileOperations(
        files,
        selectedFiles,
        refreshFiles,
        clearSelection
      )

      newFolderName.value = 'New Folder'
      createFolderModalOpen.value = true
      
      // Mock successful fetch
      ;(global.$fetch as any).mockResolvedValue({ success: true })

      await createFolder()

      expect(global.$fetch).toHaveBeenCalledWith('/api/folder/create', expect.objectContaining({
        method: 'POST',
        body: { name: 'New Folder' }
      }))
      expect(refreshFiles).toHaveBeenCalled()
      expect(createFolderModalOpen.value).toBe(false)
      expect(newFolderName.value).toBe('')
      expect(mockToast.success).toHaveBeenCalledWith('Folder "New Folder" created')
    })

    it('should handle folder creation error', async () => {
      const { createFolder, newFolderName } = useFileOperations(
        files,
        selectedFiles,
        refreshFiles,
        clearSelection
      )

      newFolderName.value = 'Error Folder'
      
      // Mock error
      ;(global.$fetch as any).mockRejectedValue({ statusMessage: 'Folder exists' })

      await createFolder()

      expect(mockToast.error).toHaveBeenCalledWith('Failed to create folder', 'Folder exists')
      expect(refreshFiles).not.toHaveBeenCalled()
    })

    it('should not create folder if name is empty', async () => {
        const { createFolder, newFolderName } = useFileOperations(
            files,
            selectedFiles,
            refreshFiles,
            clearSelection
        )
        newFolderName.value = '   '
        await createFolder()
        expect(global.$fetch).not.toHaveBeenCalled()
    })
  })

  describe('handleDelete (Single)', () => {
    it('should delete a file successfully', async () => {
      const { handleDelete, deleteTarget } = useFileOperations(
        files,
        selectedFiles,
        refreshFiles,
        clearSelection
      )

      const fileToDelete = { id: 'file-1', name: 'test.txt' }
      deleteTarget.value = fileToDelete

      ;(global.$fetch as any).mockResolvedValue({ success: true })

      await handleDelete()

      expect(global.$fetch).toHaveBeenCalledWith('/api/files/delete', expect.objectContaining({
        method: 'POST',
        body: { fileId: 'file-1' }
      }))
      expect(refreshFiles).toHaveBeenCalled()
      expect(deleteTarget.value).toBeNull()
      expect(mockToast.success).toHaveBeenCalledWith('File deleted')
    })

    it('should do nothing if no deleteTarget', async () => {
        const { handleDelete } = useFileOperations(
            files,
            selectedFiles,
            refreshFiles,
            clearSelection
          )
          await handleDelete()
          expect(global.$fetch).not.toHaveBeenCalled()
    })
  })

  describe('handleBulkDelete', () => {
      it('should delete multiple files', async () => {
        const { handleBulkDelete } = useFileOperations(
            files,
            selectedFiles,
            refreshFiles,
            clearSelection
        )

        files.value = [
            { id: '1', name: 'f1' },
            { id: '2', name: 'f2' },
            { id: '3', name: 'f3' }
        ]
        selectedFiles.value = new Set(['1', '3'])

        // Mock confirm
        global.confirm = vi.fn(() => true)
        
        // Mock Promise.allSettled behavior manually or just let it run if fetch mocks work
        // We need to mock $fetch calls. Since we expect 2 calls.
        ;(global.$fetch as any).mockResolvedValue({ success: true })

        await handleBulkDelete()

        expect(global.confirm).toHaveBeenCalled()
        expect(global.$fetch).toHaveBeenCalledTimes(2) // for id 1 and 3
        expect(refreshFiles).toHaveBeenCalled()
        expect(clearSelection).toHaveBeenCalled()
        expect(mockToast.success).toHaveBeenCalledWith('2 deleted')
      })

      it('should handle partial failures in bulk delete', async () => {
        const { handleBulkDelete } = useFileOperations(
            files,
            selectedFiles,
            refreshFiles,
            clearSelection
        )

        files.value = [
            { id: '1', name: 'f1' },
            { id: '2', name: 'f2' }
        ]
        selectedFiles.value = new Set(['1', '2'])
        global.confirm = vi.fn(() => true)

        // Mock first success, second fail
        ;(global.$fetch as any)
            .mockResolvedValueOnce({ success: true })
            .mockRejectedValueOnce(new Error('Fail'))

        await handleBulkDelete()

        expect(mockToast.warning).toHaveBeenCalledWith('1 deleted, 1 failed')
        expect(refreshFiles).toHaveBeenCalled()
      })
  })
})
