import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import type { Dayjs } from 'dayjs'

import { controlSizeClasses } from '../control'

export { default as TimePicker } from './TimePicker.vue'
export { default as TimeRangePicker } from './TimeRangePicker.vue'

export type TimePickerModelValue = string | number | Date | Dayjs | null | undefined
export type TimeRangePickerModelValue = [TimePickerModelValue, TimePickerModelValue] | null | undefined
export type TimePickerUnit = 'hour' | 'minute' | 'second'
export type TimeRangePickerSide = 'start' | 'end'
export type TimeRangePickerDayOffset = 0 | 1

/** TimePickerDisabledTimeOptions 定义不可选的小时、分钟和秒。 */
export interface TimePickerDisabledTimeOptions {
  disabledHours?: () => number[]
  disabledMinutes?: (selectedHour: number) => number[]
  disabledSeconds?: (selectedHour: number, selectedMinute: number) => number[]
}

/** TimePickerDisabledTime 用于按当前时间返回不可选时间段。 */
export type TimePickerDisabledTime = (time: Dayjs) => TimePickerDisabledTimeOptions
export type TimeRangePickerDisabledTime = (time: Dayjs, side: TimeRangePickerSide) => TimePickerDisabledTimeOptions

export interface TimeRangePickerChangeInfo {
  endDayOffset: TimeRangePickerDayOffset
  crossesDay: boolean
}

/** timePickerWrapper 定义 TimePicker 触发器的输入框样式。 */
export const timePickerWrapper = cva('group/ui-timepicker relative flex w-full min-w-0 items-center overflow-hidden border bg-primary text-primary transition-colors duration-150', {
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
    }
  },
  defaultVariants: {
    size: 'md',
    focused: false,
    disabled: false
  }
})

/** timePickerValue 定义触发器内部文本的尺寸与留白。 */
export const timePickerValue = cva('min-w-0 flex-1 truncate', {
  variants: {
    size: {
      sm: `px-2 ${controlSizeClasses.sm}`,
      md: `px-3 ${controlSizeClasses.md}`,
      lg: `px-4 ${controlSizeClasses.lg}`
    }
  },
  defaultVariants: {
    size: 'md'
  }
})

/** timePickerOption 定义时间列选项的状态样式。 */
export const timePickerOption = cva('flex h-8 w-full items-center justify-center rounded text-xs font-mono transition-colors duration-150', {
  variants: {
    selected: {
      true: 'bg-brand-500 text-brand-50 hover:bg-brand-500',
      false: 'text-primary hover:bg-secondary'
    },
    disabled: {
      true: 'pointer-events-none text-tertiary opacity-40',
      false: ''
    }
  },
  defaultVariants: {
    selected: false,
    disabled: false
  }
})

/** TimePickerProps 是 timePickerWrapper 变体推导出的组件属性类型。 */
export type TimePickerProps = VariantProps<typeof timePickerWrapper>
