import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createToastContext } from '../src/composables/useToastContext'
import { useToast } from '../src/composables/useToast'

describe('useToast', () => {
  let ctx: ReturnType<typeof createToastContext>
  let toast: ReturnType<typeof useToast>

  beforeEach(() => {
    vi.useFakeTimers()
    ctx = createToastContext()
    toast = useToast(ctx)
  })

  afterEach(() => {
    ctx.queue.destroy()
    vi.useRealTimers()
  })

  // ── basic types ───────────────────────────────────────────────────────────

  it('toast() adds an info toast and returns id', () => {
    const id = toast('Hello')
    expect(id).toMatch(/^vtk-/)
    expect(ctx.queue.active[0].message).toBe('Hello')
    expect(ctx.queue.active[0].options.type).toBe('info')
  })

  it('toast.success() sets type to success', () => {
    toast.success('Done')
    expect(ctx.queue.active[0].options.type).toBe('success')
  })

  it('toast.error() sets type error and priority high', () => {
    toast.error('Fail')
    expect(ctx.queue.active[0].options.type).toBe('error')
    expect(ctx.queue.active[0].options.priority).toBe('high')
  })

  it('toast.warning() sets type to warning', () => {
    toast.warning('Watch out')
    expect(ctx.queue.active[0].options.type).toBe('warning')
  })

  it('toast.info() sets type to info', () => {
    toast.info('FYI')
    expect(ctx.queue.active[0].options.type).toBe('info')
  })

  it('toast.loading() is sticky (duration 0) and not closable', () => {
    toast.loading('Loading…')
    const t = ctx.queue.active[0]
    expect(t.options.type).toBe('loading')
    expect(t.options.duration).toBe(0)
    expect(t.options.closable).toBe(false)
  })

  it('toast.custom() sets type custom and component prop', () => {
    const MyComp = { template: '<div/>' }
    toast.custom(MyComp as never)
    const t = ctx.queue.active[0]
    expect(t.options.type).toBe('custom')
    expect(t.options.component).toBe(MyComp)
    expect(t.options.duration).toBe(0)
  })

  // ── dismiss ───────────────────────────────────────────────────────────────

  it('toast.dismiss(id) removes a specific toast', () => {
    const id = toast('Hello')
    toast.dismiss(id)
    expect(ctx.queue.active).toHaveLength(0)
  })

  it('toast.dismiss() without id removes all toasts', () => {
    toast('A')
    toast('B')
    toast('C')
    toast.dismiss()
    expect(ctx.queue.active).toHaveLength(0)
  })

  it('toast.dismissAll() removes all toasts', () => {
    toast('A')
    toast('B')
    toast.dismissAll()
    expect(ctx.queue.active).toHaveLength(0)
  })

  // ── active / update ───────────────────────────────────────────────────────

  it('toast.isActive() is true while active, false after dismiss', () => {
    const id = toast('Hello')
    expect(toast.isActive(id)).toBe(true)
    toast.dismiss(id)
    expect(toast.isActive(id)).toBe(false)
  })

  it('toast.update() merges options into existing toast', () => {
    const id = toast('Hello')
    toast.update(id, { type: 'success' })
    expect(ctx.queue.active[0].options.type).toBe('success')
  })

  it('toast.update() with message field updates message', () => {
    const id = toast('Hello')
    toast.update(id, { message: 'Updated' })
    expect(ctx.queue.active[0].message).toBe('Updated')
  })

  it('toast.updateMessage() changes message without touching options', () => {
    const id = toast.success('Old text')
    toast.updateMessage(id, 'New text')
    expect(ctx.queue.active[0].message).toBe('New text')
    expect(ctx.queue.active[0].options.type).toBe('success')
  })

  // ── pause / resume ────────────────────────────────────────────────────────

  it('toast.pauseAll() sets isPaused on all active toasts', () => {
    toast('A')
    toast('B')
    toast.pauseAll()
    expect(ctx.queue.active[0].isPaused.value).toBe(true)
    expect(ctx.queue.active[1].isPaused.value).toBe(true)
  })

  it('toast.resumeAll() clears isPaused', () => {
    toast('A')
    toast.pauseAll()
    toast.resumeAll()
    expect(ctx.queue.active[0].isPaused.value).toBe(false)
  })

  // ── undo ──────────────────────────────────────────────────────────────────

  it('toast.undo() creates a closable:false info toast with undo option', () => {
    toast.undo('Deleted', { undo: { onUndo: vi.fn() } })
    const t = ctx.queue.active[0]
    expect(t.options.type).toBe('info')
    expect(t.options.closable).toBe(false)
    expect(t.options.undo).toBeDefined()
  })

  it('toast.undo() uses custom undo duration', () => {
    toast.undo('Deleted', { undo: { onUndo: vi.fn(), duration: 8000 } })
    expect(ctx.queue.active[0].options.duration).toBe(8000)
  })

  // ── promise ───────────────────────────────────────────────────────────────

  it('toast.promise resolves and switches toast to success', async () => {
    const p = Promise.resolve({ name: 'Alice' })
    const result = await toast.promise(p, {
      loading: 'Loading…',
      success: (u) => `Hello, ${u.name}`,
      error: 'Failed',
    })
    expect(result).toEqual({ name: 'Alice' })
    const t = ctx.queue.active[0]
    expect(t.message).toBe('Hello, Alice')
    expect(t.options.type).toBe('success')
    expect(t.options.closable).toBe(true)
  })

  it('toast.promise with static success message', async () => {
    await toast.promise(Promise.resolve(42), {
      loading: 'Working…',
      success: 'All done!',
      error: 'Oops',
    })
    expect(ctx.queue.active[0].message).toBe('All done!')
  })

  it('toast.promise rejects and switches toast to error, rethrows', async () => {
    const err = new Error('boom')
    await expect(
      toast.promise(Promise.reject(err), {
        loading: 'Loading…',
        success: 'Done',
        error: (e) => (e as Error).message,
      }),
    ).rejects.toThrow('boom')
    const t = ctx.queue.active[0]
    expect(t.message).toBe('boom')
    expect(t.options.type).toBe('error')
    expect(t.options.closable).toBe(true)
  })

  it('toast.promise with static error message', async () => {
    await expect(
      toast.promise(Promise.reject(new Error()), {
        loading: 'Loading…',
        success: 'Done',
        error: 'Something went wrong',
      }),
    ).rejects.toThrow()
    expect(ctx.queue.active[0].message).toBe('Something went wrong')
  })
})
