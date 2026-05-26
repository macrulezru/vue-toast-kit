import { ref, reactive, shallowReactive, type VNode } from 'vue'
import { GroupManager } from './GroupManager'
import { UndoTimer } from './UndoTimer'
import { PRIORITY_ORDER, DEFAULT_OPTIONS, type ToastItem, type ToastOptions, type ToastPosition } from './types'

let idCounter = 0
function generateId(): string {
  return `vtk-${Date.now()}-${++idCounter}`
}

const PERSIST_KEY = 'vtk-persist'

type EventListener<T extends unknown[]> = (...args: T) => void

export class ToastQueue {
  active = shallowReactive<ToastItem[]>([])
  pending = shallowReactive<ToastItem[]>([])

  private maxVisible: number
  private hiddenItems = reactive(new Set<string>())
  private timers = new Map<string, UndoTimer>()
  private groupManager: GroupManager

  private rateLimit: number
  private rateLimitWindowMs: number
  private recentAddTimes: number[] = []

  private persistStorage: boolean

  private addListeners = new Set<EventListener<[ToastItem]>>()
  private dismissListeners = new Set<EventListener<[string]>>()
  private updateListeners = new Set<EventListener<[string, Partial<ToastOptions>]>>()

  constructor(maxVisible = 5, options: { rateLimit?: number; rateLimitWindowMs?: number; persistStorage?: boolean } = {}) {
    this.maxVisible = maxVisible
    this.rateLimit = options.rateLimit ?? 0
    this.rateLimitWindowMs = options.rateLimitWindowMs ?? 1000
    this.persistStorage = options.persistStorage ?? false

    this.groupManager = new GroupManager(
      (ids) => [...this.active, ...this.pending].filter(t => ids.includes(t.id)),
      (id) => this.hiddenItems.add(id),
      (id) => this.hiddenItems.delete(id),
    )

    if (this.persistStorage) {
      this.restoreFromStorage()
    }
  }

  /** Subscribe to toast add events. Returns an unsubscribe function. */
  onAdd(fn: EventListener<[ToastItem]>): () => void {
    this.addListeners.add(fn)
    return () => this.addListeners.delete(fn)
  }

  /** Subscribe to toast dismiss events. Returns an unsubscribe function. */
  onDismiss(fn: EventListener<[string]>): () => void {
    this.dismissListeners.add(fn)
    return () => this.dismissListeners.delete(fn)
  }

  /** Subscribe to toast update events. Returns an unsubscribe function. */
  onUpdate(fn: EventListener<[string, Partial<ToastOptions>]>): () => void {
    this.updateListeners.add(fn)
    return () => this.updateListeners.delete(fn)
  }

  private emit<T extends unknown[]>(set: Set<EventListener<T>>, ...args: T): void {
    set.forEach(fn => fn(...args))
  }

  private isRateLimited(): boolean {
    if (!this.rateLimit) return false
    const now = Date.now()
    this.recentAddTimes = this.recentAddTimes.filter(t => now - t < this.rateLimitWindowMs)
    if (this.recentAddTimes.length >= this.rateLimit) return true
    this.recentAddTimes.push(now)
    return false
  }

  private restoreFromStorage(): void {
    if (typeof localStorage === 'undefined') return
    try {
      const raw = localStorage.getItem(PERSIST_KEY)
      if (!raw) return
      const items: Array<{ id: string; message: string; options: ToastOptions }> = JSON.parse(raw)
      for (const item of items) {
        this.add(item.message, { ...item.options, id: item.id })
      }
    } catch {
      localStorage.removeItem(PERSIST_KEY)
    }
  }

  private saveToStorage(item: ToastItem): void {
    if (typeof localStorage === 'undefined') return
    try {
      const raw = localStorage.getItem(PERSIST_KEY)
      const items: Array<{ id: string; message: string; options: ToastOptions }> = raw ? JSON.parse(raw) : []
      if (!items.find(i => i.id === item.id)) {
        items.push({ id: item.id, message: item.message as string, options: item.options })
        localStorage.setItem(PERSIST_KEY, JSON.stringify(items))
      }
    } catch { /* noop */ }
  }

  private removeFromStorage(id: string): void {
    if (typeof localStorage === 'undefined') return
    try {
      const raw = localStorage.getItem(PERSIST_KEY)
      if (!raw) return
      const items: Array<{ id: string }> = JSON.parse(raw)
      const filtered = items.filter(i => i.id !== id)
      if (filtered.length) {
        localStorage.setItem(PERSIST_KEY, JSON.stringify(filtered))
      } else {
        localStorage.removeItem(PERSIST_KEY)
      }
    } catch { /* noop */ }
  }

  get visibleActive(): ToastItem[] {
    return this.active.filter(t => !this.hiddenItems.has(t.id))
  }

  isHidden(id: string): boolean {
    return this.hiddenItems.has(id)
  }

  add(message: string | VNode, options: ToastOptions = {}): string {
    if (this.isRateLimited()) return ''

    const id = options.id ?? generateId()

    const existing = this.active.find(t => t.id === id)
    if (existing) {
      this.mergeOptions(existing, options)
      return id
    }

    const item = this.createItem(id, message, options)

    if (this.visibleActive.length < this.maxVisible) {
      this.active.push(item)
      this.startTimer(item)
      if (options.groupKey) this.groupManager.add(id, options.groupKey)
      if (this.persistStorage && item.options.persist) this.saveToStorage(item)
      this.emit(this.addListeners, item)
      return id
    }

    const priority = options.priority ?? 'normal'
    if (PRIORITY_ORDER[priority] > PRIORITY_ORDER['normal']) {
      const lowestIdx = this.findLowestPriorityIndex()
      if (lowestIdx !== -1) {
        const evicted = this.active[lowestIdx]
        if (PRIORITY_ORDER[priority] > PRIORITY_ORDER[evicted.options.priority]) {
          this.stopTimer(evicted.id)
          this.active.splice(lowestIdx, 1)
          this.pending.unshift(evicted)
          this.active.push(item)
          this.startTimer(item)
          if (options.groupKey) this.groupManager.add(id, options.groupKey)
          if (this.persistStorage && item.options.persist) this.saveToStorage(item)
          this.emit(this.addListeners, item)
          return id
        }
      }
    }

    this.pending.push(item)
    this.sortPending()
    if (options.groupKey) this.groupManager.add(id, options.groupKey)
    if (this.persistStorage && item.options.persist) this.saveToStorage(item)
    this.emit(this.addListeners, item)
    return id
  }

  remove(id: string): void {
    this.stopTimer(id)

    const activeIdx = this.active.findIndex(t => t.id === id)
    if (activeIdx !== -1) {
      const item = this.active[activeIdx]
      this.active.splice(activeIdx, 1)
      this.hiddenItems.delete(id)

      if (item.options.groupKey) this.groupManager.remove(id, item.options.groupKey)
      if (this.persistStorage) this.removeFromStorage(id)

      if (this.pending.length > 0) {
        const next = this.pending.shift()!
        this.active.push(next)
        this.startTimer(next)
      }
      return
    }

    const pendingIdx = this.pending.findIndex(t => t.id === id)
    if (pendingIdx !== -1) {
      const item = this.pending[pendingIdx]
      this.pending.splice(pendingIdx, 1)
      this.hiddenItems.delete(id)
      if (item.options.groupKey) this.groupManager.remove(id, item.options.groupKey)
      if (this.persistStorage) this.removeFromStorage(id)
    }
  }

  update(id: string, partial: Partial<ToastOptions>): void {
    const item = [...this.active, ...this.pending].find(t => t.id === id)
    if (!item) return
    this.mergeOptions(item, partial)
    this.emit(this.updateListeners, id, partial)
  }

  dismiss(id?: string): void {
    if (id === undefined) {
      const ids = [...this.active, ...this.pending].map(t => t.id)
      ids.forEach(i => this.remove(i))
      return
    }
    const item = [...this.active, ...this.pending].find(t => t.id === id)
    if (item) {
      item.options.onClose?.()
      this.remove(id)
      this.emit(this.dismissListeners, id)
    }
  }

  dismissAll(position?: ToastPosition): void {
    const targets = [...this.active, ...this.pending].filter(
      t => !position || t.options.position === position,
    )
    targets.forEach(t => {
      t.options.onClose?.()
      this.remove(t.id)
      this.emit(this.dismissListeners, t.id)
    })
  }

  isActive(id: string): boolean {
    return this.active.some(t => t.id === id)
  }

  pauseAll(): void {
    this.active.forEach(t => t.pause())
  }

  resumeAll(): void {
    this.active.forEach(t => t.resume())
  }

  setMaxVisible(n: number): void {
    this.maxVisible = n
    while (this.visibleActive.length < n && this.pending.length > 0) {
      const next = this.pending.shift()!
      this.active.push(next)
      this.startTimer(next)
    }
  }

  toggleGroupExpand(groupKey: string): void {
    this.groupManager.toggleExpand(groupKey)
  }

  isGroupExpanded(groupKey: string): boolean {
    return this.groupManager.isExpanded(groupKey)
  }

  destroy(): void {
    this.timers.forEach(t => t.destroy())
    this.timers.clear()
    this.groupManager.clear()
    this.active.splice(0)
    this.pending.splice(0)
    this.hiddenItems.clear()
    this.addListeners.clear()
    this.dismissListeners.clear()
    this.updateListeners.clear()
  }

  private createItem(id: string, message: string | VNode, options: ToastOptions): ToastItem {
    const remaining = ref(1)
    const isPaused = ref(false)
    const groupCount = ref(1)
    const isGrouped = ref(false)

    const mergedOptions = {
      ...DEFAULT_OPTIONS,
      ...options,
      type: options.type ?? 'info',
      priority: options.priority ?? 'normal',
      duration: options.duration ?? 4000,
      closable: options.closable ?? true,
      pauseOnHover: options.pauseOnHover ?? true,
      pauseOnFocusLoss: options.pauseOnFocusLoss ?? true,
      swipeToDismiss: options.swipeToDismiss ?? true,
      persist: options.persist ?? false,
    }

    const item: ToastItem = {
      id,
      message,
      options: mergedOptions as ToastItem['options'],
      createdAt: Date.now(),
      remaining,
      isPaused,
      groupCount,
      isGrouped,
      pause: () => {
        isPaused.value = true
        this.timers.get(id)?.pause()
      },
      resume: () => {
        isPaused.value = false
        this.timers.get(id)?.resume()
      },
      dismiss: () => this.dismiss(id),
      update: (opts) => this.update(id, opts),
    }

    return item
  }

  private startTimer(item: ToastItem): void {
    const duration = item.options.undo?.duration ?? item.options.duration
    if (!duration) return

    const timer = new UndoTimer(
      duration,
      () => {
        item.options.onAutoClose?.()
        this.remove(item.id)
      },
      (r) => {
        item.remaining.value = r
      },
    )
    this.timers.set(item.id, timer)
    timer.start()
  }

  private stopTimer(id: string): void {
    this.timers.get(id)?.destroy()
    this.timers.delete(id)
  }

  private mergeOptions(item: ToastItem, partial: Partial<ToastOptions>): void {
    Object.assign(item.options, partial)
    if ('message' in partial) {
      item.message = (partial as Record<string, unknown>).message as string | VNode
    }
  }

  private findLowestPriorityIndex(): number {
    let lowestIdx = -1
    let lowestPriority = 999
    this.active.forEach((t, i) => {
      const p = PRIORITY_ORDER[t.options.priority]
      if (p < lowestPriority) {
        lowestPriority = p
        lowestIdx = i
      }
    })
    return lowestIdx
  }

  private sortPending(): void {
    this.pending.sort((a, b) => {
      const pa = PRIORITY_ORDER[a.options.priority]
      const pb = PRIORITY_ORDER[b.options.priority]
      if (pb !== pa) return pb - pa
      return a.createdAt - b.createdAt
    })
  }
}
