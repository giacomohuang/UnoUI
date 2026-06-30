import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

export { default as ColorPicker } from './ColorPicker.vue'
export type { ColorPickerGradientStop, ColorPickerMode, ColorPickerRgbaColor, ColorPickerValue } from './color'

/** colorPickerTrigger 定义管理端 ColorPicker 触发按钮样式。 */
export const colorPickerTrigger = cva('group/ui-colorpicker inline-flex shrink-0 items-center justify-center overflow-hidden border bg-primary align-middle transition-colors duration-150', {
  variants: {
    size: {
      sm: 'size-[calc(1.75rem+2px)] rounded-md p-1',
      md: 'size-[calc(2rem+2px)] rounded-md p-1',
      lg: 'size-[calc(2.25rem+2px)] rounded-md p-1.5'
    },
    focused: {
      true: 'border-brand ring-2 ring-brand/15',
      false: 'border-medium hover:border-brand/40'
    },
    disabled: {
      true: 'cursor-not-allowed bg-primary hover:border-medium',
      false: 'cursor-pointer'
    }
  },
  defaultVariants: {
    size: 'md',
    focused: false,
    disabled: false
  }
})

/** ColorPickerProps 是 colorPickerTrigger 变体推导出的组件属性类型。 */
export type ColorPickerProps = VariantProps<typeof colorPickerTrigger>
export type ColorPickerSize = NonNullable<ColorPickerProps['size']>
