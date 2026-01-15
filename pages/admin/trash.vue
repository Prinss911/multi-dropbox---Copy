<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg bg-red-500/10">
          <Icon name="lucide:trash-2" class="h-5 w-5 text-red-500" />
        </div>
        <div>
          <h1 class="text-xl font-semibold">Trash</h1>
          <p class="text-sm text-muted-foreground">
            {{ selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Deleted files are automatically removed after 30 days' }}
          </p>
        </div>
      </div>
      
      <!-- Bulk Actions -->
      <div class="flex items-center gap-2">
        <template v-if="selectedIds.size > 0">
          <UiButton 
            variant="outline" 
            size="sm"
            @click="clearSelection"
          >
            Clear
          </UiButton>
          <UiButton 
            variant="outline" 
            size="sm"
            @click="bulkRestore"
            :disabled="isBulkProcessing"
          >
            <Icon 
              :name="isBulkProcessing ? 'lucide:loader-2' : 'lucide:undo-2'" 
              :class="['mr-2 h-4 w-4', isBulkProcessing && 'animate-spin']"
            />
            Restore {{ selectedIds.size }}
          </UiButton>
          <UiButton 
            variant="destructive" 
            size="sm"
            @click="bulkDelete"
            :disabled="isBulkProcessing"
          >
            <Icon 
              :name="isBulkProcessing ? 'lucide:loader-2' : 'lucide:trash-2'" 
              :class="['mr-2 h-4 w-4', isBulkProcessing && 'animate-spin']"
            />
            Delete {{ selectedIds.size }}
          </UiButton>
        </template>
        <UiButton 
          v-else-if="files.length > 0"
          variant="destructive" 
          size="sm"
          @click="emptyTrash"
          :disabled="isEmptyingTrash"
        >
          <Icon 
            :name="isEmptyingTrash ? 'lucide:loader-2' : 'lucide:trash'" 
            :class="['mr-2 h-4 w-4', isEmptyingTrash && 'animate-spin']"
          />
          Empty Trash
        </UiButton>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="rounded-md border bg-card p-8">
      <div class="flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <Icon name="lucide:loader-2" class="h-8 w-8 animate-spin" />
        <p>Loading trash...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-md border border-destructive/50 bg-destructive/10 p-8">
      <div class="flex flex-col items-center justify-center gap-2 text-destructive">
        <Icon name="lucide:alert-circle" class="h-8 w-8" />
        <p class="font-medium">Failed to load trash</p>
        <p class="text-sm">{{ error }}</p>
        <UiButton variant="outline" size="sm" @click="fetchTrash" class="mt-2">
          <Icon name="lucide:refresh-cw" class="mr-2 h-4 w-4" />
          Retry
        </UiButton>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="files.length === 0" class="rounded-md border-2 border-dashed bg-card p-12">
      <div class="flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Icon name="lucide:trash-2" class="h-16 w-16" />
        <p class="font-medium text-lg">Trash is empty</p>
        <p class="text-sm">Deleted files will appear here</p>
      </div>
    </div>

    <!-- File List -->
    <div v-else class="rounded-md border bg-card text-card-foreground shadow-sm">
      <UiTable>
        <UiTableHeader>
          <UiTableRow class="hover:bg-transparent">
            <UiTableHead class="w-10">
              <input 
                type="checkbox"
                :checked="isAllSelected"
                :indeterminate="isPartiallySelected"
                @change="toggleSelectAll"
                class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </UiTableHead>
            <UiTableHead class="min-w-[200px]">Name</UiTableHead>
            <UiTableHead class="hidden md:table-cell">Account</UiTableHead>
            <UiTableHead class="hidden md:table-cell">Location</UiTableHead>
            <UiTableHead class="hidden md:table-cell">Expires</UiTableHead>
            <UiTableHead class="text-right">Actions</UiTableHead>
          </UiTableRow>
        </UiTableHeader>
        <UiTableBody>
          <UiTableRow 
            v-for="entry in files" 
            :key="entry.id"
            class="group"
            :class="{ 'bg-blue-50 dark:bg-blue-500/10': selectedIds.has(entry.id) }"
          >
            <UiTableCell class="py-3">
              <input 
                type="checkbox"
                :checked="selectedIds.has(entry.id)"
                @change="toggleSelect(entry.id)"
                class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </UiTableCell>
            <UiTableCell class="font-medium flex items-center gap-3 py-3">
              <div class="p-2 rounded bg-muted shrink-0">
                <Icon :name="getFileIcon(entry as any)" class="h-4 w-4 text-muted-foreground" />
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-sm font-medium text-foreground truncate">{{ entry.name }}</span>
                <!-- Mobile Meta -->
                <div class="md:hidden flex flex-wrap items-center gap-2 text-xs mt-0.5">
                   <span class="font-medium text-muted-foreground">{{ entry.accountName }}</span>
                   <span v-if="entry.accountName" class="text-muted-foreground">•</span>
                   <span 
                    v-if="entry.daysRemaining !== null"
                    :class="[
                      entry.daysRemaining <= 7 ? 'text-red-500' : 
                      entry.daysRemaining <= 14 ? 'text-yellow-600' : 'text-muted-foreground'
                    ]"
                   >
                     {{ entry.daysRemaining }}d left
                   </span>
                </div>
              </div>
            </UiTableCell>
            <UiTableCell class="hidden md:table-cell">
              <span class="text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground">
                {{ entry.accountName }}
              </span>
            </UiTableCell>
            <UiTableCell class="text-muted-foreground text-sm hidden md:table-cell">
              {{ getParentPath(entry.path) }}
            </UiTableCell>
            <UiTableCell class="hidden md:table-cell">
              <span 
                v-if="entry.daysRemaining !== null"
                :class="[
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                  entry.daysRemaining <= 7 
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                    : entry.daysRemaining <= 14 
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-muted text-muted-foreground'
                ]"
              >
                <Icon v-if="entry.daysRemaining <= 7" name="lucide:alert-triangle" class="h-3 w-3" />
                {{ entry.daysRemaining }} days left
              </span>
              <span v-else class="text-xs text-muted-foreground">Unknown</span>
            </UiTableCell>
            <UiTableCell class="text-right">
              <div class="flex items-center justify-end gap-2">
                <UiButton 
                  variant="outline" 
                  size="sm"
                  @click="restoreFile(entry)"
                  :disabled="isRestoring === entry.id"
                >
                  <Icon 
                    :name="isRestoring === entry.id ? 'lucide:loader-2' : 'lucide:undo-2'" 
                    :class="['mr-2 h-4 w-4', isRestoring === entry.id && 'animate-spin']"
                  />
                  Restore
                </UiButton>
                <UiButton 
                  variant="destructive" 
                  size="sm"
                  @click="deleteForever(entry)"
                  :disabled="isDeleting === entry.id"
                >
                  <Icon 
                    :name="isDeleting === entry.id ? 'lucide:loader-2' : 'lucide:trash-2'" 
                    :class="['mr-2 h-4 w-4', isDeleting === entry.id && 'animate-spin']"
                  />
                  Delete
                </UiButton>
              </div>
            </UiTableCell>
          </UiTableRow>
        </UiTableBody>
      </UiTable>
    </div>

    <!-- Confirm Dialog -->
    <Teleport to="body">
      <div 
        v-if="confirmDialog.isOpen" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <div class="bg-card w-full max-w-sm rounded-lg shadow-lg border p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 rounded-full bg-destructive/10">
              <Icon name="lucide:alert-triangle" class="h-5 w-5 text-destructive" />
            </div>
            <h3 class="font-semibold text-lg text-foreground">{{ confirmDialog.title }}</h3>
          </div>
          <p class="text-muted-foreground mb-6">{{ confirmDialog.message }}</p>
          <div class="flex gap-3 justify-end">
            <button 
              @click="confirmDialog.resolve(false); confirmDialog.isOpen = false"
              class="px-4 py-2 rounded-md text-sm font-medium border border-input bg-background hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button 
              @click="confirmDialog.resolve(true); confirmDialog.isOpen = false"
              class="px-4 py-2 rounded-md text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
            >
              {{ confirmDialog.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const { getFileIcon } = useDropboxFiles()
const { accounts } = useAccounts()

interface TrashFile {
  id: string
  name: string
  path: string | null
  type: string
  size: number | null
  deletedAt: string | null
  daysRemaining: number | null
  extension: string | null
  accountId: string
  accountName: string
}

const files = ref<TrashFile[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const isRestoring = ref<string | null>(null)
const isDeleting = ref<string | null>(null)
const isEmptyingTrash = ref(false)

// Bulk selection state
const selectedIds = ref<Set<string>>(new Set())
const isBulkProcessing = ref(false)

// Selection helpers
const isAllSelected = computed(() => {
  return files.value.length > 0 && files.value.every(f => selectedIds.value.has(f.id))
})

const isPartiallySelected = computed(() => {
  const selectedCount = files.value.filter(f => selectedIds.value.has(f.id)).length
  return selectedCount > 0 && selectedCount < files.value.length
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

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(files.value.map(f => f.id))
  }
}

const clearSelection = () => {
  selectedIds.value = new Set()
}

// Confirm Dialog
const confirmDialog = reactive({
  isOpen: false,
  title: 'Confirm',
  message: '',
  confirmText: 'Delete',
  resolve: (value: boolean) => {}
})

const showConfirm = (opts: { title?: string; message: string; confirmText?: string }): Promise<boolean> => {
  return new Promise((resolve) => {
    confirmDialog.title = opts.title || 'Confirm'
    confirmDialog.message = opts.message
    confirmDialog.confirmText = opts.confirmText || 'Delete'
    confirmDialog.resolve = resolve
    confirmDialog.isOpen = true
  })
}

const fetchTrash = async () => {
  isLoading.value = true
  error.value = null
  files.value = [] // Clear immediately
  
  try {
    const promises = accounts.value.map(async (acc) => {
      try {
        const response = await $fetch<{ entries: TrashFile[] }>('/api/dropbox/trash', {
          query: { accountId: acc.id }
        })
        return response.entries.map(e => ({
          ...e,
          accountId: acc.id,
          accountName: acc.name
        }))
      } catch (err) {
        console.warn(`Failed to fetch trash for ${acc.name}:`, err)
        return []
      }
    })

    const results = await Promise.all(promises)
    const allFiles = results.flat()
    
    // Sort by days remaining (ascending - urgent first) or default
    files.value = allFiles.sort((a, b) => (a.daysRemaining || 99) - (b.daysRemaining || 99))
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Failed to load trash'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchTrash()
})

// Refetch when accounts change
watch(accounts, () => {
  fetchTrash()
}, { deep: true })

const getParentPath = (path: string | null) => {
  if (!path) return '/'
  const parts = path.split('/')
  parts.pop()
  return parts.join('/') || '/'
}

const restoreFile = async (entry: TrashFile) => {
  if (!entry.path) return
  
  isRestoring.value = entry.id
  try {
    await $fetch('/api/dropbox/restore', {
      method: 'POST',
      body: { path: entry.path, accountId: entry.accountId }
    })
    // Remove from list
    files.value = files.value.filter(f => f.id !== entry.id)
  } catch (err: any) {
    alert(err.data?.message || 'Failed to restore file')
  } finally {
    isRestoring.value = null
  }
}

const deleteForever = async (entry: TrashFile) => {
  if (!entry.path) return
  
  const confirmed = await showConfirm({
    title: 'Permanent Delete',
    message: `Permanently delete "${entry.name}"? This cannot be undone.`,
    confirmText: 'Delete Forever'
  })
  if (!confirmed) return
  
  isDeleting.value = entry.id
  try {
    const response = await $fetch<{ success: boolean; isPersonalAccount?: boolean; alreadyInTrash?: boolean; message: string }>('/api/dropbox/permanent-delete', {
      method: 'POST',
      body: { path: entry.path, accountId: entry.accountId }
    })
    files.value = files.value.filter(f => f.id !== entry.id)
    
    // Show info for personal accounts
    if (response.isPersonalAccount || response.alreadyInTrash) {
      alert('Note: For personal Dropbox accounts, files in trash will be automatically deleted after 30 days.')
    }
  } catch (err: any) {
    console.error('Permanent delete error:', err)
    const message = err.data?.message || err.message || 'Failed to permanently delete'
    alert(message)
  } finally {
    isDeleting.value = null
  }
}

const emptyTrash = async () => {
  const confirmed = await showConfirm({
    title: 'Empty Trash',
    message: 'Permanently delete all files in trash? This cannot be undone.',
    confirmText: 'Empty Trash'
  })
  if (!confirmed) return
  
  isEmptyingTrash.value = true
  
  // Delete all files one by one
  const filesToDelete = [...files.value]
  let successCount = 0
  let personalAccountWarning = false

  for (const file of filesToDelete) {
    if (file.path) {
      try {
        const response = await $fetch<{ success: boolean; isPersonalAccount?: boolean; alreadyInTrash?: boolean }>('/api/dropbox/permanent-delete', {
          method: 'POST',
          body: { path: file.path, accountId: file.accountId }
        })
        // Remove from list as we go
        files.value = files.value.filter(f => f.id !== file.id)
        successCount++
        
        if (response.isPersonalAccount || response.alreadyInTrash) {
          personalAccountWarning = true
        }
      } catch (err: any) {
        console.error('Error deleting:', file.name, err)
        // Continue with next file even if one fails
      }
    }
  }
  
  isEmptyingTrash.value = false

  // Show info message
  if (personalAccountWarning && successCount > 0) {
    alert(`${successCount} file(s) processed. Note: For personal Dropbox accounts, files in trash will be automatically deleted after 30 days.`)
  }
}

// Bulk operations
const bulkRestore = async () => {
  if (selectedIds.value.size === 0) return
  
  const confirmed = await showConfirm({
    title: 'Restore Selected',
    message: `Restore ${selectedIds.value.size} selected file(s)?`,
    confirmText: 'Restore All'
  })
  if (!confirmed) return
  
  isBulkProcessing.value = true
  const idsToProcess = Array.from(selectedIds.value)
  
  for (const id of idsToProcess) {
    const file = files.value.find(f => f.id === id)
    if (file?.path) {
      try {
        await $fetch('/api/dropbox/restore', {
          method: 'POST',
          body: { path: file.path, accountId: file.accountId }
        })
        files.value = files.value.filter(f => f.id !== id)
      } catch (err) {
        console.error(`Failed to restore ${file.name}:`, err)
      }
    }
  }
  
  selectedIds.value = new Set()
  isBulkProcessing.value = false
}

const bulkDelete = async () => {
  if (selectedIds.value.size === 0) return
  
  const confirmed = await showConfirm({
    title: 'Permanently Delete Selected',
    message: `Permanently delete ${selectedIds.value.size} selected file(s)? This cannot be undone.`,
    confirmText: 'Delete All Forever'
  })
  if (!confirmed) return
  
  isBulkProcessing.value = true
  const idsToProcess = Array.from(selectedIds.value)
  let personalAccountWarning = false
  
  for (const id of idsToProcess) {
    const file = files.value.find(f => f.id === id)
    if (file?.path) {
      try {
        const response = await $fetch<{ success: boolean; isPersonalAccount?: boolean; alreadyInTrash?: boolean }>('/api/dropbox/permanent-delete', {
          method: 'POST',
          body: { path: file.path, accountId: file.accountId }
        })
        files.value = files.value.filter(f => f.id !== id)
        
        if (response.isPersonalAccount || response.alreadyInTrash) {
          personalAccountWarning = true
        }
      } catch (err) {
        console.error(`Failed to delete ${file.name}:`, err)
      }
    }
  }
  
  selectedIds.value = new Set()
  isBulkProcessing.value = false
  
  if (personalAccountWarning) {
    alert('Note: For personal Dropbox accounts, files in trash will be automatically deleted after 30 days.')
  }
}
</script>
