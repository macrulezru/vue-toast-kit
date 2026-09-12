import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createToastContext } from '../src/composables/useToastContext'

describe('createToastContext', () => {
  it('creates isolated queues — toast in one does not appear in another', () => {
    const ctx1 = createToastContext()
    const ctx2 = createToastContext()
    ctx1.addToast('hello', {})
    expect(ctx1.queue.active).toHaveLength(1)
    expect(ctx2.queue.active).toHaveLength(0)
  })

  it('addToast returns a vtk- prefixed id', () => {
    const ctx = createToastContext()
    const id = ctx.addToast('Test', {})
    expect(id).toMatch(/^vtk-/)
  })

  it('addToast uses provided id when given', () => {
    const ctx = createToastContext()
    const id = ctx.addToast('Test', { id: 'my-id' })
    expect(id).toBe('my-id')
  })

  it('dismiss(id) removes a specific toast', () => {
    const ctx = createToastContext()
    const id = ctx.addToast('Test', {})
    ctx.dismiss(id)
    expect(ctx.queue.active).toHaveLength(0)
  })

  it('dismiss() without id removes all toasts', () => {
    const ctx = createToastContext()
    ctx.addToast('A', {})
    ctx.addToast('B', {})
    ctx.dismiss()
    expect(ctx.queue.active).toHaveLength(0)
  })

  it('update() merges options into existing toast', () => {
    const ctx = createToastContext()
    const id = ctx.addToast('Test', { type: 'info' })
    ctx.update(id, { type: 'success' })
    expect(ctx.queue.active[0].options.type).toBe('success')
  })

  it('isActive() returns true while toast is in queue', () => {
    const ctx = createToastContext()
    const id = ctx.addToast('Test', {})
    expect(ctx.isActive(id)).toBe(true)
  })

  it('isActive() returns false after dismiss', () => {
    const ctx = createToastContext()
    const id = ctx.addToast('Test', {})
    ctx.dismiss(id)
    expect(ctx.isActive(id)).toBe(false)
  })

  it('respects maxVisible option', () => {
    const ctx = createToastContext({ maxVisible: 2 })
    ctx.addToast('A', {})
    ctx.addToast('B', {})
    ctx.addToast('C', {})
    expect(ctx.queue.active).toHaveLength(2)
    expect(ctx.queue.pending).toHaveLength(1)
  })

  it('respects rateLimit option', () => {
    const ctx = createToastContext({ rateLimit: 2, rateLimitWindowMs: 5000 })
    const id1 = ctx.addToast('A', {})
    const id2 = ctx.addToast('B', {})
    const id3 = ctx.addToast('C', {})
    expect(id1).toMatch(/^vtk-/)
    expect(id2).toMatch(/^vtk-/)
    expect(id3).toBe('')
    expect(ctx.queue.active).toHaveLength(2)
  })

  // Regression: these GlobalToastOptions fields used to be accepted by the type but
  // silently ignored — createToastContext()/getOrCreateGlobalContext() now thread them
  // into the underlying ToastQueue's per-toast defaults.
  describe('global per-toast defaults (regression: were previously dead options)', () => {
    it('applies a custom default duration to toasts that do not set their own', () => {
      const ctx = createToastContext({ duration: 9000 })
      const id = ctx.addToast('Test', {})
      const item = ctx.queue.active.find(t => t.id === id)!
      expect(item.options.duration).toBe(9000)
    })

    it('a per-toast duration still overrides the global default', () => {
      const ctx = createToastContext({ duration: 9000 })
      const id = ctx.addToast('Test', { duration: 1000 })
      const item = ctx.queue.active.find(t => t.id === id)!
      expect(item.options.duration).toBe(1000)
    })

    it('applies default closable/pauseOnHover/pauseOnFocusLoss', () => {
      const ctx = createToastContext({
        closable: false,
        pauseOnHover: false,
        pauseOnFocusLoss: false,
      })
      const id = ctx.addToast('Test', {})
      const item = ctx.queue.active.find(t => t.id === id)!
      expect(item.options.closable).toBe(false)
      expect(item.options.pauseOnHover).toBe(false)
      expect(item.options.pauseOnFocusLoss).toBe(false)
    })
  })
})

describe('installContext SSR handling', () => {
  const originalWindow = globalThis.window

  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.stubGlobal('window', originalWindow)
    vi.resetModules()
  })

  it('ignoreSSR:true discards server-side toasts instead of buffering them', async () => {
    vi.stubGlobal('window', undefined)
    const { createToastContext: createCtxServer } = await import('../src/composables/useToastContext')

    const ctx = createCtxServer({ ignoreSSR: true })
    ctx.addToast('Server toast', {})

    expect(ctx.buffer.size).toBe(0)
  })

  it('without ignoreSSR, server-side toasts are still buffered (existing behavior)', async () => {
    vi.stubGlobal('window', undefined)
    const { createToastContext: createCtxServer } = await import('../src/composables/useToastContext')

    const ctx = createCtxServer({})
    ctx.addToast('Server toast', {})

    expect(ctx.buffer.size).toBe(1)
  })

  it('createToastContext() gives every call its own isolated queue and buffer', async () => {
    vi.stubGlobal('window', undefined)
    const { createToastContext: createCtxServer } = await import('../src/composables/useToastContext')

    const ctxA = createCtxServer({})
    const ctxB = createCtxServer({})

    expect(ctxA).not.toBe(ctxB)
    expect(ctxA.queue).not.toBe(ctxB.queue)
    expect(ctxA.buffer).not.toBe(ctxB.buffer)

    ctxA.addToast('A-only', {})
    expect(ctxA.buffer.size).toBe(1)
    expect(ctxB.buffer.size).toBe(0)
  })
})

describe('installContext isolation', () => {
  it('two separate app.use(VueToastPlugin, {...}) installs never share a queue', async () => {
    const { createApp } = await import('vue')
    const { VueToastPlugin } = await import('../src/plugin')
    const { useToastContext } = await import('../src/composables/useToastContext')

    const app1 = createApp({ template: '<div/>' })
    app1.use(VueToastPlugin, { maxVisible: 2 })
    let ctx1: ReturnType<typeof useToastContext> | undefined
    app1.runWithContext(() => { ctx1 = useToastContext() })

    const app2 = createApp({ template: '<div/>' })
    app2.use(VueToastPlugin, { maxVisible: 99 })
    let ctx2: ReturnType<typeof useToastContext> | undefined
    app2.runWithContext(() => { ctx2 = useToastContext() })

    expect(ctx1).not.toBe(ctx2)
    expect(ctx1!.queue).not.toBe(ctx2!.queue)

    ctx2!.addToast('app2-only', { id: 'app2-toast' })
    expect(ctx1!.queue.active.some(t => t.id === 'app2-toast')).toBe(false)
    expect(ctx2!.queue.active.some(t => t.id === 'app2-toast')).toBe(true)
  })
})
