import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'

import Radio from '../Radio.vue'
import RadioGroup from '../RadioGroup.vue'

describe('Radio', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders an inner dot when checked as a standalone radio', () => {
    const wrapper = mount(Radio, {
      props: {
        checked: true
      }
    })

    const dot = wrapper.find('[aria-hidden="true"]')
    expect(dot.exists()).toBe(true)
    expect(dot.classes()).toContain('bg-white')
    expect(dot.classes()).toContain('size-1.5')
    expect(wrapper.find('span').classes()).toContain('bg-brand-500')
  })

  it('uses RadioGroup modelValue as the selected state', async () => {
    const wrapper = mount({
      components: { Radio, RadioGroup },
      data() {
        return {
          value: 'map'
        }
      },
      template: `
        <RadioGroup v-model="value" name="mode">
          <Radio value="map">地图</Radio>
          <Radio value="list">列表</Radio>
        </RadioGroup>
      `
    })
    const inputs = wrapper.findAll('[data-map-ui-radio="true"]')

    expect((inputs[0].element as HTMLInputElement).checked).toBe(true)
    expect((inputs[1].element as HTMLInputElement).checked).toBe(false)
    expect((inputs[0].element as HTMLInputElement).name).toBe('mode')
    expect((inputs[1].element as HTMLInputElement).name).toBe('mode')

    await inputs[1].setValue(true)

    expect(wrapper.vm.value).toBe('list')
    expect((inputs[0].element as HTMLInputElement).checked).toBe(false)
    expect((inputs[1].element as HTMLInputElement).checked).toBe(true)
  })

  it('emits RadioGroup change with the selected value', async () => {
    const wrapper = mount(RadioGroup, {
      props: {
        modelValue: 'map'
      },
      slots: {
        default: `
          <Radio value="map">地图</Radio>
          <Radio value="list">列表</Radio>
        `
      },
      global: {
        components: { Radio }
      }
    })

    await wrapper.findAll('[data-map-ui-radio="true"]')[1].setValue(true)

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['list'])
    expect(wrapper.emitted('change')?.[0]?.[0]).toBe('list')
  })

  it('does not update when RadioGroup is disabled', async () => {
    const wrapper = mount(RadioGroup, {
      props: {
        modelValue: 'map',
        disabled: true
      },
      slots: {
        default: `
          <Radio value="map">地图</Radio>
          <Radio value="list">列表</Radio>
        `
      },
      global: {
        components: { Radio }
      }
    })

    await wrapper.findAll('[data-map-ui-radio="true"]')[1].trigger('change')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('does not update when an option is disabled', async () => {
    const wrapper = mount(RadioGroup, {
      props: {
        modelValue: 'map'
      },
      slots: {
        default: `
          <Radio value="map">地图</Radio>
          <Radio value="list" disabled>列表</Radio>
        `
      },
      global: {
        components: { Radio }
      }
    })

    await wrapper.findAll('[data-map-ui-radio="true"]')[1].trigger('change')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('inherits size from RadioGroup', () => {
    const wrapper = mount(RadioGroup, {
      props: {
        modelValue: 'map',
        size: 'lg'
      },
      slots: {
        default: '<Radio value="map">地图</Radio>'
      },
      global: {
        components: { Radio }
      }
    })

    expect(wrapper.find('label span').classes()).toContain('size-6')
  })

  it('supports border mode on options', () => {
    const wrapper = mount(RadioGroup, {
      props: {
        modelValue: 'map'
      },
      slots: {
        default: '<Radio value="map" border>地图</Radio>'
      },
      global: {
        components: { Radio }
      }
    })

    expect(wrapper.find('label').classes()).toContain('border-brand-500')
    expect(wrapper.find('label').classes()).toContain('min-h-9')
  })

  it('uses RadioGroup button type without rendering the circle dot', () => {
    const wrapper = mount(RadioGroup, {
      props: {
        modelValue: 'map',
        type: 'button'
      },
      slots: {
        default: `
          <Radio value="map">地图</Radio>
          <Radio value="list">列表</Radio>
        `
      },
      global: {
        components: { Radio }
      }
    })

    const selected = wrapper.find('.ui-radio-button')
    const unselected = wrapper.findAll('.ui-radio-button')[1]
    expect(wrapper.classes()).toContain('ui-radio-group--button')
    expect(wrapper.find('[data-map-ui-radio="true"]').exists()).toBe(true)
    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(false)
    expect(selected.attributes('data-checked')).toBe('true')
    expect(selected.attributes('data-disabled')).toBe('false')
    expect(unselected.attributes('data-checked')).toBe('false')
    expect(selected.classes()).toContain('rounded-md')
    expect(selected.classes()).toContain('border-brand-500')
    expect(selected.classes()).toContain('text-brand-500')
    expect(selected.classes()).toContain('transition-[background-color,color]')
    expect(selected.classes()).not.toContain('transition-colors')
    expect(selected.classes()).not.toContain('z-1')
    expect(unselected.classes()).not.toContain('hover:z-1')
  })

  it('supports solid button style from RadioGroup', () => {
    const wrapper = mount(RadioGroup, {
      props: {
        modelValue: 'map',
        type: 'button',
        buttonStyle: 'solid'
      },
      slots: {
        default: '<Radio value="map">地图</Radio>'
      },
      global: {
        components: { Radio }
      }
    })

    expect(wrapper.find('.ui-radio-button').classes()).toContain('bg-brand-500')
    expect(wrapper.find('.ui-radio-button').classes()).toContain('text-brand-50')
  })

  it('supports vertical button groups', () => {
    const wrapper = mount(RadioGroup, {
      props: {
        modelValue: 'map',
        type: 'button',
        direction: 'vertical'
      },
      slots: {
        default: `
          <Radio value="map">地图</Radio>
          <Radio value="list">列表</Radio>
        `
      },
      global: {
        components: { Radio }
      }
    })

    expect(wrapper.attributes('data-direction')).toBe('vertical')
    expect(wrapper.classes()).toContain('flex-col')
    expect(wrapper.classes()).toContain('items-stretch')
  })

  it('generates a shared native name when RadioGroup name is omitted', () => {
    const wrapper = mount(RadioGroup, {
      props: {
        modelValue: 'map'
      },
      slots: {
        default: `
          <Radio value="map">地图</Radio>
          <Radio value="list">列表</Radio>
        `
      },
      global: {
        components: { Radio }
      }
    })
    const inputs = wrapper.findAll('[data-map-ui-radio="true"]').map((input) => input.element as HTMLInputElement)

    expect(inputs[0].name).toMatch(/^ui-radio-group-/)
    expect(inputs[1].name).toBe(inputs[0].name)
  })

  it('exposes focus and blur methods', async () => {
    const wrapper = mount(Radio, {
      attachTo: document.body,
      props: {
        checked: true
      }
    })
    const input = wrapper.find('[data-map-ui-radio="true"]').element as HTMLInputElement

    wrapper.vm.focus()
    expect(document.activeElement).toBe(input)

    wrapper.vm.blur()
    expect(document.activeElement).not.toBe(input)
  })
})
