<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toast-kit'

const toast = useToast()
const delay = ref(2000)
const shouldFail = ref(false)

function fakeRequest(fail: boolean): Promise<{ name: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fail) reject(new Error('Server unavailable'))
      else resolve({ name: 'document.pdf' })
    }, delay.value)
  })
}

async function runPromise() {
  await toast.promise(
    fakeRequest(shouldFail.value),
    {
      loading: 'Uploading file…',
      success: (data) => `File "${data.name}" uploaded!`,
      error:   (err)  => `Error: ${(err as Error).message}`,
    },
  ).catch(() => {})
}

async function runChain() {
  const step1 = fakeRequest(false)
  const step2 = step1.then(() => fakeRequest(false))

  await toast.promise(step1, { loading: 'Step 1: Authenticating…', success: 'Authenticated!',   error: 'Authentication failed' }).catch(() => {})
  await toast.promise(step2, { loading: 'Step 2: Fetching data…',  success: 'Data loaded!',      error: 'Failed to load data'   }).catch(() => {})
}
</script>

<template>
  <div class="demo-section">
    <div class="demo-title">Promise API</div>
    <div class="demo-desc">toast.promise() automatically switches loading → success / error based on the promise result</div>

    <div class="card">
      <div class="card__title">Settings</div>
      <div class="controls">
        <label class="control">
          <span>Delay (ms)</span>
          <input type="range" v-model.number="delay" min="500" max="5000" step="250" />
          <span class="control__value">{{ delay }} ms</span>
        </label>
        <label class="control control--checkbox">
          <input type="checkbox" v-model="shouldFail" />
          <span>Simulate error</span>
        </label>
      </div>
    </div>

    <div class="card">
      <div class="card__title">Try it</div>
      <div class="btn-grid">
        <button class="btn btn--primary" @click="runPromise()">
          Run toast.promise()
        </button>
        <button class="btn btn--ghost" @click="runChain()">
          Chain of 2 promises
        </button>
      </div>

      <div class="flow-diagram">
        <div class="flow-step flow-step--loading">loading</div>
        <div class="flow-arrow">→</div>
        <div class="flow-step flow-step--success">success</div>
        <div class="flow-or">or</div>
        <div class="flow-step flow-step--error">error</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.controls { display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end; }
.control { display: flex; flex-direction: column; gap: 0.375rem; font-size: 0.8125rem; color: var(--app-text-muted); }
.control--checkbox { flex-direction: row; align-items: center; gap: 0.5rem; }
.control input[type="range"] { width: 180px; }
.control__value { font-weight: 600; color: var(--app-text); }

.flow-diagram {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.25rem;
  flex-wrap: wrap;
}
.flow-step {
  padding: 0.375rem 0.875rem;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 600;
}
.flow-step--loading { background: var(--app-badge-loading-bg); color: var(--app-badge-loading-text); }
.flow-step--success { background: var(--app-badge-success-bg); color: var(--app-badge-success-text); }
.flow-step--error   { background: var(--app-badge-error-bg);   color: var(--app-badge-error-text); }
.flow-arrow { color: var(--app-text-muted); }
.flow-or { color: var(--app-text-muted); font-size: 0.8125rem; }
</style>
