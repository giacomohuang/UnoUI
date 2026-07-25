import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { controlSizeClasses } from '../control'

export { default as Select } from './Select.vue'

/** SelectValue 是 Select 单项值类型，默认覆盖表单控件常用标量。 */
export type SelectValue = string | number | boolean
/** SelectModelValue 是 Select 的 v-model 类型，多选时使用数组。 */
export type SelectModelValue = SelectValue | SelectValue[]

/** SelectOption 是 options 数据源的默认结构。 */
export interface SelectOption {
  label: string
  value: SelectValue
  disabled?: boolean
  [key: string]: unknown
}

/** selectWrapper 定义 Select 触发器容器的样式变体组合。 */
export const selectWrapper = cva('group/ui-select relative inline-flex w-full min-w-0 items-center overflow-hidden border bg-primary text-primary transition-colors duration-150', {
  variants: {
    size: {
      sm: 'rounded-md text-sm/5',
      md: 'rounded-md text-base/4',
      lg: 'rounded-md text-lg/5'
    },
    focused: {
      true: 'border-brand ring-2 ring-brand/15',
      false: 'border-control hover:border-brand/40'
    },
    disabled: {
      true: 'cursor-not-allowed bg-tertiary/20 text-tertiary opacity-70 hover:border-control',
      false: 'cursor-pointer'
    },
    multiple: {
      true: 'h-auto',
      false: ''
    }
  },
  defaultVariants: {
    size: 'md',
    focused: false,
    disabled: false,
    multiple: false
  }
})

/** selectInner 定义 Select 内部文本和标签容器排版。 */
export const selectInner = cva('min-w-0 flex-1 items-center text-inherit', {
  variants: {
    size: {
      sm: 'px-2 text-sm/5',
      md: 'px-3 text-base/4',
      lg: 'px-4 text-lg/5'
    },
    multiple: {
      true: 'flex flex-wrap gap-1',
      false: 'flex overflow-hidden'
    }
  },
  defaultVariants: {
    size: 'md',
    multiple: false
  },
  compoundVariants: [
    { size: 'sm', multiple: false, class: controlSizeClasses.sm },
    { size: 'md', multiple: false, class: controlSizeClasses.md },
    { size: 'lg', multiple: false, class: controlSizeClasses.lg },
    { size: 'sm', multiple: true, class: 'py-1' },
    { size: 'md', multiple: true, class: 'py-1.5' },
    { size: 'lg', multiple: true, class: 'py-2' }
  ]
})

/** selectOption 定义 Select 下拉选项样式。 */
export const selectOption = cva('flex min-h-9 cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors', {
  variants: {
    selected: {
      true: 'text-brand',
      false: 'text-primary'
    },
    active: {
      true: '',
      false: ''
    },
    disabled: {
      true: 'pointer-events-none text-tertiary opacity-50',
      false: ''
    }
  },
  compoundVariants: [
    {
      selected: true,
      active: false,
      class: 'bg-brand/10 hover:bg-brand/15'
    },
    {
      selected: true,
      active: true,
      class: 'bg-brand/20 hover:bg-brand/20'
    },
    {
      selected: false,
      active: false,
      class: 'hover:bg-secondary/70'
    },
    {
      selected: false,
      active: true,
      class: 'bg-brand/10'
    }
  ],
  defaultVariants: {
    selected: false,
    active: false,
    disabled: false
  }
})

/** SelectProps 是 selectWrapper 变体推导出的组件属性类型。 */
export type SelectProps = VariantProps<typeof selectWrapper>
