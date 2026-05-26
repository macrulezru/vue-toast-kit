export class UndoTimer {
  private timerId: ReturnType<typeof setTimeout> | null = null
  private tickId: ReturnType<typeof setInterval> | null = null
  private elapsed = 0
  private startTime = 0
  private _remaining = 1
  private _isPaused = false

  private static readonly TICK_INTERVAL = 50

  readonly duration: number
  readonly onExpire: () => void
  readonly onTick?: (remaining: number) => void

  constructor(duration: number, onExpire: () => void, onTick?: (remaining: number) => void) {
    this.duration = duration
    this.onExpire = onExpire
    this.onTick = onTick
  }

  get remaining(): number {
    return this._remaining
  }

  get isPaused(): boolean {
    return this._isPaused
  }

  start(): void {
    this.elapsed = 0
    this._remaining = 1
    this.startTime = Date.now()
    this.scheduleExpiry(this.duration)
    if (this.onTick) this.startTick()
  }

  pause(): void {
    if (this._isPaused) return
    this._isPaused = true
    this.elapsed += Date.now() - this.startTime
    this.clearExpiry()
    this.clearTick()
  }

  resume(): void {
    if (!this._isPaused) return
    this._isPaused = false
    const remainingMs = this.duration - this.elapsed
    this.startTime = Date.now()
    this.scheduleExpiry(remainingMs)
    if (this.onTick) this.startTick()
  }

  destroy(): void {
    this.clearExpiry()
    this.clearTick()
  }

  private scheduleExpiry(delay: number): void {
    this.timerId = setTimeout(() => {
      this.clearTick()
      this._remaining = 0
      this.onTick?.(0)
      this.timerId = null
      this.onExpire()
    }, delay)
  }

  private clearExpiry(): void {
    if (this.timerId !== null) {
      clearTimeout(this.timerId)
      this.timerId = null
    }
  }

  private startTick(): void {
    this.tickId = setInterval(() => {
      const totalElapsed = this.elapsed + (Date.now() - this.startTime)
      this._remaining = Math.max(0, 1 - totalElapsed / this.duration)
      this.onTick?.(this._remaining)
    }, UndoTimer.TICK_INTERVAL)
  }

  private clearTick(): void {
    if (this.tickId !== null) {
      clearInterval(this.tickId)
      this.tickId = null
    }
  }
}
