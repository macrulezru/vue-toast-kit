<div align="center" style="background:#111827;border-radius:20px;padding:28px 20px 20px;margin-bottom:32px">
  <h1 style="color:#f9fafb;margin:0 0 32px;font-size:2.2em;letter-spacing:-0.03em;font-weight:700;font-family:sans-serif">
    vue-toast-kit
  </h1>
  <img
    src="https://s3.twcstorage.ru/c9a2cc89-780f97fd-311d-4a1a-b86f-c25665c9dc46/images/npm/vue-toast-kit.webp"
    alt="vue-virtual-scroller-kit"
    style="max-width:100%;width:auto;height:300px;border-radius:12px"
  />
</div>

Promise-API with auto type switching, priority queue with preemption, undo-actions with progress timer, toast grouping, headless mode, and a full design system via CSS custom properties — all with a single peer dependency (Vue 3).

---

## Contents

- [Features](#features)
- [Installation](#installation)
- [Demo](#demo)
- [Quick start — Vue 3](#quick-start--vue-3)
- [Quick start — Nuxt 3](#quick-start--nuxt-3)
- [useToast](#usetoast)
- [toast.promise](#toastpromise)
- [toast.undo](#toastundo)
- [Toast grouping](#toast-grouping)
- [ToastContainer](#toastcontainer)
- [useToastState — headless mode](#usetoaststate--headless-mode)
- [createToastContext — multi-instance](#createtoastcontext--multi-instance)
- [Stack mode (Sonner-style)](#stack-mode-sonner-style)
- [Event emitter](#event-emitter)
- [Rate limiting & localStorage persist](#rate-limiting--localstorage-persist)
- [Testing utilities](#testing-utilities)
- [Design System](#design-system)
- [Vue plugin](#vue-plugin)
- [Nuxt module](#nuxt-module)
- [TypeScript types](#typescript-types)
- [SSR compatibility](#ssr-compatibility)
- [Architecture](#architecture)
- [Bundle size & peer dependencies](#bundle-size--peer-dependencies)
- [Migration from vue-toastification / vue-sonner](#migration-from-vue-toastification--vue-sonner)

---

## Features

- **Promise API** — `toast.promise(promise, messages)` automatically switches `loading → success / error` based on the result; returns the original promise unmodified
- **Priority queue** — four levels (`critical / high / normal / low`); when the visible limit is reached, high-priority toasts preempt low-priority ones; the preempted toast moves to a pending queue and reappears when space frees up
- **Undo actions** — `toast.undo(message, { undo: { onUndo, duration } })` renders a progress-bar timer; clicking "Undo" calls the callback and closes the toast; when the timer expires the action is confirmed silently
- **Grouping** — toasts with the same `groupKey` are stacked into one with a `+N` counter; clicking the counter expands the group
- **Headless mode** — `useToastState()` returns raw reactive queue data; render with any UI framework or fully custom markup
- **Multi-instance** — `createToastContext()` produces an isolated queue; pass it to `useToast(ctx)` and `<ToastContainer :context="ctx" />` for micro-frontends or scoped notification zones
- **Design System** — 30+ CSS custom properties (`--vtk-*`) covering colors, typography, shape, shadows, animations, and z-index; three built-in themes (`light`, `dark`, `system`); inline token override via the `theme` prop on `<ToastContainer>`
- **SSR-safe** — core has no browser API; toasts fired before `<ToastContainer>` mounts are buffered and flushed after mount (100 ms delay)
- **Accessibility** — `role="alert"` for `error / critical`, `role="status"` for others; `aria-live="assertive"` for critical; `Escape` closes the focused toast; focus returns to the previously active element on dismiss
- **Touch support** — swipe left or right to dismiss (configurable 40 % threshold)
- **RTL support** — CSS logical properties (`margin-inline-start`, `padding-inline`) adapt the layout automatically when `dir="rtl"` is set on `<html>`
- **Pause on hover / focus loss** — timers freeze automatically; `visibilitychange` stops all timers when the tab goes to the background
- **Animations** — CSS-only slide + fade per position; `prefers-reduced-motion` degrades to fade-only
- **Vue Plugin + Nuxt Module** — `app.use(VueToastPlugin)` for Vue 3; `modules: ['vue-toast-kit/nuxt']` for Nuxt 3 with auto-imports
- **Zero external runtime dependencies** — only Vue 3 as peer dep; full ESM + CJS, tree-shakeable

---

## Installation

```bash
npm install vue-toast-kit
```

Peer dependency:

```bash
npm install vue@>=3.3
```

---

## Demo

An interactive demo application is included in the `demo/` directory covering every feature in a tabbed interface.

```bash
git clone https://github.com/macrulezru/vue-toast-kit.git
cd vue-toast-kit
npm install
npm run demo
```

`npm run demo` installs demo dependencies automatically and starts the dev server.
Opens `http://localhost:5173`.

| Script | Description |
|---|---|
| `npm run demo` | Install demo deps (if needed) + start dev server |
| `npm run demo:dev` | Start dev server only (deps already installed) |
| `npm run demo:build` | Build demo for production |

| Tab | What it shows |
|---|---|
| 🔔 Basic | All toast types, positions, priorities, action buttons |
| ⚡ Promise | `toast.promise()` with resolve / reject simulation |
| ↩️ Undo | `toast.undo()` with progress timer, event log |
| 📦 Group | Stacking toasts by `groupKey`, expand on click |
| 🎨 Headless | `useToastState()` with fully custom render — zero package styles |
| 🔀 Multi-instance | `createToastContext()` — two isolated zones on one page |
| 🎨 Design System | Live CSS token editor with preset themes and CSS export |
| ✨ Animations | All 6 positions, animated grid picker |

---

## Quick start — Vue 3

**1. Register the plugin**

```ts
// main.ts
import { createApp } from 'vue'
import { VueToastPlugin } from 'vue-toast-kit'
import 'vue-toast-kit/style'
import App from './App.vue'

const app = createApp(App)
app.use(VueToastPlugin, { position: 'bottom-right', theme: 'system' })
app.mount('#app')
```

**2. Add the container**

```vue
<!-- App.vue -->
<template>
  <RouterView />
  <ToastContainer />
</template>
```

`<ToastContainer>` is registered globally by the plugin. No import needed.

**3. Fire toasts from anywhere**

```vue
<script setup lang="ts">
import { useToast } from 'vue-toast-kit'

const toast = useToast()
</script>

<template>
  <button @click="toast.success('Saved!')">Save</button>
  <button @click="toast.error('Something went wrong')">Fail</button>
</template>
```

Or use the named singleton outside components (Pinia stores, axios interceptors, route guards):

```ts
import { toast } from 'vue-toast-kit'

axios.interceptors.response.use(null, (err) => {
  toast.error(`Network error: ${err.message}`)
  return Promise.reject(err)
})
```

---

## Quick start — Nuxt 3

**1. Add the module**

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['vue-toast-kit/nuxt'],
  vueToastKit: {
    position: 'top-right',
    theme: 'system',
    maxVisible: 5,
  },
})
```

**2. Add the container to your layout**

```vue
<!-- layouts/default.vue -->
<template>
  <div>
    <slot />
    <ToastContainer />  <!-- auto-imported -->
  </div>
</template>
```

**3. Use in pages and composables**

```vue
<script setup lang="ts">
// useToast and toast are auto-imported — no explicit import needed
const toast = useToast()

async function save() {
  await toast.promise(
    $fetch('/api/save', { method: 'POST', body: form }),
    { loading: 'Saving…', success: 'Saved!', error: (e) => e.message },
  )
}
</script>
```

---

## useToast

The main composable. Returns a `ToastApi` object. Works inside and outside Vue components.

```ts
const toast = useToast(context?: ToastContext): ToastApi
```

When called without arguments inside a component, it uses the injected context (set up by the plugin). When called outside a component it falls back to the global singleton. Pass a `ToastContext` from `createToastContext()` to use an isolated queue.

### Methods

| Method | Signature | Description |
|---|---|---|
| `toast()` | `(message, options?) → id` | Show an `info` toast |
| `toast.success()` | `(message, options?) → id` | Show a `success` toast |
| `toast.error()` | `(message, options?) → id` | Show an `error` toast (priority: `high` by default) |
| `toast.warning()` | `(message, options?) → id` | Show a `warning` toast |
| `toast.info()` | `(message, options?) → id` | Show an `info` toast |
| `toast.loading()` | `(message, options?) → id` | Show a `loading` toast (no auto-dismiss, not closable by default) |
| `toast.custom()` | `(component, options?) → id` | Replace the toast body with a Vue component |
| `toast.promise()` | `(promise, messages, options?) → Promise` | See [toast.promise](#toastpromise) |
| `toast.undo()` | `(message, options) → id` | See [toast.undo](#toastundo) |
| `toast.update()` | `(id, partial) → void` | Merge options (and optionally the message) into an existing toast |
| `toast.updateMessage()` | `(id, message) → void` | Update only the message text without touching options |
| `toast.dismiss()` | `(id?) → void` | Close a toast by id; omit id to close all |
| `toast.dismissAll()` | `(position?) → void` | Close all toasts, optionally filtered by position |
| `toast.isActive()` | `(id) → boolean` | Check if a toast is still visible |
| `toast.pauseAll()` | `() → void` | Pause all timers |
| `toast.resumeAll()` | `() → void` | Resume all timers |

### ToastOptions

| Option | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | auto | Unique id; if the same id is already active the toast is updated |
| `type` | `ToastType` | `'info'` | Visual style; one of `info / success / warning / error / loading / custom` |
| `priority` | `ToastPriority` | `'normal'` | Queue priority; one of `critical / high / normal / low` |
| `duration` | `number` | `4000` | Auto-dismiss delay in ms; `0` = sticky (never auto-closes) |
| `position` | `ToastPosition` | container default | Render this toast at a specific position, regardless of the container's `position` prop |
| `closable` | `boolean` | `true` | Show the close button |
| `groupKey` | `string` | — | Group toasts with the same key into a stack |
| `icon` | `Component \| string \| false` | type default | SVG component, emoji string, or `false` to hide |
| `action` | `{ label, onClick }` | — | Extra action button inside the toast |
| `undo` | `{ label?, onUndo, duration? }` | — | Undo button with timer; see [toast.undo](#toastundo) |
| `onClose` | `() => void` | — | Called when the toast is closed (any reason) |
| `onAutoClose` | `() => void` | — | Called only when the timer expires |
| `pauseOnHover` | `boolean` | `true` | Pause the timer on mouse enter |
| `pauseOnFocusLoss` | `boolean` | `true` | Pause the timer when the tab goes to background |
| `swipeToDismiss` | `boolean` | `true` | Enable swipe left / right to dismiss on touch devices |
| `persist` | `boolean` | `false` | Restore from `localStorage` after reload (only for toasts without callbacks) |
| `component` | `Component` | — | Replace the entire toast body with a Vue component |
| `componentProps` | `Record<string, unknown>` | — | Props forwarded to `component` |
| `ariaLive` | `'assertive' \| 'polite'` | auto | Override the automatic aria-live value |
| `theme` | `'light' \| 'dark' \| 'system' \| ToastDesignTokens` | — | Per-toast theme or token overrides |

### Examples

**All toast types:**

```ts
toast.info('Sync complete')
toast.success('File uploaded')
toast.warning('Disk almost full (92 %)')
toast.error('Connection refused')
toast.loading('Fetching data…')
```

**Custom duration and position:**

```ts
toast.success('Copied to clipboard', {
  duration: 2000,
  position: 'top-center',
})
```

**With an action button:**

```ts
toast.info('New message from Alex', {
  action: {
    label: 'Open',
    onClick: () => router.push('/messages'),
  },
})
```

**Emoji icon:**

```ts
toast.success('Backup complete', { icon: '💾' })
```

**Sticky until manually dismissed:**

```ts
const id = toast.error('Server is down', { duration: 0, closable: true })
// Later:
toast.dismiss(id)
```

**Update an existing toast:**

```ts
const id = toast.loading('Uploading…')
// Update message only (no option changes):
toast.updateMessage(id, 'Processing…')
// Or update message + options together:
toast.update(id, { message: 'Almost done…', duration: 3000 })
```

**Rich content via Vue component:**

```ts
import RichCard from './RichCard.vue'

toast.custom(RichCard, {
  componentProps: { title: 'Hello', body: 'World' },
  duration: 0,
  closable: true,
})
```

---

## toast.promise

Automatically switches a `loading` toast to `success` or `error` based on the promise result. Returns the original promise so you can `await` it.

```ts
toast.promise<T>(
  promise: Promise<T>,
  messages: PromiseToastMessages<T>,
  options?: ToastOptions,
): Promise<T>
```

### PromiseToastMessages

| Field | Type | Description |
|---|---|---|
| `loading` | `string` | Message while the promise is pending |
| `success` | `string \| (data: T) => string` | Message on resolve; receives the resolved value |
| `error` | `string \| (err: unknown) => string` | Message on reject; receives the error |

### Examples

**Static messages:**

```ts
await toast.promise(
  fetch('/api/deploy').then(r => r.json()),
  {
    loading: 'Deploying…',
    success: 'Deployed successfully!',
    error:   'Deployment failed',
  },
)
```

**Dynamic messages from data / error:**

```ts
const user = await toast.promise(
  fetchUser(id),
  {
    loading: 'Loading user…',
    success: (u) => `Welcome, ${u.name}!`,
    error:   (e) => `Could not load user: ${(e as Error).message}`,
  },
)
```

**In a Pinia action:**

```ts
// stores/files.ts
import { toast } from 'vue-toast-kit'

export const useFileStore = defineStore('files', {
  actions: {
    async upload(file: File) {
      return toast.promise(
        uploadAPI(file),
        {
          loading: `Uploading ${file.name}…`,
          success: (res) => `${res.name} uploaded (${res.size} KB)`,
          error:   (e)   => `Upload failed: ${(e as Error).message}`,
        },
      )
    },
  },
})
```

The promise `reject` is re-thrown after updating the toast, so your `try / catch` or `.catch()` still fires normally.

---

## toast.undo

Creates a toast with a countdown progress bar. When the user clicks the undo button, `onUndo()` is called and the toast closes immediately. When the timer runs out, the toast closes silently (action confirmed).

```ts
toast.undo(message: string, options: ToastOptions & {
  undo: {
    onUndo: () => void | Promise<void>
    label?:   string   // default: 'Отменить'
    duration?: number  // ms, default: 5000
  }
}): string
```

### Examples

**Delete with undo:**

```ts
function deleteFile(id: string) {
  markForDeletion(id)

  toast.undo(`File "${fileName}" deleted`, {
    undo: {
      label: 'Restore',
      duration: 6000,
      onUndo: () => {
        restoreFile(id)
        toast.success('File restored')
      },
    },
    onAutoClose: () => permanentlyDelete(id),
  })
}
```

**Archive email:**

```ts
toast.undo('Email archived', {
  icon: '📨',
  undo: {
    onUndo: () => moveToInbox(emailId),
  },
})
```

**Async undo:**

```ts
toast.undo('Record deleted', {
  undo: {
    onUndo: async () => {
      await api.restore(recordId)
      toast.success('Record restored!')
    },
  },
})
```

---

## Toast grouping

Toasts with the same `groupKey` are collapsed into a single toast with a `+N` counter. Clicking the counter toggles the expanded state.

```ts
// All three calls produce one visible toast with "+2"
toast.info('New message from Alice', { groupKey: 'messages' })
toast.info('New message from Bob',   { groupKey: 'messages' })
toast.info('New message from Carol', { groupKey: 'messages' })
```

The leader toast (first in the group) stays visible; subsequent toasts are hidden but tracked. When the leader is dismissed, the next toast becomes the leader automatically.

### Grouping options

| Option | Behaviour |
|---|---|
| `groupKey: 'my-key'` | Enable grouping for this toast |
| No `groupKey` | Toast is always shown individually |

---

## ToastContainer

The Vue component that renders toasts. Place it once in `App.vue` (or in your Nuxt layout). Uses `<Teleport to="body">` internally.

```vue
<ToastContainer
  position="bottom-right"
  :max-visible="5"
  :gap="8"
  :offset-x="16"
  :offset-y="16"
  :z-index="9999"
  theme="system"
/>
```

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `position` | `ToastPosition` | `'bottom-right'` | Default container position (per-toast `position` option overrides this) |
| `maxVisible` | `number` | `5` | Maximum number of toasts shown at once; extras wait in a pending queue |
| `gap` | `number` | `8` | Vertical gap between toasts in pixels |
| `offsetX` | `number` | `16` | Horizontal distance from the screen edge in pixels |
| `offsetY` | `number` | `16` | Vertical distance from the screen edge in pixels |
| `zIndex` | `number` | `9999` | CSS z-index of the container |
| `expand` | `boolean` | `false` | Expand all groups immediately (skip collapsed state) |
| `teleportTo` | `string` | `'body'` | CSS selector passed to `<Teleport>` |
| `context` | `ToastContext` | global | Pass an isolated context from `createToastContext()` |
| `theme` | `'light' \| 'dark' \| 'system' \| ToastDesignTokens` | — | Theme name or inline token overrides |
| `stackMode` | `boolean` | `false` | Sonner-style stack: inactive toasts collapse behind the front one; hover expands |

### Multiple containers

A single `<ToastContainer>` handles all positions automatically — each toast is rendered at its own `position` option, falling back to the container's `position` prop:

```ts
toast.success('Saved', { position: 'top-right' })
toast.error('Failed',  { position: 'bottom-center' })
// Both appear in their respective corners from one <ToastContainer>
```

For fully isolated queues (separate notification zones), use `createToastContext()` with a dedicated container:

```vue
<template>
  <!-- Default global queue — bottom right -->
  <ToastContainer position="bottom-right" />

  <!-- Critical alerts — top center, separate queue -->
  <ToastContainer position="top-center" :context="alertCtx" :z-index="10000" />
</template>

<script setup lang="ts">
import { createToastContext, useToast } from 'vue-toast-kit'
const alertCtx = createToastContext()
const alertToast = useToast(alertCtx)
</script>
```

### Slots

Override any part of the toast without losing the queue logic:

```vue
<ToastContainer>
  <!-- Replace the entire toast -->
  <template #toast="{ toast, dismiss }">
    <MyCustomToast :data="toast" @close="dismiss(toast.id)" />
  </template>
</ToastContainer>
```

| Slot | Props | Description |
|---|---|---|
| `#toast` | `{ toast, dismiss }` | Full replacement of one toast (skips all sub-slots) |
| `#toast-icon` | `{ toast }` | Replace the icon only; falls back to `ToastIcon` |
| `#toast-content` | `{ toast }` | Replace the entire message + actions area |
| `#toast-action` | `{ toast }` | Replace the action / undo buttons; falls back to `ToastActions` |
| `#toast-close` | `{ toast, dismiss }` | Replace the close button |
| `#toast-undo` | `{ toast, remaining }` | Replace the progress bar at the bottom of the toast |

---

## useToastState — headless mode

Returns raw reactive data from the queue. Use it to build a completely custom notification UI — `<ToastContainer>` is not needed.

```ts
const { active, pending, count, has } = useToastState(context?: ToastContext)
```

### Return value

| Property | Type | Description |
|---|---|---|
| `active` | `ComputedRef<ToastItem[]>` | Currently visible toasts (excluding hidden grouped ones) |
| `pending` | `ComputedRef<ToastItem[]>` | Toasts waiting for a slot |
| `count` | `ComputedRef<number>` | `active.value.length` |
| `has(id)` | `(id: string) → boolean` | Check if a toast is active |

### Example — fully custom render

```vue
<script setup lang="ts">
import { useToast, useToastState } from 'vue-toast-kit'

const toast = useToast()
const { active } = useToastState()
</script>

<template>
  <!-- No <ToastContainer> — render entirely from scratch -->
  <div class="my-notifications">
    <div
      v-for="t in active"
      :key="t.id"
      :class="`notification notification--${t.options.type}`"
      @mouseenter="t.pause()"
      @mouseleave="t.resume()"
    >
      <span>{{ t.message }}</span>
      <button @click="t.dismiss()">✕</button>
      <div class="progress" :style="{ width: `${t.remaining.value * 100}%` }" />
    </div>
  </div>
</template>
```

Each `ToastItem` in `active` is fully reactive:

| Property / Method | Type | Description |
|---|---|---|
| `id` | `string` | Unique id |
| `message` | `string \| VNode` | Toast content |
| `options` | `ToastOptions` (required) | Merged options |
| `createdAt` | `number` | `Date.now()` at creation |
| `remaining` | `Ref<number>` | 0–1, fraction of timer remaining |
| `isPaused` | `Ref<boolean>` | Timer is paused |
| `groupCount` | `Ref<number>` | 1 normally; >1 when grouping is active |
| `pause()` | `() → void` | Pause the timer |
| `resume()` | `() → void` | Resume the timer |
| `dismiss()` | `() → void` | Close the toast |
| `update(opts)` | `(Partial<ToastOptions>) → void` | Merge new options |

---

## createToastContext — multi-instance

Creates an isolated queue instance. Pass it to `useToast(ctx)` and `<ToastContainer :context="ctx" />` to completely separate the notification scope from the global one.

```ts
const ctx = createToastContext(options?: GlobalToastOptions): ToastContext
```

Use cases:
- Micro-frontend shells where each MFE manages its own notifications
- Modal dialogs with local status toasts that must not interfere with the app-level queue
- Multiple separate notification zones on one page

### Example

```vue
<script setup lang="ts">
import { createToastContext, useToast, ToastContainer } from 'vue-toast-kit'

const modalCtx = createToastContext({ maxVisible: 3 })
const modalToast = useToast(modalCtx)

function save() {
  modalToast.success('Changes saved inside the modal')
}
</script>

<template>
  <div class="modal">
    <button @click="save">Save</button>

    <!-- This container only shows toasts from modalCtx -->
    <ToastContainer
      :context="modalCtx"
      position="top-right"
      :z-index="10001"
    />
  </div>
</template>
```

---

## Design System

All visual properties are controlled by CSS custom properties (`--vtk-*`). Override them globally in `:root`, scoped to a container, or pass a `ToastDesignTokens` object as the `theme` prop.

### Built-in themes

```vue
<!-- Light (default) -->
<ToastContainer theme="light" />

<!-- Dark -->
<ToastContainer theme="dark" />

<!-- Follows prefers-color-scheme -->
<ToastContainer theme="system" />
```

### Inline token overrides

Pass a `ToastDesignTokens` object to override specific tokens without touching global CSS:

```vue
<ToastContainer
  :theme="{
    colorBg:      '#1a1a2e',
    colorText:    '#e2e8f0',
    colorSuccess: '#00ff88',
    colorError:   '#ff4d6d',
    borderRadius: '16px',
    shadow:       '0 8px 32px rgba(0, 0, 0, 0.5)',
    maxWidth:     '360px',
  }"
/>
```

### Full token reference

| Token | CSS Variable | Default (light) | Description |
|---|---|---|---|
| `colorBg` | `--vtk-color-bg` | `#ffffff` | Toast background |
| `colorText` | `--vtk-color-text` | `#1a1a1a` | Primary text color |
| `colorBorder` | `--vtk-color-border` | `rgba(0,0,0,0.08)` | Border color |
| `colorSuccess` | `--vtk-color-success` | `#16a34a` | Success accent |
| `colorError` | `--vtk-color-error` | `#dc2626` | Error accent |
| `colorWarning` | `--vtk-color-warning` | `#d97706` | Warning accent |
| `colorInfo` | `--vtk-color-info` | `#2563eb` | Info accent |
| `colorLoading` | `--vtk-color-loading` | `#7c3aed` | Loading accent |
| `fontFamily` | `--vtk-font-family` | system-ui | Font stack |
| `fontSize` | `--vtk-font-size` | `0.875rem` | Base font size |
| `fontWeight` | `--vtk-font-weight` | `400` | Base font weight |
| `lineHeight` | `--vtk-line-height` | `1.4` | Line height |
| `borderRadius` | `--vtk-border-radius` | `10px` | Corner radius |
| `borderWidth` | `--vtk-border-width` | `1px` | Border width |
| `shadow` | `--vtk-shadow` | multi-layer | Box shadow |
| `paddingX` | `--vtk-padding-x` | `1rem` | Horizontal padding |
| `paddingY` | `--vtk-padding-y` | `0.75rem` | Vertical padding |
| `iconSize` | `--vtk-icon-size` | `1.25rem` | Icon size |
| `progressHeight` | `--vtk-progress-height` | `3px` | Progress bar height |
| `maxWidth` | `--vtk-max-width` | `400px` | Maximum toast width |
| `minWidth` | `--vtk-min-width` | `280px` | Minimum toast width |
| `transitionDuration` | `--vtk-transition-duration` | `300ms` | Animation duration |
| `transitionEasing` | `--vtk-transition-easing` | ease | Animation easing |
| `zIndex` | `--vtk-z-index` | `9999` | Container z-index |

### Global CSS override

```css
/* styles/toasts.css */
:root {
  --vtk-border-radius: 6px;
  --vtk-font-family:   'Inter', sans-serif;
  --vtk-shadow:        0 2px 8px rgba(0, 0, 0, 0.15);
  --vtk-max-width:     360px;
}
```

---

## Vue plugin

```ts
import { VueToastPlugin } from 'vue-toast-kit'
import 'vue-toast-kit/style'

app.use(VueToastPlugin, {
  position:         'bottom-right',
  maxVisible:       5,
  duration:         4000,
  theme:            'system',
  closable:         true,
  pauseOnHover:     true,
  pauseOnFocusLoss: true,
  registerComponent: true,  // auto-register <ToastContainer> globally
})
```

### VueToastPluginOptions

| Option | Type | Default | Description |
|---|---|---|---|
| `position` | `ToastPosition` | `'bottom-right'` | Default container position |
| `maxVisible` | `number` | `5` | Default maximum visible toasts |
| `duration` | `number` | `4000` | Default auto-dismiss duration in ms |
| `theme` | `'light' \| 'dark' \| 'system'` | — | Default theme for all containers |
| `closable` | `boolean` | `true` | Show close button by default |
| `pauseOnHover` | `boolean` | `true` | Pause on hover by default |
| `pauseOnFocusLoss` | `boolean` | `true` | Pause on tab background by default |
| `ignoreSSR` | `boolean` | `false` | Disable SSR buffering |
| `registerComponent` | `boolean` | `true` | Globally register `<ToastContainer>` |
| `rateLimit` | `number` | — | Max toasts added within `rateLimitWindowMs`; extras are silently dropped |
| `rateLimitWindowMs` | `number` | `1000` | Window in ms for rate limiting |
| `persistStorage` | `boolean` | `false` | Enable localStorage persist/restore for toasts with `persist: true` |

---

## Nuxt module

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['vue-toast-kit/nuxt'],

  vueToastKit: {
    position:         'bottom-right',
    maxVisible:       5,
    duration:         4000,
    theme:            'system',
    closable:         true,
    pauseOnHover:     true,
    pauseOnFocusLoss: true,
    registerComponent: true,
  },
})
```

The module automatically:
- Adds the Vue plugin on the client
- **Auto-imports** `useToast`, `useToastState`, `createToastContext`, and the `toast` singleton — no explicit import needed
- **Auto-imports** `<ToastContainer>` as a global component (when `registerComponent: true`)
- Injects `vue-toast-kit/style.css` into the Nuxt CSS pipeline

CSS is loaded automatically — no manual import of `vue-toast-kit/style` required in Nuxt.

---

## TypeScript types

All public types are exported from the package root:

```ts
import type {
  ToastType,           // 'info' | 'success' | 'warning' | 'error' | 'loading' | 'custom'
  ToastPriority,       // 'critical' | 'high' | 'normal' | 'low'
  ToastPosition,       // 'top-left' | 'top-center' | 'top-right' | 'bottom-*'

  ToastOptions,        // Full options object
  ToastItem,           // Internal reactive toast item (used in headless mode)
  ToastAction,         // { label: string; onClick: () => void }
  ToastUndo,           // { label?: string; onUndo: () => void | Promise<void>; duration?: number }
  ToastDesignTokens,   // All CSS token keys typed

  PromiseToastMessages,// { loading, success, error }

  ToastContext,        // Isolated queue context
  GlobalToastOptions,  // Plugin / module options

  ToastApi,            // Return type of useToast()
} from 'vue-toast-kit'
```

**Working with `ToastItem` in headless mode:**

```ts
import type { ToastItem } from 'vue-toast-kit'

function renderCustomToast(t: ToastItem) {
  // t.remaining.value — number 0–1
  // t.isPaused.value  — boolean
  // t.groupCount.value — number
  // t.options.type, t.options.priority, etc.
}
```

**Typed token override:**

```ts
import type { ToastDesignTokens } from 'vue-toast-kit'

const darkGlass: ToastDesignTokens = {
  colorBg:      'rgba(15, 15, 20, 0.85)',
  colorText:    '#f0f0f0',
  borderRadius: '14px',
  shadow:       '0 8px 32px rgba(0,0,0,0.6)',
}
```

---

## SSR compatibility

| Scenario | Behaviour |
|---|---|
| `typeof window === 'undefined'` | `toast()` calls are buffered in `ToastBuffer`; no browser API is touched |
| `<ToastContainer>` mounts on the client | Buffer is flushed after 100 ms with all pending toasts |
| `ignoreSSR: true` | Buffer is disabled; SSR-fired toasts are discarded silently |
| Nuxt hydration | Plugin runs client-side only; SSR render produces no toast HTML |

```ts
// nuxt.config.ts — disable SSR buffer if you never fire toasts on the server
vueToastKit: { ignoreSSR: true }
```

---

## Architecture

```
useToast() / toast (singleton)
        │
        ├── buildToastApi(context)
        │     toast(), toast.success/error/warning/info/loading/custom()
        │     toast.promise()   — updates type + restarts timer
        │     toast.undo()      — wraps options.undo
        │     toast.dismiss()   — proxies to queue.dismiss()
        │
        ▼
   ToastContext
        │   addToast()  →  isServer ? ToastBuffer : ToastQueue.add()
        │   dismiss()   →  ToastQueue.dismiss()
        │   update()    →  ToastQueue.update()
        │
        ▼
   ToastQueue                    GroupManager
        active: ToastItem[]  ◄───────────────────┐
        pending: ToastItem[]      add(id, key)    │
        timers: Map<id, UndoTimer>  remove(id, key)│
                                  toggleExpand()  │
        add()  — dedup / preempt / sort pending   │
        remove() — free slot, promote from pending│
        update() — merge options                  │
        dismiss() — calls onClose, remove         │
                                                  │
   UndoTimer                                      │
        setTimeout/setInterval, pause/resume       │
        remaining: number (0–1)  ────────────────►│ ToastItem.remaining.value
        onExpire: () => queue.remove(id)          │
                                                  │
   ToastBuffer (SSR)                              │
        push() — store before window exists       │
        flush() — replay into queue at mount      │
        onFlush() — called by ToastContainer      │
                                                  │
   ToastContainer.vue                             │
        Teleport → body                           │
        TransitionGroup (slide + fade per position)│
        hover → queue.pauseAll() / resumeAll()    │
        visibilitychange → pause/resume           │
        slot: #toast / #toast-icon / …            │
        │                                         │
        └── Toast.vue                             │
              swipe (touch)                       │
              aria role + aria-live               │
              ToastIcon.vue (SVG + spinner)        │
              ToastProgressBar.vue (scaleX)       │
              action / undo buttons               │
              group counter (click → toggleExpand)│

Plugin (VueToastPlugin)                 Nuxt Module
  app.use() → installContext()            defineNuxtModule()
  provide(TOAST_CONTEXT_KEY, ctx)         addPlugin(), addImports()
  app.component('ToastContainer', …)      addComponent(), css inject
```

---

## Bundle size & peer dependencies

| Entry point | Size (gzip) | Peer deps |
|---|---|---|
| `vue-toast-kit` (JS) | ~9.2 KB | `vue ^3.3` |
| `vue-toast-kit/style` (CSS) | ~2.4 KB | — |
| `vue-toast-kit/nuxt` | ~0.6 KB | `vue ^3.3`, `@nuxt/kit` |

Ships as tree-shakeable ESM (`vue-toast-kit.js`) and CommonJS (`vue-toast-kit.cjs`).

---

## Stack mode (Sonner-style)

Enable `stackMode` on `<ToastContainer>` to collapse multiple toasts into a visual stack. The front toast is fully visible; behind it you see up to 2 ghost cards, slightly scaled and offset. Hovering the container expands them back to the normal stacked list.

```vue
<ToastContainer :stack-mode="true" position="bottom-right" />
```

Hover to expand, mouse-leave to collapse back.

---

## Event emitter

Subscribe to queue events for analytics integration (Sentry, Amplitude, etc.). All listeners return an unsubscribe function.

```ts
import { getOrCreateGlobalContext } from 'vue-toast-kit'

const queue = getOrCreateGlobalContext().queue

const off = queue.onAdd((item) => {
  analytics.track('toast_shown', { type: item.options.type, message: item.message })
})

queue.onDismiss((id) => {
  analytics.track('toast_dismissed', { id })
})

queue.onUpdate((id, partial) => {
  analytics.track('toast_updated', { id, ...partial })
})

// Unsubscribe when done:
off()
```

---

## Rate limiting & localStorage persist

```ts
import { createToastContext } from 'vue-toast-kit'

// Max 3 toasts per second; extras are silently dropped
const ctx = createToastContext({ rateLimit: 3, rateLimitWindowMs: 1000 })

// Restore toasts with persist:true after page reload
const ctx2 = createToastContext({ persistStorage: true })
```

Or configure globally via the plugin:

```ts
app.use(VueToastPlugin, {
  rateLimit: 5,
  persistStorage: true,
})
```

Mark individual toasts as persistent:

```ts
toast.info('Maintenance window tonight', { persist: true, duration: 0 })
// This toast survives a page reload
```

---

## Testing utilities

```ts
import { createMockToast, mockUseToast } from 'vue-toast-kit/testing'

// In a Vitest / Jest test:
describe('MyComponent', () => {
  it('calls toast.success on save', async () => {
    const mockToast = mockUseToast()
    vi.mock('vue-toast-kit', () => ({ useToast: () => mockToast }))

    // render component, trigger save…

    expect(mockToast.success).toHaveBeenCalledWith('Saved!')
  })
})

// Create a minimal ToastItem stub:
const item = createMockToast({
  message: 'Upload complete',
  options: { type: 'success', duration: 3000 },
})
```

---

## Migration from vue-toastification / vue-sonner

### API compatibility table

| vue-toastification | vue-sonner | vue-toast-kit |
|---|---|---|
| `useToast()` | — | `useToast()` |
| `toast(msg, { type: TYPE.SUCCESS })` | `toast.success(msg)` | `toast.success(msg)` |
| `toast(msg, { type: TYPE.ERROR })` | `toast.error(msg)` | `toast.error(msg)` |
| `toast(msg, { type: TYPE.WARNING })` | — | `toast.warning(msg)` |
| `toast(msg, { type: TYPE.INFO })` | `toast(msg)` | `toast.info(msg)` |
| `toast.loading(msg)` | `toast.loading(msg)` | `toast.loading(msg)` |
| `POSITION.BOTTOM_RIGHT` | — | `'bottom-right'` |
| `POSITION.TOP_CENTER` | — | `'top-center'` |
| `toast.dismiss(id)` | `toast.dismiss(id)` | `toast.dismiss(id)` |
| `toast.update(id, opts)` | — | `toast.update(id, opts)` |
| — | `toast.promise()` | `toast.promise()` |
| — | — | `toast.undo()` |
| — | — | Priority queue |
| — | — | Grouping |
| — | — | `useToastState()` headless |
| — | — | `createToastContext()` |

### Migrating from vue-toastification

```ts
// Before
import { useToast, TYPE, POSITION } from 'vue-toastification'
const toast = useToast()
toast('Hello', { type: TYPE.SUCCESS, position: POSITION.BOTTOM_RIGHT })

// After
import { useToast } from 'vue-toast-kit'
const toast = useToast()
toast.success('Hello')  // position is set globally in the plugin
```

### Migrating from vue-sonner

`toast.success()`, `toast.error()`, `toast.promise()`, and `toast.dismiss()` are identical. The only difference is that `<ToastContainer />` replaces `<Toaster />`:

```vue
<!-- Before (vue-sonner) -->
<Toaster position="bottom-right" />

<!-- After (vue-toast-kit) -->
<ToastContainer position="bottom-right" />
```

---

## License

MIT

---

## Author

macrulezru

GitHub: [macrulezru](https://github.com/macrulezru) · Website: [macrulez.ru/en](https://macrulez.ru/en)

Bugs and questions — [issues](https://github.com/macrulezru/vue-toast-kit/issues)

---

## 💖 Support the project

Open source takes time and effort. If this package saves you time or brings value, consider supporting further development.

<a href="https://donate.cryptocloud.plus/M6O34NIN" target="_blank">
  <img src="https://img.shields.io/badge/Donate-CryptoCloud-8A2BE2?style=for-the-badge&logo=cryptocurrency&logoColor=white" alt="Donate via CryptoCloud">
</a>

Thank you for being part of this journey. ❤️
