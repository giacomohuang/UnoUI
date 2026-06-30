<script setup lang="ts">
import { computed, ref, useAttrs, watch, type HTMLAttributes } from 'vue'
import { useI18n } from 'vue-i18n'

import { getUiAttrStyle } from '../attrs'
import { Button } from '../button'
import { useUnoUIConfig, getUnoUILanguageOption, normalizeUnoUILanguages } from '../config'
import { Modal } from '../modal'

import Input from './Input.vue'
import type { InputProps } from '.'

defineOptions({
  inheritAttrs: false
})

type I18nInputValue = Record<string, string>
type NoticeTone = 'info' | 'success' | 'warning' | 'error'
type ClassValue = HTMLAttributes['class']

const props = withDefaults(
  defineProps<{
    /** modelValue 是多语言文本对象，key 为语言码。 */
    modelValue?: I18nInputValue
    /** languages 是当前项目启用的语言；未传时使用后台内置语言列表。 */
    languages?: string[]
    /** size 是输入框尺寸，可选，默认 md。 */
    size?: InputProps['size']
    /** disabled 表示是否禁用输入和编辑器入口。 */
    disabled?: boolean
    /** readonly 表示是否只读；只读时禁止直接输入，但仍允许打开编辑器查看。 */
    readonly?: boolean
    /** placeholder 是主输入占位文案。 */
    placeholder?: string
    /** name 是主输入原生 name。 */
    name?: string
    /** clearable 表示是否允许一键清空当前语言文本。 */
    clearable?: boolean
    /** prefixIcon 是主输入前缀图标类名。 */
    prefixIcon?: string
    /** suffixIcon 是主输入后缀图标类名。 */
    suffixIcon?: string
    /** prefix 是主输入前缀文字。 */
    prefix?: string
    /** suffix 是主输入后缀文字。 */
    suffix?: string
    /** autocomplete 是主输入原生 autocomplete。 */
    autocomplete?: string
    /** modalZIndex 用于在 Drawer 等浮层内提高多语言编辑器层级。 */
    modalZIndex?: number | string
  }>(),
  {
    modelValue: () => ({}),
    languages: undefined,
    size: 'md',
    disabled: false,
    readonly: false,
    placeholder: '',
    name: undefined,
    clearable: false,
    prefixIcon: '',
    suffixIcon: '',
    prefix: '',
    suffix: '',
    autocomplete: 'new-password',
    modalZIndex: 2000
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: I18nInputValue): void
  (e: 'input', value: I18nInputValue, event?: Event): void
  (e: 'change', value: I18nInputValue, event?: Event): void
  (e: 'clear'): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}>()

const attrs = useAttrs()
const { t } = useI18n()
const unoUIConfig = useUnoUIConfig()

const editorVisible = ref(false)
const translationData = ref<I18nInputValue>({})
const editorLanguages = ref<string[]>([])
const notice = ref<{ tone: NoticeTone; text: string } | null>(null)
const translatingLang = ref<string | null>(null)
const translatingAll = ref(false)

const configuredLanguages = computed(() => unoUIConfig.languages)
const configuredLocale = computed(() => {
  const locale = unoUIConfig.locale
  return typeof locale === 'function' ? locale() : locale
})
const projectLanguageKeys = computed(() => (props.languages ? normalizeUnoUILanguages(props.languages) : configuredLanguages.value.map((lang) => lang.key)))
const currentLang = computed(() => {
  const locale = String(configuredLocale.value || '')
  if (!props.languages) return locale
  return projectLanguageKeys.value.includes(locale) ? locale : projectLanguageKeys.value[0]
})
const currentValue = computed(() => props.modelValue?.[currentLang.value] || '')
const isDisabled = computed(() => props.disabled || attrs.disabled === '' || attrs.disabled === true || attrs.disabled === 'true')
const showClearButton = computed(() => props.clearable && !isDisabled.value && !props.readonly && currentValue.value.length > 0)
const getInputClass = () => attrs.class as ClassValue
const getInputAttrs = () => {
  // class/style 交给外层 Input，避免属性同时落到原生 input 上。
  const { class: _class, style: _style, disabled: _disabled, readonly: _readonly, ...rest } = attrs
  return rest
}
const noticeClass = computed(() => {
  if (!notice.value) return ''
  if (notice.value.tone === 'success') return 'border-teal-500/20 bg-teal-50/60 text-teal-700 dark:(border-teal-500/25 bg-teal-950/20 text-teal-300)'
  if (notice.value.tone === 'warning') return 'border-orange-400/25 bg-orange-50/60 text-orange-700 dark:(border-orange-400/30 bg-orange-950/20 text-orange-300)'
  if (notice.value.tone === 'error') return 'border-rose-500/20 bg-rose-50/60 text-rose-700 dark:(border-rose-500/30 bg-rose-950/20 text-rose-300)'
  return 'border-brand/20 bg-brand/5 text-brand dark:(border-brand/30 bg-brand/10 text-brand-300)'
})

const createI18nValue = (source?: I18nInputValue, languageKeys = projectLanguageKeys.value) => {
  const value: I18nInputValue = {}
  languageKeys.forEach((lang) => {
    value[lang] = source?.[lang] || ''
  })
  Object.entries(source || {}).forEach(([key, text]) => {
    if (!(key in value)) value[key] = text || ''
  })
  return value
}

const getLangLabel = (lang: string) => {
  return getUnoUILanguageOption(lang, configuredLanguages.value).label
}

const syncLanguages = () => {
  const langs = projectLanguageKeys.value
  editorLanguages.value = [currentLang.value, ...langs.filter((lang) => lang !== currentLang.value)]
  translationData.value = createI18nValue(translationData.value)
}

const emitValue = (value: I18nInputValue, event?: Event) => {
  emit('update:modelValue', value)
  emit('input', value, event)
}

const commitValue = (value: I18nInputValue, event?: Event) => {
  emitValue(value, event)
  emit('change', value, event)
}

const handleInput = (value: string | number, event: Event) => {
  const nextValue = {
    ...createI18nValue(props.modelValue),
    [currentLang.value]: String(value)
  }
  emitValue(nextValue, event)
}

const handleChange = (value: string | number, event: Event) => {
  const nextValue = {
    ...createI18nValue(props.modelValue),
    [currentLang.value]: String(value)
  }
  commitValue(nextValue, event)
}

const handleClear = () => {
  const nextValue = {
    ...createI18nValue(props.modelValue),
    [currentLang.value]: ''
  }
  commitValue(nextValue)
  emit('clear')
}

const showNotice = (tone: NoticeTone, text: string) => {
  notice.value = { tone, text }
}

const showEditor = () => {
  if (isDisabled.value) return
  translationData.value = createI18nValue(props.modelValue)
  notice.value = null
  editorVisible.value = true
}

const handleOk = () => {
  commitValue(translationData.value)
  editorVisible.value = false
}

const handleCancel = () => {
  editorVisible.value = false
}

const handleEditorVisibleUpdate = (visible: boolean) => {
  if (visible) {
    editorVisible.value = true
    return
  }
  handleCancel()
}

const getTranslateErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message
  if (error && typeof error === 'object') {
    const payload = error as { message?: unknown; data?: { message?: unknown } }
    if (typeof payload.data?.message === 'string') return payload.data.message
    if (typeof payload.message === 'string') return payload.message
  }
  return t('comp.mpInputI18n.unknownError')
}

const BAIDU_LANG_CODES: Record<string, string> = {
  'zh-CN': 'zh',
  'zh-HK': 'cht',
  'zh-TW': 'cht',
  en: 'en',
  'en-US': 'en',
  'en-GB': 'en',
  ja: 'jp',
  ko: 'kor',
  ar: 'ara',
  fr: 'fra',
  de: 'de',
  es: 'spa',
  pt: 'pt',
  'pt-BR': 'pt',
  ru: 'ru',
  it: 'it',
  th: 'th',
  vi: 'vie',
  hi: 'hi',
  tr: 'tr',
  nl: 'nl',
  pl: 'pl',
  sv: 'swe',
  da: 'dan',
  fi: 'fin',
  cs: 'cs',
  hu: 'hu',
  ro: 'rom',
  el: 'el'
}

const getBaiduLangCode = (lang: string) => {
  return getUnoUILanguageOption(lang, configuredLanguages.value).baidu || BAIDU_LANG_CODES[lang] || lang.split('-')[0]
}

const requestTranslation = async (targetLang: string) => {
  const sourceText = translationData.value[currentLang.value]
  if (!sourceText) {
    showNotice('warning', t('comp.mpInputI18n.sourceRequired'))
    return null
  }

  if (!unoUIConfig.translate) {
    throw new Error(t('comp.mpInputI18n.translateFailed'))
  }

  const result = await unoUIConfig.translate({
    q: sourceText,
    from: getBaiduLangCode(currentLang.value) || 'auto',
    to: getBaiduLangCode(targetLang) || targetLang
  })
  if (typeof result === 'string') return result
  if (!result) throw new Error(t('comp.mpInputI18n.translateFailed'))
  if (result.text) return result.text
  if (result.trans_result?.[0]) return result.trans_result[0].dst
  throw new Error(t('comp.mpInputI18n.translateFailed'))
}

const autoTranslate = async (targetLang: string, silent = false) => {
  if (translatingLang.value || translatingAll.value) return false
  translatingLang.value = targetLang
  try {
    const translatedText = await requestTranslation(targetLang)
    if (!translatedText) return false
    translationData.value[targetLang] = translatedText
    if (!silent) showNotice('success', t('comp.mpInputI18n.translateSuccess', { lang: getLangLabel(targetLang) }))
    return true
  } catch (error) {
    showNotice('error', t('comp.mpInputI18n.translateFailedWithReason', { reason: getTranslateErrorMessage(error) }))
    return false
  } finally {
    translatingLang.value = null
  }
}

const translateAll = async () => {
  if (translatingLang.value || translatingAll.value) return
  const sourceText = translationData.value[currentLang.value]
  if (!sourceText) {
    showNotice('warning', t('comp.mpInputI18n.sourceRequired'))
    return
  }

  const otherLangs = editorLanguages.value.filter((lang) => lang !== currentLang.value)
  translatingAll.value = true
  showNotice('info', t('comp.mpInputI18n.translatingAll'))

  try {
    for (const targetLang of otherLangs) {
      const translatedText = await requestTranslation(targetLang)
      if (translatedText) translationData.value[targetLang] = translatedText
    }
    showNotice('success', t('comp.mpInputI18n.translateAllSuccess'))
  } catch (error) {
    showNotice('error', t('comp.mpInputI18n.translateFailedWithReason', { reason: getTranslateErrorMessage(error) }))
  } finally {
    translatingAll.value = false
    translatingLang.value = null
  }
}

watch([currentLang, projectLanguageKeys], syncLanguages, { immediate: true })

watch(
  () => props.modelValue,
  (value) => {
    if (!editorVisible.value) translationData.value = createI18nValue(value)
  },
  { deep: true, immediate: true }
)
</script>

<template>
  <Input
    v-bind="getInputAttrs()"
    data-ui-input-i18n="true"
    :model-value="currentValue"
    :class="getInputClass()"
    :style="getUiAttrStyle(attrs)"
    :size="size"
    :disabled="isDisabled"
    :readonly="readonly"
    :placeholder="placeholder"
    :name="name"
    :clearable="false"
    :prefix-icon="prefixIcon"
    :prefix="prefix"
    :autocomplete="autocomplete"
    :dir="unoUIConfig.rtlLanguages.includes(currentLang) ? 'rtl' : 'ltr'"
    @input="handleInput"
    @change="handleChange"
    @clear="handleClear"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
  >
    <template v-if="$slots.prepend" #prepend>
      <slot name="prepend"></slot>
    </template>
    <template v-if="$slots.prefix" #prefix>
      <slot name="prefix"></slot>
    </template>
    <template #suffix>
      <slot name="suffix"></slot>
      <span v-if="suffixIcon" :class="suffixIcon" class="size-4"></span>
      <span v-if="suffix" class="text-xs">{{ suffix }}</span>
      <button
        v-if="showClearButton"
        type="button"
        aria-label="清空"
        class="flex size-4 items-center justify-center rounded-full bg-tertiary/90 text-tertiary/60 opacity-0 transition-all duration-150 hover:bg-tertiary hover:text-tertiary group-hover/ui-input:opacity-100 group-focus-within/ui-input:opacity-100"
        @click.stop="handleClear"
      >
        <span class="i-lucide:x size-3"></span>
      </button>
      <button
        v-if="editorLanguages.length > 1"
        type="button"
        class="flex size-5 items-center justify-center rounded text-tertiary transition-colors hover:bg-secondary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="isDisabled"
        :title="t('comp.mpInputI18n.editorTitle')"
        :aria-label="t('comp.mpInputI18n.editorTitle')"
        @mousedown.prevent
        @click.stop="showEditor"
      >
        <span class="i-lucide:globe size-3.5"></span>
      </button>
    </template>
    <template v-if="$slots.append" #append>
      <slot name="append"></slot>
    </template>
  </Input>

  <Modal :visible="editorVisible" :title="t('comp.mpInputI18n.editorTitle')" :width="560" :z-index="modalZIndex" @update:visible="handleEditorVisibleUpdate">
    <template #icon>
      <span class="i-lucide:globe text-brand"></span>
    </template>

    <div class="space-y-3 p-4">
      <div class="flex min-h-7 items-center justify-between gap-3">
        <div class="min-w-0 flex-1">
          <div v-if="notice" class="truncate rounded border px-2.5 py-1.5 text-xs font-medium" :class="noticeClass">{{ notice.text }}</div>
        </div>
        <Button size="sm" variant="outline" :loading="translatingAll" :disabled="!!translatingLang || translatingAll" @click="translateAll">{{ t('comp.mpInputI18n.translateAll') }}</Button>
      </div>

      <div class="flex flex-col gap-3">
        <div v-for="lang in editorLanguages" :key="lang" class="grid grid-cols-1 items-center gap-2 sm:grid-cols-[96px_minmax(0,1fr)_72px]">
          <label class="truncate text-left text-xs font-bold text-tertiary sm:text-right" :for="`ui-input-i18n-editor-${lang}`" :class="`font-${lang}`">
            {{ getLangLabel(lang) }}<span aria-hidden="true">:</span>
          </label>
          <Input
            :id="`ui-input-i18n-editor-${lang}`"
            v-model="translationData[lang]"
            size="sm"
            :class="`font-${lang}`"
            :dir="unoUIConfig.rtlLanguages.includes(lang) ? 'rtl' : 'ltr'"
            autocomplete="new-password"
          />
          <Button v-if="lang !== currentLang" size="sm" variant="outline" :disabled="!!translatingLang || translatingAll" :loading="translatingLang === lang" @click="() => autoTranslate(lang)">
            {{ t('comp.mpInputI18n.translate') }}
          </Button>
          <span v-else class="w-18"></span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex w-full items-center justify-center gap-3">
        <Button color="gray" variant="mono" size="lg" class="min-w-24" @click="handleCancel">{{ t('common.cancel') }}</Button>
        <Button size="lg" class="min-w-24" @click="handleOk">{{ t('common.save') }}</Button>
      </div>
    </template>
  </Modal>
</template>
