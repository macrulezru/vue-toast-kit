import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { GroupManager } from '../src/core/GroupManager'
import type { ToastItem } from '../src/core/types'

function makeItem(id: string): ToastItem {
  return {
    id,
    message: id,
    options: { type: 'info', priority: 'normal', duration: 4000, closable: true, pauseOnHover: true, pauseOnFocusLoss: true, swipeToDismiss: true, persist: false },
    createdAt: Date.now(),
    remaining: ref(1),
    isPaused: ref(false),
    groupCount: ref(1),
    isGrouped: ref(false),
    pause: vi.fn(),
    resume: vi.fn(),
    dismiss: vi.fn(),
    update: vi.fn(),
  } as ToastItem
}

describe('GroupManager', () => {
  function setup() {
    const items: ToastItem[] = []
    const hidden = new Set<string>()

    const manager = new GroupManager(
      (ids) => items.filter(t => ids.includes(t.id)),
      (id) => hidden.add(id),
      (id) => hidden.delete(id),
    )

    return { manager, items, hidden }
  }

  it('first item in group is not hidden', () => {
    const { manager, items, hidden } = setup()
    const a = makeItem('a')
    items.push(a)
    manager.add('a', 'grp')
    expect(hidden.has('a')).toBe(false)
  })

  it('second item in group is hidden and leader count increases', () => {
    const { manager, items, hidden } = setup()
    const a = makeItem('a')
    const b = makeItem('b')
    items.push(a, b)
    manager.add('a', 'grp')
    manager.add('b', 'grp')
    expect(a.groupCount.value).toBe(2)
    expect(hidden.has('b')).toBe(true)
  })

  it('removing leader promotes next item', () => {
    const { manager, items, hidden } = setup()
    const a = makeItem('a')
    const b = makeItem('b')
    items.push(a, b)
    manager.add('a', 'grp')
    manager.add('b', 'grp')
    manager.remove('a', 'grp')
    expect(hidden.has('b')).toBe(false)
    expect(b.groupCount.value).toBe(1)
  })

  it('toggleExpand shows all items', () => {
    const { manager, items, hidden } = setup()
    const a = makeItem('a'); const b = makeItem('b'); const c = makeItem('c')
    items.push(a, b, c)
    manager.add('a', 'grp'); manager.add('b', 'grp'); manager.add('c', 'grp')
    manager.toggleExpand('grp')
    expect(hidden.has('b')).toBe(false)
    expect(hidden.has('c')).toBe(false)
    expect(manager.isExpanded('grp')).toBe(true)
  })

  it('toggleExpand twice collapses back', () => {
    const { manager, items, hidden } = setup()
    const a = makeItem('a'); const b = makeItem('b')
    items.push(a, b)
    manager.add('a', 'grp'); manager.add('b', 'grp')
    manager.toggleExpand('grp')
    manager.toggleExpand('grp')
    expect(hidden.has('b')).toBe(true)
    expect(manager.isExpanded('grp')).toBe(false)
  })

  it('clear removes all groups', () => {
    const { manager, items } = setup()
    const a = makeItem('a')
    items.push(a)
    manager.add('a', 'grp')
    manager.clear()
    expect(manager.hasGroup('grp')).toBe(false)
  })
})
