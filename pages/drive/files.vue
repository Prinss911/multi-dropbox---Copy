<template>
  <div 
    class="h-full flex flex-col bg-background/50"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="handleDrop"
  >
    <!-- Hidden File Input -->
    <input 
      ref="fileInput"
      type="file" 
      multiple 
      class="hidden" 
      @change="handleFileSelect"
    />
    
    <!-- Drop Overlay -->
    <div 
      v-if="isDragging"
      class="fixed inset-0 z-50 bg-blue-500/10 backdrop-blur-sm flex items-center justify-center pointer-events-none"
    >
      <div class="bg-white dark:bg-card rounded-2xl p-12 shadow-2xl border-2 border-dashed border-blue-500 text-center">
        <Icon name="lucide:upload-cloud" class="h-16 w-16 mx-auto mb-4 text-blue-500" />
        <p class="text-xl font-semibold text-foreground">Drop files to upload</p>
        <p class="text-sm text-muted-foreground mt-2">Files will be uploaded to your storage</p>
      </div>
    </div>

    <!-- Top Stats & Controls Bar (Clean & Integrated) -->
    <div class="sticky top-0 z-20 bg-background/95 backdrop-blur border-b px-6 py-4">
      <div class="w-full">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <!-- Stats Summary (Minimalist) -->
          <div class="flex items-center gap-6 text-sm">
            <div class="flex flex-col">
              <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Storage</span>
              <span class="font-medium text-foreground">{{ totalSizeFormatted }} Used</span>
            </div>
            <div class="w-px h-8 bg-border hidden md:block"></div>
            <div class="flex flex-col">
               <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Files</span>
               <span class="font-medium text-foreground">{{ files.length }} Items</span>
            </div>
            <div class="w-px h-8 bg-border hidden md:block"></div>
             <div class="flex flex-col">
               <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Shared</span>
               <span class="font-medium text-foreground">{{ activeSharesCount }} Active</span>
            </div>
          </div>

          <!-- Actions Toolbar -->
          <div class="flex items-center gap-3">
             <div class="relative group">
                <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search files..."
                  class="h-10 pl-9 pr-4 w-full md:w-64 rounded-full border bg-muted/20 hover:bg-muted/40 focus:bg-background focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
             </div>

             <div class="h-6 w-px bg-border mx-1"></div>

             <button 
                class="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                @click="viewMode = viewMode === 'list' ? 'grid' : 'list'"
                :title="viewMode === 'list' ? 'Switch to Grid' : 'Switch to List'"
             >
                <Icon :name="viewMode === 'list' ? 'lucide:layout-grid' : 'lucide:align-justify'" class="h-5 w-5" />
             </button>

             <button 
               @click="triggerFileInput"
               class="h-10 px-5 rounded-full bg-[#0061FE] hover:bg-[#0057E5] text-white font-medium text-sm shadow-sm transition-all hover:shadow-md flex items-center gap-2 active:scale-95"
             >
               <Icon name="lucide:upload" class="h-4 w-4" />
               <span>Upload</span>
             </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 overflow-auto px-4 md:px-6 py-6 transition-all">
       <div class="w-full h-full">

        <!-- Loading -->
        <div v-if="pending" class="h-full flex flex-col items-center justify-center text-muted-foreground">
          <Icon name="lucide:loader-2" class="animate-spin h-8 w-8 text-[#0061FE] mb-4" />
          <p class="text-sm">Loading your content...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="p-6 rounded-lg bg-red-50 text-red-600 border border-red-100 text-center mx-auto max-w-lg mt-10">
           <Icon name="lucide:alert-circle" class="h-8 w-8 mb-2 mx-auto" />
           <h3 class="font-medium">Failed to load files</h3>
           <p class="text-sm opacity-80 mt-1">{{ error.message }}</p>
        </div>

        <!-- Empty State with Dropzone -->
        <div 
          v-else-if="sortedFiles.length === 0" 
          class="h-full flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in-95 duration-500 cursor-pointer"
          @click="triggerFileInput"
        >
          <div class="h-32 w-32 mb-6 opacity-30">
             <!-- Abstract Empty Illustration -->
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="w-full h-full text-blue-300">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                <polyline points="13 2 13 9 20 9"></polyline>
             </svg>
          </div>
          <h3 class="text-xl font-semibold text-[#1E1919] dark:text-foreground mb-2">{{ searchQuery ? 'No results found' : 'Your folder is empty' }}</h3>
          <p class="text-muted-foreground max-w-xs mb-8">
            {{ searchQuery ? 'Try adjusting your search terms.' : 'Drag and drop files here to upload, or click to browse.' }}
          </p>
          <button 
            v-if="!searchQuery" 
            class="h-11 px-8 rounded-full bg-blue-50 text-[#0061FE] hover:bg-blue-100 font-medium transition-colors"
          >
            Choose Files
          </button>
        </div>

        <!-- List View (Dropbox Style) -->
        <div v-else-if="viewMode === 'list'" class="w-full">
           <table class="w-full text-left border-collapse">
              <thead class="sticky top-0 bg-background/95 backdrop-blur z-10">
                 <tr>
                    <th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-1/2 cursor-pointer hover:text-foreground group" @click="sortBy = 'name'">
                      Name
                      <Icon v-if="sortBy === 'name'" name="lucide:chevron-down" class="inline h-3 w-3 ml-1" />
                    </th>
                    <th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-32 hidden md:table-cell hover:bg-muted/50 cursor-pointer" @click="sortBy = 'size'">
                       Size
                       <Icon v-if="sortBy === 'size'" name="lucide:chevron-down" class="inline h-3 w-3 ml-1" />
                    </th>
                    <th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-40 hidden lg:table-cell hover:bg-muted/50 cursor-pointer" @click="sortBy = 'modified'">
                       Modified
                       <Icon v-if="sortBy === 'modified'" name="lucide:chevron-down" class="inline h-3 w-3 ml-1" />
                    </th>
                    <th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-32 hidden lg:table-cell">Members</th>
                    <th class="py-3 px-6 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-24">Running Actions</th>
                 </tr>
              </thead>
              <tbody class="divide-y divide-border/40">
                 <tr 
                    v-for="file in paginatedFiles" 
                    :key="file.id" 
                    class="group hover:bg-[#F7F9FA] dark:hover:bg-muted/20 transition-colors"
                 >
                    <td class="py-3 px-4">
                       <div class="flex items-center gap-4">
                          <!-- Minimalist Icon -->
                          <div class="relative shrink-0">
                             <Icon :name="getFileIcon(file.extension)" :class="['h-8 w-8', getIconColor(file.extension)]" />
                             <!-- Verified/Shared Badge -->
                             <span v-if="file.shareUrl" class="absolute -bottom-1 -right-1 block h-3 w-3 rounded-full bg-green-500 border-2 border-background ring-1 ring-green-100"></span>
                          </div>
                          <div class="min-w-0 pr-4">
                             <p 
                                @click="openPreview(file)"
                                class="font-medium text-sm text-[#1E1919] dark:text-foreground truncate cursor-pointer hover:text-[#0061FE] transition-colors" 
                                :title="file.name"
                             >
                                {{ file.name }}
                             </p>
                             <div class="flex items-center gap-2 mt-0.5 md:hidden">
                                <span class="text-xs text-muted-foreground">{{ formatBytes(file.size) }}</span>
                                <span class="text-xs text-muted-foreground">•</span>
                                <span class="text-xs text-muted-foreground">{{ formatDate(file.modified) }}</span>
                             </div>
                          </div>
                       </div>
                    </td>
                    <td class="py-3 px-4 text-sm text-[#52555A] hidden md:table-cell font-mono text-xs">
                       {{ formatBytes(file.size) }}
                    </td>
                    <td class="py-3 px-4 text-sm text-[#52555A] hidden lg:table-cell">
                       {{ formatDate(file.modified) }}
                    </td>
                    <td class="py-3 px-4 text-sm hidden lg:table-cell">
                       <div v-if="file.shareUrl" class="flex items-center gap-1.5 text-xs text-green-600 font-medium px-2 py-1 bg-green-50 rounded-full w-fit">
                          <Icon name="lucide:globe" class="h-3 w-3" />
                          <span>Link active</span>
                       </div>
                       <div v-else class="text-xs text-muted-foreground italic">Only you</div>
                    </td>
                    <td class="py-3 px-4 text-right">
                       <!-- Actions only show on hover (desktop) -->
                       <div class="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                             v-if="file.shareUrl"
                             @click="copyExistingLink(file)"
                             :title="copiedFileId === file.id ? 'Copied' : 'Copy link'"
                             class="h-8 w-8 flex items-center justify-center rounded hover:bg-white hover:text-green-600 hover:shadow-sm transition-all"
                             :class="copiedFileId === file.id ? 'text-green-600 bg-green-50' : 'text-muted-foreground'"
                          >
                             <Icon :name="copiedFileId === file.id ? 'lucide:check' : 'lucide:link'" class="h-4 w-4" />
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
                             @click="handleDownload(file)"
                             title="Download"
                             class="h-8 w-8 flex items-center justify-center rounded hover:bg-white hover:text-[#0061FE] hover:shadow-sm transition-all text-muted-foreground"
                          >
                             <Icon name="lucide:download" class="h-4 w-4" />
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

        <!-- Grid View -->
        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
           <!-- Card Items -->
           <div 
              v-for="file in paginatedFiles" 
              :key="file.id"
              class="group relative bg-card hover:bg-muted/30 border border-transparent hover:border-border/50 rounded-[10px] p-4 flex flex-col items-center text-center transition-all duration-200 cursor-pointer"
           >
              <!-- Absolute Checkbox/Selection (Visually) -->
              <div class="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div class="h-5 w-5 rounded border border-input bg-background flex items-center justify-center cursor-pointer">
                    <!-- Placeholder selection logic -->
                 </div>
              </div>

               <!-- Absolute Actions (Top Right) -->
              <div class="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                 <button v-if="file.shareUrl" @click.stop="copyExistingLink(file)" class="h-7 w-7 rounded bg-background shadow-sm border flex items-center justify-center hover:bg-green-50 text-green-600">
                    <Icon name="lucide:link" class="h-3.5 w-3.5" />
                 </button>
                  <button @click.stop="openShareModal(file)" class="h-7 w-7 rounded bg-background shadow-sm border flex items-center justify-center hover:bg-blue-50 text-blue-600">
                    <Icon name="lucide:share-2" class="h-3.5 w-3.5" />
                 </button>
                  <button @click.stop="confirmDelete(file)" class="h-7 w-7 rounded bg-background shadow-sm border flex items-center justify-center hover:bg-red-50 text-red-600">
                    <Icon name="lucide:trash-2" class="h-3.5 w-3.5" />
                 </button>
              </div>

              <!-- Icon Preview (Clickable for preview) -->
              <div 
                 @click="openPreview(file)"
                 class="h-24 w-full flex items-center justify-center mb-3 cursor-pointer hover:scale-105 transition-transform"
              >
                 <Icon :name="getFileIcon(file.extension)" :class="['h-16 w-16 drop-shadow-sm', getIconColor(file.extension)]" />
                 <span v-if="isVideoFile(file.extension)" class="absolute bottom-16 right-4 text-[10px] font-bold bg-black/70 text-white px-1.5 py-0.5 rounded">
                    {{ file.duration || 'VIDEO' }}
                 </span>
              </div>
              
              <!-- File Name -->
              <h4 
                 @click="openPreview(file)"
                 class="font-medium text-sm text-[#1E1919] dark:text-foreground w-full truncate px-1 cursor-pointer hover:text-[#0061FE] transition-colors" 
                 :title="file.name"
              >
                 {{ file.name }}
              </h4>
              
              <!-- Meta -->
              <div class="text-xs text-[#52555A] mt-1 space-x-1">
                 <span>{{ file.extension?.toUpperCase() }}</span>
                 <span>•</span>
                 <span>{{ formatBytes(file.size) }}</span>
              </div>
           </div>
        </div>

        <!-- Pagination (Simple & Centered) -->
        <div v-if="totalPages > 1" class="flex justify-center mt-8 pb-8">
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

    <!-- Share Modal (Clean & Consistent) -->
    <Teleport to="body">
      <div 
        v-if="shareTarget" 
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1E1919]/60 backdrop-blur-[2px]"
        @click.self="closeShareModal"
      >
        <div class="bg-card w-full max-w-[480px] rounded-xl shadow-2xl border-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <!-- Modal Header -->
          <div class="px-6 py-5 border-b bg-background flex items-center justify-between">
             <h3 class="font-semibold text-lg text-[#1E1919] dark:text-foreground">Share details</h3>
             <button @click="closeShareModal" class="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors">
                <Icon name="lucide:x" class="h-5 w-5" />
             </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6">
            <!-- File Info Preview -->
            <div class="flex items-center gap-4 mb-6">
               <div class="h-10 w-10 flex items-center justify-center">
                  <Icon :name="getFileIcon(shareTarget.extension)" class="h-10 w-10" :class="getIconColor(shareTarget.extension)" />
               </div>
               <div class="min-w-0">
                  <h4 class="font-medium text-sm truncate">{{ shareTarget.name }}</h4>
                  <div class="flex text-xs text-muted-foreground gap-2">
                     <span>{{ formatBytes(shareTarget.size) }}</span>
                     <span>•</span>
                     <span>Last modified {{ formatDate(shareTarget.modified) }}</span>
                  </div>
               </div>
            </div>

            <!-- Share Result State -->
            <div v-if="shareResult" class="space-y-5">
               <div class="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg flex gap-3 border border-green-100 dark:border-green-800/30">
                  <div class="mt-0.5">
                     <Icon name="lucide:check-circle-2" class="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                     <p class="text-sm font-medium text-green-800 dark:text-green-300">Link created</p>
                     <p class="text-xs text-green-600 dark:text-green-400 mt-0.5">Anyone with this link can view this file.</p>
                  </div>
               </div>
               
               <div class="space-y-2">
                  <label class="text-xs font-bold uppercase text-muted-foreground tracking-wider">Link to file</label>
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

               <div class="flex items-center justify-between pt-2">
                  <span class="text-xs text-muted-foreground">Expires: <span class="font-medium text-foreground">{{ formatExpiry(shareResult.expiresAt) }}</span></span>
                  <button @click="closeShareModal" class="text-sm text-muted-foreground hover:text-foreground hover:underline">Done</button>
               </div>
            </div>

            <!-- Create Share State -->
            <div v-else class="space-y-6">
              <div>
                 <label class="text-sm font-medium text-foreground mb-3 block">Link settings</label>
                 <div class="space-y-3">
                     <div class="flex items-center justify-between p-3 rounded-lg border hover:border-[#0061FE] cursor-pointer bg-card transition-colors">
                        <div class="flex items-center gap-3">
                           <div class="p-2 bg-blue-50 rounded-full text-blue-600">
                              <Icon name="lucide:clock" class="h-4 w-4" />
                           </div>
                           <div class="text-sm">
                              <p class="font-medium">Expiration</p>
                              <p class="text-xs text-muted-foreground">When should this link expire?</p>
                           </div>
                        </div>
                        <select 
                           v-model="selectedExpiration" 
                           class="bg-transparent text-sm font-medium text-right border-none focus:ring-0 cursor-pointer text-[#0061FE] outline-none"
                        >
                           <option v-for="opt in expirationOptions" :key="opt.label" :value="opt.days">
                              {{ opt.label }}
                           </option>
                        </select>
                     </div>
                 </div>
              </div>

               <button 
                  @click="handleShare"
                  :disabled="isSharing"
                  class="w-full h-12 rounded-lg bg-[#0061FE] hover:bg-[#0057E5] text-white font-semibold text-base shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
               >
                  <Icon v-if="isSharing" name="lucide:loader-2" class="h-5 w-5 animate-spin" />
                  <span v-else>Create Link</span>
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
                  <p class="text-xs text-muted-foreground">{{ formatBytes(deleteTarget.size) }}</p>
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
            <p class="text-white/60 text-sm">{{ formatBytes(previewTarget.size) }}</p>
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

          <!-- PDF/Document Preview (Unsupported for direct embed) -->
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
    
    <!-- Upload Progress Modal -->
    <Teleport to="body">
      <div 
        v-if="isUploading" 
        class="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-[#1E1919]/60 backdrop-blur-[2px]"
      >
        <div class="bg-card w-full max-w-md rounded-xl shadow-2xl border-0 overflow-hidden p-6">
           <div class="flex items-center gap-4 mb-6">
              <div class="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                 <Icon name="lucide:upload-cloud" class="h-6 w-6" />
              </div>
              <div class="min-w-0 flex-1">
                 <h3 class="text-lg font-semibold text-foreground">Uploading Files</h3>
                 <p class="text-sm text-muted-foreground truncate">{{ uploadingFileName || 'Preparing...' }}</p>
              </div>
           </div>
           
           <!-- Progress Bar -->
           <div class="mb-4">
              <div class="h-2 bg-muted rounded-full overflow-hidden">
                 <div 
                    class="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                    :style="{ width: `${uploadProgress}%` }"
                 ></div>
              </div>
              <div class="flex justify-between mt-2 text-xs text-muted-foreground">
                 <span>{{ uploadedCount }} of {{ totalUploadCount }} files</span>
                 <span>{{ uploadProgress.toFixed(0) }}%</span>
              </div>
           </div>
           
           <p v-if="uploadError" class="text-sm text-red-500 mt-2">{{ uploadError }}</p>
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
  shareId: string | null
  shareUrl: string | null
  duration?: string | null
}

// Get Supabase client for access token
const supabase = useSupabaseClient()

// Filters
const searchQuery = ref('')
const sortBy = ref('modified')
const viewMode = ref<'list' | 'grid'>('list')
const currentPage = ref(1)
const pageSize = 50

// Upload state
const isDragging = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadingFileName = ref('')
const uploadedCount = ref(0)
const totalUploadCount = ref(0)
const uploadError = ref('')

// File input ref
const fileInput = ref<HTMLInputElement | null>(null)

// Wake lock to prevent browser from throttling when minimized
let wakeLock: WakeLockSentinel | null = null

// Request wake lock to keep upload active
const requestWakeLock = async () => {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await (navigator as any).wakeLock.request('screen')
      console.log('Wake lock acquired for upload')
    }
  } catch (err) {
    console.warn('Wake lock not available:', err)
  }
}

// Release wake lock
const releaseWakeLock = () => {
  if (wakeLock) {
    wakeLock.release()
    wakeLock = null
    console.log('Wake lock released')
  }
}

// Prevent page unload during upload
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (isUploading.value) {
    e.preventDefault()
    e.returnValue = 'Upload in progress. Are you sure you want to leave?'
    return e.returnValue
  }
}

// Handle visibility change - re-acquire wake lock if needed
const handleVisibilityChange = async () => {
  if (document.visibilityState === 'visible' && isUploading.value && !wakeLock) {
    await requestWakeLock()
  }
}

// Network status tracking
const isOnline = ref(navigator.onLine)

const handleOnline = () => {
  isOnline.value = true
  console.log('Network is back online')
}

const handleOffline = () => {
  isOnline.value = false
  console.log('Network went offline')
}

// Wait for network to be online (with timeout)
const waitForOnline = (timeoutMs: number = 30000): Promise<boolean> => {
  return new Promise((resolve) => {
    if (navigator.onLine) {
      resolve(true)
      return
    }
    
    const timeout = setTimeout(() => {
      window.removeEventListener('online', onOnline)
      resolve(false)
    }, timeoutMs)
    
    const onOnline = () => {
      clearTimeout(timeout)
      window.removeEventListener('online', onOnline)
      resolve(true)
    }
    
    window.addEventListener('online', onOnline)
  })
}

// Setup and cleanup event listeners
onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
  releaseWakeLock()
})

// Handle file drop
const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const droppedFiles = e.dataTransfer?.files
  if (droppedFiles && droppedFiles.length > 0) {
    processUpload(Array.from(droppedFiles))
  }
}

// Handle file select from input
const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    processUpload(Array.from(target.files))
    target.value = '' // Reset input
  }
}

// Trigger file input click
const triggerFileInput = () => {
  fileInput.value?.click()
}

// Upload configuration
const CHUNK_SIZE = 8 * 1024 * 1024 // 8MB chunks for large files
const LARGE_FILE_THRESHOLD = 150 * 1024 * 1024 // 150MB
const MAX_RETRIES = 3

// Retry wrapper with exponential backoff
// Retry wrapper with exponential backoff and network aware
const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Check online status before attempt
      if (!isOnline.value) {
        console.log('Network offline, waiting for connection...')
        const backOnline = await waitForOnline()
        if (!backOnline) throw new Error('Network offline timeout')
        console.log('Network online, resuming...')
      }
      
      return await fn()
    } catch (err: any) {
      lastError = err
      console.warn(`Attempt ${attempt + 1}/${maxRetries} failed:`, err.message)
      
      // If network went offline during request, wait for it to come back
      if (!navigator.onLine) {
        console.log('Network connection lost, waiting for recovery...')
        await waitForOnline()
      }
      
      if (attempt < maxRetries - 1) {
        await new Promise(r => setTimeout(r, delayMs * Math.pow(2, attempt)))
      }
    }
  }
  throw lastError
}

// Simple upload for small files (< 150MB)
const uploadSmallFile = async (
  file: File,
  accessToken: string,
  uploadPath: string,
  onProgress: (percent: number) => void
): Promise<{ path_display: string }> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', 'https://content.dropboxapi.com/2/files/upload')
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`)
    xhr.setRequestHeader('Dropbox-API-Arg', JSON.stringify({
      path: uploadPath,
      mode: 'add',
      autorename: true,
      mute: false
    }))
    xhr.setRequestHeader('Content-Type', 'application/octet-stream')
    
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress((e.loaded / e.total) * 100)
      }
    }
    
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText))
        } catch {
          resolve({ path_display: uploadPath })
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`))
      }
    }
    
    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.ontimeout = () => reject(new Error('Upload timed out'))
    xhr.timeout = 300000 // 5 minute timeout
    xhr.send(file)
  })
}

// Chunked upload for large files (> 150MB)
const uploadLargeFile = async (
  file: File,
  accessToken: string,
  uploadPath: string,
  onProgress: (percent: number) => void
): Promise<{ path_display: string }> => {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
  let sessionId = ''
  let offset = 0
  
  // Start upload session
  const startChunk = file.slice(0, Math.min(CHUNK_SIZE, file.size))
  const startResponse = await fetch('https://content.dropboxapi.com/2/files/upload_session/start', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Dropbox-API-Arg': JSON.stringify({ close: false }),
      'Content-Type': 'application/octet-stream'
    },
    body: startChunk
  })
  
  if (!startResponse.ok) {
    throw new Error(`Failed to start upload session: ${startResponse.status}`)
  }
  
  const startData = await startResponse.json()
  sessionId = startData.session_id
  offset = startChunk.size
  onProgress((offset / file.size) * 100)
  
  // Append chunks
  while (offset < file.size - CHUNK_SIZE) {
    const chunk = file.slice(offset, offset + CHUNK_SIZE)
    
    const appendResponse = await fetch('https://content.dropboxapi.com/2/files/upload_session/append_v2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Dropbox-API-Arg': JSON.stringify({
          cursor: { session_id: sessionId, offset },
          close: false
        }),
        'Content-Type': 'application/octet-stream'
      },
      body: chunk
    })
    
    if (!appendResponse.ok) {
      throw new Error(`Failed to append chunk: ${appendResponse.status}`)
    }
    
    offset += chunk.size
    onProgress((offset / file.size) * 100)
  }
  
  // Finish upload session
  const finalChunk = file.slice(offset)
  const finishResponse = await fetch('https://content.dropboxapi.com/2/files/upload_session/finish', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Dropbox-API-Arg': JSON.stringify({
        cursor: { session_id: sessionId, offset },
        commit: {
          path: uploadPath,
          mode: 'add',
          autorename: true,
          mute: false
        }
      }),
      'Content-Type': 'application/octet-stream'
    },
    body: finalChunk
  })
  
  if (!finishResponse.ok) {
    throw new Error(`Failed to finish upload: ${finishResponse.status}`)
  }
  
  const result = await finishResponse.json()
  onProgress(100)
  return result
}

// Process upload (no limits for authenticated users)
const processUpload = async (filesToUpload: File[]) => {
  if (filesToUpload.length === 0) return
  
  // Acquire wake lock to prevent browser throttling
  await requestWakeLock()
  
  isUploading.value = true
  uploadProgress.value = 0
  uploadedCount.value = 0
  totalUploadCount.value = filesToUpload.length
  uploadError.value = ''
  
  const failedFiles: string[] = []
  
  try {
    // Get allocation for files
    const { data: { session } } = await supabase.auth.getSession()
    const headers: Record<string, string> = {}
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }
    
    const allocation = await withRetry(() => $fetch<{
      success: boolean
      allocations: { index: number; accountId: string; accountName: string; accessToken: string }[]
    }>('/api/upload/allocate', {
      method: 'POST',
      headers,
      body: {
        files: filesToUpload.map((f, i) => ({ index: i, name: f.name, size: f.size }))
      }
    }))
    
    if (!allocation.success || allocation.allocations.length === 0) {
      throw new Error('Failed to allocate storage for upload')
    }
    
    // Concurrency control
    const CONCURRENCY_LIMIT = 5
    const queue = allocation.allocations.map(alloc => ({
      file: filesToUpload[alloc.index],
      alloc
    })).filter(item => item.alloc != undefined)
    
    // Track overall progress with throttling
    const fileProgressMap = new Map<number, number>()
    let lastUpdate = 0
    let updateFrame: number | null = null
    
    const updateOverallProgress = (index: number, percent: number) => {
      fileProgressMap.set(index, percent)
      
      const now = Date.now()
      if (now - lastUpdate > 100) { // Limit updates to every 100ms
        lastUpdate = now
        if (updateFrame) cancelAnimationFrame(updateFrame)
        
        updateFrame = requestAnimationFrame(() => {
          const totalPercent = Array.from(fileProgressMap.values()).reduce((a, b) => a + b, 0)
          uploadProgress.value = (totalPercent / filesToUpload.length)
        })
      }
    }

    // Process single file
    const processSingleFile = async (item: { file: File, alloc: any }) => {
      const { file, alloc } = item
      const index = filesToUpload.indexOf(file)
      
      try {
        uploadingFileName.value = file.name // Note: This will change rapidly in parallel mode
        const uploadPath = `/uploads/${sanitizeFilename(file.name)}`
        
        // Choose upload method
        const uploadFn = file.size > LARGE_FILE_THRESHOLD ? uploadLargeFile : uploadSmallFile
        
        // Upload with retry
        const dropboxResult = await withRetry(() => 
          uploadFn(file, alloc.accessToken, uploadPath, (percent) => {
            updateOverallProgress(index, percent)
          })
        )
        
        // Record to DB
        try {
          await withRetry(() => $fetch('/api/dropbox/record-upload', {
            method: 'POST',
            headers,
            body: {
              filename: file.name,
              dropboxPath: dropboxResult.path_display || uploadPath,
              size: file.size,
              contentType: file.type || 'application/octet-stream',
              dropboxAccountId: alloc.accountId
            }
          }))
        } catch (recordErr) {
          console.error('Failed to record upload:', recordErr)
        }
        
        uploadedCount.value++
      } catch (err: any) {
        console.error(`Failed to upload ${file.name}:`, err)
        failedFiles.push(file.name)
      }
    }

    // Run with concurrency limit
    const activePromises: Promise<void>[] = []
    
    for (const item of queue) {
      const p = processSingleFile(item).then(() => {
        activePromises.splice(activePromises.indexOf(p), 1)
      })
      activePromises.push(p)
      
      if (activePromises.length >= CONCURRENCY_LIMIT) {
        await Promise.race(activePromises)
      }
    }
    
    // Wait for remaining
    await Promise.all(activePromises)
    
    // Show partial success message if some files failed
    if (failedFiles.length > 0) {
      uploadError.value = `${failedFiles.length} file(s) failed: ${failedFiles.slice(0, 3).join(', ')}${failedFiles.length > 3 ? '...' : ''}`
    }
    
    // Refresh file list
    await refresh()
    
  } catch (err: any) {
    console.error('Upload error:', err)
    uploadError.value = err.message || 'Upload failed'
  } finally {
    isUploading.value = false
    // Release wake lock
    releaseWakeLock()
  }
}

// Sanitize filename
const sanitizeFilename = (name: string): string => {
  return name.replace(/[<>:"/\\|?*]/g, '_')
}

// Fetch user's files with auth header
const { data, pending, error, refresh } = await useFetch<FileEntry[]>('/api/my-files', {
  server: false,
  async onRequest({ options }) {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      const existingHeaders = (options.headers || {}) as any
      options.headers = {
        ...existingHeaders,
        Authorization: `Bearer ${session.access_token}`
      } as any
    }
  }
})

const files = computed(() => data.value || [])

// Stats computed
const totalSizeFormatted = computed(() => {
  const total = files.value.reduce((acc, file) => acc + file.size, 0)
  return formatBytes(total)
})

const activeSharesCount = computed(() => {
  return files.value.filter(f => f.shareUrl).length
})

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
watch([searchQuery, sortBy], () => {
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
    const { data: { session } } = await supabase.auth.getSession()
    const { link } = await $fetch<{ link: string }>('/api/dropbox/download', {
      query: { path: file.path, accountId: file.accountId },
      headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
    })
    window.open(link, '_blank')
  } catch (err: any) {
    alert('Download failed: ' + err.message)
  }
}

// Check if file is a video
const isVideoFile = (ext: string | null): boolean => {
  if (!ext) return false
  return ['mp4', 'mkv', 'avi', 'mov', 'webm', 'wmv', 'flv'].includes(ext.toLowerCase())
}

// Copy existing share link
const copiedFileId = ref<string | null>(null)
const copyExistingLink = async (file: FileEntry) => {
  if (!file.shareUrl) return
  const fullUrl = `${window.location.origin}${file.shareUrl}`
  await navigator.clipboard.writeText(fullUrl)
  copiedFileId.value = file.id
  setTimeout(() => copiedFileId.value = null, 2000)
}

// Share Modal State
const shareTarget = ref<FileEntry | null>(null)
const shareResult = ref<{ url: string; expiresAt: string | null } | null>(null)
const isSharing = ref(false)
const copied = ref(false)

// Expiration options
const expirationOptions = [
  { days: 1, label: '1 Day' },
  { days: 3, label: '3 Days' },
  { days: 7, label: '7 Days' },
  { days: 30, label: '1 Month' },
  { days: 90, label: '3 Months' },
  { days: 'never', label: 'Never' }
]
const selectedExpiration = ref<number | string>(7)

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
  if (!shareTarget.value) return

  isSharing.value = true
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const result = await $fetch<{
      success: boolean
      share: {
        id: string
        url: string
        expiresAt: string | null
      }
    }>('/api/shares/create', {
      method: 'POST',
      body: {
        accountId: shareTarget.value.accountId,
        filePath: shareTarget.value.path,
        fileName: shareTarget.value.name,
        expirationDays: selectedExpiration.value === 'never' ? null : selectedExpiration.value,
        expirationUnit: 'days'
      },
      headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
    })

    shareResult.value = {
      url: result.share.url,
      expiresAt: result.share.expiresAt
    }
  } catch (err: any) {
    console.error('Share failed:', err)
    alert('Failed to create share link: ' + (err.message || 'Unknown error'))
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
    pdf: 'text-red-600 bg-red-50 dark:bg-red-900/30',
    doc: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30',
    docx: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30',
    xls: 'text-green-600 bg-green-50 dark:bg-green-900/30',
    xlsx: 'text-green-600 bg-green-50 dark:bg-green-900/30',
    jpg: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
    jpeg: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
    png: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
    gif: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
    webp: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
    mp4: 'text-pink-600 bg-pink-50 dark:bg-pink-900/30',
    mkv: 'text-pink-600 bg-pink-50 dark:bg-pink-900/30',
    avi: 'text-pink-600 bg-pink-50 dark:bg-pink-900/30',
    mov: 'text-pink-600 bg-pink-50 dark:bg-pink-900/30',
    mp3: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30',
    wav: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30',
    flac: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30',
    zip: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30',
    rar: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30',
    '7z': 'text-amber-600 bg-amber-50 dark:bg-amber-900/30',
  }
  return colorMap[ext || ''] || 'text-gray-600 bg-gray-50 dark:bg-gray-900/30'
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
    const { data: { session } } = await supabase.auth.getSession()
    await $fetch('/api/dropbox/delete', {
      method: 'POST',
      body: {
        path: deleteTarget.value.path,
        accountId: deleteTarget.value.accountId
      },
      headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
    })

    // Remove from local list
    data.value = data.value?.filter(f => f.id !== deleteTarget.value?.id) || null
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
    const { data: { session } } = await supabase.auth.getSession()
    const response = await $fetch<{ link: string }>('/api/dropbox/download', {
      query: { 
        path: file.path, 
        accountId: file.accountId 
      },
      headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
    })
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

// Check if file is audio
const isAudioFile = (ext: string | null): boolean => {
  if (!ext) return false
  return ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma'].includes(ext.toLowerCase())
}
</script>
