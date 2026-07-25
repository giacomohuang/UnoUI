import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import InputTag from '../InputTag.vue'

describe('InputTag', () => {
  it('uses content padding instead of calculated row heights', () => {
    const wrapper = mount(InputTag, {
      props: {
        modelValue: ['alpha'],
        size: 'md',
        clearable: true
      }
    })

    const control = wrapper.find('[data-ui-input-tag="true"]')
    expect(control.attributes('style') || '').not.toContain('calc(')
    expect(control.classes()).toContain('py-1')
    expect(wrapper.find('button[aria-label="清空"]').classes()).toContain('top-1/2')
  })

  it('does not keep the md input height class at sm size', () => {
    const wrapper = mount(InputTag, {
      props: {
        modelValue: [],
        size: 'sm'
      }
    })

    const input = wrapper.find('[data-ui-input-tag-control="true"]')
    expect(input.classes()).toContain('h-5!')
    expect(input.classes()).not.toContain('h-6!')
  })

  it('adds tags with Enter and emits model updates', async () => {
    const wrapper = mount(InputTag, {
      props: {
        modelValue: []
      }
    })
    const input = wrapper.find('input')

    await input.setValue('入口')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['入口']])
    expect(wrapper.emitted('add-tag')?.[0]).toEqual(['入口'])
  })

  it('splits pasted text by delimiters and filters duplicates', async () => {
    const wrapper = mount(InputTag, {
      props: {
        modelValue: ['A'],
        delimiters: [',', ';']
      }
    })
    const input = wrapper.find('input')

    await input.trigger('paste', {
      clipboardData: {
        getData: () => 'A,B;C'
      }
    })

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['A', 'B', 'C']])
  })

  it('removes the last tag by Backspace on empty input', async () => {
    const wrapper = mount(InputTag, {
      props: {
        modelValue: ['L1', 'L2']
      }
    })

    await wrapper.find('input').trigger('keydown', { key: 'Backspace' })

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['L1']])
    expect(wrapper.emitted('remove-tag')?.[0]).toEqual(['L2', 1])
  })

  it('removes tags through closable Tag controls', async () => {
    const wrapper = mount(InputTag, {
      props: {
        modelValue: ['alpha', 'beta']
      }
    })

    await wrapper.findAll('button')[0].trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['beta']])
  })

  it('clears all tags when clearable', async () => {
    const wrapper = mount(InputTag, {
      props: {
        modelValue: ['alpha'],
        clearable: true
      }
    })

    await wrapper.find('button[aria-label="清空"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[]])
    expect(wrapper.emitted('clear')).toHaveLength(1)
  })

  it('respects max and custom validation', async () => {
    const wrapper = mount(InputTag, {
      props: {
        modelValue: ['A'],
        max: 2,
        delimiters: [','],
        validateTag: (value: string) => value.length > 1
      }
    })

    await wrapper.find('input').setValue('B,CC,DD')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['A', 'CC']])
  })

  it('keeps focus when Tab is used to add a tag', async () => {
    const wrapper = mount(InputTag, {
      props: {
        modelValue: [],
        trigger: ['Enter', 'Tab']
      },
      attachTo: document.body
    })
    const input = wrapper.find('input')

    await input.setValue('tab-tag')
    input.element.focus()
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    input.element.dispatchEvent(tabEvent)
    await wrapper.vm.$nextTick()

    expect(tabEvent.defaultPrevented).toBe(true)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['tab-tag']])
    expect(document.activeElement).toBe(input.element)
  })
})
