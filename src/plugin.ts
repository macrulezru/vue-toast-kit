import type { App, Plugin } from 'vue'
import { installContext } from './composables/useToastContext'
import ToastContainer from './components/ToastContainer.vue'
import type { GlobalToastOptions } from './core/types'

export interface VueToastPluginOptions extends GlobalToastOptions {
  registerComponent?: boolean
}

export const VueToastPlugin: Plugin<VueToastPluginOptions | void> = {
  install(app: App, options?: VueToastPluginOptions) {
    installContext(app, options ?? {})

    if (options?.registerComponent !== false) {
      app.component('ToastContainer', ToastContainer)
    }
  },
}
