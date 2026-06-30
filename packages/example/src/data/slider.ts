import type { ParamTableRow } from '@/components/ParamTable.vue'

export const sliderProps: ParamTableRow[] = [
  { name: 'modelValue', type: 'number | number[]', default: 'undefined', desc: '本地 v-model 受控值，range 模式下为数组' },
  { name: 'defaultValue', type: 'number | number[]', default: 'undefined', desc: '非受控初始值' },
  { name: 'min', type: 'number', default: '0', desc: '最小值' },
  { name: 'max', type: 'number', default: '100', desc: '最大值' },
  { name: 'step', type: 'number | null', default: '1', desc: '步长；为 null 且有 marks 时只能选择刻度值' },
  { name: 'range', type: 'boolean | SliderRangeOptions', default: 'false', desc: '启用范围选择；对象形式支持拖拽范围和可编辑节点' },
  { name: 'marks', type: 'Record<number | string, string | number | SliderMark>', default: 'undefined', desc: '刻度和刻度标签' },
  { name: 'dots', type: 'boolean', default: 'false', desc: '是否显示步长或 marks 节点' },
  { name: 'included', type: 'boolean', default: 'true', desc: '是否显示已选范围轨道' },
  { name: 'color', type: 'string', default: `'brand'`, desc: '已选轨道、handle 和激活刻度颜色，支持任意 CSS 色值' },
  { name: 'disabled', type: 'boolean | boolean[]', default: 'false', desc: '是否禁用交互；数组形式可禁用指定 handle' },
  { name: 'keyboard', type: 'boolean', default: 'true', desc: '是否允许键盘操作 handle' },
  { name: 'vertical', type: 'boolean', default: 'false', desc: '是否垂直展示' },
  { name: 'reverse', type: 'boolean', default: 'false', desc: '是否反向展示和键盘方向' },
  { name: 'tooltip', type: 'SliderTooltipOptions', default: 'undefined', desc: '提示配置，支持 open、placement、formatter' },
  { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'`, desc: '组件尺寸' },
  { name: 'tabindex', type: 'number | string', default: '0', desc: 'handle 的键盘聚焦顺序' },
  { name: 'ariaLabel', type: 'string | string[]', default: 'undefined', desc: 'handle 的 aria-label' },
  { name: 'name', type: 'string', default: 'undefined', desc: '隐藏 input name，便于表单提交' }
]

export const sliderEmits: ParamTableRow[] = [
  { name: 'update:modelValue', params: 'number | number[]', desc: '本地 v-model 值更新' },
  { name: 'change', params: 'number | number[]', desc: '拖拽、点击或键盘改变值时触发' },
  { name: 'changeComplete', params: 'number | number[]', desc: '拖拽结束或键盘提交后触发' },
  { name: 'focus', params: 'FocusEvent, index', desc: 'handle 获得焦点时触发' },
  { name: 'blur', params: 'FocusEvent, index', desc: 'handle 失去焦点时触发' }
]

export const sliderSlots: ParamTableRow[] = []

export const sliderExposes: ParamTableRow[] = [
  { name: 'focus', signature: '() => void', desc: '让第一个 handle 获取焦点' },
  { name: 'blur', signature: '() => void', desc: '让所有 handle 失去焦点' }
]

export const sliderCodeExample = `<script setup lang="ts">
import { ref } from 'vue'
import { Slider } from '@unoui/vue/slider'

const value = ref(36)
const rangeValue = ref([20, 60])
const marks = {
  0: '0°C',
  26: '26°C',
  37: {
    label: '37°C',
    style: { color: '#ef4444' }
  },
  100: '100°C'
}
</script>

<template>
  <!-- 基础滑动输入 -->
  <Slider v-model="value" />

  <!-- 自定义颜色 -->
  <Slider v-model="value" color="#16a34a" />

  <!-- 范围选择 -->
  <Slider v-model="rangeValue" range />

  <!-- marks-only -->
  <Slider v-model="value" :marks="marks" :step="null" />

  <!-- tooltip 格式化 -->
  <Slider
    v-model="value"
    :tooltip="{ formatter: (nextValue) => nextValue + '%' }"
  />
</template>`
