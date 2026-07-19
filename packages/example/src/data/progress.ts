import type { ParamTableRow } from '@/components/ParamTable.vue'

export const progressProps: ParamTableRow[] = [
  { name: 'percent', type: 'number', default: '0', desc: '当前完成百分比，渲染时限制在 0 到 100' },
  { name: 'type', type: `'line' | 'circle' | 'dashboard'`, default: `'line'`, desc: '进度条形态' },
  { name: 'status', type: `'normal' | 'active' | 'success' | 'exception'`, default: '自动', desc: '进度状态；达到 100% 时默认使用 success' },
  { name: 'showInfo', type: 'boolean', default: 'true', desc: '是否展示百分比或状态图标' },
  { name: 'strokeColor', type: 'string | string[] | ProgressGradient', default: '状态色', desc: '进度色；步骤模式支持颜色数组，其余模式支持渐变对象' },
  { name: 'railColor', type: 'string', default: '主题轨道色', desc: '未完成轨道的 CSS 颜色' },
  { name: 'strokeLinecap', type: `'round' | 'butt' | 'square'`, default: `'round'`, desc: '进度端点形状' },
  { name: 'strokeWidth', type: 'number', default: '由 size 决定', desc: '轨道宽度' },
  { name: 'size', type: `'sm' | 'md' | 'lg' | 'xl' | 'xxl'`, default: `'md'`, desc: '组件预设尺寸' },
  { name: 'success', type: '{ percent: number; strokeColor?: string }', default: 'undefined', desc: '已成功完成的进度分段' },
  { name: 'steps', type: 'number', default: 'undefined', desc: '线形进度的步骤数量' },
  { name: 'gapDegree', type: 'number', default: '75', desc: '仪表盘缺口角度，限制在 0 到 295' },
  { name: 'gapPlacement', type: `'top' | 'bottom' | 'start' | 'end'`, default: `'bottom'`, desc: '仪表盘缺口位置' },
  { name: 'format', type: '(percent, successPercent) => string | number', default: 'undefined', desc: '自定义信息文案' },
  { name: 'classNames', type: `Partial<Record<'root' | 'rail' | 'track' | 'success' | 'info', string>>`, default: 'undefined', desc: '语义结构类名' },
  { name: 'styles', type: `Partial<Record<'root' | 'rail' | 'track' | 'success' | 'info', CSSProperties | string>>`, default: 'undefined', desc: '语义结构样式' }
]

export const progressSlots: ParamTableRow[] = [{ name: 'info', scoped: '{ percent, status, successPercent }', desc: '自定义百分比或状态内容' }]

export const progressCodeExample = `<script setup lang="ts">
import { Progress } from '@unoui/vue/progress'
</script>

<template>
  <Progress :percent="48" />
  <Progress :percent="68" status="active" />
  <Progress :percent="72" :success="{ percent: 24 }" />
  <Progress :percent="64" :steps="8" />

  <Progress type="circle" :percent="75" />
  <Progress type="dashboard" :percent="72" />
  <Progress type="circle" :percent="58" size="sm" />
  <Progress type="circle" :percent="58" size="xxl" />

  <Progress
    :percent="78"
    :stroke-color="{ from: '#0ea5e9', to: '#22c55e' }"
  />

  <Progress type="circle" :percent="42">
    <template #info="{ percent }">{{ percent }} / 100</template>
  </Progress>
</template>`
