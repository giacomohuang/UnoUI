<script setup lang="ts">
import { clsx } from 'clsx'
import { Comment, Fragment, Text, cloneVNode, computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, useSlots, watch } from 'vue'
import type { CSSProperties, PropType, StyleValue, VNode } from 'vue'

import { splitterBar, splitterDragger, splitterLine, splitterRoot, type SplitterCollapsibleIconMode, type SplitterCollapsibleOptions, type SplitterOrientation, type SplitterPanelCollapsibleOptions, type SplitterSize } from '.'
import { getUiExposeAttrs } from '../attrs'
import SplitterPanel from './SplitterPanel.vue'

defineOptions({
  inheritAttrs: false
})

interface PanelRecord {
  vnode: VNode
  key: PropertyKey
  size?: SplitterSize
  defaultSize?: SplitterSize
  min?: SplitterSize
  max?: SplitterSize
  resizable: boolean
  collapsible: Required<SplitterPanelCollapsibleOptions>
  destroyOnHidden?: boolean
}

interface DragState {
  index: number
  pointerId: number
  startClient: number
  startRatios: number[]
}

const EPSILON = 0.000001

const props = withDefaults(
  defineProps<{
    /** modelValue 是所有面板尺寸的本地 v-model，拖拽后输出 px 数组。 */
    modelValue?: SplitterSize[]
    /** defaultValue 是所有面板的非受控初始尺寸。 */
    defaultValue?: SplitterSize[]
    /** orientation 是面板排列方向。 */
    orientation?: SplitterOrientation
    /** lazy 表示拖拽时只移动预览线，松开后再调整面板。 */
    lazy?: boolean
    /** keyboardStep 是键盘方向键每次调整的像素数。 */
    keyboardStep?: number
    /** collapsible 配置折叠动画。 */
    collapsible?: SplitterCollapsibleOptions
    /** destroyOnHidden 表示面板折叠为 0 时销毁内容。 */
    destroyOnHidden?: boolean
    /** ariaLabel 是分割面板根节点的无障碍名称。 */
    ariaLabel?: string
  }>(),
  {
    modelValue: undefined,
    defaultValue: undefined,
    orientation: 'horizontal',
    lazy: false,
    keyboardStep: 10,
    collapsible: undefined,
    destroyOnHidden: false,
    ariaLabel: '分割面板'
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', sizes: number[]): void
  (e: 'resize-start', sizes: number[]): void
  (e: 'resize', sizes: number[]): void
  (e: 'resize-end', sizes: number[]): void
  (e: 'collapse', collapsed: boolean[], sizes: number[]): void
  (e: 'dragger-double-click', index: number): void
}>()

const attrs = useAttrs()
const slots = useSlots()
const rootRef = ref<HTMLElement | null>(null)
const containerSize = ref(0)
const internalSizes = ref<SplitterSize[]>([])
const dragRatios = ref<number[] | null>(null)
const dragState = ref<DragState | null>(null)
const activeBarIndex = ref(-1)
const lazyPreviewOffset = ref(0)
const collapsedSizeCache = new Map<number, number>()
const splitterId = `ui-splitter-${Math.random().toString(36).slice(2, 9)}`
let resizeObserver: ResizeObserver | null = null
let previousBodyCursor = ''
let previousBodyUserSelect = ''

const VNodeRenderer = defineComponent({
  name: 'SplitterVNodeRenderer',
  props: {
    node: {
      type: Object as PropType<VNode>,
      required: true
    }
  },
  setup(rendererProps) {
    return () => rendererProps.node
  }
})

function flattenPanelVNodes(nodes: VNode[], result: VNode[] = []) {
  for (const node of nodes) {
    if (node.type === Fragment && Array.isArray(node.children)) {
      flattenPanelVNodes(node.children as VNode[], result)
      continue
    }
    if (node.type === Comment || node.type === Text) continue
    if (node.type === SplitterPanel || (typeof node.type === 'object' && '__name' in node.type && node.type.__name === 'SplitterPanel')) {
      result.push(node)
    }
  }
  return result
}

function readVNodeProp<T>(vnode: VNode, name: string): T | undefined {
  const kebabName = name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
  return (vnode.props?.[name] ?? vnode.props?.[kebabName]) as T | undefined
}

function normalizeCollapsible(value: unknown): Required<SplitterPanelCollapsibleOptions> {
  if (value && typeof value === 'object') {
    const options = value as SplitterPanelCollapsibleOptions
    return {
      start: Boolean(options.start),
      end: Boolean(options.end),
      showCollapsibleIcon: options.showCollapsibleIcon ?? 'auto'
    }
  }
  const enabled = value === true || value === ''
  return {
    start: enabled,
    end: enabled,
    showCollapsibleIcon: 'auto'
  }
}

const panels = computed<PanelRecord[]>(() =>
  flattenPanelVNodes(slots.default?.() ?? []).map((vnode, index) => ({
    vnode,
    key: vnode.key ?? index,
    size: readVNodeProp<SplitterSize>(vnode, 'size'),
    defaultSize: readVNodeProp<SplitterSize>(vnode, 'defaultSize'),
    min: readVNodeProp<SplitterSize>(vnode, 'min'),
    max: readVNodeProp<SplitterSize>(vnode, 'max'),
    resizable: readVNodeProp<boolean>(vnode, 'resizable') !== false,
    collapsible: normalizeCollapsible(readVNodeProp(vnode, 'collapsible')),
    destroyOnHidden: readVNodeProp<boolean>(vnode, 'destroyOnHidden')
  }))
)

const panelIdentity = computed(() => panels.value.map((panel) => String(panel.key)).join('|'))
const hasControlledPanelSize = computed(() => panels.value.some((panel) => panel.size !== undefined))
const isControlled = computed(() => props.modelValue !== undefined || hasControlledPanelSize.value)
const sourceSizes = computed<SplitterSize[]>(() => {
  if (props.modelValue !== undefined) return props.modelValue
  if (hasControlledPanelSize.value) return panels.value.map((panel) => panel.size as SplitterSize)
  if (internalSizes.value.length === panels.value.length) return internalSizes.value
  if (props.defaultValue?.length) return props.defaultValue
  return panels.value.map((panel) => panel.defaultSize as SplitterSize)
})

function parseSize(value: SplitterSize | undefined, total: number, fallback?: number) {
  if (value === undefined || value === null || value === '') return fallback
  if (typeof value === 'string' && value.trim().endsWith('%')) {
    const percent = Number(value.trim().slice(0, -1))
    return Number.isFinite(percent) ? (percent / 100) * total : fallback
  }
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

function distributeDifference(values: number[], minValues: number[], maxValues: number[]) {
  const result = values.map((value, index) => Math.min(maxValues[index], Math.max(minValues[index], value)))
  for (let pass = 0; pass < result.length * 2; pass += 1) {
    const difference = 1 - result.reduce((sum, value) => sum + value, 0)
    if (Math.abs(difference) <= EPSILON) break
    const candidates = result.map((value, index) => ({ index, room: difference > 0 ? maxValues[index] - value : value - minValues[index] })).filter((item) => item.room > EPSILON)
    if (!candidates.length) break
    const share = Math.abs(difference) / candidates.length
    for (const candidate of candidates) {
      const change = Math.min(candidate.room, share)
      result[candidate.index] += difference > 0 ? change : -change
    }
  }

  const remainder = 1 - result.reduce((sum, value) => sum + value, 0)
  if (Math.abs(remainder) > EPSILON && result.length) result[result.length - 1] = Math.max(0, result[result.length - 1] + remainder)
  return result
}

function normalizeSizes(rawSizes: SplitterSize[], panelList = panels.value) {
  const count = panelList.length
  if (!count) return []
  const total = containerSize.value > 0 ? containerSize.value : 1
  const rawRatios = Array.from({ length: count }, (_, index) => {
    const parsed = parseSize(rawSizes[index], total)
    return parsed === undefined ? undefined : Math.max(0, parsed / total)
  })
  const minRatios = panelList.map((panel, index) => (rawRatios[index] === 0 ? 0 : Math.max(0, (parseSize(panel.min, total, 0) ?? 0) / total)))
  const maxRatios = panelList.map((panel) => Math.max(0, Math.min(1, (parseSize(panel.max, total, total) ?? total) / total)))
  const specifiedTotal = rawRatios.reduce<number>((sum, value) => sum + (value ?? 0), 0)
  const undefinedIndexes = rawRatios.map((value, index) => (value === undefined ? index : -1)).filter((index) => index >= 0)
  let ratios: number[]

  if (!undefinedIndexes.length) {
    if (specifiedTotal <= EPSILON) ratios = rawRatios.map(() => 1 / count)
    else ratios = rawRatios.map((value) => (value ?? 0) / specifiedTotal)
  } else if (specifiedTotal >= 1) {
    ratios = rawRatios.map((value) => (value === undefined ? 0 : value / specifiedTotal))
  } else {
    const rest = (1 - specifiedTotal) / undefinedIndexes.length
    ratios = rawRatios.map((value) => value ?? rest)
  }

  return distributeDifference(ratios, minRatios, maxRatios)
}

const baseRatios = computed(() => normalizeSizes(sourceSizes.value))
const currentRatios = computed(() => dragRatios.value ?? baseRatios.value)
const rootClass = computed(() => clsx(splitterRoot({ orientation: props.orientation }), attrs.class as string | undefined))
const rootStyle = computed<StyleValue>(() => attrs.style as StyleValue | undefined)
const exposeAttrs = computed(() => getUiExposeAttrs(attrs))
const panelIds = computed(() => panels.value.map((panel, index) => readVNodeProp<string>(panel.vnode, 'id') ?? `${splitterId}-panel-${index}`))

watch(panelIdentity, () => {
  internalSizes.value = []
  dragRatios.value = null
  collapsedSizeCache.clear()
})

watch(
  () => props.orientation,
  async () => {
    await nextTick()
    measureContainer()
  }
)

function measureContainer() {
  const rect = rootRef.value?.getBoundingClientRect()
  const nextSize = props.orientation === 'vertical' ? rect?.height : rect?.width
  if (nextSize && Number.isFinite(nextSize)) containerSize.value = nextSize
}

function ratiosToPixels(ratios: number[]) {
  const total = containerSize.value
  return ratios.map((ratio) => Number((ratio * total).toFixed(2)))
}

function panelMinPx(index: number, allowCollapsed = false) {
  if (allowCollapsed && currentRatios.value[index] <= EPSILON) return 0
  return parseSize(panels.value[index]?.min, containerSize.value, 0) ?? 0
}

function panelMaxPx(index: number) {
  return parseSize(panels.value[index]?.max, containerSize.value, containerSize.value) ?? containerSize.value
}

function isBarResizable(index: number) {
  const previous = panels.value[index]
  const next = panels.value[index + 1]
  if (!previous || !next || !previous.resizable || !next.resizable) return false
  const sizes = ratiosToPixels(currentRatios.value)
  if (sizes[index] <= EPSILON && panelMinPx(index) > 0) return false
  if (sizes[index + 1] <= EPSILON && panelMinPx(index + 1) > 0) return false
  return true
}

function clampOffset(index: number, requestedOffset: number, startRatios: number[]) {
  const sizes = ratiosToPixels(startRatios)
  const previousSize = sizes[index] ?? 0
  const nextSize = sizes[index + 1] ?? 0
  const lowerBound = Math.max(panelMinPx(index) - previousSize, nextSize - panelMaxPx(index + 1))
  const upperBound = Math.min(panelMaxPx(index) - previousSize, nextSize - panelMinPx(index + 1))
  return Math.min(upperBound, Math.max(lowerBound, requestedOffset))
}

function offsetRatios(index: number, requestedOffset: number, startRatios: number[]) {
  if (containerSize.value <= 0) return startRatios
  const offset = clampOffset(index, requestedOffset, startRatios)
  const next = [...startRatios]
  next[index] += offset / containerSize.value
  next[index + 1] -= offset / containerSize.value
  return next
}

function commitRatios(ratios: number[], emitResize = true) {
  const sizes = ratiosToPixels(ratios)
  if (!isControlled.value) internalSizes.value = sizes
  if (dragState.value) dragRatios.value = ratios
  emit('update:modelValue', sizes)
  if (emitResize) emit('resize', sizes)
  return sizes
}

function boundaryPercent(index: number) {
  return currentRatios.value.slice(0, index + 1).reduce((sum, value) => sum + value, 0) * 100
}

function barStyle(index: number): CSSProperties {
  const transition = props.collapsible?.motion && activeBarIndex.value < 0 ? `${props.orientation === 'vertical' ? 'top' : 'left'} 180ms ease` : undefined
  return props.orientation === 'vertical' ? { top: `${boundaryPercent(index)}%`, transition } : { left: `${boundaryPercent(index)}%`, transition }
}

function previewStyle(index: number): CSSProperties {
  const active = activeBarIndex.value === index && props.lazy
  if (props.orientation === 'vertical') {
    return {
      left: 0,
      right: 0,
      top: `calc(50% + ${active ? lazyPreviewOffset.value : 0}px)`,
      height: '2px',
      transform: 'translateY(-50%)'
    }
  }
  return {
    bottom: 0,
    left: `calc(50% + ${active ? lazyPreviewOffset.value : 0}px)`,
    top: 0,
    width: '2px',
    transform: 'translateX(-50%)'
  }
}

function createPanelVNode(panel: PanelRecord, index: number) {
  const ratio = currentRatios.value[index] ?? 0
  return cloneVNode(panel.vnode, {
    id: panelIds.value[index],
    splitterSize: ratio,
    splitterOrientation: props.orientation,
    splitterCollapsed: ratio <= EPSILON,
    splitterDestroyOnHidden: props.destroyOnHidden,
    splitterMotion: Boolean(props.collapsible?.motion) && activeBarIndex.value < 0
  })
}

function setDraggingDocumentState(active: boolean) {
  if (typeof document === 'undefined') return
  if (active) {
    previousBodyCursor = document.body.style.cursor
    previousBodyUserSelect = document.body.style.userSelect
    document.body.style.cursor = props.orientation === 'vertical' ? 'row-resize' : 'col-resize'
    document.body.style.userSelect = 'none'
    return
  }
  document.body.style.cursor = previousBodyCursor
  document.body.style.userSelect = previousBodyUserSelect
}

function handlePointerDown(event: PointerEvent, index: number) {
  if (event.button !== 0 || !isBarResizable(index)) return
  measureContainer()
  event.preventDefault()
  const startRatios = [...currentRatios.value]
  dragState.value = {
    index,
    pointerId: event.pointerId,
    startClient: props.orientation === 'vertical' ? event.clientY : event.clientX,
    startRatios
  }
  dragRatios.value = startRatios
  activeBarIndex.value = index
  lazyPreviewOffset.value = 0
  setDraggingDocumentState(true)
  rootRef.value?.setPointerCapture?.(event.pointerId)
  emit('resize-start', ratiosToPixels(startRatios))
}

function handlePointerMove(event: PointerEvent) {
  const state = dragState.value
  if (!state || (event.pointerId !== undefined && state.pointerId !== event.pointerId)) return
  const client = props.orientation === 'vertical' ? event.clientY : event.clientX
  const offset = clampOffset(state.index, client - state.startClient, state.startRatios)
  if (props.lazy) {
    lazyPreviewOffset.value = offset
    return
  }
  commitRatios(offsetRatios(state.index, offset, state.startRatios))
}

function finishPointerDrag(event?: PointerEvent) {
  const state = dragState.value
  if (!state || (event?.pointerId !== undefined && state.pointerId !== event.pointerId)) return
  let finalRatios = dragRatios.value ?? state.startRatios
  if (props.lazy) {
    finalRatios = offsetRatios(state.index, lazyPreviewOffset.value, state.startRatios)
    if (Math.abs(lazyPreviewOffset.value) > EPSILON) commitRatios(finalRatios)
  }
  emit('resize-end', ratiosToPixels(finalRatios))
  dragState.value = null
  dragRatios.value = null
  activeBarIndex.value = -1
  lazyPreviewOffset.value = 0
  setDraggingDocumentState(false)
}

function getBarAria(index: number) {
  const sizes = ratiosToPixels(currentRatios.value)
  const previousSize = sizes[index] ?? 0
  const pairSize = previousSize + (sizes[index + 1] ?? 0)
  return {
    now: Math.round(previousSize),
    min: Math.round(Math.max(panelMinPx(index, true), pairSize - panelMaxPx(index + 1))),
    max: Math.round(Math.min(panelMaxPx(index), pairSize - panelMinPx(index + 1, true)))
  }
}

function handleSeparatorKeydown(event: KeyboardEvent, index: number) {
  if (!isBarResizable(index)) return
  const aria = getBarAria(index)
  const step = Math.max(1, props.keyboardStep)
  let offset: number | undefined
  if (props.orientation === 'horizontal' && event.key === 'ArrowLeft') offset = -step
  if (props.orientation === 'horizontal' && event.key === 'ArrowRight') offset = step
  if (props.orientation === 'vertical' && event.key === 'ArrowUp') offset = -step
  if (props.orientation === 'vertical' && event.key === 'ArrowDown') offset = step
  if (event.key === 'Home') offset = aria.min - aria.now
  if (event.key === 'End') offset = aria.max - aria.now
  if (offset === undefined) return

  event.preventDefault()
  measureContainer()
  const startRatios = [...currentRatios.value]
  emit('resize-start', ratiosToPixels(startRatios))
  const finalRatios = offsetRatios(index, offset, startRatios)
  const sizes = commitRatios(finalRatios)
  emit('resize-end', sizes)
}

function collapseButtonVisible(mode: SplitterCollapsibleIconMode) {
  return mode !== false
}

function collapseButtonClass(mode: SplitterCollapsibleIconMode) {
  return clsx(
    'pointer-events-auto absolute z-30 inline-flex size-5 items-center justify-center rounded border border-medium bg-primary text-tertiary shadow-sm outline-none transition-[color,opacity,background-color] hover:(bg-secondary text-brand-500) focus-visible:(ring-2 ring-brand-400)',
    mode === 'auto' && 'opacity-0 group-hover/ui-splitter-bar:opacity-100 group-focus-within/ui-splitter-bar:opacity-100'
  )
}

function collapseButtonStyle(side: 'previous' | 'next'): CSSProperties {
  const offset = side === 'previous' ? '-13px' : '13px'
  if (props.orientation === 'vertical') {
    return { left: `calc(50% + ${offset})`, top: '50%', transform: 'translate(-50%, -50%)' }
  }
  return { left: '50%', top: `calc(50% + ${offset})`, transform: 'translate(-50%, -50%)' }
}

function collapseIconClass(side: 'previous' | 'next', collapsed: boolean) {
  if (props.orientation === 'vertical') {
    if (side === 'previous') return collapsed ? 'i-lucide:chevron-down' : 'i-lucide:chevron-up'
    return collapsed ? 'i-lucide:chevron-up' : 'i-lucide:chevron-down'
  }
  if (side === 'previous') return collapsed ? 'i-lucide:chevron-right' : 'i-lucide:chevron-left'
  return collapsed ? 'i-lucide:chevron-left' : 'i-lucide:chevron-right'
}

function togglePanel(panelIndex: number, neighborIndex: number) {
  measureContainer()
  const sizes = ratiosToPixels(currentRatios.value)
  const panelSize = sizes[panelIndex] ?? 0
  const neighborSize = sizes[neighborIndex] ?? 0
  const pairSize = panelSize + neighborSize
  const nextSizes = [...sizes]

  if (panelSize > EPSILON) {
    collapsedSizeCache.set(panelIndex, panelSize)
    nextSizes[panelIndex] = 0
    nextSizes[neighborIndex] = pairSize
  } else {
    const preferred = collapsedSizeCache.get(panelIndex) ?? parseSize(panels.value[panelIndex]?.defaultSize, containerSize.value, pairSize / 2) ?? pairSize / 2
    const minimum = Math.max(panelMinPx(panelIndex), pairSize - panelMaxPx(neighborIndex))
    const maximum = Math.min(panelMaxPx(panelIndex), pairSize - panelMinPx(neighborIndex))
    const restored = Math.min(maximum, Math.max(minimum, preferred))
    nextSizes[panelIndex] = restored
    nextSizes[neighborIndex] = pairSize - restored
  }

  const nextRatios = nextSizes.map((size) => (containerSize.value > 0 ? size / containerSize.value : 0))
  const committedSizes = commitRatios(nextRatios)
  emit(
    'collapse',
    committedSizes.map((size) => size <= EPSILON),
    committedSizes
  )
}

function togglePrevious(index: number) {
  togglePanel(index, index + 1)
}

function toggleNext(index: number) {
  togglePanel(index + 1, index)
}

function handleDraggerDoubleClick(index: number) {
  emit('dragger-double-click', index)
}

function defaultRatios() {
  const defaults = props.defaultValue?.length ? props.defaultValue : panels.value.map((panel) => panel.defaultSize as SplitterSize)
  return normalizeSizes(defaults)
}

function reset() {
  const ratios = defaultRatios()
  const sizes = commitRatios(ratios)
  emit('resize-end', sizes)
  return sizes
}

function getSizes() {
  measureContainer()
  return ratiosToPixels(currentRatios.value)
}

onMounted(() => {
  measureContainer()
  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('pointerup', finishPointerDrag)
  window.addEventListener('pointercancel', finishPointerDrag)
  window.addEventListener('resize', measureContainer)
  if (typeof ResizeObserver !== 'undefined' && rootRef.value) {
    resizeObserver = new ResizeObserver(measureContainer)
    resizeObserver.observe(rootRef.value)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerup', finishPointerDrag)
  window.removeEventListener('pointercancel', finishPointerDrag)
  window.removeEventListener('resize', measureContainer)
  resizeObserver?.disconnect()
  setDraggingDocumentState(false)
})

defineExpose({
  reset,
  getSizes
})
</script>

<template>
  <div ref="rootRef" v-bind="exposeAttrs" data-ui-splitter="true" role="group" :aria-label="ariaLabel" :class="rootClass" :style="rootStyle">
    <template v-for="(panel, index) in panels" :key="panel.key">
      <VNodeRenderer :node="createPanelVNode(panel, index)" />

      <div v-if="index < panels.length - 1" data-ui-splitter-bar="true" :class="splitterBar({ orientation })" :style="barStyle(index)">
        <span v-if="lazy && activeBarIndex === index" data-ui-splitter-preview="true" class="pointer-events-none absolute z-20 bg-brand-500 dark:bg-brand-400" :style="previewStyle(index)"></span>
        <div
          data-ui-splitter-dragger="true"
          role="separator"
          :aria-controls="`${panelIds[index]} ${panelIds[index + 1]}`"
          :aria-disabled="!isBarResizable(index)"
          :aria-orientation="orientation === 'vertical' ? 'horizontal' : 'vertical'"
          :aria-valuenow="getBarAria(index).now"
          :aria-valuemin="getBarAria(index).min"
          :aria-valuemax="getBarAria(index).max"
          :tabindex="isBarResizable(index) ? 0 : -1"
          :class="splitterDragger({ orientation, resizable: isBarResizable(index) })"
          @pointerdown="handlePointerDown($event, index)"
          @keydown="handleSeparatorKeydown($event, index)"
          @dblclick="handleDraggerDoubleClick(index)"
        >
          <span :class="splitterLine({ orientation, active: activeBarIndex === index, resizable: isBarResizable(index) })"></span>
          <span v-if="$slots.dragger" class="pointer-events-none absolute left-1/2 top-1/2 z-10 inline-flex size-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded bg-primary text-tertiary">
            <slot name="dragger" :index="index" :active="activeBarIndex === index"></slot>
          </span>
        </div>

        <button
          v-if="panel.collapsible.end && collapseButtonVisible(panel.collapsible.showCollapsibleIcon)"
          type="button"
          data-ui-splitter-collapse="previous"
          :aria-label="currentRatios[index] <= EPSILON ? '展开前一面板' : '折叠前一面板'"
          :class="collapseButtonClass(panel.collapsible.showCollapsibleIcon)"
          :style="collapseButtonStyle('previous')"
          @pointerdown.stop
          @click="togglePrevious(index)"
        >
          <span :class="collapseIconClass('previous', currentRatios[index] <= EPSILON)" class="size-3.5"></span>
        </button>
        <button
          v-if="panels[index + 1].collapsible.start && collapseButtonVisible(panels[index + 1].collapsible.showCollapsibleIcon)"
          type="button"
          data-ui-splitter-collapse="next"
          :aria-label="currentRatios[index + 1] <= EPSILON ? '展开后一面板' : '折叠后一面板'"
          :class="collapseButtonClass(panels[index + 1].collapsible.showCollapsibleIcon)"
          :style="collapseButtonStyle('next')"
          @pointerdown.stop
          @click="toggleNext(index)"
        >
          <span :class="collapseIconClass('next', currentRatios[index + 1] <= EPSILON)" class="size-3.5"></span>
        </button>
      </div>
    </template>
  </div>
</template>
