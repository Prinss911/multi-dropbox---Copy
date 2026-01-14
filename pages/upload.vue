<script setup lang="ts">
// Redirect to the actual public upload page
// This ensures /upload route works for anonymous users
await navigateTo('/drive/upload', { replace: true })
</script>
