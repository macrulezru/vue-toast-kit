# **Toast Kit**

![Toast Kit](https://github.com/macrulezru/assets/blob/master/packages-images/vue-toast-kit-vuecraft.png?raw=true)

Promise-API with auto type switching, priority queue with preemption, undo-actions with progress timer, toast grouping, headless mode, and a full design system via CSS custom properties — all with a single peer dependency (Vue 3).

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
- **Accessibility** — `role="alert"` for `error`, `warning`, and `critical` priority; `role="status"` for others; `aria-live="assertive"` for critical priority; `Escape` closes the focused toast
- **Touch support** — swipe left or right to dismiss
- **RTL support** — the close button's margin uses a CSS logical property so it mirrors automatically when `dir="rtl"` is set on `<html>`
- **Pause on hover / focus loss** — timers freeze automatically; `visibilitychange` stops all timers when the tab goes to the background
- **Animations** — CSS-only slide + fade per position; `prefers-reduced-motion` degrades to fade-only
- **Vue Plugin + Nuxt Module** — `app.use(VueToastPlugin)` for Vue 3; `modules: ['vue-toast-kit/nuxt']` for Nuxt 3 with auto-imports
- **Zero external runtime dependencies** — only Vue 3 as peer dep; full ESM + CJS, tree-shakeable

---

## When you'd reach for this

Showing the result of an action without interrupting the user with a modal alert() or hiding it in a console they'll never open — that's where vue-toast-kit starts.

- **An action's outcome isn't known upfront** — A server request can hang, succeed, or fail — instead of manually showing a different notification in every branch of the code, the same notification switches on its own between "loading," "done," and "error."
- **Deleting something should be reversible** — One stray click on "Delete" and the data is gone for good. The notification itself gives you a few seconds to undo, before the action is confirmed for real.
- **The same event fires dozens of times in a row** — Syncing ten files shouldn't mean ten popping cards in a row — one notification with a counter that expands on click covers it instead.
- **Toasts should look like your product, not a library** — The look adapts to any brand without writing a single extra line of styling, and when you need full control, you can drop the visuals entirely and keep just the underlying logic for your own design.

---

## Installation

Requires Vue `3.3+`. Nuxt `3+` is only needed if you use `vue-toast-kit/nuxt`. No other runtime dependencies.

```bash
npm install vue-toast-kit
```

Peer dependency:

```bash
npm install "vue@>=3.3"
```

### Quick start — Vue 3

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

```vue
<!-- App.vue -->
<template>
  <RouterView />
  <ToastContainer />
</template>
```

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

### Quick start — Nuxt 3

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

```vue
<!-- layouts/default.vue -->
<template>
  <div>
    <slot />
    <ToastContainer />
    <!-- auto-imported -->
  </div>
</template>
```

### More examples

#### One call, three toast states

`toast.promise` flips the toast from loading to success or error based on the promise's outcome, and returns that same promise so `await` keeps working as usual.

```ts
import { toast } from 'vue-toast-kit'

await toast.promise(fetch('/api/deploy').then((r) => r.json()), {
  loading: 'Deploying…',
  success: 'Deployed successfully!',
  error: 'Deployment failed',
})

// One call, three states — the toast flips from loading to success/error
// on its own, and the original promise is still returned so you can await it.
```

#### Deletion with a real window to undo, not instant

`toast.undo` shows a countdown progress bar — the actual delete (`permanentlyDelete`) only happens once time runs out and the user hasn't clicked Restore.

```ts
import { toast } from 'vue-toast-kit'

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

// A countdown progress bar gives the user a real window to change their
// mind — the delete only actually happens once the timer runs out unanswered.
```

#### Similar toasts collapse into one

Toasts sharing a `groupKey` collapse into a single one with a "+N" counter — dismiss the leader and the next one takes its place automatically, so the screen doesn't fill up with near-identical notifications.

```ts
import { toast } from 'vue-toast-kit'

// All three calls produce one visible toast, with a "+2" counter
toast.info('New message from Alice', { groupKey: 'messages' })
toast.info('New message from Bob', { groupKey: 'messages' })
toast.info('New message from Carol', { groupKey: 'messages' })

// The leader (first in the group) stays visible; when it's dismissed, the
// next toast in the group takes over automatically.
```

---

## Documentation & links

- 📖 **Full documentation:** [npm.vuecraft.ru/en/packages/vue-toast-kit](https://npm.vuecraft.ru/en/packages/vue-toast-kit/guide/overview.html)
- 🌐 **VueCraft:** [vuecraft.ru/en](https://vuecraft.ru/en)
- 👤 **Author:** [macrulez.ru/en](https://macrulez.ru/en)
- 💻 **GitHub:** [macrulezru/vue-toast-kit](https://github.com/macrulezru/vue-toast-kit)
- 📦 **NPM:** [vue-toast-kit](https://www.npmjs.com/package/vue-toast-kit)
- 🐛 **Issues:** [github.com/macrulezru/vue-toast-kit/issues](https://github.com/macrulezru/vue-toast-kit/issues)

---

## License

MIT

---

## 💖 Support the project

Open source takes time and effort. If this library saves you time or brings value, consider supporting further development.

<a href="https://donate.cryptocloud.plus/M6O34NIN" target="_blank">
  <img src="https://img.shields.io/badge/Donate-CryptoCloud-8A2BE2?style=for-the-badge&logo=cryptocurrency&logoColor=white" alt="Donate via CryptoCloud">
</a>

Thank you for being part of this journey. ❤️
