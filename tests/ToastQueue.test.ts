import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ToastQueue } from '../src/core/ToastQueue'

describe('ToastQueue', () => {
  let queue: ToastQueue

  beforeEach(() => {
    queue = new ToastQueue(3)
  })

  // ── add ──────────────────────────────────────────────────────────────────

  it('adds a toast to active when below maxVisible', () => {
    const id = queue.add('Hello')
    expect(queue.active).toHaveLength(1)
    expect(queue.active[0].id).toBe(id)
    expect(queue.active[0].message).toBe('Hello')
  })

  it('assigns a generated id when none provided', () => {
    const id = queue.add('Hello')
    expect(id).toMatch(/^vtk-/)
  })

  it('uses provided id', () => {
    const id = queue.add('Hello', { id: 'my-id' })
    expect(id).toBe('my-id')
  })

  it('deduplicates by id — updates existing instead of adding', () => {
    queue.add('First', { id: 'x' })
    queue.add('Second', { id: 'x', type: 'success' })
    expect(queue.active).toHaveLength(1)
    expect(queue.active[0].options.type).toBe('success')
  })

  it('moves overflow to pending', () => {
    queue.add('A')
    queue.add('B')
    queue.add('C')
    queue.add('D')
    expect(queue.active).toHaveLength(3)
    expect(queue.pending).toHaveLength(1)
    expect(queue.pending[0].message).toBe('D')
  })

  it('promotes pending to active when slot opens', () => {
    queue.add('A', { id: 'a' })
    queue.add('B')
    queue.add('C')
    queue.add('D', { id: 'd' })
    queue.remove('a')
    expect(queue.active.find(t => t.id === 'd')).toBeTruthy()
    expect(queue.pending).toHaveLength(0)
  })

  // ── priority eviction ─────────────────────────────────────────────────────

  it('evicts lowest-priority toast when high-priority toast arrives', () => {
    queue.add('Low1', { priority: 'low', id: 'l1' })
    queue.add('Low2', { priority: 'low', id: 'l2' })
    queue.add('Low3', { priority: 'low', id: 'l3' })
    queue.add('Critical', { priority: 'critical', id: 'crit' })

    const activeIds = queue.active.map(t => t.id)
    expect(activeIds).toContain('crit')
    // one of the low-priority was evicted to pending
    expect(queue.pending).toHaveLength(1)
    expect(queue.pending[0].options.priority).toBe('low')
  })

  it('does not evict if incoming priority is not higher than all active', () => {
    queue.add('High1', { priority: 'high', id: 'h1' })
    queue.add('High2', { priority: 'high', id: 'h2' })
    queue.add('High3', { priority: 'high', id: 'h3' })
    queue.add('Normal', { priority: 'normal', id: 'n1' })

    expect(queue.active.find(t => t.id === 'n1')).toBeUndefined()
    expect(queue.pending.find(t => t.id === 'n1')).toBeTruthy()
  })

  // ── pending sort ──────────────────────────────────────────────────────────

  it('sorts pending by priority descending then by createdAt ascending', () => {
    queue.add('A', { priority: 'critical' })
    queue.add('B', { priority: 'critical' })
    queue.add('C', { priority: 'critical' })
    queue.add('Low', { priority: 'low' })
    queue.add('High', { priority: 'high' })
    queue.add('Normal', { priority: 'normal' })

    const pendingPriorities = queue.pending.map(t => t.options.priority)
    expect(pendingPriorities[0]).toBe('high')
    expect(pendingPriorities[pendingPriorities.length - 1]).toBe('low')
  })

  // ── remove ───────────────────────────────────────────────────────────────

  it('removes from active', () => {
    const id = queue.add('Hello')
    queue.remove(id)
    expect(queue.active).toHaveLength(0)
  })

  it('removes from pending', () => {
    queue.add('A'); queue.add('B'); queue.add('C')
    const id = queue.add('D')
    queue.remove(id)
    expect(queue.pending).toHaveLength(0)
  })

  // ── dismiss ───────────────────────────────────────────────────────────────

  it('dismiss(id) removes a specific toast', () => {
    const id = queue.add('Hi', { id: 'test' })
    queue.dismiss(id)
    expect(queue.active.find(t => t.id === 'test')).toBeUndefined()
  })

  it('dismiss() with no args removes all', () => {
    queue.add('A'); queue.add('B'); queue.add('C'); queue.add('D')
    queue.dismiss()
    expect(queue.active).toHaveLength(0)
    expect(queue.pending).toHaveLength(0)
  })

  it('calls onClose when dismissing', () => {
    const onClose = vi.fn()
    const id = queue.add('Hi', { onClose })
    queue.dismiss(id)
    expect(onClose).toHaveBeenCalledOnce()
  })

  // ── update ────────────────────────────────────────────────────────────────

  it('update merges options onto existing toast', () => {
    const id = queue.add('Hello')
    queue.update(id, { type: 'error' })
    expect(queue.active.find(t => t.id === id)?.options.type).toBe('error')
  })

  // ── isActive ──────────────────────────────────────────────────────────────

  it('isActive returns true for active toasts', () => {
    const id = queue.add('Hi')
    expect(queue.isActive(id)).toBe(true)
  })

  it('isActive returns false after removal', () => {
    const id = queue.add('Hi')
    queue.remove(id)
    expect(queue.isActive(id)).toBe(false)
  })

  // ── rate limiting ─────────────────────────────────────────────────────────

  it('drops toasts exceeding rateLimit', () => {
    const limited = new ToastQueue(10, { rateLimit: 2, rateLimitWindowMs: 5000 })
    const id1 = limited.add('A')
    const id2 = limited.add('B')
    const id3 = limited.add('C') // should be dropped

    expect(id1).not.toBe('')
    expect(id2).not.toBe('')
    expect(id3).toBe('')
    expect(limited.active).toHaveLength(2)
  })

  // ── event emitter ─────────────────────────────────────────────────────────

  it('onAdd fires when a toast is added', () => {
    const fn = vi.fn()
    queue.onAdd(fn)
    queue.add('Hello')
    expect(fn).toHaveBeenCalledOnce()
    expect(fn.mock.calls[0][0].message).toBe('Hello')
  })

  it('onDismiss fires when a toast is dismissed', () => {
    const fn = vi.fn()
    queue.onDismiss(fn)
    const id = queue.add('Hello', { id: 'hi' })
    queue.dismiss(id)
    expect(fn).toHaveBeenCalledWith('hi')
  })

  it('onUpdate fires when a toast is updated', () => {
    const fn = vi.fn()
    queue.onUpdate(fn)
    const id = queue.add('Hello', { id: 'hi' })
    queue.update(id, { type: 'success' })
    expect(fn).toHaveBeenCalledWith('hi', { type: 'success' })
  })

  it('event listener unsubscribe works', () => {
    const fn = vi.fn()
    const off = queue.onAdd(fn)
    off()
    queue.add('Hello')
    expect(fn).not.toHaveBeenCalled()
  })

  // ── destroy ───────────────────────────────────────────────────────────────

  it('destroy clears all state', () => {
    queue.add('A'); queue.add('B'); queue.add('C'); queue.add('D')
    queue.destroy()
    expect(queue.active).toHaveLength(0)
    expect(queue.pending).toHaveLength(0)
  })

  // ── setMaxVisible ──────────────────────────────────────────────────────────

  it('setMaxVisible promotes pending toasts when limit increases', () => {
    queue.add('A'); queue.add('B'); queue.add('C')
    queue.add('D') // goes to pending
    queue.setMaxVisible(4)
    expect(queue.active).toHaveLength(4)
    expect(queue.pending).toHaveLength(0)
  })
})
