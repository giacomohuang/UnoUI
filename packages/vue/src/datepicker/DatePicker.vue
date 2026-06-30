<script setup lang="ts">
import { clsx } from 'clsx'
import dayjs, { type Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { computed, nextTick, ref, useAttrs, watch } from 'vue'

import { getUiExposeAttrs } from '../attrs'
import { Button } from '../button'
import { Dropdown } from '../dropdown'

import { datePickerCell, datePickerPanelCell, datePickerTimeOption, datePickerValue, datePickerWrapper, type DatePickerDisabledDate, type DatePickerModelValue, type DatePickerPicker, type DatePickerProps, type DatePickerShowTimeOptions } from '.'

dayjs.extend(customParseFormat)

defineOptions({
  inheritAttrs: false
})

interface CalendarCell {
  date: Dayjs
  key: string
  inMonth: boolean
  selected: boolean
  today: boolean
  disabled: boolean
}

type DatePickerEmitValue = Exclude<DatePickerModelValue, undefined>
type TimeUnit = 'hour' | 'minute' | 'second'
type DatePickerPanelMode = DatePickerPicker

interface PanelCell {
  date: Dayjs
  key: string
  label: string
  selected: boolean
  current: boolean
  disabled: boolean
  muted?: boolean
}

const props = withDefaults(
  defineProps<{
    /** modelValue 是 v-model 绑定值，支持 string、number、Date、Dayjs、null。 */
    modelValue?: DatePickerModelValue
    /** picker 是面板类型，可选 date/month/year。 */
    picker?: DatePickerPicker
    /** format 是展示格式，未传时日期默认 YYYY-MM-DD，日期时间默认 YYYY-MM-DD HH:mm:ss。 */
    format?: string
    /** valueFormat 是提交字符串格式；未传时优先保持传入值类型。 */
    valueFormat?: string
    /** placeholder 是无值时的占位文案。 */
    placeholder?: string
    /** size 是选择器尺寸，可选，默认 md，并与 Input/Button 高度对齐。 */
    size?: DatePickerProps['size']
    /** disabled 表示是否禁用选择器交互。 */
    disabled?: boolean
    /** clearable 表示是否允许一键清空。 */
    clearable?: boolean
    /** showTime 表示是否显示时间选择面板，可传入时间格式和步长配置。 */
    showTime?: boolean | DatePickerShowTimeOptions
    /** disabledDate 用于禁用不可选日期。 */
    disabledDate?: DatePickerDisabledDate
    /** minDate 是最小可选日期或日期时间。 */
    minDate?: DatePickerModelValue
    /** maxDate 是最大可选日期或日期时间。 */
    maxDate?: DatePickerModelValue
    /** suffixIcon 是右侧日历图标类名。 */
    suffixIcon?: string
    /** clearIcon 是清空按钮图标类名。 */
    clearIcon?: string
    /** teleportedWidth 是下拉层固定宽度，默认随 showTime 自动选择。 */
    teleportedWidth?: string
    /** name 是隐藏 input 的原生 name，便于表单提交。 */
    name?: string
  }>(),
  {
    modelValue: undefined,
    picker: 'date',
    format: undefined,
    valueFormat: undefined,
    placeholder: undefined,
    size: 'md',
    disabled: false,
    clearable: false,
    showTime: false,
    disabledDate: undefined,
    minDate: undefined,
    maxDate: undefined,
    suffixIcon: 'i-lucide:calendar-days',
    clearIcon: 'i-lucide:x',
    teleportedWidth: undefined,
    name: undefined
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: DatePickerEmitValue): void
  (e: 'change', value: DatePickerEmitValue, dateString: string): void
  (e: 'clear'): void
  (e: 'ok', value: DatePickerEmitValue, dateString: string): void
  (e: 'visible-change', value: boolean): void
  (e: 'panel-change', value: Dayjs): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}>()

const attrs = useAttrs()
const open = ref(false)
const focused = ref(false)
const pendingValue = ref<Dayjs | null>(null)
const panelDate = ref(dayjs().startOf('month'))
const panelMode = ref<DatePickerPanelMode>('date')
const triggerRef = ref<HTMLElement | null>(null)

const weekLabels = ['一', '二', '三', '四', '五', '六', '日']
const defaultDateFormat = 'YYYY-MM-DD'
const defaultMonthFormat = 'YYYY-MM'
const defaultYearFormat = 'YYYY'
const defaultTimeFormat = 'HH:mm:ss'
const panelNavButtonClass = 'flex size-7 items-center justify-center rounded text-tertiary transition-colors hover:bg-secondary hover:text-primary'

const hasShowTime = computed(() => Boolean(props.showTime))
const normalizedShowTime = computed<DatePickerShowTimeOptions>(() => (typeof props.showTime === 'object' ? props.showTime : {}))
const timeFormat = computed(() => normalizedShowTime.value.format || defaultTimeFormat)
const normalizedPicker = computed<DatePickerPicker>(() => props.picker || 'date')
const pickerBaseFormat = computed(() => {
  if (normalizedPicker.value === 'year') return defaultYearFormat
  if (normalizedPicker.value === 'month') return defaultMonthFormat
  return defaultDateFormat
})
const effectiveShowTime = computed(() => normalizedPicker.value === 'date' && hasShowTime.value)
const displayFormat = computed(() => props.format || (effectiveShowTime.value ? `${defaultDateFormat} ${timeFormat.value}` : pickerBaseFormat.value))
const placeholderText = computed(() => {
  if (props.placeholder) return props.placeholder
  if (effectiveShowTime.value) return '请选择日期时间'
  if (normalizedPicker.value === 'year') return '请选择年份'
  if (normalizedPicker.value === 'month') return '请选择月份'
  return '请选择日期'
})
const showSecondColumn = computed(() => normalizedShowTime.value.showSecond ?? timeFormat.value.includes('ss'))
const dropdownWidth = computed(() => props.teleportedWidth || (effectiveShowTime.value ? '456px' : '320px'))
const selectedValue = computed(() => parseModelValue(props.modelValue))
const displayText = computed(() => selectedValue.value?.format(displayFormat.value) || '')
const hiddenInputValue = computed(() => selectedValue.value?.format(props.valueFormat || displayFormat.value) || '')
const hasValue = computed(() => Boolean(selectedValue.value))
const showClearButton = computed(() => props.clearable && hasValue.value && !props.disabled)
const panelSelectedValue = computed(() => pendingValue.value || selectedValue.value)
const minDateValue = computed(() => parseLooseValue(props.minDate))
const maxDateValue = computed(() => parseLooseValue(props.maxDate))
const currentTimeSource = computed(() => pendingValue.value || selectedValue.value || dayjs())
const todayShortcutDisabled = computed(() => isCandidateDisabled(dayjs()))
const panelTitle = computed(() => {
  if (panelMode.value === 'year') {
    const startYear = getYearPanelStart(panelDate.value)
    return `${startYear} - ${startYear + 11}`
  }
  if (panelMode.value === 'month') return panelDate.value.format('YYYY年')
  return panelDate.value.format('YYYY年M月')
})
const panelYearTitle = computed(() => panelDate.value.format('YYYY年'))
const panelMonthTitle = computed(() => panelDate.value.format('M月'))

const wrapperClass = computed(() =>
  clsx(
    attrs.class as string | undefined,
    datePickerWrapper({
      size: props.size,
      focused: open.value || focused.value,
      disabled: props.disabled
    })
  )
)

const calendarCells = computed<CalendarCell[]>(() => {
  const monthStart = panelDate.value.startOf('month')
  const startDate = getWeekStart(monthStart)
  const selected = panelSelectedValue.value

  return Array.from({ length: 42 }, (_, index) => {
    const date = startDate.add(index, 'day')
    return {
      date,
      key: date.format('YYYY-MM-DD'),
      inMonth: date.month() === panelDate.value.month(),
      selected: Boolean(selected?.isSame(date, 'day')),
      today: date.isSame(dayjs(), 'day'),
      disabled: isDateDisabled(date)
    }
  })
})

const monthCells = computed<PanelCell[]>(() => {
  const selected = panelSelectedValue.value
  const current = dayjs()

  return Array.from({ length: 12 }, (_, index) => {
    const date = panelDate.value.month(index).startOf('month')
    return {
      date,
      key: date.format('YYYY-MM'),
      label: `${index + 1}月`,
      selected: Boolean(selected?.isSame(date, 'month')),
      current: current.isSame(date, 'month'),
      disabled: isMonthDisabled(date)
    }
  })
})

const yearCells = computed<PanelCell[]>(() => {
  const selected = panelSelectedValue.value
  const current = dayjs()
  const startYear = getYearPanelStart(panelDate.value)

  return Array.from({ length: 12 }, (_, index) => {
    const date = panelDate.value.year(startYear + index).startOf('year')
    return {
      date,
      key: date.format('YYYY'),
      label: date.format('YYYY'),
      selected: Boolean(selected?.isSame(date, 'year')),
      current: current.isSame(date, 'year'),
      disabled: isYearDisabled(date)
    }
  })
})

const hourOptions = computed(() => withCurrentTimeValue(createTimeRange(normalizedShowTime.value.hourStep, 23), currentTimeSource.value.hour(), 23))
const minuteOptions = computed(() => withCurrentTimeValue(createTimeRange(normalizedShowTime.value.minuteStep, 59), currentTimeSource.value.minute(), 59))
const secondOptions = computed(() => withCurrentTimeValue(createTimeRange(normalizedShowTime.value.secondStep, 59), currentTimeSource.value.second(), 59))

watch(
  () => props.modelValue,
  () => {
    const parsed = selectedValue.value
    if (!open.value) {
      pendingValue.value = parsed
      panelDate.value = (parsed || panelDate.value || dayjs()).startOf('month')
    }
  },
  { immediate: true }
)

watch(open, (value) => {
  emit('visible-change', value)
  if (value) {
    pendingValue.value = selectedValue.value
    panelDate.value = (selectedValue.value || pendingValue.value || dayjs()).startOf('month')
    panelMode.value = normalizedPicker.value
  }
})

function parseWithKnownFormats(value: string, formats: string[]) {
  for (const format of formats) {
    const parsed = dayjs(value, format, true)
    if (parsed.isValid()) return parsed
  }
  const looseParsed = dayjs(value)
  return looseParsed.isValid() ? looseParsed : null
}

function getCandidateFormats() {
  return Array.from(new Set([props.valueFormat, displayFormat.value, props.format, `${defaultDateFormat} ${defaultTimeFormat}`, `${defaultDateFormat} HH:mm`, defaultDateFormat, defaultMonthFormat, defaultYearFormat, 'YYYY/MM/DD HH:mm:ss', 'YYYY/MM/DD', 'YYYY/MM'].filter(Boolean) as string[]))
}

function parseLooseValue(value: DatePickerModelValue) {
  if (value === undefined || value === null || value === '') return null
  if (dayjs.isDayjs(value)) return value.isValid() ? value.millisecond(0) : null
  if (value instanceof Date || typeof value === 'number') {
    const parsed = dayjs(value)
    return parsed.isValid() ? parsed.millisecond(0) : null
  }
  if (typeof value === 'string') return parseWithKnownFormats(value, getCandidateFormats())?.millisecond(0) ?? null
  return null
}

function parseModelValue(value: DatePickerModelValue) {
  return parseLooseValue(value)
}

function formatOutputValue(value: Dayjs): DatePickerEmitValue {
  const normalizedValue = value.millisecond(0)
  if (props.valueFormat) return normalizedValue.format(props.valueFormat)
  if (dayjs.isDayjs(props.modelValue)) return normalizedValue
  if (props.modelValue instanceof Date) return normalizedValue.toDate()
  if (typeof props.modelValue === 'number') return normalizedValue.valueOf()
  return normalizedValue.format(displayFormat.value)
}

function getWeekStart(value: Dayjs) {
  const day = value.day()
  const diff = day === 0 ? 6 : day - 1
  return value.subtract(diff, 'day').startOf('day')
}

function getYearPanelStart(value: Dayjs) {
  return Math.floor(value.year() / 12) * 12
}

function createTimeRange(step: number | undefined, max: number) {
  const safeStep = Number.isFinite(step) && step && step > 0 ? Math.floor(step) : 1
  const values: number[] = []
  for (let value = 0; value <= max; value += safeStep) values.push(value)
  return values
}

function withCurrentTimeValue(options: number[], current: number, max: number) {
  const normalizedCurrent = Math.min(max, Math.max(0, current))
  if (options.includes(normalizedCurrent)) return options
  return [...options, normalizedCurrent].sort((a, b) => a - b)
}

function isDateDisabled(date: Dayjs) {
  if (props.disabledDate?.(date)) return true
  if (minDateValue.value && date.isBefore(minDateValue.value, 'day')) return true
  if (maxDateValue.value && date.isAfter(maxDateValue.value, 'day')) return true
  return false
}

function isMonthDisabled(date: Dayjs) {
  const start = date.startOf('month')
  const end = date.endOf('month')
  if (minDateValue.value && end.isBefore(minDateValue.value, 'day')) return true
  if (maxDateValue.value && start.isAfter(maxDateValue.value, 'day')) return true
  return Boolean(props.disabledDate?.(start) && props.disabledDate?.(end))
}

function isYearDisabled(date: Dayjs) {
  const start = date.startOf('year')
  const end = date.endOf('year')
  if (minDateValue.value && end.isBefore(minDateValue.value, 'day')) return true
  if (maxDateValue.value && start.isAfter(maxDateValue.value, 'day')) return true
  return Boolean(props.disabledDate?.(start) && props.disabledDate?.(end))
}

function isCandidateDisabled(date: Dayjs) {
  if (normalizedPicker.value === 'year') return isYearDisabled(date)
  if (normalizedPicker.value === 'month') return isMonthDisabled(date)
  return isDateDisabled(date)
}

function isTimeOptionDisabled(unit: TimeUnit, value: number) {
  if (!effectiveShowTime.value) return false
  const base = currentTimeSource.value
  let candidate = base
  if (unit === 'hour') candidate = base.hour(value)
  if (unit === 'minute') candidate = base.minute(value)
  if (unit === 'second') candidate = base.second(value)

  if (minDateValue.value && candidate.isBefore(minDateValue.value)) return true
  if (maxDateValue.value && candidate.isAfter(maxDateValue.value)) return true
  return false
}

function normalizeCandidate(value: Dayjs) {
  if (normalizedPicker.value === 'year' && isYearDisabled(value)) return null
  if (normalizedPicker.value === 'month' && isMonthDisabled(value)) return null
  if (normalizedPicker.value === 'date' && isDateDisabled(value)) return null

  let nextValue = value
  if (normalizedPicker.value === 'year') nextValue = value.startOf('year')
  else if (normalizedPicker.value === 'month') nextValue = value.startOf('month')
  else if (!effectiveShowTime.value) nextValue = value.startOf('day')

  if (effectiveShowTime.value) {
    if (minDateValue.value && nextValue.isBefore(minDateValue.value)) nextValue = minDateValue.value
    if (maxDateValue.value && nextValue.isAfter(maxDateValue.value)) nextValue = maxDateValue.value
  }

  return nextValue.millisecond(0)
}

function emitValue(value: Dayjs, closePanel: boolean, emitOk = false) {
  const normalizedValue = normalizeCandidate(value)
  if (!normalizedValue) return

  const outputValue = formatOutputValue(normalizedValue)
  const dateString = normalizedValue.format(displayFormat.value)
  pendingValue.value = normalizedValue
  panelDate.value = normalizedValue.startOf('month')
  emit('update:modelValue', outputValue)
  emit('change', outputValue, dateString)
  if (emitOk) emit('ok', outputValue, dateString)
  if (closePanel) open.value = false
}

function clear(event?: MouseEvent) {
  event?.stopPropagation()
  if (!showClearButton.value) return
  pendingValue.value = null
  emit('update:modelValue', null)
  emit('change', null, '')
  emit('clear')
}

function setOpen(value: boolean) {
  if (props.disabled) return
  open.value = value
}

function handleTriggerClick() {
  setOpen(true)
}

function handleTriggerKeydown(event: KeyboardEvent) {
  if (props.disabled) return
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    setOpen(!open.value)
  } else if (event.key === 'Escape') {
    open.value = false
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    setOpen(true)
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

function changePanelMonth(offset: number) {
  if (panelMode.value !== 'date') return
  panelDate.value = panelDate.value.add(offset, 'month')
  emit('panel-change', panelDate.value)
}

function changePanelYear(offset: number) {
  panelDate.value = panelDate.value.add(panelMode.value === 'year' ? offset * 12 : offset, 'year')
  emit('panel-change', panelDate.value)
}

function openPanelMode(mode: DatePickerPanelMode) {
  if (mode === panelMode.value) return
  panelMode.value = mode
}

function pickDate(date: Dayjs) {
  if (isDateDisabled(date)) return
  const base = currentTimeSource.value
  const nextValue = date.hour(base.hour()).minute(base.minute()).second(showSecondColumn.value ? base.second() : 0).millisecond(0)

  if (effectiveShowTime.value) {
    pendingValue.value = normalizeCandidate(nextValue)
    return
  }

  emitValue(nextValue, true)
}

function pickMonth(date: Dayjs) {
  if (isMonthDisabled(date)) return
  if (normalizedPicker.value === 'date') {
    panelDate.value = panelDate.value.year(date.year()).month(date.month()).startOf('month')
    panelMode.value = 'date'
    emit('panel-change', panelDate.value)
    return
  }
  emitValue(date, true)
}

function pickYear(date: Dayjs) {
  if (isYearDisabled(date)) return
  if (normalizedPicker.value !== 'year') {
    panelDate.value = panelDate.value.year(date.year()).startOf('month')
    panelMode.value = 'month'
    emit('panel-change', panelDate.value)
    return
  }
  emitValue(date, true)
}

function selectTime(unit: TimeUnit, value: number) {
  if (isTimeOptionDisabled(unit, value)) return
  const base = pendingValue.value || selectedValue.value || dayjs()
  let nextValue = base
  if (unit === 'hour') nextValue = base.hour(value)
  if (unit === 'minute') nextValue = base.minute(value)
  if (unit === 'second') nextValue = base.second(value)
  pendingValue.value = normalizeCandidate(nextValue) || nextValue
}

function pickToday() {
  const now = dayjs().millisecond(0)
  if (effectiveShowTime.value) {
    pendingValue.value = normalizeCandidate(now)
    panelDate.value = now.startOf('month')
    return
  }
  emitValue(now, true)
}

function confirmPendingValue() {
  const nextValue = pendingValue.value || selectedValue.value || dayjs()
  emitValue(nextValue, true, true)
}

function isSameTime(unit: TimeUnit, value: number) {
  const source = currentTimeSource.value
  if (unit === 'hour') return source.hour() === value
  if (unit === 'minute') return source.minute() === value
  return source.second() === value
}

function getCellClass(cell: CalendarCell) {
  return datePickerCell({
    inMonth: cell.inMonth,
    selected: cell.selected,
    today: cell.today,
    disabled: cell.disabled
  })
}

function getPanelCellClass(cell: PanelCell) {
  return datePickerPanelCell({
    selected: cell.selected,
    current: cell.current,
    disabled: cell.disabled,
    muted: cell.muted
  })
}

function focus() {
  triggerRef.value?.focus()
}

function blur() {
  triggerRef.value?.blur()
}

watch(
  () => [effectiveShowTime.value, timeFormat.value],
  () => {
    void nextTick(() => {
      if (!effectiveShowTime.value && pendingValue.value) pendingValue.value = normalizeCandidate(pendingValue.value)
    })
  }
)

defineExpose({
  blur,
  clear,
  focus
})
</script>

<template>
  <Dropdown v-model:open="open" :width="dropdownWidth" :min-width="dropdownWidth" :focus-on-open="false" content-class="ui-datepicker-dropdown">
    <template #trigger>
      <div
        ref="triggerRef"
        v-bind="getUiExposeAttrs(attrs)"
        :class="wrapperClass"
        :style="attrs.style"
        data-ui-datepicker="true"
        :tabindex="disabled ? undefined : 0"
        role="combobox"
        :aria-expanded="open"
        aria-haspopup="dialog"
        @click.stop="handleTriggerClick"
        @keydown="handleTriggerKeydown"
        @focus="handleFocus"
        @blur="handleBlur"
      >
        <span :class="datePickerValue({ size })" :title="displayText">
          <span :class="displayText ? 'text-primary' : 'text-tertiary/60'">{{ displayText || placeholderText }}</span>
        </span>
        <input v-if="name" type="hidden" :name="name" :value="hiddenInputValue" />
        <span class="flex shrink-0 items-center gap-1 pr-2 text-tertiary">
          <button
            v-if="showClearButton"
            type="button"
            aria-label="清空"
            class="flex size-4 items-center justify-center rounded-full bg-tertiary/90 text-tertiary/60 opacity-0 transition-all duration-150 hover:bg-tertiary hover:text-tertiary group-hover/ui-datepicker:opacity-100 group-focus-within/ui-datepicker:opacity-100"
            @click="clear"
          >
            <span :class="clearIcon" class="size-3"></span>
          </button>
          <span :class="suffixIcon" class="size-4"></span>
        </span>
      </div>
    </template>

    <div class="select-none bg-primary text-primary">
      <div class="grid" :class="effectiveShowTime ? 'grid-cols-[minmax(0,1fr)_136px]' : 'grid-cols-1'">
        <div class="min-w-0">
          <div class="flex h-11 items-center justify-between gap-2 border-b border-medium px-2">
            <div class="flex items-center">
              <button type="button" :class="panelNavButtonClass" aria-label="上一年" @click="changePanelYear(-1)">
                <span class="i-lucide:chevrons-left size-4"></span>
              </button>
              <button v-if="panelMode === 'date'" type="button" :class="panelNavButtonClass" aria-label="上一月" @click="changePanelMonth(-1)">
                <span class="i-lucide:chevron-left size-4"></span>
              </button>
            </div>
            <div class="min-w-0 truncate text-sm font-bold text-primary">
              <template v-if="panelMode === 'date'">
                <button type="button" class="rounded px-1 transition-colors hover:bg-secondary hover:text-brand" @click="openPanelMode('year')">{{ panelYearTitle }}</button>
                <button type="button" class="rounded px-1 transition-colors hover:bg-secondary hover:text-brand" @click="openPanelMode('month')">{{ panelMonthTitle }}</button>
              </template>
              <button v-else-if="panelMode === 'month'" type="button" class="rounded px-1 transition-colors hover:bg-secondary hover:text-brand" @click="openPanelMode('year')">{{ panelTitle }}</button>
              <span v-else>{{ panelTitle }}</span>
            </div>
            <div class="flex items-center">
              <button v-if="panelMode === 'date'" type="button" :class="panelNavButtonClass" aria-label="下一月" @click="changePanelMonth(1)">
                <span class="i-lucide:chevron-right size-4"></span>
              </button>
              <button type="button" :class="panelNavButtonClass" aria-label="下一年" @click="changePanelYear(1)">
                <span class="i-lucide:chevrons-right size-4"></span>
              </button>
            </div>
          </div>

          <div v-if="panelMode === 'date'" class="grid grid-cols-7 gap-1 px-3 pb-2 pt-3">
            <div v-for="label in weekLabels" :key="label" class="flex h-6 items-center justify-center text-xs font-medium text-tertiary">{{ label }}</div>
            <button v-for="cell in calendarCells" :key="cell.key" type="button" :class="getCellClass(cell)" :disabled="cell.disabled" @click="pickDate(cell.date)">
              {{ cell.date.date() }}
            </button>
          </div>

          <div v-else-if="panelMode === 'month'" class="grid grid-cols-3 gap-2 p-3">
            <button v-for="cell in monthCells" :key="cell.key" type="button" :class="getPanelCellClass(cell)" :disabled="cell.disabled" @click="pickMonth(cell.date)">
              {{ cell.label }}
            </button>
          </div>

          <div v-else class="grid grid-cols-3 gap-2 p-3">
            <button v-for="cell in yearCells" :key="cell.key" type="button" :class="getPanelCellClass(cell)" :disabled="cell.disabled" @click="pickYear(cell.date)">
              {{ cell.label }}
            </button>
          </div>
        </div>

        <div v-if="effectiveShowTime" class="grid min-w-0 border-l border-medium" :class="showSecondColumn ? 'grid-cols-3' : 'grid-cols-2'">
          <div class="min-w-0 border-r border-medium">
            <div class="h-8 border-b border-medium text-center text-xs/8 text-tertiary">时</div>
            <div class="max-h-[254px] overflow-y-auto p-1">
              <button v-for="hour in hourOptions" :key="hour" type="button" :class="datePickerTimeOption({ selected: isSameTime('hour', hour), disabled: isTimeOptionDisabled('hour', hour) })" :disabled="isTimeOptionDisabled('hour', hour)" @click="selectTime('hour', hour)">
                {{ String(hour).padStart(2, '0') }}
              </button>
            </div>
          </div>
          <div class="min-w-0" :class="showSecondColumn ? 'border-r border-medium' : ''">
            <div class="h-8 border-b border-medium text-center text-xs/8 text-tertiary">分</div>
            <div class="max-h-[254px] overflow-y-auto p-1">
              <button v-for="minute in minuteOptions" :key="minute" type="button" :class="datePickerTimeOption({ selected: isSameTime('minute', minute), disabled: isTimeOptionDisabled('minute', minute) })" :disabled="isTimeOptionDisabled('minute', minute)" @click="selectTime('minute', minute)">
                {{ String(minute).padStart(2, '0') }}
              </button>
            </div>
          </div>
          <div v-if="showSecondColumn" class="min-w-0">
            <div class="h-8 border-b border-medium text-center text-xs/8 text-tertiary">秒</div>
            <div class="max-h-[254px] overflow-y-auto p-1">
              <button v-for="second in secondOptions" :key="second" type="button" :class="datePickerTimeOption({ selected: isSameTime('second', second), disabled: isTimeOptionDisabled('second', second) })" :disabled="isTimeOptionDisabled('second', second)" @click="selectTime('second', second)">
                {{ String(second).padStart(2, '0') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex min-h-11 items-center justify-between gap-3 border-t border-medium px-3 py-2">
        <button type="button" class="text-xs text-brand-500 transition-colors hover:text-brand-600 disabled:pointer-events-none disabled:opacity-40" :disabled="todayShortcutDisabled" @click="pickToday">
          {{ effectiveShowTime ? '此刻' : normalizedPicker === 'year' ? '今年' : normalizedPicker === 'month' ? '本月' : '今天' }}
        </button>
        <div class="flex min-w-0 items-center justify-end gap-2">
          <span v-if="effectiveShowTime" class="min-w-0 truncate font-mono text-xs text-tertiary">{{ (pendingValue || selectedValue || dayjs()).format(displayFormat) }}</span>
          <Button v-if="effectiveShowTime" size="sm" @click="confirmPendingValue">确定</Button>
        </div>
      </div>
    </div>
  </Dropdown>
</template>

<style>
.ui-datepicker-dropdown {
  transition-property: opacity, box-shadow, border-color, background-color;
}
</style>
