// Pulls in the ambient "#app" module shim (src/nuxt/nuxt-env.d.ts) without widening
// tsconfig's src/nuxt exclude — the only mechanism that reaches an ambient .d.ts
// living inside an excluded directory.
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./nuxt-env.d.ts" />
import { defineNuxtPlugin } from '#app'
import { VueToastPlugin } from '../plugin'
import type { VueToastPluginOptions } from '../plugin'

export default defineNuxtPlugin<{ toastOptions: VueToastPluginOptions }>((nuxtApp) => {
  const options = (nuxtApp.$config?.public?.vueToastKit ?? {}) as VueToastPluginOptions
  nuxtApp.vueApp.use(VueToastPlugin, options)
})
