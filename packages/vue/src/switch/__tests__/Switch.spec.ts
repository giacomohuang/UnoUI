import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import Switch from '../Switch.vue'

describe('Switch', () => {
  it('uses the brand track when checked', () => {
    const wrapper = mount(Switch, {
      props: {
        checked: true
      }
    })

    const track = wrapper.find('label > span')
    expect(track.classes()).toContain('bg-brand-500')
    expect(track.classes()).toContain('border-brand-500')
    expect(wrapper.find('[data-map-ui-switch="true"]').attributes('role')).toBe('switch')
    expect(wrapper.find('[data-map-ui-switch="true"]').attributes('aria-checked')).toBe('true')
  })

  it('emits boolean values by default', async () => {
    const wrapper = mount(Switch)

    await wrapper.find('[data-map-ui-switch="true"]').setValue(true)

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
    expect(wrapper.emitted('input')?.[0]?.[0]).toBe(true)
    expect(wrapper.emitted('change')?.[0]?.[0]).toBe(true)
  })

  it('supports custom active and inactive values', async () => {
    const wrapper = mount(Switch, {
      props: {
        modelValue: 'off',
        activeValue: 'on',
        inactiveValue: 'off'
      }
    })

    await wrapper.find('[data-map-ui-switch="true"]').setValue(true)

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['on'])

    await wrapper.setProps({
      modelValue: 'on'
    })
    await wrapper.find('[data-map-ui-switch="true"]').setValue(false)

    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual(['off'])
  })

  it('does not emit updates when disabled or loading', async () => {
    const disabled = mount(Switch, {
      props: {
        disabled: true
      }
    })
    const loading = mount(Switch, {
      props: {
        loading: true
      }
    })

    await disabled.find('[data-map-ui-switch="true"]').trigger('change')
    await loading.find('[data-map-ui-switch="true"]').trigger('change')

    expect(disabled.emitted('update:modelValue')).toBeUndefined()
    expect(loading.emitted('update:modelValue')).toBeUndefined()
  })

  it('blocks changes when beforeChange returns false', async () => {
    const beforeChange = vi.fn(() => false)
    const wrapper = mount(Switch, {
      props: {
        beforeChange
      }
    })
    const input = wrapper.find('[data-map-ui-switch="true"]')

    await input.setValue(true)
    await flushPromises()

    expect(beforeChange).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect((input.element as HTMLInputElement).checked).toBe(false)
  })

  it('waits for async beforeChange before emitting', async () => {
    const wrapper = mount(Switch, {
      props: {
        beforeChange: () => Promise.resolve(true)
      }
    })

    await wrapper.find('[data-map-ui-switch="true"]').setValue(true)
    await flushPromises()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })

  it('renders inline prompt and action icon', () => {
    const wrapper = mount(Switch, {
      props: {
        checked: true,
        inlinePrompt: true,
        activeText: '开',
        inactiveText: '关',
        activeActionIcon: 'i-lucide:check'
      }
    })

    expect(wrapper.text()).toContain('开')
    expect(wrapper.find('.i-lucide\\:check').exists()).toBe(true)
  })

  it('applies custom width and colors to the track', () => {
    const wrapper = mount(Switch, {
      props: {
        checked: true,
        width: 56,
        activeColor: '#16a34a'
      }
    })
    const track = wrapper.find('label > span')

    expect(track.attributes('style')).toContain('width: 56px')
    expect(track.attributes('style')).toContain('background-color: rgb(22, 163, 74)')
  })
})
