import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

export { default as Pagination } from './Pagination.vue'

/** PaginationLayoutToken 是 layout 字符串支持的片段。 */
export type PaginationLayoutToken = 'prev' | 'pager' | 'next' | 'sizes' | 'jumper' | 'total' | '->'

/** paginationPagerButton 定义页码按钮样式。 */
export const paginationPagerButton = cva('inline-flex shrink-0 items-center justify-center rounded-md border font-normal transition-colors duration-150', {
  variants: {
    size: {
      sm: 'h-7 min-w-7 px-2 text-sm/5',
      md: 'h-8 min-w-8 px-2.5 text-sm/5',
      lg: 'h-9 min-w-9 px-3 text-base/6'
    },
    active: {
      true: 'border-brand-500 bg-brand-500 text-white hover:border-brand-400 hover:bg-brand-400',
      false: 'border-medium bg-primary text-secondary hover:border-brand/40 hover:text-brand'
    },
    disabled: {
      true: 'cursor-not-allowed opacity-50 pointer-events-none',
      false: 'cursor-pointer'
    }
  },
  defaultVariants: {
    size: 'md',
    active: false,
    disabled: false
  }
})

/** PaginationProps 是 paginationPagerButton 变体推导出的组件属性类型。 */
export type PaginationProps = VariantProps<typeof paginationPagerButton>
