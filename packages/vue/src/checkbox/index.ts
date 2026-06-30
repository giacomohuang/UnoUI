import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

export { default as Checkbox } from './Checkbox.vue'

/** checkbox 定义管理端 Checkbox 组件的样式变体组合。 */
export const checkbox = cva('relative inline-flex shrink-0 items-center justify-center overflow-hidden border align-middle transition-colors duration-150', {
  variants: {
    size: {
      sm: 'size-4 rounded-sm',
      md: 'size-5 rounded',
      lg: 'size-6 rounded'
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
      class: 'border-zinc-400 bg-zinc-400 dark:border-zinc-600 dark:bg-zinc-800'
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

/** CheckboxProps 是 checkbox 变体推导出的组件属性类型。 */
export type CheckboxProps = VariantProps<typeof checkbox>
