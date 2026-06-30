import { cva } from 'class-variance-authority'
import type { Dayjs } from 'dayjs'
import type { VariantProps } from 'class-variance-authority'

export { default as DatePicker } from './DatePicker.vue'
export { default as RangePicker } from './RangePicker.vue'

export type DatePickerModelValue = string | number | Date | Dayjs | null | undefined
export type DatePickerPicker = 'date' | 'month' | 'year'
export type RangePickerModelValue = [DatePickerModelValue, DatePickerModelValue] | null | undefined

/** DatePickerDisabledDate 用于禁用不可选日期。 */
export type DatePickerDisabledDate = (date: Dayjs) => boolean

/** DatePickerShowTimeOptions 定义时间选择面板的格式和步长。 */
export interface DatePickerShowTimeOptions {
  format?: string
  hourStep?: number
  minuteStep?: number
  secondStep?: number
  showSecond?: boolean
}

const datePickerHeightClasses = {
  sm: 'h-[calc(1.75rem+2px)] text-sm/5',
  md: 'h-[calc(2rem+2px)] text-base/4',
  lg: 'h-[calc(2.25rem+2px)] text-lg/5'
} as const

/** datePickerWrapper 定义 DatePicker 触发器的输入框样式。 */
export const datePickerWrapper = cva('group/ui-datepicker relative flex w-full min-w-0 items-center overflow-hidden border bg-primary text-primary transition-colors duration-150', {
  variants: {
    size: {
      sm: `${datePickerHeightClasses.sm} rounded-md`,
      md: `${datePickerHeightClasses.md} rounded-md`,
      lg: `${datePickerHeightClasses.lg} rounded-md`
    },
    focused: {
      true: 'border-brand ring-2 ring-brand/15',
      false: 'border-medium hover:border-brand/40'
    },
    disabled: {
      true: 'cursor-not-allowed bg-tertiary/20 text-tertiary opacity-70 hover:border-medium',
      false: 'cursor-pointer'
    }
  },
  defaultVariants: {
    size: 'md',
    focused: false,
    disabled: false
  }
})

/** datePickerValue 定义触发器内部文本的尺寸与留白。 */
export const datePickerValue = cva('min-w-0 flex-1 truncate py-0', {
  variants: {
    size: {
      sm: 'px-2 text-sm/5',
      md: 'px-3 text-base/4',
      lg: 'px-4 text-lg/5'
    }
  },
  defaultVariants: {
    size: 'md'
  }
})

/** datePickerCell 定义日历日期单元格的状态样式。 */
export const datePickerCell = cva('relative flex h-8 min-w-0 items-center justify-center rounded-md border border-transparent text-sm outline-none transition-colors duration-150', {
  variants: {
    inMonth: {
      true: 'text-primary',
      false: 'text-tertiary/50'
    },
    selected: {
      true: 'border-brand-500 bg-brand-500 text-brand-50 hover:bg-brand-500',
      false: 'hover:border-brand-400 hover:bg-brand-500/10 hover:text-brand-500'
    },
    today: {
      true: '',
      false: ''
    },
    disabled: {
      true: 'pointer-events-none cursor-not-allowed opacity-35',
      false: 'cursor-pointer'
    }
  },
  compoundVariants: [
    { today: true, selected: false, disabled: false, class: 'border-brand-400/70 text-brand-500' },
    { today: true, selected: false, disabled: true, class: 'border-brand-400/30' }
  ],
  defaultVariants: {
    inMonth: true,
    selected: false,
    today: false,
    disabled: false
  }
})

/** datePickerPanelCell 定义年、月面板单元格的状态样式。 */
export const datePickerPanelCell = cva('relative flex h-10 min-w-0 items-center justify-center rounded-md border border-transparent px-2 text-sm outline-none transition-colors duration-150', {
  variants: {
    selected: {
      true: 'border-brand-500 bg-brand-500 text-brand-50 hover:bg-brand-500',
      false: 'text-primary hover:border-brand-400 hover:bg-brand-500/10 hover:text-brand-500'
    },
    current: {
      true: '',
      false: ''
    },
    disabled: {
      true: 'pointer-events-none cursor-not-allowed opacity-35',
      false: 'cursor-pointer'
    },
    muted: {
      true: 'text-tertiary/50',
      false: ''
    }
  },
  compoundVariants: [
    { current: true, selected: false, disabled: false, class: 'border-brand-400/70 text-brand-500' },
    { current: true, selected: false, disabled: true, class: 'border-brand-400/30' }
  ],
  defaultVariants: {
    selected: false,
    current: false,
    disabled: false,
    muted: false
  }
})

/** datePickerRangeCell 定义范围选择器日期单元格的状态样式。 */
export const datePickerRangeCell = cva('relative flex h-8 min-w-0 items-center justify-center rounded-md border border-transparent text-sm outline-none transition-colors duration-150', {
  variants: {
    inMonth: {
      true: 'text-primary',
      false: 'text-tertiary/50'
    },
    selected: {
      true: 'bg-brand-500 text-brand-50 hover:bg-brand-500',
      false: 'hover:bg-brand-500/10 hover:text-brand-500'
    },
    inRange: {
      true: 'rounded-none bg-brand-500/10 text-brand-500',
      false: ''
    },
    rangeStart: {
      true: 'rounded-l-md rounded-r-none border-brand-500',
      false: ''
    },
    rangeEnd: {
      true: 'rounded-l-none rounded-r-md border-brand-500',
      false: ''
    },
    standalone: {
      true: 'rounded-md',
      false: ''
    },
    today: {
      true: '',
      false: ''
    },
    disabled: {
      true: 'pointer-events-none cursor-not-allowed opacity-35',
      false: 'cursor-pointer'
    }
  },
  compoundVariants: [
    { today: true, selected: false, inRange: false, disabled: false, class: 'border-brand-400/70 text-brand-500' },
    { today: true, selected: false, disabled: true, class: 'border-brand-400/30' }
  ],
  defaultVariants: {
    inMonth: true,
    selected: false,
    inRange: false,
    rangeStart: false,
    rangeEnd: false,
    standalone: true,
    today: false,
    disabled: false
  }
})

/** datePickerTimeOption 定义时间列选项的状态样式。 */
export const datePickerTimeOption = cva('flex h-7 w-full items-center justify-center rounded text-xs font-mono transition-colors duration-150', {
  variants: {
    selected: {
      true: 'bg-brand-500 text-brand-50',
      false: 'text-secondary hover:bg-brand-500/10 hover:text-brand-500'
    },
    disabled: {
      true: 'pointer-events-none cursor-not-allowed opacity-35',
      false: 'cursor-pointer'
    }
  },
  defaultVariants: {
    selected: false,
    disabled: false
  }
})

/** DatePickerProps 是 datePickerWrapper 变体推导出的组件属性类型。 */
export type DatePickerProps = VariantProps<typeof datePickerWrapper>
