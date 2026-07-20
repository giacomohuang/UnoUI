import type { ParamTableRow } from '@/components/ParamTable.vue'

export const alertProps: ParamTableRow[] = [
  { name: 'title', type: 'string | number', default: 'undefined', desc: '主提示内容，本地推荐字段' },
  { name: 'description', type: 'string | number', default: 'undefined', desc: '辅助说明内容' },
  { name: 'type', type: `'success' | 'info' | 'warning' | 'error'`, default: `'info'`, desc: '语义状态；banner 模式默认 warning' },
  { name: 'variant', type: `'outlined' | 'filled'`, default: `'outlined'`, desc: '边框提示或轻填充提示' },
  { name: 'banner', type: 'boolean', default: 'false', desc: '公告条形态，默认展示图标' },
  { name: 'showIcon', type: 'boolean', default: 'banner ? true : false', desc: '是否展示状态图标' },
  { name: 'icon', type: 'string', default: `''`, desc: '自定义图标类名，也可使用 icon 插槽' },
  { name: 'action', type: 'string | number', default: 'undefined', desc: '右侧简短操作内容；复杂内容使用 action 插槽' },
  { name: 'closable', type: 'boolean | AlertClosableOptions', default: 'false', desc: '是否展示关闭按钮，或配置关闭图标和回调' },
  { name: 'closeAriaLabel', type: 'string', default: `'关闭'`, desc: '关闭按钮无障碍文案' },
  { name: 'classNames', type: `Partial<Record<'root' | 'icon' | 'section' | 'title' | 'description' | 'actions' | 'close', string>>`, default: 'undefined', desc: '语义结构类名' },
  { name: 'styles', type: `Partial<Record<'root' | 'icon' | 'section' | 'title' | 'description' | 'actions' | 'close', CSSProperties | string>>`, default: 'undefined', desc: '语义结构样式' }
]

export const alertEmits: ParamTableRow[] = [
  { name: 'close', params: 'MouseEvent', desc: '点击关闭按钮时触发' },
  { name: 'afterClose', params: '-', desc: '关闭动画结束且节点移除后触发' }
]

export const alertSlots: ParamTableRow[] = [
  { name: 'title', scoped: '-', desc: '自定义主提示内容' },
  { name: 'description', scoped: '-', desc: '自定义辅助说明内容' },
  { name: 'icon', scoped: '-', desc: '自定义状态图标' },
  { name: 'action', scoped: '-', desc: '自定义右侧操作区' },
  { name: 'closeIcon', scoped: '-', desc: '自定义关闭图标' }
]

export const alertCodeExample = `<script setup lang="ts">
import { Alert } from '@mcistudio/unoui-vue/alert'
import { Button } from '@mcistudio/unoui-vue/button'
</script>

<template>
  <Alert title="保存成功" type="success" show-icon />

  <Alert
    title="同步失败"
    description="项目版本已过期，请刷新后重试。"
    type="error"
    show-icon
    closable
  />

  <Alert banner title="系统将在 22:00 维护" />

  <Alert title="需要处理" type="warning" show-icon>
    <template #action>
      <Button size="sm" variant="outline" color="yellow">查看</Button>
    </template>
  </Alert>
</template>`
