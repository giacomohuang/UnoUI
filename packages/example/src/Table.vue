<template>
  <section id="showcase-table" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">Table</h2>
      <p class="mt-1 text-xs text-tertiary">包含排序、筛选、固定列、斑马纹、横纵分割线和空状态。</p>
    </div>
    <div class="grid gap-5 p-4">
      <Table :rows="tableRows" :columns="tableColumns" row-key="id" min-width="900px" max-height="280px" stripe show-vertical-lines />
      <Table :rows="[]" :columns="tableColumns.slice(0, 3)" row-key="id" radius="sm" size="lg" empty-text="暂无展示数据" />
    </div>

    <!-- API 参数 -->
    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数 — Table</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="tableApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="tableProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="tableEmits" />
          </TabPane>
          <TabPane name="slots" label="Slots">
            <ParamTable :columns="slotsColumns" :rows="tableSlots" />
          </TabPane>
        </Tabs>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数 — TableColumn</h3>
      </div>
      <div class="p-4">
        <ParamTable :columns="propsColumns" :rows="tableColumnConfig" />
      </div>
    </div>

    <!-- 示例代码 -->
    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">示例代码</h3>
      </div>
      <div class="p-4">
        <CodeBlock :code="tableCodeExample" lang="html" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Table, type TableColumn } from '@mcistudio/unoui-vue/table'
import { Tabs, TabPane } from '@mcistudio/unoui-vue/tab'
import { propsColumns, emitsColumns, slotsColumns } from '@/data/shared'
import { tableProps, tableEmits, tableSlots, tableColumnConfig, tableCodeExample } from '@/data/table'
import ParamTable from '@/components/ParamTable.vue'
import CodeBlock from '@/components/CodeBlock.vue'

const tableApiTab = ref('props')

interface ShowcaseRow {
  id: number
  name: string
  type: string
  status: string
  count: number
  updatedAt: string
}

const tableRows: ShowcaseRow[] = [
  { id: 1, name: '品牌按钮', type: 'button', status: 'stable', count: 24, updatedAt: '2026-06-23' },
  { id: 2, name: '状态标签', type: 'tag', status: 'review', count: 21, updatedAt: '2026-06-23' },
  { id: 3, name: '下拉菜单', type: 'dropdown', status: 'stable', count: 8, updatedAt: '2026-06-22' },
  { id: 4, name: '表格组件', type: 'table', status: 'draft', count: 12, updatedAt: '2026-06-21' },
  { id: 5, name: '弹窗容器', type: 'modal', status: 'stable', count: 4, updatedAt: '2026-06-20' }
]

const tableColumns: TableColumn<ShowcaseRow>[] = [
  { key: 'id', title: 'ID', dataIndex: 'id', width: 80, fixed: 'left', sortable: true, align: 'right' },
  { key: 'name', title: '名称', dataIndex: 'name', minWidth: 180, sortable: true },
  {
    key: 'type',
    title: '类型',
    dataIndex: 'type',
    width: 140,
    filters: [
      { label: 'button', value: 'button' },
      { label: 'tag', value: 'tag' },
      { label: 'dropdown', value: 'dropdown' },
      { label: 'table', value: 'table' },
      { label: 'modal', value: 'modal' }
    ]
  },
  {
    key: 'status',
    title: '状态',
    dataIndex: 'status',
    width: 140,
    filters: [
      { label: 'stable', value: 'stable' },
      { label: 'review', value: 'review' },
      { label: 'draft', value: 'draft' }
    ],
    filterMultiple: false
  },
  { key: 'count', title: '数量', dataIndex: 'count', width: 120, sortable: true, align: 'right' },
  { key: 'updatedAt', title: '更新时间', dataIndex: 'updatedAt', width: 160, fixed: 'right' }
]
</script>
