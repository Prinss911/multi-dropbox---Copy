import { u as useForwardExpose, a as useCollection, c as createContext, b as usePrimitiveElement, V as VisuallyHidden_default } from './VisuallyHidden-6QTMh8_p.mjs';
import { u as useVModel, a as unrefElement, b as useMounted } from '../_/index.mjs';
import { P as Primitive } from './Primitive-D3IcFg81.mjs';
import { r as require$$0, v as vueExports, s as ssrRenderAttrs_1, j as ssrRenderStyle_1, a as ssrRenderComponent_1, b as ssrInterpolate_1, h as ssrRenderClass_1, f as ssrRenderList_1, d as ssrRenderVNode } from '../routes/renderer.mjs';
import { a as _export_sfc } from './server.mjs';

/**
 * @license lucide-vue-next v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */

var vue = require$$0;

const toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 2,
  "stroke-linecap": "round",
  "stroke-linejoin": "round"
};

const Icon = ({ size, strokeWidth = 2, absoluteStrokeWidth, color, iconNode, name, class: classes, ...props }, { slots }) => {
  return vue.h(
    "svg",
    {
      ...defaultAttributes,
      width: size || defaultAttributes.width,
      height: size || defaultAttributes.height,
      stroke: color || defaultAttributes.stroke,
      "stroke-width": absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
      class: ["lucide", `lucide-${toKebabCase(name ?? "icon")}`],
      ...props
    },
    [...iconNode.map((child) => vue.h(...child)), ...slots.default ? [slots.default()] : []]
  );
};

const createLucideIcon = (iconName, iconNode) => (props, { slots }) => vue.h(
  Icon,
  {
    ...props,
    iconNode,
    name: iconName
  },
  slots
);

const Activity = createLucideIcon("ActivityIcon", [
  [
    "path",
    {
      d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",
      key: "169zse"
    }
  ]
]);

const ChartColumn = createLucideIcon("ChartColumnIcon", [
  ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }],
  ["path", { d: "M18 17V9", key: "2bz60n" }],
  ["path", { d: "M13 17V5", key: "1frdt8" }],
  ["path", { d: "M8 17v-3", key: "17ska0" }]
]);

const Check = createLucideIcon("CheckIcon", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]);

const ChevronRight = createLucideIcon("ChevronRightIcon", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]
]);

const LoaderCircle = createLucideIcon("LoaderCircleIcon", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]
]);

const Maximize = createLucideIcon("MaximizeIcon", [
  ["path", { d: "M8 3H5a2 2 0 0 0-2 2v3", key: "1dcmit" }],
  ["path", { d: "M21 8V5a2 2 0 0 0-2-2h-3", key: "1e4gt3" }],
  ["path", { d: "M3 16v3a2 2 0 0 0 2 2h3", key: "wsl5sc" }],
  ["path", { d: "M16 21h3a2 2 0 0 0 2-2v-3", key: "18trek" }]
]);

const Minimize = createLucideIcon("MinimizeIcon", [
  ["path", { d: "M8 3v3a2 2 0 0 1-2 2H3", key: "hohbtr" }],
  ["path", { d: "M21 8h-3a2 2 0 0 1-2-2V3", key: "5jw1f3" }],
  ["path", { d: "M3 16h3a2 2 0 0 1 2 2v3", key: "198tvr" }],
  ["path", { d: "M16 21v-3a2 2 0 0 1 2-2h3", key: "ph8mxp" }]
]);

const Pause = createLucideIcon("PauseIcon", [
  ["rect", { x: "14", y: "4", width: "4", height: "16", rx: "1", key: "zuxfzm" }],
  ["rect", { x: "6", y: "4", width: "4", height: "16", rx: "1", key: "1okwgv" }]
]);

const Play = createLucideIcon("PlayIcon", [
  ["polygon", { points: "6 3 20 12 6 21 6 3", key: "1oa8hb" }]
]);

const RotateCcw = createLucideIcon("RotateCcwIcon", [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
]);

const RotateCw = createLucideIcon("RotateCwIcon", [
  ["path", { d: "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8", key: "1p45f6" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }]
]);

const Settings = createLucideIcon("SettingsIcon", [
  [
    "path",
    {
      d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
      key: "1qme2f"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
]);

const Volume2 = createLucideIcon("Volume2Icon", [
  [
    "path",
    {
      d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
      key: "uqj9uw"
    }
  ],
  ["path", { d: "M16 9a5 5 0 0 1 0 6", key: "1q6k2b" }],
  ["path", { d: "M19.364 18.364a9 9 0 0 0 0-12.728", key: "ijwkga" }]
]);

const VolumeX = createLucideIcon("VolumeXIcon", [
  [
    "path",
    {
      d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
      key: "uqj9uw"
    }
  ],
  ["line", { x1: "22", x2: "16", y1: "9", y2: "15", key: "1ewh16" }],
  ["line", { x1: "16", x2: "22", y1: "9", y2: "15", key: "5ykzw1" }]
]);

const X = createLucideIcon("XIcon", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);
var Activity_1 = Activity;
var BarChart3 = ChartColumn;
var Check_1 = Check;
var ChevronRight_1 = ChevronRight;
var Loader2 = LoaderCircle;
var Maximize_1 = Maximize;
var Minimize_1 = Minimize;
var Pause_1 = Pause;
var Play_1 = Play;
var RotateCcw_1 = RotateCcw;
var RotateCw_1 = RotateCw;
var Settings_1 = Settings;
var Volume2_1 = Volume2;
var VolumeX_1 = VolumeX;
var X_1 = X;

function clamp(value, min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY) {
  return Math.min(max, Math.max(min, value));
}
const [injectConfigProviderContext] = createContext("ConfigProvider");
function useDirection(dir) {
  const context = injectConfigProviderContext({ dir: vueExports.ref("ltr") });
  return vueExports.computed(() => {
    var _a;
    return (dir == null ? void 0 : dir.value) || ((_a = context.dir) == null ? void 0 : _a.value) || "ltr";
  });
}
function useFormControl(el) {
  return vueExports.computed(() => {
    var _a;
    return vueExports.toValue(el) ? Boolean((_a = unrefElement(el)) == null ? void 0 : _a.closest("form")) : true;
  });
}
function useSize(element) {
  const size = vueExports.ref();
  const width = vueExports.computed(() => {
    var _a2;
    var _a;
    return (_a2 = (_a = size.value) == null ? void 0 : _a.width) != null ? _a2 : 0;
  });
  const height = vueExports.computed(() => {
    var _a2;
    var _a;
    return (_a2 = (_a = size.value) == null ? void 0 : _a.height) != null ? _a2 : 0;
  });
  return {
    width,
    height
  };
}
var VisuallyHiddenInputBubble_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ vueExports.defineComponent({
  inheritAttrs: false,
  __name: "VisuallyHiddenInputBubble",
  props: {
    name: {
      type: String,
      required: true
    },
    value: {
      type: null,
      required: true
    },
    checked: {
      type: Boolean,
      required: false,
      default: void 0
    },
    required: {
      type: Boolean,
      required: false
    },
    disabled: {
      type: Boolean,
      required: false
    },
    feature: {
      type: String,
      required: false,
      default: "fully-hidden"
    }
  },
  setup(__props) {
    const props = __props;
    const { primitiveElement, currentElement } = usePrimitiveElement();
    const valueState = vueExports.computed(() => {
      var _a;
      return (_a = props.checked) != null ? _a : props.value;
    });
    vueExports.watch(valueState, (cur, prev) => {
      if (!currentElement.value) return;
      const input = currentElement.value;
      const inputProto = (void 0).HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(inputProto, "value");
      const setValue = descriptor.set;
      if (setValue && cur !== prev) {
        const inputEvent = new Event("input", { bubbles: true });
        const changeEvent = new Event("change", { bubbles: true });
        setValue.call(input, cur);
        input.dispatchEvent(inputEvent);
        input.dispatchEvent(changeEvent);
      }
    });
    return (_ctx, _cache) => {
      return vueExports.openBlock(), vueExports.createBlock(VisuallyHidden_default, vueExports.mergeProps({
        ref_key: "primitiveElement",
        ref: primitiveElement
      }, {
        ...props,
        ..._ctx.$attrs
      }, { as: "input" }), null, 16);
    };
  }
});
var VisuallyHiddenInputBubble_default = VisuallyHiddenInputBubble_vue_vue_type_script_setup_true_lang_default;
var VisuallyHiddenInput_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ vueExports.defineComponent({
  inheritAttrs: false,
  __name: "VisuallyHiddenInput",
  props: {
    name: {
      type: String,
      required: true
    },
    value: {
      type: null,
      required: true
    },
    checked: {
      type: Boolean,
      required: false,
      default: void 0
    },
    required: {
      type: Boolean,
      required: false
    },
    disabled: {
      type: Boolean,
      required: false
    },
    feature: {
      type: String,
      required: false,
      default: "fully-hidden"
    }
  },
  setup(__props) {
    const props = __props;
    const isFormArrayEmptyAndRequired = vueExports.computed(() => typeof props.value === "object" && Array.isArray(props.value) && props.value.length === 0 && props.required);
    const parsedValue = vueExports.computed(() => {
      if (typeof props.value === "string" || typeof props.value === "number" || typeof props.value === "boolean" || props.value === null || props.value === void 0) return [{
        name: props.name,
        value: props.value
      }];
      else if (typeof props.value === "object" && Array.isArray(props.value)) return props.value.flatMap((obj, index) => {
        if (typeof obj === "object") return Object.entries(obj).map(([key, value]) => ({
          name: `${props.name}[${index}][${key}]`,
          value
        }));
        else return {
          name: `${props.name}[${index}]`,
          value: obj
        };
      });
      else if (props.value !== null && typeof props.value === "object" && !Array.isArray(props.value)) return Object.entries(props.value).map(([key, value]) => ({
        name: `${props.name}[${key}]`,
        value
      }));
      return [];
    });
    return (_ctx, _cache) => {
      return vueExports.openBlock(), vueExports.createElementBlock(vueExports.Fragment, null, [vueExports.createCommentVNode(" We render single input if it's required "), isFormArrayEmptyAndRequired.value ? (vueExports.openBlock(), vueExports.createBlock(VisuallyHiddenInputBubble_default, vueExports.mergeProps({ key: _ctx.name }, {
        ...props,
        ..._ctx.$attrs
      }, {
        name: _ctx.name,
        value: _ctx.value
      }), null, 16, ["name", "value"])) : (vueExports.openBlock(true), vueExports.createElementBlock(vueExports.Fragment, { key: 1 }, vueExports.renderList(parsedValue.value, (parsed) => {
        return vueExports.openBlock(), vueExports.createBlock(VisuallyHiddenInputBubble_default, vueExports.mergeProps({ key: parsed.name }, { ref_for: true }, {
          ...props,
          ..._ctx.$attrs
        }, {
          name: parsed.name,
          value: parsed.value
        }), null, 16, ["name", "value"]);
      }), 128))], 2112);
    };
  }
});
var VisuallyHiddenInput_default = VisuallyHiddenInput_vue_vue_type_script_setup_true_lang_default;
function getNextSortedValues(prevValues = [], nextValue, atIndex) {
  const nextValues = [...prevValues];
  nextValues[atIndex] = nextValue;
  return nextValues.sort((a, b) => a - b);
}
function convertValueToPercentage(value, min, max) {
  const maxSteps = max - min;
  const percentPerStep = 100 / maxSteps;
  const percentage = percentPerStep * (value - min);
  return clamp(percentage, 0, 100);
}
function getLabel(index, totalValues) {
  if (totalValues > 2) return `Value ${index + 1} of ${totalValues}`;
  else if (totalValues === 2) return ["Minimum", "Maximum"][index];
  else return void 0;
}
function getClosestValueIndex(values, nextValue) {
  if (values.length === 1) return 0;
  const distances = values.map((value) => Math.abs(value - nextValue));
  const closestDistance = Math.min(...distances);
  return distances.indexOf(closestDistance);
}
function getThumbInBoundsOffset(width, left, direction) {
  const halfWidth = width / 2;
  const halfPercent = 50;
  const offset = linearScale([0, halfPercent], [0, halfWidth]);
  return (halfWidth - offset(left) * direction) * direction;
}
function getStepsBetweenValues(values) {
  return values.slice(0, -1).map((value, index) => values[index + 1] - value);
}
function hasMinStepsBetweenValues(values, minStepsBetweenValues) {
  if (minStepsBetweenValues > 0) {
    const stepsBetweenValues = getStepsBetweenValues(values);
    const actualMinStepsBetweenValues = Math.min(...stepsBetweenValues);
    return actualMinStepsBetweenValues >= minStepsBetweenValues;
  }
  return true;
}
function linearScale(input, output) {
  return (value) => {
    if (input[0] === input[1] || output[0] === output[1]) return output[0];
    const ratio = (output[1] - output[0]) / (input[1] - input[0]);
    return output[0] + ratio * (value - input[0]);
  };
}
function getDecimalCount(value) {
  return (String(value).split(".")[1] || "").length;
}
function roundValue(value, decimalCount) {
  const rounder = 10 ** decimalCount;
  return Math.round(value * rounder) / rounder;
}
const PAGE_KEYS = ["PageUp", "PageDown"];
const ARROW_KEYS = [
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight"
];
const BACK_KEYS = {
  "from-left": [
    "Home",
    "PageDown",
    "ArrowDown",
    "ArrowLeft"
  ],
  "from-right": [
    "Home",
    "PageDown",
    "ArrowDown",
    "ArrowRight"
  ],
  "from-bottom": [
    "Home",
    "PageDown",
    "ArrowDown",
    "ArrowLeft"
  ],
  "from-top": [
    "Home",
    "PageUp",
    "ArrowUp",
    "ArrowLeft"
  ]
};
const [injectSliderOrientationContext, provideSliderOrientationContext] = createContext(["SliderVertical", "SliderHorizontal"]);
var SliderHorizontal_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ vueExports.defineComponent({
  __name: "SliderHorizontal",
  props: {
    dir: {
      type: String,
      required: false
    },
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    },
    inverted: {
      type: Boolean,
      required: true
    }
  },
  emits: [
    "slideEnd",
    "slideStart",
    "slideMove",
    "homeKeyDown",
    "endKeyDown",
    "stepKeyDown"
  ],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const { max, min, dir, inverted } = vueExports.toRefs(props);
    const { forwardRef, currentElement: sliderElement } = useForwardExpose();
    const rootContext = injectSliderRootContext();
    const offsetPosition = vueExports.ref();
    const rectRef = vueExports.ref();
    const isSlidingFromLeft = vueExports.computed(() => (dir == null ? void 0 : dir.value) !== "rtl" && !inverted.value || (dir == null ? void 0 : dir.value) !== "ltr" && inverted.value);
    function getValueFromPointerEvent(event, slideStart) {
      var _a;
      const rect = rectRef.value || sliderElement.value.getBoundingClientRect();
      const thumb = [...rootContext.thumbElements.value][rootContext.valueIndexToChangeRef.value];
      const thumbWidth = rootContext.thumbAlignment.value === "contain" ? thumb.clientWidth : 0;
      if (!offsetPosition.value && !slideStart && rootContext.thumbAlignment.value === "contain") offsetPosition.value = event.clientX - thumb.getBoundingClientRect().left;
      const input = [0, rect.width - thumbWidth];
      const output = isSlidingFromLeft.value ? [min.value, max.value] : [max.value, min.value];
      const value = linearScale(input, output);
      rectRef.value = rect;
      const position = slideStart ? event.clientX - rect.left - thumbWidth / 2 : event.clientX - rect.left - ((_a = offsetPosition.value) != null ? _a : 0);
      return value(position);
    }
    const startEdge = vueExports.computed(() => isSlidingFromLeft.value ? "left" : "right");
    const endEdge = vueExports.computed(() => isSlidingFromLeft.value ? "right" : "left");
    const direction = vueExports.computed(() => isSlidingFromLeft.value ? 1 : -1);
    provideSliderOrientationContext({
      startEdge,
      endEdge,
      direction,
      size: "width"
    });
    return (_ctx, _cache) => {
      return vueExports.openBlock(), vueExports.createBlock(SliderImpl_default, {
        ref: vueExports.unref(forwardRef),
        dir: vueExports.unref(dir),
        "data-orientation": "horizontal",
        style: vueExports.normalizeStyle({ ["--reka-slider-thumb-transform"]: !isSlidingFromLeft.value && vueExports.unref(rootContext).thumbAlignment.value === "overflow" ? "translateX(50%)" : "translateX(-50%)" }),
        onSlideStart: _cache[0] || (_cache[0] = (event) => {
          const value = getValueFromPointerEvent(event, true);
          emits("slideStart", value);
        }),
        onSlideMove: _cache[1] || (_cache[1] = (event) => {
          const value = getValueFromPointerEvent(event);
          emits("slideMove", value);
        }),
        onSlideEnd: _cache[2] || (_cache[2] = () => {
          rectRef.value = void 0;
          offsetPosition.value = void 0;
          emits("slideEnd");
        }),
        onStepKeyDown: _cache[3] || (_cache[3] = (event) => {
          const slideDirection = isSlidingFromLeft.value ? "from-left" : "from-right";
          const isBackKey = vueExports.unref(BACK_KEYS)[slideDirection].includes(event.key);
          emits("stepKeyDown", event, isBackKey ? -1 : 1);
        }),
        onEndKeyDown: _cache[4] || (_cache[4] = ($event) => emits("endKeyDown", $event)),
        onHomeKeyDown: _cache[5] || (_cache[5] = ($event) => emits("homeKeyDown", $event))
      }, {
        default: vueExports.withCtx(() => [vueExports.renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 8, ["dir", "style"]);
    };
  }
});
var SliderHorizontal_default = SliderHorizontal_vue_vue_type_script_setup_true_lang_default;
var SliderVertical_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ vueExports.defineComponent({
  __name: "SliderVertical",
  props: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    },
    inverted: {
      type: Boolean,
      required: true
    }
  },
  emits: [
    "slideEnd",
    "slideStart",
    "slideMove",
    "homeKeyDown",
    "endKeyDown",
    "stepKeyDown"
  ],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const { max, min, inverted } = vueExports.toRefs(props);
    const rootContext = injectSliderRootContext();
    const { forwardRef, currentElement: sliderElement } = useForwardExpose();
    const offsetPosition = vueExports.ref();
    const rectRef = vueExports.ref();
    const isSlidingFromBottom = vueExports.computed(() => !inverted.value);
    function getValueFromPointerEvent(event, slideStart) {
      var _a;
      const rect = rectRef.value || sliderElement.value.getBoundingClientRect();
      const thumb = [...rootContext.thumbElements.value][rootContext.valueIndexToChangeRef.value];
      const thumbHeight = rootContext.thumbAlignment.value === "contain" ? thumb.clientHeight : 0;
      if (!offsetPosition.value && !slideStart && rootContext.thumbAlignment.value === "contain") offsetPosition.value = event.clientY - thumb.getBoundingClientRect().top;
      const input = [0, rect.height - thumbHeight];
      const output = isSlidingFromBottom.value ? [max.value, min.value] : [min.value, max.value];
      const value = linearScale(input, output);
      const position = slideStart ? event.clientY - rect.top - thumbHeight / 2 : event.clientY - rect.top - ((_a = offsetPosition.value) != null ? _a : 0);
      rectRef.value = rect;
      return value(position);
    }
    const startEdge = vueExports.computed(() => isSlidingFromBottom.value ? "bottom" : "top");
    const endEdge = vueExports.computed(() => isSlidingFromBottom.value ? "top" : "bottom");
    const direction = vueExports.computed(() => isSlidingFromBottom.value ? 1 : -1);
    provideSliderOrientationContext({
      startEdge,
      endEdge,
      direction,
      size: "height"
    });
    return (_ctx, _cache) => {
      return vueExports.openBlock(), vueExports.createBlock(SliderImpl_default, {
        ref: vueExports.unref(forwardRef),
        "data-orientation": "vertical",
        style: vueExports.normalizeStyle({ ["--reka-slider-thumb-transform"]: !isSlidingFromBottom.value && vueExports.unref(rootContext).thumbAlignment.value === "overflow" ? "translateY(-50%)" : "translateY(50%)" }),
        onSlideStart: _cache[0] || (_cache[0] = (event) => {
          const value = getValueFromPointerEvent(event, true);
          emits("slideStart", value);
        }),
        onSlideMove: _cache[1] || (_cache[1] = (event) => {
          const value = getValueFromPointerEvent(event);
          emits("slideMove", value);
        }),
        onSlideEnd: _cache[2] || (_cache[2] = () => {
          rectRef.value = void 0;
          offsetPosition.value = void 0;
          emits("slideEnd");
        }),
        onStepKeyDown: _cache[3] || (_cache[3] = (event) => {
          const slideDirection = isSlidingFromBottom.value ? "from-bottom" : "from-top";
          const isBackKey = vueExports.unref(BACK_KEYS)[slideDirection].includes(event.key);
          emits("stepKeyDown", event, isBackKey ? -1 : 1);
        }),
        onEndKeyDown: _cache[4] || (_cache[4] = ($event) => emits("endKeyDown", $event)),
        onHomeKeyDown: _cache[5] || (_cache[5] = ($event) => emits("homeKeyDown", $event))
      }, {
        default: vueExports.withCtx(() => [vueExports.renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 8, ["style"]);
    };
  }
});
var SliderVertical_default = SliderVertical_vue_vue_type_script_setup_true_lang_default;
const [injectSliderRootContext, provideSliderRootContext] = createContext("SliderRoot");
var SliderRoot_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ vueExports.defineComponent({
  inheritAttrs: false,
  __name: "SliderRoot",
  props: {
    defaultValue: {
      type: Array,
      required: false,
      default: () => [0]
    },
    modelValue: {
      type: [Array, null],
      required: false
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    orientation: {
      type: String,
      required: false,
      default: "horizontal"
    },
    dir: {
      type: String,
      required: false
    },
    inverted: {
      type: Boolean,
      required: false,
      default: false
    },
    min: {
      type: Number,
      required: false,
      default: 0
    },
    max: {
      type: Number,
      required: false,
      default: 100
    },
    step: {
      type: Number,
      required: false,
      default: 1
    },
    minStepsBetweenThumbs: {
      type: Number,
      required: false,
      default: 0
    },
    thumbAlignment: {
      type: String,
      required: false,
      default: "contain"
    },
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false,
      default: "span"
    },
    name: {
      type: String,
      required: false
    },
    required: {
      type: Boolean,
      required: false
    }
  },
  emits: ["update:modelValue", "valueCommit"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const { min, max, step, minStepsBetweenThumbs, orientation, disabled, thumbAlignment, dir: propDir } = vueExports.toRefs(props);
    const dir = useDirection(propDir);
    const { forwardRef, currentElement } = useForwardExpose();
    const isFormControl = useFormControl(currentElement);
    const { CollectionSlot } = useCollection({ isProvider: true });
    const modelValue = useVModel(props, "modelValue", emits, {
      defaultValue: props.defaultValue,
      passive: props.modelValue === void 0
    });
    const currentModelValue = vueExports.computed(() => Array.isArray(modelValue.value) ? [...modelValue.value] : []);
    const valueIndexToChangeRef = vueExports.ref(0);
    const valuesBeforeSlideStartRef = vueExports.ref(currentModelValue.value);
    function handleSlideStart(value) {
      const closestIndex = getClosestValueIndex(currentModelValue.value, value);
      updateValues(value, closestIndex);
    }
    function handleSlideMove(value) {
      updateValues(value, valueIndexToChangeRef.value);
    }
    function handleSlideEnd() {
      const prevValue = valuesBeforeSlideStartRef.value[valueIndexToChangeRef.value];
      const nextValue = currentModelValue.value[valueIndexToChangeRef.value];
      const hasChanged = nextValue !== prevValue;
      if (hasChanged) emits("valueCommit", vueExports.toRaw(currentModelValue.value));
    }
    function updateValues(value, atIndex, { commit } = { commit: false }) {
      var _a;
      const decimalCount = getDecimalCount(step.value);
      const snapToStep = roundValue(Math.round((value - min.value) / step.value) * step.value + min.value, decimalCount);
      const nextValue = clamp(snapToStep, min.value, max.value);
      const nextValues = getNextSortedValues(currentModelValue.value, nextValue, atIndex);
      if (hasMinStepsBetweenValues(nextValues, minStepsBetweenThumbs.value * step.value)) {
        valueIndexToChangeRef.value = nextValues.indexOf(nextValue);
        const hasChanged = String(nextValues) !== String(modelValue.value);
        if (hasChanged && commit) emits("valueCommit", nextValues);
        if (hasChanged) {
          (_a = thumbElements.value[valueIndexToChangeRef.value]) == null ? void 0 : _a.focus();
          modelValue.value = nextValues;
        }
      }
    }
    const thumbElements = vueExports.ref([]);
    provideSliderRootContext({
      modelValue,
      currentModelValue,
      valueIndexToChangeRef,
      thumbElements,
      orientation,
      min,
      max,
      disabled,
      thumbAlignment
    });
    return (_ctx, _cache) => {
      return vueExports.openBlock(), vueExports.createBlock(vueExports.unref(CollectionSlot), null, {
        default: vueExports.withCtx(() => [(vueExports.openBlock(), vueExports.createBlock(vueExports.resolveDynamicComponent(vueExports.unref(orientation) === "horizontal" ? SliderHorizontal_default : SliderVertical_default), vueExports.mergeProps(_ctx.$attrs, {
          ref: vueExports.unref(forwardRef),
          "as-child": _ctx.asChild,
          as: _ctx.as,
          min: vueExports.unref(min),
          max: vueExports.unref(max),
          dir: vueExports.unref(dir),
          inverted: _ctx.inverted,
          "aria-disabled": vueExports.unref(disabled),
          "data-disabled": vueExports.unref(disabled) ? "" : void 0,
          onPointerdown: _cache[0] || (_cache[0] = () => {
            if (!vueExports.unref(disabled)) valuesBeforeSlideStartRef.value = currentModelValue.value;
          }),
          onSlideStart: _cache[1] || (_cache[1] = ($event) => !vueExports.unref(disabled) && handleSlideStart($event)),
          onSlideMove: _cache[2] || (_cache[2] = ($event) => !vueExports.unref(disabled) && handleSlideMove($event)),
          onSlideEnd: _cache[3] || (_cache[3] = ($event) => !vueExports.unref(disabled) && handleSlideEnd()),
          onHomeKeyDown: _cache[4] || (_cache[4] = ($event) => !vueExports.unref(disabled) && updateValues(vueExports.unref(min), 0, { commit: true })),
          onEndKeyDown: _cache[5] || (_cache[5] = ($event) => !vueExports.unref(disabled) && updateValues(vueExports.unref(max), currentModelValue.value.length - 1, { commit: true })),
          onStepKeyDown: _cache[6] || (_cache[6] = (event, direction) => {
            if (!vueExports.unref(disabled)) {
              const isPageKey = vueExports.unref(PAGE_KEYS).includes(event.key);
              const isSkipKey = isPageKey || event.shiftKey && vueExports.unref(ARROW_KEYS).includes(event.key);
              const multiplier = isSkipKey ? 10 : 1;
              const atIndex = valueIndexToChangeRef.value;
              const value = currentModelValue.value[atIndex];
              const stepInDirection = vueExports.unref(step) * multiplier * direction;
              updateValues(value + stepInDirection, atIndex, { commit: true });
            }
          })
        }), {
          default: vueExports.withCtx(() => [vueExports.renderSlot(_ctx.$slots, "default", { modelValue: vueExports.unref(modelValue) }), vueExports.unref(isFormControl) && _ctx.name ? (vueExports.openBlock(), vueExports.createBlock(vueExports.unref(VisuallyHiddenInput_default), {
            key: 0,
            type: "number",
            value: vueExports.unref(modelValue),
            name: _ctx.name,
            required: _ctx.required,
            disabled: vueExports.unref(disabled),
            step: vueExports.unref(step)
          }, null, 8, [
            "value",
            "name",
            "required",
            "disabled",
            "step"
          ])) : vueExports.createCommentVNode("v-if", true)]),
          _: 3
        }, 16, [
          "as-child",
          "as",
          "min",
          "max",
          "dir",
          "inverted",
          "aria-disabled",
          "data-disabled"
        ]))]),
        _: 3
      });
    };
  }
});
var SliderRoot_default = SliderRoot_vue_vue_type_script_setup_true_lang_default;
var SliderImpl_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ vueExports.defineComponent({
  __name: "SliderImpl",
  props: {
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
  emits: [
    "slideStart",
    "slideMove",
    "slideEnd",
    "homeKeyDown",
    "endKeyDown",
    "stepKeyDown"
  ],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const rootContext = injectSliderRootContext();
    return (_ctx, _cache) => {
      return vueExports.openBlock(), vueExports.createBlock(vueExports.unref(Primitive), vueExports.mergeProps({ "data-slider-impl": "" }, props, {
        onKeydown: _cache[0] || (_cache[0] = (event) => {
          if (event.key === "Home") {
            emits("homeKeyDown", event);
            event.preventDefault();
          } else if (event.key === "End") {
            emits("endKeyDown", event);
            event.preventDefault();
          } else if (vueExports.unref(PAGE_KEYS).concat(vueExports.unref(ARROW_KEYS)).includes(event.key)) {
            emits("stepKeyDown", event);
            event.preventDefault();
          }
        }),
        onPointerdown: _cache[1] || (_cache[1] = (event) => {
          const target = event.target;
          target.setPointerCapture(event.pointerId);
          event.preventDefault();
          if (vueExports.unref(rootContext).thumbElements.value.includes(target)) target.focus();
          else emits("slideStart", event);
        }),
        onPointermove: _cache[2] || (_cache[2] = (event) => {
          const target = event.target;
          if (target.hasPointerCapture(event.pointerId)) emits("slideMove", event);
        }),
        onPointerup: _cache[3] || (_cache[3] = (event) => {
          const target = event.target;
          if (target.hasPointerCapture(event.pointerId)) {
            target.releasePointerCapture(event.pointerId);
            emits("slideEnd", event);
          }
        })
      }), {
        default: vueExports.withCtx(() => [vueExports.renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 16);
    };
  }
});
var SliderImpl_default = SliderImpl_vue_vue_type_script_setup_true_lang_default;
var SliderRange_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ vueExports.defineComponent({
  __name: "SliderRange",
  props: {
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
    const rootContext = injectSliderRootContext();
    const orientation = injectSliderOrientationContext();
    useForwardExpose();
    const percentages = vueExports.computed(() => rootContext.currentModelValue.value.map((value) => convertValueToPercentage(value, rootContext.min.value, rootContext.max.value)));
    const offsetStart = vueExports.computed(() => rootContext.currentModelValue.value.length > 1 ? Math.min(...percentages.value) : 0);
    const offsetEnd = vueExports.computed(() => 100 - Math.max(...percentages.value, 0));
    return (_ctx, _cache) => {
      return vueExports.openBlock(), vueExports.createBlock(vueExports.unref(Primitive), {
        "data-disabled": vueExports.unref(rootContext).disabled.value ? "" : void 0,
        "data-orientation": vueExports.unref(rootContext).orientation.value,
        "as-child": _ctx.asChild,
        as: _ctx.as,
        style: vueExports.normalizeStyle({
          [vueExports.unref(orientation).startEdge.value]: `${offsetStart.value}%`,
          [vueExports.unref(orientation).endEdge.value]: `${offsetEnd.value}%`
        })
      }, {
        default: vueExports.withCtx(() => [vueExports.renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 8, [
        "data-disabled",
        "data-orientation",
        "as-child",
        "as",
        "style"
      ]);
    };
  }
});
var SliderRange_default = SliderRange_vue_vue_type_script_setup_true_lang_default;
var SliderThumbImpl_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ vueExports.defineComponent({
  inheritAttrs: false,
  __name: "SliderThumbImpl",
  props: {
    index: {
      type: Number,
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
    const rootContext = injectSliderRootContext();
    const orientation = injectSliderOrientationContext();
    const { forwardRef } = useForwardExpose();
    const { CollectionItem } = useCollection();
    const value = vueExports.computed(() => {
      var _a, _b;
      return (_b = (_a = rootContext.modelValue) == null ? void 0 : _a.value) == null ? void 0 : _b[props.index];
    });
    const percent = vueExports.computed(() => {
      var _a, _b;
      return value.value === void 0 ? 0 : convertValueToPercentage(value.value, (_a = rootContext.min.value) != null ? _a : 0, (_b = rootContext.max.value) != null ? _b : 100);
    });
    const label = vueExports.computed(() => {
      var _a2;
      var _a, _b;
      return getLabel(props.index, (_a2 = (_b = (_a = rootContext.modelValue) == null ? void 0 : _a.value) == null ? void 0 : _b.length) != null ? _a2 : 0);
    });
    const size = useSize();
    const orientationSize = vueExports.computed(() => size[orientation.size].value);
    const thumbInBoundsOffset = vueExports.computed(() => {
      if (rootContext.thumbAlignment.value === "overflow" || !orientationSize.value) return 0;
      else return getThumbInBoundsOffset(orientationSize.value, percent.value, orientation.direction.value);
    });
    const isMounted = useMounted();
    return (_ctx, _cache) => {
      return vueExports.openBlock(), vueExports.createBlock(vueExports.unref(CollectionItem), null, {
        default: vueExports.withCtx(() => [vueExports.createVNode(vueExports.unref(Primitive), vueExports.mergeProps(_ctx.$attrs, {
          ref: vueExports.unref(forwardRef),
          role: "slider",
          tabindex: vueExports.unref(rootContext).disabled.value ? void 0 : 0,
          "aria-label": _ctx.$attrs["aria-label"] || label.value,
          "data-disabled": vueExports.unref(rootContext).disabled.value ? "" : void 0,
          "data-orientation": vueExports.unref(rootContext).orientation.value,
          "aria-valuenow": value.value,
          "aria-valuemin": vueExports.unref(rootContext).min.value,
          "aria-valuemax": vueExports.unref(rootContext).max.value,
          "aria-orientation": vueExports.unref(rootContext).orientation.value,
          "as-child": _ctx.asChild,
          as: _ctx.as,
          style: {
            transform: "var(--reka-slider-thumb-transform)",
            position: "absolute",
            [vueExports.unref(orientation).startEdge.value]: `calc(${percent.value}% + ${thumbInBoundsOffset.value}px)`,
            display: !vueExports.unref(isMounted) && value.value === void 0 ? "none" : void 0
          },
          onFocus: _cache[0] || (_cache[0] = () => {
            vueExports.unref(rootContext).valueIndexToChangeRef.value = _ctx.index;
          })
        }), {
          default: vueExports.withCtx(() => [vueExports.renderSlot(_ctx.$slots, "default")]),
          _: 3
        }, 16, [
          "tabindex",
          "aria-label",
          "data-disabled",
          "data-orientation",
          "aria-valuenow",
          "aria-valuemin",
          "aria-valuemax",
          "aria-orientation",
          "as-child",
          "as",
          "style"
        ])]),
        _: 3
      });
    };
  }
});
var SliderThumbImpl_default = SliderThumbImpl_vue_vue_type_script_setup_true_lang_default;
var SliderThumb_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ vueExports.defineComponent({
  __name: "SliderThumb",
  props: {
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
    const props = __props;
    const { getItems } = useCollection();
    const { forwardRef, currentElement: thumbElement } = useForwardExpose();
    const index = vueExports.computed(() => thumbElement.value ? getItems(true).findIndex((i) => i.ref === thumbElement.value) : -1);
    return (_ctx, _cache) => {
      return vueExports.openBlock(), vueExports.createBlock(SliderThumbImpl_default, vueExports.mergeProps({ ref: vueExports.unref(forwardRef) }, props, { index: index.value }), {
        default: vueExports.withCtx(() => [vueExports.renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 16, ["index"]);
    };
  }
});
var SliderThumb_default = SliderThumb_vue_vue_type_script_setup_true_lang_default;
var SliderTrack_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ vueExports.defineComponent({
  __name: "SliderTrack",
  props: {
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
    const rootContext = injectSliderRootContext();
    useForwardExpose();
    return (_ctx, _cache) => {
      return vueExports.openBlock(), vueExports.createBlock(vueExports.unref(Primitive), {
        "as-child": _ctx.asChild,
        as: _ctx.as,
        "data-disabled": vueExports.unref(rootContext).disabled.value ? "" : void 0,
        "data-orientation": vueExports.unref(rootContext).orientation.value
      }, {
        default: vueExports.withCtx(() => [vueExports.renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 8, [
        "as-child",
        "as",
        "data-disabled",
        "data-orientation"
      ]);
    };
  }
});
var SliderTrack_default = SliderTrack_vue_vue_type_script_setup_true_lang_default;
const _sfc_main = /* @__PURE__ */ vueExports.defineComponent({
  __name: "VideoPlayer",
  __ssrInlineRender: true,
  props: {
    src: {},
    type: {},
    poster: {},
    autoplay: { type: Boolean },
    title: {}
  },
  setup(__props) {
    vueExports.ref(null);
    const playerContainerRef = vueExports.ref(null);
    const player = vueExports.shallowRef(null);
    const isPlaying = vueExports.ref(false);
    const currentTime = vueExports.ref(0);
    const duration = vueExports.ref(0);
    const volume = vueExports.ref(1);
    const isMuted = vueExports.ref(false);
    const isFullscreen = vueExports.ref(false);
    const isBuffering = vueExports.ref(false);
    const isHovering = vueExports.ref(false);
    const bufferedPercent = vueExports.ref(0);
    const showControlsForce = vueExports.ref(false);
    const currentBitrate = vueExports.ref("");
    const isSettingsOpen = vueExports.ref(false);
    const showStats = vueExports.ref(false);
    const stats = vueExports.ref({
      resolution: "-",
      bitrate: "-",
      // Bitrate of current quality level
      bufferHealth: 0,
      // Seconds of buffer ahead
      droppedFrames: 0,
      totalFrames: 0,
      downloadSpeed: "-",
      // Current network throughput
      currentQuality: "Auto",
      bufferedMB: 0
      // Buffered data size in MB
    });
    const showControls = vueExports.computed(() => {
      return isHovering.value || !isPlaying.value || showControlsForce.value || isSettingsOpen.value;
    });
    const qualityLevels = vueExports.ref([]);
    const selectedQuality = vueExports.ref(-1);
    const displayQualityLevels = vueExports.computed(() => {
      if (qualityLevels.value.length > 0) return qualityLevels.value;
      return [{ label: "Source", index: -1, isPlaceholder: true }];
    });
    const playbackRate = vueExports.ref(1);
    const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const osd = vueExports.ref({
      visible: false,
      icon: null,
      text: "",
      timeout: null
    });
    const formatTime = (seconds) => {
      if (!seconds || isNaN(seconds)) return "0:00";
      const h = Math.floor(seconds / 3600);
      const m = Math.floor(seconds % 3600 / 60);
      const s = Math.floor(seconds % 60);
      const mStr = m.toString().padStart(h > 0 ? 2 : 1, "0");
      const sStr = s.toString().padStart(2, "0");
      return h > 0 ? `${h}:${mStr}:${sStr}` : `${mStr}:${sStr}`;
    };
    const formatBitrate = (bits) => {
      if (!bits) return "";
      const mbps = bits / 1e6;
      return `${mbps.toFixed(2)} Mbps`;
    };
    const sliderValue = vueExports.computed({
      get: () => [currentTime.value],
      set: (val) => {
        if (val && val.length > 0) currentTime.value = val[0];
      }
    });
    const seek = (value) => {
      if (!player.value) return;
      player.value.currentTime(value[0]);
      resetControlsTimer();
    };
    const changeVolume = (value) => {
      if (!player.value || !value) return;
      player.value.volume(value[0]);
      if (value[0] > 0 && isMuted.value) player.value.muted(false);
      resetControlsTimer();
    };
    let hideControlsTimeout;
    const resetControlsTimer = () => {
      if (hideControlsTimeout) clearTimeout(hideControlsTimeout);
      if (isPlaying.value && !isSettingsOpen.value) {
        hideControlsTimeout = setTimeout(() => {
          isHovering.value = false;
          if (!isHovering.value) showControlsForce.value = false;
        }, 3e3);
      }
    };
    vueExports.ref({
      startX: 0,
      startY: 0,
      startTime: 0,
      activeType: null,
      startValue: 0,
      // Volume or Brightness at start
      isMoving: false
    });
    const brightness = vueExports.ref(1);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs_1(vueExports.mergeProps({
        ref_key: "playerContainerRef",
        ref: playerContainerRef,
        class: ["group relative w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl isolate aspect-video font-sans select-none", { "fixed inset-0 z-[100] rounded-none": vueExports.unref(isFullscreen) }]
      }, _attrs))} data-v-f2cab480><div data-vjs-player class="w-full h-full pointer-events-none" data-v-f2cab480><video class="video-js w-full h-full object-contain" style="${ssrRenderStyle_1({ filter: `brightness(${vueExports.unref(brightness)})` })}" playsinline data-v-f2cab480></video></div><div class="absolute inset-0 z-10 bg-transparent cursor-pointer touch-none" data-v-f2cab480></div>`);
      if (vueExports.unref(isSettingsOpen)) {
        _push(`<div class="absolute inset-0 z-50 bg-transparent cursor-default" data-v-f2cab480></div>`);
      } else {
        _push(`<!---->`);
      }
      if (vueExports.unref(showStats)) {
        _push(`<div class="absolute top-2 left-2 md:top-4 md:left-4 z-[70] bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-2 md:p-3 text-white font-mono text-[10px] md:text-xs shadow-xl pointer-events-auto min-w-[180px] md:min-w-[220px]" data-v-f2cab480><div class="flex items-center justify-between mb-2 pb-1 border-b border-white/10" data-v-f2cab480><div class="flex items-center gap-1.5" data-v-f2cab480>`);
        _push(ssrRenderComponent_1(vueExports.unref(BarChart3), { class: "w-3 h-3 md:w-4 md:h-4 text-indigo-400" }, null, _parent));
        _push(`<span class="font-semibold text-[10px] md:text-xs uppercase tracking-wider text-white/70" data-v-f2cab480>Stats</span></div><button class="p-0.5 hover:bg-white/10 rounded transition-colors" data-v-f2cab480>`);
        _push(ssrRenderComponent_1(vueExports.unref(X_1), { class: "w-3 h-3" }, null, _parent));
        _push(`</button></div><div class="space-y-1" data-v-f2cab480><div class="flex justify-between" data-v-f2cab480><span class="text-white/50" data-v-f2cab480>Resolution</span><span class="text-green-400" data-v-f2cab480>${ssrInterpolate_1(vueExports.unref(stats).resolution)}</span></div><div class="flex justify-between" data-v-f2cab480><span class="text-white/50" data-v-f2cab480>Quality</span><span class="text-indigo-400" data-v-f2cab480>${ssrInterpolate_1(vueExports.unref(stats).currentQuality)}</span></div><div class="flex justify-between" data-v-f2cab480><span class="text-white/50" data-v-f2cab480>Bitrate</span><span class="text-cyan-400" data-v-f2cab480>${ssrInterpolate_1(vueExports.unref(stats).bitrate)}</span></div><div class="flex justify-between" data-v-f2cab480><span class="text-white/50" data-v-f2cab480>Buffer</span><span class="${ssrRenderClass_1(vueExports.unref(stats).bufferHealth > 3 ? "text-green-400" : vueExports.unref(stats).bufferHealth > 1 ? "text-yellow-400" : "text-red-400")}" data-v-f2cab480>${ssrInterpolate_1(vueExports.unref(stats).bufferHealth)}s</span></div><div class="flex justify-between" data-v-f2cab480><span class="text-white/50" data-v-f2cab480>Downloaded</span><span class="text-blue-400" data-v-f2cab480>${ssrInterpolate_1(vueExports.unref(stats).bufferedMB)} MB</span></div><div class="flex justify-between" data-v-f2cab480><span class="text-white/50" data-v-f2cab480>Dropped</span><span class="${ssrRenderClass_1(vueExports.unref(stats).droppedFrames > 0 ? "text-red-400" : "text-green-400")}" data-v-f2cab480>${ssrInterpolate_1(vueExports.unref(stats).droppedFrames)} / ${ssrInterpolate_1(vueExports.unref(stats).totalFrames)}</span></div><div class="flex justify-between" data-v-f2cab480><span class="text-white/50" data-v-f2cab480>Speed</span><span class="text-purple-400 animate-pulse" data-v-f2cab480>${ssrInterpolate_1(vueExports.unref(stats).downloadSpeed)}</span></div></div><div class="mt-2 pt-1 border-t border-white/10 text-[8px] md:text-[10px] text-white/30 text-center" data-v-f2cab480> Press &#39;i&#39; to close </div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (vueExports.unref(isSettingsOpen)) {
        _push(`<div class="absolute z-[60] bottom-14 right-2 md:bottom-20 md:right-4 w-60 md:w-64 max-h-[70%] md:max-h-[80%] overflow-hidden flex flex-col bg-black/95 backdrop-blur-xl border border-white/10 shadow-3xl rounded-xl text-white pointer-events-auto" data-v-f2cab480><div class="flex items-center justify-between px-3 py-2 border-b border-white/10 shrink-0" data-v-f2cab480><span class="text-xs font-semibold text-white/60 uppercase tracking-wider" data-v-f2cab480>Settings</span><button class="p-1 hover:bg-white/10 rounded-full transition-colors" data-v-f2cab480>`);
        _push(ssrRenderComponent_1(vueExports.unref(X_1), { class: "w-4 h-4" }, null, _parent));
        _push(`</button></div><div class="overflow-y-auto custom-scrollbar p-2 space-y-3" data-v-f2cab480><div class="flex items-center justify-between px-2" data-v-f2cab480><span class="text-[10px] font-semibold text-white/50 uppercase tracking-wider" data-v-f2cab480>Bitrate</span>`);
        if (vueExports.unref(currentBitrate)) {
          _push(`<div class="flex items-center gap-1.5" data-v-f2cab480>`);
          _push(ssrRenderComponent_1(vueExports.unref(Activity_1), { class: "w-3 h-3 text-indigo-400" }, null, _parent));
          _push(`<span class="text-xs font-mono text-indigo-100" data-v-f2cab480>${ssrInterpolate_1(vueExports.unref(currentBitrate))}</span></div>`);
        } else {
          _push(`<span class="text-xs text-white/30" data-v-f2cab480>-</span>`);
        }
        _push(`</div><div data-v-f2cab480><div class="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2 px-1" data-v-f2cab480>Speed</div><div class="grid grid-cols-4 gap-1" data-v-f2cab480><!--[-->`);
        ssrRenderList_1(playbackRates, (rate) => {
          _push(`<button class="${ssrRenderClass_1([rate === vueExports.unref(playbackRate) ? "bg-indigo-600 text-white" : "text-white/70", "px-1 py-1.5 text-xs font-medium rounded transition-colors hover:bg-white/10"])}" data-v-f2cab480>${ssrInterpolate_1(rate)}x</button>`);
        });
        _push(`<!--]--></div></div><div data-v-f2cab480><div class="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2 px-1" data-v-f2cab480>Quality</div><div class="space-y-0.5" data-v-f2cab480><!--[-->`);
        ssrRenderList_1(vueExports.unref(displayQualityLevels), (q) => {
          _push(`<button class="${ssrRenderClass_1([vueExports.unref(selectedQuality) === q.index ? "text-indigo-300" : "text-white/80", "w-full px-2 py-2 text-xs text-left rounded hover:bg-white/10 flex items-center justify-between"])}" data-v-f2cab480><div class="flex flex-col" data-v-f2cab480><span data-v-f2cab480>${ssrInterpolate_1(q.label)}</span>`);
          if (q.bitrate) {
            _push(`<span class="text-[10px] text-white/40 font-mono" data-v-f2cab480>${ssrInterpolate_1(formatBitrate(q.bitrate))}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
          if (vueExports.unref(selectedQuality) === q.index) {
            _push(ssrRenderComponent_1(vueExports.unref(Check_1), { class: "w-3 h-3" }, null, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</button>`);
        });
        _push(`<!--]--></div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (vueExports.unref(osd).visible) {
        _push(`<div class="absolute inset-0 z-40 flex items-center justify-center pointer-events-none" data-v-f2cab480><div class="bg-black/60 backdrop-blur-md px-6 py-4 rounded-full flex flex-col items-center gap-2 text-white shadow-2xl border border-white/10 min-w-[100px]" data-v-f2cab480>`);
        if (vueExports.unref(osd).icon) {
          ssrRenderVNode(_push, vueExports.createVNode(vueExports.resolveDynamicComponent(vueExports.unref(osd).icon), {
            class: ["w-8 h-8", { "rotate-180": vueExports.unref(osd).text === "-5s" && vueExports.unref(osd).icon === vueExports.unref(ChevronRight_1) }]
          }, null), _parent);
        } else {
          _push(`<!---->`);
        }
        _push(`<span class="font-bold text-lg tracking-wide" data-v-f2cab480>${ssrInterpolate_1(vueExports.unref(osd).text)}</span></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (vueExports.unref(isBuffering)) {
        _push(`<div class="absolute inset-0 z-20 flex items-center justify-center pointer-events-none" data-v-f2cab480><div class="bg-black/40 backdrop-blur-sm p-4 rounded-full" data-v-f2cab480>`);
        _push(ssrRenderComponent_1(vueExports.unref(Loader2), { class: "w-10 h-10 text-white animate-spin" }, null, _parent));
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="${ssrRenderClass_1([!vueExports.unref(isPlaying) || vueExports.unref(showControls) ? "opacity-100 visible" : "opacity-0 invisible", "absolute inset-0 z-20 flex items-center justify-center pointer-events-none transition-all duration-300"])}" data-v-f2cab480><div class="flex items-center gap-6 md:gap-12 pointer-events-auto" data-v-f2cab480><button class="p-2 md:p-6 rounded-full bg-black/40 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 shadow-lg transition-all hover:scale-105 active:scale-95 touch-manipulation z-50" data-v-f2cab480>`);
      _push(ssrRenderComponent_1(vueExports.unref(RotateCcw_1), { class: "w-5 h-5 md:w-10 md:h-10 fill-white/10" }, null, _parent));
      _push(`</button><button class="bg-indigo-600/90 hover:bg-indigo-500 backdrop-blur-md p-3 md:p-8 rounded-full border border-white/10 shadow-2xl transform transition-all hover:scale-110 active:scale-95 touch-manipulation z-50 flex items-center justify-center" data-v-f2cab480>`);
      if (!vueExports.unref(isPlaying)) {
        _push(ssrRenderComponent_1(vueExports.unref(Play_1), { class: "w-6 h-6 md:w-14 md:h-14 text-white fill-white ml-0.5" }, null, _parent));
      } else {
        _push(ssrRenderComponent_1(vueExports.unref(Pause_1), { class: "w-6 h-6 md:w-14 md:h-14 text-white fill-white" }, null, _parent));
      }
      _push(`</button><button class="p-2 md:p-6 rounded-full bg-black/40 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 shadow-lg transition-all hover:scale-105 active:scale-95 touch-manipulation z-50" data-v-f2cab480>`);
      _push(ssrRenderComponent_1(vueExports.unref(RotateCw_1), { class: "w-5 h-5 md:w-10 md:h-10 fill-white/10" }, null, _parent));
      _push(`</button></div></div><div class="${ssrRenderClass_1([vueExports.unref(showControls) ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-4", "absolute bottom-0 left-0 right-0 z-30 pt-10 md:pt-24 pb-1 md:pb-6 px-3 md:px-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-all duration-300 pointer-events-none"])}" data-v-f2cab480><div class="pointer-events-auto flex flex-col gap-1 md:gap-2" data-v-f2cab480><div class="relative group/slider w-full flex items-center h-4 md:h-5" data-v-f2cab480>`);
      _push(ssrRenderComponent_1(vueExports.unref(SliderRoot_default), {
        modelValue: vueExports.unref(sliderValue),
        "onUpdate:modelValue": ($event) => vueExports.isRef(sliderValue) ? sliderValue.value = $event : null,
        max: vueExports.unref(duration),
        step: 0.1,
        class: "relative flex items-center select-none touch-none w-full h-5 cursor-pointer z-50",
        onValueCommit: seek
      }, {
        default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent_1(vueExports.unref(SliderTrack_default), { class: "bg-white/20 relative grow rounded-full h-[3px] md:h-[4px] group-hover/slider:h-[6px] transition-all overflow-hidden" }, {
              default: vueExports.withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="absolute top-0 bottom-0 left-0 bg-white/30 transition-all duration-500 ease-out" style="${ssrRenderStyle_1({ width: `${vueExports.unref(bufferedPercent)}%` })}" data-v-f2cab480${_scopeId2}></div>`);
                  _push3(ssrRenderComponent_1(vueExports.unref(SliderRange_default), { class: "absolute bg-indigo-500 rounded-full h-full" }, null, _parent3, _scopeId2));
                } else {
                  return [
                    vueExports.createVNode("div", {
                      class: "absolute top-0 bottom-0 left-0 bg-white/30 transition-all duration-500 ease-out",
                      style: { width: `${vueExports.unref(bufferedPercent)}%` }
                    }, null, 4),
                    vueExports.createVNode(vueExports.unref(SliderRange_default), { class: "absolute bg-indigo-500 rounded-full h-full" })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent_1(vueExports.unref(SliderThumb_default), { class: "block w-4 h-4 bg-white shadow-lg rounded-full hover:bg-gray-50 focus:outline-none ring-4 ring-transparent hover:ring-white/30 transition-all scale-0 group-hover/slider:scale-100" }, null, _parent2, _scopeId));
          } else {
            return [
              vueExports.createVNode(vueExports.unref(SliderTrack_default), { class: "bg-white/20 relative grow rounded-full h-[3px] md:h-[4px] group-hover/slider:h-[6px] transition-all overflow-hidden" }, {
                default: vueExports.withCtx(() => [
                  vueExports.createVNode("div", {
                    class: "absolute top-0 bottom-0 left-0 bg-white/30 transition-all duration-500 ease-out",
                    style: { width: `${vueExports.unref(bufferedPercent)}%` }
                  }, null, 4),
                  vueExports.createVNode(vueExports.unref(SliderRange_default), { class: "absolute bg-indigo-500 rounded-full h-full" })
                ]),
                _: 1
              }),
              vueExports.createVNode(vueExports.unref(SliderThumb_default), { class: "block w-4 h-4 bg-white shadow-lg rounded-full hover:bg-gray-50 focus:outline-none ring-4 ring-transparent hover:ring-white/30 transition-all scale-0 group-hover/slider:scale-100" })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="flex items-center justify-between" data-v-f2cab480><div class="flex items-center gap-3" data-v-f2cab480><div class="text-white/90 text-[10px] md:text-sm font-medium font-mono" data-v-f2cab480><span class="text-white" data-v-f2cab480>${ssrInterpolate_1(formatTime(vueExports.unref(currentTime)))}</span><span class="text-white/50 mx-1" data-v-f2cab480>/</span><span data-v-f2cab480>${ssrInterpolate_1(formatTime(vueExports.unref(duration)))}</span></div><div class="hidden md:flex items-center gap-2 group/vol" data-v-f2cab480><button class="text-white hover:text-indigo-400 transition-colors focus:outline-none" data-v-f2cab480>`);
      if (vueExports.unref(isMuted) || vueExports.unref(volume) === 0) {
        _push(ssrRenderComponent_1(vueExports.unref(VolumeX_1), { class: "w-5 h-5" }, null, _parent));
      } else {
        _push(ssrRenderComponent_1(vueExports.unref(Volume2_1), { class: "w-5 h-5" }, null, _parent));
      }
      _push(`</button><div class="w-0 overflow-hidden group-hover/vol:w-24 transition-all duration-300 ease-out" data-v-f2cab480>`);
      _push(ssrRenderComponent_1(vueExports.unref(SliderRoot_default), {
        modelValue: [vueExports.unref(isMuted) ? 0 : vueExports.unref(volume)],
        max: 1,
        step: 0.01,
        class: "relative flex items-center select-none touch-none w-20 h-5 cursor-pointer ml-2",
        "onUpdate:modelValue": changeVolume
      }, {
        default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent_1(vueExports.unref(SliderTrack_default), { class: "bg-white/20 relative grow rounded-full h-[3px]" }, {
              default: vueExports.withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent_1(vueExports.unref(SliderRange_default), { class: "absolute bg-white rounded-full h-full" }, null, _parent3, _scopeId2));
                } else {
                  return [
                    vueExports.createVNode(vueExports.unref(SliderRange_default), { class: "absolute bg-white rounded-full h-full" })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent_1(vueExports.unref(SliderThumb_default), { class: "block w-3 h-3 bg-white shadow rounded-full focus:outline-none focus:ring-2 focus:ring-white/50" }, null, _parent2, _scopeId));
          } else {
            return [
              vueExports.createVNode(vueExports.unref(SliderTrack_default), { class: "bg-white/20 relative grow rounded-full h-[3px]" }, {
                default: vueExports.withCtx(() => [
                  vueExports.createVNode(vueExports.unref(SliderRange_default), { class: "absolute bg-white rounded-full h-full" })
                ]),
                _: 1
              }),
              vueExports.createVNode(vueExports.unref(SliderThumb_default), { class: "block w-3 h-3 bg-white shadow rounded-full focus:outline-none focus:ring-2 focus:ring-white/50" })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div><div class="flex items-center gap-2" data-v-f2cab480>`);
      if (vueExports.unref(currentBitrate)) {
        _push(`<div class="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-md border border-white/5" data-v-f2cab480>`);
        _push(ssrRenderComponent_1(vueExports.unref(Activity_1), { class: "w-3 h-3 text-indigo-400" }, null, _parent));
        _push(`<span class="text-[10px] font-mono font-medium text-white/90 tracking-wide" data-v-f2cab480>${ssrInterpolate_1(vueExports.unref(currentBitrate))}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="${ssrRenderClass_1([vueExports.unref(showStats) ? "text-indigo-400 bg-white/10" : "", "p-1.5 md:p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors focus:outline-none touch-manipulation"])}" title="Toggle Stats (i)" data-v-f2cab480>`);
      _push(ssrRenderComponent_1(vueExports.unref(BarChart3), { class: "w-4 h-4 md:w-5 md:h-5" }, null, _parent));
      _push(`</button><button class="${ssrRenderClass_1([vueExports.unref(isSettingsOpen) ? "text-white bg-white/10" : "", "p-1.5 md:p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors focus:outline-none touch-manipulation"])}" data-v-f2cab480>`);
      _push(ssrRenderComponent_1(vueExports.unref(Settings_1), { class: "w-4 h-4 md:w-5 md:h-5" }, null, _parent));
      _push(`</button><button class="p-1.5 md:p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors focus:outline-none touch-manipulation" data-v-f2cab480>`);
      if (vueExports.unref(isFullscreen)) {
        _push(ssrRenderComponent_1(vueExports.unref(Minimize_1), { class: "w-4 h-4 md:w-5 md:h-5" }, null, _parent));
      } else {
        _push(ssrRenderComponent_1(vueExports.unref(Maximize_1), { class: "w-4 h-4 md:w-5 md:h-5" }, null, _parent));
      }
      _push(`</button></div></div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/media/VideoPlayer.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_3 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-f2cab480"]]);

export { __nuxt_component_3 as _ };
//# sourceMappingURL=VideoPlayer-9LG838lG.mjs.map
