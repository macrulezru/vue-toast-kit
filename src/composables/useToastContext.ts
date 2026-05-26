import { inject, type App } from 'vue'
import { ToastQueue } from '../core/ToastQueue'
import { isServer, globalBuffer } from '../core/ToastBuffer'
import { TOAST_CONTEXT_KEY, type ToastOptions, type ToastContext, type GlobalToastOptions } from '../core/types'
import type { VNode } from 'vue'

function buildContext(queue: ToastQueue): ToastContext {
  return {
    queue,
    addToast(message: string | VNode, options: ToastOptions = {}): string {
      if (isServer) {
        const id = options.id ?? `vtk-ssr-${Date.now()}`
        globalBuffer.push(message, { ...options, id })
        return id
      }
      return queue.add(message, options)
    },
    dismiss(id?: string): void {
      queue.dismiss(id)
    },
    update(id: string, options: Partial<ToastOptions>): void {
      queue.update(id, options)
    },
    isActive(id: string): boolean {
      return queue.isActive(id)
    },
  }
}

let globalContext: ToastContext | null = null

export function getOrCreateGlobalContext(opts?: GlobalToastOptions): ToastContext {
  if (!globalContext) {
    const queue = new ToastQueue(opts?.maxVisible ?? 5, {
      rateLimit: opts?.rateLimit,
      rateLimitWindowMs: opts?.rateLimitWindowMs,
      persistStorage: opts?.persistStorage,
    })
    globalContext = buildContext(queue)
  }
  return globalContext
}

export function createToastContext(opts?: GlobalToastOptions): ToastContext {
  const queue = new ToastQueue(opts?.maxVisible ?? 5, {
    rateLimit: opts?.rateLimit,
    rateLimitWindowMs: opts?.rateLimitWindowMs,
    persistStorage: opts?.persistStorage,
  })
  return buildContext(queue)
}

export function useToastContext(): ToastContext {
  const injected = inject<ToastContext>(TOAST_CONTEXT_KEY, null as unknown as ToastContext)
  if (injected) return injected
  return getOrCreateGlobalContext()
}

export function installContext(app: App, opts?: GlobalToastOptions): ToastContext {
  const ctx = getOrCreateGlobalContext(opts)
  app.provide(TOAST_CONTEXT_KEY, ctx)
  return ctx
}
