<template>
  <div class="min-h-screen flex items-center justify-center bg-background p-4">
    <div class="text-center max-w-md w-full bg-card p-8 rounded-xl shadow-lg border">
      <div class="mb-6 flex justify-center">
        <div class="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
           <Icon name="lucide:alert-triangle" class="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
      </div>
      
      <h1 class="text-2xl font-bold mb-2 text-foreground">Something went wrong</h1>
      <p class="text-muted-foreground mb-6">
        {{ error?.message || 'An unexpected error occurred.' }}
      </p>

      <div class="flex flex-col gap-3">
        <button 
          @click="handleError"
          class="w-full h-11 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Icon name="lucide:refresh-cw" class="h-4 w-4" />
          Reload Page
        </button>
        
        <button 
          @click="goHome"
          class="w-full h-11 rounded-lg border bg-background hover:bg-muted text-foreground font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Icon name="lucide:home" class="h-4 w-4" />
          Go Home
        </button>
      </div>
      
      <div v-if="error?.statusCode" class="mt-8 text-xs text-muted-foreground">
        Error Code: {{ error.statusCode }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: Object as () => NuxtError
})

const handleError = () => {
  clearError({ redirect: '/drive' })
}

const goHome = () => {
  clearError({ redirect: '/' })
}
</script>
