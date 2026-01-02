<template>
  <Teleport to="body">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="onCancel"
    >
      <div class="bg-card w-full max-w-sm rounded-lg shadow-lg border p-6 animate-in zoom-in-95">
        <!-- Header -->
        <div class="flex items-center gap-3 mb-4">
          <div :class="[
            'p-2 rounded-full',
            variant === 'danger' ? 'bg-destructive/10' : 'bg-primary/10'
          ]">
            <Icon 
              :name="variant === 'danger' ? 'lucide:alert-triangle' : 'lucide:help-circle'" 
              :class="[
                'h-5 w-5',
                variant === 'danger' ? 'text-destructive' : 'text-primary'
              ]"
            />
          </div>
          <h3 class="font-semibold text-lg text-foreground">{{ title }}</h3>
        </div>
        
        <!-- Message -->
        <p class="text-muted-foreground mb-6">{{ message }}</p>
        
        <!-- Actions -->
        <div class="flex gap-3 justify-end">
          <button 
            @click="onCancel"
            class="px-4 py-2 rounded-md text-sm font-medium border border-input bg-background hover:bg-muted transition-colors"
          >
            {{ cancelText }}
          </button>
          <button 
            @click="onConfirm"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              variant === 'danger' 
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            ]"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger'
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Confirm',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'default'
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const onConfirm = () => emit('confirm')
const onCancel = () => emit('cancel')
</script>
