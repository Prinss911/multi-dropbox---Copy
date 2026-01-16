import { a as unrefElement } from '../_/index.mjs';
import { S as Slot, P as Primitive } from './Primitive-D3IcFg81.mjs';
import { v as vueExports } from '../routes/renderer.mjs';

function createContext(providerComponentName, contextName) {
  const symbolDescription = typeof providerComponentName === "string" && !contextName ? `${providerComponentName}Context` : contextName;
  const injectionKey = Symbol(symbolDescription);
  const injectContext = (fallback) => {
    const context = vueExports.inject(injectionKey, fallback);
    if (context) return context;
    if (context === null) return context;
    throw new Error(`Injection \`${injectionKey.toString()}\` not found. Component must be used within ${Array.isArray(providerComponentName) ? `one of the following components: ${providerComponentName.join(", ")}` : `\`${providerComponentName}\``}`);
  };
  const provideContext = (contextValue) => {
    vueExports.provide(injectionKey, contextValue);
    return contextValue;
  };
  return [injectContext, provideContext];
}
function useForwardExpose() {
  const instance = vueExports.getCurrentInstance();
  const currentRef = vueExports.ref();
  const currentElement = vueExports.computed(() => {
    var _a, _b;
    return ["#text", "#comment"].includes((_a = currentRef.value) == null ? void 0 : _a.$el.nodeName) ? (_b = currentRef.value) == null ? void 0 : _b.$el.nextElementSibling : unrefElement(currentRef);
  });
  const localExpose = Object.assign({}, instance.exposed);
  const ret = {};
  for (const key in instance.props) Object.defineProperty(ret, key, {
    enumerable: true,
    configurable: true,
    get: () => instance.props[key]
  });
  if (Object.keys(localExpose).length > 0) for (const key in localExpose) Object.defineProperty(ret, key, {
    enumerable: true,
    configurable: true,
    get: () => localExpose[key]
  });
  Object.defineProperty(ret, "$el", {
    enumerable: true,
    configurable: true,
    get: () => instance.vnode.el
  });
  instance.exposed = ret;
  function forwardRef(ref$1) {
    currentRef.value = ref$1;
    if (!ref$1) return;
    Object.defineProperty(ret, "$el", {
      enumerable: true,
      configurable: true,
      get: () => ref$1 instanceof Element ? ref$1 : ref$1.$el
    });
    if (!(ref$1 instanceof Element) && !Object.hasOwn(ref$1, "$el")) {
      const childExposed = ref$1.$.exposed;
      const merged = Object.assign({}, ret);
      for (const key in childExposed) Object.defineProperty(merged, key, {
        enumerable: true,
        configurable: true,
        get: () => childExposed[key]
      });
      instance.exposed = merged;
    }
  }
  return {
    forwardRef,
    currentRef,
    currentElement
  };
}
function usePrimitiveElement() {
  const primitiveElement = vueExports.ref();
  const currentElement = vueExports.computed(() => {
    var _a, _b;
    return ["#text", "#comment"].includes((_a = primitiveElement.value) == null ? void 0 : _a.$el.nodeName) ? (_b = primitiveElement.value) == null ? void 0 : _b.$el.nextElementSibling : unrefElement(primitiveElement);
  });
  return {
    primitiveElement,
    currentElement
  };
}
const ITEM_DATA_ATTR = "data-reka-collection-item";
function useCollection(options = {}) {
  const { key = "", isProvider = false } = options;
  const injectionKey = `${key}CollectionProvider`;
  let context;
  if (isProvider) {
    const itemMap = vueExports.ref(/* @__PURE__ */ new Map());
    const collectionRef = vueExports.ref();
    context = {
      collectionRef,
      itemMap
    };
    vueExports.provide(injectionKey, context);
  } else context = vueExports.inject(injectionKey);
  const getItems = (includeDisabledItem = false) => {
    const collectionNode = context.collectionRef.value;
    if (!collectionNode) return [];
    const orderedNodes = Array.from(collectionNode.querySelectorAll(`[${ITEM_DATA_ATTR}]`));
    const items = Array.from(context.itemMap.value.values());
    const orderedItems = items.sort((a, b) => orderedNodes.indexOf(a.ref) - orderedNodes.indexOf(b.ref));
    if (includeDisabledItem) return orderedItems;
    else return orderedItems.filter((i) => i.ref.dataset.disabled !== "");
  };
  const CollectionSlot = vueExports.defineComponent({
    name: "CollectionSlot",
    setup(_, { slots }) {
      const { primitiveElement, currentElement } = usePrimitiveElement();
      vueExports.watch(currentElement, () => {
        context.collectionRef.value = currentElement.value;
      });
      return () => vueExports.h(Slot, { ref: primitiveElement }, slots);
    }
  });
  const CollectionItem = vueExports.defineComponent({
    name: "CollectionItem",
    inheritAttrs: false,
    props: { value: { validator: () => true } },
    setup(props, { slots, attrs }) {
      const { primitiveElement, currentElement } = usePrimitiveElement();
      vueExports.watchEffect((cleanupFn) => {
        if (currentElement.value) {
          const key$1 = vueExports.markRaw(currentElement.value);
          context.itemMap.value.set(key$1, {
            ref: currentElement.value,
            value: props.value
          });
          cleanupFn(() => context.itemMap.value.delete(key$1));
        }
      });
      return () => vueExports.h(Slot, {
        ...attrs,
        [ITEM_DATA_ATTR]: "",
        ref: primitiveElement
      }, slots);
    }
  });
  const reactiveItems = vueExports.computed(() => Array.from(context.itemMap.value.values()));
  const itemMapSize = vueExports.computed(() => context.itemMap.value.size);
  return {
    getItems,
    reactiveItems,
    itemMapSize,
    CollectionSlot,
    CollectionItem
  };
}
var VisuallyHidden_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ vueExports.defineComponent({
  __name: "VisuallyHidden",
  props: {
    feature: {
      type: String,
      required: false,
      default: "focusable"
    },
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false,
      default: "span"
    }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return vueExports.openBlock(), vueExports.createBlock(vueExports.unref(Primitive), {
        as: _ctx.as,
        "as-child": _ctx.asChild,
        "aria-hidden": _ctx.feature === "focusable" ? "true" : void 0,
        "data-hidden": _ctx.feature === "fully-hidden" ? "" : void 0,
        tabindex: _ctx.feature === "fully-hidden" ? "-1" : void 0,
        style: {
          position: "absolute",
          border: 0,
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          clipPath: "inset(50%)",
          whiteSpace: "nowrap",
          wordWrap: "normal",
          top: "-1px",
          left: "-1px"
        }
      }, {
        default: vueExports.withCtx(() => [vueExports.renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 8, [
        "as",
        "as-child",
        "aria-hidden",
        "data-hidden",
        "tabindex"
      ]);
    };
  }
});
var VisuallyHidden_default = VisuallyHidden_vue_vue_type_script_setup_true_lang_default;

export { VisuallyHidden_default as V, useCollection as a, usePrimitiveElement as b, createContext as c, useForwardExpose as u };
//# sourceMappingURL=VisuallyHidden-6QTMh8_p.mjs.map
