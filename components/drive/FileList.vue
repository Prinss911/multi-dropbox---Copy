<template>
  <table class="w-full text-left border-collapse">
      <thead class="sticky top-0 bg-background/95 backdrop-blur z-10">
          <tr>
            <!-- Bulk Selection Checkbox -->
            <th class="py-3 px-2 w-10 border-b">
                <div class="flex items-center justify-center">
                  <input 
                      type="checkbox" 
                      :checked="isAllSelected"
                      :indeterminate="isPartiallySelected"
                      @change="$emit('toggle-select-all')"
                      class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
            </th>
            <th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-1/2 cursor-pointer hover:text-foreground group" @click="$emit('update:sortBy', 'name')">
              Name
              <Icon v-if="sortBy === 'name'" name="lucide:chevron-down" class="inline h-3 w-3 ml-1" />
            </th>
            <th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-32 hidden md:table-cell hover:bg-muted/50 cursor-pointer" @click="$emit('update:sortBy', 'size')">
                Size
                <Icon v-if="sortBy === 'size'" name="lucide:chevron-down" class="inline h-3 w-3 ml-1" />
            </th>
            <th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-40 hidden lg:table-cell hover:bg-muted/50 cursor-pointer" @click="$emit('update:sortBy', 'modified')">
                Modified
                <Icon v-if="sortBy === 'modified'" name="lucide:chevron-down" class="inline h-3 w-3 ml-1" />
            </th>
            <th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-32 hidden lg:table-cell">Members</th>
            <th class="py-3 px-6 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-24">Actions</th>
          </tr>
      </thead>
      <tbody class="divide-y divide-border/40">
          <tr 
            v-for="file in files" 
            :key="file.id" 
            class="group transition-colors duration-200"
            :class="[
                selectedFiles.has(file.id) ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-[#F7F9FA] dark:hover:bg-muted/20',
                dropTargetId === file.id ? 'bg-blue-100 dark:bg-blue-800/30 ring-2 ring-blue-400 ring-inset' : '',
                draggedFile?.id === file.id ? 'opacity-50' : '',
                'cursor-pointer select-none'
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
            <!-- Row Checkbox -->
            <td class="py-3 px-2">
                <div class="flex items-center justify-center">
                  <input 
                      type="checkbox" 
                      :checked="selectedFiles.has(file.id)"
                      @click.stop
                      @change="$emit('toggle-file-selection', file)"
                      class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
            </td>
            <td class="py-3 px-4">
                <div class="flex items-center gap-4">
                  <!-- Minimalist Icon with Colored Container -->
                  <div class="relative shrink-0">
                      <div 
                        class="h-10 w-10 rounded-lg flex items-center justify-center transition-colors"
                        :class="file.type === 'folder' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : getIconColor(file.extension)"
                      >
                        <Icon 
                            :name="file.type === 'folder' ? 'lucide:folder' : getFileIcon(file.extension)" 
                            class="h-5 w-5"
                            :class="{'fill-blue-500/20': file.type === 'folder'}"
                        />
                      </div>
                      <!-- Verified/Shared Badge -->
                      <span v-if="file.shareUrl && file.type !== 'folder'" class="absolute -bottom-1 -right-1 block h-3 w-3 rounded-full bg-green-500 border-2 border-background ring-1 ring-green-100"></span>
                  </div>
                  <div class="min-w-0 pr-4">
                      <p 
                        class="font-medium text-sm text-foreground dark:text-foreground truncate transition-colors group-hover:text-primary" 
                        :title="file.name"
                      >
                        {{ file.name }}
                      </p>
                      <div class="flex items-center gap-2 mt-0.5 md:hidden" v-if="file.type !== 'folder'">
                        <span class="text-xs text-muted-foreground">{{ formatBytes(file.size) }}</span>
                        <span class="text-xs text-muted-foreground">•</span>
                        <span class="text-xs text-muted-foreground">{{ formatDate(file.modified) }}</span>
                      </div>
                      <div  v-else class="flex items-center gap-2 mt-0.5 md:hidden">
                        <span class="text-xs text-muted-foreground">Folder</span>
                      </div>
                  </div>
                </div>
            </td>
            <td class="py-3 px-4 text-sm text-[#52555A] hidden md:table-cell font-mono text-xs">
                {{ formatBytes(file.size) }}
            </td>
            <td class="py-3 px-4 text-sm text-[#52555A] hidden lg:table-cell">
                {{ formatDate(file.modified) }}
            </td>
            <td class="py-3 px-4 text-sm hidden lg:table-cell">
                <div v-if="file.shareUrl" class="flex flex-col items-start gap-1">
                  <div class="flex items-center gap-1.5 text-xs text-green-600 font-medium px-2 py-1 bg-green-50 rounded-full w-fit">
                      <Icon name="lucide:globe" class="h-3 w-3" />
                      <span>Link active</span>
                  </div>
                  <span v-if="file.shareExpiresAt" :class="getExpiryColor(file.shareExpiresAt)" class="text-[10px] ml-1">
                      {{ getExpiryDistance(file.shareExpiresAt) }}
                  </span>
                </div>
                <div v-else class="text-xs text-muted-foreground italic">Only you</div>
            </td>
            <td class="py-3 px-4 text-right">
                <!-- Actions only show on hover (desktop) -->
                <div class="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                      v-if="file.shareUrl"
                      @click.stop="$emit('action', 'copy-link', file)"
                      :title="copiedFileId === file.id ? 'Copied' : 'Copy link'"
                      class="h-8 w-8 flex items-center justify-center rounded hover:bg-white hover:text-green-600 hover:shadow-sm transition-all"
                      :class="copiedFileId === file.id ? 'text-green-600 bg-green-50' : 'text-muted-foreground'"
                  >
                      <Icon :name="copiedFileId === file.id ? 'lucide:check' : 'lucide:link'" class="h-4 w-4" />
                  </button>

                  <button 
                      @click.stop="$emit('action', 'preview', file)"
                      title="Preview"
                      class="h-8 w-8 flex items-center justify-center rounded hover:bg-purple-50 hover:text-purple-600 hover:shadow-sm transition-all text-muted-foreground"
                  >
                      <Icon name="lucide:eye" class="h-4 w-4" />
                  </button>

                  <button 
                      @click.stop="$emit('action', 'share', file)"
                      title="Share"
                      class="h-8 w-8 flex items-center justify-center rounded hover:bg-primary hover:text-primary-foreground hover:shadow-sm transition-all text-muted-foreground"
                  >
                      <Icon name="lucide:share-2" class="h-4 w-4" />
                  </button>
                  
                  <button 
                      @click.stop="$emit('action', 'download', file)"
                      title="Download"
                      class="h-8 w-8 flex items-center justify-center rounded hover:bg-background hover:text-primary hover:shadow-sm transition-all text-muted-foreground"
                  >
                      <Icon name="lucide:download" class="h-4 w-4" />
                  </button>

                  <!-- Remove from folder button (only visible when file is in a virtual folder) -->
                  <button 
                      v-if="file.virtualFolder"
                      @click.stop="$emit('action', 'remove-from-folder', file)"
                      title="Remove from folder"
                      class="h-8 w-8 flex items-center justify-center rounded hover:bg-orange-50 hover:text-orange-600 hover:shadow-sm transition-all text-muted-foreground"
                  >
                      <Icon name="lucide:folder-minus" class="h-4 w-4" />
                  </button>

                  <button 
                      @click.stop="$emit('action', 'delete', file)"
                      title="Delete"
                      class="h-8 w-8 flex items-center justify-center rounded hover:bg-red-50 hover:text-red-600 hover:shadow-sm transition-all text-muted-foreground"
                  >
                      <Icon name="lucide:trash-2" class="h-4 w-4" />
                  </button>
                </div>
            </td>
          </tr>
      </tbody>
  </table>
</template>

<script setup lang="ts">
import { formatBytes, formatDate, getFileIcon, getIconColor, getExpiryColor, getExpiryDistance } from '~/utils/file'

defineProps<{
  files: any[]
  selectedFiles: Set<string>
  isAllSelected: boolean
  isPartiallySelected: boolean
  sortBy: string
  dropTargetId: string | null
  draggedFile: any | null
  copiedFileId: string | null
}>()

defineEmits<{
  (e: 'toggle-select-all'): void
  (e: 'update:sortBy', value: string): void
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