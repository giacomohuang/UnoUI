import type { ParamTableRow } from '@/components/ParamTable.vue'

export const paginationProps: ParamTableRow[] = [
  { name: 'total', type: 'number', default: '0', desc: '数据总条数' },
  { name: 'pageSize', type: 'number', default: 'undefined', desc: '受控的每页条数（与 defaultPageSize 二选一）' },
  { name: 'defaultPageSize', type: 'number', default: '10', desc: '非受控的默认每页条数' },
  { name: 'currentPage', type: 'number', default: 'undefined', desc: '受控的当前页码（与 defaultCurrentPage 二选一）' },
  { name: 'defaultCurrentPage', type: 'number', default: '1', desc: '非受控的默认当前页码' },
  { name: 'pageSizes', type: 'number[]', default: '[10, 20, 50, 100]', desc: '每页条数选项' },
  { name: 'pagerCount', type: 'number (奇数, ≥5)', default: '7', desc: '页码按钮数量' },
  { name: 'layout', type: 'string', default: `'prev, pager, next, jumper, ->, total, sizes'`, desc: '分页布局字符串，-> 为右对齐分隔' },
  { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'`, desc: '尺寸' },
  { name: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
  { name: 'hideOnSinglePage', type: 'boolean', default: 'false', desc: '只有一页时是否隐藏分页' },
  { name: 'background', type: 'boolean', default: 'false', desc: '是否显示页码背景色' },
  { name: 'totalText', type: 'string', default: `'共'`, desc: '总条数前缀文案' },
  { name: 'pageSizeSuffix', type: 'string', default: `'条/页'`, desc: '每页条数后缀文案' },
  { name: 'jumperText', type: 'string', default: `'前往'`, desc: '跳转输入框前缀文案' },
  { name: 'prevText', type: 'string', default: `''`, desc: '上一页按钮文本（空则用图标）' },
  { name: 'nextText', type: 'string', default: `''`, desc: '下一页按钮文本（空则用图标）' }
]

export const paginationEmits: ParamTableRow[] = [
  { name: 'update:currentPage', params: 'number', desc: '当前页码状态更新' },
  { name: 'update:pageSize', params: 'number', desc: '每页条数状态更新' },
  { name: 'current-change', params: 'number', desc: '页码改变时触发' },
  { name: 'size-change', params: 'number', desc: '每页条数改变时触发' },
  { name: 'change', params: '(currentPage, pageSize)', desc: '页码或每页条数变化时触发' }
]

export const paginationCodeExample = `<script setup>
import { ref } from 'vue'
import { Pagination } from '@mcistudio/unoui-vue/pagination'

const currentPage = ref(1)
const pageSize = ref(20)
const total = 256

function handleChange(page: number, size: number) {
  console.log('分页变化:', page, size)
}
</script>

<template>
  <!-- 完整分页 -->
  <Pagination :total="total" v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              @change="handleChange" />

  <!-- 自定义布局 -->
  <Pagination :total="total" layout="prev, pager, next"
              size="sm" />

  <!-- 带页码背景 -->
  <Pagination :total="total" background
              :page-sizes="[5, 15, 30]" />
</template>`
