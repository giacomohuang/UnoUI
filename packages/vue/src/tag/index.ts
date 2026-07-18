import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
export { default as Tag } from './Tag.vue'

const tagColors = {
  brand: {
    dark: 'border-brand-500 bg-brand-500 text-white dark:border-brand-400/40 dark:bg-brand-500/30 dark:text-brand-400',
    light: 'border-brand-500/20 bg-brand-500/10 text-brand-400 dark:border-brand-400/30 dark:bg-brand-400/20 dark:text-brand-200',
    plain: 'border-brand-500/40 bg-transparent text-brand-400 dark:border-brand-400/40 dark:text-brand-400',
    soft: 'border-transparent bg-brand-50 text-brand-700 dark:bg-brand-500/18 dark:text-brand-200'
  },
  blue: {
    dark: 'border-blue-500 bg-blue-500 text-white dark:border-blue-400/40 dark:bg-blue-500/30 dark:text-blue-400',
    light: 'border-blue-500/20 bg-blue-500/10 text-blue-400 dark:border-blue-400/30 dark:bg-blue-400/20 dark:text-blue-200',
    plain: 'border-blue-500/40 bg-transparent text-blue-400 dark:border-blue-400/40 dark:text-blue-400',
    soft: 'border-transparent bg-blue-50 text-blue-600 dark:bg-blue-500/18 dark:text-blue-200'
  },
  cyan: {
    dark: 'border-cyan-500 bg-cyan-500 text-white dark:border-cyan-400/40 dark:bg-cyan-500/30 dark:text-cyan-400',
    light: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-500 dark:border-cyan-400/30 dark:bg-cyan-400/20 dark:text-cyan-200',
    plain: 'border-cyan-500/40 bg-transparent text-cyan-500 dark:border-cyan-400/40 dark:text-cyan-400',
    soft: 'border-transparent bg-cyan-50 text-cyan-700 dark:bg-cyan-500/18 dark:text-cyan-200'
  },
  teal: {
    dark: 'border-teal-500 bg-teal-500 text-white dark:border-teal-400/40 dark:bg-teal-500/30 dark:text-teal-400',
    light: 'border-teal-500/20 bg-teal-500/10 text-teal-500 dark:border-teal-400/30 dark:bg-teal-400/20 dark:text-teal-200',
    plain: 'border-teal-500/40 bg-transparent text-teal-500 dark:border-teal-400/40 dark:text-teal-400',
    soft: 'border-transparent bg-teal-50 text-teal-700 dark:bg-teal-500/18 dark:text-teal-200'
  },
  green: {
    dark: 'border-green-500 bg-green-500 text-white dark:border-green-400/40 dark:bg-green-500/30 dark:text-green-400',
    light: 'border-green-500/20 bg-green-500/10 text-green-400 dark:border-green-400/30 dark:bg-green-400/20 dark:text-green-200',
    plain: 'border-green-500/40 bg-transparent text-green-400 dark:border-green-400/40 dark:text-green-400',
    soft: 'border-transparent bg-green-50 text-green-700 dark:bg-green-500/18 dark:text-green-200'
  },
  lime: {
    dark: 'border-lime-500 bg-lime-500 text-lime-950 dark:border-lime-400/40 dark:bg-lime-500/30 dark:text-lime-300',
    light: 'border-lime-500/25 bg-lime-500/10 text-lime-600 dark:border-lime-400/30 dark:bg-lime-400/20 dark:text-lime-200',
    plain: 'border-lime-500/45 bg-transparent text-lime-600 dark:border-lime-400/45 dark:text-lime-300',
    soft: 'border-transparent bg-lime-50 text-lime-700 dark:bg-lime-500/18 dark:text-lime-200'
  },
  yellow: {
    dark: 'border-amber-500 bg-amber-500 text-white dark:border-amber-400/40 dark:bg-amber-500/30 dark:text-amber-400',
    light: 'border-amber-500/25 bg-amber-500/10 text-amber-400 dark:border-amber-400/30 dark:bg-amber-400/20 dark:text-amber-200',
    plain: 'border-amber-500/45 bg-transparent text-amber-400 dark:border-amber-400/45 dark:text-amber-400',
    soft: 'border-transparent bg-amber-50 text-amber-700 dark:bg-amber-500/18 dark:text-amber-200'
  },
  orange: {
    dark: 'border-orange-500 bg-orange-500 text-white dark:border-orange-400/40 dark:bg-orange-500/30 dark:text-orange-400',
    light: 'border-orange-500/20 bg-orange-500/10 text-orange-400 dark:border-orange-400/30 dark:bg-orange-400/20 dark:text-orange-200',
    plain: 'border-orange-500/40 bg-transparent text-orange-400 dark:border-orange-400/40 dark:text-orange-400',
    soft: 'border-transparent bg-orange-50 text-orange-700 dark:bg-orange-500/18 dark:text-orange-200'
  },
  red: {
    dark: 'border-red-500 bg-red-500 text-white dark:border-red-400/40 dark:bg-red-500/30 dark:text-red-400',
    light: 'border-red-500/20 bg-red-500/10 text-red-400 dark:border-red-400/30 dark:bg-red-400/20 dark:text-red-200',
    plain: 'border-red-500/40 bg-transparent text-red-400 dark:border-red-400/40 dark:text-red-400',
    soft: 'border-transparent bg-red-50 text-red-600 dark:bg-red-500/18 dark:text-red-200'
  },
  pink: {
    dark: 'border-pink-500 bg-pink-500 text-white dark:border-pink-400/40 dark:bg-pink-500/30 dark:text-pink-400',
    light: 'border-pink-500/20 bg-pink-500/10 text-pink-400 dark:border-pink-400/30 dark:bg-pink-400/20 dark:text-pink-200',
    plain: 'border-pink-500/40 bg-transparent text-pink-400 dark:border-pink-400/40 dark:text-pink-400',
    soft: 'border-transparent bg-pink-50 text-pink-600 dark:bg-pink-500/18 dark:text-pink-200'
  },
  purple: {
    dark: 'border-purple-500 bg-purple-500 text-white dark:border-purple-400/40 dark:bg-purple-500/30 dark:text-purple-400',
    light: 'border-purple-500/20 bg-purple-500/10 text-purple-400 dark:border-purple-400/30 dark:bg-purple-400/20 dark:text-purple-200',
    plain: 'border-purple-500/40 bg-transparent text-purple-400 dark:border-purple-400/40 dark:text-purple-400',
    soft: 'border-transparent bg-purple-50 text-purple-600 dark:bg-purple-500/18 dark:text-purple-200'
  },
  indigo: {
    dark: 'border-indigo-500 bg-indigo-500 text-white dark:border-indigo-400/40 dark:bg-indigo-500/30 dark:text-indigo-400',
    light: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400 dark:border-indigo-400/30 dark:bg-indigo-400/20 dark:text-indigo-200',
    plain: 'border-indigo-500/40 bg-transparent text-indigo-400 dark:border-indigo-400/40 dark:text-indigo-400',
    soft: 'border-transparent bg-indigo-50 text-indigo-600 dark:bg-indigo-500/18 dark:text-indigo-200'
  },
  gray: {
    dark: 'border-slate-500 bg-slate-500 text-white dark:border-zinc-400/40 dark:bg-zinc-500/30 dark:text-zinc-400',
    light: 'border-slate-400/25 bg-slate-500/10 text-slate-400 dark:border-zinc-500/30 dark:bg-zinc-500/20 dark:text-zinc-300',
    plain: 'border-slate-400/45 bg-transparent text-slate-400 dark:border-zinc-500/45 dark:text-zinc-400',
    soft: 'border-transparent bg-slate-100 text-slate-600 dark:bg-zinc-500/18 dark:text-zinc-300'
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
      cyan: '',
      teal: '',
      green: '',
      lime: '',
      yellow: '',
      orange: '',
      red: '',
      pink: '',
      purple: '',
      indigo: '',
      gray: ''
    },
    variant: {
      dark: '',
      light: '',
      plain: '',
      soft: ''
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
