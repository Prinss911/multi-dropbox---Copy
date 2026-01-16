<template>
  <div class="flex items-center gap-3">
     <div class="relative group">
        <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input 
          :value="searchQuery"
          @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Search files..."
          class="h-10 pl-9 pr-4 w-full md:w-64 rounded-full border bg-muted/20 hover:bg-muted/40 focus:bg-background focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
        />
     </div>

     <div class="h-6 w-px bg-border mx-1"></div>

     <button 
        class="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        @click="$emit('toggle-view')"
        :title="viewMode === 'list' ? 'Switch to Grid' : 'Switch to List'"
     >
        <Icon :name="viewMode === 'list' ? 'lucide:layout-grid' : 'lucide:align-justify'" class="h-5 w-5" />
     </button>

     <!-- New Folder Button -->
     <button 
       @click="$emit('create-folder')"
       class="h-10 px-4 rounded-full border border-input hover:bg-accent hover:text-accent-foreground font-medium text-sm transition-all flex items-center gap-2"
     >
       <Icon name="lucide:folder-plus" class="h-4 w-4" />
       <span class="hidden sm:inline">New Folder</span>
     </button>

     <button 
       @click="$emit('upload')"
       class="h-10 px-5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm shadow-sm transition-all hover:shadow-md flex items-center gap-2 active:scale-95"
     >
       <Icon name="lucide:upload" class="h-4 w-4" />
       <span>Upload</span>
     </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  searchQuery: string
  viewMode: 'list' | 'grid'
}>()

defineEmits<{
  (e: 'update:searchQuery', value: string): void
  (e: 'toggle-view'): void
  (e: 'create-folder'): void
  (e: 'upload'): void
}>()
</script>