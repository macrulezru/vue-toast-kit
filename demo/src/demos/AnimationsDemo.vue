<script setup lang="ts">
import { useToast } from 'vue-toast-kit'
import type { ToastPosition } from 'vue-toast-kit'

const toast = useToast()

const positions: { pos: ToastPosition; label: string; icon: string }[] = [
  { pos: 'top-left',      label: 'Top Left',      icon: '↖' },
  { pos: 'top-center',    label: 'Top Center',    icon: '↑' },
  { pos: 'top-right',     label: 'Top Right',     icon: '↗' },
  { pos: 'bottom-left',   label: 'Bottom Left',   icon: '↙' },
  { pos: 'bottom-center', label: 'Bottom Center', icon: '↓' },
  { pos: 'bottom-right',  label: 'Bottom Right',  icon: '↘' },
]

function fire(pos: ToastPosition) {
  toast.info(`Toast from ${pos}`, { position: pos, duration: 2500 })
}

function fireAll() {
  positions.forEach(({ pos }, i) => {
    setTimeout(() => {
      toast.success(pos, { position: pos, duration: 3000 })
    }, i * 120)
  })
}
</script>

<template>
  <div class="demo-section">
    <div class="demo-title">Animations &amp; positions</div>
    <div class="demo-desc">
      Toasts slide in from the corresponding edge of the screen.
      With prefers-reduced-motion — fade only.
    </div>

    <div class="card">
      <div class="card__title">Pick a position</div>
      <div class="position-grid">
        <button
          v-for="{ pos, label, icon } in positions"
          :key="pos"
          class="pos-btn"
          @click="fire(pos)"
        >
          <span class="pos-btn__icon">{{ icon }}</span>
          <span class="pos-btn__label">{{ label }}</span>
        </button>
      </div>
      <div class="btn-grid" style="margin-top: 1rem">
        <button class="btn btn--primary"   @click="fireAll()">All positions at once</button>
        <button class="btn btn--secondary" @click="toast.dismiss()">Dismiss all</button>
      </div>
    </div>

    <div class="card">
      <div class="card__title">Extra effects</div>
      <div class="btn-grid">
        <button class="btn btn--loading" @click="toast.loading('Loading…', { position: 'top-center' })">
          Loading spinner
        </button>
        <button class="btn btn--ghost" @click="toast.info('Fast toast', { duration: 1500, position: 'top-right' })">
          Fast (1.5 s)
        </button>
        <button class="btn btn--ghost" @click="toast.info('Slow toast', { duration: 6000, position: 'bottom-center' })">
          Slow (6 s)
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.position-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, auto);
  gap: 0.5rem;
  max-width: 360px;
}

.pos-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem;
  background: var(--app-bg);
  border: 1px solid var(--app-border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 150ms;
  font-family: inherit;
  color: var(--app-text);
}
.pos-btn:hover { border-color: var(--app-accent); background: var(--app-active-bg); }
.pos-btn__icon  { font-size: 1.375rem; }
.pos-btn__label { font-size: 0.6875rem; color: var(--app-text-muted); font-weight: 500; }
</style>
