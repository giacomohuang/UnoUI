import { flushPromises, mount } from '@vue/test-utils'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'

import MillerColumns from '../MillerColumns.vue'
import type { MillerColumnsId } from '..'

vi.mock('simplebar-vue', () => ({
  default: defineComponent({
    name: 'SimpleBar',
    props: {
      style: {
        type: [String, Object],
        default: undefined
      },
      autoHide: {
        type: Boolean,
        default: false
      }
    },
    setup(props, { slots, expose }) {
      const rootRef = ref<HTMLElement | null>(null)
      expose({
        recalculate: () => {},
        getScrollElement: () => rootRef.value
      })
      return () => h('div', { ref: rootRef, class: 'simplebar-stub', style: props.style }, slots.default?.())
    }
  })
}))

interface TreeNode extends Record<string, unknown> {
  id: number
  pid: number | null
  order: number
  name: string
}

const createSource = () =>
  new Map<MillerColumnsId, TreeNode>([
    [1, { id: 1, pid: null, order: 1, name: '根节点 A' }],
    [2, { id: 2, pid: null, order: 0, name: '根节点 B' }],
    [3, { id: 3, pid: 1, order: 0, name: '子节点 A-1' }]
  ])

type MillerColumnsTestProps = {
  dataSource?: Map<MillerColumnsId, TreeNode>
  modelValue?: MillerColumnsId[]
  idKey?: string
  parentIdKey?: string
  orderKey?: string
  showInfoPanel?: boolean
  sortable?: boolean
  noDataText?: string
}

const mountMillerColumns = (props: MillerColumnsTestProps = {}) =>
  mount(MillerColumns, {
    props: {
      dataSource: createSource(),
      modelValue: [],
      idKey: 'id',
      parentIdKey: 'pid',
      orderKey: 'order',
      showInfoPanel: false,
      ...props
    },
    slots: {
      'col-title': ({ colIndex, itemCount }: { colIndex: number; itemCount: number }) => h('span', `L${colIndex + 1}/${itemCount}`),
      'item-left': ({ item }: { item: Record<string, unknown> }) => h('span', String(item.name)),
      'info-panel': ({ item }: { item: Record<string, unknown> | null }) => h('span', { 'data-test': 'info' }, String(item?.name ?? 'none'))
    },
    attachTo: document.body
  })

describe('MillerColumns', () => {
  beforeAll(() => {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => window.setTimeout(() => callback(performance.now()), 0))
    vi.stubGlobal('cancelAnimationFrame', (id: number) => window.clearTimeout(id))
    Element.prototype.scrollIntoView = vi.fn()
    HTMLElement.prototype.scrollTo = vi.fn()
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  it('renders selected branch, empty leaf column and info panel', () => {
    const wrapper = mountMillerColumns({
      modelValue: [1, 3],
      showInfoPanel: true
    })

    expect(wrapper.findAll('[data-ui-miller-columns-column="true"]')).toHaveLength(3)
    expect(wrapper.text()).toContain('子节点 A-1')
    expect(wrapper.find('[data-ui-miller-columns-empty="true"]').text()).toBe('空')
    expect(wrapper.find('[data-test="info"]').text()).toBe('子节点 A-1')
    wrapper.unmount()
  })

  it('emits model update and select payload when clicking a row', async () => {
    const wrapper = mountMillerColumns()

    await wrapper.find('[data-id="1"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[1]])
    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({
      ids: [1],
      id: 1,
      columnIndex: 0,
      item: {
        name: '根节点 A'
      }
    })
    wrapper.unmount()
  })

  it('renders no data state', () => {
    const wrapper = mountMillerColumns({
      dataSource: new Map(),
      noDataText: '没有节点'
    })

    expect(wrapper.find('[data-ui-miller-columns-no-data="true"]').text()).toContain('没有节点')
    expect(wrapper.find('[data-ui-miller-columns-column="true"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('emits reordered ids and writes order field after drag sorting', async () => {
    const dataSource = createSource()
    const wrapper = mountMillerColumns({
      dataSource,
      sortable: true
    })
    await flushPromises()

    const firstRow = wrapper.find('[data-id="2"]')
    const secondRow = wrapper.find('[data-id="1"]')
    const list = wrapper.find('ul').element

    await firstRow.trigger('dragstart')
    list.insertBefore(secondRow.element, firstRow.element)
    await firstRow.trigger('dragend')

    expect(wrapper.emitted('reorder')?.[0]).toEqual([[1, 2]])
    expect(dataSource.get(1)?.order).toBe(0)
    expect(dataSource.get(2)?.order).toBe(1)
    wrapper.unmount()
  })
})
