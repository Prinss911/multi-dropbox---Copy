<template>
  <div class="min-h-screen bg-muted/30 flex items-center justify-center p-4">
    <div class="w-full max-w-md space-y-8 bg-card p-8 rounded-xl border shadow-sm">
      <!-- Loading State -->
      <div v-if="isVerifying" class="text-center space-y-4">
        <div class="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
          <Icon name="lucide:loader-2" class="h-5 w-5 animate-spin" />
        </div>
        <p class="text-muted-foreground">Verifying your link...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error && !isSessionValid" class="text-center space-y-4">
        <div class="h-12 w-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
          <Icon name="lucide:x-circle" class="h-6 w-6" />
        </div>
        <h1 class="text-xl font-semibold">Link Invalid</h1>
        <p class="text-sm text-muted-foreground">{{ error }}</p>
        <UiButton @click="navigateTo('/login')" variant="outline" class="mt-4">
          <Icon name="lucide:arrow-left" class="mr-2 h-4 w-4" />
          Back to Login
        </UiButton>
      </div>

      <!-- Set Password Form -->
      <template v-else>
        <div class="text-center space-y-2">
          <div class="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="lucide:key" class="h-5 w-5" />
          </div>
          <h1 class="text-2xl font-semibold tracking-tight">Set Password</h1>
          <p class="text-sm text-muted-foreground">Please set a secure password to complete your account setup.</p>
        </div>

        <form @submit.prevent="handleSetPassword" class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium leading-none" for="password">
              New Password
            </label>
            <div class="relative">
              <UiInput 
                id="password" 
                v-model="password" 
                :type="showPassword ? 'text' : 'password'" 
                required 
                minlength="8"
                placeholder="••••••••"
                :disabled="isLoading"
                class="pr-10"
              />
              <button 
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium leading-none" for="confirmPassword">
              Confirm Password
            </label>
            <div class="relative">
              <UiInput 
                id="confirmPassword" 
                v-model="confirmPassword" 
                :type="showConfirmPassword ? 'text' : 'password'" 
                required 
                minlength="8"
                placeholder="••••••••"
                :disabled="isLoading"
                :class="'pr-10 ' + (passwordError ? 'border-destructive focus-visible:ring-destructive' : '')"
                @input="validatePassword(true)"
              />
              <button 
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <Icon :name="showConfirmPassword ? 'lucide:eye-off' : 'lucide:eye'" class="h-4 w-4" />
              </button>
            </div>
            <p v-if="passwordError" class="text-xs text-destructive mt-1 flex items-center gap-1">
               <Icon name="lucide:alert-circle" class="h-3 w-3" />
               {{ passwordError }}
            </p>
          </div>

          <UiButton class="w-full" type="submit" :disabled="isLoading">
            <Icon v-if="isLoading" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
            Complete Setup
          </UiButton>
        </form>

        <div v-if="formError" class="p-3 text-sm text-destructive bg-destructive/10 rounded-md flex items-center gap-2">
          <Icon name="lucide:alert-circle" class="h-4 w-4" />
          {{ formError }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'empty'
})

const client = useSupabaseClient()
const router = useRouter()
const route = useRoute()

// State
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const isVerifying = ref(true)
const isSessionValid = ref(false)
const error = ref('')
const formError = ref('')
const passwordError = ref('')

const validatePassword = (isInput = false) => {
  if (isInput && !confirmPassword.value) {
    passwordError.value = ''
    return false
  }

  if (password.value !== confirmPassword.value) {
    passwordError.value = "Passwords don't match"
    return false
  }
  
  if (password.value.length < 8) {
    if (!isInput) {
      passwordError.value = "Password must be at least 8 characters"
    }
    return false
  }

  passwordError.value = ''
  return true
}

const handleSetPassword = async () => {
  if (!validatePassword()) return
  
  isLoading.value = true
  formError.value = ''
  
  try {
    const { error: updateError } = await client.auth.updateUser({ 
      password: password.value 
    })
    
    if (updateError) throw updateError
    
    // Success - redirect to home
    router.push('/')
  } catch (err: any) {
    console.error('Update password error:', err)
    formError.value = err.message || 'Failed to set password'
  } finally {
    isLoading.value = false
  }
}

// Verify token on mount
onMounted(async () => {
  console.log('[AuthConfirm] Mounted, checking URL params...')
  console.log('[AuthConfirm] Hash:', window.location.hash)
  console.log('[AuthConfirm] Query:', route.query)

  // Check for error in URL
  if (route.query.error) {
    error.value = (route.query.error_description as string) || 'Invalid or expired link'
    isVerifying.value = false
    return
  }

  // Get token_hash and type from query params (PKCE flow)
  const tokenHash = route.query.token_hash as string
  const type = route.query.type as string

  // Also check hash fragment (implicit flow fallback)
  const hashParams = new URLSearchParams(window.location.hash.substring(1))
  const accessToken = hashParams.get('access_token')
  const refreshToken = hashParams.get('refresh_token')

  console.log('[AuthConfirm] token_hash:', !!tokenHash, 'type:', type)
  console.log('[AuthConfirm] access_token in hash:', !!accessToken)

  try {
    // Method 1: If we have token_hash (PKCE), verify it
    if (tokenHash && type) {
      console.log('[AuthConfirm] Verifying token_hash with type:', type)
      
      const { data, error: verifyError } = await client.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as any // 'invite', 'recovery', 'email', etc.
      })

      if (verifyError) {
        console.error('[AuthConfirm] verifyOtp error:', verifyError)
        error.value = verifyError.message || 'Link expired or invalid'
        isVerifying.value = false
        return
      }

      if (data.session) {
        console.log('[AuthConfirm] Session established via verifyOtp')
        isSessionValid.value = true
      }
    }

    // Method 2: If we have tokens in hash (implicit flow)
    else if (accessToken && refreshToken) {
      console.log('[AuthConfirm] Setting session from hash tokens')
      
      const { error: sessionError } = await client.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })

      if (sessionError) {
        console.error('[AuthConfirm] setSession error:', sessionError)
        error.value = sessionError.message || 'Failed to establish session'
        isVerifying.value = false
        return
      }

      isSessionValid.value = true
    }

    // Method 3: Check if session already exists
    else {
      console.log('[AuthConfirm] No token params, checking existing session...')
      
      const { data: { session } } = await client.auth.getSession()
      
      if (session) {
        console.log('[AuthConfirm] Existing session found')
        isSessionValid.value = true
      } else {
        console.log('[AuthConfirm] No session found')
        error.value = 'No valid session. Please use your invite link from email.'
      }
    }
  } catch (err: any) {
    console.error('[AuthConfirm] Error during verification:', err)
    error.value = err.message || 'Verification failed'
  } finally {
    isVerifying.value = false
  }
})
</script>

