import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import type { CSSProperties } from 'vue'

import type { ButtonProps } from '../button'
import type { TooltipArrow, TooltipPlacement, TooltipTrigger } from '../tooltip'

export { default as Popconfirm } from './Popconfirm.vue'

export type PopconfirmPlacement = TooltipPlacement
export type PopconfirmTrigger = TooltipTrigger
export type PopconfirmArrow = TooltipArrow
export type PopconfirmOkType = 'primary' | 'danger' | 'default'
export type PopconfirmSemanticName = 'root' | 'container' | 'arrow' | 'icon' | 'title' | 'content' | 'actions'
export type PopconfirmSemanticClassNames = Partial<Record<PopconfirmSemanticName, string>>
export type PopconfirmSemanticStyles = Partial<Record<PopconfirmSemanticName, CSSProperties | string>>
export type PopconfirmButtonProps = Partial<Pick<ButtonProps, 'color' | 'variant' | 'size' | 'radius'>> & {
  loading?: boolean
  disabled?: boolean
  icon?: string
}

/** popconfirmRoot 定义确认浮层的固定定位和宽度。 */
export const popconfirmRoot = cva('fixed max-w-[min(320px,calc(100vw-16px))] outline-none', {
  variants: {
    interactive: {
      true: 'pointer-events-auto',
      false: 'pointer-events-none'
    }
  },
  defaultVariants: {
    interactive: true
  }
})

/** popconfirmContainer 定义确认浮层卡片视觉。 */
export const popconfirmContainer = cva('relative rounded-lg border border-medium bg-primary px-3 py-3 text-sm text-secondary shadow-xl')

/** popconfirmArrow 定义确认浮层箭头，只保留暴露在卡片外侧的两条边框。 */
export const popconfirmArrow = cva('absolute size-2 rotate-45 bg-primary', {
  variants: {
    side: {
      top: 'border-r border-b border-medium',
      bottom: 'border-l border-t border-medium',
      left: 'border-r border-t border-medium',
      right: 'border-l border-b border-medium'
    }
  },
  defaultVariants: {
    side: 'top'
  }
})

/** popconfirmIcon 定义默认确认图标样式。 */
export const popconfirmIcon = cva('mt-0.5 inline-flex size-4 shrink-0 items-center justify-center text-amber-500 dark:text-amber-300')

/** popconfirmTitle 定义确认标题。 */
export const popconfirmTitle = cva('font-medium text-primary')

/** popconfirmContent 定义确认描述。 */
export const popconfirmContent = cva('mt-1 text-xs/5 text-tertiary')

/** popconfirmActions 定义按钮操作区。 */
export const popconfirmActions = cva('mt-3 flex justify-end gap-2')

export type PopconfirmRootProps = VariantProps<typeof popconfirmRoot>
