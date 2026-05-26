import type { Component, VNode, Ref } from 'vue'

export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'loading' | 'custom'
export type ToastPriority = 'critical' | 'high' | 'normal' | 'low'
export type ToastPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastUndo {
  label?: string
  onUndo: () => void | Promise<void>
  duration?: number
}

export interface ToastDesignTokens {
  colorBg?: string
  colorText?: string
  colorBorder?: string
  colorSuccess?: string
  colorError?: string
  colorWarning?: string
  colorInfo?: string
  colorLoading?: string
  fontFamily?: string
  fontSize?: string
  fontWeight?: string
  lineHeight?: string
  borderRadius?: string
  borderWidth?: string
  shadow?: string
  paddingX?: string
  paddingY?: string
  iconSize?: string
  progressHeight?: string
  maxWidth?: string
  minWidth?: string
  transitionDuration?: string
  transitionEasing?: string
  zIndex?: string
}

export interface ToastOptions {
  id?: string
  type?: ToastType
  priority?: ToastPriority
  duration?: number
  position?: ToastPosition
  closable?: boolean
  groupKey?: string
  icon?: Component | string | false
  action?: ToastAction
  undo?: ToastUndo
  onClose?: () => void
  onAutoClose?: () => void
  pauseOnHover?: boolean
  pauseOnFocusLoss?: boolean
  swipeToDismiss?: boolean
  persist?: boolean
  component?: Component
  componentProps?: Record<string, unknown>
  ariaLive?: 'assertive' | 'polite'
  theme?: 'light' | 'dark' | 'system' | ToastDesignTokens
}

export interface ToastItem {
  id: string
  message: string | VNode
  options: Required<Omit<ToastOptions, 'component' | 'componentProps' | 'icon' | 'action' | 'undo' | 'theme' | 'position'>> & {
    position?: ToastPosition
    component?: Component
    componentProps?: Record<string, unknown>
    icon?: Component | string | false
    action?: ToastAction
    undo?: ToastUndo
    theme?: 'light' | 'dark' | 'system' | ToastDesignTokens
  }
  createdAt: number
  remaining: Ref<number>
  isPaused: Ref<boolean>
  groupCount: Ref<number>
  isGrouped: Ref<boolean>
  pause(): void
  resume(): void
  dismiss(): void
  update(opts: Partial<ToastOptions>): void
}

export interface PromiseToastMessages<T = unknown> {
  loading: string
  success: string | ((data: T) => string)
  error: string | ((err: unknown) => string)
}

export interface ToastContext {
  queue: import('./ToastQueue').ToastQueue
  addToast(message: string | VNode, options?: ToastOptions): string
  dismiss(id?: string): void
  update(id: string, options: Partial<ToastOptions>): void
  isActive(id: string): boolean
}

export interface GlobalToastOptions {
  position?: ToastPosition
  maxVisible?: number
  duration?: number
  theme?: 'light' | 'dark' | 'system'
  ignoreSSR?: boolean
  pauseOnHover?: boolean
  pauseOnFocusLoss?: boolean
  closable?: boolean
  /** Max toasts added within rateLimitWindowMs before extras are dropped. */
  rateLimit?: number
  /** Window in ms for rateLimit (default: 1000). */
  rateLimitWindowMs?: number
  /** Enable automatic localStorage persist/restore for toasts with persist:true. */
  persistStorage?: boolean
}

export const PRIORITY_ORDER: Record<ToastPriority, number> = {
  critical: 3,
  high: 2,
  normal: 1,
  low: 0,
}

export const DEFAULT_OPTIONS: Required<Omit<ToastOptions, 'id' | 'component' | 'componentProps' | 'icon' | 'action' | 'undo' | 'groupKey' | 'theme' | 'onClose' | 'onAutoClose' | 'ariaLive' | 'position'>> = {
  type: 'info',
  priority: 'normal',
  duration: 4000,
  closable: true,
  pauseOnHover: true,
  pauseOnFocusLoss: true,
  swipeToDismiss: true,
  persist: false,
}

export const TOAST_CONTEXT_KEY = Symbol('vue-toast-kit-context')
