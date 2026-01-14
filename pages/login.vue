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
          <div class="relative">
            <UiInput 
              id="password" 
              v-model="password" 
              :type="showPassword ? 'text' : 'password'" 
              required 
              :disabled="isLoading"
              class="pr-10"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              @click="showPassword = !showPassword"
              tabindex="-1"
            >
              <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="h-4 w-4" />
            </button>
          </div>
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
  layout: 'empty'
})

const { login, fetchRole, isAdmin } = useAuth()
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const showPassword = ref(false)
const error = ref('')
const router = useRouter()

const handleLogin = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    await login(email.value, password.value)
    
    // Wait for role to be fetched
    await fetchRole()
    
    // Redirect based on role
    if (isAdmin.value) {
      router.push('/files')
    } else {
      router.push('/user')
    }
  } catch (err: any) {
    error.value = err.message || 'Invalid credentials'
  } finally {
    isLoading.value = false
  }
}
</script>
