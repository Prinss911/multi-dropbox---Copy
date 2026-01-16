import { ref, Ref } from 'vue'
import { useToast } from './useToast'
import { FileEntry } from './useFileBrowser'

export function useFileOperations(
  files: Ref<FileEntry[]>,
  selectedFiles: Ref<Set<string>>,
  refreshFiles: () => Promise<void>,
  clearSelection: () => void
) {
  const { toast } = useToast()
  const supabase = useSupabaseClient()

  // Folder Creation
  const isCreatingFolder = ref(false)
  const newFolderName = ref('')
  const folderError = ref('')
  const createFolderModalOpen = ref(false)

  const createFolder = async () => {
    if (!newFolderName.value.trim()) return
    isCreatingFolder.value = true
    folderError.value = ''
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await $fetch<{ success: boolean, folder: any }>('/api/folder/create', {
        method: 'POST',
        body: { name: newFolderName.value },
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
      })
      await refreshFiles()
      createFolderModalOpen.value = false
      const createdName = newFolderName.value
      newFolderName.value = ''
      toast.success(`Folder "${createdName}" created`)
    } catch (err: any) {
      folderError.value = err.statusMessage || 'Failed to create folder'
      toast.error('Failed to create folder', folderError.value)
    } finally {
      isCreatingFolder.value = false
    }
  }

  // Bulk Delete
  const isBulkDeleting = ref(false)
  const handleBulkDelete = async () => {
    if (selectedFiles.value.size === 0) return
    const count = selectedFiles.value.size
    if (!confirm(`Are you sure you want to delete ${count} file(s)?`)) return
    
    isBulkDeleting.value = true
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const filesToDelete = files.value.filter(f => selectedFiles.value.has(f.id))
      const results = await Promise.allSettled(filesToDelete.map(file => 
        $fetch('/api/files/delete', {
          method: 'POST',
          body: { fileId: file.id },
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
        })
      ))
      const failed = results.filter(r => r.status === 'rejected').length
      failed > 0 ? toast.warning(`${count - failed} deleted, ${failed} failed`) : toast.success(`${count} deleted`)
      await refreshFiles()
      clearSelection()
    } catch (err: any) {
      toast.error('Failed to delete files', err.message)
    } finally {
      isBulkDeleting.value = false
    }
  }

  // Bulk Download
  const isBulkDownloading = ref(false)
  const handleBulkDownload = async () => {
    if (selectedFiles.value.size === 0) return
    isBulkDownloading.value = true
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const headers = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
      const filesToDownload = files.value.filter(f => selectedFiles.value.has(f.id))
      
      for (const file of filesToDownload) {
          const response = await $fetch<{ url: string }>('/api/dropbox/download', {
            method: 'POST',
            body: { path: file.path, accountId: file.accountId },
            headers
          })
          const link = document.createElement('a')
          link.href = response.url
          link.download = file.name
          link.target = '_blank'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          await new Promise(r => setTimeout(r, 300))
      }
      clearSelection()
    } catch (err: any) {
      toast.error('Download failed', err.message)
    } finally {
      isBulkDownloading.value = false
    }
  }

  // Single Download
  const handleDownload = async (file: FileEntry) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const { link } = await $fetch<{ link: string }>('/api/dropbox/download', {
        query: { path: file.path, accountId: file.accountId },
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
      })
      window.open(link, '_blank')
    } catch (err: any) {
      toast.error('Download failed', err.message)
    }
  }

  // Single Delete
  const deleteTarget = ref<FileEntry | null>(null)
  const isDeleting = ref(false)
  const confirmDelete = (file: any) => {
    if (file.isVirtual || file.id?.startsWith('vf-')) {
      alert('Virtual folders cannot be deleted directly.')
      return
    }
    deleteTarget.value = file
  }
  const handleDelete = async () => {
    if (!deleteTarget.value) return
    isDeleting.value = true
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await $fetch('/api/files/delete', {
        method: 'POST',
        body: { fileId: deleteTarget.value.id },
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
      })
      // Note: We rely on refreshFiles() from the parent component or we can call it here if passed
      await refreshFiles()
      
      deleteTarget.value = null
      toast.success('File deleted')
    } catch (err: any) {
      toast.error('Delete failed', err.message)
    } finally {
      isDeleting.value = false
    }
  }
  
  // Link Copy
  const copiedFileId = ref<string | null>(null)
  const copyExistingLink = async (file: FileEntry) => {
    if (!file.shareUrl) return
    await navigator.clipboard.writeText(`${window.location.origin}${file.shareUrl}`)
    copiedFileId.value = file.id
    setTimeout(() => copiedFileId.value = null, 2000)
  }

  return {
    isCreatingFolder,
    newFolderName,
    folderError,
    createFolderModalOpen,
    createFolder,
    
    isBulkDeleting,
    handleBulkDelete,
    
    isBulkDownloading,
    handleBulkDownload,
    
    handleDownload,
    
    deleteTarget,
    isDeleting,
    confirmDelete,
    handleDelete,

    copiedFileId,
    copyExistingLink
  }
}
