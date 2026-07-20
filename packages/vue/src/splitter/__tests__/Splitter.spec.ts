import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h, ref } from 'vue'

import { Splitter, SplitterPanel, type SplitterSize } from '..'

function mockSplitterRect(element: Element, rect: Partial<DOMRect> = {}) {
  element.getBoundingClientRect = () =>
    ({
      left: 0,
      top: 0,
      width: 500,
      height: 400,
      right: 500,
      bottom: 400,
      x: 0,
      y: 0,
      toJSON: () => ({}),
      ...rect
    }) as DOMRect
}

function createPointerEvent(type: string, init: PointerEventInit) {
  if (typeof PointerEvent === 'function') return new PointerEvent(type, init)
  return new MouseEvent(type, init) as PointerEvent
}

async function dispatchPointer(element: Element | Window, type: string, init: PointerEventInit) {
  element.dispatchEvent(createPointerEvent(type, init))
  await Promise.resolve()
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('Splitter', () => {
  it('renders default panel sizes and updates adjacent panels while dragging', async () => {
    const wrapper = mount(Splitter, {
      props: {
        defaultValue: ['40%', '60%']
      },
      slots: {
        default: [h(SplitterPanel, null, () => 'First'), h(SplitterPanel, null, () => 'Second')]
      },
      attachTo: document.body
    })
    const root = wrapper.find('[data-ui-splitter="true"]')
    const dragger = wrapper.find('[role="separator"]')
    mockSplitterRect(root.element)

    expect(wrapper.findAll('[data-ui-splitter-panel="true"]')[0].attributes('style')).toContain('width: 40%')

    await dispatchPointer(dragger.element, 'pointerdown', { button: 0, pointerId: 1, clientX: 200, clientY: 20 })
    await dispatchPointer(window, 'pointermove', { pointerId: 1, clientX: 250, clientY: 20 })
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('[data-ui-splitter-panel="true"]')[0].attributes('style')).toContain('width: 50%')
    expect(wrapper.emitted('resize-start')?.[0]).toEqual([[200, 300]])
    expect(wrapper.emitted('resize')?.at(-1)).toEqual([[250, 250]])

    await dispatchPointer(window, 'pointerup', { pointerId: 1, clientX: 250, clientY: 20 })
    expect(wrapper.emitted('resize-end')?.at(-1)).toEqual([[250, 250]])
  })

  it('clamps drag updates to panel min and max sizes', async () => {
    const wrapper = mount(Splitter, {
      props: {
        defaultValue: ['40%', '60%']
      },
      slots: {
        default: [h(SplitterPanel, { min: '20%', max: '70%' }, () => 'First'), h(SplitterPanel, { min: '30%' }, () => 'Second')]
      },
      attachTo: document.body
    })
    const root = wrapper.find('[data-ui-splitter="true"]')
    mockSplitterRect(root.element)

    await dispatchPointer(wrapper.find('[role="separator"]').element, 'pointerdown', { button: 0, pointerId: 2, clientX: 200 })
    await dispatchPointer(window, 'pointermove', { pointerId: 2, clientX: 480 })
    await dispatchPointer(window, 'pointerup', { pointerId: 2, clientX: 480 })
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('resize')?.at(-1)).toEqual([[350, 150]])
    expect(wrapper.findAll('[data-ui-splitter-panel="true"]')[0].attributes('style')).toContain('width: 70%')
  })

  it('defers panel updates until pointerup in lazy mode', async () => {
    const wrapper = mount(Splitter, {
      props: {
        defaultValue: ['40%', '60%'],
        lazy: true
      },
      slots: {
        default: [h(SplitterPanel, null, () => 'First'), h(SplitterPanel, null, () => 'Second')]
      },
      attachTo: document.body
    })
    const root = wrapper.find('[data-ui-splitter="true"]')
    mockSplitterRect(root.element)

    await dispatchPointer(wrapper.find('[role="separator"]').element, 'pointerdown', { button: 0, pointerId: 3, clientX: 200 })
    await dispatchPointer(window, 'pointermove', { pointerId: 3, clientX: 250 })
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('[data-ui-splitter-panel="true"]')[0].attributes('style')).toContain('width: 40%')
    expect(wrapper.find('[data-ui-splitter-preview="true"]').attributes('style')).toContain('calc(50% + 50px)')
    expect(wrapper.emitted('resize')).toBeUndefined()

    await dispatchPointer(window, 'pointerup', { pointerId: 3, clientX: 250 })
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('[data-ui-splitter-panel="true"]')[0].attributes('style')).toContain('width: 50%')
    expect(wrapper.emitted('resize')?.at(-1)).toEqual([[250, 250]])
  })

  it('supports vertical keyboard resizing and separator aria values', async () => {
    const wrapper = mount(Splitter, {
      props: {
        orientation: 'vertical',
        defaultValue: ['30%', '70%'],
        keyboardStep: 20
      },
      slots: {
        default: [h(SplitterPanel, { min: '20%' }, () => 'Top'), h(SplitterPanel, null, () => 'Bottom')]
      },
      attachTo: document.body
    })
    const root = wrapper.find('[data-ui-splitter="true"]')
    const dragger = wrapper.find('[role="separator"]')
    mockSplitterRect(root.element)

    await dragger.trigger('keydown', { key: 'ArrowDown' })
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('resize')?.at(-1)).toEqual([[140, 260]])
    expect(wrapper.findAll('[data-ui-splitter-panel="true"]')[0].attributes('style')).toContain('height: 35%')
    expect(dragger.attributes('aria-orientation')).toBe('horizontal')
    expect(dragger.attributes('aria-controls')).toContain('panel-0')
  })

  it('collapses, destroys and restores panel content', async () => {
    const wrapper = mount(Splitter, {
      props: {
        defaultValue: ['30%', '70%'],
        destroyOnHidden: true,
        collapsible: { motion: true }
      },
      slots: {
        default: [h(SplitterPanel, { collapsible: true }, () => h('span', { 'data-test': 'first-content' }, 'First')), h(SplitterPanel, null, () => 'Second')]
      },
      attachTo: document.body
    })
    const root = wrapper.find('[data-ui-splitter="true"]')
    mockSplitterRect(root.element)
    const collapseButton = wrapper.find('[data-ui-splitter-collapse="previous"]')

    await collapseButton.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-test="first-content"]').exists()).toBe(false)
    expect(wrapper.find('[data-ui-splitter-bar="true"]').attributes('style')).toContain('transition: left 180ms ease')
    expect(wrapper.emitted('collapse')?.[0]).toEqual([
      [true, false],
      [0, 500]
    ])
    expect(collapseButton.attributes('aria-label')).toBe('展开前一面板')

    await collapseButton.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-test="first-content"]').exists()).toBe(true)
    expect(wrapper.emitted('collapse')?.[1]).toEqual([
      [false, false],
      [150, 350]
    ])
  })

  it('updates a local v-model and supports exposed reset/getSizes methods', async () => {
    const wrapper = mount(
      {
        components: { Splitter, SplitterPanel },
        setup() {
          const sizes = ref<SplitterSize[]>(['40%', '60%'])
          const splitterRef = ref<InstanceType<typeof Splitter> | null>(null)
          return { sizes, splitterRef }
        },
        template: `
          <Splitter ref="splitterRef" v-model="sizes" :default-value="['30%', '70%']">
            <SplitterPanel>First</SplitterPanel>
            <SplitterPanel>Second</SplitterPanel>
          </Splitter>
        `
      },
      { attachTo: document.body }
    )
    const root = wrapper.find('[data-ui-splitter="true"]')
    mockSplitterRect(root.element)

    await dispatchPointer(wrapper.find('[role="separator"]').element, 'pointerdown', { button: 0, pointerId: 4, clientX: 200 })
    await dispatchPointer(window, 'pointermove', { pointerId: 4, clientX: 250 })
    await dispatchPointer(window, 'pointerup', { pointerId: 4, clientX: 250 })
    await flushPromises()

    expect(wrapper.vm.sizes).toEqual([250, 250])
    expect(wrapper.vm.splitterRef?.getSizes()).toEqual([250, 250])

    wrapper.vm.splitterRef?.reset()
    await flushPromises()
    expect(wrapper.vm.sizes).toEqual([150, 350])
  })

  it('disables the separator when either adjacent panel is not resizable', async () => {
    const wrapper = mount(Splitter, {
      props: {
        defaultValue: ['50%', '50%']
      },
      slots: {
        default: [h(SplitterPanel, { resizable: false }, () => 'First'), h(SplitterPanel, null, () => 'Second')]
      },
      attachTo: document.body
    })
    const root = wrapper.find('[data-ui-splitter="true"]')
    const dragger = wrapper.find('[role="separator"]')
    mockSplitterRect(root.element)

    expect(dragger.attributes('aria-disabled')).toBe('true')
    expect(dragger.attributes('tabindex')).toBe('-1')

    await dispatchPointer(dragger.element, 'pointerdown', { button: 0, pointerId: 5, clientX: 250 })
    await dispatchPointer(window, 'pointermove', { pointerId: 5, clientX: 300 })

    expect(wrapper.emitted('resize')).toBeUndefined()
  })
})
