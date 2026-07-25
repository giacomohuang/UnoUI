import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { controlSizeClasses } from '../control'

export { default as Input } from './Input.vue'
export { default as Autocomplete } from './Autocomplete.vue'
export { default as InputI18n } from './InputI18n.vue'
export { default as InputTag } from './InputTag.vue'

/** AutocompleteSuggestion 是 Input 自动补全建议项的默认结构。 */
export interface AutocompleteSuggestion {
  value: string
  disabled?: boolean
  [key: string]: unknown
}

/** AutocompleteDataSourceCallback 是异步返回自动补全建议项的回调函数。 */
export type AutocompleteDataSourceCallback = (suggestions: AutocompleteSuggestion[]) => void

/** AutocompleteDataSource 是 Input 自动补全建议源，兼容静态数组和回调式远程查询。 */
export type AutocompleteDataSource = AutocompleteSuggestion[] | ((query: string, callback: AutocompleteDataSourceCallback) => void)

/** inputWrapper 定义管理端 Input 组件外层容器的样式变体组合。 */
export const inputWrapper = cva('group/ui-input relative flex w-full min-w-0 items-stretch overflow-hidden border bg-primary text-primary transition-colors duration-150', {
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
      false: ''
    },
    multiline: {
      true: 'h-auto',
      false: ''
    }
  },
  defaultVariants: {
    size: 'md',
    focused: false,
    disabled: false,
    multiline: false
  }
})

/** inputSizer 同时提供单行 Input 的自然高度和原生输入框固有宽度。 */
export const inputSizer = cva('invisible block w-[20ch] overflow-hidden', {
  variants: {
    size: controlSizeClasses
  },
  defaultVariants: {
    size: 'md'
  }
})

/** inputControl 定义原生 input/textarea 的尺寸与排版样式。 */
export const inputControl = cva('min-w-0 flex-1 border-0 bg-transparent text-inherit outline-none placeholder:text-tertiary/60 disabled:cursor-not-allowed disabled:opacity-100', {
  variants: {
    size: {
      sm: 'text-sm/5',
      md: 'text-base/4',
      lg: 'text-lg/5'
    },
    multiline: {
      true: 'min-h-20 resize-y',
      false: 'h-full py-0'
    },
    number: {
      true: 'font-mono [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
      false: ''
    }
  },
  defaultVariants: {
    size: 'md',
    multiline: false,
    number: false
  },
  compoundVariants: [
    { size: 'sm', multiline: false, class: 'px-2' },
    { size: 'md', multiline: false, class: 'px-3' },
    { size: 'lg', multiline: false, class: 'px-4' },
    { size: 'sm', multiline: true, class: 'px-2 py-1' },
    { size: 'md', multiline: true, class: 'px-3 py-2' },
    { size: 'lg', multiline: true, class: 'px-4 py-2' }
  ]
})

/** inputGroup 定义 Input 与复合前后置内容的外层排版。 */
export const inputGroup = cva('inline-flex w-full min-w-0 self-start items-stretch align-middle', {
  variants: {
    size: {
      sm: '',
      md: '',
      lg: ''
    },
    multiline: {
      true: 'h-auto',
      false: ''
    }
  },
  defaultVariants: {
    size: 'md',
    multiline: false
  }
})

/** inputAddon 定义 Input 复合前后置内容容器的样式。 */
export const inputAddon = cva('flex shrink-0 items-center border border-control bg-tertiary/50 px-3 text-tertiary', {
  variants: {
    position: {
      prepend: 'rounded-l-md border-r-0',
      append: 'rounded-r-md border-l-0'
    },
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base'
    },
    disabled: {
      true: 'cursor-not-allowed opacity-70',
      false: ''
    }
  },
  defaultVariants: {
    size: 'md',
    disabled: false
  }
})

/** InputProps 是 inputWrapper 变体推导出的组件属性类型。 */
export type InputProps = VariantProps<typeof inputWrapper>
