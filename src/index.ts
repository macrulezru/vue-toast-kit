// Styles
import './styles/tokens.css'
import './styles/base.css'
import './styles/animations.css'
import './styles/themes/light.css'
import './styles/themes/dark.css'
import './styles/themes/system.css'

// Core types
export type {
  ToastType,
  ToastPriority,
  ToastPosition,
  ToastOptions,
  ToastItem,
  ToastAction,
  ToastUndo,
  PromiseToastMessages,
  ToastContext,
  GlobalToastOptions,
  ToastDesignTokens,
} from './core/types'

export { TOAST_CONTEXT_KEY, PRIORITY_ORDER, DEFAULT_OPTIONS } from './core/types'

// Core classes (for advanced use)
export { ToastQueue } from './core/ToastQueue'
export { UndoTimer } from './core/UndoTimer'
export { GroupManager } from './core/GroupManager'
export { globalBuffer, isServer } from './core/ToastBuffer'

// Composables
export { useToast, toast } from './composables/useToast'
export type { ToastApi } from './composables/useToast'
export { useToastState } from './composables/useToastState'
export {
  useToastContext,
  createToastContext,
  getOrCreateGlobalContext,
} from './composables/useToastContext'

// Components
export { default as ToastContainer } from './components/ToastContainer.vue'
export { default as Toast } from './components/Toast.vue'
export { default as ToastIcon } from './components/ToastIcon.vue'
export { default as ToastProgressBar } from './components/ToastProgressBar.vue'
export { default as ToastActions } from './components/ToastActions.vue'

// Plugin
export { VueToastPlugin } from './plugin'
export type { VueToastPluginOptions } from './plugin'
