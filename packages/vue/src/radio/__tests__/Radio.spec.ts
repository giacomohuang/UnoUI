import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import Radio from '../Radio.vue'

describe('Radio', () => {
  it('renders an inner dot when checked', () => {
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

  it('uses modelValue and value to form radio groups without a group component', async () => {
    const wrapper = mount({
      components: { Radio },
      data() {
        return {
          value: 'map'
        }
      },
      template: `
        <div>
          <Radio v-model="value" name="mode" value="map">地图</Radio>
          <Radio v-model="value" name="mode" value="list">列表</Radio>
        </div>
      `
    })
    const inputs = wrapper.findAll('[data-map-ui-radio="true"]')

    expect((inputs[0].element as HTMLInputElement).checked).toBe(true)
    expect((inputs[1].element as HTMLInputElement).checked).toBe(false)

    await inputs[1].setValue(true)

    expect(wrapper.vm.value).toBe('list')
    expect((inputs[0].element as HTMLInputElement).checked).toBe(false)
    expect((inputs[1].element as HTMLInputElement).checked).toBe(true)
  })

  it('does not emit updates when disabled', async () => {
    const wrapper = mount(Radio, {
      props: {
        modelValue: 'map',
        value: 'list',
        disabled: true
      }
    })

    await wrapper.find('[data-map-ui-radio="true"]').trigger('change')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('supports sm and lg sizes', () => {
    const small = mount(Radio, {
      props: {
        size: 'sm'
      }
    })
    const large = mount(Radio, {
      props: {
        size: 'lg'
      }
    })

    expect(small.find('span').classes()).toContain('size-4')
    expect(large.find('span').classes()).toContain('size-6')
  })

  it('supports border mode', () => {
    const wrapper = mount(Radio, {
      props: {
        modelValue: 'map',
        value: 'map',
        border: true
      }
    })

    expect(wrapper.classes()).toContain('border-brand-500')
    expect(wrapper.classes()).toContain('min-h-9')
  })

  it('emits selected value on change', async () => {
    const wrapper = mount(Radio, {
      props: {
        modelValue: 'map',
        value: 'list'
      }
    })

    await wrapper.find('[data-map-ui-radio="true"]').setValue(true)

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['list'])
    expect(wrapper.emitted('change')?.[0]?.[0]).toBe('list')
  })
})
