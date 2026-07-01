import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import Checkbox from '../Checkbox.vue'

const getBox = (wrapper: ReturnType<typeof mount<typeof Checkbox>>) => wrapper.find('[data-map-ui-checkbox="true"]').element.parentElement as HTMLElement

describe('Checkbox', () => {
  it('renders default slot content after the checkbox box', () => {
    const wrapper = mount(Checkbox, {
      slots: {
        default: '同意协议'
      }
    })

    expect(wrapper.element.tagName.toLowerCase()).toBe('label')
    expect(wrapper.text()).toContain('同意协议')
    expect(wrapper.find('[data-map-ui-checkbox="true"]').exists()).toBe(true)
  })

  it('renders a white check mark when checked', () => {
    const wrapper = mount(Checkbox, {
      props: {
        checked: true
      }
    })

    const icon = wrapper.find('[aria-hidden="true"]')
    expect(icon.exists()).toBe(true)
    expect(icon.element.tagName.toLowerCase()).toBe('svg')
    expect(icon.find('path').attributes('stroke')).toBe('white')
  })

  it('uses brand fill without unchecked dark background when checked', () => {
    const wrapper = mount(Checkbox, {
      props: {
        checked: true
      }
    })

    const box = getBox(wrapper)
    expect(box.classList).toContain('bg-brand-500')
    expect(box.classList).toContain('dark:bg-brand-500')
    expect(box.classList).not.toContain('bg-primary')
    expect(box.classList).not.toContain('dark:bg-zinc-950')
  })

  it('renders an indeterminate mark and syncs native mixed state', async () => {
    const wrapper = mount(Checkbox, {
      props: {
        indeterminate: true
      }
    })

    const input = wrapper.find<HTMLInputElement>('[data-map-ui-checkbox="true"]')
    await wrapper.vm.$nextTick()

    expect(input.element.indeterminate).toBe(true)
    expect(input.attributes('aria-checked')).toBe('mixed')
    expect(getBox(wrapper).classList).toContain('bg-brand-500')
    expect(wrapper.find('path').attributes('d')).toBe('M4 8H12')
  })

  it('keeps indeterminate as a visual state and emits checked value on change', async () => {
    const wrapper = mount(Checkbox, {
      props: {
        modelValue: false,
        indeterminate: true
      }
    })

    const input = wrapper.find<HTMLInputElement>('[data-map-ui-checkbox="true"]')
    await input.setValue(true)

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
    expect(wrapper.emitted('change')?.[0]?.[0]).toBeInstanceOf(Event)
  })

  it('updates native indeterminate state when prop changes', async () => {
    const wrapper = mount(Checkbox, {
      props: {
        indeterminate: true
      }
    })
    const input = wrapper.find<HTMLInputElement>('[data-map-ui-checkbox="true"]')
    await wrapper.vm.$nextTick()

    await wrapper.setProps({ indeterminate: false })
    await wrapper.vm.$nextTick()

    expect(input.element.indeterminate).toBe(false)
    expect(input.attributes('aria-checked')).toBe('false')
    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(false)
  })

  it('uses md size by default', () => {
    const wrapper = mount(Checkbox)

    const box = getBox(wrapper)
    expect(box.classList).toContain('size-5')
    expect(box.classList).toContain('rounded')
  })

  it('supports sm and lg sizes', () => {
    const small = mount(Checkbox, {
      props: {
        size: 'sm'
      }
    })
    const large = mount(Checkbox, {
      props: {
        size: 'lg'
      }
    })

    const smallBox = getBox(small)
    const largeBox = getBox(large)
    expect(smallBox.classList).toContain('size-4')
    expect(smallBox.classList).toContain('rounded-sm')
    expect(largeBox.classList).toContain('size-6')
    expect(largeBox.classList).toContain('rounded')
  })

  it('keeps checked disabled state visually selected', () => {
    const wrapper = mount(Checkbox, {
      props: {
        checked: true,
        disabled: true
      }
    })

    const box = getBox(wrapper)
    expect(box.classList).toContain('dark:bg-zinc-800')
    expect(box.classList).toContain('dark:border-zinc-600')
    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(true)
  })

  it('uses a stronger disabled style in dark mode', () => {
    const wrapper = mount(Checkbox, {
      props: {
        disabled: true
      }
    })

    const box = getBox(wrapper)
    expect(box.classList).toContain('dark:bg-zinc-800')
    expect(box.classList).toContain('dark:border-zinc-600')
  })

  it('does not emit updates when disabled', async () => {
    const wrapper = mount(Checkbox, {
      props: {
        modelValue: true,
        disabled: true
      }
    })

    await wrapper.find('[data-map-ui-checkbox="true"]').trigger('change')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('updates array model values with the input value', async () => {
    const wrapper = mount(Checkbox, {
      props: {
        modelValue: ['object:read'],
        value: 'object:write'
      }
    })

    await wrapper.find('[data-map-ui-checkbox="true"]').setValue(true)

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['object:read', 'object:write']])

    await wrapper.setProps({
      modelValue: ['object:read', 'object:write']
    })
    await wrapper.find('[data-map-ui-checkbox="true"]').setValue(false)

    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([['object:read']])
  })
})
