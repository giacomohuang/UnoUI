<template>
  <div class="param-table w-full min-w-0 max-w-full overflow-x-auto">
    <table class="w-full min-w-[480px] border-collapse text-sm" :style="minTableWidth ? { minWidth: minTableWidth } : undefined">
      <thead>
        <tr class="border-b border-medium bg-secondary/60">
          <th v-for="col in columns" :key="col.key" class="px-3 py-2.5 text-left text-xs font-bold uppercase text-tertiary" :style="col.width ? { width: col.width } : {}">
            {{ col.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="rows.length === 0">
          <td :colspan="columns.length" class="px-3 py-6 text-center text-tertiary">暂无数据</td>
        </tr>
        <tr v-for="(row, index) in rows" :key="index" class="border-b border-medium transition-colors last:border-b-0 hover:bg-secondary/30">
          <td v-for="col in columns" :key="col.key" class="px-3 py-2.5 align-middle" :class="col.mono ? 'font-mono text-xs text-secondary' : 'text-secondary'">
            <slot v-if="col.slot" :name="col.slot" :row="row" :value="row[col.key]">
              {{ row[col.key] ?? '—' }}
            </slot>
            <template v-else-if="col.key === 'default' && row.default === undefined">
              <span class="text-tertiary/60">—</span>
            </template>
            <template v-else-if="col.mono && row[col.key]">
              <code class="rounded bg-secondary px-1 py-0.5 text-xs text-brand">{{ row[col.key] }}</code>
            </template>
            <template v-else>
              {{ row[col.key] ?? '—' }}
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
export interface ParamTableColumn {
  key: string
  title: string
  width?: string
  mono?: boolean
  slot?: string
}

export interface ParamTableRow {
  [key: string]: unknown
}

defineProps<{
  /** columns 定义表头结构，key 对应 rows 数据中的字段名。 */
  columns: ParamTableColumn[]
  /** rows 是表格数据行。 */
  rows: ParamTableRow[]
  /** minTableWidth 为内容较长的 API 表设置更宽的横向滚动区域。 */
  minTableWidth?: string
}>()
</script>
