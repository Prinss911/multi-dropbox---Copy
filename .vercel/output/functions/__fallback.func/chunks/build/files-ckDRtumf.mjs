import { _ as __nuxt_component_0 } from './server.mjs';
import { u as useAuthFetch } from './useAuthFetch-BRq2GRoU.mjs';
import { v as vueExports, s as ssrRenderAttrs_1, b as ssrInterpolate_1, a as ssrRenderComponent_1, i as ssrRenderAttr_1, l as ssrIncludeBooleanAttr, m as ssrLooseContain_1, n as ssrLooseEqual_1, f as ssrRenderList_1, h as ssrRenderClass_1, j as ssrRenderStyle_1, k as ssrRenderTeleport_1 } from '../routes/renderer.mjs';
import '../_/nitro.mjs';
import 'crypto';
import 'util';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:crypto';
import 'node:util';
import 'node:path';
import 'node:process';
import 'node:tty';
import 'node:fs';
import 'node:stream';
import './useSupabase-BKfis0hW.mjs';

const pageSize = 50;
const _sfc_main = /* @__PURE__ */ vueExports.defineComponent({
  __name: "files",
  __ssrInlineRender: true,
  setup(__props) {
    const searchQuery = vueExports.ref("");
    const filterAccount = vueExports.ref("");
    const sortBy = vueExports.ref("modified");
    const currentPage = vueExports.ref(1);
    useAuthFetch();
    const data = vueExports.ref(null);
    const pending = vueExports.ref(true);
    const error = vueExports.ref(null);
    const files = vueExports.computed(() => {
      var _a;
      return ((_a = data.value) == null ? void 0 : _a.files) || [];
    });
    const accounts = vueExports.computed(() => {
      var _a;
      return ((_a = data.value) == null ? void 0 : _a.accounts) || [];
    });
    const totalFiles = vueExports.computed(() => {
      var _a;
      return ((_a = data.value) == null ? void 0 : _a.totalFiles) || 0;
    });
    const totalAccounts = vueExports.computed(() => {
      var _a;
      return ((_a = data.value) == null ? void 0 : _a.totalAccounts) || 0;
    });
    const selectedIds = vueExports.ref(/* @__PURE__ */ new Set());
    const showBulkDeleteModal = vueExports.ref(false);
    const isBulkDeleting = vueExports.ref(false);
    const isBulkDownloading = vueExports.ref(false);
    const isAllSelected = vueExports.computed(() => {
      return paginatedFiles.value.length > 0 && paginatedFiles.value.every((f) => selectedIds.value.has(f.id));
    });
    const isPartiallySelected = vueExports.computed(() => {
      const selectedCount = paginatedFiles.value.filter((f) => selectedIds.value.has(f.id)).length;
      return selectedCount > 0 && selectedCount < paginatedFiles.value.length;
    });
    const sortedFiles = vueExports.computed(() => {
      let result = [...files.value];
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(
          (f) => f.name.toLowerCase().includes(query) || f.path.toLowerCase().includes(query)
        );
      }
      if (filterAccount.value) {
        result = result.filter((f) => f.accountId === filterAccount.value);
      }
      if (sortBy.value === "name") {
        result.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy.value === "size") {
        result.sort((a, b) => b.size - a.size);
      } else {
        result.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
      }
      return result;
    });
    const totalPages = vueExports.computed(() => Math.ceil(sortedFiles.value.length / pageSize));
    const paginatedFiles = vueExports.computed(() => {
      const start = (currentPage.value - 1) * pageSize;
      return sortedFiles.value.slice(start, start + pageSize);
    });
    vueExports.watch([searchQuery, filterAccount, sortBy], () => {
      currentPage.value = 1;
    });
    const getFolder = (path) => {
      const parts = path.split("/");
      parts.pop();
      return parts.join("/") || "/";
    };
    const shareTarget = vueExports.ref(null);
    const shareResult = vueExports.ref(null);
    const isSharing = vueExports.ref(false);
    const copied = vueExports.ref(false);
    const expirationOptions = [
      { days: 1, unit: "days", label: "1 Day" },
      { days: 3, unit: "days", label: "3 Days" },
      { days: 7, unit: "days", label: "7 Days" },
      { days: 30, unit: "days", label: "1 Month" },
      { days: 90, unit: "days", label: "3 Months" },
      { days: "never", unit: "days", label: "Never" }
    ];
    const selectedExpiration = vueExports.ref(7);
    vueExports.ref("days");
    const formatExpiry = (dateStr) => {
      if (!dateStr) return "Never";
      return new Date(dateStr).toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    };
    const formatBytes = (bytes) => {
      if (!bytes || bytes === 0) return "-";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };
    const formatDate = (dateStr) => {
      if (!dateStr) return "-";
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    };
    const getFileIcon = (ext) => {
      if (!ext) return "lucide:file";
      const map = {
        png: "lucide:image",
        jpg: "lucide:image",
        jpeg: "lucide:image",
        gif: "lucide:image",
        webp: "lucide:image",
        pdf: "lucide:file-text",
        doc: "lucide:file-text",
        docx: "lucide:file-text",
        xls: "lucide:file-spreadsheet",
        xlsx: "lucide:file-spreadsheet",
        mp4: "lucide:file-video",
        mkv: "lucide:file-video",
        avi: "lucide:file-video",
        mov: "lucide:file-video",
        mp3: "lucide:file-audio",
        wav: "lucide:file-audio",
        flac: "lucide:file-audio",
        zip: "lucide:file-archive",
        rar: "lucide:file-archive",
        "7z": "lucide:file-archive"
      };
      return map[ext] || "lucide:file";
    };
    const getIconColor = (ext) => {
      const colorMap = {
        pdf: "text-red-600",
        doc: "text-blue-600",
        docx: "text-blue-600",
        xls: "text-green-600",
        xlsx: "text-green-600",
        jpg: "text-purple-600",
        jpeg: "text-purple-600",
        png: "text-purple-600",
        gif: "text-purple-600",
        webp: "text-purple-600",
        mp4: "text-pink-600",
        mkv: "text-pink-600",
        avi: "text-pink-600",
        mov: "text-pink-600",
        mp3: "text-indigo-600",
        wav: "text-indigo-600",
        flac: "text-indigo-600",
        zip: "text-amber-600",
        rar: "text-amber-600",
        "7z": "text-amber-600"
      };
      return colorMap[ext || ""] || "text-gray-600";
    };
    const accountColors = ["#0061FE", "#0070E0", "#007EE5", "#248CF2", "#4D9BF7", "#76ABFC"];
    const getAccountColor = (accountId) => {
      const index = accounts.value.findIndex((a) => a.id === accountId);
      return accountColors[index % accountColors.length];
    };
    const deleteTarget = vueExports.ref(null);
    const isDeleting = vueExports.ref(false);
    const previewTarget = vueExports.ref(null);
    const previewUrl = vueExports.ref(null);
    const isLoadingPreview = vueExports.ref(false);
    const isImageFile = (ext) => {
      if (!ext) return false;
      return ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext.toLowerCase());
    };
    const isVideoFile = (ext) => {
      if (!ext) return false;
      return ["mp4", "mkv", "avi", "mov", "webm", "wmv", "flv"].includes(ext.toLowerCase());
    };
    const isAudioFile = (ext) => {
      if (!ext) return false;
      return ["mp3", "wav", "flac", "aac", "ogg", "m4a", "wma"].includes(ext.toLowerCase());
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs_1(vueExports.mergeProps({ class: "h-full flex flex-col bg-background/50" }, _attrs))}><div class="sticky top-0 z-20 bg-background/95 backdrop-blur border-b px-6 py-4"><div class="w-full"><div class="flex flex-col md:flex-row md:items-center justify-between gap-4"><div><h1 class="text-xl font-semibold text-[#1E1919] dark:text-foreground">All Files</h1><p class="text-sm text-muted-foreground">${ssrInterpolate_1(vueExports.unref(selectedIds).size > 0 ? `${vueExports.unref(selectedIds).size} selected` : `${vueExports.unref(totalFiles)} files across ${vueExports.unref(totalAccounts)} accounts`)}</p></div><div class="flex flex-wrap items-center gap-3"><div class="relative group">`);
      _push(ssrRenderComponent_1(_component_Icon, {
        name: "lucide:search",
        class: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors"
      }, null, _parent));
      _push(`<input${ssrRenderAttr_1("value", vueExports.unref(searchQuery))} type="text" placeholder="Search files..." class="h-10 pl-9 pr-4 w-full md:w-64 rounded-full border bg-muted/20 hover:bg-muted/40 focus:bg-background focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"></div><div class="h-6 w-px bg-border mx-1 hidden md:block"></div><div class="relative"><select class="h-10 pl-3 pr-8 rounded-full border bg-muted/20 hover:bg-muted/40 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none cursor-pointer min-w-[140px]"><option value=""${ssrIncludeBooleanAttr(Array.isArray(vueExports.unref(filterAccount)) ? ssrLooseContain_1(vueExports.unref(filterAccount), "") : ssrLooseEqual_1(vueExports.unref(filterAccount), "")) ? " selected" : ""}>All Accounts</option><!--[-->`);
      ssrRenderList_1(vueExports.unref(accounts), (acc) => {
        _push(`<option${ssrRenderAttr_1("value", acc.id)}${ssrIncludeBooleanAttr(Array.isArray(vueExports.unref(filterAccount)) ? ssrLooseContain_1(vueExports.unref(filterAccount), acc.id) : ssrLooseEqual_1(vueExports.unref(filterAccount), acc.id)) ? " selected" : ""}>${ssrInterpolate_1(acc.name)}</option>`);
      });
      _push(`<!--]--></select>`);
      _push(ssrRenderComponent_1(_component_Icon, {
        name: "lucide:chevron-down",
        class: "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
      }, null, _parent));
      _push(`</div><div class="relative"><select class="h-10 pl-3 pr-8 rounded-full border bg-muted/20 hover:bg-muted/40 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none cursor-pointer"><option value="modified"${ssrIncludeBooleanAttr(Array.isArray(vueExports.unref(sortBy)) ? ssrLooseContain_1(vueExports.unref(sortBy), "modified") : ssrLooseEqual_1(vueExports.unref(sortBy), "modified")) ? " selected" : ""}>Date Modified</option><option value="name"${ssrIncludeBooleanAttr(Array.isArray(vueExports.unref(sortBy)) ? ssrLooseContain_1(vueExports.unref(sortBy), "name") : ssrLooseEqual_1(vueExports.unref(sortBy), "name")) ? " selected" : ""}>Name (A-Z)</option><option value="size"${ssrIncludeBooleanAttr(Array.isArray(vueExports.unref(sortBy)) ? ssrLooseContain_1(vueExports.unref(sortBy), "size") : ssrLooseEqual_1(vueExports.unref(sortBy), "size")) ? " selected" : ""}>File Size</option></select>`);
      _push(ssrRenderComponent_1(_component_Icon, {
        name: "lucide:arrow-up-down",
        class: "absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none"
      }, null, _parent));
      _push(`</div><button${ssrIncludeBooleanAttr(vueExports.unref(pending)) ? " disabled" : ""} class="h-10 w-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground">`);
      _push(ssrRenderComponent_1(_component_Icon, {
        name: vueExports.unref(pending) ? "lucide:loader-2" : "lucide:refresh-cw",
        class: [{ "animate-spin": vueExports.unref(pending) }, "h-4 w-4"]
      }, null, _parent));
      _push(`</button></div></div></div></div><div class="flex-1 overflow-auto px-4 md:px-6 py-6 transition-all"><div class="w-full h-full">`);
      if (vueExports.unref(selectedIds).size > 0) {
        _push(`<div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-[#1E1919] dark:bg-card rounded-full shadow-2xl border dark:border-border"><div class="flex items-center gap-2 text-white dark:text-foreground"><div class="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">${ssrInterpolate_1(vueExports.unref(selectedIds).size)}</div><span class="text-sm font-medium">selected</span></div><div class="w-px h-6 bg-white/20 dark:bg-border"></div><button${ssrIncludeBooleanAttr(vueExports.unref(isBulkDownloading)) ? " disabled" : ""} class="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors disabled:opacity-50">`);
        if (vueExports.unref(isBulkDownloading)) {
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:loader-2",
            class: "h-4 w-4 animate-spin"
          }, null, _parent));
        } else {
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:download",
            class: "h-4 w-4"
          }, null, _parent));
        }
        _push(`<span class="hidden sm:inline">Download</span></button><button${ssrIncludeBooleanAttr(vueExports.unref(isDeleting)) ? " disabled" : ""} class="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium transition-colors disabled:opacity-50">`);
        if (vueExports.unref(isDeleting)) {
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:loader-2",
            class: "h-4 w-4 animate-spin"
          }, null, _parent));
        } else {
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:trash-2",
            class: "h-4 w-4"
          }, null, _parent));
        }
        _push(`<span class="hidden sm:inline">Delete</span></button><div class="w-px h-6 bg-white/20 dark:bg-border"></div><button class="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors" title="Clear selection">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:x",
          class: "h-4 w-4"
        }, null, _parent));
        _push(`</button></div>`);
      } else {
        _push(`<!---->`);
      }
      if (vueExports.unref(pending)) {
        _push(`<div class="h-full flex flex-col items-center justify-center text-muted-foreground">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:loader-2",
          class: "animate-spin h-8 w-8 text-[#0061FE] mb-4"
        }, null, _parent));
        _push(`<p class="text-sm">Fetching files list...</p></div>`);
      } else if (vueExports.unref(error)) {
        _push(`<div class="p-6 rounded-lg bg-red-50 text-red-600 border border-red-100 text-center mx-auto max-w-lg mt-10">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:alert-circle",
          class: "h-8 w-8 mb-2 mx-auto"
        }, null, _parent));
        _push(`<h3 class="font-medium">Failed to load files</h3><p class="text-sm opacity-80 mt-1">${ssrInterpolate_1(vueExports.unref(error).message)}</p></div>`);
      } else if (vueExports.unref(sortedFiles).length === 0) {
        _push(`<div class="h-full flex flex-col items-center justify-center p-12 text-center"><div class="h-24 w-24 mb-4 flex items-center justify-center rounded-full bg-muted/30 text-muted-foreground">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:search-x",
          class: "h-10 w-10 opacity-50"
        }, null, _parent));
        _push(`</div><h3 class="text-lg font-semibold text-[#1E1919] dark:text-foreground mb-2">No files found</h3><p class="text-muted-foreground text-sm max-w-xs">${ssrInterpolate_1(vueExports.unref(searchQuery) || vueExports.unref(filterAccount) ? "No matches for your filters." : "Your storage is completely empty.")}</p>`);
        if (vueExports.unref(searchQuery) || vueExports.unref(filterAccount)) {
          _push(`<button class="mt-4 text-[#0061FE] text-sm hover:underline"> Clear all filters </button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<div class="w-full pb-8"><table class="w-full text-left border-collapse"><thead class="sticky top-0 bg-background/95 backdrop-blur z-10"><tr><th class="py-3 px-2 border-b w-10"><input type="checkbox"${ssrIncludeBooleanAttr(vueExports.unref(isAllSelected)) ? " checked" : ""}${ssrRenderAttr_1("indeterminate", vueExports.unref(isPartiallySelected))} class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"></th><th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-[35%]">File Name</th><th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-32 hidden sm:table-cell">Account</th><th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b hidden md:table-cell">Location</th><th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-24 hidden lg:table-cell">Size</th><th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-32 hidden xl:table-cell">Modified</th><th class="py-3 px-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-24">Actions</th></tr></thead><tbody class="divide-y divide-border/40"><!--[-->`);
        ssrRenderList_1(vueExports.unref(paginatedFiles), (file) => {
          _push(`<tr class="${ssrRenderClass_1([{ "bg-blue-50 dark:bg-blue-500/10": vueExports.unref(selectedIds).has(file.id) }, "group hover:bg-[#F7F9FA] dark:hover:bg-muted/20 transition-colors"])}"><td class="py-3 px-2"><input type="checkbox"${ssrIncludeBooleanAttr(vueExports.unref(selectedIds).has(file.id)) ? " checked" : ""} class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"></td><td class="py-3 px-4"><div class="flex items-center gap-4"><div class="relative shrink-0">`);
          _push(ssrRenderComponent_1(_component_Icon, {
            name: getFileIcon(file.extension),
            class: ["h-8 w-8", getIconColor(file.extension)]
          }, null, _parent));
          _push(`</div><div class="min-w-0"><p class="font-medium text-sm text-[#1E1919] dark:text-foreground truncate cursor-pointer hover:text-[#0061FE] transition-colors"${ssrRenderAttr_1("title", file.name)}>${ssrInterpolate_1(file.name)}</p><div class="flex items-center gap-2 mt-0.5 lg:hidden"><span class="text-xs text-muted-foreground">${ssrInterpolate_1(formatBytes(file.size))}</span></div></div></div></td><td class="py-3 px-4 hidden sm:table-cell"><span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap" style="${ssrRenderStyle_1({
            backgroundColor: getAccountColor(file.accountId) + "15",
            color: getAccountColor(file.accountId)
          })}"><span class="w-1.5 h-1.5 rounded-full shrink-0" style="${ssrRenderStyle_1({ backgroundColor: getAccountColor(file.accountId) })}"></span><span class="truncate max-w-[120px]">${ssrInterpolate_1(file.accountName)}</span></span></td><td class="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell"><div class="flex items-center gap-1.5 max-w-[200px]">`);
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:folder",
            class: "h-3 w-3 opacity-50 shrink-0"
          }, null, _parent));
          _push(`<span class="truncate"${ssrRenderAttr_1("title", file.path)}>${ssrInterpolate_1(getFolder(file.path))}</span></div></td><td class="py-3 px-4 text-xs font-mono text-muted-foreground hidden lg:table-cell">${ssrInterpolate_1(formatBytes(file.size))}</td><td class="py-3 px-4 text-xs text-muted-foreground hidden xl:table-cell">${ssrInterpolate_1(formatDate(file.modified))}</td><td class="py-3 px-4 text-right"><div class="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"><button title="Download" class="h-8 w-8 flex items-center justify-center rounded hover:bg-white hover:text-[#0061FE] hover:shadow-sm transition-all text-muted-foreground">`);
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:download",
            class: "h-4 w-4"
          }, null, _parent));
          _push(`</button><button title="Preview" class="h-8 w-8 flex items-center justify-center rounded hover:bg-purple-50 hover:text-purple-600 hover:shadow-sm transition-all text-muted-foreground">`);
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:eye",
            class: "h-4 w-4"
          }, null, _parent));
          _push(`</button><button title="Share" class="h-8 w-8 flex items-center justify-center rounded hover:bg-[#0061FE] hover:text-white hover:shadow-sm transition-all text-muted-foreground">`);
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:share-2",
            class: "h-4 w-4"
          }, null, _parent));
          _push(`</button><button title="Delete" class="h-8 w-8 flex items-center justify-center rounded hover:bg-red-50 hover:text-red-600 hover:shadow-sm transition-all text-muted-foreground">`);
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:trash-2",
            class: "h-4 w-4"
          }, null, _parent));
          _push(`</button></div></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      }
      if (vueExports.unref(totalPages) > 1) {
        _push(`<div class="flex justify-center mt-4 pb-8"><div class="flex items-center gap-1 bg-muted/30 p-1 rounded-full"><button${ssrIncludeBooleanAttr(vueExports.unref(currentPage) === 1) ? " disabled" : ""} class="h-8 w-8 flex items-center justify-center rounded-full hover:bg-background disabled:opacity-50 transition-all text-muted-foreground">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:chevron-left",
          class: "h-4 w-4"
        }, null, _parent));
        _push(`</button><div class="px-4 text-xs font-medium text-muted-foreground"> Page ${ssrInterpolate_1(vueExports.unref(currentPage))} of ${ssrInterpolate_1(vueExports.unref(totalPages))}</div><button${ssrIncludeBooleanAttr(vueExports.unref(currentPage) === vueExports.unref(totalPages)) ? " disabled" : ""} class="h-8 w-8 flex items-center justify-center rounded-full hover:bg-background disabled:opacity-50 transition-all text-muted-foreground">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:chevron-right",
          class: "h-4 w-4"
        }, null, _parent));
        _push(`</button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      ssrRenderTeleport_1(_push, (_push2) => {
        if (vueExports.unref(shareTarget)) {
          _push2(`<div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1E1919]/60 backdrop-blur-[2px]"><div class="bg-card w-full max-w-[480px] rounded-xl shadow-2xl border-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200"><div class="px-6 py-5 border-b bg-background flex items-center justify-between"><h3 class="font-semibold text-lg text-[#1E1919] dark:text-foreground">Share File</h3><button class="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors">`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:x",
            class: "h-5 w-5"
          }, null, _parent));
          _push2(`</button></div><div class="p-6"><div class="flex items-center gap-4 mb-6"><div class="h-10 w-10 flex items-center justify-center">`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: getFileIcon(vueExports.unref(shareTarget).extension),
            class: ["h-10 w-10", getIconColor(vueExports.unref(shareTarget).extension)]
          }, null, _parent));
          _push2(`</div><div class="min-w-0"><h4 class="font-medium text-sm truncate">${ssrInterpolate_1(vueExports.unref(shareTarget).name)}</h4><div class="flex text-xs text-muted-foreground gap-2"><span>${ssrInterpolate_1(formatBytes(vueExports.unref(shareTarget).size))}</span><span>\u2022</span><span class="text-[#0061FE]">${ssrInterpolate_1(vueExports.unref(shareTarget).accountName)}</span></div></div></div>`);
          if (vueExports.unref(shareResult)) {
            _push2(`<div class="space-y-5"><div class="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg flex gap-3 border border-green-100 dark:border-green-800/30"><div class="mt-0.5">`);
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:check-circle-2",
              class: "h-5 w-5 text-green-600"
            }, null, _parent));
            _push2(`</div><div><p class="text-sm font-medium text-green-800 dark:text-green-300">Link created</p><p class="text-xs text-green-600 dark:text-green-400 mt-0.5">Expires: ${ssrInterpolate_1(formatExpiry(vueExports.unref(shareResult).expiresAt))}</p></div></div><div class="space-y-2"><label class="text-xs font-bold uppercase text-muted-foreground tracking-wider">Public Link</label><div class="flex gap-2"><div class="flex-1 relative"><input type="text"${ssrRenderAttr_1("value", vueExports.unref(shareResult).url)} readonly class="w-full h-11 pl-3 pr-10 bg-muted/30 border rounded-md text-sm font-mono text-foreground focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"></div><button class="h-11 px-6 rounded-md bg-[#0061FE] hover:bg-[#0057E5] text-white font-medium text-sm transition-colors flex items-center gap-2">`);
            if (vueExports.unref(copied)) {
              _push2(ssrRenderComponent_1(_component_Icon, {
                name: "lucide:check",
                class: "h-4 w-4"
              }, null, _parent));
            } else {
              _push2(ssrRenderComponent_1(_component_Icon, {
                name: "lucide:copy",
                class: "h-4 w-4"
              }, null, _parent));
            }
            _push2(` ${ssrInterpolate_1(vueExports.unref(copied) ? "Copied" : "Copy")}</button></div></div></div>`);
          } else {
            _push2(`<div class="space-y-6"><div><label class="text-sm font-medium text-foreground mb-3 block">Link settings</label><div class="grid grid-cols-2 gap-2"><!--[-->`);
            ssrRenderList_1(expirationOptions, (option) => {
              _push2(`<button class="${ssrRenderClass_1([
                "px-3 py-2.5 rounded-lg text-sm font-medium transition-all border text-left flex items-center justify-between",
                vueExports.unref(selectedExpiration) === option.days ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-card hover:bg-muted border-input text-muted-foreground"
              ])}">${ssrInterpolate_1(option.label)} `);
              if (vueExports.unref(selectedExpiration) === option.days) {
                _push2(ssrRenderComponent_1(_component_Icon, {
                  name: "lucide:check",
                  class: "h-4 w-4"
                }, null, _parent));
              } else {
                _push2(`<!---->`);
              }
              _push2(`</button>`);
            });
            _push2(`<!--]--></div></div><button${ssrIncludeBooleanAttr(vueExports.unref(isSharing)) ? " disabled" : ""} class="w-full h-12 rounded-lg bg-[#0061FE] hover:bg-[#0057E5] text-white font-semibold text-base shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2">`);
            if (vueExports.unref(isSharing)) {
              _push2(ssrRenderComponent_1(_component_Icon, {
                name: "lucide:loader-2",
                class: "h-5 w-5 animate-spin"
              }, null, _parent));
            } else {
              _push2(`<span>Generate Link</span>`);
            }
            _push2(`</button></div>`);
          }
          _push2(`</div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport_1(_push, (_push2) => {
        if (vueExports.unref(deleteTarget)) {
          _push2(`<div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1E1919]/60 backdrop-blur-[2px]"><div class="bg-card w-full max-w-[400px] rounded-xl shadow-2xl border-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200"><div class="px-6 py-5 border-b bg-background flex items-center gap-3"><div class="p-2 rounded-full bg-red-100">`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:trash-2",
            class: "h-5 w-5 text-red-600"
          }, null, _parent));
          _push2(`</div><h3 class="font-semibold text-lg text-[#1E1919] dark:text-foreground">Delete File</h3></div><div class="p-6"><p class="text-muted-foreground mb-2"> Are you sure you want to delete this file? </p><div class="flex items-center gap-3 p-3 bg-muted/30 rounded-lg mb-4">`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: getFileIcon(vueExports.unref(deleteTarget).extension),
            class: ["h-8 w-8", getIconColor(vueExports.unref(deleteTarget).extension)]
          }, null, _parent));
          _push2(`<div class="min-w-0"><p class="font-medium text-sm truncate">${ssrInterpolate_1(vueExports.unref(deleteTarget).name)}</p><p class="text-xs text-muted-foreground">${ssrInterpolate_1(formatBytes(vueExports.unref(deleteTarget).size))} \u2022 ${ssrInterpolate_1(vueExports.unref(deleteTarget).accountName)}</p></div></div><p class="text-xs text-muted-foreground mb-6"> The file will be moved to trash and automatically deleted after 30 days. </p><div class="flex gap-3 justify-end"><button class="px-4 py-2 rounded-lg text-sm font-medium border border-input bg-background hover:bg-muted transition-colors"> Cancel </button><button${ssrIncludeBooleanAttr(vueExports.unref(isDeleting)) ? " disabled" : ""} class="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50">`);
          if (vueExports.unref(isDeleting)) {
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:loader-2",
              class: "h-4 w-4 animate-spin"
            }, null, _parent));
          } else {
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:trash-2",
              class: "h-4 w-4"
            }, null, _parent));
          }
          _push2(` Delete </button></div></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport_1(_push, (_push2) => {
        if (vueExports.unref(previewTarget)) {
          _push2(`<div class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90"><button class="absolute top-4 right-4 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:x",
            class: "h-6 w-6"
          }, null, _parent));
          _push2(`</button><div class="absolute top-4 left-4 z-10 flex items-center gap-3 max-w-[50%]">`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: getFileIcon(vueExports.unref(previewTarget).extension),
            class: "h-8 w-8 text-white shrink-0"
          }, null, _parent));
          _push2(`<div class="min-w-0"><p class="text-white font-medium truncate">${ssrInterpolate_1(vueExports.unref(previewTarget).name)}</p><p class="text-white/60 text-sm">${ssrInterpolate_1(formatBytes(vueExports.unref(previewTarget).size))} \u2022 ${ssrInterpolate_1(vueExports.unref(previewTarget).accountName)}</p></div></div><div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2"><button class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-2">`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:download",
            class: "h-4 w-4"
          }, null, _parent));
          _push2(` Download </button><button class="px-4 py-2 rounded-lg bg-[#0061FE] hover:bg-[#0057E5] text-white transition-colors flex items-center gap-2">`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:share-2",
            class: "h-4 w-4"
          }, null, _parent));
          _push2(` Share </button></div><div class="max-w-[90vw] max-h-[80vh] flex items-center justify-center">`);
          if (vueExports.unref(isLoadingPreview)) {
            _push2(`<div class="flex flex-col items-center gap-4 text-white">`);
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:loader-2",
              class: "h-12 w-12 animate-spin"
            }, null, _parent));
            _push2(`<p>Loading preview...</p></div>`);
          } else if (vueExports.unref(previewUrl) && isImageFile(vueExports.unref(previewTarget).extension)) {
            _push2(`<img${ssrRenderAttr_1("src", vueExports.unref(previewUrl))}${ssrRenderAttr_1("alt", vueExports.unref(previewTarget).name)} class="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl">`);
          } else if (vueExports.unref(previewUrl) && isVideoFile(vueExports.unref(previewTarget).extension)) {
            _push2(`<video${ssrRenderAttr_1("src", vueExports.unref(previewUrl))} controls autoplay class="max-w-full max-h-[80vh] rounded-lg shadow-2xl"></video>`);
          } else if (vueExports.unref(previewUrl) && isAudioFile(vueExports.unref(previewTarget).extension)) {
            _push2(`<div class="bg-card p-8 rounded-xl shadow-2xl text-center">`);
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: getFileIcon(vueExports.unref(previewTarget).extension),
              class: "h-24 w-24 mx-auto mb-4 text-indigo-500"
            }, null, _parent));
            _push2(`<p class="font-medium text-lg mb-4">${ssrInterpolate_1(vueExports.unref(previewTarget).name)}</p><audio${ssrRenderAttr_1("src", vueExports.unref(previewUrl))} controls autoplay class="w-full max-w-md"></audio></div>`);
          } else if (vueExports.unref(previewUrl)) {
            _push2(`<div class="bg-card p-8 rounded-xl shadow-2xl text-center max-w-md">`);
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: getFileIcon(vueExports.unref(previewTarget).extension),
              class: ["h-24 w-24 mx-auto mb-4", getIconColor(vueExports.unref(previewTarget).extension)]
            }, null, _parent));
            _push2(`<p class="font-medium text-lg mb-2">${ssrInterpolate_1(vueExports.unref(previewTarget).name)}</p><p class="text-muted-foreground text-sm mb-6">${ssrInterpolate_1(formatBytes(vueExports.unref(previewTarget).size))}</p><p class="text-sm text-muted-foreground mb-4">Preview not available for this file type</p><button class="px-6 py-2 rounded-lg bg-[#0061FE] hover:bg-[#0057E5] text-white transition-colors"> Open in New Tab </button></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport_1(_push, (_push2) => {
        if (vueExports.unref(showBulkDeleteModal)) {
          _push2(`<div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1E1919]/60 backdrop-blur-[2px]"><div class="bg-card w-full max-w-[400px] rounded-xl shadow-2xl border-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6"><div class="flex flex-col items-center text-center gap-4"><div class="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-2">`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:trash-2",
            class: "h-6 w-6"
          }, null, _parent));
          _push2(`</div><div><h3 class="text-lg font-semibold text-[#1E1919] dark:text-foreground">Delete ${ssrInterpolate_1(vueExports.unref(selectedIds).size)} Files?</h3><p class="text-sm text-muted-foreground mt-2 px-4"> This will move selected files to Trash. You can restore them within 30 days. </p></div><div class="flex gap-3 w-full mt-2"><button class="flex-1 h-10 rounded-lg border hover:bg-muted transition-colors text-sm font-medium"> Cancel </button><button${ssrIncludeBooleanAttr(vueExports.unref(isBulkDeleting)) ? " disabled" : ""} class="flex-1 h-10 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-70">`);
          if (vueExports.unref(isBulkDeleting)) {
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:loader-2",
              class: "h-4 w-4 animate-spin"
            }, null, _parent));
          } else {
            _push2(`<!---->`);
          }
          _push2(` ${ssrInterpolate_1(vueExports.unref(isBulkDeleting) ? "Deleting..." : "Move to Trash")}</button></div></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/files.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=files-ckDRtumf.mjs.map
