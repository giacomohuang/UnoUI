import { defineComponent, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ComponentMountingOptions } from '@vue/test-utils'

import ColorPicker from '../ColorPicker.vue'
import type { ColorPickerValue } from '../color'
import { hexToRgba, hsbToRgb, rgbaToHex, rgbToHsb } from '../color'

type ColorPickerProps = InstanceType<typeof ColorPicker>['$props']

const mountColorPicker = (options: ComponentMountingOptions<typeof ColorPicker> = {}) =>
  mount(ColorPicker, {
    ...options,
    attachTo: document.body,
    global: {
      ...options.global,
      stubs: {
        ...options.global?.stubs,
        Teleport: true
      }
    }
  })

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

function mockRect(element: HTMLElement, rect: Partial<DOMRect>) {
  element.getBoundingClientRect = () =>
    ({
      left: 0,
      top: 0,
      width: 100,
      height: 12,
      right: 100,
      bottom: 12,
      x: 0,
      y: 0,
      toJSON: () => ({}),
      ...rect
    }) as DOMRect
}

function dispatchPointerDown(element: HTMLElement, clientX: number, clientY = 6) {
  element.dispatchEvent(
    new MouseEvent('pointerdown', {
      clientX,
      clientY,
      bubbles: true
    })
  )
}

function dispatchPointerMove(clientX: number, clientY = 6) {
  document.dispatchEvent(
    new MouseEvent('pointermove', {
      clientX,
      clientY,
      bubbles: true
    })
  )
}

function dispatchPointerUp(clientX: number, clientY = 6) {
  document.dispatchEvent(
    new MouseEvent('pointerup', {
      clientX,
      clientY,
      bubbles: true
    })
  )
}

describe('ColorPicker', () => {
  it('keeps trigger and popup geometry stable without consumer sizing classes', async () => {
    const wrapper = mountColorPicker({
      props: {
        modelValue: {
          mode: 'solid',
          color: { r: 0, g: 42, b: 255, a: 1 }
        }
      } satisfies ColorPickerProps
    })

    const trigger = wrapper.find('[data-ui-colorpicker="true"]')
    expect(trigger.classes()).toContain('border-control')
    expect(trigger.classes()).toContain('p-1')
    expect(trigger.classes()).not.toContain('h-8')
    expect(trigger.classes()).not.toContain('w-8')
    expect(trigger.attributes('style')).toBeUndefined()
    expect(trigger.find('.ui-colorpicker-checker').classes()).toContain('size-6')

    await trigger.trigger('click')
    await flushPromises()

    const panel = wrapper.find('[role="dialog"]')
    const palette = wrapper.find('[data-ui-colorpicker-palette="true"]')
    const inputRow = wrapper.find('[data-ui-colorpicker-input-row="true"]')

    expect(panel.attributes('style')).toContain('width: 260px')
    expect(panel.attributes('style')).toContain('max-height: calc(100vh - 16px)')
    expect(palette.classes()).toContain('ui-colorpicker-palette')
    expect(palette.attributes('style')).toContain('height: 9rem')
    expect(inputRow.classes()).toContain('ui-colorpicker-input-row')
    expect(inputRow.attributes('style')).toContain('grid-template-columns: minmax(0, 1fr) 56px')
    wrapper.unmount()
  })

  it('renders a solid value and emits changed event after hue change', async () => {
    const wrapper = mountColorPicker({
      props: {
        modelValue: {
          mode: 'solid',
          color: { r: 255, g: 0, b: 0, a: 1 }
        }
      } satisfies ColorPickerProps
    })

    await wrapper.find('[data-ui-colorpicker="true"]').trigger('click')
    await flushPromises()

    const hueBar = document.body.querySelector('.ui-colorpicker-huebar') as HTMLElement
    mockRect(hueBar, { width: 360, right: 360 })
    dispatchPointerDown(hueBar, 120)
    await flushPromises()

    const emitted = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as ColorPickerValue
    expect(emitted).toMatchObject({
      mode: 'solid',
      css: expect.stringContaining('background-color:rgba(')
    })
    expect(wrapper.emitted('changed')).toHaveLength(1)
    expect(wrapper.emitted('change')).toBeUndefined()
    expect(wrapper.emitted('colorChanged')).toBeUndefined()
    expect(wrapper.emitted('visible-change')).toBeUndefined()
    wrapper.unmount()
  })

  it('clamps hue slider at edges without wrapping around', async () => {
    const wrapper = mountColorPicker({
      props: {
        modelValue: {
          mode: 'solid',
          color: { r: 255, g: 0, b: 0, a: 1 }
        }
      } satisfies ColorPickerProps
    })

    await wrapper.find('[data-ui-colorpicker="true"]').trigger('click')
    await flushPromises()

    const hueBar = document.body.querySelector('.ui-colorpicker-huebar') as HTMLElement
    mockRect(hueBar, { width: 360, right: 360 })
    dispatchPointerDown(hueBar, 420)
    await flushPromises()

    const rightValue = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as ColorPickerValue
    expect(rightValue.color).toMatchObject({ r: 255, g: 0, b: 0 })

    dispatchPointerMove(-60)
    await flushPromises()

    const leftValue = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as ColorPickerValue
    expect(leftValue.color).toMatchObject({ r: 255, g: 0, b: 0 })
    wrapper.unmount()
  })

  it('keeps hue handle at 100 percent after parent v-model writes back red', async () => {
    const Harness = defineComponent({
      components: { ColorPicker },
      setup() {
        const color = ref<ColorPickerValue>({
          mode: 'solid',
          color: { r: 255, g: 0, b: 0, a: 1 }
        })

        return { color }
      },
      template: '<ColorPicker v-model="color" />'
    })
    const wrapper = mount(Harness, {
      attachTo: document.body,
      global: {
        stubs: {
          Teleport: true
        }
      }
    })

    await wrapper.find('[data-ui-colorpicker="true"]').trigger('click')
    await flushPromises()

    const hueBar = document.body.querySelector('.ui-colorpicker-huebar') as HTMLElement
    mockRect(hueBar, { width: 360, right: 360 })
    dispatchPointerDown(hueBar, 360)
    await flushPromises()

    const picker = document.body.querySelector('.ui-colorpicker-bar-picker') as HTMLElement
    expect(picker.style.left).toBe('100%')
    wrapper.unmount()
  })

  it('scales hue and opacity handles on hover and while dragging', async () => {
    const wrapper = mountColorPicker({
      props: {
        modelValue: {
          mode: 'solid',
          color: { r: 33, g: 137, b: 216, a: 0.5 }
        }
      } satisfies ColorPickerProps
    })

    await wrapper.find('[data-ui-colorpicker="true"]').trigger('click')
    await flushPromises()

    const hueBar = document.body.querySelector('.ui-colorpicker-huebar') as HTMLElement
    const opacityBar = document.body.querySelector('[data-ui-colorpicker-opacity="true"]') as HTMLElement
    mockRect(hueBar, { width: 360, right: 360 })
    mockRect(opacityBar, { width: 200, right: 200 })

    const hueHandle = wrapper.find('[data-ui-colorpicker-hue-handle="true"]')
    const opacityHandle = wrapper.find('[data-ui-colorpicker-opacity-handle="true"]')
    expect(hueHandle.classes()).toContain('hover:scale-125')
    expect(opacityHandle.classes()).toContain('hover:scale-125')

    dispatchPointerDown(hueBar, 180)
    dispatchPointerMove(220)
    await flushPromises()

    const draggingHueHandle = wrapper.find('[data-ui-colorpicker-hue-handle="true"]')
    expect(draggingHueHandle.classes()).toContain('scale-125')

    dispatchPointerUp(220)
    await flushPromises()

    const releasedHueHandle = wrapper.find('[data-ui-colorpicker-hue-handle="true"]')
    expect(releasedHueHandle.classes()).not.toContain('scale-125')

    dispatchPointerDown(opacityBar, 120)
    dispatchPointerMove(160)
    await flushPromises()

    const draggingOpacityHandle = wrapper.find('[data-ui-colorpicker-opacity-handle="true"]')
    expect(draggingOpacityHandle.classes()).toContain('scale-125')

    dispatchPointerUp(160)
    await flushPromises()

    const releasedOpacityHandle = wrapper.find('[data-ui-colorpicker-opacity-handle="true"]')
    expect(releasedOpacityHandle.classes()).not.toContain('scale-125')
    wrapper.unmount()
  })

  it('clamps gradient stop dragging to bar edges', async () => {
    const wrapper = mountColorPicker({
      props: {
        modelValue: {
          mode: 'linear',
          degree: 45,
          gradients: [
            { percent: 20, color: { r: 255, g: 0, b: 0, a: 1 } },
            { percent: 80, color: { r: 0, g: 0, b: 255, a: 1 } }
          ]
        }
      } satisfies ColorPickerProps
    })

    await wrapper.find('[data-ui-colorpicker="true"]').trigger('click')
    await flushPromises()

    const gradientBar = wrapper.findAll('.ui-colorpicker-checker')[1].element as HTMLElement
    mockRect(gradientBar, { width: 200, right: 200 })
    const stop = wrapper.find('.ui-colorpicker-stop').element as HTMLElement

    dispatchPointerDown(stop, 40)
    dispatchPointerMove(260)
    await flushPromises()

    const rightValue = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as ColorPickerValue
    expect(rightValue.gradients?.[1].percent).toBe(100)

    dispatchPointerMove(-40)
    await flushPromises()

    const leftValue = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as ColorPickerValue
    expect(leftValue.gradients?.[0].percent).toBe(0)
    wrapper.unmount()
  })

  it('highlights active gradient stop and removes it when dragged away from the bar', async () => {
    const wrapper = mountColorPicker({
      props: {
        modelValue: {
          mode: 'linear',
          degree: 45,
          gradients: [
            { percent: 0, color: { r: 255, g: 0, b: 0, a: 1 } },
            { percent: 50, color: { r: 0, g: 255, b: 0, a: 1 } },
            { percent: 100, color: { r: 0, g: 0, b: 255, a: 1 } }
          ]
        }
      } satisfies ColorPickerProps
    })

    await wrapper.find('[data-ui-colorpicker="true"]').trigger('click')
    await flushPromises()

    const gradientBar = wrapper.findAll('.ui-colorpicker-checker')[1].element as HTMLElement
    mockRect(gradientBar, { width: 200, height: 16, right: 200, bottom: 16 })
    const middleStop = wrapper.findAll('.ui-colorpicker-stop')[1]

    dispatchPointerDown(middleStop.element as HTMLElement, 100, 8)
    await flushPromises()

    const activeStop = wrapper.findAll('.ui-colorpicker-stop')[1]
    expect(activeStop.classes()).toContain('scale-125')
    expect(activeStop.classes()).toContain('ring-brand-500')
    expect(activeStop.classes()).toContain('hover:scale-125')

    dispatchPointerMove(120, 48)
    await flushPromises()

    const pendingStop = wrapper.findAll('.ui-colorpicker-stop')[1]
    expect(pendingStop.classes()).toContain('opacity-50')

    dispatchPointerUp(120, 48)
    await flushPromises()

    const emitted = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as ColorPickerValue
    expect(emitted.gradients).toHaveLength(2)
    expect(emitted.gradients?.map((stop) => stop.percent)).toEqual([0, 100])
    expect(wrapper.findAll('.ui-colorpicker-stop')).toHaveLength(2)
    wrapper.unmount()
  })

  it('keeps selected gradient stop highlighted without scaling after drag ends', async () => {
    const wrapper = mountColorPicker({
      props: {
        modelValue: {
          mode: 'linear',
          degree: 45,
          gradients: [
            { percent: 20, color: { r: 255, g: 0, b: 0, a: 1 } },
            { percent: 80, color: { r: 0, g: 0, b: 255, a: 1 } }
          ]
        }
      } satisfies ColorPickerProps
    })

    await wrapper.find('[data-ui-colorpicker="true"]').trigger('click')
    await flushPromises()

    const gradientBar = wrapper.findAll('.ui-colorpicker-checker')[1].element as HTMLElement
    mockRect(gradientBar, { width: 200, height: 16, right: 200, bottom: 16 })
    const stop = wrapper.findAll('.ui-colorpicker-stop')[1]

    dispatchPointerDown(stop.element as HTMLElement, 160, 8)
    await flushPromises()

    expect(wrapper.findAll('.ui-colorpicker-stop')[1].classes()).toContain('scale-125')

    dispatchPointerUp(160, 8)
    await flushPromises()

    const selectedStop = wrapper.findAll('.ui-colorpicker-stop')[1]
    expect(selectedStop.classes()).toContain('ring-brand-500')
    expect(selectedStop.classes()).toContain('hover:scale-125')
    expect(selectedStop.classes()).not.toContain('scale-125')
    wrapper.unmount()
  })

  it('does not remove gradient stops with keyboard shortcuts', async () => {
    const wrapper = mountColorPicker({
      props: {
        modelValue: {
          mode: 'linear',
          degree: 45,
          gradients: [
            { percent: 0, color: { r: 255, g: 0, b: 0, a: 1 } },
            { percent: 50, color: { r: 0, g: 255, b: 0, a: 1 } },
            { percent: 100, color: { r: 0, g: 0, b: 255, a: 1 } }
          ]
        }
      } satisfies ColorPickerProps
    })

    await wrapper.find('[data-ui-colorpicker="true"]').trigger('click')
    await flushPromises()

    const middleStop = wrapper.findAll('.ui-colorpicker-stop')[1]
    await middleStop.trigger('keydown', { key: 'Delete' })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }))
    await flushPromises()

    expect(wrapper.findAll('.ui-colorpicker-stop')).toHaveLength(3)

    await middleStop.trigger('keydown', { key: 'ArrowRight' })
    await flushPromises()

    const emitted = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as ColorPickerValue
    expect(emitted.gradients?.map((stop) => stop.percent)).toEqual([0, 51, 100])
    wrapper.unmount()
  })

  it('preserves linear gradient mode and emits css output', async () => {
    const wrapper = mountColorPicker({
      props: {
        modelValue: {
          mode: 'linear',
          degree: 45,
          gradients: [
            { percent: 0, color: { r: 255, g: 0, b: 0, a: 1 } },
            { percent: 100, color: { r: 0, g: 0, b: 255, a: 0.5 } }
          ]
        }
      } satisfies ColorPickerProps
    })

    await wrapper.find('[data-ui-colorpicker="true"]').trigger('click')
    await flushPromises()
    await wrapper.find('[aria-label="纯色"]').trigger('click')

    const emitted = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as ColorPickerValue
    expect(emitted).toMatchObject({
      mode: 'solid',
      color: expect.objectContaining({ r: 255, g: 0, b: 0, a: 1 })
    })
    wrapper.unmount()
  })

  it('forces solid mode when gradient is not allowed', async () => {
    const wrapper = mountColorPicker({
      props: {
        allowGradient: false,
        modelValue: {
          mode: 'radial',
          gradients: [
            { percent: 0, color: { r: 255, g: 255, b: 255, a: 1 } },
            { percent: 100, color: { r: 0, g: 0, b: 0, a: 1 } }
          ]
        }
      } satisfies ColorPickerProps
    })

    await wrapper.find('[data-ui-colorpicker="true"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[aria-label="线性渐变"]').exists()).toBe(false)
    expect(wrapper.find('.ui-colorpicker-stop').exists()).toBe(false)
    wrapper.unmount()
  })

  it('hides opacity slider and emits opaque value when alpha is not allowed', async () => {
    const wrapper = mountColorPicker({
      props: {
        allowAlpha: false,
        modelValue: {
          mode: 'solid',
          color: { r: 244, g: 63, b: 94, a: 0.45 }
        }
      } satisfies ColorPickerProps
    })

    await wrapper.find('[data-ui-colorpicker="true"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-ui-colorpicker-opacity="true"]').exists()).toBe(false)

    const hueBar = document.body.querySelector('.ui-colorpicker-huebar') as HTMLElement
    mockRect(hueBar, { width: 360, right: 360 })
    dispatchPointerDown(hueBar, 120)
    await flushPromises()

    const emitted = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as ColorPickerValue
    expect(emitted.color).toMatchObject({ a: 1 })
    wrapper.unmount()
  })

  it('allows gradient selection when only static allow-alpha is false', async () => {
    const wrapper = mountColorPicker({
      props: {
        allowAlpha: 'false',
        modelValue: {
          mode: 'solid',
          color: { r: 244, g: 63, b: 94, a: 0.45 }
        }
      } satisfies ColorPickerProps
    })

    await wrapper.find('[data-ui-colorpicker="true"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[aria-label="线性渐变"]').exists()).toBe(true)
    expect(wrapper.find('[data-ui-colorpicker-opacity="true"]').exists()).toBe(false)

    await wrapper.find('[aria-label="线性渐变"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-ui-colorpicker-gradient-row="true"]').exists()).toBe(true)

    const emitted = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as ColorPickerValue
    expect(emitted.mode).toBe('linear')
    expect(emitted.gradients?.every((stop) => stop.color.a === 1)).toBe(true)
    wrapper.unmount()
  })

  it('edits solid color through hex rgb and rgba input with validation', async () => {
    vi.useFakeTimers()
    const wrapper = mountColorPicker({
      props: {
        modelValue: {
          mode: 'solid',
          color: { r: 255, g: 0, b: 0, a: 1 }
        }
      } satisfies ColorPickerProps
    })

    await wrapper.find('[data-ui-colorpicker="true"]').trigger('click')
    await flushPromises()

    const input = wrapper.find<HTMLInputElement>('[data-ui-colorpicker-color-input="true"]')
    expect(input.element.value).toBe('#ff0000')

    await input.trigger('focus')
    await input.setValue('#49a4eb')
    await vi.advanceTimersByTimeAsync(199)
    await flushPromises()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await vi.advanceTimersByTimeAsync(1)
    await flushPromises()

    let emitted = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as ColorPickerValue
    expect(emitted.color).toMatchObject({ r: 73, g: 164, b: 235, a: 1 })
    expect(input.element.value).toBe('#49a4eb')

    await input.setValue('rgb(10, 20, 30)')
    await vi.advanceTimersByTimeAsync(200)
    await flushPromises()

    emitted = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as ColorPickerValue
    expect(emitted.color).toMatchObject({ r: 10, g: 20, b: 30, a: 1 })
    expect(input.element.value).toBe('rgb(10, 20, 30)')

    await input.trigger('blur')
    await flushPromises()

    emitted = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as ColorPickerValue
    expect(emitted.color).toMatchObject({ r: 10, g: 20, b: 30, a: 1 })
    expect(input.element.value).toBe('#0a141e')

    await input.setValue('rgba(10, 20, 30, 0.5)')
    await input.trigger('keydown', { key: 'Enter' })
    await flushPromises()

    emitted = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as ColorPickerValue
    expect(emitted.color).toMatchObject({ r: 10, g: 20, b: 30, a: 0.5 })
    expect(input.element.value).toBe('#0a141e80')

    const emitCount = wrapper.emitted('update:modelValue')?.length ?? 0
    await input.setValue('rgba(10, 20, 30, 2)')
    await input.trigger('keydown', { key: 'Enter' })
    await flushPromises()

    const invalidInput = wrapper.find<HTMLInputElement>('[data-ui-colorpicker-color-input="true"]')
    expect(invalidInput.attributes('aria-invalid')).toBe('true')
    expect(invalidInput.classes()).toContain('border-[#ff4d4f]')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(emitCount)
    wrapper.unmount()
  })

  it('shows and edits selected gradient stop color instead of gradient css', async () => {
    vi.useFakeTimers()
    const wrapper = mountColorPicker({
      props: {
        modelValue: {
          mode: 'linear',
          degree: 90,
          gradients: [
            { percent: 0, color: { r: 255, g: 0, b: 0, a: 1 } },
            { percent: 100, color: { r: 0, g: 0, b: 255, a: 1 } }
          ]
        }
      } satisfies ColorPickerProps
    })

    await wrapper.find('[data-ui-colorpicker="true"]').trigger('click')
    await flushPromises()

    const input = wrapper.find<HTMLInputElement>('[data-ui-colorpicker-color-input="true"]')
    expect(input.element.value).toBe('#ff0000')
    expect(input.element.value).not.toContain('linear-gradient')

    const gradientBar = wrapper.find('[data-ui-colorpicker-gradient-row="true"] .ui-colorpicker-checker').element as HTMLElement
    mockRect(gradientBar, { width: 100, height: 16, right: 100, bottom: 16 })
    const secondStop = wrapper.findAll('.ui-colorpicker-stop')[1]
    dispatchPointerDown(secondStop.element as HTMLElement, 100, 8)
    dispatchPointerUp(100, 8)
    await flushPromises()

    expect(wrapper.find<HTMLInputElement>('[data-ui-colorpicker-color-input="true"]').element.value).toBe('#0000ff')

    await input.trigger('focus')
    await input.setValue('#49a4eb')
    await vi.advanceTimersByTimeAsync(200)
    await flushPromises()

    const emitted = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as ColorPickerValue
    expect(emitted.mode).toBe('linear')
    expect(emitted.gradients?.[1].color).toMatchObject({ r: 73, g: 164, b: 235, a: 1 })
    expect(input.element.value).toBe('#49a4eb')
    wrapper.unmount()
  })

  it('renders linear gradient bar and degree picker in one row with stronger degree border', async () => {
    const wrapper = mountColorPicker({
      props: {
        modelValue: {
          mode: 'linear',
          degree: 90,
          gradients: [
            { percent: 0, color: { r: 255, g: 0, b: 0, a: 1 } },
            { percent: 100, color: { r: 0, g: 0, b: 255, a: 1 } }
          ]
        }
      } satisfies ColorPickerProps
    })

    await wrapper.find('[data-ui-colorpicker="true"]').trigger('click')
    await flushPromises()

    const gradientRow = wrapper.find('[data-ui-colorpicker-gradient-row="true"]')
    const degreeGroup = wrapper.find('[data-ui-colorpicker-degree-group="true"]')
    const degreePicker = wrapper.find('[data-ui-colorpicker-degree="true"]')
    const degreePointer = wrapper.find('[data-ui-colorpicker-degree-pointer="true"]')
    const degreeLine = wrapper.find('[data-ui-colorpicker-degree-line="true"]')
    const degreeHandle = wrapper.find('[data-ui-colorpicker-degree-handle="true"]')

    expect(gradientRow.classes()).toContain('flex')
    expect(Array.from(degreeGroup.element.children).at(0)?.textContent).toBe('90°')
    expect(degreePicker.classes()).toContain('border-strong')
    expect(degreePointer.attributes('style')).toContain('translateY(-50%)')
    expect(degreeLine.classes()).toContain('bg-[var(--color-border-strong)]')
    expect(degreeHandle.classes()).toContain('border-strong')
    expect(degreeHandle.classes()).toContain('hover:scale-125')
    expect(degreeHandle.classes()).toContain('hover:border-brand')

    const degreeElement = degreePicker.element as HTMLElement
    mockRect(degreeElement, { left: 0, top: 0, width: 24, height: 24, right: 24, bottom: 24 })
    dispatchPointerDown(degreeElement, 24, 12)
    dispatchPointerMove(80, 12)
    await flushPromises()

    const draggingDegreeHandle = wrapper.find('[data-ui-colorpicker-degree-handle="true"]')
    expect(draggingDegreeHandle.classes()).toContain('scale-125')
    expect(draggingDegreeHandle.classes()).toContain('border-brand')

    dispatchPointerUp(80, 12)
    await flushPromises()

    const releasedDegreeHandle = wrapper.find('[data-ui-colorpicker-degree-handle="true"]')
    expect(releasedDegreeHandle.classes()).not.toContain('scale-125')
    expect(releasedDegreeHandle.classes()).not.toContain('border-brand')
    wrapper.unmount()
  })

  it('keeps equal horizontal padding around radial gradient bar without a degree picker', async () => {
    const wrapper = mountColorPicker({
      props: {
        modelValue: {
          mode: 'radial',
          gradients: [
            { percent: 0, color: { r: 255, g: 255, b: 255, a: 1 } },
            { percent: 100, color: { r: 0, g: 0, b: 0, a: 1 } }
          ]
        }
      } satisfies ColorPickerProps
    })

    await wrapper.find('[data-ui-colorpicker="true"]').trigger('click')
    await flushPromises()

    const gradientRow = wrapper.find('[data-ui-colorpicker-gradient-row="true"]')
    const gradientBar = wrapper.find('[data-ui-colorpicker-gradient-row="true"] .ui-colorpicker-checker')
    expect(wrapper.find('[data-ui-colorpicker-degree-group="true"]').exists()).toBe(false)
    expect(gradientRow.classes()).toContain('mx-3')
    expect(gradientBar.classes()).not.toContain('ml2')
    wrapper.unmount()
  })

  it('uses fixed mode icon colors instead of current color', async () => {
    const wrapper = mountColorPicker({
      props: {
        modelValue: {
          mode: 'solid',
          color: { r: 33, g: 137, b: 216, a: 1 }
        }
      } satisfies ColorPickerProps
    })

    await wrapper.find('[data-ui-colorpicker="true"]').trigger('click')
    await flushPromises()

    const solidIcon = wrapper.find('[aria-label="纯色"] span')
    expect(solidIcon.classes()).toContain('border-[#ff7d3a]')
    expect(solidIcon.classes()).toContain('bg-[#ffc9b6]')
    expect(solidIcon.classes()).not.toContain('bg-current')
    wrapper.unmount()
  })

  it('keeps disabled trigger preview color opaque with not-allowed cursor', () => {
    const wrapper = mountColorPicker({
      props: {
        disabled: true,
        modelValue: {
          mode: 'solid',
          color: { r: 255, g: 0, b: 0, a: 1 }
        }
      } satisfies ColorPickerProps
    })

    const trigger = wrapper.find('[data-ui-colorpicker="true"]')
    const preview = trigger.find('.ui-colorpicker-checker > span')

    expect(trigger.classes()).toContain('cursor-not-allowed')
    expect(trigger.classes()).not.toContain('opacity-70')
    expect(trigger.classes()).not.toContain('grayscale')
    expect(preview.attributes('style')).toContain('background: rgb(255, 0, 0)')
    wrapper.unmount()
  })

  it('converts rgba, hsba and hex consistently', () => {
    const rgba = { r: 33, g: 137, b: 216, a: 0.5 }
    const hsba = rgbToHsb(rgba)
    const converted = hsbToRgb(hsba)

    expect(converted.r).toBe(rgba.r)
    expect(converted.g).toBe(rgba.g)
    expect(Math.abs(converted.b - rgba.b)).toBeLessThanOrEqual(1)
    expect(converted.a).toBe(rgba.a)
    expect(rgbaToHex(rgba)).toBe('#2189d880')
    expect(hexToRgba('#2189d880')).toEqual(rgba)
    expect(hexToRgba('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 })
  })
})
