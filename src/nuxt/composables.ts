// Nuxt-compatible re-exports for auto-import and manual import
// Usage: import { useToast } from 'vue-toast-kit/nuxt/composables'

export { useToast, toast } from '../composables/useToast'
export type { ToastApi } from '../composables/useToast'

export { useToastState } from '../composables/useToastState'

export {
  useToastContext,
  createToastContext,
  getOrCreateGlobalContext,
} from '../composables/useToastContext'
