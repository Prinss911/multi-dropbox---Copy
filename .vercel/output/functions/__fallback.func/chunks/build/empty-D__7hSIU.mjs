import { a as _export_sfc } from './server.mjs';
import { s as ssrRenderAttrs_1, v as vueExports, e as ssrRenderSlot_1 } from '../routes/renderer.mjs';
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

const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  _push(`<div${ssrRenderAttrs_1(vueExports.mergeProps({ class: "fixed inset-0 overflow-auto bg-background" }, _attrs))}>`);
  ssrRenderSlot_1(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/empty.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const empty = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { empty as default };
//# sourceMappingURL=empty-D__7hSIU.mjs.map
