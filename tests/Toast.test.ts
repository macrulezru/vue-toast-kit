import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { createMockToast } from '../src/testing'
import Toast from '../src/components/Toast.vue'

describe('Toast.vue', () => {
  function mountToast(overrides = {}) {
    const toast = createMockToast(overrides)
    const onDismiss = vi.fn()
    const wrapper = mount(Toast, {
      props: { toast, onDismiss },
    })
    return { wrapper, toast, onDismiss }
  }

  it('renders the message', () => {
    const { wrapper } = mountToast({ message: 'Hello world' })
    expect(wrapper.text()).toContain('Hello world')
  })

  it('has role=alert for error type', () => {
    const { wrapper } = mountToast({ options: { type: 'error' } })
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })

  it('has role=status for info type', () => {
    const { wrapper } = mountToast({ options: { type: 'info' } })
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
  })

  it('shows close button when closable is true', () => {
    const { wrapper } = mountToast({ options: { closable: true } })
    expect(wrapper.find('.vtk-btn--close').exists()).toBe(true)
  })

  it('hides close button when closable is false', () => {
    const { wrapper } = mountToast({ options: { closable: false } })
    expect(wrapper.find('.vtk-btn--close').exists()).toBe(false)
  })

  it('calls onDismiss when close button is clicked', async () => {
    const { wrapper, toast, onDismiss } = mountToast({ options: { closable: true } })
    await wrapper.find('.vtk-btn--close').trigger('click')
    expect(onDismiss).toHaveBeenCalledWith(toast.id)
  })

  it('renders action button when action is set', () => {
    const { wrapper } = mountToast({
      options: { action: { label: 'Retry', onClick: vi.fn() } },
    })
    expect(wrapper.find('.vtk-btn--action').exists()).toBe(true)
    expect(wrapper.find('.vtk-btn--action').text()).toBe('Retry')
  })

  it('calls action.onClick when action button clicked', async () => {
    const onClick = vi.fn()
    const { wrapper } = mountToast({
      options: { action: { label: 'Retry', onClick } },
    })
    await wrapper.find('.vtk-btn--action').trigger('click')
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('shows undo button when undo is set', () => {
    const { wrapper } = mountToast({
      options: { undo: { onUndo: vi.fn() } },
    })
    expect(wrapper.find('.vtk-btn--undo').exists()).toBe(true)
  })

  it('renders custom component when provided', () => {
    const Custom = defineComponent({ render: () => h('div', { class: 'custom' }, 'Custom!') })
    const { wrapper } = mountToast({ options: { component: Custom } })
    expect(wrapper.find('.custom').exists()).toBe(true)
  })

  it('shows group count badge when grouped', () => {
    const { wrapper } = mountToast({ groupCount: { value: 3 } as ReturnType<typeof import('vue').ref> })
    expect(wrapper.find('.vtk-group-count').exists()).toBe(true)
    expect(wrapper.find('.vtk-group-count').text()).toContain('2')
  })
})
