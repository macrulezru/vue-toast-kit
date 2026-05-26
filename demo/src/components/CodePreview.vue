<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  code: string
  language?: string
  label?: string
}>()

const copied = ref(false)

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code.trim())
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch { /* noop */ }
}
</script>

<template>
  <div class="code-preview">
    <div class="code-preview__header">
      <span v-if="label" class="code-preview__label">{{ label }}</span>
      <span v-else-if="language" class="code-preview__label">{{ language }}</span>
      <button class="code-preview__copy" type="button" @click="copy">
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
    </div>
    <pre class="code-preview__pre"><code>{{ code.trim() }}</code></pre>
  </div>
</template>

<style scoped>
.code-preview {
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--app-border);
  background: #0d1117;
  font-size: 0.8125rem;
}

.code-preview__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background: #161b22;
  border-bottom: 1px solid #30363d;
}

.code-preview__label {
  color: #8b949e;
  font-size: 0.75rem;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

.code-preview__copy {
  background: transparent;
  border: 1px solid #30363d;
  color: #8b949e;
  border-radius: 6px;
  padding: 0.2rem 0.6rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: color 150ms, border-color 150ms;
}

.code-preview__copy:hover {
  color: #e6edf3;
  border-color: #8b949e;
}

.code-preview__pre {
  margin: 0;
  padding: 1rem;
  overflow-x: auto;
  color: #e6edf3;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  line-height: 1.6;
  tab-size: 2;
}

.code-preview__pre code {
  font-family: inherit;
}
</style>
