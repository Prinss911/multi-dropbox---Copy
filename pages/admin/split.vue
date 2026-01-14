<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold tracking-tight">Split View</h1>
      <p class="text-sm text-muted-foreground hidden md:block">
        Manage files across two accounts simultaneously
      </p>
    </div>

    <!-- Split Container -->
    <div class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
      <!-- Left Pane -->
      <div class="flex flex-col border rounded-lg bg-card shadow-sm overflow-hidden">
        <!-- Pane Header -->
        <div class="p-3 border-b bg-muted/30 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <div class="p-1.5 rounded bg-primary/10 shrink-0">
              <Icon name="lucide:layout-panel-left" class="h-4 w-4 text-primary" />
            </div>
            <select 
              v-model="leftAccountId"
              class="flex-1 min-w-0 bg-transparent text-sm font-medium focus:outline-none cursor-pointer hover:bg-muted/50 rounded py-1 pl-1 pr-8"
              aria-label="Select Account for Left Pane"
            >
              <option v-for="acc in sortedAccounts" :key="acc.id" :value="acc.id">
                {{ acc.name || acc.email }}
              </option>
            </select>
          </div>
          <div class="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
             {{ getAccountEmail(leftAccountId) }}
          </div>
        </div>
        
        <!-- Pane Content -->
        <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <FileBrowser 
            v-if="leftAccountId" 
            :account-id="leftAccountId" 
            :key="`left-${leftAccountId}`"
          />
          <div v-else class="h-full flex flex-col items-center justify-center text-muted-foreground">
             <Icon name="lucide:user-x" class="h-12 w-12 mb-2 opacity-50" />
             <p>No account selected</p>
          </div>
        </div>
      </div>

      <!-- Right Pane -->
      <div class="flex flex-col border rounded-lg bg-card shadow-sm overflow-hidden">
        <!-- Pane Header -->
        <div class="p-3 border-b bg-muted/30 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <div class="p-1.5 rounded bg-secondary/10 shrink-0">
              <Icon name="lucide:layout-panel-left" class="h-4 w-4 text-secondary-foreground rotate-180" />
            </div>
            <select 
              v-model="rightAccountId"
              class="flex-1 min-w-0 bg-transparent text-sm font-medium focus:outline-none cursor-pointer hover:bg-muted/50 rounded py-1 pl-1 pr-8"
               aria-label="Select Account for Right Pane"
            >
              <option :value="''" disabled>Select Account</option>
              <option v-for="acc in sortedAccounts" :key="acc.id" :value="acc.id">
                {{ acc.name || acc.email }}
              </option>
            </select>
          </div>
          <div class="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
             {{ getAccountEmail(rightAccountId) }}
          </div>
        </div>

        <!-- Pane Content -->
        <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <FileBrowser 
            v-if="rightAccountId" 
            :account-id="rightAccountId" 
            :key="`right-${rightAccountId}`" 
          />
          <div v-else class="h-full flex flex-col items-center justify-center text-muted-foreground">
             <Icon name="lucide:arrow-left-right" class="h-12 w-12 mb-2 opacity-50" />
             <p>Select an account to compare</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { accounts, activeAccountId } = useAccounts()

// Initialize panes
// Left defaults to global active
// Right defaults to second account if available, else null (or same)
const leftAccountId = ref(activeAccountId.value)
const rightAccountId = ref<string>('')

const sortedAccounts = computed(() => {
  return [...accounts.value].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
})

onMounted(() => {
  // If we have > 1 account, set right pane to the first one that is NOT the active one
  if (accounts.value.length > 1) {
    const other = accounts.value.find(a => a.id !== leftAccountId.value)
    if (other) {
      rightAccountId.value = other.id
    } else {
      rightAccountId.value = accounts.value[0]?.id || ''
    }
  } else if (accounts.value.length === 1) {
     // If only 1 account, maybe just set it? Or leave blank?
     // User might want to browse different folders of same account.
     rightAccountId.value = accounts.value[0].id
  }
})

const getAccountEmail = (id: string) => {
  const acc = accounts.value.find(a => a.id === id)
  return acc?.email || ''
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  @apply bg-transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-muted-foreground/20 rounded-full hover:bg-muted-foreground/40;
}
</style>
