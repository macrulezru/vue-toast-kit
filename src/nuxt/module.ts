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

    // Auto-imports composables
    addImports([
      { name: 'useToast', from: resolver.resolve('../composables/useToast') },
      { name: 'useToastState', from: resolver.resolve('../composables/useToastState') },
      { name: 'createToastContext', from: resolver.resolve('../composables/useToastContext') },
      { name: 'toast', from: resolver.resolve('../composables/useToast') },
    ])

    // Auto-import components
    if (options.registerComponent !== false) {
      addComponent({
        name: 'ToastContainer',
        filePath: resolver.resolve('../components/ToastContainer.vue'),
      })
    }

    // Inject CSS
    nuxt.options.css.push('vue-toast-kit/style.css')
  },
})
