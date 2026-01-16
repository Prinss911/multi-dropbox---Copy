<template>
  <div 
    class="h-full flex flex-col bg-background/50"
    @dragover.prevent="handleExternalDragOver"
    @dragleave.prevent="handleExternalDragLeave"
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
      v-if="isDragging && !draggedFile"
      class="fixed inset-0 z-50 bg-blue-500/10 backdrop-blur-sm flex items-center justify-center pointer-events-none"
    >
      <div class="bg-white dark:bg-card rounded-2xl p-12 shadow-2xl border-2 border-dashed border-blue-500 text-center">
        <Icon name="lucide:upload-cloud" class="h-16 w-16 mx-auto mb-4 text-blue-500" />
        <p class="text-xl font-semibold text-foreground">Drop files to upload</p>
        <p class="text-sm text-muted-foreground mt-2">Files will be uploaded to your storage</p>
      </div>
    </div>

    <!-- Top Stats & Controls Bar (Clean & Integrated) -->
    <div class="sticky top-0 z-20 bg-background/95 backdrop-blur border-b px-6 py-4 flex flex-col gap-4">
      <div class="w-full">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <!-- Stats Summary (Minimalist) -->
          <FileStats 
            :total-size-formatted="totalSizeFormatted"
            :files-count="files.length"
            :active-shares-count="activeSharesCount"
          />

          <!-- Actions Toolbar -->
          <FileToolbar 
            :search-query="searchQuery"
            @update:searchQuery="searchQuery = $event"
            :view-mode="viewMode"
            @toggle-view="viewMode = viewMode === 'list' ? 'grid' : 'list'"
            @create-folder="createFolderModalOpen = true"
            @upload="triggerFileInput"
          />
        </div>
      </div>

      <!-- Breadcrumbs -->
      <Breadcrumbs 
        :breadcrumbs="breadcrumbs"
        :is-dragging-internal="!!draggedFile"
        @navigate="handleBreadcrumbClick"
        @drop="handleBreadcrumbDrop"
      />
    </div>

    <!-- Main Content Area -->
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
            v-if="selectedCount > 0" 
            class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:gap-3 px-4 py-2.5 sm:px-5 sm:py-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-full shadow-2xl border border-gray-200/50 dark:border-gray-700/50 max-w-[95vw] overflow-hidden"
          >
            <!-- Selection Count -->
            <div class="flex items-center gap-2 text-gray-900 dark:text-gray-100 shrink-0">
              <div class="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-blue-600 flex items-center justify-center text-xs sm:text-sm font-bold text-white shadow-sm">
                {{ selectedCount }}
              </div>
              <span class="text-xs sm:text-sm font-medium hidden xs:inline">selected</span>
            </div>

            <div class="w-px h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 shrink-0"></div>

            <!-- Bulk Actions -->
            <button 
              @click="handleBulkDownload"
              :disabled="isBulkDownloading"
              class="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs sm:text-sm font-medium transition-all disabled:opacity-50 shrink-0"
            >
              <Icon v-if="isBulkDownloading" name="lucide:loader-2" class="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
              <Icon v-else name="lucide:download" class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span class="hidden sm:inline">Download</span>
            </button>

            <button 
              @click="handleBulkDelete"
              :disabled="isBulkDeleting"
              class="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 text-xs sm:text-sm font-medium transition-all disabled:opacity-50 shrink-0"
            >
              <Icon v-if="isBulkDeleting" name="lucide:loader-2" class="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
              <Icon v-else name="lucide:trash-2" class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span class="hidden sm:inline">Delete</span>
            </button>

            <div class="w-px h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 shrink-0"></div>

            <!-- Clear Selection -->
            <button 
              @click="clearSelection"
              class="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors shrink-0"
              title="Clear selection"
            >
              <Icon name="lucide:x" class="h-4 w-4" />
            </button>
          </div>
        </Transition>

        <!-- Moving Indicator Toast -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-200 ease-in"
          enter-from-class="opacity-0 translate-y-4"
          leave-to-class="opacity-0 translate-y-4"
        >
          <div 
            v-if="isMoving" 
            class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-blue-600 rounded-full shadow-2xl"
          >
            <Icon name="lucide:loader-2" class="h-5 w-5 text-white animate-spin" />
            <span class="text-white font-medium">Moving file...</span>
          </div>
        </Transition>

        <!-- Drag Indicator (when dragging) -->
        <Transition
          enter-active-class="transition-opacity duration-200"
          leave-active-class="transition-opacity duration-200"
          enter-from-class="opacity-0"
          leave-to-class="opacity-0"
        >
          <div 
            v-if="draggedFile" 
            class="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 bg-gray-900/90 rounded-lg shadow-lg"
          >
            <Icon name="lucide:move" class="h-4 w-4 text-blue-400" />
            <span class="text-white text-sm">Drop on a folder to move</span>
          </div>
        </Transition>

        <!-- Loading Skeleton -->
        <div v-if="pending" class="w-full space-y-4 animate-in fade-in duration-500">
           <div class="space-y-3">
              <!-- Header Skeleton -->
              <div class="flex items-center justify-between px-4 py-2 border-b">
                 <UiSkeleton class="h-4 w-32" />
                 <UiSkeleton class="h-4 w-20" />
              </div>
              <!-- Rows -->
              <div v-for="i in 5" :key="i" class="flex items-center gap-4 px-4 py-3">
                 <UiSkeleton class="h-10 w-10 rounded-lg shrink-0" />
                 <div class="flex-1 space-y-2">
                    <UiSkeleton class="h-4 w-1/3" />
                    <UiSkeleton class="h-3 w-1/4" />
                 </div>
                 <UiSkeleton class="h-4 w-24 hidden sm:block" />
              </div>
           </div>
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
          <h3 class="text-xl font-semibold text-foreground dark:text-foreground mb-2">{{ searchQuery ? 'No results found' : 'Your folder is empty' }}</h3>
          <p class="text-muted-foreground max-w-xs mb-8">
            {{ searchQuery ? 'Try adjusting your search terms.' : 'Drag and drop files here to upload, or click to browse.' }}
          </p>
          <button 
            v-if="!searchQuery" 
            class="h-11 px-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20 font-medium transition-colors"
          >
            Choose Files
          </button>
        </div>

        <!-- List View (Dropbox Style) -->
        <div v-else-if="viewMode === 'list'" class="w-full">
           <FileList 
             :files="paginatedFiles"
             :selected-files="selectedFiles"
             :is-all-selected="isAllSelected"
             :is-partially-selected="isPartiallySelected"
             :sort-by="sortBy"
             :drop-target-id="dropTargetId"
             :dragged-file="draggedFile"
             :copied-file-id="copiedFileId"
             @toggle-select-all="toggleSelectAll"
             @update:sortBy="sortBy = $event"
             @row-click="onRowClick"
             @toggle-file-selection="toggleFileSelection"
             @long-press-start="startLongPress"
             @long-press-cancel="cancelLongPress"
             @drag-start="handleDragStart"
             @drag-end="handleDragEnd"
             @drag-over="handleDragOver"
             @drag-leave="handleDragLeave"
             @drop="handleFileDrop"
             @action="handleAction"
           />
        </div>

        <!-- Grid View -->
        <div v-else-if="viewMode === 'grid'">
           <FileGrid 
             :files="paginatedFiles"
             :selected-files="selectedFiles"
             :drop-target-id="dropTargetId"
             :dragged-file="draggedFile"
             @row-click="onRowClick"
             @toggle-file-selection="toggleFileSelection"
             @long-press-start="startLongPress"
             @long-press-cancel="cancelLongPress"
             @drag-start="handleDragStart"
             @drag-end="handleDragEnd"
             @drag-over="handleDragOver"
             @drag-leave="handleDragLeave"
             @drop="handleFileDrop"
             @action="handleAction"
           />
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

    <!-- Modals -->
    <!-- Share Modal -->
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
               <div 
                  class="h-12 w-12 rounded-lg flex items-center justify-center shrink-0"
                  :class="getIconColor(shareTarget.extension)"
               >
                  <Icon :name="getFileIcon(shareTarget.extension)" class="h-6 w-6" />
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
               
               <!-- Tabs -->
               <div class="flex border-b border-border mb-2">
                   <button 
                       @click="shareTab = 'link'" 
                       :class="['px-4 py-2 text-sm font-medium border-b-2 transition-colors focus:outline-none', shareTab === 'link' ? 'border-[#0061FE] text-[#0061FE]' : 'border-transparent text-muted-foreground hover:text-foreground']">
                       Share Link
                   </button>
                   <button 
                       @click="shareTab = 'embed'" 
                       :class="['px-4 py-2 text-sm font-medium border-b-2 transition-colors focus:outline-none', shareTab === 'embed' ? 'border-[#0061FE] text-[#0061FE]' : 'border-transparent text-muted-foreground hover:text-foreground']">
                       Embed Code
                   </button>
               </div>

               <!-- Link Content -->
               <div v-if="shareTab === 'link'" class="space-y-2 animate-in fade-in slide-in-from-left-2 duration-200">
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
                        class="h-11 px-6 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition-colors flex items-center gap-2"
                     >
                        <Icon v-if="copied" name="lucide:check" class="h-4 w-4" />
                        <Icon v-else name="lucide:copy" class="h-4 w-4" />
                        {{ copied ? 'Copied' : 'Copy' }}
                     </button>
                  </div>
               </div>

               <!-- Embed Content -->
               <div v-else class="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                   <!-- Direct URL -->
                   <div class="space-y-2">
                       <label class="text-xs font-bold uppercase text-muted-foreground tracking-wider">Embed URL</label>
                       <div class="flex gap-2">
                           <input 
                               type="text"
                               readonly
                               :value="getEmbedUrl(shareResult.id)"
                               class="flex-1 h-10 px-3 bg-muted/30 border rounded-md text-xs font-mono text-foreground focus:ring-2 focus:ring-blue-500/20 outline-none"
                           />
                           <button 
                               @click="copyEmbedUrl(shareResult.id)"
                               class="h-10 px-4 rounded-md bg-muted hover:bg-muted/80 text-foreground font-medium text-sm transition-colors flex items-center gap-2 border"
                           >
                               <Icon v-if="copied" name="lucide:check" class="h-4 w-4 text-green-500" />
                               <Icon v-else name="lucide:link" class="h-4 w-4" />
                           </button>
                       </div>
                       <p class="text-xs text-muted-foreground">Use this URL directly in your video player.</p>
                   </div>
                   
                   <!-- iFrame Code -->
                   <div class="space-y-2">
                       <label class="text-xs font-bold uppercase text-muted-foreground tracking-wider">iFrame Code</label>
                       <div class="relative group">
                           <textarea 
                               readonly
                               :value="getEmbedCode(shareResult.id)"
                               class="w-full h-20 p-3 bg-muted/50 border rounded-md text-xs font-mono text-foreground resize-none focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                           ></textarea>
                           <button 
                               @click="copyEmbedCode(shareResult.id)"
                               class="absolute top-2 right-2 p-1.5 bg-background shadow-sm border rounded hover:bg-muted text-[#0061FE] transition-all opacity-0 group-hover:opacity-100"
                               title="Copy Code"
                           >
                               <Icon v-if="copied" name="lucide:check" class="h-4 w-4" />
                               <Icon v-else name="lucide:copy" class="h-4 w-4" />
                           </button>
                       </div>
                       <p class="text-xs text-muted-foreground">Paste this code into your website's HTML.</p>
                   </div>
               </div>

               <!-- Footer with Expiry & Actions -->
               <div class="pt-4 border-t mt-4">
                   <!-- Delete Confirmation -->
                   <div v-if="confirmDeleteShare" class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/50 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                       <p class="text-sm text-red-800 dark:text-red-200 font-medium mb-2">Delete this share link?</p>
                       <p class="text-xs text-red-600 dark:text-red-400 mb-3">Anyone with this link will no longer be able to access the file.</p>
                       <div class="flex gap-2">
                           <button 
                               @click="deleteShareLink(refresh)"
                               :disabled="isDeletingShare"
                               class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                           >
                               <Icon v-if="isDeletingShare" name="lucide:loader-2" class="h-4 w-4 animate-spin" />
                               <Icon v-else name="lucide:trash-2" class="h-4 w-4" />
                               Yes, Delete
                           </button>
                           <button 
                               @click="confirmDeleteShare = false"
                               class="px-4 py-2 bg-white dark:bg-gray-800 border text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                           >
                               Cancel
                           </button>
                       </div>
                   </div>

                   <!-- Normal Footer -->
                   <div v-else class="flex items-center justify-between">
                       <span class="text-xs text-muted-foreground">Expires: <span class="font-medium text-foreground">{{ formatExpiry(shareResult.expiresAt) }}</span></span>
                       <div class="flex items-center gap-3">
                          <button 
                             @click="deleteShareLink(refresh)"
                             class="text-sm text-red-500 hover:text-red-600 hover:underline flex items-center gap-1"
                          >
                             <Icon name="lucide:trash-2" class="h-3 w-3" />
                             Delete Link
                          </button>
                          <button @click="closeShareModal" class="text-sm text-muted-foreground hover:text-foreground hover:underline">Done</button>
                       </div>
                   </div>
               </div>
            </div>

            <!-- Create Share State -->
            <div v-else class="space-y-6">
              <!-- Quick Embed Option -->
              <div class="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-100 dark:border-purple-800/30">
                  <div class="flex items-start gap-3">
                      <div class="p-2 bg-purple-100 dark:bg-purple-800/30 rounded-full text-purple-600 dark:text-purple-400 shrink-0">
                          <Icon name="lucide:code" class="h-4 w-4" />
                      </div>
                      <div class="flex-1 min-w-0">
                          <p class="text-sm font-medium text-purple-900 dark:text-purple-200">Quick Embed</p>
                          <p class="text-xs text-purple-600 dark:text-purple-400 mt-0.5">Get embed code instantly (link never expires)</p>
                      </div>
                      <button 
                          @click="shareTarget && generateEmbed(shareTarget)"
                          :disabled="isGeneratingEmbed"
                          class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                          <Icon v-if="isGeneratingEmbed" name="lucide:loader-2" class="h-4 w-4 animate-spin" />
                          <Icon v-else name="lucide:sparkles" class="h-4 w-4" />
                          Generate
                      </button>
                  </div>
              </div>

              <div class="relative flex items-center">
                  <div class="flex-grow border-t border-border"></div>
                  <span class="px-3 text-xs text-muted-foreground">or create link with expiration</span>
                  <div class="flex-grow border-t border-border"></div>
              </div>

              <div>
                 <label class="text-sm font-medium text-foreground mb-3 block">Link settings</label>
                 <div class="space-y-3">
                     <div class="flex items-center gap-2 mb-4 px-1">
                        <div class="p-2 bg-blue-50 rounded-full text-blue-600">
                           <Icon name="lucide:clock" class="h-4 w-4" />
                        </div>
                        <div>
                           <p class="text-sm font-medium">Expiration</p>
                           <p class="text-xs text-muted-foreground">When should this link expire?</p>
                        </div>
                     </div>

                     <div class="grid grid-cols-2 gap-3">
                        <button
                           v-for="option in expirationOptions"
                           :key="option.label"
                           @click="selectedExpiration = option.days"
                           :class="[
                              'px-3 py-2.5 rounded-lg text-sm font-medium transition-all border text-left flex items-center justify-between',
                              (selectedExpiration === option.days)
                                 ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200' 
                                 : 'bg-card hover:bg-muted border-input text-muted-foreground hover:text-foreground'
                           ]"
                        >
                           {{ option.label }}
                           <Icon v-if="selectedExpiration === option.days" name="lucide:check" class="h-4 w-4" />
                        </button>
                     </div>
                 </div>
              </div>

               <button 
                  @click="handleShare"
                  :disabled="isSharing"
                  class="w-full h-12 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
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

          <!-- Error Preview -->
          <div v-if="previewError" class="bg-card p-8 rounded-xl shadow-2xl text-center max-w-md border border-destructive/20">
            <div class="h-20 w-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
               <Icon name="lucide:alert-circle" class="h-10 w-10" />
            </div>
            <p class="font-medium text-lg mb-2 text-foreground">Failed to load preview</p>
            <p class="text-muted-foreground text-sm mb-6">{{ previewError }}</p>
            <div class="flex justify-center gap-3">
               <button 
                 @click="closePreview"
                 class="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
               >
                 Close
               </button>
               <button 
                 @click="previewTarget && openPreview(previewTarget)"
                 class="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
               >
                 Retry
               </button>
            </div>
          </div>

          <!-- Archive Preview -->
          <div v-else-if="isArchiveFile(previewTarget.extension)" class="bg-card p-8 rounded-xl shadow-2xl text-center max-w-md">
            <div class="h-20 w-20 mx-auto mb-6 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
               <Icon name="lucide:package" class="h-10 w-10" />
            </div>
            <p class="font-medium text-lg mb-2">{{ previewTarget.name }}</p>
            <p class="text-muted-foreground text-sm mb-6">Archive files cannot be previewed directly.</p>
            <button 
              @click="handleDownload(previewTarget)"
              class="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors flex items-center gap-2 mx-auto"
            >
              <Icon name="lucide:download" class="h-4 w-4" />
              Download to View
            </button>
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

          <!-- PDF/Document Preview -->
          <div v-else-if="previewUrl" class="bg-card p-8 rounded-xl shadow-2xl text-center max-w-md">
            <div 
               class="h-20 w-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
               :class="getIconColor(previewTarget.extension)"
            >
               <Icon :name="getFileIcon(previewTarget.extension)" class="h-10 w-10" />
            </div>
            <p class="font-medium text-lg mb-2">{{ previewTarget.name }}</p>
            <p class="text-muted-foreground text-sm mb-6">{{ formatBytes(previewTarget.size) }}</p>
            <p class="text-sm text-muted-foreground mb-4">Preview not available for this file type</p>
            <button 
              @click="handleExternalLink(previewUrl)"
              class="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
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

    <!-- Create Folder Modal -->
    <Teleport to="body">
      <div 
        v-if="createFolderModalOpen" 
        class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#1E1919]/60 backdrop-blur-[2px]"
        @click.self="createFolderModalOpen = false"
      >
        <div class="bg-card w-full max-w-[400px] rounded-xl shadow-2xl border-0 overflow-hidden">
          <div class="px-6 py-5 border-b bg-background flex items-center justify-between">
             <h3 class="font-semibold text-lg">Create new folder</h3>
             <button @click="createFolderModalOpen = false" class="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors">
                <Icon name="lucide:x" class="h-5 w-5" />
             </button>
          </div>
          
          <div class="p-6">
            <div class="space-y-4">
              <div>
                <label class="text-sm font-medium mb-1.5 block">Folder Name</label>
                <input 
                  v-model="newFolderName"
                  type="text"
                  placeholder="e.g. Projects"
                  class="w-full h-10 px-3 bg-muted/30 border rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  @keyup.enter="createFolder"
                  autofocus
                />
              </div>
              
              <div v-if="folderError" class="text-sm text-red-500 bg-red-50 p-2 rounded">
                 {{ folderError }}
              </div>
              
              <button 
                @click="createFolder"
                :disabled="isCreatingFolder || !newFolderName.trim()"
                class="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                 <Icon v-if="isCreatingFolder" name="lucide:loader-2" class="h-4 w-4 animate-spin" />
                 Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { formatBytes, formatDate, getFileIcon, getIconColor, isArchiveFile, isImageFile, isVideoFile, isAudioFile } from '~/utils/file'

// Composables
import { useFileBrowser } from '~/composables/useFileBrowser'
import { useFileSelection } from '~/composables/useFileSelection'
import { useFileDragDrop } from '~/composables/useFileDragDrop'
import { useFileUpload } from '~/composables/useFileUpload'
import { useFilePreview } from '~/composables/useFilePreview'
import { useFileShare } from '~/composables/useFileShare'
import { useFileOperations } from '~/composables/useFileOperations'

// Components
import FileStats from '~/components/drive/FileStats.vue'
import FileToolbar from '~/components/drive/FileToolbar.vue'
import Breadcrumbs from '~/components/drive/Breadcrumbs.vue'
import FileList from '~/components/drive/FileList.vue'
import FileGrid from '~/components/drive/FileGrid.vue'

// 1. Browser Logic (Data, Nav, Sort, Filter)
const {
  searchQuery,
  sortBy,
  viewMode,
  currentPage,
  currentPath,
  totalPages,
  files,
  pending,
  error,
  refresh,
  sortedFiles,
  paginatedFiles,
  breadcrumbs,
  navigateToFolder,
  handleBreadcrumbClick,
  handleFolderClick
} = await useFileBrowser()

// 2. Selection Logic
const {
  selectedFiles,
  isAllSelected,
  isPartiallySelected,
  selectedCount,
  toggleSelectAll,
  toggleFileSelection,
  clearSelection
} = useFileSelection(paginatedFiles)

// 3. Operations (Create, Delete, Download)
const {
  isCreatingFolder,
  newFolderName,
  folderError,
  createFolderModalOpen,
  createFolder,
  isBulkDeleting,
  handleBulkDelete,
  isBulkDownloading,
  handleBulkDownload,
  handleDownload,
  deleteTarget,
  isDeleting,
  confirmDelete,
  handleDelete,
  copiedFileId,
  copyExistingLink
} = useFileOperations(files, selectedFiles, refresh, clearSelection)

// 4. Upload Logic
const {
  isDragging,
  isUploading,
  uploadProgress,
  uploadingFileName,
  uploadedCount,
  totalUploadCount,
  uploadError,
  fileInput,
  handleExternalDragOver,
  handleExternalDragLeave,
  handleDrop,
  handleFileSelect,
  triggerFileInput
} = useFileUpload(currentPath, refresh)

// 5. Drag & Drop (Internal)
const {
  draggedFile,
  dropTargetId,
  isMoving,
  isLongPress, // Not used in template directly? Check FileList/FileGrid events
  startLongPress,
  cancelLongPress,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDragLeave,
  handleFileDrop,
  handleBreadcrumbDrop,
  removeFromFolder
} = useFileDragDrop(refresh)

// 6. Preview Logic
const {
  previewTarget,
  previewUrl,
  isLoadingPreview,
  previewError,
  openPreview,
  closePreview,
  handleExternalLink
} = useFilePreview()

// 7. Share Logic
const {
  shareTarget,
  shareResult,
  isSharing,
  copied,
  shareTab,
  expirationOptions,
  selectedExpiration,
  isGeneratingEmbed,
  isDeletingShare,
  confirmDeleteShare,
  openShareModal,
  closeShareModal,
  handleShare,
  copyShareLink,
  generateEmbed,
  deleteShareLink,
  getEmbedCode,
  getEmbedUrl,
  copyEmbedCode,
  copyEmbedUrl
} = useFileShare()

// Global Handlers
const onRowClick = (file: any) => file.type === 'folder' ? handleFolderClick(file) : openPreview(file)

const handleAction = (action: string, file: any) => {
  switch (action) {
    case 'copy-link': copyExistingLink(file); break;
    case 'preview': openPreview(file); break;
    case 'share': openShareModal(file); break;
    case 'download': handleDownload(file); break;
    case 'remove-from-folder': removeFromFolder(file); break;
    case 'delete': confirmDelete(file); break;
  }
}

// Stats Helpers
const totalSizeFormatted = computed(() => formatBytes(files.value.reduce((acc, file) => acc + file.size, 0)))
const activeSharesCount = computed(() => files.value.filter(f => f.shareUrl).length)

// Helper for expiry formatting (was inline before?)
const formatExpiry = (dateStr: string | null) => {
  if (!dateStr) return 'Never'
  return formatDate(dateStr)
}
</script>
