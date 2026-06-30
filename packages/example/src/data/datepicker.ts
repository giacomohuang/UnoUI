import type { ParamTableRow } from '@/components/ParamTable.vue'

export const datePickerProps: ParamTableRow[] = [
  { name: 'modelValue', type: 'string | number | Date | Dayjs | null', default: 'undefined', desc: '受控日期值' },
  { name: 'picker', type: `'date' | 'month' | 'year'`, default: `'date'`, desc: '面板类型，支持日期、月份、年份快速选择' },
  { name: 'format', type: 'string', default: `'YYYY-MM-DD'`, desc: '展示格式；showTime 时默认包含时间' },
  { name: 'valueFormat', type: 'string', default: 'undefined', desc: '提交字符串格式，未传时优先保持传入值类型' },
  { name: 'placeholder', type: 'string', default: '自动根据模式生成', desc: '无值时占位文案' },
  { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'`, desc: '尺寸' },
  { name: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用交互' },
  { name: 'clearable', type: 'boolean', default: 'false', desc: '是否允许一键清空' },
  { name: 'showTime', type: 'boolean | DatePickerShowTimeOptions', default: 'false', desc: '是否显示时间面板，可配置格式和步长' },
  { name: 'disabledDate', type: '(date: Dayjs) => boolean', default: 'undefined', desc: '禁用不可选日期' },
  { name: 'minDate', type: 'DatePickerModelValue', default: 'undefined', desc: '最小可选日期或日期时间' },
  { name: 'maxDate', type: 'DatePickerModelValue', default: 'undefined', desc: '最大可选日期或日期时间' },
  { name: 'suffixIcon', type: 'string', default: `'i-lucide:calendar-days'`, desc: '右侧日历图标类名' },
  { name: 'clearIcon', type: 'string', default: `'i-lucide:x'`, desc: '清空按钮图标类名' },
  { name: 'teleportedWidth', type: 'string', default: 'undefined', desc: '下拉层固定宽度' },
  { name: 'name', type: 'string', default: 'undefined', desc: '隐藏 input 的原生 name' }
]

export const datePickerEmits: ParamTableRow[] = [
  { name: 'update:modelValue', params: 'DatePickerModelValue', desc: '受控值更新' },
  { name: 'change', params: 'value, dateString', desc: '选中值改变或清空时触发' },
  { name: 'clear', params: '—', desc: '点击清空按钮时触发' },
  { name: 'ok', params: 'value, dateString', desc: '日期时间模式点击确定时触发' },
  { name: 'visible-change', params: 'boolean', desc: '下拉面板可见性变化时触发' },
  { name: 'panel-change', params: 'Dayjs', desc: '切换年月面板时触发' },
  { name: 'focus', params: 'FocusEvent', desc: '获得焦点时触发' },
  { name: 'blur', params: 'FocusEvent', desc: '失去焦点时触发' }
]

export const datePickerExposes: ParamTableRow[] = [
  { name: 'focus', signature: '() => void', desc: '聚焦触发器' },
  { name: 'blur', signature: '() => void', desc: '移除焦点' },
  { name: 'clear', signature: '(event?: MouseEvent) => void', desc: '清空当前值' }
]

export const rangePickerProps: ParamTableRow[] = [
  { name: 'modelValue', type: '[DatePickerModelValue, DatePickerModelValue] | null', default: 'undefined', desc: '受控范围值' },
  { name: 'picker', type: `'date' | 'month' | 'year'`, default: `'date'`, desc: '面板类型，支持日期、月份、年份范围' },
  { name: 'format', type: 'string', default: '按 picker 自动选择', desc: '展示格式' },
  { name: 'valueFormat', type: 'string', default: 'undefined', desc: '提交字符串格式，未传时优先保持传入值类型' },
  { name: 'placeholder', type: '[string, string]', default: '按 picker 自动生成', desc: '起止占位文案' },
  { name: 'separatorIcon', type: 'string', default: `'i-ant-design:swap-right-outlined'`, desc: '范围连接图标类名' },
  { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'`, desc: '尺寸' },
  { name: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用交互' },
  { name: 'clearable', type: 'boolean', default: 'false', desc: '是否允许一键清空' },
  { name: 'disabledDate', type: '(date: Dayjs) => boolean', default: 'undefined', desc: '禁用不可选日期' },
  { name: 'minDate', type: 'DatePickerModelValue', default: 'undefined', desc: '最小可选日期' },
  { name: 'maxDate', type: 'DatePickerModelValue', default: 'undefined', desc: '最大可选日期' },
  { name: 'suffixIcon', type: 'string', default: `'i-lucide:calendar-range'`, desc: '右侧图标类名' },
  { name: 'clearIcon', type: 'string', default: `'i-lucide:x'`, desc: '清空按钮图标类名' },
  { name: 'teleportedWidth', type: 'string', default: 'undefined', desc: '下拉层固定宽度' },
  { name: 'name', type: 'string', default: 'undefined', desc: '隐藏 input 的原生 name' }
]

export const rangePickerEmits: ParamTableRow[] = [
  { name: 'update:modelValue', params: '[value, value] | null', desc: '受控值更新' },
  { name: 'change', params: 'value, [startString, endString]', desc: '完整范围选中或清空时触发' },
  { name: 'clear', params: '—', desc: '点击清空按钮时触发' },
  { name: 'calendar-change', params: 'value, [startString, endString]', desc: '面板内临时范围变化时触发' },
  { name: 'visible-change', params: 'boolean', desc: '下拉面板可见性变化时触发' },
  { name: 'panel-change', params: '[Dayjs, Dayjs]', desc: '左右面板切换时触发' },
  { name: 'focus', params: 'FocusEvent', desc: '获得焦点时触发' },
  { name: 'blur', params: 'FocusEvent', desc: '失去焦点时触发' }
]

export const datePickerCodeExample = `<script setup lang="ts">
import { ref } from 'vue'
import dayjs from 'dayjs'
import { DatePicker, RangePicker } from '@unoui/vue/datepicker'

const date = ref('2026-06-24')
const datetime = ref('2026-06-24 10:30:00')
const month = ref('2026-06')
const year = ref('2026')
const range = ref(['2026-06-01', '2026-06-24'])
const iconRange = ref(['2026-07-01', '2026-07-18'])
const disabledDate = (value: dayjs.Dayjs) => value.day() === 0
</script>

<template>
  <!-- 日期 -->
  <DatePicker v-model="date" clearable />

  <!-- 月 / 年快速选择 -->
  <DatePicker v-model="month" picker="month" />
  <DatePicker v-model="year" picker="year" />

  <!-- 日期时间 -->
  <DatePicker
    v-model="datetime"
    show-time
    value-format="YYYY-MM-DD HH:mm:ss"
    clearable
  />

  <!-- 限制范围和禁用日期 -->
  <DatePicker
    v-model="date"
    min-date="2026-06-01"
    max-date="2026-06-30"
    :disabled-date="disabledDate"
  />

  <!-- 范围选择 -->
  <RangePicker v-model="range" clearable />
  <RangePicker v-model="range" picker="month" />
  <RangePicker
    v-model="iconRange"
    separator-icon="i-ant-design:swap-right-outlined"
    clearable
  />
</template>`
