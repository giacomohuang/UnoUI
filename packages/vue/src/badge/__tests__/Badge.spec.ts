import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import Badge from '../Badge.vue'
import BadgeRibbon from '../BadgeRibbon.vue'

describe('Badge', () => {
  it('renders count and applies overflowCount', () => {
    const wrapper = mount(Badge, {
      props: {
        count: 109,
        overflowCount: 99
      },
      slots: {
        default: '<button>通知</button>'
      }
    })

    expect(wrapper.find('[data-ui-badge-indicator="true"]').text()).toBe('99+')
    expect(wrapper.find('[data-ui-badge-indicator="true"]').attributes('title')).toBe('99+')
  })

  it('hides zero by default and shows it with showZero', async () => {
    const wrapper = mount(Badge, {
      props: {
        count: 0
      }
    })

    expect(wrapper.find('[data-ui-badge-indicator="true"]').exists()).toBe(false)

    await wrapper.setProps({ showZero: true })

    expect(wrapper.find('[data-ui-badge-indicator="true"]').text()).toBe('0')
  })

  it('supports dot mode and custom offset', () => {
    const wrapper = mount(Badge, {
      props: {
        dot: true,
        offset: [8, 4]
      },
      slots: {
        default: '<button>状态</button>'
      }
    })

    const indicator = wrapper.find('[data-ui-badge-indicator="true"]')
    expect(indicator.text()).toBe('')
    expect(indicator.attributes('style')).toContain('translate(calc(50% + 8px), calc(-50% + 4px))')
  })

  it('renders status mode with text and custom color', () => {
    const wrapper = mount(Badge, {
      props: {
        status: 'processing',
        text: '同步中',
        color: '#7c3aed'
      }
    })

    expect(wrapper.find('[data-ui-badge-text="true"]').text()).toBe('同步中')
    expect(wrapper.find('[data-ui-badge-indicator="true"]').attributes('style')).toContain('background-color: rgb(124, 58, 237)')
  })

  it('renders custom color text as status mode without explicit status', () => {
    const wrapper = mount(Badge, {
      props: {
        text: '自定义',
        color: '#7c3aed'
      }
    })

    expect(wrapper.find('[data-ui-badge-text="true"]').text()).toBe('自定义')
    expect(wrapper.find('[data-ui-badge-indicator="true"]').attributes('style')).toContain('background-color: rgb(124, 58, 237)')
  })
})

describe('BadgeRibbon', () => {
  it('renders ribbon text and custom color', () => {
    const wrapper = mount(BadgeRibbon, {
      props: {
        text: '推荐',
        color: '#7c3aed'
      },
      slots: {
        default: '<div>内容</div>'
      }
    })

    expect(wrapper.find('[data-ui-badge-ribbon-content="true"]').text()).toBe('推荐')
    expect(wrapper.find('[data-ui-badge-ribbon-indicator="true"]').attributes('style')).toContain('background-color: rgb(124, 58, 237)')
    expect(wrapper.find('[aria-hidden="true"]').attributes('style')).toContain('background-color: rgb(97, 45, 185)')
  })

  it('uses the floating tag shape with folded corner', () => {
    const wrapper = mount(BadgeRibbon, {
      props: {
        text: '6.0.0'
      },
      slots: {
        default: '<div>内容</div>'
      }
    })

    expect(wrapper.find('[data-ui-badge-ribbon-indicator="true"]').classes()).toContain('rounded-md')
    expect(wrapper.find('[data-ui-badge-ribbon-indicator="true"]').classes()).toContain('rounded-br-none')
    expect(wrapper.find('[data-ui-badge-ribbon-indicator="true"]').classes()).toContain('translate-x-3')
    const fold = wrapper.find('[aria-hidden="true"]')
    expect(fold.classes()).toContain('size-3')
    expect(fold.classes()).toContain('[clip-path:polygon(0_0,100%_0,0_65%)]')
    expect(fold.classes()).toContain('bg-brand-700')
    expect(fold.classes()).not.toContain('rounded-md')
  })

  it('mirrors folded corner for start placement', () => {
    const wrapper = mount(BadgeRibbon, {
      props: {
        text: '审核中',
        placement: 'start'
      },
      slots: {
        default: '<div>内容</div>'
      }
    })

    expect(wrapper.find('[data-ui-badge-ribbon-indicator="true"]').classes()).toContain('rounded-bl-none')
    expect(wrapper.find('[data-ui-badge-ribbon-indicator="true"]').classes()).toContain('-translate-x-3')
    expect(wrapper.find('[aria-hidden="true"]').classes()).toContain('[clip-path:polygon(0_0,100%_0,100%_65%)]')
  })
})
