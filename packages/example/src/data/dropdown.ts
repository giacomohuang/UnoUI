import type { ParamTableRow } from '@/components/ParamTable.vue'

export const dropdownProps: ParamTableRow[] = [
  { name: 'items', type: 'object[]', default: 'undefined', desc: '下拉选项数据源，每项可含 disabled 字段' },
  { name: 'valueKey', type: 'string', default: 'undefined', desc: '选项唯一标识字段名' },
  { name: 'align', type: `'left' | 'right'`, default: `'left'`, desc: '下拉菜单对齐方向' },
  { name: 'placement', type: `'bottomLeft' | 'bottom' | 'bottomRight' | 'topLeft' | 'top' | 'topRight'`, default: '按 align 推导', desc: '弹出位置，优先级高于 align' },
  { name: 'trigger', type: `'click' | 'hover' | 'contextMenu' | DropdownTrigger[]`, default: `'click'`, desc: '触发方式，支持点击、悬停和右键菜单' },
  { name: 'arrow', type: `boolean | { pointAtCenter?: boolean }`, default: 'false', desc: '是否显示箭头，支持指向触发器中心' },
  { name: 'autoAdjustOverflow', type: 'boolean', default: 'true', desc: '空间不足时自动翻转并夹取到视口内' },
  { name: 'disabled', type: 'boolean', default: 'false', desc: '禁用触发打开' },
  { name: 'destroyOnHidden', type: 'boolean', default: 'true', desc: '关闭后是否销毁浮层 DOM' },
  { name: 'closeOnSelect', type: 'boolean', default: '单选 true，多选 false', desc: '点击选项后是否关闭' },
  { name: 'minWidth', type: 'string', default: `'128px'`, desc: '最小宽度' },
  { name: 'width', type: 'string', default: 'undefined', desc: '固定宽度' },
  { name: 'maxHeight', type: 'string', default: `'320px'`, desc: '最大高度，超出可滚动' },
  { name: 'contentClass', type: 'string', default: 'undefined', desc: '下拉内容额外 CSS 类名' },
  { name: 'popupStyle', type: 'string | object', default: 'undefined', desc: '浮层额外内联样式' },
  { name: 'focusOnOpen', type: 'boolean', default: 'true', desc: '打开时是否聚焦首项' }
]

export const dropdownEmits: ParamTableRow[] = [
  { name: 'select', params: 'item: object', desc: '选中选项时触发' },
  { name: 'openChange', params: `open: boolean, info: { source: 'trigger' | 'menu' }`, desc: '展开状态变化时触发' },
  { name: 'visible-change', params: 'open: boolean', desc: '展开状态变化兼容事件' }
]

export const dropdownSlots: ParamTableRow[] = [
  { name: 'trigger', scoped: '{ open }', desc: '触发器区域，open 为当前展开状态' },
  { name: 'header', scoped: '—', desc: '下拉菜单顶部固定区域' },
  { name: 'item', scoped: '{ item, index, active, selected }', desc: '自定义选项渲染' },
  { name: 'footer', scoped: '—', desc: '下拉菜单底部固定区域' }
]

export const dropdownCodeExample = `<script setup>
import { ref } from 'vue'
import { Dropdown } from '@unoui/vue/dropdown'
import { Button } from '@unoui/vue/button'

const items = [
  { label: '新建项目', value: 'create' },
  { label: '导入文件', value: 'import' },
  { label: '导出数据', value: 'export' },
  { label: '已锁定', value: 'lock', disabled: true }
]
const selected = ref('')

function handleSelect(item: { label: string; value: string }) {
  selected.value = item.value
}
</script>

<template>
  <Dropdown :items="items" trigger="hover" placement="bottomRight" arrow @select="handleSelect">
    <template #trigger>
      <Button icon="i-lucide:chevron-down">操作</Button>
    </template>
    <template #item="{ item, active }">
      <div class="flex items-center gap-2 px-3 py-2"
           :class="active ? 'bg-secondary' : ''">
        <span>{{ item.label }}</span>
      </div>
    </template>
  </Dropdown>
</template>`
