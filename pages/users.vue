<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg bg-primary/10">
          <Icon name="lucide:users" class="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 class="text-xl font-semibold">User Management</h1>
          <p class="text-sm text-muted-foreground">Manage system users and access controls</p>
        </div>
      </div>
      <UiButton @click="openModal()">
        <Icon name="lucide:mail-plus" class="mr-2 h-4 w-4" />
        Invite User
      </UiButton>
    </div>

    <!-- User List -->
    <div class="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
      <UiTable>
        <UiTableHeader>
          <UiTableRow class="hover:bg-transparent">
            <UiTableHead>Name</UiTableHead>
            <UiTableHead class="hidden md:table-cell">Email</UiTableHead>
            <UiTableHead>Role</UiTableHead>
            <UiTableHead class="hidden sm:table-cell">Last Login</UiTableHead>
            <UiTableHead>Status</UiTableHead>
            <UiTableHead class="text-right">Actions</UiTableHead>
          </UiTableRow>
        </UiTableHeader>
        <UiTableBody>
          <UiTableRow v-for="user in users" :key="user.id">
            <UiTableCell class="font-medium">
              <div class="flex items-center gap-3">
                <div class="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                  {{ user.name ? getInitials(user.name) : '?' }}
                </div>
                <div>
                  <div class="font-medium">{{ user.name || 'Pending Accept' }}</div>
                  <div class="text-xs text-muted-foreground md:hidden">{{ user.email }}</div>
                </div>
              </div>
            </UiTableCell>
            <UiTableCell class="hidden md:table-cell text-muted-foreground">{{ user.email }}</UiTableCell>
            <UiTableCell>
              <span 
                :class="[
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                  user.role === 'Admin' 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-muted text-muted-foreground'
                ]"
              >
                {{ user.role }}
              </span>
            </UiTableCell>
            <UiTableCell class="hidden sm:table-cell text-muted-foreground text-sm">
              {{ user.lastLogin }}
            </UiTableCell>
            <UiTableCell>
              <div class="flex items-center gap-1.5">
                <span 
                  class="h-2 w-2 rounded-full" 
                  :class="{
                    'bg-green-500': user.status === 'Active',
                    'bg-yellow-500': user.status === 'Invited',
                    'bg-gray-300': user.status === 'Inactive'
                  }"
                ></span>
                <span class="text-sm">{{ user.status }}</span>
              </div>
            </UiTableCell>
            <UiTableCell class="text-right">
              <div class="flex justify-end gap-1">
                <UiButton v-if="user.status === 'Invited'" variant="ghost" size="sm" class="h-8" @click="resendInvite(user)">
                  <span class="text-xs">Resend</span>
                </UiButton>
                <UiButton variant="ghost" size="icon" class="h-8 w-8" @click="openModal(user)">
                  <Icon name="lucide:pencil" class="h-4 w-4" />
                  <span class="sr-only">Edit</span>
                </UiButton>
                <UiButton variant="ghost" size="icon" class="h-8 w-8 text-destructive hover:text-destructive" @click="deleteUser(user)">
                  <Icon name="lucide:trash-2" class="h-4 w-4" />
                   <span class="sr-only">Delete</span>
                </UiButton>
              </div>
            </UiTableCell>
          </UiTableRow>
        </UiTableBody>
      </UiTable>
    </div>

    <!-- Edit/Invite Modal -->
    <Teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="isModalOpen = false">
        <div class="bg-card w-full max-w-md rounded-lg shadow-lg border p-6 space-y-4">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-primary/10 rounded-full text-primary">
              <Icon :name="editingUser ? 'lucide:pencil' : 'lucide:mail-plus'" class="h-5 w-5" />
            </div>
            <h2 class="text-lg font-semibold">{{ editingUser ? 'Edit User' : 'Invite New User' }}</h2>
          </div>
          
          <div class="space-y-4">
            <!-- Name is only editable for existing users -->
            <div v-if="editingUser" class="space-y-1">
              <label class="text-sm font-medium">Full Name</label>
              <UiInput v-model="formData.name" placeholder="John Doe" />
            </div>
            
            <div class="space-y-1">
              <label class="text-sm font-medium">Email Address</label>
              <UiInput v-model="formData.email" type="email" placeholder="colleague@example.com" :disabled="!!editingUser" />
              <p v-if="!editingUser" class="text-xs text-muted-foreground">
                An invitation email will be sent to this address.
              </p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-sm font-medium">Role</label>
                <select v-model="formData.role" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div v-if="editingUser" class="space-y-1">
                <label class="text-sm font-medium">Status</label>
                <select v-model="formData.status" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Invited">Invited</option>
                </select>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-4">
            <UiButton variant="outline" @click="isModalOpen = false">Cancel</UiButton>
            <UiButton @click="saveUser">
              <Icon v-if="!editingUser" name="lucide:send" class="mr-2 h-4 w-4" />
              {{ editingUser ? 'Save Changes' : 'Send Invitation' }}
            </UiButton>
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

// Real data state
const rawRoles = ref<any[]>([])
const rawProfiles = ref<any[]>([])

const fetchUsers = async () => {
  isLoading.value = true
  try {
    const [roles, profiles] = await Promise.all([
      client.from('user_roles').select('*'),
      client.from('profiles').select('*')
    ])
    
    if (roles.error) throw roles.error
    if (profiles.error) throw profiles.error
    
    rawRoles.value = roles.data || []
    rawProfiles.value = profiles.data || []
  } catch (err) {
    console.error('Failed to fetch users:', err)
  } finally {
    isLoading.value = false
  }
}

// Computed users list merging roles and profiles
const users = computed(() => {
  return rawRoles.value.map(roleData => {
    const profile = rawProfiles.value.find(p => p.id === roleData.user_id)
    return {
      id: roleData.user_id,
      name: profile?.name || '',
      email: profile?.email || 'Unknown',
      role: roleData.role,
      status: 'Active', // Todo: check auth.users confirmed_at via view or assume Active
      lastLogin: 'Unknown' // Need access to auth.users to see this
    }
  })
})

const isModalOpen = ref(false)
const editingUser = ref<any>(null)
const formData = reactive({
  name: '',
  email: '',
  role: 'User',
  status: 'Active'
})

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
    formData.role = 'user' // lowercase to match db enum
    formData.status = 'Invited' 
  }
  isModalOpen.value = true
}

const saveUser = async () => {
  isLoading.value = true
  try {
    if (editingUser.value) {
      // Update existing
      // Only Role and Name can be updated here for now
      // 1. Update Profile
      const { error: profileError } = await client
        .from('profiles')
        .update({ name: formData.name })
        .eq('id', editingUser.value.id)
      
      if (profileError) throw profileError

      // 2. Update Role (only if changed and not self to avoid lockout)
      if (editingUser.value.role !== formData.role) {
         const { error: roleError } = await client
            .from('user_roles')
            .update({ role: formData.role.toLowerCase() })
            .eq('user_id', editingUser.value.id)
         
         if (roleError) throw roleError
      }
    } else {
      // Invite New User
      await authFetch('/api/auth/invite', {
        method: 'POST',
        body: {
            email: formData.email,
            role: formData.role.toLowerCase()
        }
      })
    }
    
    isModalOpen.value = false
    await fetchUsers() // Refresh list
  } catch (err: any) {
    alert(err.message || 'Operation failed')
  } finally {
    isLoading.value = false
  }
}

const deleteUser = async (user: any) => {
  if (confirm(`Are you sure you want to remove ${user.name || user.email}?`)) {
    // TODO: Implement delete API
    alert('Delete functionality not yet implemented (requires Admin API)')
  }
}

const resendInvite = async (user: any) => {
  if (confirm(`Resend invitation to ${user.email}?`)) {
      try {
        await authFetch('/api/auth/invite', {
            method: 'POST',
            body: {
                email: user.email,
                role: user.role
            }
        })
        alert('Invitation resent.')
      } catch (err: any) {
        alert(err.message)
      }
  }
}
</script>
