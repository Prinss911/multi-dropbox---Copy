import { v as vueExports } from '../routes/renderer.mjs';

vueExports.defineComponent({
  name: "ServerPlaceholder",
  render() {
    return vueExports.createElementBlock("div");
  }
});
const clientOnlySymbol = Symbol.for("nuxt:client-only");
const __nuxt_component_1 = vueExports.defineComponent({
  name: "ClientOnly",
  inheritAttrs: false,
  props: ["fallback", "placeholder", "placeholderTag", "fallbackTag"],
  setup(_, { slots, attrs }) {
    const mounted = vueExports.ref(false);
    vueExports.provide(clientOnlySymbol, true);
    return (props) => {
      var _a;
      if (mounted.value) {
        return (_a = slots.default) == null ? void 0 : _a.call(slots);
      }
      const slot = slots.fallback || slots.placeholder;
      if (slot) {
        return slot();
      }
      const fallbackStr = props.fallback || props.placeholder || "";
      const fallbackTag = props.fallbackTag || props.placeholderTag || "span";
      return vueExports.createElementBlock(fallbackTag, attrs, fallbackStr);
    };
  }
});

export { __nuxt_component_1 as _ };
//# sourceMappingURL=client-only-Db1Q_2tj.mjs.map
