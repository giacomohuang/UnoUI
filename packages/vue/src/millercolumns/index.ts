import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

export { default as MillerColumns } from './MillerColumns.vue'

/** MillerColumnsId 是层级列节点的主键类型。 */
export type MillerColumnsId = string | number
/** MillerColumnsParentId 是层级列父节点主键，null 表示根层。 */
export type MillerColumnsParentId = MillerColumnsId | null
/** MillerColumnsDataSource 是层级列支持的数据源结构。 */
export type MillerColumnsDataSource<T extends Record<string, unknown>> = Map<MillerColumnsId, T> | T[] | null | undefined
/** MillerColumnsFieldKey 是数据项字段名。 */
export type MillerColumnsFieldKey<T extends Record<string, unknown>> = Extract<keyof T, string>

/** MillerColumnsSelectEvent 是点击节点后的选择事件载荷。 */
export interface MillerColumnsSelectEvent<T extends Record<string, unknown>> {
  ids: MillerColumnsId[]
  id: MillerColumnsId
  item: T | null
  columnIndex: number
}

/** millerColumnsRoot 定义层级列根容器样式。 */
export const millerColumnsRoot = cva('flex w-full overflow-hidden border bg-primary text-primary', {
  variants: {
    radius: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg'
    },
    bordered: {
      true: 'border-medium',
      false: 'border-transparent'
    }
  },
  defaultVariants: {
    radius: 'md',
    bordered: true
  }
})

/** millerColumnsColumn 定义单个 Miller column 容器样式。 */
export const millerColumnsColumn = cva('shrink-0 border-r border-medium bg-secondary/70 last:border-r-0')

/** millerColumnsHeader 定义列标题栏样式。 */
export const millerColumnsHeader = cva('flex h-12 items-center justify-between gap-3 border-b border-medium bg-tertiary/20 px-4 text-sm font-semibold text-secondary')

/** millerColumnsRows 定义单列列表样式。 */
export const millerColumnsRows = cva('list-none space-y-1 overflow-x-hidden p-2')

/** millerColumnsRow 定义节点行样式。 */
export const millerColumnsRow = cva('group/miller-row flex w-full items-center justify-between rounded-sm px-3 py-2.5 text-sm font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-brand/30', {
  variants: {
    active: {
      true: 'bg-brand-500 text-white',
      false: 'text-secondary hover:bg-tertiary/50 focus-visible:bg-tertiary/50'
    },
    sortable: {
      true: 'cursor-move',
      false: 'cursor-default'
    }
  },
  defaultVariants: {
    active: false,
    sortable: false
  }
})

/** millerColumnsEmpty 定义空列或空数据提示样式。 */
export const millerColumnsEmpty = cva('m-2 flex items-center px-4 py-2 text-sm font-semibold text-tertiary')

/** millerColumnsInfoPanel 定义右侧信息面板样式。 */
export const millerColumnsInfoPanel = cva('z-2 shrink-0 border-l border-medium bg-primary shadow-[0_0_10px_0_rgb(231_229_228)] dark:shadow-none')

/** MillerColumnsProps 是根容器变体推导出的组件属性类型。 */
export type MillerColumnsProps = VariantProps<typeof millerColumnsRoot>
