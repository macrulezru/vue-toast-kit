/**
 * Testing utilities for vue-toast-kit.
 * Compatible with Vitest and Jest.
 *
 * Usage:
 *   import { createMockToast, mockUseToast } from 'vue-toast-kit/testing'
 */
import { ref } from 'vue'
import type { ToastItem, ToastOptions, ToastType, ToastPriority } from './core/types'
import type { ToastApi } from './composables/useToast'

// ── createMockToast ───────────────────────────────────────────────────────────

/** Create a minimal ToastItem stub for unit tests. */
export function createMockToast(overrides: Partial<ToastItem> & { options?: Partial<ToastOptions> } = {}): ToastItem {
  const defaultOptions = {
    id: overrides.id ?? 'mock-id',
    type: 'info' as ToastType,
    priority: 'normal' as ToastPriority,
    duration: 4000,
    closable: true,
    pauseOnHover: true,
    pauseOnFocusLoss: true,
    swipeToDismiss: true,
    persist: false,
    ...overrides.options,
  }

  const item: ToastItem = {
    id: overrides.id ?? `mock-${Math.random().toString(36).slice(2)}`,
    message: overrides.message ?? 'Test toast',
    options: defaultOptions as ToastItem['options'],
    createdAt: overrides.createdAt ?? Date.now(),
    remaining: overrides.remaining ?? ref(1),
    isPaused: overrides.isPaused ?? ref(false),
    groupCount: overrides.groupCount ?? ref(1),
    isGrouped: overrides.isGrouped ?? ref(false),
    pause: overrides.pause ?? (() => {}),
    resume: overrides.resume ?? (() => {}),
    dismiss: overrides.dismiss ?? (() => {}),
    update: overrides.update ?? (() => {}),
  }

  return item
}

// ── mockUseToast ──────────────────────────────────────────────────────────────

/**
 * Create a spy-friendly mock of the ToastApi.
 * All methods are no-ops that return empty strings unless overridden.
 *
 * @example
 * vi.mock('vue-toast-kit', () => ({ useToast: () => mockUseToast() }))
 */
export function mockUseToast(overrides: Partial<ToastApi> = {}): ToastApi {
  const noop = () => ''
  const noopVoid = () => {}

  function toast(_message: string, _options?: ToastOptions): string {
    return ''
  }

  toast.success = overrides.success ?? noop
  toast.error = overrides.error ?? noop
  toast.warning = overrides.warning ?? noop
  toast.info = overrides.info ?? noop
  toast.loading = overrides.loading ?? noop
  toast.custom = overrides.custom ?? noop
  toast.dismiss = overrides.dismiss ?? noopVoid
  toast.update = overrides.update ?? noopVoid
  toast.updateMessage = overrides.updateMessage ?? noopVoid
  toast.isActive = overrides.isActive ?? (() => false)
  toast.promise = overrides.promise ?? (<T>(p: Promise<T>) => p)
  toast.undo = overrides.undo ?? noop
  toast.dismissAll = overrides.dismissAll ?? noopVoid
  toast.pauseAll = overrides.pauseAll ?? noopVoid
  toast.resumeAll = overrides.resumeAll ?? noopVoid

  return toast as unknown as ToastApi
}
