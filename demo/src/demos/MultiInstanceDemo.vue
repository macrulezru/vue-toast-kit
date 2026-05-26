<script setup lang="ts">
import { createToastContext, ToastContainer, useToast } from 'vue-toast-kit'

// Two isolated contexts
const topCtx  = createToastContext({ maxVisible: 3 })
const sideCtx = createToastContext({ maxVisible: 3 })

const topToast    = useToast(topCtx)
const sideToast   = useToast(sideCtx)
const globalToast = useToast()
</script>

<template>
  <div class="demo-section">
    <div class="demo-title">Multiple instances</div>
    <div class="demo-desc">
      createToastContext() creates an isolated queue — useful for micro-frontends,
      modal forms, or separate notification zones on the same page.
    </div>

    <div class="zones">
      <!-- Zone A -->
      <div class="zone">
        <div class="zone__label">Zone A (top-left)</div>
        <div class="btn-grid">
          <button class="btn btn--info"      @click="topToast.info('Notification in zone A')">Info A</button>
          <button class="btn btn--success"   @click="topToast.success('Success in zone A')">Success A</button>
          <button class="btn btn--secondary" @click="topToast.dismiss()">Dismiss A</button>
        </div>
      </div>

      <!-- Zone B -->
      <div class="zone">
        <div class="zone__label">Zone B (top-right)</div>
        <div class="btn-grid">
          <button class="btn btn--error"     @click="sideToast.error('Error in zone B')">Error B</button>
          <button class="btn btn--warning"   @click="sideToast.warning('Warning in zone B')">Warning B</button>
          <button class="btn btn--secondary" @click="sideToast.dismiss()">Dismiss B</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card__title">Global queue (bottom-right)</div>
      <div class="btn-grid">
        <button class="btn btn--primary"   @click="globalToast.info('Global notification')">Global toast</button>
        <button class="btn btn--secondary" @click="globalToast.dismiss()">Dismiss global</button>
      </div>
    </div>

    <!-- Isolated context containers -->
    <ToastContainer :context="topCtx"  position="top-left"  :max-visible="3" :z-index="10001" />
    <ToastContainer :context="sideCtx" position="top-right" :max-visible="3" :z-index="10001" />
  </div>
</template>

<style scoped>
.zones { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
.zone { padding: 1.25rem; background: var(--app-card-bg); border: 1px solid var(--app-border); border-radius: 12px; }
.zone__label { font-weight: 600; font-size: 0.875rem; margin-bottom: 0.75rem; color: var(--app-text-muted); }

@media (max-width: 600px) {
  .zones { grid-template-columns: 1fr; }
}
</style>
