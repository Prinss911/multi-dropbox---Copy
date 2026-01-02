<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg bg-blue-500/10">
          <Icon name="lucide:clock" class="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <h1 class="text-xl font-semibold">Recent Files</h1>
          <p class="text-sm text-muted-foreground">Files you've recently accessed or modified</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="rounded-md border bg-card p-8">
      <div class="flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <Icon name="lucide:loader-2" class="h-8 w-8 animate-spin" />
        <p>Loading recent files...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-md border border-destructive/50 bg-destructive/10 p-8">
      <div class="flex flex-col items-center justify-center gap-2 text-destructive">
        <Icon name="lucide:alert-circle" class="h-8 w-8" />
        <p class="font-medium">Failed to load recent files</p>
        <p class="text-sm">{{ error }}</p>
        <UiButton variant="outline" size="sm" @click="fetchRecent" class="mt-2">
          <Icon name="lucide:refresh-cw" class="mr-2 h-4 w-4" />
          Retry
        </UiButton>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="files.length === 0" class="rounded-md border-2 border-dashed bg-card p-12">
      <div class="flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Icon name="lucide:clock" class="h-16 w-16" />
        <p class="font-medium text-lg">No recent files</p>
        <p class="text-sm">Files you access or modify will appear here</p>
      </div>
    </div>

    <!-- File List -->
    <div v-else class="rounded-md border bg-card text-card-foreground shadow-sm">
      <UiTable>
        <UiTableHeader>
          <UiTableRow class="hover:bg-transparent">
            <UiTableHead class="w-[400px]">Name</UiTableHead>
            <UiTableHead>Location</UiTableHead>
            <UiTableHead>Size</UiTableHead>
            <UiTableHead class="text-right">Modified</UiTableHead>
          </UiTableRow>
        </UiTableHeader>
        <UiTableBody>
          <UiTableRow 
            v-for="entry in files" 
            :key="entry.id"
            class="group cursor-pointer hover:bg-muted/50"
            @click="handleFileClick(entry)"
          >
            <UiTableCell class="font-medium flex items-center gap-3 py-3">
              <div :class="['p-2 rounded', getIconColor(entry as any)]">
                <Icon :name="getFileIcon(entry as any)" class="h-4 w-4" />
              </div>
              <span class="text-sm font-medium text-foreground truncate">{{ entry.name }}</span>
            </UiTableCell>
            <UiTableCell class="text-muted-foreground text-sm">
              {{ getParentPath(entry.path) }}
            </UiTableCell>
            <UiTableCell class="text-muted-foreground">
              {{ formatFileSize(entry.size) }}
            </UiTableCell>
            <UiTableCell class="text-right text-muted-foreground">
              {{ formatDate(entry.modified) }}
            </UiTableCell>
          </UiTableRow>
        </UiTableBody>
      </UiTable>
    </div>
  </div>
</template>

<script setup lang="ts">
const { getDownloadLink, formatFileSize, formatDate, getFileIcon, getIconColor } = useDropboxFiles()
const { activeAccountId } = useAccounts()

interface RecentFile {
  id: string
  name: string
  path: string
  type: string
  size: number | null
  modified: string | null
  extension: string | null
}

const files = ref<RecentFile[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const fetchRecent = async () => {
  isLoading.value = true
  error.value = null
  files.value = [] // Clear immediately
  
  try {
    const response = await $fetch<{ entries: RecentFile[] }>('/api/dropbox/recent')
    files.value = response.entries
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Failed to load recent files'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchRecent()
})

// Refetch when account changes
watch(activeAccountId, () => {
  fetchRecent()
})

const getParentPath = (path: string | null) => {
  if (!path) return '/'
  const parts = path.split('/')
  parts.pop()
  return parts.join('/') || '/'
}

const handleFileClick = async (entry: RecentFile) => {
  const link = await getDownloadLink(entry.path)
  if (link) {
    window.open(link, '_blank')
  }
}
</script>
