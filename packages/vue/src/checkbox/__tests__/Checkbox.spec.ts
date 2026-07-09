import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import Checkbox from '../Checkbox.vue'
import CheckboxGroup from '../CheckboxGroup.vue'

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

  it('renders a white check mark when checked as a standalone checkbox', () => {
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

  it('keeps indeterminate as a visual state and emits the next checked value', async () => {
    const wrapper = mount(Checkbox, {
      props: {
        indeterminate: true
      }
    })

    await wrapper.find('[data-map-ui-checkbox="true"]').setValue(true)

    expect(wrapper.emitted('change')?.[0]?.[0]).toBe(true)
    expect(wrapper.emitted('change')?.[0]?.[1]).toBeInstanceOf(Event)
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

  it('uses CheckboxGroup modelValue as selected state', async () => {
    const wrapper = mount({
      components: { Checkbox, CheckboxGroup },
      data() {
        return {
          value: ['object:read']
        }
      },
      template: `
        <CheckboxGroup v-model="value" name="permissions">
          <Checkbox value="object:read">读取</Checkbox>
          <Checkbox value="object:write">写入</Checkbox>
        </CheckboxGroup>
      `
    })
    const inputs = wrapper.findAll('[data-map-ui-checkbox="true"]').map((input) => input.element as HTMLInputElement)

    expect(inputs[0].checked).toBe(true)
    expect(inputs[1].checked).toBe(false)
    expect(inputs[0].name).toBe('permissions')
    expect(inputs[1].name).toBe('permissions')

    await wrapper.findAll('[data-map-ui-checkbox="true"]')[1].setValue(true)
    expect(wrapper.vm.value).toEqual(['object:read', 'object:write'])

    await wrapper.findAll('[data-map-ui-checkbox="true"]')[0].setValue(false)
    expect(wrapper.vm.value).toEqual(['object:write'])
  })

  it('emits CheckboxGroup change with the next selected values', async () => {
    const wrapper = mount(CheckboxGroup, {
      props: {
        modelValue: ['read']
      },
      slots: {
        default: `
          <Checkbox value="read">读取</Checkbox>
          <Checkbox value="write">写入</Checkbox>
        `
      },
      global: {
        components: { Checkbox }
      }
    })

    await wrapper.findAll('[data-map-ui-checkbox="true"]')[1].setValue(true)

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['read', 'write']])
    expect(wrapper.emitted('change')?.[0]?.[0]).toEqual(['read', 'write'])
  })

  it('does not update when CheckboxGroup is disabled', async () => {
    const wrapper = mount(CheckboxGroup, {
      props: {
        modelValue: ['read'],
        disabled: true
      },
      slots: {
        default: `
          <Checkbox value="read">读取</Checkbox>
          <Checkbox value="write">写入</Checkbox>
        `
      },
      global: {
        components: { Checkbox }
      }
    })

    await wrapper.findAll('[data-map-ui-checkbox="true"]')[1].trigger('change')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('does not update when an option is disabled', async () => {
    const wrapper = mount(CheckboxGroup, {
      props: {
        modelValue: ['read']
      },
      slots: {
        default: `
          <Checkbox value="read">读取</Checkbox>
          <Checkbox value="write" disabled>写入</Checkbox>
        `
      },
      global: {
        components: { Checkbox }
      }
    })

    await wrapper.findAll('[data-map-ui-checkbox="true"]')[1].trigger('change')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('inherits size from CheckboxGroup', () => {
    const wrapper = mount(CheckboxGroup, {
      props: {
        modelValue: ['read'],
        size: 'lg'
      },
      slots: {
        default: '<Checkbox value="read">读取</Checkbox>'
      },
      global: {
        components: { Checkbox }
      }
    })

    const box = wrapper.find('[data-map-ui-checkbox="true"]').element.parentElement as HTMLElement
    expect(box.classList).toContain('size-6')
  })

  it('supports vertical checkbox groups', () => {
    const wrapper = mount(CheckboxGroup, {
      props: {
        modelValue: ['read'],
        direction: 'vertical'
      },
      slots: {
        default: `
          <Checkbox value="read">读取</Checkbox>
          <Checkbox value="write">写入</Checkbox>
        `
      },
      global: {
        components: { Checkbox }
      }
    })

    expect(wrapper.attributes('data-direction')).toBe('vertical')
    expect(wrapper.classes()).toContain('flex-col')
  })
})
