<script setup lang="ts">
import { reactive } from 'vue'
import { ToastContainer, useToast, createToastContext } from 'vue-toast-kit'
import type { ToastDesignTokens } from 'vue-toast-kit'

const toast = useToast()
const demoCtx  = createToastContext({ maxVisible: 5 })
const demoToast = useToast(demoCtx)

const tokens = reactive<ToastDesignTokens>({
  colorBg:            '#ffffff',
  colorText:          '#1a1a1a',
  colorBorder:        'rgba(0,0,0,0.08)',
  colorSuccess:       '#16a34a',
  colorError:         '#dc2626',
  colorWarning:       '#d97706',
  colorInfo:          '#2563eb',
  borderRadius:       '10px',
  shadow:             '0 4px 16px rgba(0,0,0,0.10)',
  fontSize:           '0.875rem',
  fontWeight:         '400',
  paddingX:           '1rem',
  paddingY:           '0.75rem',
  maxWidth:           '400px',
  transitionDuration: '300ms',
})

const presets = {
  default: {
    colorBg: '#ffffff', colorText: '#1a1a1a', borderRadius: '10px',
    shadow: '0 4px 16px rgba(0,0,0,0.10)', fontSize: '0.875rem',
    colorBorder: 'rgba(0,0,0,0.08)',
  },
  minimal: {
    colorBg: '#f9fafb', colorText: '#374151', borderRadius: '4px',
    shadow: '0 1px 4px rgba(0,0,0,0.08)', fontSize: '0.8125rem',
    colorBorder: '#e5e7eb',
  },
  rounded: {
    colorBg: '#ffffff', colorText: '#1a1a1a', borderRadius: '999px',
    shadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: '0.875rem',
    colorBorder: 'rgba(0,0,0,0.06)', paddingX: '1.25rem',
  },
  glass: {
    colorBg: 'rgba(255,255,255,0.7)', colorText: '#1a1a1a',
    borderRadius: '14px', shadow: '0 8px 32px rgba(0,0,0,0.12)',
    colorBorder: 'rgba(255,255,255,0.6)', fontSize: '0.875rem',
  },
  dark: {
    colorBg: '#1c1c1e', colorText: '#f5f5f7', borderRadius: '10px',
    shadow: '0 4px 20px rgba(0,0,0,0.5)', fontSize: '0.875rem',
    colorBorder: 'rgba(255,255,255,0.08)',
    colorSuccess: '#34d399', colorError: '#f87171',
    colorWarning: '#fbbf24', colorInfo: '#60a5fa',
  },
}

function applyPreset(name: keyof typeof presets) {
  Object.assign(tokens, presets[name])
}

function exportCSS() {
  const lines = Object.entries(tokens)
    .filter(([, v]) => v)
    .map(([k, v]) => {
      const cssVar = '--vtk-' + k.replace(/([A-Z])/g, '-$1').toLowerCase()
      return `  ${cssVar}: ${v};`
    })
  const css = `:root {\n${lines.join('\n')}\n}`
  navigator.clipboard.writeText(css)
  toast.success('CSS copied to clipboard!')
}

function showAllTypes() {
  demoToast.success('Success!',  { theme: tokens as ToastDesignTokens })
  setTimeout(() => demoToast.error('Error!',    { theme: tokens as ToastDesignTokens }), 200)
  setTimeout(() => demoToast.warning('Warning', { theme: tokens as ToastDesignTokens }), 400)
  setTimeout(() => demoToast.info('Info',       { theme: tokens as ToastDesignTokens }), 600)
}
</script>

<template>
  <div class="demo-section">
    <div class="demo-title">Design System</div>
    <div class="demo-desc">Edit CSS tokens in real time and export the result as CSS variables</div>

    <div class="presets">
      <button
        v-for="(_, name) in presets"
        :key="name"
        class="btn btn--ghost"
        @click="applyPreset(name as keyof typeof presets)"
      >
        {{ name }}
      </button>
    </div>

    <div class="editor-layout">
      <div class="token-editor">
        <div class="card">
          <div class="card__title">Colors &amp; borders</div>
          <div class="token-grid">
            <label v-for="[key, label] in [
              ['colorBg',      'Background'],
              ['colorText',    'Text'],
              ['colorBorder',  'Border'],
              ['colorSuccess', 'Success'],
              ['colorError',   'Error'],
              ['colorWarning', 'Warning'],
              ['colorInfo',    'Info'],
            ]" :key="key" class="token-row">
              <span class="token-label">{{ label }}</span>
              <div class="token-inputs">
                <input
                  v-if="!tokens[key as keyof ToastDesignTokens]?.includes('rgba') && !tokens[key as keyof ToastDesignTokens]?.includes('rgb')"
                  type="color"
                  :value="tokens[key as keyof ToastDesignTokens] || '#000000'"
                  class="color-picker"
                  @input="(e) => (tokens as Record<string, string>)[key] = (e.target as HTMLInputElement).value"
                />
                <input
                  type="text"
                  :value="tokens[key as keyof ToastDesignTokens]"
                  class="token-input"
                  @input="(e) => (tokens as Record<string, string>)[key] = (e.target as HTMLInputElement).value"
                />
              </div>
            </label>
          </div>
        </div>

        <div class="card">
          <div class="card__title">Typography &amp; shape</div>
          <div class="token-grid">
            <label v-for="[key, label] in [
              ['fontSize',           'Font size'],
              ['borderRadius',       'Border radius'],
              ['paddingX',           'Padding X'],
              ['paddingY',           'Padding Y'],
              ['maxWidth',           'Max width'],
              ['transitionDuration', 'Transition'],
              ['shadow',             'Shadow'],
            ]" :key="key" class="token-row">
              <span class="token-label">{{ label }}</span>
              <input
                type="text"
                :value="tokens[key as keyof ToastDesignTokens]"
                class="token-input"
                @input="(e) => (tokens as Record<string, string>)[key] = (e.target as HTMLInputElement).value"
              />
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card__title">Preview</div>
      <div class="btn-grid">
        <button class="btn btn--primary" @click="showAllTypes()">Show all types</button>
        <button class="btn btn--ghost"   @click="exportCSS()">Copy CSS</button>
      </div>
    </div>

    <ToastContainer
      :context="demoCtx"
      position="bottom-left"
      :theme="tokens as ToastDesignTokens"
      :z-index="10002"
    />
  </div>
</template>

<style scoped>
.presets { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
.editor-layout { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1rem; }
.token-editor { display: flex; flex-direction: column; gap: 1rem; }
.token-grid { display: flex; flex-direction: column; gap: 0.5rem; }
.token-row { display: flex; align-items: center; gap: 0.75rem; }
.token-label { width: 130px; flex-shrink: 0; font-size: 0.8125rem; color: var(--app-text-muted); }
.token-inputs { display: flex; gap: 0.5rem; align-items: center; flex: 1; }
.color-picker { width: 36px; height: 28px; border: 1px solid var(--app-border); border-radius: 6px; cursor: pointer; padding: 1px; background: none; }
.token-input {
  flex: 1;
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--app-border);
  border-radius: 6px;
  font-size: 0.8125rem;
  font-family: 'Menlo', 'Consolas', monospace;
  background: var(--app-bg);
  color: var(--app-text);
}
</style>
