<script setup lang="ts">
import { useToast } from 'vue-toast-kit'

const toast = useToast()
let msgCount = 0

function sendMessage() {
  msgCount++
  toast.info(`New message #${msgCount} from a user`, {
    groupKey: 'chat-messages',
    duration: 8000,
  })
}

function sendNotification() {
  toast.success('File uploaded', {
    groupKey: 'uploads',
    duration: 6000,
  })
}

function sendError() {
  toast.error('Sync error', {
    groupKey: 'sync-errors',
    duration: 0,
    closable: true,
  })
}

function dismissAll() {
  toast.dismiss()
  msgCount = 0
}
</script>

<template>
  <div class="demo-section">
    <div class="demo-title">Toast grouping</div>
    <div class="demo-desc">
      Toasts with the same groupKey are collapsed into a stack with a +N counter.
      Click the counter to expand the group.
    </div>

    <div class="card">
      <div class="card__title">Send multiple toasts of the same type</div>
      <div class="btn-grid">
        <button class="btn btn--info"      @click="sendMessage()">Chat message</button>
        <button class="btn btn--success"   @click="sendNotification()">File upload</button>
        <button class="btn btn--error"     @click="sendError()">Sync error</button>
        <button class="btn btn--secondary" @click="dismissAll()">Dismiss all</button>
      </div>
    </div>

    <div class="card info-card">
      <div class="info-icon">💡</div>
      <div>
        <strong>How it works:</strong> when a toast with the same <code>groupKey</code> is added,
        the first toast gets a +N counter and subsequent ones are hidden.
        Clicking +N expands the stack.
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-card { display: flex; gap: 0.75rem; align-items: flex-start; }
.info-icon { font-size: 1.25rem; flex-shrink: 0; }
code {
  font-family: 'Menlo', 'Consolas', monospace;
  font-size: 0.8125rem;
  background: var(--app-bg);
  padding: 0.1em 0.35em;
  border-radius: 4px;
}
</style>
