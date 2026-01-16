import { ref, computed, watch } from 'vue'

export interface FileEntry {
  id: string
  name: string
  path: string
  size: number
  modified: string
  extension: string | null
  accountId: string
  shareUrl?: string | null
  shareExpiresAt?: string | null
  duration?: string
  shareId?: string | null
  type?: 'file' | 'folder'
  virtualFolder?: string | null
  isVirtual?: boolean
  fileCount?: number
}

export async function useFileBrowser() {
  const supabase = useSupabaseClient()
  
  // State
  const searchQuery = ref('')
  const sortBy = ref('modified')
  const viewMode = ref<'list' | 'grid'>('list')
  const currentPage = ref(1)
  const currentPath = ref('/')
  const currentVirtualFolder = ref<string | null>(null)
  const pageSize = 50

  // Fetch Data
  const { data, pending, error, refresh } = await useFetch<FileEntry[]>('/api/my-files', {
    server: false,
    async onRequest({ options }) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        const existingHeaders = (options.headers || {}) as any
        options.headers = {
          ...existingHeaders,
          Authorization: `Bearer ${session.access_token}`
        } as any
      }
    }
  })

  const files = computed(() => data.value || [])

  // Virtual Folders
  const virtualFolders = computed(() => {
    if (!data.value) return []
    const folders = new Set<string>()
    data.value.forEach(file => {
      if (file.virtualFolder) folders.add(file.virtualFolder)
    })
    return Array.from(folders).map(name => ({
      id: `vf-${name}`,
      name: name,
      path: `/virtual/${name}`,
      size: 0,
      modified: new Date().toISOString(),
      extension: null,
      accountId: '',
      type: 'folder' as const,
      isVirtual: true,
      fileCount: data.value?.filter(f => f.virtualFolder === name).length || 0
    }))
  })

  // Filtering
  const filteredFiles = computed(() => {
    if (!data.value) return []
    
    if (currentVirtualFolder.value) {
      return data.value.filter(file => file.virtualFolder === currentVirtualFolder.value)
    }
    
    const path = currentPath.value
    if (path === '/') {
      const persistentFolders = data.value.filter((item: any) => item.isVirtualFolder === true)
      const regularItems = data.value.filter((item: any) => !item.isVirtualFolder)
      const rootFiles = regularItems.filter(file => !file.virtualFolder)
      const vFolders = virtualFolders.value as any[]
      
      const mergedMap = new Map<string, any>()
      persistentFolders.forEach((folder: any) => {
          mergedMap.set(folder.name, { ...folder, fileCount: 0, isVirtual: false })
      })
      vFolders.forEach(vf => {
          if (mergedMap.has(vf.name)) {
              const existing = mergedMap.get(vf.name)
              existing.fileCount = vf.fileCount
              existing.isVirtual = true
          } else {
              mergedMap.set(vf.name, vf)
          }
      })
      return [...Array.from(mergedMap.values()), ...rootFiles.filter(f => f.type !== 'folder')]
    }
    
    return data.value.filter(file => {
      if (!file.path.startsWith(path + '/')) return false
      const subPath = file.path.substring(path.length + 1)
      return !subPath.includes('/')
    })
  })

  // Sorting
  const sortedFiles = computed(() => {
    const filtered = filteredFiles.value.filter(f => 
      f.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
    return filtered.sort((a, b) => {
      if (a.type === b.type) {
         return new Date(b.modified || 0).getTime() - new Date(a.modified || 0).getTime()
      }
      return a.type === 'folder' ? -1 : 1
    })
  })

  // Pagination
  const totalPages = computed(() => Math.ceil(sortedFiles.value.length / pageSize))
  const paginatedFiles = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    return sortedFiles.value.slice(start, start + pageSize)
  })

  // Navigation Helpers
  const navigateToFolder = (path: string) => currentPath.value = path
  const navigateToVirtualFolder = (folderName: string) => currentVirtualFolder.value = folderName

  const breadcrumbs = computed(() => {
    const crumbs = [{ name: 'Home', path: '/', isVirtual: false }]
    if (currentVirtualFolder.value) {
      crumbs.push({ name: currentVirtualFolder.value, path: `/virtual/${currentVirtualFolder.value}`, isVirtual: true })
      return crumbs
    }
    const parts = currentPath.value.split('/').filter(p => p)
    let current = '/'
    parts.forEach(part => {
      current = current === '/' ? `/${part}` : `${current}/${part}`
      crumbs.push({ name: part, path: current, isVirtual: false })
    })
    return crumbs
  })

  const handleBreadcrumbClick = (crumb: { path: string; isVirtual: boolean }) => {
    if (crumb.path === '/') {
      currentVirtualFolder.value = null
      currentPath.value = '/'
    } else if (!crumb.isVirtual) {
      currentVirtualFolder.value = null
      navigateToFolder(crumb.path)
    }
  }

  const handleFolderClick = (file: any) => {
    if (file.isVirtualFolder || file.isVirtual || file.isPersistent) {
      navigateToVirtualFolder(file.name)
    } else if (file.type === 'folder') {
      navigateToFolder(file.path)
    }
  }

  // Watchers
  watch([searchQuery, sortBy], () => currentPage.value = 1)

  return {
    // State
    searchQuery,
    sortBy,
    viewMode,
    currentPage,
    currentPath,
    currentVirtualFolder,
    totalPages,
    
    // Data
    files,
    pending,
    error,
    refresh,
    
    // Computed
    virtualFolders,
    filteredFiles,
    sortedFiles,
    paginatedFiles,
    breadcrumbs,
    
    // Actions
    navigateToFolder,
    navigateToVirtualFolder,
    handleBreadcrumbClick,
    handleFolderClick
  }
}
