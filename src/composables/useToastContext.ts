import { inject, type App } from 'vue'
import { ToastQueue } from '../core/ToastQueue'
import { ToastBuffer, isServer, globalBuffer } from '../core/ToastBuffer'
import {
  TOAST_CONTEXT_KEY,
  GLOBAL_OPTIONS_KEY,
  type ToastOptions,
  type ToastContext,
  type GlobalToastOptions,
} from '../core/types'
import type { VNode } from 'vue'

function buildContext(queue: ToastQueue, buffer: ToastBuffer, ignoreSSR = false): ToastContext {
  return {
    queue,
    buffer,
    addToast(message: string | VNode, options: ToastOptions = {}): string {
      if (isServer) {
        const id = options.id ?? `vtk-ssr-${Date.now()}`
        if (ignoreSSR) return id
        buffer.push(message, { ...options, id })
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

/**
 * Returns the single process/page-wide fallback context, creating it on first
 * use. Intended for the bare `toast` singleton and for `useToast()` when no
 * plugin has been installed (no component tree to inject from) — genuinely
 * shared state is the point there. Backed by the shared `globalBuffer`.
 *
 * NOT used by `installContext()` (see below) — a real `app.use(VueToastPlugin)`
 * always gets its own isolated context instead, so this singleton is never
 * reused across separate app instances / SSR requests.
 */
export function getOrCreateGlobalContext(opts?: GlobalToastOptions): ToastContext {
  if (!globalContext) {
    globalContext = buildContext(buildQueue(opts), globalBuffer, opts?.ignoreSSR)
  }
  return globalContext
}

/**
 * Creates a brand-new, fully isolated context (its own ToastQueue and its own
 * ToastBuffer) — never cached or shared with any other call.
 */
export function createToastContext(opts?: GlobalToastOptions): ToastContext {
  return buildContext(buildQueue(opts), new ToastBuffer(), opts?.ignoreSSR)
}

export function useToastContext(): ToastContext {
  const injected = inject<ToastContext>(TOAST_CONTEXT_KEY, null as unknown as ToastContext)
  if (injected) return injected
  return getOrCreateGlobalContext()
}

export function installContext(app: App, opts?: GlobalToastOptions): ToastContext {
  // Always a fresh, isolated context — never the shared global singleton.
  // Critical for SSR (one Node process handles many requests, each doing its
  // own app.use(VueToastPlugin, ...)) and for multi-instance apps in general;
  // reusing getOrCreateGlobalContext() here would silently merge every app
  // instance's toasts (and ignore every install() call's options after the
  // first) into one shared queue/buffer.
  const ctx = createToastContext(opts)
  app.provide(TOAST_CONTEXT_KEY, ctx)
  app.provide(GLOBAL_OPTIONS_KEY, opts ?? {})
  return ctx
}
