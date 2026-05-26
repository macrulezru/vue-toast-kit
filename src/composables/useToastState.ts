import { computed } from 'vue'
import { useToastContext } from './useToastContext'
import type { ToastContext, ToastItem } from '../core/types'

export function useToastState(context?: ToastContext) {
  const ctx = context ?? useToastContext()
  const queue = ctx.queue

  const active = computed<ToastItem[]>(() => queue.active.filter(t => !queue.isHidden(t.id)))
  const pending = computed<ToastItem[]>(() => [...queue.pending])
  const count = computed(() => active.value.length)

  function has(id: string): boolean {
    return ctx.isActive(id)
  }

  return { active, pending, count, has }
}
