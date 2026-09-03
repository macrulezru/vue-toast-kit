import { inject, type App } from 'vue'
import { ToastQueue } from '../core/ToastQueue'
import { isServer, globalBuffer } from '../core/ToastBuffer'
import {
  TOAST_CONTEXT_KEY,
  GLOBAL_OPTIONS_KEY,
  type ToastOptions,
  type ToastContext,
  type GlobalToastOptions,
} from '../core/types'
import type { VNode } from 'vue'

function buildContext(queue: ToastQueue, ignoreSSR = false): ToastContext {
  return {
    queue,
    addToast(message: string | VNode, options: ToastOptions = {}): string {
      if (isServer) {
        const id = options.id ?? `vtk-ssr-${Date.now()}`
        if (ignoreSSR) return id
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

function buildQueue(opts?: GlobalToastOptions): ToastQueue {
  return new ToastQueue(opts?.maxVisible ?? 5, {
    rateLimit: opts?.rateLimit,
    rateLimitWindowMs: opts?.rateLimitWindowMs,
    persistStorage: opts?.persistStorage,
    duration: opts?.duration,
    closable: opts?.closable,
    pauseOnHover: opts?.pauseOnHover,
    pauseOnFocusLoss: opts?.pauseOnFocusLoss,
  })
}

let globalContext: ToastContext | null = null

export function getOrCreateGlobalContext(opts?: GlobalToastOptions): ToastContext {
  if (!globalContext) {
    globalContext = buildContext(buildQueue(opts), opts?.ignoreSSR)
  }
  return globalContext
}

export function createToastContext(opts?: GlobalToastOptions): ToastContext {
  return buildContext(buildQueue(opts), opts?.ignoreSSR)
}

export function useToastContext(): ToastContext {
  const injected = inject<ToastContext>(TOAST_CONTEXT_KEY, null as unknown as ToastContext)
  if (injected) return injected
  return getOrCreateGlobalContext()
}

export function installContext(app: App, opts?: GlobalToastOptions): ToastContext {
  const ctx = getOrCreateGlobalContext(opts)
  app.provide(TOAST_CONTEXT_KEY, ctx)
  app.provide(GLOBAL_OPTIONS_KEY, opts ?? {})
  return ctx
}
