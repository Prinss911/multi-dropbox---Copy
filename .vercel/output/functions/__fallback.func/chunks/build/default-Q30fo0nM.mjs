import { b as useRoute, e as useRuntimeConfig, _ as __nuxt_component_0 } from './server.mjs';
import { _ as __nuxt_component_1 } from './client-only-Db1Q_2tj.mjs';
import { _ as _sfc_main$2 } from './Button-D1R6eqR9.mjs';
import { _ as _sfc_main$3 } from './Input-QSQMvZ04.mjs';
import { u as useAuth } from './useAuth-80HUuCYp.mjs';
import { u as useAccounts, a as useDropboxFiles } from './useDropboxFiles-OACIDE_L.mjs';
import { a as useCollection, c as createContext, u as useForwardExpose, V as VisuallyHidden_default } from './VisuallyHidden-6QTMh8_p.mjs';
import { P as Primitive, r as renderSlotFragments } from './Primitive-D3IcFg81.mjs';
import { u as useVModel, o as onKeyStroke, a as unrefElement, c as useRafFn, d as defaultWindow, e as useTimeout } from '../_/index.mjs';
import { u as useToast } from './useToast-Cu2d6NoU.mjs';
import { v as vueExports, s as ssrRenderAttrs_1, h as ssrRenderClass_1, a as ssrRenderComponent_1, e as ssrRenderSlot_1, k as ssrRenderTeleport_1, b as ssrInterpolate_1, f as ssrRenderList_1 } from '../routes/renderer.mjs';
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
import './cn-H80jjgLf.mjs';
import './useSupabase-BKfis0hW.mjs';
import './useAuthFetch-BRq2GRoU.mjs';

function getActiveElement() {
  let activeElement = (void 0).activeElement;
  if (activeElement == null) return null;
  while (activeElement != null && activeElement.shadowRoot != null && activeElement.shadowRoot.activeElement != null) activeElement = activeElement.shadowRoot.activeElement;
  return activeElement;
}
function useStateMachine(initialState, machine) {
  const state = vueExports.ref(initialState);
  function reducer(event) {
    const nextState = machine[state.value][event];
    return nextState != null ? nextState : state.value;
  }
  const dispatch = (event) => {
    state.value = reducer(event);
  };
  return {
    state,
    dispatch
  };
}
function usePresence(present, node) {
  var _a2;
  var _a;
  const stylesRef = vueExports.ref({});
  const prevAnimationNameRef = vueExports.ref("none");
  const prevPresentRef = vueExports.ref(present);
  const initialState = present.value ? "mounted" : "unmounted";
  let timeoutId;
  const ownerWindow = (_a2 = (_a = node.value) == null ? void 0 : _a.ownerDocument.defaultView) != null ? _a2 : defaultWindow;
  const { state, dispatch } = useStateMachine(initialState, {
    mounted: {
      UNMOUNT: "unmounted",
      ANIMATION_OUT: "unmountSuspended"
    },
    unmountSuspended: {
      MOUNT: "mounted",
      ANIMATION_END: "unmounted"
    },
    unmounted: { MOUNT: "mounted" }
  });
  vueExports.watch(present, async (currentPresent, prevPresent) => {
    var _a22;
    const hasPresentChanged = prevPresent !== currentPresent;
    await vueExports.nextTick();
    if (hasPresentChanged) {
      const prevAnimationName = prevAnimationNameRef.value;
      const currentAnimationName = getAnimationName(node.value);
      if (currentPresent) {
        dispatch("MOUNT");
      } else if (currentAnimationName === "none" || currentAnimationName === "undefined" || ((_a22 = stylesRef.value) == null ? void 0 : _a22.display) === "none") {
        dispatch("UNMOUNT");
      } else {
        const isAnimating = prevAnimationName !== currentAnimationName;
        if (prevPresent && isAnimating) {
          dispatch("ANIMATION_OUT");
        } else {
          dispatch("UNMOUNT");
        }
      }
    }
  }, { immediate: true });
  const handleAnimationEnd = (event) => {
    const currentAnimationName = getAnimationName(node.value);
    const isCurrentAnimation = currentAnimationName.includes(CSS.escape(event.animationName));
    state.value === "mounted" ? "enter" : "leave";
    if (event.target === node.value && isCurrentAnimation) {
      dispatch("ANIMATION_END");
      if (!prevPresentRef.value) {
        const currentFillMode = node.value.style.animationFillMode;
        node.value.style.animationFillMode = "forwards";
        timeoutId = ownerWindow == null ? void 0 : ownerWindow.setTimeout(() => {
          var _a22;
          if (((_a22 = node.value) == null ? void 0 : _a22.style.animationFillMode) === "forwards") node.value.style.animationFillMode = currentFillMode;
        });
      }
    }
    if (event.target === node.value && currentAnimationName === "none") dispatch("ANIMATION_END");
  };
  const handleAnimationStart = (event) => {
    if (event.target === node.value) prevAnimationNameRef.value = getAnimationName(node.value);
  };
  vueExports.watch(node, (newNode, oldNode) => {
    if (newNode) {
      stylesRef.value = getComputedStyle(newNode);
      newNode.addEventListener("animationstart", handleAnimationStart);
      newNode.addEventListener("animationcancel", handleAnimationEnd);
      newNode.addEventListener("animationend", handleAnimationEnd);
    } else {
      dispatch("ANIMATION_END");
      if (timeoutId !== void 0) ownerWindow == null ? void 0 : ownerWindow.clearTimeout(timeoutId);
      oldNode == null ? void 0 : oldNode.removeEventListener("animationstart", handleAnimationStart);
      oldNode == null ? void 0 : oldNode.removeEventListener("animationcancel", handleAnimationEnd);
      oldNode == null ? void 0 : oldNode.removeEventListener("animationend", handleAnimationEnd);
    }
  }, { immediate: true });
  vueExports.watch(state, () => {
    const currentAnimationName = getAnimationName(node.value);
    prevAnimationNameRef.value = state.value === "mounted" ? currentAnimationName : "none";
  });
  const isPresent = vueExports.computed(() => ["mounted", "unmountSuspended"].includes(state.value));
  return { isPresent };
}
function getAnimationName(node) {
  return node ? getComputedStyle(node).animationName || "none" : "none";
}
var Presence_default = vueExports.defineComponent({
  name: "Presence",
  props: {
    present: {
      type: Boolean,
      required: true
    },
    forceMount: { type: Boolean }
  },
  slots: {},
  setup(props, { slots, expose }) {
    var _a;
    const { present, forceMount } = vueExports.toRefs(props);
    const node = vueExports.ref();
    const { isPresent } = usePresence(present, node);
    expose({ present: isPresent });
    let children = slots.default({ present: isPresent.value });
    children = renderSlotFragments(children || []);
    const instance = vueExports.getCurrentInstance();
    if (children && (children == null ? void 0 : children.length) > 1) {
      const componentName = ((_a = instance == null ? void 0 : instance.parent) == null ? void 0 : _a.type.name) ? `<${instance.parent.type.name} />` : "component";
      throw new Error([
        `Detected an invalid children for \`${componentName}\` for  \`Presence\` component.`,
        "",
        "Note: Presence works similarly to `v-if` directly, but it waits for animation/transition to finished before unmounting. So it expect only one direct child of valid VNode type.",
        "You can apply a few solutions:",
        ["Provide a single child element so that `presence` directive attach correctly.", "Ensure the first child is an actual element instead of a raw text node or comment node."].map((line) => `  - ${line}`).join("\n")
      ].join("\n"));
    }
    return () => {
      if (forceMount.value || present.value || isPresent.value) return vueExports.h(slots.default({ present: isPresent.value })[0], { ref: (v) => {
        const el = unrefElement(v);
        if (typeof (el == null ? void 0 : el.hasAttribute) === "undefined") return el;
        if (el == null ? void 0 : el.hasAttribute("data-reka-popper-content-wrapper")) node.value = el.firstElementChild;
        else node.value = el;
        return el;
      } });
      else return null;
    };
  }
});
var DismissableLayerBranch_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ vueExports.defineComponent({
  __name: "DismissableLayerBranch",
  props: {
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false
    }
  },
  setup(__props) {
    const props = __props;
    const { forwardRef } = useForwardExpose();
    return (_ctx, _cache) => {
      return vueExports.openBlock(), vueExports.createBlock(vueExports.unref(Primitive), vueExports.mergeProps({ ref: vueExports.unref(forwardRef) }, props), {
        default: vueExports.withCtx(() => [vueExports.renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 16);
    };
  }
});
var DismissableLayerBranch_default = DismissableLayerBranch_vue_vue_type_script_setup_true_lang_default;
function focusFirst(candidates, { select = false } = {}) {
  const previouslyFocusedElement = getActiveElement();
  for (const candidate of candidates) {
    focus(candidate, { select });
    if (getActiveElement() !== previouslyFocusedElement) return true;
  }
}
function getTabbableCandidates(container) {
  const nodes = [];
  const walker = (void 0).createTreeWalker(container, NodeFilter.SHOW_ELEMENT, { acceptNode: (node) => {
    const isHiddenInput = node.tagName === "INPUT" && node.type === "hidden";
    if (node.disabled || node.hidden || isHiddenInput) return NodeFilter.FILTER_SKIP;
    return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
  } });
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}
function isSelectableInput(element) {
  return element instanceof HTMLInputElement && "select" in element;
}
function focus(element, { select = false } = {}) {
  if (element && element.focus) {
    const previouslyFocusedElement = getActiveElement();
    element.focus({ preventScroll: true });
    if (element !== previouslyFocusedElement && isSelectableInput(element) && select) element.select();
  }
}
var ToastAnnounceExclude_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ vueExports.defineComponent({
  __name: "ToastAnnounceExclude",
  props: {
    altText: {
      type: String,
      required: false
    },
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false
    }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return vueExports.openBlock(), vueExports.createBlock(vueExports.unref(Primitive), {
        as: _ctx.as,
        "as-child": _ctx.asChild,
        "data-reka-toast-announce-exclude": "",
        "data-reka-toast-announce-alt": _ctx.altText || void 0
      }, {
        default: vueExports.withCtx(() => [vueExports.renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 8, [
        "as",
        "as-child",
        "data-reka-toast-announce-alt"
      ]);
    };
  }
});
var ToastAnnounceExclude_default = ToastAnnounceExclude_vue_vue_type_script_setup_true_lang_default;
const [injectToastProviderContext, provideToastProviderContext] = createContext("ToastProvider");
var ToastProvider_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ vueExports.defineComponent({
  inheritAttrs: false,
  __name: "ToastProvider",
  props: {
    label: {
      type: String,
      required: false,
      default: "Notification"
    },
    duration: {
      type: Number,
      required: false,
      default: 5e3
    },
    disableSwipe: {
      type: Boolean,
      required: false
    },
    swipeDirection: {
      type: String,
      required: false,
      default: "right"
    },
    swipeThreshold: {
      type: Number,
      required: false,
      default: 50
    }
  },
  setup(__props) {
    const props = __props;
    const { label, duration, disableSwipe, swipeDirection, swipeThreshold } = vueExports.toRefs(props);
    useCollection({ isProvider: true });
    const viewport = vueExports.ref();
    const toastCount = vueExports.ref(0);
    const isFocusedToastEscapeKeyDownRef = vueExports.ref(false);
    const isClosePausedRef = vueExports.ref(false);
    if (props.label && typeof props.label === "string" && !props.label.trim()) {
      const error = "Invalid prop `label` supplied to `ToastProvider`. Expected non-empty `string`.";
      throw new Error(error);
    }
    provideToastProviderContext({
      label,
      duration,
      disableSwipe,
      swipeDirection,
      swipeThreshold,
      toastCount,
      viewport,
      onViewportChange(el) {
        viewport.value = el;
      },
      onToastAdd() {
        toastCount.value++;
      },
      onToastRemove() {
        toastCount.value--;
      },
      isFocusedToastEscapeKeyDownRef,
      isClosePausedRef
    });
    return (_ctx, _cache) => {
      return vueExports.renderSlot(_ctx.$slots, "default");
    };
  }
});
var ToastProvider_default = ToastProvider_vue_vue_type_script_setup_true_lang_default;
var ToastAnnounce_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ vueExports.defineComponent({
  __name: "ToastAnnounce",
  setup(__props) {
    const providerContext = injectToastProviderContext();
    const isAnnounced = useTimeout(1e3);
    const renderAnnounceText = vueExports.ref(false);
    useRafFn(() => {
      renderAnnounceText.value = true;
    });
    return (_ctx, _cache) => {
      return vueExports.unref(isAnnounced) || renderAnnounceText.value ? (vueExports.openBlock(), vueExports.createBlock(vueExports.unref(VisuallyHidden_default), { key: 0 }, {
        default: vueExports.withCtx(() => [vueExports.createTextVNode(vueExports.toDisplayString(vueExports.unref(providerContext).label.value) + " ", 1), vueExports.renderSlot(_ctx.$slots, "default")]),
        _: 3
      })) : vueExports.createCommentVNode("v-if", true);
    };
  }
});
var ToastAnnounce_default = ToastAnnounce_vue_vue_type_script_setup_true_lang_default;
const TOAST_SWIPE_START = "toast.swipeStart";
const TOAST_SWIPE_MOVE = "toast.swipeMove";
const TOAST_SWIPE_CANCEL = "toast.swipeCancel";
const TOAST_SWIPE_END = "toast.swipeEnd";
const VIEWPORT_PAUSE = "toast.viewportPause";
const VIEWPORT_RESUME = "toast.viewportResume";
function handleAndDispatchCustomEvent(name, handler, detail) {
  const currentTarget = detail.originalEvent.currentTarget;
  const event = new CustomEvent(name, {
    bubbles: false,
    cancelable: true,
    detail
  });
  if (handler) currentTarget.addEventListener(name, handler, { once: true });
  currentTarget.dispatchEvent(event);
}
function isDeltaInDirection(delta, direction, threshold = 0) {
  const deltaX = Math.abs(delta.x);
  const deltaY = Math.abs(delta.y);
  const isDeltaX = deltaX > deltaY;
  if (direction === "left" || direction === "right") return isDeltaX && deltaX > threshold;
  else return !isDeltaX && deltaY > threshold;
}
function isHTMLElement(node) {
  return node.nodeType === node.ELEMENT_NODE;
}
function getAnnounceTextContent(container) {
  const textContent = [];
  const childNodes = Array.from(container.childNodes);
  childNodes.forEach((node) => {
    if (node.nodeType === node.TEXT_NODE && node.textContent) textContent.push(node.textContent);
    if (isHTMLElement(node)) {
      const isHidden = node.ariaHidden || node.hidden || node.style.display === "none";
      const isExcluded = node.dataset.rekaToastAnnounceExclude === "";
      if (!isHidden) if (isExcluded) {
        const altText = node.dataset.rekaToastAnnounceAlt;
        if (altText) textContent.push(altText);
      } else textContent.push(...getAnnounceTextContent(node));
    }
  });
  return textContent;
}
const [injectToastRootContext, provideToastRootContext] = createContext("ToastRoot");
var ToastRootImpl_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ vueExports.defineComponent({
  inheritAttrs: false,
  __name: "ToastRootImpl",
  props: {
    type: {
      type: String,
      required: false
    },
    open: {
      type: Boolean,
      required: false,
      default: false
    },
    duration: {
      type: Number,
      required: false
    },
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false,
      default: "li"
    }
  },
  emits: [
    "close",
    "escapeKeyDown",
    "pause",
    "resume",
    "swipeStart",
    "swipeMove",
    "swipeCancel",
    "swipeEnd"
  ],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const { forwardRef, currentElement } = useForwardExpose();
    const { CollectionItem } = useCollection();
    const providerContext = injectToastProviderContext();
    const pointerStartRef = vueExports.ref(null);
    const swipeDeltaRef = vueExports.ref(null);
    const duration = vueExports.computed(() => typeof props.duration === "number" ? props.duration : providerContext.duration.value);
    const closeTimerStartTimeRef = vueExports.ref(0);
    const closeTimerRemainingTimeRef = vueExports.ref(duration.value);
    const closeTimerRef = vueExports.ref(0);
    const remainingTime = vueExports.ref(duration.value);
    const remainingRaf = useRafFn(() => {
      const elapsedTime = (/* @__PURE__ */ new Date()).getTime() - closeTimerStartTimeRef.value;
      remainingTime.value = Math.max(closeTimerRemainingTimeRef.value - elapsedTime, 0);
    }, { fpsLimit: 60 });
    function startTimer(duration$1) {
      if (duration$1 <= 0 || duration$1 === Number.POSITIVE_INFINITY) return;
      return;
    }
    function handleClose(event) {
      var _a, _b;
      const isNonPointerEvent = (event == null ? void 0 : event.pointerType) === "";
      const isFocusInToast = (_a = currentElement.value) == null ? void 0 : _a.contains(getActiveElement());
      if (isFocusInToast && isNonPointerEvent) (_b = providerContext.viewport.value) == null ? void 0 : _b.focus();
      if (isNonPointerEvent) providerContext.isClosePausedRef.value = false;
      emits("close");
    }
    const announceTextContent = vueExports.computed(() => currentElement.value ? getAnnounceTextContent(currentElement.value) : null);
    if (props.type && !["foreground", "background"].includes(props.type)) {
      const error = "Invalid prop `type` supplied to `Toast`. Expected `foreground | background`.";
      throw new Error(error);
    }
    vueExports.watchEffect((cleanupFn) => {
      const viewport = providerContext.viewport.value;
      if (viewport) {
        const handleResume = () => {
          startTimer(closeTimerRemainingTimeRef.value);
          remainingRaf.resume();
          emits("resume");
        };
        const handlePause = () => {
          const elapsedTime = (/* @__PURE__ */ new Date()).getTime() - closeTimerStartTimeRef.value;
          closeTimerRemainingTimeRef.value = closeTimerRemainingTimeRef.value - elapsedTime;
          (void 0).clearTimeout(closeTimerRef.value);
          remainingRaf.pause();
          emits("pause");
        };
        viewport.addEventListener(VIEWPORT_PAUSE, handlePause);
        viewport.addEventListener(VIEWPORT_RESUME, handleResume);
        return () => {
          viewport.removeEventListener(VIEWPORT_PAUSE, handlePause);
          viewport.removeEventListener(VIEWPORT_RESUME, handleResume);
        };
      }
    });
    vueExports.watch(() => [props.open, duration.value], () => {
      closeTimerRemainingTimeRef.value = duration.value;
      if (props.open && !providerContext.isClosePausedRef.value) startTimer(duration.value);
    }, { immediate: true });
    onKeyStroke("Escape", (event) => {
      emits("escapeKeyDown", event);
      if (!event.defaultPrevented) {
        providerContext.isFocusedToastEscapeKeyDownRef.value = true;
        handleClose();
      }
    });
    provideToastRootContext({ onClose: handleClose });
    return (_ctx, _cache) => {
      return vueExports.openBlock(), vueExports.createElementBlock(vueExports.Fragment, null, [announceTextContent.value ? (vueExports.openBlock(), vueExports.createBlock(ToastAnnounce_default, {
        key: 0,
        role: "alert",
        "aria-live": _ctx.type === "foreground" ? "assertive" : "polite",
        "aria-atomic": "true"
      }, {
        default: vueExports.withCtx(() => [vueExports.createTextVNode(vueExports.toDisplayString(announceTextContent.value), 1)]),
        _: 1
      }, 8, ["aria-live"])) : vueExports.createCommentVNode("v-if", true), vueExports.unref(providerContext).viewport.value ? (vueExports.openBlock(), vueExports.createBlock(vueExports.Teleport, {
        key: 1,
        to: vueExports.unref(providerContext).viewport.value
      }, [vueExports.createVNode(vueExports.unref(CollectionItem), null, {
        default: vueExports.withCtx(() => [vueExports.createVNode(vueExports.unref(Primitive), vueExports.mergeProps({
          ref: vueExports.unref(forwardRef),
          role: "alert",
          "aria-live": "off",
          "aria-atomic": "true",
          tabindex: "0"
        }, _ctx.$attrs, {
          as: _ctx.as,
          "as-child": _ctx.asChild,
          "data-state": _ctx.open ? "open" : "closed",
          "data-swipe-direction": vueExports.unref(providerContext).swipeDirection.value,
          style: vueExports.unref(providerContext).disableSwipe.value ? void 0 : {
            userSelect: "none",
            touchAction: "none"
          },
          onPointerdown: _cache[0] || (_cache[0] = vueExports.withModifiers((event) => {
            if (vueExports.unref(providerContext).disableSwipe.value) return;
            pointerStartRef.value = {
              x: event.clientX,
              y: event.clientY
            };
          }, ["left"])),
          onPointermove: _cache[1] || (_cache[1] = (event) => {
            if (vueExports.unref(providerContext).disableSwipe.value || !pointerStartRef.value) return;
            const x = event.clientX - pointerStartRef.value.x;
            const y = event.clientY - pointerStartRef.value.y;
            const hasSwipeMoveStarted = Boolean(swipeDeltaRef.value);
            const isHorizontalSwipe = ["left", "right"].includes(vueExports.unref(providerContext).swipeDirection.value);
            const clamp = ["left", "up"].includes(vueExports.unref(providerContext).swipeDirection.value) ? Math.min : Math.max;
            const clampedX = isHorizontalSwipe ? clamp(0, x) : 0;
            const clampedY = !isHorizontalSwipe ? clamp(0, y) : 0;
            const moveStartBuffer = event.pointerType === "touch" ? 10 : 2;
            const delta = {
              x: clampedX,
              y: clampedY
            };
            const eventDetail = {
              originalEvent: event,
              delta
            };
            if (hasSwipeMoveStarted) {
              swipeDeltaRef.value = delta;
              vueExports.unref(handleAndDispatchCustomEvent)(vueExports.unref(TOAST_SWIPE_MOVE), (ev) => emits("swipeMove", ev), eventDetail);
            } else if (vueExports.unref(isDeltaInDirection)(delta, vueExports.unref(providerContext).swipeDirection.value, moveStartBuffer)) {
              swipeDeltaRef.value = delta;
              vueExports.unref(handleAndDispatchCustomEvent)(vueExports.unref(TOAST_SWIPE_START), (ev) => emits("swipeStart", ev), eventDetail);
              event.target.setPointerCapture(event.pointerId);
            } else if (Math.abs(x) > moveStartBuffer || Math.abs(y) > moveStartBuffer) pointerStartRef.value = null;
          }),
          onPointerup: _cache[2] || (_cache[2] = (event) => {
            if (vueExports.unref(providerContext).disableSwipe.value) return;
            const delta = swipeDeltaRef.value;
            const target = event.target;
            if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
            swipeDeltaRef.value = null;
            pointerStartRef.value = null;
            if (delta) {
              const toast = event.currentTarget;
              const eventDetail = {
                originalEvent: event,
                delta
              };
              if (vueExports.unref(isDeltaInDirection)(delta, vueExports.unref(providerContext).swipeDirection.value, vueExports.unref(providerContext).swipeThreshold.value)) vueExports.unref(handleAndDispatchCustomEvent)(vueExports.unref(TOAST_SWIPE_END), (ev) => emits("swipeEnd", ev), eventDetail);
              else vueExports.unref(handleAndDispatchCustomEvent)(vueExports.unref(TOAST_SWIPE_CANCEL), (ev) => emits("swipeCancel", ev), eventDetail);
              toast == null ? void 0 : toast.addEventListener("click", (event$1) => event$1.preventDefault(), { once: true });
            }
          })
        }), {
          default: vueExports.withCtx(() => [vueExports.renderSlot(_ctx.$slots, "default", {
            remaining: remainingTime.value,
            duration: duration.value
          })]),
          _: 3
        }, 16, [
          "as",
          "as-child",
          "data-state",
          "data-swipe-direction",
          "style"
        ])]),
        _: 3
      })], 8, ["to"])) : vueExports.createCommentVNode("v-if", true)], 64);
    };
  }
});
var ToastRootImpl_default = ToastRootImpl_vue_vue_type_script_setup_true_lang_default;
var ToastClose_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ vueExports.defineComponent({
  __name: "ToastClose",
  props: {
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false,
      default: "button"
    }
  },
  setup(__props) {
    const props = __props;
    const rootContext = injectToastRootContext();
    const { forwardRef } = useForwardExpose();
    return (_ctx, _cache) => {
      return vueExports.openBlock(), vueExports.createBlock(ToastAnnounceExclude_default, { "as-child": "" }, {
        default: vueExports.withCtx(() => [vueExports.createVNode(vueExports.unref(Primitive), vueExports.mergeProps(props, {
          ref: vueExports.unref(forwardRef),
          type: _ctx.as === "button" ? "button" : void 0,
          onClick: vueExports.unref(rootContext).onClose
        }), {
          default: vueExports.withCtx(() => [vueExports.renderSlot(_ctx.$slots, "default")]),
          _: 3
        }, 16, ["type", "onClick"])]),
        _: 3
      });
    };
  }
});
var ToastClose_default = ToastClose_vue_vue_type_script_setup_true_lang_default;
var ToastAction_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ vueExports.defineComponent({
  __name: "ToastAction",
  props: {
    altText: {
      type: String,
      required: true
    },
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false
    }
  },
  setup(__props) {
    const props = __props;
    if (!props.altText) throw new Error("Missing prop `altText` expected on `ToastAction`");
    const { forwardRef } = useForwardExpose();
    return (_ctx, _cache) => {
      return _ctx.altText ? (vueExports.openBlock(), vueExports.createBlock(ToastAnnounceExclude_default, {
        key: 0,
        "alt-text": _ctx.altText,
        "as-child": ""
      }, {
        default: vueExports.withCtx(() => [vueExports.createVNode(ToastClose_default, {
          ref: vueExports.unref(forwardRef),
          as: _ctx.as,
          "as-child": _ctx.asChild
        }, {
          default: vueExports.withCtx(() => [vueExports.renderSlot(_ctx.$slots, "default")]),
          _: 3
        }, 8, ["as", "as-child"])]),
        _: 3
      }, 8, ["alt-text"])) : vueExports.createCommentVNode("v-if", true);
    };
  }
});
var ToastAction_default = ToastAction_vue_vue_type_script_setup_true_lang_default;
var ToastDescription_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ vueExports.defineComponent({
  __name: "ToastDescription",
  props: {
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false
    }
  },
  setup(__props) {
    const props = __props;
    useForwardExpose();
    return (_ctx, _cache) => {
      return vueExports.openBlock(), vueExports.createBlock(vueExports.unref(Primitive), vueExports.normalizeProps(vueExports.guardReactiveProps(props)), {
        default: vueExports.withCtx(() => [vueExports.renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 16);
    };
  }
});
var ToastDescription_default = ToastDescription_vue_vue_type_script_setup_true_lang_default;
var ToastRoot_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ vueExports.defineComponent({
  __name: "ToastRoot",
  props: {
    defaultOpen: {
      type: Boolean,
      required: false,
      default: true
    },
    forceMount: {
      type: Boolean,
      required: false
    },
    type: {
      type: String,
      required: false,
      default: "foreground"
    },
    open: {
      type: Boolean,
      required: false,
      default: void 0
    },
    duration: {
      type: Number,
      required: false
    },
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false,
      default: "li"
    }
  },
  emits: [
    "escapeKeyDown",
    "pause",
    "resume",
    "swipeStart",
    "swipeMove",
    "swipeCancel",
    "swipeEnd",
    "update:open"
  ],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const { forwardRef } = useForwardExpose();
    const open = useVModel(props, "open", emits, {
      defaultValue: props.defaultOpen,
      passive: props.open === void 0
    });
    return (_ctx, _cache) => {
      return vueExports.openBlock(), vueExports.createBlock(vueExports.unref(Presence_default), { present: _ctx.forceMount || vueExports.unref(open) }, {
        default: vueExports.withCtx(() => [vueExports.createVNode(ToastRootImpl_default, vueExports.mergeProps({
          ref: vueExports.unref(forwardRef),
          open: vueExports.unref(open),
          type: _ctx.type,
          as: _ctx.as,
          "as-child": _ctx.asChild,
          duration: _ctx.duration
        }, _ctx.$attrs, {
          onClose: _cache[0] || (_cache[0] = ($event) => open.value = false),
          onPause: _cache[1] || (_cache[1] = ($event) => emits("pause")),
          onResume: _cache[2] || (_cache[2] = ($event) => emits("resume")),
          onEscapeKeyDown: _cache[3] || (_cache[3] = ($event) => emits("escapeKeyDown", $event)),
          onSwipeStart: _cache[4] || (_cache[4] = (event) => {
            emits("swipeStart", event);
            if (!event.defaultPrevented) event.currentTarget.setAttribute("data-swipe", "start");
          }),
          onSwipeMove: _cache[5] || (_cache[5] = (event) => {
            emits("swipeMove", event);
            if (!event.defaultPrevented) {
              const { x, y } = event.detail.delta;
              const target = event.currentTarget;
              target.setAttribute("data-swipe", "move");
              target.style.setProperty("--reka-toast-swipe-move-x", `${x}px`);
              target.style.setProperty("--reka-toast-swipe-move-y", `${y}px`);
            }
          }),
          onSwipeCancel: _cache[6] || (_cache[6] = (event) => {
            emits("swipeCancel", event);
            if (!event.defaultPrevented) {
              const target = event.currentTarget;
              target.setAttribute("data-swipe", "cancel");
              target.style.removeProperty("--reka-toast-swipe-move-x");
              target.style.removeProperty("--reka-toast-swipe-move-y");
              target.style.removeProperty("--reka-toast-swipe-end-x");
              target.style.removeProperty("--reka-toast-swipe-end-y");
            }
          }),
          onSwipeEnd: _cache[7] || (_cache[7] = (event) => {
            emits("swipeEnd", event);
            if (!event.defaultPrevented) {
              const { x, y } = event.detail.delta;
              const target = event.currentTarget;
              target.setAttribute("data-swipe", "end");
              target.style.removeProperty("--reka-toast-swipe-move-x");
              target.style.removeProperty("--reka-toast-swipe-move-y");
              target.style.setProperty("--reka-toast-swipe-end-x", `${x}px`);
              target.style.setProperty("--reka-toast-swipe-end-y", `${y}px`);
              open.value = false;
            }
          })
        }), {
          default: vueExports.withCtx(({ remaining, duration: _duration }) => [vueExports.renderSlot(_ctx.$slots, "default", {
            remaining,
            duration: _duration,
            open: vueExports.unref(open)
          })]),
          _: 3
        }, 16, [
          "open",
          "type",
          "as",
          "as-child",
          "duration"
        ])]),
        _: 3
      }, 8, ["present"]);
    };
  }
});
var ToastRoot_default = ToastRoot_vue_vue_type_script_setup_true_lang_default;
var ToastTitle_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ vueExports.defineComponent({
  __name: "ToastTitle",
  props: {
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false
    }
  },
  setup(__props) {
    const props = __props;
    useForwardExpose();
    return (_ctx, _cache) => {
      return vueExports.openBlock(), vueExports.createBlock(vueExports.unref(Primitive), vueExports.normalizeProps(vueExports.guardReactiveProps(props)), {
        default: vueExports.withCtx(() => [vueExports.renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 16);
    };
  }
});
var ToastTitle_default = ToastTitle_vue_vue_type_script_setup_true_lang_default;
var FocusProxy_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ vueExports.defineComponent({
  __name: "FocusProxy",
  emits: ["focusFromOutsideViewport"],
  setup(__props, { emit: __emit }) {
    const emits = __emit;
    const providerContext = injectToastProviderContext();
    return (_ctx, _cache) => {
      return vueExports.openBlock(), vueExports.createBlock(vueExports.unref(VisuallyHidden_default), {
        "aria-hidden": "true",
        tabindex: "0",
        style: { "position": "fixed" },
        onFocus: _cache[0] || (_cache[0] = (event) => {
          var _a;
          const prevFocusedElement = event.relatedTarget;
          const isFocusFromOutsideViewport = !((_a = vueExports.unref(providerContext).viewport.value) == null ? void 0 : _a.contains(prevFocusedElement));
          if (isFocusFromOutsideViewport) emits("focusFromOutsideViewport");
        })
      }, {
        default: vueExports.withCtx(() => [vueExports.renderSlot(_ctx.$slots, "default")]),
        _: 3
      });
    };
  }
});
var FocusProxy_default = FocusProxy_vue_vue_type_script_setup_true_lang_default;
var ToastViewport_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ vueExports.defineComponent({
  inheritAttrs: false,
  __name: "ToastViewport",
  props: {
    hotkey: {
      type: Array,
      required: false,
      default: () => ["F8"]
    },
    label: {
      type: [String, Function],
      required: false,
      default: "Notifications ({hotkey})"
    },
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false,
      default: "ol"
    }
  },
  setup(__props) {
    const props = __props;
    const { hotkey, label } = vueExports.toRefs(props);
    const { forwardRef, currentElement } = useForwardExpose();
    const { CollectionSlot, getItems } = useCollection();
    const providerContext = injectToastProviderContext();
    const hasToasts = vueExports.computed(() => providerContext.toastCount.value > 0);
    const headFocusProxyRef = vueExports.ref();
    const tailFocusProxyRef = vueExports.ref();
    const hotkeyMessage = vueExports.computed(() => hotkey.value.join("+").replace(/Key/g, "").replace(/Digit/g, ""));
    onKeyStroke(hotkey.value, () => {
      currentElement.value.focus();
    });
    vueExports.watchEffect((cleanupFn) => {
      const viewport = currentElement.value;
      if (hasToasts.value && viewport) {
        const handlePause = () => {
          if (!providerContext.isClosePausedRef.value) {
            const pauseEvent = new CustomEvent(VIEWPORT_PAUSE);
            viewport.dispatchEvent(pauseEvent);
            providerContext.isClosePausedRef.value = true;
          }
        };
        const handleResume = () => {
          if (providerContext.isClosePausedRef.value) {
            const resumeEvent = new CustomEvent(VIEWPORT_RESUME);
            viewport.dispatchEvent(resumeEvent);
            providerContext.isClosePausedRef.value = false;
          }
        };
        const handleFocusOutResume = (event) => {
          const isFocusMovingOutside = !viewport.contains(event.relatedTarget);
          if (isFocusMovingOutside) handleResume();
        };
        const handlePointerLeaveResume = () => {
          const isFocusInside = viewport.contains(getActiveElement());
          if (!isFocusInside) handleResume();
        };
        const handleKeyDown = (event) => {
          var _a, _b, _c;
          const isMetaKey = event.altKey || event.ctrlKey || event.metaKey;
          const isTabKey = event.key === "Tab" && !isMetaKey;
          if (isTabKey) {
            const focusedElement = getActiveElement();
            const isTabbingBackwards = event.shiftKey;
            const targetIsViewport = event.target === viewport;
            if (targetIsViewport && isTabbingBackwards) {
              (_a = headFocusProxyRef.value) == null ? void 0 : _a.focus();
              return;
            }
            const tabbingDirection = isTabbingBackwards ? "backwards" : "forwards";
            const sortedCandidates = getSortedTabbableCandidates({ tabbingDirection });
            const index = sortedCandidates.findIndex((candidate) => candidate === focusedElement);
            if (focusFirst(sortedCandidates.slice(index + 1))) event.preventDefault();
            else isTabbingBackwards ? (_b = headFocusProxyRef.value) == null ? void 0 : _b.focus() : (_c = tailFocusProxyRef.value) == null ? void 0 : _c.focus();
          }
        };
        viewport.addEventListener("focusin", handlePause);
        viewport.addEventListener("focusout", handleFocusOutResume);
        viewport.addEventListener("pointermove", handlePause);
        viewport.addEventListener("pointerleave", handlePointerLeaveResume);
        viewport.addEventListener("keydown", handleKeyDown);
        (void 0).addEventListener("blur", handlePause);
        (void 0).addEventListener("focus", handleResume);
        cleanupFn(() => {
          viewport.removeEventListener("focusin", handlePause);
          viewport.removeEventListener("focusout", handleFocusOutResume);
          viewport.removeEventListener("pointermove", handlePause);
          viewport.removeEventListener("pointerleave", handlePointerLeaveResume);
          viewport.removeEventListener("keydown", handleKeyDown);
          (void 0).removeEventListener("blur", handlePause);
          (void 0).removeEventListener("focus", handleResume);
        });
      }
    });
    function getSortedTabbableCandidates({ tabbingDirection }) {
      const toastItems = getItems().map((i) => i.ref);
      const tabbableCandidates = toastItems.map((toastNode) => {
        const toastTabbableCandidates = [toastNode, ...getTabbableCandidates(toastNode)];
        return tabbingDirection === "forwards" ? toastTabbableCandidates : toastTabbableCandidates.reverse();
      });
      return (tabbingDirection === "forwards" ? tabbableCandidates.reverse() : tabbableCandidates).flat();
    }
    return (_ctx, _cache) => {
      return vueExports.openBlock(), vueExports.createBlock(vueExports.unref(DismissableLayerBranch_default), {
        role: "region",
        "aria-label": typeof vueExports.unref(label) === "string" ? vueExports.unref(label).replace("{hotkey}", hotkeyMessage.value) : vueExports.unref(label)(hotkeyMessage.value),
        tabindex: "-1",
        style: vueExports.normalizeStyle({ pointerEvents: hasToasts.value ? void 0 : "none" })
      }, {
        default: vueExports.withCtx(() => [
          hasToasts.value ? (vueExports.openBlock(), vueExports.createBlock(FocusProxy_default, {
            key: 0,
            ref: (node) => {
              headFocusProxyRef.value = vueExports.unref(unrefElement)(node);
              return void 0;
            },
            onFocusFromOutsideViewport: _cache[0] || (_cache[0] = () => {
              const tabbableCandidates = getSortedTabbableCandidates({ tabbingDirection: "forwards" });
              vueExports.unref(focusFirst)(tabbableCandidates);
            })
          }, null, 512)) : vueExports.createCommentVNode("v-if", true),
          vueExports.createVNode(vueExports.unref(CollectionSlot), null, {
            default: vueExports.withCtx(() => [vueExports.createVNode(vueExports.unref(Primitive), vueExports.mergeProps({
              ref: vueExports.unref(forwardRef),
              tabindex: "-1",
              as: _ctx.as,
              "as-child": _ctx.asChild
            }, _ctx.$attrs), {
              default: vueExports.withCtx(() => [vueExports.renderSlot(_ctx.$slots, "default")]),
              _: 3
            }, 16, ["as", "as-child"])]),
            _: 3
          }),
          hasToasts.value ? (vueExports.openBlock(), vueExports.createBlock(FocusProxy_default, {
            key: 1,
            ref: (node) => {
              tailFocusProxyRef.value = vueExports.unref(unrefElement)(node);
              return void 0;
            },
            onFocusFromOutsideViewport: _cache[1] || (_cache[1] = () => {
              const tabbableCandidates = getSortedTabbableCandidates({ tabbingDirection: "backwards" });
              vueExports.unref(focusFirst)(tabbableCandidates);
            })
          }, null, 512)) : vueExports.createCommentVNode("v-if", true)
        ]),
        _: 3
      }, 8, ["aria-label", "style"]);
    };
  }
});
var ToastViewport_default = ToastViewport_vue_vue_type_script_setup_true_lang_default;
const _sfc_main$1 = /* @__PURE__ */ vueExports.defineComponent({
  __name: "Toaster",
  __ssrInlineRender: true,
  setup(__props) {
    const { toasts } = useToast();
    const getVariantClasses = (variant) => {
      switch (variant) {
        case "destructive":
          return "group destructive border-destructive bg-destructive text-destructive-foreground";
        case "success":
          return "group success border-green-500 bg-green-50 text-green-900 dark:bg-green-900 dark:text-green-100";
        case "warning":
          return "group warning border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100";
        case "info":
          return "group info border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-900 dark:text-blue-100";
        default:
          return "group border bg-background text-foreground";
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0;
      _push(ssrRenderComponent_1(vueExports.unref(ToastProvider_default), _attrs, {
        default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<!--[-->`);
            ssrRenderList_1(vueExports.unref(toasts), (toast) => {
              _push2(ssrRenderComponent_1(vueExports.unref(ToastRoot_default), {
                key: toast.id,
                open: toast.open,
                "onUpdate:open": ($event) => toast.open = $event,
                duration: toast.duration,
                class: [
                  "pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--reka-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--reka-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
                  getVariantClasses(toast.variant)
                ]
              }, {
                default: vueExports.withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<div class="grid gap-1"${_scopeId2}>`);
                    if (toast.title) {
                      _push3(ssrRenderComponent_1(vueExports.unref(ToastTitle_default), { class: "text-sm font-semibold" }, {
                        default: vueExports.withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(`${ssrInterpolate_1(toast.title)}`);
                          } else {
                            return [
                              vueExports.createTextVNode(vueExports.toDisplayString(toast.title), 1)
                            ];
                          }
                        }),
                        _: 2
                      }, _parent3, _scopeId2));
                    } else {
                      _push3(`<!---->`);
                    }
                    if (toast.description) {
                      _push3(ssrRenderComponent_1(vueExports.unref(ToastDescription_default), { class: "text-sm opacity-90" }, {
                        default: vueExports.withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(`${ssrInterpolate_1(toast.description)}`);
                          } else {
                            return [
                              vueExports.createTextVNode(vueExports.toDisplayString(toast.description), 1)
                            ];
                          }
                        }),
                        _: 2
                      }, _parent3, _scopeId2));
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`</div>`);
                    if (toast.action) {
                      _push3(ssrRenderComponent_1(vueExports.unref(ToastAction_default), {
                        "alt-text": toast.action.altText,
                        "as-child": ""
                      }, {
                        default: vueExports.withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(`<button class="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive"${_scopeId3}>${ssrInterpolate_1(toast.action.label)}</button>`);
                          } else {
                            return [
                              vueExports.createVNode("button", {
                                onClick: toast.action.onClick,
                                class: "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive"
                              }, vueExports.toDisplayString(toast.action.label), 9, ["onClick"])
                            ];
                          }
                        }),
                        _: 2
                      }, _parent3, _scopeId2));
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(ssrRenderComponent_1(vueExports.unref(ToastClose_default), { class: "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600" }, {
                      default: vueExports.withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent_1(_component_Icon, {
                            name: "lucide:x",
                            class: "h-4 w-4"
                          }, null, _parent4, _scopeId3));
                        } else {
                          return [
                            vueExports.createVNode(_component_Icon, {
                              name: "lucide:x",
                              class: "h-4 w-4"
                            })
                          ];
                        }
                      }),
                      _: 2
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      vueExports.createVNode("div", { class: "grid gap-1" }, [
                        toast.title ? (vueExports.openBlock(), vueExports.createBlock(vueExports.unref(ToastTitle_default), {
                          key: 0,
                          class: "text-sm font-semibold"
                        }, {
                          default: vueExports.withCtx(() => [
                            vueExports.createTextVNode(vueExports.toDisplayString(toast.title), 1)
                          ]),
                          _: 2
                        }, 1024)) : vueExports.createCommentVNode("", true),
                        toast.description ? (vueExports.openBlock(), vueExports.createBlock(vueExports.unref(ToastDescription_default), {
                          key: 1,
                          class: "text-sm opacity-90"
                        }, {
                          default: vueExports.withCtx(() => [
                            vueExports.createTextVNode(vueExports.toDisplayString(toast.description), 1)
                          ]),
                          _: 2
                        }, 1024)) : vueExports.createCommentVNode("", true)
                      ]),
                      toast.action ? (vueExports.openBlock(), vueExports.createBlock(vueExports.unref(ToastAction_default), {
                        key: 0,
                        "alt-text": toast.action.altText,
                        "as-child": ""
                      }, {
                        default: vueExports.withCtx(() => [
                          vueExports.createVNode("button", {
                            onClick: toast.action.onClick,
                            class: "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive"
                          }, vueExports.toDisplayString(toast.action.label), 9, ["onClick"])
                        ]),
                        _: 2
                      }, 1032, ["alt-text"])) : vueExports.createCommentVNode("", true),
                      vueExports.createVNode(vueExports.unref(ToastClose_default), { class: "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600" }, {
                        default: vueExports.withCtx(() => [
                          vueExports.createVNode(_component_Icon, {
                            name: "lucide:x",
                            class: "h-4 w-4"
                          })
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            });
            _push2(`<!--]-->`);
            _push2(ssrRenderComponent_1(vueExports.unref(ToastViewport_default), { class: "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" }, null, _parent2, _scopeId));
          } else {
            return [
              (vueExports.openBlock(true), vueExports.createBlock(vueExports.Fragment, null, vueExports.renderList(vueExports.unref(toasts), (toast) => {
                return vueExports.openBlock(), vueExports.createBlock(vueExports.unref(ToastRoot_default), {
                  key: toast.id,
                  open: toast.open,
                  "onUpdate:open": ($event) => toast.open = $event,
                  duration: toast.duration,
                  class: [
                    "pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--reka-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--reka-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
                    getVariantClasses(toast.variant)
                  ]
                }, {
                  default: vueExports.withCtx(() => [
                    vueExports.createVNode("div", { class: "grid gap-1" }, [
                      toast.title ? (vueExports.openBlock(), vueExports.createBlock(vueExports.unref(ToastTitle_default), {
                        key: 0,
                        class: "text-sm font-semibold"
                      }, {
                        default: vueExports.withCtx(() => [
                          vueExports.createTextVNode(vueExports.toDisplayString(toast.title), 1)
                        ]),
                        _: 2
                      }, 1024)) : vueExports.createCommentVNode("", true),
                      toast.description ? (vueExports.openBlock(), vueExports.createBlock(vueExports.unref(ToastDescription_default), {
                        key: 1,
                        class: "text-sm opacity-90"
                      }, {
                        default: vueExports.withCtx(() => [
                          vueExports.createTextVNode(vueExports.toDisplayString(toast.description), 1)
                        ]),
                        _: 2
                      }, 1024)) : vueExports.createCommentVNode("", true)
                    ]),
                    toast.action ? (vueExports.openBlock(), vueExports.createBlock(vueExports.unref(ToastAction_default), {
                      key: 0,
                      "alt-text": toast.action.altText,
                      "as-child": ""
                    }, {
                      default: vueExports.withCtx(() => [
                        vueExports.createVNode("button", {
                          onClick: toast.action.onClick,
                          class: "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive"
                        }, vueExports.toDisplayString(toast.action.label), 9, ["onClick"])
                      ]),
                      _: 2
                    }, 1032, ["alt-text"])) : vueExports.createCommentVNode("", true),
                    vueExports.createVNode(vueExports.unref(ToastClose_default), { class: "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600" }, {
                      default: vueExports.withCtx(() => [
                        vueExports.createVNode(_component_Icon, {
                          name: "lucide:x",
                          class: "h-4 w-4"
                        })
                      ]),
                      _: 1
                    })
                  ]),
                  _: 2
                }, 1032, ["open", "onUpdate:open", "duration", "class"]);
              }), 128)),
              vueExports.createVNode(vueExports.unref(ToastViewport_default), { class: "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" })
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/toast/Toaster.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ vueExports.defineComponent({
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const { isAdmin, logout } = useAuth();
    const handleLogout = async () => {
      try {
        await logout();
      } catch (err) {
        console.error("Logout failed:", err);
      }
    };
    const {
      accounts,
      isAddingAccount,
      fetchAccounts,
      getAuthUrl,
      addAccount
    } = useAccounts();
    const { fetchFiles } = useDropboxFiles();
    const combinedStorage = vueExports.ref(null);
    const isLoadingStorage = vueExports.ref(false);
    vueExports.ref(false);
    const fetchStorageInfo = async () => {
      isLoadingStorage.value = true;
      try {
        const response = await $fetch("/api/dropbox/storage-all");
        combinedStorage.value = response;
      } catch (err) {
        console.error("Error fetching storage:", err);
        combinedStorage.value = null;
      } finally {
        isLoadingStorage.value = false;
      }
    };
    vueExports.computed(() => {
      if (!combinedStorage.value || combinedStorage.value.totalAllocated === 0) return 0;
      return combinedStorage.value.totalUsed / combinedStorage.value.totalAllocated * 100;
    });
    vueExports.watch(accounts, () => {
      if (isAdmin.value) {
        fetchStorageInfo();
      }
    }, { deep: true });
    const runtimeConfig = useRuntimeConfig();
    vueExports.computed(() => !!runtimeConfig.public.dropboxAppKey);
    const showAddAccountModal = vueExports.ref(false);
    const addAccountStep = vueExports.ref("credentials");
    const addAccountError = vueExports.ref("");
    const appKey = vueExports.ref("");
    const appSecret = vueExports.ref("");
    const authCode = vueExports.ref("");
    const accountName = vueExports.ref("");
    const openAuthUrl = () => {
      const keyToUse = appKey.value || runtimeConfig.public.dropboxAppKey;
      (void 0).open(getAuthUrl(keyToUse), "_blank", "width=600,height=800");
    };
    const handleAddAccount = async () => {
      const result = await addAccount(authCode.value, appKey.value, appSecret.value, accountName.value || void 0);
      if (result.success) {
        addAccountStep.value = "success";
        await fetchAccounts();
        await fetchStorageInfo();
        await fetchFiles("");
      } else {
        addAccountError.value = result.error || "Failed to add account";
        addAccountStep.value = "error";
      }
    };
    const closeAddAccountModal = () => {
      showAddAccountModal.value = false;
      addAccountStep.value = "credentials";
      appKey.value = "";
      appSecret.value = "";
      authCode.value = "";
      accountName.value = "";
    };
    vueExports.ref(false);
    const isMobileMenuOpen = vueExports.ref(false);
    vueExports.watch(() => route.path, () => {
      isMobileMenuOpen.value = false;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0;
      const _component_ClientOnly = __nuxt_component_1;
      const _component_UiButton = _sfc_main$2;
      const _component_UiInput = _sfc_main$3;
      _push(`<div${ssrRenderAttrs_1(vueExports.mergeProps({ class: "min-h-screen bg-background font-sans antialiased text-foreground flex" }, _attrs))}>`);
      if (vueExports.unref(isMobileMenuOpen)) {
        _push(`<div class="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<aside class="${ssrRenderClass_1([vueExports.unref(isMobileMenuOpen) ? "translate-x-0" : "-translate-x-full", "fixed inset-y-0 left-0 z-50 w-64 border-r bg-card flex flex-col h-screen transition-transform duration-300 md:translate-x-0 md:sticky md:top-0 overflow-hidden shadow-xl md:shadow-none"])}"><div class="h-14 flex items-center px-6 border-b"><a class="flex items-center gap-2 font-semibold text-lg" href="/"><div class="bg-blue-600 text-white p-1.5 rounded">`);
      _push(ssrRenderComponent_1(_component_Icon, {
        name: "lucide:hard-drive",
        class: "h-4 w-4"
      }, null, _parent));
      _push(`</div><span>MultiBox</span></a></div><div class="flex-1 py-4 px-3 space-y-1 overflow-auto min-h-0"><div class="px-2 mb-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">Menu</div>`);
      _push(ssrRenderComponent_1(_component_ClientOnly, null, {
        fallback: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<nav class="space-y-1"${_scopeId}><div class="flex items-center gap-3 px-3 py-2 rounded-md"${_scopeId}><div class="h-4 w-4 bg-muted rounded animate-pulse"${_scopeId}></div><div class="h-4 w-20 bg-muted rounded animate-pulse"${_scopeId}></div></div><div class="flex items-center gap-3 px-3 py-2 rounded-md"${_scopeId}><div class="h-4 w-4 bg-muted rounded animate-pulse"${_scopeId}></div><div class="h-4 w-24 bg-muted rounded animate-pulse"${_scopeId}></div></div></nav>`);
          } else {
            return [
              vueExports.createVNode("nav", { class: "space-y-1" }, [
                vueExports.createVNode("div", { class: "flex items-center gap-3 px-3 py-2 rounded-md" }, [
                  vueExports.createVNode("div", { class: "h-4 w-4 bg-muted rounded animate-pulse" }),
                  vueExports.createVNode("div", { class: "h-4 w-20 bg-muted rounded animate-pulse" })
                ]),
                vueExports.createVNode("div", { class: "flex items-center gap-3 px-3 py-2 rounded-md" }, [
                  vueExports.createVNode("div", { class: "h-4 w-4 bg-muted rounded animate-pulse" }),
                  vueExports.createVNode("div", { class: "h-4 w-24 bg-muted rounded animate-pulse" })
                ])
              ])
            ];
          }
        })
      }, _parent));
      _push(ssrRenderComponent_1(_component_ClientOnly, null, {}, _parent));
      _push(`</div><div class="p-3 border-t">`);
      _push(ssrRenderComponent_1(_component_ClientOnly, null, {
        fallback: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex items-center gap-3 mb-3"${_scopeId}><div class="h-8 w-8 rounded-full bg-muted animate-pulse"${_scopeId}></div><div class="flex-1 min-w-0"${_scopeId}><div class="h-4 w-24 bg-muted rounded animate-pulse mb-1"${_scopeId}></div><div class="h-3 w-16 bg-muted rounded animate-pulse"${_scopeId}></div></div></div>`);
          } else {
            return [
              vueExports.createVNode("div", { class: "flex items-center gap-3 mb-3" }, [
                vueExports.createVNode("div", { class: "h-8 w-8 rounded-full bg-muted animate-pulse" }),
                vueExports.createVNode("div", { class: "flex-1 min-w-0" }, [
                  vueExports.createVNode("div", { class: "h-4 w-24 bg-muted rounded animate-pulse mb-1" }),
                  vueExports.createVNode("div", { class: "h-3 w-16 bg-muted rounded animate-pulse" })
                ])
              ])
            ];
          }
        })
      }, _parent));
      _push(ssrRenderComponent_1(_component_UiButton, {
        variant: "outline",
        size: "sm",
        class: "w-full text-xs h-8",
        onClick: handleLogout
      }, {
        default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:log-out",
              class: "h-3.5 w-3.5 mr-2"
            }, null, _parent2, _scopeId));
            _push2(` Logout `);
          } else {
            return [
              vueExports.createVNode(_component_Icon, {
                name: "lucide:log-out",
                class: "h-3.5 w-3.5 mr-2"
              }),
              vueExports.createTextVNode(" Logout ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent_1(_component_ClientOnly, null, {}, _parent));
      _push(`</aside><div class="flex-1 flex flex-col min-w-0"><header class="h-14 border-b bg-background/95 backdrop-blur flex items-center justify-between px-4 md:px-6 sticky top-0 z-10"><div class="flex items-center gap-4">`);
      _push(ssrRenderComponent_1(_component_UiButton, {
        variant: "ghost",
        size: "icon",
        class: "md:hidden -ml-2",
        onClick: ($event) => isMobileMenuOpen.value = true
      }, {
        default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:menu",
              class: "h-5 w-5"
            }, null, _parent2, _scopeId));
          } else {
            return [
              vueExports.createVNode(_component_Icon, {
                name: "lucide:menu",
                class: "h-5 w-5"
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<h1 class="font-semibold text-xl tracking-tight text-foreground">`);
      _push(ssrRenderComponent_1(_component_ClientOnly, null, {
        fallback: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Files`);
          } else {
            return [
              vueExports.createTextVNode("Files")
            ];
          }
        })
      }, _parent));
      _push(`</h1>`);
      _push(ssrRenderComponent_1(_component_ClientOnly, null, {}, _parent));
      _push(`</div><div class="flex items-center gap-2"><div class="relative hidden sm:block">`);
      _push(ssrRenderComponent_1(_component_Icon, {
        name: "lucide:search",
        class: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
      }, null, _parent));
      _push(ssrRenderComponent_1(_component_UiInput, {
        placeholder: "Search files...",
        class: "w-64 pl-9 h-9 bg-muted/30 border-none focus-visible:bg-background focus-visible:ring-1"
      }, null, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent_1(_component_UiButton, {
        variant: "ghost",
        size: "icon",
        class: "rounded-full"
      }, {
        default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:bell",
              class: "h-5 w-5"
            }, null, _parent2, _scopeId));
          } else {
            return [
              vueExports.createVNode(_component_Icon, {
                name: "lucide:bell",
                class: "h-5 w-5"
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></header><main class="flex-1 overflow-auto bg-muted/10 p-4 md:p-6">`);
      ssrRenderSlot_1(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main></div>`);
      ssrRenderTeleport_1(_push, (_push2) => {
        if (vueExports.unref(showAddAccountModal)) {
          _push2(`<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div class="bg-card rounded-lg shadow-lg w-full max-w-md p-6 m-4"><h2 class="text-lg font-semibold mb-4">Add Dropbox Account</h2>`);
          if (vueExports.unref(addAccountStep) === "credentials") {
            _push2(`<div class="space-y-4"><p class="text-sm text-muted-foreground"> Enter your Dropbox App credentials. Get them from <a href="https://www.dropbox.com/developers/apps" target="_blank" class="text-primary underline">Dropbox App Console</a>. </p><div class="space-y-2"><label class="text-sm font-medium">App Key</label>`);
            _push2(ssrRenderComponent_1(_component_UiInput, {
              modelValue: vueExports.unref(appKey),
              "onUpdate:modelValue": ($event) => vueExports.isRef(appKey) ? appKey.value = $event : null,
              placeholder: "e.g. szgdfklmefwr8nr",
              class: "font-mono text-sm"
            }, null, _parent));
            _push2(`</div><div class="space-y-2"><label class="text-sm font-medium">App Secret</label>`);
            _push2(ssrRenderComponent_1(_component_UiInput, {
              modelValue: vueExports.unref(appSecret),
              "onUpdate:modelValue": ($event) => vueExports.isRef(appSecret) ? appSecret.value = $event : null,
              placeholder: "e.g. fjcbzjokakc65qs",
              type: "password",
              class: "font-mono text-sm"
            }, null, _parent));
            _push2(`</div><div class="flex gap-2">`);
            _push2(ssrRenderComponent_1(_component_UiButton, {
              variant: "outline",
              class: "flex-1",
              onClick: closeAddAccountModal
            }, {
              default: vueExports.withCtx((_, _push3, _parent2, _scopeId) => {
                if (_push3) {
                  _push3(` Cancel `);
                } else {
                  return [
                    vueExports.createTextVNode(" Cancel ")
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push2(ssrRenderComponent_1(_component_UiButton, {
              class: "flex-1",
              disabled: !vueExports.unref(appKey) || !vueExports.unref(appSecret),
              onClick: ($event) => addAccountStep.value = "auth"
            }, {
              default: vueExports.withCtx((_, _push3, _parent2, _scopeId) => {
                if (_push3) {
                  _push3(` Next `);
                  _push3(ssrRenderComponent_1(_component_Icon, {
                    name: "lucide:arrow-right",
                    class: "ml-2 h-4 w-4"
                  }, null, _parent2, _scopeId));
                } else {
                  return [
                    vueExports.createTextVNode(" Next "),
                    vueExports.createVNode(_component_Icon, {
                      name: "lucide:arrow-right",
                      class: "ml-2 h-4 w-4"
                    })
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push2(`</div></div>`);
          } else if (vueExports.unref(addAccountStep) === "auth") {
            _push2(`<div class="space-y-4"><p class="text-sm text-muted-foreground"> Click the button below to authorize. After authorizing, copy the code and paste it here. </p>`);
            _push2(ssrRenderComponent_1(_component_UiButton, {
              class: "w-full",
              onClick: openAuthUrl
            }, {
              default: vueExports.withCtx((_, _push3, _parent2, _scopeId) => {
                if (_push3) {
                  _push3(ssrRenderComponent_1(_component_Icon, {
                    name: "logos:dropbox",
                    class: "mr-2 h-4 w-4"
                  }, null, _parent2, _scopeId));
                  _push3(` Authorize with Dropbox `);
                } else {
                  return [
                    vueExports.createVNode(_component_Icon, {
                      name: "logos:dropbox",
                      class: "mr-2 h-4 w-4"
                    }),
                    vueExports.createTextVNode(" Authorize with Dropbox ")
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push2(`<div class="relative"><div class="absolute inset-0 flex items-center"><span class="w-full border-t"></span></div><div class="relative flex justify-center text-xs uppercase"><span class="bg-card px-2 text-muted-foreground">Then paste code below</span></div></div>`);
            _push2(ssrRenderComponent_1(_component_UiInput, {
              modelValue: vueExports.unref(authCode),
              "onUpdate:modelValue": ($event) => vueExports.isRef(authCode) ? authCode.value = $event : null,
              placeholder: "Paste authorization code here...",
              class: "font-mono text-sm"
            }, null, _parent));
            _push2(ssrRenderComponent_1(_component_UiInput, {
              modelValue: vueExports.unref(accountName),
              "onUpdate:modelValue": ($event) => vueExports.isRef(accountName) ? accountName.value = $event : null,
              placeholder: "Account name (optional)"
            }, null, _parent));
            _push2(`<div class="flex gap-2">`);
            _push2(ssrRenderComponent_1(_component_UiButton, {
              variant: "outline",
              class: "flex-1",
              onClick: ($event) => addAccountStep.value = "credentials"
            }, {
              default: vueExports.withCtx((_, _push3, _parent2, _scopeId) => {
                if (_push3) {
                  _push3(ssrRenderComponent_1(_component_Icon, {
                    name: "lucide:arrow-left",
                    class: "mr-2 h-4 w-4"
                  }, null, _parent2, _scopeId));
                  _push3(` Back `);
                } else {
                  return [
                    vueExports.createVNode(_component_Icon, {
                      name: "lucide:arrow-left",
                      class: "mr-2 h-4 w-4"
                    }),
                    vueExports.createTextVNode(" Back ")
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push2(ssrRenderComponent_1(_component_UiButton, {
              class: "flex-1",
              disabled: !vueExports.unref(authCode) || vueExports.unref(isAddingAccount),
              onClick: handleAddAccount
            }, {
              default: vueExports.withCtx((_, _push3, _parent2, _scopeId) => {
                if (_push3) {
                  if (vueExports.unref(isAddingAccount)) {
                    _push3(ssrRenderComponent_1(_component_Icon, {
                      name: "lucide:loader-2",
                      class: "mr-2 h-4 w-4 animate-spin"
                    }, null, _parent2, _scopeId));
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(` Add Account `);
                } else {
                  return [
                    vueExports.unref(isAddingAccount) ? (vueExports.openBlock(), vueExports.createBlock(_component_Icon, {
                      key: 0,
                      name: "lucide:loader-2",
                      class: "mr-2 h-4 w-4 animate-spin"
                    })) : vueExports.createCommentVNode("", true),
                    vueExports.createTextVNode(" Add Account ")
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push2(`</div></div>`);
          } else if (vueExports.unref(addAccountStep) === "success") {
            _push2(`<div class="text-center space-y-4"><div class="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">`);
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:check",
              class: "h-6 w-6 text-green-600"
            }, null, _parent));
            _push2(`</div><p class="font-medium">Account added successfully!</p>`);
            _push2(ssrRenderComponent_1(_component_UiButton, {
              class: "w-full",
              onClick: closeAddAccountModal
            }, {
              default: vueExports.withCtx((_, _push3, _parent2, _scopeId) => {
                if (_push3) {
                  _push3(` Done `);
                } else {
                  return [
                    vueExports.createTextVNode(" Done ")
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push2(`</div>`);
          } else if (vueExports.unref(addAccountStep) === "error") {
            _push2(`<div class="text-center space-y-4"><div class="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">`);
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:x",
              class: "h-6 w-6 text-red-600"
            }, null, _parent));
            _push2(`</div><p class="font-medium text-destructive">${ssrInterpolate_1(vueExports.unref(addAccountError))}</p>`);
            _push2(ssrRenderComponent_1(_component_UiButton, {
              class: "w-full",
              onClick: ($event) => addAccountStep.value = "auth"
            }, {
              default: vueExports.withCtx((_, _push3, _parent2, _scopeId) => {
                if (_push3) {
                  _push3(` Try Again `);
                } else {
                  return [
                    vueExports.createTextVNode(" Try Again ")
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push2(`</div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(ssrRenderComponent_1(vueExports.unref(_sfc_main$1), null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=default-Q30fo0nM.mjs.map
