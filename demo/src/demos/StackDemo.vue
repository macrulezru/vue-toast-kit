<script setup lang="ts">
import { ref } from 'vue'
import { useToast, ToastContainer, createToastContext } from 'vue-toast-kit'
import type { ToastPosition } from 'vue-toast-kit'

const ctx = createToastContext({ maxVisible: 10 })
const toast = useToast(ctx)

const position = ref<ToastPosition>('bottom-right')

const positions: { pos: ToastPosition; label: string; icon: string }[] = [
  { pos: 'top-left',      label: 'Top Left',      icon: '↖' },
  { pos: 'top-center',    label: 'Top Center',    icon: '↑' },
  { pos: 'top-right',     label: 'Top Right',     icon: '↗' },
  { pos: 'bottom-left',   label: 'Bottom Left',   icon: '↙' },
  { pos: 'bottom-center', label: 'Bottom Center', icon: '↓' },
  { pos: 'bottom-right',  label: 'Bottom Right',  icon: '↘' },
]

function opts() {
  return { position: position.value, duration: 6000 }
}

function addBatch() {
  toast.success('File uploaded successfully', opts())
  setTimeout(() => toast.info('2 colleagues are online', opts()), 150)
  setTimeout(() => toast.warning('Storage at 90%', opts()), 300)
  setTimeout(() => toast.error('Connection lost', { ...opts(), priority: 'high' }), 450)
  setTimeout(() => toast.success('Auto-save complete', opts()), 600)
}

function addOne() {
  const types = ['success', 'info', 'warning', 'error'] as const
  const messages = ['Operation complete', 'New message received', 'Low disk space', 'Request failed']
  const i = Math.floor(Math.random() * 4)
  toast[types[i]](messages[i], { ...opts(), duration: 5000 })
}

function clearAll() {
  toast.dismiss()
}
</script>

<template>
  <div class="demo-section">
    <div class="demo-title">Stack mode</div>
    <div class="demo-desc">
      Toasts collapse into a Sonner-style stack — only 3 visible at once, the rest hide behind. Hover the stack to expand it.
    </div>

    <div class="card">
      <div class="card__title">Controls</div>
      <div class="btn-grid">
        <button class="btn btn--primary" @click="addBatch">Add 5 toasts</button>
        <button class="btn btn--secondary" @click="addOne">+ Add one</button>
        <button class="btn btn--ghost" @click="clearAll">Clear all</button>
      </div>
    </div>

    <div class="card">
      <div class="card__title">Position</div>
      <div class="pos-grid">
        <button
          v-for="p in positions"
          :key="p.pos"
          class="pos-btn"
          :class="{ 'pos-btn--active': position === p.pos }"
          @click="position = p.pos"
        >
          <span class="pos-btn__icon">{{ p.icon }}</span>
          <span class="pos-btn__label">{{ p.label }}</span>
        </button>
      </div>
    </div>

    <div class="card">
      <div class="card__title">How it works</div>
      <ul class="feature-list">
        <li>Toasts collapse into a visual stack (up to 3 layers visible)</li>
        <li>Each layer behind is scaled down and faded</li>
        <li>Hover expands the stack — all toasts spread out, timers pause</li>
        <li>Mouse leave collapses it back and resumes timers</li>
      </ul>
    </div>

    <div class="card">
      <div class="card__title">Mode comparison</div>
      <div class="mode-compare">
        <div class="mode-card mode-card--stack">
          <div class="mode-card__label">stackMode</div>
          <div class="mode-card__visual">
            <div class="mock-toast mock-toast--1">File uploaded</div>
            <div class="mock-toast mock-toast--2"></div>
            <div class="mock-toast mock-toast--3"></div>
          </div>
          <div class="mode-card__desc">Compact, saves space</div>
        </div>
        <div class="mode-card">
          <div class="mode-card__label">Default</div>
          <div class="mode-card__visual mode-card__visual--list">
            <div class="mock-toast-list">File uploaded</div>
            <div class="mock-toast-list">Colleague joined</div>
            <div class="mock-toast-list">Low disk space</div>
          </div>
          <div class="mode-card__desc">Each toast separate</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card__title">Usage</div>
      <pre class="code-block"><code>&lt;ToastContainer
  position="bottom-right"
  :stack-mode="true"
/&gt;</code></pre>
    </div>
  </div>

  <ToastContainer
    :context="ctx"
    :position="position"
    :stack-mode="true"
  />
</template>

<style scoped>
.feature-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.feature-list li {
  padding-left: 1.25rem;
  position: relative;
  font-size: 0.875rem;
  color: var(--app-text-muted);
}
.feature-list li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: var(--app-accent);
}

.mode-compare {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  max-width: 480px;
}
.mode-card {
  border: 1px solid var(--app-border);
  border-radius: 10px;
  padding: 0.75rem;
  background: var(--app-bg);
}
.mode-card--stack { border-color: var(--app-accent); }
.mode-card__label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--app-text);
  margin-bottom: 0.625rem;
}
.mode-card__visual {
  position: relative;
  height: 70px;
  margin-bottom: 0.625rem;
}
.mock-toast {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 36px;
  border-radius: 8px;
  background: var(--app-card-bg);
  border: 1px solid var(--app-border);
  display: flex;
  align-items: center;
  padding: 0 0.625rem;
  font-size: 0.6875rem;
  color: var(--app-text-muted);
}
.mock-toast--1 { z-index: 3; }
.mock-toast--2 { z-index: 2; bottom: -6px; transform: scaleX(0.94); opacity: 0.7; }
.mock-toast--3 { z-index: 1; bottom: -12px; transform: scaleX(0.88); opacity: 0.5; }

.mode-card__visual--list {
  height: 110px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: static;
}
.mock-toast-list {
  height: 32px;
  border-radius: 6px;
  background: var(--app-card-bg);
  border: 1px solid var(--app-border);
  display: flex;
  align-items: center;
  padding: 0 0.625rem;
  font-size: 0.6875rem;
  color: var(--app-text-muted);
}
.mode-card__desc {
  font-size: 0.6875rem;
  color: var(--app-text-muted);
  text-align: center;
}

.pos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  max-width: 360px;
}
.pos-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.625rem;
  background: var(--app-bg);
  border: 1px solid var(--app-border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 150ms;
  font-family: inherit;
  color: var(--app-text);
}
.pos-btn:hover       { border-color: var(--app-accent); background: var(--app-active-bg); }
.pos-btn--active     { border-color: var(--app-accent); background: var(--app-active-bg); color: var(--app-accent); }
.pos-btn__icon       { font-size: 1.25rem; }
.pos-btn__label      { font-size: 0.625rem; color: var(--app-text-muted); font-weight: 500; white-space: nowrap; }

.code-block {
  background: var(--app-surface);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.8125rem;
  line-height: 1.6;
  overflow-x: auto;
  margin: 0;
  color: var(--app-text);
}
</style>
