<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
     <!-- Card Items -->
     <div 
        v-for="file in files" 
        :key="file.id"
        class="group relative bg-card border rounded-[10px] p-4 flex flex-col items-center text-center transition-all duration-200 select-none"
        :class="[
           selectedFiles.has(file.id) ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' : 'hover:bg-muted/30 border-transparent hover:border-border/50',
           dropTargetId === file.id ? 'bg-blue-100 dark:bg-blue-800/30 ring-2 ring-blue-400' : '',
           draggedFile?.id === file.id ? 'opacity-50' : '',
           'cursor-pointer'
        ]"
        :draggable="true"
        @click="$emit('row-click', file)"
        @mousedown="$emit('long-press-start', $event, file)"
        @mouseup="$emit('long-press-cancel')"
        @mouseleave="$emit('long-press-cancel')"
        @dragstart="$emit('drag-start', $event, file)"
        @dragend="$emit('drag-end', $event)"
        @dragover="$emit('drag-over', $event, file)"
        @dragleave="$emit('drag-leave', $event)"
        @drop="$emit('drop', $event, file)"
     >
        <!-- Absolute Checkbox/Selection -->
        <div 
           v-if="file.type !== 'folder'"
           class="absolute top-3 left-3 transition-opacity z-10"
           :class="selectedFiles.has(file.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
        >
           <input 
              type="checkbox" 
              :checked="selectedFiles.has(file.id)"
              @click.stop
              @change="$emit('toggle-file-selection', file)"
              class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
           />
        </div>

         <!-- Absolute Actions (Top Right) -->
        <div class="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
           <button v-if="file.shareUrl" @click.stop="$emit('action', 'copy-link', file)" class="h-7 w-7 rounded bg-background shadow-sm border flex items-center justify-center hover:bg-green-50 text-green-600">
              <Icon name="lucide:link" class="h-3.5 w-3.5" />
           </button>
            <button @click.stop="$emit('action', 'share', file)" class="h-7 w-7 rounded bg-background shadow-sm border flex items-center justify-center hover:bg-blue-50 text-blue-600">
              <Icon name="lucide:share-2" class="h-3.5 w-3.5" />
           </button>
            <!-- Remove from folder (only for files in virtual folder) -->
            <button v-if="file.virtualFolder" @click.stop="$emit('action', 'remove-from-folder', file)" class="h-7 w-7 rounded bg-background shadow-sm border flex items-center justify-center hover:bg-orange-50 text-orange-600" title="Remove from folder">
              <Icon name="lucide:folder-minus" class="h-3.5 w-3.5" />
           </button>
            <button @click.stop="$emit('action', 'delete', file)" class="h-7 w-7 rounded bg-background shadow-sm border flex items-center justify-center hover:bg-red-50 text-red-600">
              <Icon name="lucide:trash-2" class="h-3.5 w-3.5" />
           </button>
        </div>

        <!-- Icon Preview (Clickable for preview) -->
        <div 
           @click="file.type === 'folder' ? $emit('row-click', file) : $emit('action', 'preview', file)"
           class="h-24 w-full flex items-center justify-center mb-3 cursor-pointer hover:scale-105 transition-transform"
        >
            <!-- Colored Container for Grid View -->
           <div 
              class="h-16 w-16 rounded-2xl flex items-center justify-center shadow-sm"
              :class="file.type === 'folder' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : getIconColor(file.extension)"
           >
              <Icon 
                 :name="file.type === 'folder' ? 'lucide:folder' : getFileIcon(file.extension)" 
                 class="h-8 w-8"
                 :class="{'fill-blue-500/20': file.type === 'folder'}"
              />
           </div>
           
           <span v-if="isVideoFile(file.extension)" class="absolute bottom-16 right-4 text-[10px] font-bold bg-black/70 text-white px-1.5 py-0.5 rounded">
              {{ file.duration || 'VIDEO' }}
           </span>
        </div>
        
        <!-- File Name -->
        <h4 
           @click="file.type === 'folder' ? $emit('row-click', file) : $emit('action', 'preview', file)"
           class="font-medium text-sm text-[#1E1919] dark:text-foreground w-full truncate px-1 cursor-pointer hover:text-[#0061FE] transition-colors" 
           :title="file.name"
        >
           {{ file.name }}
        </h4>
        
        <!-- Meta -->
        <div class="text-xs text-[#52555A] mt-1 space-x-1">
           <span>{{ file.extension?.toUpperCase() }}</span>
           <span>•</span>
           <span>{{ formatBytes(file.size) }}</span>
        </div>
     </div>
  </div>
</template>

<script setup lang="ts">
import { formatBytes, getFileIcon, getIconColor, isVideoFile } from '~/utils/file'

defineProps<{
  files: any[]
  selectedFiles: Set<string>
  dropTargetId: string | null
  draggedFile: any | null
}>()

defineEmits<{
  (e: 'row-click', file: any): void
  (e: 'toggle-file-selection', file: any): void
  (e: 'long-press-start', event: MouseEvent, file: any): void
  (e: 'long-press-cancel'): void
  (e: 'drag-start', event: DragEvent, file: any): void
  (e: 'drag-end', event: DragEvent): void
  (e: 'drag-over', event: DragEvent, file: any): void
  (e: 'drag-leave', event: DragEvent): void
  (e: 'drop', event: DragEvent, file: any): void
  (e: 'action', action: string, file: any): void
}>()
</script>