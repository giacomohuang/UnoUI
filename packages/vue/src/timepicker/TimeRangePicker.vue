<script setup lang="ts">
import { clsx } from 'clsx'
import dayjs, { type Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { computed, nextTick, ref, useAttrs, watch } from 'vue'

import { timePickerOption, timePickerValue, timePickerWrapper, type TimePickerModelValue, type TimePickerProps, type TimePickerUnit, type TimeRangePickerChangeInfo, type TimeRangePickerDayOffset, type TimeRangePickerDisabledTime, type TimeRangePickerModelValue, type TimeRangePickerSide } from '.'
import { getUiExposeAttrs } from '../attrs'
import { Button } from '../button'
import { Dropdown } from '../dropdown'

dayjs.extend(customParseFormat)

defineOptions({
  inheritAttrs: false
})

type Meridiem = 'am' | 'pm'
type TimeColumn = TimePickerUnit | 'meridiem'
type TimeRangePickerEmitValue = Exclude<TimeRangePickerModelValue, undefined>

interface TimeOption {
  value: number
  label: string
  disabled: boolean
}

const props = withDefaults(
  defineProps<{
    /** modelValue 是 v-model 绑定值，格式为 [开始时间, 结束时间]。 */
    modelValue?: TimeRangePickerModelValue
    /** format 是展示格式，默认 HH:mm:ss；use12Hours 时默认 h:mm:ss A。 */
    format?: string
    /** valueFormat 是提交字符串格式；未传时优先保持传入值类型。 */
    valueFormat?: string
    /** placeholder 是无值时的起止占位文案。 */
    placeholder?: [string, string]
    /** separatorIcon 是范围连接图标类名。 */
    separatorIcon?: string
    /** size 是选择器尺寸，可选，默认 md，并与 Input/Button 高度对齐。 */
    size?: TimePickerProps['size']
    /** disabled 表示是否禁用选择器交互。 */
    disabled?: boolean
    /** clearable 表示是否允许一键清空。 */
    clearable?: boolean
    /** hourStep 是小时选项步长。 */
    hourStep?: number
    /** minuteStep 是分钟选项步长。 */
    minuteStep?: number
    /** secondStep 是秒选项步长。 */
    secondStep?: number
    /** use12Hours 表示是否启用 12 小时制。 */
    use12Hours?: boolean
    /** showSecond 控制是否显示秒列；未传时由 format 是否包含秒决定。 */
    showSecond?: boolean
    /** disabledTime 用于禁用不可选时间。 */
    disabledTime?: TimeRangePickerDisabledTime
    /** hideDisabledOptions 表示是否隐藏禁用选项。 */
    hideDisabledOptions?: boolean
    /** suffixIcon 是右侧时钟图标类名。 */
    suffixIcon?: string
    /** clearIcon 是清空按钮图标类名。 */
    clearIcon?: string
    /** teleportedWidth 是下拉层固定宽度，默认按列数自动计算。 */
    teleportedWidth?: string
    /** name 是隐藏 input 的原生 name，便于表单提交，值以逗号拼接。 */
    name?: string
  }>(),
  {
    modelValue: undefined,
    format: undefined,
    valueFormat: undefined,
    placeholder: () => ['开始时间', '结束时间'],
    separatorIcon: 'i-ant-design:swap-right-outlined',
    size: 'md',
    disabled: false,
    clearable: false,
    hourStep: 1,
    minuteStep: 1,
    secondStep: 1,
    use12Hours: false,
    showSecond: undefined,
    disabledTime: undefined,
    hideDisabledOptions: false,
    suffixIcon: 'i-lucide:clock-3',
    clearIcon: 'i-lucide:x',
    teleportedWidth: undefined,
    name: undefined
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: TimeRangePickerEmitValue): void
  (e: 'change', value: TimeRangePickerEmitValue, timeStrings: [string, string], info: TimeRangePickerChangeInfo): void
  (e: 'clear'): void
  (e: 'ok', value: TimeRangePickerEmitValue, timeStrings: [string, string], info: TimeRangePickerChangeInfo): void
  (e: 'calendar-change', value: TimeRangePickerModelValue, timeStrings: [string, string], info: TimeRangePickerChangeInfo): void
  (e: 'visible-change', value: boolean): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}>()

const attrs = useAttrs()
const open = ref(false)
const focused = ref(false)
const activeSide = ref<TimeRangePickerSide>('start')
const pendingStartValue = ref<Dayjs | null>(null)
const pendingEndValue = ref<Dayjs | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)

const defaultTimeFormat = 'HH:mm:ss'
const default12HourFormat = 'h:mm:ss A'

const timeFormat = computed(() => props.format || (props.use12Hours ? default12HourFormat : defaultTimeFormat))
const hasHourColumn = computed(() => hasFormatToken(timeFormat.value, /[HhKk]/) || !hasFormatToken(timeFormat.value, /[ms]/))
const hasMinuteColumn = computed(() => hasFormatToken(timeFormat.value, /m/))
const hasSecondColumn = computed(() => props.showSecond ?? hasFormatToken(timeFormat.value, /s/))
const hasMeridiemColumn = computed(() => props.use12Hours || hasFormatToken(timeFormat.value, /[aA]/))
const columnCount = computed(() => [hasHourColumn.value, hasMinuteColumn.value, hasSecondColumn.value, hasMeridiemColumn.value].filter(Boolean).length || 1)
const panelWidth = computed(() => Math.max(168, columnCount.value * 64 + 16))
const dropdownWidth = computed(() => props.teleportedWidth || `${panelWidth.value * 2}px`)
const modelRange = computed(() => normalizeModelRange(props.modelValue))
const selectedStartValue = computed(() => modelRange.value[0])
const selectedEndValue = computed(() => modelRange.value[1])
const selectedEndDayOffset = computed(() => getAutoEndDayOffset(selectedStartValue.value, selectedEndValue.value))
const currentStartValue = computed(() => pendingStartValue.value || selectedStartValue.value || normalizeTime(dayjs()))
const currentEndValue = computed(() => pendingEndValue.value || selectedEndValue.value || currentStartValue.value)
const startDisplayText = computed(() => selectedStartValue.value?.format(timeFormat.value) || '')
const endDisplayText = computed(() => selectedEndValue.value?.format(timeFormat.value) || '')
const hasValue = computed(() => Boolean(selectedStartValue.value || selectedEndValue.value))
const showClearButton = computed(() => props.clearable && hasValue.value && !props.disabled)
const hiddenInputValue = computed(() => {
  if (!selectedStartValue.value && !selectedEndValue.value) return ''
  return [selectedStartValue.value, selectedEndValue.value].map((value) => value?.format(props.valueFormat || timeFormat.value) || '').join(',')
})
const pendingEndDayOffset = computed(() => getAutoEndDayOffset(pendingStartValue.value, pendingEndValue.value))
const currentRangeInfo = computed(() => createRangeInfo(pendingEndDayOffset.value))
const canConfirm = computed(() => Boolean(pendingStartValue.value && pendingEndValue.value))

const wrapperClass = computed(() =>
  clsx(
    attrs.class as string | undefined,
    timePickerWrapper({
      size: props.size,
      focused: open.value || focused.value,
      disabled: props.disabled
    })
  )
)

const panelGridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${columnCount.value}, minmax(0, 1fr))`
}))

watch(open, (value) => {
  emit('visible-change', value)
  if (value) {
    pendingStartValue.value = selectedStartValue.value
    pendingEndValue.value = selectedEndValue.value
    scrollSelectedTimeOptions()
  }
})

watch(
  () => props.modelValue,
  () => {
    if (!open.value) return
    pendingStartValue.value = selectedStartValue.value
    pendingEndValue.value = selectedEndValue.value
    scrollSelectedTimeOptions()
  }
)

watch(
  () => [timeFormat.value, props.showSecond],
  () => {
    void nextTick(() => {
      if (pendingStartValue.value) pendingStartValue.value = normalizeTime(pendingStartValue.value)
      if (pendingEndValue.value) pendingEndValue.value = normalizeTime(pendingEndValue.value)
    })
  }
)

function hasFormatToken(format: string, pattern: RegExp) {
  return pattern.test(format.replace(/\[[^\]]*]/g, ''))
}

function getCandidateFormats() {
  return Array.from(new Set([props.valueFormat, timeFormat.value, props.format, defaultTimeFormat, 'HH:mm', 'HH', 'H:mm:ss', 'H:mm', default12HourFormat, 'h:mm A', 'h:mm a', 'h:mm:ss a', 'YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm'].filter(Boolean) as string[]))
}

function parseWithKnownFormats(value: string, formats: string[]) {
  for (const format of formats) {
    const parsed = dayjs(value, format, true)
    if (parsed.isValid()) return parsed
  }
  const looseParsed = dayjs(value)
  return looseParsed.isValid() ? looseParsed : null
}

function parseLooseValue(value: TimePickerModelValue) {
  if (value === undefined || value === null || value === '') return null
  if (dayjs.isDayjs(value)) return value.isValid() ? normalizeTime(value) : null
  if (value instanceof Date || typeof value === 'number') {
    const parsed = dayjs(value)
    return parsed.isValid() ? normalizeTime(parsed) : null
  }
  if (typeof value === 'string') {
    const parsed = parseWithKnownFormats(value, getCandidateFormats())
    return parsed ? normalizeTime(parsed) : null
  }
  return null
}

function normalizeModelRange(value: TimeRangePickerModelValue): [Dayjs | null, Dayjs | null] {
  if (!Array.isArray(value)) return [null, null]
  return [parseLooseValue(value[0]), parseLooseValue(value[1])]
}

function normalizeTime(value: Dayjs) {
  let nextValue = value.millisecond(0)
  if (!hasMinuteColumn.value) nextValue = nextValue.minute(0)
  if (!hasSecondColumn.value) nextValue = nextValue.second(0)
  return nextValue
}

function getSourceModelValue(index: 0 | 1) {
  return Array.isArray(props.modelValue) ? props.modelValue[index] : undefined
}

function formatOutputValue(value: Dayjs, index: 0 | 1) {
  const normalizedValue = normalizeTime(value)
  if (props.valueFormat) return normalizedValue.format(props.valueFormat)
  const sourceValue = getSourceModelValue(index)
  if (dayjs.isDayjs(sourceValue)) return normalizedValue
  if (sourceValue instanceof Date) return normalizedValue.toDate()
  if (typeof sourceValue === 'number') return normalizedValue.valueOf()
  return normalizedValue.format(timeFormat.value)
}

function createSteppedRange(min: number, max: number, step: number | undefined) {
  const safeStep = Number.isFinite(step) && step && step > 0 ? Math.floor(step) : 1
  const values: number[] = []
  for (let value = min; value <= max; value += safeStep) values.push(value)
  return values
}

function withCurrentTimeValue(options: number[], current: number, max: number) {
  const normalizedCurrent = Math.min(max, Math.max(0, current))
  if (options.includes(normalizedCurrent)) return options
  return [...options, normalizedCurrent].sort((a, b) => a - b)
}

function to12Hour(hour: number) {
  return hour % 12 || 12
}

function to24Hour(hour: number, meridiem: Meridiem) {
  if (!props.use12Hours && !hasMeridiemColumn.value) return hour
  if (meridiem === 'pm') return hour === 12 ? 12 : hour + 12
  return hour === 12 ? 0 : hour
}

function getSourceValue(side: TimeRangePickerSide) {
  return side === 'start' ? currentStartValue.value : currentEndValue.value
}

function getMeridiem(side: TimeRangePickerSide): Meridiem {
  return getSourceValue(side).hour() >= 12 ? 'pm' : 'am'
}

function getCandidate(side: TimeRangePickerSide, unit: TimeColumn, value: number | Meridiem) {
  const base = getSourceValue(side)
  if (unit === 'hour' && typeof value === 'number') return normalizeTime(base.hour(to24Hour(value, getMeridiem(side))))
  if (unit === 'minute' && typeof value === 'number') return normalizeTime(base.minute(value))
  if (unit === 'second' && typeof value === 'number') return normalizeTime(base.second(value))
  if (unit === 'meridiem' && typeof value === 'string') {
    const hour = base.hour()
    if (value === 'pm' && hour < 12) return normalizeTime(base.hour(hour + 12))
    if (value === 'am' && hour >= 12) return normalizeTime(base.hour(hour - 12))
  }
  return normalizeTime(base)
}

function getDisabledTimeOptions(value: Dayjs, side: TimeRangePickerSide) {
  return props.disabledTime?.(value, side) ?? {}
}

function isCandidateDisabled(value: Dayjs, side: TimeRangePickerSide) {
  const options = getDisabledTimeOptions(value, side)
  if (options.disabledHours?.().includes(value.hour())) return true
  if (options.disabledMinutes?.(value.hour()).includes(value.minute())) return true
  if (hasSecondColumn.value && options.disabledSeconds?.(value.hour(), value.minute()).includes(value.second())) return true
  return false
}

function isTimeOptionDisabled(side: TimeRangePickerSide, unit: TimePickerUnit, value: number) {
  const candidate = getCandidate(side, unit, value)
  if (unit === 'hour') return Boolean(getDisabledTimeOptions(candidate, side).disabledHours?.().includes(candidate.hour()))
  if (unit === 'minute') return Boolean(getDisabledTimeOptions(candidate, side).disabledMinutes?.(candidate.hour()).includes(candidate.minute()))
  return Boolean(getDisabledTimeOptions(candidate, side).disabledSeconds?.(candidate.hour(), candidate.minute()).includes(candidate.second()))
}

function getTimeOptions(side: TimeRangePickerSide, unit: TimePickerUnit): TimeOption[] {
  const source = getSourceValue(side)
  let values: number[]
  let current: number
  let max: number
  if (unit === 'hour') {
    current = props.use12Hours ? to12Hour(source.hour()) : source.hour()
    max = props.use12Hours ? 12 : 23
    values = props.use12Hours ? createSteppedRange(1, 12, props.hourStep) : createSteppedRange(0, 23, props.hourStep)
  } else if (unit === 'minute') {
    current = source.minute()
    max = 59
    values = createSteppedRange(0, 59, props.minuteStep)
  } else {
    current = source.second()
    max = 59
    values = createSteppedRange(0, 59, props.secondStep)
  }
  return withCurrentTimeValue(values, current, max)
    .map((value) => ({
      value,
      label: String(value).padStart(2, '0'),
      disabled: isTimeOptionDisabled(side, unit, value)
    }))
    .filter((option) => !(props.hideDisabledOptions && option.disabled))
}

function getMeridiemOptions(side: TimeRangePickerSide) {
  return [
    { value: 'am' as const, label: 'AM', disabled: isCandidateDisabled(getCandidate(side, 'meridiem', 'am'), side) },
    { value: 'pm' as const, label: 'PM', disabled: isCandidateDisabled(getCandidate(side, 'meridiem', 'pm'), side) }
  ]
}

function isSameTime(side: TimeRangePickerSide, unit: TimeColumn, value: number | Meridiem) {
  const source = getSourceValue(side)
  if (unit === 'hour' && typeof value === 'number') return props.use12Hours ? to12Hour(source.hour()) === value : source.hour() === value
  if (unit === 'minute' && typeof value === 'number') return source.minute() === value
  if (unit === 'second' && typeof value === 'number') return source.second() === value
  if (unit === 'meridiem') return getMeridiem(side) === value
  return false
}

function getRangeSeconds(value: Dayjs) {
  return value.hour() * 60 * 60 + value.minute() * 60 + value.second()
}

function getAutoEndDayOffset(startValue: Dayjs | null, endValue: Dayjs | null): TimeRangePickerDayOffset {
  if (!startValue || !endValue) return 0
  return getRangeSeconds(endValue) < getRangeSeconds(startValue) ? 1 : 0
}

function createRangeInfo(endDayOffset: TimeRangePickerDayOffset): TimeRangePickerChangeInfo {
  return {
    endDayOffset,
    crossesDay: endDayOffset === 1
  }
}

function getPendingOutputValue(): TimeRangePickerEmitValue {
  if (!pendingStartValue.value && !pendingEndValue.value) return null
  return [pendingStartValue.value ? formatOutputValue(pendingStartValue.value, 0) : null, pendingEndValue.value ? formatOutputValue(pendingEndValue.value, 1) : null]
}

function getPendingTimeStrings(): [string, string] {
  return [pendingStartValue.value?.format(timeFormat.value) || '', pendingEndValue.value?.format(timeFormat.value) || '']
}

function emitCalendarChange() {
  emit('calendar-change', getPendingOutputValue(), getPendingTimeStrings(), currentRangeInfo.value)
}

function selectTime(side: TimeRangePickerSide, unit: TimeColumn, value: number | Meridiem) {
  const nextValue = getCandidate(side, unit, value)
  if (isCandidateDisabled(nextValue, side)) return
  if (side === 'start') {
    pendingStartValue.value = nextValue
  } else {
    pendingEndValue.value = nextValue
  }
  activeSide.value = side
  emitCalendarChange()
}

function pickNow() {
  const now = normalizeTime(dayjs())
  if (isCandidateDisabled(now, activeSide.value)) return
  if (activeSide.value === 'start') pendingStartValue.value = now
  else pendingEndValue.value = now
  emitCalendarChange()
  scrollSelectedTimeOptions()
}

function confirmPendingValue() {
  if (!canConfirm.value) return
  const outputValue = getPendingOutputValue()
  const timeStrings = getPendingTimeStrings()
  const info = currentRangeInfo.value
  emit('update:modelValue', outputValue)
  emit('change', outputValue, timeStrings, info)
  emit('ok', outputValue, timeStrings, info)
  open.value = false
}

function clear(event?: MouseEvent) {
  event?.stopPropagation()
  pendingStartValue.value = null
  pendingEndValue.value = null
  emit('update:modelValue', null)
  emit('change', null, ['', ''], createRangeInfo(0))
  emit('clear')
  open.value = false
}

function setOpen(value: boolean) {
  if (props.disabled) return
  open.value = value
}

function handleTriggerClick() {
  setOpen(!open.value)
}

function handleTriggerKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
    event.preventDefault()
    setOpen(true)
  } else if (event.key === 'Escape') {
    event.preventDefault()
    setOpen(false)
  }
}

function handleFocus(event: FocusEvent) {
  focused.value = true
  emit('focus', event)
}

function handleBlur(event: FocusEvent) {
  focused.value = false
  emit('blur', event)
}

function focus() {
  triggerRef.value?.focus()
}

function blur() {
  triggerRef.value?.blur()
}

function scrollSelectedTimeOptions() {
  void nextTick(() => {
    const columns = panelRef.value?.querySelectorAll<HTMLElement>('[data-ui-time-range-picker-scroll="true"]')
    columns?.forEach((column) => {
      const selectedOption = column.querySelector<HTMLElement>('[data-ui-time-range-picker-selected="true"]')
      if (!selectedOption) return
      const top = selectedOption.offsetTop - (column.clientHeight - selectedOption.clientHeight) / 2
      const nextTop = Math.max(0, top)
      if (typeof column.scrollTo === 'function') {
        column.scrollTo({ top: nextTop, behavior: 'auto' })
      } else {
        column.scrollTop = nextTop
      }
    })
  })
}

defineExpose({
  blur,
  clear,
  focus
})
</script>

<template>
  <Dropdown v-model:open="open" :width="dropdownWidth" :min-width="dropdownWidth" :focus-on-open="false" content-class="ui-timepicker-dropdown">
    <template #trigger>
      <div
        ref="triggerRef"
        v-bind="getUiExposeAttrs(attrs)"
        :class="wrapperClass"
        :style="attrs.style"
        data-ui-time-range-picker="true"
        :tabindex="disabled ? undefined : 0"
        role="combobox"
        :aria-expanded="open"
        aria-haspopup="dialog"
        @click.stop="handleTriggerClick"
        @keydown="handleTriggerKeydown"
        @focus="handleFocus"
        @blur="handleBlur"
      >
        <span :class="timePickerValue({ size })" class="flex min-w-0 items-center">
          <span class="min-w-0 flex-1 truncate" :class="startDisplayText ? 'text-primary' : 'text-tertiary/60'">{{ startDisplayText || placeholder[0] }}</span>
          <span :class="separatorIcon" class="mx-2 size-4 shrink-0 text-tertiary"></span>
          <span class="min-w-0 flex-1 truncate text-right" :class="endDisplayText ? 'text-primary' : 'text-tertiary/60'">{{ endDisplayText ? `${selectedEndDayOffset === 1 ? '次日 ' : ''}${endDisplayText}` : placeholder[1] }}</span>
        </span>
        <input v-if="name" type="hidden" :name="name" :value="hiddenInputValue" />
        <span class="flex shrink-0 items-center gap-1 pr-2 text-tertiary">
          <button
            v-if="showClearButton"
            type="button"
            aria-label="清空"
            class="flex size-4 items-center justify-center rounded-full bg-tertiary/90 text-tertiary/60 opacity-0 transition-all duration-150 hover:bg-tertiary hover:text-tertiary group-hover/ui-timepicker:opacity-100 group-focus-within/ui-timepicker:opacity-100"
            @click="clear"
          >
            <span :class="clearIcon" class="size-3"></span>
          </button>
          <span :class="suffixIcon" class="size-4"></span>
        </span>
      </div>
    </template>

    <div ref="panelRef" class="select-none bg-primary text-primary">
      <div class="grid grid-cols-2">
        <section class="min-w-0 border-r border-medium">
          <div class="flex h-10 items-center justify-between border-b border-medium px-3">
            <button type="button" class="rounded px-1 text-sm font-bold transition-colors hover:bg-secondary hover:text-brand" :class="activeSide === 'start' ? 'text-brand' : 'text-primary'" @click="activeSide = 'start'">开始时间</button>
          </div>
          <div class="grid" :style="panelGridStyle">
            <div v-if="hasHourColumn" class="min-w-0" :class="hasMinuteColumn || hasSecondColumn || hasMeridiemColumn ? 'border-r border-medium' : ''">
              <div class="h-8 border-b border-medium text-center text-xs/8 text-tertiary">时</div>
              <div class="max-h-[224px] overflow-y-auto p-1" data-ui-time-range-picker-scroll="true">
                <button
                  v-for="hour in getTimeOptions('start', 'hour')"
                  :key="hour.value"
                  type="button"
                  data-ui-time-range-picker-side="start"
                  data-ui-timepicker-unit="hour"
                  :data-ui-timepicker-value="hour.value"
                  :data-ui-time-range-picker-selected="isSameTime('start', 'hour', hour.value) ? 'true' : undefined"
                  :class="timePickerOption({ selected: isSameTime('start', 'hour', hour.value), disabled: hour.disabled })"
                  :disabled="hour.disabled"
                  @click="selectTime('start', 'hour', hour.value)"
                >
                  {{ hour.label }}
                </button>
              </div>
            </div>
            <div v-if="hasMinuteColumn" class="min-w-0" :class="hasSecondColumn || hasMeridiemColumn ? 'border-r border-medium' : ''">
              <div class="h-8 border-b border-medium text-center text-xs/8 text-tertiary">分</div>
              <div class="max-h-[224px] overflow-y-auto p-1" data-ui-time-range-picker-scroll="true">
                <button
                  v-for="minute in getTimeOptions('start', 'minute')"
                  :key="minute.value"
                  type="button"
                  data-ui-time-range-picker-side="start"
                  data-ui-timepicker-unit="minute"
                  :data-ui-timepicker-value="minute.value"
                  :data-ui-time-range-picker-selected="isSameTime('start', 'minute', minute.value) ? 'true' : undefined"
                  :class="timePickerOption({ selected: isSameTime('start', 'minute', minute.value), disabled: minute.disabled })"
                  :disabled="minute.disabled"
                  @click="selectTime('start', 'minute', minute.value)"
                >
                  {{ minute.label }}
                </button>
              </div>
            </div>
            <div v-if="hasSecondColumn" class="min-w-0" :class="hasMeridiemColumn ? 'border-r border-medium' : ''">
              <div class="h-8 border-b border-medium text-center text-xs/8 text-tertiary">秒</div>
              <div class="max-h-[224px] overflow-y-auto p-1" data-ui-time-range-picker-scroll="true">
                <button
                  v-for="second in getTimeOptions('start', 'second')"
                  :key="second.value"
                  type="button"
                  data-ui-time-range-picker-side="start"
                  data-ui-timepicker-unit="second"
                  :data-ui-timepicker-value="second.value"
                  :data-ui-time-range-picker-selected="isSameTime('start', 'second', second.value) ? 'true' : undefined"
                  :class="timePickerOption({ selected: isSameTime('start', 'second', second.value), disabled: second.disabled })"
                  :disabled="second.disabled"
                  @click="selectTime('start', 'second', second.value)"
                >
                  {{ second.label }}
                </button>
              </div>
            </div>
            <div v-if="hasMeridiemColumn" class="min-w-0">
              <div class="h-8 border-b border-medium text-center text-xs/8 text-tertiary">午别</div>
              <div class="max-h-[224px] overflow-y-auto p-1" data-ui-time-range-picker-scroll="true">
                <button
                  v-for="item in getMeridiemOptions('start')"
                  :key="item.value"
                  type="button"
                  data-ui-time-range-picker-side="start"
                  data-ui-timepicker-unit="meridiem"
                  :data-ui-timepicker-value="item.value"
                  :data-ui-time-range-picker-selected="isSameTime('start', 'meridiem', item.value) ? 'true' : undefined"
                  :class="timePickerOption({ selected: isSameTime('start', 'meridiem', item.value), disabled: item.disabled })"
                  :disabled="item.disabled"
                  @click="selectTime('start', 'meridiem', item.value)"
                >
                  {{ item.label }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section class="min-w-0">
          <div class="flex h-10 items-center justify-between gap-2 border-b border-medium px-3">
            <button type="button" class="rounded px-1 text-sm font-bold transition-colors hover:bg-secondary hover:text-brand" :class="activeSide === 'end' ? 'text-brand' : 'text-primary'" @click="activeSide = 'end'">结束时间</button>
            <span v-if="pendingEndDayOffset === 1" class="rounded border border-medium px-2 py-1 text-xs text-brand-500">次日</span>
          </div>
          <div class="grid" :style="panelGridStyle">
            <div v-if="hasHourColumn" class="min-w-0" :class="hasMinuteColumn || hasSecondColumn || hasMeridiemColumn ? 'border-r border-medium' : ''">
              <div class="h-8 border-b border-medium text-center text-xs/8 text-tertiary">时</div>
              <div class="max-h-[224px] overflow-y-auto p-1" data-ui-time-range-picker-scroll="true">
                <button
                  v-for="hour in getTimeOptions('end', 'hour')"
                  :key="hour.value"
                  type="button"
                  data-ui-time-range-picker-side="end"
                  data-ui-timepicker-unit="hour"
                  :data-ui-timepicker-value="hour.value"
                  :data-ui-time-range-picker-selected="isSameTime('end', 'hour', hour.value) ? 'true' : undefined"
                  :class="timePickerOption({ selected: isSameTime('end', 'hour', hour.value), disabled: hour.disabled })"
                  :disabled="hour.disabled"
                  @click="selectTime('end', 'hour', hour.value)"
                >
                  {{ hour.label }}
                </button>
              </div>
            </div>
            <div v-if="hasMinuteColumn" class="min-w-0" :class="hasSecondColumn || hasMeridiemColumn ? 'border-r border-medium' : ''">
              <div class="h-8 border-b border-medium text-center text-xs/8 text-tertiary">分</div>
              <div class="max-h-[224px] overflow-y-auto p-1" data-ui-time-range-picker-scroll="true">
                <button
                  v-for="minute in getTimeOptions('end', 'minute')"
                  :key="minute.value"
                  type="button"
                  data-ui-time-range-picker-side="end"
                  data-ui-timepicker-unit="minute"
                  :data-ui-timepicker-value="minute.value"
                  :data-ui-time-range-picker-selected="isSameTime('end', 'minute', minute.value) ? 'true' : undefined"
                  :class="timePickerOption({ selected: isSameTime('end', 'minute', minute.value), disabled: minute.disabled })"
                  :disabled="minute.disabled"
                  @click="selectTime('end', 'minute', minute.value)"
                >
                  {{ minute.label }}
                </button>
              </div>
            </div>
            <div v-if="hasSecondColumn" class="min-w-0" :class="hasMeridiemColumn ? 'border-r border-medium' : ''">
              <div class="h-8 border-b border-medium text-center text-xs/8 text-tertiary">秒</div>
              <div class="max-h-[224px] overflow-y-auto p-1" data-ui-time-range-picker-scroll="true">
                <button
                  v-for="second in getTimeOptions('end', 'second')"
                  :key="second.value"
                  type="button"
                  data-ui-time-range-picker-side="end"
                  data-ui-timepicker-unit="second"
                  :data-ui-timepicker-value="second.value"
                  :data-ui-time-range-picker-selected="isSameTime('end', 'second', second.value) ? 'true' : undefined"
                  :class="timePickerOption({ selected: isSameTime('end', 'second', second.value), disabled: second.disabled })"
                  :disabled="second.disabled"
                  @click="selectTime('end', 'second', second.value)"
                >
                  {{ second.label }}
                </button>
              </div>
            </div>
            <div v-if="hasMeridiemColumn" class="min-w-0">
              <div class="h-8 border-b border-medium text-center text-xs/8 text-tertiary">午别</div>
              <div class="max-h-[224px] overflow-y-auto p-1" data-ui-time-range-picker-scroll="true">
                <button
                  v-for="item in getMeridiemOptions('end')"
                  :key="item.value"
                  type="button"
                  data-ui-time-range-picker-side="end"
                  data-ui-timepicker-unit="meridiem"
                  :data-ui-timepicker-value="item.value"
                  :data-ui-time-range-picker-selected="isSameTime('end', 'meridiem', item.value) ? 'true' : undefined"
                  :class="timePickerOption({ selected: isSameTime('end', 'meridiem', item.value), disabled: item.disabled })"
                  :disabled="item.disabled"
                  @click="selectTime('end', 'meridiem', item.value)"
                >
                  {{ item.label }}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div class="flex min-h-11 items-center justify-between gap-3 border-t border-medium px-3 py-2">
        <button type="button" class="text-xs text-brand-500 transition-colors hover:text-brand-600" @click="pickNow">此刻</button>
        <div class="flex min-w-0 items-center justify-end gap-2">
          <span class="min-w-0 truncate font-mono text-xs text-tertiary">{{ getPendingTimeStrings()[0] || placeholder[0] }} - {{ pendingEndDayOffset === 1 ? '次日 ' : '' }}{{ getPendingTimeStrings()[1] || placeholder[1] }}</span>
          <Button size="sm" :disabled="!canConfirm" @click="confirmPendingValue">确定</Button>
        </div>
      </div>
    </div>
  </Dropdown>
</template>
