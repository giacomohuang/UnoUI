import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import Pagination from '../Pagination.vue'

describe('Pagination', () => {
  it('emits current page changes', async () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 2,
        pageSize: 10,
        total: 80,
        layout: 'prev, pager, next'
      },
      attachTo: document.body
    })

    await wrapper.findAll('button').at(-1)?.trigger('click')

    expect(wrapper.emitted('update:currentPage')?.[0]).toEqual([3])
    expect(wrapper.emitted('current-change')?.[0]).toEqual([3])
    expect(wrapper.emitted('change')?.[0]).toEqual([3, 10])
    wrapper.unmount()
  })

  it('hides when hideOnSinglePage is true', () => {
    const wrapper = mount(Pagination, {
      props: {
        total: 8,
        pageSize: 10,
        hideOnSinglePage: true
      }
    })

    expect(wrapper.find('[data-ui-pagination="true"]').exists()).toBe(false)
  })
})
