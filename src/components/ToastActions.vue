<script setup lang="ts">
import type { ToastItem } from '../core/types'

const props = defineProps<{
  toast: ToastItem
  onDismiss: (id: string) => void
}>()

function handleUndo() {
  props.toast.options.undo?.onUndo()
  props.onDismiss(props.toast.id)
}
</script>

<template>
  <div class="vtk-actions">
    <button
      v-if="toast.options.action"
      class="vtk-btn vtk-btn--action"
      type="button"
      @click="toast.options.action.onClick()"
    >
      {{ toast.options.action.label }}
    </button>
    <button
      v-if="toast.options.undo"
      class="vtk-btn vtk-btn--undo"
      type="button"
      @click="handleUndo"
    >
      {{ toast.options.undo.label ?? 'Undo' }}
    </button>
  </div>
</template>
