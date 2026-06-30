import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

export { default as InputOtp } from './InputOtp.vue'

/** inputOtpRoot 定义验证码输入组件的外层布局。 */
export const inputOtpRoot = cva('relative inline-flex w-fit items-center align-middle', {
  variants: {
    disabled: {
      true: 'cursor-not-allowed',
      false: ''
    }
  },
  defaultVariants: {
    disabled: false
  }
})

/** inputOtpGroup 定义验证码输入格之间的间距。 */
export const inputOtpGroup = cva('flex items-center', {
  variants: {
    gap: {
      sm: 'gap-2',
      md: 'gap-2.5',
      lg: 'gap-3'
    }
  },
  defaultVariants: {
    gap: 'md'
  }
})

/** inputOtpCell 定义单个验证码输入格的状态与尺寸。 */
export const inputOtpCell = cva('border bg-primary text-center font-semibold text-primary caret-transparent outline-none transition-all duration-150 placeholder:text-tertiary/60', {
  variants: {
    size: {
      sm: 'size-10 rounded-md text-xl/none',
      md: 'size-[50px] rounded-lg text-[2rem]/none',
      lg: 'size-14 rounded-lg text-[2.25rem]/none'
    },
    focused: {
      true: 'border-brand-500 ring-2 ring-brand/15',
      false: 'border-medium hover:border-brand/40'
    },
    invalid: {
      true: 'border-red-400 ring-2 ring-red-500/15',
      false: ''
    },
    disabled: {
      true: 'cursor-not-allowed bg-tertiary/20 text-tertiary opacity-70 hover:border-medium',
      false: ''
    }
  },
  defaultVariants: {
    size: 'md',
    focused: false,
    invalid: false,
    disabled: false
  }
})

/** InputOtpProps 是 inputOtpCell 变体推导出的组件属性类型。 */
export type InputOtpProps = VariantProps<typeof inputOtpCell> & {
  gap?: VariantProps<typeof inputOtpGroup>['gap']
}
