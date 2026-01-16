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

             <!-- New Folder Button -->
             <button 
               @click="createFolderModalOpen = true"
               class="h-10 px-4 rounded-full border border-input hover:bg-accent hover:text-accent-foreground font-medium text-sm transition-all flex items-center gap-2"
             >
               <Icon name="lucide:folder-plus" class="h-4 w-4" />
               <span class="hidden sm:inline">New Folder</span>
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

      <!-- Breadcrumbs -->
      <nav class="flex items-center text-sm">
        <ol class="flex items-center gap-1">
           <li v-for="(crumb, idx) in breadcrumbs" :key="crumb.path" class="flex items-center">
              <Icon v-if="idx > 0" name="lucide:chevron-right" class="h-4 w-4 text-muted-foreground mx-1" />
              <button 
                @click="handleBreadcrumbClick(crumb)"
                @drop.prevent="handleBreadcrumbDrop($event, crumb)"
                @dragover.prevent="handleBreadcrumbDragOver($event)"
                @dragleave="handleBreadcrumbDragLeave"
                class="hover:bg-muted px-2 py-1 rounded-md transition-colors font-medium flex items-center gap-1"
                :class="idx === breadcrumbs.length - 1 ? 'text-foreground cursor-default pointer-events-none' : 'text-muted-foreground hover:text-foreground'"
              >
                 <Icon v-if="idx === 0" name="lucide:home" class="h-4 w-4" />
                 <span v-if="idx === 0">My Files</span>
                 <Icon v-else-if="crumb.isVirtual" name="lucide:folder" class="h-4 w-4 text-blue-500" />
                 <span v-if="idx > 0">{{ crumb.name }}</span>
              </button>
           </li>
        </ol>
      </nav>
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
            class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-[#1E1919] dark:bg-card rounded-full shadow-2xl border dark:border-border"
          >
            <!-- Selection Count -->
            <div class="flex items-center gap-2 text-white dark:text-foreground">
              <div class="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                {{ selectedCount }}
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
              :disabled="isBulkDeleting"
              class="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Icon v-if="isBulkDeleting" name="lucide:loader-2" class="h-4 w-4 animate-spin" />
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
                    <!-- Bulk Selection Checkbox -->
                    <th class="py-3 px-2 w-10 border-b">
                       <div class="flex items-center justify-center">
                          <input 
                             type="checkbox" 
                             :checked="isAllSelected"
                             :indeterminate="isPartiallySelected"
                             @change="toggleSelectAll"
                             class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                       </div>
                    </th>
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
                    <th class="py-3 px-6 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-24">Actions</th>
                 </tr>
              </thead>
              <tbody class="divide-y divide-border/40">
                 <tr 
                    v-for="file in paginatedFiles" 
                    :key="file.id" 
                    class="group transition-colors duration-200"
                    :class="[
                       selectedFiles.has(file.id) ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-[#F7F9FA] dark:hover:bg-muted/20',
                       dropTargetId === file.id ? 'bg-blue-100 dark:bg-blue-800/30 ring-2 ring-blue-400 ring-inset' : '',
                       draggedFile?.id === file.id ? 'opacity-50' : '',
                       'cursor-pointer select-none'
                    ]"
                    :draggable="true"
                    @click="onRowClick(file)"
                    @mousedown="startLongPress($event, file)"
                    @mouseup="cancelLongPress"
                    @mouseleave="cancelLongPress"
                    @dragstart="handleDragStart($event, file)"
                    @dragend="handleDragEnd"
                    @dragover="handleDragOver($event, file)"
                    @dragleave="handleDragLeave"
                    @drop="handleFileDrop($event, file)"
                 >
                    <!-- Row Checkbox -->
                    <td class="py-3 px-2">
                       <div class="flex items-center justify-center">
                          <input 
                             type="checkbox" 
                             :checked="selectedFiles.has(file.id)"
                             @click.stop
                             @change="toggleFileSelection(file)"
                             class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                       </div>
                    </td>
                    <td class="py-3 px-4">
                       <div class="flex items-center gap-4">
                          <!-- Minimalist Icon with Colored Container -->
                          <div class="relative shrink-0">
                             <div 
                                class="h-10 w-10 rounded-lg flex items-center justify-center transition-colors"
                                :class="file.type === 'folder' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : getIconColor(file.extension)"
                             >
                                <Icon 
                                   :name="file.type === 'folder' ? 'lucide:folder' : getFileIcon(file.extension)" 
                                   class="h-5 w-5"
                                   :class="{'fill-blue-500/20': file.type === 'folder'}"
                                />
                             </div>
                             <!-- Verified/Shared Badge -->
                             <span v-if="file.shareUrl && file.type !== 'folder'" class="absolute -bottom-1 -right-1 block h-3 w-3 rounded-full bg-green-500 border-2 border-background ring-1 ring-green-100"></span>
                          </div>
                          <div class="min-w-0 pr-4">
                             <p 
                                class="font-medium text-sm text-[#1E1919] dark:text-foreground truncate transition-colors group-hover:text-[#0061FE]" 
                                :title="file.name"
                             >
                                {{ file.name }}
                             </p>
                             <div class="flex items-center gap-2 mt-0.5 md:hidden" v-if="file.type !== 'folder'">
                                <span class="text-xs text-muted-foreground">{{ formatBytes(file.size) }}</span>
                                <span class="text-xs text-muted-foreground">•</span>
                                <span class="text-xs text-muted-foreground">{{ formatDate(file.modified) }}</span>
                             </div>
                             <div  v-else class="flex items-center gap-2 mt-0.5 md:hidden">
                                <span class="text-xs text-muted-foreground">Folder</span>
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
                       <div v-if="file.shareUrl" class="flex flex-col items-start gap-1">
                          <div class="flex items-center gap-1.5 text-xs text-green-600 font-medium px-2 py-1 bg-green-50 rounded-full w-fit">
                              <Icon name="lucide:globe" class="h-3 w-3" />
                              <span>Link active</span>
                          </div>
                          <span v-if="file.shareExpiresAt" :class="getExpiryColor(file.shareExpiresAt)" class="text-[10px] ml-1">
                              {{ getExpiryDistance(file.shareExpiresAt) }}
                          </span>
                       </div>
                       <div v-else class="text-xs text-muted-foreground italic">Only you</div>
                    </td>
                    <td class="py-3 px-4 text-right">
                       <!-- Actions only show on hover (desktop) -->
                       <div class="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                             v-if="file.shareUrl"
                             @click.stop="copyExistingLink(file)"
                             :title="copiedFileId === file.id ? 'Copied' : 'Copy link'"
                             class="h-8 w-8 flex items-center justify-center rounded hover:bg-white hover:text-green-600 hover:shadow-sm transition-all"
                             :class="copiedFileId === file.id ? 'text-green-600 bg-green-50' : 'text-muted-foreground'"
                          >
                             <Icon :name="copiedFileId === file.id ? 'lucide:check' : 'lucide:link'" class="h-4 w-4" />
                          </button>

                          <button 
                             @click.stop="openPreview(file)"
                             title="Preview"
                             class="h-8 w-8 flex items-center justify-center rounded hover:bg-purple-50 hover:text-purple-600 hover:shadow-sm transition-all text-muted-foreground"
                          >
                             <Icon name="lucide:eye" class="h-4 w-4" />
                          </button>

                          <button 
                             @click.stop="openShareModal(file)"
                             title="Share"
                             class="h-8 w-8 flex items-center justify-center rounded hover:bg-[#0061FE] hover:text-white hover:shadow-sm transition-all text-muted-foreground"
                          >
                             <Icon name="lucide:share-2" class="h-4 w-4" />
                          </button>
                          
                          <button 
                             @click.stop="handleDownload(file)"
                             title="Download"
                             class="h-8 w-8 flex items-center justify-center rounded hover:bg-white hover:text-[#0061FE] hover:shadow-sm transition-all text-muted-foreground"
                          >
                             <Icon name="lucide:download" class="h-4 w-4" />
                          </button>

                          <!-- Remove from folder button (only visible when file is in a virtual folder) -->
                          <button 
                             v-if="file.virtualFolder"
                             @click.stop="removeFromFolder(file)"
                             title="Remove from folder"
                             class="h-8 w-8 flex items-center justify-center rounded hover:bg-orange-50 hover:text-orange-600 hover:shadow-sm transition-all text-muted-foreground"
                          >
                             <Icon name="lucide:folder-minus" class="h-4 w-4" />
                          </button>

                          <button 
                             @click.stop="confirmDelete(file)"
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
              class="group relative bg-card border rounded-[10px] p-4 flex flex-col items-center text-center transition-all duration-200 select-none"
              :class="[
                 selectedFiles.has(file.id) ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' : 'hover:bg-muted/30 border-transparent hover:border-border/50',
                 dropTargetId === file.id ? 'bg-blue-100 dark:bg-blue-800/30 ring-2 ring-blue-400' : '',
                 draggedFile?.id === file.id ? 'opacity-50' : '',
                 'cursor-pointer'
              ]"
              :draggable="true"
              @click="onRowClick(file)"
              @mousedown="startLongPress($event, file)"
              @mouseup="cancelLongPress"
              @mouseleave="cancelLongPress"
              @dragstart="handleDragStart($event, file)"
              @dragend="handleDragEnd"
              @dragover="handleDragOver($event, file)"
              @dragleave="handleDragLeave"
              @drop="handleFileDrop($event, file)"
           >
              <!-- Absolute Checkbox/Selection -->
              <div 
                 v-if="file.type !== 'folder'"
                 class="absolute top-3 left-3 transition-opacity z-10"
                 :class="selectedFiles.has(file.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
              >
                 <input 
                    type="checkbox" 
                    :checked="selectedFiles.has(file.id)"
                    @click.stop="toggleFileSelection(file)"
                    class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                 />
              </div>

               <!-- Absolute Actions (Top Right) -->
              <div class="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                 <button v-if="file.shareUrl" @click.stop="copyExistingLink(file)" class="h-7 w-7 rounded bg-background shadow-sm border flex items-center justify-center hover:bg-green-50 text-green-600">
                    <Icon name="lucide:link" class="h-3.5 w-3.5" />
                 </button>
                  <button @click.stop="openShareModal(file)" class="h-7 w-7 rounded bg-background shadow-sm border flex items-center justify-center hover:bg-blue-50 text-blue-600">
                    <Icon name="lucide:share-2" class="h-3.5 w-3.5" />
                 </button>
                  <!-- Remove from folder (only for files in virtual folder) -->
                  <button v-if="file.virtualFolder" @click.stop="removeFromFolder(file)" class="h-7 w-7 rounded bg-background shadow-sm border flex items-center justify-center hover:bg-orange-50 text-orange-600" title="Remove from folder">
                    <Icon name="lucide:folder-minus" class="h-3.5 w-3.5" />
                 </button>
                  <button @click.stop="confirmDelete(file)" class="h-7 w-7 rounded bg-background shadow-sm border flex items-center justify-center hover:bg-red-50 text-red-600">
                    <Icon name="lucide:trash-2" class="h-3.5 w-3.5" />
                 </button>
              </div>

              <!-- Icon Preview (Clickable for preview) -->
              <div 
                 @click="file.type === 'folder' ? handleFolderClick(file) : openPreview(file)"
                 class="h-24 w-full flex items-center justify-center mb-3 cursor-pointer hover:scale-105 transition-transform"
              >
                  <!-- Colored Container for Grid View -->
                 <div 
                    class="h-16 w-16 rounded-2xl flex items-center justify-center shadow-sm"
                    :class="file.type === 'folder' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : getIconColor(file.extension)"
                 >
                    <Icon 
                       :name="file.type === 'folder' ? 'lucide:folder' : getFileIcon(file.extension)" 
                       class="h-8 w-8"
                       :class="{'fill-blue-500/20': file.type === 'folder'}"
                    />
                 </div>
                 
                 <span v-if="isVideoFile(file.extension)" class="absolute bottom-16 right-4 text-[10px] font-bold bg-black/70 text-white px-1.5 py-0.5 rounded">
                    {{ file.duration || 'VIDEO' }}
                 </span>
              </div>
              
              <!-- File Name -->
              <h4 
                 @click="file.type === 'folder' ? handleFolderClick(file) : openPreview(file)"
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
                        class="h-11 px-6 rounded-md bg-[#0061FE] hover:bg-[#0057E5] text-white font-medium text-sm transition-colors flex items-center gap-2"
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
                               @click="deleteShareLink"
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
                             @click="deleteShareLink"
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const supabase = useSupabaseClient()
const route = useRoute()

interface FileEntry {
  id: string
  name: string
  path: string
  size: number
  modified: string
  extension: string | null
  accountId: string
  shareUrl?: string | null
  shareExpiresAt?: string | null
  duration?: string
  shareId?: string | null
  type?: 'file' | 'folder'
  virtualFolder?: string | null
}

// Filters
const searchQuery = ref('')
const sortBy = ref('modified')
const viewMode = ref<'list' | 'grid'>('list')
const currentPage = ref(1)
// Folder State
const currentPath = ref('/')
const isCreatingFolder = ref(false)
const newFolderName = ref('')
const folderError = ref('')
const createFolderModalOpen = ref(false)

// Virtual Folder State
const currentVirtualFolder = ref<string | null>(null)

// Drag & Drop State
const draggedFile = ref<FileEntry | null>(null)
const dropTargetId = ref<string | null>(null)
const isMoving = ref(false)
const isLongPress = ref(false)
const longPressTimer = ref<any>(null)

// Long Press Logic
const startLongPress = (e: MouseEvent, file: FileEntry) => {
  // Only left click
  if (e.button !== 0) return
  
  const target = e.currentTarget as HTMLElement

  longPressTimer.value = setTimeout(() => {
    isLongPress.value = true
    if (navigator.vibrate) navigator.vibrate(50)
    // Visual indicator that drag is ready
    target.classList.add('ring-2', 'ring-blue-400', 'scale-[1.02]')
  }, 400) // 400ms delay for long press
}

const cancelLongPress = (e?: Event) => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
  
  if (isLongPress.value) {
    // If it was active, remove visual indicator from current target context if possible
    // Note: in dragEnd we clean up, but if user just mouseups without dragging:
    if (e && e.currentTarget) {
       (e.currentTarget as HTMLElement).classList.remove('ring-2', 'ring-blue-400', 'scale-[1.02]')
    }
  }
  // isLongPress reset happens in dragEnd or here if drag didn't start?
  // If drag didn't start, we should reset it immediately on mouse up
  if (!draggedFile.value) {
      isLongPress.value = false
  }
}

// Drag & Drop Handlers
const handleDragStart = (event: DragEvent, file: FileEntry) => {
  // Enforce long press
  if (!isLongPress.value) {
    event.preventDefault()
    return
  }

  event.stopPropagation() // Prevent triggering parent's drag handlers
  if (file.type === 'folder') {
    // Allow dragging folders too
  }
  draggedFile.value = file
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/x-file-move', file.id) // Custom type to distinguish from file upload
  }
  // Add visual feedback
  const target = event.target as HTMLElement
  target.style.opacity = '0.5'
}

const handleDragEnd = (event: DragEvent) => {
  draggedFile.value = null
  dropTargetId.value = null
  isLongPress.value = false // Reset state
  
  const target = event.target as HTMLElement
  target.style.opacity = '1'
  target.classList.remove('ring-2', 'ring-blue-400', 'scale-[1.02]')
}

const handleDragOver = (event: DragEvent, file: FileEntry) => {
  if (!draggedFile.value) return
  if (file.type !== 'folder') return
  if (draggedFile.value.id === file.id) return
  
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  dropTargetId.value = file.id
}

const handleDragLeave = (_event: DragEvent) => {
  dropTargetId.value = null
}

const handleFileDrop = async (event: DragEvent, targetFolder: FileEntry) => {
  event.preventDefault()
  dropTargetId.value = null
  
  if (!draggedFile.value) return
  if (targetFolder.type !== 'folder') return
  if (draggedFile.value.id === targetFolder.id) return
  
  // Prevent moving folder into itself
  if (targetFolder.path.startsWith(draggedFile.value.path + '/')) {
    alert('Cannot move a folder into itself')
    draggedFile.value = null
    return
  }
  
  await moveFile(draggedFile.value, targetFolder)
  draggedFile.value = null
}

// Breadcrumb Drag & Drop Handlers
const handleBreadcrumbDragOver = (event: DragEvent) => {
  if (!draggedFile.value) return
  const target = event.currentTarget as HTMLElement
  target.classList.add('bg-blue-100', 'text-blue-600', 'dark:bg-blue-900/40', 'dark:text-blue-400')
  if (event.dataTransfer) {
     event.dataTransfer.dropEffect = 'move'
  }
}

const handleBreadcrumbDragLeave = (event: DragEvent) => {
  const target = event.currentTarget as HTMLElement
  target.classList.remove('bg-blue-100', 'text-blue-600', 'dark:bg-blue-900/40', 'dark:text-blue-400')
}

const handleBreadcrumbDrop = async (event: DragEvent, crumb: { name: string; path: string; isVirtual: boolean }) => {
  const target = event.currentTarget as HTMLElement
  target.classList.remove('bg-blue-100', 'text-blue-600', 'dark:bg-blue-900/40', 'dark:text-blue-400')
  
  if (!draggedFile.value) return

  // Create a pseudo-folder entry for the move logic
  const targetFolder = {
      id: crumb.path === '/' ? 'root' : `vf-${crumb.name}`,
      name: crumb.name,
      path: crumb.path,
      type: 'folder' as const,
      isVirtual: crumb.isVirtual,
      // dummies
      size: 0,
      modified: '',
      extension: null,
      accountId: ''
  }

  await moveFile(draggedFile.value, targetFolder)
  draggedFile.value = null
}

// Move file function (local database mapping only - not Dropbox)
const moveFile = async (file: FileEntry, targetFolder: FileEntry) => {
  isMoving.value = true
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    // Determine the new virtual folder path
    const newVirtualFolder = targetFolder.path === '/' 
      ? null // Root folder = no virtual folder
      : targetFolder.name // Use folder name as virtual folder
    
    console.log('[Move] Organizing file:', {
      fileId: file.id,
      fileName: file.name,
      targetFolder: newVirtualFolder
    })
    
    await $fetch('/api/files/update-folder', {
      method: 'POST',
      body: {
        fileId: file.id,
        virtualFolder: newVirtualFolder
      },
      headers: session?.access_token 
        ? { Authorization: `Bearer ${session.access_token}` } 
        : undefined
    })
    
    // Show success message
    console.log(`[Move] Success: "${file.name}" -> "${targetFolder.name}"`)
    
    // Refresh file list
    await refresh()
    
  } catch (err: any) {
    console.error('[Move] Failed:', err)
    alert('Failed to organize file: ' + (err.data?.statusMessage || err.message || 'Unknown error'))
  } finally {
    isMoving.value = false
  }
}

// Bulk Selection State
const selectedFiles = ref<Set<string>>(new Set())

const isAllSelected = computed(() => {
  const currentFiles = paginatedFiles.value.filter(f => f.type !== 'folder')
  return currentFiles.length > 0 && currentFiles.every(f => selectedFiles.value.has(f.id))
})

const isPartiallySelected = computed(() => {
  const currentFiles = paginatedFiles.value.filter(f => f.type !== 'folder')
  const selectedCount = currentFiles.filter(f => selectedFiles.value.has(f.id)).length
  return selectedCount > 0 && selectedCount < currentFiles.length
})

const selectedCount = computed(() => selectedFiles.value.size)

const toggleSelectAll = () => {
  const currentFiles = paginatedFiles.value.filter(f => f.type !== 'folder')
  if (isAllSelected.value) {
    // Deselect all
    currentFiles.forEach(f => selectedFiles.value.delete(f.id))
  } else {
    // Select all
    currentFiles.forEach(f => selectedFiles.value.add(f.id))
  }
  // Force reactivity
  selectedFiles.value = new Set(selectedFiles.value)
}

const toggleFileSelection = (file: FileEntry) => {
  if (file.type === 'folder') return
  
  if (selectedFiles.value.has(file.id)) {
    selectedFiles.value.delete(file.id)
  } else {
    selectedFiles.value.add(file.id)
  }
  // Force reactivity
  selectedFiles.value = new Set(selectedFiles.value)
}

const clearSelection = () => {
  selectedFiles.value = new Set()
}

// Bulk Operations State
const isBulkDeleting = ref(false)
const isBulkDownloading = ref(false)

// Bulk Delete Handler
const handleBulkDelete = async () => {
  if (selectedFiles.value.size === 0) return
  
  const count = selectedFiles.value.size
  if (!confirm(`Are you sure you want to delete ${count} file(s)? This action cannot be undone.`)) {
    return
  }
  
  isBulkDeleting.value = true
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const headers: Record<string, string> = session?.access_token 
      ? { Authorization: `Bearer ${session.access_token}` } 
      : {}
    
    // Get selected file objects
    const filesToDelete = files.value.filter(f => selectedFiles.value.has(f.id))
    
    // Delete files in parallel using user-safe endpoint
    const results = await Promise.allSettled(
      filesToDelete.map(file => 
        $fetch('/api/files/delete', {
          method: 'POST',
          body: {
            fileId: file.id
          },
          headers
        })
      )
    )
    
    const failed = results.filter(r => r.status === 'rejected').length
    
    if (failed > 0) {
      alert(`${count - failed} file(s) deleted successfully. ${failed} file(s) failed to delete.`)
    }
    
    // Refresh and clear selection
    await refresh()
    clearSelection()
    
  } catch (err: any) {
    console.error('Bulk delete error:', err)
    alert('Failed to delete files: ' + (err.message || 'Unknown error'))
  } finally {
    isBulkDeleting.value = false
  }
}

// Bulk Download Handler
const handleBulkDownload = async () => {
  if (selectedFiles.value.size === 0) return
  
  isBulkDownloading.value = true
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const headers: Record<string, string> = session?.access_token 
      ? { Authorization: `Bearer ${session.access_token}` } 
      : {}
    
    // Get selected file objects
    const filesToDownload = files.value.filter(f => selectedFiles.value.has(f.id))
    
    if (filesToDownload.length === 1) {
      // Single file - direct download
      const file = filesToDownload[0]
      const response = await $fetch<{ url: string }>('/api/dropbox/download', {
        method: 'POST',
        body: { path: file.path, accountId: file.accountId },
        headers
      })
      window.open(response.url, '_blank')
    } else {
      // Multiple files - download each (ZIP would require server-side processing)
      // For now, open each in new tab (browser may block popups)
      for (const file of filesToDownload) {
        try {
          const response = await $fetch<{ url: string }>('/api/dropbox/download', {
            method: 'POST',
            body: { path: file.path, accountId: file.accountId },
            headers
          })
          // Create download link
          const link = document.createElement('a')
          link.href = response.url
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
    
    clearSelection()
    
  } catch (err: any) {
    console.error('Bulk download error:', err)
    alert('Failed to download files: ' + (err.message || 'Unknown error'))
  } finally {
    isBulkDownloading.value = false
  }
}

// Breadcrumbs
const breadcrumbs = computed(() => {
  const crumbs = [{ name: 'Home', path: '/', isVirtual: false }]
  
  // If in a virtual folder, show it in breadcrumbs
  if (currentVirtualFolder.value) {
    crumbs.push({ 
      name: currentVirtualFolder.value, 
      path: `/virtual/${currentVirtualFolder.value}`,
      isVirtual: true 
    })
    return crumbs
  }
  
  // Otherwise show path-based breadcrumbs
  const parts = currentPath.value.split('/').filter(p => p)
  let current = '/'
  
  parts.forEach(part => {
    current = current === '/' ? `/${part}` : `${current}/${part}`
    crumbs.push({ name: part, path: current, isVirtual: false })
  })
  
  return crumbs
})

// Navigation
const navigateToFolder = (path: string) => {
  currentPath.value = path
}

// Handle breadcrumb click
const handleBreadcrumbClick = (crumb: { path: string; isVirtual: boolean }) => {
  if (crumb.path === '/') {
    // Go to root - clear virtual folder and reset path
    currentVirtualFolder.value = null
    currentPath.value = '/'
  } else if (!crumb.isVirtual) {
    // Regular folder navigation
    currentVirtualFolder.value = null
    navigateToFolder(crumb.path)
  }
  // If it's virtual folder (current location), do nothing
}

// Remove file from virtual folder (move back to root)
const removeFromFolder = async (file: FileEntry) => {
  if (!file.virtualFolder) return
  
  isMoving.value = true
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    await $fetch('/api/files/update-folder', {
      method: 'POST',
      body: {
        fileId: file.id,
        virtualFolder: null // Remove from folder
      },
      headers: session?.access_token 
        ? { Authorization: `Bearer ${session.access_token}` } 
        : undefined
    })
    
    console.log(`[Move] Removed "${file.name}" from folder`)
    await refresh()
    
  } catch (err: any) {
    console.error('[Move] Failed to remove from folder:', err)
    alert('Failed to remove from folder: ' + (err.data?.statusMessage || err.message || 'Unknown error'))
  } finally {
    isMoving.value = false
  }
}

const navigateUp = () => {
  // First check if we're in a virtual folder
  if (currentVirtualFolder.value) {
    currentVirtualFolder.value = null
    return
  }
  
  if (currentPath.value === '/') return
  const parts = currentPath.value.split('/')
  parts.pop()
  currentPath.value = parts.join('/') || '/'
}

// Navigate to virtual folder
const navigateToVirtualFolder = (folderName: string) => {
  currentVirtualFolder.value = folderName
}

// Handle folder click - determines if it's a virtual or regular folder
const handleFolderClick = (file: any) => {
  // Persistent folders (from virtual_folders table) or virtual folders (from tags)
  // Both should navigate to virtual folder view
  if (file.isVirtualFolder || file.isVirtual || file.isPersistent) {
    navigateToVirtualFolder(file.name)
  } else if (file.type === 'folder') {
    // Regular file system folder (e.g., from Dropbox) - navigate by path
    navigateToFolder(file.path)
  }
}

// Get unique virtual folders from files
const virtualFolders = computed(() => {
  if (!data.value) return []
  
  const folders = new Set<string>()
  data.value.forEach(file => {
    if (file.virtualFolder) {
      folders.add(file.virtualFolder)
    }
  })
  
  return Array.from(folders).map(name => ({
    id: `vf-${name}`,
    name: name,
    path: `/virtual/${name}`,
    size: 0,
    modified: new Date().toISOString(),
    extension: null,
    accountId: '',
    type: 'folder' as const,
    isVirtual: true,
    fileCount: data.value?.filter(f => f.virtualFolder === name).length || 0
  }))
})

// Filtered Files based on Current Path and Virtual Folder
const filteredFiles = computed(() => {
  if (!data.value) return []
  
  // If in a virtual folder, show only files in that folder
  if (currentVirtualFolder.value) {
    return data.value.filter(file => 
      file.virtualFolder === currentVirtualFolder.value
    )
  }
  
  const path = currentPath.value
  
  // At root level
  if (path === '/') {
    // Separate persistent folders (from virtual_folders table) and regular items
    const persistentFolders = data.value.filter((item: any) => item.isVirtualFolder === true)
    const regularItems = data.value.filter((item: any) => !item.isVirtualFolder)
    
    // Get files without virtual folder tag (unorganized)
    const rootFiles = regularItems.filter(file => !file.virtualFolder)
    
    // Get virtual folders (from tags) - for items with virtual_folder tag
    const vFolders = virtualFolders.value as any[]
    
    // Merge persistent folders with virtual folder counts
    const mergedMap = new Map<string, any>()
    
    // Add persistent folders first
    persistentFolders.forEach((folder: any) => {
        mergedMap.set(folder.name, { 
            ...folder, 
            fileCount: 0,
            isVirtual: false
        })
    })
    
    // Update with virtual folder file counts
    vFolders.forEach(vf => {
        if (mergedMap.has(vf.name)) {
            const existing = mergedMap.get(vf.name)
            existing.fileCount = vf.fileCount
            existing.isVirtual = true // Has files inside
        } else {
            // Legacy virtual-only folder (tag exists but no persistent record)
            mergedMap.set(vf.name, vf)
        }
    })
    
    const folderList = Array.from(mergedMap.values())
    const fileList = rootFiles.filter(f => f.type !== 'folder')
    
    return [...folderList, ...fileList]
  }
  
  // For Dropbox subfolders, show direct children only
  return data.value.filter(file => {
    if (!file.path.startsWith(path + '/')) return false
    const subPath = file.path.substring(path.length + 1)
    return !subPath.includes('/')
  })
})

const sortedFiles = computed(() => {
  const filtered = filteredFiles.value.filter(f => 
    f.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
  
  // Folders first, then files
  return filtered.sort((a, b) => {
    if (a.type === b.type) {
       // Sort by date desc
       return new Date(b.modified || 0).getTime() - new Date(a.modified || 0).getTime()
    }
    return a.type === 'folder' ? -1 : 1
  })
})

// Create Folder
const createFolder = async () => {
  if (!newFolderName.value.trim()) return
  
  isCreatingFolder.value = true
  folderError.value = ''
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const response = await $fetch<{ success: boolean, folder: any }>('/api/folder/create', {
      method: 'POST',
      body: {
        name: newFolderName.value
      },
      headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
    })
    
    // Refresh list
    await refresh()
    createFolderModalOpen.value = false
    newFolderName.value = ''
  } catch (err: any) {
    console.error('Create folder error:', err)
    folderError.value = err.statusMessage || 'Failed to create folder'
  } finally {
    isCreatingFolder.value = false
  }
}

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
// Network status tracking
const isOnline = ref(true) // Default to true for SSR

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
  if (import.meta.server) return Promise.resolve(true) // Always online on server
  
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
  isOnline.value = navigator.onLine // Sync initial state
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

// Handle external drag over (for file upload from outside browser)
const handleExternalDragOver = (e: DragEvent) => {
  // Only show upload overlay if not doing internal drag (moving files)
  if (!draggedFile.value) {
    // Check if dragging files from outside (has files in dataTransfer)
    if (e.dataTransfer?.types.includes('Files')) {
      isDragging.value = true
    }
  }
}

// Handle external drag leave
const handleExternalDragLeave = (_e: DragEvent) => {
  if (!draggedFile.value) {
    isDragging.value = false
  }
}

// Handle file drop
const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  
  // If internal drag (moving files), don't process as upload
  if (draggedFile.value) {
    return
  }
  
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
        
        // Define upload path (with folder support)
        // If currentPath is '/', upload to /uploads/filename
        // If currentPath is '/folder', upload to /folder/filename
        const basePath = currentPath.value === '/' ? '/uploads' : currentPath.value
        const uploadPath = `${basePath}/${sanitizeFilename(file.name)}`
        
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
const shareResult = ref<{ id: string; url: string; expiresAt: string | null } | null>(null)
const isSharing = ref(false)
const copied = ref(false)
const shareTab = ref<'link' | 'embed'>('link')

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
  copied.value = false
  selectedExpiration.value = 7
  shareTab.value = 'link'
  
  // Pre-populate if share exists
  if (file.shareId && file.shareUrl) {
      shareResult.value = {
          id: file.shareId,
          url: `${window.location.origin}${file.shareUrl}`,
          expiresAt: file.shareExpiresAt || null
      }
  } else {
      shareResult.value = null
  }
}

// Close share modal
const closeShareModal = () => {
  shareTarget.value = null
  shareResult.value = null
  confirmDeleteShare.value = false
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
      id: result.share.id, // Ensure ID is captured
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

// Embed Helpers
const getEmbedCode = (id: string) => {
    const origin = window.location.origin
    return `<iframe src="${origin}/embed/${id}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`
}

const copyEmbedCode = async (id: string) => {
    await navigator.clipboard.writeText(getEmbedCode(id))
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
}

// Embed URL helpers
const getEmbedUrl = (id: string) => {
    return `${window.location.origin}/embed/${id}`
}

const copyEmbedUrl = async (id: string) => {
    await navigator.clipboard.writeText(getEmbedUrl(id))
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
}

// Generate embed (auto-create share if needed)
const isGeneratingEmbed = ref(false)
const generateEmbed = async (file: FileEntry) => {
    isGeneratingEmbed.value = true
    try {
        const { data: { session } } = await supabase.auth.getSession()
        
        const result = await $fetch<{
            success: boolean
            shareId: string
            embedUrl: string
            shareUrl: string
            expiresAt: string | null
        }>('/api/embed/generate', {
            method: 'POST',
            body: { fileId: file.id },
            headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
        })
        
        // Update shareResult with generated share
        shareResult.value = {
            id: result.shareId,
            url: result.shareUrl,
            expiresAt: result.expiresAt
        }
        
        // Update local file data
        if (data.value) {
            const fileIndex = data.value.findIndex(f => f.id === file.id)
            if (fileIndex !== -1) {
                data.value[fileIndex] = {
                    ...data.value[fileIndex],
                    shareId: result.shareId,
                    shareUrl: `/file/${result.shareId}`,
                    shareExpiresAt: result.expiresAt
                }
            }
        }
        
        // Switch to embed tab
        shareTab.value = 'embed'
        
    } catch (err: any) {
        console.error('Failed to generate embed:', err)
        alert('Failed to generate embed: ' + (err.data?.message || err.message || 'Unknown error'))
    } finally {
        isGeneratingEmbed.value = false
    }
}

// Delete Share Link
const isDeletingShare = ref(false)
const confirmDeleteShare = ref(false)

const deleteShareLink = async () => {
    if (!shareResult.value?.id) return
    
    // If not confirmed yet, show confirmation UI
    if (!confirmDeleteShare.value) {
        confirmDeleteShare.value = true
        return
    }
    
    // User has confirmed, proceed with deletion
    isDeletingShare.value = true
    try {
        const { data: { session } } = await supabase.auth.getSession()
        
        await $fetch(`/api/shares/${shareResult.value.id}`, {
            method: 'DELETE',
            headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
        })
        
        // Update local file data to remove share info
        if (shareTarget.value && data.value) {
            const fileIndex = data.value.findIndex(f => f.id === shareTarget.value?.id)
            if (fileIndex !== -1) {
                data.value[fileIndex] = {
                    ...data.value[fileIndex],
                    shareId: null,
                    shareUrl: null,
                    shareExpiresAt: null
                }
            }
        }
        
        // Reset modal state
        shareResult.value = null
        closeShareModal()
        
    } catch (err: any) {
        console.error('Failed to delete share link:', err)
        alert('Failed to delete share link: ' + (err.data?.message || err.message || 'Unknown error'))
    } finally {
        isDeletingShare.value = false
        confirmDeleteShare.value = false
    }
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
const confirmDelete = (file: any) => {
  // Check if it's a virtual folder
  if (file.isVirtual || file.id?.startsWith('vf-')) {
    alert('Virtual folders cannot be deleted directly. Remove files from the folder to make it disappear.')
    return
  }
  deleteTarget.value = file
}

// Handle delete
const handleDelete = async () => {
  if (!deleteTarget.value) return
  
  // Double check it's not a virtual folder (by flag or ID pattern)
  const target = deleteTarget.value as any
  if (target.isVirtual || target.id?.startsWith('vf-')) {
    alert('Cannot delete virtual folders')
    deleteTarget.value = null
    return
  }
  
  console.log('[Delete] Deleting file:', {
    id: target.id,
    name: target.name,
    isVirtual: target.isVirtual
  })

  isDeleting.value = true
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    // Use user-safe delete endpoint (verifies file ownership)
    await $fetch('/api/files/delete', {
      method: 'POST',
      body: {
        fileId: deleteTarget.value.id
      },
      headers: session?.access_token 
        ? { Authorization: `Bearer ${session.access_token}` } 
        : undefined
    })

    // Remove from local list
    data.value = data.value?.filter(f => f.id !== deleteTarget.value?.id) || null
    deleteTarget.value = null
  } catch (err: any) {
    console.error('Delete failed:', err)
    alert('Failed to delete file: ' + (err.data?.statusMessage || err.message || 'Unknown error'))
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

// Expiry Helpers
const getExpiryColor = (dateStr: string): string => {
  const now = new Date()
  const expiry = new Date(dateStr)
  const diffTime = expiry.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays <= 3) return 'text-red-500 font-semibold'
  if (diffDays <= 7) return 'text-orange-500'
  return 'text-muted-foreground'
}

const getExpiryDistance = (dateStr: string | null): string => {
   if (!dateStr) return '';
   const now = new Date();
   const expiry = new Date(dateStr);
   const diffTime = expiry.getTime() - now.getTime();
   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
   
   if (diffDays < 0) return 'Expired';
   if (diffDays === 0) return 'Expires today';
   if (diffDays === 1) return 'Expires tomorrow';
   return `${diffDays} days left`;
}

// Row Click Handler (Unified)
const onRowClick = (file: FileEntry) => {
  // If we just finished a long press interaction (and kept mouse down), ignore click?
  // But typically standard click is fine.
  if (file.type === 'folder') {
    handleFolderClick(file)
  } else {
    openPreview(file)
  }
}
</script>
