import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import type { CSSProperties } from 'vue'

export { default as Badge } from './Badge.vue'
export { default as BadgeRibbon } from './BadgeRibbon.vue'

export type BadgeStatus = 'success' | 'processing' | 'default' | 'error' | 'warning'
export type BadgeSize = 'medium' | 'small'
export type BadgeRibbonPlacement = 'start' | 'end'
export type BadgeSemanticName = 'root' | 'indicator' | 'text'
export type BadgeRibbonSemanticName = 'root' | 'indicator' | 'content'
export type BadgeSemanticClassNames = Partial<Record<BadgeSemanticName, string>>
export type BadgeRibbonSemanticClassNames = Partial<Record<BadgeRibbonSemanticName, string>>
export type BadgeSemanticStyles = Partial<Record<BadgeSemanticName, CSSProperties | string>>
export type BadgeRibbonSemanticStyles = Partial<Record<BadgeRibbonSemanticName, CSSProperties | string>>

const badgeStatusColors: Record<BadgeStatus, string> = {
  success: 'bg-green-500',
  processing: 'bg-brand-500',
  default: 'bg-zinc-400 dark:bg-zinc-500',
  error: 'bg-red-500',
  warning: 'bg-amber-500'
}

const badgeRibbonColors = {
  brand: 'bg-brand-500 text-white',
  blue: 'bg-blue-500 text-white',
  red: 'bg-red-500 text-white',
  green: 'bg-green-500 text-white',
  yellow: 'bg-amber-500 text-white',
  orange: 'bg-orange-500 text-white',
  gray: 'bg-zinc-500 text-white'
} as const

const badgeRibbonFoldColors = {
  brand: 'bg-brand-700',
  blue: 'bg-blue-700',
  red: 'bg-red-700',
  green: 'bg-green-700',
  yellow: 'bg-amber-700',
  orange: 'bg-orange-700',
  gray: 'bg-zinc-700'
} as const

/** badgeRoot 定义 Badge 包裹节点或状态点节点布局。 */
export const badgeRoot = cva('relative inline-flex w-fit align-middle', {
  variants: {
    statusMode: {
      true: 'items-center gap-2',
      false: 'items-start'
    },
    standalone: {
      true: 'leading-none',
      false: ''
    }
  },
  defaultVariants: {
    statusMode: false,
    standalone: false
  }
})

/** badgeIndicator 定义数字徽标和小红点的核心样式。 */
export const badgeIndicator = cva('z-1 inline-flex origin-center items-center justify-center whitespace-nowrap rounded-full font-normal shadow-[0_0_0_1px_rgba(255,255,255,0.95)] transition-all duration-200 dark:shadow-[0_0_0_1px_rgba(24,24,27,0.95)]', {
  variants: {
    mode: {
      count: 'bg-red-500 text-white',
      dot: 'bg-red-500 p-0 text-transparent',
      status: 'p-0 text-transparent shadow-none'
    },
    size: {
      medium: '',
      small: ''
    },
    anchored: {
      true: 'absolute right-0 top-0',
      false: 'relative'
    },
    status: {
      success: badgeStatusColors.success,
      processing: badgeStatusColors.processing,
      default: badgeStatusColors.default,
      error: badgeStatusColors.error,
      warning: badgeStatusColors.warning
    }
  },
  compoundVariants: [
    { mode: 'count', size: 'medium', class: 'h-5 min-w-5 px-1.5 text-xs/5' },
    { mode: 'count', size: 'small', class: 'h-3.5 min-w-3.5 px-1 text-[10px]/3.5' },
    { mode: 'dot', size: 'medium', class: 'size-2' },
    { mode: 'dot', size: 'small', class: 'size-1.5' },
    { mode: 'status', class: 'size-1.5' },
    { status: 'processing', mode: 'status', class: 'after:(absolute inset-0 animate-ping rounded-full bg-brand-500/40 content-empty)' }
  ],
  defaultVariants: {
    mode: 'count',
    size: 'medium',
    anchored: true,
    status: 'error'
  }
})

/** badgeStatusText 定义状态点旁文本。 */
export const badgeStatusText = cva('text-sm/5 text-secondary')

/** badgeRibbonRoot 定义缎带徽标包裹容器，允许折角伸出内容边界。 */
export const badgeRibbonRoot = cva('relative rounded-md')

/** badgeRibbonIndicator 定义缎带徽标位置、颜色和阴影。 */
export const badgeRibbonIndicator = cva('absolute top-3 z-1 inline-flex h-8 min-w-12 items-center justify-center px-4 text-sm/8 font-medium shadow-sm', {
  variants: {
    placement: {
      start: 'left-0 -translate-x-3 rounded-md rounded-bl-none',
      end: 'right-0 translate-x-3 rounded-md rounded-br-none'
    },
    color: {
      brand: badgeRibbonColors.brand,
      blue: badgeRibbonColors.blue,
      red: badgeRibbonColors.red,
      green: badgeRibbonColors.green,
      yellow: badgeRibbonColors.yellow,
      orange: badgeRibbonColors.orange,
      gray: badgeRibbonColors.gray,
      custom: 'text-white'
    }
  },
  defaultVariants: {
    placement: 'end',
    color: 'brand'
  }
})

/** badgeRibbonFold 定义缎带折角阴影。 */
export const badgeRibbonFold = cva('absolute top-11 z-0 size-3', {
  variants: {
    placement: {
      start: 'left-0 -translate-x-3 [clip-path:polygon(0_0,100%_0,100%_65%)]',
      end: 'right-0 translate-x-3 [clip-path:polygon(0_0,100%_0,0_65%)]'
    },
    color: {
      brand: badgeRibbonFoldColors.brand,
      blue: badgeRibbonFoldColors.blue,
      red: badgeRibbonFoldColors.red,
      green: badgeRibbonFoldColors.green,
      yellow: badgeRibbonFoldColors.yellow,
      orange: badgeRibbonFoldColors.orange,
      gray: badgeRibbonFoldColors.gray,
      custom: ''
    }
  },
  defaultVariants: {
    placement: 'end',
    color: 'brand'
  }
})

export type BadgeIndicatorProps = VariantProps<typeof badgeIndicator>
export type BadgeRibbonIndicatorProps = VariantProps<typeof badgeRibbonIndicator>
export type BadgeRibbonColor = NonNullable<BadgeRibbonIndicatorProps['color']>
