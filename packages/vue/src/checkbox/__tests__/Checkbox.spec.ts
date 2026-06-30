import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import Checkbox from '../Checkbox.vue'

describe('Checkbox', () => {
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

    expect(wrapper.classes()).toContain('bg-brand-500')
    expect(wrapper.classes()).toContain('dark:bg-brand-500')
    expect(wrapper.classes()).not.toContain('bg-primary')
    expect(wrapper.classes()).not.toContain('dark:bg-zinc-950')
  })

  it('uses md size by default', () => {
    const wrapper = mount(Checkbox)

    expect(wrapper.classes()).toContain('size-5')
    expect(wrapper.classes()).toContain('rounded')
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

    expect(small.classes()).toContain('size-4')
    expect(small.classes()).toContain('rounded-sm')
    expect(large.classes()).toContain('size-6')
    expect(large.classes()).toContain('rounded')
  })

  it('keeps checked disabled state visually selected', () => {
    const wrapper = mount(Checkbox, {
      props: {
        checked: true,
        disabled: true
      }
    })

    expect(wrapper.classes()).toContain('dark:bg-zinc-800')
    expect(wrapper.classes()).toContain('dark:border-zinc-600')
    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(true)
  })

  it('uses a stronger disabled style in dark mode', () => {
    const wrapper = mount(Checkbox, {
      props: {
        disabled: true
      }
    })

    expect(wrapper.classes()).toContain('dark:bg-zinc-800')
    expect(wrapper.classes()).toContain('dark:border-zinc-600')
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
