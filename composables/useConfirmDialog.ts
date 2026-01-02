import { ref } from 'vue'

interface ConfirmOptions {
    title?: string
    message: string
    confirmText?: string
    cancelText?: string
    variant?: 'default' | 'danger'
}

const isOpen = ref(false)
const options = ref<ConfirmOptions>({
    message: ''
})
let resolvePromise: ((value: boolean) => void) | null = null

export function useConfirmDialog() {
    const open = (opts: ConfirmOptions): Promise<boolean> => {
        options.value = opts
        isOpen.value = true

        return new Promise((resolve) => {
            resolvePromise = resolve
        })
    }

    const confirm = () => {
        isOpen.value = false
        resolvePromise?.(true)
        resolvePromise = null
    }

    const cancel = () => {
        isOpen.value = false
        resolvePromise?.(false)
        resolvePromise = null
    }

    return {
        isOpen,
        options,
        open,
        confirm,
        cancel
    }
}
