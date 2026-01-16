import { _ as __nuxt_component_0 } from './server.mjs';
import { _ as _sfc_main$1 } from './Button-D1R6eqR9.mjs';
import { _ as _sfc_main$5, a as _sfc_main$4, b as _sfc_main$3, c as _sfc_main$2, d as _sfc_main$1$1, e as _sfc_main$6 } from './TableCell-C0gOs1vp.mjs';
import { a as useDropboxFiles, u as useAccounts } from './useDropboxFiles-OACIDE_L.mjs';
import { v as vueExports, s as ssrRenderAttrs_1, a as ssrRenderComponent_1, b as ssrInterpolate_1, i as ssrRenderAttr_1, l as ssrIncludeBooleanAttr, f as ssrRenderList_1, h as ssrRenderClass_1, k as ssrRenderTeleport_1 } from '../routes/renderer.mjs';
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
import './Primitive-D3IcFg81.mjs';
import './cn-H80jjgLf.mjs';
import './useSupabase-BKfis0hW.mjs';
import './useAuthFetch-BRq2GRoU.mjs';

const _sfc_main = /* @__PURE__ */ vueExports.defineComponent({
  __name: "trash",
  __ssrInlineRender: true,
  setup(__props) {
    const { getFileIcon } = useDropboxFiles();
    const { accounts } = useAccounts();
    const files = vueExports.ref([]);
    const isLoading = vueExports.ref(true);
    const error = vueExports.ref(null);
    const isRestoring = vueExports.ref(null);
    const isDeleting = vueExports.ref(null);
    const isEmptyingTrash = vueExports.ref(false);
    const selectedIds = vueExports.ref(/* @__PURE__ */ new Set());
    const isBulkProcessing = vueExports.ref(false);
    const isAllSelected = vueExports.computed(() => {
      return files.value.length > 0 && files.value.every((f) => selectedIds.value.has(f.id));
    });
    const isPartiallySelected = vueExports.computed(() => {
      const selectedCount = files.value.filter((f) => selectedIds.value.has(f.id)).length;
      return selectedCount > 0 && selectedCount < files.value.length;
    });
    const toggleSelect = (id) => {
      const newSet = new Set(selectedIds.value);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      selectedIds.value = newSet;
    };
    const toggleSelectAll = () => {
      if (isAllSelected.value) {
        selectedIds.value = /* @__PURE__ */ new Set();
      } else {
        selectedIds.value = new Set(files.value.map((f) => f.id));
      }
    };
    const clearSelection = () => {
      selectedIds.value = /* @__PURE__ */ new Set();
    };
    const confirmDialog = vueExports.reactive({
      isOpen: false,
      title: "Confirm",
      message: "",
      confirmText: "Delete",
      resolve: (value) => {
      }
    });
    const showConfirm = (opts) => {
      return new Promise((resolve) => {
        confirmDialog.title = opts.title || "Confirm";
        confirmDialog.message = opts.message;
        confirmDialog.confirmText = opts.confirmText || "Delete";
        confirmDialog.resolve = resolve;
        confirmDialog.isOpen = true;
      });
    };
    const fetchTrash = async () => {
      var _a;
      isLoading.value = true;
      error.value = null;
      files.value = [];
      try {
        const promises = accounts.value.map(async (acc) => {
          try {
            const response = await $fetch("/api/dropbox/trash", {
              query: { accountId: acc.id }
            });
            return response.entries.map((e) => ({
              ...e,
              accountId: acc.id,
              accountName: acc.name
            }));
          } catch (err) {
            console.warn(`Failed to fetch trash for ${acc.name}:`, err);
            return [];
          }
        });
        const results = await Promise.all(promises);
        const allFiles = results.flat();
        files.value = allFiles.sort((a, b) => (a.daysRemaining || 99) - (b.daysRemaining || 99));
      } catch (err) {
        error.value = ((_a = err.data) == null ? void 0 : _a.message) || err.message || "Failed to load trash";
      } finally {
        isLoading.value = false;
      }
    };
    vueExports.watch(accounts, () => {
      fetchTrash();
    }, { deep: true });
    const getParentPath = (path) => {
      if (!path) return "/";
      const parts = path.split("/");
      parts.pop();
      return parts.join("/") || "/";
    };
    const restoreFile = async (entry) => {
      var _a;
      if (!entry.path) return;
      isRestoring.value = entry.id;
      try {
        await $fetch("/api/dropbox/restore", {
          method: "POST",
          body: { path: entry.path, accountId: entry.accountId }
        });
        files.value = files.value.filter((f) => f.id !== entry.id);
      } catch (err) {
        alert(((_a = err.data) == null ? void 0 : _a.message) || "Failed to restore file");
      } finally {
        isRestoring.value = null;
      }
    };
    const deleteForever = async (entry) => {
      var _a;
      if (!entry.path) return;
      const confirmed = await showConfirm({
        title: "Permanent Delete",
        message: `Permanently delete "${entry.name}"? This cannot be undone.`,
        confirmText: "Delete Forever"
      });
      if (!confirmed) return;
      isDeleting.value = entry.id;
      try {
        const response = await $fetch("/api/dropbox/permanent-delete", {
          method: "POST",
          body: { path: entry.path, accountId: entry.accountId }
        });
        files.value = files.value.filter((f) => f.id !== entry.id);
        if (response.isPersonalAccount || response.alreadyInTrash) {
          alert("Note: For personal Dropbox accounts, files in trash will be automatically deleted after 30 days.");
        }
      } catch (err) {
        console.error("Permanent delete error:", err);
        const message = ((_a = err.data) == null ? void 0 : _a.message) || err.message || "Failed to permanently delete";
        alert(message);
      } finally {
        isDeleting.value = null;
      }
    };
    const emptyTrash = async () => {
      const confirmed = await showConfirm({
        title: "Empty Trash",
        message: "Permanently delete all files in trash? This cannot be undone.",
        confirmText: "Empty Trash"
      });
      if (!confirmed) return;
      isEmptyingTrash.value = true;
      const filesToDelete = [...files.value];
      let successCount = 0;
      let personalAccountWarning = false;
      for (const file of filesToDelete) {
        if (file.path) {
          try {
            const response = await $fetch("/api/dropbox/permanent-delete", {
              method: "POST",
              body: { path: file.path, accountId: file.accountId }
            });
            files.value = files.value.filter((f) => f.id !== file.id);
            successCount++;
            if (response.isPersonalAccount || response.alreadyInTrash) {
              personalAccountWarning = true;
            }
          } catch (err) {
            console.error("Error deleting:", file.name, err);
          }
        }
      }
      isEmptyingTrash.value = false;
      if (personalAccountWarning && successCount > 0) {
        alert(`${successCount} file(s) processed. Note: For personal Dropbox accounts, files in trash will be automatically deleted after 30 days.`);
      }
    };
    const bulkRestore = async () => {
      if (selectedIds.value.size === 0) return;
      const confirmed = await showConfirm({
        title: "Restore Selected",
        message: `Restore ${selectedIds.value.size} selected file(s)?`,
        confirmText: "Restore All"
      });
      if (!confirmed) return;
      isBulkProcessing.value = true;
      const idsToProcess = Array.from(selectedIds.value);
      for (const id of idsToProcess) {
        const file = files.value.find((f) => f.id === id);
        if (file == null ? void 0 : file.path) {
          try {
            await $fetch("/api/dropbox/restore", {
              method: "POST",
              body: { path: file.path, accountId: file.accountId }
            });
            files.value = files.value.filter((f) => f.id !== id);
          } catch (err) {
            console.error(`Failed to restore ${file.name}:`, err);
          }
        }
      }
      selectedIds.value = /* @__PURE__ */ new Set();
      isBulkProcessing.value = false;
    };
    const bulkDelete = async () => {
      if (selectedIds.value.size === 0) return;
      const confirmed = await showConfirm({
        title: "Permanently Delete Selected",
        message: `Permanently delete ${selectedIds.value.size} selected file(s)? This cannot be undone.`,
        confirmText: "Delete All Forever"
      });
      if (!confirmed) return;
      isBulkProcessing.value = true;
      const idsToProcess = Array.from(selectedIds.value);
      let personalAccountWarning = false;
      for (const id of idsToProcess) {
        const file = files.value.find((f) => f.id === id);
        if (file == null ? void 0 : file.path) {
          try {
            const response = await $fetch("/api/dropbox/permanent-delete", {
              method: "POST",
              body: { path: file.path, accountId: file.accountId }
            });
            files.value = files.value.filter((f) => f.id !== id);
            if (response.isPersonalAccount || response.alreadyInTrash) {
              personalAccountWarning = true;
            }
          } catch (err) {
            console.error(`Failed to delete ${file.name}:`, err);
          }
        }
      }
      selectedIds.value = /* @__PURE__ */ new Set();
      isBulkProcessing.value = false;
      if (personalAccountWarning) {
        alert("Note: For personal Dropbox accounts, files in trash will be automatically deleted after 30 days.");
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0;
      const _component_UiButton = _sfc_main$1;
      const _component_UiTable = _sfc_main$5;
      const _component_UiTableHeader = _sfc_main$4;
      const _component_UiTableRow = _sfc_main$3;
      const _component_UiTableHead = _sfc_main$2;
      const _component_UiTableBody = _sfc_main$1$1;
      const _component_UiTableCell = _sfc_main$6;
      _push(`<div${ssrRenderAttrs_1(vueExports.mergeProps({ class: "space-y-4" }, _attrs))}><div class="flex items-center justify-between"><div class="flex items-center gap-3"><div class="p-2 rounded-lg bg-red-500/10">`);
      _push(ssrRenderComponent_1(_component_Icon, {
        name: "lucide:trash-2",
        class: "h-5 w-5 text-red-500"
      }, null, _parent));
      _push(`</div><div><h1 class="text-xl font-semibold">Trash</h1><p class="text-sm text-muted-foreground">${ssrInterpolate_1(vueExports.unref(selectedIds).size > 0 ? `${vueExports.unref(selectedIds).size} selected` : "Deleted files are automatically removed after 30 days")}</p><p class="text-xs text-amber-600 dark:text-amber-400 mt-1">`);
      _push(ssrRenderComponent_1(_component_Icon, {
        name: "lucide:info",
        class: "h-3 w-3 inline mr-1"
      }, null, _parent));
      _push(` Personal accounts: Permanent delete via API not supported. Use Dropbox.com to empty trash immediately. </p></div></div><div class="flex items-center gap-2">`);
      if (vueExports.unref(selectedIds).size > 0) {
        _push(`<!--[-->`);
        _push(ssrRenderComponent_1(_component_UiButton, {
          variant: "outline",
          size: "sm",
          onClick: clearSelection
        }, {
          default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Clear `);
            } else {
              return [
                vueExports.createTextVNode(" Clear ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent_1(_component_UiButton, {
          variant: "outline",
          size: "sm",
          onClick: bulkRestore,
          disabled: vueExports.unref(isBulkProcessing)
        }, {
          default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent_1(_component_Icon, {
                name: vueExports.unref(isBulkProcessing) ? "lucide:loader-2" : "lucide:undo-2",
                class: ["mr-2 h-4 w-4", vueExports.unref(isBulkProcessing) && "animate-spin"]
              }, null, _parent2, _scopeId));
              _push2(` Restore ${ssrInterpolate_1(vueExports.unref(selectedIds).size)}`);
            } else {
              return [
                vueExports.createVNode(_component_Icon, {
                  name: vueExports.unref(isBulkProcessing) ? "lucide:loader-2" : "lucide:undo-2",
                  class: ["mr-2 h-4 w-4", vueExports.unref(isBulkProcessing) && "animate-spin"]
                }, null, 8, ["name", "class"]),
                vueExports.createTextVNode(" Restore " + vueExports.toDisplayString(vueExports.unref(selectedIds).size), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent_1(_component_UiButton, {
          variant: "destructive",
          size: "sm",
          onClick: bulkDelete,
          disabled: vueExports.unref(isBulkProcessing)
        }, {
          default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent_1(_component_Icon, {
                name: vueExports.unref(isBulkProcessing) ? "lucide:loader-2" : "lucide:trash-2",
                class: ["mr-2 h-4 w-4", vueExports.unref(isBulkProcessing) && "animate-spin"]
              }, null, _parent2, _scopeId));
              _push2(` Delete ${ssrInterpolate_1(vueExports.unref(selectedIds).size)}`);
            } else {
              return [
                vueExports.createVNode(_component_Icon, {
                  name: vueExports.unref(isBulkProcessing) ? "lucide:loader-2" : "lucide:trash-2",
                  class: ["mr-2 h-4 w-4", vueExports.unref(isBulkProcessing) && "animate-spin"]
                }, null, 8, ["name", "class"]),
                vueExports.createTextVNode(" Delete " + vueExports.toDisplayString(vueExports.unref(selectedIds).size), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<!--]-->`);
      } else if (vueExports.unref(files).length > 0) {
        _push(ssrRenderComponent_1(_component_UiButton, {
          variant: "destructive",
          size: "sm",
          onClick: emptyTrash,
          disabled: vueExports.unref(isEmptyingTrash)
        }, {
          default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent_1(_component_Icon, {
                name: vueExports.unref(isEmptyingTrash) ? "lucide:loader-2" : "lucide:trash",
                class: ["mr-2 h-4 w-4", vueExports.unref(isEmptyingTrash) && "animate-spin"]
              }, null, _parent2, _scopeId));
              _push2(` Empty Trash `);
            } else {
              return [
                vueExports.createVNode(_component_Icon, {
                  name: vueExports.unref(isEmptyingTrash) ? "lucide:loader-2" : "lucide:trash",
                  class: ["mr-2 h-4 w-4", vueExports.unref(isEmptyingTrash) && "animate-spin"]
                }, null, 8, ["name", "class"]),
                vueExports.createTextVNode(" Empty Trash ")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (vueExports.unref(isLoading)) {
        _push(`<div class="rounded-md border bg-card p-8"><div class="flex flex-col items-center justify-center gap-2 text-muted-foreground">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:loader-2",
          class: "h-8 w-8 animate-spin"
        }, null, _parent));
        _push(`<p>Loading trash...</p></div></div>`);
      } else if (vueExports.unref(error)) {
        _push(`<div class="rounded-md border border-destructive/50 bg-destructive/10 p-8"><div class="flex flex-col items-center justify-center gap-2 text-destructive">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:alert-circle",
          class: "h-8 w-8"
        }, null, _parent));
        _push(`<p class="font-medium">Failed to load trash</p><p class="text-sm">${ssrInterpolate_1(vueExports.unref(error))}</p>`);
        _push(ssrRenderComponent_1(_component_UiButton, {
          variant: "outline",
          size: "sm",
          onClick: fetchTrash,
          class: "mt-2"
        }, {
          default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent_1(_component_Icon, {
                name: "lucide:refresh-cw",
                class: "mr-2 h-4 w-4"
              }, null, _parent2, _scopeId));
              _push2(` Retry `);
            } else {
              return [
                vueExports.createVNode(_component_Icon, {
                  name: "lucide:refresh-cw",
                  class: "mr-2 h-4 w-4"
                }),
                vueExports.createTextVNode(" Retry ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      } else if (vueExports.unref(files).length === 0) {
        _push(`<div class="rounded-md border-2 border-dashed bg-card p-12"><div class="flex flex-col items-center justify-center gap-3 text-muted-foreground">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:trash-2",
          class: "h-16 w-16"
        }, null, _parent));
        _push(`<p class="font-medium text-lg">Trash is empty</p><p class="text-sm">Deleted files will appear here</p></div></div>`);
      } else {
        _push(`<div class="rounded-md border bg-card text-card-foreground shadow-sm">`);
        _push(ssrRenderComponent_1(_component_UiTable, null, {
          default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent_1(_component_UiTableHeader, null, {
                default: vueExports.withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent_1(_component_UiTableRow, { class: "hover:bg-transparent" }, {
                      default: vueExports.withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent_1(_component_UiTableHead, { class: "w-10" }, {
                            default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`<input type="checkbox"${ssrIncludeBooleanAttr(vueExports.unref(isAllSelected)) ? " checked" : ""}${ssrRenderAttr_1("indeterminate", vueExports.unref(isPartiallySelected))} class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"${_scopeId4}>`);
                              } else {
                                return [
                                  vueExports.createVNode("input", {
                                    type: "checkbox",
                                    checked: vueExports.unref(isAllSelected),
                                    indeterminate: vueExports.unref(isPartiallySelected),
                                    onChange: toggleSelectAll,
                                    class: "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                  }, null, 40, ["checked", "indeterminate"])
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent_1(_component_UiTableHead, { class: "min-w-[200px]" }, {
                            default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`Name`);
                              } else {
                                return [
                                  vueExports.createTextVNode("Name")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent_1(_component_UiTableHead, { class: "hidden md:table-cell" }, {
                            default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`Account`);
                              } else {
                                return [
                                  vueExports.createTextVNode("Account")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent_1(_component_UiTableHead, { class: "hidden md:table-cell" }, {
                            default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`Location`);
                              } else {
                                return [
                                  vueExports.createTextVNode("Location")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent_1(_component_UiTableHead, { class: "hidden md:table-cell" }, {
                            default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`Expires`);
                              } else {
                                return [
                                  vueExports.createTextVNode("Expires")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent_1(_component_UiTableHead, { class: "text-right" }, {
                            default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`Actions`);
                              } else {
                                return [
                                  vueExports.createTextVNode("Actions")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                        } else {
                          return [
                            vueExports.createVNode(_component_UiTableHead, { class: "w-10" }, {
                              default: vueExports.withCtx(() => [
                                vueExports.createVNode("input", {
                                  type: "checkbox",
                                  checked: vueExports.unref(isAllSelected),
                                  indeterminate: vueExports.unref(isPartiallySelected),
                                  onChange: toggleSelectAll,
                                  class: "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                }, null, 40, ["checked", "indeterminate"])
                              ]),
                              _: 1
                            }),
                            vueExports.createVNode(_component_UiTableHead, { class: "min-w-[200px]" }, {
                              default: vueExports.withCtx(() => [
                                vueExports.createTextVNode("Name")
                              ]),
                              _: 1
                            }),
                            vueExports.createVNode(_component_UiTableHead, { class: "hidden md:table-cell" }, {
                              default: vueExports.withCtx(() => [
                                vueExports.createTextVNode("Account")
                              ]),
                              _: 1
                            }),
                            vueExports.createVNode(_component_UiTableHead, { class: "hidden md:table-cell" }, {
                              default: vueExports.withCtx(() => [
                                vueExports.createTextVNode("Location")
                              ]),
                              _: 1
                            }),
                            vueExports.createVNode(_component_UiTableHead, { class: "hidden md:table-cell" }, {
                              default: vueExports.withCtx(() => [
                                vueExports.createTextVNode("Expires")
                              ]),
                              _: 1
                            }),
                            vueExports.createVNode(_component_UiTableHead, { class: "text-right" }, {
                              default: vueExports.withCtx(() => [
                                vueExports.createTextVNode("Actions")
                              ]),
                              _: 1
                            })
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      vueExports.createVNode(_component_UiTableRow, { class: "hover:bg-transparent" }, {
                        default: vueExports.withCtx(() => [
                          vueExports.createVNode(_component_UiTableHead, { class: "w-10" }, {
                            default: vueExports.withCtx(() => [
                              vueExports.createVNode("input", {
                                type: "checkbox",
                                checked: vueExports.unref(isAllSelected),
                                indeterminate: vueExports.unref(isPartiallySelected),
                                onChange: toggleSelectAll,
                                class: "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              }, null, 40, ["checked", "indeterminate"])
                            ]),
                            _: 1
                          }),
                          vueExports.createVNode(_component_UiTableHead, { class: "min-w-[200px]" }, {
                            default: vueExports.withCtx(() => [
                              vueExports.createTextVNode("Name")
                            ]),
                            _: 1
                          }),
                          vueExports.createVNode(_component_UiTableHead, { class: "hidden md:table-cell" }, {
                            default: vueExports.withCtx(() => [
                              vueExports.createTextVNode("Account")
                            ]),
                            _: 1
                          }),
                          vueExports.createVNode(_component_UiTableHead, { class: "hidden md:table-cell" }, {
                            default: vueExports.withCtx(() => [
                              vueExports.createTextVNode("Location")
                            ]),
                            _: 1
                          }),
                          vueExports.createVNode(_component_UiTableHead, { class: "hidden md:table-cell" }, {
                            default: vueExports.withCtx(() => [
                              vueExports.createTextVNode("Expires")
                            ]),
                            _: 1
                          }),
                          vueExports.createVNode(_component_UiTableHead, { class: "text-right" }, {
                            default: vueExports.withCtx(() => [
                              vueExports.createTextVNode("Actions")
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent_1(_component_UiTableBody, null, {
                default: vueExports.withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<!--[-->`);
                    ssrRenderList_1(vueExports.unref(files), (entry) => {
                      _push3(ssrRenderComponent_1(_component_UiTableRow, {
                        key: entry.id,
                        class: ["group", { "bg-blue-50 dark:bg-blue-500/10": vueExports.unref(selectedIds).has(entry.id) }]
                      }, {
                        default: vueExports.withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(ssrRenderComponent_1(_component_UiTableCell, { class: "py-3" }, {
                              default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`<input type="checkbox"${ssrIncludeBooleanAttr(vueExports.unref(selectedIds).has(entry.id)) ? " checked" : ""} class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"${_scopeId4}>`);
                                } else {
                                  return [
                                    vueExports.createVNode("input", {
                                      type: "checkbox",
                                      checked: vueExports.unref(selectedIds).has(entry.id),
                                      onChange: ($event) => toggleSelect(entry.id),
                                      class: "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    }, null, 40, ["checked", "onChange"])
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                            _push4(ssrRenderComponent_1(_component_UiTableCell, { class: "font-medium flex items-center gap-3 py-3" }, {
                              default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`<div class="p-2 rounded bg-muted shrink-0"${_scopeId4}>`);
                                  _push5(ssrRenderComponent_1(_component_Icon, {
                                    name: vueExports.unref(getFileIcon)(entry),
                                    class: "h-4 w-4 text-muted-foreground"
                                  }, null, _parent5, _scopeId4));
                                  _push5(`</div><div class="flex flex-col min-w-0"${_scopeId4}><span class="text-sm font-medium text-foreground truncate"${_scopeId4}>${ssrInterpolate_1(entry.name)}</span><div class="md:hidden flex flex-wrap items-center gap-2 text-xs mt-0.5"${_scopeId4}><span class="font-medium text-muted-foreground"${_scopeId4}>${ssrInterpolate_1(entry.accountName)}</span>`);
                                  if (entry.accountName) {
                                    _push5(`<span class="text-muted-foreground"${_scopeId4}>\u2022</span>`);
                                  } else {
                                    _push5(`<!---->`);
                                  }
                                  if (entry.daysRemaining !== null) {
                                    _push5(`<span class="${ssrRenderClass_1([
                                      entry.daysRemaining <= 7 ? "text-red-500" : entry.daysRemaining <= 14 ? "text-yellow-600" : "text-muted-foreground"
                                    ])}"${_scopeId4}>${ssrInterpolate_1(entry.daysRemaining)}d left </span>`);
                                  } else {
                                    _push5(`<!---->`);
                                  }
                                  _push5(`</div></div>`);
                                } else {
                                  return [
                                    vueExports.createVNode("div", { class: "p-2 rounded bg-muted shrink-0" }, [
                                      vueExports.createVNode(_component_Icon, {
                                        name: vueExports.unref(getFileIcon)(entry),
                                        class: "h-4 w-4 text-muted-foreground"
                                      }, null, 8, ["name"])
                                    ]),
                                    vueExports.createVNode("div", { class: "flex flex-col min-w-0" }, [
                                      vueExports.createVNode("span", { class: "text-sm font-medium text-foreground truncate" }, vueExports.toDisplayString(entry.name), 1),
                                      vueExports.createVNode("div", { class: "md:hidden flex flex-wrap items-center gap-2 text-xs mt-0.5" }, [
                                        vueExports.createVNode("span", { class: "font-medium text-muted-foreground" }, vueExports.toDisplayString(entry.accountName), 1),
                                        entry.accountName ? (vueExports.openBlock(), vueExports.createBlock("span", {
                                          key: 0,
                                          class: "text-muted-foreground"
                                        }, "\u2022")) : vueExports.createCommentVNode("", true),
                                        entry.daysRemaining !== null ? (vueExports.openBlock(), vueExports.createBlock("span", {
                                          key: 1,
                                          class: [
                                            entry.daysRemaining <= 7 ? "text-red-500" : entry.daysRemaining <= 14 ? "text-yellow-600" : "text-muted-foreground"
                                          ]
                                        }, vueExports.toDisplayString(entry.daysRemaining) + "d left ", 3)) : vueExports.createCommentVNode("", true)
                                      ])
                                    ])
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                            _push4(ssrRenderComponent_1(_component_UiTableCell, { class: "hidden md:table-cell" }, {
                              default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`<span class="text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground"${_scopeId4}>${ssrInterpolate_1(entry.accountName)}</span>`);
                                } else {
                                  return [
                                    vueExports.createVNode("span", { class: "text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground" }, vueExports.toDisplayString(entry.accountName), 1)
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                            _push4(ssrRenderComponent_1(_component_UiTableCell, { class: "text-muted-foreground text-sm hidden md:table-cell" }, {
                              default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`${ssrInterpolate_1(getParentPath(entry.path))}`);
                                } else {
                                  return [
                                    vueExports.createTextVNode(vueExports.toDisplayString(getParentPath(entry.path)), 1)
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                            _push4(ssrRenderComponent_1(_component_UiTableCell, { class: "hidden md:table-cell" }, {
                              default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  if (entry.daysRemaining !== null) {
                                    _push5(`<span class="${ssrRenderClass_1([
                                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                                      entry.daysRemaining <= 7 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : entry.daysRemaining <= 14 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-muted text-muted-foreground"
                                    ])}"${_scopeId4}>`);
                                    if (entry.daysRemaining <= 7) {
                                      _push5(ssrRenderComponent_1(_component_Icon, {
                                        name: "lucide:alert-triangle",
                                        class: "h-3 w-3"
                                      }, null, _parent5, _scopeId4));
                                    } else {
                                      _push5(`<!---->`);
                                    }
                                    _push5(` ${ssrInterpolate_1(entry.daysRemaining)} days left </span>`);
                                  } else {
                                    _push5(`<span class="text-xs text-muted-foreground"${_scopeId4}>Unknown</span>`);
                                  }
                                } else {
                                  return [
                                    entry.daysRemaining !== null ? (vueExports.openBlock(), vueExports.createBlock("span", {
                                      key: 0,
                                      class: [
                                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                                        entry.daysRemaining <= 7 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : entry.daysRemaining <= 14 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-muted text-muted-foreground"
                                      ]
                                    }, [
                                      entry.daysRemaining <= 7 ? (vueExports.openBlock(), vueExports.createBlock(_component_Icon, {
                                        key: 0,
                                        name: "lucide:alert-triangle",
                                        class: "h-3 w-3"
                                      })) : vueExports.createCommentVNode("", true),
                                      vueExports.createTextVNode(" " + vueExports.toDisplayString(entry.daysRemaining) + " days left ", 1)
                                    ], 2)) : (vueExports.openBlock(), vueExports.createBlock("span", {
                                      key: 1,
                                      class: "text-xs text-muted-foreground"
                                    }, "Unknown"))
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                            _push4(ssrRenderComponent_1(_component_UiTableCell, { class: "text-right" }, {
                              default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`<div class="flex items-center justify-end gap-2"${_scopeId4}>`);
                                  _push5(ssrRenderComponent_1(_component_UiButton, {
                                    variant: "outline",
                                    size: "sm",
                                    onClick: ($event) => restoreFile(entry),
                                    disabled: vueExports.unref(isRestoring) === entry.id
                                  }, {
                                    default: vueExports.withCtx((_5, _push6, _parent6, _scopeId5) => {
                                      if (_push6) {
                                        _push6(ssrRenderComponent_1(_component_Icon, {
                                          name: vueExports.unref(isRestoring) === entry.id ? "lucide:loader-2" : "lucide:undo-2",
                                          class: ["mr-2 h-4 w-4", vueExports.unref(isRestoring) === entry.id && "animate-spin"]
                                        }, null, _parent6, _scopeId5));
                                        _push6(` Restore `);
                                      } else {
                                        return [
                                          vueExports.createVNode(_component_Icon, {
                                            name: vueExports.unref(isRestoring) === entry.id ? "lucide:loader-2" : "lucide:undo-2",
                                            class: ["mr-2 h-4 w-4", vueExports.unref(isRestoring) === entry.id && "animate-spin"]
                                          }, null, 8, ["name", "class"]),
                                          vueExports.createTextVNode(" Restore ")
                                        ];
                                      }
                                    }),
                                    _: 2
                                  }, _parent5, _scopeId4));
                                  _push5(ssrRenderComponent_1(_component_UiButton, {
                                    variant: "destructive",
                                    size: "sm",
                                    onClick: ($event) => deleteForever(entry),
                                    disabled: vueExports.unref(isDeleting) === entry.id
                                  }, {
                                    default: vueExports.withCtx((_5, _push6, _parent6, _scopeId5) => {
                                      if (_push6) {
                                        _push6(ssrRenderComponent_1(_component_Icon, {
                                          name: vueExports.unref(isDeleting) === entry.id ? "lucide:loader-2" : "lucide:trash-2",
                                          class: ["mr-2 h-4 w-4", vueExports.unref(isDeleting) === entry.id && "animate-spin"]
                                        }, null, _parent6, _scopeId5));
                                        _push6(` Delete `);
                                      } else {
                                        return [
                                          vueExports.createVNode(_component_Icon, {
                                            name: vueExports.unref(isDeleting) === entry.id ? "lucide:loader-2" : "lucide:trash-2",
                                            class: ["mr-2 h-4 w-4", vueExports.unref(isDeleting) === entry.id && "animate-spin"]
                                          }, null, 8, ["name", "class"]),
                                          vueExports.createTextVNode(" Delete ")
                                        ];
                                      }
                                    }),
                                    _: 2
                                  }, _parent5, _scopeId4));
                                  _push5(`</div>`);
                                } else {
                                  return [
                                    vueExports.createVNode("div", { class: "flex items-center justify-end gap-2" }, [
                                      vueExports.createVNode(_component_UiButton, {
                                        variant: "outline",
                                        size: "sm",
                                        onClick: ($event) => restoreFile(entry),
                                        disabled: vueExports.unref(isRestoring) === entry.id
                                      }, {
                                        default: vueExports.withCtx(() => [
                                          vueExports.createVNode(_component_Icon, {
                                            name: vueExports.unref(isRestoring) === entry.id ? "lucide:loader-2" : "lucide:undo-2",
                                            class: ["mr-2 h-4 w-4", vueExports.unref(isRestoring) === entry.id && "animate-spin"]
                                          }, null, 8, ["name", "class"]),
                                          vueExports.createTextVNode(" Restore ")
                                        ]),
                                        _: 2
                                      }, 1032, ["onClick", "disabled"]),
                                      vueExports.createVNode(_component_UiButton, {
                                        variant: "destructive",
                                        size: "sm",
                                        onClick: ($event) => deleteForever(entry),
                                        disabled: vueExports.unref(isDeleting) === entry.id
                                      }, {
                                        default: vueExports.withCtx(() => [
                                          vueExports.createVNode(_component_Icon, {
                                            name: vueExports.unref(isDeleting) === entry.id ? "lucide:loader-2" : "lucide:trash-2",
                                            class: ["mr-2 h-4 w-4", vueExports.unref(isDeleting) === entry.id && "animate-spin"]
                                          }, null, 8, ["name", "class"]),
                                          vueExports.createTextVNode(" Delete ")
                                        ]),
                                        _: 2
                                      }, 1032, ["onClick", "disabled"])
                                    ])
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                          } else {
                            return [
                              vueExports.createVNode(_component_UiTableCell, { class: "py-3" }, {
                                default: vueExports.withCtx(() => [
                                  vueExports.createVNode("input", {
                                    type: "checkbox",
                                    checked: vueExports.unref(selectedIds).has(entry.id),
                                    onChange: ($event) => toggleSelect(entry.id),
                                    class: "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                  }, null, 40, ["checked", "onChange"])
                                ]),
                                _: 2
                              }, 1024),
                              vueExports.createVNode(_component_UiTableCell, { class: "font-medium flex items-center gap-3 py-3" }, {
                                default: vueExports.withCtx(() => [
                                  vueExports.createVNode("div", { class: "p-2 rounded bg-muted shrink-0" }, [
                                    vueExports.createVNode(_component_Icon, {
                                      name: vueExports.unref(getFileIcon)(entry),
                                      class: "h-4 w-4 text-muted-foreground"
                                    }, null, 8, ["name"])
                                  ]),
                                  vueExports.createVNode("div", { class: "flex flex-col min-w-0" }, [
                                    vueExports.createVNode("span", { class: "text-sm font-medium text-foreground truncate" }, vueExports.toDisplayString(entry.name), 1),
                                    vueExports.createVNode("div", { class: "md:hidden flex flex-wrap items-center gap-2 text-xs mt-0.5" }, [
                                      vueExports.createVNode("span", { class: "font-medium text-muted-foreground" }, vueExports.toDisplayString(entry.accountName), 1),
                                      entry.accountName ? (vueExports.openBlock(), vueExports.createBlock("span", {
                                        key: 0,
                                        class: "text-muted-foreground"
                                      }, "\u2022")) : vueExports.createCommentVNode("", true),
                                      entry.daysRemaining !== null ? (vueExports.openBlock(), vueExports.createBlock("span", {
                                        key: 1,
                                        class: [
                                          entry.daysRemaining <= 7 ? "text-red-500" : entry.daysRemaining <= 14 ? "text-yellow-600" : "text-muted-foreground"
                                        ]
                                      }, vueExports.toDisplayString(entry.daysRemaining) + "d left ", 3)) : vueExports.createCommentVNode("", true)
                                    ])
                                  ])
                                ]),
                                _: 2
                              }, 1024),
                              vueExports.createVNode(_component_UiTableCell, { class: "hidden md:table-cell" }, {
                                default: vueExports.withCtx(() => [
                                  vueExports.createVNode("span", { class: "text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground" }, vueExports.toDisplayString(entry.accountName), 1)
                                ]),
                                _: 2
                              }, 1024),
                              vueExports.createVNode(_component_UiTableCell, { class: "text-muted-foreground text-sm hidden md:table-cell" }, {
                                default: vueExports.withCtx(() => [
                                  vueExports.createTextVNode(vueExports.toDisplayString(getParentPath(entry.path)), 1)
                                ]),
                                _: 2
                              }, 1024),
                              vueExports.createVNode(_component_UiTableCell, { class: "hidden md:table-cell" }, {
                                default: vueExports.withCtx(() => [
                                  entry.daysRemaining !== null ? (vueExports.openBlock(), vueExports.createBlock("span", {
                                    key: 0,
                                    class: [
                                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                                      entry.daysRemaining <= 7 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : entry.daysRemaining <= 14 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-muted text-muted-foreground"
                                    ]
                                  }, [
                                    entry.daysRemaining <= 7 ? (vueExports.openBlock(), vueExports.createBlock(_component_Icon, {
                                      key: 0,
                                      name: "lucide:alert-triangle",
                                      class: "h-3 w-3"
                                    })) : vueExports.createCommentVNode("", true),
                                    vueExports.createTextVNode(" " + vueExports.toDisplayString(entry.daysRemaining) + " days left ", 1)
                                  ], 2)) : (vueExports.openBlock(), vueExports.createBlock("span", {
                                    key: 1,
                                    class: "text-xs text-muted-foreground"
                                  }, "Unknown"))
                                ]),
                                _: 2
                              }, 1024),
                              vueExports.createVNode(_component_UiTableCell, { class: "text-right" }, {
                                default: vueExports.withCtx(() => [
                                  vueExports.createVNode("div", { class: "flex items-center justify-end gap-2" }, [
                                    vueExports.createVNode(_component_UiButton, {
                                      variant: "outline",
                                      size: "sm",
                                      onClick: ($event) => restoreFile(entry),
                                      disabled: vueExports.unref(isRestoring) === entry.id
                                    }, {
                                      default: vueExports.withCtx(() => [
                                        vueExports.createVNode(_component_Icon, {
                                          name: vueExports.unref(isRestoring) === entry.id ? "lucide:loader-2" : "lucide:undo-2",
                                          class: ["mr-2 h-4 w-4", vueExports.unref(isRestoring) === entry.id && "animate-spin"]
                                        }, null, 8, ["name", "class"]),
                                        vueExports.createTextVNode(" Restore ")
                                      ]),
                                      _: 2
                                    }, 1032, ["onClick", "disabled"]),
                                    vueExports.createVNode(_component_UiButton, {
                                      variant: "destructive",
                                      size: "sm",
                                      onClick: ($event) => deleteForever(entry),
                                      disabled: vueExports.unref(isDeleting) === entry.id
                                    }, {
                                      default: vueExports.withCtx(() => [
                                        vueExports.createVNode(_component_Icon, {
                                          name: vueExports.unref(isDeleting) === entry.id ? "lucide:loader-2" : "lucide:trash-2",
                                          class: ["mr-2 h-4 w-4", vueExports.unref(isDeleting) === entry.id && "animate-spin"]
                                        }, null, 8, ["name", "class"]),
                                        vueExports.createTextVNode(" Delete ")
                                      ]),
                                      _: 2
                                    }, 1032, ["onClick", "disabled"])
                                  ])
                                ]),
                                _: 2
                              }, 1024)
                            ];
                          }
                        }),
                        _: 2
                      }, _parent3, _scopeId2));
                    });
                    _push3(`<!--]-->`);
                  } else {
                    return [
                      (vueExports.openBlock(true), vueExports.createBlock(vueExports.Fragment, null, vueExports.renderList(vueExports.unref(files), (entry) => {
                        return vueExports.openBlock(), vueExports.createBlock(_component_UiTableRow, {
                          key: entry.id,
                          class: ["group", { "bg-blue-50 dark:bg-blue-500/10": vueExports.unref(selectedIds).has(entry.id) }]
                        }, {
                          default: vueExports.withCtx(() => [
                            vueExports.createVNode(_component_UiTableCell, { class: "py-3" }, {
                              default: vueExports.withCtx(() => [
                                vueExports.createVNode("input", {
                                  type: "checkbox",
                                  checked: vueExports.unref(selectedIds).has(entry.id),
                                  onChange: ($event) => toggleSelect(entry.id),
                                  class: "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                }, null, 40, ["checked", "onChange"])
                              ]),
                              _: 2
                            }, 1024),
                            vueExports.createVNode(_component_UiTableCell, { class: "font-medium flex items-center gap-3 py-3" }, {
                              default: vueExports.withCtx(() => [
                                vueExports.createVNode("div", { class: "p-2 rounded bg-muted shrink-0" }, [
                                  vueExports.createVNode(_component_Icon, {
                                    name: vueExports.unref(getFileIcon)(entry),
                                    class: "h-4 w-4 text-muted-foreground"
                                  }, null, 8, ["name"])
                                ]),
                                vueExports.createVNode("div", { class: "flex flex-col min-w-0" }, [
                                  vueExports.createVNode("span", { class: "text-sm font-medium text-foreground truncate" }, vueExports.toDisplayString(entry.name), 1),
                                  vueExports.createVNode("div", { class: "md:hidden flex flex-wrap items-center gap-2 text-xs mt-0.5" }, [
                                    vueExports.createVNode("span", { class: "font-medium text-muted-foreground" }, vueExports.toDisplayString(entry.accountName), 1),
                                    entry.accountName ? (vueExports.openBlock(), vueExports.createBlock("span", {
                                      key: 0,
                                      class: "text-muted-foreground"
                                    }, "\u2022")) : vueExports.createCommentVNode("", true),
                                    entry.daysRemaining !== null ? (vueExports.openBlock(), vueExports.createBlock("span", {
                                      key: 1,
                                      class: [
                                        entry.daysRemaining <= 7 ? "text-red-500" : entry.daysRemaining <= 14 ? "text-yellow-600" : "text-muted-foreground"
                                      ]
                                    }, vueExports.toDisplayString(entry.daysRemaining) + "d left ", 3)) : vueExports.createCommentVNode("", true)
                                  ])
                                ])
                              ]),
                              _: 2
                            }, 1024),
                            vueExports.createVNode(_component_UiTableCell, { class: "hidden md:table-cell" }, {
                              default: vueExports.withCtx(() => [
                                vueExports.createVNode("span", { class: "text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground" }, vueExports.toDisplayString(entry.accountName), 1)
                              ]),
                              _: 2
                            }, 1024),
                            vueExports.createVNode(_component_UiTableCell, { class: "text-muted-foreground text-sm hidden md:table-cell" }, {
                              default: vueExports.withCtx(() => [
                                vueExports.createTextVNode(vueExports.toDisplayString(getParentPath(entry.path)), 1)
                              ]),
                              _: 2
                            }, 1024),
                            vueExports.createVNode(_component_UiTableCell, { class: "hidden md:table-cell" }, {
                              default: vueExports.withCtx(() => [
                                entry.daysRemaining !== null ? (vueExports.openBlock(), vueExports.createBlock("span", {
                                  key: 0,
                                  class: [
                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                                    entry.daysRemaining <= 7 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : entry.daysRemaining <= 14 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-muted text-muted-foreground"
                                  ]
                                }, [
                                  entry.daysRemaining <= 7 ? (vueExports.openBlock(), vueExports.createBlock(_component_Icon, {
                                    key: 0,
                                    name: "lucide:alert-triangle",
                                    class: "h-3 w-3"
                                  })) : vueExports.createCommentVNode("", true),
                                  vueExports.createTextVNode(" " + vueExports.toDisplayString(entry.daysRemaining) + " days left ", 1)
                                ], 2)) : (vueExports.openBlock(), vueExports.createBlock("span", {
                                  key: 1,
                                  class: "text-xs text-muted-foreground"
                                }, "Unknown"))
                              ]),
                              _: 2
                            }, 1024),
                            vueExports.createVNode(_component_UiTableCell, { class: "text-right" }, {
                              default: vueExports.withCtx(() => [
                                vueExports.createVNode("div", { class: "flex items-center justify-end gap-2" }, [
                                  vueExports.createVNode(_component_UiButton, {
                                    variant: "outline",
                                    size: "sm",
                                    onClick: ($event) => restoreFile(entry),
                                    disabled: vueExports.unref(isRestoring) === entry.id
                                  }, {
                                    default: vueExports.withCtx(() => [
                                      vueExports.createVNode(_component_Icon, {
                                        name: vueExports.unref(isRestoring) === entry.id ? "lucide:loader-2" : "lucide:undo-2",
                                        class: ["mr-2 h-4 w-4", vueExports.unref(isRestoring) === entry.id && "animate-spin"]
                                      }, null, 8, ["name", "class"]),
                                      vueExports.createTextVNode(" Restore ")
                                    ]),
                                    _: 2
                                  }, 1032, ["onClick", "disabled"]),
                                  vueExports.createVNode(_component_UiButton, {
                                    variant: "destructive",
                                    size: "sm",
                                    onClick: ($event) => deleteForever(entry),
                                    disabled: vueExports.unref(isDeleting) === entry.id
                                  }, {
                                    default: vueExports.withCtx(() => [
                                      vueExports.createVNode(_component_Icon, {
                                        name: vueExports.unref(isDeleting) === entry.id ? "lucide:loader-2" : "lucide:trash-2",
                                        class: ["mr-2 h-4 w-4", vueExports.unref(isDeleting) === entry.id && "animate-spin"]
                                      }, null, 8, ["name", "class"]),
                                      vueExports.createTextVNode(" Delete ")
                                    ]),
                                    _: 2
                                  }, 1032, ["onClick", "disabled"])
                                ])
                              ]),
                              _: 2
                            }, 1024)
                          ]),
                          _: 2
                        }, 1032, ["class"]);
                      }), 128))
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                vueExports.createVNode(_component_UiTableHeader, null, {
                  default: vueExports.withCtx(() => [
                    vueExports.createVNode(_component_UiTableRow, { class: "hover:bg-transparent" }, {
                      default: vueExports.withCtx(() => [
                        vueExports.createVNode(_component_UiTableHead, { class: "w-10" }, {
                          default: vueExports.withCtx(() => [
                            vueExports.createVNode("input", {
                              type: "checkbox",
                              checked: vueExports.unref(isAllSelected),
                              indeterminate: vueExports.unref(isPartiallySelected),
                              onChange: toggleSelectAll,
                              class: "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            }, null, 40, ["checked", "indeterminate"])
                          ]),
                          _: 1
                        }),
                        vueExports.createVNode(_component_UiTableHead, { class: "min-w-[200px]" }, {
                          default: vueExports.withCtx(() => [
                            vueExports.createTextVNode("Name")
                          ]),
                          _: 1
                        }),
                        vueExports.createVNode(_component_UiTableHead, { class: "hidden md:table-cell" }, {
                          default: vueExports.withCtx(() => [
                            vueExports.createTextVNode("Account")
                          ]),
                          _: 1
                        }),
                        vueExports.createVNode(_component_UiTableHead, { class: "hidden md:table-cell" }, {
                          default: vueExports.withCtx(() => [
                            vueExports.createTextVNode("Location")
                          ]),
                          _: 1
                        }),
                        vueExports.createVNode(_component_UiTableHead, { class: "hidden md:table-cell" }, {
                          default: vueExports.withCtx(() => [
                            vueExports.createTextVNode("Expires")
                          ]),
                          _: 1
                        }),
                        vueExports.createVNode(_component_UiTableHead, { class: "text-right" }, {
                          default: vueExports.withCtx(() => [
                            vueExports.createTextVNode("Actions")
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                vueExports.createVNode(_component_UiTableBody, null, {
                  default: vueExports.withCtx(() => [
                    (vueExports.openBlock(true), vueExports.createBlock(vueExports.Fragment, null, vueExports.renderList(vueExports.unref(files), (entry) => {
                      return vueExports.openBlock(), vueExports.createBlock(_component_UiTableRow, {
                        key: entry.id,
                        class: ["group", { "bg-blue-50 dark:bg-blue-500/10": vueExports.unref(selectedIds).has(entry.id) }]
                      }, {
                        default: vueExports.withCtx(() => [
                          vueExports.createVNode(_component_UiTableCell, { class: "py-3" }, {
                            default: vueExports.withCtx(() => [
                              vueExports.createVNode("input", {
                                type: "checkbox",
                                checked: vueExports.unref(selectedIds).has(entry.id),
                                onChange: ($event) => toggleSelect(entry.id),
                                class: "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              }, null, 40, ["checked", "onChange"])
                            ]),
                            _: 2
                          }, 1024),
                          vueExports.createVNode(_component_UiTableCell, { class: "font-medium flex items-center gap-3 py-3" }, {
                            default: vueExports.withCtx(() => [
                              vueExports.createVNode("div", { class: "p-2 rounded bg-muted shrink-0" }, [
                                vueExports.createVNode(_component_Icon, {
                                  name: vueExports.unref(getFileIcon)(entry),
                                  class: "h-4 w-4 text-muted-foreground"
                                }, null, 8, ["name"])
                              ]),
                              vueExports.createVNode("div", { class: "flex flex-col min-w-0" }, [
                                vueExports.createVNode("span", { class: "text-sm font-medium text-foreground truncate" }, vueExports.toDisplayString(entry.name), 1),
                                vueExports.createVNode("div", { class: "md:hidden flex flex-wrap items-center gap-2 text-xs mt-0.5" }, [
                                  vueExports.createVNode("span", { class: "font-medium text-muted-foreground" }, vueExports.toDisplayString(entry.accountName), 1),
                                  entry.accountName ? (vueExports.openBlock(), vueExports.createBlock("span", {
                                    key: 0,
                                    class: "text-muted-foreground"
                                  }, "\u2022")) : vueExports.createCommentVNode("", true),
                                  entry.daysRemaining !== null ? (vueExports.openBlock(), vueExports.createBlock("span", {
                                    key: 1,
                                    class: [
                                      entry.daysRemaining <= 7 ? "text-red-500" : entry.daysRemaining <= 14 ? "text-yellow-600" : "text-muted-foreground"
                                    ]
                                  }, vueExports.toDisplayString(entry.daysRemaining) + "d left ", 3)) : vueExports.createCommentVNode("", true)
                                ])
                              ])
                            ]),
                            _: 2
                          }, 1024),
                          vueExports.createVNode(_component_UiTableCell, { class: "hidden md:table-cell" }, {
                            default: vueExports.withCtx(() => [
                              vueExports.createVNode("span", { class: "text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground" }, vueExports.toDisplayString(entry.accountName), 1)
                            ]),
                            _: 2
                          }, 1024),
                          vueExports.createVNode(_component_UiTableCell, { class: "text-muted-foreground text-sm hidden md:table-cell" }, {
                            default: vueExports.withCtx(() => [
                              vueExports.createTextVNode(vueExports.toDisplayString(getParentPath(entry.path)), 1)
                            ]),
                            _: 2
                          }, 1024),
                          vueExports.createVNode(_component_UiTableCell, { class: "hidden md:table-cell" }, {
                            default: vueExports.withCtx(() => [
                              entry.daysRemaining !== null ? (vueExports.openBlock(), vueExports.createBlock("span", {
                                key: 0,
                                class: [
                                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                                  entry.daysRemaining <= 7 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : entry.daysRemaining <= 14 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-muted text-muted-foreground"
                                ]
                              }, [
                                entry.daysRemaining <= 7 ? (vueExports.openBlock(), vueExports.createBlock(_component_Icon, {
                                  key: 0,
                                  name: "lucide:alert-triangle",
                                  class: "h-3 w-3"
                                })) : vueExports.createCommentVNode("", true),
                                vueExports.createTextVNode(" " + vueExports.toDisplayString(entry.daysRemaining) + " days left ", 1)
                              ], 2)) : (vueExports.openBlock(), vueExports.createBlock("span", {
                                key: 1,
                                class: "text-xs text-muted-foreground"
                              }, "Unknown"))
                            ]),
                            _: 2
                          }, 1024),
                          vueExports.createVNode(_component_UiTableCell, { class: "text-right" }, {
                            default: vueExports.withCtx(() => [
                              vueExports.createVNode("div", { class: "flex items-center justify-end gap-2" }, [
                                vueExports.createVNode(_component_UiButton, {
                                  variant: "outline",
                                  size: "sm",
                                  onClick: ($event) => restoreFile(entry),
                                  disabled: vueExports.unref(isRestoring) === entry.id
                                }, {
                                  default: vueExports.withCtx(() => [
                                    vueExports.createVNode(_component_Icon, {
                                      name: vueExports.unref(isRestoring) === entry.id ? "lucide:loader-2" : "lucide:undo-2",
                                      class: ["mr-2 h-4 w-4", vueExports.unref(isRestoring) === entry.id && "animate-spin"]
                                    }, null, 8, ["name", "class"]),
                                    vueExports.createTextVNode(" Restore ")
                                  ]),
                                  _: 2
                                }, 1032, ["onClick", "disabled"]),
                                vueExports.createVNode(_component_UiButton, {
                                  variant: "destructive",
                                  size: "sm",
                                  onClick: ($event) => deleteForever(entry),
                                  disabled: vueExports.unref(isDeleting) === entry.id
                                }, {
                                  default: vueExports.withCtx(() => [
                                    vueExports.createVNode(_component_Icon, {
                                      name: vueExports.unref(isDeleting) === entry.id ? "lucide:loader-2" : "lucide:trash-2",
                                      class: ["mr-2 h-4 w-4", vueExports.unref(isDeleting) === entry.id && "animate-spin"]
                                    }, null, 8, ["name", "class"]),
                                    vueExports.createTextVNode(" Delete ")
                                  ]),
                                  _: 2
                                }, 1032, ["onClick", "disabled"])
                              ])
                            ]),
                            _: 2
                          }, 1024)
                        ]),
                        _: 2
                      }, 1032, ["class"]);
                    }), 128))
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      }
      ssrRenderTeleport_1(_push, (_push2) => {
        if (vueExports.unref(confirmDialog).isOpen) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"><div class="bg-card w-full max-w-sm rounded-lg shadow-lg border p-6"><div class="flex items-center gap-3 mb-4"><div class="p-2 rounded-full bg-destructive/10">`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:alert-triangle",
            class: "h-5 w-5 text-destructive"
          }, null, _parent));
          _push2(`</div><h3 class="font-semibold text-lg text-foreground">${ssrInterpolate_1(vueExports.unref(confirmDialog).title)}</h3></div><p class="text-muted-foreground mb-6">${ssrInterpolate_1(vueExports.unref(confirmDialog).message)}</p><div class="flex gap-3 justify-end"><button class="px-4 py-2 rounded-md text-sm font-medium border border-input bg-background hover:bg-muted transition-colors"> Cancel </button><button class="px-4 py-2 rounded-md text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors">${ssrInterpolate_1(vueExports.unref(confirmDialog).confirmText)}</button></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/trash.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=trash-7arOhSGb.mjs.map
