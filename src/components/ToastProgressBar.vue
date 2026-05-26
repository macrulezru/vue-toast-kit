<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  remaining: number  // 0–1
}>()

const scaleX = computed(() => props.remaining)
</script>

<template>
  <div class="vtk-progress" aria-hidden="true">
    <div
      class="vtk-progress__bar"
      :style="{ transform: `scaleX(${scaleX})` }"
    />
  </div>
</template>
