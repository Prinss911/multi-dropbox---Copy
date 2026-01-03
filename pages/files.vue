<template>
  <div>
    <FileBrowser />
  </div>
</template>

<script setup lang="ts">
const { isAdmin } = useAuth()

if (!isAdmin.value) {
  navigateTo('/access-denied')
}
</script>
