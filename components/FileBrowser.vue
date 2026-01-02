<template>
  <div 
    class="space-y-4"
    @dragenter.prevent="handleDragEnter"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <!-- Drop Zone Overlay -->
    <Transition name="fade">
      <div 
        v-if="isDragging" 
        class="fixed inset-0 z-40 bg-primary/10 backdrop-blur-sm flex items-center justify-center pointer-events-none"
      >
        <div class="bg-card border-2 border-dashed border-primary rounded-xl p-12 text-center shadow-2xl">
          <Icon name="lucide:upload-cloud" class="h-16 w-16 mx-auto mb-4 text-primary animate-bounce" />
          <p class="text-xl font-semibold text-primary">Drop files here to upload</p>
          <p class="text-sm text-muted-foreground mt-2">Files will be uploaded to current folder</p>
        </div>
      </div>
    </Transition>
    
    <!-- Bulk Action Bar -->
    <Transition name="slide">
      <div 
        v-if="selectedIds.size > 0" 
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-card border rounded-lg shadow-lg px-4 py-3 flex items-center gap-4"
      >
        <span class="text-sm font-medium">
          {{ selectedIds.size }} selected
        </span>
        <div class="h-4 w-px bg-border"></div>
        <div class="flex gap-2">
          <UiButton variant="outline" size="sm" @click="handleBulkDownload" :disabled="isDownloading">
            <Icon :name="isDownloading ? 'lucide:loader-2' : 'lucide:download'" :class="['mr-2 h-4 w-4', isDownloading && 'animate-spin']" />
            Download
          </UiButton>
          <UiButton variant="outline" size="sm" @click="showCopyModal = true">
            <Icon name="lucide:copy" class="mr-2 h-4 w-4" />
            Copy
          </UiButton>
          <UiButton variant="outline" size="sm" @click="showMoveModal = true">
            <Icon name="lucide:folder-input" class="mr-2 h-4 w-4" />
            Move
          </UiButton>
          <UiButton variant="outline" size="sm" class="text-destructive hover:text-destructive" @click="handleBulkDelete">
            <Icon name="lucide:trash-2" class="mr-2 h-4 w-4" />
            Delete
          </UiButton>
        </div>
        <div class="h-4 w-px bg-border"></div>
        <UiButton variant="ghost" size="sm" @click="clearSelection">
          <Icon name="lucide:x" class="mr-2 h-4 w-4" />
          Cancel
        </UiButton>
      </div>
    </Transition>

    <!-- Header with Breadcrumb and Actions -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <UiButton 
          v-if="currentPath" 
          variant="ghost" 
          size="icon" 
          @click="navigateUp"
          class="h-8 w-8"
        >
          <Icon name="lucide:arrow-left" class="h-4 w-4" />
        </UiButton>
        <nav class="flex items-center gap-1 text-sm">
          <button 
            @click="fetchFiles('')"
            class="text-muted-foreground hover:text-foreground transition-colors"
          >
            Root
          </button>
          <template v-for="(segment, index) in pathSegments" :key="index">
            <Icon name="lucide:chevron-right" class="h-4 w-4 text-muted-foreground" />
            <button 
              @click="navigateToPath(index)"
              :class="index === pathSegments.length - 1 ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground transition-colors'"
            >
              {{ segment }}
            </button>
          </template>
        </nav>
      </div>
      <div class="flex gap-2">
        <!-- Upload Button -->
        <UiButton variant="outline" size="sm" @click="triggerUpload" :disabled="isUploading">
          <Icon :name="isUploading ? 'lucide:loader-2' : 'lucide:upload'" :class="['mr-2 h-4 w-4', isUploading && 'animate-spin']" />
          {{ isUploading ? `Uploading ${uploadProgress}` : 'Upload' }}
        </UiButton>
        <input 
          ref="fileInput" 
          type="file" 
          multiple 
          class="hidden" 
          @change="handleFileUpload"
        />
        
        <!-- New Folder Button -->
        <UiButton variant="outline" size="sm" @click="showNewFolderModal = true">
          <Icon name="lucide:folder-plus" class="mr-2 h-4 w-4" />
          New Folder
        </UiButton>
      </div>
    </div>
    
    <!-- Upload Progress Bar -->
    <div v-if="isUploading" class="bg-card border rounded-lg p-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium">Uploading files...</span>
        <span class="text-sm text-muted-foreground">{{ uploadProgress }}</span>
      </div>
      <div class="w-full bg-muted rounded-full h-2">
        <div 
          class="bg-primary h-2 rounded-full transition-all duration-300" 
          :style="{ width: uploadProgressPercent + '%' }"
        ></div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="rounded-md border bg-card p-8">
      <div class="flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <Icon name="lucide:loader-2" class="h-8 w-8 animate-spin" />
        <p>Loading files...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-md border border-destructive/50 bg-destructive/10 p-8">
      <div class="flex flex-col items-center justify-center gap-2 text-destructive">
        <Icon name="lucide:alert-circle" class="h-8 w-8" />
        <p class="font-medium">Failed to load files</p>
        <p class="text-sm">{{ error }}</p>
        <UiButton variant="outline" size="sm" @click="fetchFiles(currentPath)" class="mt-2">
          <Icon name="lucide:refresh-cw" class="mr-2 h-4 w-4" />
          Retry
        </UiButton>
      </div>
    </div>

    <!-- Empty State with Drop Zone -->
    <div 
      v-else-if="files.length === 0" 
      class="rounded-md border-2 border-dashed bg-card p-12 transition-colors"
      :class="isDragging ? 'border-primary bg-primary/5' : 'border-muted'"
    >
      <div class="flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Icon name="lucide:folder-open" class="h-16 w-16" />
        <p class="font-medium text-lg">This folder is empty</p>
        <p class="text-sm">Drag and drop files here, or click the Upload button</p>
        <UiButton variant="outline" size="sm" class="mt-2" @click="triggerUpload">
          <Icon name="lucide:upload" class="mr-2 h-4 w-4" />
          Upload Files
        </UiButton>
      </div>
    </div>

    <!-- File List -->
    <div v-else class="rounded-md border bg-card text-card-foreground shadow-sm">
      <UiTable>
        <UiTableHeader>
          <UiTableRow class="hover:bg-transparent">
            <UiTableHead class="w-[50px]">
              <input 
                type="checkbox" 
                :checked="isAllSelected"
                @change="isAllSelected ? clearSelection() : selectAll()"
                class="h-4 w-4 rounded border-muted-foreground"
              />
            </UiTableHead>
            <UiTableHead class="w-[400px]">Name</UiTableHead>
            <UiTableHead>Type</UiTableHead>
            <UiTableHead>Size</UiTableHead>
            <UiTableHead class="text-right">Modified</UiTableHead>
            <UiTableHead class="w-[100px]"></UiTableHead>
          </UiTableRow>
        </UiTableHeader>
        <UiTableBody>
          <UiTableRow 
            v-for="entry in files" 
            :key="entry.id" 
            :class="'group cursor-pointer transition-colors ' + (isSelected(entry.id) ? 'bg-primary/10' : 'hover:bg-muted/50')"
            @click="handleEntryClick(entry)"
          >
            <UiTableCell @click.stop>
              <input 
                type="checkbox" 
                :checked="isSelected(entry.id)"
                @change="toggleSelect(entry.id)"
                class="h-4 w-4 rounded border-muted-foreground"
              />
            </UiTableCell>
            <UiTableCell class="font-medium flex items-center gap-3 py-3">
              <div :class="['p-2 rounded', getIconColor(entry)]">
                <Icon :name="getFileIcon(entry)" class="h-4 w-4" :class="entry.type === 'folder' ? 'fill-current' : ''" />
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-sm font-medium text-foreground truncate">{{ entry.name }}</span>
                <span class="text-xs text-muted-foreground">
                  {{ entry.type === 'folder' ? 'Folder' : (entry.extension?.toUpperCase() || 'File') }}
                </span>
              </div>
            </UiTableCell>
            <UiTableCell class="text-muted-foreground">
              {{ entry.type === 'folder' ? 'Folder' : (entry.extension?.toUpperCase() || 'File') }}
            </UiTableCell>
            <UiTableCell class="text-muted-foreground">
              {{ formatFileSize(entry.size) }}
            </UiTableCell>
            <UiTableCell class="text-right text-muted-foreground">
              {{ formatDate(entry.modified) }}
            </UiTableCell>
            <UiTableCell class="text-right" @click.stop>
              <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <UiButton 
                  v-if="entry.type === 'file'"
                  variant="ghost" 
                  size="icon" 
                  class="h-8 w-8 text-blue-600 hover:text-blue-700"
                  @click="handleShare(entry)"
                  title="Share"
                >
                  <Icon name="lucide:share-2" class="h-4 w-4" />
                </UiButton>
                <UiButton 
                  variant="ghost" 
                  size="icon" 
                  class="h-8 w-8"
                  @click="handleRename(entry)"
                  title="Rename"
                >
                  <Icon name="lucide:pencil" class="h-4 w-4" />
                </UiButton>
                <UiButton 
                  variant="ghost" 
                  size="icon" 
                  class="h-8 w-8 text-destructive hover:text-destructive"
                  @click="handleDelete(entry)"
                  title="Delete"
                >
                  <Icon name="lucide:trash-2" class="h-4 w-4" />
                </UiButton>
              </div>
            </UiTableCell>
          </UiTableRow>
        </UiTableBody>
      </UiTable>
    </div>
    
    <!-- Drag & Drop Hint -->
    <div class="text-center text-xs text-muted-foreground">
      <Icon name="lucide:info" class="inline h-3 w-3 mr-1" />
      Tip: Drag and drop files anywhere to upload. Use checkboxes for bulk actions.
    </div>
    
    <!-- New Folder Modal -->
    <Teleport to="body">
      <div v-if="showNewFolderModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showNewFolderModal = false">
        <div class="bg-card rounded-lg shadow-lg w-full max-w-sm p-6 m-4">
          <h2 class="text-lg font-semibold mb-4">Create New Folder</h2>
          <div class="space-y-4">
            <UiInput 
              v-model="newFolderName" 
              placeholder="Folder name"
              @keyup.enter="handleCreateFolder"
              autofocus
            />
            <div class="flex gap-2">
              <UiButton variant="outline" class="flex-1" @click="showNewFolderModal = false">
                Cancel
              </UiButton>
              <UiButton 
                class="flex-1" 
                :disabled="!newFolderName || isCreatingFolder"
                @click="handleCreateFolder"
              >
                <Icon v-if="isCreatingFolder" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
                Create
              </UiButton>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- Rename Modal -->
    <Teleport to="body">
      <div v-if="showRenameModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showRenameModal = false">
        <div class="bg-card rounded-lg shadow-lg w-full max-w-sm p-6 m-4">
          <h2 class="text-lg font-semibold mb-4">Rename</h2>
          <div class="space-y-4">
            <UiInput 
              v-model="renameNewName" 
              placeholder="New name"
              @keyup.enter="handleRenameConfirm"
              autofocus
            />
            <div class="flex gap-2">
              <UiButton variant="outline" class="flex-1" @click="showRenameModal = false">
                Cancel
              </UiButton>
              <UiButton 
                class="flex-1" 
                :disabled="!renameNewName || isRenaming"
                @click="handleRenameConfirm"
              >
                <Icon v-if="isRenaming" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
                Rename
              </UiButton>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- Move Modal -->
    <Teleport to="body">
      <div v-if="showMoveModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showMoveModal = false">
        <div class="bg-card rounded-lg shadow-lg w-full max-w-md p-6 m-4">
          <h2 class="text-lg font-semibold mb-4">Move {{ selectedIds.size }} items to...</h2>
          <div class="space-y-4">
            <!-- Folder Browser -->
            <div class="border rounded-lg max-h-64 overflow-auto">
              <!-- Current Path -->
              <div class="sticky top-0 bg-card border-b p-2 flex items-center gap-2">
                <UiButton 
                  v-if="movePath" 
                  variant="ghost" 
                  size="icon"
                  class="h-7 w-7"
                  @click="navigateMoveUp"
                >
                  <Icon name="lucide:arrow-left" class="h-4 w-4" />
                </UiButton>
                <span class="text-sm text-muted-foreground truncate">
                  {{ movePath || 'Root' }}
                </span>
              </div>
              
              <!-- Folder List -->
              <div v-if="isFetchingFolders" class="p-4 text-center text-muted-foreground">
                <Icon name="lucide:loader-2" class="h-5 w-5 animate-spin mx-auto" />
              </div>
              <div v-else-if="moveFolders.length === 0" class="p-4 text-center text-muted-foreground text-sm">
                No folders here
              </div>
              <div v-else>
                <button
                  v-for="folder in moveFolders"
                  :key="folder.id"
                  @click="navigateMoveFolder(folder.path)"
                  class="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted transition-colors text-left"
                >
                  <Icon name="lucide:folder" class="h-4 w-4 text-yellow-600 fill-current" />
                  <span class="text-sm truncate">{{ folder.name }}</span>
                  <Icon name="lucide:chevron-right" class="h-4 w-4 text-muted-foreground ml-auto" />
                </button>
              </div>
            </div>
            
            <div class="flex gap-2">
              <UiButton variant="outline" class="flex-1" @click="showMoveModal = false">
                Cancel
              </UiButton>
              <UiButton 
                class="flex-1" 
                :disabled="isMoving"
                @click="handleBulkMove"
              >
                <Icon v-if="isMoving" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
                Move Here
              </UiButton>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- Copy Modal -->
    <Teleport to="body">
      <div v-if="showCopyModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showCopyModal = false">
        <div class="bg-card rounded-lg shadow-lg w-full max-w-md p-6 m-4">
          <h2 class="text-lg font-semibold mb-4">Copy {{ selectedIds.size }} items to...</h2>
          <div class="space-y-4">
            <!-- Folder Browser -->
            <div class="border rounded-lg max-h-64 overflow-auto">
              <!-- Current Path -->
              <div class="sticky top-0 bg-card border-b p-2 flex items-center gap-2">
                <UiButton 
                  v-if="copyPath" 
                  variant="ghost" 
                  size="icon"
                  class="h-7 w-7"
                  @click="navigateCopyUp"
                >
                  <Icon name="lucide:arrow-left" class="h-4 w-4" />
                </UiButton>
                <span class="text-sm text-muted-foreground truncate">
                  {{ copyPath || 'Root' }}
                </span>
              </div>
              
              <!-- Folder List -->
              <div v-if="isFetchingCopyFolders" class="p-4 text-center text-muted-foreground">
                <Icon name="lucide:loader-2" class="h-5 w-5 animate-spin mx-auto" />
              </div>
              <div v-else-if="copyFolders.length === 0" class="p-4 text-center text-muted-foreground text-sm">
                No folders here
              </div>
              <div v-else>
                <button
                  v-for="folder in copyFolders"
                  :key="folder.id"
                  @click="navigateCopyFolder(folder.path)"
                  class="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted transition-colors text-left"
                >
                  <Icon name="lucide:folder" class="h-4 w-4 text-yellow-600 fill-current" />
                  <span class="text-sm truncate">{{ folder.name }}</span>
                  <Icon name="lucide:chevron-right" class="h-4 w-4 text-muted-foreground ml-auto" />
                </button>
              </div>
            </div>
            
            <div class="flex gap-2">
              <UiButton variant="outline" class="flex-1" @click="showCopyModal = false">
                Cancel
              </UiButton>
              <UiButton 
                class="flex-1" 
                :disabled="isCopying"
                @click="handleBulkCopy"
              >
                <Icon v-if="isCopying" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
                Copy Here
              </UiButton>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- Share Modal -->
    <Teleport to="body">
      <div v-if="showShareModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showShareModal = false">
        <div class="bg-card rounded-lg shadow-lg w-full max-w-md p-6 m-4">
          <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon name="lucide:share-2" class="h-5 w-5 text-blue-600" />
            Share File
          </h2>
          
          <div v-if="!shareResult" class="space-y-4">
            <div class="text-sm text-muted-foreground">
              <span class="font-medium text-foreground">{{ shareFile?.name }}</span>
            </div>
            
            <div>
              <label class="text-sm text-muted-foreground mb-2 block">Link expires in:</label>
              <div class="grid grid-cols-4 gap-2">
                <button
                  v-for="option in shareExpirationOptions"
                  :key="option.label"
                  @click="shareExpiration = option.days; shareExpirationUnit = option.unit"
                  :class="[
                    'px-3 py-2 rounded-lg text-sm font-medium transition-all border',
                    (shareExpiration === option.days && shareExpirationUnit === option.unit)
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-background border-border hover:bg-muted'
                  ]"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
            
            <div class="flex gap-2">
              <UiButton variant="outline" class="flex-1" @click="showShareModal = false">
                Cancel
              </UiButton>
              <UiButton 
                class="flex-1" 
                :disabled="isCreatingShare"
                @click="createShareLink"
              >
                <Icon v-if="isCreatingShare" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
                Create Link
              </UiButton>
            </div>
          </div>
          
          <div v-else class="space-y-4">
            <div class="flex items-center gap-2 text-green-600">
              <Icon name="lucide:check-circle" class="h-5 w-5" />
              <span class="font-medium">Link created!</span>
            </div>
            
            <div class="flex gap-2">
              <input 
                type="text" 
                :value="shareResult.url" 
                readonly
                class="flex-1 px-3 py-2 bg-muted border rounded-md text-sm"
              />
              <UiButton 
                @click="copyShareUrl"
                :variant="copiedShareUrl ? 'default' : 'outline'"
              >
                <Icon :name="copiedShareUrl ? 'lucide:check' : 'lucide:copy'" class="h-4 w-4" />
              </UiButton>
            </div>
            
            <p class="text-xs text-muted-foreground">
              Expires: {{ new Date(shareResult.expiresAt).toLocaleString() }}
            </p>
            
            <UiButton class="w-full" @click="showShareModal = false; shareResult = null">
              Done
            </UiButton>
          </div>
        </div>
      </div>
    </Teleport>

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
const {
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
} = useDropboxFiles()

const { activeAccountId } = useAccounts()

// Fetch files on mount
onMounted(() => {
  fetchFiles('')
})

// Refetch when account changes
watch(activeAccountId, () => {
  fetchFiles('', true) // clear immediately and fetch
})

// Breadcrumb segments
const pathSegments = computed(() => {
  if (!currentPath.value) return []
  return currentPath.value.split('/').filter(Boolean)
})

// Navigate to specific breadcrumb path
const navigateToPath = (index: number) => {
  const segments = pathSegments.value.slice(0, index + 1)
  const path = '/' + segments.join('/')
  fetchFiles(path)
}

// Handle click on file/folder
const handleEntryClick = async (entry: any) => {
  if (entry.type === 'folder') {
    navigateToFolder(entry.path)
  } else {
    const link = await getDownloadLink(entry.path)
    if (link) {
      window.open(link, '_blank')
    }
  }
}

// Drag and Drop
const isDragging = ref(false)
let dragCounter = 0

const handleDragEnter = (e: DragEvent) => {
  dragCounter++
  if (e.dataTransfer?.types.includes('Files')) {
    isDragging.value = true
  }
}

const handleDragOver = (e: DragEvent) => {
  if (e.dataTransfer?.types.includes('Files')) {
    e.dataTransfer.dropEffect = 'copy'
  }
}

const handleDragLeave = () => {
  dragCounter--
  if (dragCounter === 0) {
    isDragging.value = false
  }
}

const handleDrop = async (e: DragEvent) => {
  isDragging.value = false
  dragCounter = 0
  
  const files = e.dataTransfer?.files
  if (!files?.length) return
  
  await processUpload(files)
}

// Upload
const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)
const uploadedCount = ref(0)
const totalUploadCount = ref(0)

const uploadProgress = computed(() => {
  if (totalUploadCount.value === 0) return ''
  return `${uploadedCount.value}/${totalUploadCount.value}`
})

const uploadProgressPercent = computed(() => {
  if (totalUploadCount.value === 0) return 0
  return Math.round((uploadedCount.value / totalUploadCount.value) * 100)
})

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return
  
  await processUpload(input.files)
  input.value = ''
}

const processUpload = async (fileList: FileList) => {
  isUploading.value = true
  uploadedCount.value = 0
  totalUploadCount.value = fileList.length
  
  try {
    const session = await $fetch<{ accessToken: string; uploadPath: string }>('/api/dropbox/upload-session', {
      query: { path: currentPath.value }
    })

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
      
      uploadedCount.value++
    }

    await fetchFiles(currentPath.value)
  } catch (err: any) {
    console.error('Upload error:', err)
    alert(err.message || 'Upload failed')
  } finally {
    isUploading.value = false
    uploadedCount.value = 0
    totalUploadCount.value = 0
  }
}

// New Folder
const showNewFolderModal = ref(false)
const newFolderName = ref('')
const isCreatingFolder = ref(false)

const handleCreateFolder = async () => {
  if (!newFolderName.value) return
  
  isCreatingFolder.value = true
  try {
    await createFolder(newFolderName.value)
    showNewFolderModal.value = false
    newFolderName.value = ''
  } catch (err: any) {
    alert(err.message || 'Failed to create folder')
  } finally {
    isCreatingFolder.value = false
  }
}

// Rename
const showRenameModal = ref(false)
const renameEntry = ref<any>(null)
const renameNewName = ref('')
const isRenaming = ref(false)

const handleRename = (entry: any) => {
  renameEntry.value = entry
  renameNewName.value = entry.name
  showRenameModal.value = true
}

const handleRenameConfirm = async () => {
  if (!renameNewName.value || !renameEntry.value) return
  
  isRenaming.value = true
  try {
    await renameItem(renameEntry.value.path, renameNewName.value)
    showRenameModal.value = false
    renameEntry.value = null
    renameNewName.value = ''
  } catch (err: any) {
    alert(err.message || 'Failed to rename')
  } finally {
    isRenaming.value = false
  }
}

// Confirm Dialog State
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

// Delete
const handleDelete = async (entry: any) => {
  const confirmMsg = entry.type === 'folder' 
    ? `Delete folder "${entry.name}" and all its contents?`
    : `Delete "${entry.name}"?`
    
  const confirmed = await showConfirm({ title: 'Delete', message: confirmMsg })
  if (!confirmed) return
  
  try {
    await deleteItem(entry.path)
  } catch (err: any) {
    console.error('Delete error:', err)
  }
}

// Bulk Delete
const handleBulkDelete = async () => {
  const count = selectedIds.value.size
  const confirmed = await showConfirm({
    title: 'Delete Items',
    message: `Delete ${count} items? This cannot be undone.`,
    confirmText: 'Delete All'
  })
  if (!confirmed) return
  
  try {
    const paths = selectedFiles.value.map(f => f.path)
    await bulkDelete(paths)
  } catch (err: any) {
    console.error('Bulk delete error:', err)
  }
}

// Move Modal
const showMoveModal = ref(false)
const movePath = ref('')
const moveFolders = ref<any[]>([])
const isFetchingFolders = ref(false)
const isMoving = ref(false)

watch(showMoveModal, async (show) => {
  if (show) {
    movePath.value = ''
    await fetchMoveFolders('')
  }
})

const fetchMoveFolders = async (path: string) => {
  isFetchingFolders.value = true
  try {
    moveFolders.value = await getFolders(path)
  } finally {
    isFetchingFolders.value = false
  }
}

const navigateMoveFolder = async (path: string) => {
  movePath.value = path
  await fetchMoveFolders(path)
}

const navigateMoveUp = async () => {
  const parts = movePath.value.split('/')
  parts.pop()
  const parentPath = parts.join('/')
  movePath.value = parentPath
  await fetchMoveFolders(parentPath)
}

const handleBulkMove = async () => {
  isMoving.value = true
  try {
    const paths = selectedFiles.value.map(f => f.path)
    await bulkMove(paths, movePath.value)
    showMoveModal.value = false
  } catch (err: any) {
    alert(err.message || 'Failed to move items')
  } finally {
    isMoving.value = false
  }
}

// Bulk Download
const isDownloading = ref(false)

const handleBulkDownload = async () => {
  // Filter only files (not folders)
  const filePaths = selectedFiles.value
    .filter(f => f.type === 'file')
    .map(f => f.path)
  
  if (filePaths.length === 0) {
    alert('Please select at least one file to download. Folders cannot be downloaded directly.')
    return
  }
  
  isDownloading.value = true
  try {
    await bulkDownload(filePaths)
  } catch (err: any) {
    alert(err.message || 'Failed to download files')
  } finally {
    isDownloading.value = false
  }
}

// Copy Modal
const showCopyModal = ref(false)
const copyPath = ref('')
const copyFolders = ref<any[]>([])
const isFetchingCopyFolders = ref(false)
const isCopying = ref(false)

watch(showCopyModal, async (show) => {
  if (show) {
    copyPath.value = ''
    await fetchCopyFolders('')
  }
})

const fetchCopyFolders = async (path: string) => {
  isFetchingCopyFolders.value = true
  try {
    copyFolders.value = await getFolders(path)
  } finally {
    isFetchingCopyFolders.value = false
  }
}

const navigateCopyFolder = async (path: string) => {
  copyPath.value = path
  await fetchCopyFolders(path)
}

const navigateCopyUp = async () => {
  const parts = copyPath.value.split('/')
  parts.pop()
  const parentPath = parts.join('/')
  copyPath.value = parentPath
  await fetchCopyFolders(parentPath)
}

const handleBulkCopy = async () => {
  isCopying.value = true
  try {
    const paths = selectedFiles.value.map(f => f.path)
    await bulkCopy(paths, copyPath.value)
    showCopyModal.value = false
  } catch (err: any) {
    alert(err.message || 'Failed to copy items')
  } finally {
    isCopying.value = false
  }
}
// Share Logic
const showShareModal = ref(false)
const shareFile = ref<any>(null)
const shareResult = ref<any>(null)
const shareExpiration = ref(7)
const isCreatingShare = ref(false)
const copiedShareUrl = ref(false)

const shareExpirationOptions = [
  { days: 10, unit: 'seconds', label: '10 Sec' },
  { days: 1, unit: 'days', label: '1 Day' },
  { days: 3, unit: 'days', label: '3 Days' },
  { days: 7, unit: 'days', label: '7 Days' },
  { days: 30, unit: 'days', label: '1 Month' }
]

const handleShare = (entry: any) => {
  shareFile.value = entry
  shareResult.value = null
  shareExpiration.value = 7
  // Reset unit to days by default, user can select seconds
  shareExpirationUnit.value = 'days' 
  showShareModal.value = true
}

const shareExpirationUnit = ref('days') // Track selected unit

const createShareLink = async () => {
  if (!shareFile.value) return
  
  isCreatingShare.value = true
  try {
    const response = await $fetch<{
      success: boolean
      share: {
        id: string
        url: string
        fileName: string
        expiresAt: string
      }
    }>('/api/shares/create', {
      method: 'POST',
      body: {
        filePath: shareFile.value.path,
        fileName: shareFile.value.name,
        fileId: shareFile.value.id,
        expirationDays: shareExpiration.value,
        expirationUnit: shareExpirationUnit.value
      }
    })
    
    if (response.success) {
      shareResult.value = response.share
    }
  } catch (err: any) {
    console.error('Create share failed:', err)
    alert(err.data?.message || err.message || 'Failed to create share link')
  } finally {
    isCreatingShare.value = false
  }
}

const copyShareUrl = async () => {
  if (!shareResult.value) return
  await navigator.clipboard.writeText(shareResult.value.url)
  copiedShareUrl.value = true
  setTimeout(() => copiedShareUrl.value = false, 2000)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
