import type { ParamTableRow } from '@/components/ParamTable.vue'

export const tooltipProps: ParamTableRow[] = [
  { name: 'title', type: 'string | number', default: `''`, desc: '提示内容，复杂内容可使用 title 插槽' },
  { name: 'placement', type: 'TooltipPlacement', default: `'top'`, desc: '提示位置，支持 12 个方向' },
  { name: 'trigger', type: `TooltipTrigger | TooltipTrigger[]`, default: `'hover'`, desc: '触发方式：hover、focus、click、contextMenu' },
  { name: 'open', type: 'boolean', default: 'undefined', desc: '受控显隐状态' },
  { name: 'defaultOpen', type: 'boolean', default: 'false', desc: '非受控默认显隐状态' },
  { name: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用 Tooltip' },
  { name: 'arrow', type: 'boolean | { pointAtCenter?: boolean }', default: 'true', desc: '是否显示箭头，或让箭头指向目标中心' },
  { name: 'color', type: 'string', default: `''`, desc: '自定义背景颜色，文字色自动适配' },
  { name: 'autoAdjustOverflow', type: 'boolean', default: 'true', desc: '溢出视口时自动翻转和夹紧' },
  { name: 'destroyOnHidden', type: 'boolean', default: 'false', desc: '关闭后是否销毁浮层节点' },
  { name: 'fresh', type: 'boolean', default: 'false', desc: '关闭时也保持内容实时更新' },
  { name: 'mouseEnterDelay', type: 'number', default: '0.1', desc: '鼠标移入延迟，单位秒' },
  { name: 'mouseLeaveDelay', type: 'number', default: '0.1', desc: '鼠标移出延迟，单位秒' },
  { name: 'zIndex', type: 'number', default: '2050', desc: '浮层 z-index' },
  { name: 'classNames', type: `Partial<Record<'root' | 'body' | 'arrow', string>>`, default: 'undefined', desc: '语义结构类名' },
  { name: 'styles', type: `Partial<Record<'root' | 'body' | 'arrow', string | CSSProperties>>`, default: 'undefined', desc: '语义结构样式' },
  { name: 'contentClass', type: 'string', default: `''`, desc: '浮层根节点额外类名' }
]

export const tooltipEmits: ParamTableRow[] = [
  { name: 'update:open', params: 'boolean', desc: '受控显隐状态更新' },
  { name: 'openChange', params: 'boolean', desc: '显隐变化时触发' }
]

export const tooltipSlots: ParamTableRow[] = [
  { name: 'default', scoped: '—', desc: '触发器内容' },
  { name: 'title', scoped: '—', desc: '自定义提示内容' }
]

export const tooltipCodeExample = `<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@mcistudio/unoui-vue/button'
import { Tooltip } from '@mcistudio/unoui-vue/tooltip'

const open = ref(false)
</script>

<template>
  <!-- 基础 -->
  <Tooltip title="提示内容">
    <Button variant="outline">Hover</Button>
  </Tooltip>

  <!-- 位置与颜色 -->
  <Tooltip title="右侧提示" placement="right" color="#16a34a">
    <Button variant="outline">Right</Button>
  </Tooltip>

  <!-- 点击触发 -->
  <Tooltip title="点击显示" trigger="click">
    <Button variant="outline">Click</Button>
  </Tooltip>

  <!-- 受控 -->
  <Tooltip v-model:open="open" title="受控提示">
    <Button variant="outline">Controlled</Button>
  </Tooltip>
</template>`
