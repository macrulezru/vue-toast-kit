<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Teleport, TransitionGroup } from 'vue'
import Toast from './Toast.vue'
import { useToastContext } from '../composables/useToastContext'
import { globalBuffer } from '../core/ToastBuffer'
import { PRIORITY_ORDER } from '../core/types'
import type { ToastContext, ToastPosition, ToastDesignTokens, ToastItem } from '../core/types'

const ALL_POSITIONS: ToastPosition[] = [
  'top-left', 'top-center', 'top-right',
  'bottom-left', 'bottom-center', 'bottom-right',
]

const props = withDefaults(defineProps<{
  position?: ToastPosition
  maxVisible?: number
  gap?: number
  offsetX?: number
  offsetY?: number
  zIndex?: number
  expand?: boolean
  teleportTo?: string
  context?: ToastContext
  theme?: 'light' | 'dark' | 'system' | ToastDesignTokens
  stackMode?: boolean
}>(), {
  position: 'bottom-right',
  maxVisible: 5,
  gap: 8,
  offsetX: 16,
  offsetY: 16,
  zIndex: 9999,
  expand: false,
  teleportTo: 'body',
  stackMode: false,
})

// Resolve context once during setup — inject() must not be called inside computed()
const ctx = props.context ?? useToastContext()
const queue = ctx.queue

// Sync maxVisible with the queue
watch(() => props.maxVisible, (n) => queue.setMaxVisible(n), { immediate: true })

const isHovered = ref(false)

// Все видимые тосты
const allToasts = computed(() => queue.active.filter(t => !queue.isHidden(t.id)))

// Тосты по позиции: тост без position попадает в props.position.
// В stack mode порядок вставки сохраняется — приоритетная сортировка
// ломает последовательность стопки, поэтому отключена.
function toastsForPosition(pos: ToastPosition): ToastItem[] {
  const filtered = allToasts.value
    .filter(t => (t.options.position ?? props.position) === pos)
  if (props.stackMode) return filtered
  return filtered.sort((a, b) => PRIORITY_ORDER[b.options.priority] - PRIORITY_ORDER[a.options.priority])
}

// Stack mode: index=0 is always the front toast.
// Bottom positions use column-reverse, so index=0 renders at the viewport corner.
// Top positions use column, so index=0 also renders at the viewport corner.
function stackDepth(index: number): number {
  return index
}

// Inline style for each toast wrapper in stack mode.
// ALL depths use position:absolute so depth changes are purely transform+opacity —
// no layout jump from toggling between absolute and relative positioning.
// The CSS transition on .vtk-stack-wrap handles the smooth animation.
function stackWrapStyle(index: number, _total: number, pos: ToastPosition): Record<string, string> {
  if (!props.stackMode || isHovered.value) return {}
  const depth = stackDepth(index)

  const isBottom = pos.startsWith('bottom')
  const edgeProp = isBottom ? 'bottom' : 'top'
  const offset = depth * 8
  const scale = Math.max(0.7, 1 - depth * 0.06)

  // depth=0: front toast, no transform/opacity overrides — CSS handles it
  if (depth === 0) {
    return { [edgeProp]: '0', 'z-index': '10' }
  }

  // depth > 2: keep element at its extrapolated stack position with opacity:0.
  // This way, when it becomes depth=2 the CSS transition animates from the
  // correct "behind the stack" coordinates, not from some unrelated position.
  const visible = depth <= 2
  const opacity = visible ? Math.max(0.5, 1 - depth * 0.2) : 0

  return {
    [edgeProp]: '0',
    transform: `translateY(${isBottom ? -offset : offset}px) scale(${scale})`,
    opacity: String(opacity),
    'pointer-events': 'none',
    'z-index': visible ? String(10 - depth) : '0',
  }
}

// CSS classes for the container at a given position
function containerClass(pos: ToastPosition) {
  return [
    'vtk-container',
    `vtk-container--${pos}`,
    props.theme && typeof props.theme === 'string' ? `vtk-theme-${props.theme}` : '',
    props.stackMode ? 'vtk-container--stack' : '',
    props.stackMode && isHovered.value ? 'vtk-container--stack-expanded' : '',
  ]
}

// Inline CSS-переменные из объекта дизайн-токенов (одинаковы для всех позиций)
const containerStyle = computed(() => {
  const style: Record<string, string> = {
    '--vtk-z-index': String(props.zIndex),
    '--vtk-gap': `${props.gap}px`,
    '--vtk-container-offset-x': `${props.offsetX}px`,
    '--vtk-container-offset-y': `${props.offsetY}px`,
  }

  if (props.theme && typeof props.theme === 'object') {
    const map: Record<keyof ToastDesignTokens, string> = {
      colorBg: '--vtk-color-bg',
      colorText: '--vtk-color-text',
      colorBorder: '--vtk-color-border',
      colorSuccess: '--vtk-color-success',
      colorError: '--vtk-color-error',
      colorWarning: '--vtk-color-warning',
      colorInfo: '--vtk-color-info',
      colorLoading: '--vtk-color-loading',
      fontFamily: '--vtk-font-family',
      fontSize: '--vtk-font-size',
      fontWeight: '--vtk-font-weight',
      lineHeight: '--vtk-line-height',
      borderRadius: '--vtk-border-radius',
      borderWidth: '--vtk-border-width',
      shadow: '--vtk-shadow',
      paddingX: '--vtk-padding-x',
      paddingY: '--vtk-padding-y',
      iconSize: '--vtk-icon-size',
      progressHeight: '--vtk-progress-height',
      maxWidth: '--vtk-max-width',
      minWidth: '--vtk-min-width',
      transitionDuration: '--vtk-transition-duration',
      transitionEasing: '--vtk-transition-easing',
      zIndex: '--vtk-z-index',
    }
    for (const [key, cssVar] of Object.entries(map)) {
      const val = (props.theme as ToastDesignTokens)[key as keyof ToastDesignTokens]
      if (val) style[cssVar] = val
    }
  }

  return style
})

// Event handlers
function handleDismiss(id: string) {
  ctx.dismiss(id)
}

function handleGroupToggle(groupKey: string) {
  queue.toggleGroupExpand(groupKey)
}

function onContainerEnter() {
  isHovered.value = true
  queue.pauseAll()
}
function onContainerLeave() {
  isHovered.value = false
  queue.resumeAll()
}

// SSR buffer flush on mount
onMounted(() => {
  setTimeout(() => {
    globalBuffer.onFlush((items) => {
      for (const item of items) {
        ctx.addToast(item.message, item.options)
      }
    })
    globalBuffer.flush()
  }, 100)
})

defineSlots<{
  toast(props: { toast: ToastItem; dismiss: (id: string) => void }): void
  'toast-icon'(props: { toast: ToastItem }): void
  'toast-content'(props: { toast: ToastItem }): void
  'toast-action'(props: { toast: ToastItem }): void
  'toast-close'(props: { toast: ToastItem; dismiss: (id: string) => void }): void
  'toast-undo'(props: { toast: ToastItem; remaining: number }): void
}>()
</script>

<template>
  <Teleport :to="teleportTo">
    <!--
      Все 6 позиций рендерятся всегда — даже пустыми.
      Это гарантирует, что TransitionGroup всегда в DOM,
      и enter/leave-анимации корректно срабатывают даже для одного тоста.
    -->
    <div
      v-for="pos in ALL_POSITIONS"
      :key="pos"
      :class="containerClass(pos)"
      :style="containerStyle"
      :role="toastsForPosition(pos).length ? 'region' : undefined"
      :aria-label="toastsForPosition(pos).length ? 'Notifications' : undefined"
      @mouseenter="onContainerEnter"
      @mouseleave="onContainerLeave"
    >
      <TransitionGroup :name="props.stackMode ? 'vtk-stack' : `vtk-slide-${pos}`" tag="div" class="vtk-container__list">
        <div
          v-for="(t, i) in toastsForPosition(pos)"
          :key="t.id"
          :class="['vtk-toast-wrap', props.stackMode ? 'vtk-stack-wrap' : '']"
          :style="stackWrapStyle(i, toastsForPosition(pos).length, pos)"
        >
          <slot
            v-if="$slots.toast"
            name="toast"
            :toast="t"
            :dismiss="handleDismiss"
          />
          <Toast
            v-else
            :toast="t"
            :on-dismiss="handleDismiss"
            :on-group-toggle="handleGroupToggle"
          >
            <template v-if="$slots['toast-icon']" #toast-icon="slotProps">
              <slot name="toast-icon" v-bind="slotProps" />
            </template>
            <template v-if="$slots['toast-content']" #toast-content="slotProps">
              <slot name="toast-content" v-bind="slotProps" />
            </template>
            <template v-if="$slots['toast-action']" #toast-action="slotProps">
              <slot name="toast-action" v-bind="slotProps" />
            </template>
            <template v-if="$slots['toast-close']" #toast-close="slotProps">
              <slot name="toast-close" v-bind="slotProps" />
            </template>
            <template v-if="$slots['toast-undo']" #toast-undo="slotProps">
              <slot name="toast-undo" v-bind="slotProps" />
            </template>
          </Toast>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

