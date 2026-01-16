import { v as vueExports } from '../routes/renderer.mjs';

const TOAST_LIMIT = 5;
let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}
const toasts = vueExports.ref([]);
function add(props) {
  const id = genId();
  const update = (props2) => {
    updateToast(id, props2);
  };
  const dismiss = () => dismissToast(id);
  toasts.value = [
    {
      id,
      open: true,
      ...props
    },
    ...toasts.value
  ].slice(0, TOAST_LIMIT);
  return {
    id,
    dismiss,
    update
  };
}
function updateToast(id, props) {
  const index = toasts.value.findIndex((t) => t.id === id);
  if (index !== -1) {
    toasts.value[index] = { ...toasts.value[index], ...props };
  }
}
function dismissToast(id) {
  const index = toasts.value.findIndex((t) => t.id === id);
  if (index !== -1) {
    toasts.value[index].open = false;
  }
}
function toast(props) {
  return add(props);
}
toast.success = (title, description) => {
  return add({
    title,
    description,
    variant: "success",
    duration: 3e3
  });
};
toast.error = (title, description) => {
  return add({
    title,
    description,
    variant: "destructive",
    duration: 5e3
  });
};
toast.info = (title, description) => {
  return add({
    title,
    description,
    variant: "info",
    duration: 3e3
  });
};
toast.warning = (title, description) => {
  return add({
    title,
    description,
    variant: "warning",
    duration: 4e3
  });
};
const useToast = () => {
  return {
    toasts: vueExports.computed(() => toasts.value),
    toast,
    dismiss: dismissToast
  };
};

export { useToast as u };
//# sourceMappingURL=useToast-Cu2d6NoU.mjs.map
