<template>
  <div class="space-y-4">
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
        <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
        Add User
      </UiButton>
    </div>

    <!-- User List -->
    <div class="rounded-md border bg-card text-card-foreground shadow-sm">
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
                <div class="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                  {{ getInitials(user.name) }}
                </div>
                <div>
                  <div class="font-medium">{{ user.name }}</div>
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
                <span class="h-2 w-2 rounded-full" :class="user.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'"></span>
                <span class="text-sm">{{ user.status }}</span>
              </div>
            </UiTableCell>
            <UiTableCell class="text-right">
              <div class="flex justify-end gap-1">
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

    <!-- Edit/Add Modal -->
    <Teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="isModalOpen = false">
        <div class="bg-card w-full max-w-md rounded-lg shadow-lg border p-6 space-y-4">
          <h2 class="text-lg font-semibold">{{ editingUser ? 'Edit User' : 'Add New User' }}</h2>
          
          <div class="space-y-3">
            <div class="space-y-1">
              <label class="text-sm font-medium">Full Name</label>
              <UiInput v-model="formData.name" placeholder="John Doe" />
            </div>
            
            <div class="space-y-1">
              <label class="text-sm font-medium">Email Address</label>
              <UiInput v-model="formData.email" type="email" placeholder="john@example.com" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-sm font-medium">Role</label>
                <select v-model="formData.role" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <option>User</option>
                  <option>Admin</option>
                  <option>Viewer</option>
                </select>
              </div>

              <div class="space-y-1">
                <label class="text-sm font-medium">Status</label>
                <select v-model="formData.status" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <UiButton variant="outline" @click="isModalOpen = false">Cancel</UiButton>
            <UiButton @click="saveUser">Save Changes</UiButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const users = ref([
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active', lastLogin: '2 mins ago' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User', status: 'Active', lastLogin: '1 day ago' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Viewer', status: 'Inactive', lastLogin: '1 week ago' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'User', status: 'Active', lastLogin: '3 hours ago' },
  { id: 5, name: 'Evan Wright', email: 'evan@example.com', role: 'User', status: 'Active', lastLogin: '5 mins ago' },
])

const isModalOpen = ref(false)
const editingUser = ref<any>(null)
const formData = reactive({
  name: '',
  email: '',
  role: 'User',
  status: 'Active'
})

const getInitials = (name: string) => {
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
    // Reset defaults
    formData.name = ''
    formData.email = ''
    formData.role = 'User'
    formData.status = 'Active'
  }
  isModalOpen.value = true
}

const saveUser = () => {
  if (editingUser.value) {
    // Update existing (mock)
    const index = users.value.findIndex(u => u.id === editingUser.value.id)
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...formData }
    }
  } else {
    // Add new (mock)
    users.value.push({
      id: Date.now(),
      ...formData,
      lastLogin: 'Never'
    })
  }
  isModalOpen.value = false
}

const deleteUser = (user: any) => {
  if (confirm(`Are you sure you want to delete ${user.name}?`)) {
    users.value = users.value.filter(u => u.id !== user.id)
  }
}
</script>
