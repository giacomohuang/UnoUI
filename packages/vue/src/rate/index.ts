import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

export { default as Rate } from './Rate.vue'

/** RateCharacterSlotProps 是自定义评分字符插槽接收的上下文。 */
export interface RateCharacterSlotProps {
  index: number
  count: number
  value: number
  active: boolean
  half: boolean
  disabled: boolean
}

/** rateRoot 定义管理端 Rate 根节点的排列、尺寸和焦点样式。 */
export const rateRoot = cva('inline-flex w-fit items-center rounded outline-none transition-colors duration-150 focus-visible:(ring-2 ring-brand-400 ring-offset-2 ring-offset-primary)', {
  variants: {
    size: {
      sm: 'gap-1.5 text-xl/5',
      md: 'gap-2 text-2xl/6',
      lg: 'gap-2.5 text-3xl/7'
    },
    disabled: {
      true: 'cursor-not-allowed opacity-70',
      false: 'cursor-pointer'
    },
    focused: {
      true: '',
      false: ''
    }
  },
  compoundVariants: [{ focused: true, disabled: false, class: 'text-brand-500' }],
  defaultVariants: {
    size: 'md',
    disabled: false,
    focused: false
  }
})

/** rateItem 定义单个评分字符的交互热区。 */
export const rateItem = cva('group/ui-rate-item relative inline-flex shrink-0 items-center justify-center rounded-sm border-0 bg-transparent p-0 text-inherit outline-none', {
  variants: {
    size: {
      sm: 'size-5',
      md: 'size-6',
      lg: 'size-7.5'
    },
    active: {
      true: '',
      false: ''
    },
    disabled: {
      true: 'cursor-not-allowed',
      false: 'cursor-pointer'
    }
  },
  defaultVariants: {
    size: 'md',
    active: false,
    disabled: false
  }
})

/** rateCharacter 定义评分字符容器，支持半选时裁切前景层。 */
export const rateCharacter = cva('relative inline-grid size-[1em] place-items-center select-none leading-none', {
  variants: {
    disabled: {
      true: '',
      false: 'transition-transform duration-200 ease-out group-hover/ui-rate-item:scale-110 group-active/ui-rate-item:scale-100 group-focus-visible/ui-rate-item:scale-110'
    }
  },
  defaultVariants: {
    disabled: false
  }
})

/** rateCharacterLayer 定义评分字符的未选/已选前景层。 */
export const rateCharacterLayer = cva('inline-grid size-[1em] place-items-center leading-none transition-colors duration-150', {
  variants: {
    tone: {
      base: 'text-zinc-300 dark:text-zinc-700',
      active: 'text-amber-400 dark:text-amber-300',
      disabledBase: 'text-zinc-300 dark:text-zinc-700',
      disabledActive: 'text-zinc-400 dark:text-zinc-500'
    }
  },
  defaultVariants: {
    tone: 'base'
  }
})

/** rateActiveLayer 定义 Ant 风格的半星/整星激活层淡入淡出动画。 */
export const rateActiveLayer = cva('absolute inset-y-0 left-0 overflow-hidden opacity-0 transition-opacity duration-200 ease-out', {
  variants: {
    kind: {
      half: 'w-1/2',
      full: 'w-full'
    }
  },
  defaultVariants: {
    kind: 'full'
  }
})

/** RateProps 是 rateRoot 变体推导出的组件属性类型。 */
export type RateProps = VariantProps<typeof rateRoot>
export type RateSize = NonNullable<RateProps['size']>
