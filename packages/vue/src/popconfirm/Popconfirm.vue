<script setup lang="ts">
import { clsx } from 'clsx'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue'
import type { CSSProperties } from 'vue'

import { Button } from '../button'
import {
  popconfirmActions,
  popconfirmArrow,
  popconfirmContainer,
  popconfirmContent,
  popconfirmIcon,
  popconfirmRoot,
  popconfirmTitle,
  type PopconfirmArrow,
  type PopconfirmButtonProps,
  type PopconfirmOkType,
  type PopconfirmPlacement,
  type PopconfirmSemanticClassNames,
  type PopconfirmSemanticStyles,
  type PopconfirmTrigger
} from '.'

interface Point {
  left: number
  top: number
}

const props = withDefaults(
  defineProps<{
    /** title 是确认框标题；复杂内容可使用 title 插槽。 */
    title?: string | number
    /** description 是确认框详细描述；复杂内容可使用 description 插槽。 */
    description?: string | number
    /** disabled 阻止触发器打开确认框。 */
    disabled?: boolean
    /** icon 是自定义 UnoCSS/Iconify 图标类名。 */
    icon?: string
    /** okText 是确认按钮文字。 */
    okText?: string
    /** cancelText 是取消按钮文字。 */
    cancelText?: string
    /** okType 映射确认按钮语义。 */
    okType?: PopconfirmOkType
    /** showCancel 控制是否展示取消按钮。 */
    showCancel?: boolean
    /** okButtonProps 是确认按钮的本地 Button 属性。 */
    okButtonProps?: PopconfirmButtonProps
    /** cancelButtonProps 是取消按钮的本地 Button 属性。 */
    cancelButtonProps?: PopconfirmButtonProps
    /** placement 是浮层位置。 */
    placement?: PopconfirmPlacement
    /** trigger 是触发方式，可传单个或多个。 */
    trigger?: PopconfirmTrigger | PopconfirmTrigger[]
    /** open 是受控显隐状态。 */
    open?: boolean
    /** defaultOpen 是非受控默认显隐状态。 */
    defaultOpen?: boolean
    /** arrow 控制箭头展示，或设置 pointAtCenter。 */
    arrow?: PopconfirmArrow
    /** autoAdjustOverflow 表示溢出视口时是否自动翻转和夹紧。 */
    autoAdjustOverflow?: boolean
    /** destroyOnHidden 隐藏后是否销毁浮层节点。 */
    destroyOnHidden?: boolean
    /** mouseEnterDelay 是 hover 打开延迟，单位秒。 */
    mouseEnterDelay?: number
    /** mouseLeaveDelay 是 hover 关闭延迟，单位秒。 */
    mouseLeaveDelay?: number
    /** zIndex 自定义浮层层级。 */
    zIndex?: number
    /** color 自定义浮层背景颜色。 */
    color?: string
    /** classNames 定义 root/container/arrow/icon/title/content/actions 语义结构类名。 */
    classNames?: PopconfirmSemanticClassNames
    /** styles 定义 root/container/arrow/icon/title/content/actions 语义结构样式。 */
    styles?: PopconfirmSemanticStyles
  }>(),
  {
    title: undefined,
    description: undefined,
    disabled: false,
    icon: 'i-lucide:circle-alert',
    okText: '确定',
    cancelText: '取消',
    okType: 'primary',
    showCancel: true,
    okButtonProps: undefined,
    cancelButtonProps: undefined,
    placement: 'top',
    trigger: 'click',
    open: undefined,
    defaultOpen: false,
    arrow: true,
    autoAdjustOverflow: true,
    destroyOnHidden: false,
    mouseEnterDelay: 0.1,
    mouseLeaveDelay: 0.1,
    zIndex: 2050,
    color: '',
    classNames: undefined,
    styles: undefined
  }
)

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'openChange', value: boolean): void
  (e: 'confirm', event: MouseEvent): void
  (e: 'cancel', event: MouseEvent): void
  (e: 'popupClick', event: MouseEvent): void
}>()

const slots = useSlots()
const triggerRef = ref<HTMLElement | null>(null)
const popupRef = ref<HTMLElement | null>(null)
const internalOpen = ref(props.defaultOpen)
const resolvedPlacement = ref<PopconfirmPlacement>(props.placement)
const popupPoint = ref<Point>({ left: 0, top: 0 })
const arrowPoint = ref<Point>({ left: 0, top: 0 })
const popupId = `ui-popconfirm-${Math.random().toString(36).slice(2)}`
let openTimer: number | undefined
let closeTimer: number | undefined
let positionFrame = 0

const isControlled = computed(() => props.open !== undefined)
const isOpen = computed(() => (isControlled.value ? !!props.open : internalOpen.value))
const triggerList = computed<PopconfirmTrigger[]>(() => (Array.isArray(props.trigger) ? props.trigger : [props.trigger]))
const hasTrigger = (trigger: PopconfirmTrigger) => triggerList.value.includes(trigger)
const showArrow = computed(() => props.arrow !== false)
const pointAtCenter = computed(() => typeof props.arrow === 'object' && !!props.arrow.pointAtCenter)
const hasTitle = computed(() => !!slots.title || props.title !== undefined && props.title !== null && String(props.title) !== '')
const hasDescription = computed(() => !!slots.description || props.description !== undefined && props.description !== null && String(props.description) !== '')
const shouldRenderPopup = computed(() => !props.destroyOnHidden || isOpen.value)
const shouldShowPopup = computed(() => !props.disabled && isOpen.value && (hasTitle.value || hasDescription.value))

const rootClass = computed(() => clsx(popconfirmRoot({ interactive: true }), props.classNames?.root))
const containerClass = computed(() => clsx(popconfirmContainer(), props.classNames?.container))
const arrowClass = computed(() => clsx(popconfirmArrow({ side: getPlacementSide(resolvedPlacement.value) }), props.classNames?.arrow))
const iconClass = computed(() => clsx(popconfirmIcon(), props.classNames?.icon))
const titleClass = computed(() => clsx(popconfirmTitle(), props.classNames?.title))
const contentClass = computed(() => clsx(popconfirmContent(), props.classNames?.content))
const actionsClass = computed(() => clsx(popconfirmActions(), props.classNames?.actions))

const normalizeStyle = (value: CSSProperties | string | undefined) => value
const getTextColor = (background: string) => {
  const hex = background.trim().replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return undefined
  const r = Number.parseInt(hex.slice(0, 2), 16)
  const g = Number.parseInt(hex.slice(2, 4), 16)
  const b = Number.parseInt(hex.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#111827' : '#fff'
}
const rootStyle = computed<CSSProperties>(() => {
  const base: CSSProperties = {
    left: `${popupPoint.value.left}px`,
    top: `${popupPoint.value.top}px`,
    zIndex: props.zIndex
  }
  return {
    ...base,
    ...(typeof props.styles?.root === 'object' ? props.styles.root : {})
  }
})
const containerStyle = computed<CSSProperties | string | undefined>(() => {
  const base: CSSProperties = {
    backgroundColor: props.color || undefined,
    color: props.color ? getTextColor(props.color) : undefined
  }
  if (typeof props.styles?.container === 'string') return props.styles.container
  return {
    ...base,
    ...props.styles?.container
  }
})
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
const okButtonColor = computed(() => {
  if (props.okButtonProps?.color) return props.okButtonProps.color
  if (props.okType === 'danger') return 'red'
  if (props.okType === 'default') return 'gray'
  return 'brand'
})
const okButtonVariant = computed(() => props.okButtonProps?.variant ?? (props.okType === 'default' ? 'outline' : 'default'))
const okButtonSize = computed(() => props.okButtonProps?.size ?? 'sm')
const okButtonRadius = computed(() => props.okButtonProps?.radius ?? 'md')
const cancelButtonColor = computed(() => props.cancelButtonProps?.color ?? 'gray')
const cancelButtonVariant = computed(() => props.cancelButtonProps?.variant ?? 'outline')
const cancelButtonSize = computed(() => props.cancelButtonProps?.size ?? 'sm')
const cancelButtonRadius = computed(() => props.cancelButtonProps?.radius ?? 'md')

watch(isOpen, (open) => {
  if (open) schedulePositionUpdate()
})

watch(
  () => [props.placement, props.arrow, props.color],
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

function getOppositePlacement(placement: PopconfirmPlacement): PopconfirmPlacement {
  const map: Record<PopconfirmPlacement, PopconfirmPlacement> = {
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

function getPlacementSide(placement: PopconfirmPlacement) {
  if (placement.startsWith('top')) return 'top'
  if (placement.startsWith('bottom')) return 'bottom'
  if (placement.startsWith('left')) return 'left'
  return 'right'
}

function getPlacementPoint(placement: PopconfirmPlacement, trigger: DOMRect, popup: DOMRect) {
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

function updateArrowPoint(placement: PopconfirmPlacement, trigger: DOMRect, popup: DOMRect, point: Point) {
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

function handleConfirm(event: MouseEvent) {
  emit('confirm', event)
  setOpen(false)
}

function handleCancel(event: MouseEvent) {
  emit('cancel', event)
  setOpen(false)
}

function handlePopupClick(event: MouseEvent) {
  emit('popupClick', event)
}

function handleDocumentPointerDown(event: PointerEvent) {
  if (!isOpen.value) return
  const target = event.target as Node
  if (triggerRef.value?.contains(target) || popupRef.value?.contains(target)) return
  setOpen(false)
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if (!isOpen.value || event.key !== 'Escape') return
  event.preventDefault()
  setOpen(false)
}

onMounted(() => {
  document.addEventListener('pointerdown', handleDocumentPointerDown, true)
  document.addEventListener('keydown', handleDocumentKeydown, true)
  document.addEventListener('scroll', schedulePositionUpdate, true)
  window.addEventListener('resize', schedulePositionUpdate)
  schedulePositionUpdate()
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown, true)
  document.removeEventListener('keydown', handleDocumentKeydown, true)
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
    data-ui-popconfirm-trigger="true"
    class="inline-flex w-fit"
    :aria-describedby="shouldShowPopup ? popupId : undefined"
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
      :id="popupId"
      ref="popupRef"
      data-ui-popconfirm="true"
      role="dialog"
      :data-placement="resolvedPlacement"
      :class="rootClass"
      :style="[rootStyle, typeof styles?.root === 'string' ? styles.root : undefined]"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @click="handlePopupClick"
    >
      <div :class="containerClass" :style="containerStyle">
        <span v-if="showArrow" :class="arrowClass" :style="arrowStyle"></span>
        <div class="relative z-1 flex gap-2">
          <span :class="iconClass" :style="normalizeStyle(styles?.icon)" aria-hidden="true" data-ui-popconfirm-icon="true">
            <slot name="icon">
              <span :class="icon" class="size-[1em]"></span>
            </slot>
          </span>
          <div class="min-w-0 flex-1">
            <div v-if="hasTitle" :class="titleClass" :style="normalizeStyle(styles?.title)" data-ui-popconfirm-title="true">
              <slot name="title">{{ title }}</slot>
            </div>
            <div v-if="hasDescription" :class="contentClass" :style="normalizeStyle(styles?.content)" data-ui-popconfirm-content="true">
              <slot name="description">{{ description }}</slot>
            </div>
            <div :class="actionsClass" :style="normalizeStyle(styles?.actions)" data-ui-popconfirm-actions="true">
              <Button
                v-if="showCancel"
                :size="cancelButtonSize"
                :variant="cancelButtonVariant"
                :color="cancelButtonColor"
                :radius="cancelButtonRadius"
                :loading="cancelButtonProps?.loading"
                :disabled="cancelButtonProps?.disabled"
                :icon="cancelButtonProps?.icon"
                @click="handleCancel"
              >
                {{ cancelText }}
              </Button>
              <Button
                :size="okButtonSize"
                :color="okButtonColor"
                :variant="okButtonVariant"
                :radius="okButtonRadius"
                :loading="okButtonProps?.loading"
                :disabled="okButtonProps?.disabled"
                :icon="okButtonProps?.icon"
                @click="handleConfirm"
              >
                {{ okText }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
