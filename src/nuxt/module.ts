import { defineNuxtModule, addPlugin, createResolver, addImports, addComponent } from '@nuxt/kit'
import type { GlobalToastOptions } from '../core/types'

export interface ModuleOptions extends GlobalToastOptions {
  registerComponent?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'vue-toast-kit',
    configKey: 'vueToastKit',
    compatibility: { nuxt: '>=3.0.0' },
  },
  defaults: {
    position: 'bottom-right',
    maxVisible: 5,
    duration: 4000,
    theme: 'system',
    closable: true,
    pauseOnHover: true,
    pauseOnFocusLoss: true,
    registerComponent: true,
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Pass module options to runtimeConfig
    nuxt.options.runtimeConfig.public.vueToastKit = options as Record<string, unknown>

    // Register Nuxt plugin
    addPlugin(resolver.resolve('./plugin'))

    // Auto-imports composables — sourced from the package's own main entry
    // (already built and exported there) rather than deep src/dist paths, which
    // the lib build never mirrors 1:1 and would otherwise leave unresolved.
    addImports([
      { name: 'useToast', from: 'vue-toast-kit' },
      { name: 'useToastState', from: 'vue-toast-kit' },
      { name: 'createToastContext', from: 'vue-toast-kit' },
      { name: 'toast', from: 'vue-toast-kit' },
    ])

    // Auto-import components — same reasoning as addImports above.
    if (options.registerComponent !== false) {
      addComponent({
        name: 'ToastContainer',
        export: 'ToastContainer',
        filePath: 'vue-toast-kit',
      })
    }

    // Inject CSS
    nuxt.options.css.push('vue-toast-kit/style.css')
  },
})
