<template>
  <div class="min-h-screen w-full flex bg-background">
    <!-- Visual Side (Left) -->
    <div class="hidden lg:flex w-1/2 relative bg-[#0F0F12] overflow-hidden text-white flex-col justify-between p-12">
      <!-- Animated Background Mesh -->
      <div class="absolute inset-0 z-0">
          <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-[#0061FE]/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse-slow"></div>
          <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
      </div>
      
      <!-- Content -->
      <div class="relative z-10">
        <div class="flex items-center gap-3 mb-8">
           <div class="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
             <Icon name="lucide:hard-drive" class="h-5 w-5" />
           </div>
           <span class="font-bold text-xl tracking-tight">MultiBox</span>
        </div>
      </div>

      <div class="relative z-10 max-w-lg mb-12">
        <h2 class="text-4xl font-bold leading-tight mb-6 tracking-tight">
          One place for all your <br/> 
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">digital assets.</span>
        </h2>
        <p class="text-white/60 text-lg leading-relaxed">
           Manage multiple Dropbox accounts, share files securely, and collaborate with your team in one unified dashboard.
        </p>
      </div>

      <div class="relative z-10 flex gap-4 text-sm text-white/40">
         <span>&copy; {{ new Date().getFullYear() }} MultiBox Inc.</span>
         <a href="#" class="hover:text-white transition-colors">Privacy</a>
         <a href="#" class="hover:text-white transition-colors">Terms</a>
      </div>
    </div>

    <!-- Form Side (Right) -->
    <div class="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-12 relative bg-background">
      <div class="w-full max-w-[400px] space-y-8 fade-in-up">
        
        <!-- Mobile Logo -->
        <div class="lg:hidden flex justify-center mb-8">
            <div class="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
             <Icon name="lucide:hard-drive" class="h-6 w-6" />
           </div>
        </div>

        <div class="space-y-2 text-center lg:text-left">
           <h1 class="text-3xl font-bold tracking-tight text-[#1E1919] dark:text-white">Welcome back</h1>
           <p class="text-muted-foreground">Sign in to access your workspace</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div class="space-y-2">
            <label class="text-sm font-semibold text-[#1E1919] dark:text-foreground" for="email">
              Email Address
            </label>
            <div class="relative group">
                <Icon name="lucide:mail" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#0061FE] transition-colors" />
                <input 
                  id="email" 
                  v-model="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  required 
                  :disabled="isLoading"
                  class="flex h-11 w-full rounded-xl border bg-muted/20 px-3 pl-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0061FE] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                />
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-sm font-semibold text-[#1E1919] dark:text-foreground" for="password">
                Password
              </label>
              <a href="#" class="text-xs font-medium text-[#0061FE] hover:text-[#0057E5] hover:underline">
                Forgot password?
              </a>
            </div>
            <div class="relative group">
               <Icon name="lucide:lock" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#0061FE] transition-colors" />
              <input 
                id="password" 
                v-model="password" 
                :type="showPassword ? 'text' : 'password'" 
                required 
                :disabled="isLoading"
                placeholder="Enter your password"
                class="flex h-11 w-full rounded-xl border bg-muted/20 px-3 pl-10 pr-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0061FE] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                @click="showPassword = !showPassword"
                tabindex="-1"
              >
                <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div v-if="error" class="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2 animate-in slide-in-from-top-2 fade-in">
             <Icon name="lucide:alert-circle" class="h-4 w-4 shrink-0" />
             {{ error }}
          </div>

          <button 
            type="submit" 
            :disabled="isLoading"
            class="w-full h-11 bg-[#0061FE] hover:bg-[#0057E5] text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
          >
            <Icon v-if="isLoading" name="lucide:loader-2" class="h-5 w-5 animate-spin" />
            <span v-else>Sign In</span>
          </button>
        </form>
        
        <p class="text-center text-sm text-muted-foreground">
          Don't have an account? 
          <a href="#" @click.prevent="alert('Please contact your administrator for access.')" class="font-medium text-[#0061FE] hover:underline">Contact Admin</a>
        </p>
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
      router.push('/drive/files')
    } else {
      router.push('/drive')
    }
  } catch (err: any) {
    error.value = err.message || 'Invalid credentials'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.animate-pulse-slow {
  animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1) translate(50%, -50%);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1) translate(50%, -50%);
  }
}

.fade-in-up {
  animation: fadeInUp 0.5s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
