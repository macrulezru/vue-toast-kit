# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-01

### Added
- `toast()`, `toast.success()`, `toast.error()`, `toast.warning()`, `toast.info()`, `toast.loading()`, `toast.custom()` — full type API
- `toast.promise()` — loading → success/error flow
- `toast.undo()` — dismissible toast with countdown timer
- `toast.update()`, `toast.updateMessage()` — live toast updates
- `toast.dismiss()`, `toast.dismissAll()` — programmatic dismissal
- `toast.pauseAll()`, `toast.resumeAll()` — global pause
- `useToastState()` — headless API with `active`, `pending`, `count`, `has()`
- `createToastContext()` — isolated context for micro-frontends
- `ToastContainer` component with `<Teleport>`, `<TransitionGroup>`, all 6 positions
- `stackMode` prop — Sonner-style collapsing stack
- Priority queue: `critical > high > normal > low` with eviction
- Group toasts by `groupKey` with expand/collapse
- Swipe-to-dismiss (mobile)
- Pause on hover / focus loss (`visibilitychange`)
- Full keyboard navigation (Escape to close)
- RTL support via CSS logical properties
- Design system with CSS custom properties, `theme` prop (`light | dark | system | tokens`)
- `ToastDesignTokens` TypeScript type for IDE autocomplete
- Vue 3 Plugin (`VueToastPlugin`) and Nuxt 3 Module (`vue-toast-kit/nuxt`)
- SSR-safe via `ToastBuffer` (hydration from server to client)
- Event emitter: `queue.onAdd()`, `queue.onDismiss()`, `queue.onUpdate()`
- Rate limiting via `rateLimit` option
- `persist: true` — restore toasts from `localStorage` on page reload
- Focus return to previously focused element after dismiss
- Testing utilities: `createMockToast()`, `mockUseToast()`
- `src/testing.ts` for Vitest / Jest mock helpers

### Peer Dependencies
- `vue ^3.3.0`
