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

    <!-- Delete Confirm Dialog -->
    <Teleport to="body">
      <div 
        v-if="deleteTarget" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="deleteTarget = null"
      >
        <div class="bg-card w-full max-w-sm rounded-lg shadow-lg border p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 rounded-full bg-destructive/10">
              <Icon name="lucide:alert-triangle" class="h-5 w-5 text-destructive" />
            </div>
            <h3 class="font-semibold text-lg">Delete User</h3>
          </div>
          <p class="text-muted-foreground mb-6">
            Are you sure you want to delete <strong>{{ deleteTarget.name || deleteTarget.email }}</strong>?
            <br><br>
            <span class="text-destructive text-sm">This action cannot be undone.</span>
          </p>
          <div class="flex gap-3 justify-end">
            <UiButton variant="outline" @click="deleteTarget = null">
              Cancel
            </UiButton>
            <UiButton 
              variant="destructive"
              :disabled="isDeleting"
              @click="handleDeleteUser"
            >
              <Icon v-if="isDeleting" name="lucide:loader-2" class="h-4 w-4 mr-2 animate-spin" />
              Delete
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
const isDeleting = ref(false)
const deleteTarget = ref<any>(null)

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
const users = computed(() => {
  return rawProfiles.value.map(profile => {
    return {
      id: profile.id,
      name: profile.name || '',
      email: profile.email || 'Unknown',
      role: profile.role || 'user', // Default to user if null
      status: profile.name ? 'Active' : 'Invited', // Assume invited if name not set
      lastLogin: new Date(profile.updated_at || profile.created_at).toLocaleDateString()
    }
  })
})

const isModalOpen = ref(false)
const editingUser = ref<any>(null)
const formData = reactive({
  name: '',
  email: '',
  role: 'user',
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
    formData.role = 'user'
    formData.status = 'Invited' 
  }
  isModalOpen.value = true
}

const saveUser = async () => {
  isLoading.value = true
  try {
    if (editingUser.value) {
      // Update existing
      // Update Profile (Name & Role)
      const { error } = await client
        .from('profiles')
        .update({ 
            name: formData.name,
            role: formData.role.toLowerCase() 
        })
        .eq('id', editingUser.value.id)
      
      if (error) throw error

    } else {
      // Invite New User
      const response = await authFetch('/api/auth/invite', {
        method: 'POST',
        body: {
            email: formData.email,
            role: formData.role.toLowerCase()
        }
      })
      
      if (response.link) {
          alert(`Invitation sent! \n\nIMPORTANT: Use this link if the email doesn't arrive:\n${response.link}`)
      } else {
          alert('Invitation sent! Please check your email inbox.')
      }
    }
    
    isModalOpen.value = false
    await fetchUsers() // Refresh list
  } catch (err: any) {
    alert(err.message || 'Operation failed')
  } finally {
    isLoading.value = false
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
