import { reactive } from 'vue'

export type UnoUILanguageOption = {
  /** 标准化后的 BCP 47 语言码，如 zh-CN、en。 */
  key: string
  /** 翻译服务或导出文件中使用的短代码。 */
  code?: string
  /** 面向用户展示的语言名称。 */
  label: string
  /** 翻译服务使用的语言代码。 */
  baidu?: string
}

export type UnoUITranslatePayload = {
  q: string
  from: string
  to: string
}

export type UnoUITranslateResult = {
  text?: string
  trans_result?: Array<{ dst?: string }>
}

export type UnoUITranslate = (payload: UnoUITranslatePayload) => Promise<string | UnoUITranslateResult | null | undefined>

export type UnoUIConfig = {
  /** languages 是 InputI18n 等组件的默认语言选项。 */
  languages?: readonly UnoUILanguageOption[]
  /** rtlLanguages 是需要从右向左排版的语言 key。 */
  rtlLanguages?: readonly string[]
  /** locale 是当前语言；可传函数以对接宿主应用的 i18n 状态。 */
  locale?: string | (() => string)
  /** translate 是可选翻译适配器，InputI18n 自动翻译会调用它。 */
  translate?: UnoUITranslate
}

export const DEFAULT_UNOUI_LOCALE = 'zh-CN'

export const DEFAULT_UNOUI_LANGUAGES: readonly UnoUILanguageOption[] = [
  { key: 'zh-CN', code: 'ZH', label: '简体中文', baidu: 'zh' },
  { key: 'zh-HK', code: 'HK', label: '繁体中文（香港特別行政區）', baidu: 'cht' },
  { key: 'zh-TW', code: 'TW', label: '繁體中文（台灣省）', baidu: 'cht' },
  { key: 'en', code: 'EN', label: 'English', baidu: 'en' },
  { key: 'ja', code: 'JA', label: '日本語', baidu: 'jp' },
  { key: 'ko', code: 'KO', label: '한국어', baidu: 'kor' },
  { key: 'ar', code: 'AR', label: 'العربية', baidu: 'ara' },
  { key: 'fr', code: 'FR', label: 'Français', baidu: 'fra' },
  { key: 'de', code: 'DE', label: 'Deutsch', baidu: 'de' },
  { key: 'es', code: 'ES', label: 'Español', baidu: 'spa' },
  { key: 'pt', code: 'PT', label: 'Português', baidu: 'pt' },
  { key: 'pt-BR', code: 'BR', label: 'Português (Brasil)', baidu: 'pt' },
  { key: 'ru', code: 'RU', label: 'Русский', baidu: 'ru' },
  { key: 'it', code: 'IT', label: 'Italiano', baidu: 'it' },
  { key: 'th', code: 'TH', label: 'ไทย', baidu: 'th' },
  { key: 'vi', code: 'VI', label: 'Tiếng Việt', baidu: 'vie' },
  { key: 'id', code: 'ID', label: 'Bahasa Indonesia' },
  { key: 'ms', code: 'MS', label: 'Bahasa Melayu' },
  { key: 'hi', code: 'HI', label: 'हिन्दी', baidu: 'hi' },
  { key: 'tr', code: 'TR', label: 'Türkçe', baidu: 'tr' },
  { key: 'nl', code: 'NL', label: 'Nederlands', baidu: 'nl' },
  { key: 'pl', code: 'PL', label: 'Polski', baidu: 'pl' },
  { key: 'sv', code: 'SV', label: 'Svenska', baidu: 'swe' },
  { key: 'da', code: 'DA', label: 'Dansk', baidu: 'dan' },
  { key: 'fi', code: 'FI', label: 'Suomi', baidu: 'fin' },
  { key: 'no', code: 'NO', label: 'Norsk' },
  { key: 'cs', code: 'CS', label: 'Čeština', baidu: 'cs' },
  { key: 'hu', code: 'HU', label: 'Magyar', baidu: 'hu' },
  { key: 'ro', code: 'RO', label: 'Română', baidu: 'rom' },
  { key: 'el', code: 'EL', label: 'Ελληνικά', baidu: 'el' },
  { key: 'he', code: 'HE', label: 'עברית' },
  { key: 'fa', code: 'FA', label: 'فارسی' },
  { key: 'uk', code: 'UK', label: 'Українська' },
  { key: 'bn', code: 'BN', label: 'বাংলা' },
  { key: 'ur', code: 'UR', label: 'اردو' }
]

export const DEFAULT_RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'] as const

const unoUIConfig = reactive<Required<Pick<UnoUIConfig, 'languages' | 'rtlLanguages'>> & Pick<UnoUIConfig, 'locale' | 'translate'>>({
  languages: DEFAULT_UNOUI_LANGUAGES,
  rtlLanguages: DEFAULT_RTL_LANGUAGES,
  locale: DEFAULT_UNOUI_LOCALE,
  translate: undefined
})

/** configureUnoUI 用于把宿主应用的语言、当前 locale 和翻译服务注入组件库。 */
export const configureUnoUI = (config: UnoUIConfig) => {
  if (config.languages) unoUIConfig.languages = config.languages
  if (config.rtlLanguages) unoUIConfig.rtlLanguages = config.rtlLanguages
  if (config.locale !== undefined) unoUIConfig.locale = config.locale
  if (config.translate !== undefined) unoUIConfig.translate = config.translate
}

export const useUnoUIConfig = () => unoUIConfig

export const normalizeUnoUILocaleKey = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  const parts = value.trim().replace(/_/g, '-').split('-').filter(Boolean)
  if (!parts.length || !/^[a-zA-Z]{2,3}$/.test(parts[0])) return ''

  const normalized = [parts[0].toLowerCase()]
  for (let index = 1; index < parts.length; index++) {
    const part = parts[index]
    if (/^[a-zA-Z]{4}$/.test(part)) {
      normalized.push(part[0].toUpperCase() + part.slice(1).toLowerCase())
      continue
    }
    if (/^[a-zA-Z]{2}$/.test(part) || /^\d{3}$/.test(part)) {
      normalized.push(part.toUpperCase())
      continue
    }
    if (/^[a-zA-Z0-9]{5,8}$/.test(part) || /^\d[a-zA-Z0-9]{3}$/.test(part)) {
      normalized.push(part.toLowerCase())
      continue
    }
    return ''
  }
  return normalized.join('-')
}

const getLanguageCode = (locale: string) => {
  const parts = locale.split('-')
  const region = parts.find((part, index) => index > 0 && (/^[A-Z]{2}$/.test(part) || /^\d{3}$/.test(part)))
  return (region || parts[0] || locale).slice(0, 3).toUpperCase()
}

export const getUnoUILanguageOption = (locale: string, languages: readonly UnoUILanguageOption[] = unoUIConfig.languages): UnoUILanguageOption => {
  const key = normalizeUnoUILocaleKey(locale) || locale.trim()
  return languages.find((item) => item.key === key) || { key, code: getLanguageCode(key), label: key }
}

export const normalizeUnoUILanguages = (languages: unknown, fallback = DEFAULT_UNOUI_LOCALE): string[] => {
  const result: string[] = []
  if (Array.isArray(languages)) {
    languages.forEach((item) => {
      const lang = normalizeUnoUILocaleKey(item)
      if (!lang || result.includes(lang)) return
      result.push(lang)
    })
  }
  if (result.length > 0) return result
  return [normalizeUnoUILocaleKey(fallback) || DEFAULT_UNOUI_LOCALE]
}
