import { cva } from 'class-variance-authority'

export { default as Tooltip } from './Tooltip.vue'

export type TooltipPlacement = 'top' | 'left' | 'right' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom'
export type TooltipTrigger = 'hover' | 'focus' | 'click' | 'contextMenu'
export type TooltipArrow = boolean | { pointAtCenter?: boolean }
export type TooltipSemanticClassNames = Partial<Record<'root' | 'body' | 'arrow', string>>
export type TooltipSemanticStyles = Partial<Record<'root' | 'body' | 'arrow', string | Record<string, string | number>>>

/** tooltipRoot 定义 Tooltip 浮层根节点的基础视觉。 */
export const tooltipRoot = cva('fixed pointer-events-none max-w-[min(320px,calc(100vw-16px))] rounded-md bg-zinc-900 px-2 py-1.5 text-xs/5 font-medium text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900', {
  variants: {
    interactive: {
      true: 'pointer-events-auto',
      false: ''
    }
  },
  defaultVariants: {
    interactive: false
  }
})

/** tooltipArrow 定义 Tooltip 箭头本体。 */
export const tooltipArrow = cva('absolute size-2 rotate-45 bg-inherit')
