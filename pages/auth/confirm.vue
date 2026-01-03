<template>
  <div class="min-h-screen bg-muted/30 flex items-center justify-center p-4">
    <div class="w-full max-w-md space-y-8 bg-card p-8 rounded-xl border shadow-sm">
      <!-- Header -->
      <div class="text-center space-y-2">
        <div class="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="lucide:key" class="h-5 w-5" />
        </div>
        <h1 class="text-2xl font-semibold tracking-tight">Set Password</h1>
        <p class="text-sm text-muted-foreground">Please set a secure password to complete your account setup.</p>
      </div>

      <!-- Set Password Form -->
      <form @submit.prevent="handleSetPassword" class="space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium leading-none" for="password">
            New Password
          </label>
          <UiInput 
            id="password" 
            v-model="password" 
            type="password" 
            required 
            minlength="8"
            placeholder="••••••••"
            :disabled="isLoading"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium leading-none" for="confirmPassword">
            Confirm Password
          </label>
          <UiInput 
            id="confirmPassword" 
            v-model="confirmPassword" 
            type="password" 
            required 
            minlength="8"
            placeholder="••••••••"
            :disabled="isLoading"
          />
          <p v-if="passwordError" class="text-xs text-destructive mt-1">{{ passwordError }}</p>
        </div>

        <UiButton class="w-full" type="submit" :disabled="isLoading">
          <Icon v-if="isLoading" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
          Complete Setup
        </UiButton>
      </form>

      <div v-if="error" class="p-3 text-sm text-destructive bg-destructive/10 rounded-md flex items-center gap-2">
        <Icon name="lucide:alert-circle" class="h-4 w-4" />
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const error = ref('')
const passwordError = ref('')
const router = useRouter()

const validatePassword = () => {
  if (password.value !== confirmPassword.value) {
    passwordError.value = "Passwords don't match"
    return false
  }
  if (password.value.length < 8) {
    passwordError.value = "Password must be at least 8 characters"
    return false
  }
  passwordError.value = ''
  return true
}

const handleSetPassword = async () => {
  if (!validatePassword()) return
  
  isLoading.value = true
  error.value = ''
  
  try {
    // TODO: Implement actual Supabase update user
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Set password to', password.value)
    router.push('/')
  } catch (err: any) {
    error.value = err.message || 'Failed to set password'
  } finally {
    isLoading.value = false
  }
}
</script>
