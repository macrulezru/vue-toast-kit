<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toast-kit'

const toast = useToast()
const log = ref<string[]>([])
const undoDuration = ref(5000)

function addLog(msg: string) {
  log.value.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`)
  if (log.value.length > 8) log.value.pop()
}

function deleteFile() {
  addLog('File "report.pdf" marked for deletion…')
  toast.undo('File "report.pdf" deleted', {
    undo: {
      label: 'Restore',
      duration: undoDuration.value,
      onUndo: () => {
        addLog('File "report.pdf" restored!')
        toast.success('File restored')
      },
    },
    onAutoClose: () => {
      addLog('Timer expired — file permanently deleted')
    },
  })
}

function deleteMany() {
  const items = ['image.jpg', 'video.mp4', 'data.csv']
  items.forEach((name) => {
    toast.undo(`File "${name}" deleted`, {
      undo: {
        label: 'Undo',
        duration: undoDuration.value,
        onUndo: () => {
          addLog(`File "${name}" restored!`)
        },
      },
    })
  })
}

function archiveEmail() {
  addLog('Email moved to archive…')
  toast.undo('Email archived', {
    icon: '📨',
    undo: {
      duration: undoDuration.value,
      onUndo: () => {
        addLog('Email moved back to inbox')
        toast.info('Email moved back to inbox')
      },
    },
  })
}
</script>

<template>
  <div class="demo-section">
    <div class="demo-title">Undo actions</div>
    <div class="demo-desc">toast.undo() shows a toast with a countdown progress bar. Click Undo before the timer runs out.</div>

    <div class="card">
      <div class="card__title">Settings</div>
      <label class="control">
        <span>Time to undo</span>
        <input type="range" v-model.number="undoDuration" min="2000" max="10000" step="500" />
        <span class="control__value">{{ undoDuration / 1000 }} sec</span>
      </label>
    </div>

    <div class="card">
      <div class="card__title">Scenarios</div>
      <div class="btn-grid">
        <button class="btn btn--error"   @click="deleteFile()">Delete file</button>
        <button class="btn btn--warning" @click="deleteMany()">Delete 3 files</button>
        <button class="btn btn--ghost"   @click="archiveEmail()">Archive email</button>
      </div>
    </div>

    <div class="card" v-if="log.length">
      <div class="card__title">Event log</div>
      <div class="log">
        <div v-for="(line, i) in log" :key="i" class="log__line">{{ line }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.control { display: flex; flex-direction: column; gap: 0.375rem; font-size: 0.8125rem; color: var(--app-text-muted); }
.control input[type="range"] { width: 220px; }
.control__value { font-weight: 600; color: var(--app-text); }

.log {
  font-family: 'Menlo', 'Consolas', monospace;
  font-size: 0.8125rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.log__line {
  padding: 0.375rem 0.625rem;
  background: var(--app-bg);
  border-radius: 6px;
  color: var(--app-text-muted);
}
.log__line:first-child { color: var(--app-text); font-weight: 500; }
</style>
