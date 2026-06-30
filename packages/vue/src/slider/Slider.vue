<script setup lang="ts">
import { clsx } from 'clsx'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'
import type { CSSProperties, StyleValue } from 'vue'

import { getUiExposeAttrs } from '../attrs'
import { Tooltip } from '../tooltip'

import { sliderDot, sliderHandle, sliderMarkLabel, sliderRail, sliderRoot, sliderTrack, type SliderMarks, type SliderProps, type SliderRangeOptions, type SliderRangeProp, type SliderTooltipOptions, type SliderValue } from '.'

defineOptions({
  inheritAttrs: false
})

interface NormalizedMark {
  value: number
  percent: number
  label?: string | number
  style?: Record<string, string | number>
}

interface SliderHandleState {
  value: number
  percent: number
  index: number
}

interface DragState {
  type: 'handle' | 'track'
  index: number
  startValue: number
  startValues: number[]
  rangeWidth: number
  startClientX: number
  startClientY: number
  moved: boolean
}

type SliderColorStyle = CSSProperties & {
  '--ui-slider-color': string
  '--ui-slider-color-hover': string
  '--ui-slider-color-soft': string
}

const BRAND_COLOR = 'oklch(68.98% 0.1679 252.18)'
const BRAND_HOVER_COLOR = 'oklch(77.49% 0.1190 250.28)'
const DRAG_THRESHOLD = 2

const props = withDefaults(
  defineProps<{
    /** modelValue 是本地 v-model 绑定值，range 模式下为 number[]。 */
    modelValue?: SliderValue
    /** defaultValue 是非受控初始值。 */
    defaultValue?: SliderValue
    /** min 是最小值。 */
    min?: number
    /** max 是最大值。 */
    max?: number
    /** step 是步长；为 null 且存在 marks 时只能选中 marks。 */
    step?: number | null
    /** range 启用范围选择；对象形式支持 draggableTrack/editable/minCount/maxCount。 */
    range?: SliderRangeProp
    /** marks 定义刻度和标签。 */
    marks?: SliderMarks
    /** dots 表示是否显示步长或 marks 节点。 */
    dots?: boolean
    /** included 表示是否高亮 min 到当前值，range 模式下表示是否高亮两个节点之间。 */
    included?: boolean
    /** color 设置已选轨道、handle 和激活刻度的主题色；brand 使用默认品牌色。 */
    color?: string
    /** disabled 表示是否禁用交互；数组形式可禁用指定 handle。 */
    disabled?: boolean | boolean[]
    /** keyboard 表示是否允许键盘操作 handle。 */
    keyboard?: boolean
    /** vertical 表示垂直方向。 */
    vertical?: boolean
    /** reverse 表示反向展示和键盘方向。 */
    reverse?: boolean
    /** tooltip 配置悬浮提示；formatter 返回 null 时隐藏。 */
    tooltip?: SliderTooltipOptions
    /** size 表示滑动条尺寸。 */
    size?: SliderProps['size']
    /** tabindex 是每个 handle 的键盘聚焦顺序。 */
    tabindex?: number | string
    /** ariaLabel 为 handle 设置 aria-label。 */
    ariaLabel?: string | string[]
    /** name 是隐藏 input 的原生 name，便于表单提交。 */
    name?: string
  }>(),
  {
    modelValue: undefined,
    defaultValue: undefined,
    min: 0,
    max: 100,
    step: 1,
    range: false,
    marks: undefined,
    dots: false,
    included: true,
    color: 'brand',
    disabled: false,
    keyboard: true,
    vertical: false,
    reverse: false,
    tooltip: undefined,
    size: 'md',
    tabindex: 0,
    ariaLabel: undefined,
    name: undefined
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: SliderValue): void
  (e: 'change', value: SliderValue): void
  (e: 'changeComplete', value: SliderValue): void
  (e: 'focus', event: FocusEvent, index: number): void
  (e: 'blur', event: FocusEvent, index: number): void
}>()

const attrs = useAttrs()
const sliderRef = ref<HTMLElement | null>(null)
const handleRefs = ref<HTMLElement[]>([])
const internalValues = ref<number[]>([])
const dragValues = ref<number[] | null>(null)
const activeHandleIndex = ref(-1)
const dragging = ref<DragState | null>(null)

const isRange = computed(() => Boolean(props.range))
const normalizedRangeOptions = computed<SliderRangeOptions>(() => (typeof props.range === 'object' ? props.range : {}))
const isVertical = computed(() => props.vertical)
const globalDisabled = computed(() => props.disabled === true)
const disabledHandleIndexes = computed(() => (Array.isArray(props.disabled) ? props.disabled : []))
const anyHandleDisabled = computed(() => disabledHandleIndexes.value.some(Boolean))
const isEditable = computed(() => isRange.value && Boolean(normalizedRangeOptions.value.editable) && !anyHandleDisabled.value)
const minValue = computed(() => (Number.isFinite(props.min) ? props.min : 0))
const maxValue = computed(() => {
  if (!Number.isFinite(props.max)) return minValue.value + 100
  return props.max <= minValue.value ? minValue.value + 1 : props.max
})
const valueSpan = computed(() => maxValue.value - minValue.value)
const currentValues = computed(() => {
  if (dragValues.value) return normalizeValues(dragValues.value)
  const values = props.modelValue === undefined ? internalValues.value : normalizeModelValue(props.modelValue)
  return normalizeValues(values)
})
const handleStates = computed<SliderHandleState[]>(() => currentValues.value.map((value, index) => ({ value, percent: valueToPercent(value), index })))
const selectedRange = computed(() => {
  if (!props.included) return []
  if (isRange.value) {
    const values = currentValues.value
    return values.length >= 2 ? [[values[0], values[values.length - 1]]] : []
  }
  return [[minValue.value, currentValues.value[0] ?? minValue.value]]
})
const trackSegments = computed(() => selectedRange.value.map(([start, end]) => ({ start, end })))
const marks = computed<NormalizedMark[]>(() => {
  const normalizedMarks: NormalizedMark[] = []
  for (const [key, mark] of Object.entries(props.marks ?? {})) {
    const value = Number(key)
    if (!Number.isFinite(value)) continue
    const clampedValue = clampValue(value)
    if (typeof mark === 'object' && mark !== null && !Array.isArray(mark)) {
      normalizedMarks.push({
        value: clampedValue,
        percent: valueToPercent(clampedValue),
        label: mark.label,
        style: mark.style
      })
      continue
    }
    if (typeof mark === 'string' || typeof mark === 'number') {
      normalizedMarks.push({
        value: clampedValue,
        percent: valueToPercent(clampedValue),
        label: mark
      })
    }
  }
  return normalizedMarks.sort((a, b) => a.value - b.value)
})
const snapValues = computed(() => {
  if (props.step === null) {
    return marks.value.length ? uniqueNumbers(marks.value.map((mark) => mark.value)) : [minValue.value, maxValue.value]
  }
  return []
})
const dotMarks = computed<NormalizedMark[]>(() => {
  if (marks.value.length) return marks.value
  if (!props.dots || props.step === null) return []
  const step = getStep()
  const count = Math.floor(valueSpan.value / step)
  const values = Array.from({ length: count + 1 }, (_, index) => clampValue(minValue.value + index * step))
  const lastValue = values.at(-1)
  if (lastValue !== maxValue.value) values.push(maxValue.value)
  return uniqueNumbers(values).map((value) => ({
    value,
    percent: valueToPercent(value)
  }))
})
const draggableTrack = computed(() => isRange.value && Boolean(normalizedRangeOptions.value.draggableTrack) && !isEditable.value && currentValues.value.length >= 2)
const rootClass = computed(() =>
  clsx(
    attrs.class as string | undefined,
    sliderRoot({
      size: props.size,
      vertical: isVertical.value,
      disabled: globalDisabled.value
    })
  )
)
const sliderColorStyle = computed<SliderColorStyle>(() => {
  const color = props.color.trim()
  const baseColor = !color || color === 'brand' ? BRAND_COLOR : color
  const hoverColor = !color || color === 'brand' ? BRAND_HOVER_COLOR : `color-mix(in oklab, ${baseColor} 86%, white)`
  return {
    '--ui-slider-color': baseColor,
    '--ui-slider-color-hover': hoverColor,
    '--ui-slider-color-soft': `color-mix(in oklab, ${baseColor} 16%, transparent)`
  }
})
const rootStyle = computed<StyleValue>(() => {
  const attrsStyle = attrs.style as StyleValue | undefined
  return attrsStyle ? [attrsStyle, sliderColorStyle.value] : sliderColorStyle.value
})
const trackThickness = computed(() => {
  if (props.size === 'sm') return '4px'
  if (props.size === 'lg') return '8px'
  return '6px'
})
const railStyle = computed<CSSProperties>(() => {
  if (isVertical.value) {
    return {
      left: '50%',
      top: '8px',
      width: trackThickness.value,
      height: 'calc(100% - 16px)',
      transform: 'translateX(-50%)'
    }
  }
  return {
    left: '8px',
    top: '50%',
    width: 'calc(100% - 16px)',
    height: trackThickness.value,
    transform: 'translateY(-50%)'
  }
})
const hiddenInputValue = computed(() => (isRange.value ? currentValues.value.join(',') : String(currentValues.value[0] ?? minValue.value)))

watch(
  [() => props.modelValue, isRange, minValue, maxValue],
  () => {
    if (props.modelValue !== undefined) {
      internalValues.value = normalizeModelValue(props.modelValue)
      return
    }
    internalValues.value = normalizeValues(internalValues.value)
  },
  { immediate: true }
)

watch(
  () => props.defaultValue,
  (defaultValue) => {
    if (props.modelValue !== undefined) return
    internalValues.value = normalizeModelValue(defaultValue)
  },
  { immediate: true }
)

onMounted(() => {
  window.addEventListener('pointermove', handleDocumentPointerMove)
  window.addEventListener('pointerup', handleDocumentPointerUp)
  window.addEventListener('pointercancel', handleDocumentPointerUp)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', handleDocumentPointerMove)
  window.removeEventListener('pointerup', handleDocumentPointerUp)
  window.removeEventListener('pointercancel', handleDocumentPointerUp)
})

function uniqueNumbers(values: number[]) {
  return Array.from(new Set(values.map((value) => Number(value.toFixed(10))))).sort((a, b) => a - b)
}

function clampValue(value: number) {
  if (!Number.isFinite(value)) return minValue.value
  return Math.min(maxValue.value, Math.max(minValue.value, value))
}

function getStep() {
  if (props.step === null || !Number.isFinite(props.step) || props.step <= 0) return 1
  return props.step
}

function alignValue(value: number) {
  const clamped = clampValue(value)
  if (clamped === minValue.value || clamped === maxValue.value) return clamped
  if (props.step === null) {
    return getClosestValue(clamped, snapValues.value)
  }
  const step = getStep()
  const precision = getPrecision(step)
  const steps = Math.round((clamped - minValue.value) / step)
  return clampValue(Number((minValue.value + steps * step).toFixed(precision)))
}

function getPrecision(value: number) {
  const text = String(value)
  if (!text.includes('.')) return 0
  return text.split('.')[1]?.length ?? 0
}

function getClosestValue(value: number, values: number[]) {
  return values.reduce((closest, item) => (Math.abs(item - value) < Math.abs(closest - value) ? item : closest), values[0] ?? clampValue(value))
}

function normalizeModelValue(value: SliderValue | undefined) {
  if (Array.isArray(value)) return value.map(alignValue)
  if (typeof value === 'number') return [alignValue(value)]
  if (props.defaultValue !== undefined && props.modelValue === undefined) return normalizeModelValue(props.defaultValue)
  return isRange.value ? [minValue.value, maxValue.value] : [minValue.value]
}

function normalizeValues(values: number[]) {
  const normalized = (values.length ? values : isRange.value ? [minValue.value, maxValue.value] : [minValue.value]).map(alignValue)
  if (!isRange.value) return [normalized[0] ?? minValue.value]

  const sorted = [...normalized].sort((a, b) => a - b)
  if (sorted.length < 2) sorted.push(maxValue.value)

  const minCount = Math.max(0, normalizedRangeOptions.value.minCount ?? 1)
  while (sorted.length < minCount) sorted.push(sorted.at(-1) ?? maxValue.value)

  const maxCount = normalizedRangeOptions.value.maxCount
  if (maxCount !== undefined && maxCount > 0 && sorted.length > maxCount) sorted.splice(maxCount)
  return sorted
}

function valueToPercent(value: number) {
  return (clampValue(value) - minValue.value) / valueSpan.value * 100
}

function percentToValue(percent: number) {
  return alignValue(minValue.value + percent / 100 * valueSpan.value)
}

function getLogicalPercent(value: number) {
  const percent = valueToPercent(value)
  return props.reverse ? 100 - percent : percent
}

function getValueFromPointer(event: PointerEvent | MouseEvent) {
  const rect = sliderRef.value?.getBoundingClientRect()
  if (!rect) return minValue.value
  const rawPercent = isVertical.value ? (rect.bottom - event.clientY) / rect.height * 100 : (event.clientX - rect.left) / rect.width * 100
  const percent = props.reverse ? 100 - rawPercent : rawPercent
  return percentToValue(Math.max(0, Math.min(100, percent)))
}

function getSegmentStyle(start: number, end: number): CSSProperties {
  const logicalStart = getLogicalPercent(Math.min(start, end))
  const logicalEnd = getLogicalPercent(Math.max(start, end))
  const startPercent = Math.min(logicalStart, logicalEnd)
  const size = Math.abs(logicalEnd - logicalStart)
  if (isVertical.value) {
    return {
      left: '50%',
      bottom: `${startPercent}%`,
      width: trackThickness.value,
      height: `${size}%`,
      transform: 'translateX(-50%)'
    }
  }
  return {
    left: `${startPercent}%`,
    top: '50%',
    width: `${size}%`,
    height: trackThickness.value,
    transform: 'translateY(-50%)'
  }
}

function getHandleStyle(value: number): CSSProperties {
  const percent = getLogicalPercent(value)
  if (isVertical.value) {
    return {
      bottom: `${percent}%`,
      left: '50%',
      transform: 'translate(-50%, 50%)'
    }
  }
  return {
    left: `${percent}%`,
    top: '50%',
    transform: 'translate(-50%, -50%)'
  }
}

function getDotStyle(mark: NormalizedMark): CSSProperties {
  const percent = getLogicalPercent(mark.value)
  if (isVertical.value) {
    return {
      bottom: `${percent}%`,
      left: '50%',
      transform: 'translate(-50%, 50%)'
    }
  }
  return {
    left: `${percent}%`,
    top: '50%',
    transform: 'translate(-50%, -50%)'
  }
}

function getMarkStyle(mark: NormalizedMark): CSSProperties {
  const percent = getLogicalPercent(mark.value)
  const style = mark.style ?? {}
  if (isVertical.value) {
    return {
      bottom: `${percent}%`,
      left: 'calc(50% + 14px)',
      transform: 'translateY(50%)',
      ...style
    }
  }
  return {
    left: `${percent}%`,
    top: 'calc(50% + 14px)',
    ...style
  }
}

function isValueIncluded(value: number) {
  if (!props.included) return false
  return selectedRange.value.some(([start, end]) => value >= Math.min(start, end) && value <= Math.max(start, end))
}

function toEmitValue(values: number[]): SliderValue {
  return isRange.value ? [...values] : values[0] ?? minValue.value
}

function commitValues(values: number[], eventName: 'change' | 'changeComplete' = 'change') {
  const nextValues = normalizeValues(values)
  internalValues.value = nextValues
  if (dragging.value) dragValues.value = nextValues
  const emitValue = toEmitValue(nextValues)
  emit('update:modelValue', emitValue)
  if (eventName === 'changeComplete') {
    emit('changeComplete', emitValue)
  } else {
    emit('change', emitValue)
  }
  return nextValues
}

function findClosestHandle(value: number) {
  return currentValues.value.reduce((closestIndex, item, index) => (Math.abs(item - value) < Math.abs(currentValues.value[closestIndex] - value) ? index : closestIndex), 0)
}

function getNextHandleIndex(previousValues: number[], previousIndex: number, nextValue: number, nextValues: number[]) {
  if (!isRange.value || nextValues.length <= 1) return Math.min(previousIndex, nextValues.length - 1)
  const previousValue = previousValues[previousIndex] ?? nextValue
  if (nextValue > previousValue) {
    for (let index = nextValues.length - 1; index >= 0; index--) {
      if ((nextValues[index] ?? maxValue.value) <= nextValue) return index
    }
  }
  if (nextValue < previousValue) {
    const index = nextValues.findIndex((value) => value >= nextValue)
    return index >= 0 ? index : 0
  }
  return Math.min(previousIndex, nextValues.length - 1)
}

function updateHandleValue(index: number, value: number, complete = false) {
  if (isHandleDisabled(index)) return
  const previousValues = currentValues.value
  const nextValue = alignValue(value)
  const values = [...previousValues]
  values[index] = nextValue
  const nextValues = commitValues(values, complete ? 'changeComplete' : 'change')
  const nextIndex = getNextHandleIndex(previousValues, index, nextValue, nextValues)
  if (dragging.value?.type === 'handle') dragging.value.index = nextIndex
  activeHandleIndex.value = nextIndex
}

function createHandleDragState(event: PointerEvent, index: number, value: number, values: number[]): DragState {
  return {
    type: 'handle',
    index,
    startValue: value,
    startValues: values,
    rangeWidth: 0,
    startClientX: event.clientX,
    startClientY: event.clientY,
    moved: false
  }
}

function canAddEditableHandle() {
  if (!isEditable.value) return false
  const maxCount = normalizedRangeOptions.value.maxCount
  return maxCount === undefined || maxCount <= 0 || currentValues.value.length < maxCount
}

function addEditableHandle(value: number) {
  if (!isEditable.value) return null
  if (!canAddEditableHandle()) return null
  const values = [...currentValues.value]
  values.push(alignValue(value))
  const nextValues = commitValues(values)
  activeHandleIndex.value = nextValues.indexOf(alignValue(value))
  void nextTick(() => handleRefs.value[activeHandleIndex.value]?.focus())
  return nextValues
}

function removeEditableHandle(index: number) {
  if (!isEditable.value || isHandleDisabled(index)) return false
  const minCount = normalizedRangeOptions.value.minCount ?? 1
  if (currentValues.value.length <= minCount) return false
  const values = currentValues.value.filter((_, valueIndex) => valueIndex !== index)
  commitValues(values)
  activeHandleIndex.value = Math.min(index, values.length - 1)
  return true
}

function handleRailPointerDown(event: PointerEvent) {
  if (globalDisabled.value || event.button !== 0) return
  const value = getValueFromPointer(event)
  const index = findClosestHandle(value)
  if (isEditable.value) {
    const nextValues = addEditableHandle(value)
    if (!nextValues) return
    const nextIndex = activeHandleIndex.value >= 0 ? activeHandleIndex.value : index
    dragging.value = createHandleDragState(event, nextIndex, value, nextValues)
    dragValues.value = nextValues
  } else {
    dragging.value = createHandleDragState(event, index, value, currentValues.value)
    updateHandleValue(index, value)
    dragValues.value = currentValues.value
  }
  sliderRef.value?.setPointerCapture?.(event.pointerId)
  event.preventDefault()
}

function handleHandlePointerDown(event: PointerEvent, index: number) {
  if (globalDisabled.value || isHandleDisabled(index) || event.button !== 0) return
  dragging.value = {
    type: 'handle',
    index,
    startValue: getValueFromPointer(event),
    startValues: currentValues.value,
    rangeWidth: 0,
    startClientX: event.clientX,
    startClientY: event.clientY,
    moved: false
  }
  dragValues.value = currentValues.value
  activeHandleIndex.value = index
  handleRefs.value[index]?.focus()
  sliderRef.value?.setPointerCapture?.(event.pointerId)
  event.stopPropagation()
  event.preventDefault()
}

function handleHandlePointerLeave(index: number) {
  if (dragging.value || activeHandleIndex.value !== index) return
  activeHandleIndex.value = -1
}

function handleTrackPointerDown(event: PointerEvent) {
  if (globalDisabled.value || event.button !== 0) return
  if (!draggableTrack.value) {
    handleRailPointerDown(event)
    return
  }
  const values = currentValues.value
  dragging.value = {
    type: 'track',
    index: 0,
    startValue: getValueFromPointer(event),
    startValues: values,
    rangeWidth: values[values.length - 1] - values[0],
    startClientX: event.clientX,
    startClientY: event.clientY,
    moved: false
  }
  dragValues.value = values
  sliderRef.value?.setPointerCapture?.(event.pointerId)
  event.stopPropagation()
  event.preventDefault()
}

function handleDocumentPointerMove(event: PointerEvent) {
  if (!dragging.value || globalDisabled.value) return
  if (Math.abs(event.clientX - dragging.value.startClientX) > DRAG_THRESHOLD || Math.abs(event.clientY - dragging.value.startClientY) > DRAG_THRESHOLD) {
    dragging.value.moved = true
  }
  if (dragging.value.type === 'handle') {
    updateHandleValue(dragging.value.index, getValueFromPointer(event))
    return
  }
  if (!dragging.value.moved) return

  const pointerValue = getValueFromPointer(event)
  const delta = pointerValue - dragging.value.startValue
  const minStart = minValue.value - dragging.value.startValues[0]
  const maxStart = maxValue.value - dragging.value.startValues[dragging.value.startValues.length - 1]
  const clampedDelta = Math.max(minStart, Math.min(maxStart, delta))
  commitValues(dragging.value.startValues.map((value) => value + clampedDelta))
}

function handleDocumentPointerUp(event?: PointerEvent) {
  if (!dragging.value) return
  if (dragging.value.type === 'track' && !dragging.value.moved && event?.type === 'pointerup') {
    const value = getValueFromPointer(event)
    dragging.value = createHandleDragState(event, findClosestHandle(value), value, currentValues.value)
    updateHandleValue(dragging.value.index, value)
  }
  const completeValues = currentValues.value
  dragging.value = null
  commitValues(completeValues, 'changeComplete')
  dragValues.value = null
}

function getKeyOffset(event: KeyboardEvent) {
  const step = props.step === null && snapValues.value.length > 1 ? undefined : getStep()
  const directionMultiplier = props.reverse ? -1 : 1
  if (event.key === 'ArrowRight' || event.key === 'ArrowUp') return step === undefined ? 1 * directionMultiplier : step * directionMultiplier
  if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') return step === undefined ? -1 * directionMultiplier : -step * directionMultiplier
  if (event.key === 'PageUp') return (step ?? 1) * 10 * directionMultiplier
  if (event.key === 'PageDown') return -(step ?? 1) * 10 * directionMultiplier
  return 0
}

function getNextSnapValue(current: number, offset: number) {
  if (props.step !== null || !snapValues.value.length) return alignValue(current + offset)
  const currentIndex = snapValues.value.findIndex((value) => value === current)
  const nextIndex = Math.max(0, Math.min(snapValues.value.length - 1, (currentIndex >= 0 ? currentIndex : 0) + offset))
  return snapValues.value[nextIndex]
}

function handleKeydown(event: KeyboardEvent, index: number) {
  if (globalDisabled.value || isHandleDisabled(index) || !props.keyboard) return
  if ((event.key === 'Backspace' || event.key === 'Delete') && removeEditableHandle(index)) {
    event.preventDefault()
    emit('changeComplete', toEmitValue(currentValues.value))
    return
  }
  if (event.key === 'Home') {
    updateHandleValue(index, minValue.value, true)
    event.preventDefault()
    return
  }
  if (event.key === 'End') {
    updateHandleValue(index, maxValue.value, true)
    event.preventDefault()
    return
  }
  const offset = getKeyOffset(event)
  if (offset === 0) return
  const current = currentValues.value[index]
  const nextValue = getNextSnapValue(current, offset)
  updateHandleValue(index, nextValue, true)
  event.preventDefault()
}

function getTooltipTitle(value: number) {
  const formatter = props.tooltip?.formatter
  if (formatter === null) return ''
  const result = formatter ? formatter(value) : value
  return result === null ? '' : result
}

function hasTooltipTitle(value: number) {
  return getTooltipTitle(value) !== ''
}

function getTooltipAlignKey(handle: SliderHandleState) {
  return `${handle.index}:${handle.value}:${isVertical.value ? 'vertical' : 'horizontal'}:${props.reverse ? 'reverse' : 'normal'}`
}

function isTooltipOpen(index: number) {
  if (props.tooltip?.open !== undefined) return props.tooltip.open
  return activeHandleIndex.value === index || dragging.value?.index === index
}

function getHandleAriaLabel(index: number) {
  if (Array.isArray(props.ariaLabel)) return props.ariaLabel[index] ?? `滑动输入节点 ${index + 1}`
  return props.ariaLabel ?? `滑动输入节点 ${index + 1}`
}

function setHandleRef(element: HTMLElement | null, index: number) {
  if (element) handleRefs.value[index] = element
}

function isHandleDisabled(index: number) {
  return globalDisabled.value || Boolean(disabledHandleIndexes.value[index])
}

function focus() {
  if (globalDisabled.value) return
  const firstEnabledIndex = currentValues.value.findIndex((_, index) => !isHandleDisabled(index))
  if (firstEnabledIndex >= 0) handleRefs.value[firstEnabledIndex]?.focus()
}

function blur() {
  handleRefs.value.forEach((element) => element.blur())
}

defineExpose({
  focus,
  blur
})
</script>

<template>
  <div
    v-bind="getUiExposeAttrs(attrs)"
    ref="sliderRef"
    data-ui-slider="true"
    role="presentation"
    :class="rootClass"
    :style="rootStyle"
    :data-vertical="isVertical"
    :data-reverse="reverse"
    @pointerdown="handleRailPointerDown"
  >
    <input v-if="name" type="hidden" :name="name" :value="hiddenInputValue" />
    <span data-ui-slider-rail="true" :class="sliderRail({ size, vertical: isVertical, disabled: globalDisabled })" :style="railStyle" aria-hidden="true"></span>
    <span
      v-for="(segment, index) in trackSegments"
      :key="`track-${index}`"
      data-ui-slider-track="true"
      :class="sliderTrack({ size, vertical: isVertical, disabled: globalDisabled, draggable: draggableTrack })"
      :style="getSegmentStyle(segment.start, segment.end)"
      aria-hidden="true"
      @pointerdown.stop="handleTrackPointerDown"
    ></span>
    <span
      v-for="dot in dotMarks"
      :key="`dot-${dot.value}`"
      data-ui-slider-dot="true"
      :class="sliderDot({ size, active: isValueIncluded(dot.value), disabled: globalDisabled })"
      :style="getDotStyle(dot)"
      aria-hidden="true"
    ></span>
    <span
      v-for="mark in marks"
      :key="`mark-${mark.value}`"
      data-ui-slider-mark="true"
      :class="sliderMarkLabel({ active: isValueIncluded(mark.value), disabled: globalDisabled, vertical: isVertical })"
      :style="getMarkStyle(mark)"
    >
      {{ mark.label }}
    </span>
    <span
      v-for="handle in handleStates"
      :key="`handle-${handle.index}`"
      data-ui-slider-handle-wrap="true"
      class="absolute z-20 inline-flex"
      :style="getHandleStyle(handle.value)"
    >
      <Tooltip
        :title="getTooltipTitle(handle.value)"
        :placement="tooltip?.placement || (isVertical ? 'right' : 'top')"
        :open="hasTooltipTitle(handle.value) && isTooltipOpen(handle.index)"
        :disabled="!hasTooltipTitle(handle.value)"
        :force-align-key="getTooltipAlignKey(handle)"
        :mouse-enter-delay="0"
        :mouse-leave-delay="0"
      >
        <button
          :ref="(element) => setHandleRef(element as HTMLElement | null, handle.index)"
          type="button"
          data-ui-slider-handle="true"
          role="slider"
          :aria-label="getHandleAriaLabel(handle.index)"
          :aria-valuemin="minValue"
          :aria-valuemax="maxValue"
          :aria-valuenow="handle.value"
          :aria-disabled="isHandleDisabled(handle.index)"
          :tabindex="isHandleDisabled(handle.index) ? -1 : tabindex"
          :disabled="isHandleDisabled(handle.index)"
          :class="sliderHandle({ size, active: activeHandleIndex === handle.index || dragging?.index === handle.index, disabled: isHandleDisabled(handle.index) })"
          @pointerdown="handleHandlePointerDown($event, handle.index)"
          @pointerleave="handleHandlePointerLeave(handle.index)"
          @keydown="handleKeydown($event, handle.index)"
          @focus="activeHandleIndex = handle.index; emit('focus', $event, handle.index)"
          @blur="activeHandleIndex = -1; emit('blur', $event, handle.index)"
          @dblclick.stop="removeEditableHandle(handle.index)"
        ></button>
      </Tooltip>
    </span>
  </div>
</template>
