import { a as _export_sfc, u as useRouter, _ as __nuxt_component_0 } from './server.mjs';
import { u as useAuth } from './useAuth-80HUuCYp.mjs';
import { v as vueExports, s as ssrRenderAttrs_1, a as ssrRenderComponent_1, b as ssrInterpolate_1, i as ssrRenderAttr_1, l as ssrIncludeBooleanAttr, p as ssrRenderDynamicModel_1 } from '../routes/renderer.mjs';
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

const _sfc_main = /* @__PURE__ */ vueExports.defineComponent({
  __name: "login",
  __ssrInlineRender: true,
  setup(__props) {
    useAuth();
    const email = vueExports.ref("");
    const password = vueExports.ref("");
    const isLoading = vueExports.ref(false);
    const showPassword = vueExports.ref(false);
    const error = vueExports.ref("");
    useRouter();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs_1(vueExports.mergeProps({ class: "min-h-screen w-full flex bg-background" }, _attrs))} data-v-2936d31d><div class="hidden lg:flex w-1/2 relative bg-[#0F0F12] overflow-hidden text-white flex-col justify-between p-12" data-v-2936d31d><div class="absolute inset-0 z-0" data-v-2936d31d><div class="absolute top-0 right-0 w-[800px] h-[800px] bg-[#0061FE]/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse-slow" data-v-2936d31d></div><div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" data-v-2936d31d></div></div><div class="relative z-10" data-v-2936d31d><div class="flex items-center gap-3 mb-8" data-v-2936d31d><div class="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/25" data-v-2936d31d>`);
      _push(ssrRenderComponent_1(_component_Icon, {
        name: "lucide:hard-drive",
        class: "h-5 w-5"
      }, null, _parent));
      _push(`</div><span class="font-bold text-xl tracking-tight" data-v-2936d31d>MultiBox</span></div></div><div class="relative z-10 max-w-lg mb-12" data-v-2936d31d><h2 class="text-4xl font-bold leading-tight mb-6 tracking-tight" data-v-2936d31d> One place for all your <br data-v-2936d31d><span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400" data-v-2936d31d>digital assets.</span></h2><p class="text-white/60 text-lg leading-relaxed" data-v-2936d31d> Manage multiple Dropbox accounts, share files securely, and collaborate with your team in one unified dashboard. </p></div><div class="relative z-10 flex gap-4 text-sm text-white/40" data-v-2936d31d><span data-v-2936d31d>\xA9 ${ssrInterpolate_1((/* @__PURE__ */ new Date()).getFullYear())} MultiBox Inc.</span><a href="#" class="hover:text-white transition-colors" data-v-2936d31d>Privacy</a><a href="#" class="hover:text-white transition-colors" data-v-2936d31d>Terms</a></div></div><div class="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-12 relative bg-background" data-v-2936d31d><div class="w-full max-w-[400px] space-y-8 fade-in-up" data-v-2936d31d><div class="lg:hidden flex justify-center mb-8" data-v-2936d31d><div class="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/25" data-v-2936d31d>`);
      _push(ssrRenderComponent_1(_component_Icon, {
        name: "lucide:hard-drive",
        class: "h-6 w-6"
      }, null, _parent));
      _push(`</div></div><div class="space-y-2 text-center lg:text-left" data-v-2936d31d><h1 class="text-3xl font-bold tracking-tight text-[#1E1919] dark:text-white" data-v-2936d31d>Welcome back</h1><p class="text-muted-foreground" data-v-2936d31d>Sign in to access your workspace</p></div><form class="space-y-5" data-v-2936d31d><div class="space-y-2" data-v-2936d31d><label class="text-sm font-semibold text-[#1E1919] dark:text-foreground" for="email" data-v-2936d31d> Email Address </label><div class="relative group" data-v-2936d31d>`);
      _push(ssrRenderComponent_1(_component_Icon, {
        name: "lucide:mail",
        class: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#0061FE] transition-colors"
      }, null, _parent));
      _push(`<input id="email"${ssrRenderAttr_1("value", vueExports.unref(email))} type="email" placeholder="name@example.com" required${ssrIncludeBooleanAttr(vueExports.unref(isLoading)) ? " disabled" : ""} class="flex h-11 w-full rounded-xl border bg-muted/20 px-3 pl-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0061FE] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all" data-v-2936d31d></div></div><div class="space-y-2" data-v-2936d31d><div class="flex items-center justify-between" data-v-2936d31d><label class="text-sm font-semibold text-[#1E1919] dark:text-foreground" for="password" data-v-2936d31d> Password </label><a href="#" class="text-xs font-medium text-[#0061FE] hover:text-[#0057E5] hover:underline" data-v-2936d31d> Forgot password? </a></div><div class="relative group" data-v-2936d31d>`);
      _push(ssrRenderComponent_1(_component_Icon, {
        name: "lucide:lock",
        class: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#0061FE] transition-colors"
      }, null, _parent));
      _push(`<input id="password"${ssrRenderDynamicModel_1(vueExports.unref(showPassword) ? "text" : "password", vueExports.unref(password), null)}${ssrRenderAttr_1("type", vueExports.unref(showPassword) ? "text" : "password")} required${ssrIncludeBooleanAttr(vueExports.unref(isLoading)) ? " disabled" : ""} placeholder="Enter your password" class="flex h-11 w-full rounded-xl border bg-muted/20 px-3 pl-10 pr-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0061FE] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all" data-v-2936d31d><button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1" tabindex="-1" data-v-2936d31d>`);
      _push(ssrRenderComponent_1(_component_Icon, {
        name: vueExports.unref(showPassword) ? "lucide:eye-off" : "lucide:eye",
        class: "h-4 w-4"
      }, null, _parent));
      _push(`</button></div></div>`);
      if (vueExports.unref(error)) {
        _push(`<div class="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2 animate-in slide-in-from-top-2 fade-in" data-v-2936d31d>`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:alert-circle",
          class: "h-4 w-4 shrink-0"
        }, null, _parent));
        _push(` ${ssrInterpolate_1(vueExports.unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button type="submit"${ssrIncludeBooleanAttr(vueExports.unref(isLoading)) ? " disabled" : ""} class="w-full h-11 bg-[#0061FE] hover:bg-[#0057E5] text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5" data-v-2936d31d>`);
      if (vueExports.unref(isLoading)) {
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:loader-2",
          class: "h-5 w-5 animate-spin"
        }, null, _parent));
      } else {
        _push(`<span data-v-2936d31d>Sign In</span>`);
      }
      _push(`</button></form><p class="text-center text-sm text-muted-foreground" data-v-2936d31d> Don&#39;t have an account? <a href="#" class="font-medium text-[#0061FE] hover:underline" data-v-2936d31d>Contact Admin</a></p></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const login = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-2936d31d"]]);

export { login as default };
//# sourceMappingURL=login-DyfVB1kD.mjs.map
