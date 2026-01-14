<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">Dashboard</h1>
        <p class="text-sm text-muted-foreground">Overview of your MultiBox storage</p>
      </div>
      <UiButton variant="outline" size="sm" @click="refresh" :disabled="pending">
        <Icon :name="pending ? 'lucide:loader-2' : 'lucide:refresh-cw'" :class="{ 'animate-spin': pending }" class="h-4 w-4" />
      </UiButton>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="text-center py-12">
      <Icon name="lucide:loader-2" class="animate-spin h-8 w-8 text-primary mx-auto" />
      <p class="mt-2 text-sm text-muted-foreground">Loading dashboard...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
      <div class="flex items-center gap-2 text-destructive">
        <Icon name="lucide:alert-circle" class="h-5 w-5" />
        <span>{{ error.message || 'Failed to load dashboard' }}</span>
      </div>
    </div>

    <template v-else-if="data">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Storage -->
        <div class="bg-card border rounded-xl p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <div class="p-2 rounded-lg bg-blue-500/10">
              <Icon name="lucide:hard-drive" class="h-5 w-5 text-blue-500" />
            </div>
            <span class="text-xs text-muted-foreground">{{ data.storage.percentage }}%</span>
          </div>
          <div class="mt-3">
            <p class="text-2xl font-bold">{{ formatBytes(data.storage.used) }}</p>
            <p class="text-sm text-muted-foreground">of {{ formatBytes(data.storage.allocated) }} used</p>
          </div>
          <div class="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              class="h-full bg-blue-500 transition-all"
              :style="{ width: `${Math.min(data.storage.percentage, 100)}%` }"
            ></div>
          </div>
        </div>

        <!-- Accounts -->
        <div class="bg-card border rounded-xl p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <div class="p-2 rounded-lg bg-green-500/10">
              <Icon name="lucide:users" class="h-5 w-5 text-green-500" />
            </div>
          </div>
          <div class="mt-3">
            <p class="text-2xl font-bold">{{ data.accountCount }}</p>
            <p class="text-sm text-muted-foreground">Dropbox Accounts</p>
          </div>
        </div>

        <!-- Active Shares -->
        <div class="bg-card border rounded-xl p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <div class="p-2 rounded-lg bg-purple-500/10">
              <Icon name="lucide:link-2" class="h-5 w-5 text-purple-500" />
            </div>
            <span v-if="data.shares.expired > 0" class="text-xs text-amber-500">{{ data.shares.expired }} expired</span>
          </div>
          <div class="mt-3">
            <p class="text-2xl font-bold">{{ data.shares.active }}</p>
            <p class="text-sm text-muted-foreground">Active Share Links</p>
          </div>
        </div>

        <!-- Total Downloads -->
        <div class="bg-card border rounded-xl p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <div class="p-2 rounded-lg bg-orange-500/10">
              <Icon name="lucide:download" class="h-5 w-5 text-orange-500" />
            </div>
          </div>
          <div class="mt-3">
            <p class="text-2xl font-bold">{{ data.shares.totalDownloads }}</p>
            <p class="text-sm text-muted-foreground">Total Downloads</p>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Storage per Account -->
        <div class="bg-card border rounded-xl p-5 shadow-sm">
          <h3 class="font-semibold mb-4 flex items-center gap-2">
            <Icon name="lucide:pie-chart" class="h-4 w-4 text-muted-foreground" />
            Storage per Account
          </h3>
          <div class="space-y-3">
            <div 
              v-for="(account, idx) in data.accounts" 
              :key="account.id"
              class="flex items-center gap-3"
            >
              <div 
                class="w-3 h-3 rounded-full shrink-0"
                :style="{ backgroundColor: accountColors[idx % accountColors.length] }"
              ></div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium truncate">{{ account.name }}</span>
                  <span class="text-xs text-muted-foreground">{{ formatBytes(account.used) }}</span>
                </div>
                <div class="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    class="h-full transition-all"
                    :style="{ 
                      backgroundColor: accountColors[idx % accountColors.length],
                      width: `${account.allocated > 0 ? (account.used / account.allocated) * 100 : 0}%`
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Downloads -->
        <div class="bg-card border rounded-xl p-5 shadow-sm">
          <h3 class="font-semibold mb-4 flex items-center gap-2">
            <Icon name="lucide:trending-up" class="h-4 w-4 text-muted-foreground" />
            Top Downloaded Files
          </h3>
          <div v-if="data.topDownloaded.length === 0" class="text-center py-6 text-muted-foreground">
            <Icon name="lucide:bar-chart-3" class="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p class="text-sm">No downloads yet</p>
          </div>
          <div v-else class="space-y-3">
            <div 
              v-for="(file, idx) in data.topDownloaded" 
              :key="idx"
              class="flex items-center gap-3"
            >
              <span class="text-lg font-bold text-muted-foreground w-6">{{ idx + 1 }}</span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">{{ file.fileName }}</p>
                <p class="text-xs text-muted-foreground">{{ file.accountName }}</p>
              </div>
              <div class="flex items-center gap-1 text-sm font-medium">
                <Icon name="lucide:download" class="h-3 w-3" />
                {{ file.downloads }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Shares -->
      <div class="bg-card border rounded-xl p-5 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold flex items-center gap-2">
            <Icon name="lucide:clock" class="h-4 w-4 text-muted-foreground" />
            Recent Share Links
          </h3>
          <NuxtLink to="/admin/shares" class="text-sm text-primary hover:underline">
            View all →
          </NuxtLink>
        </div>
        
        <div v-if="data.recentShares.length === 0" class="text-center py-6 text-muted-foreground">
          <Icon name="lucide:link-2-off" class="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p class="text-sm">No shares yet</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-left text-xs text-muted-foreground uppercase">
                <th class="pb-2">File</th>
                <th class="pb-2">Account</th>
                <th class="pb-2">Created</th>
                <th class="pb-2">Expires</th>
                <th class="pb-2 text-right">Downloads</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-for="share in data.recentShares" :key="share.id" class="text-sm">
                <td class="py-2">
                  <span class="font-medium truncate block max-w-[200px]">{{ share.fileName }}</span>
                </td>
                <td class="py-2 text-muted-foreground">{{ share.accountName }}</td>
                <td class="py-2 text-muted-foreground">{{ formatDate(share.createdAt) }}</td>
                <td class="py-2">
                  <span :class="getExpiryClass(share.expiresAt)">
                    {{ formatExpiry(share.expiresAt) }}
                  </span>
                </td>
                <td class="py-2 text-right">{{ share.downloads }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-card border rounded-xl p-5 shadow-sm">
        <h3 class="font-semibold mb-4">Quick Actions</h3>
        <div class="flex flex-wrap gap-3">
          <NuxtLink to="/drive/upload">
            <UiButton variant="outline">
              <Icon name="lucide:upload" class="h-4 w-4 mr-2" />
              Upload Files
            </UiButton>
          </NuxtLink>
          <NuxtLink to="/admin/files">
            <UiButton variant="outline">
              <Icon name="lucide:folder" class="h-4 w-4 mr-2" />
              File Manager
            </UiButton>
          </NuxtLink>
          <NuxtLink to="/admin/shares">
            <UiButton variant="outline">
              <Icon name="lucide:link-2" class="h-4 w-4 mr-2" />
              Manage Shares
            </UiButton>
          </NuxtLink>
          <NuxtLink to="/admin/accounts">
            <UiButton variant="outline">
              <Icon name="lucide:settings" class="h-4 w-4 mr-2" />
              Account Settings
            </UiButton>
          </NuxtLink>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
interface DashboardData {
  accounts: {
    id: string
    name: string
    email: string
    used: number
    allocated: number
    error?: boolean
  }[]
  storage: {
    used: number
    allocated: number
    percentage: number
  }
  shares: {
    total: number
    active: number
    expired: number
    totalDownloads: number
  }
  topDownloaded: {
    fileName: string
    accountName: string
    downloads: number
  }[]
  recentShares: {
    id: string
    fileName: string
    accountName: string
    createdAt: string
    expiresAt: string | null
    downloads: number
  }[]
  accountCount: number
}

const { data, pending, error, refresh } = await useFetch<DashboardData>('/api/admin/dashboard', {
  server: false
})

const accountColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short'
  })
}

const formatExpiry = (expiresAt: string | null): string => {
  if (!expiresAt) return 'Never'
  
  const expiry = new Date(expiresAt)
  const now = new Date()
  
  if (expiry <= now) return 'Expired'
  
  const diff = expiry.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days > 0) return `${days}d`
  return 'Today'
}

const getExpiryClass = (expiresAt: string | null): string => {
  if (!expiresAt) return 'text-green-600 dark:text-green-400'
  
  const expiry = new Date(expiresAt)
  const now = new Date()
  
  if (expiry <= now) return 'text-destructive'
  
  const diff = expiry.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days < 1) return 'text-amber-600 dark:text-amber-400'
  return 'text-muted-foreground'
}
</script>
