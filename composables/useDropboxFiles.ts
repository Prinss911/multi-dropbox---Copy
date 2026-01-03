export interface DropboxEntry {
    id: string
    name: string
    path: string
    type: 'file' | 'folder'
    size: number | null
    modified: string | null
    extension: string | null
}

export interface DropboxListResponse {
    entries: DropboxEntry[]
    cursor: string
    hasMore: boolean
}

export const useDropboxFiles = (explicitAccountId?: string) => {
    // Get global activeAccountId
    const { activeAccountId } = useAccounts()

    // Determine the key suffix for state isolation
    const stateSuffix = explicitAccountId ? `-${explicitAccountId}` : '-main'

    // Resolve target account ID
    const targetAccountId = computed(() => explicitAccountId || activeAccountId.value)

    const currentPath = useState<string>(`dropbox-path${stateSuffix}`, () => '')
    const files = useState<DropboxEntry[]>(`dropbox-files${stateSuffix}`, () => [])
    const isLoading = useState<boolean>(`dropbox-loading${stateSuffix}`, () => false)
    const error = useState<string | null>(`dropbox-error${stateSuffix}`, () => null)

    // Selection state should also be isolated
    const selectedIds = useState<Set<string>>(`dropbox-selected${stateSuffix}`, () => new Set())

    const selectedFiles = computed(() => {
        return files.value.filter(f => selectedIds.value.has(f.id))
    })

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds.value)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        selectedIds.value = newSet
    }

    const selectAll = () => {
        selectedIds.value = new Set(files.value.map(f => f.id))
    }

    const clearSelection = () => {
        selectedIds.value = new Set()
    }

    const isSelected = (id: string) => selectedIds.value.has(id)

    const isAllSelected = computed(() => {
        return files.value.length > 0 && selectedIds.value.size === files.value.length
    })

    const fetchFiles = async (path: string = '', clearImmediately: boolean = false) => {
        isLoading.value = true
        error.value = null
        clearSelection() // Clear selection when navigating

        // If no account selected at all
        if (!targetAccountId.value) {
            isLoading.value = false
            return
        }

        // Clear files immediately when switching accounts to avoid showing stale data
        if (clearImmediately) {
            files.value = []
        }

        try {
            const response = await $fetch<DropboxListResponse>('/api/dropbox/files', {
                query: { path, accountId: targetAccountId.value },
            })

            files.value = response.entries
            currentPath.value = path
        } catch (err: any) {
            console.error('Error fetching files:', err)
            error.value = err.data?.message || err.message || 'Failed to load files'
            files.value = []
        } finally {
            isLoading.value = false
        }
    }

    const navigateToFolder = (folderPath: string) => {
        fetchFiles(folderPath)
    }

    const navigateUp = () => {
        if (!currentPath.value) return

        const parts = currentPath.value.split('/')
        parts.pop()
        const parentPath = parts.join('/')
        fetchFiles(parentPath)
    }

    const getDownloadLink = async (filePath: string): Promise<string | null> => {
        try {
            const response = await $fetch<{ link: string }>('/api/dropbox/download', {
                query: { path: filePath, accountId: targetAccountId.value },
            })
            return response.link
        } catch (err) {
            console.error('Error getting download link:', err)
            return null
        }
    }

    const createFolder = async (name: string): Promise<boolean> => {
        try {
            await $fetch('/api/dropbox/folder', {
                method: 'POST',
                body: { path: currentPath.value, name, accountId: targetAccountId.value }
            })
            await fetchFiles(currentPath.value)
            return true
        } catch (err: any) {
            console.error('Error creating folder:', err)
            throw new Error(err.data?.message || 'Failed to create folder')
        }
    }

    const deleteItem = async (path: string): Promise<boolean> => {
        try {
            await $fetch('/api/dropbox/delete', {
                method: 'POST',
                body: { path, accountId: targetAccountId.value }
            })
            await fetchFiles(currentPath.value)
            return true
        } catch (err: any) {
            console.error('Error deleting:', err)
            throw new Error(err.data?.message || 'Failed to delete')
        }
    }

    const bulkDelete = async (paths: string[]): Promise<boolean> => {
        try {
            await $fetch('/api/dropbox/bulk-delete', {
                method: 'POST',
                body: { paths, accountId: targetAccountId.value }
            })
            clearSelection()
            await fetchFiles(currentPath.value)
            return true
        } catch (err: any) {
            console.error('Error bulk deleting:', err)
            throw new Error(err.data?.message || 'Failed to delete files')
        }
    }

    const renameItem = async (oldPath: string, newName: string): Promise<boolean> => {
        try {
            const pathParts = oldPath.split('/')
            pathParts.pop()
            const newPath = [...pathParts, newName].join('/')

            await $fetch('/api/dropbox/move', {
                method: 'POST',
                body: { fromPath: oldPath, toPath: newPath, accountId: targetAccountId.value }
            })
            await fetchFiles(currentPath.value)
            return true
        } catch (err: any) {
            console.error('Error renaming:', err)
            throw new Error(err.data?.message || 'Failed to rename')
        }
    }

    const bulkMove = async (fromPaths: string[], toFolder: string): Promise<boolean> => {
        try {
            const entries = fromPaths.map(fromPath => {
                const fileName = fromPath.split('/').pop()
                const toPath = toFolder ? `${toFolder}/${fileName}` : `/${fileName}`
                return { from_path: fromPath, to_path: toPath }
            })

            await $fetch('/api/dropbox/bulk-move', {
                method: 'POST',
                body: { entries, accountId: targetAccountId.value }
            })
            clearSelection()
            await fetchFiles(currentPath.value)
            return true
        } catch (err: any) {
            console.error('Error bulk moving:', err)
            throw new Error(err.data?.message || 'Failed to move files')
        }
    }

    const bulkCopy = async (fromPaths: string[], toFolder: string): Promise<boolean> => {
        try {
            const entries = fromPaths.map(fromPath => {
                const fileName = fromPath.split('/').pop()
                const toPath = toFolder ? `${toFolder}/${fileName}` : `/${fileName}`
                return { from_path: fromPath, to_path: toPath }
            })

            await $fetch('/api/dropbox/bulk-copy', {
                method: 'POST',
                body: { entries, accountId: targetAccountId.value }
            })
            clearSelection()
            await fetchFiles(currentPath.value)
            return true
        } catch (err: any) {
            console.error('Error bulk copying:', err)
            throw new Error(err.data?.message || 'Failed to copy files')
        }
    }

    const bulkDownload = async (paths: string[]): Promise<void> => {
        try {
            const response = await $fetch<any>('/api/dropbox/bulk-download', {
                method: 'POST',
                body: { paths }
            })

            if (response.type === 'single') {
                window.open(response.link, '_blank')
            } else {
                for (const item of response.links) {
                    if (item?.link) {
                        const a = document.createElement('a')
                        a.href = item.link
                        a.download = item.name
                        a.target = '_blank'
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        await new Promise(r => setTimeout(r, 500))
                    }
                }
            }
            clearSelection()
        } catch (err: any) {
            console.error('Error bulk downloading:', err)
            throw new Error(err.data?.message || 'Failed to download files')
        }
    }

    const uploadFiles = async (fileList: FileList): Promise<boolean> => {
        try {
            // Get upload session
            const session = await $fetch<{ accessToken: string; uploadPath: string }>('/api/dropbox/upload-session', {
                query: { path: currentPath.value }
            })

            // Upload files one by one to track progress
            for (const file of Array.from(fileList)) {
                const filePath = currentPath.value ? `${currentPath.value}/${file.name}` : `/${file.name}`

                const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session.accessToken}`,
                        'Dropbox-API-Arg': JSON.stringify({
                            path: filePath,
                            mode: 'add',
                            autorename: true,
                            mute: false
                        }),
                        'Content-Type': 'application/octet-stream'
                    },
                    body: file
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error_summary || `Failed to upload ${file.name}`)
                }
            }

            await fetchFiles(currentPath.value)
            return true
        } catch (err: any) {
            console.error('Error uploading:', err)
            throw new Error(err.message || 'Failed to upload files')
        }
    }

    const formatFileSize = (bytes: number | null): string => {
        if (bytes === null) return '-'
        if (bytes === 0) return '0 B'

        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))

        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }

    const formatDate = (dateString: string | null): string => {
        if (!dateString) return '-'

        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return 'Today'
        if (diffDays === 1) return 'Yesterday'
        if (diffDays < 7) return `${diffDays} days ago`
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const getFileIcon = (entry: DropboxEntry): string => {
        if (entry.type === 'folder') return 'lucide:folder'

        const ext = entry.extension
        const iconMap: Record<string, string> = {
            pdf: 'lucide:file-text',
            doc: 'lucide:file-text',
            docx: 'lucide:file-text',
            txt: 'lucide:file-text',
            xls: 'lucide:file-spreadsheet',
            xlsx: 'lucide:file-spreadsheet',
            csv: 'lucide:file-spreadsheet',
            ppt: 'lucide:presentation',
            pptx: 'lucide:presentation',
            jpg: 'lucide:image',
            jpeg: 'lucide:image',
            png: 'lucide:image',
            gif: 'lucide:image',
            svg: 'lucide:image',
            webp: 'lucide:image',
            mp4: 'lucide:file-video',
            mov: 'lucide:file-video',
            avi: 'lucide:file-video',
            mkv: 'lucide:file-video',
            mp3: 'lucide:file-audio',
            wav: 'lucide:file-audio',
            flac: 'lucide:file-audio',
            zip: 'lucide:file-archive',
            rar: 'lucide:file-archive',
            '7z': 'lucide:file-archive',
            tar: 'lucide:file-archive',
            gz: 'lucide:file-archive',
            js: 'lucide:file-code',
            ts: 'lucide:file-code',
            py: 'lucide:file-code',
            html: 'lucide:file-code',
            css: 'lucide:file-code',
            json: 'lucide:file-json',
        }

        return iconMap[ext || ''] || 'lucide:file'
    }

    const getIconColor = (entry: DropboxEntry): string => {
        if (entry.type === 'folder') return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30'

        const ext = entry.extension
        const colorMap: Record<string, string> = {
            pdf: 'text-red-600 bg-red-50 dark:bg-red-900/30',
            doc: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30',
            docx: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30',
            xls: 'text-green-600 bg-green-50 dark:bg-green-900/30',
            xlsx: 'text-green-600 bg-green-50 dark:bg-green-900/30',
            ppt: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30',
            pptx: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30',
            jpg: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
            jpeg: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
            png: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
            mp4: 'text-pink-600 bg-pink-50 dark:bg-pink-900/30',
            mp3: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30',
            zip: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30',
        }

        return colorMap[ext || ''] || 'text-gray-600 bg-gray-50 dark:bg-gray-900/30'
    }

    // Get folders for move destination picker
    const getFolders = async (path: string = ''): Promise<DropboxEntry[]> => {
        try {
            const response = await $fetch<DropboxListResponse>('/api/dropbox/files', {
                query: { path, accountId: targetAccountId.value },
            })
            return response.entries.filter(e => e.type === 'folder')
        } catch (err) {
            console.error('Error fetching folders:', err)
            return []
        }
    }

    return {
        currentPath,
        files,
        isLoading,
        error,
        selectedIds,
        selectedFiles,
        toggleSelect,
        selectAll,
        clearSelection,
        isSelected,
        isAllSelected,
        fetchFiles,
        navigateToFolder,
        navigateUp,
        getDownloadLink,
        createFolder,
        deleteItem,
        bulkDelete,
        renameItem,
        bulkMove,
        bulkCopy,
        bulkDownload,
        uploadFiles,
        formatFileSize,
        formatDate,
        getFileIcon,
        getIconColor,
        getFolders,
    }
}
