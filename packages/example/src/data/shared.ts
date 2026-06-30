import type { ParamTableColumn, ParamTableRow } from '@/components/ParamTable.vue'

export const propsColumns: ParamTableColumn[] = [
  { key: 'name', title: '参数名', width: '140px' },
  { key: 'type', title: '类型', mono: true },
  { key: 'default', title: '默认值', mono: true, width: '100px' },
  { key: 'desc', title: '说明' }
]

export const emitsColumns: ParamTableColumn[] = [
  { key: 'name', title: '事件名', width: '180px' },
  { key: 'params', title: '参数', mono: true },
  { key: 'desc', title: '说明' }
]

export const slotsColumns: ParamTableColumn[] = [
  { key: 'name', title: '插槽名', width: '140px' },
  { key: 'scoped', title: 'Scoped 参数', mono: true },
  { key: 'desc', title: '说明' }
]

export const exposedColumns: ParamTableColumn[] = [
  { key: 'name', title: '方法名', width: '160px' },
  { key: 'signature', title: '参数 / 返回值', mono: true },
  { key: 'desc', title: '说明' }
]

/** sharedProps 是多个组件共有的属性条目，减少数据文件冗余。 */
export const sharedSizeProp: ParamTableRow = { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'`, desc: '组件尺寸' }
export const sharedDisabledProp: ParamTableRow = { name: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用交互' }
