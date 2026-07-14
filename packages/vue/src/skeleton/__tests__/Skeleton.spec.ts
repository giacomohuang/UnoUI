import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import Skeleton from '../Skeleton.vue'

describe('Skeleton', () => {
  it('renders an article title and configurable body rows', () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: 'article',
        rows: 4,
        width: '720px',
        padded: true
      }
    })

    expect(wrapper.attributes('data-ui-skeleton')).toBe('article')
    expect(wrapper.classes()).toContain('p-3')
    expect(wrapper.attributes('style')).toContain('width: 720px')
    expect(wrapper.findAll('[data-ui-skeleton-article-title="true"]')).toHaveLength(1)

    const bodyRows = wrapper.findAll('[data-ui-skeleton-article-line="true"]')
    expect(bodyRows).toHaveLength(4)
    expect(bodyRows.map((row) => row.attributes('style'))).toEqual(['width: 100%;', 'width: 96%;', 'width: 88%;', 'width: 100%;'])
  })
})
