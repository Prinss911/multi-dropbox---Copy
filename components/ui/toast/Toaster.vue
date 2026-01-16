<script setup lang="ts">
import { ToastProvider, ToastViewport, ToastRoot, ToastTitle, ToastDescription, ToastClose, ToastAction } from 'reka-ui'
import { useToast } from '~/composables/useToast'

const { toasts } = useToast()

const getVariantClasses = (variant?: string) => {
    switch (variant) {
        case 'destructive':
            return 'group destructive border-destructive bg-destructive text-destructive-foreground'
        case 'success':
            return 'group success border-green-500 bg-green-50 text-green-900 dark:bg-green-900 dark:text-green-100'
        case 'warning':
            return 'group warning border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100'
        case 'info':
            return 'group info border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
        default:
            return 'group border bg-background text-foreground'
    }
}
</script>

<template>
  <ToastProvider>
    <ToastRoot 
        v-for="toast in toasts" 
        :key="toast.id" 
        v-model:open="toast.open"
        :duration="toast.duration"
        :class="[
            'pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--reka-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--reka-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
            getVariantClasses(toast.variant)
        ]"
    >
        <div class="grid gap-1">
            <ToastTitle v-if="toast.title" class="text-sm font-semibold">
                {{ toast.title }}
            </ToastTitle>
            <ToastDescription v-if="toast.description" class="text-sm opacity-90">
                {{ toast.description }}
            </ToastDescription>
        </div>
        
        <ToastAction v-if="toast.action" :alt-text="toast.action.altText" as-child>
             <button @click="toast.action.onClick" class="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive">
                {{ toast.action.label }}
             </button>
        </ToastAction>

        <ToastClose class="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600">
            <Icon name="lucide:x" class="h-4 w-4" />
        </ToastClose>
    </ToastRoot>
    <ToastViewport class="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
  </ToastProvider>
</template>
