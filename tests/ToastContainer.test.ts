import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ToastContainer from '../src/components/ToastContainer.vue'
import { createToastContext } from '../src/composables/useToastContext'
import { GLOBAL_OPTIONS_KEY } from '../src/core/types'

// Regression: GlobalToastOptions (position/theme/maxVisible) were accepted by the
// plugin/module's option type but never actually reached ToastContainer — it always
// used its own hardcoded prop defaults regardless of app.use(VueToastPlugin, {...}).
describe('ToastContainer global option defaults', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('uses the injected global position when no position prop is passed', () => {
    const ctx = createToastContext()
    ctx.addToast('Hello', {})
    const wrapper = mount(ToastContainer, {
      props: { context: ctx },
      global: { provide: { [GLOBAL_OPTIONS_KEY as unknown as string]: { position: 'top-left' } } },
      attachTo: document.body,
    })

    expect(document.querySelector('.vtk-container--top-left[role="region"]')).toBeTruthy()
    expect(document.querySelector('.vtk-container--bottom-right[role="region"]')).toBeFalsy()
    wrapper.unmount()
  })

  it('an explicit position prop overrides the injected global default', () => {
    const ctx = createToastContext()
    ctx.addToast('Hello', {})
    const wrapper = mount(ToastContainer, {
      props: { context: ctx, position: 'bottom-left' },
      global: { provide: { [GLOBAL_OPTIONS_KEY as unknown as string]: { position: 'top-left' } } },
      attachTo: document.body,
    })

    expect(document.querySelector('.vtk-container--bottom-left[role="region"]')).toBeTruthy()
    expect(document.querySelector('.vtk-container--top-left[role="region"]')).toBeFalsy()
    wrapper.unmount()
  })

  it('falls back to bottom-right when neither prop nor global option is set', () => {
    const ctx = createToastContext()
    ctx.addToast('Hello', {})
    const wrapper = mount(ToastContainer, {
      props: { context: ctx },
      attachTo: document.body,
    })

    expect(document.querySelector('.vtk-container--bottom-right[role="region"]')).toBeTruthy()
    wrapper.unmount()
  })

  it('uses the injected global maxVisible to sync the queue', () => {
    // setMaxVisible() only admits pending items into an enlarged window — it doesn't
    // retroactively evict already-active ones — so the sync must happen (via mount)
    // before toasts are added for the cap to actually apply at admission time.
    const ctx = createToastContext()
    const wrapper = mount(ToastContainer, {
      props: { context: ctx },
      global: { provide: { [GLOBAL_OPTIONS_KEY as unknown as string]: { maxVisible: 2 } } },
      attachTo: document.body,
    })

    ctx.addToast('A', {})
    ctx.addToast('B', {})
    ctx.addToast('C', {})

    expect(ctx.queue.active).toHaveLength(2)
    expect(ctx.queue.pending).toHaveLength(1)
    wrapper.unmount()
  })

  it('an explicit theme prop overrides the injected global theme', () => {
    const ctx = createToastContext()
    ctx.addToast('Hello', {})
    const wrapper = mount(ToastContainer, {
      props: { context: ctx, theme: 'dark' },
      global: { provide: { [GLOBAL_OPTIONS_KEY as unknown as string]: { theme: 'light' } } },
      attachTo: document.body,
    })

    expect(document.querySelector('.vtk-theme-dark')).toBeTruthy()
    expect(document.querySelector('.vtk-theme-light')).toBeFalsy()
    wrapper.unmount()
  })
})
