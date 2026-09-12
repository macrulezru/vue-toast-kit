# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-09-12

### Fixed
- Published TypeScript types were broken for the main entry (all 5 Vue components — `ToastContainer`, `Toast`, `ToastIcon`, `ToastProgressBar`, `ToastActions` — silently degraded to untyped `any` props) and for the `vue-toast-kit/nuxt` subpath (blank/failing types).
- `installContext()` was silently sharing one `ToastQueue`/SSR buffer singleton across every `app.use(VueToastPlugin, ...)` call — a real cross-request/cross-instance leak risk (e.g. under SSR, or multiple Vue apps on the same page). Each install now gets its own isolated context.

## [1.0.7] - 2026-09-06

### Docs
- Added a "When you'd reach for this" section to the README.

## [1.0.6] - 2026-09-05

### Docs
- Added more usage examples to the README, pulled from the site's live code demos.

## [1.0.5] - 2026-09-04

### Docs
- Rewrote the README as a slim overview that links out to the full docs site, instead of duplicating it.

## [1.0.4] - 2026-09-03

### Fixed
- Nuxt module (`vue-toast-kit/nuxt`) — `addPlugin()`, `addImports()`, and `addComponent()` referenced source files that were never emitted to `dist/`, so any app using `modules: ['vue-toast-kit/nuxt']` failed at build time. Composables and `ToastContainer` auto-imports now resolve from the package's own main entry (already built); the runtime plugin is now built as its own `dist/nuxt/plugin.{js,cjs}` entry.
- `vue-toast-kit/testing` — the subpath was missing from `package.json`'s `exports` map and had no built `.js`/`.cjs` output, so importing `createMockToast`/`mockUseToast` as documented threw `ERR_PACKAGE_PATH_NOT_EXPORTED`.
- `GlobalToastOptions` passed to `app.use(VueToastPlugin, {...})` or a Nuxt app's `vueToastKit: {...}` config — `position`, `theme`, `duration`, `closable`, `pauseOnHover`, `pauseOnFocusLoss`, and `ignoreSSR` were accepted by the option type but never actually applied anywhere. They now flow through to `ToastContainer`'s defaults (`position`/`theme`/`maxVisible`) and to each toast's own defaults (`duration`/`closable`/`pauseOnHover`/`pauseOnFocusLoss`); `ignoreSSR: true` now actually discards server-rendered toasts instead of buffering them.
- Removed dead code: `src/nuxt/composables.ts` (an unreachable re-export shim for a subpath that was never in `exports`), an unused `Teleport`/`TransitionGroup` import in `ToastContainer.vue`.

### Added
- `GLOBAL_OPTIONS_KEY` export — the injection key `ToastContainer` uses to read plugin/module-level defaults, for advanced consumers building a custom container.

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
