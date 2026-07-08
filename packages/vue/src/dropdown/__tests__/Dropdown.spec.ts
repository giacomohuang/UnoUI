import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

import Dropdown from '../Dropdown.vue'

const items = [
  { label: '短文本', value: 'short' },
  { label: '更长的触发器文本', value: 'long' }
]

function mockRect(element: Element, getRect: () => Partial<DOMRect>) {
  element.getBoundingClientRect = () =>
    ({
      left: 100,
      top: 80,
      width: 80,
      height: 32,
      right: 180,
      bottom: 112,
      x: 100,
      y: 80,
      toJSON: () => ({}),
      ...getRect()
    }) as DOMRect
}

function mockMenuSize(element: HTMLElement, size: { width?: number; height?: number }) {
  Object.defineProperty(element, 'offsetWidth', { configurable: true, value: size.width ?? 180 })
  Object.defineProperty(element, 'offsetHeight', { configurable: true, value: size.height ?? 96 })
}

async function flushFrame() {
  await new Promise((resolve) => requestAnimationFrame(resolve))
  await new Promise((resolve) => requestAnimationFrame(resolve))
}

function dispatchMouseLeave(element: Element, relatedTarget: EventTarget | null) {
  const event = new MouseEvent('mouseleave', { bubbles: true })
  Object.defineProperty(event, 'relatedTarget', { configurable: true, value: relatedTarget })
  element.dispatchEvent(event)
}

afterEach(() => {
  document.body.innerHTML = ''
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('Dropdown', () => {
  it('keeps inline trigger width by default and supports full width mode', () => {
    const inline = mount(Dropdown, {
      props: {
        items
      },
      slots: {
        trigger: '<button>inline</button>',
        item: '<button>item</button>'
      },
      attachTo: document.body
    })
    const full = mount(Dropdown, {
      props: {
        items,
        fullWidth: true
      },
      slots: {
        trigger: '<button>full</button>',
        item: '<button>item</button>'
      },
      attachTo: document.body
    })

    expect(inline.classes()).toContain('inline-block')
    expect(inline.classes()).not.toContain('w-full')
    expect(full.classes()).toContain('w-full')
    expect(full.classes()).toContain('min-w-0')
    inline.unmount()
    full.unmount()
  })

  it('renders header and footer outside the scrollable item list', async () => {
    const wrapper = mount(Dropdown, {
      props: {
        open: true,
        items,
        valueKey: 'value',
        contentClass: 'dropdown-footer-test'
      },
      slots: {
        trigger: '<button>open</button>',
        header: '<div class="dropdown-header-slot">header</div>',
        item: '<button>item</button>',
        footer: '<div class="dropdown-footer-slot">footer</div>'
      },
      attachTo: document.body
    })
    await nextTick()

    const menu = document.body.querySelector('.dropdown-footer-test') as HTMLElement
    const header = menu.querySelector('.dropdown-header-slot')
    const list = menu.querySelector('[role="menu"]')
    const footer = menu.querySelector('.dropdown-footer-slot')

    expect(header).not.toBeNull()
    expect(list).not.toBeNull()
    expect(footer).not.toBeNull()
    expect(Array.from(menu.children).indexOf(header as Element)).toBeLessThan(Array.from(menu.children).indexOf(list as Element))
    expect(Array.from(menu.children).indexOf(footer as Element)).toBeGreaterThan(Array.from(menu.children).indexOf(list as Element))
    wrapper.unmount()
  })

  it('marks keyboard active item when slotted item has hover background', async () => {
    const wrapper = mount(Dropdown, {
      props: {
        open: true,
        items,
        valueKey: 'value',
        contentClass: 'dropdown-keyboard-active-test'
      },
      slots: {
        trigger: '<button>open</button>',
        item: '<div class="hover:bg-secondary px-3 py-2">item</div>'
      },
      attachTo: document.body
    })
    await nextTick()

    const handled = (wrapper.vm as unknown as { handleKeyDown: (event: KeyboardEvent) => boolean }).handleKeyDown(new KeyboardEvent('keydown', { code: 'ArrowDown', key: 'ArrowDown', bubbles: true }))
    await nextTick()

    const activeItem = document.body.querySelector('.dropdown-keyboard-active-test .dropdown-item-wrapper.is-active')
    expect(handled).toBe(true)
    expect(activeItem).not.toBeNull()
    expect(activeItem?.firstElementChild?.className).toContain('hover:bg-secondary')
    wrapper.unmount()
  })

  it('opens from hover trigger and emits openChange source', async () => {
    vi.useFakeTimers()
    const wrapper = mount(Dropdown, {
      props: {
        items,
        trigger: 'hover',
        valueKey: 'value',
        contentClass: 'dropdown-hover-test'
      },
      slots: {
        trigger: '<button>hover</button>',
        item: '<button>item</button>'
      },
      attachTo: document.body
    })
    mockRect(wrapper.element, () => ({}))

    await wrapper.trigger('mouseenter')
    vi.advanceTimersByTime(90)
    vi.useRealTimers()
    await nextTick()
    await flushFrame()

    expect(document.body.querySelector('.dropdown-hover-test')).not.toBeNull()
    expect(wrapper.emitted('openChange')?.[0]).toEqual([true, { source: 'trigger' }])
    wrapper.unmount()
  })

  it('closes hover popup only after pointer leaves trigger and popup area', async () => {
    vi.useFakeTimers()
    const wrapper = mount(Dropdown, {
      props: {
        items,
        trigger: 'hover',
        valueKey: 'value',
        contentClass: 'dropdown-hover-close-test'
      },
      slots: {
        trigger: '<button>hover</button>',
        item: '<button>item</button>'
      },
      attachTo: document.body
    })
    mockRect(wrapper.element, () => ({}))

    await wrapper.trigger('mouseenter')
    vi.advanceTimersByTime(90)
    vi.useRealTimers()
    await nextTick()
    await flushFrame()

    const menu = document.body.querySelector('.dropdown-hover-close-test') as HTMLElement
    await wrapper.trigger('mouseleave', { relatedTarget: menu })
    await nextTick()
    expect(menu.style.display).not.toBe('none')

    dispatchMouseLeave(menu, document.body)
    await nextTick()
    expect(wrapper.emitted('openChange')?.at(-1)).toEqual([false, { source: 'trigger' }])
    wrapper.unmount()
  })

  it('opens context menu at pointer position', async () => {
    const wrapper = mount(Dropdown, {
      props: {
        items,
        trigger: 'contextMenu',
        valueKey: 'value',
        width: '180px',
        contentClass: 'dropdown-context-test'
      },
      slots: {
        trigger: '<button>context</button>',
        item: '<button>item</button>'
      },
      attachTo: document.body
    })

    await wrapper.trigger('contextmenu', { clientX: 240, clientY: 160 })
    await flushFrame()

    const menu = document.body.querySelector('.dropdown-context-test') as HTMLElement
    expect(menu.style.left).toBe('240px')
    expect(menu.style.top).toBe('164px')
    wrapper.unmount()
  })

  it('flips placement when popup would overflow viewport', async () => {
    const wrapper = mount(Dropdown, {
      props: {
        open: false,
        items,
        placement: 'bottomRight',
        valueKey: 'value',
        width: '180px',
        contentClass: 'dropdown-placement-test'
      },
      slots: {
        trigger: '<button>placement</button>',
        item: '<button>item</button>'
      },
      attachTo: document.body
    })
    mockRect(wrapper.element, () => ({ top: window.innerHeight - 40, bottom: window.innerHeight - 8 }))

    await wrapper.setProps({ open: true })
    await nextTick()
    const menu = document.body.querySelector('.dropdown-placement-test') as HTMLElement
    mockMenuSize(menu, { height: 120, width: 180 })
    await flushFrame()

    expect(menu.dataset.placement).toBe('topRight')
    expect(parseFloat(menu.style.top)).toBeLessThan(window.innerHeight - 40)
    wrapper.unmount()
  })

  it('sets motion origin from placement', async () => {
    const wrapper = mount(Dropdown, {
      props: {
        open: true,
        items,
        placement: 'topLeft',
        autoAdjustOverflow: false,
        contentClass: 'dropdown-motion-test'
      },
      slots: {
        trigger: '<button>motion</button>',
        item: '<button>item</button>'
      },
      attachTo: document.body
    })

    await nextTick()
    const menu = document.body.querySelector('.dropdown-motion-test') as HTMLElement
    mockMenuSize(menu, { height: 80, width: 180 })
    await flushFrame()
    expect(menu.style.transformOrigin).toBe('left bottom')

    await wrapper.setProps({ placement: 'bottomRight' })
    await flushFrame()
    expect(menu.style.transformOrigin).toBe('right top')
    wrapper.unmount()
  })

  it('keeps popup DOM when destroyOnHidden is false', async () => {
    const wrapper = mount(Dropdown, {
      props: {
        open: true,
        items,
        destroyOnHidden: false,
        contentClass: 'dropdown-destroy-test'
      },
      slots: {
        trigger: '<button>destroy</button>',
        item: '<button>item</button>'
      },
      attachTo: document.body
    })

    await flushFrame()
    await wrapper.setProps({ open: false })
    await nextTick()

    const menu = document.body.querySelector('.dropdown-destroy-test') as HTMLElement
    expect(menu).not.toBeNull()
    expect(menu.style.display).toBe('none')
    wrapper.unmount()
  })

  it('keeps popup anchored when trigger content resizes while open', async () => {
    let resizeCallback: ResizeObserverCallback | undefined
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          resizeCallback = callback
        }

        observe = vi.fn()
        unobserve = vi.fn()
        disconnect = vi.fn()
      }
    )

    const TestDropdown = defineComponent({
      components: { Dropdown },
      setup() {
        const selected = ref('short')
        const open = ref(false)
        return { items, selected, open }
      },
      template: `
        <Dropdown v-model:value="selected" v-model:open="open" :items="items" value-key="value" width="180px" content-class="dropdown-anchor-test">
          <template #trigger>
            <button>{{ selected }}</button>
          </template>
          <template #item="{ item }">
            <button>{{ item.label }}</button>
          </template>
        </Dropdown>
      `
    })

    const wrapper = mount(TestDropdown, { attachTo: document.body })
    const dropdownRoot = wrapper.findComponent(Dropdown).element
    let currentLeft = 100
    mockRect(dropdownRoot, () => ({
      left: currentLeft,
      right: currentLeft + 80,
      x: currentLeft
    }))

    wrapper.vm.open = true
    await wrapper.vm.$nextTick()
    await flushFrame()

    const menu = document.body.querySelector('.dropdown-anchor-test') as HTMLElement
    mockMenuSize(menu, { width: 180 })
    await flushFrame()
    expect(menu.style.left).toBe('100px')

    currentLeft = 180
    wrapper.vm.selected = 'long'
    await wrapper.vm.$nextTick()
    resizeCallback?.([] as ResizeObserverEntry[], {} as ResizeObserver)
    await flushFrame()

    expect(menu.style.left).toBe('100px')
    wrapper.unmount()
  })
})
