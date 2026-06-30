import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

export { default as Radio } from './Radio.vue'

/** radio 定义管理端 Radio 组件圆点本体的样式变体组合。 */
export const radio = cva('relative inline-flex shrink-0 items-center justify-center rounded-full border align-middle transition-colors duration-150', {
  variants: {
    size: {
      sm: 'size-4',
      md: 'size-5',
      lg: 'size-6'
    },
    checked: {
      true: '',
      false: ''
    },
    disabled: {
      true: 'cursor-not-allowed',
      false: 'cursor-pointer'
    }
  },
  compoundVariants: [
    {
      checked: true,
      disabled: false,
      class: 'border-brand-500 bg-brand-500 dark:border-brand-400 dark:bg-brand-500'
    },
    {
      checked: true,
      disabled: true,
      class: 'border-zinc-400 bg-zinc-400 dark:border-zinc-600 dark:bg-zinc-700'
    },
    {
      checked: false,
      disabled: false,
      class: 'border-medium bg-primary hover:border-brand-400 dark:border-zinc-500 dark:bg-zinc-950 dark:hover:border-brand-400'
    },
    {
      checked: false,
      disabled: true,
      class: 'border-zinc-300 bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800'
    }
  ],
  defaultVariants: {
    size: 'md',
    checked: false,
    disabled: false
  }
})

/** radioDot 定义管理端 Radio 组件内部选中圆点的样式变体组合。 */
export const radioDot = cva('rounded-full bg-white transition-transform duration-150', {
  variants: {
    size: {
      sm: 'size-1.5',
      md: 'size-1.5',
      lg: 'size-2'
    },
    disabled: {
      true: 'bg-white/90 dark:bg-zinc-200',
      false: ''
    }
  },
  defaultVariants: {
    size: 'md',
    disabled: false
  }
})

/** radioLabel 定义 Radio 外层标签布局和 border 模式。 */
export const radioLabel = cva('inline-flex w-fit items-center align-middle transition-colors duration-150', {
  variants: {
    size: {
      sm: 'gap-1.5 text-sm/5',
      md: 'gap-2 text-sm/5',
      lg: 'gap-2.5 text-base/6'
    },
    border: {
      true: 'rounded-md border border-medium bg-primary hover:border-brand-400',
      false: ''
    },
    checked: {
      true: '',
      false: ''
    },
    disabled: {
      true: 'cursor-not-allowed text-tertiary opacity-70',
      false: 'cursor-pointer text-secondary'
    }
  },
  compoundVariants: [
    { size: 'sm', border: true, class: 'min-h-8 px-2' },
    { size: 'md', border: true, class: 'min-h-9 px-3' },
    { size: 'lg', border: true, class: 'min-h-10 px-3.5' },
    { border: true, checked: true, disabled: false, class: 'border-brand-500 text-brand-500 dark:border-brand-400 dark:text-brand-400' },
    { border: true, checked: false, disabled: true, class: 'hover:border-medium' },
    { border: true, checked: true, disabled: true, class: 'border-zinc-300 dark:border-zinc-600' }
  ],
  defaultVariants: {
    size: 'md',
    border: false,
    checked: false,
    disabled: false
  }
})

/** RadioProps 是 radio 变体推导出的组件属性类型。 */
export type RadioProps = VariantProps<typeof radio>
