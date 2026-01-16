<template>
  <div class="flex items-center gap-6 text-sm">
    <div class="flex flex-col">
      <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Storage</span>
      <span class="font-medium text-foreground">{{ totalSizeFormatted }} Used</span>
    </div>
    <div class="w-px h-8 bg-border hidden md:block"></div>
    <div class="flex flex-col">
      <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Files</span>
      <span class="font-medium text-foreground">{{ filesCount }} Items</span>
    </div>
    <div class="w-px h-8 bg-border hidden md:block"></div>
    <div class="flex flex-col">
      <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Shared</span>
      <span class="font-medium text-foreground">{{ activeSharesCount }} Active</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  totalSizeFormatted: string
  filesCount: number
  activeSharesCount: number
}>()
</script>