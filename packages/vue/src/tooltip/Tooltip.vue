<script setup lang="ts">
import { clsx } from 'clsx'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue'
import type { CSSProperties } from 'vue'

import { tooltipArrow, tooltipRoot, type TooltipArrow, type TooltipPlacement, type TooltipSemanticClassNames, type TooltipSemanticStyles, type TooltipTrigger } from '.'

interface Point {
  left: number
  top: number
}

const props = withDefaults(
  defineProps<{
    /** title 是提示内容；复杂内容可使用 title 插槽。 */
    title?: string | number
    /** placement 是浮层位置。 */
    placement?: TooltipPlacement
    /** trigger 是触发方式，可传单个或多个。 */
    trigger?: TooltipTrigger | TooltipTrigger[]
    /** open 是受控显隐状态。 */
    open?: boolean
    /** defaultOpen 是非受控默认显隐状态。 */
    defaultOpen?: boolean
    /** disabled 禁用 Tooltip 触发与展示。 */
    disabled?: boolean
    /** arrow 控制箭头展示，或设置 pointAtCenter。 */
    arrow?: TooltipArrow
    /** color 自定义浮层背景颜色。 */
    color?: string
    /** autoAdjustOverflow 表示溢出视口时是否自动翻转和夹紧。 */
    autoAdjustOverflow?: boolean
    /** destroyOnHidden 隐藏后是否销毁浮层节点。 */
    destroyOnHidden?: boolean
    /** fresh 表示关闭时仍实时更新内容。 */
    fresh?: boolean
    /** mouseEnterDelay 是 hover 打开延迟，单位秒。 */
    mouseEnterDelay?: number
    /** mouseLeaveDelay 是 hover 关闭延迟，单位秒。 */
    mouseLeaveDelay?: number
    /** zIndex 自定义浮层层级。 */
    zIndex?: number
    /** forceAlignKey 是外部触发布局重算的标记，适用于触发器位置被样式驱动改变。 */
    forceAlignKey?: string | number
    /** classNames 定义 root/body/arrow 语义结构类名。 */
    classNames?: TooltipSemanticClassNames
    /** styles 定义 root/body/arrow 语义结构样式。 */
    styles?: TooltipSemanticStyles
    /** contentClass 是浮层根节点额外类名。 */
    contentClass?: string
  }>(),
  {
    title: '',
    placement: 'top',
    trigger: 'hover',
    open: undefined,
    defaultOpen: false,
    disabled: false,
    arrow: true,
    color: '',
    autoAdjustOverflow: true,
    destroyOnHidden: false,
    fresh: false,
    mouseEnterDelay: 0.1,
    mouseLeaveDelay: 0.1,
    zIndex: 2050,
    forceAlignKey: undefined,
    classNames: undefined,
    styles: undefined,
    contentClass: ''
  }
)

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'openChange', value: boolean): void
}>()

const slots = useSlots()
const triggerRef = ref<HTMLElement | null>(null)
const popupRef = ref<HTMLElement | null>(null)
const internalOpen = ref(props.defaultOpen)
const cachedTitle = ref(props.title)
const resolvedPlacement = ref<TooltipPlacement>(props.placement)
const popupPoint = ref<Point>({ left: 0, top: 0 })
const arrowPoint = ref<Point>({ left: 0, top: 0 })
const tooltipId = `ui-tooltip-${Math.random().toString(36).slice(2)}`
let openTimer: number | undefined
let closeTimer: number | undefined
let positionFrame = 0

const isControlled = computed(() => props.open !== undefined)
const isOpen = computed(() => (isControlled.value ? !!props.open : internalOpen.value))
const triggerList = computed<TooltipTrigger[]>(() => (Array.isArray(props.trigger) ? props.trigger : [props.trigger]))
const hasTrigger = (trigger: TooltipTrigger) => triggerList.value.includes(trigger)
const shouldRenderPopup = computed(() => !props.destroyOnHidden || isOpen.value)
const shouldShowPopup = computed(() => !props.disabled && isOpen.value && hasContent.value)
const hasContent = computed(() => !!slots.title || props.title !== undefined && props.title !== null && String(props.title) !== '')
const showArrow = computed(() => props.arrow !== false)
const pointAtCenter = computed(() => typeof props.arrow === 'object' && !!props.arrow.pointAtCenter)
const rootClass = computed(() => clsx(tooltipRoot({ interactive: hasTrigger('click') || hasTrigger('contextMenu') }), props.contentClass, props.classNames?.root))
const bodyClass = computed(() => clsx('relative z-1 break-words', props.classNames?.body))
const arrowClass = computed(() => clsx(tooltipArrow(), props.classNames?.arrow))
const displayTitle = computed(() => {
  if (props.fresh || isOpen.value) return props.title
  return cachedTitle.value
})

const normalizeStyle = (value: string | Record<string, string | number> | undefined): CSSProperties | string | undefined => value
const getTextColor = (background: string) => {
  const hex = background.trim().replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return undefined
  const r = Number.parseInt(hex.slice(0, 2), 16)
  const g = Number.parseInt(hex.slice(2, 4), 16)
  const b = Number.parseInt(hex.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#111827' : '#fff'
}
const rootStyle = computed<CSSProperties>(() => ({
  left: `${popupPoint.value.left}px`,
  top: `${popupPoint.value.top}px`,
  zIndex: props.zIndex,
  backgroundColor: props.color || undefined,
  color: props.color ? getTextColor(props.color) : undefined,
  ...(typeof props.styles?.root === 'object' ? props.styles.root : {})
}))
const arrowStyle = computed<CSSProperties | string | undefined>(() => {
  const base: CSSProperties = {
    left: `${arrowPoint.value.left}px`,
    top: `${arrowPoint.value.top}px`,
    backgroundColor: props.color || undefined
  }
  if (typeof props.styles?.arrow === 'string') return props.styles.arrow
  return {
    ...base,
    ...props.styles?.arrow
  }
})

watch(
  () => props.title,
  (title) => {
    if (props.fresh || isOpen.value) cachedTitle.value = title
  }
)

watch(isOpen, (open) => {
  if (open) {
    cachedTitle.value = props.title
    schedulePositionUpdate()
  }
})

watch(
  () => [props.placement, props.arrow, props.color, props.forceAlignKey],
  () => schedulePositionUpdate()
)

function clearOpenTimer() {
  if (!openTimer) return
  window.clearTimeout(openTimer)
  openTimer = undefined
}

function clearCloseTimer() {
  if (!closeTimer) return
  window.clearTimeout(closeTimer)
  closeTimer = undefined
}

function setOpen(value: boolean) {
  if (props.disabled && value) return
  if (!isControlled.value) internalOpen.value = value
  emit('update:open', value)
  emit('openChange', value)
}

function scheduleOpen(delay = 0) {
  clearCloseTimer()
  clearOpenTimer()
  openTimer = window.setTimeout(() => setOpen(true), Math.max(0, delay * 1000))
}

function scheduleClose(delay = 0) {
  clearOpenTimer()
  clearCloseTimer()
  closeTimer = window.setTimeout(() => setOpen(false), Math.max(0, delay * 1000))
}

function handleMouseEnter() {
  if (!hasTrigger('hover')) return
  scheduleOpen(props.mouseEnterDelay)
}

function handleMouseLeave() {
  if (!hasTrigger('hover')) return
  scheduleClose(props.mouseLeaveDelay)
}

function handleFocus() {
  if (!hasTrigger('focus')) return
  scheduleOpen(0)
}

function handleBlur() {
  if (!hasTrigger('focus')) return
  scheduleClose(0)
}

function handleClick() {
  if (!hasTrigger('click')) return
  clearOpenTimer()
  clearCloseTimer()
  setOpen(!isOpen.value)
}

function handleContextMenu(event: MouseEvent) {
  if (!hasTrigger('contextMenu')) return
  event.preventDefault()
  clearOpenTimer()
  clearCloseTimer()
  setOpen(!isOpen.value)
}

function getOppositePlacement(placement: TooltipPlacement): TooltipPlacement {
  const map: Record<TooltipPlacement, TooltipPlacement> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
    topLeft: 'bottomLeft',
    topRight: 'bottomRight',
    bottomLeft: 'topLeft',
    bottomRight: 'topRight',
    leftTop: 'rightTop',
    leftBottom: 'rightBottom',
    rightTop: 'leftTop',
    rightBottom: 'leftBottom'
  }
  return map[placement]
}

function getPlacementSide(placement: TooltipPlacement) {
  if (placement.startsWith('top')) return 'top'
  if (placement.startsWith('bottom')) return 'bottom'
  if (placement.startsWith('left')) return 'left'
  return 'right'
}

function getPlacementPoint(placement: TooltipPlacement, trigger: DOMRect, popup: DOMRect) {
  const gap = showArrow.value ? 10 : 6
  const side = getPlacementSide(placement)
  const point = { left: 0, top: 0 }
  if (side === 'top' || side === 'bottom') {
    point.top = side === 'top' ? trigger.top - popup.height - gap : trigger.bottom + gap
    if (placement.endsWith('Left')) {
      point.left = pointAtCenter.value ? trigger.left + trigger.width / 2 - 16 : trigger.left
    } else if (placement.endsWith('Right')) {
      point.left = pointAtCenter.value ? trigger.right - trigger.width / 2 + 16 - popup.width : trigger.right - popup.width
    } else {
      point.left = trigger.left + trigger.width / 2 - popup.width / 2
    }
    return point
  }
  point.left = side === 'left' ? trigger.left - popup.width - gap : trigger.right + gap
  if (placement.endsWith('Top')) {
    point.top = pointAtCenter.value ? trigger.top + trigger.height / 2 - 16 : trigger.top
  } else if (placement.endsWith('Bottom')) {
    point.top = pointAtCenter.value ? trigger.bottom - trigger.height / 2 + 16 - popup.height : trigger.bottom - popup.height
  } else {
    point.top = trigger.top + trigger.height / 2 - popup.height / 2
  }
  return point
}

function isOverflow(point: Point, popup: DOMRect) {
  const padding = 8
  return point.left < padding || point.top < padding || point.left + popup.width > window.innerWidth - padding || point.top + popup.height > window.innerHeight - padding
}

function clampPoint(point: Point, popup: DOMRect): Point {
  const padding = 8
  return {
    left: Math.max(padding, Math.min(point.left, window.innerWidth - popup.width - padding)),
    top: Math.max(padding, Math.min(point.top, window.innerHeight - popup.height - padding))
  }
}

function updateArrowPoint(placement: TooltipPlacement, trigger: DOMRect, popup: DOMRect, point: Point) {
  const side = getPlacementSide(placement)
  const centerX = trigger.left + trigger.width / 2 - point.left
  const centerY = trigger.top + trigger.height / 2 - point.top
  const edge = 4
  if (side === 'top') {
    arrowPoint.value = { left: Math.max(12, Math.min(centerX - edge, popup.width - 20)), top: popup.height - edge }
  } else if (side === 'bottom') {
    arrowPoint.value = { left: Math.max(12, Math.min(centerX - edge, popup.width - 20)), top: -edge }
  } else if (side === 'left') {
    arrowPoint.value = { left: popup.width - edge, top: Math.max(8, Math.min(centerY - edge, popup.height - 16)) }
  } else {
    arrowPoint.value = { left: -edge, top: Math.max(8, Math.min(centerY - edge, popup.height - 16)) }
  }
}

async function updatePosition() {
  if (!shouldShowPopup.value) return
  await nextTick()
  const trigger = triggerRef.value?.getBoundingClientRect()
  const popup = popupRef.value?.getBoundingClientRect()
  if (!trigger || !popup) return
  let placement = props.placement
  let point = getPlacementPoint(placement, trigger, popup)
  if (props.autoAdjustOverflow && isOverflow(point, popup)) {
    const opposite = getOppositePlacement(placement)
    const oppositePoint = getPlacementPoint(opposite, trigger, popup)
    if (!isOverflow(oppositePoint, popup)) {
      placement = opposite
      point = oppositePoint
    }
    point = clampPoint(point, popup)
  }
  resolvedPlacement.value = placement
  popupPoint.value = point
  updateArrowPoint(placement, trigger, popup, point)
}

function schedulePositionUpdate() {
  if (positionFrame) cancelAnimationFrame(positionFrame)
  positionFrame = requestAnimationFrame(() => {
    positionFrame = 0
    void updatePosition()
  })
}

function handleDocumentPointerDown(event: PointerEvent) {
  if (!isOpen.value || !hasTrigger('click') && !hasTrigger('contextMenu')) return
  const target = event.target as Node
  if (triggerRef.value?.contains(target) || popupRef.value?.contains(target)) return
  setOpen(false)
}

onMounted(() => {
  document.addEventListener('pointerdown', handleDocumentPointerDown, true)
  document.addEventListener('scroll', schedulePositionUpdate, true)
  window.addEventListener('resize', schedulePositionUpdate)
  schedulePositionUpdate()
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown, true)
  document.removeEventListener('scroll', schedulePositionUpdate, true)
  window.removeEventListener('resize', schedulePositionUpdate)
  clearOpenTimer()
  clearCloseTimer()
  if (positionFrame) cancelAnimationFrame(positionFrame)
})
</script>

<template>
  <span
    ref="triggerRef"
    data-ui-tooltip-trigger="true"
    class="inline-flex w-fit"
    :aria-describedby="shouldShowPopup ? tooltipId : undefined"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focusin="handleFocus"
    @focusout="handleBlur"
    @click="handleClick"
    @contextmenu="handleContextMenu"
  >
    <slot></slot>
  </span>

  <Teleport to="body">
    <div
      v-if="shouldRenderPopup"
      v-show="shouldShowPopup"
      :id="tooltipId"
      ref="popupRef"
      data-ui-tooltip="true"
      role="tooltip"
      :data-placement="resolvedPlacement"
      :class="rootClass"
      :style="[rootStyle, typeof styles?.root === 'string' ? styles.root : undefined]"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <span v-if="showArrow" :class="arrowClass" :style="arrowStyle"></span>
      <div :class="bodyClass" :style="normalizeStyle(styles?.body)">
        <slot name="title">{{ displayTitle }}</slot>
      </div>
    </div>
  </Teleport>
</template>
