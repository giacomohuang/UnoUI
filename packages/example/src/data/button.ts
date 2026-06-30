import type { ParamTableRow } from '@/components/ParamTable.vue'

export const buttonProps: ParamTableRow[] = [
  { name: 'color', type: `'brand' | 'gray' | 'red' | 'green' | 'yellow' | 'orange'`, default: `'brand'`, desc: '按钮色彩语义' },
  { name: 'variant', type: `'default' | 'outline' | 'dashed' | 'link' | 'mono'`, default: `'default'`, desc: '按钮视觉变体' },
  { name: 'icon', type: 'string', default: 'undefined', desc: 'UnoCSS / Iconify 图标类名' },
  { name: 'iconSize', type: 'string', default: `'14'`, desc: '图标字号像素值字符串' },
  { name: 'size', type: `'sm' | 'md' | 'lg' | 'icon' | 'icon-md' | 'icon-lg'`, default: `'md'`, desc: '按钮尺寸，icon 系列为正方形图标按钮' },
  { name: 'radius', type: `'none' | 'sm' | 'md' | 'lg' | 'full'`, default: `'md'`, desc: '圆角尺寸' },
  { name: 'loading', type: 'boolean', default: 'false', desc: '是否展示加载图标' },
  { name: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用点击和指针事件' },
  { name: 'type', type: `'button' | 'submit' | 'reset'`, default: `'button'`, desc: '原生 button type，避免表单内误触发提交' }
]

export const buttonSlots: ParamTableRow[] = [
  { name: 'default', scoped: '—', desc: '按钮文本 / 内容' }
]

export const buttonEmits: ParamTableRow[] = [
  { name: 'click', params: 'MouseEvent', desc: '原生点击事件' }
]

export const buttonCodeExample = `<script setup>
import { Button, ButtonGroup } from '@unoui/vue/button'
</script>

<template>
  <!-- 颜色变体 -->
  <Button color="brand">品牌色</Button>
  <Button color="red">危险</Button>
  <Button color="green">成功</Button>
  <Button variant="outline" color="gray">描边</Button>
  <Button variant="dashed" color="brand">虚线</Button>
  <Button variant="link" color="brand">链接</Button>

  <!-- 带图标 -->
  <Button icon="i-lucide:search" color="brand">搜索</Button>
  <Button icon="i-lucide:plus" size="icon" color="brand" />

  <!-- 状态 -->
  <Button loading>加载中</Button>
  <Button disabled>禁用</Button>

  <!-- 按钮组 -->
  <ButtonGroup>
    <Button variant="outline" icon="i-lucide:align-left">左</Button>
    <Button variant="outline" icon="i-lucide:align-center">中</Button>
    <Button variant="outline" icon="i-lucide:align-right">右</Button>
  </ButtonGroup>
</template>`
