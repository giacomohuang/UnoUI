import type { ParamTableRow } from '@/components/ParamTable.vue'

export const millerColumnsProps: ParamTableRow[] = [
  { name: 'modelValue', type: '(string | number)[]', default: '（必填）', desc: '当前选中路径，用 v-model 绑定' },
  { name: 'dataSource', type: 'Map<string | number, T> | T[]', default: '（必填）', desc: '扁平层级数据源' },
  { name: 'idKey', type: 'keyof T', default: `'id'`, desc: '节点唯一标识字段' },
  { name: 'parentIdKey', type: 'keyof T', default: `'pid'`, desc: '父节点字段，根节点为 null' },
  { name: 'orderKey', type: 'keyof T', default: `'order'`, desc: '同级排序字段，拖拽排序后会回写' },
  { name: 'width', type: 'string', default: `'800px'`, desc: '组件整体宽度' },
  { name: 'height', type: 'string', default: `'600px'`, desc: '列内容滚动区域高度' },
  { name: 'minHeight', type: 'string', default: `'600px'`, desc: '组件和列内容最小高度' },
  { name: 'columnWidth', type: 'string', default: `'16rem'`, desc: '单列宽度' },
  { name: 'colWidth', type: 'string', default: 'undefined', desc: '兼容旧 mpMillerColumns 的列宽别名' },
  { name: 'showInfoPanel', type: 'boolean', default: 'true', desc: '是否显示右侧信息面板' },
  { name: 'infoPanelWidth', type: 'string', default: `'300px'`, desc: '右侧信息面板宽度' },
  { name: 'sortable', type: 'boolean', default: 'false', desc: '是否启用同列拖拽排序' },
  { name: 'emptyText', type: 'string', default: `'空'`, desc: '空列提示文案' },
  { name: 'noDataText', type: 'string', default: `'暂无数据'`, desc: '无数据提示文案' },
  { name: 'radius', type: `'none' | 'sm' | 'md' | 'lg'`, default: `'lg'`, desc: '外层圆角' },
  { name: 'bordered', type: 'boolean', default: 'true', desc: '是否显示外层边框' },
  { name: 'autoHideScrollbar', type: 'boolean', default: 'false', desc: '是否自动隐藏滚动条' },
  { name: 'ariaLabel', type: 'string', default: `'层级列表'`, desc: '层级列无障碍名称' }
]

export const millerColumnsEmits: ParamTableRow[] = [
  { name: 'update:modelValue', params: '(string | number)[]', desc: '选中路径更新' },
  { name: 'select', params: 'MillerColumnsSelectEvent<T>', desc: '点击节点时触发，包含 ids、id、item、columnIndex' },
  { name: 'reorder', params: '(string | number)[]', desc: '同列拖拽排序完成后触发' }
]

export const millerColumnsSlots: ParamTableRow[] = [
  { name: 'col-title', scoped: '{ colIndex, itemCount, parentId }', desc: '自定义每列标题栏' },
  { name: 'item-left', scoped: '{ item, active, colIndex }', desc: '节点左侧内容' },
  { name: 'item-right', scoped: '{ item, active, colIndex }', desc: '节点右侧内容，子级箭头由组件自动追加' },
  { name: 'info-panel', scoped: '{ item }', desc: '右侧详情面板内容，item 为当前路径最后一个节点' }
]

export const millerColumnsCodeExample = `<script setup lang="ts">
import { ref } from 'vue'
import { MillerColumns, type MillerColumnsId } from '@unoui/vue/millercolumns'
import { Tag } from '@unoui/vue/tag'

interface ResourceNode extends Record<string, unknown> {
  id: number
  pid: number | null
  order: number
  name: string
  type: string
  status: string
}

const selectedIds = ref<MillerColumnsId[]>([1, 3])
const resourceMap = new Map<MillerColumnsId, ResourceNode>([
  [1, { id: 1, pid: null, order: 0, name: '系统管理', type: '目录', status: '启用' }],
  [2, { id: 2, pid: null, order: 1, name: '地图管理', type: '目录', status: '启用' }],
  [3, { id: 3, pid: 1, order: 0, name: '角色管理', type: '页面', status: '启用' }],
  [4, { id: 4, pid: 1, order: 1, name: '资源管理', type: '页面', status: '维护中' }]
])
</script>

<template>
  <MillerColumns
    v-model="selectedIds"
    :data-source="resourceMap"
    id-key="id"
    parent-id-key="pid"
    order-key="order"
    width="100%"
    height="360px"
    min-height="360px"
    column-width="15rem"
    sortable
  >
    <template #col-title="{ colIndex, itemCount }">
      <span>第 {{ colIndex + 1 }} 层</span>
      <Tag color="gray" size="sm">{{ itemCount }}</Tag>
    </template>

    <template #item-left="{ item }">
      <span>{{ item.name }}</span>
    </template>

    <template #item-right="{ item }">
      <Tag size="sm" :color="item.status === '启用' ? 'green' : 'yellow'">
        {{ item.status }}
      </Tag>
    </template>

    <template #info-panel="{ item }">
      <div v-if="item" class="p-4">
        <div class="text-base font-bold">{{ item.name }}</div>
        <div class="mt-2 text-sm text-tertiary">{{ item.type }}</div>
      </div>
    </template>
  </MillerColumns>
</template>`
