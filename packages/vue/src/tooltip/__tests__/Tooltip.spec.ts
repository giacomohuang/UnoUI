import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

import Tooltip from '../Tooltip.vue'

function mockRect(element: Element, rect: Partial<DOMRect>) {
  element.getBoundingClientRect = () =>
    ({
      left: 100,
      top: 100,
      width: 40,
      height: 24,
      right: 140,
      bottom: 124,
      x: 100,
      y: 100,
      toJSON: () => ({}),
      ...rect
    }) as DOMRect
}

async function flushFrame() {
  await new Promise((resolve) => requestAnimationFrame(resolve))
  await new Promise((resolve) => requestAnimationFrame(resolve))
}

async function waitTimer() {
  await new Promise((resolve) => window.setTimeout(resolve, 0))
}

afterEach(() => {
  document.body.innerHTML = ''
  vi.useRealTimers()
})

describe('Tooltip', () => {
  it('shows title on hover and hides on mouse leave', async () => {
    const wrapper = mount(Tooltip, {
      props: {
        title: '提示内容',
        mouseEnterDelay: 0,
        mouseLeaveDelay: 0
      },
      slots: {
        default: '<button>触发</button>'
      },
      attachTo: document.body
    })
    const trigger = wrapper.find('[data-ui-tooltip-trigger="true"]')
    mockRect(trigger.element, {})

    await trigger.trigger('mouseenter')
    await waitTimer()
    await flushFrame()

    expect(document.body.querySelector('[data-ui-tooltip="true"]')?.textContent).toContain('提示内容')

    await trigger.trigger('mouseleave')
    await waitTimer()
    await wrapper.vm.$nextTick()

    expect((document.body.querySelector('[data-ui-tooltip="true"]') as HTMLElement).style.display).toBe('none')
    wrapper.unmount()
  })

  it('supports click trigger and outside close', async () => {
    const wrapper = mount(Tooltip, {
      props: {
        title: '点击提示',
        trigger: 'click'
      },
      slots: {
        default: '<button>触发</button>'
      },
      attachTo: document.body
    })
    const trigger = wrapper.find('[data-ui-tooltip-trigger="true"]')

    await trigger.trigger('click')
    await flushFrame()
    expect(document.body.querySelector('[role="tooltip"]')?.textContent).toContain('点击提示')

    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect((document.body.querySelector('[role="tooltip"]') as HTMLElement).style.display).toBe('none')
    wrapper.unmount()
  })

  it('supports contextMenu trigger', async () => {
    const wrapper = mount(Tooltip, {
      props: {
        title: '右键提示',
        trigger: 'contextMenu'
      },
      slots: {
        default: '<button>触发</button>'
      },
      attachTo: document.body
    })

    await wrapper.find('[data-ui-tooltip-trigger="true"]').trigger('contextmenu')
    await flushFrame()

    expect(document.body.querySelector('[role="tooltip"]')?.textContent).toContain('右键提示')
    wrapper.unmount()
  })

  it('supports controlled open and emits update events', async () => {
    const wrapper = mount(Tooltip, {
      props: {
        title: '受控提示',
        open: false,
        trigger: 'click'
      },
      slots: {
        default: '<button>触发</button>'
      },
      attachTo: document.body
    })

    await wrapper.find('[data-ui-tooltip-trigger="true"]').trigger('click')
    expect(wrapper.emitted('update:open')?.[0]).toEqual([true])
    expect(wrapper.emitted('openChange')?.[0]).toEqual([true])

    await wrapper.setProps({ open: true })
    await flushFrame()
    expect(document.body.querySelector('[role="tooltip"]')?.textContent).toContain('受控提示')
    wrapper.unmount()
  })

  it('applies placement, color and arrow settings', async () => {
    const wrapper = mount(Tooltip, {
      props: {
        title: '彩色提示',
        open: true,
        placement: 'rightTop',
        color: '#16a34a'
      },
      slots: {
        default: '<button>触发</button>'
      },
      attachTo: document.body
    })
    mockRect(wrapper.find('[data-ui-tooltip-trigger="true"]').element, {})
    await flushFrame()

    const tooltip = document.body.querySelector('[data-ui-tooltip="true"]') as HTMLElement
    expect(tooltip.dataset.placement).toBe('rightTop')
    expect(tooltip.style.backgroundColor).toBe('rgb(22, 163, 74)')
    expect(tooltip.querySelector('.rotate-45')).not.toBeNull()
    wrapper.unmount()
  })

  it('realigns when forceAlignKey changes', async () => {
    const wrapper = mount(Tooltip, {
      props: {
        title: '跟随提示',
        open: true,
        forceAlignKey: 1
      },
      slots: {
        default: '<button>触发</button>'
      },
      attachTo: document.body
    })
    const trigger = wrapper.find('[data-ui-tooltip-trigger="true"]')
    const popup = () => document.body.querySelector('[data-ui-tooltip="true"]') as HTMLElement

    mockRect(trigger.element, {
      left: 100,
      right: 140
    })
    mockRect(popup(), {
      width: 60,
      height: 24
    })
    await flushFrame()
    expect(popup().style.left).toBe('90px')

    mockRect(trigger.element, {
      left: 160,
      right: 200
    })
    await wrapper.setProps({ forceAlignKey: 2 })
    await flushFrame()

    expect(popup().style.left).toBe('150px')
    wrapper.unmount()
  })

  it('destroys popup when destroyOnHidden is true', async () => {
    const wrapper = mount(Tooltip, {
      props: {
        title: '销毁提示',
        open: false,
        destroyOnHidden: true
      },
      slots: {
        default: '<button>触发</button>'
      },
      attachTo: document.body
    })

    expect(document.body.querySelector('[data-ui-tooltip="true"]')).toBeNull()

    await wrapper.setProps({ open: true })
    await flushFrame()

    expect(document.body.querySelector('[data-ui-tooltip="true"]')).not.toBeNull()
    wrapper.unmount()
  })
})
