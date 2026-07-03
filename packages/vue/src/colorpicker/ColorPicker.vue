<script setup lang="ts">
import { clsx } from 'clsx'
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, useAttrs, useTemplateRef, watch } from 'vue'
import type { CSSProperties } from 'vue'

import { getUiAttrStyle, getUiExposeAttrs } from '../attrs'
import { colorPickerTrigger, type ColorPickerSize } from '.'
import { clampAlpha, clampHue, clampPercent, cloneHsba, colorToHsba, hsbToRgb, hsbaToCss, normalizeDegree, normalizeRgba, parseCssColor, rgbaToCss, rgbaToHex, type ColorPickerHsbaColor, type ColorPickerMode, type ColorPickerValue, type InternalGradientStop } from './color'

defineOptions({
  inheritAttrs: false
})

type EyeDropperConstructor = new () => {
  open: () => Promise<{ sRGBHex: string }>
}
type Booleanish = boolean | 'true' | 'false' | ''

const props = withDefaults(
  defineProps<{
    /** modelValue 是对象式颜色值，兼容 giacomohuang/colorpicker 的 solid/linear/radial 结构。 */
    modelValue?: ColorPickerValue
    /** size 是触发器尺寸，可选。 */
    size?: ColorPickerSize
    /** allowGradient 表示是否允许选择 linear/radial 渐变模式。 */
    allowGradient?: Booleanish
    /** allowAlpha 表示是否允许选择透明度；关闭后输出 alpha 固定为 1。 */
    allowAlpha?: Booleanish
    /** disabled 表示是否禁用颜色选择交互。 */
    disabled?: boolean
  }>(),
  {
    modelValue: undefined,
    size: 'md',
    allowGradient: true,
    allowAlpha: true,
    disabled: false
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: ColorPickerValue): void
  (e: 'changed', value: ColorPickerValue): void
}>()

const attrs = useAttrs()
const rootRef = useTemplateRef<HTMLElement>('rootRef')
const panelRef = useTemplateRef<HTMLElement>('panelRef')
const paletteRef = useTemplateRef<HTMLElement>('paletteRef')
const hueBarRef = useTemplateRef<HTMLElement>('hueBarRef')
const opacityBarRef = useTemplateRef<HTMLElement>('opacityBarRef')
const gradientBarRef = useTemplateRef<HTMLElement>('gradientBarRef')
const degreeRef = useTemplateRef<HTMLElement>('degreeRef')

const open = ref(false)
const activeMode = ref<ColorPickerMode>('solid')
const degree = ref(90)
const activeGradientStopId = ref<number | null>(null)
const draggingGradientStopId = ref<number | null>(null)
const pendingRemoveGradientStopId = ref<number | null>(null)
const isDraggingHue = ref(false)
const isDraggingOpacity = ref(false)
const isDraggingDegree = ref(false)
const colorInputValue = ref('')
const colorInputInvalid = ref(false)
const isColorInputFocused = ref(false)
const gradientStops = ref<InternalGradientStop[]>([])
const paletteColor = reactive<ColorPickerHsbaColor>({ h: 0, s: 0, b: 0, a: 1 })
const panelPosition = reactive({ top: 0, left: 0 })
const eyeDropperSupported = ref(false)
let gradientStopSeed = 0
let dragCleanup: (() => void) | null = null
let syncingFromModel = false
let lastEmittedValue: ColorPickerValue | null = null
let lastEmittedSignature = ''
let colorInputCommitTimer: number | null = null

const modeOptions: { mode: ColorPickerMode; label: string }[] = [
  { mode: 'solid', label: '纯色' },
  { mode: 'linear', label: '线性渐变' },
  { mode: 'radial', label: '径向渐变' }
]
const panelWidth = 260
const panelGap = 4
const viewportPadding = 8
const maxGradientStops = 10
const colorInputDebounceMs = 200
const triggerSizeMap: Record<ColorPickerSize, string> = {
  sm: '1.75rem',
  md: '2rem',
  lg: '2.25rem'
}
// 控制点拖出渐变条一段距离后松手，按设计语义移除该控制点。
const gradientStopRemoveDistance = 24

const normalizeBooleanProp = (value: Booleanish | undefined, fallback: boolean) => {
  if (value === undefined) return fallback
  if (value === 'false') return false
  if (value === 'true' || value === '') return true
  return value
}
const currentRgba = computed(() => hsbToRgb(paletteColor))
const activeDisplayRgba = computed(() => {
  if (activeMode.value === 'solid') return currentRgba.value
  const activeStop = gradientStops.value.find((stop) => stop.id === activeGradientStopId.value) ?? gradientStops.value[0]
  return activeStop ? hsbToRgb(activeStop.color) : currentRgba.value
})
const activeColorText = computed(() => rgbaToHex(normalizeOutputRgba(activeDisplayRgba.value)))
const isGradientAllowed = computed(() => normalizeBooleanProp(props.allowGradient, true))
const isAlphaAllowed = computed(() => normalizeBooleanProp(props.allowAlpha, true))
const hueBackground = computed(() => rgbaToCss(hsbToRgb({ h: paletteColor.h, s: 100, b: 100, a: 1 })))
const gradientPreviewStops = computed(() =>
  getSortedGradientStops()
    .map((stop) => `${hsbaToCss(stop.color)} ${stop.percent}%`)
    .join(',')
)
const gradientPreview = computed(() => {
  if (activeMode.value === 'linear') return `linear-gradient(${degree.value}deg,${gradientPreviewStops.value})`
  if (activeMode.value === 'radial') return `radial-gradient(circle,${gradientPreviewStops.value})`
  return rgbaToCss(currentRgba.value)
})
const gradientBarBackground = computed(() => `linear-gradient(to right,${gradientPreviewStops.value || `${rgbaToCss(currentRgba.value)} 0%,${rgbaToCss(currentRgba.value)} 100%`})`)
const opacityBarBackground = computed(() => {
  const color = normalizeRgba({ ...currentRgba.value, a: 1 })
  return `linear-gradient(to right, rgba(${color.r},${color.g},${color.b},0), rgba(${color.r},${color.g},${color.b},1))`
})
const previewBackground = computed(() => (activeMode.value === 'solid' ? rgbaToCss(currentRgba.value) : gradientPreview.value))
const triggerClass = computed(() =>
  clsx(
    attrs.class as string | undefined,
    colorPickerTrigger({
      size: props.size,
      focused: open.value,
      disabled: props.disabled
    })
  )
)
const triggerStyle = computed<CSSProperties>(() => {
  const size = triggerSizeMap[props.size ?? 'md'] ?? triggerSizeMap.md
  return {
    width: size,
    height: size
  }
})
const eyeDropperButtonDisabled = computed(() => props.disabled || !eyeDropperSupported.value)
const panelStyle = computed<CSSProperties>(() => ({
  position: 'fixed',
  top: `${panelPosition.top}px`,
  left: `${panelPosition.left}px`,
  width: `${panelWidth}px`,
  maxHeight: `calc(100vh - ${viewportPadding * 2}px)`,
  overflowY: 'auto',
  zIndex: 2000
}))
const paletteStyle = computed<CSSProperties>(() => ({
  background: hueBackground.value,
  height: '9rem'
}))
const colorInputRowStyle = computed<CSSProperties>(() => ({
  gridTemplateColumns: 'minmax(0, 1fr) 56px'
}))
const palettePickerStyle = computed<CSSProperties>(() => ({
  left: `${paletteColor.s}%`,
  top: `${100 - paletteColor.b}%`,
  backgroundColor: rgbaToCss(currentRgba.value)
}))
const huePickerStyle = computed<CSSProperties>(() => ({
  left: `${(paletteColor.h / 360) * 100}%`
}))
const opacityPickerStyle = computed<CSSProperties>(() => ({
  left: `${paletteColor.a * 100}%`
}))
const degreePointerStyle = computed<CSSProperties>(() => ({
  transform: `translateY(-50%) rotate(${degree.value - 90}deg)`
}))

watch(
  () => props.modelValue,
  (value) => {
    if (value && (value === lastEmittedValue || getModelSignature(value) === lastEmittedSignature)) {
      lastEmittedValue = null
      lastEmittedSignature = ''
      return
    }
    syncFromModelValue(value)
  },
  { deep: true, immediate: true }
)

watch(open, (value) => {
  if (value) void updatePanelPosition()
})

watch(
  activeColorText,
  (value) => {
    if (isColorInputFocused.value) return
    colorInputValue.value = value
    colorInputInvalid.value = false
  },
  { immediate: true }
)

watch(isGradientAllowed, (value) => {
  if (!value && activeMode.value !== 'solid') {
    activeMode.value = 'solid'
    commitValue()
  }
})

watch(isAlphaAllowed, (value) => {
  if (value) return
  let changed = false
  if (paletteColor.a !== 1) {
    paletteColor.a = 1
    changed = true
  }
  gradientStops.value.forEach((stop) => {
    if (stop.color.a !== 1) {
      stop.color.a = 1
      changed = true
    }
  })
  if (changed) commitValue()
})

function isValidMode(mode: unknown): mode is ColorPickerMode {
  return mode === 'solid' || mode === 'linear' || mode === 'radial'
}

function getSortedGradientStops() {
  return [...gradientStops.value].sort((a, b) => a.percent - b.percent)
}

function syncPaletteColor(color: ColorPickerHsbaColor) {
  const normalizedColor = normalizeHsbaForProps(color)
  paletteColor.h = normalizedColor.h
  paletteColor.s = normalizedColor.s
  paletteColor.b = normalizedColor.b
  paletteColor.a = normalizedColor.a
}

function createGradientStop(percent: number, color: ColorPickerHsbaColor): InternalGradientStop {
  return {
    id: gradientStopSeed++,
    percent: clampPercent(percent),
    color: normalizeHsbaForProps(color)
  }
}

function createDefaultGradientStops(color = paletteColor) {
  return [createGradientStop(0, color), createGradientStop(100, color)]
}

function normalizeGradientStops(value?: ColorPickerValue) {
  if (!value?.gradients?.length) return createDefaultGradientStops()
  const stops = value.gradients
    .filter((stop) => stop && typeof stop === 'object')
    .slice(0, maxGradientStops)
    .map((stop) => createGradientStop(stop.percent, colorToHsba(stop.color)))

  if (stops.length >= 2) return stops
  if (stops.length === 1) return [stops[0], createGradientStop(100, stops[0].color)]
  return createDefaultGradientStops()
}

function ensureGradientStops() {
  if (gradientStops.value.length >= 2) return
  gradientStops.value = createDefaultGradientStops()
  activeGradientStopId.value = gradientStops.value[0]?.id ?? null
}

function syncPaletteFromActiveGradientStop() {
  if (activeMode.value === 'solid') return
  ensureGradientStops()
  const activeStop = gradientStops.value.find((stop) => stop.id === activeGradientStopId.value) ?? gradientStops.value[0]
  if (!activeStop) return
  activeGradientStopId.value = activeStop.id
  syncPaletteColor(activeStop.color)
}

function syncActiveGradientStopColor() {
  if (activeMode.value === 'solid') return
  ensureGradientStops()
  const activeStop = gradientStops.value.find((stop) => stop.id === activeGradientStopId.value)
  if (activeStop) activeStop.color = normalizeHsbaForProps(paletteColor)
}

function syncFromModelValue(value?: ColorPickerValue) {
  syncingFromModel = true
  const nextMode = isGradientAllowed.value && isValidMode(value?.mode) ? value.mode : 'solid'
  const paletteSource = value?.color ?? value?.gradients?.[0]?.color
  activeMode.value = nextMode
  degree.value = normalizeDegree(value?.degree)
  syncPaletteColor(colorToHsba(paletteSource))
  gradientStops.value = normalizeGradientStops(value)
  activeGradientStopId.value = gradientStops.value[0]?.id ?? null
  if (nextMode !== 'solid') syncPaletteFromActiveGradientStop()
  syncingFromModel = false
}

function buildModelValue(): ColorPickerValue {
  if (activeMode.value === 'solid') {
    const color = normalizeOutputRgba(currentRgba.value)
    return {
      mode: 'solid',
      color,
      hex: rgbaToHex(color),
      css: `background-color:${rgbaToCss(color)}`
    }
  }

  const gradients = getSortedGradientStops().map((stop) => ({
    percent: stop.percent,
    color: normalizeOutputRgba(hsbToRgb(stop.color))
  }))
  const gradientBody = gradients.map((stop) => `${rgbaToCss(stop.color)} ${stop.percent}%`).join(',')

  if (activeMode.value === 'linear') {
    return {
      mode: 'linear',
      degree: degree.value,
      gradients,
      css: `background-image:linear-gradient(${degree.value}deg,${gradientBody})`
    }
  }

  return {
    mode: 'radial',
    gradients,
    css: `background-image:radial-gradient(${gradientBody})`
  }
}

function commitValue() {
  if (syncingFromModel) return
  const value = buildModelValue()
  lastEmittedValue = value
  lastEmittedSignature = getModelSignature(value)
  emit('update:modelValue', value)
  emit('changed', value)
}

function getModelSignature(value: ColorPickerValue) {
  return JSON.stringify(value)
}

function normalizeHsbaForProps(color: ColorPickerHsbaColor): ColorPickerHsbaColor {
  const normalizedColor = cloneHsba(color)
  if (!isAlphaAllowed.value) normalizedColor.a = 1
  return normalizedColor
}

function normalizeOutputRgba(color: ReturnType<typeof hsbToRgb>) {
  const normalizedColor = normalizeRgba(color)
  if (!isAlphaAllowed.value) normalizedColor.a = 1
  return normalizedColor
}

function clearColorInputCommitTimer() {
  if (colorInputCommitTimer === null) return
  window.clearTimeout(colorInputCommitTimer)
  colorInputCommitTimer = null
}

function applyColorInputValue(options: { formatInput?: boolean } = {}) {
  const color = parseCssColor(colorInputValue.value)
  if (!color) {
    colorInputInvalid.value = true
    return null
  }

  const outputColor = normalizeOutputRgba(color)
  const formattedValue = rgbaToHex(outputColor)
  const nextColor = normalizeHsbaForProps(colorToHsba(outputColor))
  colorInputInvalid.value = false
  if (options.formatInput) colorInputValue.value = formattedValue
  syncPaletteColor(nextColor)

  if (activeMode.value !== 'solid') {
    ensureGradientStops()
    const activeStop = gradientStops.value.find((stop) => stop.id === activeGradientStopId.value) ?? gradientStops.value[0]
    if (activeStop) {
      activeGradientStopId.value = activeStop.id
      activeStop.color = nextColor
    }
  }

  commitValue()
  return formattedValue
}

function resetColorInputValue() {
  clearColorInputCommitTimer()
  colorInputValue.value = activeColorText.value
  colorInputInvalid.value = false
}

function scheduleColorInputCommit() {
  clearColorInputCommitTimer()
  colorInputCommitTimer = window.setTimeout(() => {
    colorInputCommitTimer = null
    applyColorInputValue()
  }, colorInputDebounceMs)
}

function handleColorInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  colorInputValue.value = value
  const parsedColor = parseCssColor(value)
  colorInputInvalid.value = value.trim() !== '' && !parsedColor
  if (parsedColor) {
    scheduleColorInputCommit()
  } else {
    clearColorInputCommitTimer()
  }
}

function handleColorInputKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    clearColorInputCommitTimer()
    const formattedValue = applyColorInputValue({ formatInput: true })
    if (formattedValue && event.target instanceof HTMLInputElement) event.target.value = formattedValue
    return
  }
  if (event.key === 'Escape') {
    event.preventDefault()
    resetColorInputValue()
  }
}

function handleColorInputFocus() {
  isColorInputFocused.value = true
}

function handleColorInputBlur(event: FocusEvent) {
  isColorInputFocused.value = false
  clearColorInputCommitTimer()
  const formattedValue = applyColorInputValue({ formatInput: true })
  if (formattedValue && event.target instanceof HTMLInputElement) event.target.value = formattedValue
}

function updatePanelPosition() {
  return nextTick(() => {
    const triggerEl = rootRef.value
    if (!triggerEl) return
    const triggerRect = triggerEl.getBoundingClientRect()
    const panelHeight = panelRef.value?.offsetHeight || 360
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const maxLeft = viewportWidth - panelWidth - viewportPadding
    const belowTop = triggerRect.bottom + panelGap
    const aboveTop = triggerRect.top - panelHeight - panelGap

    panelPosition.left = Math.max(viewportPadding, Math.min(triggerRect.left, maxLeft))
    panelPosition.top = belowTop + panelHeight <= viewportHeight - viewportPadding ? belowTop : Math.max(viewportPadding, aboveTop)
  })
}

function setOpen(value: boolean) {
  if (props.disabled) return
  open.value = value
}

function toggleOpen() {
  setOpen(!open.value)
}

function changeMode(mode: ColorPickerMode) {
  if (props.disabled) return
  if (mode !== 'solid' && !isGradientAllowed.value) return
  activeMode.value = mode
  if (activeMode.value !== 'solid') syncPaletteFromActiveGradientStop()
  commitValue()
}

function updatePaletteFromPointer(event: PointerEvent) {
  const rect = paletteRef.value?.getBoundingClientRect()
  if (!rect) return
  paletteColor.s = clampPercent(getBoundedPointerRatio(event.clientX, rect.left, rect.width) * 100)
  paletteColor.b = clampPercent((1 - getBoundedPointerRatio(event.clientY, rect.top, rect.height)) * 100)
  syncActiveGradientStopColor()
  commitValue()
}

function updateHueFromPointer(event: PointerEvent) {
  const rect = hueBarRef.value?.getBoundingClientRect()
  if (!rect) return
  // 色谱条是线性滑块，拖出边界时要停在端点，不能像角度盘一样循环。
  paletteColor.h = Math.round(getBoundedPointerRatio(event.clientX, rect.left, rect.width) * 360)
  syncActiveGradientStopColor()
  commitValue()
}

function updateOpacityFromPointer(event: PointerEvent) {
  if (!isAlphaAllowed.value) return
  const rect = opacityBarRef.value?.getBoundingClientRect()
  if (!rect) return
  paletteColor.a = clampAlpha(getBoundedPointerRatio(event.clientX, rect.left, rect.width))
  syncActiveGradientStopColor()
  commitValue()
}

function updateDegreeFromPointer(event: PointerEvent) {
  const rect = degreeRef.value?.getBoundingClientRect()
  if (!rect) return
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const rad = Math.atan2(centerY - event.clientY, event.clientX - centerX)
  const nextDegree = 90 - Math.floor((rad * 180) / Math.PI)
  degree.value = clampHue(nextDegree)
  commitValue()
}

function canRemoveGradientStop(stopId: number) {
  return gradientStops.value.length > 2 && gradientStops.value.some((stop) => stop.id === stopId)
}

// 只按垂直方向判断移除，横向拖动仍然用于调整百分比并夹在条内。
function isPointerOutsideGradientBar(event: PointerEvent, rect: DOMRect) {
  return event.clientY < rect.top - gradientStopRemoveDistance || event.clientY > rect.bottom + gradientStopRemoveDistance
}

function updateGradientStopFromPointer(event: PointerEvent, stopId: number) {
  const rect = gradientBarRef.value?.getBoundingClientRect()
  const stop = gradientStops.value.find((item) => item.id === stopId)
  if (!rect || !stop) return
  stop.percent = clampPercent(getBoundedPointerRatio(event.clientX, rect.left, rect.width) * 100)
  pendingRemoveGradientStopId.value = canRemoveGradientStop(stopId) && isPointerOutsideGradientBar(event, rect) ? stopId : null
  commitValue()
}

function getBoundedPointerRatio(clientPosition: number, start: number, size: number) {
  if (!Number.isFinite(size) || size <= 0) return 0
  return Math.min(1, Math.max(0, (clientPosition - start) / size))
}

function startDrag(event: PointerEvent, update: (event: PointerEvent) => void, onEnd?: (event: PointerEvent) => void, onCancel?: () => void) {
  if (props.disabled) return
  event.preventDefault()
  dragCleanup?.()
  update(event)

  const handleMove = (moveEvent: PointerEvent) => {
    moveEvent.preventDefault()
    update(moveEvent)
  }
  const removeListeners = () => {
    document.removeEventListener('pointermove', handleMove)
    document.removeEventListener('pointerup', handleUp)
    document.removeEventListener('pointercancel', handleCancel)
  }
  const handleUp = (upEvent: PointerEvent) => {
    removeListeners()
    dragCleanup = null
    onEnd?.(upEvent)
  }
  const handleCancel = () => {
    removeListeners()
    dragCleanup = null
    onCancel?.()
  }

  document.addEventListener('pointermove', handleMove)
  document.addEventListener('pointerup', handleUp)
  document.addEventListener('pointercancel', handleCancel)
  dragCleanup = handleCancel
}

function handlePalettePointerDown(event: PointerEvent) {
  startDrag(event, updatePaletteFromPointer)
}

function handleHuePointerDown(event: PointerEvent) {
  isDraggingHue.value = true
  startDrag(
    event,
    updateHueFromPointer,
    () => {
      isDraggingHue.value = false
    },
    () => {
      isDraggingHue.value = false
    }
  )
}

function handleOpacityPointerDown(event: PointerEvent) {
  isDraggingOpacity.value = true
  startDrag(
    event,
    updateOpacityFromPointer,
    () => {
      isDraggingOpacity.value = false
    },
    () => {
      isDraggingOpacity.value = false
    }
  )
}

function handleDegreePointerDown(event: PointerEvent) {
  isDraggingDegree.value = true
  startDrag(
    event,
    updateDegreeFromPointer,
    () => {
      isDraggingDegree.value = false
    },
    () => {
      isDraggingDegree.value = false
    }
  )
}

function addGradientStop(event: PointerEvent) {
  if (!isGradientAllowed.value || activeMode.value === 'solid' || gradientStops.value.length >= maxGradientStops) return
  const rect = gradientBarRef.value?.getBoundingClientRect()
  if (!rect) return
  const stop = createGradientStop(getBoundedPointerRatio(event.clientX, rect.left, rect.width) * 100, paletteColor)
  gradientStops.value.push(stop)
  activeGradientStopId.value = stop.id
  commitValue()
}

function handleGradientBarPointerDown(event: PointerEvent) {
  if (props.disabled) return
  addGradientStop(event)
}

function handleGradientStopPointerDown(event: PointerEvent, stopId: number) {
  if (props.disabled) return
  const stop = gradientStops.value.find((item) => item.id === stopId)
  if (!stop) return
  activeGradientStopId.value = stop.id
  draggingGradientStopId.value = stop.id
  syncPaletteColor(stop.color)
  startDrag(
    event,
    (moveEvent) => updateGradientStopFromPointer(moveEvent, stopId),
    () => {
      if (pendingRemoveGradientStopId.value === stopId) removeGradientStop(stopId)
      draggingGradientStopId.value = null
      pendingRemoveGradientStopId.value = null
    },
    () => {
      draggingGradientStopId.value = null
      pendingRemoveGradientStopId.value = null
    }
  )
}

function handleGradientStopKeydown(event: KeyboardEvent, stopId: number) {
  const stop = gradientStops.value.find((item) => item.id === stopId)
  if (!stop || props.disabled) return
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault()
    activeGradientStopId.value = stop.id
    stop.percent = clampPercent(stop.percent + (event.key === 'ArrowLeft' ? -1 : 1))
    commitValue()
  }
}

function removeGradientStop(stopId = activeGradientStopId.value) {
  if (stopId === null || gradientStops.value.length <= 2) return
  if (pendingRemoveGradientStopId.value === stopId) pendingRemoveGradientStopId.value = null
  const index = gradientStops.value.findIndex((stop) => stop.id === stopId)
  if (index === -1) return
  gradientStops.value.splice(index, 1)
  const nextStop = gradientStops.value[Math.min(index, gradientStops.value.length - 1)]
  activeGradientStopId.value = nextStop?.id ?? null
  if (nextStop) syncPaletteColor(nextStop.color)
  commitValue()
}

async function pickScreenColor() {
  if (props.disabled || typeof window === 'undefined') return
  const EyeDropper = (window as Window & { EyeDropper?: EyeDropperConstructor }).EyeDropper
  if (!EyeDropper) return

  try {
    const result = await new EyeDropper().open()
    syncPaletteColor(colorToHsba(result.sRGBHex))
    syncActiveGradientStopColor()
    commitValue()
  } catch {
    // 用户取消系统取色时浏览器会 reject，保持当前颜色即可。
  }
}

function handleTriggerKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    toggleOpen()
  } else if (event.key === 'Escape') {
    open.value = false
  }
}

function handleDocumentPointerDown(event: PointerEvent) {
  if (!open.value) return
  const target = event.target as Node
  const isOutsideTrigger = rootRef.value && !rootRef.value.contains(target)
  const isOutsidePanel = panelRef.value && !panelRef.value.contains(target)
  if (isOutsideTrigger && isOutsidePanel) open.value = false
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if (!open.value) return
  if (event.key === 'Escape') {
    open.value = false
  }
}

function schedulePanelPositionUpdate() {
  if (open.value) void updatePanelPosition()
}

onMounted(() => {
  eyeDropperSupported.value = typeof window !== 'undefined' && 'EyeDropper' in window
  document.addEventListener('pointerdown', handleDocumentPointerDown, true)
  document.addEventListener('keydown', handleDocumentKeydown)
  document.addEventListener('scroll', schedulePanelPositionUpdate, true)
  window.addEventListener('resize', schedulePanelPositionUpdate)
})

onUnmounted(() => {
  dragCleanup?.()
  clearColorInputCommitTimer()
  document.removeEventListener('pointerdown', handleDocumentPointerDown, true)
  document.removeEventListener('keydown', handleDocumentKeydown)
  document.removeEventListener('scroll', schedulePanelPositionUpdate, true)
  window.removeEventListener('resize', schedulePanelPositionUpdate)
})
</script>

<template>
  <div ref="rootRef" class="relative inline-flex align-middle" :style="getUiAttrStyle(attrs)">
    <button v-bind="getUiExposeAttrs(attrs)" data-ui-colorpicker="true" type="button" :class="triggerClass" :style="triggerStyle" :disabled="disabled" :aria-expanded="open" aria-haspopup="dialog" aria-label="选择颜色" @click="toggleOpen" @keydown="handleTriggerKeydown">
      <span class="ui-colorpicker-checker block h-full w-full overflow-hidden rounded-[inherit]">
        <span class="block h-full w-full rounded-[inherit]" :style="{ background: previewBackground }"></span>
      </span>
    </button>

    <Teleport to="body">
      <div v-if="open" ref="panelRef" role="dialog" aria-label="颜色选择器" :style="panelStyle" class="ui-colorpicker-panel rounded-lg border border-medium bg-primary text-primary shadow-xl outline-none" @contextmenu.prevent @pointerdown.stop @selectstart.prevent>
        <div v-if="isGradientAllowed" class="flex h-10 items-center gap-1 border-b border-medium px-3">
          <button v-for="item in modeOptions" :key="item.mode" type="button" :title="item.label" :aria-label="item.label" class="flex size-6 items-center justify-center rounded bg-transparent" @click="changeMode(item.mode)">
            <span
              class="size-3.5 rounded-full border transition-[border-color,background,filter]"
              :class="[
                item.mode === activeMode ? 'border-[#ff7d3a]' : 'border-[#7d7d7d] grayscale',
                item.mode === 'solid' ? (item.mode === activeMode ? 'bg-[#ffc9b6]' : 'bg-[#e2e2e2]') : '',
                item.mode === 'linear' ? (item.mode === activeMode ? 'bg-[linear-gradient(180deg,#ffc9b6,#ff5011)]' : 'bg-[linear-gradient(180deg,#ffffff,#999999)]') : '',
                item.mode === 'radial' ? (item.mode === activeMode ? 'bg-[radial-gradient(circle,#ffc9b6,#ff5011)]' : 'bg-[radial-gradient(circle,#ffffff,#999999)]') : ''
              ]"
            ></span>
          </button>
        </div>

        <div v-if="isGradientAllowed && activeMode !== 'solid'" class="border-b border-medium py-2">
          <div data-ui-colorpicker-gradient-row="true" class="flex items-center mx-3">
            <div class="relative h-4 min-w-0 flex-1 rounded-full border border-medium ui-colorpicker-checker" @pointerdown="handleGradientBarPointerDown" ref="gradientBarRef">
              <div class="absolute inset-0 rounded-full" :style="{ background: gradientBarBackground }"></div>
              <button
                v-for="stop in gradientStops"
                :key="stop.id"
                type="button"
                class="ui-colorpicker-stop absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(100,116,139,0.75)] outline-none transition-[box-shadow,opacity,transform] hover:scale-125 focus-visible:ring-2 focus-visible:ring-brand/30"
                :class="[stop.id === activeGradientStopId ? 'z-10 ring-2 ring-brand-500' : '', stop.id === draggingGradientStopId ? 'scale-125' : '', stop.id === pendingRemoveGradientStopId ? 'opacity-50' : '']"
                :style="{ left: `${stop.percent}%`, background: hsbaToCss(stop.color) }"
                :aria-label="`渐变节点 ${stop.percent}%`"
                @pointerdown.stop="handleGradientStopPointerDown($event, stop.id)"
                @keydown="handleGradientStopKeydown($event, stop.id)"
              ></button>
            </div>

            <div v-if="activeMode === 'linear'" data-ui-colorpicker-degree-group="true" class="flex shrink-0 items-center">
              <span class="min-w-9 text-right font-mono text-xs text-tertiary">{{ degree }}°</span>
              <div ref="degreeRef" data-ui-colorpicker-degree="true" class="relative size-6 overflow-visible rounded-full border border-strong bg-secondary" @pointerdown="handleDegreePointerDown">
                <span data-ui-colorpicker-degree-pointer="true" class="pointer-events-none absolute left-1/2 top-1/2 size-0 origin-left" :style="degreePointerStyle">
                  <span data-ui-colorpicker-degree-line="true" class="absolute left-0 top-0 h-0.5 w-2.5 -translate-y-1/2 rounded-full bg-[var(--color-border-strong)]"></span>
                  <span
                    data-ui-colorpicker-degree-handle="true"
                    class="pointer-events-auto absolute left-2.5 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-strong bg-primary transition-[background-color,border-color,box-shadow,transform] hover:scale-125 hover:border-brand hover:bg-brand-50 hover:shadow-[0_0_0_2px_rgba(59,130,246,0.18)]"
                    :class="isDraggingDegree ? 'scale-125 border-brand bg-brand-50 shadow-[0_0_0_2px_rgba(59,130,246,0.18)]' : ''"
                  ></span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="grid gap-3 p-3">
          <div ref="paletteRef" data-ui-colorpicker-palette="true" class="ui-colorpicker-palette relative overflow-hidden rounded-md border border-medium" :style="paletteStyle" @pointerdown="handlePalettePointerDown">
            <div class="ui-colorpicker-palette-layer ui-colorpicker-palette-light"></div>
            <div class="ui-colorpicker-palette-layer ui-colorpicker-palette-dark"></div>
            <span class="ui-colorpicker-picker absolute size-3 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(15,23,42,0.55)]" :style="palettePickerStyle"></span>
          </div>

          <div class="flex items-center gap-3">
            <button
              type="button"
              class="flex size-8 shrink-0 items-center justify-center rounded-md border border-medium bg-secondary text-tertiary transition-colors hover:border-brand/40 hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="eyeDropperButtonDisabled"
              aria-label="屏幕取色"
              title="屏幕取色"
              @click="pickScreenColor"
            >
              <span class="i-lucide:pipette size-4"></span>
            </button>

            <div class="grid min-w-0 flex-1 gap-2">
              <div ref="hueBarRef" class="ui-colorpicker-huebar relative h-3 rounded-full border border-medium" @pointerdown="handleHuePointerDown">
                <span
                  data-ui-colorpicker-hue-handle="true"
                  class="ui-colorpicker-bar-picker absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(15,23,42,0.55)] transition-transform hover:scale-125"
                  :class="isDraggingHue ? 'scale-125' : ''"
                  :style="huePickerStyle"
                ></span>
              </div>
              <div v-if="isAlphaAllowed" ref="opacityBarRef" data-ui-colorpicker-opacity="true" class="ui-colorpicker-checker relative h-3 rounded-full border border-medium" @pointerdown="handleOpacityPointerDown">
                <div class="absolute inset-0 rounded-full" :style="{ background: opacityBarBackground }"></div>
                <span
                  data-ui-colorpicker-opacity-handle="true"
                  class="ui-colorpicker-bar-picker absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(15,23,42,0.55)] transition-transform hover:scale-125"
                  :class="isDraggingOpacity ? 'scale-125' : ''"
                  :style="opacityPickerStyle"
                ></span>
              </div>
            </div>

            <span class="ui-colorpicker-checker size-8 shrink-0 overflow-hidden rounded-full border border-medium">
              <span class="block h-full w-full rounded-full" :style="{ background: previewBackground }"></span>
            </span>
          </div>

          <div data-ui-colorpicker-input-row="true" class="ui-colorpicker-input-row grid items-center gap-2 text-xs" :style="colorInputRowStyle">
            <input
              data-ui-colorpicker-color-input="true"
              class="min-w-0 rounded border bg-secondary px-2 py-1 font-mono text-secondary outline-none transition-colors focus:border-brand"
              :class="colorInputInvalid ? 'border-[#ff4d4f]' : 'border-medium'"
              :value="colorInputValue"
              :aria-invalid="colorInputInvalid"
              spellcheck="false"
              @focus="handleColorInputFocus"
              @input="handleColorInput"
              @keydown.stop="handleColorInputKeydown"
              @blur="handleColorInputBlur"
            />
            <span class="rounded border border-medium bg-secondary px-2 py-1 text-right font-mono text-tertiary">{{ isAlphaAllowed ? Math.round(paletteColor.a * 100) : 100 }}%</span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.ui-colorpicker-checker {
  background-color: #fff;
  background-image:
    linear-gradient(45deg, rgba(148, 163, 184, 0.35) 25%, transparent 25%), linear-gradient(-45deg, rgba(148, 163, 184, 0.35) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(148, 163, 184, 0.35) 75%), linear-gradient(-45deg, transparent 75%, rgba(148, 163, 184, 0.35) 75%);
  background-position:
    0 0,
    0 6px,
    6px -6px,
    -6px 0;
  background-size: 12px 12px;
}

.ui-colorpicker-panel {
  box-sizing: border-box;
}

.ui-colorpicker-palette {
  height: 9rem;
}

.ui-colorpicker-palette-layer {
  position: absolute;
  inset: 0;
}

.ui-colorpicker-palette-light {
  background: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
}

.ui-colorpicker-palette-dark {
  background: linear-gradient(to top, #000, rgba(0, 0, 0, 0));
}

.ui-colorpicker-input-row {
  grid-template-columns: minmax(0, 1fr) 56px;
}

.ui-colorpicker-input-row input {
  min-width: 0;
}

.ui-colorpicker-picker {
  transform: translate(-50%, -50%);
}

.ui-colorpicker-huebar {
  background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);
}
</style>
