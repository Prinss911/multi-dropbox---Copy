import { ref, computed } from 'vue'

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000000

type ToastType = 'foreground' | 'background'

interface Toast {
  id: string
  title?: string
  description?: string
  type?: ToastType
  action?: {
    label: string
    altText: string
    onClick: () => void
  }
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info'
  duration?: number
  open: boolean
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

const toasts = ref<Toast[]>([])

function add(props: Omit<Toast, 'id' | 'open'>) {
  const id = genId()

  const update = (props: Toast) => {
    updateToast(id, props)
  }

  const dismiss = () => dismissToast(id)

  toasts.value = [
    {
      id,
      open: true,
      ...props,
    },
    ...toasts.value,
  ].slice(0, TOAST_LIMIT)

  return {
    id,
    dismiss,
    update,
  }
}

function updateToast(id: string, props: Partial<Toast>) {
  const index = toasts.value.findIndex((t) => t.id === id)
  if (index !== -1) {
    toasts.value[index] = { ...toasts.value[index], ...props }
  }
}

function dismissToast(id: string) {
  const index = toasts.value.findIndex((t) => t.id === id)
  if (index !== -1) {
    toasts.value[index].open = false
  }
}

function toast(props: Omit<Toast, 'id' | 'open'>) {
  return add(props)
}

toast.success = (title: string, description?: string) => {
    return add({
        title,
        description,
        variant: 'success',
        duration: 3000
    })
}

toast.error = (title: string, description?: string) => {
    return add({
        title,
        description,
        variant: 'destructive',
        duration: 5000
    })
}

toast.info = (title: string, description?: string) => {
    return add({
        title,
        description,
        variant: 'info',
        duration: 3000
    })
}

toast.warning = (title: string, description?: string) => {
    return add({
        title,
        description,
        variant: 'warning',
        duration: 4000
    })
}


export const useToast = () => {
  return {
    toasts: computed(() => toasts.value),
    toast,
    dismiss: dismissToast,
  }
}
