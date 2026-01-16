import { ref } from 'vue'
import { FileEntry } from './useFileBrowser'

export function useFilePreview() {
  const supabase = useSupabaseClient()
  
  const previewTarget = ref<FileEntry | null>(null)
  const previewUrl = ref<string | null>(null)
  const isLoadingPreview = ref(false)
  const previewError = ref<string | null>(null)

  const openPreview = async (file: FileEntry) => {
    previewTarget.value = file
    previewUrl.value = null
    previewError.value = null
    isLoadingPreview.value = true
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await $fetch<{ link: string }>('/api/dropbox/download', {
        query: { path: file.path, accountId: file.accountId },
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
      })
      previewUrl.value = response.link
    } catch (err: any) {
      previewError.value = err.data?.message || err.message
    } finally {
      isLoadingPreview.value = false
    }
  }

  const closePreview = () => {
    previewTarget.value = null
    previewUrl.value = null
    previewError.value = null
  }

  const handleExternalLink = (url: string | null) => {
    if (!url) return
    window.open(url, '_blank')
  }

  return {
    previewTarget,
    previewUrl,
    isLoadingPreview,
    previewError,
    openPreview,
    closePreview,
    handleExternalLink
  }
}
