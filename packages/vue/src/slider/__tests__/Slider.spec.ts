import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'

import Slider from '../Slider.vue'

function mockSliderRect(element: Element, rect: Partial<DOMRect> = {}) {
  element.getBoundingClientRect = () =>
    ({
      left: 0,
      top: 0,
      width: 200,
      height: 40,
      right: 200,
      bottom: 40,
      x: 0,
      y: 0,
      toJSON: () => ({}),
      ...rect
    }) as DOMRect
}

async function flushFrame() {
  await new Promise((resolve) => requestAnimationFrame(resolve))
  await new Promise((resolve) => requestAnimationFrame(resolve))
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('Slider', () => {
  const createPointerEvent = (type: string, init: PointerEventInit) => {
    if (typeof PointerEvent === 'function') return new PointerEvent(type, init)
    return new MouseEvent(type, init) as PointerEvent
  }
  const dispatchPointer = async (element: Element, type: string, init: PointerEventInit) => {
    element.dispatchEvent(createPointerEvent(type, init))
    await Promise.resolve()
  }

  it('renders single value handle and emits model updates on rail click', async () => {
    const wrapper = mount(Slider, {
      props: {
        modelValue: 20
      },
      attachTo: document.body
    })
    const root = wrapper.find('[data-ui-slider="true"]')

    mockSliderRect(root.element)
    await dispatchPointer(root.element, 'pointerdown', {
      button: 0,
      clientX: 120,
      clientY: 20
    })

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([60])
    expect(wrapper.emitted('change')?.[0]).toEqual([60])
    wrapper.unmount()
  })

  it('supports local v-model', async () => {
    const wrapper = mount({
      components: { Slider },
      data() {
        return {
          value: 10
        }
      },
      template: '<Slider v-model="value" />'
    }, {
      attachTo: document.body
    })
    const root = wrapper.find('[data-ui-slider="true"]')

    mockSliderRect(root.element)
    await dispatchPointer(root.element, 'pointerdown', {
      button: 0,
      clientX: 160,
      clientY: 20
    })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.value).toBe(80)
    expect(wrapper.find('[data-ui-slider-handle-wrap="true"]').attributes('style')).toContain('left: 80%')
    window.dispatchEvent(createPointerEvent('pointerup', { clientX: 160, clientY: 20 }))
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.value).toBe(80)
    expect(wrapper.find('[data-ui-slider-handle-wrap="true"]').attributes('style')).toContain('left: 80%')
    wrapper.unmount()
  })

  it('renders visible rail and selected track sizes', () => {
    const horizontalWrapper = mount(Slider, {
      props: {
        modelValue: 40
      }
    })
    const horizontalRail = horizontalWrapper.find('[data-ui-slider-rail="true"]')
    const horizontalTrack = horizontalWrapper.find('[data-ui-slider-track="true"]')

    expect(horizontalRail.element.tagName).toBe('SPAN')
    expect(horizontalTrack.element.tagName).toBe('SPAN')
    expect(horizontalRail.attributes('style')).toContain('height: 6px')
    expect(horizontalRail.attributes('style')).toContain('width: calc(100% - 16px)')
    expect(horizontalTrack.attributes('style')).toContain('height: 6px')
    expect(horizontalTrack.attributes('style')).toContain('width: 40%')
    horizontalWrapper.unmount()

    const verticalWrapper = mount(Slider, {
      props: {
        modelValue: 40,
        vertical: true
      }
    })
    const verticalRail = verticalWrapper.find('[data-ui-slider-rail="true"]')
    const verticalTrack = verticalWrapper.find('[data-ui-slider-track="true"]')

    expect(verticalRail.attributes('style')).toContain('width: 6px')
    expect(verticalRail.attributes('style')).toContain('height: calc(100% - 16px)')
    expect(verticalTrack.attributes('style')).toContain('width: 6px')
    expect(verticalTrack.attributes('style')).toContain('height: 40%')
    verticalWrapper.unmount()
  })

  it('normalizes range values and drags a handle', async () => {
    const wrapper = mount(Slider, {
      props: {
        range: true,
        modelValue: [20, 80]
      },
      attachTo: document.body
    })
    const root = wrapper.find('[data-ui-slider="true"]')
    const handle = wrapper.findAll('[data-ui-slider-handle="true"]')[0]

    mockSliderRect(root.element)
    await dispatchPointer(handle.element, 'pointerdown', {
      button: 0,
      clientX: 40,
      clientY: 20
    })
    window.dispatchEvent(createPointerEvent('pointermove', { clientX: 100, clientY: 20 }))
    window.dispatchEvent(createPointerEvent('pointerup', { clientX: 100, clientY: 20 }))
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[50, 80]])
    expect(wrapper.emitted('changeComplete')?.at(-1)).toEqual([[50, 80]])
    wrapper.unmount()
  })

  it('clears active handle state on pointer leave when not dragging', async () => {
    const wrapper = mount(Slider, {
      props: {
        modelValue: 20
      }
    })
    const handle = wrapper.find('[data-ui-slider-handle="true"]')

    await handle.trigger('focus')
    expect(handle.classes()).toContain('scale-110')

    await handle.trigger('pointerleave')
    expect(handle.classes()).not.toContain('scale-110')
    wrapper.unmount()
  })

  it('keeps active handle state on pointer leave while dragging', async () => {
    const wrapper = mount(Slider, {
      props: {
        modelValue: 20
      },
      attachTo: document.body
    })
    const root = wrapper.find('[data-ui-slider="true"]')
    const handle = wrapper.find('[data-ui-slider-handle="true"]')

    mockSliderRect(root.element)
    await dispatchPointer(handle.element, 'pointerdown', {
      button: 0,
      clientX: 40,
      clientY: 20
    })
    await handle.trigger('pointerleave')

    expect(handle.classes()).toContain('scale-110')
    window.dispatchEvent(createPointerEvent('pointerup', { clientX: 40, clientY: 20 }))
    await wrapper.vm.$nextTick()
    wrapper.unmount()
  })

  it('swaps active handles when range handles cross while dragging', async () => {
    const wrapper = mount(Slider, {
      props: {
        range: true,
        defaultValue: [20, 80]
      },
      attachTo: document.body
    })
    const root = wrapper.find('[data-ui-slider="true"]')
    const firstHandle = wrapper.findAll('[data-ui-slider-handle="true"]')[0]

    mockSliderRect(root.element)
    await dispatchPointer(firstHandle.element, 'pointerdown', {
      button: 0,
      clientX: 40,
      clientY: 20
    })
    window.dispatchEvent(createPointerEvent('pointermove', { clientX: 180, clientY: 20 }))
    await wrapper.vm.$nextTick()
    window.dispatchEvent(createPointerEvent('pointermove', { clientX: 190, clientY: 20 }))
    window.dispatchEvent(createPointerEvent('pointerup', { clientX: 190, clientY: 20 }))
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[80, 90]])
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([[80, 95]])
    expect(wrapper.emitted('changeComplete')?.at(-1)).toEqual([[80, 95]])
    wrapper.unmount()
  })

  it('drags the whole range track when draggableTrack is enabled', async () => {
    const wrapper = mount(Slider, {
      props: {
        range: {
          draggableTrack: true
        },
        modelValue: [20, 50]
      },
      attachTo: document.body
    })
    const root = wrapper.find('[data-ui-slider="true"]')
    const track = wrapper.find('[class*="cursor-grab"]')

    mockSliderRect(root.element)
    await dispatchPointer(track.element, 'pointerdown', {
      button: 0,
      clientX: 60,
      clientY: 20
    })
    window.dispatchEvent(createPointerEvent('pointermove', { clientX: 100, clientY: 20 }))
    window.dispatchEvent(createPointerEvent('pointerup', { clientX: 100, clientY: 20 }))
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[40, 70]])
    wrapper.unmount()
  })

  it('updates local v-model and handle position when clicking selected track', async () => {
    const wrapper = mount({
      components: { Slider },
      data() {
        return {
          value: 40
        }
      },
      template: '<Slider v-model="value" />'
    }, {
      attachTo: document.body
    })
    const root = wrapper.find('[data-ui-slider="true"]')
    const track = wrapper.find('[data-ui-slider-track="true"]')

    mockSliderRect(root.element)
    await dispatchPointer(track.element, 'pointerdown', {
      button: 0,
      clientX: 60,
      clientY: 20
    })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.value).toBe(30)
    expect(wrapper.find('[data-ui-slider-handle-wrap="true"]').attributes('style')).toContain('left: 30%')
    window.dispatchEvent(createPointerEvent('pointerup', { clientX: 60, clientY: 20 }))
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.value).toBe(30)
    expect(wrapper.find('[data-ui-slider-handle-wrap="true"]').attributes('style')).toContain('left: 30%')
    wrapper.unmount()
  })

  it('updates the nearest handle when clicking draggable range track without moving', async () => {
    const wrapper = mount(Slider, {
      props: {
        range: {
          draggableTrack: true
        },
        modelValue: [20, 50]
      },
      attachTo: document.body
    })
    const root = wrapper.find('[data-ui-slider="true"]')
    const track = wrapper.find('[class*="cursor-grab"]')

    mockSliderRect(root.element)
    await dispatchPointer(track.element, 'pointerdown', {
      button: 0,
      clientX: 80,
      clientY: 20
    })
    window.dispatchEvent(createPointerEvent('pointerup', { clientX: 80, clientY: 20 }))
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[20, 40]])
    expect(wrapper.emitted('changeComplete')?.at(-1)).toEqual([[20, 40]])
    wrapper.unmount()
  })

  it('adds and removes handles in editable range mode', async () => {
    const wrapper = mount(Slider, {
      props: {
        range: {
          editable: true,
          minCount: 1,
          maxCount: 3
        },
        defaultValue: [20, 80]
      },
      attachTo: document.body
    })
    const root = wrapper.find('[data-ui-slider="true"]')

    mockSliderRect(root.element)
    await dispatchPointer(root.element, 'pointerdown', {
      button: 0,
      clientX: 100,
      clientY: 20
    })
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[20, 50, 80]])
    expect(wrapper.findAll('[data-ui-slider-handle="true"]')).toHaveLength(3)
    expect(wrapper.findAll('[data-ui-slider-handle-wrap="true"]')[1].attributes('style')).toContain('left: 50%')
    window.dispatchEvent(createPointerEvent('pointerup', { clientX: 100, clientY: 20 }))
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('[data-ui-slider-handle="true"]')).toHaveLength(3)
    expect(wrapper.emitted('changeComplete')?.at(-1)).toEqual([[20, 50, 80]])

    await wrapper.findAll('[data-ui-slider-handle="true"]')[1].trigger('dblclick')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[20, 80]])
    wrapper.unmount()
  })

  it('does not move existing handles when editable range has reached maxCount', async () => {
    const wrapper = mount(Slider, {
      props: {
        range: {
          editable: true,
          minCount: 1,
          maxCount: 2
        },
        defaultValue: [20, 80]
      },
      attachTo: document.body
    })
    const root = wrapper.find('[data-ui-slider="true"]')

    mockSliderRect(root.element)
    await dispatchPointer(root.element, 'pointerdown', {
      button: 0,
      clientX: 100,
      clientY: 20
    })
    window.dispatchEvent(createPointerEvent('pointerup', { clientX: 100, clientY: 20 }))
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.findAll('[data-ui-slider-handle="true"]')).toHaveLength(2)
    expect(wrapper.findAll('[data-ui-slider-handle-wrap="true"]')[0].attributes('style')).toContain('left: 20%')
    expect(wrapper.findAll('[data-ui-slider-handle-wrap="true"]')[1].attributes('style')).toContain('left: 80%')
    wrapper.unmount()
  })

  it('renders marks and snaps to mark values when step is null', async () => {
    const wrapper = mount(Slider, {
      props: {
        modelValue: 0,
        step: null,
        marks: {
          0: '0°C',
          26: '26°C',
          37: {
            label: '37°C',
            style: {
              color: 'red'
            }
          }
        }
      },
      attachTo: document.body
    })
    const root = wrapper.find('[data-ui-slider="true"]')

    expect(wrapper.findAll('[data-ui-slider-mark="true"]')).toHaveLength(3)
    mockSliderRect(root.element)
    await dispatchPointer(root.element, 'pointerdown', {
      button: 0,
      clientX: 60,
      clientY: 20
    })

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([26])
    wrapper.unmount()
  })

  it('updates tooltip alignment key when dragging to mark dots', async () => {
    const wrapper = mount(Slider, {
      props: {
        defaultValue: 0,
        step: null,
        marks: {
          0: '0°C',
          50: '50°C',
          100: '100°C'
        },
        tooltip: {
          open: true
        }
      },
      attachTo: document.body
    })
    const root = wrapper.find('[data-ui-slider="true"]')
    const trigger = wrapper.find('[data-ui-tooltip-trigger="true"]')

    expect(trigger.attributes('aria-describedby')).toBeDefined()
    expect(wrapper.findComponent({ name: 'Tooltip' }).props('forceAlignKey')).toBe('0:0:horizontal:normal')

    mockSliderRect(root.element)
    await dispatchPointer(root.element, 'pointerdown', {
      button: 0,
      clientX: 120,
      clientY: 20
    })
    await wrapper.vm.$nextTick()

    expect(wrapper.findComponent({ name: 'Tooltip' }).props('forceAlignKey')).toBe('0:50:horizontal:normal')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([50])
    wrapper.unmount()
  })

  it('shows dots for step values and marks active included dots', () => {
    const wrapper = mount(Slider, {
      props: {
        modelValue: 50,
        dots: true,
        step: 25
      }
    })

    expect(wrapper.findAll('[data-ui-slider-dot="true"]')).toHaveLength(5)
    expect(wrapper.findAll('[data-ui-slider-dot="true"]')[1].classes()).toContain('border-[var(--ui-slider-color)]')
    expect(wrapper.find('[data-ui-slider="true"]').attributes('style')).toContain('--ui-slider-color: oklch(68.98% 0.1679 252.18)')
  })

  it('supports custom color for active slider elements', () => {
    const wrapper = mount(Slider, {
      props: {
        modelValue: 50,
        dots: true,
        step: 25,
        color: '#16a34a'
      }
    })
    const rootStyle = wrapper.find('[data-ui-slider="true"]').attributes('style')
    const activeDot = wrapper.findAll('[data-ui-slider-dot="true"]')[1]
    const track = wrapper.find('[data-ui-slider-track="true"]')
    const handle = wrapper.find('[data-ui-slider-handle="true"]')

    expect(rootStyle).toContain('--ui-slider-color: #16a34a')
    expect(rootStyle).toContain('--ui-slider-color-hover: color-mix(in oklab, #16a34a 86%, white)')
    expect(rootStyle).toContain('--ui-slider-color-soft: color-mix(in oklab, #16a34a 16%, transparent)')
    expect(track.classes()).toContain('bg-[var(--ui-slider-color)]')
    expect(activeDot.classes()).toContain('border-[var(--ui-slider-color)]')
    expect(handle.classes()).toContain('border-[var(--ui-slider-color)]')
  })

  it('supports vertical and reverse pointer mapping', async () => {
    const wrapper = mount(Slider, {
      props: {
        modelValue: 0,
        vertical: true,
        reverse: true
      },
      attachTo: document.body
    })
    const root = wrapper.find('[data-ui-slider="true"]')

    mockSliderRect(root.element, {
      top: 0,
      bottom: 200,
      height: 200,
      width: 40,
      right: 40,
      y: 0
    })
    await dispatchPointer(root.element, 'pointerdown', {
      button: 0,
      clientX: 20,
      clientY: 40
    })

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([20])
    expect(root.attributes('data-vertical')).toBe('true')
    expect(root.attributes('data-reverse')).toBe('true')
    wrapper.unmount()
  })

  it('updates by keyboard and emits changeComplete', async () => {
    const wrapper = mount(Slider, {
      props: {
        modelValue: 10,
        step: 5
      }
    })
    const handle = wrapper.find('[data-ui-slider-handle="true"]')

    await handle.trigger('keydown', {
      key: 'ArrowRight'
    })

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([15])
    expect(wrapper.emitted('changeComplete')?.[0]).toEqual([15])
  })

  it('respects keyboard false and disabled handle array', async () => {
    const keyboardWrapper = mount(Slider, {
      props: {
        modelValue: 10,
        keyboard: false
      }
    })

    await keyboardWrapper.find('[data-ui-slider-handle="true"]').trigger('keydown', {
      key: 'ArrowRight'
    })
    expect(keyboardWrapper.emitted('update:modelValue')).toBeUndefined()
    keyboardWrapper.unmount()

    const rangeWrapper = mount(Slider, {
      props: {
        range: true,
        modelValue: [20, 80],
        disabled: [true, false]
      }
    })
    const handles = rangeWrapper.findAll('[data-ui-slider-handle="true"]')

    expect(handles[0].attributes('tabindex')).toBe('-1')
    expect(handles[1].attributes('tabindex')).toBe('0')
    await handles[0].trigger('keydown', {
      key: 'ArrowRight'
    })
    expect(rangeWrapper.emitted('update:modelValue')).toBeUndefined()
    rangeWrapper.unmount()
  })

  it('hides tooltip when formatter returns null and opens when controlled', async () => {
    const wrapper = mount(Slider, {
      props: {
        modelValue: 30,
        tooltip: {
          open: true,
          formatter: (value: number) => `${value}%`
        }
      },
      attachTo: document.body
    })

    await flushFrame()

    expect(document.body.querySelector('[role="tooltip"]')?.textContent).toContain('30%')

    await wrapper.setProps({
      tooltip: {
        open: true,
        formatter: () => null
      }
    })
    await flushFrame()

    expect((document.body.querySelector('[role="tooltip"]') as HTMLElement | null)?.style.display).toBe('none')
    wrapper.unmount()
  })

  it('does not emit changes when disabled', async () => {
    const wrapper = mount(Slider, {
      props: {
        modelValue: 20,
        disabled: true
      }
    })
    const root = wrapper.find('[data-ui-slider="true"]')

    mockSliderRect(root.element)
    await dispatchPointer(root.element, 'pointerdown', {
      button: 0,
      clientX: 120,
      clientY: 20
    })
    await wrapper.find('[data-ui-slider-handle="true"]').trigger('keydown', {
      key: 'ArrowRight'
    })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.find('[data-ui-slider-handle="true"]').attributes('tabindex')).toBe('-1')
  })
})
