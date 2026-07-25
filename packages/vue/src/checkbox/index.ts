import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import type { InjectionKey, Ref } from 'vue'

export { default as Checkbox } from './Checkbox.vue'
export { default as CheckboxGroup } from './CheckboxGroup.vue'

export type CheckboxValue = string | number
export type CheckboxSize = 'sm' | 'md' | 'lg'
export type CheckboxGroupDirection = 'horizontal' | 'vertical'

export interface CheckboxGroupContext {
  modelValue: Readonly<Ref<CheckboxValue[]>>
  disabled: Readonly<Ref<boolean>>
  size: Readonly<Ref<CheckboxSize>>
  name: Readonly<Ref<string | undefined>>
  updateValue: (value: CheckboxValue, checked: boolean, event: Event) => void
}

export const checkboxGroupContextKey: InjectionKey<CheckboxGroupContext> = Symbol('ui-checkbox-group-context')

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
      class: 'border-control bg-primary hover:border-brand-400 dark:bg-zinc-950 dark:hover:border-brand-400'
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

/** checkboxGroup 定义 CheckboxGroup 根节点布局。 */
export const checkboxGroup = cva('ui-checkbox-group inline-flex w-fit align-middle', {
  variants: {
    direction: {
      horizontal: 'flex-row flex-wrap items-center',
      vertical: 'flex-col items-start'
    },
    size: {
      sm: '',
      md: '',
      lg: ''
    },
    disabled: {
      true: '',
      false: ''
    }
  },
  compoundVariants: [
    { direction: 'horizontal', size: 'sm', class: 'gap-x-4 gap-y-2' },
    { direction: 'horizontal', size: 'md', class: 'gap-x-5 gap-y-2' },
    { direction: 'horizontal', size: 'lg', class: 'gap-x-6 gap-y-2.5' },
    { direction: 'vertical', size: 'sm', class: 'gap-1.5' },
    { direction: 'vertical', size: 'md', class: 'gap-2' },
    { direction: 'vertical', size: 'lg', class: 'gap-2.5' }
  ],
  defaultVariants: {
    direction: 'horizontal',
    size: 'md',
    disabled: false
  }
})

/** CheckboxProps 是 checkbox 变体推导出的组件属性类型。 */
export type CheckboxProps = VariantProps<typeof checkbox>
export type CheckboxGroupProps = VariantProps<typeof checkboxGroup>
