import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

export { default as Switch } from './Switch.vue'

/** switchWrapper 定义管理端 Switch 外层文字和轨道的排版。 */
export const switchWrapper = cva('inline-flex w-fit items-center align-middle transition-colors duration-150', {
  variants: {
    size: {
      sm: 'gap-1.5 text-xs/5',
      md: 'gap-2 text-sm/5',
      lg: 'gap-2.5 text-base/6'
    },
    disabled: {
      true: 'cursor-not-allowed opacity-70',
      false: 'cursor-pointer'
    }
  },
  defaultVariants: {
    size: 'md',
    disabled: false
  }
})

/** switchTrack 定义管理端 Switch 开关轨道的样式变体。 */
export const switchTrack = cva('relative inline-flex shrink-0 items-center overflow-hidden rounded-full border align-middle transition-colors duration-200', {
  variants: {
    size: {
      sm: 'h-4 min-w-8',
      md: 'h-5 min-w-10',
      lg: 'h-6 min-w-12'
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
      class: 'border-brand-500 bg-brand-500 hover:(border-brand-400 bg-brand-400) dark:border-brand-400 dark:bg-brand-500'
    },
    {
      checked: true,
      disabled: true,
      class: 'border-zinc-400 bg-zinc-400 dark:border-zinc-600 dark:bg-zinc-700'
    },
    {
      checked: false,
      disabled: false,
      class: 'border-zinc-300 bg-zinc-300 hover:(border-zinc-400 bg-zinc-400) dark:border-zinc-600 dark:bg-zinc-700 dark:hover:(border-zinc-500 bg-zinc-600)'
    },
    {
      checked: false,
      disabled: true,
      class: 'border-zinc-300 bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800'
    }
  ],
  defaultVariants: {
    size: 'md',
    checked: false,
    disabled: false
  }
})

/** switchAction 定义 Switch 内部圆点的位置、尺寸和图标承载样式。 */
export const switchAction = cva('absolute top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full bg-white text-zinc-500 shadow-[0_1px_3px_0_rgba(15,23,42,0.25)] transition-all duration-200', {
  variants: {
    size: {
      sm: 'size-3 text-[9px]',
      md: 'size-4 text-[10px]',
      lg: 'size-5 text-xs'
    },
    checked: {
      true: 'left-[calc(100%_-_0.125rem)] -translate-x-full',
      false: 'left-0.5'
    },
    disabled: {
      true: 'bg-zinc-100 text-zinc-400 dark:bg-zinc-300',
      false: ''
    }
  },
  defaultVariants: {
    size: 'md',
    checked: false,
    disabled: false
  }
})

/** switchPrompt 定义 inline-prompt 模式下轨道内文案或图标的位置。 */
export const switchPrompt = cva('pointer-events-none absolute inset-y-0 z-0 flex min-w-0 items-center overflow-hidden px-1 font-medium text-white transition-colors duration-200', {
  variants: {
    size: {
      sm: 'text-[9px]',
      md: 'text-[10px]',
      lg: 'text-xs'
    },
    checked: {
      true: 'left-0 right-[42%] justify-start',
      false: 'left-[42%] right-0 justify-end'
    }
  },
  defaultVariants: {
    size: 'md',
    checked: false
  }
})

/** switchLabel 定义 Switch 两侧非内联文案的选中态样式。 */
export const switchLabel = cva('select-none transition-colors duration-150', {
  variants: {
    checked: {
      true: '',
      false: ''
    },
    disabled: {
      true: 'text-tertiary',
      false: ''
    }
  },
  compoundVariants: [
    { checked: true, disabled: false, class: 'text-brand-500 dark:text-brand-400' },
    { checked: false, disabled: false, class: 'text-tertiary' }
  ],
  defaultVariants: {
    checked: false,
    disabled: false
  }
})

/** SwitchProps 是 switchTrack 变体推导出的组件属性类型。 */
export type SwitchProps = VariantProps<typeof switchTrack>
