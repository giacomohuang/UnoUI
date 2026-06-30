<script setup lang="ts" generic="T extends Record<string, unknown>">
import { clsx } from 'clsx'
import SimpleBar from 'simplebar-vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, useTemplateRef, watch } from 'vue'

import '../assets/simplebar.css'
import 'simplebar-vue/dist/simplebar.min.css'

import { DnD } from '../utils/DnD'

import { getUiAttrClass, getUiExposeAttrs } from '../attrs'
import {
  millerColumnsColumn,
  millerColumnsEmpty,
  millerColumnsHeader,
  millerColumnsInfoPanel,
  millerColumnsRoot,
  millerColumnsRow,
  millerColumnsRows,
  type MillerColumnsDataSource,
  type MillerColumnsFieldKey,
  type MillerColumnsId,
  type MillerColumnsParentId,
  type MillerColumnsProps,
  type MillerColumnsSelectEvent
} from '.'

defineOptions({
  inheritAttrs: false
})

type SimpleBarComponent = InstanceType<typeof SimpleBar> & {
  recalculate?: () => void
  getScrollElement?: () => HTMLElement
  $el?: HTMLElement
}

interface MillerColumnsColumnState<T extends Record<string, unknown>> {
  parentId: MillerColumnsParentId
  items: T[]
}

const selectedIds = defineModel<MillerColumnsId[]>('modelValue', { required: true })

const props = withDefaults(
  defineProps<{
    /** dataSource 是扁平层级数据源，支持 Map 或数组。 */
    dataSource: MillerColumnsDataSource<T>
    /** idKey 是节点主键字段。 */
    idKey?: MillerColumnsFieldKey<T>
    /** parentIdKey 是父节点主键字段，根节点值应为 null。 */
    parentIdKey?: MillerColumnsFieldKey<T>
    /** orderKey 是排序字段，开启 sortable 后拖拽排序会回写该字段。 */
    orderKey?: MillerColumnsFieldKey<T>
    /** minHeight 是根容器和列滚动区最小高度。 */
    minHeight?: string
    /** height 是每列内容滚动区高度。 */
    height?: string
    /** width 是根容器宽度。 */
    width?: string
    /** columnWidth 是单列宽度。 */
    columnWidth?: string
    /** colWidth 兼容旧 mpMillerColumns 命名，新代码优先使用 columnWidth。 */
    colWidth?: string
    /** infoPanelWidth 是右侧信息面板宽度。 */
    infoPanelWidth?: string
    /** showInfoPanel 控制是否渲染右侧信息面板。 */
    showInfoPanel?: boolean
    /** sortable 控制节点是否可拖拽排序。 */
    sortable?: boolean
    /** emptyText 是空列文案。 */
    emptyText?: string
    /** noDataText 是无数据文案。 */
    noDataText?: string
    /** radius 控制根容器圆角。 */
    radius?: MillerColumnsProps['radius']
    /** bordered 控制是否展示根容器边框。 */
    bordered?: boolean
    /** autoHideScrollbar 控制 SimpleBar 滚动条是否自动隐藏。 */
    autoHideScrollbar?: boolean
    /** ariaLabel 是层级列的无障碍名称。 */
    ariaLabel?: string
  }>(),
  {
    idKey: 'id' as MillerColumnsFieldKey<T>,
    parentIdKey: 'pid' as MillerColumnsFieldKey<T>,
    orderKey: 'order' as MillerColumnsFieldKey<T>,
    minHeight: '600px',
    height: '600px',
    width: '800px',
    columnWidth: undefined,
    colWidth: undefined,
    infoPanelWidth: '300px',
    showInfoPanel: true,
    sortable: false,
    emptyText: '空',
    noDataText: '暂无数据',
    radius: 'lg',
    bordered: true,
    autoHideScrollbar: false,
    ariaLabel: '层级列表'
  }
)

const emit = defineEmits<{
  (e: 'reorder', ids: MillerColumnsId[]): void
  (e: 'select', value: MillerColumnsSelectEvent<T>): void
}>()

const attrs = useAttrs()
const rootRef = useTemplateRef<HTMLElement>('rootRef')
const columnRefs = useTemplateRef<HTMLUListElement[]>('columnRefs')
const viewportRef = ref<SimpleBarComponent | null>(null)
const columnSimpleBarRefs = ref<SimpleBarComponent[]>([])
const dndList: DnD<MillerColumnsId>[] = []
let emitBySelectItem = false
let resizeFrame = 0

const rootClass = computed(() => clsx(getUiAttrClass(attrs), millerColumnsRoot({ radius: props.radius, bordered: props.bordered })))
const columnWidth = computed(() => props.columnWidth || props.colWidth || '16rem')
const rootStyle = computed(() => ({
  minHeight: props.minHeight,
  width: props.width,
  ...(attrs.style && typeof attrs.style === 'object' ? (attrs.style as Record<string, string>) : {})
}))
const viewportStyle = computed(() => ({
  width: `calc(${props.width} - ${props.showInfoPanel ? props.infoPanelWidth : '0px'})`
}))
const columnScrollStyle = computed(() => ({
  minHeight: props.minHeight,
  height: props.height
}))
const infoPanelStyle = computed(() => ({
  width: props.infoPanelWidth
}))
const itemList = computed(() => normalizeDataSource(props.dataSource))
const hasData = computed(() => itemList.value.length > 0)
const selectedItem = computed(() => {
  const lastId = selectedIds.value.filter((id) => id !== null && id !== undefined).at(-1)
  return lastId === undefined ? null : getItemById(lastId)
})
const columns = computed<MillerColumnsColumnState<T>[]>(() => {
  if (!hasData.value) return []

  const parentIds: MillerColumnsParentId[] = [null, ...selectedIds.value]
  return parentIds.map((parentId) => ({
    parentId,
    items: getChildren(parentId)
  }))
})

function normalizeDataSource(source: MillerColumnsDataSource<T>) {
  if (!source) return []
  return source instanceof Map ? Array.from(source.values()) : source
}

function getItemId(item: T) {
  return item[props.idKey as MillerColumnsFieldKey<T>] as MillerColumnsId
}

function getItemParentId(item: T) {
  const parentId = item[props.parentIdKey as MillerColumnsFieldKey<T>]
  return parentId === undefined ? null : (parentId as MillerColumnsParentId)
}

function getItemOrder(item: T) {
  const order = item[props.orderKey as MillerColumnsFieldKey<T>]
  return typeof order === 'number' && Number.isFinite(order) ? order : 0
}

function getItemById(id: MillerColumnsId) {
  if (props.dataSource instanceof Map) return (props.dataSource.get(id) as T | undefined) ?? null
  return itemList.value.find((item) => Object.is(getItemId(item), id)) ?? null
}

function getItemByDomId(id: MillerColumnsId) {
  return itemList.value.find((item) => String(getItemId(item)) === String(id)) ?? null
}

function getChildren(parentId: MillerColumnsParentId) {
  return itemList.value.filter((item) => Object.is(getItemParentId(item), parentId)).sort((prev, next) => getItemOrder(prev) - getItemOrder(next))
}

function hasChildren(id: MillerColumnsId) {
  return getChildren(id).length > 0
}

function isSelected(id: MillerColumnsId, columnIndex: number) {
  return Object.is(selectedIds.value[columnIndex], id)
}

function getScrollElement(current: SimpleBarComponent | null) {
  if (!current) return null
  if (typeof current.getScrollElement === 'function') return current.getScrollElement()
  return current.$el?.querySelector('.simplebar-content-wrapper') as HTMLElement | null
}

function setColumnSimpleBarRef(element: SimpleBarComponent | null, index: number) {
  if (element) columnSimpleBarRefs.value[index] = element
  else columnSimpleBarRefs.value.splice(index, 1)
}

function destroyDnd() {
  dndList.forEach((dnd) => dnd.destroy())
  dndList.length = 0
}

function initializeDnd() {
  destroyDnd()
  if (!props.sortable) return

  for (const columnRef of columnRefs.value ?? []) {
    const dnd = new DnD<MillerColumnsId>(columnRef, {
      onReorder: (ids) => reorder(ids),
      allowNesting: false
    })
    dnd.init()
    dndList.push(dnd)
  }
}

function scheduleResize() {
  if (resizeFrame) cancelAnimationFrame(resizeFrame)
  resizeFrame = requestAnimationFrame(() => {
    resizeFrame = 0
    nextTick(() => {
      viewportRef.value?.recalculate?.()
      columnSimpleBarRefs.value.forEach((simplebar) => simplebar?.recalculate?.())
    })
  })
}

async function reorder(ids: MillerColumnsId[]) {
  const normalizedIds = ids.map((id) => {
    const item = getItemByDomId(id)
    return item ? getItemId(item) : id
  })

  normalizedIds.forEach((id, index) => {
    const item = getItemById(id)
    if (item) {
      const mutableItem = item as Record<string, unknown>
      mutableItem[props.orderKey as string] = index
    }
  })

  emit('reorder', normalizedIds)
}

function emitSelect(ids: MillerColumnsId[], id: MillerColumnsId, columnIndex: number) {
  emit('select', {
    ids,
    id,
    item: getItemById(id),
    columnIndex
  })
}

function scrollActiveRows(block: ScrollLogicalPosition) {
  const activeRows = rootRef.value?.querySelectorAll('[data-ui-miller-columns-row="true"][data-active="true"]')
  activeRows?.forEach((element) => {
    element.scrollIntoView({ block, behavior: 'instant' })
  })
}

function scrollToColumn(columnIndex: number, behavior: ScrollBehavior = 'smooth') {
  const scrollElement = getScrollElement(viewportRef.value)
  if (!scrollElement) return
  scrollElement.scrollTo({ left: getColumnWidthPx() * columnIndex, behavior })
}

function getColumnWidthPx() {
  return columnRefs.value?.[0]?.offsetWidth || rootRef.value?.querySelector('[data-ui-miller-columns-column="true"]')?.clientWidth || 0
}

function syncAfterSelectionChanged(previousScrollLeft = 0) {
  nextTick(() => {
    initializeDnd()
    const block: ScrollLogicalPosition = emitBySelectItem ? 'nearest' : 'center'
    emitBySelectItem = false
    scrollActiveRows(block)

    const scrollElement = getScrollElement(viewportRef.value)
    if (scrollElement) scrollElement.scrollTo({ left: previousScrollLeft, behavior: 'instant' })
    scrollToColumn(selectedIds.value.length)
    scheduleResize()
  })
}

function selectItem(id: MillerColumnsId, columnIndex: number) {
  const changeSelection = () => {
    const ids = selectedIds.value.slice(0, columnIndex + 1)
    if (!isSelected(id, columnIndex)) {
      ids[columnIndex] = id
    } else if (columnIndex === selectedIds.value.length - 1) {
      ids.pop()
    }

    emitBySelectItem = true
    selectedIds.value = ids
    emitSelect(ids, id, columnIndex)
  }

  if (isSelected(id, columnIndex)) {
    scrollToColumn(Math.max(0, columnIndex - 1))
    window.setTimeout(() => changeSelection(), 180)
    return
  }

  changeSelection()
}

function handleRowKeydown(event: KeyboardEvent, id: MillerColumnsId, columnIndex: number) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  selectItem(id, columnIndex)
}

watch(
  selectedIds,
  (newValue, oldValue) => {
    if (newValue === oldValue) return
    const previousScrollLeft = getScrollElement(viewportRef.value)?.scrollLeft || 0
    syncAfterSelectionChanged(previousScrollLeft)
  },
  { deep: true }
)

watch(
  () => [props.dataSource, props.sortable, props.height, props.minHeight, props.width, columnWidth.value, props.showInfoPanel, props.infoPanelWidth],
  () => {
    nextTick(() => {
      initializeDnd()
      scheduleResize()
    })
  },
  { deep: true }
)

onMounted(() => {
  nextTick(() => {
    initializeDnd()
    scrollActiveRows('center')
    scheduleResize()
  })
})

onBeforeUnmount(() => {
  destroyDnd()
  if (resizeFrame) cancelAnimationFrame(resizeFrame)
})
</script>

<template>
  <div v-bind="getUiExposeAttrs(attrs)" ref="rootRef" :class="rootClass" :style="rootStyle" data-ui-miller-columns="true">
    <SimpleBar v-if="hasData" ref="viewportRef" :auto-hide="autoHideScrollbar" :style="viewportStyle" role="tree" :aria-label="ariaLabel">
      <div class="flex">
        <div v-for="(column, columnIndex) in columns" :key="`${String(column.parentId)}-${columnIndex}`" :class="millerColumnsColumn()" :style="{ width: columnWidth }" data-ui-miller-columns-column="true">
          <div :class="millerColumnsHeader()">
            <slot name="col-title" :colIndex="columnIndex" :itemCount="column.items.length" :parentId="column.parentId" />
          </div>
          <SimpleBar :ref="(element) => setColumnSimpleBarRef(element as SimpleBarComponent | null, columnIndex)" :auto-hide="autoHideScrollbar" :style="columnScrollStyle">
            <div v-if="column.items.length === 0" :class="millerColumnsEmpty()" data-ui-miller-columns-empty="true">{{ emptyText }}</div>
            <ul ref="columnRefs" :class="millerColumnsRows()">
              <li
                v-for="item in column.items"
                :key="getItemId(item)"
                :class="millerColumnsRow({ active: isSelected(getItemId(item), columnIndex), sortable })"
                :data-id="getItemId(item)"
                :data-active="isSelected(getItemId(item), columnIndex)"
                data-ui-miller-columns-row="true"
                role="treeitem"
                tabindex="0"
                :aria-selected="isSelected(getItemId(item), columnIndex)"
                :draggable="sortable"
                @click="selectItem(getItemId(item), columnIndex)"
                @keydown="handleRowKeydown($event, getItemId(item), columnIndex)"
              >
                <div class="flex min-w-0 items-center gap-2">
                  <slot name="item-left" :item="item" :active="isSelected(getItemId(item), columnIndex)" :colIndex="columnIndex" />
                </div>
                <div class="ml-3 flex min-w-0 items-center gap-2">
                  <slot name="item-right" :item="item" :active="isSelected(getItemId(item), columnIndex)" :colIndex="columnIndex" />
                  <span v-if="hasChildren(getItemId(item))" class="i-lucide:chevron-right ml-auto size-4 shrink-0 text-current opacity-65" aria-hidden="true" />
                </div>
              </li>
            </ul>
          </SimpleBar>
        </div>
      </div>
    </SimpleBar>
    <div v-else class="flex min-h-full w-full flex-col items-center justify-center overflow-hidden bg-primary p-12 text-tertiary" data-ui-miller-columns-no-data="true">
      <span class="i-lucide:triangle-alert mb-3 size-12 text-quaternary" aria-hidden="true" />
      <div class="text-sm font-semibold">{{ noDataText }}</div>
    </div>
    <div v-if="showInfoPanel" :class="millerColumnsInfoPanel()" :style="infoPanelStyle" data-ui-miller-columns-info-panel="true">
      <slot name="info-panel" :item="selectedItem" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dragging {
  --at-apply: outline-2px outline-dashed outline-indigo-600 rounded-sm \!bg-transparent;
  > * {
    opacity: 0;
  }
}

ul:has(.dragging) [data-ui-miller-columns-row='true'] * {
  pointer-events: none;
}
</style>
