import type { ParamTableRow } from '@/components/ParamTable.vue'

export const timePickerProps: ParamTableRow[] = [
  { name: 'modelValue', type: 'string | number | Date | Dayjs | null', default: 'undefined', desc: '受控时间值' },
  { name: 'format', type: 'string', default: `'HH:mm:ss'`, desc: '展示格式；use12Hours 时默认 h:mm:ss A' },
  { name: 'valueFormat', type: 'string', default: 'undefined', desc: '提交字符串格式，未传时优先保持传入值类型' },
  { name: 'placeholder', type: 'string', default: `'请选择时间'`, desc: '无值时占位文案' },
  { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'`, desc: '尺寸' },
  { name: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用交互' },
  { name: 'clearable', type: 'boolean', default: 'false', desc: '是否允许一键清空' },
  { name: 'hourStep', type: 'number', default: '1', desc: '小时选项步长' },
  { name: 'minuteStep', type: 'number', default: '1', desc: '分钟选项步长' },
  { name: 'secondStep', type: 'number', default: '1', desc: '秒选项步长' },
  { name: 'use12Hours', type: 'boolean', default: 'false', desc: '是否使用 12 小时制' },
  { name: 'showSecond', type: 'boolean', default: '按 format 判断', desc: '是否显示秒列' },
  { name: 'disabledTime', type: '(time: Dayjs) => TimePickerDisabledTimeOptions', default: 'undefined', desc: '禁用不可选时间' },
  { name: 'hideDisabledOptions', type: 'boolean', default: 'false', desc: '是否隐藏禁用选项' },
  { name: 'needConfirm', type: 'boolean', default: 'false', desc: '是否需要点击确定后提交' },
  { name: 'showNow', type: 'boolean', default: 'true', desc: '是否显示此刻快捷操作' },
  { name: 'suffixIcon', type: 'string', default: `'i-lucide:clock-3'`, desc: '右侧时钟图标类名' },
  { name: 'clearIcon', type: 'string', default: `'i-lucide:x'`, desc: '清空按钮图标类名' },
  { name: 'teleportedWidth', type: 'string', default: '按列数自动计算', desc: '下拉层固定宽度' },
  { name: 'name', type: 'string', default: 'undefined', desc: '隐藏 input 的原生 name' }
]

export const timePickerEmits: ParamTableRow[] = [
  { name: 'update:modelValue', params: 'TimePickerModelValue', desc: '受控值更新' },
  { name: 'change', params: 'value, timeString', desc: '时间改变或清空时触发' },
  { name: 'clear', params: '—', desc: '点击清空按钮时触发' },
  { name: 'ok', params: 'value, timeString', desc: '点击确定时触发' },
  { name: 'visible-change', params: 'boolean', desc: '下拉面板可见性变化时触发' },
  { name: 'focus', params: 'FocusEvent', desc: '获得焦点时触发' },
  { name: 'blur', params: 'FocusEvent', desc: '失去焦点时触发' }
]

export const timePickerExposes: ParamTableRow[] = [
  { name: 'focus', signature: '() => void', desc: '聚焦触发器' },
  { name: 'blur', signature: '() => void', desc: '移除焦点' },
  { name: 'clear', signature: '(event?: MouseEvent) => void', desc: '清空当前值' }
]

export const timeRangePickerProps: ParamTableRow[] = [
  { name: 'modelValue', type: '[TimePickerModelValue, TimePickerModelValue] | null', default: 'undefined', desc: '受控时间范围值' },
  { name: 'format', type: 'string', default: `'HH:mm:ss'`, desc: '展示格式；use12Hours 时默认 h:mm:ss A' },
  { name: 'valueFormat', type: 'string', default: 'undefined', desc: '提交字符串格式，未传时优先保持传入值类型' },
  { name: 'placeholder', type: '[string, string]', default: `['开始时间', '结束时间']`, desc: '起止占位文案' },
  { name: 'separatorIcon', type: 'string', default: `'i-ant-design:swap-right-outlined'`, desc: '范围连接图标类名' },
  { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'`, desc: '尺寸' },
  { name: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用交互' },
  { name: 'clearable', type: 'boolean', default: 'false', desc: '是否允许一键清空' },
  { name: 'hourStep', type: 'number', default: '1', desc: '小时选项步长' },
  { name: 'minuteStep', type: 'number', default: '1', desc: '分钟选项步长' },
  { name: 'secondStep', type: 'number', default: '1', desc: '秒选项步长' },
  { name: 'use12Hours', type: 'boolean', default: 'false', desc: '是否使用 12 小时制' },
  { name: 'showSecond', type: 'boolean', default: '按 format 判断', desc: '是否显示秒列' },
  { name: 'disabledTime', type: '(time: Dayjs, side: TimeRangePickerSide) => TimePickerDisabledTimeOptions', default: 'undefined', desc: '禁用起止不可选时间' },
  { name: 'hideDisabledOptions', type: 'boolean', default: 'false', desc: '是否隐藏禁用选项' },
  { name: 'suffixIcon', type: 'string', default: `'i-lucide:clock-3'`, desc: '右侧时钟图标类名' },
  { name: 'clearIcon', type: 'string', default: `'i-lucide:x'`, desc: '清空按钮图标类名' },
  { name: 'teleportedWidth', type: 'string', default: '按列数自动计算', desc: '下拉层固定宽度' },
  { name: 'name', type: 'string', default: 'undefined', desc: '隐藏 input 的原生 name' }
]

export const timeRangePickerEmits: ParamTableRow[] = [
  { name: 'update:modelValue', params: '[start, end] | null', desc: '受控范围值更新' },
  { name: 'change', params: 'value, [startString, endString], info', desc: '点击确定或清空时触发；info 自动标记是否跨次日' },
  { name: 'clear', params: '—', desc: '点击清空按钮时触发' },
  { name: 'ok', params: 'value, [startString, endString], info', desc: '点击确定时触发；info 自动标记是否跨次日' },
  { name: 'calendar-change', params: 'value, [startString, endString], info', desc: '面板内临时范围变化时触发；info 自动标记是否跨次日' },
  { name: 'visible-change', params: 'boolean', desc: '下拉面板可见性变化时触发' },
  { name: 'focus', params: 'FocusEvent', desc: '获得焦点时触发' },
  { name: 'blur', params: 'FocusEvent', desc: '失去焦点时触发' }
]

export const timeRangePickerExposes: ParamTableRow[] = [
  { name: 'focus', signature: '() => void', desc: '聚焦触发器' },
  { name: 'blur', signature: '() => void', desc: '移除焦点' },
  { name: 'clear', signature: '(event?: MouseEvent) => void', desc: '清空当前值' }
]

export const timePickerCodeExample = `<script setup lang="ts">
import { ref } from 'vue'
import { TimePicker, TimeRangePicker } from '@mcistudio/unoui-vue/timepicker'

const time = ref('10:30:00')
const minute = ref('09:15')
const twelveHour = ref('03:45:00 PM')
const range = ref(['09:00:00', '18:00:00'])
const overnight = ref(['22:30:00', '02:15:00'])
</script>

<template>
  <!-- 基础时间 -->
  <TimePicker v-model="time" clearable />

  <!-- 时分选择和步长 -->
  <TimePicker
    v-model="minute"
    format="HH:mm"
    value-format="HH:mm"
    :minute-step="15"
  />

  <!-- 12 小时制 -->
  <TimePicker v-model="twelveHour" use12-hours />

  <!-- 确认后提交 -->
  <TimePicker v-model="time" need-confirm />

  <!-- 时间范围 -->
  <TimeRangePicker v-model="range" clearable />

  <!-- 跨次日范围 -->
  <TimeRangePicker v-model="overnight" />
</template>`
