import { u as useRouter, _ as __nuxt_component_0 } from './server.mjs';
import { _ as _sfc_main$1 } from './Button-D1R6eqR9.mjs';
import { v as vueExports, s as ssrRenderAttrs_1, a as ssrRenderComponent_1 } from '../routes/renderer.mjs';
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
  __name: "access-denied",
  __ssrInlineRender: true,
  setup(__props) {
    const router = useRouter();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0;
      const _component_UiButton = _sfc_main$1;
      _push(`<div${ssrRenderAttrs_1(vueExports.mergeProps({ class: "min-h-screen bg-background flex flex-col items-center justify-center p-4" }, _attrs))}><div class="text-center space-y-6 max-w-md"><div class="relative w-24 h-24 mx-auto"><div class="absolute inset-0 bg-red-100 dark:bg-red-900/20 rounded-full animate-pulse"></div><div class="relative flex items-center justify-center w-full h-full text-red-600 dark:text-red-500">`);
      _push(ssrRenderComponent_1(_component_Icon, {
        name: "lucide:shield-alert",
        class: "w-12 h-12"
      }, null, _parent));
      _push(`</div></div><div class="space-y-2"><h1 class="text-3xl font-bold tracking-tight">Access Denied</h1><p class="text-muted-foreground"> You don&#39;t have permission to access this page. Please contact your administrator if you believe this is a mistake. </p></div><div class="flex gap-4 justify-center">`);
      _push(ssrRenderComponent_1(_component_UiButton, {
        variant: "outline",
        onClick: ($event) => vueExports.unref(router).back()
      }, {
        default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:arrow-left",
              class: "mr-2 h-4 w-4"
            }, null, _parent2, _scopeId));
            _push2(` Go Back `);
          } else {
            return [
              vueExports.createVNode(_component_Icon, {
                name: "lucide:arrow-left",
                class: "mr-2 h-4 w-4"
              }),
              vueExports.createTextVNode(" Go Back ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent_1(_component_UiButton, {
        onClick: ($event) => vueExports.unref(router).push("/")
      }, {
        default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:home",
              class: "mr-2 h-4 w-4"
            }, null, _parent2, _scopeId));
            _push2(` Home `);
          } else {
            return [
              vueExports.createVNode(_component_Icon, {
                name: "lucide:home",
                class: "mr-2 h-4 w-4"
              }),
              vueExports.createTextVNode(" Home ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/access-denied.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=access-denied-BCpA04KZ.mjs.map
