<script setup lang="ts">
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { ToastContainer } from 'vue-toast-kit'
import { ref } from 'vue'

const route = useRoute()
const theme = ref<'light' | 'dark' | 'system'>('system')

const navItems = [
  { path: '/basic',      label: 'Basic',        icon: '🔔' },
  { path: '/promise',    label: 'Promise',       icon: '⚡' },
  { path: '/undo',       label: 'Undo',          icon: '↩️' },
  { path: '/group',      label: 'Group',         icon: '📦' },
  { path: '/headless',   label: 'Headless',      icon: '🎨' },
  { path: '/multi',      label: 'Multi-instance', icon: '🔀' },
  { path: '/design',     label: 'Design System', icon: '🎨' },
  { path: '/animations', label: 'Animations',    icon: '✨' },
  { path: '/stack',      label: 'Stack mode',    icon: '🗂️' },
]
</script>

<template>
  <div class="app" :class="`theme-${theme}`">
    <aside class="sidebar">
      <div class="sidebar__logo">
        <span class="logo-icon">🔔</span>
        <div>
          <div class="logo-title">vue-toast-kit</div>
          <div class="logo-sub">Demo</div>
        </div>
      </div>

      <nav class="nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav__item"
          :class="{ 'nav__item--active': route.path === item.path }"
        >
          <span class="nav__icon">{{ item.icon }}</span>
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="theme-switcher">
        <span class="theme-label">Theme</span>
        <div class="theme-buttons">
          <button
            v-for="t in ['light', 'dark', 'system']"
            :key="t"
            :class="['theme-btn', { 'theme-btn--active': theme === t }]"
            @click="theme = t as typeof theme"
          >
            {{ t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '💻' }}
          </button>
        </div>
      </div>
    </aside>

    <main class="main">
      <RouterView />
    </main>

    <ToastContainer position="bottom-right" :theme="theme" />
  </div>
</template>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --app-bg: #f8f9fa;
  --app-sidebar-bg: #ffffff;
  --app-text: #1a1a1a;
  --app-text-muted: #6b7280;
  --app-border: #e5e7eb;
  --app-border-control: #d1d5db;
  --app-accent: #2563eb;
  --app-active-bg: #eff6ff;
  --app-card-bg: #ffffff;
  --app-surface: #e9ecef;
  --app-shadow: 0 1px 3px rgba(0,0,0,0.08);
  --app-badge-loading-bg: #f5f3ff;  --app-badge-loading-text: #7c3aed;
  --app-badge-success-bg: #f0fdf4;  --app-badge-success-text: #16a34a;
  --app-badge-error-bg:   #fef2f2;  --app-badge-error-text:   #dc2626;
}

.theme-dark {
  --app-bg: #0f0f10;
  --app-sidebar-bg: #1c1c1e;
  --app-text: #f5f5f7;
  --app-text-muted: #8d8d95;
  --app-border: rgba(255,255,255,0.07);
  --app-border-control: rgba(255,255,255,0.16);
  --app-accent: #60a5fa;
  --app-active-bg: rgba(96,165,250,0.12);
  --app-card-bg: #1c1c1e;
  --app-surface: #2c2c2e;
  --app-shadow: 0 1px 3px rgba(0,0,0,0.3);
  --app-badge-loading-bg: rgba(124,58,237,0.15);  --app-badge-loading-text: #a78bfa;
  --app-badge-success-bg: rgba(22,163,74,0.15);   --app-badge-success-text: #4ade80;
  --app-badge-error-bg:   rgba(220,38,38,0.15);   --app-badge-error-text:   #f87171;
}

@media (prefers-color-scheme: dark) {
  .theme-system {
    --app-bg: #0f0f10;
    --app-sidebar-bg: #1c1c1e;
    --app-text: #f5f5f7;
    --app-text-muted: #8d8d95;
    --app-border: rgba(255,255,255,0.07);
    --app-border-control: rgba(255,255,255,0.16);
    --app-accent: #60a5fa;
    --app-active-bg: rgba(96,165,250,0.12);
    --app-card-bg: #1c1c1e;
    --app-surface: #2c2c2e;
    --app-shadow: 0 1px 3px rgba(0,0,0,0.3);
    --app-badge-loading-bg: rgba(124,58,237,0.15);  --app-badge-loading-text: #a78bfa;
    --app-badge-success-bg: rgba(22,163,74,0.15);   --app-badge-success-text: #4ade80;
    --app-badge-error-bg:   rgba(220,38,38,0.15);   --app-badge-error-text:   #f87171;
  }
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
}

/* Background and text color set here, not on body,
   so CSS variables resolve within the theme context */
.app {
  display: flex;
  min-height: 100vh;
  background: var(--app-bg);
  color: var(--app-text);
}

.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: var(--app-sidebar-bg);
  border-right: 1px solid var(--app-border);
  display: flex;
  flex-direction: column;
  padding: 1.25rem 0;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar__logo {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0 1.25rem 1.25rem;
  border-bottom: 1px solid var(--app-border);
  margin-bottom: 0.75rem;
}

.logo-icon { font-size: 1.75rem; }
.logo-title { font-weight: 700; font-size: 0.9375rem; color: var(--app-text); }
.logo-sub { font-size: 0.75rem; color: var(--app-text-muted); }

.nav { flex: 1; padding: 0 0.75rem; display: flex; flex-direction: column; gap: 2px; }

.nav__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  color: var(--app-text-muted);
  text-decoration: none;
  transition: all 150ms;
}
.nav__item:hover { background: var(--app-active-bg); color: var(--app-text); }
.nav__item--active { background: var(--app-active-bg); color: var(--app-accent); font-weight: 600; }
.nav__icon { font-size: 1rem; width: 1.25rem; text-align: center; }

.theme-switcher {
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--app-border);
  margin-top: auto;
}
.theme-label { font-size: 0.75rem; color: var(--app-text-muted); display: block; margin-bottom: 0.5rem; }
.theme-buttons { display: flex; gap: 0.25rem; }
.theme-btn {
  flex: 1;
  padding: 0.375rem;
  border: 1px solid var(--app-border-control);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  font-size: 1rem;
  transition: all 150ms;
  color: var(--app-text);
}
.theme-btn--active { border-color: var(--app-accent); background: var(--app-active-bg); }

.main {
  flex: 1;
  padding: 2rem;
  min-width: 0;
  overflow-y: auto;
}

/* Demo cards */
.demo-section { margin-bottom: 2rem; }
.demo-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.375rem; color: var(--app-text); }
.demo-desc { color: var(--app-text-muted); font-size: 0.875rem; margin-bottom: 1.5rem; }

.card {
  background: var(--app-card-bg);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: var(--app-shadow);
  margin-bottom: 1rem;
}
.card__title { font-weight: 600; font-size: 0.9375rem; margin-bottom: 0.75rem; color: var(--app-text); }

.btn-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms;
  font-family: inherit;
}

.btn--primary   { background: #2563eb; color: #fff; }
.btn--success   { background: #16a34a; color: #fff; }
.btn--error     { background: #dc2626; color: #fff; }
.btn--warning   { background: #d97706; color: #fff; }
.btn--info      { background: #0891b2; color: #fff; }
.btn--loading   { background: #7c3aed; color: #fff; }
.btn--secondary { background: var(--app-surface); color: var(--app-text); border: 1px solid var(--app-border-control); }
.btn--ghost     { background: transparent; border: 1px solid var(--app-border-control); color: var(--app-text); }

.btn:hover { opacity: 0.85; transform: translateY(-1px); }
.btn:active { transform: translateY(0); }
</style>
