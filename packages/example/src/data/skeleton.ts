import type { ParamTableRow } from '@/components/ParamTable.vue'

export const skeletonProps: ParamTableRow[] = [
  { name: 'variant', type: `'line' | 'list' | 'grid' | 'article' | 'table' | 'columns'`, default: `'table'`, desc: '骨架屏布局变体' },
  { name: 'rows', type: 'number', default: '6', desc: '行数（table/grid/list 模式）或正文行数（article 模式）' },
  { name: 'columns', type: 'number', default: '5', desc: '列数（table/grid 模式）' },
  { name: 'infoRows', type: 'number', default: '3', desc: '信息面板行数' },
  { name: 'width', type: 'string', default: `'100%'`, desc: '整体宽度' },
  { name: 'height', type: 'string', default: `'auto'`, desc: '整体高度' },
  { name: 'minHeight', type: 'string', default: `'240px'`, desc: '最小高度' },
  { name: 'itemHeight', type: 'string', default: `'56px'`, desc: '每项高度（list 模式）' },
  { name: 'columnWidth', type: 'string', default: `'16rem'`, desc: '每列宽度（columns 模式）' },
  { name: 'infoPanelWidth', type: 'string', default: `'300px'`, desc: '信息面板宽度（columns 模式）' },
  { name: 'showInfoPanel', type: 'boolean', default: 'false', desc: '是否显示信息面板（columns 模式）' },
  { name: 'padded', type: 'boolean', default: 'false', desc: '是否添加内边距' }
]

export const skeletonCodeExample = `<script setup>
import { Skeleton } from '@unoui/vue/skeleton'
</script>

<template>
  <!-- 表格骨架屏 -->
  <Skeleton variant="table" :rows="6" :columns="5" />

  <!-- 列表骨架屏 -->
  <Skeleton variant="list" :rows="4" />

  <!-- 网格骨架屏 -->
  <Skeleton variant="grid" :rows="3" :columns="3" />

  <!-- 文章骨架屏 -->
  <Skeleton variant="article" :rows="6" padded />

  <!-- 带信息面板 -->
  <Skeleton variant="columns" :rows="5" :columns="2"
                show-info-panel :info-rows="4" />

  <!-- 单行文本 -->
  <Skeleton variant="line" />
</template>`
