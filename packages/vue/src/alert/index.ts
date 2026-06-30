import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import type { CSSProperties } from 'vue'

export { default as Alert } from './Alert.vue'

export type AlertType = 'success' | 'info' | 'warning' | 'error'
export type AlertVariant = 'outlined' | 'filled'
export type AlertSemanticName = 'root' | 'icon' | 'section' | 'title' | 'description' | 'actions' | 'close'
export type AlertSemanticClassNames = Partial<Record<AlertSemanticName, string>>
export type AlertSemanticStyles = Partial<Record<AlertSemanticName, CSSProperties | string>>

export interface AlertClosableOptions {
  closeIcon?: string
  closeAriaLabel?: string
  afterClose?: () => void
  onClose?: (event: MouseEvent) => void
}

const alertTypes = ['success', 'info', 'warning', 'error'] as const
const alertVariants = ['outlined', 'filled'] as const

const alertTypeClasses: Record<AlertType, Record<AlertVariant, string>> = {
  success: {
    outlined: 'border-green-300/70 bg-green-50/80 text-green-900 dark:(border-green-500/35 bg-green-500/12 text-green-100)',
    filled: 'border-transparent bg-green-500/12 text-green-900 dark:(bg-green-500/18 text-green-100)'
  },
  info: {
    outlined: 'border-brand-300/70 bg-brand-50/80 text-brand-900 dark:(border-brand-500/35 bg-brand-500/12 text-brand-100)',
    filled: 'border-transparent bg-brand-500/12 text-brand-900 dark:(bg-brand-500/18 text-brand-100)'
  },
  warning: {
    outlined: 'border-amber-300/75 bg-amber-50/85 text-amber-950 dark:(border-amber-500/40 bg-amber-500/14 text-amber-100)',
    filled: 'border-transparent bg-amber-500/14 text-amber-950 dark:(bg-amber-500/20 text-amber-100)'
  },
  error: {
    outlined: 'border-red-300/75 bg-red-50/85 text-red-950 dark:(border-red-500/40 bg-red-500/14 text-red-100)',
    filled: 'border-transparent bg-red-500/14 text-red-950 dark:(bg-red-500/20 text-red-100)'
  }
}

const alertIconClasses: Record<AlertType, string> = {
  success: 'text-green-500 dark:text-green-300',
  info: 'text-brand-500 dark:text-brand-300',
  warning: 'text-amber-500 dark:text-amber-300',
  error: 'text-red-500 dark:text-red-300'
}

const alertCompoundVariants = alertTypes.flatMap((type) =>
  alertVariants.map((variant) => ({
    type,
    variant,
    class: alertTypeClasses[type][variant]
  }))
)

/** alertRoot 定义 Alert 根节点的状态色、边框和关闭动画。 */
export const alertRoot = cva('relative flex w-full overflow-hidden border px-3 py-2 text-sm transition-all duration-200 ease-out', {
  variants: {
    type: {
      success: '',
      info: '',
      warning: '',
      error: ''
    },
    variant: {
      outlined: '',
      filled: ''
    },
    banner: {
      true: 'rounded-none border-x-0 border-t-0',
      false: 'rounded-md'
    },
    withDescription: {
      true: 'items-start gap-3 px-4 py-4',
      false: 'items-center gap-2'
    },
    closing: {
      true: 'max-h-0 scale-y-95 px-0 py-0 opacity-0',
      false: 'max-h-80 opacity-100'
    }
  },
  compoundVariants: alertCompoundVariants,
  defaultVariants: {
    type: 'info',
    variant: 'outlined',
    banner: false,
    withDescription: false,
    closing: false
  }
})

/** alertIcon 定义 Alert 状态图标尺寸和颜色。 */
export const alertIcon = cva('mt-0.5 inline-flex shrink-0 items-center justify-center', {
  variants: {
    type: {
      success: alertIconClasses.success,
      info: alertIconClasses.info,
      warning: alertIconClasses.warning,
      error: alertIconClasses.error
    },
    withDescription: {
      true: 'size-6 text-2xl',
      false: 'size-4 text-base'
    }
  },
  defaultVariants: {
    type: 'info',
    withDescription: false
  }
})

/** alertSection 定义 Alert 文案区布局。 */
export const alertSection = cva('min-w-0 flex-1')

/** alertTitle 定义 Alert 标题文本样式。 */
export const alertTitle = cva('min-w-0 font-medium text-current', {
  variants: {
    withDescription: {
      true: 'text-sm/5',
      false: 'text-sm/5'
    }
  },
  defaultVariants: {
    withDescription: false
  }
})

/** alertDescription 定义 Alert 辅助描述文本样式。 */
export const alertDescription = cva('mt-1 text-xs/5 text-current/75')

/** alertActions 定义 Alert 操作区布局。 */
export const alertActions = cva('ml-auto flex shrink-0 items-center gap-2')

/** alertCloseButton 定义 Alert 关闭按钮交互样式。 */
export const alertCloseButton = cva('inline-flex size-6 shrink-0 items-center justify-center rounded text-current/65 transition-colors hover:(bg-current/10 text-current) focus-visible:(outline-none ring-2 ring-current/30)')

export type AlertRootProps = VariantProps<typeof alertRoot>
