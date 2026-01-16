import { u as useVModel } from '../_/index.mjs';
import { c as cn } from './cn-H80jjgLf.mjs';
import { v as vueExports, s as ssrRenderAttrs_1, o as ssrGetDynamicModelProps_1 } from '../routes/renderer.mjs';

const _sfc_main = /* @__PURE__ */ vueExports.defineComponent({
  __name: "Input",
  __ssrInlineRender: true,
  props: {
    defaultValue: {},
    modelValue: {},
    class: {}
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const modelValue = useVModel(props, "modelValue", emits, {
      passive: true,
      defaultValue: props.defaultValue
    });
    return (_ctx, _push, _parent, _attrs) => {
      let _temp0;
      _push(`<input${ssrRenderAttrs_1((_temp0 = vueExports.mergeProps({
        class: vueExports.unref(cn)("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", props.class)
      }, _attrs), vueExports.mergeProps(_temp0, ssrGetDynamicModelProps_1(_temp0, vueExports.unref(modelValue)))))}>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/Input.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=Input-QSQMvZ04.mjs.map
