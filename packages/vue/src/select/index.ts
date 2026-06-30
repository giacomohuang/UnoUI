import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

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
      sm: 'min-h-[calc(1.75rem+2px)] rounded-md text-sm/5',
      md: 'min-h-[calc(2rem+2px)] rounded-md text-base/4',
      lg: 'min-h-[calc(2.25rem+2px)] rounded-md text-lg/5'
    },
    focused: {
      true: 'border-brand ring-2 ring-brand/15',
      false: 'border-medium hover:border-brand/40'
    },
    disabled: {
      true: 'cursor-not-allowed bg-tertiary/20 text-tertiary opacity-70 hover:border-medium',
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
      sm: 'px-2 py-1',
      md: 'px-3 py-1.5',
      lg: 'px-4 py-2'
    },
    multiple: {
      true: 'flex flex-wrap gap-1',
      false: 'flex overflow-hidden'
    }
  },
  defaultVariants: {
    size: 'md',
    multiple: false
  }
})

/** selectOption 定义 Select 下拉选项样式。 */
export const selectOption = cva('flex min-h-9 cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-secondary', {
  variants: {
    selected: {
      true: 'bg-brand/10 text-brand',
      false: 'text-primary'
    },
    disabled: {
      true: 'pointer-events-none text-tertiary opacity-50',
      false: ''
    }
  },
  defaultVariants: {
    selected: false,
    disabled: false
  }
})

/** SelectProps 是 selectWrapper 变体推导出的组件属性类型。 */
export type SelectProps = VariantProps<typeof selectWrapper>
