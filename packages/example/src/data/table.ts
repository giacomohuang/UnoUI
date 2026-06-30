import type { ParamTableRow } from '@/components/ParamTable.vue'

export const tableColumnConfig: ParamTableRow[] = [
  { name: 'key', type: 'string', default: '（必填）', desc: '列唯一标识，也用于 slot 命名' },
  { name: 'title', type: 'string', default: '（必填）', desc: '列标题文本' },
  { name: 'dataIndex', type: 'string', default: '同 key', desc: '从行数据读取值的字段路径' },
  { name: 'width', type: 'number | string', default: 'undefined', desc: '列宽' },
  { name: 'minWidth', type: 'number | string', default: 'undefined', desc: '最小列宽' },
  { name: 'maxWidth', type: 'number | string', default: 'undefined', desc: '最大列宽' },
  { name: 'align', type: `'left' | 'center' | 'right'`, default: `'left'`, desc: '列对齐方式' },
  { name: 'fixed', type: `'left' | 'right'`, default: 'undefined', desc: '固定列位置' },
  { name: 'sortable', type: `boolean | ((a, b) => number)`, default: 'undefined', desc: '是否可排序，可传自定义比较函数' },
  { name: 'defaultSortDirection', type: `'asc' | 'desc'`, default: 'undefined', desc: '默认排序方向' },
  { name: 'filters', type: 'TableFilterOption[]', default: 'undefined', desc: '筛选选项列表' },
  { name: 'filterMultiple', type: 'boolean', default: 'undefined', desc: '是否允许多选筛选' },
  { name: 'filterFn', type: '(row, selectedValues) => boolean', default: 'undefined', desc: '自定义筛选函数' },
  { name: 'formatter', type: '(value, row, index) => string | number', default: 'undefined', desc: '单元格值格式化函数' },
  { name: 'class', type: `string | ((row, index) => string)`, default: 'undefined', desc: '单元格自定义类名' },
  { name: 'headerClass', type: 'string', default: 'undefined', desc: '表头自定义类名' },
  { name: 'wrap', type: 'boolean', default: 'undefined', desc: '是否允许单元格内换行' }
]

export const tableProps: ParamTableRow[] = [
  { name: 'rows', type: 'T[]', default: '（必填）', desc: '表格数据行数组' },
  { name: 'columns', type: 'TableColumn<T>[]', default: '（必填）', desc: '列定义数组' },
  { name: 'rowKey', type: 'string | (row, index) => string | number', default: '（必填）', desc: '行唯一标识字段或函数' },
  { name: 'sort', type: 'TableSortState | null', default: 'undefined', desc: '受控排序状态' },
  { name: 'defaultSort', type: 'TableSortState | null', default: 'null', desc: '非受控默认排序' },
  { name: 'filters', type: 'TableFiltersState', default: 'undefined', desc: '受控筛选状态' },
  { name: 'defaultFilters', type: 'TableFiltersState', default: '{}', desc: '非受控默认筛选' },
  { name: 'maxHeight', type: 'string', default: 'undefined', desc: '最大高度，超出可滚动' },
  { name: 'minWidth', type: 'string', default: 'undefined', desc: '最小宽度' },
  { name: 'stickyHeader', type: 'boolean', default: 'true', desc: '是否固定表头' },
  { name: 'allowClearSort', type: 'boolean', default: 'true', desc: '是否允许取消排序回到无序' },
  { name: 'stripe', type: 'boolean', default: 'false', desc: '是否斑马纹' },
  { name: 'radius', type: `'none' | 'sm' | 'md' | 'lg'`, default: `'md'`, desc: '圆角' },
  { name: 'size', type: `'md' | 'lg'`, default: `'md'`, desc: '尺寸' },
  { name: 'showHorizontalLines', type: 'boolean', default: 'true', desc: '是否显示水平分割线' },
  { name: 'showVerticalLines', type: 'boolean', default: 'false', desc: '是否显示垂直分割线' },
  { name: 'bordered', type: 'boolean', default: 'true', desc: '是否显示外边框' },
  { name: 'autoHideScrollbar', type: 'boolean', default: 'false', desc: '是否自动隐藏滚动条' },
  { name: 'emptyText', type: 'string', default: `'暂无数据'`, desc: '空数据文案' },
  { name: 'filterResetText', type: 'string', default: `'清空'`, desc: '筛选重置按钮文案' },
  { name: 'filterEmptyText', type: 'string', default: `'暂无选项'`, desc: '筛选选项为空时的文案' }
]

export const tableEmits: ParamTableRow[] = [
  { name: 'update:sort', params: 'TableSortState | null', desc: '受控排序状态更新' },
  { name: 'sort-change', params: 'TableSortState | null', desc: '排序变化时触发' },
  { name: 'update:filters', params: 'TableFiltersState', desc: '受控筛选状态更新' },
  { name: 'filter-change', params: 'TableFiltersState', desc: '筛选变化时触发' },
  { name: 'row-click', params: '(row, index)', desc: '行点击时触发' }
]

export const tableSlots: ParamTableRow[] = [
  { name: 'header-{key}', scoped: '{ column }', desc: '自定义列的表头' },
  { name: 'cell-{key}', scoped: '{ row, column, value, index }', desc: '自定义列单元格渲染' },
  { name: 'cell', scoped: '{ row, column, value, index }', desc: '通用自定义单元格回退' },
  { name: 'empty', scoped: '—', desc: '无数据时自定义空态' }
]

export const tableCodeExample = `<script setup lang="ts">
import { ref } from 'vue'
import { Table, type TableColumn } from '@unoui/vue/table'
import { Tag } from '@unoui/vue/tag'

interface DataRow {
  id: number
  name: string
  status: string
  count: number
}

const rows: DataRow[] = [
  { id: 1, name: '主入口', status: 'active', count: 128 },
  { id: 2, name: '电梯厅', status: 'inactive', count: 42 },
  { id: 3, name: '扶梯区', status: 'active', count: 256 },
]

const columns: TableColumn<DataRow>[] = [
  { key: 'id', title: '编号', width: 80, align: 'center' },
  { key: 'name', title: '名称', sortable: true },
  { key: 'status', title: '状态' },
  { key: 'count', title: '数量', sortable: true, align: 'right' },
]
</script>

<template>
  <Table :rows="rows" :columns="columns" row-key="id"
         stripe :max-height="400">
    <!-- 自定义状态列 -->
    <template #cell-status="{ value }">
      <Tag :color="value === 'active' ? 'green' : 'gray'">
        {{ value === 'active' ? '启用' : '停用' }}
      </Tag>
    </template>
  </Table>
</template>`
