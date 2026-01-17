<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    leave-active-class="transition-all duration-200 ease-in"
    enter-from-class="opacity-0 translate-y-4"
    leave-to-class="opacity-0 translate-y-4"
  >
    <div 
      v-if="selectedCount > 0" 
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:gap-3 px-4 py-2.5 sm:px-5 sm:py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-full shadow-2xl border border-gray-200/50 dark:border-gray-700/50 max-w-[95vw] overflow-hidden ring-1 ring-black/5"
    >
      <!-- Selection Count -->
      <div class="flex items-center gap-2 text-gray-900 dark:text-gray-100 shrink-0">
        <div class="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-blue-600 flex items-center justify-center text-xs sm:text-sm font-bold text-white shadow-sm ring-2 ring-blue-600/20">
          {{ selectedCount }}
        </div>
        <span class="text-xs sm:text-sm font-medium hidden xs:inline">selected</span>
      </div>

      <div class="w-px h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 shrink-0"></div>

      <!-- Bulk Actions -->
      <button 
        @click="$emit('download')"
        :disabled="isBulkDownloading"
        class="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs sm:text-sm font-medium transition-all disabled:opacity-50 shrink-0 active:scale-95"
      >
        <Icon v-if="isBulkDownloading" name="lucide:loader-2" class="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
        <Icon v-else name="lucide:download" class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span class="hidden sm:inline">Download</span>
      </button>

      <button 
        @click="$emit('delete')"
        :disabled="isBulkDeleting"
        class="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 text-xs sm:text-sm font-medium transition-all disabled:opacity-50 shrink-0 active:scale-95 border border-transparent hover:border-red-200 dark:hover:border-red-800"
      >
        <Icon v-if="isBulkDeleting" name="lucide:loader-2" class="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
        <Icon v-else name="lucide:trash-2" class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span class="hidden sm:inline">Delete</span>
      </button>

      <div class="w-px h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 shrink-0"></div>

      <!-- Clear Selection -->
      <button 
        @click="$emit('clear')"
        class="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors shrink-0"
        title="Clear selection"
      >
        <Icon name="lucide:x" class="h-4 w-4" />
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  selectedCount: number
  isBulkDownloading: boolean
  isBulkDeleting: boolean
}>()

defineEmits<{
  (e: 'clear'): void
  (e: 'download'): void
  (e: 'delete'): void
}>()
</script>
