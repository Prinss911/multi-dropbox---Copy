import { _ as __nuxt_component_0 } from './server.mjs';
import { u as useAuthFetch } from './useAuthFetch-BRq2GRoU.mjs';
import { a as useSupabaseClient } from './useSupabase-BKfis0hW.mjs';
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

const pageSize = 30;
const _sfc_main = /* @__PURE__ */ vueExports.defineComponent({
  __name: "shares",
  __ssrInlineRender: true,
  setup(__props) {
    const searchQuery = vueExports.ref("");
    const filterAccount = vueExports.ref("");
    const filterStatus = vueExports.ref("");
    const currentPage = vueExports.ref(1);
    const copiedId = vueExports.ref(null);
    const deleteTarget = vueExports.ref(null);
    const isDeleting = vueExports.ref(false);
    const selectedIds = vueExports.ref(/* @__PURE__ */ new Set());
    const showBulkDeleteModal = vueExports.ref(false);
    const isBulkDeleting = vueExports.ref(false);
    const isAllSelected = vueExports.computed(() => {
      return paginatedShares.value.length > 0 && paginatedShares.value.every((s) => selectedIds.value.has(s.id));
    });
    const isPartiallySelected = vueExports.computed(() => {
      const selectedCount = paginatedShares.value.filter((s) => selectedIds.value.has(s.id)).length;
      return selectedCount > 0 && selectedCount < paginatedShares.value.length;
    });
    useAuthFetch();
    const data = vueExports.ref(null);
    const pending = vueExports.ref(true);
    const error = vueExports.ref(null);
    const shares = vueExports.computed(() => {
      var _a;
      return ((_a = data.value) == null ? void 0 : _a.shares) || [];
    });
    const accounts = vueExports.computed(() => {
      var _a;
      return ((_a = data.value) == null ? void 0 : _a.accounts) || [];
    });
    const total = vueExports.computed(() => {
      var _a;
      return ((_a = data.value) == null ? void 0 : _a.total) || 0;
    });
    const filteredShares = vueExports.computed(() => {
      let result = [...shares.value];
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(
          (s) => s.fileName.toLowerCase().includes(query) || s.id.toLowerCase().includes(query)
        );
      }
      if (filterAccount.value) {
        result = result.filter((s) => s.accountId === filterAccount.value);
      }
      if (filterStatus.value) {
        const now = /* @__PURE__ */ new Date();
        if (filterStatus.value === "active") {
          result = result.filter((s) => !s.expiresAt || new Date(s.expiresAt) > now);
        } else if (filterStatus.value === "expired") {
          result = result.filter((s) => s.expiresAt && new Date(s.expiresAt) <= now);
        } else if (filterStatus.value === "never") {
          result = result.filter((s) => !s.expiresAt);
        }
      }
      return result;
    });
    const totalPages = vueExports.computed(() => Math.ceil(filteredShares.value.length / pageSize));
    const paginatedShares = vueExports.computed(() => {
      const start = (currentPage.value - 1) * pageSize;
      return filteredShares.value.slice(start, start + pageSize);
    });
    vueExports.watch([searchQuery, filterAccount, filterStatus], () => {
      currentPage.value = 1;
    });
    const getExtension = (name) => {
      var _a;
      return ((_a = name.split(".").pop()) == null ? void 0 : _a.toLowerCase()) || "";
    };
    const formatDate = (dateStr) => {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    };
    const formatExpiry = (expiresAt) => {
      if (!expiresAt) return "Never";
      const expiry = new Date(expiresAt);
      const now = /* @__PURE__ */ new Date();
      if (expiry <= now) return "Expired";
      const diff = expiry.getTime() - now.getTime();
      const days = Math.floor(diff / (1e3 * 60 * 60 * 24));
      const hours = Math.floor(diff % (1e3 * 60 * 60 * 24) / (1e3 * 60 * 60));
      if (days > 0) return `${days}d ${hours}h`;
      if (hours > 0) return `${hours}h`;
      return "Soon";
    };
    const getExpiryClass = (expiresAt) => {
      if (!expiresAt) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400";
      const expiry = new Date(expiresAt);
      const now = /* @__PURE__ */ new Date();
      if (expiry <= now) return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400";
      const diff = expiry.getTime() - now.getTime();
      const days = Math.floor(diff / (1e3 * 60 * 60 * 24));
      if (days < 3) return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400";
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400";
    };
    const getFileIcon = (ext) => {
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
        mp4: "text-pink-600",
        mkv: "text-pink-600",
        jpg: "text-purple-600",
        png: "text-purple-600"
      };
      return colorMap[ext] || "text-gray-600";
    };
    const accountColors = ["#0061FE", "#0070E0", "#007EE5", "#248CF2", "#4D9BF7", "#76ABFC"];
    const getAccountColor = (accountId, _accountName) => {
      const index = accounts.value.findIndex((a) => a.id === accountId);
      return accountColors[index % accountColors.length];
    };
    useSupabaseClient();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs_1(vueExports.mergeProps({ class: "h-full flex flex-col bg-background/50" }, _attrs))}><div class="sticky top-0 z-20 bg-background/95 backdrop-blur border-b px-6 py-4"><div class="w-full"><div class="flex flex-col md:flex-row md:items-center justify-between gap-4"><div><h1 class="text-xl font-semibold text-[#1E1919] dark:text-foreground">Shared Links</h1><p class="text-sm text-muted-foreground">${ssrInterpolate_1(vueExports.unref(selectedIds).size > 0 ? `${vueExports.unref(selectedIds).size} selected` : `${vueExports.unref(total)} active links across all accounts`)}</p></div><div class="flex flex-wrap items-center gap-3"><div class="relative group">`);
      _push(ssrRenderComponent_1(_component_Icon, {
        name: "lucide:search",
        class: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors"
      }, null, _parent));
      _push(`<input${ssrRenderAttr_1("value", vueExports.unref(searchQuery))} type="text" placeholder="Search links..." class="h-10 pl-9 pr-4 w-full md:w-64 rounded-full border bg-muted/20 hover:bg-muted/40 focus:bg-background focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"></div><div class="h-6 w-px bg-border mx-1 hidden md:block"></div><div class="relative"><select class="h-10 pl-3 pr-8 rounded-full border bg-muted/20 hover:bg-muted/40 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none cursor-pointer min-w-[140px]"><option value=""${ssrIncludeBooleanAttr(Array.isArray(vueExports.unref(filterAccount)) ? ssrLooseContain_1(vueExports.unref(filterAccount), "") : ssrLooseEqual_1(vueExports.unref(filterAccount), "")) ? " selected" : ""}>All Accounts</option><!--[-->`);
      ssrRenderList_1(vueExports.unref(accounts), (acc) => {
        _push(`<option${ssrRenderAttr_1("value", acc.id)}${ssrIncludeBooleanAttr(Array.isArray(vueExports.unref(filterAccount)) ? ssrLooseContain_1(vueExports.unref(filterAccount), acc.id) : ssrLooseEqual_1(vueExports.unref(filterAccount), acc.id)) ? " selected" : ""}>${ssrInterpolate_1(acc.name)}</option>`);
      });
      _push(`<!--]--></select>`);
      _push(ssrRenderComponent_1(_component_Icon, {
        name: "lucide:chevron-down",
        class: "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
      }, null, _parent));
      _push(`</div><div class="relative"><select class="h-10 pl-3 pr-8 rounded-full border bg-muted/20 hover:bg-muted/40 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none cursor-pointer"><option value=""${ssrIncludeBooleanAttr(Array.isArray(vueExports.unref(filterStatus)) ? ssrLooseContain_1(vueExports.unref(filterStatus), "") : ssrLooseEqual_1(vueExports.unref(filterStatus), "")) ? " selected" : ""}>All Status</option><option value="active"${ssrIncludeBooleanAttr(Array.isArray(vueExports.unref(filterStatus)) ? ssrLooseContain_1(vueExports.unref(filterStatus), "active") : ssrLooseEqual_1(vueExports.unref(filterStatus), "active")) ? " selected" : ""}>Active</option><option value="expired"${ssrIncludeBooleanAttr(Array.isArray(vueExports.unref(filterStatus)) ? ssrLooseContain_1(vueExports.unref(filterStatus), "expired") : ssrLooseEqual_1(vueExports.unref(filterStatus), "expired")) ? " selected" : ""}>Expired</option><option value="never"${ssrIncludeBooleanAttr(Array.isArray(vueExports.unref(filterStatus)) ? ssrLooseContain_1(vueExports.unref(filterStatus), "never") : ssrLooseEqual_1(vueExports.unref(filterStatus), "never")) ? " selected" : ""}>Never Expires</option></select>`);
      _push(ssrRenderComponent_1(_component_Icon, {
        name: "lucide:filter",
        class: "absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none"
      }, null, _parent));
      _push(`</div><button${ssrIncludeBooleanAttr(vueExports.unref(pending)) ? " disabled" : ""} class="h-10 w-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground">`);
      _push(ssrRenderComponent_1(_component_Icon, {
        name: vueExports.unref(pending) ? "lucide:loader-2" : "lucide:refresh-cw",
        class: [{ "animate-spin": vueExports.unref(pending) }, "h-4 w-4"]
      }, null, _parent));
      _push(`</button></div></div></div></div><div class="flex-1 overflow-auto px-4 md:px-6 py-6 transition-all"><div class="w-full h-full">`);
      if (vueExports.unref(selectedIds).size > 0) {
        _push(`<div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-[#1E1919] dark:bg-card rounded-full shadow-2xl border dark:border-border"><div class="flex items-center gap-2 text-white dark:text-foreground"><div class="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">${ssrInterpolate_1(vueExports.unref(selectedIds).size)}</div><span class="text-sm font-medium">selected</span></div><div class="w-px h-6 bg-white/20 dark:bg-border"></div><button class="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:copy",
          class: "h-4 w-4"
        }, null, _parent));
        _push(`<span class="hidden sm:inline">Copy Links</span></button><button${ssrIncludeBooleanAttr(vueExports.unref(isBulkDeleting)) ? " disabled" : ""} class="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium transition-colors disabled:opacity-50">`);
        if (vueExports.unref(isBulkDeleting)) {
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
        _push(`<p class="text-sm">Loading share links...</p></div>`);
      } else if (vueExports.unref(error)) {
        _push(`<div class="p-6 rounded-lg bg-red-50 text-red-600 border border-red-100 text-center mx-auto max-w-lg mt-10">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:alert-circle",
          class: "h-8 w-8 mb-2 mx-auto"
        }, null, _parent));
        _push(`<h3 class="font-medium">Failed to load shares</h3><p class="text-sm opacity-80 mt-1">${ssrInterpolate_1(vueExports.unref(error).message)}</p></div>`);
      } else if (vueExports.unref(filteredShares).length === 0) {
        _push(`<div class="h-full flex flex-col items-center justify-center p-12 text-center"><div class="h-24 w-24 mb-4 flex items-center justify-center rounded-full bg-muted/30 text-muted-foreground">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:link-2-off",
          class: "h-10 w-10 opacity-50"
        }, null, _parent));
        _push(`</div><h3 class="text-lg font-semibold text-[#1E1919] dark:text-foreground mb-2">No share links found</h3><p class="text-muted-foreground text-sm max-w-xs">${ssrInterpolate_1(vueExports.unref(searchQuery) || vueExports.unref(filterAccount) || vueExports.unref(filterStatus) ? "Try adjusting your filters." : "You haven't created any share links yet.")}</p>`);
        if (vueExports.unref(searchQuery) || vueExports.unref(filterAccount) || vueExports.unref(filterStatus)) {
          _push(`<button class="mt-4 text-[#0061FE] text-sm hover:underline"> Clear all filters </button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<div class="w-full pb-8"><table class="w-full text-left border-collapse"><thead class="sticky top-0 bg-background/95 backdrop-blur z-10"><tr><th class="py-3 px-2 border-b w-10"><input type="checkbox"${ssrIncludeBooleanAttr(vueExports.unref(isAllSelected)) ? " checked" : ""}${ssrRenderAttr_1("indeterminate", vueExports.unref(isPartiallySelected))} class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"></th><th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-[35%]">File Info</th><th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-32 hidden sm:table-cell">Account</th><th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b hidden md:table-cell">Created</th><th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">Status / Expires</th><th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-24 hidden lg:table-cell">Downloads</th><th class="py-3 px-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-28">Actions</th></tr></thead><tbody class="divide-y divide-border/40"><!--[-->`);
        ssrRenderList_1(vueExports.unref(paginatedShares), (share) => {
          _push(`<tr class="${ssrRenderClass_1([{ "bg-blue-50 dark:bg-blue-500/10": vueExports.unref(selectedIds).has(share.id) }, "group hover:bg-[#F7F9FA] dark:hover:bg-muted/20 transition-colors"])}"><td class="py-3 px-2"><input type="checkbox"${ssrIncludeBooleanAttr(vueExports.unref(selectedIds).has(share.id)) ? " checked" : ""} class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"></td><td class="py-3 px-4"><div class="flex items-center gap-4"><div class="relative shrink-0">`);
          _push(ssrRenderComponent_1(_component_Icon, {
            name: getFileIcon(getExtension(share.fileName)),
            class: ["h-8 w-8", getIconColor(getExtension(share.fileName))]
          }, null, _parent));
          _push(`</div><div class="min-w-0"><p class="font-medium text-sm text-[#1E1919] dark:text-foreground truncate"${ssrRenderAttr_1("title", share.fileName)}>${ssrInterpolate_1(share.fileName)}</p><p class="text-xs text-muted-foreground font-mono truncate opacity-60 mt-0.5">ID: ${ssrInterpolate_1(share.id.substring(0, 8))}...</p></div></div></td><td class="py-3 px-4 hidden sm:table-cell"><span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap" style="${ssrRenderStyle_1({
            backgroundColor: getAccountColor(share.accountId, share.accountName) + "15",
            color: getAccountColor(share.accountId, share.accountName)
          })}"><span class="w-1.5 h-1.5 rounded-full shrink-0" style="${ssrRenderStyle_1({ backgroundColor: getAccountColor(share.accountId, share.accountName) })}"></span><span class="truncate max-w-[120px]">${ssrInterpolate_1(share.accountName)}</span></span></td><td class="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">${ssrInterpolate_1(formatDate(share.createdAt))}</td><td class="py-3 px-4"><span class="${ssrRenderClass_1([getExpiryClass(share.expiresAt), "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary"])}"><span class="h-1.5 w-1.5 rounded-full bg-current opacity-60"></span> ${ssrInterpolate_1(formatExpiry(share.expiresAt))}</span></td><td class="py-3 px-4 text-sm hidden lg:table-cell text-muted-foreground"><div class="flex items-center gap-1.5">`);
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:download",
            class: "h-3 w-3 opacity-50"
          }, null, _parent));
          _push(`<span class="font-mono">${ssrInterpolate_1(share.downloadCount)}</span></div></td><td class="py-3 px-4 text-right"><div class="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"><button title="Open Link" class="h-8 w-8 flex items-center justify-center rounded hover:bg-white hover:text-[#0061FE] hover:shadow-sm transition-all text-muted-foreground">`);
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:external-link",
            class: "h-4 w-4"
          }, null, _parent));
          _push(`</button><button title="Copy Link" class="h-8 w-8 flex items-center justify-center rounded hover:bg-white hover:text-green-600 hover:shadow-sm transition-all text-muted-foreground">`);
          _push(ssrRenderComponent_1(_component_Icon, {
            name: vueExports.unref(copiedId) === share.id ? "lucide:check" : "lucide:copy",
            class: "h-4 w-4"
          }, null, _parent));
          _push(`</button><button title="Delete Link" class="h-8 w-8 flex items-center justify-center rounded hover:bg-white hover:text-red-600 hover:shadow-sm transition-all text-muted-foreground">`);
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
        if (vueExports.unref(deleteTarget)) {
          _push2(`<div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1E1919]/60 backdrop-blur-[2px]"><div class="bg-card w-full max-w-[400px] rounded-xl shadow-2xl border-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6"><div class="flex flex-col items-center text-center gap-4"><div class="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-2">`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:alert-triangle",
            class: "h-6 w-6"
          }, null, _parent));
          _push2(`</div><div><h3 class="text-lg font-semibold text-[#1E1919] dark:text-foreground">Delete Share Link?</h3><p class="text-sm text-muted-foreground mt-2 px-4"> This will permanently remove the share link for <br><span class="font-medium text-foreground">${ssrInterpolate_1(vueExports.unref(deleteTarget).fileName)}</span>. </p><p class="text-xs text-red-500/80 mt-2 font-medium">This action cannot be undone.</p></div><div class="flex gap-3 w-full mt-2"><button class="flex-1 h-10 rounded-lg border hover:bg-muted transition-colors text-sm font-medium"> Cancel </button><button${ssrIncludeBooleanAttr(vueExports.unref(isDeleting)) ? " disabled" : ""} class="flex-1 h-10 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-70">`);
          if (vueExports.unref(isDeleting)) {
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:loader-2",
              class: "h-4 w-4 animate-spin"
            }, null, _parent));
          } else {
            _push2(`<!---->`);
          }
          _push2(` ${ssrInterpolate_1(vueExports.unref(isDeleting) ? "Deleting..." : "Delete")}</button></div></div></div></div>`);
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
          _push2(`</div><div><h3 class="text-lg font-semibold text-[#1E1919] dark:text-foreground">Delete ${ssrInterpolate_1(vueExports.unref(selectedIds).size)} Share Links?</h3><p class="text-sm text-muted-foreground mt-2 px-4"> This will permanently remove all selected share links. The original files will not be deleted. </p><p class="text-xs text-red-500/80 mt-2 font-medium">This action cannot be undone.</p></div><div class="flex gap-3 w-full mt-2"><button class="flex-1 h-10 rounded-lg border hover:bg-muted transition-colors text-sm font-medium"> Cancel </button><button${ssrIncludeBooleanAttr(vueExports.unref(isBulkDeleting)) ? " disabled" : ""} class="flex-1 h-10 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-70">`);
          if (vueExports.unref(isBulkDeleting)) {
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:loader-2",
              class: "h-4 w-4 animate-spin"
            }, null, _parent));
          } else {
            _push2(`<!---->`);
          }
          _push2(` ${ssrInterpolate_1(vueExports.unref(isBulkDeleting) ? "Deleting..." : "Delete All")}</button></div></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/shares.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=shares-CWWoJPgS.mjs.map
