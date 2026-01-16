import { _ as __nuxt_component_1 } from './client-only-Db1Q_2tj.mjs';
import { _ as __nuxt_component_0 } from './server.mjs';
import { u as useAuth } from './useAuth-80HUuCYp.mjs';
import { a as useSupabaseClient } from './useSupabase-BKfis0hW.mjs';
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

const _sfc_main = /* @__PURE__ */ vueExports.defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { role } = useAuth();
    vueExports.computed(() => role.value === null);
    useSupabaseClient();
    vueExports.ref(null);
    vueExports.ref(false);
    vueExports.ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ClientOnly = __nuxt_component_1;
      const _component_Icon = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs_1(vueExports.mergeProps({ class: "h-full flex flex-col bg-background/50" }, _attrs))}>`);
      _push(ssrRenderComponent_1(_component_ClientOnly, null, {
        fallback: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="h-full flex items-center justify-center"${_scopeId}><div class="flex flex-col items-center gap-3"${_scopeId}>`);
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:loader-2",
              class: "animate-spin h-8 w-8 text-[#0061FE]"
            }, null, _parent2, _scopeId));
            _push2(`<p class="text-sm text-muted-foreground"${_scopeId}>Loading...</p></div></div>`);
          } else {
            return [
              vueExports.createVNode("div", { class: "h-full flex items-center justify-center" }, [
                vueExports.createVNode("div", { class: "flex flex-col items-center gap-3" }, [
                  vueExports.createVNode(_component_Icon, {
                    name: "lucide:loader-2",
                    class: "animate-spin h-8 w-8 text-[#0061FE]"
                  }),
                  vueExports.createVNode("p", { class: "text-sm text-muted-foreground" }, "Loading...")
                ])
              ])
            ];
          }
        })
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/drive/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-c-oXjU3a.mjs.map
