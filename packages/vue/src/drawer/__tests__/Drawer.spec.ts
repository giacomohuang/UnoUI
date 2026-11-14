import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

import Drawer from '../Drawer.vue'

describe('Drawer', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders title and emits close updates from close button', async () => {
    const wrapper = mount(Drawer, {
      props: {
        modelValue: true,
        title: '抽屉标题'
      },
      attachTo: document.body
    })

    expect(document.body.textContent).toContain('抽屉标题')
    const closeButton = document.body.querySelector('button[aria-label="关闭"]') as HTMLButtonElement
    closeButton.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    wrapper.unmount()
  })

  it('supports top and bottom directions with height size', () => {
    const wrapper = mount(Drawer, {
      props: {
        modelValue: true,
        direction: 'btt',
        size: 320
      },
      attachTo: document.body
    })
    const drawer = document.body.querySelector('[data-ui-drawer="true"]') as HTMLElement

    expect(drawer.style.height).toBe('320px')
    wrapper.unmount()
  })

  it('allows an internal drag gesture while still blocking its initial pointerdown', async () => {
    const onPointerDown = vi.fn<(event: PointerEvent) => void>()
    const onPointerMove = vi.fn<(event: PointerEvent) => void>()
    const onPointerUp = vi.fn<(event: PointerEvent) => void>()
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    const wrapper = mount(Drawer, {
      props: {
        modelValue: true
      },
      slots: {
        default: '<div data-ui-image-editor="true"><button data-test="drag-target">drag</button></div>'
      },
      attachTo: document.body
    })
    await wrapper.vm.$nextTick()
    const target = document.querySelector('[data-test="drag-target"]')!

    target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 3 }))
    target.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, buttons: 1, pointerId: 3 }))
    target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 3 }))

    expect(onPointerDown).not.toHaveBeenCalled()
    expect(onPointerMove).toHaveBeenCalledOnce()
    expect(onPointerUp).toHaveBeenCalledOnce()
    window.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    wrapper.unmount()
  })

  it('pushes the parent drawer when a nested drawer opens', async () => {
    const wrapper = mount(
      {
        components: { Drawer },
        data: () => ({
          parentVisible: true,
          childVisible: true
        }),
        template: `
          <Drawer v-model="parentVisible" title="父级抽屉">
            <Drawer v-model="childVisible" title="子级抽屉" />
          </Drawer>
        `
      },
      { attachTo: document.body }
    )
    await wrapper.vm.$nextTick()

    const [parentDrawer] = document.body.querySelectorAll<HTMLElement>('[data-ui-drawer="true"]')
    expect(parentDrawer.style.transform).toBe('translateX(-180px)')

    await wrapper.setData({ childVisible: false })
    expect(parentDrawer.style.transform).toBe('')
    wrapper.unmount()
  })

  it('supports a custom nested drawer push distance', async () => {
    const wrapper = mount(
      {
        components: { Drawer },
        template: `
          <Drawer :model-value="true" title="父级抽屉" :push="{ distance: '96px' }">
            <Drawer :model-value="true" title="子级抽屉" />
          </Drawer>
        `
      },
      { attachTo: document.body }
    )
    await wrapper.vm.$nextTick()

    const [parentDrawer] = document.body.querySelectorAll<HTMLElement>('[data-ui-drawer="true"]')
    expect(parentDrawer.style.transform).toBe('translateX(-96px)')
    wrapper.unmount()
  })

  it('does not push the parent drawer when push is disabled', async () => {
    const wrapper = mount(
      {
        components: { Drawer },
        template: `
          <Drawer :model-value="true" title="父级抽屉" :push="false">
            <Drawer :model-value="true" title="子级抽屉" />
          </Drawer>
        `
      },
      { attachTo: document.body }
    )
    await wrapper.vm.$nextTick()

    const [parentDrawer] = document.body.querySelectorAll<HTMLElement>('[data-ui-drawer="true"]')
    expect(parentDrawer.style.transform).toBe('')
    wrapper.unmount()
  })

  it('pushes vertical drawers along the drawer direction', async () => {
    const wrapper = mount(
      {
        components: { Drawer },
        template: `
          <Drawer :model-value="true" title="父级抽屉" direction="btt">
            <Drawer :model-value="true" title="子级抽屉" />
          </Drawer>
        `
      },
      { attachTo: document.body }
    )
    await wrapper.vm.$nextTick()

    const [parentDrawer] = document.body.querySelectorAll<HTMLElement>('[data-ui-drawer="true"]')
    expect(parentDrawer.style.transform).toBe('translateY(-180px)')
    wrapper.unmount()
  })
})
