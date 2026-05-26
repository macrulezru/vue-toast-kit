import { type Component, type VNode } from 'vue'
import { useToastContext, getOrCreateGlobalContext } from './useToastContext'
import { UndoTimer } from '../core/UndoTimer'
import type { ToastContext, ToastOptions, PromiseToastMessages, ToastPosition } from '../core/types'
import type { ToastQueue } from '../core/ToastQueue'

function restartTimer(queue: ToastQueue, id: string, duration: number): void {
  const q = queue as unknown as { timers: Map<string, UndoTimer> }
  q.timers.get(id)?.destroy()
  q.timers.delete(id)

  const item = queue.active.find(t => t.id === id)
  if (!item || !duration) return

  const timer = new UndoTimer(
    duration,
    () => {
      item.options.onAutoClose?.()
      queue.remove(id)
    },
    (r: number) => { item.remaining.value = r },
  )
  q.timers.set(id, timer)
  timer.start()
}

function buildToastApi(ctx: ToastContext) {
  const q = ctx.queue

  /** Show an info toast. Returns the toast id. */
  function toast(message: string, options?: ToastOptions): string {
    return ctx.addToast(message, { type: 'info', ...options })
  }

  /** Show a success toast. */
  toast.success = (message: string, options?: ToastOptions): string =>
    ctx.addToast(message, { type: 'success', ...options })

  /** Show an error toast (default priority: high). */
  toast.error = (message: string, options?: ToastOptions): string =>
    ctx.addToast(message, { type: 'error', priority: 'high', ...options })

  /** Show a warning toast. */
  toast.warning = (message: string, options?: ToastOptions): string =>
    ctx.addToast(message, { type: 'warning', ...options })

  /** Show an info toast (alias for the default call). */
  toast.info = (message: string, options?: ToastOptions): string =>
    ctx.addToast(message, { type: 'info', ...options })

  /** Show a sticky loading toast. Returns the id to update later. */
  toast.loading = (message: string, options?: ToastOptions): string =>
    ctx.addToast(message, { type: 'loading', duration: 0, closable: false, ...options })

  /** Show a toast with a fully custom component. */
  toast.custom = (component: Component, options?: ToastOptions): string =>
    ctx.addToast('', { type: 'custom', component, duration: 0, ...options })

  /** Dismiss one or all toasts. */
  toast.dismiss = (id?: string): void => ctx.dismiss(id)

  /** Update options (and optionally the message) of an existing toast. */
  toast.update = (id: string, partial: Partial<ToastOptions> & { message?: string | VNode }): void => {
    const item = q.active.find(t => t.id === id)
    if (item && partial.message !== undefined) {
      item.message = partial.message
    }
    ctx.update(id, partial)
  }

  /** Update only the message text without touching options. */
  toast.updateMessage = (id: string, message: string | VNode): void => {
    const item = q.active.find(t => t.id === id)
    if (item) item.message = message
  }

  /** Returns true if the toast with the given id is currently active. */
  toast.isActive = (id: string): boolean => ctx.isActive(id)

  /**
   * Show a loading toast, then update it to success or error when the promise settles.
   * Returns the original promise so it can be awaited or chained.
   */
  toast.promise = async <T>(
    promise: Promise<T>,
    messages: PromiseToastMessages<T>,
    options?: ToastOptions,
  ): Promise<T> => {
    const id = toast.loading(messages.loading, options)

    try {
      const data = await promise
      const msg = typeof messages.success === 'function' ? messages.success(data) : messages.success
      const item = q.active.find(t => t.id === id)
      if (item) {
        item.message = msg
        item.options.type = 'success'
        item.options.closable = true
        item.options.duration = 3000
        restartTimer(q, id, 3000)
      }
      return data
    } catch (err: unknown) {
      const msg = typeof messages.error === 'function' ? messages.error(err) : messages.error
      const item = q.active.find(t => t.id === id)
      if (item) {
        item.message = msg
        item.options.type = 'error'
        item.options.closable = true
        item.options.duration = 5000
        restartTimer(q, id, 5000)
      }
      throw err
    }
  }

  /** Show an undo toast with a countdown. Call `options.undo.onUndo` if the user taps Undo. */
  toast.undo = (message: string, options: ToastOptions & { undo: NonNullable<ToastOptions['undo']> }): string => {
    return ctx.addToast(message, {
      type: 'info',
      duration: options.undo.duration ?? 5000,
      closable: false,
      ...options,
    })
  }

  /** Dismiss all toasts, optionally filtered by position. */
  toast.dismissAll = (position?: ToastPosition): void => q.dismissAll(position)
  /** Pause all active toast timers. */
  toast.pauseAll = (): void => q.pauseAll()
  /** Resume all active toast timers. */
  toast.resumeAll = (): void => q.resumeAll()

  return toast
}

export type ToastApi = ReturnType<typeof buildToastApi>

export function useToast(context?: ToastContext): ToastApi {
  if (context) return buildToastApi(context)

  // Inside component — try injected context
  try {
    const ctx = useToastContext()
    return buildToastApi(ctx)
  } catch {
    return buildToastApi(getOrCreateGlobalContext())
  }
}

// Global singleton for use outside components (Pinia stores, axios interceptors, etc.)
export const toast: ToastApi = buildToastApi(getOrCreateGlobalContext())
