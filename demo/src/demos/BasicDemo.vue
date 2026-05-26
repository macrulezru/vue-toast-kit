<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toast-kit'
import type { ToastPosition } from 'vue-toast-kit'

const toast = useToast()

const position = ref<ToastPosition>('bottom-right')
const duration = ref(4000)
const closable = ref(true)

const positions: ToastPosition[] = [
  'top-left', 'top-center', 'top-right',
  'bottom-left', 'bottom-center', 'bottom-right',
]

function getOpts() {
  return { position: position.value, duration: duration.value, closable: closable.value }
}
</script>

<template>
  <div class="demo-section">
    <div class="demo-title">Basic toasts</div>
    <div class="demo-desc">All toast types: info, success, error, warning, loading, custom</div>

    <div class="card">
      <div class="card__title">Settings</div>
      <div class="controls">
        <label class="control">
          <span>Position</span>
          <select v-model="position">
            <option v-for="p in positions" :key="p" :value="p">{{ p }}</option>
          </select>
        </label>
        <label class="control">
          <span>Duration (ms)</span>
          <input type="number" v-model.number="duration" min="0" max="10000" step="500" />
        </label>
        <label class="control control--checkbox">
          <input type="checkbox" v-model="closable" />
          <span>Closable</span>
        </label>
      </div>
    </div>

    <div class="card">
      <div class="card__title">Types</div>
      <div class="btn-grid">
        <button class="btn btn--info"    @click="toast.info('This is an informational message', getOpts())">Info</button>
        <button class="btn btn--success" @click="toast.success('Operation completed successfully!', getOpts())">Success</button>
        <button class="btn btn--error"   @click="toast.error('Something went wrong!', getOpts())">Error</button>
        <button class="btn btn--warning" @click="toast.warning('Warning: please check your input', getOpts())">Warning</button>
        <button class="btn btn--loading" @click="toast.loading('Loading data…', { position: position })">Loading</button>
      </div>
    </div>

    <div class="card">
      <div class="card__title">Priorities</div>
      <div class="btn-grid">
        <button class="btn btn--ghost"   @click="toast.info('Low priority',      { ...getOpts(), priority: 'low' })">Low</button>
        <button class="btn btn--ghost"   @click="toast.info('Normal priority',   { ...getOpts(), priority: 'normal' })">Normal</button>
        <button class="btn btn--warning" @click="toast.warning('High priority',  { ...getOpts(), priority: 'high' })">High</button>
        <button class="btn btn--error"   @click="toast.error('Critical!',        { ...getOpts(), priority: 'critical' })">Critical</button>
      </div>
    </div>

    <div class="card">
      <div class="card__title">With action button</div>
      <div class="btn-grid">
        <button class="btn btn--primary" @click="toast.info('New message from Alex', {
          ...getOpts(),
          action: { label: 'Open', onClick: () => toast.success('Message opened!') },
        })">With action</button>
        <button class="btn btn--primary" @click="toast.success('File attached', {
          ...getOpts(),
          action: { label: 'Download', onClick: () => toast.info('Download started…') },
          icon: '📎',
        })">Emoji icon</button>
        <button class="btn btn--ghost" @click="toast.info('No icon', { ...getOpts(), icon: false })">No icon</button>
      </div>
    </div>

    <div class="card">
      <div class="card__title">Controls</div>
      <div class="btn-grid">
        <button class="btn btn--secondary" @click="toast.dismiss()">Dismiss all</button>
        <button class="btn btn--ghost" @click="toast.success('Sticky toast', { ...getOpts(), duration: 0, closable: true })">Sticky (no timer)</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.controls { display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end; }
.control { display: flex; flex-direction: column; gap: 0.375rem; font-size: 0.8125rem; color: var(--app-text-muted); }
.control--checkbox { flex-direction: row; align-items: center; gap: 0.5rem; }
.control select,
.control input[type="number"] {
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--app-border-control);
  border-radius: 6px;
  font-size: 0.875rem;
  background: var(--app-card-bg);
  color: var(--app-text);
  font-family: inherit;
}
</style>
