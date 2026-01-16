<template>
  <div class="h-full flex flex-col bg-background/50">
    <!-- Sticky Header & Controls -->
    <div class="sticky top-0 z-20 bg-background/95 backdrop-blur border-b px-6 py-4">
      <div class="w-full">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
             <h1 class="text-xl font-semibold text-[#1E1919] dark:text-foreground">All Files</h1>
             <p class="text-sm text-muted-foreground">
               {{ selectedIds.size > 0 ? `${selectedIds.size} selected` : `${totalFiles} files across ${totalAccounts} accounts` }}
             </p>
           </div>
           
           <div class="flex flex-wrap items-center gap-3">
              <!-- Search -->
              <div class="relative group">
                <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search files..."
                  class="h-10 pl-9 pr-4 w-full md:w-64 rounded-full border bg-muted/20 hover:bg-muted/40 focus:bg-background focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>

              <div class="h-6 w-px bg-border mx-1 hidden md:block"></div>

              <!-- Filter Account -->
              <div class="relative">
                 <select 
                  v-model="filterAccount" 
                  class="h-10 pl-3 pr-8 rounded-full border bg-muted/20 hover:bg-muted/40 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none cursor-pointer min-w-[140px]"
                >
                  <option value="">All Accounts</option>
                  <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
                    {{ acc.name }}
                  </option>
                </select>
                <Icon name="lucide:chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>

              <!-- Sort -->
               <div class="relative">
                 <select 
                  v-model="sortBy" 
                  class="h-10 pl-3 pr-8 rounded-full border bg-muted/20 hover:bg-muted/40 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none cursor-pointer"
                >
                  <option value="modified">Date Modified</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="size">File Size</option>
                </select>
                <Icon name="lucide:arrow-up-down" class="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
              </div>

              <button 
                @click="() => refresh()" 
                :disabled="pending"
                class="h-10 w-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground"
              >
                <Icon :name="pending ? 'lucide:loader-2' : 'lucide:refresh-cw'" :class="{ 'animate-spin': pending }" class="h-4 w-4" />
              </button>
           </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-auto px-4 md:px-6 py-6 transition-all">
       <div class="w-full h-full">

        <!-- Floating Bulk Action Bar -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-200 ease-in"
          enter-from-class="opacity-0 translate-y-4"
          leave-to-class="opacity-0 translate-y-4"
        >
          <div 
            v-if="selectedIds.size > 0" 
            class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-[#1E1919] dark:bg-card rounded-full shadow-2xl border dark:border-border"
          >
            <!-- Selection Count -->
            <div class="flex items-center gap-2 text-white dark:text-foreground">
              <div class="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                {{ selectedIds.size }}
              </div>
              <span class="text-sm font-medium">selected</span>
            </div>

            <div class="w-px h-6 bg-white/20 dark:bg-border"></div>

            <!-- Bulk Actions -->
            <button 
              @click="handleBulkDownload"
              :disabled="isBulkDownloading"
              class="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Icon v-if="isBulkDownloading" name="lucide:loader-2" class="h-4 w-4 animate-spin" />
              <Icon v-else name="lucide:download" class="h-4 w-4" />
              <span class="hidden sm:inline">Download</span>
            </button>

            <button 
              @click="handleBulkDelete"
              :disabled="isDeleting"
              class="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Icon v-if="isDeleting" name="lucide:loader-2" class="h-4 w-4 animate-spin" />
              <Icon v-else name="lucide:trash-2" class="h-4 w-4" />
              <span class="hidden sm:inline">Delete</span>
            </button>

            <div class="w-px h-6 bg-white/20 dark:bg-border"></div>

            <!-- Clear Selection -->
            <button 
              @click="clearSelection"
              class="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              title="Clear selection"
            >
              <Icon name="lucide:x" class="h-4 w-4" />
            </button>
          </div>
        </Transition>

        <!-- Loading -->
        <div v-if="pending" class="h-full flex flex-col items-center justify-center text-muted-foreground">
          <Icon name="lucide:loader-2" class="animate-spin h-8 w-8 text-[#0061FE] mb-4" />
          <p class="text-sm">Fetching files list...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="p-6 rounded-lg bg-red-50 text-red-600 border border-red-100 text-center mx-auto max-w-lg mt-10">
           <Icon name="lucide:alert-circle" class="h-8 w-8 mb-2 mx-auto" />
           <h3 class="font-medium">Failed to load files</h3>
           <p class="text-sm opacity-80 mt-1">{{ error.message }}</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="sortedFiles.length === 0" class="h-full flex flex-col items-center justify-center p-12 text-center">
          <div class="h-24 w-24 mb-4 flex items-center justify-center rounded-full bg-muted/30 text-muted-foreground">
             <Icon name="lucide:search-x" class="h-10 w-10 opacity-50" />
          </div>
          <h3 class="text-lg font-semibold text-[#1E1919] dark:text-foreground mb-2">No files found</h3>
          <p class="text-muted-foreground text-sm max-w-xs">
            {{ searchQuery || filterAccount ? 'No matches for your filters.' : 'Your storage is completely empty.' }}
          </p>
          <button 
            v-if="searchQuery || filterAccount"
            @click="searchQuery = ''; filterAccount = ''"
            class="mt-4 text-[#0061FE] text-sm hover:underline"
          >
            Clear all filters
          </button>
        </div>

        <!-- Files Table -->
        <div v-else class="w-full pb-8">
           <table class="w-full text-left border-collapse">
              <thead class="sticky top-0 bg-background/95 backdrop-blur z-10">
                 <tr>
                    <th class="py-3 px-2 border-b w-10">
                       <input 
                         type="checkbox"
                         :checked="isAllSelected"
                         :indeterminate="isPartiallySelected"
                         @change="toggleSelectAll"
                         class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                       />
                    </th>
                    <th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-[35%]">File Name</th>
                    <th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-32 hidden sm:table-cell">Account</th>
                    <th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b hidden md:table-cell">Location</th>
                    <th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-24 hidden lg:table-cell">Size</th>
                    <th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-32 hidden xl:table-cell">Modified</th>
                    <th class="py-3 px-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-24">Actions</th>
                 </tr>
              </thead>
              <tbody class="divide-y divide-border/40">
                 <tr 
                    v-for="file in paginatedFiles" 
                    :key="file.id" 
                    class="group hover:bg-[#F7F9FA] dark:hover:bg-muted/20 transition-colors"
                    :class="{ 'bg-blue-50 dark:bg-blue-500/10': selectedIds.has(file.id) }"
                 >
                    <td class="py-3 px-2">
                       <input 
                         type="checkbox"
                         :checked="selectedIds.has(file.id)"
                         @change="toggleSelect(file.id)"
                         class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                       />
                    </td>
                    <td class="py-3 px-4">
                       <div class="flex items-center gap-4">
                          <!-- Minimalist Icon -->
                          <div class="relative shrink-0">
                             <Icon :name="getFileIcon(file.extension)" :class="['h-8 w-8', getIconColor(file.extension)]" />
                          </div>
                          <div class="min-w-0">
                             <p 
                                @click="openPreview(file)"
                                class="font-medium text-sm text-[#1E1919] dark:text-foreground truncate cursor-pointer hover:text-[#0061FE] transition-colors" 
                                :title="file.name"
                             >
                                {{ file.name }}
                             </p>
                             <div class="flex items-center gap-2 mt-0.5 lg:hidden">
                                <span class="text-xs text-muted-foreground">{{ formatBytes(file.size) }}</span>
                             </div>
                          </div>
                       </div>
                    </td>
                     <td class="py-3 px-4 hidden sm:table-cell">
                         <span 
                            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                            :style="{ 
                               backgroundColor: getAccountColor(file.accountId) + '15', 
                               color: getAccountColor(file.accountId)
                            }"
                         >
                            <span class="w-1.5 h-1.5 rounded-full shrink-0" :style="{ backgroundColor: getAccountColor(file.accountId) }"></span>
                            <span class="truncate max-w-[120px]">{{ file.accountName }}</span>
                         </span>
                     </td>
                    <td class="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">
                       <div class="flex items-center gap-1.5 max-w-[200px]">
                          <Icon name="lucide:folder" class="h-3 w-3 opacity-50 shrink-0" />
                          <span class="truncate" :title="file.path">{{ getFolder(file.path) }}</span>
                       </div>
                    </td>
                    <td class="py-3 px-4 text-xs font-mono text-muted-foreground hidden lg:table-cell">
                       {{ formatBytes(file.size) }}
                    </td>
                    <td class="py-3 px-4 text-xs text-muted-foreground hidden xl:table-cell">
                       {{ formatDate(file.modified) }}
                    </td>
                    <td class="py-3 px-4 text-right">
                       <div class="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                             @click="handleDownload(file)"
                             title="Download"
                             class="h-8 w-8 flex items-center justify-center rounded hover:bg-white hover:text-[#0061FE] hover:shadow-sm transition-all text-muted-foreground"
                          >
                             <Icon name="lucide:download" class="h-4 w-4" />
                          </button>
                          <button 
                             @click="openPreview(file)"
                             title="Preview"
                             class="h-8 w-8 flex items-center justify-center rounded hover:bg-purple-50 hover:text-purple-600 hover:shadow-sm transition-all text-muted-foreground"
                          >
                             <Icon name="lucide:eye" class="h-4 w-4" />
                          </button>
                          <button 
                             @click="openShareModal(file)"
                             title="Share"
                             class="h-8 w-8 flex items-center justify-center rounded hover:bg-[#0061FE] hover:text-white hover:shadow-sm transition-all text-muted-foreground"
                          >
                             <Icon name="lucide:share-2" class="h-4 w-4" />
                          </button>
                          <button 
                             @click="confirmDelete(file)"
                             title="Delete"
                             class="h-8 w-8 flex items-center justify-center rounded hover:bg-red-50 hover:text-red-600 hover:shadow-sm transition-all text-muted-foreground"
                          >
                             <Icon name="lucide:trash-2" class="h-4 w-4" />
                          </button>
                       </div>
                    </td>
                 </tr>
              </tbody>
           </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center mt-4 pb-8">
           <div class="flex items-center gap-1 bg-muted/30 p-1 rounded-full">
              <button 
                 @click="currentPage--"
                 :disabled="currentPage === 1"
                 class="h-8 w-8 flex items-center justify-center rounded-full hover:bg-background disabled:opacity-50 transition-all text-muted-foreground"
              >
                 <Icon name="lucide:chevron-left" class="h-4 w-4" />
              </button>
              <div class="px-4 text-xs font-medium text-muted-foreground">
                 Page {{ currentPage }} of {{ totalPages }}
              </div>
              <button 
                 @click="currentPage++"
                 :disabled="currentPage === totalPages"
                 class="h-8 w-8 flex items-center justify-center rounded-full hover:bg-background disabled:opacity-50 transition-all text-muted-foreground"
              >
                 <Icon name="lucide:chevron-right" class="h-4 w-4" />
              </button>
           </div>
        </div>

       </div>
    </div>

    <!-- Share Modal (Clean) -->
    <Teleport to="body">
      <div 
        v-if="shareTarget" 
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1E1919]/60 backdrop-blur-[2px]"
        @click.self="closeShareModal"
      >
        <div class="bg-card w-full max-w-[480px] rounded-xl shadow-2xl border-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div class="px-6 py-5 border-b bg-background flex items-center justify-between">
             <h3 class="font-semibold text-lg text-[#1E1919] dark:text-foreground">Share File</h3>
             <button @click="closeShareModal" class="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors">
                <Icon name="lucide:x" class="h-5 w-5" />
             </button>
          </div>
          
          <div class="p-6">
            <!-- File Info -->
            <div class="flex items-center gap-4 mb-6">
               <div class="h-10 w-10 flex items-center justify-center">
                  <Icon :name="getFileIcon(shareTarget.extension)" class="h-10 w-10" :class="getIconColor(shareTarget.extension)" />
               </div>
               <div class="min-w-0">
                  <h4 class="font-medium text-sm truncate">{{ shareTarget.name }}</h4>
                  <div class="flex text-xs text-muted-foreground gap-2">
                     <span>{{ formatBytes(shareTarget.size) }}</span>
                     <span>•</span>
                     <span class="text-[#0061FE]">{{ shareTarget.accountName }}</span>
                  </div>
               </div>
            </div>

            <!-- Share Result -->
            <div v-if="shareResult" class="space-y-5">
               <div class="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg flex gap-3 border border-green-100 dark:border-green-800/30">
                  <div class="mt-0.5">
                     <Icon name="lucide:check-circle-2" class="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                     <p class="text-sm font-medium text-green-800 dark:text-green-300">Link created</p>
                     <p class="text-xs text-green-600 dark:text-green-400 mt-0.5">Expires: {{ formatExpiry(shareResult.expiresAt) }}</p>
                  </div>
               </div>
               
               <div class="space-y-2">
                  <label class="text-xs font-bold uppercase text-muted-foreground tracking-wider">Public Link</label>
                  <div class="flex gap-2">
                     <div class="flex-1 relative">
                        <input 
                           type="text" 
                           :value="shareResult.url" 
                           readonly
                           class="w-full h-11 pl-3 pr-10 bg-muted/30 border rounded-md text-sm font-mono text-foreground focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
                        />
                     </div>
                     <button 
                        @click="copyShareLink"
                        class="h-11 px-6 rounded-md bg-[#0061FE] hover:bg-[#0057E5] text-white font-medium text-sm transition-colors flex items-center gap-2"
                     >
                        <Icon v-if="copied" name="lucide:check" class="h-4 w-4" />
                        <Icon v-else name="lucide:copy" class="h-4 w-4" />
                        {{ copied ? 'Copied' : 'Copy' }}
                     </button>
                  </div>
               </div>
            </div>

            <!-- Create Share Form -->
            <div v-else class="space-y-6">
              <div>
                 <label class="text-sm font-medium text-foreground mb-3 block">Link settings</label>
                 <div class="grid grid-cols-2 gap-2">
                    <button
                      v-for="option in expirationOptions"
                      :key="option.label"
                      @click="selectedExpiration = option.days; selectedExpirationUnit = option.unit"
                      :class="[
                        'px-3 py-2.5 rounded-lg text-sm font-medium transition-all border text-left flex items-center justify-between',
                        (selectedExpiration === option.days)
                          ? 'bg-blue-50 border-blue-200 text-blue-700' 
                          : 'bg-card hover:bg-muted border-input text-muted-foreground'
                      ]"
                    >
                      {{ option.label }}
                      <Icon v-if="selectedExpiration === option.days" name="lucide:check" class="h-4 w-4" />
                    </button>
                 </div>
              </div>

               <button 
                  @click="handleShare"
                  :disabled="isSharing"
                  class="w-full h-12 rounded-lg bg-[#0061FE] hover:bg-[#0057E5] text-white font-semibold text-base shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
               >
                  <Icon v-if="isSharing" name="lucide:loader-2" class="h-5 w-5 animate-spin" />
                  <span v-else>Generate Link</span>
               </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div 
        v-if="deleteTarget" 
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1E1919]/60 backdrop-blur-[2px]"
        @click.self="deleteTarget = null"
      >
        <div class="bg-card w-full max-w-[400px] rounded-xl shadow-2xl border-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div class="px-6 py-5 border-b bg-background flex items-center gap-3">
             <div class="p-2 rounded-full bg-red-100">
                <Icon name="lucide:trash-2" class="h-5 w-5 text-red-600" />
             </div>
             <h3 class="font-semibold text-lg text-[#1E1919] dark:text-foreground">Delete File</h3>
          </div>
          <div class="p-6">
            <p class="text-muted-foreground mb-2">
              Are you sure you want to delete this file?
            </p>
            <div class="flex items-center gap-3 p-3 bg-muted/30 rounded-lg mb-4">
               <Icon :name="getFileIcon(deleteTarget.extension)" class="h-8 w-8" :class="getIconColor(deleteTarget.extension)" />
               <div class="min-w-0">
                  <p class="font-medium text-sm truncate">{{ deleteTarget.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ formatBytes(deleteTarget.size) }} • {{ deleteTarget.accountName }}</p>
               </div>
            </div>
            <p class="text-xs text-muted-foreground mb-6">
              The file will be moved to trash and automatically deleted after 30 days.
            </p>
            <div class="flex gap-3 justify-end">
               <button 
                  @click="deleteTarget = null"
                  class="px-4 py-2 rounded-lg text-sm font-medium border border-input bg-background hover:bg-muted transition-colors"
               >
                  Cancel
               </button>
               <button 
                  @click="handleDelete"
                  :disabled="isDeleting"
                  class="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
               >
                  <Icon v-if="isDeleting" name="lucide:loader-2" class="h-4 w-4 animate-spin" />
                  <Icon v-else name="lucide:trash-2" class="h-4 w-4" />
                  Delete
               </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Preview Modal -->
    <Teleport to="body">
      <div 
        v-if="previewTarget" 
        class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90"
        @click.self="closePreview"
      >
        <!-- Close Button -->
        <button 
          @click="closePreview"
          class="absolute top-4 right-4 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <Icon name="lucide:x" class="h-6 w-6" />
        </button>

        <!-- File Info Header -->
        <div class="absolute top-4 left-4 z-10 flex items-center gap-3 max-w-[50%]">
          <Icon :name="getFileIcon(previewTarget.extension)" class="h-8 w-8 text-white shrink-0" />
          <div class="min-w-0">
            <p class="text-white font-medium truncate">{{ previewTarget.name }}</p>
            <p class="text-white/60 text-sm">{{ formatBytes(previewTarget.size) }} • {{ previewTarget.accountName }}</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          <button 
            @click="handleDownload(previewTarget)"
            class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-2"
          >
            <Icon name="lucide:download" class="h-4 w-4" />
            Download
          </button>
          <button 
            @click="openShareModal(previewTarget); closePreview()"
            class="px-4 py-2 rounded-lg bg-[#0061FE] hover:bg-[#0057E5] text-white transition-colors flex items-center gap-2"
          >
            <Icon name="lucide:share-2" class="h-4 w-4" />
            Share
          </button>
        </div>

        <!-- Preview Content -->
        <div class="max-w-[90vw] max-h-[80vh] flex items-center justify-center">
          <!-- Loading -->
          <div v-if="isLoadingPreview" class="flex flex-col items-center gap-4 text-white">
            <Icon name="lucide:loader-2" class="h-12 w-12 animate-spin" />
            <p>Loading preview...</p>
          </div>

          <!-- Image Preview -->
          <img 
            v-else-if="previewUrl && isImageFile(previewTarget.extension)"
            :src="previewUrl"
            :alt="previewTarget.name"
            class="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
          />

          <!-- Video Preview -->
          <video 
            v-else-if="previewUrl && isVideoFile(previewTarget.extension)"
            :src="previewUrl"
            controls
            autoplay
            class="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
          />

          <!-- Audio Preview -->
          <div v-else-if="previewUrl && isAudioFile(previewTarget.extension)" class="bg-card p-8 rounded-xl shadow-2xl text-center">
            <Icon :name="getFileIcon(previewTarget.extension)" class="h-24 w-24 mx-auto mb-4 text-indigo-500" />
            <p class="font-medium text-lg mb-4">{{ previewTarget.name }}</p>
            <audio :src="previewUrl" controls autoplay class="w-full max-w-md" />
          </div>

          <!-- Other file types -->
          <div v-else-if="previewUrl" class="bg-card p-8 rounded-xl shadow-2xl text-center max-w-md">
            <Icon :name="getFileIcon(previewTarget.extension)" class="h-24 w-24 mx-auto mb-4" :class="getIconColor(previewTarget.extension)" />
            <p class="font-medium text-lg mb-2">{{ previewTarget.name }}</p>
            <p class="text-muted-foreground text-sm mb-6">{{ formatBytes(previewTarget.size) }}</p>
            <p class="text-sm text-muted-foreground mb-4">Preview not available for this file type</p>
            <button 
              @click="previewUrl && navigateTo(previewUrl, { external: true, open: { target: '_blank' } })"
              class="px-6 py-2 rounded-lg bg-[#0061FE] hover:bg-[#0057E5] text-white transition-colors"
            >
              Open in New Tab
            </button>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- Bulk Delete Modal -->
    <Teleport to="body">
      <div 
        v-if="showBulkDeleteModal" 
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1E1919]/60 backdrop-blur-[2px]"
        @click.self="showBulkDeleteModal = false"
      >
        <div class="bg-card w-full max-w-[400px] rounded-xl shadow-2xl border-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6">
           <div class="flex flex-col items-center text-center gap-4">
              <div class="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-2">
                 <Icon name="lucide:trash-2" class="h-6 w-6" />
              </div>
              <div>
                 <h3 class="text-lg font-semibold text-[#1E1919] dark:text-foreground">Delete {{ selectedIds.size }} Files?</h3>
                 <p class="text-sm text-muted-foreground mt-2 px-4">
                    This will move selected files to Trash. You can restore them within 30 days.
                 </p>
              </div>
              
              <div class="flex gap-3 w-full mt-2">
                 <button 
                    @click="showBulkDeleteModal = false"
                    class="flex-1 h-10 rounded-lg border hover:bg-muted transition-colors text-sm font-medium"
                 >
                    Cancel
                 </button>
                 <button 
                    @click="handleBulkDelete"
                    :disabled="isBulkDeleting"
                    class="flex-1 h-10 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-70"
                 >
                    <Icon v-if="isBulkDeleting" name="lucide:loader-2" class="h-4 w-4 animate-spin" />
                    {{ isBulkDeleting ? 'Deleting...' : 'Move to Trash' }}
                 </button>
              </div>
           </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
interface FileEntry {
  id: string
  name: string
  path: string
  size: number
  modified: string
  extension: string | null
  accountId: string
  accountName: string
}

interface AllFilesResponse {
  files: FileEntry[]
  accounts: { id: string; name: string }[]
  totalFiles: number
  totalAccounts: number
}

// Filters
const searchQuery = ref('')
const filterAccount = ref('')
const sortBy = ref('modified')
const currentPage = ref(1)
const pageSize = 50

// Auth fetch composable
const { authFetch } = useAuthFetch()

// Manual state management for authenticated fetch
const data = ref<AllFilesResponse | null>(null)
const pending = ref(true)
const error = ref<Error | null>(null)

// Fetch files function with authentication
const fetchFiles = async () => {
  pending.value = true
  error.value = null
  try {
    const response = await authFetch<AllFilesResponse>('/api/dropbox/all-files')
    data.value = response
  } catch (err: any) {
    console.error('Failed to fetch files:', err)
    error.value = err
  } finally {
    pending.value = false
  }
}

// Refresh function
const refresh = () => fetchFiles()

// Fetch on mount
onMounted(() => {
  fetchFiles()
})

const files = computed(() => data.value?.files || [])
const accounts = computed(() => data.value?.accounts || [])
const totalFiles = computed(() => data.value?.totalFiles || 0)
const totalAccounts = computed(() => data.value?.totalAccounts || 0)

// Bulk selection state
const selectedIds = ref<Set<string>>(new Set())
const showBulkDeleteModal = ref(false)
const isBulkDeleting = ref(false)
const isBulkDownloading = ref(false)

// Selection helpers
const isAllSelected = computed(() => {
  return paginatedFiles.value.length > 0 && paginatedFiles.value.every(f => selectedIds.value.has(f.id))
})

const isPartiallySelected = computed(() => {
  const selectedCount = paginatedFiles.value.filter(f => selectedIds.value.has(f.id)).length
  return selectedCount > 0 && selectedCount < paginatedFiles.value.length
})

const toggleSelect = (id: string) => {
  const newSet = new Set(selectedIds.value)
  if (newSet.has(id)) {
    newSet.delete(id)
  } else {
    newSet.add(id)
  }
  selectedIds.value = newSet
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    const newSet = new Set(selectedIds.value)
    paginatedFiles.value.forEach(f => newSet.delete(f.id))
    selectedIds.value = newSet
  } else {
    const newSet = new Set(selectedIds.value)
    paginatedFiles.value.forEach(f => newSet.add(f.id))
    selectedIds.value = newSet
  }
}

const clearSelection = () => {
  selectedIds.value = new Set()
}

// Filter and sort
const sortedFiles = computed(() => {
  let result = [...files.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(f => 
      f.name.toLowerCase().includes(query) || 
      f.path.toLowerCase().includes(query)
    )
  }

  // Account filter
  if (filterAccount.value) {
    result = result.filter(f => f.accountId === filterAccount.value)
  }

  // Sort
  if (sortBy.value === 'name') {
    result.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortBy.value === 'size') {
    result.sort((a, b) => b.size - a.size)
  } else {
    result.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())
  }

  return result
})

// Pagination
const totalPages = computed(() => Math.ceil(sortedFiles.value.length / pageSize))
const paginatedFiles = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return sortedFiles.value.slice(start, start + pageSize)
})

// Reset page when filters change
watch([searchQuery, filterAccount, sortBy], () => {
  currentPage.value = 1
})

// Get folder from path
const getFolder = (path: string): string => {
  const parts = path.split('/')
  parts.pop() // Remove filename
  return parts.join('/') || '/'
}

// Actions
const handleDownload = async (file: FileEntry) => {
  try {
    const response = await authFetch<{ link: string }>(`/api/dropbox/download?path=${encodeURIComponent(file.path)}&accountId=${encodeURIComponent(file.accountId)}`)
    window.open(response.link, '_blank')
  } catch (err: any) {
    alert('Download failed: ' + err.message)
  }
}

// Share Modal State
const shareTarget = ref<FileEntry | null>(null)
const shareResult = ref<{ url: string; expiresAt: string | null } | null>(null)
const isSharing = ref(false)
const copied = ref(false)

// Expiration options (Admin has "Never" option)
const expirationOptions = [
  { days: 1, unit: 'days', label: '1 Day' },
  { days: 3, unit: 'days', label: '3 Days' },
  { days: 7, unit: 'days', label: '7 Days' },
  { days: 30, unit: 'days', label: '1 Month' },
  { days: 90, unit: 'days', label: '3 Months' },
  { days: 'never', unit: 'days', label: 'Never' }
]
const selectedExpiration = ref<number | string>(7)
const selectedExpirationUnit = ref('days')

// Open share modal
const openShareModal = (file: FileEntry) => {
  shareTarget.value = file
  shareResult.value = null
  copied.value = false
  selectedExpiration.value = 7
}

// Close share modal
const closeShareModal = () => {
  shareTarget.value = null
  shareResult.value = null
}

// Handle share
const handleShare = async () => {
  console.log('[handleShare] Called, shareTarget:', shareTarget.value)
  if (!shareTarget.value) {
    console.error('[handleShare] No shareTarget!')
    return
  }

  isSharing.value = true
  console.log('[handleShare] Starting share request...')
  
  try {
    const requestBody = {
      accountId: shareTarget.value.accountId,
      filePath: shareTarget.value.path,
      fileName: shareTarget.value.name,
      expirationDays: selectedExpiration.value,
      expirationUnit: selectedExpirationUnit.value
    }
    console.log('[handleShare] Request body:', requestBody)
    
    const result = await authFetch<{
      success: boolean
      share: {
        id: string
        url: string
        expiresAt: string | null
      }
    }>('/api/shares/create', {
      method: 'POST',
      body: requestBody
    })

    console.log('[handleShare] Response:', result)

    if (result?.share?.url) {
      shareResult.value = {
        url: result.share.url,
        expiresAt: result.share.expiresAt
      }
      console.log('[handleShare] Share created successfully:', shareResult.value)
    } else {
      console.error('[handleShare] Invalid response structure:', result)
      alert('Failed to create share link: Invalid response from server')
    }
  } catch (err: any) {
    console.error('[handleShare] Error:', err)
    const errorMessage = err.data?.message || err.data?.statusMessage || err.message || 'Unknown error'
    alert('Failed to create share link: ' + errorMessage)
  } finally {
    isSharing.value = false
  }
}

// Copy share link
const copyShareLink = async () => {
  if (!shareResult.value) return
  await navigator.clipboard.writeText(shareResult.value.url)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

// Format expiry date
const formatExpiry = (dateStr: string | null): string => {
  if (!dateStr) return 'Never'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Helpers
const formatBytes = (bytes: number): string => {
  if (!bytes || bytes === 0) return '-'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getFileIcon = (ext: string | null): string => {
  if (!ext) return 'lucide:file'
  const map: Record<string, string> = {
    png: 'lucide:image', jpg: 'lucide:image', jpeg: 'lucide:image', gif: 'lucide:image', webp: 'lucide:image',
    pdf: 'lucide:file-text',
    doc: 'lucide:file-text', docx: 'lucide:file-text',
    xls: 'lucide:file-spreadsheet', xlsx: 'lucide:file-spreadsheet',
    mp4: 'lucide:file-video', mkv: 'lucide:file-video', avi: 'lucide:file-video', mov: 'lucide:file-video',
    mp3: 'lucide:file-audio', wav: 'lucide:file-audio', flac: 'lucide:file-audio',
    zip: 'lucide:file-archive', rar: 'lucide:file-archive', '7z': 'lucide:file-archive'
  }
  return map[ext] || 'lucide:file'
}

const getIconColor = (ext: string | null): string => {
  const colorMap: Record<string, string> = {
    pdf: 'text-red-600',
    doc: 'text-blue-600',
    docx: 'text-blue-600',
    xls: 'text-green-600',
    xlsx: 'text-green-600',
    jpg: 'text-purple-600',
    jpeg: 'text-purple-600',
    png: 'text-purple-600',
    gif: 'text-purple-600',
    webp: 'text-purple-600',
    mp4: 'text-pink-600',
    mkv: 'text-pink-600',
    avi: 'text-pink-600',
    mov: 'text-pink-600',
    mp3: 'text-indigo-600',
    wav: 'text-indigo-600',
    flac: 'text-indigo-600',
    zip: 'text-amber-600',
    rar: 'text-amber-600',
    '7z': 'text-amber-600',
  }
  return colorMap[ext || ''] || 'text-gray-600'
}

const accountColors = ['#0061FE', '#0070E0', '#007EE5', '#248CF2', '#4D9BF7', '#76ABFC']
const getAccountColor = (accountId: string): string => {
  const index = accounts.value.findIndex(a => a.id === accountId)
  return accountColors[index % accountColors.length]
}

// Delete Modal State
const deleteTarget = ref<FileEntry | null>(null)
const isDeleting = ref(false)

// Confirm delete
const confirmDelete = (file: FileEntry) => {
  deleteTarget.value = file
}

// Handle delete
const handleDelete = async () => {
  if (!deleteTarget.value) return

  isDeleting.value = true
  try {
    await authFetch('/api/dropbox/delete', {
      method: 'POST',
      body: {
        path: deleteTarget.value.path,
        accountId: deleteTarget.value.accountId
      }
    })

    // Refresh file list
    await refresh()
    deleteTarget.value = null
  } catch (err: any) {
    console.error('Delete failed:', err)
    alert('Failed to delete file: ' + (err.data?.message || err.message || 'Unknown error'))
  } finally {
    isDeleting.value = false
  }
}

// Preview Modal State
const previewTarget = ref<FileEntry | null>(null)
const previewUrl = ref<string | null>(null)
const isLoadingPreview = ref(false)

// Open preview
const openPreview = async (file: FileEntry) => {
  previewTarget.value = file
  previewUrl.value = null
  isLoadingPreview.value = true

  try {
    const response = await authFetch<{ link: string }>(`/api/dropbox/download?path=${encodeURIComponent(file.path)}&accountId=${encodeURIComponent(file.accountId)}`)
    previewUrl.value = response.link
  } catch (err: any) {
    console.error('Failed to get preview URL:', err)
    alert('Failed to load preview: ' + (err.data?.message || err.message || 'Unknown error'))
    previewTarget.value = null
  } finally {
    isLoadingPreview.value = false
  }
}

// Close preview
const closePreview = () => {
  previewTarget.value = null
  previewUrl.value = null
}

// Check if file is image
const isImageFile = (ext: string | null): boolean => {
  if (!ext) return false
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext.toLowerCase())
}

// Check if file is video
const isVideoFile = (ext: string | null): boolean => {
  if (!ext) return false
  return ['mp4', 'mkv', 'avi', 'mov', 'webm', 'wmv', 'flv'].includes(ext.toLowerCase())
}

// Check if file is audio
const isAudioFile = (ext: string | null): boolean => {
  if (!ext) return false
  return ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma'].includes(ext.toLowerCase())
}

// Bulk delete handler
const handleBulkDelete = async () => {
  if (selectedIds.value.size === 0) return
  
  isBulkDeleting.value = true
  const idsToDelete = Array.from(selectedIds.value)
  let successCount = 0
  
  for (const id of idsToDelete) {
    const file = files.value.find(f => f.id === id)
    if (file) {
      try {
        await authFetch('/api/dropbox/delete', {
          method: 'POST',
          body: { path: file.path, accountId: file.accountId }
        })
        successCount++
      } catch (err) {
        console.error(`Failed to delete ${file.name}:`, err)
      }
    }
  }
  
  // Clear selection and close modal
  selectedIds.value = new Set()
  showBulkDeleteModal.value = false
  isBulkDeleting.value = false
  
  if (successCount > 0) {
    // Refresh file list
    await refresh()
  }
}

// Bulk download handler
const handleBulkDownload = async () => {
  if (selectedIds.value.size === 0) return
  
  isBulkDownloading.value = true
  
  try {
    // Get selected file objects
    const filesToDownload = files.value.filter(f => selectedIds.value.has(f.id))
    
    if (filesToDownload.length === 1) {
      // Single file - direct download
      const file = filesToDownload[0]
      const response = await authFetch<{ link: string }>(`/api/dropbox/download?path=${encodeURIComponent(file.path)}&accountId=${encodeURIComponent(file.accountId)}`)
      window.open(response.link, '_blank')
    } else {
      // Multiple files - download each
      for (const file of filesToDownload) {
        try {
          const response = await authFetch<{ link: string }>(`/api/dropbox/download?path=${encodeURIComponent(file.path)}&accountId=${encodeURIComponent(file.accountId)}`)
          // Create download link
          const link = document.createElement('a')
          link.href = response.link
          link.download = file.name
          link.target = '_blank'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          // Small delay between downloads
          await new Promise(r => setTimeout(r, 300))
        } catch (err) {
          console.error(`Failed to download ${file.name}:`, err)
        }
      }
    }
    
    // Clear selection
    selectedIds.value = new Set()
    
  } catch (err: any) {
    console.error('Bulk download error:', err)
    alert('Failed to download files: ' + (err.message || 'Unknown error'))
  } finally {
    isBulkDownloading.value = false
  }
}
</script>
