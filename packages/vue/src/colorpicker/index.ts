import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

export { default as ColorPicker } from './ColorPicker.vue'
export type { ColorPickerGradientStop, ColorPickerMode, ColorPickerRgbaColor, ColorPickerValue } from './color'

/** colorPickerTrigger 定义管理端 ColorPicker 触发按钮样式。 */
export const colorPickerTrigger = cva('group/ui-colorpicker inline-flex shrink-0 items-center justify-center overflow-hidden border bg-primary align-middle transition-colors duration-150', {
  variants: {
    size: {
      sm: 'rounded-md p-1',
      md: 'rounded-md p-1',
      lg: 'rounded-md p-1.5'
    },
    focused: {
      true: 'border-brand ring-2 ring-brand/15',
      false: 'border-control hover:border-brand/40'
    },
    disabled: {
      true: 'cursor-not-allowed bg-primary hover:border-control',
      false: 'cursor-pointer'
    }
  },
  defaultVariants: {
    size: 'md',
    focused: false,
    disabled: false
  }
})

/** colorPickerSwatch 通过内容尺寸和 trigger padding 自然形成标准控件高度。 */
export const colorPickerSwatch = cva('ui-colorpicker-checker block shrink-0 overflow-hidden rounded-[inherit]', {
  variants: {
    size: {
      sm: 'size-5',
      md: 'size-6',
      lg: 'size-6'
    }
  },
  defaultVariants: {
    size: 'md'
  }
})

/** ColorPickerProps 是 colorPickerTrigger 变体推导出的组件属性类型。 */
export type ColorPickerProps = VariantProps<typeof colorPickerTrigger>
export type ColorPickerSize = NonNullable<ColorPickerProps['size']>
