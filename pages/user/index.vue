<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">My Uploads</h1>
        <NuxtLink
          to="/upload"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Upload New
        </NuxtLink>
      </div>

      <div v-if="pending" class="text-center py-12">
        <div class="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-indigo-500" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <!-- Heroicon name: solid/exclamation -->
            <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">
              Error loading uploads: {{ error.message }}
            </p>
          </div>
        </div>
      </div>

      <div v-else-if="!shares || shares.length === 0" class="bg-white shadow rounded-lg p-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No uploads</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by creating a new upload.</p>
        <div class="mt-6">
          <NuxtLink
            to="/upload"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Upload File
          </NuxtLink>
        </div>
      </div>

      <div v-else class="bg-white shadow overflow-hidden rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expires
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Downloads
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="share in shares" :key="share.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="ml-0">
                    <div class="text-sm font-medium text-gray-900 hover:underline">
                        <NuxtLink :to="`/download/${share.id}`" target="_blank">{{ share.fileName }}</NuxtLink>
                    </div>
                    <div class="text-xs text-gray-500" v-if="share.files && share.files.length > 1">
                        {{ share.files.length }} items
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ share.accountName }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(share.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span :class="{'text-red-500': isExpired(share.expiresAt), 'text-green-600': !share.expiresAt}">
                    {{ formatExpires(share.expiresAt) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ share.downloadCount }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                <button @click="copyLink(share.id)" class="text-indigo-600 hover:text-indigo-900">Copy Link</button>
                <button @click="confirmDelete(share)" class="text-red-600 hover:text-red-900">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShareLink } from '~/server/utils/shares' // Type only import, check if it works client side or duplicate type

interface ShareLinkClient {
    id: string
    fileName: string
    files: any[]
    accountName: string
    createdAt: string
    expiresAt: string | null
    downloadCount: number
}

const { data: shares, pending, error, refresh } = await useFetch<ShareLinkClient[]>('/api/user/shares')

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString()
}

const formatExpires = (dateStr: string | null) => {
    if (!dateStr) return 'Never'
    return new Date(dateStr).toLocaleDateString()
}

const isExpired = (dateStr: string | null) => {
    if (!dateStr) return false
    return new Date(dateStr) < new Date()
}

const copyLink = (id: string) => {
    const url = `${window.location.origin}/download/${id}`
    navigator.clipboard.writeText(url)
    alert('Link copied to clipboard!')
}

const confirmDelete = async (share: ShareLinkClient) => {
    if (confirm(`Are you sure you want to delete "${share.fileName}"? This action cannot be undone.`)) {
        try {
            await $fetch(`/api/shares/${share.id}`, { method: 'DELETE' })
            await refresh()
        } catch (e: any) {
            alert('Failed to delete: ' + (e.message || 'Unknown error'))
        }
    }
}
</script>
