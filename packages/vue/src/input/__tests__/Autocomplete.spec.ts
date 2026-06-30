import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import Autocomplete from '../Autocomplete.vue'
import type { AutocompleteSuggestion } from '../index'

const suggestions: AutocompleteSuggestion[] = [
  { value: '主入口', code: 'entry-main' },
  { value: '中庭扶梯', code: 'escalator-atrium' },
  { value: '服务台', code: 'service-desk' }
]

describe('Autocomplete', () => {
  it('filters static suggestions while typing', async () => {
    const wrapper = mount(Autocomplete, {
      props: {
        dataSource: suggestions,
        debounce: 0
      },
      attachTo: document.body
    })

    await wrapper.find('input').setValue('入口')
    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('主入口')
    })
    expect(document.body.textContent).not.toContain('服务台')

    wrapper.unmount()
  })

  it('emits selected suggestion and updates model value', async () => {
    const wrapper = mount(Autocomplete, {
      props: {
        modelValue: '',
        dataSource: suggestions,
        debounce: 0
      },
      attachTo: document.body
    })

    await wrapper.find('input').trigger('focus')
    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('服务台')
    })
    const serviceDesk = Array.from(document.body.querySelectorAll('.dropdown-item-wrapper')).find((item) => item.textContent?.includes('服务台')) as HTMLElement
    serviceDesk.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['服务台'])
    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({ value: '服务台', code: 'service-desk' })

    wrapper.unmount()
  })

  it('does not reopen suggestions after selecting an option', async () => {
    const wrapper = mount(Autocomplete, {
      props: {
        modelValue: '',
        dataSource: suggestions,
        debounce: 0
      },
      attachTo: document.body
    })

    await wrapper.find('input').trigger('focus')
    await vi.waitFor(() => {
      expect(document.body.querySelector('.dropdown-item-wrapper')).toBeTruthy()
    })
    await document.body.querySelector<HTMLElement>('.dropdown-item-wrapper')?.click()
    await wrapper.find('input').trigger('focus')
    await new Promise((resolve) => window.setTimeout(resolve, 20))

    expect(document.body.querySelector('.dropdown-item-wrapper')).toBeFalsy()

    wrapper.unmount()
  })

  it('refreshes suggestions with empty query after clear', async () => {
    const wrapper = mount(Autocomplete, {
      props: {
        modelValue: '入口',
        dataSource: suggestions,
        clearable: true,
        debounce: 0
      },
      attachTo: document.body
    })

    await wrapper.find('input').setValue('入口')
    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('主入口')
    })
    expect(document.body.textContent).not.toContain('服务台')

    await wrapper.find('button[aria-label="清空"]').trigger('click')
    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('服务台')
    })

    wrapper.unmount()
  })

  it('supports callback based remote suggestions', async () => {
    const dataSource = vi.fn((query: string, callback: (items: AutocompleteSuggestion[]) => void) => {
      callback(suggestions.filter((item) => item.value.includes(query)))
    })
    const wrapper = mount(Autocomplete, {
      props: {
        dataSource,
        debounce: 0
      },
      attachTo: document.body
    })

    await wrapper.find('input').setValue('扶梯')
    await vi.waitFor(() => {
      expect(dataSource).toHaveBeenCalledWith('扶梯', expect.any(Function))
      expect(document.body.textContent).toContain('中庭扶梯')
    })

    wrapper.unmount()
  })

  it('selects current text when unmatched selection is enabled', async () => {
    const wrapper = mount(Autocomplete, {
      props: {
        modelValue: '自定义点位',
        dataSource: [],
        selectWhenUnmatched: true,
        debounce: 0
      }
    })

    await wrapper.find('input').trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('select')?.[0]?.[0]).toEqual({ value: '自定义点位' })
  })
})
