import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import { inputControl, inputGroup, inputSizer, inputWrapper } from '../index'
import Input from '../Input.vue'

describe('Input', () => {
  it('aligns sizes to button height tokens', () => {
    expect(inputWrapper()).toContain('border-control')
    expect(inputWrapper({ size: 'sm' })).not.toContain('calc(')
    expect(inputWrapper({ size: 'md' })).not.toContain('calc(')
    expect(inputWrapper({ size: 'lg' })).not.toContain('calc(')
    expect(inputGroup({ size: 'sm' })).not.toContain('calc(')
    expect(inputGroup({ size: 'md' })).not.toContain('calc(')
    expect(inputGroup({ size: 'lg' })).not.toContain('calc(')
    expect(inputGroup({ size: 'md' })).toContain('self-start')
    expect(inputSizer({ size: 'sm' })).toContain('py-1')
    expect(inputSizer({ size: 'md' })).toContain('py-2')
    expect(inputSizer({ size: 'lg' })).toContain('py-2')
    expect(inputSizer({ size: 'md' })).toContain('w-[20ch]')
    expect(inputControl({ size: 'md' })).toContain('h-full')
    expect(inputControl({ size: 'md' })).toContain('py-0')
    expect(inputWrapper({ size: 'md', multiline: true })).toContain('h-auto')
    expect(inputGroup({ size: 'md', multiline: true })).toContain('h-auto')
    expect(inputControl({ size: 'md', multiline: true })).toContain('py-2')
  })

  it('keeps an intrinsic width contribution for shrink-to-fit layouts', () => {
    const wrapper = mount(Input)
    const control = wrapper.find('[data-ui-input-control="true"]')
    const holder = control.element.parentElement
    const sizer = holder?.querySelector('[aria-hidden="true"]')

    expect(holder?.classList).toContain('flex-auto')
    expect(sizer?.classList).toContain('w-[20ch]')
  })

  it('renders prefix suffix prepend and append content', () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: 'demo',
        prefixIcon: 'i-lucide:search',
        suffix: 'm'
      },
      slots: {
        prepend: '<span data-test="prepend">https://</span>',
        append: '<span data-test="append">.com</span>',
        prefix: '<span data-test="prefix">P</span>',
        suffix: '<span data-test="suffix">S</span>'
      }
    })

    expect(wrapper.find('[data-test="prepend"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="append"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="prefix"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="suffix"]').exists()).toBe(true)
    expect(wrapper.find('.i-lucide\\:search').exists()).toBe(true)
    expect(wrapper.text()).toContain('m')
  })

  it('emits cleared model value and clear event', async () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: 'abc',
        clearable: true
      }
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([''])
    expect(wrapper.emitted('clear')).toHaveLength(1)
  })

  it('toggles password input visibility', async () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: 'secret',
        password: true
      }
    })
    const input = wrapper.find('input')

    expect(input.attributes('type')).toBe('password')
    await wrapper.find('button').trigger('click')
    expect(input.attributes('type')).toBe('text')
  })

  it('forwards autocomplete to the native autofill target', () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: 'admin',
        autocomplete: 'username'
      }
    })
    const input = wrapper.find('[data-ui-input-control="true"]')

    expect(input.element.tagName).toBe('INPUT')
    expect(input.attributes('autocomplete')).toBe('username')
  })

  it('renders textarea and word limit for multiline input', () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: 'hello',
        multiline: true,
        maxlength: 12,
        showWordLimit: true
      }
    })

    expect(wrapper.find('textarea').exists()).toBe(true)
    expect(wrapper.text()).toContain('5 / 12')
  })

  it('uses formatter and parser when syncing values', async () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: '1234',
        formatter: (value: string) => value.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
        parser: (value: string) => value.replaceAll(',', '')
      }
    })
    const input = wrapper.find('input')

    expect(input.element.value).toBe('1,234')
    await input.setValue('9,876')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['9876'])
  })

  it('normalizes number precision on input', async () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: 1,
        type: 'number',
        precision: 2,
        min: 0,
        max: 10
      }
    })

    await wrapper.find('input').setValue('12.345')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([10])
  })

  it('keeps an invalid number draft while focused and syncs it on blur', async () => {
    const wrapper = mount({
      components: { Input },
      data: () => ({ amount: 1 }),
      template: '<Input v-model="amount" type="number" :min="0" :max="10" />'
    })
    const input = wrapper.find('input')

    await input.trigger('focus')
    await input.setValue('12')

    expect(input.element.value).toBe('12')
    expect(input.element.validity.rangeOverflow).toBe(true)
    expect((wrapper.vm as { amount: number }).amount).toBe(10)

    await input.trigger('blur')
    await nextTick()

    expect(input.element.value).toBe('10')
  })

  it('keeps the number draft when precision normalizes the model while focused', async () => {
    const wrapper = mount({
      components: { Input },
      data: () => ({ amount: 123.45 }),
      template: '<Input v-model="amount" type="number" :step="0.01" :precision="2" />'
    })
    const input = wrapper.find('input')

    await input.trigger('focus')
    await input.setValue('1237.456')

    expect(input.element.value).toBe('1237.456')
    expect((wrapper.vm as { amount: number }).amount).toBe(1237.46)

    await input.trigger('blur')
    await nextTick()

    expect(input.element.value).toBe('1237.46')
  })

  it('converts a full-width period before native number input filters it', () => {
    const numberWrapper = mount(Input, {
      props: {
        modelValue: '1',
        type: 'number'
      }
    })
    const textWrapper = mount(Input, {
      props: {
        modelValue: '1'
      }
    })
    const originalExecCommand = document.execCommand
    const execCommand = vi.fn(() => true)
    document.execCommand = execCommand

    try {
      const numberEvent = new InputEvent('beforeinput', { bubbles: true, cancelable: true, data: '。', inputType: 'insertText' })
      numberWrapper.find('input').element.dispatchEvent(numberEvent)

      expect(numberEvent.defaultPrevented).toBe(true)
      expect(execCommand).toHaveBeenCalledWith('insertText', false, '.')

      const textEvent = new InputEvent('beforeinput', { bubbles: true, cancelable: true, data: '。', inputType: 'insertText' })
      textWrapper.find('input').element.dispatchEvent(textEvent)

      expect(textEvent.defaultPrevented).toBe(false)
      expect(execCommand).toHaveBeenCalledTimes(1)
    } finally {
      document.execCommand = originalExecCommand
    }
  })

  it('updates number values by horizontal drag', async () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: 1,
        type: 'number',
        draggable: true,
        step: 0.5,
        precision: 1
      },
      attachTo: document.body
    })

    wrapper.find('.i-lucide\\:grip-horizontal').element.dispatchEvent(new PointerEvent('pointerdown', { button: 0, pointerId: 1, clientX: 10, bubbles: true }))
    window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, clientX: 14 }))
    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, clientX: 14 }))

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([3])
    expect(wrapper.emitted('drag-end')).toBeTruthy()
  })
})
