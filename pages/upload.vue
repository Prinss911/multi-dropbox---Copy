<script setup lang="ts">
// Redirect to the actual public upload page
// This ensures /upload route works for anonymous users
definePageMeta({
  layout: false
})

// Use client-side navigation only
if (import.meta.client) {
  navigateTo('/drive/upload', { replace: true })
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-muted-foreground">Redirecting to upload page...</div>
  </div>
</template>
