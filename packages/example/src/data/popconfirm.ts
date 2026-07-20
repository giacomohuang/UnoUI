import type { ParamTableRow } from '@/components/ParamTable.vue'

export const popconfirmProps: ParamTableRow[] = [
  { name: 'title', type: 'string | number', default: 'undefined', desc: '确认框标题' },
  { name: 'description', type: 'string | number', default: 'undefined', desc: '确认框辅助说明' },
  { name: 'disabled', type: 'boolean', default: 'false', desc: '禁用触发器打开确认框' },
  { name: 'icon', type: 'string', default: `'i-lucide:circle-alert'`, desc: '自定义图标类名，也可使用 icon 插槽' },
  { name: 'okText', type: 'string', default: `'确定'`, desc: '确认按钮文字' },
  { name: 'cancelText', type: 'string', default: `'取消'`, desc: '取消按钮文字' },
  { name: 'okType', type: `'primary' | 'danger' | 'default'`, default: `'primary'`, desc: '确认按钮语义' },
  { name: 'showCancel', type: 'boolean', default: 'true', desc: '是否展示取消按钮' },
  { name: 'okButtonProps', type: 'PopconfirmButtonProps', default: 'undefined', desc: '确认按钮的本地 Button 属性' },
  { name: 'cancelButtonProps', type: 'PopconfirmButtonProps', default: 'undefined', desc: '取消按钮的本地 Button 属性' },
  { name: 'placement', type: 'PopconfirmPlacement', default: `'top'`, desc: '浮层位置，取值同 Tooltip' },
  { name: 'trigger', type: `PopconfirmTrigger | PopconfirmTrigger[]`, default: `'click'`, desc: '触发方式，支持 hover、focus、click、contextMenu' },
  { name: 'open', type: 'boolean', default: 'undefined', desc: '受控显隐状态' },
  { name: 'defaultOpen', type: 'boolean', default: 'false', desc: '非受控默认显隐状态' },
  { name: 'arrow', type: 'boolean | { pointAtCenter?: boolean }', default: 'true', desc: '是否展示箭头，或让箭头指向触发器中心' },
  { name: 'autoAdjustOverflow', type: 'boolean', default: 'true', desc: '溢出视口时自动翻转和夹紧' },
  { name: 'destroyOnHidden', type: 'boolean', default: 'false', desc: '隐藏后是否销毁浮层节点' },
  { name: 'mouseEnterDelay', type: 'number', default: '0.1', desc: 'hover 打开延迟，单位秒' },
  { name: 'mouseLeaveDelay', type: 'number', default: '0.1', desc: 'hover 关闭延迟，单位秒' },
  { name: 'zIndex', type: 'number', default: '2050', desc: '浮层层级' },
  { name: 'color', type: 'string', default: `''`, desc: '自定义浮层背景颜色' },
  { name: 'classNames', type: `Partial<Record<'root' | 'container' | 'arrow' | 'icon' | 'title' | 'content' | 'actions', string>>`, default: 'undefined', desc: '语义结构类名' },
  { name: 'styles', type: `Partial<Record<'root' | 'container' | 'arrow' | 'icon' | 'title' | 'content' | 'actions', CSSProperties | string>>`, default: 'undefined', desc: '语义结构样式' }
]

export const popconfirmEmits: ParamTableRow[] = [
  { name: 'update:open', params: 'boolean', desc: '受控显隐状态更新' },
  { name: 'openChange', params: 'boolean', desc: '显隐状态变化时触发' },
  { name: 'confirm', params: 'MouseEvent', desc: '点击确认按钮时触发，并关闭浮层' },
  { name: 'cancel', params: 'MouseEvent', desc: '点击取消按钮时触发，并关闭浮层' },
  { name: 'popupClick', params: 'MouseEvent', desc: '点击浮层内部时触发' }
]

export const popconfirmSlots: ParamTableRow[] = [
  { name: 'default', scoped: '-', desc: '触发器内容' },
  { name: 'title', scoped: '-', desc: '自定义标题内容' },
  { name: 'description', scoped: '-', desc: '自定义描述内容' },
  { name: 'icon', scoped: '-', desc: '自定义图标' }
]

export const popconfirmCodeExample = `<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@mcistudio/unoui-vue/button'
import { Popconfirm } from '@mcistudio/unoui-vue/popconfirm'

const open = ref(false)
</script>

<template>
  <Popconfirm
    title="确认删除该项目？"
    description="删除后无法恢复。"
    ok-text="删除"
    ok-type="danger"
    @confirm="removeProject"
  >
    <Button color="red" variant="outline">删除</Button>
  </Popconfirm>

  <Popconfirm v-model:open="open" title="受控确认框">
    <Button variant="outline">受控</Button>
  </Popconfirm>
</template>`
