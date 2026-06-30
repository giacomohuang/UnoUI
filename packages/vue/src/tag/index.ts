import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
export { default as Tag } from './Tag.vue'

const tagColors = {
  brand: {
    dark: 'border-brand-500 bg-brand-500 text-white dark:border-brand-400/40 dark:bg-brand-500/30 dark:text-brand-400',
    light: 'border-brand-500/20 bg-brand-500/10 text-brand-400 dark:border-brand-400/30 dark:bg-brand-400/20 dark:text-brand-200',
    plain: 'border-brand-500/40 bg-transparent text-brand-400 dark:border-brand-400/40 dark:text-brand-400'
  },
  blue: {
    dark: 'border-blue-500 bg-blue-500 text-white dark:border-blue-400/40 dark:bg-blue-500/30 dark:text-blue-400',
    light: 'border-blue-500/20 bg-blue-500/10 text-blue-400 dark:border-blue-400/30 dark:bg-blue-400/20 dark:text-blue-200',
    plain: 'border-blue-500/40 bg-transparent text-blue-400 dark:border-blue-400/40 dark:text-blue-400'
  },
  red: {
    dark: 'border-red-500 bg-red-500 text-white dark:border-red-400/40 dark:bg-red-500/30 dark:text-red-400',
    light: 'border-red-500/20 bg-red-500/10 text-red-400 dark:border-red-400/30 dark:bg-red-400/20 dark:text-red-200',
    plain: 'border-red-500/40 bg-transparent text-red-400 dark:border-red-400/40 dark:text-red-400'
  },
  green: {
    dark: 'border-green-500 bg-green-500 text-white dark:border-green-400/40 dark:bg-green-500/30 dark:text-green-400',
    light: 'border-green-500/20 bg-green-500/10 text-green-400 dark:border-green-400/30 dark:bg-green-400/20 dark:text-green-200',
    plain: 'border-green-500/40 bg-transparent text-green-400 dark:border-green-400/40 dark:text-green-400'
  },
  gray: {
    dark: 'border-slate-500 bg-slate-500 text-white dark:border-zinc400/40 dark:bg-zinc-500/30 dark:text-zinc-400',
    light: 'border-slate-400/25 bg-slate-500/10 text-slate-400 dark:border-zinc-500/30 dark:bg-zinc-500/20 dark:text-zinc-300',
    plain: 'border-slate-400/45 bg-transparent text-slate-400 dark:border-zinc-500/45 dark:text-zinc-400'
  },
  yellow: {
    dark: 'border-amber-500 bg-amber-500 text-white dark:border-amber-400/40 dark:bg-amber-500/30 dark:text-amber-400',
    light: 'border-amber-500/25 bg-amber-500/10 text-amber-400 dark:border-amber-400/30 dark:bg-amber-400/20 dark:text-amber-200',
    plain: 'border-amber-500/45 bg-transparent text-amber-400 dark:border-amber-400/45 dark:text-amber-400'
  },
  orange: {
    dark: 'border-orange-500 bg-orange-500 text-white dark:border-orange-400/40 dark:bg-orange-500/30 dark:text-orange-400',
    light: 'border-orange-500/20 bg-orange-500/10 text-orange-400 dark:border-orange-400/30 dark:bg-orange-400/20 dark:text-orange-200',
    plain: 'border-orange-500/40 bg-transparent text-orange-400 dark:border-orange-400/40 dark:text-orange-400'
  }
} as const

const tagCompoundVariants = Object.entries(tagColors).flatMap(([color, variants]) =>
  Object.entries(variants).map(([variant, className]) => ({
    color: color as keyof typeof tagColors,
    variant: variant as keyof (typeof tagColors)[keyof typeof tagColors],
    class: className
  }))
)

/** tag 定义管理端 Tag 组件的样式变体组合。 */
export const tag = cva('inline-flex items-center justify-center border align-middle leading-none whitespace-nowrap font-normal', {
  variants: {
    color: {
      brand: '',
      blue: '',
      red: '',
      green: '',
      gray: '',
      yellow: '',
      orange: ''
    },
    variant: {
      dark: '',
      light: '',
      plain: ''
    },
    size: {
      sm: 'text-xs px-1 py-0.5',
      md: 'text-sm px-2 py-1',
      lg: 'text-sm px-2.5 py-2'
    },
    radius: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-xl',
      round: 'rounded-full'
    }
  },
  compoundVariants: tagCompoundVariants,
  defaultVariants: {
    color: 'gray',
    variant: 'light',
    radius: 'sm',
    size: 'md'
  }
})
/** TagProps 是 tag 变体推导出的组件属性类型。 */
export type TagProps = VariantProps<typeof tag>
