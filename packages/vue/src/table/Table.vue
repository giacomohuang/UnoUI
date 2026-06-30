<script setup lang="ts" generic="T extends TableRow = TableRow">
import { clsx } from 'clsx'
import SimpleBar from 'simplebar-vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'

import { Dropdown } from '../dropdown'

import '../assets/simplebar.css'
import 'simplebar-vue/dist/simplebar.min.css'

import type { TableColumn, TableFiltersState, TableRadius, TableRow, TableSize, TableSortState } from './types'

interface ColumnState {
  column: TableColumn<T>
  index: number
  fixed?: 'left' | 'right'
  left?: number
  right?: number
  isLeftEdge: boolean
  isRightEdge: boolean
}

type SimpleBarComponent = InstanceType<typeof SimpleBar> & {
  recalculate?: () => void
  getScrollElement?: () => HTMLElement
  $el?: HTMLElement
}

const props = withDefaults(
  defineProps<{
    /** rows 是表格原始数据源。 */
    rows: T[]
    /** columns 是列配置，控制渲染、排序、筛选和固定列。 */
    columns: TableColumn<T>[]
    /** rowKey 是行唯一键字段或取值函数。 */
    rowKey: keyof T | string | ((row: T, index: number) => string | number)
    /** sort 传入后表格排序变为受控状态。 */
    sort?: TableSortState | null
    /** defaultSort 是非受控排序初始值。 */
    defaultSort?: TableSortState | null
    /** filters 传入后表格筛选变为受控状态。 */
    filters?: TableFiltersState
    /** defaultFilters 是非受控筛选初始值。 */
    defaultFilters?: TableFiltersState
    /** maxHeight 是 SimpleBar 滚动区域最大高度。 */
    maxHeight?: string
    /** minWidth 是表格整体最小宽度。 */
    minWidth?: string
    /** stickyHeader 控制是否固定表头。 */
    stickyHeader?: boolean
    /** allowClearSort 控制排序是否允许从降序再次点击后清空。 */
    allowClearSort?: boolean
    /** stripe 控制是否展示斑马纹行背景。 */
    stripe?: boolean
    /** radius 控制表格外框圆角。 */
    radius?: TableRadius
    /** size 控制表格字号和行高。 */
    size?: TableSize
    /** showHorizontalLines 控制是否展示横向表格线。 */
    showHorizontalLines?: boolean
    /** showVerticalLines 控制是否展示纵向表格线。 */
    showVerticalLines?: boolean
    /** bordered 控制是否展示外边框。 */
    bordered?: boolean
    /** autoHideScrollbar 控制 SimpleBar 滚动条是否自动隐藏。 */
    autoHideScrollbar?: boolean
    /** emptyText 是空数据文案。 */
    emptyText?: string
    /** filterResetText 是筛选菜单清空按钮文案。 */
    filterResetText?: string
    /** filterEmptyText 是筛选菜单无选项文案。 */
    filterEmptyText?: string
  }>(),
  {
    defaultSort: null,
    defaultFilters: () => ({}),
    stickyHeader: true,
    allowClearSort: true,
    stripe: false,
    radius: 'md',
    size: 'md',
    showHorizontalLines: true,
    showVerticalLines: false,
    bordered: true,
    autoHideScrollbar: false,
    emptyText: '暂无数据',
    filterResetText: '清空',
    filterEmptyText: '暂无选项'
  }
)

const emit = defineEmits<{
  (e: 'update:sort', value: TableSortState | null): void
  (e: 'sort-change', value: TableSortState | null): void
  (e: 'update:filters', value: TableFiltersState): void
  (e: 'filter-change', value: TableFiltersState): void
  (e: 'row-click', row: T, index: number): void
}>()

const simplebarRef = ref<SimpleBarComponent | null>(null)
const tableRootRef = useTemplateRef<HTMLElement>('tableRoot')
const tableElementRef = useTemplateRef<HTMLTableElement>('tableElement')
const internalSort = ref<TableSortState | null>(props.defaultSort)
const internalFilters = ref<TableFiltersState>({ ...props.defaultFilters })
const hasScrollLeft = ref(false)
const hasScrollRight = ref(false)
let resizeObserver: ResizeObserver | null = null
let resizeFrame = 0

const radiusClass = computed(() => {
  const map: Record<TableRadius, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg'
  }
  return map[props.radius]
})

const sizeClasses = computed(() => {
  const map: Record<TableSize, { table: string; header: string; cell: string; empty: string }> = {
    md: {
      table: 'text-sm leading-5',
      header: 'px-3 py-2 text-xs',
      cell: 'px-3 py-2 text-secondary',
      empty: 'px-3 py-10 text-sm'
    },
    lg: {
      table: 'text-base leading-6',
      header: 'px-4 py-3 text-sm',
      cell: 'px-4 py-3 text-secondary',
      empty: 'px-4 py-12 text-base'
    }
  }
  return map[props.size]
})

const activeSort = computed(() => (props.sort === undefined ? internalSort.value : props.sort))
const activeFilters = computed(() => (props.filters === undefined ? internalFilters.value : props.filters))

const toCssLength = (value?: number | string) => {
  if (typeof value === 'number') return `${value}px`
  return value
}

const toPixelWidth = (value?: number | string) => {
  if (typeof value === 'number') return value
  const match = value?.match(/^(\d+(?:\.\d+)?)px$/)
  return match ? Number(match[1]) : 0
}

const columnWidth = (column: TableColumn<T>) => toPixelWidth(column.width ?? column.minWidth)

const columnStates = computed<ColumnState[]>(() => {
  const states: ColumnState[] = props.columns.map((column, index) => ({
    column,
    index,
    fixed: column.fixed,
    isLeftEdge: false,
    isRightEdge: false
  }))

  let left = 0
  states.forEach((state) => {
    if (state.fixed !== 'left') return
    state.left = left
    left += columnWidth(state.column)
  })

  let right = 0
  ;[...states].reverse().forEach((state) => {
    if (state.fixed !== 'right') return
    state.right = right
    right += columnWidth(state.column)
  })

  const leftFixed = states.filter((state) => state.fixed === 'left')
  const rightFixed = states.filter((state) => state.fixed === 'right')
  const leftEdge = leftFixed.at(-1)
  const rightEdge = rightFixed[0]
  if (leftEdge) leftEdge.isLeftEdge = true
  if (rightEdge) rightEdge.isRightEdge = true

  return states
})

const tableStyle = computed(() => ({
  minWidth: props.minWidth || undefined
}))

const tableLayoutSignature = computed(() => props.columns.map((column) => [column.key, column.width ?? '', column.minWidth ?? '', column.maxWidth ?? '', column.fixed ?? ''].join(':')).join('|'))

const getScrollElement = () => {
  const current = simplebarRef.value
  if (!current) return null
  if (typeof current.getScrollElement === 'function') return current.getScrollElement()
  return current.$el?.querySelector('.simplebar-content-wrapper') as HTMLElement | null
}

// 同步水平滚动状态，用于固定列边缘阴影。
const updateScrollState = () => {
  const el = getScrollElement()
  if (!el) return
  hasScrollLeft.value = el.scrollLeft > 0
  hasScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
}

const handleScroll = () => updateScrollState()

// 表格所在容器或内容尺寸变化后，主动刷新 SimpleBar 的滚动尺寸与固定列阴影状态。
const scheduleTableResize = () => {
  if (resizeFrame) cancelAnimationFrame(resizeFrame)
  resizeFrame = requestAnimationFrame(() => {
    resizeFrame = 0
    nextTick(() => {
      simplebarRef.value?.recalculate?.()
      updateScrollState()
    })
  })
}

watch(
  () => [props.rows.length, tableLayoutSignature.value, props.minWidth, props.maxHeight],
  () => scheduleTableResize()
)

onMounted(() => {
  resizeObserver = new ResizeObserver(() => scheduleTableResize())
  if (tableRootRef.value) resizeObserver.observe(tableRootRef.value)
  if (tableElementRef.value) resizeObserver.observe(tableElementRef.value)
  window.addEventListener('resize', scheduleTableResize)
  scheduleTableResize()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', scheduleTableResize)
  resizeObserver?.disconnect()
  resizeObserver = null
  if (resizeFrame) {
    cancelAnimationFrame(resizeFrame)
    resizeFrame = 0
  }
})

const getValueByPath = (row: T, path?: keyof T | string) => {
  if (!path) return undefined
  const key = String(path)
  if (!key.includes('.')) return row[key as keyof T]
  return key.split('.').reduce<unknown>((value, part) => {
    if (value === null || typeof value !== 'object') return undefined
    return (value as Record<string, unknown>)[part]
  }, row)
}

const getColumnValue = (row: T, column: TableColumn<T>) => getValueByPath(row, column.dataIndex ?? column.key)

const getFilterLabel = (item: unknown) => {
  if (typeof item === 'object' && item !== null && 'label' in item) return String((item as { label?: unknown }).label ?? '')
  return ''
}

const comparePrimitive = (a: unknown, b: unknown) => {
  if (a === b) return 0
  if (a === undefined || a === null) return 1
  if (b === undefined || b === null) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  return String(a).localeCompare(String(b), 'zh-Hans-CN', { numeric: true, sensitivity: 'base' })
}

const filteredRows = computed(() => {
  const filters = activeFilters.value
  return props.rows.filter((row) =>
    props.columns.every((column) => {
      const selected = filters[column.key] || []
      if (!selected.length) return true
      if (column.filterFn) return column.filterFn(row, selected)
      return selected.includes(getColumnValue(row, column))
    })
  )
})

const displayedRows = computed(() => {
  const sort = activeSort.value
  if (!sort) return filteredRows.value

  const column = props.columns.find((item) => item.key === sort.key)
  if (!column) return filteredRows.value

  return filteredRows.value
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const result = typeof column.sortable === 'function' ? column.sortable(a.row, b.row) : comparePrimitive(getColumnValue(a.row, column), getColumnValue(b.row, column))
      const sorted = sort.direction === 'asc' ? result : -result
      return sorted || a.index - b.index
    })
    .map((item) => item.row)
})

const getRowKey = (row: T, index: number) => {
  if (typeof props.rowKey === 'function') return props.rowKey(row, index)
  const value = getValueByPath(row, props.rowKey)
  return typeof value === 'string' || typeof value === 'number' ? value : index
}

const setSort = (value: TableSortState | null) => {
  if (props.sort === undefined) internalSort.value = value
  emit('update:sort', value)
  emit('sort-change', value)
}

const toggleSort = (column: TableColumn<T>) => {
  if (!column.sortable) return

  const current = activeSort.value
  if (current?.key !== column.key) {
    setSort({ key: column.key, direction: column.defaultSortDirection || 'asc' })
    return
  }

  if (current.direction === 'asc') {
    setSort({ key: column.key, direction: 'desc' })
    return
  }

  setSort(props.allowClearSort ? null : { key: column.key, direction: 'asc' })
}

const setFilters = (value: TableFiltersState) => {
  if (props.filters === undefined) internalFilters.value = value
  emit('update:filters', value)
  emit('filter-change', value)
  nextTick(updateScrollState)
}

const handleFilterValueChange = (column: TableColumn<T>, value: unknown) => {
  const selected = Array.isArray(value) ? value : value === undefined || value === null ? [] : [value]
  const nextSelected = column.filterMultiple === false && selected.length > 1 ? selected.slice(-1) : selected
  setFilters({
    ...activeFilters.value,
    [column.key]: nextSelected
  })
}

const clearColumnFilter = (column: TableColumn<T>) => {
  const next = { ...activeFilters.value }
  delete next[column.key]
  setFilters(next)
}

const isFilterActive = (column: TableColumn<T>) => (activeFilters.value[column.key] || []).length > 0

const formatCellValue = (row: T, column: TableColumn<T>, index: number) => {
  const value = getColumnValue(row, column)
  if (column.formatter) return column.formatter(value, row, index)
  if (value === undefined || value === null || value === '') return '-'
  return String(value)
}

const getAlignClass = (align?: TableColumn<T>['align']) => {
  if (align === 'center') return 'text-center'
  if (align === 'right') return 'text-right'
  return 'text-left'
}

const getHeaderJustifyClass = (align?: TableColumn<T>['align']) => {
  if (align === 'center') return 'justify-center'
  if (align === 'right') return 'justify-end'
  return 'justify-start'
}

const getColumnStyle = (state: ColumnState) => {
  const column = state.column
  return {
    width: toCssLength(column.width),
    minWidth: toCssLength(column.minWidth ?? column.width),
    maxWidth: toCssLength(column.maxWidth ?? column.width),
    left: state.fixed === 'left' ? `${state.left || 0}px` : undefined,
    right: state.fixed === 'right' ? `${state.right || 0}px` : undefined
  }
}

const getHeaderClass = (state: ColumnState) => {
  const column = state.column
  return clsx(
    'relative bg-secondary font-bold uppercase text-tertiary whitespace-nowrap',
    sizeClasses.value.header,
    getAlignClass(column.align),
    props.stickyHeader && 'sticky top-0 z-20',
    state.fixed && 'sticky z-30',
    state.isLeftEdge && 'ui-table__cell--fixed-left-edge',
    state.isRightEdge && 'ui-table__cell--fixed-right-edge',
    props.showVerticalLines && state.index < props.columns.length - 1 && 'border-r border-medium/60',
    props.showHorizontalLines && 'border-b border-medium/70',
    column.headerClass
  )
}

const getCellClass = (state: ColumnState, row: T, index: number) => {
  const column = state.column
  const rowBackground = props.stripe && index % 2 === 1 ? 'bg-secondary' : 'bg-primary'
  const customClass = typeof column.class === 'function' ? column.class(row, index) : column.class
  return clsx(
    'relative align-middle transition-colors group-hover:bg-tertiary',
    sizeClasses.value.cell,
    rowBackground,
    column.wrap ? 'whitespace-normal' : 'whitespace-nowrap',
    getAlignClass(column.align),
    state.fixed && 'sticky z-10',
    state.isLeftEdge && 'ui-table__cell--fixed-left-edge',
    state.isRightEdge && 'ui-table__cell--fixed-right-edge',
    props.showVerticalLines && state.index < props.columns.length - 1 && 'border-r border-medium/60',
    props.showHorizontalLines && index > 0 && 'border-t border-medium/60',
    customClass
  )
}

const getRowClass = (_index: number) => 'group'

const getSortIcon = (column: TableColumn<T>) => {
  const sort = activeSort.value
  if (sort?.key !== column.key) return 'i-lucide:chevrons-up-down'
  return sort.direction === 'asc' ? 'i-lucide:arrow-up-narrow-wide' : 'i-lucide:arrow-down-wide-narrow'
}
</script>

<template>
  <div
    ref="tableRoot"
    :class="clsx('ui-table overflow-hidden bg-primary', radiusClass, bordered && 'border border-medium', hasScrollLeft && 'ui-table--scrolled-left', hasScrollRight && 'ui-table--scrolled-right', showHorizontalLines && 'ui-table--horizontal-lines', showVerticalLines && 'ui-table--vertical-lines')"
  >
    <SimpleBar ref="simplebarRef" class="ui-table__scroll w-full" :auto-hide="autoHideScrollbar" :style="{ maxHeight }" @scroll="handleScroll">
      <table ref="tableElement" class="w-full border-separate border-spacing-0" :class="sizeClasses.table" :style="tableStyle">
        <thead>
          <tr>
            <th v-for="state in columnStates" :key="state.column.key" :class="getHeaderClass(state)" :style="getColumnStyle(state)">
              <div class="flex min-w-0 items-center gap-1.5" :class="getHeaderJustifyClass(state.column.align)">
                <slot :name="`header-${state.column.key}`" :column="state.column">
                  <div
                    v-if="state.column.sortable"
                    class="flex min-w-0 items-center gap-1 rounded px-1 py-0.5 text-xs font-bold transition-colors hover:bg-primary/70"
                    :class="[getHeaderJustifyClass(state.column.align), activeSort?.key === state.column.key ? 'text-brand' : 'text-tertiary']"
                    @click="toggleSort(state.column)"
                  >
                    <span class="truncate">{{ state.column.title }}</span>
                    <span :class="`${getSortIcon(state.column)} size-3.5 flex-shrink-0`"></span>
                  </div>
                  <span v-else class="truncate">{{ state.column.title }}</span>
                </slot>

                <Dropdown v-if="state.column.filters" :value="activeFilters[state.column.key] || []" :items="state.column.filters" value-key="value" align="left" @update:value="handleFilterValueChange(state.column, $event)">
                  <template #trigger="{ open }">
                    <div class="flex size-6 flex-shrink-0 items-center justify-center rounded transition-colors hover:bg-primary/70" :class="open || isFilterActive(state.column) ? 'text-brand' : 'text-tertiary'" title="筛选">
                      <span class="i-lucide:funnel size-3.5"></span>
                    </div>
                  </template>
                  <template #item="{ item, selected }">
                    <div class="flex min-h-9 cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-secondary" :class="selected ? 'bg-brand/10 text-brand' : 'text-primary'">
                      <span class="flex size-4 items-center justify-center rounded border border-medium bg-primary">
                        <span v-if="selected" class="i-lucide:check size-3 text-brand"></span>
                      </span>
                      <span class="min-w-0 truncate">{{ getFilterLabel(item) }}</span>
                    </div>
                  </template>
                  <template v-if="state.column.filters.length === 0" #header>
                    <div class="px-3 py-6 text-center text-sm text-tertiary">{{ filterEmptyText }}</div>
                  </template>
                  <template #footer>
                    <div class="border-t border-medium bg-primary px-2 py-2 flex justify-center">
                      <Button variant="outline" size="sm" class="px-5.5!" @click.stop="clearColumnFilter(state.column)">
                        {{ filterResetText }}
                      </Button>
                    </div>
                  </template>
                </Dropdown>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in displayedRows" :key="getRowKey(row, rowIndex)" :class="getRowClass(rowIndex)" @click="emit('row-click', row, rowIndex)">
            <td v-for="state in columnStates" :key="state.column.key" :class="getCellClass(state, row, rowIndex)" :style="getColumnStyle(state)">
              <slot :name="`cell-${state.column.key}`" :row="row" :column="state.column" :value="getColumnValue(row, state.column)" :index="rowIndex">
                <slot name="cell" :row="row" :column="state.column" :value="getColumnValue(row, state.column)" :index="rowIndex">
                  {{ formatCellValue(row, state.column, rowIndex) }}
                </slot>
              </slot>
            </td>
          </tr>
          <tr v-if="displayedRows.length === 0">
            <td :colspan="columns.length" class="text-center text-tertiary" :class="sizeClasses.empty">
              <slot name="empty">{{ emptyText }}</slot>
            </td>
          </tr>
        </tbody>
      </table>
    </SimpleBar>
  </div>
</template>

<style scoped>
.ui-table :deep(.simplebar-scrollbar::before) {
  opacity: 0 !important;
}

.ui-table:hover :deep(.simplebar-scrollbar::before),
.ui-table :deep(.ui-table__scroll.simplebar-scrolling .simplebar-scrollbar::before),
.ui-table :deep(.ui-table__scroll.simplebar-dragging .simplebar-scrollbar::before) {
  opacity: 1 !important;
}

.ui-table__cell--fixed-left-edge::after,
.ui-table__cell--fixed-right-edge::before {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 10px;
  pointer-events: none;
  content: '';
  opacity: 0;
  transition: opacity 0.16s ease;
}

.ui-table__cell--fixed-left-edge::after {
  right: -10px;
  background: linear-gradient(to right, rgba(15, 23, 42, 0.12), rgba(15, 23, 42, 0));
}

.ui-table__cell--fixed-right-edge::before {
  left: -10px;
  background: linear-gradient(to left, rgba(15, 23, 42, 0.12), rgba(15, 23, 42, 0));
}

.ui-table--scrolled-left .ui-table__cell--fixed-left-edge::after,
.ui-table--scrolled-right .ui-table__cell--fixed-right-edge::before {
  opacity: 1;
}
</style>
