import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { controlSizeClasses } from '../control'

export { default as Button } from './Button.vue'
export { default as ButtonGroup } from './ButtonGroup.vue'

const buttonColorOptions = ['brand', 'red', 'gray', 'green', 'yellow', 'orange'] as const
const buttonVariantOptions = ['default', 'outline', 'dashed', 'link', 'mono'] as const
type ButtonColor = (typeof buttonColorOptions)[number]
type ButtonVariant = (typeof buttonVariantOptions)[number]
type ButtonColorStyleKey = 'solid' | 'outline' | 'mono' | 'dashed' | 'link'

const emptyVariantRecord = <T extends readonly string[]>(options: T) => Object.fromEntries(options.map((option) => [option, ''])) as Record<T[number], ''>

const buttonActiveClasses: Record<ButtonColor, string> = {
  brand: 'active:after:shadow-[0_0_0_0_brand-500]',
  red: 'active:after:shadow-[0_0_0_0_red-500]',
  gray: 'active:after:shadow-[0_0_0_0_gray-500]',
  green: 'active:after:shadow-[0_0_0_0_green-500]',
  yellow: 'active:after:shadow-[0_0_0_0_yellow-500]',
  orange: 'active:after:shadow-[0_0_0_0_orange-500]'
}
const buttonRippleClasses = 'after:(content-empty absolute inset-0 opacity-80 transition-all duration-800 shadow-[0_0_0_7px_transparent] ease-out) active:after:(opacity-0 duration-0)'

// 颜色态保留完整 UnoCSS 类字面量，确保构建扫描可以生成对应样式。
const buttonColorClasses: Record<ButtonColor, Record<ButtonColorStyleKey, string>> = {
  brand: {
    solid: 'border-brand-500 bg-brand-500 text-brand-50 hover:(border-brand-400 bg-brand-400)',
    outline: 'border-brand-500 text-brand-500 hover:(border-brand-400 bg-brand-400/15 text-brand-400)',
    mono: 'hover:(border-brand-400 bg-brand-400/15 text-brand-400)',
    dashed: 'border-brand-500 text-brand-500 hover:(border-brand-400 bg-brand-400/15 text-brand-400)',
    link: 'text-brand-500 hover:text-brand-600'
  },
  red: {
    solid: 'border-red-500 bg-red-500 text-red-50 hover:(border-red-400 bg-red-400)',
    outline: 'border-red-500 text-red-500 hover:(border-red-400 bg-red-400/15 text-red-400)',
    mono: 'hover:(border-red-400 bg-red-400/15 text-red-400)',
    dashed: 'border-red-500 text-red-500 hover:(border-red-400 bg-red-400/15 text-red-400)',
    link: 'text-red-500 hover:text-red-600'
  },
  gray: {
    solid: 'border-gray-500 bg-gray-500 text-gray-50 hover:(border-gray-400 bg-gray-400)',
    outline: 'border-gray-400 text-gray-500 hover:(border-gray-400 bg-gray-400/15 text-gray-400)',
    mono: 'hover:(border-gray-400 bg-gray-400/15 text-gray-400)',
    dashed: 'border-gray-400 text-gray-500 hover:(border-gray-400 bg-gray-400/15 text-gray-400)',
    link: 'text-gray-500 hover:text-gray-600'
  },
  green: {
    solid: 'border-green-500 bg-green-500 text-green-50 hover:(border-green-400 bg-green-400)',
    outline: 'border-green-500 text-green-500 hover:(border-green-400 bg-green-400/15 text-green-400)',
    mono: 'hover:(border-green-400 bg-green-400/15 text-green-400)',
    dashed: 'border-green-500 text-green-500 hover:(border-green-400 bg-green-400/15 text-green-400)',
    link: 'text-green-500 hover:text-green-600'
  },
  yellow: {
    solid: 'border-amber-500 bg-amber-500 text-amber-50 hover:(border-amber-400 bg-amber-400)',
    outline: 'border-amber-500 text-amber-500 hover:(border-amber-400 bg-amber-400/15 text-amber-400)',
    mono: 'hover:(border-amber-400 bg-amber-400/15 text-amber-400)',
    dashed: 'border-amber-500 text-amber-500 hover:(border-amber-400 bg-amber-400/15 text-amber-400)',
    link: 'text-amber-500 hover:text-amber-600'
  },
  orange: {
    solid: 'border-orange-500 bg-orange-500 text-orange-50 hover:(border-orange-400 bg-orange-400)',
    outline: 'border-orange-500 text-orange-500 hover:(border-orange-400 bg-orange-400/15 text-orange-400)',
    mono: 'hover:(border-orange-400 bg-orange-400/15 text-orange-400)',
    dashed: 'border-orange-500 text-orange-500 hover:(border-orange-400 bg-orange-400/15 text-orange-400)',
    link: 'text-orange-500 hover:text-orange-600'
  }
} as const

const buttonVariantColorStyleKeys: Record<ButtonVariant, ButtonColorStyleKey> = {
  default: 'solid',
  outline: 'outline',
  dashed: 'dashed',
  link: 'link',
  mono: 'mono'
}

const buttonCompoundVariants = buttonColorOptions.flatMap((color) =>
  buttonVariantOptions.map((variant) => ({
    color,
    variant,
    class: `${buttonColorClasses[color][buttonVariantColorStyleKeys[variant]]} ${variant === 'link' ? '' : `${buttonRippleClasses} ${buttonActiveClasses[color]}`}`
  }))
)

/** button 定义管理端 Button 组件的样式变体组合。 */
export const button = cva('relative flex shrink-0 items-center justify-center whitespace-nowrap font-normal transition-all duration-150', {
  variants: {
    color: emptyVariantRecord(buttonColorOptions),
    variant: {
      default: 'border',
      outline: 'border bg-transparent',
      dashed: 'border border-dashed bg-transparent',
      link: 'bg-transparent hover:bg-transparent hover:underline underline-offset-4 underline-dashed px-2!',
      mono: 'border border-control bg-primary text-zinc-500 dark:text-zinc-400'
    },
    size: {
      sm: `[&_svg]:size-4 px-4 gap-1 ${controlSizeClasses.sm}`,
      md: `[&_svg]:size-5 px-6 gap-1.5 ${controlSizeClasses.md}`,
      lg: `[&_svg]:size-6 px-8 gap-2 ${controlSizeClasses.lg}`,
      icon: '[&_svg]:size-4 px-1.5 py-1.5',
      'icon-md': '[&_svg]:size-5 px-2 py-2',
      'icon-lg': '[&_svg]:size-6 px-2.5 py-2.5'
    },
    radius: {
      none: 'rounded-none after:rounded-none',
      sm: 'rounded-sm after:rounded-sm',
      md: 'rounded-md after:rounded-md',
      lg: 'rounded-lg after:rounded-lg',
      full: 'rounded-full after:rounded-full'
    },
    disabled: {
      true: 'opacity-50 cursor-not-allowed pointer-events-none'
    }
  },
  compoundVariants: buttonCompoundVariants,
  defaultVariants: {
    color: 'brand',
    variant: 'default',
    size: 'sm',
    radius: 'md'
  }
})

/** ButtonProps 是 button 变体推导出的组件属性类型。 */
export type ButtonProps = VariantProps<typeof button>
