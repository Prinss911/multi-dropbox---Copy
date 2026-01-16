import { _ as __nuxt_component_0 } from './server.mjs';
import { _ as _sfc_main$1 } from './Button-D1R6eqR9.mjs';
import { a as useSupabaseClient } from './useSupabase-BKfis0hW.mjs';
import { u as useAuthFetch } from './useAuthFetch-BRq2GRoU.mjs';
import { u as useAuth } from './useAuth-80HUuCYp.mjs';
import { v as vueExports, s as ssrRenderAttrs_1, b as ssrInterpolate_1, a as ssrRenderComponent_1, i as ssrRenderAttr_1, f as ssrRenderList_1, h as ssrRenderClass_1, l as ssrIncludeBooleanAttr, k as ssrRenderTeleport_1, m as ssrLooseContain_1, n as ssrLooseEqual_1 } from '../routes/renderer.mjs';
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

const _sfc_main = /* @__PURE__ */ vueExports.defineComponent({
  __name: "users",
  __ssrInlineRender: true,
  setup(__props) {
    useSupabaseClient();
    useAuthFetch();
    const { user: currentUser } = useAuth();
    const isLoading = vueExports.ref(false);
    const isDeleting = vueExports.ref(false);
    const deleteTarget = vueExports.ref(null);
    const searchQuery = vueExports.ref("");
    const rawProfiles = vueExports.ref([]);
    const filteredUsers = vueExports.computed(() => {
      let result = rawProfiles.value.map((profile) => {
        let status = "Invited";
        if (profile.status === "active") {
          status = "Active";
        } else if (profile.status === "inactive") {
          status = "Inactive";
        } else if (profile.status === "invited" || !profile.status) {
          status = "Invited";
        }
        return {
          id: profile.id,
          name: profile.name || "",
          email: profile.email || "Unknown",
          role: profile.role || "user",
          status,
          lastLogin: new Date(profile.updated_at || profile.created_at).toISOString()
        };
      });
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        result = result.filter(
          (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
        );
      }
      return result;
    });
    const users = vueExports.computed(() => rawProfiles.value);
    const isModalOpen = vueExports.ref(false);
    const editingUser = vueExports.ref(null);
    const formData = vueExports.reactive({
      name: "",
      email: "",
      role: "user",
      status: "Active"
    });
    const getInitials = (name) => {
      if (!name) return "?";
      return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };
    const formatDate = (dateStr) => {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    };
    const openModal = (user = null) => {
      editingUser.value = user;
      if (user) {
        formData.name = user.name;
        formData.email = user.email;
        formData.role = user.role;
        formData.status = user.status;
      } else {
        formData.name = "";
        formData.email = "";
        formData.role = "user";
        formData.status = "Invited";
      }
      isModalOpen.value = true;
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0;
      const _component_UiButton = _sfc_main$1;
      _push(`<div${ssrRenderAttrs_1(vueExports.mergeProps({ class: "h-full flex flex-col bg-background/50" }, _attrs))}><div class="sticky top-0 z-20 bg-background/95 backdrop-blur border-b px-6 py-4"><div class="w-full"><div class="flex flex-col md:flex-row md:items-center justify-between gap-4"><div><h1 class="text-xl font-semibold text-[#1E1919] dark:text-foreground">Users &amp; Roles</h1><p class="text-sm text-muted-foreground">Manage access for ${ssrInterpolate_1(vueExports.unref(users).length)} users</p></div><div class="flex items-center gap-3"><div class="relative group hidden sm:block">`);
      _push(ssrRenderComponent_1(_component_Icon, {
        name: "lucide:search",
        class: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors"
      }, null, _parent));
      _push(`<input${ssrRenderAttr_1("value", vueExports.unref(searchQuery))} type="text" placeholder="Find user..." class="h-10 pl-9 pr-4 w-64 rounded-full border bg-muted/20 hover:bg-muted/40 focus:bg-background focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"></div>`);
      _push(ssrRenderComponent_1(_component_UiButton, {
        onClick: ($event) => openModal(),
        class: "bg-[#0061FE] hover:bg-[#0057E5] text-white"
      }, {
        default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:mail-plus",
              class: "mr-2 h-4 w-4"
            }, null, _parent2, _scopeId));
            _push2(` Invite User `);
          } else {
            return [
              vueExports.createVNode(_component_Icon, {
                name: "lucide:mail-plus",
                class: "mr-2 h-4 w-4"
              }),
              vueExports.createTextVNode(" Invite User ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div></div><div class="flex-1 overflow-auto px-4 md:px-6 py-6 transition-all"><div class="w-full h-full">`);
      if (vueExports.unref(isLoading)) {
        _push(`<div class="flex flex-col items-center justify-center py-20 text-muted-foreground">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:loader-2",
          class: "animate-spin h-8 w-8 text-[#0061FE] mb-4"
        }, null, _parent));
        _push(`<p class="text-sm">Loading users...</p></div>`);
      } else {
        _push(`<div class="bg-card rounded-xl border shadow-sm overflow-hidden"><table class="w-full text-left border-collapse"><thead class="bg-muted/30"><tr><th class="py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-[40%]">User</th><th class="py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b hidden md:table-cell">Role</th><th class="py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b hidden sm:table-cell">Status</th><th class="py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b hidden lg:table-cell">Last Login</th><th class="py-3 px-6 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">Actions</th></tr></thead><tbody class="divide-y divide-border/40"><!--[-->`);
        ssrRenderList_1(vueExports.unref(filteredUsers), (user) => {
          var _a, _b;
          _push(`<tr class="group hover:bg-[#F7F9FA] dark:hover:bg-muted/20 transition-colors"><td class="py-4 px-6"><div class="flex items-center gap-4"><div class="${ssrRenderClass_1([[
            user.role === "admin" ? "bg-gradient-to-br from-purple-500 to-indigo-600" : "bg-gradient-to-br from-blue-400 to-blue-600"
          ], "h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 text-white shadow-sm"])}">${ssrInterpolate_1(getInitials(user.name || user.email))}</div><div class="min-w-0"><p class="font-medium text-sm text-[#1E1919] dark:text-foreground truncate">${ssrInterpolate_1(user.name || (user.status === "Invited" ? "Pending Invite" : user.email.split("@")[0]))}</p><p class="text-xs text-muted-foreground truncate">${ssrInterpolate_1(user.email)}</p></div></div></td><td class="py-4 px-6 hidden md:table-cell"><span class="${ssrRenderClass_1([[
            user.role === "admin" ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400" : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
          ], "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap"])}">`);
          _push(ssrRenderComponent_1(_component_Icon, {
            name: user.role === "admin" ? "lucide:shield-check" : "lucide:user",
            class: "h-3 w-3"
          }, null, _parent));
          _push(` ${ssrInterpolate_1(user.role)}</span></td><td class="py-4 px-6 hidden sm:table-cell"><span class="${ssrRenderClass_1([{
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400": user.status === "Active",
            "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400": user.status === "Invited",
            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400": user.status === "Inactive"
          }, "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"])}"><span class="h-1.5 w-1.5 rounded-full bg-current opacity-60"></span> ${ssrInterpolate_1(user.status)}</span></td><td class="py-4 px-6 text-sm text-muted-foreground hidden lg:table-cell">${ssrInterpolate_1(formatDate(user.lastLogin))}</td><td class="py-4 px-6 text-right"><div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">`);
          if (user.status === "Invited") {
            _push(`<button class="h-8 px-3 rounded text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors mr-2"> Resend </button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<button class="h-8 w-8 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Edit User">`);
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:pencil",
            class: "h-4 w-4"
          }, null, _parent));
          _push(`</button><button title="Delete User"${ssrIncludeBooleanAttr(user.id === ((_a = vueExports.unref(currentUser)) == null ? void 0 : _a.id)) ? " disabled" : ""} class="${ssrRenderClass_1([{ "opacity-50 cursor-not-allowed": user.id === ((_b = vueExports.unref(currentUser)) == null ? void 0 : _b.id) }, "h-8 w-8 flex items-center justify-center rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"])}">`);
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:trash-2",
            class: "h-4 w-4"
          }, null, _parent));
          _push(`</button></div></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      }
      _push(`</div></div>`);
      ssrRenderTeleport_1(_push, (_push2) => {
        if (vueExports.unref(isModalOpen)) {
          _push2(`<div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1E1919]/60 backdrop-blur-[2px]"><div class="bg-card w-full max-w-md rounded-xl shadow-2xl border-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200"><div class="px-6 py-5 border-b bg-background flex items-center justify-between"><h3 class="font-semibold text-lg text-[#1E1919] dark:text-foreground flex items-center gap-2">`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: vueExports.unref(editingUser) ? "lucide:user-cog" : "lucide:mail-plus",
            class: "h-5 w-5 text-[#0061FE]"
          }, null, _parent));
          _push2(` ${ssrInterpolate_1(vueExports.unref(editingUser) ? "Edit User" : "Invite User")}</h3><button class="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors">`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:x",
            class: "h-5 w-5"
          }, null, _parent));
          _push2(`</button></div><div class="p-6 space-y-4">`);
          if (vueExports.unref(editingUser)) {
            _push2(`<div class="space-y-1.5"><label class="text-xs font-semibold uppercase text-muted-foreground">Full Name</label><input${ssrRenderAttr_1("value", vueExports.unref(formData).name)} placeholder="John Doe" class="w-full h-10 px-3 rounded-lg border bg-background focus:ring-2 focus:ring-[#0061FE]/20 focus:border-[#0061FE] transition-all text-sm"></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="space-y-1.5"><label class="text-xs font-semibold uppercase text-muted-foreground">Email Address</label><div class="relative">`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:mail",
            class: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          }, null, _parent));
          _push2(`<input${ssrRenderAttr_1("value", vueExports.unref(formData).email)} type="email" placeholder="colleague@example.com"${ssrIncludeBooleanAttr(!!vueExports.unref(editingUser)) ? " disabled" : ""} class="w-full h-10 pl-9 pr-3 rounded-lg border bg-background focus:ring-2 focus:ring-[#0061FE]/20 focus:border-[#0061FE] transition-all text-sm disabled:opacity-60 disabled:bg-muted/50"></div>`);
          if (!vueExports.unref(editingUser)) {
            _push2(`<p class="text-xs text-muted-foreground mt-1"> We&#39;ll send an invitation link to this email. </p>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div><div class="grid grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold uppercase text-muted-foreground">Role</label><div class="relative"><select class="w-full h-10 pl-3 pr-8 rounded-lg border bg-background focus:ring-2 focus:ring-[#0061FE]/20 focus:border-[#0061FE] transition-all text-sm appearance-none"><option value="user"${ssrIncludeBooleanAttr(Array.isArray(vueExports.unref(formData).role) ? ssrLooseContain_1(vueExports.unref(formData).role, "user") : ssrLooseEqual_1(vueExports.unref(formData).role, "user")) ? " selected" : ""}>User</option><option value="admin"${ssrIncludeBooleanAttr(Array.isArray(vueExports.unref(formData).role) ? ssrLooseContain_1(vueExports.unref(formData).role, "admin") : ssrLooseEqual_1(vueExports.unref(formData).role, "admin")) ? " selected" : ""}>Admin</option></select>`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:chevron-down",
            class: "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
          }, null, _parent));
          _push2(`</div></div>`);
          if (vueExports.unref(editingUser)) {
            _push2(`<div class="space-y-1.5"><label class="text-xs font-semibold uppercase text-muted-foreground">Status</label><div class="relative"><select class="w-full h-10 pl-3 pr-8 rounded-lg border bg-background focus:ring-2 focus:ring-[#0061FE]/20 focus:border-[#0061FE] transition-all text-sm appearance-none"><option value="Active"${ssrIncludeBooleanAttr(Array.isArray(vueExports.unref(formData).status) ? ssrLooseContain_1(vueExports.unref(formData).status, "Active") : ssrLooseEqual_1(vueExports.unref(formData).status, "Active")) ? " selected" : ""}>Active</option><option value="Inactive"${ssrIncludeBooleanAttr(Array.isArray(vueExports.unref(formData).status) ? ssrLooseContain_1(vueExports.unref(formData).status, "Inactive") : ssrLooseEqual_1(vueExports.unref(formData).status, "Inactive")) ? " selected" : ""}>Inactive</option><option value="Invited"${ssrIncludeBooleanAttr(Array.isArray(vueExports.unref(formData).status) ? ssrLooseContain_1(vueExports.unref(formData).status, "Invited") : ssrLooseEqual_1(vueExports.unref(formData).status, "Invited")) ? " selected" : ""}>Invited</option></select>`);
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:chevron-down",
              class: "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            }, null, _parent));
            _push2(`</div></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div><div class="pt-2"><button${ssrIncludeBooleanAttr(vueExports.unref(isLoading)) ? " disabled" : ""} class="w-full h-11 rounded-lg bg-[#0061FE] hover:bg-[#0057E5] text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70">`);
          if (vueExports.unref(isLoading)) {
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:loader-2",
              class: "h-5 w-5 animate-spin"
            }, null, _parent));
          } else {
            _push2(`<span>${ssrInterpolate_1(vueExports.unref(editingUser) ? "Save Changes" : "Send Invitation")}</span>`);
          }
          _push2(`</button></div></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport_1(_push, (_push2) => {
        if (vueExports.unref(deleteTarget)) {
          _push2(`<div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1E1919]/60 backdrop-blur-[2px]"><div class="bg-card w-full max-w-[400px] rounded-xl shadow-2xl border-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6"><div class="flex flex-col items-center text-center gap-4"><div class="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-2">`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:user-x",
            class: "h-6 w-6"
          }, null, _parent));
          _push2(`</div><div><h3 class="text-lg font-semibold text-[#1E1919] dark:text-foreground">Delete User?</h3><p class="text-sm text-muted-foreground mt-2 px-4"> Are you sure you want to remove access for <br><span class="font-medium text-foreground">${ssrInterpolate_1(vueExports.unref(deleteTarget).name || vueExports.unref(deleteTarget).email)}</span>? </p><p class="text-xs text-red-500/80 mt-2 font-medium">This action cannot be undone.</p></div><div class="flex gap-3 w-full mt-2"><button class="flex-1 h-10 rounded-lg border hover:bg-muted transition-colors text-sm font-medium"> Cancel </button><button${ssrIncludeBooleanAttr(vueExports.unref(isDeleting)) ? " disabled" : ""} class="flex-1 h-10 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-70">`);
          if (vueExports.unref(isDeleting)) {
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:loader-2",
              class: "h-4 w-4 animate-spin"
            }, null, _parent));
          } else {
            _push2(`<!---->`);
          }
          _push2(` ${ssrInterpolate_1(vueExports.unref(isDeleting) ? "Deleting..." : "Delete User")}</button></div></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/users.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=users-DYh3Bzkm.mjs.map
