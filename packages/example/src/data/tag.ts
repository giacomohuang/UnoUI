import type { ParamTableRow } from '@/components/ParamTable.vue'

export const tagProps: ParamTableRow[] = [
  { name: 'color', type: `'brand' | 'blue' | 'cyan' | 'teal' | 'green' | 'lime' | 'yellow' | 'orange' | 'red' | 'pink' | 'purple' | 'indigo' | 'gray'`, default: `'brand'`, desc: '标签色彩语义' },
  { name: 'variant', type: `'soft' | 'light' | 'dark' | 'plain'`, default: `'light'`, desc: '标签视觉变体，soft 为无描边柔和底色' },
  { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'sm'`, desc: '尺寸' },
  { name: 'radius', type: `'none' | 'sm' | 'md' | 'lg' | 'round'`, default: `'md'`, desc: '圆角尺寸' },
  { name: 'closable', type: 'boolean', default: 'false', desc: '是否可关闭' },
  { name: 'closeIcon', type: 'string', default: `'i-lucide:x'`, desc: '关闭图标类名' },
  { name: 'closeAriaLabel', type: 'string', default: `'关闭'`, desc: '关闭按钮无障碍标签' }
]

export const tagEmits: ParamTableRow[] = [
  { name: 'close', params: 'MouseEvent', desc: '点击关闭按钮时触发' }
]

export const tagSlots: ParamTableRow[] = [
  { name: 'default', scoped: '—', desc: '标签文本/内容' }
]

export const tagCodeExample = `<script setup>
import { Tag } from '@mcistudio/unoui-vue/tag'
</script>

<template>
  <!-- 颜色 -->
  <Tag color="brand">品牌</Tag>
  <Tag color="blue">信息</Tag>
  <Tag color="cyan">青色</Tag>
  <Tag color="teal">青绿</Tag>
  <Tag color="red">危险</Tag>
  <Tag color="green">成功</Tag>
  <Tag color="lime">青柠</Tag>
  <Tag color="yellow">警告</Tag>
  <Tag color="orange">橙色</Tag>
  <Tag color="pink">粉色</Tag>
  <Tag color="purple">紫色</Tag>
  <Tag color="indigo">靛蓝</Tag>
  <Tag color="gray">灰色</Tag>

  <!-- 变体 -->
  <Tag color="purple" variant="soft" radius="round">集团</Tag>
  <Tag color="blue" variant="soft" radius="round">园区</Tag>
  <Tag color="brand" variant="dark">深色</Tag>
  <Tag color="brand" variant="light">浅色</Tag>
  <Tag color="brand" variant="plain">描边</Tag>

  <!-- 尺寸 -->
  <Tag size="sm">小号</Tag>
  <Tag size="md">中号</Tag>
  <Tag size="lg">大号</Tag>

  <!-- 可关闭 -->
  <Tag closable @close="console.log('closed')">可关闭</Tag>

  <!-- 圆角 -->
  <Tag radius="round" color="brand">药丸形</Tag>
</template>`
