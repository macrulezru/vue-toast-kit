import { describe, it, expect } from 'vitest'
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
})
