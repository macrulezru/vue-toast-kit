import { describe, it, expect } from 'vitest'
import { createToastContext } from '../src/composables/useToastContext'
import { useToastState } from '../src/composables/useToastState'

describe('useToastState', () => {
  it('active reflects toasts in the queue', () => {
    const ctx = createToastContext()
    const state = useToastState(ctx)
    ctx.addToast('A', {})
    ctx.addToast('B', {})
    expect(state.active.value).toHaveLength(2)
  })

  it('pending reflects toasts waiting for a slot', () => {
    const ctx = createToastContext({ maxVisible: 1 })
    const state = useToastState(ctx)
    ctx.addToast('A', {})
    ctx.addToast('B', {})
    expect(state.active.value).toHaveLength(1)
    expect(state.pending.value).toHaveLength(1)
  })

  it('count equals active.length', () => {
    const ctx = createToastContext()
    const state = useToastState(ctx)
    ctx.addToast('A', {})
    ctx.addToast('B', {})
    ctx.addToast('C', {})
    expect(state.count.value).toBe(3)
  })

  it('has() returns true for an active toast', () => {
    const ctx = createToastContext()
    const state = useToastState(ctx)
    const id = ctx.addToast('A', {})
    expect(state.has(id)).toBe(true)
  })

  it('has() returns false for unknown id', () => {
    const ctx = createToastContext()
    const state = useToastState(ctx)
    expect(state.has('nonexistent')).toBe(false)
  })

  it('active updates reactively after dismiss', () => {
    const ctx = createToastContext()
    const state = useToastState(ctx)
    const id = ctx.addToast('A', {})
    expect(state.count.value).toBe(1)
    ctx.dismiss(id)
    expect(state.count.value).toBe(0)
  })

  it('pending decreases when active slot opens up', () => {
    const ctx = createToastContext({ maxVisible: 1 })
    const state = useToastState(ctx)
    const id = ctx.addToast('A', {})
    ctx.addToast('B', {})
    expect(state.pending.value).toHaveLength(1)
    ctx.dismiss(id)
    expect(state.active.value).toHaveLength(1)
    expect(state.pending.value).toHaveLength(0)
    expect(state.active.value[0].message).toBe('B')
  })

  it('active excludes hidden grouped toasts', () => {
    const ctx = createToastContext()
    const state = useToastState(ctx)
    ctx.addToast('Leader', { groupKey: 'g' })
    ctx.addToast('Hidden', { groupKey: 'g' })
    // Second toast is hidden by group manager
    expect(state.active.value).toHaveLength(1)
    expect(state.active.value[0].message).toBe('Leader')
  })
})
