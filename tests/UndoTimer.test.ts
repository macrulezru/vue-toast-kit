import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { UndoTimer } from '../src/core/UndoTimer'

describe('UndoTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls onExpire after duration', async () => {
    const onExpire = vi.fn()
    const timer = new UndoTimer(1000, onExpire)
    timer.start()
    await vi.advanceTimersByTimeAsync(1100)
    expect(onExpire).toHaveBeenCalledOnce()
  })

  it('remaining starts at 1 and decreases to 0', async () => {
    const ticks: number[] = []
    const timer = new UndoTimer(1000, () => {}, (r) => ticks.push(r))
    timer.start()
    await vi.advanceTimersByTimeAsync(1100)
    expect(ticks[0]).toBeCloseTo(1, 0)
    expect(ticks[ticks.length - 1]).toBe(0)
  })

  it('pause stops the timer from expiring', async () => {
    const onExpire = vi.fn()
    const timer = new UndoTimer(1000, onExpire)
    timer.start()
    await vi.advanceTimersByTimeAsync(400)
    timer.pause()
    await vi.advanceTimersByTimeAsync(1000)
    expect(onExpire).not.toHaveBeenCalled()
  })

  it('resume continues from where it paused', async () => {
    const onExpire = vi.fn()
    const timer = new UndoTimer(1000, onExpire)
    timer.start()
    await vi.advanceTimersByTimeAsync(400)
    timer.pause()
    await vi.advanceTimersByTimeAsync(500)
    timer.resume()
    await vi.advanceTimersByTimeAsync(700)
    expect(onExpire).toHaveBeenCalledOnce()
  })

  it('destroy stops the timer', async () => {
    const onExpire = vi.fn()
    const timer = new UndoTimer(1000, onExpire)
    timer.start()
    await vi.advanceTimersByTimeAsync(400)
    timer.destroy()
    await vi.advanceTimersByTimeAsync(1000)
    expect(onExpire).not.toHaveBeenCalled()
  })

  it('isPaused reflects pause/resume state', async () => {
    const timer = new UndoTimer(1000, () => {})
    timer.start()
    expect(timer.isPaused).toBe(false)
    await vi.advanceTimersByTimeAsync(100)
    timer.pause()
    expect(timer.isPaused).toBe(true)
    timer.resume()
    expect(timer.isPaused).toBe(false)
  })
})
