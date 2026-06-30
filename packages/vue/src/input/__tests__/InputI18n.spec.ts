import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { beforeEach, describe, expect, it } from 'vitest'

import { configureUnoUI } from '../../config'

import InputI18n from '../InputI18n.vue'

const messages = {
  'zh-CN': {
    common: {
      cancel: '取消',
      save: '保存'
    },
    comp: {
      mpInputI18n: {
        editorTitle: '多语言编辑器',
        translate: '翻译',
        translateAll: '翻译全部',
        sourceRequired: '请先输入当前语言的文本',
        translatingAll: '正在翻译所有语言...',
        translateSuccess: '{lang} 翻译完成',
        translateAllSuccess: '所有语言翻译完成',
        translateFailed: '翻译失败',
        translateFailedWithReason: '翻译失败：{reason}',
        unknownError: '未知错误'
      }
    }
  }
}

const mountInputI18n = (options: Parameters<typeof mount<typeof InputI18n>>[1] = {}) =>
  mount(InputI18n, {
    global: {
      plugins: [createI18n({ legacy: false, locale: 'zh-CN', messages })],
      stubs: {
        Teleport: true
      }
    },
    ...options
  })

describe('InputI18n', () => {
  beforeEach(() => {
    configureUnoUI({
      locale: 'zh-CN',
      translate: async () => ({ text: 'translated' })
    })
  })

  it('renders current locale text and updates only that locale', async () => {
    const wrapper = mountInputI18n({
      props: {
        modelValue: {
          'zh-CN': '入口',
          en: 'Entrance'
        },
        languages: ['zh-CN', 'en']
      }
    })

    const input = wrapper.find('[data-ui-input-control="true"]')
    expect((input.element as HTMLInputElement).value).toBe('入口')

    await input.setValue('主入口')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([
      {
        'zh-CN': '主入口',
        en: 'Entrance'
      }
    ])
  })

  it('falls back to the first project language when current locale is unavailable', () => {
    const wrapper = mountInputI18n({
      props: {
        modelValue: {
          en: 'Entrance'
        },
        languages: ['en', 'ja']
      }
    })

    expect((wrapper.find('[data-ui-input-control="true"]').element as HTMLInputElement).value).toBe('Entrance')
  })

  it('opens editor and saves all language values', async () => {
    const wrapper = mountInputI18n({
      attachTo: document.body,
      props: {
        modelValue: {
          'zh-CN': '入口',
          en: 'Entrance'
        },
        languages: ['zh-CN', 'en']
      }
    })

    await wrapper.find('button[aria-label="多语言编辑器"]').trigger('click')
    const inputs = wrapper.findAll('[data-ui-input-control="true"]')
    await inputs[2].setValue('Main Entrance')
    await wrapper.findAll('button').find((button) => button.text() === '保存')?.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
      {
        'zh-CN': '入口',
        en: 'Main Entrance'
      }
    ])

    wrapper.unmount()
  })

  it('does not open the editor when disabled', async () => {
    const wrapper = mountInputI18n({
      props: {
        disabled: true,
        languages: ['zh-CN', 'en']
      }
    })

    await wrapper.find('button[aria-label="多语言编辑器"]').trigger('click')

    expect(wrapper.text()).not.toContain('翻译全部')
  })

  it('places clear button before locale editor button', () => {
    const wrapper = mountInputI18n({
      props: {
        modelValue: {
          'zh-CN': '入口',
          en: 'Entrance'
        },
        clearable: true,
        languages: ['zh-CN', 'en']
      }
    })

    const buttons = wrapper.findAll('button').map((button) => button.attributes('aria-label'))

    expect(buttons).toEqual(['清空', '多语言编辑器'])
  })
})
