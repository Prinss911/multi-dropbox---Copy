<template>
  <div class="min-h-screen bg-background flex flex-col items-center justify-center p-4">
    <div class="text-center space-y-6 max-w-md">
      <div class="relative w-24 h-24 mx-auto">
        <div class="absolute inset-0 bg-red-100 dark:bg-red-900/20 rounded-full animate-pulse"></div>
        <div class="relative flex items-center justify-center w-full h-full text-red-600 dark:text-red-500">
          <Icon name="lucide:shield-alert" class="w-12 h-12" />
        </div>
      </div>
      
      <div class="space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">Access Denied</h1>
        <p class="text-muted-foreground">
          You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.
        </p>
      </div>

      <div class="flex gap-4 justify-center">
        <UiButton variant="outline" @click="router.back()">
          <Icon name="lucide:arrow-left" class="mr-2 h-4 w-4" />
          Go Back
        </UiButton>
        <UiButton @click="router.push('/')">
          <Icon name="lucide:home" class="mr-2 h-4 w-4" />
          Home
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const router = useRouter()
</script>
