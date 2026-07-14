<script setup lang="ts">
import SimpleBar from 'simplebar-vue'

import 'simplebar-vue/dist/simplebar.min.css'
import { computed, nextTick, onMounted, onUnmounted, ref, useSlots, useTemplateRef, watch } from 'vue'

type DropdownItem = object & { disabled?: boolean }
type DropdownValue = unknown | unknown[]
type DropdownTrigger = 'click' | 'hover' | 'contextMenu'
type DropdownPlacement = 'bottomLeft' | 'bottom' | 'bottomRight' | 'topLeft' | 'top' | 'topRight'
type OpenChangeSource = 'trigger' | 'menu'
type DropdownArrow = boolean | { pointAtCenter?: boolean }
type DropdownStyle = string | Record<string, string | number>

interface TriggerBounds {
  top: number
  bottom: number
  left: number
  right: number
  width: number
  height: number
}

/**
 * Dropdown 是支持 Teleport、键盘导航和多选值的轻量下拉容器。
 */
const props = withDefaults(
  defineProps<{
    /** items 是下拉项数据源，可选；每项可通过 disabled 禁用。 */
    items?: DropdownItem[]
    /** valueKey 是从 item 取值的字段名，可选；为空时使用 item 本身。 */
    valueKey?: string
    /** align 是下拉层水平对齐方式，可选，默认 left。 */
    align?: 'left' | 'right'
    /** placement 是下拉层弹出位置，支持六个常用方位。 */
    placement?: DropdownPlacement
    /** trigger 是触发方式，可组合 click、hover、contextMenu。 */
    trigger?: DropdownTrigger | DropdownTrigger[]
    /** arrow 控制是否显示箭头，可用 pointAtCenter 让箭头指向触发器中心。 */
    arrow?: DropdownArrow
    /** autoAdjustOverflow 控制空间不足时是否自动翻转并限制视口溢出。 */
    autoAdjustOverflow?: boolean
    /** disabled 表示禁用触发器打开行为。 */
    disabled?: boolean
    /** destroyOnHidden 控制关闭后是否销毁下拉层 DOM，默认保留本地旧行为。 */
    destroyOnHidden?: boolean
    /** closeOnSelect 控制选中后是否关闭；未设置时单选关闭、多选保持展开。 */
    closeOnSelect?: boolean
    /** minWidth 是下拉层最小宽度，可选，需为 CSS 长度。 */
    minWidth?: string
    /** width 是下拉层固定宽度，可选，需为 CSS 长度。 */
    width?: string
    /** maxHeight 是滚动区域最大高度，可选，默认 320px。 */
    maxHeight?: string
    /** contentClass 是下拉层额外类名，可选。 */
    contentClass?: string
    /** popupStyle 是浮层额外内联样式。 */
    popupStyle?: DropdownStyle
    /** focusOnOpen 控制打开后是否自动聚焦菜单容器，输入型触发器需要关闭。 */
    focusOnOpen?: boolean
    /** fullWidth 控制触发器容器是否撑满父级，表单控件型下拉可开启。 */
    fullWidth?: boolean
  }>(),
  {
    align: 'left',
    trigger: 'click',
    arrow: false,
    autoAdjustOverflow: true,
    disabled: false,
    destroyOnHidden: true,
    minWidth: '128px',
    maxHeight: '320px',
    focusOnOpen: true,
    fullWidth: false
  }
)

const value = defineModel<DropdownValue>('value')
const isOpen = defineModel<boolean>('open', { default: false })
const slots = useSlots()
const dropdownRef = useTemplateRef('dropdownRef')
const menuContainerRef = useTemplateRef('menuContainerRef')
const menuRef = useTemplateRef('menuRef')
const activeIndex = ref(-1)
const keyboardNavigationActive = ref(false)
const menuTop = ref<number | null>(null)
const menuScrollMaxHeight = ref(props.maxHeight)
const menuMeasuredWidth = ref<number | null>(null)
const menuGap = 4
const viewportPadding = 8
const arrowSize = 8
let positionFrame = 0
let positionUpdateId = 0
let shouldRefreshTriggerBounds = false
let latestOpenChangeSource: OpenChangeSource = 'trigger'
let triggerResizeObserver: ResizeObserver | null = null
let hoverOpenTimer: number | undefined

const triggerBounds = ref<TriggerBounds>({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  width: 0,
  height: 0
})
const activePlacement = ref<DropdownPlacement>(props.placement ?? (props.align === 'right' ? 'bottomRight' : 'bottomLeft'))
const contextMenuPoint = ref<{ left: number; top: number } | null>(null)

const getTriggerBounds = (): TriggerBounds | null => {
  const triggerEl = dropdownRef.value
  if (!triggerEl) return null

  const rect = triggerEl.getBoundingClientRect()
  return {
    top: rect.top,
    bottom: rect.bottom,
    left: rect.left,
    right: rect.right,
    width: rect.width,
    height: rect.height
  }
}

// 触发器在普通文档流中，下拉层通过 Teleport 固定到 body，需要缓存触发器的视口坐标。
const updateTriggerBounds = () => {
  const bounds = getTriggerBounds()
  if (bounds) triggerBounds.value = bounds
}

const parsePixelLength = (value?: string) => {
  const match = value?.match(/^(\d+(?:\.\d+)?)px$/)
  return match ? Number(match[1]) : undefined
}

const normalizePlacement = (): DropdownPlacement => props.placement ?? (props.align === 'right' ? 'bottomRight' : 'bottomLeft')

const normalizedTriggers = computed<DropdownTrigger[]>(() => (Array.isArray(props.trigger) ? props.trigger : [props.trigger]))
const shouldRenderMenu = computed(() => isOpen.value || !props.destroyOnHidden)
const hasArrow = computed(() => Boolean(props.arrow))
const arrowPointAtCenter = computed(() => typeof props.arrow === 'object' && Boolean(props.arrow.pointAtCenter))

const normalizeStyleValue = (style?: DropdownStyle) => {
  if (!style) return {}
  if (typeof style === 'string') return style
  return style
}

const extraPopupStyle = computed(() => normalizeStyleValue(props.popupStyle))

const getAlignment = (placement: DropdownPlacement) => {
  if (placement.endsWith('Left')) return 'left'
  if (placement.endsWith('Right')) return 'right'
  return 'center'
}

const getVerticalPlacement = (placement: DropdownPlacement) => (placement.startsWith('top') ? 'top' : 'bottom')

const getOppositePlacement = (placement: DropdownPlacement): DropdownPlacement => {
  const alignment = getAlignment(placement)
  const isTop = placement.startsWith('top')
  if (alignment === 'left') return isTop ? 'bottomLeft' : 'topLeft'
  if (alignment === 'right') return isTop ? 'bottomRight' : 'topRight'
  return isTop ? 'bottom' : 'top'
}

const getHorizontalPosition = (placement: DropdownPlacement, anchorBounds: TriggerBounds, menuWidth: number) => {
  if (contextMenuPoint.value) return contextMenuPoint.value.left
  const alignment = getAlignment(placement)
  if (alignment === 'center') return anchorBounds.left + (anchorBounds.width - menuWidth) / 2
  if (alignment === 'right') return anchorBounds.right - menuWidth
  return anchorBounds.left
}

const getAnchorBounds = (): TriggerBounds => {
  if (!contextMenuPoint.value) return triggerBounds.value
  const { left, top } = contextMenuPoint.value
  return {
    top,
    bottom: top,
    left,
    right: left,
    width: 0,
    height: 0
  }
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max))

const getClampedLeft = (left: number, menuWidth: number, viewportWidth: number) => {
  if (!props.autoAdjustOverflow) return left
  const maxLeft = Math.max(viewportPadding, viewportWidth - menuWidth - viewportPadding)
  return clamp(left, viewportPadding, maxLeft)
}

const getArrowLeft = (menuLeft: number, menuWidth: number) => {
  const anchorCenter = contextMenuPoint.value ? contextMenuPoint.value.left : triggerBounds.value.left + triggerBounds.value.width / 2
  if (arrowPointAtCenter.value) return clamp(anchorCenter - menuLeft - arrowSize / 2, arrowSize, Math.max(arrowSize, menuWidth - arrowSize * 2))
  const alignment = getAlignment(activePlacement.value)
  if (alignment === 'center') return clamp(menuWidth / 2 - arrowSize / 2, arrowSize, Math.max(arrowSize, menuWidth - arrowSize * 2))
  return clamp(anchorCenter - menuLeft - arrowSize / 2, arrowSize, Math.max(arrowSize, menuWidth - arrowSize * 2))
}

const menuStyle = computed(() => {
  const anchorBounds = getAnchorBounds()
  const expectedWidth = menuMeasuredWidth.value ?? parsePixelLength(props.width) ?? parsePixelLength(props.minWidth) ?? 0
  const viewportWidth = typeof window === 'undefined' ? 0 : window.innerWidth
  const menuWidth = expectedWidth || anchorBounds.width || parsePixelLength(props.minWidth) || 128
  const rawLeft = getHorizontalPosition(activePlacement.value, anchorBounds, menuWidth)
  const style: Record<string, string | number> = {
    position: 'fixed',
    top: `${menuTop.value ?? anchorBounds.bottom + menuGap}px`,
    left: `${getClampedLeft(rawLeft, menuWidth, viewportWidth)}px`,
    minWidth: props.minWidth,
    maxWidth: props.autoAdjustOverflow ? `calc(100vw - ${viewportPadding * 2}px)` : 'none',
    zIndex: 2000
  }

  if (props.width) {
    style.width = props.width
  }

  return style
})

const arrowStyle = computed(() => {
  const menuWidth = menuMeasuredWidth.value ?? parsePixelLength(props.width) ?? parsePixelLength(props.minWidth) ?? triggerBounds.value.width ?? 128
  const menuLeft = parseFloat(String(menuStyle.value.left || '0'))
  return {
    left: `${getArrowLeft(menuLeft, menuWidth)}px`
  }
})

const arrowClass = computed(() => (getVerticalPlacement(activePlacement.value) === 'top' ? 'bottom-[-4px] border-b border-r' : 'top-[-4px] border-l border-t'))

const transformOrigin = computed(() => {
  const vertical = getVerticalPlacement(activePlacement.value)
  const alignment = getAlignment(activePlacement.value)
  const x = alignment === 'left' ? 'left' : alignment === 'right' ? 'right' : 'center'
  return `${x} ${vertical === 'top' ? 'bottom' : 'top'}`
})

const hasDefaultContent = computed(() => !!slots.default)
const menuContentStyle = computed(() => ({ maxHeight: menuScrollMaxHeight.value }))

const emit = defineEmits<{
  (e: 'select', item: DropdownItem): void
  (e: 'openChange', open: boolean, info: { source: OpenChangeSource }): void
  (e: 'visible-change', open: boolean): void
  (e: 'visibleChange', open: boolean): void
}>()

const getMenuElement = () => {
  const current = menuRef.value
  if (!current) return null
  return current instanceof HTMLElement ? current : current.$el || null
}

const setOpen = (open: boolean, source: OpenChangeSource = 'trigger') => {
  if (props.disabled && open) return
  latestOpenChangeSource = source
  isOpen.value = open
}

const openByTrigger = () => {
  contextMenuPoint.value = null
  activePlacement.value = normalizePlacement()
  setOpen(true, 'trigger')
}

const closeByTrigger = () => {
  setOpen(false, 'trigger')
}

const toggleByTrigger = () => {
  contextMenuPoint.value = null
  activePlacement.value = normalizePlacement()
  setOpen(!isOpen.value, 'trigger')
}

const clearHoverTimers = () => {
  if (hoverOpenTimer !== undefined) {
    window.clearTimeout(hoverOpenTimer)
    hoverOpenTimer = undefined
  }
}

const updateMenuPosition = async (refreshTriggerBounds = false) => {
  const updateId = ++positionUpdateId
  if (!isOpen.value) return

  menuScrollMaxHeight.value = props.maxHeight
  await nextTick()

  const menuEl = menuContainerRef.value
  if (updateId !== positionUpdateId || !isOpen.value || !menuEl) return

  if (refreshTriggerBounds) {
    const nextTriggerBounds = getTriggerBounds()
    if (!nextTriggerBounds) return
    triggerBounds.value = nextTriggerBounds
  }

  const anchorBounds = getAnchorBounds()
  const placement = activePlacement.value
  const verticalPlacement = getVerticalPlacement(placement)
  const viewportTop = 0
  const viewportBottom = window.innerHeight
  const paddedTop = viewportTop + viewportPadding
  const paddedBottom = viewportBottom - viewportPadding
  const defaultTop = verticalPlacement === 'top' ? anchorBounds.top - menuEl.offsetHeight - menuGap : anchorBounds.bottom + menuGap
  const menuHeight = menuEl.offsetHeight
  menuMeasuredWidth.value = menuEl.offsetWidth

  if (!props.autoAdjustOverflow) {
    menuTop.value = defaultTop
    return
  }

  const canFitBelow = anchorBounds.bottom + menuGap + menuHeight <= paddedBottom
  const canFitAbove = anchorBounds.top - menuHeight - menuGap >= paddedTop

  if (verticalPlacement === 'bottom' && (canFitBelow || !canFitAbove)) {
    menuTop.value = anchorBounds.bottom + menuGap
    return
  }

  if (verticalPlacement === 'top' && (canFitAbove || !canFitBelow)) {
    menuTop.value = anchorBounds.top - menuHeight - menuGap
    return
  }

  activePlacement.value = getOppositePlacement(placement)
  const nextVerticalPlacement = getVerticalPlacement(activePlacement.value)
  const nextDefaultTop = nextVerticalPlacement === 'top' ? anchorBounds.top - menuHeight - menuGap : anchorBounds.bottom + menuGap

  if (nextDefaultTop >= paddedTop && nextDefaultTop + menuHeight <= paddedBottom) {
    menuTop.value = nextDefaultTop
    return
  }

  const scrollEl = getMenuElement()
  const nonScrollableHeight = hasDefaultContent.value ? 0 : Math.max(0, menuHeight - (scrollEl?.offsetHeight || 0))
  const availableBelow = Math.max(0, paddedBottom - (anchorBounds.bottom + menuGap))
  const availableAbove = Math.max(0, anchorBounds.top - menuGap - paddedTop)
  const shouldPlaceAbove = nextVerticalPlacement === 'top' ? availableAbove >= availableBelow : availableAbove > availableBelow
  activePlacement.value = shouldPlaceAbove ? (activePlacement.value.endsWith('Right') ? 'topRight' : activePlacement.value.endsWith('Left') ? 'topLeft' : 'top') : activePlacement.value.endsWith('Right') ? 'bottomRight' : activePlacement.value.endsWith('Left') ? 'bottomLeft' : 'bottom'
  const availableHeight = shouldPlaceAbove ? availableAbove : Math.max(availableBelow, paddedBottom - paddedTop)

  // 两侧都放不下完整菜单时，压缩滚动区域高度，保留 header/footer 的实际高度。
  menuScrollMaxHeight.value = `${Math.max(0, Math.floor(availableHeight - nonScrollableHeight))}px`
  await nextTick()

  if (updateId !== positionUpdateId || !isOpen.value) return
  const nextMenuHeight = menuEl.offsetHeight
  const nextBottomTop = anchorBounds.bottom + menuGap
  menuTop.value = shouldPlaceAbove ? Math.max(paddedTop, anchorBounds.top - nextMenuHeight - menuGap) : Math.min(nextBottomTop, paddedBottom - nextMenuHeight)
}

const scheduleMenuPositionUpdate = (options: { refreshTriggerBounds?: boolean } = {}) => {
  if (!isOpen.value) return
  shouldRefreshTriggerBounds ||= Boolean(options.refreshTriggerBounds)
  if (positionFrame) cancelAnimationFrame(positionFrame)
  positionFrame = requestAnimationFrame(() => {
    positionFrame = 0
    const refreshTriggerBounds = shouldRefreshTriggerBounds
    shouldRefreshTriggerBounds = false
    void updateMenuPosition(refreshTriggerBounds)
  })
}

const scheduleMenuPositionRefresh = () => scheduleMenuPositionUpdate({ refreshTriggerBounds: true })

const handleScroll = (event: Event) => {
  const target = event.target
  if (target instanceof Node && menuContainerRef.value?.contains(target)) return
  scheduleMenuPositionRefresh()
}

const isTriggerEnabled = (trigger: DropdownTrigger) => !props.disabled && normalizedTriggers.value.includes(trigger)

const isInsideHoverArea = (target: EventTarget | null) => {
  if (!(target instanceof Node)) return false
  return Boolean(dropdownRef.value?.contains(target) || menuContainerRef.value?.contains(target))
}

const handleTriggerClick = () => {
  if (!isTriggerEnabled('click')) return
  toggleByTrigger()
}

const handleContextMenu = (event: MouseEvent) => {
  if (!isTriggerEnabled('contextMenu')) return
  event.preventDefault()
  contextMenuPoint.value = { left: event.clientX, top: event.clientY }
  activePlacement.value = normalizePlacement()
  setOpen(true, 'trigger')
}

const handleMouseEnter = () => {
  if (!isTriggerEnabled('hover')) return
  clearHoverTimers()
  hoverOpenTimer = window.setTimeout(() => {
    hoverOpenTimer = undefined
    openByTrigger()
  }, 80)
}

const handleMouseLeave = (event: MouseEvent) => {
  if (!isTriggerEnabled('hover')) return
  if (hoverOpenTimer !== undefined) {
    window.clearTimeout(hoverOpenTimer)
    hoverOpenTimer = undefined
  }
  if (isInsideHoverArea(event.relatedTarget)) return
  closeByTrigger()
}

const getItemValue = (item: DropdownItem) => (props.valueKey ? (item as Record<string, unknown>)[props.valueKey] : item)

const getIndexByValue = (val: unknown) => {
  if (!props.items) return -1
  return props.items.findIndex((item) => {
    const itemValue = getItemValue(item)
    if (Array.isArray(val)) {
      return val.includes(itemValue)
    }
    return itemValue === val
  })
}

const isItemSelected = (item: DropdownItem) => {
  const itemValue = getItemValue(item)
  if (Array.isArray(value.value)) {
    return value.value.includes(itemValue)
  }
  return value.value === itemValue
}

watch(isOpen, (val) => {
  keyboardNavigationActive.value = false
  emit('openChange', val, { source: latestOpenChangeSource })
  emit('visible-change', val)
  emit('visibleChange', val)
  if (val) {
    activeIndex.value = getIndexByValue(value.value)
    if (!contextMenuPoint.value) activePlacement.value = normalizePlacement()
    menuTop.value = null
    menuMeasuredWidth.value = null
    if (!contextMenuPoint.value) updateTriggerBounds()
    nextTick(() => {
      scheduleMenuPositionUpdate()

      // SimpleBar component's root element or its wrapper
      const el = getMenuElement()
      if (props.focusOnOpen) el?.focus()

      // Scroll to active item if exists
      if (activeIndex.value >= 0) {
        const items = el?.querySelectorAll('.dropdown-item-wrapper')
        const activeItem = items?.[activeIndex.value]
        if (activeItem && 'scrollIntoView' in activeItem && typeof activeItem.scrollIntoView === 'function') {
          activeItem.scrollIntoView({ block: 'nearest' })
        }
      }
    })
  } else {
    clearHoverTimers()
    contextMenuPoint.value = null
    shouldRefreshTriggerBounds = false
    menuTop.value = null
    menuMeasuredWidth.value = null
    menuScrollMaxHeight.value = props.maxHeight
  }
})

watch(
  () => props.items,
  () => {
    keyboardNavigationActive.value = false
  }
)

watch(
  () => [props.items, props.width, props.minWidth, props.maxHeight, props.placement, props.align],
  () => {
    activeIndex.value = getIndexByValue(value.value)
    activePlacement.value = normalizePlacement()
    menuScrollMaxHeight.value = props.maxHeight
    scheduleMenuPositionUpdate()
  }
)

const handleKeyDown = (e: KeyboardEvent) => {
  if (!isOpen.value || !props.items?.length) return false

  const items = props.items
  const itemCount = items.length
  e.preventDefault()
  e.stopPropagation()
  if (e.code === 'ArrowDown') {
    keyboardNavigationActive.value = true
    activeIndex.value = (activeIndex.value + 1) % itemCount
  } else if (e.code === 'ArrowUp') {
    keyboardNavigationActive.value = true
    activeIndex.value = (activeIndex.value - 1 + itemCount) % itemCount
  } else if (e.code === 'PageDown') {
    keyboardNavigationActive.value = true
    activeIndex.value = Math.min(activeIndex.value + 5, itemCount - 1)
  } else if (e.code === 'PageUp') {
    keyboardNavigationActive.value = true
    activeIndex.value = Math.max(activeIndex.value - 5, 0)
  } else if (e.code === 'Enter' || e.code === 'Space') {
    keyboardNavigationActive.value = true
    if (activeIndex.value >= 0) {
      handleItemClick(items[activeIndex.value])
      return true
    }
    return false
  } else if (e.code === 'Escape') {
    isOpen.value = false
    return true
  }

  // 键盘移动后保持当前激活项在 SimpleBar 可视区域内。
  if (activeIndex.value >= 0) {
    nextTick(() => {
      const menuEl = getMenuElement()
      const itemEl = menuEl?.querySelectorAll('.dropdown-item-wrapper')[activeIndex.value]
      if (itemEl && 'scrollIntoView' in itemEl && typeof itemEl.scrollIntoView === 'function') {
        itemEl.scrollIntoView({ block: 'nearest' })
      }
    })
  }

  return true
}

const handleItemMouseEnter = (index: number) => {
  activeIndex.value = index
  keyboardNavigationActive.value = false
}

const handleItemClick = (item: DropdownItem) => {
  if (item?.disabled) return

  const isMultiple = Array.isArray(value.value)
  const itemValue = getItemValue(item)
  if (isMultiple && Array.isArray(value.value)) {
    // 数组值表示多选模式，点击同一项时切换选中状态。
    const index = value.value.indexOf(itemValue)
    if (index === -1) {
      value.value = [...value.value, itemValue]
    } else {
      value.value = value.value.filter((v) => v !== itemValue)
    }
  } else {
    // 单选模式选择后立即关闭下拉层，符合菜单选择预期。
    value.value = itemValue
    if (props.closeOnSelect ?? true) setOpen(false, 'menu')
  }

  if (isMultiple && props.closeOnSelect) setOpen(false, 'menu')
  emit('select', item)
}

const handleClickOutside = (event: PointerEvent) => {
  const target = event.target as Node
  const isOutsideTrigger = dropdownRef.value && !dropdownRef.value.contains(target)
  const isOutsideMenu = menuContainerRef.value && !menuContainerRef.value.contains(target)

  if (isOutsideTrigger && isOutsideMenu) {
    closeByTrigger()
  }
}

onMounted(() => {
  updateTriggerBounds()
  if (isOpen.value) {
    activeIndex.value = getIndexByValue(value.value)
    activePlacement.value = normalizePlacement()
    scheduleMenuPositionUpdate()
  }
  document.addEventListener('pointerdown', handleClickOutside, true)
  document.addEventListener('scroll', handleScroll, true)
  window.addEventListener('resize', scheduleMenuPositionRefresh)

  if (typeof ResizeObserver !== 'undefined' && dropdownRef.value) {
    triggerResizeObserver = new ResizeObserver(() => scheduleMenuPositionUpdate())
    triggerResizeObserver.observe(dropdownRef.value)
  }
})

onUnmounted(() => {
  clearHoverTimers()
  document.removeEventListener('pointerdown', handleClickOutside, true)
  document.removeEventListener('scroll', handleScroll, true)
  window.removeEventListener('resize', scheduleMenuPositionRefresh)
  triggerResizeObserver?.disconnect()
  if (positionFrame) cancelAnimationFrame(positionFrame)
})

defineExpose({
  close: () => (isOpen.value = false),
  open: () => (isOpen.value = true),
  handleKeyDown
})
</script>

<template>
  <div ref="dropdownRef" :class="['relative inline-block', fullWidth ? 'w-full min-w-0' : '', { 'pointer-events-none opacity-50': disabled }]" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave" @contextmenu="handleContextMenu">
    <div :class="['h-full flex items-center', fullWidth ? 'w-full min-w-0' : '']" @click="handleTriggerClick">
      <slot name="trigger" :open="isOpen" />
    </div>

    <Teleport to="body">
      <Transition name="ui-dropdown-motion">
        <div
          v-if="shouldRenderMenu"
          v-show="isOpen"
          ref="menuContainerRef"
          :class="['fixed bg-primary border border-medium shadow-xl rounded-lg outline-none overflow-hidden', contentClass]"
          :style="[menuStyle, { transformOrigin }, extraPopupStyle]"
          :data-placement="activePlacement"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
        >
          <span v-if="hasArrow" :class="['absolute z-1 size-2 rotate-45 border-medium bg-primary', arrowClass]" :style="arrowStyle"></span>
          <slot name="header" />
          <slot v-if="$slots.default" />
          <SimpleBar v-else ref="menuRef" tabindex="-1" role="menu" @keydown="handleKeyDown" class="outline-none" :style="menuContentStyle">
            <div
              v-for="(item, index) in items"
              :key="index"
              class="dropdown-item-wrapper"
              :class="{ 'is-active': keyboardNavigationActive && index === activeIndex, 'is-selected': isItemSelected(item), 'pointer-events-none opacity-50': item.disabled }"
              :data-selected="isItemSelected(item) ? 'true' : undefined"
              @mouseenter="handleItemMouseEnter(index)"
              @click="handleItemClick(item)"
            >
              <slot name="item" :item="item" :index="index" :active="keyboardNavigationActive && index === activeIndex" :selected="isItemSelected(item)" />
            </div>
          </SimpleBar>
          <slot name="footer" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.ui-dropdown-motion-enter-active,
.ui-dropdown-motion-leave-active {
  transition:
    opacity 120ms cubic-bezier(0.2, 0, 0.2, 1),
    transform 120ms cubic-bezier(0.2, 0, 0.2, 1);
}

.ui-dropdown-motion-enter-from,
.ui-dropdown-motion-leave-to {
  opacity: 0;
  transform: scaleY(0.92);
}

.ui-dropdown-motion-enter-to,
.ui-dropdown-motion-leave-from {
  opacity: 1;
  transform: scaleY(1);
}

:deep(.dropdown-item-wrapper),
:deep(.dropdown-item-wrapper > *) {
  --at-apply: '!text-primary';
  transition-property: color, background-color;
  transition-duration: 150ms;
}

:deep(.dropdown-item-wrapper:not(.is-selected):hover),
:deep(.dropdown-item-wrapper:not(.is-selected):hover > *) {
  --at-apply: '!bg-secondary/70';
}

:deep(.dropdown-item-wrapper.is-selected),
:deep(.dropdown-item-wrapper.is-selected > *) {
  --at-apply: '!bg-brand/10 !text-brand';
}

:deep(.dropdown-item-wrapper.is-selected:hover),
:deep(.dropdown-item-wrapper.is-selected:hover > *) {
  --at-apply: '!bg-brand/15';
}

:deep(.dropdown-item-wrapper.is-active:not(.is-selected)),
:deep(.dropdown-item-wrapper.is-active:not(.is-selected) > *) {
  --at-apply: '!bg-brand/10';
}

:deep(.dropdown-item-wrapper.is-selected.is-active),
:deep(.dropdown-item-wrapper.is-selected.is-active > *) {
  --at-apply: '!bg-brand/20';
  box-shadow: none !important;
  outline: none !important;
}
</style>
