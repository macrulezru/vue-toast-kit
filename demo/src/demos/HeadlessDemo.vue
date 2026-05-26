<script setup lang="ts">
import { useToast, useToastState } from 'vue-toast-kit'

const toast = useToast()
const { active } = useToastState()

function addSeveral() {
  toast.success('File uploaded')
  setTimeout(() => toast.error('Network error'), 300)
  setTimeout(() => toast.info('Sync complete'), 600)
}
</script>

<template>
  <div class="demo-section">
    <div class="demo-title">Headless mode</div>
    <div class="demo-desc">
      useToastState() returns raw reactive queue data.
      The render below uses zero styles from the package — fully custom markup.
    </div>

    <div class="card">
      <div class="card__title">Controls</div>
      <div class="btn-grid">
        <button class="btn btn--primary"   @click="addSeveral()">Add 3 toasts</button>
        <button class="btn btn--secondary" @click="toast.dismiss()">Dismiss all</button>
      </div>
    </div>

    <!-- Custom render — no ToastContainer, no package styles -->
    <div class="custom-container">
      <div
        v-for="t in active"
        :key="t.id"
        :class="['custom-toast', `custom-toast--${t.options.type}`]"
      >
        <div class="custom-toast__header">
          <span class="custom-toast__type">{{ t.options.type.toUpperCase() }}</span>
          <button class="custom-toast__close" @click="t.dismiss()">✕</button>
        </div>
        <div class="custom-toast__message">{{ t.message }}</div>
        <div class="custom-toast__progress">
          <div
            class="custom-toast__progress-bar"
            :style="{ width: `${t.remaining.value * 100}%` }"
          />
        </div>
      </div>

      <div v-if="!active.length" class="custom-empty">
        No active notifications
      </div>
    </div>

    <div class="card info-card">
      <div class="info-icon">💡</div>
      <div>
        <strong>Headless:</strong> no <code>&lt;ToastContainer&gt;</code> is used at all.
        All data comes from <code>useToastState()</code>.
        Use any UI framework or fully custom markup.
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
  min-height: 120px;
}

.custom-toast {
  border-left: 4px solid;
  padding: 0.75rem 1rem;
  border-radius: 0 8px 8px 0;
  background: var(--app-card-bg);
  border-top: 1px solid var(--app-border);
  border-right: 1px solid var(--app-border);
  border-bottom: 1px solid var(--app-border);
  overflow: hidden;
}
.custom-toast--success { border-left-color: #16a34a; }
.custom-toast--error   { border-left-color: #dc2626; }
.custom-toast--warning { border-left-color: #d97706; }
.custom-toast--info    { border-left-color: #2563eb; }
.custom-toast--loading { border-left-color: #7c3aed; }

.custom-toast__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.375rem; }
.custom-toast__type { font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.05em; color: var(--app-text-muted); }
.custom-toast__close { background: none; border: none; cursor: pointer; color: var(--app-text-muted); font-size: 0.75rem; padding: 0.1rem 0.25rem; border-radius: 4px; }
.custom-toast__close:hover { background: var(--app-bg); }
.custom-toast__message { font-size: 0.875rem; color: var(--app-text); }

.custom-toast__progress { height: 2px; background: var(--app-border); border-radius: 999px; margin-top: 0.625rem; overflow: hidden; }
.custom-toast__progress-bar { height: 100%; background: currentColor; border-radius: 999px; transition: width 100ms linear; }
.custom-toast--success .custom-toast__progress-bar { background: #16a34a; }
.custom-toast--error   .custom-toast__progress-bar { background: #dc2626; }
.custom-toast--info    .custom-toast__progress-bar { background: #2563eb; }

.custom-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  color: var(--app-text-muted);
  font-size: 0.875rem;
  border: 1px dashed var(--app-border);
  border-radius: 8px;
}

.info-card { display: flex; gap: 0.75rem; align-items: flex-start; }
.info-icon { font-size: 1.25rem; flex-shrink: 0; }
code {
  font-family: 'Menlo', 'Consolas', monospace;
  font-size: 0.8125rem;
  background: var(--app-bg);
  padding: 0.1em 0.35em;
  border-radius: 4px;
}
</style>
