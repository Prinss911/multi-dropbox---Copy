<template>
  <div
    :class="cn('animate-pulse rounded-md bg-muted', props.class)"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { cn } from '~/utils/cn'

interface Props {
  class?: string
}

const props = defineProps<Props>()
</script>
