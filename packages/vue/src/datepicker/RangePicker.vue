<script setup lang="ts">
import { clsx } from 'clsx'
import dayjs, { type Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { computed, nextTick, ref, useAttrs, watch } from 'vue'

import { datePickerPanelCell, datePickerRangeCell, datePickerTimeOption, datePickerValue, datePickerWrapper, type DatePickerDisabledDate, type DatePickerModelValue, type DatePickerPicker, type DatePickerProps, type DatePickerShowTimeOptions, type RangePickerModelValue } from '.'
import { getUiExposeAttrs } from '../attrs'
import { Button } from '../button'
import { Dropdown } from '../dropdown'

dayjs.extend(customParseFormat)

defineOptions({
  inheritAttrs: false
})

type RangeSide = 'start' | 'end'
type RangePickerEmitValue = [DatePickerModelValue, DatePickerModelValue] | null
type RangePickerPanelMode = DatePickerPicker
type RangePanelSide = 'left' | 'right'
type TimeUnit = 'hour' | 'minute' | 'second'

interface RangeDateCell {
  date: Dayjs
  key: string
  inMonth: boolean
  selected: boolean
  inRange: boolean
  rangeStart: boolean
  rangeEnd: boolean
  standalone: boolean
  today: boolean
  disabled: boolean
}

interface RangePanelCell {
  date: Dayjs
  key: string
  label: string
  selected: boolean
  inRange: boolean
  rangeStart: boolean
  rangeEnd: boolean
  current: boolean
  disabled: boolean
}

const props = withDefaults(
  defineProps<{
    /** modelValue 是范围值，格式为 [start, end]。 */
    modelValue?: RangePickerModelValue
    /** picker 是面板类型，可选 date/month/year。 */
    picker?: DatePickerPicker
    /** format 是展示格式，未传时按 picker 自动选择。 */
    format?: string
    /** valueFormat 是提交字符串格式；未传时优先保持传入值类型。 */
    valueFormat?: string
    /** placeholder 是起止占位文案。 */
    placeholder?: [string, string]
    /** separatorIcon 是触发器内的范围连接图标类名。 */
    separatorIcon?: string
    /** size 是选择器尺寸，可选，默认 md，并与 Input/Button 高度对齐。 */
    size?: DatePickerProps['size']
    /** disabled 表示是否禁用选择器交互。 */
    disabled?: boolean
    /** clearable 表示是否允许一键清空。 */
    clearable?: boolean
    /** showTime 表示是否显示起止时间选择，可传入时间格式和步长配置。 */
    showTime?: boolean | DatePickerShowTimeOptions
    /** disabledDate 用于禁用不可选日期。 */
    disabledDate?: DatePickerDisabledDate
    /** minDate 是最小可选日期。 */
    minDate?: DatePickerModelValue
    /** maxDate 是最大可选日期。 */
    maxDate?: DatePickerModelValue
    /** suffixIcon 是右侧图标类名。 */
    suffixIcon?: string
    /** clearIcon 是清空按钮图标类名。 */
    clearIcon?: string
    /** teleportedWidth 是下拉层固定宽度。 */
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
    separatorIcon: 'i-ant-design:swap-right-outlined',
    size: 'md',
    disabled: false,
    clearable: false,
    showTime: false,
    disabledDate: undefined,
    minDate: undefined,
    maxDate: undefined,
    suffixIcon: 'i-lucide:calendar-range',
    clearIcon: 'i-lucide:x',
    teleportedWidth: undefined,
    name: undefined
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: RangePickerEmitValue): void
  (e: 'change', value: RangePickerEmitValue, dateString: [string, string]): void
  (e: 'clear'): void
  (e: 'ok', value: RangePickerEmitValue, dateString: [string, string]): void
  (e: 'visible-change', value: boolean): void
  (e: 'calendar-change', value: RangePickerEmitValue, dateString: [string, string]): void
  (e: 'panel-change', value: [Dayjs, Dayjs]): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}>()

const attrs = useAttrs()
const open = ref(false)
const focused = ref(false)
const activeSide = ref<RangeSide>('start')
const requestedSide = ref<RangeSide | null>(null)
const pendingRange = ref<[Dayjs | null, Dayjs | null]>([null, null])
const leftPanelDate = ref(dayjs().startOf('month'))
const rightPanelDate = ref(dayjs().add(1, 'month').startOf('month'))
const leftPanelMode = ref<RangePickerPanelMode>('date')
const rightPanelMode = ref<RangePickerPanelMode>('date')
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
const defaultPlaceholder = computed<[string, string]>(() => {
  if (effectiveShowTime.value) return ['开始日期时间', '结束日期时间']
  if (normalizedPicker.value === 'year') return ['开始年份', '结束年份']
  if (normalizedPicker.value === 'month') return ['开始月份', '结束月份']
  return ['开始日期', '结束日期']
})
const placeholderText = computed(() => props.placeholder || defaultPlaceholder.value)
const dropdownWidth = computed(() => props.teleportedWidth || (normalizedPicker.value === 'date' ? 'min(640px, calc(100vw - 24px))' : 'min(520px, calc(100vw - 24px))'))
const selectedRange = computed(() => parseRangeValue(props.modelValue))
const activeRange = computed(() => pendingRange.value)
const normalizedActiveRange = computed(() => normalizeRange(activeRange.value))
const displayRange = computed(() => (open.value ? pendingRange.value : selectedRange.value))
const hasValue = computed(() => Boolean(selectedRange.value[0] || selectedRange.value[1]))
const displayStartText = computed(() => displayRange.value[0]?.format(displayFormat.value) || '')
const displayEndText = computed(() => displayRange.value[1]?.format(displayFormat.value) || '')
const hiddenInputValue = computed(() => [displayStartText.value, displayEndText.value].filter(Boolean).join(','))
const showClearButton = computed(() => props.clearable && hasValue.value && !props.disabled)
const showSecondColumn = computed(() => normalizedShowTime.value.showSecond ?? timeFormat.value.includes('ss'))
const timeUnits = computed<TimeUnit[]>(() => (showSecondColumn.value ? ['hour', 'minute', 'second'] : ['hour', 'minute']))
const minDateValue = computed(() => parseLooseValue(props.minDate))
const maxDateValue = computed(() => parseLooseValue(props.maxDate))
const timeSelectionDisabled = computed(() => !pendingRange.value[getSideIndex(activeSide.value)])
const canConfirmSelection = computed(() => {
  const [start, end] = pendingRange.value
  return activeSide.value === 'start' ? Boolean(start) : Boolean(start && end)
})

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
const timeSideSizeClass = computed(() => {
  if (props.size === 'sm') return 'py-1 text-sm/5'
  if (props.size === 'lg') return 'py-1.5 text-base/6'
  return 'py-1.5 text-sm/5'
})

const panelDates = computed<[Dayjs, Dayjs]>(() => [leftPanelDate.value, rightPanelDate.value])
const leftPanelTitle = computed(() => getPanelTitle(leftPanelDate.value, leftPanelMode.value))
const rightPanelTitle = computed(() => getPanelTitle(rightPanelDate.value, rightPanelMode.value))
const leftPanelYearTitle = computed(() => leftPanelDate.value.format('YYYY年'))
const rightPanelYearTitle = computed(() => rightPanelDate.value.format('YYYY年'))
const leftPanelMonthTitle = computed(() => leftPanelDate.value.format('M月'))
const rightPanelMonthTitle = computed(() => rightPanelDate.value.format('M月'))
const leftDateCells = computed(() => createDateCells(leftPanelDate.value))
const rightDateCells = computed(() => createDateCells(rightPanelDate.value))
const leftMonthCells = computed(() => createMonthCells(leftPanelDate.value))
const rightMonthCells = computed(() => createMonthCells(rightPanelDate.value))
const leftYearCells = computed(() => createYearCells(leftPanelDate.value))
const rightYearCells = computed(() => createYearCells(rightPanelDate.value))

watch(
  () => props.modelValue,
  () => {
    const parsed = selectedRange.value
    if (!open.value) {
      pendingRange.value = parsed
      syncPanelsFromRange(parsed)
    }
  },
  { immediate: true }
)

watch(open, (value) => {
  emit('visible-change', value)
  if (value) {
    pendingRange.value = selectedRange.value
    activeSide.value = requestedSide.value || (selectedRange.value[0] && !selectedRange.value[1] ? 'end' : 'start')
    requestedSide.value = null
    syncPanelsFromRange(selectedRange.value)
    leftPanelMode.value = normalizedPicker.value
    rightPanelMode.value = normalizedPicker.value
    syncActivePanelFromSide()
    scrollSelectedTimeOptions()
  }
})

watch(activeSide, () => {
  if (!open.value) return
  syncActivePanelFromSide()
  if (effectiveShowTime.value) scrollSelectedTimeOptions()
})

function scrollSelectedTimeOptions() {
  void nextTick(() => {
    document.querySelectorAll<HTMLElement>('.ui-datepicker-dropdown [data-ui-range-picker-time-column]').forEach((column) => {
      const selected = column.querySelector<HTMLElement>('[data-ui-range-picker-time-selected="true"]')
      if (!selected) return
      column.scrollTop = Math.max(0, selected.offsetTop - column.clientHeight / 2 + selected.offsetHeight / 2)
    })
  })
}

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

function parseRangeValue(value: RangePickerModelValue): [Dayjs | null, Dayjs | null] {
  if (!Array.isArray(value)) return [null, null]
  return normalizeRange([parseLooseValue(value[0]), parseLooseValue(value[1])])
}

function normalizeRange(range: [Dayjs | null, Dayjs | null]): [Dayjs | null, Dayjs | null] {
  const [start, end] = range
  if (start && end && start.isAfter(end)) return [end, start]
  return [start, end]
}

function formatOutputValue(value: Dayjs, sourceValue: DatePickerModelValue): DatePickerModelValue {
  const normalizedValue = normalizeCandidate(value)
  if (!normalizedValue) return null
  if (props.valueFormat) return normalizedValue.format(props.valueFormat)
  if (dayjs.isDayjs(sourceValue)) return normalizedValue
  if (sourceValue instanceof Date) return normalizedValue.toDate()
  if (typeof sourceValue === 'number') return normalizedValue.valueOf()
  return normalizedValue.format(displayFormat.value)
}

function getSourceValue(index: 0 | 1) {
  return Array.isArray(props.modelValue) ? props.modelValue[index] : undefined
}

function getWeekStart(value: Dayjs) {
  const day = value.day()
  const diff = day === 0 ? 6 : day - 1
  return value.subtract(diff, 'day').startOf('day')
}

function getYearPanelStart(value: Dayjs) {
  return Math.floor(value.year() / 12) * 12
}

function getUnit(): 'day' | 'month' | 'year' {
  if (normalizedPicker.value === 'year') return 'year'
  if (normalizedPicker.value === 'month') return 'month'
  return 'day'
}

function getPanelTitle(value: Dayjs, mode: RangePickerPanelMode) {
  if (mode === 'year') {
    const startYear = getYearPanelStart(value)
    return `${startYear} - ${startYear + 11}`
  }
  if (mode === 'month') return value.format('YYYY年')
  return value.format('YYYY年M月')
}

function normalizeCandidate(value: Dayjs) {
  if (normalizedPicker.value === 'year') return value.startOf('year').millisecond(0)
  if (normalizedPicker.value === 'month') return value.startOf('month').millisecond(0)
  if (!effectiveShowTime.value) return value.startOf('day').millisecond(0)

  let nextValue = value
  if (minDateValue.value && nextValue.isBefore(minDateValue.value)) nextValue = minDateValue.value
  if (maxDateValue.value && nextValue.isAfter(maxDateValue.value)) nextValue = maxDateValue.value
  return nextValue.millisecond(0)
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

function getSideIndex(side: RangeSide): 0 | 1 {
  return side === 'start' ? 0 : 1
}

function getSideTimeSource(side: RangeSide) {
  const index = getSideIndex(side)
  return pendingRange.value[index] || selectedRange.value[index] || dayjs()
}

function applySideTime(date: Dayjs, side: RangeSide) {
  const source = getSideTimeSource(side)
  return normalizeCandidate(
    date
      .hour(source.hour())
      .minute(source.minute())
      .second(showSecondColumn.value ? source.second() : 0)
      .millisecond(0)
  )
}

function getSideTimeValue(side: RangeSide, unit: TimeUnit) {
  const value = getSideTimeSource(side)
  if (unit === 'hour') return value.hour()
  if (unit === 'minute') return value.minute()
  return value.second()
}

function getTimeOptions(side: RangeSide, unit: TimeUnit) {
  const source = getSideTimeSource(side)
  if (unit === 'hour') return withCurrentTimeValue(createTimeRange(normalizedShowTime.value.hourStep, 23), source.hour(), 23)
  if (unit === 'minute') return withCurrentTimeValue(createTimeRange(normalizedShowTime.value.minuteStep, 59), source.minute(), 59)
  return withCurrentTimeValue(createTimeRange(normalizedShowTime.value.secondStep, 59), source.second(), 59)
}

function getTimeCandidate(side: RangeSide, unit: TimeUnit, value: number) {
  const base = pendingRange.value[getSideIndex(side)]
  if (!base) return null
  if (unit === 'hour') return base.hour(value)
  if (unit === 'minute') return base.minute(value)
  return base.second(value)
}

function isTimeValueSelected(side: RangeSide, unit: TimeUnit, value: number) {
  return getSideTimeValue(side, unit) === value
}

function isTimeOptionDisabled(side: RangeSide, unit: TimeUnit, value: number) {
  const candidate = getTimeCandidate(side, unit, value)
  if (!candidate) return true
  if (minDateValue.value && candidate.isBefore(minDateValue.value)) return true
  if (maxDateValue.value && candidate.isAfter(maxDateValue.value)) return true

  const [start, end] = pendingRange.value
  if (side === 'start' && end && candidate.isAfter(end)) return true
  if (side === 'end' && start && candidate.isBefore(start)) return true
  return false
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
  if (normalizedPicker.value === 'year' && isYearDisabled(date)) return true
  if (normalizedPicker.value === 'month' && isMonthDisabled(date)) return true
  if (normalizedPicker.value === 'date' && isDateDisabled(date)) return true

  const start = pendingRange.value[0]
  return Boolean(activeSide.value === 'end' && start && date.isBefore(start, getUnit()))
}

function getRangeFlags(date: Dayjs) {
  const unit = getUnit()

  if (effectiveShowTime.value) {
    const activeValue = activeRange.value[getSideIndex(activeSide.value)]
    const selected = Boolean(activeValue?.isSame(date, unit))
    return {
      selected,
      inRange: false,
      rangeStart: false,
      rangeEnd: false,
      standalone: selected
    }
  }

  const [start, end] = normalizedActiveRange.value
  const rangeStart = Boolean(start?.isSame(date, unit))
  const rangeEnd = Boolean(end?.isSame(date, unit))
  const selected = rangeStart || rangeEnd
  const inRange = Boolean(start && end && date.isAfter(start, unit) && date.isBefore(end, unit))
  return {
    selected,
    inRange,
    rangeStart,
    rangeEnd,
    standalone: selected && (!start || !end || start.isSame(end, unit))
  }
}

function createDateCells(panelDate: Dayjs): RangeDateCell[] {
  const monthStart = panelDate.startOf('month')
  const startDate = getWeekStart(monthStart)

  return Array.from({ length: 42 }, (_, index) => {
    const date = startDate.add(index, 'day')
    const inMonth = date.isSame(panelDate, 'month')
    const flags = inMonth
      ? getRangeFlags(date)
      : {
          selected: false,
          inRange: false,
          rangeStart: false,
          rangeEnd: false,
          standalone: false
        }
    return {
      date,
      key: date.format('YYYY-MM-DD'),
      inMonth,
      today: date.isSame(dayjs(), 'day'),
      disabled: isCandidateDisabled(date),
      ...flags
    }
  })
}

function createMonthCells(panelDate: Dayjs): RangePanelCell[] {
  const current = dayjs()
  return Array.from({ length: 12 }, (_, index) => {
    const date = panelDate.month(index).startOf('month')
    const flags = getRangeFlags(date)
    return {
      date,
      key: date.format('YYYY-MM'),
      label: `${index + 1}月`,
      current: current.isSame(date, 'month'),
      disabled: normalizedPicker.value === 'month' ? isCandidateDisabled(date) : isMonthDisabled(date),
      ...flags
    }
  })
}

function createYearCells(panelDate: Dayjs): RangePanelCell[] {
  const current = dayjs()
  const startYear = getYearPanelStart(panelDate)
  return Array.from({ length: 12 }, (_, index) => {
    const date = panelDate.year(startYear + index).startOf('year')
    const flags = getRangeFlags(date)
    return {
      date,
      key: date.format('YYYY'),
      label: date.format('YYYY'),
      current: current.isSame(date, 'year'),
      disabled: normalizedPicker.value === 'year' ? isCandidateDisabled(date) : isYearDisabled(date),
      ...flags
    }
  })
}

function getDateCellClass(cell: RangeDateCell) {
  return clsx(
    datePickerRangeCell({
      inMonth: cell.inMonth,
      selected: cell.selected,
      inRange: cell.inRange,
      rangeStart: cell.rangeStart,
      rangeEnd: cell.rangeEnd,
      standalone: cell.standalone,
      today: cell.today,
      disabled: cell.disabled
    }),
    effectiveShowTime.value ? 'h-10 text-sm' : ''
  )
}

function getPanelCellClass(cell: RangePanelCell) {
  return clsx(
    datePickerPanelCell({
      selected: cell.selected,
      current: cell.current,
      disabled: cell.disabled,
      muted: false
    }),
    cell.inRange && !cell.selected ? 'bg-brand-500/10 text-brand-500' : '',
    cell.rangeStart ? 'rounded-r-sm' : '',
    cell.rangeEnd ? 'rounded-l-sm' : ''
  )
}

function syncPanelsFromRange(range: [Dayjs | null, Dayjs | null]) {
  const start = range[0] || dayjs()
  const end = range[1]
  if (normalizedPicker.value === 'year') {
    leftPanelDate.value = start.startOf('year')
    const rightYear = Math.max(getYearPanelStart(start) + 12, getYearPanelStart(end || start.add(12, 'year')))
    rightPanelDate.value = start.year(rightYear).startOf('year')
    return
  }
  if (normalizedPicker.value === 'month') {
    leftPanelDate.value = start.startOf('year')
    rightPanelDate.value = (end || start.add(1, 'year')).startOf('year')
    if (!rightPanelDate.value.isAfter(leftPanelDate.value, 'year')) rightPanelDate.value = leftPanelDate.value.add(1, 'year')
    return
  }
  leftPanelDate.value = start.startOf('month')
  rightPanelDate.value = (end || start.add(1, 'month')).startOf('month')
  if (!rightPanelDate.value.isAfter(leftPanelDate.value, 'month')) rightPanelDate.value = leftPanelDate.value.add(1, 'month')
}

function syncActivePanelFromSide() {
  if (!effectiveShowTime.value) return
  const activeValue = pendingRange.value[getSideIndex(activeSide.value)] || pendingRange.value[0] || pendingRange.value[1]
  if (activeValue) leftPanelDate.value = activeValue.startOf('month')
}

function formatDateString(range: [Dayjs | null, Dayjs | null]): [string, string] {
  return [range[0]?.format(displayFormat.value) || '', range[1]?.format(displayFormat.value) || '']
}

function emitCalendarChange(range: [Dayjs | null, Dayjs | null]) {
  const normalized = normalizeRange(range)
  pendingRange.value = normalized
  const output = buildOutputValue(normalized)
  emit('calendar-change', output, formatDateString(normalized))
}

function buildOutputValue(range: [Dayjs | null, Dayjs | null]): RangePickerEmitValue {
  const [start, end] = normalizeRange(range)
  if (!start && !end) return null
  return [start ? formatOutputValue(start, getSourceValue(0)) : null, end ? formatOutputValue(end, getSourceValue(1)) : null]
}

function commitRange(range: [Dayjs | null, Dayjs | null], emitOk = false) {
  const normalized = normalizeRange(range)
  const output = buildOutputValue(normalized)
  pendingRange.value = normalized
  emit('update:modelValue', output)
  emit('change', output, formatDateString(normalized))
  if (emitOk) emit('ok', output, formatDateString(normalized))
  open.value = false
}

function getPanelMode(panel: RangePanelSide) {
  return panel === 'left' ? leftPanelMode.value : rightPanelMode.value
}

function setPanelMode(panel: RangePanelSide, mode: RangePickerPanelMode) {
  if (panel === 'left') leftPanelMode.value = mode
  else rightPanelMode.value = mode
}

function selectCandidate(date: Dayjs) {
  if (isCandidateDisabled(date)) return
  const [start, end] = pendingRange.value

  if (effectiveShowTime.value) {
    const candidate = applySideTime(date, activeSide.value)
    if (!candidate) return

    if (activeSide.value === 'start') {
      emitCalendarChange([candidate, end && !candidate.isAfter(end) ? end : null])
      return
    }

    const endCandidate = start && candidate.isBefore(start) && candidate.isSame(start, 'day') ? start : candidate
    emitCalendarChange([start, endCandidate])
    return
  }

  const candidate = normalizeCandidate(date)

  if (activeSide.value === 'start') {
    emitCalendarChange([candidate, null])
    activeSide.value = 'end'
    return
  }

  if (!start) {
    emitCalendarChange([candidate, null])
    return
  }

  const nextRange: [Dayjs, Dayjs] = [start, candidate]
  emitCalendarChange(nextRange)
  commitRange(nextRange)
  activeSide.value = 'start'
}

function selectTime(side: RangeSide, unit: TimeUnit, value: number) {
  const candidate = getTimeCandidate(side, unit, value)
  if (!candidate || isTimeOptionDisabled(side, unit, value)) return

  const nextRange: [Dayjs | null, Dayjs | null] = [...pendingRange.value]
  nextRange[getSideIndex(side)] = candidate.millisecond(0)
  emitCalendarChange(nextRange)
}

function confirmPendingRange() {
  if (!canConfirmSelection.value) return
  if (activeSide.value === 'start') {
    activeSide.value = 'end'
    return
  }
  commitRange(pendingRange.value, true)
}

function selectPanelMonth(panel: RangePanelSide, date: Dayjs) {
  if (isMonthDisabled(date)) return
  if (normalizedPicker.value === 'date') {
    if (panel === 'left') leftPanelDate.value = leftPanelDate.value.year(date.year()).month(date.month()).startOf('month')
    else rightPanelDate.value = rightPanelDate.value.year(date.year()).month(date.month()).startOf('month')
    setPanelMode(panel, 'date')
    emit('panel-change', panelDates.value)
    return
  }
  selectCandidate(date)
}

function selectPanelYear(panel: RangePanelSide, date: Dayjs) {
  if (isYearDisabled(date)) return
  if (normalizedPicker.value !== 'year') {
    if (panel === 'left') leftPanelDate.value = leftPanelDate.value.year(date.year()).startOf('year')
    else rightPanelDate.value = rightPanelDate.value.year(date.year()).startOf('year')
    setPanelMode(panel, 'month')
    emit('panel-change', panelDates.value)
    return
  }
  selectCandidate(date)
}

function changePanel(panel: RangePanelSide, offset: number) {
  const mode = getPanelMode(panel)
  const unit = mode === 'date' ? 'month' : 'year'
  const amount = mode === 'year' ? offset * 12 : offset
  if (panel === 'left') {
    leftPanelDate.value = leftPanelDate.value.add(amount, unit)
    if (!rightPanelDate.value.isAfter(leftPanelDate.value, unit)) rightPanelDate.value = leftPanelDate.value.add(unit === 'month' ? 1 : normalizedPicker.value === 'year' ? 12 : 1, unit)
  } else {
    rightPanelDate.value = rightPanelDate.value.add(amount, unit)
    if (!rightPanelDate.value.isAfter(leftPanelDate.value, unit)) leftPanelDate.value = rightPanelDate.value.subtract(unit === 'month' ? 1 : normalizedPicker.value === 'year' ? 12 : 1, unit)
  }
  emit('panel-change', panelDates.value)
}

function clear(event?: MouseEvent) {
  event?.stopPropagation()
  if (!showClearButton.value) return
  pendingRange.value = [null, null]
  emit('update:modelValue', null)
  emit('change', null, ['', ''])
  emit('clear')
}

function setOpen(value: boolean) {
  if (props.disabled) return
  if (!value) requestedSide.value = null
  open.value = value
}

function handleTriggerClick() {
  if (!open.value) requestedSide.value = null
  setOpen(true)
}

function handleSideTriggerClick(side: RangeSide) {
  if (props.disabled) return
  if (open.value) {
    activeSide.value = side
    return
  }
  requestedSide.value = side
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

function focus() {
  triggerRef.value?.focus()
}

function blur() {
  triggerRef.value?.blur()
}

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
        data-ui-range-picker="true"
        :tabindex="disabled ? undefined : 0"
        role="combobox"
        :aria-expanded="open"
        aria-haspopup="dialog"
        @click.stop="handleTriggerClick"
        @keydown="handleTriggerKeydown"
        @focus="handleFocus"
        @blur="handleBlur"
      >
        <span :class="[datePickerValue({ size }), effectiveShowTime ? 'py-0!' : '']" class="flex items-center gap-2" :title="[displayStartText, displayEndText].filter(Boolean).join(' - ')">
          <span
            class="min-w-0 flex-1 cursor-pointer truncate transition-colors"
            :class="[
              displayStartText ? 'text-primary' : 'text-tertiary/60',
              effectiveShowTime ? `relative ${timeSideSizeClass} after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:content-empty` : '',
              effectiveShowTime ? (activeSide === 'start' ? 'after:bg-brand' : 'after:bg-transparent') : open && activeSide === 'start' ? 'text-brand' : ''
            ]"
            data-ui-range-picker-side="start"
            :data-ui-range-picker-side-active="activeSide === 'start' ? 'true' : undefined"
            @click.stop="handleSideTriggerClick('start')"
          >
            {{ displayStartText || placeholderText[0] }}
          </span>
          <span :class="separatorIcon" class="size-4 shrink-0 text-tertiary"></span>
          <span
            class="min-w-0 flex-1 cursor-pointer truncate transition-colors"
            :class="[
              displayEndText ? 'text-primary' : 'text-tertiary/60',
              effectiveShowTime ? `relative ${timeSideSizeClass} after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:content-empty` : '',
              effectiveShowTime ? (activeSide === 'end' ? 'after:bg-brand' : 'after:bg-transparent') : open && activeSide === 'end' ? 'text-brand' : ''
            ]"
            data-ui-range-picker-side="end"
            :data-ui-range-picker-side-active="activeSide === 'end' ? 'true' : undefined"
            @click.stop="handleSideTriggerClick('end')"
          >
            {{ displayEndText || placeholderText[1] }}
          </span>
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
      <div v-if="effectiveShowTime" class="grid grid-cols-1 gap-0 sm:grid-cols-[minmax(0,1fr)_216px]">
        <div class="min-w-0" data-ui-range-picker-panel="active">
          <div class="flex h-11 items-center justify-between gap-2 border-b border-medium px-2">
            <button type="button" :class="panelNavButtonClass" aria-label="上一面板" @click="changePanel('left', -1)">
              <span class="i-lucide:chevron-left size-4"></span>
            </button>
            <div class="min-w-0 truncate text-sm font-bold text-primary">
              <button type="button" class="rounded px-1 transition-colors hover:bg-secondary hover:text-brand" @click="setPanelMode('left', 'year')">{{ leftPanelYearTitle }}</button>
              <button type="button" class="rounded px-1 transition-colors hover:bg-secondary hover:text-brand" @click="setPanelMode('left', 'month')">{{ leftPanelMonthTitle }}</button>
            </div>
            <button type="button" :class="panelNavButtonClass" aria-label="下一面板" @click="changePanel('left', 1)">
              <span class="i-lucide:chevron-right size-4"></span>
            </button>
          </div>

          <div v-if="leftPanelMode === 'date'" class="grid grid-cols-7 gap-1 px-3 pb-3 pt-3">
            <div v-for="label in weekLabels" :key="label" class="flex h-7 items-center justify-center text-xs font-medium text-tertiary">{{ label }}</div>
            <button
              v-for="cell in leftDateCells"
              :key="cell.key"
              type="button"
              :class="getDateCellClass(cell)"
              :disabled="cell.disabled"
              :data-ui-range-picker-date-cell="cell.key"
              :data-ui-range-picker-date-selected="cell.selected ? 'true' : undefined"
              :data-ui-range-picker-date-in-range="cell.inRange ? 'true' : undefined"
              @click="selectCandidate(cell.date)"
            >
              {{ cell.date.date() }}
            </button>
          </div>

          <div v-else-if="leftPanelMode === 'month'" class="grid grid-cols-3 gap-2 p-3">
            <button v-for="cell in leftMonthCells" :key="cell.key" type="button" :class="getPanelCellClass(cell)" :disabled="cell.disabled" @click="selectPanelMonth('left', cell.date)">
              {{ cell.label }}
            </button>
          </div>

          <div v-else class="grid grid-cols-3 gap-2 p-3">
            <button v-for="cell in leftYearCells" :key="cell.key" type="button" :class="getPanelCellClass(cell)" :disabled="cell.disabled" @click="selectPanelYear('left', cell.date)">
              {{ cell.label }}
            </button>
          </div>
        </div>

        <div class="grid min-w-0 border-t border-medium sm:border-l sm:border-t-0" :class="showSecondColumn ? 'grid-cols-3' : 'grid-cols-2'">
          <div v-for="unit in timeUnits" :key="unit" class="min-w-0 border-r border-medium last:border-r-0">
            <div class="flex h-11 items-center justify-center border-b border-medium text-xs font-medium text-tertiary">
              {{ unit === 'hour' ? '时' : unit === 'minute' ? '分' : '秒' }}
            </div>
            <div class="max-h-64 overflow-y-auto p-2" :data-ui-range-picker-time-column="unit" :data-ui-range-picker-time-side="activeSide">
              <button
                v-for="value in getTimeOptions(activeSide, unit)"
                :key="value"
                type="button"
                :class="datePickerTimeOption({ selected: isTimeValueSelected(activeSide, unit, value), disabled: isTimeOptionDisabled(activeSide, unit, value) })"
                :disabled="timeSelectionDisabled || isTimeOptionDisabled(activeSide, unit, value)"
                :data-ui-range-picker-time-option="unit"
                :data-ui-range-picker-time-value="value"
                :data-ui-range-picker-time-side="activeSide"
                :data-ui-range-picker-time-selected="isTimeValueSelected(activeSide, unit, value) ? 'true' : undefined"
                @click="selectTime(activeSide, unit, value)"
              >
                {{ String(value).padStart(2, '0') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="grid grid-cols-2 gap-0">
        <div class="min-w-0 border-r border-medium" data-ui-range-picker-panel="left">
          <div class="flex h-11 items-center justify-between gap-2 border-b border-medium px-2">
            <button type="button" :class="panelNavButtonClass" aria-label="上一面板" @click="changePanel('left', -1)">
              <span class="i-lucide:chevron-left size-4"></span>
            </button>
            <div class="min-w-0 truncate text-sm font-bold text-primary">
              <template v-if="leftPanelMode === 'date'">
                <button type="button" class="rounded px-1 transition-colors hover:bg-secondary hover:text-brand" @click="setPanelMode('left', 'year')">{{ leftPanelYearTitle }}</button>
                <button type="button" class="rounded px-1 transition-colors hover:bg-secondary hover:text-brand" @click="setPanelMode('left', 'month')">{{ leftPanelMonthTitle }}</button>
              </template>
              <button v-else-if="leftPanelMode === 'month'" type="button" class="rounded px-1 transition-colors hover:bg-secondary hover:text-brand" @click="setPanelMode('left', 'year')">{{ leftPanelTitle }}</button>
              <span v-else>{{ leftPanelTitle }}</span>
            </div>
            <button type="button" :class="panelNavButtonClass" aria-label="下一面板" @click="changePanel('left', 1)">
              <span class="i-lucide:chevron-right size-4"></span>
            </button>
          </div>

          <div v-if="leftPanelMode === 'date'" class="grid grid-cols-7 gap-1 px-3 pb-2 pt-3">
            <div v-for="label in weekLabels" :key="label" class="flex h-6 items-center justify-center text-xs font-medium text-tertiary">{{ label }}</div>
            <button
              v-for="cell in leftDateCells"
              :key="cell.key"
              type="button"
              :class="getDateCellClass(cell)"
              :disabled="cell.disabled"
              :data-ui-range-picker-date-cell="cell.key"
              :data-ui-range-picker-date-selected="cell.selected ? 'true' : undefined"
              :data-ui-range-picker-date-in-range="cell.inRange ? 'true' : undefined"
              @click="selectCandidate(cell.date)"
            >
              {{ cell.date.date() }}
            </button>
          </div>

          <div v-else-if="leftPanelMode === 'month'" class="grid grid-cols-3 gap-2 p-3">
            <button v-for="cell in leftMonthCells" :key="cell.key" type="button" :class="getPanelCellClass(cell)" :disabled="cell.disabled" @click="selectPanelMonth('left', cell.date)">
              {{ cell.label }}
            </button>
          </div>

          <div v-else class="grid grid-cols-3 gap-2 p-3">
            <button v-for="cell in leftYearCells" :key="cell.key" type="button" :class="getPanelCellClass(cell)" :disabled="cell.disabled" @click="selectPanelYear('left', cell.date)">
              {{ cell.label }}
            </button>
          </div>
        </div>

        <div class="min-w-0" data-ui-range-picker-panel="right">
          <div class="flex h-11 items-center justify-between gap-2 border-b border-medium px-2">
            <button type="button" :class="panelNavButtonClass" aria-label="上一面板" @click="changePanel('right', -1)">
              <span class="i-lucide:chevron-left size-4"></span>
            </button>
            <div class="min-w-0 truncate text-sm font-bold text-primary">
              <template v-if="rightPanelMode === 'date'">
                <button type="button" class="rounded px-1 transition-colors hover:bg-secondary hover:text-brand" @click="setPanelMode('right', 'year')">{{ rightPanelYearTitle }}</button>
                <button type="button" class="rounded px-1 transition-colors hover:bg-secondary hover:text-brand" @click="setPanelMode('right', 'month')">{{ rightPanelMonthTitle }}</button>
              </template>
              <button v-else-if="rightPanelMode === 'month'" type="button" class="rounded px-1 transition-colors hover:bg-secondary hover:text-brand" @click="setPanelMode('right', 'year')">{{ rightPanelTitle }}</button>
              <span v-else>{{ rightPanelTitle }}</span>
            </div>
            <button type="button" :class="panelNavButtonClass" aria-label="下一面板" @click="changePanel('right', 1)">
              <span class="i-lucide:chevron-right size-4"></span>
            </button>
          </div>

          <div v-if="rightPanelMode === 'date'" class="grid grid-cols-7 gap-1 px-3 pb-2 pt-3">
            <div v-for="label in weekLabels" :key="label" class="flex h-6 items-center justify-center text-xs font-medium text-tertiary">{{ label }}</div>
            <button
              v-for="cell in rightDateCells"
              :key="cell.key"
              type="button"
              :class="getDateCellClass(cell)"
              :disabled="cell.disabled"
              :data-ui-range-picker-date-cell="cell.key"
              :data-ui-range-picker-date-selected="cell.selected ? 'true' : undefined"
              :data-ui-range-picker-date-in-range="cell.inRange ? 'true' : undefined"
              @click="selectCandidate(cell.date)"
            >
              {{ cell.date.date() }}
            </button>
          </div>

          <div v-else-if="rightPanelMode === 'month'" class="grid grid-cols-3 gap-2 p-3">
            <button v-for="cell in rightMonthCells" :key="cell.key" type="button" :class="getPanelCellClass(cell)" :disabled="cell.disabled" @click="selectPanelMonth('right', cell.date)">
              {{ cell.label }}
            </button>
          </div>

          <div v-else class="grid grid-cols-3 gap-2 p-3">
            <button v-for="cell in rightYearCells" :key="cell.key" type="button" :class="getPanelCellClass(cell)" :disabled="cell.disabled" @click="selectPanelYear('right', cell.date)">
              {{ cell.label }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="effectiveShowTime" class="border-t border-medium">
        <div class="flex min-h-12 items-center justify-end border-t border-medium px-3 py-2">
          <Button size="sm" :disabled="!canConfirmSelection" @click="confirmPendingRange">确定</Button>
        </div>
      </div>
    </div>
  </Dropdown>
</template>
