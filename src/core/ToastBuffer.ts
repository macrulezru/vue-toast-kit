import type { VNode } from 'vue'
import type { ToastOptions } from './types'

interface BufferedToast {
  message: string | VNode
  options: ToastOptions
}

export const isServer = typeof window === 'undefined'

export class ToastBuffer {
  private buffer: BufferedToast[] = []
  private flushed = false
  private flushCallbacks: Array<(items: BufferedToast[]) => void> = []

  push(message: string | VNode, options: ToastOptions): void {
    if (this.flushed) return
    this.buffer.push({ message, options })
  }

  onFlush(cb: (items: BufferedToast[]) => void): void {
    this.flushCallbacks.push(cb)
  }

  flush(): void {
    if (this.flushed) return
    this.flushed = true
    const items = [...this.buffer]
    this.buffer = []
    for (const cb of this.flushCallbacks) {
      cb(items)
    }
    this.flushCallbacks = []
  }

  isFlushed(): boolean {
    return this.flushed
  }

  get size(): number {
    return this.buffer.length
  }
}

export const globalBuffer = new ToastBuffer()
