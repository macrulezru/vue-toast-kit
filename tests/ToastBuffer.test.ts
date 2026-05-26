import { describe, it, expect, vi } from 'vitest'
import { ToastBuffer } from '../src/core/ToastBuffer'

describe('ToastBuffer', () => {
  it('push adds items to buffer', () => {
    const buf = new ToastBuffer()
    buf.push('hello', {})
    expect(buf.size).toBe(1)
  })

  it('flush calls callback with buffered items', () => {
    const buf = new ToastBuffer()
    buf.push('A', { type: 'info' })
    buf.push('B', { type: 'success' })
    const cb = vi.fn()
    buf.onFlush(cb)
    buf.flush()
    expect(cb).toHaveBeenCalledOnce()
    const items = cb.mock.calls[0][0]
    expect(items).toHaveLength(2)
    expect(items[0].message).toBe('A')
    expect(items[1].message).toBe('B')
  })

  it('flush only fires once', () => {
    const buf = new ToastBuffer()
    buf.push('A', {})
    const cb = vi.fn()
    buf.onFlush(cb)
    buf.flush()
    buf.flush()
    expect(cb).toHaveBeenCalledOnce()
  })

  it('push after flush is ignored', () => {
    const buf = new ToastBuffer()
    buf.flush()
    buf.push('Late', {})
    expect(buf.size).toBe(0)
  })

  it('isFlushed returns false before flush, true after', () => {
    const buf = new ToastBuffer()
    expect(buf.isFlushed()).toBe(false)
    buf.flush()
    expect(buf.isFlushed()).toBe(true)
  })

  it('flush clears the buffer', () => {
    const buf = new ToastBuffer()
    buf.push('A', {})
    buf.flush()
    expect(buf.size).toBe(0)
  })

  it('multiple onFlush callbacks all receive items', () => {
    const buf = new ToastBuffer()
    buf.push('A', {})
    const cb1 = vi.fn()
    const cb2 = vi.fn()
    buf.onFlush(cb1)
    buf.onFlush(cb2)
    buf.flush()
    expect(cb1).toHaveBeenCalledOnce()
    expect(cb2).toHaveBeenCalledOnce()
  })

  it('flush with empty buffer calls callback with empty array', () => {
    const buf = new ToastBuffer()
    const cb = vi.fn()
    buf.onFlush(cb)
    buf.flush()
    expect(cb).toHaveBeenCalledWith([])
  })
})
