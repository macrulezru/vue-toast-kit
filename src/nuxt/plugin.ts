import { defineNuxtPlugin } from '#app'
import { VueToastPlugin } from '../plugin'
import type { VueToastPluginOptions } from '../plugin'

export default defineNuxtPlugin<{ toastOptions: VueToastPluginOptions }>((nuxtApp) => {
  const options = (nuxtApp.$config?.public?.vueToastKit ?? {}) as VueToastPluginOptions
  nuxtApp.vueApp.use(VueToastPlugin, options)
})
