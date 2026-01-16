import { ref } from 'vue'
import { useToast } from './useToast'
import { FileEntry } from './useFileBrowser'

export function useFileShare() {
  const { toast } = useToast()
  const supabase = useSupabaseClient()

  const shareTarget = ref<FileEntry | null>(null)
  const shareResult = ref<{ id: string; url: string; expiresAt: string | null } | null>(null)
  const isSharing = ref(false)
  const copied = ref(false)
  const shareTab = ref<'link' | 'embed'>('link')
  const expirationOptions = [{ days: 1, label: '1 Day' }, { days: 7, label: '7 Days' }, { days: 'never', label: 'Never' }]
  const selectedExpiration = ref<number | string>(7)
  const isGeneratingEmbed = ref(false)
  const isDeletingShare = ref(false)
  const confirmDeleteShare = ref(false)

  const openShareModal = (file: FileEntry) => {
    shareTarget.value = file
    copied.value = false
    selectedExpiration.value = 7
    shareTab.value = 'link'
    if (file.shareId && file.shareUrl) {
      shareResult.value = { 
        id: file.shareId, 
        url: `${window.location.origin}${file.shareUrl}`, 
        expiresAt: file.shareExpiresAt || null 
      }
    } else {
      shareResult.value = null
    }
  }

  const closeShareModal = () => {
    shareTarget.value = null
    shareResult.value = null
    confirmDeleteShare.value = false
  }

  const handleShare = async () => {
    if (!shareTarget.value) return
    isSharing.value = true
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const result = await $fetch<any>('/api/shares/create', {
        method: 'POST',
        body: {
          accountId: shareTarget.value.accountId,
          filePath: shareTarget.value.path,
          fileName: shareTarget.value.name,
          expirationDays: selectedExpiration.value === 'never' ? null : selectedExpiration.value,
          expirationUnit: 'days'
        },
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
      })
      shareResult.value = { id: result.share.id, url: result.share.url, expiresAt: result.share.expiresAt }
      toast.success('Link created')
    } catch (err: any) {
      toast.error('Share failed', err.message)
    } finally {
      isSharing.value = false
    }
  }

  const copyShareLink = async () => {
    if (!shareResult.value) return
    await navigator.clipboard.writeText(shareResult.value.url)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  }

  // Embed helpers
  const getEmbedCode = (id: string) => `<iframe src="${window.location.origin}/embed/${id}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`
  const getEmbedUrl = (id: string) => `${window.location.origin}/embed/${id}`
  
  const copyEmbedCode = async (id: string) => { 
    await navigator.clipboard.writeText(getEmbedCode(id))
    copied.value = true
    setTimeout(() => copied.value = false, 2000) 
  }
  
  const copyEmbedUrl = async (id: string) => { 
    await navigator.clipboard.writeText(getEmbedUrl(id))
    copied.value = true
    setTimeout(() => copied.value = false, 2000) 
  }

  const generateEmbed = async (file: FileEntry) => {
    isGeneratingEmbed.value = true
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const result = await $fetch<any>('/api/embed/generate', {
        method: 'POST',
        body: { fileId: file.id },
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
      })
      shareResult.value = { id: result.shareId, url: result.shareUrl, expiresAt: result.expiresAt }
      shareTab.value = 'embed'
    } catch (err: any) {
      toast.error('Generate embed failed', err.message)
    } finally {
      isGeneratingEmbed.value = false
    }
  }

  const deleteShareLink = async (refreshFiles: () => Promise<void>) => {
    if (!shareResult.value?.id) return
    if (!confirmDeleteShare.value) { confirmDeleteShare.value = true; return }
    isDeletingShare.value = true
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await $fetch(`/api/shares/${shareResult.value.id}`, { 
        method: 'DELETE', 
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {} 
      })
      
      // We need to refresh the file list to update the UI
      await refreshFiles()
      
      shareResult.value = null
      closeShareModal()
    } catch (err: any) {
      toast.error('Delete failed', err.message)
    } finally {
      isDeletingShare.value = false
      confirmDeleteShare.value = false
    }
  }

  return {
    shareTarget,
    shareResult,
    isSharing,
    copied,
    shareTab,
    expirationOptions,
    selectedExpiration,
    isGeneratingEmbed,
    isDeletingShare,
    confirmDeleteShare,
    openShareModal,
    closeShareModal,
    handleShare,
    copyShareLink,
    generateEmbed,
    deleteShareLink,
    getEmbedCode,
    getEmbedUrl,
    copyEmbedCode,
    copyEmbedUrl
  }
}
