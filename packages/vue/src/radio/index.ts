import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import type { InjectionKey, Ref } from 'vue'

export { default as Radio } from './Radio.vue'
export { default as RadioGroup } from './RadioGroup.vue'

export type RadioValue = string | number | boolean
export type RadioSize = 'sm' | 'md' | 'lg'
export type RadioType = 'radio' | 'button'
export type RadioButtonStyle = 'outline' | 'solid'
export type RadioGroupDirection = 'horizontal' | 'vertical'

export interface RadioGroupContext {
  modelValue: Readonly<Ref<RadioValue | undefined>>
  disabled: Readonly<Ref<boolean>>
  size: Readonly<Ref<RadioSize>>
  type: Readonly<Ref<RadioType>>
  buttonStyle: Readonly<Ref<RadioButtonStyle>>
  name: Readonly<Ref<string | undefined>>
  updateValue: (value: RadioValue, event: Event) => void
}

export const radioGroupContextKey: InjectionKey<RadioGroupContext> = Symbol('ui-radio-group-context')

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

/** radioButton 定义 Radio 按钮形态的外层标签样式。 */
export const radioButton = cva('ui-radio-button relative z-0 inline-flex w-fit shrink-0 items-center justify-center whitespace-nowrap rounded-md border font-medium align-middle outline-none transition-[background-color,color] duration-150 focus-within:(ring-2 ring-brand-400/30 ring-offset-1 ring-offset-primary)', {
  variants: {
    size: {
      sm: 'min-h-8 px-3 text-sm/5',
      md: 'min-h-9 px-4 text-sm/5',
      lg: 'min-h-10 px-5 text-base/6'
    },
    buttonStyle: {
      outline: '',
      solid: ''
    },
    checked: {
      true: '',
      false: ''
    },
    disabled: {
      true: 'cursor-not-allowed opacity-60',
      false: 'cursor-pointer'
    }
  },
  compoundVariants: [
    {
      buttonStyle: 'outline',
      checked: true,
      disabled: false,
      class: 'border-brand-500 bg-primary text-brand-500 dark:border-brand-400 dark:text-brand-400'
    },
    {
      buttonStyle: 'outline',
      checked: false,
      disabled: false,
      class: 'border-medium bg-primary text-secondary hover:(border-brand-400 text-brand-500) dark:border-zinc-600 dark:hover:border-brand-400'
    },
    {
      buttonStyle: 'outline',
      checked: true,
      disabled: true,
      class: 'border-zinc-300 bg-primary text-tertiary dark:border-zinc-600'
    },
    {
      buttonStyle: 'outline',
      checked: false,
      disabled: true,
      class: 'border-zinc-300 bg-secondary text-tertiary dark:border-zinc-700'
    },
    {
      buttonStyle: 'solid',
      checked: true,
      disabled: false,
      class: 'border-brand-500 bg-brand-500 text-brand-50 dark:border-brand-400 dark:bg-brand-500'
    },
    {
      buttonStyle: 'solid',
      checked: false,
      disabled: false,
      class: 'border-medium bg-primary text-secondary hover:(border-brand-400 text-brand-500) dark:border-zinc-600 dark:hover:border-brand-400'
    },
    {
      buttonStyle: 'solid',
      checked: true,
      disabled: true,
      class: 'border-zinc-400 bg-zinc-400 text-white dark:border-zinc-600 dark:bg-zinc-700'
    },
    {
      buttonStyle: 'solid',
      checked: false,
      disabled: true,
      class: 'border-zinc-300 bg-secondary text-tertiary dark:border-zinc-700'
    }
  ],
  defaultVariants: {
    size: 'md',
    buttonStyle: 'outline',
    checked: false,
    disabled: false
  }
})

/** radioGroup 定义 RadioGroup 根节点布局；button 模式不加 gap，由组内样式合并相邻边框。 */
export const radioGroup = cva('ui-radio-group inline-flex w-fit align-middle', {
  variants: {
    type: {
      radio: '',
      button: 'ui-radio-group--button isolate'
    },
    direction: {
      horizontal: 'flex-row items-center',
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
    { type: 'radio', direction: 'horizontal', size: 'sm', class: 'flex-wrap gap-x-4 gap-y-2' },
    { type: 'radio', direction: 'horizontal', size: 'md', class: 'flex-wrap gap-x-5 gap-y-2' },
    { type: 'radio', direction: 'horizontal', size: 'lg', class: 'flex-wrap gap-x-6 gap-y-2.5' },
    { type: 'radio', direction: 'vertical', size: 'sm', class: 'gap-1.5' },
    { type: 'radio', direction: 'vertical', size: 'md', class: 'gap-2' },
    { type: 'radio', direction: 'vertical', size: 'lg', class: 'gap-2.5' },
    { type: 'button', direction: 'vertical', class: 'items-stretch' }
  ],
  defaultVariants: {
    type: 'radio',
    direction: 'horizontal',
    size: 'md',
    disabled: false
  }
})

/** RadioProps 是 radio 变体推导出的组件属性类型。 */
export type RadioProps = VariantProps<typeof radio>
export type RadioButtonProps = VariantProps<typeof radioButton>
export type RadioGroupProps = VariantProps<typeof radioGroup>
