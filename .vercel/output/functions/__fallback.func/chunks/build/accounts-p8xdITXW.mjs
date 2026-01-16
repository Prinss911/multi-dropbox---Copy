import { _ as __nuxt_component_0 } from './server.mjs';
import { _ as _sfc_main$1 } from './Button-D1R6eqR9.mjs';
import { u as useAccounts, a as useDropboxFiles } from './useDropboxFiles-OACIDE_L.mjs';
import { v as vueExports, s as ssrRenderAttrs_1, b as ssrInterpolate_1, a as ssrRenderComponent_1, f as ssrRenderList_1, h as ssrRenderClass_1, i as ssrRenderAttr_1, j as ssrRenderStyle_1, k as ssrRenderTeleport_1, l as ssrIncludeBooleanAttr } from '../routes/renderer.mjs';
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
  __name: "accounts",
  __ssrInlineRender: true,
  setup(__props) {
    const {
      accounts,
      isLoading,
      isAddingAccount
    } = useAccounts();
    useDropboxFiles();
    const combinedStorage = vueExports.ref(null);
    const fetchStorageInfo = async () => {
      try {
        const response = await $fetch("/api/dropbox/storage-all");
        combinedStorage.value = response;
      } catch (err) {
        console.error("Error fetching storage:", err);
      }
    };
    const accountsWithStorage = vueExports.computed(() => {
      return accounts.value.map((account) => {
        var _a2, _b;
        var _a;
        const storageInfo = (_a = combinedStorage.value) == null ? void 0 : _a.accounts.find((s) => s.accountId === account.id);
        return {
          ...account,
          used: (_a2 = storageInfo == null ? void 0 : storageInfo.used) != null ? _a2 : null,
          total: (_b = storageInfo == null ? void 0 : storageInfo.total) != null ? _b : null,
          storagePercent: storageInfo && storageInfo.total > 0 ? storageInfo.used / storageInfo.total * 100 : null
        };
      });
    });
    const deleteTarget = vueExports.ref(null);
    const isDeleting = vueExports.ref(false);
    const showAddModal = vueExports.ref(false);
    const addStep = vueExports.ref("auth");
    const addError = vueExports.ref("");
    const authCode = vueExports.ref("");
    const accountName = vueExports.ref("");
    const openAddAccountModal = () => {
      showAddModal.value = true;
      addStep.value = "auth";
      authCode.value = "";
      accountName.value = "";
      addError.value = "";
    };
    const formatBytes = (bytes) => {
      if (!bytes || bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };
    const formatDate = (date) => {
      if (!date) return "Unknown";
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    };
    vueExports.watch(accounts, () => {
      fetchStorageInfo();
    }, { deep: true });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_Icon = __nuxt_component_0;
      const _component_UiButton = _sfc_main$1;
      _push(`<div${ssrRenderAttrs_1(vueExports.mergeProps({ class: "h-full flex flex-col bg-background/50" }, _attrs))}><div class="sticky top-0 z-20 bg-background/95 backdrop-blur border-b px-6 py-4"><div class="w-full"><div class="flex flex-col md:flex-row md:items-center justify-between gap-4"><div><h1 class="text-xl font-semibold text-[#1E1919] dark:text-foreground">Connected Accounts</h1><p class="text-sm text-muted-foreground">${ssrInterpolate_1(vueExports.unref(accounts).length)} active connections</p></div><div class="flex items-center gap-6"><div class="hidden md:flex items-center gap-3"><div class="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0061FE]">`);
      _push(ssrRenderComponent_1(_component_Icon, {
        name: "lucide:hard-drive",
        class: "h-5 w-5"
      }, null, _parent));
      _push(`</div><div class="text-right sm:text-left"><p class="text-sm font-semibold text-[#1E1919] dark:text-foreground">${ssrInterpolate_1(formatBytes(((_a = vueExports.unref(combinedStorage)) == null ? void 0 : _a.totalUsed) || 0))} used </p><p class="text-xs text-muted-foreground"> of ${ssrInterpolate_1(formatBytes(((_b = vueExports.unref(combinedStorage)) == null ? void 0 : _b.totalAllocated) || 0))} total </p></div></div><div class="w-px h-8 bg-border hidden md:block"></div>`);
      _push(ssrRenderComponent_1(_component_UiButton, {
        onClick: openAddAccountModal,
        class: "bg-[#0061FE] hover:bg-[#0057E5] text-white"
      }, {
        default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:plus",
              class: "h-4 w-4 mr-2"
            }, null, _parent2, _scopeId));
            _push2(` Connect New Account `);
          } else {
            return [
              vueExports.createVNode(_component_Icon, {
                name: "lucide:plus",
                class: "h-4 w-4 mr-2"
              }),
              vueExports.createTextVNode(" Connect New Account ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div></div><div class="flex-1 overflow-auto px-4 md:px-6 py-8 transition-all"><div class="w-full">`);
      if (vueExports.unref(isLoading)) {
        _push(`<div class="flex flex-col items-center justify-center py-20 text-muted-foreground">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:loader-2",
          class: "animate-spin h-8 w-8 text-[#0061FE] mb-4"
        }, null, _parent));
        _push(`<p class="text-sm">Fetching metrics...</p></div>`);
      } else if (vueExports.unref(accounts).length === 0) {
        _push(`<div class="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl bg-muted/10"><div class="h-24 w-24 mb-4 flex items-center justify-center rounded-full bg-blue-50 text-[#0061FE]">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "simple-icons:dropbox",
          class: "h-10 w-10"
        }, null, _parent));
        _push(`</div><h3 class="text-lg font-semibold text-[#1E1919] dark:text-foreground mb-2">No accounts connected</h3><p class="text-muted-foreground text-sm max-w-sm mb-6"> Connect your Dropbox accounts to start pooling your storage space and managing files centrally. </p>`);
        _push(ssrRenderComponent_1(_component_UiButton, {
          onClick: openAddAccountModal,
          size: "lg",
          class: "bg-[#0061FE] hover:bg-[#0057E5] text-white"
        }, {
          default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Connect First Account `);
            } else {
              return [
                vueExports.createTextVNode(" Connect First Account ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6"><!--[-->`);
        ssrRenderList_1(vueExports.unref(accountsWithStorage), (account) => {
          _push(`<div class="${ssrRenderClass_1([{ "ring-2 ring-[#0061FE] ring-offset-2 dark:ring-offset-background": account.isActive }, "group relative bg-card hover:bg-muted/20 border rounded-xl p-5 transition-all shadow-sm hover:shadow-md"])}">`);
          if (account.isActive) {
            _push(`<div class="absolute top-4 right-4"><span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#0061FE]/10 text-[#0061FE] text-xs font-bold uppercase tracking-wider"> Active </span></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="flex items-start gap-4 mb-6"><div class="h-12 w-12 rounded-xl bg-[#0061FE]/5 flex items-center justify-center shrink-0">`);
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "simple-icons:dropbox",
            class: "h-6 w-6 text-[#0061FE]"
          }, null, _parent));
          _push(`</div><div class="min-w-0 pr-12"><h3 class="font-semibold text-base truncate text-[#1E1919] dark:text-foreground"${ssrRenderAttr_1("title", account.name)}>${ssrInterpolate_1(account.name)}</h3><p class="text-sm text-muted-foreground truncate"${ssrRenderAttr_1("title", account.email || "")}>${ssrInterpolate_1(account.email || "No email")}</p></div></div><div class="mb-6"><div class="flex items-end justify-between mb-2"><div><span class="text-2xl font-bold block text-[#1E1919] dark:text-foreground">${ssrInterpolate_1(account.storagePercent !== null ? Math.round(account.storagePercent) : 0)}%</span><span class="text-xs text-muted-foreground font-medium uppercase tracking-wide">Usage</span></div><div class="text-right text-xs text-muted-foreground"><p><span class="font-medium text-foreground">${ssrInterpolate_1(formatBytes(account.used || 0))}</span> used</p><p>of ${ssrInterpolate_1(formatBytes(account.total || 0))}</p></div></div><div class="h-2 w-full bg-muted/50 rounded-full overflow-hidden"><div class="${ssrRenderClass_1([[
            account.storagePercent > 90 ? "bg-red-500" : account.storagePercent > 75 ? "bg-amber-500" : "bg-[#0061FE]"
          ], "h-full rounded-full transition-all duration-700 ease-out"])}" style="${ssrRenderStyle_1({ width: `${Math.min(account.storagePercent || 0, 100)}%` })}"></div></div></div><div class="flex items-center justify-between pt-4 border-t border-dashed"><span class="text-xs text-muted-foreground"> Added ${ssrInterpolate_1(formatDate(account.createdAt))}</span><div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">`);
          if (!account.isActive) {
            _push(`<button class="p-2 h-8 w-8 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-[#0061FE] transition-colors" title="Switch to this account">`);
            _push(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:arrow-right-left",
              class: "h-4 w-4"
            }, null, _parent));
            _push(`</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<button class="p-2 h-8 w-8 flex items-center justify-center rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors" title="Remove account">`);
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:trash-2",
            class: "h-4 w-4"
          }, null, _parent));
          _push(`</button></div></div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div></div>`);
      ssrRenderTeleport_1(_push, (_push2) => {
        if (vueExports.unref(deleteTarget)) {
          _push2(`<div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1E1919]/60 backdrop-blur-[2px]"><div class="bg-card w-full max-w-[400px] rounded-xl shadow-2xl border-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6"><div class="flex flex-col items-center text-center gap-4"><div class="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-2">`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:alert-triangle",
            class: "h-6 w-6"
          }, null, _parent));
          _push2(`</div><div><h3 class="text-lg font-semibold text-[#1E1919] dark:text-foreground">Remove Account?</h3><p class="text-sm text-muted-foreground mt-2 px-4"> Are you sure you want to remove <span class="font-medium text-foreground">${ssrInterpolate_1(vueExports.unref(deleteTarget).name)}</span>? <br>This will disconnect it from MultiBox. Your files on Dropbox will remain safe. </p></div><div class="flex gap-3 w-full mt-4"><button class="flex-1 h-10 rounded-lg border hover:bg-muted transition-colors text-sm font-medium"> Cancel </button><button${ssrIncludeBooleanAttr(vueExports.unref(isDeleting)) ? " disabled" : ""} class="flex-1 h-10 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-70">`);
          if (vueExports.unref(isDeleting)) {
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:loader-2",
              class: "h-4 w-4 animate-spin"
            }, null, _parent));
          } else {
            _push2(`<!---->`);
          }
          _push2(` ${ssrInterpolate_1(vueExports.unref(isDeleting) ? "Removing..." : "Remove")}</button></div></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport_1(_push, (_push2) => {
        if (vueExports.unref(showAddModal)) {
          _push2(`<div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1E1919]/60 backdrop-blur-[2px]"><div class="bg-card w-full max-w-[480px] rounded-xl shadow-2xl border-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200"><div class="px-6 py-5 border-b bg-background flex items-center justify-between"><h3 class="font-semibold text-lg text-[#1E1919] dark:text-foreground flex items-center gap-2">`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: "simple-icons:dropbox",
            class: "h-5 w-5 text-[#0061FE]"
          }, null, _parent));
          _push2(` Connect Dropbox </h3><button class="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors">`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:x",
            class: "h-5 w-5"
          }, null, _parent));
          _push2(`</button></div><div class="p-6">`);
          if (vueExports.unref(addStep) === "auth") {
            _push2(`<div class="space-y-6"><div class="p-4 bg-muted/20 rounded-lg border border-dashed text-sm text-muted-foreground"><p class="mb-2 font-medium text-foreground">Instructions:</p><ol class="list-decimal pl-4 space-y-1"><li>Click <strong>Authorize</strong> below to open Dropbox login.</li><li>Allow access to MultiBox app.</li><li>Copy the generated <strong>Access Code</strong>.</li><li>Paste the code in the field below.</li></ol></div><button class="w-full h-11 rounded-lg border-2 border-[#0061FE] text-[#0061FE] hover:bg-[#0061FE]/5 font-semibold text-sm transition-all flex items-center justify-center gap-2"> Authorize with Dropbox `);
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:external-link",
              class: "h-4 w-4"
            }, null, _parent));
            _push2(`</button><div class="relative py-2"><div class="absolute inset-0 flex items-center"><span class="w-full border-t"></span></div><div class="relative flex justify-center text-xs uppercase tracking-wider font-semibold"><span class="bg-card px-3 text-muted-foreground">Verification</span></div></div><div class="space-y-4"><div class="space-y-1.5"><label class="text-xs font-semibold uppercase text-muted-foreground">Access Code</label><input${ssrRenderAttr_1("value", vueExports.unref(authCode))} placeholder="Paste the code here..." class="w-full h-10 px-3 rounded-lg border bg-background focus:ring-2 focus:ring-[#0061FE]/20 focus:border-[#0061FE] transition-all font-mono text-sm"></div><div class="space-y-1.5"><label class="text-xs font-semibold uppercase text-muted-foreground">Account Alias (Optional)</label><input${ssrRenderAttr_1("value", vueExports.unref(accountName))} placeholder="e.g. &#39;Personal&#39; or &#39;Design Team&#39;" class="w-full h-10 px-3 rounded-lg border bg-background focus:ring-2 focus:ring-[#0061FE]/20 focus:border-[#0061FE] transition-all text-sm"></div></div><button${ssrIncludeBooleanAttr(!vueExports.unref(authCode) || vueExports.unref(isAddingAccount)) ? " disabled" : ""} class="w-full h-11 mt-2 rounded-lg bg-[#0061FE] hover:bg-[#0057E5] text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">`);
            if (vueExports.unref(isAddingAccount)) {
              _push2(ssrRenderComponent_1(_component_Icon, {
                name: "lucide:loader-2",
                class: "h-5 w-5 animate-spin"
              }, null, _parent));
            } else {
              _push2(`<span>Connect Account</span>`);
            }
            _push2(`</button></div>`);
          } else if (vueExports.unref(addStep) === "success") {
            _push2(`<div class="text-center py-8"><div class="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">`);
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:check",
              class: "h-8 w-8 text-green-600"
            }, null, _parent));
            _push2(`</div><h3 class="text-xl font-bold text-[#1E1919] dark:text-foreground mb-2">Account Connected!</h3><p class="text-muted-foreground mb-8"> Your Dropbox account has been successfully linked. </p><button class="w-full h-11 rounded-lg bg-[#0061FE] hover:bg-[#0057E5] text-white font-semibold text-sm transition-all"> Done </button></div>`);
          } else if (vueExports.unref(addStep) === "error") {
            _push2(`<div class="text-center py-6"><div class="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">`);
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:x",
              class: "h-7 w-7 text-red-600"
            }, null, _parent));
            _push2(`</div><h3 class="text-lg font-bold text-red-600 mb-2">Connection Failed</h3><p class="text-muted-foreground text-sm mb-6">${ssrInterpolate_1(vueExports.unref(addError))}</p><button class="w-full h-11 rounded-lg border hover:bg-muted font-semibold text-sm transition-all"> Try Again </button></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/accounts.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=accounts-p8xdITXW.mjs.map
