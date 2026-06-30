import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

import Alert from '../Alert.vue'

afterEach(() => {
  vi.useRealTimers()
})

describe('Alert', () => {
  it('renders title, description and semantic type', () => {
    const wrapper = mount(Alert, {
      props: {
        title: '保存成功',
        description: '项目已经同步到云端',
        type: 'success',
        showIcon: true
      }
    })

    expect(wrapper.find('[data-ui-alert="true"]').attributes('data-type')).toBe('success')
    expect(wrapper.find('[data-ui-alert-title="true"]').text()).toBe('保存成功')
    expect(wrapper.find('[data-ui-alert-description="true"]').text()).toBe('项目已经同步到云端')
    expect(wrapper.find('[data-ui-alert-icon="true"]').exists()).toBe(true)
  })

  it('uses warning type and icon by default in banner mode', () => {
    const wrapper = mount(Alert, {
      props: {
        title: '系统维护',
        banner: true
      }
    })

    expect(wrapper.find('[data-ui-alert="true"]').attributes('data-type')).toBe('warning')
    expect(wrapper.find('[data-ui-alert-icon="true"]').exists()).toBe(true)
  })

  it('renders action and custom slots', () => {
    const wrapper = mount(Alert, {
      props: {
        type: 'info',
        showIcon: true
      },
      slots: {
        title: '自定义标题',
        description: '自定义描述',
        action: '<button>查看</button>',
        icon: '<span class="custom-icon"></span>'
      }
    })

    expect(wrapper.text()).toContain('自定义标题')
    expect(wrapper.text()).toContain('自定义描述')
    expect(wrapper.find('[data-ui-alert-actions="true"]').text()).toBe('查看')
    expect(wrapper.find('.custom-icon').exists()).toBe(true)
  })

  it('closes with animation and emits close events', async () => {
    vi.useFakeTimers()
    const afterClose = vi.fn()
    const onClose = vi.fn()
    const wrapper = mount(Alert, {
      props: {
        title: '可关闭',
        closable: {
          afterClose,
          onClose
        }
      }
    })

    await wrapper.find('[data-ui-alert-close="true"]').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(wrapper.find('[data-ui-alert="true"]').exists()).toBe(true)

    vi.advanceTimersByTime(200)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-ui-alert="true"]').exists()).toBe(false)
    expect(afterClose).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('afterClose')).toHaveLength(1)
  })
})
