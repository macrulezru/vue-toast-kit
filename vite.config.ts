import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['src/nuxt/**'],
      outDir: 'dist',
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: {
        'vue-toast-kit': resolve(__dirname, 'src/index.ts'),
        'nuxt/module': resolve(__dirname, 'src/nuxt/module.ts'),
        'nuxt/plugin': resolve(__dirname, 'src/nuxt/plugin.ts'),
        testing: resolve(__dirname, 'src/testing.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) =>
        format === 'es' ? `${entryName}.js` : `${entryName}.cjs`,
    },
    rollupOptions: {
      // '#app' is a Nuxt-only virtual alias with no real module to resolve outside a
      // Nuxt app build — only src/nuxt/plugin.ts imports it, left unresolved here so
      // Nuxt's own bundler resolves it when it later processes dist/nuxt/plugin.js.
      external: ['vue', 'nuxt', '@nuxt/kit', 'pathe', '#app'],
      output: {
        globals: { vue: 'Vue' },
        assetFileNames: 'style.css',
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
})
