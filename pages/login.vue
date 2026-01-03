<template>
  <div class="min-h-screen bg-muted/30 flex items-center justify-center p-4">
    <div class="w-full max-w-md space-y-8 bg-card p-8 rounded-xl border shadow-sm">
      <!-- Header -->
      <div class="flex flex-col items-center justify-center text-center space-y-2">
        <div class="h-10 w-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground mb-2">
          <Icon name="lucide:box" class="h-6 w-6" />
        </div>
        <h1 class="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p class="text-sm text-muted-foreground">Enter your email to sign in to your account</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="email">
            Email
          </label>
          <UiInput 
            id="email" 
            v-model="email" 
            type="email" 
            placeholder="name@example.com" 
            required 
            :disabled="isLoading"
          />
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="password">
              Password
            </label>
            <a href="#" class="text-sm font-medium text-primary hover:underline">
              Forgot password?
            </a>
          </div>
          <UiInput 
            id="password" 
            v-model="password" 
            type="password" 
            required 
            :disabled="isLoading"
          />
        </div>

        <UiButton class="w-full" type="submit" :disabled="isLoading">
          <Icon v-if="isLoading" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
          Sign In
        </UiButton>
      </form>

      <!-- Error Message -->
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

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref('')
const router = useRouter()

const handleLogin = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    // TODO: Implement actual Supabase login
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Login with', email.value, password.value)
    router.push('/')
  } catch (err: any) {
    error.value = err.message || 'Invalid credentials'
  } finally {
    isLoading.value = false
  }
}
</script>
