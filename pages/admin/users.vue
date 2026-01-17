<template>
  <div class="h-full flex flex-col bg-background/50">
    <!-- Sticky Header & Controls -->
    <div class="sticky top-0 z-20 bg-background/95 backdrop-blur border-b px-6 py-4">
      <div class="w-full">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
             <h1 class="text-xl font-semibold text-[#1E1919] dark:text-foreground">Users & Roles</h1>
             <p class="text-sm text-muted-foreground">Manage access for {{ users.length }} users</p>
           </div>
           <!-- Header Controls -->
           <div class="flex items-center gap-3">
              <div class="relative group hidden sm:block">
                <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  v-model="searchQuery"
                  type="text"
                  placeholder="Find user..."
                  class="h-10 pl-9 pr-4 w-64 rounded-full border bg-muted/20 hover:bg-muted/40 focus:bg-background focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>

              <UiButton @click="openModal()" class="bg-[#0061FE] hover:bg-[#0057E5] text-white">
                <Icon name="lucide:mail-plus" class="mr-2 h-4 w-4" />
                Invite User
              </UiButton>
           </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-auto px-4 md:px-6 py-6 transition-all">
       <div class="w-full h-full">

        <!-- Loading -->
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Icon name="lucide:loader-2" class="animate-spin h-8 w-8 text-[#0061FE] mb-4" />
          <p class="text-sm">Loading users...</p>
        </div>

        <!-- Users Table -->
        <div v-else class="bg-card rounded-xl border shadow-sm overflow-hidden">
           <table class="w-full text-left border-collapse">
              <thead class="bg-muted/30">
                 <tr>
                    <th class="py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-[40%]">User</th>
                    <th class="py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b hidden md:table-cell">Role</th>
                    <th class="py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b hidden sm:table-cell">Status</th>
                    <th class="py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b hidden lg:table-cell">Last Login</th>
                    <th class="py-3 px-6 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">Actions</th>
                 </tr>
              </thead>
              <tbody class="divide-y divide-border/40">
                 <tr 
                    v-for="user in filteredUsers" 
                    :key="user.id" 
                    class="group hover:bg-[#F7F9FA] dark:hover:bg-muted/20 transition-colors"
                 >
                    <td class="py-4 px-6">
                       <div class="flex items-center gap-4">
                          <div 
                            class="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 text-white shadow-sm"
                            :class="[
                                user.role === 'admin' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'
                            ]"
                          >
                             {{ getInitials(user.name || user.email) }}
                          </div>
                          <div class="min-w-0">
                             <p class="font-medium text-sm text-[#1E1919] dark:text-foreground truncate">
                                {{ user.name || (user.status === 'Invited' ? 'Pending Invite' : user.email.split('@')[0]) }}
                             </p>
                             <p class="text-xs text-muted-foreground truncate">{{ user.email }}</p>
                          </div>
                       </div>
                    </td>
                    <td class="py-4 px-6 hidden md:table-cell">
                        <span 
                           class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap"
                           :class="[
                              user.role === 'admin' 
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' 
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                           ]"
                        >
                           <Icon :name="user.role === 'admin' ? 'lucide:shield-check' : 'lucide:user'" class="h-3 w-3" />
                           {{ user.role }}
                        </span>
                    </td>
                    <td class="py-4 px-6 hidden sm:table-cell">
                       <span 
                          class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                          :class="{
                            'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400': user.status === 'Active',
                            'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400': user.status === 'Invited',
                            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400': user.status === 'Inactive'
                          }"
                       >
                          <span class="h-1.5 w-1.5 rounded-full bg-current opacity-60"></span>
                          {{ user.status }}
                       </span>
                    </td>
                    <td class="py-4 px-6 text-sm text-muted-foreground hidden lg:table-cell">
                       {{ formatDate(user.lastLogin) }}
                    </td>
                    <td class="py-4 px-6 text-right">
                       <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                             v-if="user.status === 'Invited'"
                             @click="resendInvite(user)"
                             class="h-8 px-3 rounded text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors mr-2"
                          >
                             Resend
                          </button>
                          
                          <button 
                             @click="openModal(user)"
                             class="h-8 w-8 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                             title="Edit User"
                          >
                             <Icon name="lucide:pencil" class="h-4 w-4" />
                          </button>
                          
                          <button 
                             @click="deleteUser(user)"
                             class="h-8 w-8 flex items-center justify-center rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                             title="Delete User"
                             :disabled="user.id === currentUser?.id"
                             :class="{ 'opacity-50 cursor-not-allowed': user.id === currentUser?.id }"
                          >
                             <Icon name="lucide:trash-2" class="h-4 w-4" />
                          </button>
                       </div>
                    </td>
                 </tr>
              </tbody>
           </table>
        </div>

       </div>
    </div>

    <!-- Edit/Invite Modal -->
    <Teleport to="body">
      <div 
        v-if="isModalOpen" 
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1E1919]/60 backdrop-blur-[2px]"
        @click.self="isModalOpen = false"
      >
        <div class="bg-card w-full max-w-md rounded-xl shadow-2xl border-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
           <div class="px-6 py-5 border-b bg-background flex items-center justify-between">
             <h3 class="font-semibold text-lg text-[#1E1919] dark:text-foreground flex items-center gap-2">
                <Icon :name="editingUser ? 'lucide:user-cog' : 'lucide:mail-plus'" class="h-5 w-5 text-[#0061FE]" />
                {{ editingUser ? 'Edit User' : 'Invite User' }}
             </h3>
             <button @click="isModalOpen = false" class="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors">
                <Icon name="lucide:x" class="h-5 w-5" />
             </button>
          </div>
          
          <div class="p-6 space-y-4">
              <!-- Name (Only edit) -->
              <div v-if="editingUser" class="space-y-1.5">
                 <label class="text-xs font-semibold uppercase text-muted-foreground">Full Name</label>
                 <input 
                    v-model="formData.name" 
                    placeholder="John Doe"
                    class="w-full h-10 px-3 rounded-lg border bg-background focus:ring-2 focus:ring-[#0061FE]/20 focus:border-[#0061FE] transition-all text-sm"
                 />
              </div>

              <!-- Email(s) -->
              <div class="space-y-1.5">
                 <label class="text-xs font-semibold uppercase text-muted-foreground">
                    {{ editingUser ? 'Email Address' : 'Email Address(es)' }}
                 </label>
                 <!-- Single input for edit mode -->
                 <div v-if="editingUser" class="relative">
                    <Icon name="lucide:mail" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                       v-model="formData.email" 
                       type="email"
                       placeholder="colleague@example.com"
                       disabled
                       class="w-full h-10 pl-9 pr-3 rounded-lg border bg-background focus:ring-2 focus:ring-[#0061FE]/20 focus:border-[#0061FE] transition-all text-sm disabled:opacity-60 disabled:bg-muted/50"
                    />
                 </div>
                 <!-- Textarea for bulk invite -->
                 <div v-else class="relative">
                    <Icon name="lucide:mail" class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <textarea 
                       v-model="formData.emails" 
                       placeholder="user1@example.com, user2@example.com&#10;user3@example.com"
                       rows="4"
                       class="w-full pl-9 pr-3 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-[#0061FE]/20 focus:border-[#0061FE] transition-all text-sm resize-none"
                    ></textarea>
                 </div>
                 <p v-if="!editingUser" class="text-xs text-muted-foreground mt-1">
                    <Icon name="lucide:info" class="inline h-3 w-3 mr-1" />
                    Enter multiple emails separated by comma, semicolon, or new line.
                 </p>
                 <!-- Parsed emails preview -->
                 <div v-if="!editingUser && parsedEmails.length > 0" class="mt-2">
                    <div class="flex items-center gap-2 mb-2">
                       <span class="text-xs font-medium text-muted-foreground">{{ parsedEmails.length }} email(s) detected:</span>
                       <span v-if="invalidEmails.length > 0" class="text-xs text-red-500">({{ invalidEmails.length }} invalid)</span>
                    </div>
                    <div class="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                       <span 
                          v-for="(email, idx) in parsedEmails.slice(0, 10)" 
                          :key="idx"
                          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                          :class="isValidEmail(email) 
                             ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' 
                             : 'bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400'"
                       >
                          <Icon :name="isValidEmail(email) ? 'lucide:check' : 'lucide:x'" class="h-3 w-3" />
                          {{ email }}
                       </span>
                       <span v-if="parsedEmails.length > 10" class="text-xs text-muted-foreground px-2">
                          +{{ parsedEmails.length - 10 }} more
                       </span>
                    </div>
                 </div>
              </div>

             <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1.5">
                   <label class="text-xs font-semibold uppercase text-muted-foreground">Role</label>
                   <div class="relative">
                      <select 
                         v-model="formData.role" 
                         class="w-full h-10 pl-3 pr-8 rounded-lg border bg-background focus:ring-2 focus:ring-[#0061FE]/20 focus:border-[#0061FE] transition-all text-sm appearance-none"
                      >
                         <option value="user">User</option>
                         <option value="admin">Admin</option>
                      </select>
                      <Icon name="lucide:chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                   </div>
                </div>

                <div v-if="editingUser" class="space-y-1.5">
                   <label class="text-xs font-semibold uppercase text-muted-foreground">Status</label>
                   <div class="relative">
                      <select 
                         v-model="formData.status" 
                         class="w-full h-10 pl-3 pr-8 rounded-lg border bg-background focus:ring-2 focus:ring-[#0061FE]/20 focus:border-[#0061FE] transition-all text-sm appearance-none"
                      >
                         <option value="Active">Active</option>
                         <option value="Inactive">Inactive</option>
                         <option value="Invited">Invited</option>
                      </select>
                      <Icon name="lucide:chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                   </div>
                </div>
             </div>
             
              <!-- Bulk Invite Progress -->
              <div v-if="bulkInviteProgress.total > 0" class="space-y-3 p-4 bg-muted/30 rounded-lg">
                 <div class="flex items-center justify-between text-sm">
                    <span class="font-medium">Sending invitations...</span>
                    <span class="font-mono text-muted-foreground">{{ bulkInviteProgress.current }}/{{ bulkInviteProgress.total }}</span>
                 </div>
                 <div class="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div 
                       class="h-full bg-[#0061FE] transition-all duration-300"
                       :style="{ width: `${(bulkInviteProgress.current / bulkInviteProgress.total) * 100}%` }"
                    ></div>
                 </div>
                 <div v-if="bulkInviteProgress.results.length > 0" class="space-y-1 max-h-32 overflow-y-auto text-xs">
                    <div 
                       v-for="(result, idx) in bulkInviteProgress.results" 
                       :key="idx"
                       class="flex items-center gap-2 py-1"
                       :class="result.success ? 'text-green-600' : 'text-red-500'"
                    >
                       <Icon :name="result.success ? 'lucide:check-circle' : 'lucide:x-circle'" class="h-3.5 w-3.5 shrink-0" />
                       <span class="truncate">{{ result.email }}</span>
                       <span v-if="!result.success" class="text-muted-foreground truncate">- {{ result.error }}</span>
                    </div>
                 </div>
              </div>

              <!-- Bulk Invite Summary (after completion) -->
              <div v-else-if="bulkInviteSummary" class="p-4 rounded-lg" :class="bulkInviteSummary.failed === 0 ? 'bg-green-50 dark:bg-green-500/10' : 'bg-amber-50 dark:bg-amber-500/10'">
                 <div class="flex items-center gap-3">
                    <Icon 
                       :name="bulkInviteSummary.failed === 0 ? 'lucide:check-circle-2' : 'lucide:alert-circle'" 
                       class="h-8 w-8" 
                       :class="bulkInviteSummary.failed === 0 ? 'text-green-600' : 'text-amber-600'" 
                    />
                    <div>
                       <p class="font-semibold text-sm">
                          {{ bulkInviteSummary.success }} invitation(s) sent successfully
                       </p>
                       <p v-if="bulkInviteSummary.failed > 0" class="text-xs text-muted-foreground">
                          {{ bulkInviteSummary.failed }} failed
                       </p>
                    </div>
                 </div>
                 <button 
                    @click="closeBulkSummary"
                    class="mt-3 w-full h-9 rounded-lg border hover:bg-muted transition-colors text-sm font-medium"
                 >
                    Done
                 </button>
              </div>

              <div v-else class="pt-2">
                 <button 
                   @click="saveUser"
                   :disabled="isSaving || (!editingUser && validEmails.length === 0)"
                   class="w-full h-11 rounded-lg bg-[#0061FE] hover:bg-[#0057E5] text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                   <Icon v-if="isSaving" name="lucide:loader-2" class="h-5 w-5 animate-spin" />
                   <span v-else>
                      {{ editingUser ? 'Save Changes' : (validEmails.length > 1 ? `Send ${validEmails.length} Invitations` : 'Send Invitation') }}
                   </span>
                </button>
              </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirm Dialog -->
    <Teleport to="body">
      <div 
        v-if="deleteTarget" 
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1E1919]/60 backdrop-blur-[2px]"
        @click.self="deleteTarget = null"
      >
        <div class="bg-card w-full max-w-[400px] rounded-xl shadow-2xl border-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6">
           <div class="flex flex-col items-center text-center gap-4">
              <div class="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-2">
                 <Icon name="lucide:user-x" class="h-6 w-6" />
              </div>
              <div>
                 <h3 class="text-lg font-semibold text-[#1E1919] dark:text-foreground">Delete User?</h3>
                 <p class="text-sm text-muted-foreground mt-2 px-4">
                    Are you sure you want to remove access for <br>
                    <span class="font-medium text-foreground">{{ deleteTarget.name || deleteTarget.email }}</span>?
                 </p>
                 <p class="text-xs text-red-500/80 mt-2 font-medium">This action cannot be undone.</p>
              </div>
              
              <div class="flex gap-3 w-full mt-2">
                 <button 
                    @click="deleteTarget = null"
                    class="flex-1 h-10 rounded-lg border hover:bg-muted transition-colors text-sm font-medium"
                 >
                    Cancel
                 </button>
                 <button 
                    @click="handleDeleteUser"
                    :disabled="isDeleting"
                    class="flex-1 h-10 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-70"
                 >
                    <Icon v-if="isDeleting" name="lucide:loader-2" class="h-4 w-4 animate-spin" />
                    {{ isDeleting ? 'Deleting...' : 'Delete User' }}
                 </button>
              </div>
           </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient()
const { authFetch } = useAuthFetch()
const { user: currentUser } = useAuth()
const isLoading = ref(false)
const isDeleting = ref(false)
const deleteTarget = ref<any>(null)
const searchQuery = ref('')

// Real data state
const rawProfiles = ref<any[]>([])

const fetchUsers = async () => {
  isLoading.value = true
  try {
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    rawProfiles.value = data || []
  } catch (err) {
    console.error('Failed to fetch users:', err)
  } finally {
    isLoading.value = false
  }
}

// Computed users list from profiles
const filteredUsers = computed(() => {
  let result = rawProfiles.value.map(profile => {
    // Determine status - use db status, fallback to heuristic
    let status = 'Invited'
    if (profile.status === 'active') {
      status = 'Active'
    } else if (profile.status === 'inactive') {
      status = 'Inactive'
    } else if (profile.status === 'invited' || !profile.status) {
      status = 'Invited'
    }

    return {
      id: profile.id,
      name: profile.name || '',
      email: profile.email || 'Unknown',
      role: profile.role || 'user',
      status: status,
      lastLogin: new Date(profile.updated_at || profile.created_at).toISOString()
    }
  })

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(u => 
        u.name.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q)
    )
  }

  return result
})

const users = computed(() => rawProfiles.value)

const isModalOpen = ref(false)
const editingUser = ref<any>(null)
const isSaving = ref(false)
const formData = reactive({
  name: '',
  email: '',
  emails: '', // For bulk invite
  role: 'user',
  status: 'Active'
})

// Bulk invite progress tracking
const bulkInviteProgress = reactive({
  total: 0,
  current: 0,
  results: [] as { email: string; success: boolean; error?: string }[]
})

const bulkInviteSummary = ref<{ success: number; failed: number } | null>(null)

// Email validation and parsing
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isValidEmail = (email: string): boolean => {
  return emailRegex.test(email.trim())
}

const parsedEmails = computed(() => {
  if (!formData.emails.trim()) return []
  // Split by comma, semicolon, or newline
  return formData.emails
    .split(/[,;\n]+/)
    .map(e => e.trim())
    .filter(e => e.length > 0)
})

const validEmails = computed(() => {
  return parsedEmails.value.filter(isValidEmail)
})

const invalidEmails = computed(() => {
  return parsedEmails.value.filter(e => !isValidEmail(e))
})

const closeBulkSummary = () => {
  bulkInviteSummary.value = null
  isModalOpen.value = false
}

// Fetch on mount
onMounted(() => {
  fetchUsers()
})

const getInitials = (name: string) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
}

const openModal = (user: any = null) => {
  editingUser.value = user
  if (user) {
    formData.name = user.name
    formData.email = user.email
    formData.role = user.role
    formData.status = user.status
  } else {
    // Invite defaults
    formData.name = ''
    formData.email = ''
    formData.emails = ''
    formData.role = 'user'
    formData.status = 'Invited'
    // Reset bulk invite state
    bulkInviteProgress.total = 0
    bulkInviteProgress.current = 0
    bulkInviteProgress.results = []
    bulkInviteSummary.value = null
  }
  isModalOpen.value = true
}

const saveUser = async () => {
  isSaving.value = true
  try {
    if (editingUser.value) {
      // Update existing
      const { error } = await client
        .from('profiles')
        .update({ 
            name: formData.name,
            role: formData.role.toLowerCase() 
        })
        .eq('id', editingUser.value.id)
      
      if (error) throw error
      isModalOpen.value = false
      await fetchUsers()

    } else {
      // Bulk Invite New Users
      const emailsToInvite = validEmails.value
      
      if (emailsToInvite.length === 0) {
        alert('Please enter at least one valid email address')
        return
      }

      // Reset progress
      bulkInviteProgress.total = emailsToInvite.length
      bulkInviteProgress.current = 0
      bulkInviteProgress.results = []

      let successCount = 0
      let failCount = 0

      // Send invites one by one
      for (const email of emailsToInvite) {
        try {
          await authFetch('/api/auth/invite', {
            method: 'POST',
            body: {
              email: email,
              role: formData.role.toLowerCase()
            }
          })
          bulkInviteProgress.results.push({ email, success: true })
          successCount++
        } catch (err: any) {
          bulkInviteProgress.results.push({ 
            email, 
            success: false, 
            error: err.data?.message || err.message || 'Failed' 
          })
          failCount++
        }
        bulkInviteProgress.current++
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      // Show summary
      bulkInviteProgress.total = 0 // Hide progress
      bulkInviteSummary.value = {
        success: successCount,
        failed: failCount
      }

      await fetchUsers() // Refresh list
    }
  } catch (err: any) {
    alert(err.message || 'Operation failed')
  } finally {
    isSaving.value = false
  }
}

const deleteUser = (user: any) => {
  // Prevent deleting yourself
  if (user.id === currentUser.value?.id) {
    alert('You cannot delete your own account!')
    return
  }

  // Open delete confirmation modal
  deleteTarget.value = user
}

const handleDeleteUser = async () => {
  if (!deleteTarget.value) return

  isDeleting.value = true
  try {
    await authFetch(`/api/user/${deleteTarget.value.id}`, {
      method: 'DELETE'
    })
    
    deleteTarget.value = null
    await fetchUsers() // Refresh list
  } catch (err: any) {
    console.error('Delete user error:', err)
    alert(err.data?.message || err.message || 'Failed to delete user')
  } finally {
    isDeleting.value = false
  }
}

const resendInvite = async (user: any) => {
  if (confirm(`Resend invitation to ${user.email}?`)) {
      try {
        const response = await authFetch('/api/auth/invite', {
            method: 'POST',
            body: {
                email: user.email,
                role: user.role
            }
        })
        if (response.link) {
             alert(`Invitation resent! \n\nLink: ${response.link}`)
        } else {
             alert('Invitation email resent. Please check the inbox.')
        }
      } catch (err: any) {
        alert(err.message)
      }
  }
}
</script>
