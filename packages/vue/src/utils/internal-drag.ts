type InternalDragFamily = 'pointer' | 'mouse' | 'touch'

/** UnoUI 内部组件若依赖 document/window 指针事件，必须在拖拽期间穿透 Modal/Drawer 的边界。 */
const INTERNAL_DRAG_SELECTOR = ['[data-ui-slider="true"]', '[data-ui-input="true"]', '[data-ui-colorpicker-panel="true"]', '[data-ui-splitter="true"]', '[data-ui-image-editor="true"]', '[data-ui-table="true"]'].join(',')

function dragFamily(event: Event): InternalDragFamily | undefined {
  if (event.type.startsWith('pointer')) return 'pointer'
  if (event.type.startsWith('mouse')) return 'mouse'
  if (event.type.startsWith('touch')) return 'touch'
  return undefined
}

function isInternalDragTarget(event: Event) {
  return event.target instanceof Element && event.target.closest(INTERNAL_DRAG_SELECTOR) !== null
}

/**
 * 创建浮层拖拽事件边界。
 *
 * 显式 selector 放行整个手势；UnoUI 内部拖拽组件只放行同一指针族的 move/up，
 * 初始 down 仍会被浮层拦截，避免同时触发后方地图或页面交互。
 */
export function createInternalDragBoundary() {
  const active = new Set<InternalDragFamily>()
  return (event: Event, explicitSelector = ''): boolean => {
    if (explicitSelector && event.target instanceof Element && event.target.closest(explicitSelector)) return true
    const family = dragFamily(event)
    if (!family) return false
    if (event.type.endsWith('down') || event.type === 'touchstart') {
      if (isInternalDragTarget(event)) active.add(family)
      else active.delete(family)
      return false
    }
    if (event.type.endsWith('move') || event.type === 'touchmove') {
      if (!active.has(family)) return false
      // 指针在浮层外释放时不会进入边界；无按键的后续 hover 自动清理残留状态。
      if ('buttons' in event && typeof event.buttons === 'number' && event.buttons === 0) {
        active.delete(family)
        return false
      }
      return true
    }
    if (event.type.endsWith('up') || event.type.endsWith('cancel') || event.type === 'touchend') return active.delete(family)
    return false
  }
}
