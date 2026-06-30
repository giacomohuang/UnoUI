import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'

import Rate from '../Rate.vue'

function mockRateItemRect(element: Element, left = 0, width = 20) {
  element.getBoundingClientRect = () =>
    ({
      left,
      top: 0,
      width,
      height: 20,
      right: left + width,
      bottom: 20,
      x: left,
      y: 0,
      toJSON: () => ({})
    }) as DOMRect
}

async function flushFrame() {
  await new Promise((resolve) => requestAnimationFrame(resolve))
  await new Promise((resolve) => requestAnimationFrame(resolve))
}

async function waitTimer() {
  await new Promise((resolve) => window.setTimeout(resolve, 0))
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('Rate', () => {
  it('renders five items and fills according to modelValue', () => {
    const wrapper = mount(Rate, {
      props: {
        modelValue: 3
      }
    })
    const items = wrapper.findAll('[data-ui-rate-item="true"]')

    expect(items).toHaveLength(5)
    expect(items[0].attributes('aria-checked')).toBe('true')
    expect(items[2].attributes('aria-checked')).toBe('true')
    expect(items[3].attributes('aria-checked')).toBe('false')
    expect(wrapper.find('[data-ui-rate="true"]').attributes('role')).toBe('radiogroup')
  })

  it('passes native attributes to root without exposing them as props', () => {
    const wrapper = mount(Rate, {
      attrs: {
        id: 'quality-rate'
      }
    })

    expect(wrapper.find('[data-ui-rate="true"]').attributes('id')).toBe('quality-rate')
  })

  it('emits modelValue updates when selecting a score', async () => {
    const wrapper = mount(Rate)
    const items = wrapper.findAll('[data-ui-rate-item="true"]')

    mockRateItemRect(items[3].element)
    await items[3].trigger('click', {
      clientX: 19
    })

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([4])
    expect(wrapper.emitted('change')?.[0]?.[0]).toBe(4)
  })

  it('clears the score when clicking the same value and clearable is true', async () => {
    const wrapper = mount(Rate, {
      props: {
        modelValue: 3
      }
    })
    const item = wrapper.findAll('[data-ui-rate-item="true"]')[2]

    mockRateItemRect(item.element)
    await item.trigger('click', {
      clientX: 19
    })

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([0])
  })

  it('keeps the score when clicking the same value and clearable is false', async () => {
    const wrapper = mount(Rate, {
      props: {
        modelValue: 3,
        clearable: false
      }
    })
    const item = wrapper.findAll('[data-ui-rate-item="true"]')[2]

    mockRateItemRect(item.element)
    await item.trigger('click', {
      clientX: 19
    })

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([3])
  })

  it('supports half selection from pointer position', async () => {
    const wrapper = mount(Rate, {
      props: {
        allowHalf: true
      }
    })
    const item = wrapper.findAll('[data-ui-rate-item="true"]')[2]

    mockRateItemRect(item.element, 10, 20)
    await item.trigger('click', {
      clientX: 14
    })

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([2.5])
  })

  it('previews hover value and resets it on mouse leave', async () => {
    const wrapper = mount(Rate, {
      props: {
        allowHalf: true
      }
    })
    const item = wrapper.findAll('[data-ui-rate-item="true"]')[1]

    mockRateItemRect(item.element, 0, 20)
    await item.trigger('mousemove', {
      clientX: 4
    })

    expect(wrapper.emitted('hoverChange')?.[0]).toEqual([1.5])

    await wrapper.find('[data-ui-rate="true"]').trigger('mouseleave')

    expect(wrapper.emitted('hoverChange')?.at(-1)).toEqual([undefined])
  })

  it('animates active layers for half selection', async () => {
    const wrapper = mount(Rate, {
      props: {
        allowHalf: true,
        modelValue: 0
      }
    })
    const firstLayers = wrapper.findAll('[data-ui-rate-item="true"] [aria-hidden="true"].absolute')
    const halfLayer = firstLayers[0]
    const fullLayer = firstLayers[1]

    expect(halfLayer.classes()).toContain('transition-opacity')
    expect(halfLayer.classes()).toContain('duration-200')
    expect(halfLayer.classes()).toContain('w-1/2')
    expect(fullLayer.classes()).toContain('w-full')
    expect(halfLayer.attributes('style')).toContain('opacity: 0;')
    expect(fullLayer.attributes('style')).toContain('opacity: 0;')

    await wrapper.setProps({ modelValue: 0.5 })

    expect(halfLayer.attributes('style')).toContain('opacity: 1;')
    expect(fullLayer.attributes('style')).toContain('opacity: 0;')

    await wrapper.setProps({ modelValue: 1 })

    expect(halfLayer.attributes('style')).toContain('opacity: 0;')
    expect(fullLayer.attributes('style')).toContain('opacity: 1;')
  })

  it('uses larger visual sizes for sm md and lg', () => {
    const sizes = [
      { size: 'sm', rootClass: 'text-xl/5', itemClass: 'size-5' },
      { size: 'md', rootClass: 'text-2xl/6', itemClass: 'size-6' },
      { size: 'lg', rootClass: 'text-3xl/7', itemClass: 'size-7.5' }
    ] as const

    for (const item of sizes) {
      const wrapper = mount(Rate, {
        props: {
          size: item.size
        }
      })

      expect(wrapper.find('[data-ui-rate="true"]').classes()).toContain(item.rootClass)
      expect(wrapper.find('[data-ui-rate-item="true"]').classes()).toContain(item.itemClass)
      wrapper.unmount()
    }
  })

  it('updates by keyboard with half-step support', async () => {
    const wrapper = mount(Rate, {
      props: {
        modelValue: 1,
        allowHalf: true
      }
    })
    const root = wrapper.find('[data-ui-rate="true"]')

    await root.trigger('keydown', {
      key: 'ArrowRight'
    })
    await root.trigger('keydown', {
      key: 'ArrowLeft'
    })

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([1.5])
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([0.5])
    expect(wrapper.emitted('keydown')).toHaveLength(2)
  })

  it('does not emit score changes when disabled', async () => {
    const wrapper = mount(Rate, {
      props: {
        disabled: true,
        modelValue: 2
      }
    })
    const item = wrapper.findAll('[data-ui-rate-item="true"]')[3]

    mockRateItemRect(item.element)
    await item.trigger('click', {
      clientX: 19
    })
    await wrapper.find('[data-ui-rate="true"]').trigger('keydown', {
      key: 'ArrowRight'
    })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.find('[data-ui-rate="true"]').attributes('tabindex')).toBe('-1')
  })

  it('renders custom character and shows tooltip on hover', async () => {
    const wrapper = mount(Rate, {
      props: {
        character: 'A',
        tooltips: ['差', '一般', '好']
      }
    })
    const item = wrapper.findAll('[data-ui-rate-item="true"]')[1]
    const trigger = wrapper.findAll('[data-ui-tooltip-trigger="true"]')[1]

    expect(wrapper.text()).toContain('A')
    expect((document.body.querySelector('[role="tooltip"]') as HTMLElement).style.display).toBe('none')

    mockRateItemRect(item.element)
    await item.trigger('mousemove', {
      clientX: 19
    })
    await trigger.trigger('mouseenter')
    await flushFrame()

    const tooltipId = trigger.attributes('aria-describedby')
    const tooltip = document.getElementById(tooltipId || '') as HTMLElement
    expect(tooltip.textContent).toContain('一般')
    expect(tooltip.style.display).not.toBe('none')

    await trigger.trigger('mouseleave')
    await waitTimer()
    await wrapper.vm.$nextTick()
    expect(tooltip.style.display).toBe('none')
  })
})
