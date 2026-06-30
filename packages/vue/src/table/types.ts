export type TableRow = object

export type TableColumnAlign = 'left' | 'center' | 'right'

export type TableFixedSide = 'left' | 'right'

export type TableSortDirection = 'asc' | 'desc'

export type TableRadius = 'none' | 'sm' | 'md' | 'lg'

export type TableSize = 'md' | 'lg'

export interface TableSortState {
  key: string
  direction: TableSortDirection
}

export type TableFiltersState = Record<string, unknown[]>

export interface TableFilterOption {
  label: string
  value: string | number | boolean
  disabled?: boolean
}

export interface TableColumn<T extends TableRow = TableRow> {
  key: string
  title: string
  dataIndex?: keyof T | string
  width?: number | string
  minWidth?: number | string
  maxWidth?: number | string
  align?: TableColumnAlign
  fixed?: TableFixedSide
  sortable?: boolean | ((a: T, b: T) => number)
  defaultSortDirection?: TableSortDirection
  filters?: TableFilterOption[]
  filterMultiple?: boolean
  filterFn?: (row: T, selectedValues: unknown[]) => boolean
  formatter?: (value: unknown, row: T, index: number) => string | number
  class?: string | ((row: T, index: number) => string)
  headerClass?: string
  wrap?: boolean
}
