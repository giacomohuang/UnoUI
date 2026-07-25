import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'

import QRCode from '../QRCode.vue'

interface QRCodeExposed {
  toDataURL: (type?: string, quality?: number) => string | undefined
}

describe('QRCode', () => {
  it('renders svg qrcode with custom colors and title', () => {
    const wrapper = mount(QRCode, {
      props: {
        value: 'https://unoui.example.com/project/10000',
        type: 'svg',
        color: '#1677ff',
        bgColor: '#f0f5ff',
        title: '项目二维码'
      }
    })

    const svg = wrapper.find('[data-ui-qrcode-code="true"]')
    expect(svg.exists()).toBe(true)
    expect(svg.attributes('role')).toBe('img')
    expect(svg.find('title').text()).toBe('项目二维码')
    expect(svg.findAll('path')[0].attributes('fill')).toBe('#f0f5ff')
    expect(svg.findAll('path')[1].attributes('fill')).toBe('#1677ff')
  })

  it('adds quiet zone with marginSize', () => {
    const plain = mount(QRCode, {
      props: {
        value: 'margin',
        type: 'svg',
        marginSize: 0
      }
    })
    const withMargin = mount(QRCode, {
      props: {
        value: 'margin',
        type: 'svg',
        marginSize: 4
      }
    })

    const plainCells = Number(plain.find('svg').attributes('viewBox')?.split(' ')[2])
    const marginCells = Number(withMargin.find('svg').attributes('viewBox')?.split(' ')[2])
    expect(marginCells - plainCells).toBe(8)
  })

  it('shows expired status and emits refresh', async () => {
    const wrapper = mount(QRCode, {
      props: {
        value: 'expired',
        type: 'svg',
        status: 'expired',
        expiredText: '已失效',
        refreshText: '重新生成'
      }
    })

    expect(wrapper.find('[data-ui-qrcode-mask="true"]').text()).toContain('已失效')
    await wrapper.find('[data-ui-qrcode-refresh="true"]').trigger('click')
    expect(wrapper.emitted('refresh')).toHaveLength(1)
  })

  it('supports custom status slot', () => {
    const wrapper = mount(QRCode, {
      props: {
        value: 'custom-status',
        type: 'svg',
        status: 'scanned'
      },
      slots: {
        status: ({ status }) => h('div', { 'data-test-status': status }, `状态：${status}`)
      }
    })

    expect(wrapper.find('[data-test-status="scanned"]').text()).toBe('状态：scanned')
  })

  it('supports statusRender prop', () => {
    const wrapper = mount(QRCode, {
      props: {
        value: 'render-status',
        type: 'svg',
        status: 'loading',
        statusRender: ({ locale }) => h('div', { 'data-test-render': 'status' }, locale.loading)
      }
    })

    expect(wrapper.find('[data-test-render="status"]').text()).toBe('加载中')
  })

  it('exposes svg data url', () => {
    const wrapper = mount(QRCode, {
      props: {
        value: 'download',
        type: 'svg'
      }
    })

    expect((wrapper.vm as unknown as QRCodeExposed).toDataURL('image/svg+xml')).toContain('data:image/svg+xml;charset=utf-8,')
  })
})
