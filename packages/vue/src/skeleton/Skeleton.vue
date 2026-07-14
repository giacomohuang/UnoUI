<template>
  <div v-if="variant === 'line'" class="animate-pulse rounded-full bg-secondary dark:bg-white/8" :style="{ width, height }" />

  <div v-else-if="variant === 'list'" class="flex flex-col gap-2" :class="paddingClass">
    <div v-for="row in rowItems" :key="row" class="animate-pulse rounded-xl bg-secondary dark:bg-white/8" :style="{ height: itemHeight }" />
  </div>

  <div v-else-if="variant === 'grid'" class="grid gap-4" :class="paddingClass" :style="gridAutoStyle">
    <div v-for="row in rowItems" :key="row" class="aspect-square animate-pulse rounded-xl bg-secondary dark:bg-white/8" />
  </div>

  <div v-else-if="variant === 'article'" data-ui-skeleton="article" class="grid w-full gap-5" :class="paddingClass" :style="{ width }">
    <div data-ui-skeleton-article-title="true" class="h-7 w-3/5 max-w-2xl animate-pulse rounded-full bg-tertiary/90 dark:bg-white/12" />
    <div class="grid gap-3">
      <div v-for="row in rowItems" :key="row" data-ui-skeleton-article-line="true" class="h-4 max-w-full animate-pulse rounded-full bg-secondary dark:bg-white/8" :style="{ width: getArticleLineWidth(row) }" />
    </div>
  </div>

  <div v-else-if="variant === 'columns'" class="flex justify-between overflow-hidden w-full bg-white dark:bg-black border rounded-xl border-stone-200 dark:border-stone-700 shadow-gray-50" :style="{ minHeight, width }">
    <div class="min-w-0 overflow-hidden" :style="columnsViewportStyle">
      <div class="flex">
        <div v-for="column in columnItems" :key="column" class="shrink-0 bg-secondary border-r-1 border-medium" :style="{ width: columnWidth }">
          <div class="flex h-12 items-center justify-between border-b border-medium bg-tertiary/20 px-4">
            <div class="h-4 w-22 animate-pulse rounded-full bg-tertiary dark:bg-white/10" />
            <div class="h-6 w-6 animate-pulse rounded-md border border-medium bg-tertiary/70 dark:bg-white/8" />
          </div>
          <div class="overflow-hidden p-2" :style="{ minHeight, height }">
            <div v-for="row in rowItems" :key="row" class="mb-1 flex items-center justify-between rounded-sm px-3 text-secondary" :class="row === 0 && column === 0 ? 'bg-indigo-600/8 dark:bg-indigo-500/15' : ''" :style="{ height: columnsRowHeight }">
              <div class="flex min-w-0 flex-1 items-center gap-2">
                <div class="h-4 w-4 shrink-0 animate-pulse rounded bg-tertiary dark:bg-white/10" />
                <div class="h-4 animate-pulse rounded-full bg-tertiary dark:bg-white/10" :style="{ width: getColumnRowWidth(row, column) }" />
              </div>
              <div class="ml-3 h-4 w-4 shrink-0 animate-pulse rounded bg-tertiary/90 dark:bg-white/8" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showInfoPanel" class="shadow-[0_0_10px_0_stone-200] z2 dark:(shadow-none) border-l border-medium shrink-0" :style="{ width: infoPanelWidth }">
      <div class="flex flex-col items-center justify-center my-5 gap-2 py-5 b-b border-light">
        <div class="flex items-center justify-center w5rem h5rem rounded-2xl bg-brand-500/10">
          <div class="h-9 w-9 animate-pulse rounded-xl bg-brand-500/30" />
        </div>
        <div class="mt4 mb1 h-7 w-34 animate-pulse rounded-full bg-tertiary/90 dark:bg-white/10" />
        <div class="flex items-center justify-center gap2">
          <div class="h-5 w-14 animate-pulse rounded-sm bg-secondary dark:bg-white/10" />
          <div class="h-5 w-18 animate-pulse rounded-sm bg-secondary dark:bg-white/10" />
        </div>
      </div>
      <div class="mx-5 space-y-1">
        <div v-for="row in infoItems" :key="row" class="flex flex-col gap-1.5 py-3">
          <div class="h-4 w-16 animate-pulse rounded-full bg-secondary dark:bg-white/8" />
          <div class="h-9 animate-pulse rounded-lg bg-secondary dark:bg-white/8" />
        </div>
      </div>
      <div class="mx5 my4 flex items-center justify-center gap-5">
        <div class="h-8 grow animate-pulse rounded-md border border-medium bg-primary" />
        <div class="h-8 grow animate-pulse rounded-md border border-medium bg-primary" />
      </div>
    </div>
  </div>

  <div v-else class="overflow-hidden rounded-lg border border-light bg-primary">
    <div class="grid gap-4 border-b border-light bg-secondary/30 px-4 py-3" :style="tableGridStyle">
      <div v-for="column in columnItems" :key="column" class="h-3 animate-pulse rounded-full bg-tertiary/90 dark:bg-white/10" />
    </div>
    <div class="divide-y divide-light">
      <div v-for="row in rowItems" :key="row" class="grid gap-4 px-4 py-4" :style="tableGridStyle">
        <div v-for="column in columnItems" :key="column" class="h-4 animate-pulse rounded-full bg-secondary dark:bg-white/8" :style="{ width: getCellWidth(column) }" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type SkeletonVariant = 'line' | 'list' | 'grid' | 'article' | 'table' | 'columns'

const props = withDefaults(
  defineProps<{
    variant?: SkeletonVariant
    rows?: number
    columns?: number
    infoRows?: number
    width?: string
    height?: string
    minHeight?: string
    itemHeight?: string
    columnWidth?: string
    infoPanelWidth?: string
    showInfoPanel?: boolean
    padded?: boolean
  }>(),
  {
    variant: 'table',
    rows: 6,
    columns: 5,
    infoRows: 3,
    width: '100%',
    height: 'auto',
    minHeight: '240px',
    itemHeight: '56px',
    columnWidth: '16rem',
    infoPanelWidth: '300px',
    showInfoPanel: false,
    padded: false
  }
)

const rowItems = computed(() => Array.from({ length: props.rows }, (_, index) => index))
const columnItems = computed(() => Array.from({ length: props.columns }, (_, index) => index))
const infoItems = computed(() => Array.from({ length: props.infoRows }, (_, index) => index))
const paddingClass = computed(() => (props.padded ? 'p-3' : ''))
const tableGridStyle = computed(() => ({ gridTemplateColumns: `repeat(${props.columns}, minmax(0, 1fr))` }))
const gridAutoStyle = computed(() => ({ gridTemplateColumns: `repeat(auto-fill, minmax(${props.columnWidth}, 1fr))` }))
const columnsViewportStyle = computed(() => ({ width: `calc(${props.width} - ${props.showInfoPanel ? props.infoPanelWidth : '0px'})` }))
const columnsRowHeight = computed(() => (props.itemHeight === '56px' ? '44px' : props.itemHeight))

// 用固定宽度节奏模拟真实数据列，避免加载态显得过于整齐。
const getCellWidth = (columnIndex: number) => {
  const widths = ['72%', '92%', '58%', '80%', '64%', '48%']
  return widths[columnIndex % widths.length]
}

const getColumnRowWidth = (rowIndex: number, columnIndex: number) => {
  const widths = ['68%', '82%', '56%', '74%', '62%', '88%', '50%']
  return widths[(rowIndex + columnIndex) % widths.length]
}

const getArticleLineWidth = (rowIndex: number) => {
  const widths = ['100%', '96%', '88%', '100%', '92%', '72%']
  return widths[rowIndex % widths.length]
}
</script>
