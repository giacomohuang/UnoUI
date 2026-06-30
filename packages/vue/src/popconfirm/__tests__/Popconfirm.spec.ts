import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'

import Popconfirm from '../Popconfirm.vue'

function mockRect(element: Element, rect: Partial<DOMRect>) {
  element.getBoundingClientRect = () =>
    ({
      left: 100,
      top: 100,
      width: 64,
      height: 28,
      right: 164,
      bottom: 128,
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

afterEach(() => {
  document.body.innerHTML = ''
})

describe('Popconfirm', () => {
  it('opens on click and renders title and description', async () => {
    const wrapper = mount(Popconfirm, {
      props: {
        title: '确认删除？',
        description: '删除后不可恢复。'
      },
      slots: {
        default: '<button>删除</button>'
      },
      attachTo: document.body
    })
    const trigger = wrapper.find('[data-ui-popconfirm-trigger="true"]')
    mockRect(trigger.element, {})

    await trigger.trigger('click')
    await flushFrame()

    expect(document.body.querySelector('[data-ui-popconfirm="true"]')?.textContent).toContain('确认删除？')
    expect(document.body.querySelector('[data-ui-popconfirm="true"]')?.textContent).toContain('删除后不可恢复。')
    expect(wrapper.emitted('openChange')?.[0]).toEqual([true])
    wrapper.unmount()
  })

  it('emits confirm and closes', async () => {
    const wrapper = mount(Popconfirm, {
      props: {
        title: '确认发布？',
        open: true
      },
      slots: {
        default: '<button>发布</button>'
      },
      attachTo: document.body
    })

    await flushFrame()
    const buttons = Array.from(document.body.querySelectorAll('button'))
    const okButton = buttons.find((button) => button.textContent?.includes('确定')) as HTMLButtonElement
    okButton.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('confirm')).toHaveLength(1)
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
    wrapper.unmount()
  })

  it('emits cancel and closes', async () => {
    const wrapper = mount(Popconfirm, {
      props: {
        title: '确认取消？',
        open: true
      },
      slots: {
        default: '<button>操作</button>'
      },
      attachTo: document.body
    })

    await flushFrame()
    const buttons = Array.from(document.body.querySelectorAll('button'))
    const cancelButton = buttons.find((button) => button.textContent?.includes('取消')) as HTMLButtonElement
    cancelButton.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
    wrapper.unmount()
  })

  it('supports controlled open and outside close', async () => {
    const wrapper = mount(Popconfirm, {
      props: {
        title: '受控',
        open: false
      },
      slots: {
        default: '<button>触发</button>'
      },
      attachTo: document.body
    })

    await wrapper.find('[data-ui-popconfirm-trigger="true"]').trigger('click')
    expect(wrapper.emitted('update:open')?.[0]).toEqual([true])

    await wrapper.setProps({ open: true })
    await flushFrame()
    expect(document.body.querySelector('[data-ui-popconfirm="true"]')?.textContent).toContain('受控')

    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
    wrapper.unmount()
  })

  it('does not open when disabled', async () => {
    const wrapper = mount(Popconfirm, {
      props: {
        title: '禁用',
        disabled: true
      },
      slots: {
        default: '<button>触发</button>'
      },
      attachTo: document.body
    })

    await wrapper.find('[data-ui-popconfirm-trigger="true"]').trigger('click')
    await flushFrame()

    expect(wrapper.emitted('update:open')).toBeUndefined()
    expect((document.body.querySelector('[data-ui-popconfirm="true"]') as HTMLElement).style.display).toBe('none')
    wrapper.unmount()
  })

  it('only renders outer arrow borders for side placement', async () => {
    const wrapper = mount(Popconfirm, {
      props: {
        title: '右侧',
        open: true,
        placement: 'right'
      },
      slots: {
        default: '<button>触发</button>'
      },
      attachTo: document.body
    })

    await flushFrame()
    const arrow = document.body.querySelector('[data-ui-popconfirm="true"] .rotate-45') as HTMLElement
    expect(arrow.classList.contains('border')).toBe(false)
    expect(arrow.classList.contains('border-l')).toBe(true)
    expect(arrow.classList.contains('border-b')).toBe(true)
    expect(arrow.classList.contains('border-r')).toBe(false)
    expect(arrow.classList.contains('border-t')).toBe(false)
    wrapper.unmount()
  })

  it('uses right-side outer borders when popup is placed on the left', async () => {
    const wrapper = mount(Popconfirm, {
      props: {
        title: '左下',
        open: true,
        placement: 'leftBottom'
      },
      slots: {
        default: '<button>触发</button>'
      },
      attachTo: document.body
    })

    await flushFrame()
    const arrow = document.body.querySelector('[data-ui-popconfirm="true"] .rotate-45') as HTMLElement
    expect(arrow.classList.contains('border')).toBe(false)
    expect(arrow.classList.contains('border-r')).toBe(true)
    expect(arrow.classList.contains('border-t')).toBe(true)
    expect(arrow.classList.contains('border-l')).toBe(false)
    expect(arrow.classList.contains('border-b')).toBe(false)
    wrapper.unmount()
  })
})
