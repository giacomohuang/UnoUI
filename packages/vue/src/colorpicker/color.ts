export type ColorPickerMode = 'solid' | 'linear' | 'radial'

/** ColorPickerRgbaColor 是组件对外暴露的 RGBA 颜色结构。 */
export interface ColorPickerRgbaColor {
  r: number
  g: number
  b: number
  a: number
}

/** ColorPickerHsbaColor 是组件内部使用的 HSBA 颜色结构，便于在色板中计算。 */
export interface ColorPickerHsbaColor {
  h: number
  s: number
  b: number
  a: number
}

/** ColorPickerGradientStop 是渐变模式下的颜色节点结构。 */
export interface ColorPickerGradientStop {
  percent: number
  color: ColorPickerRgbaColor
}

/** ColorPickerValue 兼容 giacomohuang/colorpicker 的对象式 v-model。 */
export interface ColorPickerValue {
  mode?: ColorPickerMode
  color?: string | ColorPickerRgbaColor
  hex?: string
  degree?: number
  gradients?: ColorPickerGradientStop[]
  css?: string
}

export interface InternalGradientStop {
  id: number
  percent: number
  color: ColorPickerHsbaColor
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const normalizeHueValue = (value: number) => {
  const normalized = Number.isFinite(value) ? value % 360 : 0
  return normalized < 0 ? normalized + 360 : normalized
}

export const clampPercent = (value: number) => clamp(Math.round(value), 0, 100)
export const clampHue = (value: number) => {
  return Math.round(normalizeHueValue(value))
}
export const clampAlpha = (value: number) => Number(clamp(Number.isFinite(value) ? value : 1, 0, 1).toFixed(2))
export const normalizeDegree = (value: number | undefined) => clampHue(value ?? 90)

const toHex = (value: number) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0')

export const normalizeRgba = (color?: Partial<ColorPickerRgbaColor>): ColorPickerRgbaColor => ({
  r: clamp(Math.round(Number(color?.r ?? 0)), 0, 255),
  g: clamp(Math.round(Number(color?.g ?? 0)), 0, 255),
  b: clamp(Math.round(Number(color?.b ?? 0)), 0, 255),
  a: clampAlpha(Number(color?.a ?? 1))
})

/**
 * hsbToRgb 将色相、饱和度和明度转换为 RGB。
 * 色板拖拽使用 HSBA 更直观，对外值保持常见 RGBA 结构。
 */
export function hsbToRgb(hsb: ColorPickerHsbaColor): ColorPickerRgbaColor {
  const h = normalizeHueValue(hsb.h)
  const s = clamp(hsb.s, 0, 100) / 100
  const v = clamp(hsb.b, 0, 100) / 100
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  let r = 0
  let g = 0
  let b = 0

  if (h < 60) {
    r = c
    g = x
  } else if (h < 120) {
    r = x
    g = c
  } else if (h < 180) {
    g = c
    b = x
  } else if (h < 240) {
    g = x
    b = c
  } else if (h < 300) {
    r = x
    b = c
  } else {
    r = c
    b = x
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
    a: clampAlpha(hsb.a)
  }
}

/** rgbToHsb 将外部 RGBA 输入转换为色板可定位的 HSBA 坐标。 */
export function rgbToHsb(input: Partial<ColorPickerRgbaColor>): ColorPickerHsbaColor {
  const rgba = normalizeRgba(input)
  const r = rgba.r / 255
  const g = rgba.g / 255
  const b = rgba.b / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  let h = 0

  if (delta !== 0) {
    if (max === r) h = 60 * (((g - b) / delta) % 6)
    else if (max === g) h = 60 * ((b - r) / delta + 2)
    else h = 60 * ((r - g) / delta + 4)
  }

  return {
    h: normalizeHueValue(h),
    s: max === 0 ? 0 : clamp((delta / max) * 100, 0, 100),
    b: clamp(max * 100, 0, 100),
    a: rgba.a
  }
}

export function rgbaToHex(color: ColorPickerRgbaColor) {
  const rgba = normalizeRgba(color)
  const alpha = Math.round(rgba.a * 255)
  return `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}${alpha < 255 ? toHex(alpha) : ''}`
}

export function rgbaToCss(color: ColorPickerRgbaColor) {
  const rgba = normalizeRgba(color)
  return `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`
}

export function hsbaToCss(color: ColorPickerHsbaColor) {
  return rgbaToCss(hsbToRgb(color))
}

export function isHexColor(value: string) {
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value)
}

export function hexToRgba(value: string): ColorPickerRgbaColor | null {
  if (!isHexColor(value)) return null
  const raw = value.slice(1)
  const expanded = raw.length <= 4 ? raw.split('').map((char) => `${char}${char}`).join('') : raw
  const alpha = expanded.length === 8 ? Number((Number.parseInt(expanded.slice(6, 8), 16) / 255).toFixed(2)) : 1

  return normalizeRgba({
    r: Number.parseInt(expanded.slice(0, 2), 16),
    g: Number.parseInt(expanded.slice(2, 4), 16),
    b: Number.parseInt(expanded.slice(4, 6), 16),
    a: alpha
  })
}

/** cssRgbToRgba 解析 rgb()/rgba() 输入，供 ColorPicker 文本框校验和提交使用。 */
export function cssRgbToRgba(value: string): ColorPickerRgbaColor | null {
  const match = value.trim().match(/^rgba?\((.+)\)$/i)
  if (!match) return null
  const parts = match[1].split(',').map((part) => part.trim())
  if (parts.length !== 3 && parts.length !== 4) return null

  const [r, g, b] = parts.slice(0, 3).map((part) => Number(part))
  const alpha = parts[3] === undefined ? 1 : Number(parts[3])
  if (![r, g, b, alpha].every(Number.isFinite)) return null
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255 || alpha < 0 || alpha > 1) return null

  return normalizeRgba({ r, g, b, a: alpha })
}

export function parseCssColor(value: string): ColorPickerRgbaColor | null {
  const normalizedValue = value.trim()
  if (isHexColor(normalizedValue)) return hexToRgba(normalizedValue)
  return cssRgbToRgba(normalizedValue)
}

export function colorToHsba(color?: string | Partial<ColorPickerRgbaColor>): ColorPickerHsbaColor {
  if (typeof color === 'string') {
    return rgbToHsb(parseCssColor(color) ?? { r: 0, g: 0, b: 0, a: 1 })
  }
  return rgbToHsb(color ?? { r: 0, g: 0, b: 0, a: 1 })
}

export function cloneHsba(color: ColorPickerHsbaColor): ColorPickerHsbaColor {
  return {
    h: normalizeHueValue(color.h),
    s: clamp(color.s, 0, 100),
    b: clamp(color.b, 0, 100),
    a: clampAlpha(color.a)
  }
}
