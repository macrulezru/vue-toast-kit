<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { ToastItem } from '../core/types'
import ToastIcon from './ToastIcon.vue'
import ToastProgressBar from './ToastProgressBar.vue'
import ToastActions from './ToastActions.vue'

const props = defineProps<{
  toast: ToastItem
  onDismiss: (id: string) => void
  onGroupToggle?: (groupKey: string) => void
}>()

const el = ref<HTMLElement | null>(null)

// Focus return: restore focus to the element that was active before this toast appeared
let focusReturnTarget: HTMLElement | null = null

onMounted(() => {
  focusReturnTarget = document.activeElement as HTMLElement | null
})

function dismissWithFocusReturn(id: string) {
  props.onDismiss(id)
  if (focusReturnTarget && typeof focusReturnTarget.focus === 'function') {
    focusReturnTarget.focus()
  }
}

// Swipe-to-dismiss
const swipeX = ref(0)
const isSwiping = ref(false)
let touchStartX = 0

function onTouchStart(e: TouchEvent) {
  if (!props.toast.options.swipeToDismiss) return
  touchStartX = e.touches[0].clientX
  isSwiping.value = true
}

function onTouchMove(e: TouchEvent) {
  if (!isSwiping.value) return
  swipeX.value = e.touches[0].clientX - touchStartX
}

function onTouchEnd() {
  if (!isSwiping.value) return
  isSwiping.value = false
  const threshold = (el.value?.offsetWidth ?? 280) * 0.4
  if (Math.abs(swipeX.value) > threshold) {
    props.onDismiss(props.toast.id)
  } else {
    swipeX.value = 0
  }
}

// Hover pause
function onMouseEnter() {
  if (props.toast.options.pauseOnHover) props.toast.pause()
}
function onMouseLeave() {
  if (props.toast.options.pauseOnHover) props.toast.resume()
}

// Focus loss pause
function onVisibilityChange() {
  if (!props.toast.options.pauseOnFocusLoss) return
  if (document.hidden) {
    props.toast.pause()
  } else {
    props.toast.resume()
  }
}

onMounted(() => {
  document.addEventListener('visibilitychange', onVisibilityChange)
})
onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisibilityChange)
})

// ARIA
const role = computed(() => {
  const t = props.toast.options.type
  return t === 'error' || t === 'warning' || props.toast.options.priority === 'critical'
    ? 'alert'
    : 'status'
})

const ariaLive = computed(() => {
  if (props.toast.options.ariaLive) return props.toast.options.ariaLive
  return props.toast.options.priority === 'critical' ? 'assertive' : 'polite'
})

const swipeStyle = computed(() => {
  if (!swipeX.value) return {}
  const opacity = Math.max(0, 1 - Math.abs(swipeX.value) / 200)
  return {
    transform: `translateX(${swipeX.value}px)`,
    opacity,
    transition: isSwiping.value ? 'none' : undefined,
  }
})

const hasUndo = computed(() => !!props.toast.options.undo)
const hasAction = computed(() => !!props.toast.options.action)
const showClose = computed(() => props.toast.options.closable)
const showProgress = computed(() =>
  props.toast.options.duration > 0 && !props.toast.isPaused.value,
)
const isGrouped = computed(() => props.toast.groupCount.value > 1)

function handleGroupToggle() {
  if (props.toast.options.groupKey) {
    props.onGroupToggle?.(props.toast.options.groupKey)
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && showClose.value) {
    e.stopPropagation()
    dismissWithFocusReturn(props.toast.id)
  }
}
</script>

<template>
  <div
    ref="el"
    :class="[
      'vtk-toast',
      `vtk-toast--${toast.options.type}`,
      toast.options.theme && typeof toast.options.theme === 'string' ? `vtk-theme-${toast.options.theme}` : '',
    ]"
    :role="role"
    :aria-live="ariaLive"
    :aria-atomic="true"
    :tabindex="showClose || hasAction || hasUndo ? 0 : undefined"
    :style="swipeStyle"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @touchstart.passive="onTouchStart"
    @touchmove.passive="onTouchMove"
    @touchend="onTouchEnd"
    @keydown="onKeydown"
  >
    <!-- Rich content: full replacement via component -->
    <component
      v-if="toast.options.component"
      :is="toast.options.component"
      v-bind="toast.options.componentProps"
      :toast="toast"
      :dismiss="() => onDismiss(toast.id)"
    />

    <template v-else>
      <!-- Icon slot -->
      <slot name="toast-icon" :toast="toast">
        <ToastIcon
          v-if="toast.options.icon !== false"
          :type="toast.options.type"
          :icon="toast.options.icon"
        />
      </slot>

      <!-- Content slot -->
      <slot name="toast-content" :toast="toast">
        <div class="vtk-content">
          <div class="vtk-message">
            <component :is="'span'" v-if="typeof toast.message !== 'string'">
              <component :is="toast.message" />
            </component>
            <template v-else>{{ toast.message }}</template>
          </div>

          <!-- Action slot -->
          <slot name="toast-action" :toast="toast">
            <ToastActions
              v-if="hasAction || hasUndo"
              :toast="toast"
              :on-dismiss="onDismiss"
            />
          </slot>
        </div>
      </slot>

      <!-- Group counter -->
      <span
        v-if="isGrouped"
        class="vtk-group-count"
        role="button"
        :aria-label="`Show all (${toast.groupCount.value})`"
        @click="handleGroupToggle"
      >
        +{{ toast.groupCount.value - 1 }}
      </span>

      <!-- Close button slot -->
      <slot name="toast-close" :toast="toast" :dismiss="dismissWithFocusReturn">
        <button
          v-if="showClose"
          class="vtk-btn vtk-btn--close"
          type="button"
          aria-label="Close"
          @click="dismissWithFocusReturn(toast.id)"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M1.4 1.4a1 1 0 011.42 0L7 5.59l4.18-4.19a1 1 0 111.42 1.42L8.41 7l4.19 4.18a1 1 0 01-1.42 1.42L7 8.41l-4.18 4.19A1 1 0 011.4 12.6L5.59 7 1.4 2.82a1 1 0 010-1.42z"/>
          </svg>
        </button>
      </slot>
    </template>

    <!-- Progress bar / undo slot -->
    <slot name="toast-undo" :toast="toast" :remaining="toast.remaining.value">
      <ToastProgressBar
        v-if="showProgress || hasUndo"
        :remaining="toast.remaining.value"
      />
    </slot>
  </div>
</template>
