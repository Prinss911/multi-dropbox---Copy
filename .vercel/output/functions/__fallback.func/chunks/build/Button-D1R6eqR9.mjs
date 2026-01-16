import { P as Primitive } from './Primitive-D3IcFg81.mjs';
import { c as cn } from './cn-H80jjgLf.mjs';
import { v as vueExports, a as ssrRenderComponent_1, e as ssrRenderSlot_1 } from '../routes/renderer.mjs';

const _sfc_main = /* @__PURE__ */ vueExports.defineComponent({
  __name: "Button",
  __ssrInlineRender: true,
  props: {
    variant: { default: "default" },
    size: { default: "default" },
    class: {},
    asChild: { type: Boolean },
    as: { default: "button" }
  },
  setup(__props) {
    const props = __props;
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent_1(vueExports.unref(Primitive), vueExports.mergeProps({
        as: props.as,
        "as-child": props.asChild,
        class: vueExports.unref(cn)(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary text-primary-foreground hover:bg-primary/90": __props.variant === "default",
            "bg-destructive text-destructive-foreground hover:bg-destructive/90": __props.variant === "destructive",
            "border border-input bg-background hover:bg-accent hover:text-accent-foreground": __props.variant === "outline",
            "bg-secondary text-secondary-foreground hover:bg-secondary/80": __props.variant === "secondary",
            "hover:bg-accent hover:text-accent-foreground": __props.variant === "ghost",
            "text-primary underline-offset-4 hover:underline": __props.variant === "link",
            "h-10 px-4 py-2": __props.size === "default",
            "h-9 rounded-md px-3": __props.size === "sm",
            "h-11 rounded-md px-8": __props.size === "lg",
            "h-10 w-10": __props.size === "icon"
          },
          props.class
        )
      }, _attrs), {
        default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot_1(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              vueExports.renderSlot(_ctx.$slots, "default")
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/Button.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=Button-D1R6eqR9.mjs.map
