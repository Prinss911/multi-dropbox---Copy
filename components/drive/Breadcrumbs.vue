<template>
  <nav class="flex items-center text-sm overflow-x-auto no-scrollbar mask-gradient-right -mx-6 px-6">
    <ol class="flex items-center gap-1 whitespace-nowrap">
       <li v-for="(crumb, idx) in breadcrumbs" :key="crumb.path" class="flex items-center">
          <Icon v-if="idx > 0" name="lucide:chevron-right" class="h-4 w-4 text-muted-foreground mx-1" />
          <button 
            @click="$emit('navigate', crumb)"
            @drop.prevent="$emit('drop', $event, crumb)"
            @dragover.prevent="handleDragOver"
            @dragleave="handleDragLeave"
            class="hover:bg-muted px-2 py-1 rounded-md transition-colors font-medium flex items-center gap-1"
            :class="idx === breadcrumbs.length - 1 ? 'text-foreground cursor-default pointer-events-none' : 'text-muted-foreground hover:text-foreground'"
          >
             <Icon v-if="idx === 0" name="lucide:home" class="h-4 w-4" />
             <span v-if="idx === 0">My Files</span>
             <Icon v-else-if="crumb.isVirtual" name="lucide:folder" class="h-4 w-4 text-blue-500" />
             <span v-if="idx > 0">{{ crumb.name }}</span>
          </button>
       </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
export interface Breadcrumb {
  name: string
  path: string
  isVirtual: boolean
}

defineProps<{
  breadcrumbs: Breadcrumb[]
  isDraggingInternal: boolean
}>()

const emit = defineEmits<{
  (e: 'navigate', crumb: Breadcrumb): void
  (e: 'drop', event: DragEvent, crumb: Breadcrumb): void
}>()

const handleDragOver = (event: DragEvent) => {
  // We can't easily check props here without accessing props in script setup, 
  // but for visual feedback we can just toggle classes. 
  // The actual drop logic validation happens in parent.
  // However, we should only show visual feedback if dragging is active.
  // Using a class based on prop would be better but requires more setup.
  // For now, simple class toggle.
  
  const target = event.currentTarget as HTMLElement
  target.classList.add('bg-blue-100', 'text-blue-600', 'dark:bg-blue-900/40', 'dark:text-blue-400')
  if (event.dataTransfer) {
     event.dataTransfer.dropEffect = 'move'
  }
}

const handleDragLeave = (event: DragEvent) => {
  const target = event.currentTarget as HTMLElement
  target.classList.remove('bg-blue-100', 'text-blue-600', 'dark:bg-blue-900/40', 'dark:text-blue-400')
}
</script>