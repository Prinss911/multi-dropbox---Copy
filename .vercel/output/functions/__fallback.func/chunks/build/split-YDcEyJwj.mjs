import { a as _export_sfc, _ as __nuxt_component_0 } from './server.mjs';
import { _ as _sfc_main$2 } from './Button-D1R6eqR9.mjs';
import { _ as _sfc_main$5, a as _sfc_main$4, b as _sfc_main$3, c as _sfc_main$2$1, d as _sfc_main$1$1, e as _sfc_main$6 } from './TableCell-C0gOs1vp.mjs';
import { _ as _sfc_main$7 } from './Input-QSQMvZ04.mjs';
import { u as useAccounts, a as useDropboxFiles } from './useDropboxFiles-OACIDE_L.mjs';
import { v as vueExports, s as ssrRenderAttrs_1, a as ssrRenderComponent_1, f as ssrRenderList_1, i as ssrRenderAttr_1, b as ssrInterpolate_1, l as ssrIncludeBooleanAttr, m as ssrLooseContain_1, n as ssrLooseEqual_1, h as ssrRenderClass_1, j as ssrRenderStyle_1, k as ssrRenderTeleport_1 } from '../routes/renderer.mjs';
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
import '../_/index.mjs';
import './useSupabase-BKfis0hW.mjs';
import './useAuthFetch-BRq2GRoU.mjs';

const _sfc_main$1 = /* @__PURE__ */ vueExports.defineComponent({
  __name: "FileBrowser",
  __ssrInlineRender: true,
  props: {
    accountId: {}
  },
  setup(__props) {
    const props = __props;
    const {
      currentPath,
      files,
      isLoading,
      error,
      selectedIds,
      selectedFiles,
      toggleSelect,
      selectAll,
      clearSelection,
      isSelected,
      isAllSelected,
      fetchFiles,
      navigateToFolder,
      navigateUp,
      getDownloadLink,
      createFolder,
      deleteItem,
      bulkDelete,
      renameItem,
      bulkMove,
      bulkCopy,
      bulkDownload,
      formatFileSize,
      formatDate,
      getFileIcon,
      getIconColor,
      getFolders
    } = useDropboxFiles(props.accountId);
    const { activeAccountId } = useAccounts();
    if (!props.accountId) {
      vueExports.watch(activeAccountId, () => {
        fetchFiles("", true);
      });
    }
    const pathSegments = vueExports.computed(() => {
      if (!currentPath.value) return [];
      return currentPath.value.split("/").filter(Boolean);
    });
    const handleEntryClick = async (entry) => {
      if (entry.type === "folder") {
        navigateToFolder(entry.path);
      } else {
        const link = await getDownloadLink(entry.path);
        if (link) {
          (void 0).open(link, "_blank");
        }
      }
    };
    const isDragging = vueExports.ref(false);
    const fileInput = vueExports.ref(null);
    const isUploading = vueExports.ref(false);
    const uploadedCount = vueExports.ref(0);
    const totalUploadCount = vueExports.ref(0);
    const uploadProgress = vueExports.computed(() => {
      if (totalUploadCount.value === 0) return "";
      return `${uploadedCount.value}/${totalUploadCount.value}`;
    });
    const uploadProgressPercent = vueExports.computed(() => {
      if (totalUploadCount.value === 0) return 0;
      return Math.round(uploadedCount.value / totalUploadCount.value * 100);
    });
    const triggerUpload = () => {
      var _a;
      (_a = fileInput.value) == null ? void 0 : _a.click();
    };
    const showNewFolderModal = vueExports.ref(false);
    const newFolderName = vueExports.ref("");
    const isCreatingFolder = vueExports.ref(false);
    const handleCreateFolder = async () => {
      if (!newFolderName.value) return;
      isCreatingFolder.value = true;
      try {
        await createFolder(newFolderName.value);
        showNewFolderModal.value = false;
        newFolderName.value = "";
      } catch (err) {
        alert(err.message || "Failed to create folder");
      } finally {
        isCreatingFolder.value = false;
      }
    };
    const showRenameModal = vueExports.ref(false);
    const renameEntry = vueExports.ref(null);
    const renameNewName = vueExports.ref("");
    const isRenaming = vueExports.ref(false);
    const handleRename = (entry) => {
      renameEntry.value = entry;
      renameNewName.value = entry.name;
      showRenameModal.value = true;
    };
    const handleRenameConfirm = async () => {
      if (!renameNewName.value || !renameEntry.value) return;
      isRenaming.value = true;
      try {
        await renameItem(renameEntry.value.path, renameNewName.value);
        showRenameModal.value = false;
        renameEntry.value = null;
        renameNewName.value = "";
      } catch (err) {
        alert(err.message || "Failed to rename");
      } finally {
        isRenaming.value = false;
      }
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
    const handleDelete = async (entry) => {
      const confirmMsg = entry.type === "folder" ? `Delete folder "${entry.name}" and all its contents?` : `Delete "${entry.name}"?`;
      const confirmed = await showConfirm({ title: "Delete", message: confirmMsg });
      if (!confirmed) return;
      try {
        await deleteItem(entry.path);
      } catch (err) {
        console.error("Delete error:", err);
      }
    };
    const handleBulkDelete = async () => {
      const count = selectedIds.value.size;
      const confirmed = await showConfirm({
        title: "Delete Items",
        message: `Delete ${count} items? This cannot be undone.`,
        confirmText: "Delete All"
      });
      if (!confirmed) return;
      try {
        const paths = selectedFiles.value.map((f) => f.path);
        await bulkDelete(paths);
      } catch (err) {
        console.error("Bulk delete error:", err);
      }
    };
    const showMoveModal = vueExports.ref(false);
    const movePath = vueExports.ref("");
    const moveFolders = vueExports.ref([]);
    const isFetchingFolders = vueExports.ref(false);
    const isMoving = vueExports.ref(false);
    vueExports.watch(showMoveModal, async (show) => {
      if (show) {
        movePath.value = "";
        await fetchMoveFolders("");
      }
    });
    const fetchMoveFolders = async (path) => {
      isFetchingFolders.value = true;
      try {
        moveFolders.value = await getFolders(path);
      } finally {
        isFetchingFolders.value = false;
      }
    };
    const navigateMoveUp = async () => {
      const parts = movePath.value.split("/");
      parts.pop();
      const parentPath = parts.join("/");
      movePath.value = parentPath;
      await fetchMoveFolders(parentPath);
    };
    const handleBulkMove = async () => {
      isMoving.value = true;
      try {
        const paths = selectedFiles.value.map((f) => f.path);
        await bulkMove(paths, movePath.value);
        showMoveModal.value = false;
      } catch (err) {
        alert(err.message || "Failed to move items");
      } finally {
        isMoving.value = false;
      }
    };
    const isDownloading = vueExports.ref(false);
    const handleBulkDownload = async () => {
      const filePaths = selectedFiles.value.filter((f) => f.type === "file").map((f) => f.path);
      if (filePaths.length === 0) {
        alert("Please select at least one file to download. Folders cannot be downloaded directly.");
        return;
      }
      isDownloading.value = true;
      try {
        await bulkDownload(filePaths);
      } catch (err) {
        alert(err.message || "Failed to download files");
      } finally {
        isDownloading.value = false;
      }
    };
    const showCopyModal = vueExports.ref(false);
    const copyPath = vueExports.ref("");
    const copyFolders = vueExports.ref([]);
    const isFetchingCopyFolders = vueExports.ref(false);
    const isCopying = vueExports.ref(false);
    vueExports.watch(showCopyModal, async (show) => {
      if (show) {
        copyPath.value = "";
        await fetchCopyFolders("");
      }
    });
    const fetchCopyFolders = async (path) => {
      isFetchingCopyFolders.value = true;
      try {
        copyFolders.value = await getFolders(path);
      } finally {
        isFetchingCopyFolders.value = false;
      }
    };
    const navigateCopyUp = async () => {
      const parts = copyPath.value.split("/");
      parts.pop();
      const parentPath = parts.join("/");
      copyPath.value = parentPath;
      await fetchCopyFolders(parentPath);
    };
    const handleBulkCopy = async () => {
      isCopying.value = true;
      try {
        const paths = selectedFiles.value.map((f) => f.path);
        await bulkCopy(paths, copyPath.value);
        showCopyModal.value = false;
      } catch (err) {
        alert(err.message || "Failed to copy items");
      } finally {
        isCopying.value = false;
      }
    };
    const showShareModal = vueExports.ref(false);
    const shareFile = vueExports.ref(null);
    const shareResult = vueExports.ref(null);
    const shareExpiration = vueExports.ref(7);
    const isCreatingShare = vueExports.ref(false);
    const copiedShareUrl = vueExports.ref(false);
    const shareExpirationOptions = [
      { days: 10, unit: "seconds", label: "10 Sec" },
      { days: 1, unit: "days", label: "1 Day" },
      { days: 3, unit: "days", label: "3 Days" },
      { days: 7, unit: "days", label: "7 Days" },
      { days: 30, unit: "days", label: "1 Month" }
    ];
    const isCheckingShare = vueExports.ref(false);
    const handleShare = async (entry) => {
      shareFile.value = entry;
      shareResult.value = null;
      shareExpiration.value = 7;
      shareExpirationUnit.value = "days";
      showShareModal.value = true;
      await checkExistingShare();
    };
    const checkExistingShare = async () => {
      if (!shareFile.value) return;
      isCheckingShare.value = true;
      try {
        const response = await $fetch("/api/shares", {
          query: {
            accountId: props.accountId || activeAccountId.value,
            filePath: shareFile.value.path,
            findOne: "true"
          }
        });
        if (response.shares && response.shares.length > 0) {
          shareResult.value = {
            ...response.shares[0],
            isExisting: true
          };
        }
      } catch (err) {
        console.warn("Failed to check existing share:", err);
      } finally {
        isCheckingShare.value = false;
      }
    };
    const shareExpirationUnit = vueExports.ref("days");
    const createShareLink = async () => {
      var _a;
      if (!shareFile.value) return;
      isCreatingShare.value = true;
      try {
        const response = await $fetch("/api/shares/create", {
          method: "POST",
          body: {
            filePath: shareFile.value.path,
            fileName: shareFile.value.name,
            fileId: shareFile.value.id,
            expirationDays: shareExpiration.value,
            expirationUnit: shareExpirationUnit.value
          }
        });
        if (response.success) {
          shareResult.value = response.share;
        }
      } catch (err) {
        console.error("Create share failed:", err);
        alert(((_a = err.data) == null ? void 0 : _a.message) || err.message || "Failed to create share link");
      } finally {
        isCreatingShare.value = false;
      }
    };
    const copyShareUrl = async () => {
      if (!shareResult.value) return;
      await (void 0).clipboard.writeText(shareResult.value.url);
      copiedShareUrl.value = true;
      setTimeout(() => copiedShareUrl.value = false, 2e3);
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0;
      const _component_UiButton = _sfc_main$2;
      const _component_UiTable = _sfc_main$5;
      const _component_UiTableHeader = _sfc_main$4;
      const _component_UiTableRow = _sfc_main$3;
      const _component_UiTableHead = _sfc_main$2$1;
      const _component_UiTableBody = _sfc_main$1$1;
      const _component_UiTableCell = _sfc_main$6;
      const _component_UiInput = _sfc_main$7;
      _push(`<div${ssrRenderAttrs_1(vueExports.mergeProps({ class: "space-y-4" }, _attrs))} data-v-2f3a6345>`);
      if (vueExports.unref(isDragging)) {
        _push(`<div class="fixed inset-0 z-40 bg-primary/10 backdrop-blur-sm flex items-center justify-center pointer-events-none" data-v-2f3a6345><div class="bg-card border-2 border-dashed border-primary rounded-xl p-12 text-center shadow-2xl" data-v-2f3a6345>`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:upload-cloud",
          class: "h-16 w-16 mx-auto mb-4 text-primary animate-bounce"
        }, null, _parent));
        _push(`<p class="text-xl font-semibold text-primary" data-v-2f3a6345>Drop files here to upload</p><p class="text-sm text-muted-foreground mt-2" data-v-2f3a6345>Files will be uploaded to current folder</p></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (vueExports.unref(selectedIds).size > 0) {
        _push(`<div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-card border rounded-lg shadow-lg px-4 py-3 flex items-center gap-4 max-w-[90vw] overflow-x-auto" data-v-2f3a6345><span class="text-sm font-medium whitespace-nowrap" data-v-2f3a6345>${ssrInterpolate_1(vueExports.unref(selectedIds).size)} selected </span><div class="h-4 w-px bg-border shrink-0" data-v-2f3a6345></div><div class="flex gap-2" data-v-2f3a6345>`);
        _push(ssrRenderComponent_1(_component_UiButton, {
          variant: "outline",
          size: "sm",
          onClick: handleBulkDownload,
          disabled: vueExports.unref(isDownloading)
        }, {
          default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent_1(_component_Icon, {
                name: vueExports.unref(isDownloading) ? "lucide:loader-2" : "lucide:download",
                class: ["mr-2 h-4 w-4", vueExports.unref(isDownloading) && "animate-spin"]
              }, null, _parent2, _scopeId));
              _push2(`<span class="hidden sm:inline" data-v-2f3a6345${_scopeId}>Download</span>`);
            } else {
              return [
                vueExports.createVNode(_component_Icon, {
                  name: vueExports.unref(isDownloading) ? "lucide:loader-2" : "lucide:download",
                  class: ["mr-2 h-4 w-4", vueExports.unref(isDownloading) && "animate-spin"]
                }, null, 8, ["name", "class"]),
                vueExports.createVNode("span", { class: "hidden sm:inline" }, "Download")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent_1(_component_UiButton, {
          variant: "outline",
          size: "sm",
          onClick: ($event) => showCopyModal.value = true
        }, {
          default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent_1(_component_Icon, {
                name: "lucide:copy",
                class: "mr-2 h-4 w-4"
              }, null, _parent2, _scopeId));
              _push2(`<span class="hidden sm:inline" data-v-2f3a6345${_scopeId}>Copy</span>`);
            } else {
              return [
                vueExports.createVNode(_component_Icon, {
                  name: "lucide:copy",
                  class: "mr-2 h-4 w-4"
                }),
                vueExports.createVNode("span", { class: "hidden sm:inline" }, "Copy")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent_1(_component_UiButton, {
          variant: "outline",
          size: "sm",
          onClick: ($event) => showMoveModal.value = true
        }, {
          default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent_1(_component_Icon, {
                name: "lucide:folder-input",
                class: "mr-2 h-4 w-4"
              }, null, _parent2, _scopeId));
              _push2(`<span class="hidden sm:inline" data-v-2f3a6345${_scopeId}>Move</span>`);
            } else {
              return [
                vueExports.createVNode(_component_Icon, {
                  name: "lucide:folder-input",
                  class: "mr-2 h-4 w-4"
                }),
                vueExports.createVNode("span", { class: "hidden sm:inline" }, "Move")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent_1(_component_UiButton, {
          variant: "outline",
          size: "sm",
          class: "text-destructive hover:text-destructive",
          onClick: handleBulkDelete
        }, {
          default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent_1(_component_Icon, {
                name: "lucide:trash-2",
                class: "mr-2 h-4 w-4"
              }, null, _parent2, _scopeId));
              _push2(`<span class="hidden sm:inline" data-v-2f3a6345${_scopeId}>Delete</span>`);
            } else {
              return [
                vueExports.createVNode(_component_Icon, {
                  name: "lucide:trash-2",
                  class: "mr-2 h-4 w-4"
                }),
                vueExports.createVNode("span", { class: "hidden sm:inline" }, "Delete")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="h-4 w-px bg-border shrink-0" data-v-2f3a6345></div>`);
        _push(ssrRenderComponent_1(_component_UiButton, {
          variant: "ghost",
          size: "icon",
          class: "sm:hidden",
          onClick: vueExports.unref(clearSelection)
        }, {
          default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent_1(_component_Icon, {
                name: "lucide:x",
                class: "h-4 w-4"
              }, null, _parent2, _scopeId));
            } else {
              return [
                vueExports.createVNode(_component_Icon, {
                  name: "lucide:x",
                  class: "h-4 w-4"
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent_1(_component_UiButton, {
          variant: "ghost",
          size: "sm",
          class: "hidden sm:flex",
          onClick: vueExports.unref(clearSelection)
        }, {
          default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent_1(_component_Icon, {
                name: "lucide:x",
                class: "mr-2 h-4 w-4"
              }, null, _parent2, _scopeId));
              _push2(` Cancel `);
            } else {
              return [
                vueExports.createVNode(_component_Icon, {
                  name: "lucide:x",
                  class: "mr-2 h-4 w-4"
                }),
                vueExports.createTextVNode(" Cancel ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6" data-v-2f3a6345><div class="flex items-center gap-1 overflow-x-auto no-scrollbar mask-gradient-right" data-v-2f3a6345>`);
      if (vueExports.unref(currentPath)) {
        _push(ssrRenderComponent_1(_component_UiButton, {
          variant: "ghost",
          size: "icon",
          onClick: vueExports.unref(navigateUp),
          class: "h-8 w-8 shrink-0"
        }, {
          default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent_1(_component_Icon, {
                name: "lucide:arrow-left",
                class: "h-4 w-4"
              }, null, _parent2, _scopeId));
            } else {
              return [
                vueExports.createVNode(_component_Icon, {
                  name: "lucide:arrow-left",
                  class: "h-4 w-4"
                })
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<nav class="flex items-center text-sm font-medium text-muted-foreground whitespace-nowrap" data-v-2f3a6345><button class="${ssrRenderClass_1([!vueExports.unref(currentPath) ? "text-foreground font-semibold bg-muted/50" : "", "hover:text-foreground hover:bg-muted px-2 py-1 rounded-md transition-colors"])}" data-v-2f3a6345> Home </button><!--[-->`);
      ssrRenderList_1(vueExports.unref(pathSegments), (segment, index) => {
        _push(`<!--[-->`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:chevron-right",
          class: "h-4 w-4 mx-0.5 text-muted-foreground/50"
        }, null, _parent));
        _push(`<button class="${ssrRenderClass_1([index === vueExports.unref(pathSegments).length - 1 ? "text-foreground font-semibold bg-muted/50" : "", "hover:text-foreground hover:bg-muted px-2 py-1 rounded-md transition-colors"])}" data-v-2f3a6345>${ssrInterpolate_1(segment)}</button><!--]-->`);
      });
      _push(`<!--]--></nav></div><div class="flex gap-2 shrink-0" data-v-2f3a6345>`);
      _push(ssrRenderComponent_1(_component_UiButton, {
        variant: "outline",
        size: "sm",
        onClick: triggerUpload,
        disabled: vueExports.unref(isUploading)
      }, {
        default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: vueExports.unref(isUploading) ? "lucide:loader-2" : "lucide:upload",
              class: ["mr-2 h-4 w-4", vueExports.unref(isUploading) && "animate-spin"]
            }, null, _parent2, _scopeId));
            _push2(` ${ssrInterpolate_1(vueExports.unref(isUploading) ? `Uploading ${vueExports.unref(uploadProgress)}` : "Upload")}`);
          } else {
            return [
              vueExports.createVNode(_component_Icon, {
                name: vueExports.unref(isUploading) ? "lucide:loader-2" : "lucide:upload",
                class: ["mr-2 h-4 w-4", vueExports.unref(isUploading) && "animate-spin"]
              }, null, 8, ["name", "class"]),
              vueExports.createTextVNode(" " + vueExports.toDisplayString(vueExports.unref(isUploading) ? `Uploading ${vueExports.unref(uploadProgress)}` : "Upload"), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<input type="file" multiple class="hidden" data-v-2f3a6345>`);
      _push(ssrRenderComponent_1(_component_UiButton, {
        variant: "outline",
        size: "sm",
        onClick: ($event) => showNewFolderModal.value = true
      }, {
        default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:folder-plus",
              class: "mr-2 h-4 w-4"
            }, null, _parent2, _scopeId));
            _push2(` New Folder `);
          } else {
            return [
              vueExports.createVNode(_component_Icon, {
                name: "lucide:folder-plus",
                class: "mr-2 h-4 w-4"
              }),
              vueExports.createTextVNode(" New Folder ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
      if (vueExports.unref(isUploading)) {
        _push(`<div class="bg-card border rounded-lg p-4" data-v-2f3a6345><div class="flex items-center justify-between mb-2" data-v-2f3a6345><span class="text-sm font-medium" data-v-2f3a6345>Uploading files...</span><span class="text-sm text-muted-foreground" data-v-2f3a6345>${ssrInterpolate_1(vueExports.unref(uploadProgress))}</span></div><div class="w-full bg-muted rounded-full h-2" data-v-2f3a6345><div class="bg-primary h-2 rounded-full transition-all duration-300" style="${ssrRenderStyle_1({ width: vueExports.unref(uploadProgressPercent) + "%" })}" data-v-2f3a6345></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (vueExports.unref(isLoading)) {
        _push(`<div class="rounded-md border bg-card p-8" data-v-2f3a6345><div class="flex flex-col items-center justify-center gap-2 text-muted-foreground" data-v-2f3a6345>`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:loader-2",
          class: "h-8 w-8 animate-spin"
        }, null, _parent));
        _push(`<p data-v-2f3a6345>Loading files...</p></div></div>`);
      } else if (vueExports.unref(error)) {
        _push(`<div class="rounded-md border border-destructive/50 bg-destructive/10 p-8" data-v-2f3a6345><div class="flex flex-col items-center justify-center gap-2 text-destructive" data-v-2f3a6345>`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:alert-circle",
          class: "h-8 w-8"
        }, null, _parent));
        _push(`<p class="font-medium" data-v-2f3a6345>Failed to load files</p><p class="text-sm" data-v-2f3a6345>${ssrInterpolate_1(vueExports.unref(error))}</p>`);
        _push(ssrRenderComponent_1(_component_UiButton, {
          variant: "outline",
          size: "sm",
          onClick: ($event) => vueExports.unref(fetchFiles)(vueExports.unref(currentPath)),
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
        _push(`<div class="${ssrRenderClass_1([vueExports.unref(isDragging) ? "border-primary bg-primary/5" : "border-muted", "rounded-md border-2 border-dashed bg-card p-12 transition-colors"])}" data-v-2f3a6345><div class="flex flex-col items-center justify-center gap-3 text-muted-foreground" data-v-2f3a6345>`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:folder-open",
          class: "h-16 w-16"
        }, null, _parent));
        _push(`<p class="font-medium text-lg" data-v-2f3a6345>This folder is empty</p><p class="text-sm" data-v-2f3a6345>Drag and drop files here, or click the Upload button</p>`);
        _push(ssrRenderComponent_1(_component_UiButton, {
          variant: "outline",
          size: "sm",
          class: "mt-2",
          onClick: triggerUpload
        }, {
          default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent_1(_component_Icon, {
                name: "lucide:upload",
                class: "mr-2 h-4 w-4"
              }, null, _parent2, _scopeId));
              _push2(` Upload Files `);
            } else {
              return [
                vueExports.createVNode(_component_Icon, {
                  name: "lucide:upload",
                  class: "mr-2 h-4 w-4"
                }),
                vueExports.createTextVNode(" Upload Files ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      } else {
        _push(`<div class="rounded-md border bg-card text-card-foreground shadow-sm" data-v-2f3a6345>`);
        _push(ssrRenderComponent_1(_component_UiTable, null, {
          default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent_1(_component_UiTableHeader, null, {
                default: vueExports.withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent_1(_component_UiTableRow, { class: "hover:bg-transparent" }, {
                      default: vueExports.withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent_1(_component_UiTableHead, { class: "w-[40px] px-2 md:px-4" }, {
                            default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`<input type="checkbox"${ssrIncludeBooleanAttr(vueExports.unref(isAllSelected)) ? " checked" : ""} class="h-4 w-4 rounded border-muted-foreground" data-v-2f3a6345${_scopeId4}>`);
                              } else {
                                return [
                                  vueExports.createVNode("input", {
                                    type: "checkbox",
                                    checked: vueExports.unref(isAllSelected),
                                    onChange: ($event) => vueExports.unref(isAllSelected) ? vueExports.unref(clearSelection)() : vueExports.unref(selectAll)(),
                                    class: "h-4 w-4 rounded border-muted-foreground"
                                  }, null, 40, ["checked", "onChange"])
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
                                _push5(`Type`);
                              } else {
                                return [
                                  vueExports.createTextVNode("Type")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent_1(_component_UiTableHead, { class: "hidden md:table-cell" }, {
                            default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`Size`);
                              } else {
                                return [
                                  vueExports.createTextVNode("Size")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent_1(_component_UiTableHead, { class: "text-right hidden md:table-cell" }, {
                            default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`Modified`);
                              } else {
                                return [
                                  vueExports.createTextVNode("Modified")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent_1(_component_UiTableHead, { class: "w-[100px]" }, null, _parent4, _scopeId3));
                        } else {
                          return [
                            vueExports.createVNode(_component_UiTableHead, { class: "w-[40px] px-2 md:px-4" }, {
                              default: vueExports.withCtx(() => [
                                vueExports.createVNode("input", {
                                  type: "checkbox",
                                  checked: vueExports.unref(isAllSelected),
                                  onChange: ($event) => vueExports.unref(isAllSelected) ? vueExports.unref(clearSelection)() : vueExports.unref(selectAll)(),
                                  class: "h-4 w-4 rounded border-muted-foreground"
                                }, null, 40, ["checked", "onChange"])
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
                                vueExports.createTextVNode("Type")
                              ]),
                              _: 1
                            }),
                            vueExports.createVNode(_component_UiTableHead, { class: "hidden md:table-cell" }, {
                              default: vueExports.withCtx(() => [
                                vueExports.createTextVNode("Size")
                              ]),
                              _: 1
                            }),
                            vueExports.createVNode(_component_UiTableHead, { class: "text-right hidden md:table-cell" }, {
                              default: vueExports.withCtx(() => [
                                vueExports.createTextVNode("Modified")
                              ]),
                              _: 1
                            }),
                            vueExports.createVNode(_component_UiTableHead, { class: "w-[100px]" })
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      vueExports.createVNode(_component_UiTableRow, { class: "hover:bg-transparent" }, {
                        default: vueExports.withCtx(() => [
                          vueExports.createVNode(_component_UiTableHead, { class: "w-[40px] px-2 md:px-4" }, {
                            default: vueExports.withCtx(() => [
                              vueExports.createVNode("input", {
                                type: "checkbox",
                                checked: vueExports.unref(isAllSelected),
                                onChange: ($event) => vueExports.unref(isAllSelected) ? vueExports.unref(clearSelection)() : vueExports.unref(selectAll)(),
                                class: "h-4 w-4 rounded border-muted-foreground"
                              }, null, 40, ["checked", "onChange"])
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
                              vueExports.createTextVNode("Type")
                            ]),
                            _: 1
                          }),
                          vueExports.createVNode(_component_UiTableHead, { class: "hidden md:table-cell" }, {
                            default: vueExports.withCtx(() => [
                              vueExports.createTextVNode("Size")
                            ]),
                            _: 1
                          }),
                          vueExports.createVNode(_component_UiTableHead, { class: "text-right hidden md:table-cell" }, {
                            default: vueExports.withCtx(() => [
                              vueExports.createTextVNode("Modified")
                            ]),
                            _: 1
                          }),
                          vueExports.createVNode(_component_UiTableHead, { class: "w-[100px]" })
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
                        class: "group cursor-pointer select-none transition-colors " + (vueExports.unref(isSelected)(entry.id) ? "bg-primary/10" : "hover:bg-accent/50"),
                        onClick: ($event) => handleEntryClick(entry)
                      }, {
                        default: vueExports.withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(ssrRenderComponent_1(_component_UiTableCell, {
                              class: "px-2 md:px-4",
                              onClick: () => {
                              }
                            }, {
                              default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`<input type="checkbox"${ssrIncludeBooleanAttr(vueExports.unref(isSelected)(entry.id)) ? " checked" : ""} class="h-4 w-4 rounded border-muted-foreground accent-primary" data-v-2f3a6345${_scopeId4}>`);
                                } else {
                                  return [
                                    vueExports.createVNode("input", {
                                      type: "checkbox",
                                      checked: vueExports.unref(isSelected)(entry.id),
                                      onChange: ($event) => vueExports.unref(toggleSelect)(entry.id),
                                      class: "h-4 w-4 rounded border-muted-foreground accent-primary"
                                    }, null, 40, ["checked", "onChange"])
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                            _push4(ssrRenderComponent_1(_component_UiTableCell, { class: "font-medium flex items-center gap-3 py-3 px-2 md:px-4" }, {
                              default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`<div class="${ssrRenderClass_1(["p-2 rounded-lg shrink-0 transition-colors", vueExports.unref(getIconColor)(entry)])}" data-v-2f3a6345${_scopeId4}>`);
                                  _push5(ssrRenderComponent_1(_component_Icon, {
                                    name: vueExports.unref(getFileIcon)(entry),
                                    class: ["h-5 w-5", entry.type === "folder" ? "fill-current" : ""]
                                  }, null, _parent5, _scopeId4));
                                  _push5(`</div><div class="flex flex-col min-w-0" data-v-2f3a6345${_scopeId4}><span class="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors" data-v-2f3a6345${_scopeId4}>${ssrInterpolate_1(entry.name)}</span><span class="text-xs text-muted-foreground md:hidden flex items-center gap-1" data-v-2f3a6345${_scopeId4}><span data-v-2f3a6345${_scopeId4}>${ssrInterpolate_1(entry.type === "folder" ? "Folder" : vueExports.unref(formatFileSize)(entry.size))}</span><span class="text-muted-foreground/40" data-v-2f3a6345${_scopeId4}>\u2022</span><span data-v-2f3a6345${_scopeId4}>${ssrInterpolate_1(vueExports.unref(formatDate)(entry.modified))}</span></span></div>`);
                                } else {
                                  return [
                                    vueExports.createVNode("div", {
                                      class: ["p-2 rounded-lg shrink-0 transition-colors", vueExports.unref(getIconColor)(entry)]
                                    }, [
                                      vueExports.createVNode(_component_Icon, {
                                        name: vueExports.unref(getFileIcon)(entry),
                                        class: ["h-5 w-5", entry.type === "folder" ? "fill-current" : ""]
                                      }, null, 8, ["name", "class"])
                                    ], 2),
                                    vueExports.createVNode("div", { class: "flex flex-col min-w-0" }, [
                                      vueExports.createVNode("span", { class: "text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors" }, vueExports.toDisplayString(entry.name), 1),
                                      vueExports.createVNode("span", { class: "text-xs text-muted-foreground md:hidden flex items-center gap-1" }, [
                                        vueExports.createVNode("span", null, vueExports.toDisplayString(entry.type === "folder" ? "Folder" : vueExports.unref(formatFileSize)(entry.size)), 1),
                                        vueExports.createVNode("span", { class: "text-muted-foreground/40" }, "\u2022"),
                                        vueExports.createVNode("span", null, vueExports.toDisplayString(vueExports.unref(formatDate)(entry.modified)), 1)
                                      ])
                                    ])
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                            _push4(ssrRenderComponent_1(_component_UiTableCell, { class: "text-muted-foreground hidden md:table-cell" }, {
                              default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                                var _a, _b;
                                if (_push5) {
                                  _push5(`${ssrInterpolate_1(entry.type === "folder" ? "Folder" : ((_a = entry.extension) == null ? void 0 : _a.toUpperCase()) || "File")}`);
                                } else {
                                  return [
                                    vueExports.createTextVNode(vueExports.toDisplayString(entry.type === "folder" ? "Folder" : ((_b = entry.extension) == null ? void 0 : _b.toUpperCase()) || "File"), 1)
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                            _push4(ssrRenderComponent_1(_component_UiTableCell, { class: "text-muted-foreground hidden md:table-cell" }, {
                              default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`${ssrInterpolate_1(vueExports.unref(formatFileSize)(entry.size))}`);
                                } else {
                                  return [
                                    vueExports.createTextVNode(vueExports.toDisplayString(vueExports.unref(formatFileSize)(entry.size)), 1)
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                            _push4(ssrRenderComponent_1(_component_UiTableCell, { class: "text-right text-muted-foreground hidden md:table-cell" }, {
                              default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`${ssrInterpolate_1(vueExports.unref(formatDate)(entry.modified))}`);
                                } else {
                                  return [
                                    vueExports.createTextVNode(vueExports.toDisplayString(vueExports.unref(formatDate)(entry.modified)), 1)
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                            _push4(ssrRenderComponent_1(_component_UiTableCell, {
                              class: "text-right",
                              onClick: () => {
                              }
                            }, {
                              default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`<div class="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity" data-v-2f3a6345${_scopeId4}>`);
                                  if (entry.type === "file") {
                                    _push5(ssrRenderComponent_1(_component_UiButton, {
                                      variant: "ghost",
                                      size: "icon",
                                      class: "h-8 w-8 text-blue-600 hover:text-blue-700",
                                      onClick: ($event) => handleShare(entry),
                                      title: "Share"
                                    }, {
                                      default: vueExports.withCtx((_5, _push6, _parent6, _scopeId5) => {
                                        if (_push6) {
                                          _push6(ssrRenderComponent_1(_component_Icon, {
                                            name: "lucide:share-2",
                                            class: "h-4 w-4"
                                          }, null, _parent6, _scopeId5));
                                        } else {
                                          return [
                                            vueExports.createVNode(_component_Icon, {
                                              name: "lucide:share-2",
                                              class: "h-4 w-4"
                                            })
                                          ];
                                        }
                                      }),
                                      _: 2
                                    }, _parent5, _scopeId4));
                                  } else {
                                    _push5(`<!---->`);
                                  }
                                  _push5(ssrRenderComponent_1(_component_UiButton, {
                                    variant: "ghost",
                                    size: "icon",
                                    class: "h-8 w-8",
                                    onClick: ($event) => handleRename(entry),
                                    title: "Rename"
                                  }, {
                                    default: vueExports.withCtx((_5, _push6, _parent6, _scopeId5) => {
                                      if (_push6) {
                                        _push6(ssrRenderComponent_1(_component_Icon, {
                                          name: "lucide:pencil",
                                          class: "h-4 w-4"
                                        }, null, _parent6, _scopeId5));
                                      } else {
                                        return [
                                          vueExports.createVNode(_component_Icon, {
                                            name: "lucide:pencil",
                                            class: "h-4 w-4"
                                          })
                                        ];
                                      }
                                    }),
                                    _: 2
                                  }, _parent5, _scopeId4));
                                  _push5(ssrRenderComponent_1(_component_UiButton, {
                                    variant: "ghost",
                                    size: "icon",
                                    class: "h-8 w-8 text-destructive hover:text-destructive",
                                    onClick: ($event) => handleDelete(entry),
                                    title: "Delete"
                                  }, {
                                    default: vueExports.withCtx((_5, _push6, _parent6, _scopeId5) => {
                                      if (_push6) {
                                        _push6(ssrRenderComponent_1(_component_Icon, {
                                          name: "lucide:trash-2",
                                          class: "h-4 w-4"
                                        }, null, _parent6, _scopeId5));
                                      } else {
                                        return [
                                          vueExports.createVNode(_component_Icon, {
                                            name: "lucide:trash-2",
                                            class: "h-4 w-4"
                                          })
                                        ];
                                      }
                                    }),
                                    _: 2
                                  }, _parent5, _scopeId4));
                                  _push5(`</div>`);
                                } else {
                                  return [
                                    vueExports.createVNode("div", { class: "flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity" }, [
                                      entry.type === "file" ? (vueExports.openBlock(), vueExports.createBlock(_component_UiButton, {
                                        key: 0,
                                        variant: "ghost",
                                        size: "icon",
                                        class: "h-8 w-8 text-blue-600 hover:text-blue-700",
                                        onClick: ($event) => handleShare(entry),
                                        title: "Share"
                                      }, {
                                        default: vueExports.withCtx(() => [
                                          vueExports.createVNode(_component_Icon, {
                                            name: "lucide:share-2",
                                            class: "h-4 w-4"
                                          })
                                        ]),
                                        _: 1
                                      }, 8, ["onClick"])) : vueExports.createCommentVNode("", true),
                                      vueExports.createVNode(_component_UiButton, {
                                        variant: "ghost",
                                        size: "icon",
                                        class: "h-8 w-8",
                                        onClick: ($event) => handleRename(entry),
                                        title: "Rename"
                                      }, {
                                        default: vueExports.withCtx(() => [
                                          vueExports.createVNode(_component_Icon, {
                                            name: "lucide:pencil",
                                            class: "h-4 w-4"
                                          })
                                        ]),
                                        _: 1
                                      }, 8, ["onClick"]),
                                      vueExports.createVNode(_component_UiButton, {
                                        variant: "ghost",
                                        size: "icon",
                                        class: "h-8 w-8 text-destructive hover:text-destructive",
                                        onClick: ($event) => handleDelete(entry),
                                        title: "Delete"
                                      }, {
                                        default: vueExports.withCtx(() => [
                                          vueExports.createVNode(_component_Icon, {
                                            name: "lucide:trash-2",
                                            class: "h-4 w-4"
                                          })
                                        ]),
                                        _: 1
                                      }, 8, ["onClick"])
                                    ])
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                          } else {
                            return [
                              vueExports.createVNode(_component_UiTableCell, {
                                class: "px-2 md:px-4",
                                onClick: vueExports.withModifiers(() => {
                                }, ["stop"])
                              }, {
                                default: vueExports.withCtx(() => [
                                  vueExports.createVNode("input", {
                                    type: "checkbox",
                                    checked: vueExports.unref(isSelected)(entry.id),
                                    onChange: ($event) => vueExports.unref(toggleSelect)(entry.id),
                                    class: "h-4 w-4 rounded border-muted-foreground accent-primary"
                                  }, null, 40, ["checked", "onChange"])
                                ]),
                                _: 2
                              }, 1032, ["onClick"]),
                              vueExports.createVNode(_component_UiTableCell, { class: "font-medium flex items-center gap-3 py-3 px-2 md:px-4" }, {
                                default: vueExports.withCtx(() => [
                                  vueExports.createVNode("div", {
                                    class: ["p-2 rounded-lg shrink-0 transition-colors", vueExports.unref(getIconColor)(entry)]
                                  }, [
                                    vueExports.createVNode(_component_Icon, {
                                      name: vueExports.unref(getFileIcon)(entry),
                                      class: ["h-5 w-5", entry.type === "folder" ? "fill-current" : ""]
                                    }, null, 8, ["name", "class"])
                                  ], 2),
                                  vueExports.createVNode("div", { class: "flex flex-col min-w-0" }, [
                                    vueExports.createVNode("span", { class: "text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors" }, vueExports.toDisplayString(entry.name), 1),
                                    vueExports.createVNode("span", { class: "text-xs text-muted-foreground md:hidden flex items-center gap-1" }, [
                                      vueExports.createVNode("span", null, vueExports.toDisplayString(entry.type === "folder" ? "Folder" : vueExports.unref(formatFileSize)(entry.size)), 1),
                                      vueExports.createVNode("span", { class: "text-muted-foreground/40" }, "\u2022"),
                                      vueExports.createVNode("span", null, vueExports.toDisplayString(vueExports.unref(formatDate)(entry.modified)), 1)
                                    ])
                                  ])
                                ]),
                                _: 2
                              }, 1024),
                              vueExports.createVNode(_component_UiTableCell, { class: "text-muted-foreground hidden md:table-cell" }, {
                                default: vueExports.withCtx(() => {
                                  var _a;
                                  return [
                                    vueExports.createTextVNode(vueExports.toDisplayString(entry.type === "folder" ? "Folder" : ((_a = entry.extension) == null ? void 0 : _a.toUpperCase()) || "File"), 1)
                                  ];
                                }),
                                _: 2
                              }, 1024),
                              vueExports.createVNode(_component_UiTableCell, { class: "text-muted-foreground hidden md:table-cell" }, {
                                default: vueExports.withCtx(() => [
                                  vueExports.createTextVNode(vueExports.toDisplayString(vueExports.unref(formatFileSize)(entry.size)), 1)
                                ]),
                                _: 2
                              }, 1024),
                              vueExports.createVNode(_component_UiTableCell, { class: "text-right text-muted-foreground hidden md:table-cell" }, {
                                default: vueExports.withCtx(() => [
                                  vueExports.createTextVNode(vueExports.toDisplayString(vueExports.unref(formatDate)(entry.modified)), 1)
                                ]),
                                _: 2
                              }, 1024),
                              vueExports.createVNode(_component_UiTableCell, {
                                class: "text-right",
                                onClick: vueExports.withModifiers(() => {
                                }, ["stop"])
                              }, {
                                default: vueExports.withCtx(() => [
                                  vueExports.createVNode("div", { class: "flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity" }, [
                                    entry.type === "file" ? (vueExports.openBlock(), vueExports.createBlock(_component_UiButton, {
                                      key: 0,
                                      variant: "ghost",
                                      size: "icon",
                                      class: "h-8 w-8 text-blue-600 hover:text-blue-700",
                                      onClick: ($event) => handleShare(entry),
                                      title: "Share"
                                    }, {
                                      default: vueExports.withCtx(() => [
                                        vueExports.createVNode(_component_Icon, {
                                          name: "lucide:share-2",
                                          class: "h-4 w-4"
                                        })
                                      ]),
                                      _: 1
                                    }, 8, ["onClick"])) : vueExports.createCommentVNode("", true),
                                    vueExports.createVNode(_component_UiButton, {
                                      variant: "ghost",
                                      size: "icon",
                                      class: "h-8 w-8",
                                      onClick: ($event) => handleRename(entry),
                                      title: "Rename"
                                    }, {
                                      default: vueExports.withCtx(() => [
                                        vueExports.createVNode(_component_Icon, {
                                          name: "lucide:pencil",
                                          class: "h-4 w-4"
                                        })
                                      ]),
                                      _: 1
                                    }, 8, ["onClick"]),
                                    vueExports.createVNode(_component_UiButton, {
                                      variant: "ghost",
                                      size: "icon",
                                      class: "h-8 w-8 text-destructive hover:text-destructive",
                                      onClick: ($event) => handleDelete(entry),
                                      title: "Delete"
                                    }, {
                                      default: vueExports.withCtx(() => [
                                        vueExports.createVNode(_component_Icon, {
                                          name: "lucide:trash-2",
                                          class: "h-4 w-4"
                                        })
                                      ]),
                                      _: 1
                                    }, 8, ["onClick"])
                                  ])
                                ]),
                                _: 2
                              }, 1032, ["onClick"])
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
                          class: "group cursor-pointer select-none transition-colors " + (vueExports.unref(isSelected)(entry.id) ? "bg-primary/10" : "hover:bg-accent/50"),
                          onClick: ($event) => handleEntryClick(entry)
                        }, {
                          default: vueExports.withCtx(() => [
                            vueExports.createVNode(_component_UiTableCell, {
                              class: "px-2 md:px-4",
                              onClick: vueExports.withModifiers(() => {
                              }, ["stop"])
                            }, {
                              default: vueExports.withCtx(() => [
                                vueExports.createVNode("input", {
                                  type: "checkbox",
                                  checked: vueExports.unref(isSelected)(entry.id),
                                  onChange: ($event) => vueExports.unref(toggleSelect)(entry.id),
                                  class: "h-4 w-4 rounded border-muted-foreground accent-primary"
                                }, null, 40, ["checked", "onChange"])
                              ]),
                              _: 2
                            }, 1032, ["onClick"]),
                            vueExports.createVNode(_component_UiTableCell, { class: "font-medium flex items-center gap-3 py-3 px-2 md:px-4" }, {
                              default: vueExports.withCtx(() => [
                                vueExports.createVNode("div", {
                                  class: ["p-2 rounded-lg shrink-0 transition-colors", vueExports.unref(getIconColor)(entry)]
                                }, [
                                  vueExports.createVNode(_component_Icon, {
                                    name: vueExports.unref(getFileIcon)(entry),
                                    class: ["h-5 w-5", entry.type === "folder" ? "fill-current" : ""]
                                  }, null, 8, ["name", "class"])
                                ], 2),
                                vueExports.createVNode("div", { class: "flex flex-col min-w-0" }, [
                                  vueExports.createVNode("span", { class: "text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors" }, vueExports.toDisplayString(entry.name), 1),
                                  vueExports.createVNode("span", { class: "text-xs text-muted-foreground md:hidden flex items-center gap-1" }, [
                                    vueExports.createVNode("span", null, vueExports.toDisplayString(entry.type === "folder" ? "Folder" : vueExports.unref(formatFileSize)(entry.size)), 1),
                                    vueExports.createVNode("span", { class: "text-muted-foreground/40" }, "\u2022"),
                                    vueExports.createVNode("span", null, vueExports.toDisplayString(vueExports.unref(formatDate)(entry.modified)), 1)
                                  ])
                                ])
                              ]),
                              _: 2
                            }, 1024),
                            vueExports.createVNode(_component_UiTableCell, { class: "text-muted-foreground hidden md:table-cell" }, {
                              default: vueExports.withCtx(() => {
                                var _a;
                                return [
                                  vueExports.createTextVNode(vueExports.toDisplayString(entry.type === "folder" ? "Folder" : ((_a = entry.extension) == null ? void 0 : _a.toUpperCase()) || "File"), 1)
                                ];
                              }),
                              _: 2
                            }, 1024),
                            vueExports.createVNode(_component_UiTableCell, { class: "text-muted-foreground hidden md:table-cell" }, {
                              default: vueExports.withCtx(() => [
                                vueExports.createTextVNode(vueExports.toDisplayString(vueExports.unref(formatFileSize)(entry.size)), 1)
                              ]),
                              _: 2
                            }, 1024),
                            vueExports.createVNode(_component_UiTableCell, { class: "text-right text-muted-foreground hidden md:table-cell" }, {
                              default: vueExports.withCtx(() => [
                                vueExports.createTextVNode(vueExports.toDisplayString(vueExports.unref(formatDate)(entry.modified)), 1)
                              ]),
                              _: 2
                            }, 1024),
                            vueExports.createVNode(_component_UiTableCell, {
                              class: "text-right",
                              onClick: vueExports.withModifiers(() => {
                              }, ["stop"])
                            }, {
                              default: vueExports.withCtx(() => [
                                vueExports.createVNode("div", { class: "flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity" }, [
                                  entry.type === "file" ? (vueExports.openBlock(), vueExports.createBlock(_component_UiButton, {
                                    key: 0,
                                    variant: "ghost",
                                    size: "icon",
                                    class: "h-8 w-8 text-blue-600 hover:text-blue-700",
                                    onClick: ($event) => handleShare(entry),
                                    title: "Share"
                                  }, {
                                    default: vueExports.withCtx(() => [
                                      vueExports.createVNode(_component_Icon, {
                                        name: "lucide:share-2",
                                        class: "h-4 w-4"
                                      })
                                    ]),
                                    _: 1
                                  }, 8, ["onClick"])) : vueExports.createCommentVNode("", true),
                                  vueExports.createVNode(_component_UiButton, {
                                    variant: "ghost",
                                    size: "icon",
                                    class: "h-8 w-8",
                                    onClick: ($event) => handleRename(entry),
                                    title: "Rename"
                                  }, {
                                    default: vueExports.withCtx(() => [
                                      vueExports.createVNode(_component_Icon, {
                                        name: "lucide:pencil",
                                        class: "h-4 w-4"
                                      })
                                    ]),
                                    _: 1
                                  }, 8, ["onClick"]),
                                  vueExports.createVNode(_component_UiButton, {
                                    variant: "ghost",
                                    size: "icon",
                                    class: "h-8 w-8 text-destructive hover:text-destructive",
                                    onClick: ($event) => handleDelete(entry),
                                    title: "Delete"
                                  }, {
                                    default: vueExports.withCtx(() => [
                                      vueExports.createVNode(_component_Icon, {
                                        name: "lucide:trash-2",
                                        class: "h-4 w-4"
                                      })
                                    ]),
                                    _: 1
                                  }, 8, ["onClick"])
                                ])
                              ]),
                              _: 2
                            }, 1032, ["onClick"])
                          ]),
                          _: 2
                        }, 1032, ["class", "onClick"]);
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
                        vueExports.createVNode(_component_UiTableHead, { class: "w-[40px] px-2 md:px-4" }, {
                          default: vueExports.withCtx(() => [
                            vueExports.createVNode("input", {
                              type: "checkbox",
                              checked: vueExports.unref(isAllSelected),
                              onChange: ($event) => vueExports.unref(isAllSelected) ? vueExports.unref(clearSelection)() : vueExports.unref(selectAll)(),
                              class: "h-4 w-4 rounded border-muted-foreground"
                            }, null, 40, ["checked", "onChange"])
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
                            vueExports.createTextVNode("Type")
                          ]),
                          _: 1
                        }),
                        vueExports.createVNode(_component_UiTableHead, { class: "hidden md:table-cell" }, {
                          default: vueExports.withCtx(() => [
                            vueExports.createTextVNode("Size")
                          ]),
                          _: 1
                        }),
                        vueExports.createVNode(_component_UiTableHead, { class: "text-right hidden md:table-cell" }, {
                          default: vueExports.withCtx(() => [
                            vueExports.createTextVNode("Modified")
                          ]),
                          _: 1
                        }),
                        vueExports.createVNode(_component_UiTableHead, { class: "w-[100px]" })
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
                        class: "group cursor-pointer select-none transition-colors " + (vueExports.unref(isSelected)(entry.id) ? "bg-primary/10" : "hover:bg-accent/50"),
                        onClick: ($event) => handleEntryClick(entry)
                      }, {
                        default: vueExports.withCtx(() => [
                          vueExports.createVNode(_component_UiTableCell, {
                            class: "px-2 md:px-4",
                            onClick: vueExports.withModifiers(() => {
                            }, ["stop"])
                          }, {
                            default: vueExports.withCtx(() => [
                              vueExports.createVNode("input", {
                                type: "checkbox",
                                checked: vueExports.unref(isSelected)(entry.id),
                                onChange: ($event) => vueExports.unref(toggleSelect)(entry.id),
                                class: "h-4 w-4 rounded border-muted-foreground accent-primary"
                              }, null, 40, ["checked", "onChange"])
                            ]),
                            _: 2
                          }, 1032, ["onClick"]),
                          vueExports.createVNode(_component_UiTableCell, { class: "font-medium flex items-center gap-3 py-3 px-2 md:px-4" }, {
                            default: vueExports.withCtx(() => [
                              vueExports.createVNode("div", {
                                class: ["p-2 rounded-lg shrink-0 transition-colors", vueExports.unref(getIconColor)(entry)]
                              }, [
                                vueExports.createVNode(_component_Icon, {
                                  name: vueExports.unref(getFileIcon)(entry),
                                  class: ["h-5 w-5", entry.type === "folder" ? "fill-current" : ""]
                                }, null, 8, ["name", "class"])
                              ], 2),
                              vueExports.createVNode("div", { class: "flex flex-col min-w-0" }, [
                                vueExports.createVNode("span", { class: "text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors" }, vueExports.toDisplayString(entry.name), 1),
                                vueExports.createVNode("span", { class: "text-xs text-muted-foreground md:hidden flex items-center gap-1" }, [
                                  vueExports.createVNode("span", null, vueExports.toDisplayString(entry.type === "folder" ? "Folder" : vueExports.unref(formatFileSize)(entry.size)), 1),
                                  vueExports.createVNode("span", { class: "text-muted-foreground/40" }, "\u2022"),
                                  vueExports.createVNode("span", null, vueExports.toDisplayString(vueExports.unref(formatDate)(entry.modified)), 1)
                                ])
                              ])
                            ]),
                            _: 2
                          }, 1024),
                          vueExports.createVNode(_component_UiTableCell, { class: "text-muted-foreground hidden md:table-cell" }, {
                            default: vueExports.withCtx(() => {
                              var _a;
                              return [
                                vueExports.createTextVNode(vueExports.toDisplayString(entry.type === "folder" ? "Folder" : ((_a = entry.extension) == null ? void 0 : _a.toUpperCase()) || "File"), 1)
                              ];
                            }),
                            _: 2
                          }, 1024),
                          vueExports.createVNode(_component_UiTableCell, { class: "text-muted-foreground hidden md:table-cell" }, {
                            default: vueExports.withCtx(() => [
                              vueExports.createTextVNode(vueExports.toDisplayString(vueExports.unref(formatFileSize)(entry.size)), 1)
                            ]),
                            _: 2
                          }, 1024),
                          vueExports.createVNode(_component_UiTableCell, { class: "text-right text-muted-foreground hidden md:table-cell" }, {
                            default: vueExports.withCtx(() => [
                              vueExports.createTextVNode(vueExports.toDisplayString(vueExports.unref(formatDate)(entry.modified)), 1)
                            ]),
                            _: 2
                          }, 1024),
                          vueExports.createVNode(_component_UiTableCell, {
                            class: "text-right",
                            onClick: vueExports.withModifiers(() => {
                            }, ["stop"])
                          }, {
                            default: vueExports.withCtx(() => [
                              vueExports.createVNode("div", { class: "flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity" }, [
                                entry.type === "file" ? (vueExports.openBlock(), vueExports.createBlock(_component_UiButton, {
                                  key: 0,
                                  variant: "ghost",
                                  size: "icon",
                                  class: "h-8 w-8 text-blue-600 hover:text-blue-700",
                                  onClick: ($event) => handleShare(entry),
                                  title: "Share"
                                }, {
                                  default: vueExports.withCtx(() => [
                                    vueExports.createVNode(_component_Icon, {
                                      name: "lucide:share-2",
                                      class: "h-4 w-4"
                                    })
                                  ]),
                                  _: 1
                                }, 8, ["onClick"])) : vueExports.createCommentVNode("", true),
                                vueExports.createVNode(_component_UiButton, {
                                  variant: "ghost",
                                  size: "icon",
                                  class: "h-8 w-8",
                                  onClick: ($event) => handleRename(entry),
                                  title: "Rename"
                                }, {
                                  default: vueExports.withCtx(() => [
                                    vueExports.createVNode(_component_Icon, {
                                      name: "lucide:pencil",
                                      class: "h-4 w-4"
                                    })
                                  ]),
                                  _: 1
                                }, 8, ["onClick"]),
                                vueExports.createVNode(_component_UiButton, {
                                  variant: "ghost",
                                  size: "icon",
                                  class: "h-8 w-8 text-destructive hover:text-destructive",
                                  onClick: ($event) => handleDelete(entry),
                                  title: "Delete"
                                }, {
                                  default: vueExports.withCtx(() => [
                                    vueExports.createVNode(_component_Icon, {
                                      name: "lucide:trash-2",
                                      class: "h-4 w-4"
                                    })
                                  ]),
                                  _: 1
                                }, 8, ["onClick"])
                              ])
                            ]),
                            _: 2
                          }, 1032, ["onClick"])
                        ]),
                        _: 2
                      }, 1032, ["class", "onClick"]);
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
      _push(`<div class="text-center text-xs text-muted-foreground" data-v-2f3a6345>`);
      _push(ssrRenderComponent_1(_component_Icon, {
        name: "lucide:info",
        class: "inline h-3 w-3 mr-1"
      }, null, _parent));
      _push(` Tip: Drag and drop files anywhere to upload. Use checkboxes for bulk actions. </div>`);
      ssrRenderTeleport_1(_push, (_push2) => {
        if (vueExports.unref(showNewFolderModal)) {
          _push2(`<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-v-2f3a6345><div class="bg-card rounded-lg shadow-lg w-full max-w-sm p-6 m-4" data-v-2f3a6345><h2 class="text-lg font-semibold mb-4" data-v-2f3a6345>Create New Folder</h2><div class="space-y-4" data-v-2f3a6345>`);
          _push2(ssrRenderComponent_1(_component_UiInput, {
            modelValue: vueExports.unref(newFolderName),
            "onUpdate:modelValue": ($event) => vueExports.isRef(newFolderName) ? newFolderName.value = $event : null,
            placeholder: "Folder name",
            onKeyup: handleCreateFolder,
            autofocus: ""
          }, null, _parent));
          _push2(`<div class="flex gap-2" data-v-2f3a6345>`);
          _push2(ssrRenderComponent_1(_component_UiButton, {
            variant: "outline",
            class: "flex-1",
            onClick: ($event) => showNewFolderModal.value = false
          }, {
            default: vueExports.withCtx((_, _push3, _parent2, _scopeId) => {
              if (_push3) {
                _push3(` Cancel `);
              } else {
                return [
                  vueExports.createTextVNode(" Cancel ")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push2(ssrRenderComponent_1(_component_UiButton, {
            class: "flex-1",
            disabled: !vueExports.unref(newFolderName) || vueExports.unref(isCreatingFolder),
            onClick: handleCreateFolder
          }, {
            default: vueExports.withCtx((_, _push3, _parent2, _scopeId) => {
              if (_push3) {
                if (vueExports.unref(isCreatingFolder)) {
                  _push3(ssrRenderComponent_1(_component_Icon, {
                    name: "lucide:loader-2",
                    class: "mr-2 h-4 w-4 animate-spin"
                  }, null, _parent2, _scopeId));
                } else {
                  _push3(`<!---->`);
                }
                _push3(` Create `);
              } else {
                return [
                  vueExports.unref(isCreatingFolder) ? (vueExports.openBlock(), vueExports.createBlock(_component_Icon, {
                    key: 0,
                    name: "lucide:loader-2",
                    class: "mr-2 h-4 w-4 animate-spin"
                  })) : vueExports.createCommentVNode("", true),
                  vueExports.createTextVNode(" Create ")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push2(`</div></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport_1(_push, (_push2) => {
        if (vueExports.unref(showRenameModal)) {
          _push2(`<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-v-2f3a6345><div class="bg-card rounded-lg shadow-lg w-full max-w-sm p-6 m-4" data-v-2f3a6345><h2 class="text-lg font-semibold mb-4" data-v-2f3a6345>Rename</h2><div class="space-y-4" data-v-2f3a6345>`);
          _push2(ssrRenderComponent_1(_component_UiInput, {
            modelValue: vueExports.unref(renameNewName),
            "onUpdate:modelValue": ($event) => vueExports.isRef(renameNewName) ? renameNewName.value = $event : null,
            placeholder: "New name",
            onKeyup: handleRenameConfirm,
            autofocus: ""
          }, null, _parent));
          _push2(`<div class="flex gap-2" data-v-2f3a6345>`);
          _push2(ssrRenderComponent_1(_component_UiButton, {
            variant: "outline",
            class: "flex-1",
            onClick: ($event) => showRenameModal.value = false
          }, {
            default: vueExports.withCtx((_, _push3, _parent2, _scopeId) => {
              if (_push3) {
                _push3(` Cancel `);
              } else {
                return [
                  vueExports.createTextVNode(" Cancel ")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push2(ssrRenderComponent_1(_component_UiButton, {
            class: "flex-1",
            disabled: !vueExports.unref(renameNewName) || vueExports.unref(isRenaming),
            onClick: handleRenameConfirm
          }, {
            default: vueExports.withCtx((_, _push3, _parent2, _scopeId) => {
              if (_push3) {
                if (vueExports.unref(isRenaming)) {
                  _push3(ssrRenderComponent_1(_component_Icon, {
                    name: "lucide:loader-2",
                    class: "mr-2 h-4 w-4 animate-spin"
                  }, null, _parent2, _scopeId));
                } else {
                  _push3(`<!---->`);
                }
                _push3(` Rename `);
              } else {
                return [
                  vueExports.unref(isRenaming) ? (vueExports.openBlock(), vueExports.createBlock(_component_Icon, {
                    key: 0,
                    name: "lucide:loader-2",
                    class: "mr-2 h-4 w-4 animate-spin"
                  })) : vueExports.createCommentVNode("", true),
                  vueExports.createTextVNode(" Rename ")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push2(`</div></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport_1(_push, (_push2) => {
        if (vueExports.unref(showMoveModal)) {
          _push2(`<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-v-2f3a6345><div class="bg-card rounded-lg shadow-lg w-full max-w-md p-6 m-4" data-v-2f3a6345><h2 class="text-lg font-semibold mb-4" data-v-2f3a6345>Move ${ssrInterpolate_1(vueExports.unref(selectedIds).size)} items to...</h2><div class="space-y-4" data-v-2f3a6345><div class="border rounded-lg max-h-64 overflow-auto" data-v-2f3a6345><div class="sticky top-0 bg-card border-b p-2 flex items-center gap-2" data-v-2f3a6345>`);
          if (vueExports.unref(movePath)) {
            _push2(ssrRenderComponent_1(_component_UiButton, {
              variant: "ghost",
              size: "icon",
              class: "h-7 w-7",
              onClick: navigateMoveUp
            }, {
              default: vueExports.withCtx((_, _push3, _parent2, _scopeId) => {
                if (_push3) {
                  _push3(ssrRenderComponent_1(_component_Icon, {
                    name: "lucide:arrow-left",
                    class: "h-4 w-4"
                  }, null, _parent2, _scopeId));
                } else {
                  return [
                    vueExports.createVNode(_component_Icon, {
                      name: "lucide:arrow-left",
                      class: "h-4 w-4"
                    })
                  ];
                }
              }),
              _: 1
            }, _parent));
          } else {
            _push2(`<!---->`);
          }
          _push2(`<span class="text-sm text-muted-foreground truncate" data-v-2f3a6345>${ssrInterpolate_1(vueExports.unref(movePath) || "Root")}</span></div>`);
          if (vueExports.unref(isFetchingFolders)) {
            _push2(`<div class="p-4 text-center text-muted-foreground" data-v-2f3a6345>`);
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:loader-2",
              class: "h-5 w-5 animate-spin mx-auto"
            }, null, _parent));
            _push2(`</div>`);
          } else if (vueExports.unref(moveFolders).length === 0) {
            _push2(`<div class="p-4 text-center text-muted-foreground text-sm" data-v-2f3a6345> No folders here </div>`);
          } else {
            _push2(`<div data-v-2f3a6345><!--[-->`);
            ssrRenderList_1(vueExports.unref(moveFolders), (folder) => {
              _push2(`<button class="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted transition-colors text-left" data-v-2f3a6345>`);
              _push2(ssrRenderComponent_1(_component_Icon, {
                name: "lucide:folder",
                class: "h-4 w-4 text-yellow-600 fill-current"
              }, null, _parent));
              _push2(`<span class="text-sm truncate" data-v-2f3a6345>${ssrInterpolate_1(folder.name)}</span>`);
              _push2(ssrRenderComponent_1(_component_Icon, {
                name: "lucide:chevron-right",
                class: "h-4 w-4 text-muted-foreground ml-auto"
              }, null, _parent));
              _push2(`</button>`);
            });
            _push2(`<!--]--></div>`);
          }
          _push2(`</div><div class="flex gap-2" data-v-2f3a6345>`);
          _push2(ssrRenderComponent_1(_component_UiButton, {
            variant: "outline",
            class: "flex-1",
            onClick: ($event) => showMoveModal.value = false
          }, {
            default: vueExports.withCtx((_, _push3, _parent2, _scopeId) => {
              if (_push3) {
                _push3(` Cancel `);
              } else {
                return [
                  vueExports.createTextVNode(" Cancel ")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push2(ssrRenderComponent_1(_component_UiButton, {
            class: "flex-1",
            disabled: vueExports.unref(isMoving),
            onClick: handleBulkMove
          }, {
            default: vueExports.withCtx((_, _push3, _parent2, _scopeId) => {
              if (_push3) {
                if (vueExports.unref(isMoving)) {
                  _push3(ssrRenderComponent_1(_component_Icon, {
                    name: "lucide:loader-2",
                    class: "mr-2 h-4 w-4 animate-spin"
                  }, null, _parent2, _scopeId));
                } else {
                  _push3(`<!---->`);
                }
                _push3(` Move Here `);
              } else {
                return [
                  vueExports.unref(isMoving) ? (vueExports.openBlock(), vueExports.createBlock(_component_Icon, {
                    key: 0,
                    name: "lucide:loader-2",
                    class: "mr-2 h-4 w-4 animate-spin"
                  })) : vueExports.createCommentVNode("", true),
                  vueExports.createTextVNode(" Move Here ")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push2(`</div></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport_1(_push, (_push2) => {
        if (vueExports.unref(showCopyModal)) {
          _push2(`<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-v-2f3a6345><div class="bg-card rounded-lg shadow-lg w-full max-w-md p-6 m-4" data-v-2f3a6345><h2 class="text-lg font-semibold mb-4" data-v-2f3a6345>Copy ${ssrInterpolate_1(vueExports.unref(selectedIds).size)} items to...</h2><div class="space-y-4" data-v-2f3a6345><div class="border rounded-lg max-h-64 overflow-auto" data-v-2f3a6345><div class="sticky top-0 bg-card border-b p-2 flex items-center gap-2" data-v-2f3a6345>`);
          if (vueExports.unref(copyPath)) {
            _push2(ssrRenderComponent_1(_component_UiButton, {
              variant: "ghost",
              size: "icon",
              class: "h-7 w-7",
              onClick: navigateCopyUp
            }, {
              default: vueExports.withCtx((_, _push3, _parent2, _scopeId) => {
                if (_push3) {
                  _push3(ssrRenderComponent_1(_component_Icon, {
                    name: "lucide:arrow-left",
                    class: "h-4 w-4"
                  }, null, _parent2, _scopeId));
                } else {
                  return [
                    vueExports.createVNode(_component_Icon, {
                      name: "lucide:arrow-left",
                      class: "h-4 w-4"
                    })
                  ];
                }
              }),
              _: 1
            }, _parent));
          } else {
            _push2(`<!---->`);
          }
          _push2(`<span class="text-sm text-muted-foreground truncate" data-v-2f3a6345>${ssrInterpolate_1(vueExports.unref(copyPath) || "Root")}</span></div>`);
          if (vueExports.unref(isFetchingCopyFolders)) {
            _push2(`<div class="p-4 text-center text-muted-foreground" data-v-2f3a6345>`);
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:loader-2",
              class: "h-5 w-5 animate-spin mx-auto"
            }, null, _parent));
            _push2(`</div>`);
          } else if (vueExports.unref(copyFolders).length === 0) {
            _push2(`<div class="p-4 text-center text-muted-foreground text-sm" data-v-2f3a6345> No folders here </div>`);
          } else {
            _push2(`<div data-v-2f3a6345><!--[-->`);
            ssrRenderList_1(vueExports.unref(copyFolders), (folder) => {
              _push2(`<button class="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted transition-colors text-left" data-v-2f3a6345>`);
              _push2(ssrRenderComponent_1(_component_Icon, {
                name: "lucide:folder",
                class: "h-4 w-4 text-yellow-600 fill-current"
              }, null, _parent));
              _push2(`<span class="text-sm truncate" data-v-2f3a6345>${ssrInterpolate_1(folder.name)}</span>`);
              _push2(ssrRenderComponent_1(_component_Icon, {
                name: "lucide:chevron-right",
                class: "h-4 w-4 text-muted-foreground ml-auto"
              }, null, _parent));
              _push2(`</button>`);
            });
            _push2(`<!--]--></div>`);
          }
          _push2(`</div><div class="flex gap-2" data-v-2f3a6345>`);
          _push2(ssrRenderComponent_1(_component_UiButton, {
            variant: "outline",
            class: "flex-1",
            onClick: ($event) => showCopyModal.value = false
          }, {
            default: vueExports.withCtx((_, _push3, _parent2, _scopeId) => {
              if (_push3) {
                _push3(` Cancel `);
              } else {
                return [
                  vueExports.createTextVNode(" Cancel ")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push2(ssrRenderComponent_1(_component_UiButton, {
            class: "flex-1",
            disabled: vueExports.unref(isCopying),
            onClick: handleBulkCopy
          }, {
            default: vueExports.withCtx((_, _push3, _parent2, _scopeId) => {
              if (_push3) {
                if (vueExports.unref(isCopying)) {
                  _push3(ssrRenderComponent_1(_component_Icon, {
                    name: "lucide:loader-2",
                    class: "mr-2 h-4 w-4 animate-spin"
                  }, null, _parent2, _scopeId));
                } else {
                  _push3(`<!---->`);
                }
                _push3(` Copy Here `);
              } else {
                return [
                  vueExports.unref(isCopying) ? (vueExports.openBlock(), vueExports.createBlock(_component_Icon, {
                    key: 0,
                    name: "lucide:loader-2",
                    class: "mr-2 h-4 w-4 animate-spin"
                  })) : vueExports.createCommentVNode("", true),
                  vueExports.createTextVNode(" Copy Here ")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push2(`</div></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport_1(_push, (_push2) => {
        var _a;
        if (vueExports.unref(showShareModal)) {
          _push2(`<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-v-2f3a6345><div class="bg-card rounded-lg shadow-lg w-full max-w-md p-6 m-4" data-v-2f3a6345><h2 class="text-lg font-semibold mb-4 flex items-center gap-2" data-v-2f3a6345>`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:share-2",
            class: "h-5 w-5 text-blue-600"
          }, null, _parent));
          _push2(` Share File </h2>`);
          if (vueExports.unref(isCheckingShare)) {
            _push2(`<div class="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2" data-v-2f3a6345>`);
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:loader-2",
              class: "h-8 w-8 animate-spin"
            }, null, _parent));
            _push2(`<p data-v-2f3a6345>Checking active links...</p></div>`);
          } else if (!vueExports.unref(shareResult)) {
            _push2(`<div class="space-y-4" data-v-2f3a6345><div class="text-sm text-muted-foreground" data-v-2f3a6345><span class="font-medium text-foreground" data-v-2f3a6345>${ssrInterpolate_1((_a = vueExports.unref(shareFile)) == null ? void 0 : _a.name)}</span></div><div data-v-2f3a6345><label class="text-sm text-muted-foreground mb-2 block" data-v-2f3a6345>Link expires in:</label><div class="grid grid-cols-4 gap-2" data-v-2f3a6345><!--[-->`);
            ssrRenderList_1(shareExpirationOptions, (option) => {
              _push2(`<button class="${ssrRenderClass_1([
                "px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                vueExports.unref(shareExpiration) === option.days && vueExports.unref(shareExpirationUnit) === option.unit ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-muted"
              ])}" data-v-2f3a6345>${ssrInterpolate_1(option.label)}</button>`);
            });
            _push2(`<!--]--></div></div><div class="flex gap-2" data-v-2f3a6345>`);
            _push2(ssrRenderComponent_1(_component_UiButton, {
              variant: "outline",
              class: "flex-1",
              onClick: ($event) => showShareModal.value = false
            }, {
              default: vueExports.withCtx((_, _push3, _parent2, _scopeId) => {
                if (_push3) {
                  _push3(` Cancel `);
                } else {
                  return [
                    vueExports.createTextVNode(" Cancel ")
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push2(ssrRenderComponent_1(_component_UiButton, {
              class: "flex-1",
              disabled: vueExports.unref(isCreatingShare),
              onClick: createShareLink
            }, {
              default: vueExports.withCtx((_, _push3, _parent2, _scopeId) => {
                if (_push3) {
                  if (vueExports.unref(isCreatingShare)) {
                    _push3(ssrRenderComponent_1(_component_Icon, {
                      name: "lucide:loader-2",
                      class: "mr-2 h-4 w-4 animate-spin"
                    }, null, _parent2, _scopeId));
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(` Create Link `);
                } else {
                  return [
                    vueExports.unref(isCreatingShare) ? (vueExports.openBlock(), vueExports.createBlock(_component_Icon, {
                      key: 0,
                      name: "lucide:loader-2",
                      class: "mr-2 h-4 w-4 animate-spin"
                    })) : vueExports.createCommentVNode("", true),
                    vueExports.createTextVNode(" Create Link ")
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push2(`</div></div>`);
          } else {
            _push2(`<div class="space-y-4" data-v-2f3a6345><div class="${ssrRenderClass_1([vueExports.unref(shareResult).isExisting ? "text-blue-600" : "text-green-600", "flex items-center gap-2"])}" data-v-2f3a6345>`);
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: vueExports.unref(shareResult).isExisting ? "lucide:link" : "lucide:check-circle",
              class: "h-5 w-5"
            }, null, _parent));
            _push2(`<span class="font-medium" data-v-2f3a6345>${ssrInterpolate_1(vueExports.unref(shareResult).isExisting ? "Active Link Found" : "Link created!")}</span></div><div class="flex gap-2" data-v-2f3a6345><input type="text"${ssrRenderAttr_1("value", vueExports.unref(shareResult).url)} readonly class="flex-1 px-3 py-2 bg-muted border rounded-md text-sm" data-v-2f3a6345>`);
            _push2(ssrRenderComponent_1(_component_UiButton, {
              onClick: copyShareUrl,
              variant: vueExports.unref(copiedShareUrl) ? "default" : "outline"
            }, {
              default: vueExports.withCtx((_, _push3, _parent2, _scopeId) => {
                if (_push3) {
                  _push3(ssrRenderComponent_1(_component_Icon, {
                    name: vueExports.unref(copiedShareUrl) ? "lucide:check" : "lucide:copy",
                    class: "h-4 w-4"
                  }, null, _parent2, _scopeId));
                } else {
                  return [
                    vueExports.createVNode(_component_Icon, {
                      name: vueExports.unref(copiedShareUrl) ? "lucide:check" : "lucide:copy",
                      class: "h-4 w-4"
                    }, null, 8, ["name"])
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push2(`</div><p class="text-xs text-muted-foreground" data-v-2f3a6345> Expires: ${ssrInterpolate_1(new Date(vueExports.unref(shareResult).expiresAt).toLocaleString())}</p>`);
            _push2(ssrRenderComponent_1(_component_UiButton, {
              class: "w-full",
              onClick: ($event) => showShareModal.value = false
            }, {
              default: vueExports.withCtx((_, _push3, _parent2, _scopeId) => {
                if (_push3) {
                  _push3(` Done `);
                } else {
                  return [
                    vueExports.createTextVNode(" Done ")
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push2(`</div>`);
          }
          _push2(`</div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport_1(_push, (_push2) => {
        if (vueExports.unref(confirmDialog).isOpen) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" data-v-2f3a6345><div class="bg-card w-full max-w-sm rounded-lg shadow-lg border p-6" data-v-2f3a6345><div class="flex items-center gap-3 mb-4" data-v-2f3a6345><div class="p-2 rounded-full bg-destructive/10" data-v-2f3a6345>`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:alert-triangle",
            class: "h-5 w-5 text-destructive"
          }, null, _parent));
          _push2(`</div><h3 class="font-semibold text-lg text-foreground" data-v-2f3a6345>${ssrInterpolate_1(vueExports.unref(confirmDialog).title)}</h3></div><p class="text-muted-foreground mb-6" data-v-2f3a6345>${ssrInterpolate_1(vueExports.unref(confirmDialog).message)}</p><div class="flex gap-3 justify-end" data-v-2f3a6345><button class="px-4 py-2 rounded-md text-sm font-medium border border-input bg-background hover:bg-muted transition-colors" data-v-2f3a6345> Cancel </button><button class="px-4 py-2 rounded-md text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors" data-v-2f3a6345>${ssrInterpolate_1(vueExports.unref(confirmDialog).confirmText)}</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/FileBrowser.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-2f3a6345"]]);
const _sfc_main = /* @__PURE__ */ vueExports.defineComponent({
  __name: "split",
  __ssrInlineRender: true,
  setup(__props) {
    const { accounts, activeAccountId } = useAccounts();
    const leftAccountId = vueExports.ref(activeAccountId.value);
    const rightAccountId = vueExports.ref("");
    const sortedAccounts = vueExports.computed(() => {
      return [...accounts.value].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    });
    const getAccountEmail = (id) => {
      const acc = accounts.value.find((a) => a.id === id);
      return (acc == null ? void 0 : acc.email) || "";
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0;
      const _component_FileBrowser = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs_1(vueExports.mergeProps({ class: "h-[calc(100vh-8rem)] flex flex-col gap-4" }, _attrs))} data-v-e7b78dfc><div class="flex items-center justify-between" data-v-e7b78dfc><h1 class="text-2xl font-semibold tracking-tight" data-v-e7b78dfc>Split View</h1><p class="text-sm text-muted-foreground hidden md:block" data-v-e7b78dfc> Manage files across two accounts simultaneously </p></div><div class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0" data-v-e7b78dfc><div class="flex flex-col border rounded-lg bg-card shadow-sm overflow-hidden" data-v-e7b78dfc><div class="p-3 border-b bg-muted/30 flex items-center justify-between gap-3" data-v-e7b78dfc><div class="flex items-center gap-2 flex-1 min-w-0" data-v-e7b78dfc><div class="p-1.5 rounded bg-primary/10 shrink-0" data-v-e7b78dfc>`);
      _push(ssrRenderComponent_1(_component_Icon, {
        name: "lucide:layout-panel-left",
        class: "h-4 w-4 text-primary"
      }, null, _parent));
      _push(`</div><select class="flex-1 min-w-0 bg-transparent text-sm font-medium focus:outline-none cursor-pointer hover:bg-muted/50 rounded py-1 pl-1 pr-8" aria-label="Select Account for Left Pane" data-v-e7b78dfc><!--[-->`);
      ssrRenderList_1(vueExports.unref(sortedAccounts), (acc) => {
        _push(`<option${ssrRenderAttr_1("value", acc.id)} data-v-e7b78dfc${ssrIncludeBooleanAttr(Array.isArray(vueExports.unref(leftAccountId)) ? ssrLooseContain_1(vueExports.unref(leftAccountId), acc.id) : ssrLooseEqual_1(vueExports.unref(leftAccountId), acc.id)) ? " selected" : ""}>${ssrInterpolate_1(acc.name || acc.email)}</option>`);
      });
      _push(`<!--]--></select></div><div class="text-xs text-muted-foreground whitespace-nowrap hidden sm:block" data-v-e7b78dfc>${ssrInterpolate_1(getAccountEmail(vueExports.unref(leftAccountId)))}</div></div><div class="flex-1 overflow-y-auto p-4 custom-scrollbar" data-v-e7b78dfc>`);
      if (vueExports.unref(leftAccountId)) {
        _push(ssrRenderComponent_1(_component_FileBrowser, {
          "account-id": vueExports.unref(leftAccountId),
          key: `left-${vueExports.unref(leftAccountId)}`
        }, null, _parent));
      } else {
        _push(`<div class="h-full flex flex-col items-center justify-center text-muted-foreground" data-v-e7b78dfc>`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:user-x",
          class: "h-12 w-12 mb-2 opacity-50"
        }, null, _parent));
        _push(`<p data-v-e7b78dfc>No account selected</p></div>`);
      }
      _push(`</div></div><div class="flex flex-col border rounded-lg bg-card shadow-sm overflow-hidden" data-v-e7b78dfc><div class="p-3 border-b bg-muted/30 flex items-center justify-between gap-3" data-v-e7b78dfc><div class="flex items-center gap-2 flex-1 min-w-0" data-v-e7b78dfc><div class="p-1.5 rounded bg-secondary/10 shrink-0" data-v-e7b78dfc>`);
      _push(ssrRenderComponent_1(_component_Icon, {
        name: "lucide:layout-panel-left",
        class: "h-4 w-4 text-secondary-foreground rotate-180"
      }, null, _parent));
      _push(`</div><select class="flex-1 min-w-0 bg-transparent text-sm font-medium focus:outline-none cursor-pointer hover:bg-muted/50 rounded py-1 pl-1 pr-8" aria-label="Select Account for Right Pane" data-v-e7b78dfc><option${ssrRenderAttr_1("value", "")} disabled data-v-e7b78dfc${ssrIncludeBooleanAttr(Array.isArray(vueExports.unref(rightAccountId)) ? ssrLooseContain_1(vueExports.unref(rightAccountId), "") : ssrLooseEqual_1(vueExports.unref(rightAccountId), "")) ? " selected" : ""}>Select Account</option><!--[-->`);
      ssrRenderList_1(vueExports.unref(sortedAccounts), (acc) => {
        _push(`<option${ssrRenderAttr_1("value", acc.id)} data-v-e7b78dfc${ssrIncludeBooleanAttr(Array.isArray(vueExports.unref(rightAccountId)) ? ssrLooseContain_1(vueExports.unref(rightAccountId), acc.id) : ssrLooseEqual_1(vueExports.unref(rightAccountId), acc.id)) ? " selected" : ""}>${ssrInterpolate_1(acc.name || acc.email)}</option>`);
      });
      _push(`<!--]--></select></div><div class="text-xs text-muted-foreground whitespace-nowrap hidden sm:block" data-v-e7b78dfc>${ssrInterpolate_1(getAccountEmail(vueExports.unref(rightAccountId)))}</div></div><div class="flex-1 overflow-y-auto p-4 custom-scrollbar" data-v-e7b78dfc>`);
      if (vueExports.unref(rightAccountId)) {
        _push(ssrRenderComponent_1(_component_FileBrowser, {
          "account-id": vueExports.unref(rightAccountId),
          key: `right-${vueExports.unref(rightAccountId)}`
        }, null, _parent));
      } else {
        _push(`<div class="h-full flex flex-col items-center justify-center text-muted-foreground" data-v-e7b78dfc>`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:arrow-left-right",
          class: "h-12 w-12 mb-2 opacity-50"
        }, null, _parent));
        _push(`<p data-v-e7b78dfc>Select an account to compare</p></div>`);
      }
      _push(`</div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/split.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const split = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-e7b78dfc"]]);

export { split as default };
//# sourceMappingURL=split-YDcEyJwj.mjs.map
