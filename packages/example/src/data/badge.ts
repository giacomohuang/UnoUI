import type { ParamTableRow } from '@/components/ParamTable.vue'

export const badgeProps: ParamTableRow[] = [
  { name: 'count', type: 'number | string', default: 'undefined', desc: '展示的数字或文本，大于 overflowCount 时显示为封顶值加号' },
  { name: 'dot', type: 'boolean', default: 'false', desc: '只展示小圆点' },
  { name: 'overflowCount', type: 'number', default: '99', desc: '数字封顶值' },
  { name: 'showZero', type: 'boolean', default: 'false', desc: 'count 为 0 时是否仍展示徽标' },
  { name: 'status', type: `'success' | 'processing' | 'default' | 'error' | 'warning'`, default: 'undefined', desc: '状态点模式' },
  { name: 'text', type: 'string | number', default: 'undefined', desc: '状态点旁文本' },
  { name: 'color', type: 'string', default: `''`, desc: '自定义徽标或状态点颜色' },
  { name: 'size', type: `'medium' | 'small'`, default: `'medium'`, desc: '数字徽标尺寸' },
  { name: 'offset', type: '[number, number]', default: 'undefined', desc: '相对默认右上角位置的偏移，单位 px' },
  { name: 'title', type: 'string', default: 'String(count)', desc: '徽标原生 title' },
  { name: 'classNames', type: `Partial<Record<'root' | 'indicator' | 'text', string>>`, default: 'undefined', desc: '语义结构类名' },
  { name: 'styles', type: `Partial<Record<'root' | 'indicator' | 'text', CSSProperties | string>>`, default: 'undefined', desc: '语义结构样式' }
]

export const badgeRibbonProps: ParamTableRow[] = [
  { name: 'text', type: 'string | number', default: 'undefined', desc: '缎带内容，也可使用 text 插槽' },
  { name: 'color', type: `'brand' | 'blue' | 'red' | 'green' | 'yellow' | 'orange' | 'gray' | string`, default: `'brand'`, desc: '内置颜色或 CSS 颜色值' },
  { name: 'placement', type: `'start' | 'end'`, default: `'end'`, desc: '缎带贴在容器起始侧或结束侧' },
  { name: 'classNames', type: `Partial<Record<'root' | 'indicator' | 'content', string>>`, default: 'undefined', desc: '语义结构类名' },
  { name: 'styles', type: `Partial<Record<'root' | 'indicator' | 'content', CSSProperties | string>>`, default: 'undefined', desc: '语义结构样式' }
]

export const badgeSlots: ParamTableRow[] = [
  { name: 'default', scoped: '-', desc: '徽标包裹内容' },
  { name: 'count', scoped: '-', desc: '自定义数字徽标内容' },
  { name: 'text', scoped: '-', desc: '自定义状态点文本' }
]

export const badgeRibbonSlots: ParamTableRow[] = [
  { name: 'default', scoped: '-', desc: '缎带包裹内容' },
  { name: 'text', scoped: '-', desc: '自定义缎带文本' }
]

export const badgeCodeExample = `<script setup lang="ts">
import { Badge, BadgeRibbon } from '@unoui/vue/badge'
import { Button } from '@unoui/vue/button'
</script>

<template>
  <Badge :count="12">
    <Button variant="outline">通知</Button>
  </Badge>

  <Badge dot>
    <Button variant="outline">运行状态</Button>
  </Badge>

  <Badge status="processing" text="同步中" />

  <BadgeRibbon text="推荐" color="brand">
    <div class="rounded-md border border-medium bg-secondary/50 p-4">
      新版本项目
    </div>
  </BadgeRibbon>
</template>`
