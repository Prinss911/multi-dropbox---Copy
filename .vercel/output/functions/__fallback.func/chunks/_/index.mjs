import { v as vueExports } from '../routes/renderer.mjs';

function tryOnScopeDispose(fn) {
  if (vueExports.getCurrentScope()) {
    vueExports.onScopeDispose(fn);
    return true;
  }
  return false;
}
typeof WorkerGlobalScope !== "undefined" && globalThis instanceof WorkerGlobalScope;
const isDef = (val) => typeof val !== "undefined";
const toString = Object.prototype.toString;
const isObject = (val) => toString.call(val) === "[object Object]";
const noop = () => {
};
function toArray(value) {
  return Array.isArray(value) ? value : [value];
}

function useTimeoutFn(cb, interval, options = {}) {
  const {
    immediate = true,
    immediateCallback = false
  } = options;
  const isPending = vueExports.shallowRef(false);
  let timer = null;
  function clear() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }
  function stop() {
    isPending.value = false;
    clear();
  }
  function start(...args) {
    if (immediateCallback)
      cb();
    clear();
    isPending.value = true;
    timer = setTimeout(() => {
      isPending.value = false;
      timer = null;
      cb(...args);
    }, vueExports.toValue(interval));
  }
  if (immediate) {
    isPending.value = true;
  }
  tryOnScopeDispose(stop);
  return {
    isPending: vueExports.readonly(isPending),
    start,
    stop
  };
}

function useTimeout(interval = 1e3, options = {}) {
  const {
    controls: exposeControls = false,
    callback
  } = options;
  const controls = useTimeoutFn(
    callback != null ? callback : noop,
    interval,
    options
  );
  const ready = vueExports.computed(() => !controls.isPending.value);
  if (exposeControls) {
    return {
      ready,
      ...controls
    };
  } else {
    return ready;
  }
}

function watchImmediate(source, cb, options) {
  return vueExports.watch(
    source,
    cb,
    {
      ...options,
      immediate: true
    }
  );
}

const defaultWindow = void 0;

function unrefElement(elRef) {
  var _a;
  const plain = vueExports.toValue(elRef);
  return (_a = plain == null ? void 0 : plain.$el) != null ? _a : plain;
}

function useEventListener(...args) {
  const cleanups = [];
  const cleanup = () => {
    cleanups.forEach((fn) => fn());
    cleanups.length = 0;
  };
  const register = (el, event, listener, options) => {
    el.addEventListener(event, listener, options);
    return () => el.removeEventListener(event, listener, options);
  };
  const firstParamTargets = vueExports.computed(() => {
    const test = toArray(vueExports.toValue(args[0])).filter((e) => e != null);
    return test.every((e) => typeof e !== "string") ? test : void 0;
  });
  const stopWatch = watchImmediate(
    () => {
      var _a, _b;
      return [
        (_b = (_a = firstParamTargets.value) == null ? void 0 : _a.map((e) => unrefElement(e))) != null ? _b : [defaultWindow].filter((e) => e != null),
        toArray(vueExports.toValue(firstParamTargets.value ? args[1] : args[0])),
        toArray(vueExports.unref(firstParamTargets.value ? args[2] : args[1])),
        // @ts-expect-error - TypeScript gets the correct types, but somehow still complains
        vueExports.toValue(firstParamTargets.value ? args[3] : args[2])
      ];
    },
    ([raw_targets, raw_events, raw_listeners, raw_options]) => {
      cleanup();
      if (!(raw_targets == null ? void 0 : raw_targets.length) || !(raw_events == null ? void 0 : raw_events.length) || !(raw_listeners == null ? void 0 : raw_listeners.length))
        return;
      const optionsClone = isObject(raw_options) ? { ...raw_options } : raw_options;
      cleanups.push(
        ...raw_targets.flatMap(
          (el) => raw_events.flatMap(
            (event) => raw_listeners.map((listener) => register(el, event, listener, optionsClone))
          )
        )
      );
    },
    { flush: "post" }
  );
  const stop = () => {
    stopWatch();
    cleanup();
  };
  tryOnScopeDispose(cleanup);
  return stop;
}

function useMounted() {
  const isMounted = vueExports.shallowRef(false);
  const instance = vueExports.getCurrentInstance();
  if (instance) {
    vueExports.onMounted(() => {
      isMounted.value = true;
    }, instance);
  }
  return isMounted;
}

function createKeyPredicate(keyFilter) {
  if (typeof keyFilter === "function")
    return keyFilter;
  else if (typeof keyFilter === "string")
    return (event) => event.key === keyFilter;
  else if (Array.isArray(keyFilter))
    return (event) => keyFilter.includes(event.key);
  return () => true;
}
function onKeyStroke(...args) {
  let key;
  let handler;
  let options = {};
  if (args.length === 3) {
    key = args[0];
    handler = args[1];
    options = args[2];
  } else if (args.length === 2) {
    if (typeof args[1] === "object") {
      key = true;
      handler = args[0];
      options = args[1];
    } else {
      key = args[0];
      handler = args[1];
    }
  } else {
    key = true;
    handler = args[0];
  }
  const {
    target = defaultWindow,
    eventName = "keydown",
    passive = false,
    dedupe = false
  } = options;
  const predicate = createKeyPredicate(key);
  const listener = (e) => {
    if (e.repeat && vueExports.toValue(dedupe))
      return;
    if (predicate(e))
      handler(e);
  };
  return useEventListener(target, eventName, listener, passive);
}

function useRafFn(fn, options = {}) {
  const {
    immediate = true,
    fpsLimit = void 0,
    window = defaultWindow,
    once = false
  } = options;
  const isActive = vueExports.shallowRef(false);
  const intervalLimit = vueExports.computed(() => {
    return fpsLimit ? 1e3 / vueExports.toValue(fpsLimit) : null;
  });
  let previousFrameTimestamp = 0;
  let rafId = null;
  function loop(timestamp) {
    if (!isActive.value || !window)
      return;
    if (!previousFrameTimestamp)
      previousFrameTimestamp = timestamp;
    const delta = timestamp - previousFrameTimestamp;
    if (intervalLimit.value && delta < intervalLimit.value) {
      rafId = window.requestAnimationFrame(loop);
      return;
    }
    previousFrameTimestamp = timestamp;
    fn({ delta, timestamp });
    if (once) {
      isActive.value = false;
      rafId = null;
      return;
    }
    rafId = window.requestAnimationFrame(loop);
  }
  function resume() {
    if (!isActive.value && window) {
      isActive.value = true;
      previousFrameTimestamp = 0;
      rafId = window.requestAnimationFrame(loop);
    }
  }
  function pause() {
    isActive.value = false;
    if (rafId != null && window) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  }
  if (immediate)
    resume();
  tryOnScopeDispose(pause);
  return {
    isActive: vueExports.readonly(isActive),
    pause,
    resume
  };
}

function cloneFnJSON(source) {
  return JSON.parse(JSON.stringify(source));
}

function useVModel(props, key, emit, options = {}) {
  var _a, _b, _c;
  const {
    clone = false,
    passive = false,
    eventName,
    deep = false,
    defaultValue,
    shouldEmit
  } = options;
  const vm = vueExports.getCurrentInstance();
  const _emit = emit || (vm == null ? void 0 : vm.emit) || ((_a = vm == null ? void 0 : vm.$emit) == null ? void 0 : _a.bind(vm)) || ((_c = (_b = vm == null ? void 0 : vm.proxy) == null ? void 0 : _b.$emit) == null ? void 0 : _c.bind(vm == null ? void 0 : vm.proxy));
  let event = eventName;
  if (!key) {
    key = "modelValue";
  }
  event = event || `update:${key.toString()}`;
  const cloneFn = (val) => !clone ? val : typeof clone === "function" ? clone(val) : cloneFnJSON(val);
  const getValue = () => isDef(props[key]) ? cloneFn(props[key]) : defaultValue;
  const triggerEmit = (value) => {
    if (shouldEmit) {
      if (shouldEmit(value))
        _emit(event, value);
    } else {
      _emit(event, value);
    }
  };
  if (passive) {
    const initialValue = getValue();
    const proxy = vueExports.ref(initialValue);
    let isUpdating = false;
    vueExports.watch(
      () => props[key],
      (v) => {
        if (!isUpdating) {
          isUpdating = true;
          proxy.value = cloneFn(v);
          vueExports.nextTick(() => isUpdating = false);
        }
      }
    );
    vueExports.watch(
      proxy,
      (v) => {
        if (!isUpdating && (v !== props[key] || deep))
          triggerEmit(v);
      },
      { deep }
    );
    return proxy;
  } else {
    return vueExports.computed({
      get() {
        return getValue();
      },
      set(value) {
        triggerEmit(value);
      }
    });
  }
}

export { unrefElement as a, useMounted as b, useRafFn as c, defaultWindow as d, useTimeout as e, onKeyStroke as o, useVModel as u };
//# sourceMappingURL=index.mjs.map
