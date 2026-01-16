import { v as vueExports } from '../routes/renderer.mjs';

function renderSlotFragments(children) {
  if (!children) return [];
  return children.flatMap((child) => {
    if (child.type === vueExports.Fragment) return renderSlotFragments(child.children);
    return [child];
  });
}
const Slot = vueExports.defineComponent({
  name: "PrimitiveSlot",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => {
      var _a;
      if (!slots.default) return null;
      const children = renderSlotFragments(slots.default());
      const firstNonCommentChildrenIndex = children.findIndex((child) => child.type !== vueExports.Comment);
      if (firstNonCommentChildrenIndex === -1) return children;
      const firstNonCommentChildren = children[firstNonCommentChildrenIndex];
      (_a = firstNonCommentChildren.props) == null ? true : delete _a.ref;
      const mergedProps = firstNonCommentChildren.props ? vueExports.mergeProps(attrs, firstNonCommentChildren.props) : attrs;
      const cloned = vueExports.cloneVNode({
        ...firstNonCommentChildren,
        props: {}
      }, mergedProps);
      if (children.length === 1) return cloned;
      children[firstNonCommentChildrenIndex] = cloned;
      return children;
    };
  }
});
const SELF_CLOSING_TAGS = [
  "area",
  "img",
  "input"
];
const Primitive = vueExports.defineComponent({
  name: "Primitive",
  inheritAttrs: false,
  props: {
    asChild: {
      type: Boolean,
      default: false
    },
    as: {
      type: [String, Object],
      default: "div"
    }
  },
  setup(props, { attrs, slots }) {
    const asTag = props.asChild ? "template" : props.as;
    if (typeof asTag === "string" && SELF_CLOSING_TAGS.includes(asTag)) return () => vueExports.h(asTag, attrs);
    if (asTag !== "template") return () => vueExports.h(props.as, attrs, { default: slots.default });
    return () => vueExports.h(Slot, attrs, { default: slots.default });
  }
});

export { Primitive as P, Slot as S, renderSlotFragments as r };
//# sourceMappingURL=Primitive-D3IcFg81.mjs.map
