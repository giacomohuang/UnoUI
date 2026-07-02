import { configureUnoUI } from '@unoui/vue'
import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'

import App from './App.vue'
import { router } from './router'
import { setTheme } from './theme'

import 'virtual:uno.css'
import './style.css'

configureUnoUI({
  locale: 'zh-CN'
})

setTheme(localStorage.getItem('theme') || 'light')

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  messages: {
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
})

createApp(App).use(router).use(i18n).mount('#app')
