// Ambient declaration for Nuxt's runtime-only "#app" alias, which only resolves
// inside a real Nuxt app build. Without this, tsc/vite-plugin-dts (which type-check
// src/nuxt/plugin.ts as part of this package's own build) can't resolve the import
// at all. The real, richer NuxtApp type is provided by Nuxt itself at the consuming
// app's build time — this shim only needs to cover what plugin.ts actually reads.
declare module '#app' {
  export function defineNuxtPlugin<T extends Record<string, unknown> = Record<string, unknown>>(
    plugin: (nuxtApp: {
      vueApp: import('vue').App
      $config?: { public?: Record<string, unknown> }
    }) => T | void,
  ): T
}
