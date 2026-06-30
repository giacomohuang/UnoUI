import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

export { default as Slider } from './Slider.vue'

export type SliderValue = number | number[]
export type SliderTooltipPlacement = 'top' | 'bottom' | 'left' | 'right'
export type SliderTooltipFormatter = (value: number) => string | number | null

export interface SliderMark {
  label?: string | number
  style?: Record<string, string | number>
}

export type SliderMarks = Record<number | string, string | number | SliderMark>

export interface SliderTooltipOptions {
  open?: boolean
  placement?: SliderTooltipPlacement
  formatter?: SliderTooltipFormatter | null
}

export interface SliderRangeOptions {
  draggableTrack?: boolean
  editable?: boolean
  minCount?: number
  maxCount?: number
}

export type SliderRangeProp = boolean | SliderRangeOptions

/** sliderRoot 定义管理端 Slider 根节点的尺寸和方向。 */
export const sliderRoot = cva('group/ui-slider relative inline-flex touch-none select-none outline-none', {
  variants: {
    size: {
      sm: '',
      md: '',
      lg: ''
    },
    vertical: {
      true: 'h-40 min-h-24 w-8 flex-col justify-center py-2',
      false: 'h-8 min-w-30 w-full items-center px-2'
    },
    disabled: {
      true: 'cursor-not-allowed opacity-60',
      false: 'cursor-pointer'
    }
  },
  defaultVariants: {
    size: 'md',
    vertical: false,
    disabled: false
  }
})

/** sliderRail 定义 Slider 背景轨道。 */
export const sliderRail = cva('absolute z-0 block rounded-full bg-zinc-200 transition-colors duration-150 dark:bg-zinc-700', {
  variants: {
    size: {
      sm: '',
      md: '',
      lg: ''
    },
    vertical: {
      true: '',
      false: ''
    },
    disabled: {
      true: '',
      false: 'group-hover/ui-slider:bg-zinc-300 dark:group-hover/ui-slider:bg-zinc-600'
    }
  },
  defaultVariants: {
    size: 'md',
    vertical: false,
    disabled: false
  }
})

/** sliderTrack 定义 Slider 已选范围轨道。 */
export const sliderTrack = cva('absolute z-1 block rounded-full transition-colors duration-150', {
  variants: {
    size: {
      sm: '',
      md: '',
      lg: ''
    },
    vertical: {
      true: '',
      false: ''
    },
    disabled: {
      true: 'bg-zinc-400 dark:bg-zinc-600',
      false: 'bg-[var(--ui-slider-color)] group-hover/ui-slider:bg-[var(--ui-slider-color-hover)]'
    },
    draggable: {
      true: '',
      false: ''
    }
  },
  compoundVariants: [
    { draggable: true, disabled: false, class: 'cursor-grab active:cursor-grabbing' },
    { draggable: true, disabled: true, class: 'cursor-not-allowed' }
  ],
  defaultVariants: {
    size: 'md',
    vertical: false,
    disabled: false,
    draggable: false
  }
})

/** sliderHandle 定义 Slider 拖拽节点视觉和焦点态。 */
export const sliderHandle = cva('relative rounded-full border-2 bg-primary shadow-sm outline-none transition-[border-color,box-shadow,transform] duration-150', {
  variants: {
    size: {
      sm: 'size-3',
      md: 'size-4',
      lg: 'size-5'
    },
    active: {
      true: 'scale-110 ring-4 ring-[var(--ui-slider-color-soft)]',
      false: 'hover:scale-105 hover:ring-4 hover:ring-[var(--ui-slider-color-soft)] focus-visible:scale-110 focus-visible:ring-4 focus-visible:ring-[var(--ui-slider-color-soft)]'
    },
    disabled: {
      true: 'border-zinc-400 bg-zinc-100 shadow-none dark:border-zinc-600 dark:bg-zinc-800',
      false: ''
    }
  },
  compoundVariants: [
    { active: true, disabled: false, class: 'border-[var(--ui-slider-color)]' },
    { active: false, disabled: false, class: 'border-[var(--ui-slider-color)] hover:border-[var(--ui-slider-color-hover)]' }
  ],
  defaultVariants: {
    size: 'md',
    active: false,
    disabled: false
  }
})

/** sliderDot 定义 marks/dots 模式下的轨道节点。 */
export const sliderDot = cva('absolute z-10 rounded-full border bg-primary transition-colors duration-150', {
  variants: {
    size: {
      sm: 'size-1.5',
      md: 'size-2',
      lg: 'size-2.5'
    },
    active: {
      true: 'border-[var(--ui-slider-color)]',
      false: 'border-zinc-300 dark:border-zinc-600'
    },
    disabled: {
      true: 'opacity-70',
      false: ''
    }
  },
  defaultVariants: {
    size: 'md',
    active: false,
    disabled: false
  }
})

/** sliderMarkLabel 定义刻度标签的文字样式。 */
export const sliderMarkLabel = cva('absolute z-10 max-w-24 -translate-x-1/2 whitespace-nowrap text-center text-xs text-tertiary transition-colors duration-150', {
  variants: {
    active: {
      true: 'font-medium text-[var(--ui-slider-color)]',
      false: ''
    },
    disabled: {
      true: 'opacity-70',
      false: ''
    },
    vertical: {
      true: 'translate-x-0 text-left',
      false: ''
    }
  },
  defaultVariants: {
    active: false,
    disabled: false,
    vertical: false
  }
})

export type SliderProps = VariantProps<typeof sliderRoot>
export type SliderSize = NonNullable<SliderProps['size']>
