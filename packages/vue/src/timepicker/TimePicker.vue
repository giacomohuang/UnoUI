<script setup lang="ts">
import { clsx } from 'clsx'
import dayjs, { type Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { computed, nextTick, ref, useAttrs, watch } from 'vue'

import { timePickerOption, timePickerValue, timePickerWrapper, type TimePickerDisabledTime, type TimePickerModelValue, type TimePickerProps, type TimePickerUnit } from '.'
import { getUiExposeAttrs } from '../attrs'
import { Button } from '../button'
import { Dropdown } from '../dropdown'

dayjs.extend(customParseFormat)

defineOptions({
  inheritAttrs: false
})

type TimePickerEmitValue = Exclude<TimePickerModelValue, undefined>
type Meridiem = 'am' | 'pm'
type TimeColumn = TimePickerUnit | 'meridiem'

interface TimeOption {
  value: number
  label: string
  disabled: boolean
}

const props = withDefaults(
  defineProps<{
    /** modelValue 是 v-model 绑定值，支持 string、number、Date、Dayjs、null。 */
    modelValue?: TimePickerModelValue
    /** format 是展示格式，默认 HH:mm:ss；use12Hours 时默认 h:mm:ss A。 */
    format?: string
    /** valueFormat 是提交字符串格式；未传时优先保持传入值类型。 */
    valueFormat?: string
    /** placeholder 是无值时的占位文案。 */
    placeholder?: string
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
    disabledTime?: TimePickerDisabledTime
    /** hideDisabledOptions 表示是否隐藏禁用选项。 */
    hideDisabledOptions?: boolean
    /** needConfirm 表示是否需要点击确定后再提交。 */
    needConfirm?: boolean
    /** showNow 表示是否显示此刻快捷操作。 */
    showNow?: boolean
    /** suffixIcon 是右侧时钟图标类名。 */
    suffixIcon?: string
    /** clearIcon 是清空按钮图标类名。 */
    clearIcon?: string
    /** teleportedWidth 是下拉层固定宽度，默认按列数自动计算。 */
    teleportedWidth?: string
    /** name 是隐藏 input 的原生 name，便于表单提交。 */
    name?: string
  }>(),
  {
    modelValue: undefined,
    format: undefined,
    valueFormat: undefined,
    placeholder: '请选择时间',
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
    needConfirm: false,
    showNow: true,
    suffixIcon: 'i-lucide:clock-3',
    clearIcon: 'i-lucide:x',
    teleportedWidth: undefined,
    name: undefined
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: TimePickerEmitValue): void
  (e: 'change', value: TimePickerEmitValue, timeString: string): void
  (e: 'clear'): void
  (e: 'ok', value: TimePickerEmitValue, timeString: string): void
  (e: 'visible-change', value: boolean): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}>()

const attrs = useAttrs()
const open = ref(false)
const focused = ref(false)
const pendingValue = ref<Dayjs | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const skipNextModelValueScroll = ref(false)

const defaultTimeFormat = 'HH:mm:ss'
const default12HourFormat = 'h:mm:ss A'

const timeFormat = computed(() => props.format || (props.use12Hours ? default12HourFormat : defaultTimeFormat))
const hasHourColumn = computed(() => hasFormatToken(timeFormat.value, /[HhKk]/) || !hasFormatToken(timeFormat.value, /[ms]/))
const hasMinuteColumn = computed(() => hasFormatToken(timeFormat.value, /m/))
const hasSecondColumn = computed(() => props.showSecond ?? hasFormatToken(timeFormat.value, /s/))
const hasMeridiemColumn = computed(() => props.use12Hours || hasFormatToken(timeFormat.value, /[aA]/))
const columnCount = computed(() => [hasHourColumn.value, hasMinuteColumn.value, hasSecondColumn.value, hasMeridiemColumn.value].filter(Boolean).length || 1)
const dropdownWidth = computed(() => props.teleportedWidth || `${Math.max(168, columnCount.value * 64 + 16)}px`)
const selectedValue = computed(() => parseModelValue(props.modelValue))
const currentValue = computed(() => pendingValue.value || selectedValue.value || normalizeTime(dayjs()))
const displayText = computed(() => selectedValue.value?.format(timeFormat.value) || '')
const hiddenInputValue = computed(() => selectedValue.value?.format(props.valueFormat || timeFormat.value) || '')
const hasValue = computed(() => Boolean(selectedValue.value))
const showClearButton = computed(() => props.clearable && hasValue.value && !props.disabled)
const currentMeridiem = computed<Meridiem>(() => (currentValue.value.hour() >= 12 ? 'pm' : 'am'))
const nowShortcutDisabled = computed(() => isCandidateDisabled(normalizeTime(dayjs())))

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

const hourOptions = computed(() => {
  if (!hasHourColumn.value) return []
  const currentHour = props.use12Hours ? to12Hour(currentValue.value.hour()) : currentValue.value.hour()
  const options = props.use12Hours ? createSteppedRange(1, 12, props.hourStep) : createSteppedRange(0, 23, props.hourStep)
  return normalizeOptions(withCurrentTimeValue(options, currentHour, props.use12Hours ? 12 : 23), 'hour')
})

const minuteOptions = computed(() => {
  if (!hasMinuteColumn.value) return []
  return normalizeOptions(withCurrentTimeValue(createSteppedRange(0, 59, props.minuteStep), currentValue.value.minute(), 59), 'minute')
})

const secondOptions = computed(() => {
  if (!hasSecondColumn.value) return []
  return normalizeOptions(withCurrentTimeValue(createSteppedRange(0, 59, props.secondStep), currentValue.value.second(), 59), 'second')
})

const meridiemOptions = computed(() => [
  { value: 'am' as const, label: 'AM', disabled: isCandidateDisabled(getCandidate('meridiem', 'am')) },
  { value: 'pm' as const, label: 'PM', disabled: isCandidateDisabled(getCandidate('meridiem', 'pm')) }
])

watch(open, (value) => {
  emit('visible-change', value)
  if (value) {
    pendingValue.value = selectedValue.value
    scrollSelectedTimeOptions()
  }
})

watch(
  () => [timeFormat.value, props.showSecond],
  () => {
    void nextTick(() => {
      if (pendingValue.value) pendingValue.value = normalizeTime(pendingValue.value)
    })
  }
)

watch(
  () => props.modelValue,
  () => {
    if (!open.value) return
    if (skipNextModelValueScroll.value) {
      skipNextModelValueScroll.value = false
      return
    }
    scrollSelectedTimeOptions()
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

function parseModelValue(value: TimePickerModelValue) {
  return parseLooseValue(value)
}

function normalizeTime(value: Dayjs) {
  let nextValue = value.millisecond(0)
  if (!hasMinuteColumn.value) nextValue = nextValue.minute(0)
  if (!hasSecondColumn.value) nextValue = nextValue.second(0)
  return nextValue
}

function formatOutputValue(value: Dayjs): TimePickerEmitValue {
  const normalizedValue = normalizeTime(value)
  if (props.valueFormat) return normalizedValue.format(props.valueFormat)
  if (dayjs.isDayjs(props.modelValue)) return normalizedValue
  if (props.modelValue instanceof Date) return normalizedValue.toDate()
  if (typeof props.modelValue === 'number') return normalizedValue.valueOf()
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

function normalizeOptions(options: number[], unit: TimePickerUnit): TimeOption[] {
  return options
    .map((value) => ({
      value,
      label: String(value).padStart(2, '0'),
      disabled: isTimeOptionDisabled(unit, value)
    }))
    .filter((option) => !(props.hideDisabledOptions && option.disabled))
}

function to12Hour(hour: number) {
  return hour % 12 || 12
}

function to24Hour(hour: number, meridiem: Meridiem) {
  if (!props.use12Hours && !hasMeridiemColumn.value) return hour
  if (meridiem === 'pm') return hour === 12 ? 12 : hour + 12
  return hour === 12 ? 0 : hour
}

function getDisabledTimeOptions(value: Dayjs) {
  return props.disabledTime?.(value) ?? {}
}

function getCandidate(unit: TimeColumn, value: number | Meridiem) {
  const base = currentValue.value
  if (unit === 'hour' && typeof value === 'number') return normalizeTime(base.hour(to24Hour(value, currentMeridiem.value)))
  if (unit === 'minute' && typeof value === 'number') return normalizeTime(base.minute(value))
  if (unit === 'second' && typeof value === 'number') return normalizeTime(base.second(value))
  if (unit === 'meridiem' && typeof value === 'string') {
    const hour = base.hour()
    if (value === 'pm' && hour < 12) return normalizeTime(base.hour(hour + 12))
    if (value === 'am' && hour >= 12) return normalizeTime(base.hour(hour - 12))
  }
  return normalizeTime(base)
}

function isCandidateDisabled(value: Dayjs) {
  const options = getDisabledTimeOptions(value)
  if (options.disabledHours?.().includes(value.hour())) return true
  if (options.disabledMinutes?.(value.hour()).includes(value.minute())) return true
  if (hasSecondColumn.value && options.disabledSeconds?.(value.hour(), value.minute()).includes(value.second())) return true
  return false
}

function isTimeOptionDisabled(unit: TimePickerUnit, value: number) {
  const candidate = getCandidate(unit, value)
  if (unit === 'hour') return Boolean(getDisabledTimeOptions(candidate).disabledHours?.().includes(candidate.hour()))
  if (unit === 'minute') return Boolean(getDisabledTimeOptions(candidate).disabledMinutes?.(candidate.hour()).includes(candidate.minute()))
  return Boolean(getDisabledTimeOptions(candidate).disabledSeconds?.(candidate.hour(), candidate.minute()).includes(candidate.second()))
}

function suppressNextModelValueScroll() {
  skipNextModelValueScroll.value = true
  void nextTick(() => {
    skipNextModelValueScroll.value = false
  })
}

function commitValue(value: Dayjs, closePanel: boolean, emitOk = false, scrollAfterCommit = true) {
  const normalizedValue = normalizeTime(value)
  if (isCandidateDisabled(normalizedValue)) return
  const outputValue = formatOutputValue(normalizedValue)
  const timeString = normalizedValue.format(timeFormat.value)
  pendingValue.value = normalizedValue
  if (!closePanel && !scrollAfterCommit) suppressNextModelValueScroll()
  emit('update:modelValue', outputValue)
  emit('change', outputValue, timeString)
  if (emitOk) emit('ok', outputValue, timeString)
  if (closePanel) open.value = false
  else if (scrollAfterCommit) scrollSelectedTimeOptions()
}

function clear(event?: MouseEvent) {
  event?.stopPropagation()
  pendingValue.value = null
  emit('update:modelValue', null)
  emit('change', null, '')
  emit('clear')
  open.value = false
}

function selectTime(unit: TimeColumn, value: number | Meridiem) {
  const nextValue = getCandidate(unit, value)
  if (isCandidateDisabled(nextValue)) return
  pendingValue.value = nextValue
  if (!props.needConfirm) commitValue(nextValue, false, false, false)
}

function pickNow() {
  const now = normalizeTime(dayjs())
  if (isCandidateDisabled(now)) return
  pendingValue.value = now
  if (props.needConfirm) {
    scrollSelectedTimeOptions()
    return
  }
  commitValue(now, false)
}

function confirmPendingValue() {
  commitValue(pendingValue.value || selectedValue.value || dayjs(), true, true)
}

function isSameTime(unit: TimeColumn, value: number | Meridiem) {
  if (unit === 'hour' && typeof value === 'number') return props.use12Hours ? to12Hour(currentValue.value.hour()) === value : currentValue.value.hour() === value
  if (unit === 'minute' && typeof value === 'number') return currentValue.value.minute() === value
  if (unit === 'second' && typeof value === 'number') return currentValue.value.second() === value
  if (unit === 'meridiem') return currentMeridiem.value === value
  return false
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
    const columns = panelRef.value?.querySelectorAll<HTMLElement>('[data-ui-timepicker-scroll="true"]')
    columns?.forEach((column) => {
      const selectedOption = column.querySelector<HTMLElement>('[data-ui-timepicker-selected="true"]')
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
        data-ui-timepicker="true"
        :tabindex="disabled ? undefined : 0"
        role="combobox"
        :aria-expanded="open"
        aria-haspopup="dialog"
        @click.stop="handleTriggerClick"
        @keydown="handleTriggerKeydown"
        @focus="handleFocus"
        @blur="handleBlur"
      >
        <span :class="timePickerValue({ size })" :title="displayText">
          <span :class="displayText ? 'text-primary' : 'text-tertiary/60'">{{ displayText || placeholder }}</span>
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
      <div class="grid" :style="panelGridStyle">
        <div v-if="hasHourColumn" class="min-w-0" :class="hasMinuteColumn || hasSecondColumn || hasMeridiemColumn ? 'border-r border-medium' : ''">
          <div class="h-8 border-b border-medium text-center text-xs/8 text-tertiary">时</div>
          <div class="max-h-[224px] overflow-y-auto p-1" data-ui-timepicker-scroll="true">
            <button
              v-for="hour in hourOptions"
              :key="hour.value"
              type="button"
              data-ui-timepicker-unit="hour"
              :data-ui-timepicker-value="hour.value"
              :data-ui-timepicker-selected="isSameTime('hour', hour.value) ? 'true' : undefined"
              :class="timePickerOption({ selected: isSameTime('hour', hour.value), disabled: hour.disabled })"
              :disabled="hour.disabled"
              @click="selectTime('hour', hour.value)"
            >
              {{ hour.label }}
            </button>
          </div>
        </div>

        <div v-if="hasMinuteColumn" class="min-w-0" :class="hasSecondColumn || hasMeridiemColumn ? 'border-r border-medium' : ''">
          <div class="h-8 border-b border-medium text-center text-xs/8 text-tertiary">分</div>
          <div class="max-h-[224px] overflow-y-auto p-1" data-ui-timepicker-scroll="true">
            <button
              v-for="minute in minuteOptions"
              :key="minute.value"
              type="button"
              data-ui-timepicker-unit="minute"
              :data-ui-timepicker-value="minute.value"
              :data-ui-timepicker-selected="isSameTime('minute', minute.value) ? 'true' : undefined"
              :class="timePickerOption({ selected: isSameTime('minute', minute.value), disabled: minute.disabled })"
              :disabled="minute.disabled"
              @click="selectTime('minute', minute.value)"
            >
              {{ minute.label }}
            </button>
          </div>
        </div>

        <div v-if="hasSecondColumn" class="min-w-0" :class="hasMeridiemColumn ? 'border-r border-medium' : ''">
          <div class="h-8 border-b border-medium text-center text-xs/8 text-tertiary">秒</div>
          <div class="max-h-[224px] overflow-y-auto p-1" data-ui-timepicker-scroll="true">
            <button
              v-for="second in secondOptions"
              :key="second.value"
              type="button"
              data-ui-timepicker-unit="second"
              :data-ui-timepicker-value="second.value"
              :data-ui-timepicker-selected="isSameTime('second', second.value) ? 'true' : undefined"
              :class="timePickerOption({ selected: isSameTime('second', second.value), disabled: second.disabled })"
              :disabled="second.disabled"
              @click="selectTime('second', second.value)"
            >
              {{ second.label }}
            </button>
          </div>
        </div>

        <div v-if="hasMeridiemColumn" class="min-w-0">
          <div class="h-8 border-b border-medium text-center text-xs/8 text-tertiary">午别</div>
          <div class="max-h-[224px] overflow-y-auto p-1" data-ui-timepicker-scroll="true">
            <button
              v-for="item in meridiemOptions"
              :key="item.value"
              type="button"
              data-ui-timepicker-unit="meridiem"
              :data-ui-timepicker-value="item.value"
              :data-ui-timepicker-selected="isSameTime('meridiem', item.value) ? 'true' : undefined"
              :class="timePickerOption({ selected: isSameTime('meridiem', item.value), disabled: item.disabled })"
              :disabled="item.disabled"
              @click="selectTime('meridiem', item.value)"
            >
              {{ item.label }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="showNow || needConfirm" class="flex min-h-11 items-center justify-between gap-3 border-t border-medium px-3 py-2">
        <button v-if="showNow" type="button" class="text-xs text-brand-500 transition-colors hover:text-brand-600 disabled:pointer-events-none disabled:opacity-40" :disabled="nowShortcutDisabled" @click="pickNow">此刻</button>
        <span v-else></span>
        <div class="flex min-w-0 items-center justify-end gap-2">
          <span v-if="needConfirm" class="min-w-0 truncate font-mono text-xs text-tertiary">{{ currentValue.format(timeFormat) }}</span>
          <Button v-if="needConfirm" size="sm" @click="confirmPendingValue">确定</Button>
        </div>
      </div>
    </div>
  </Dropdown>
</template>

<style>
.ui-timepicker-dropdown {
  transition-property: opacity, box-shadow, border-color, background-color;
}
</style>
