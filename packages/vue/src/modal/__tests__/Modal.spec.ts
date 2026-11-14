import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

import Modal from '../Modal.vue'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('Modal event boundary', () => {
  it('allows one internal drag gesture to reach window listeners without leaking pointerdown', async () => {
    const onPointerDown = vi.fn<(event: PointerEvent) => void>()
    const onPointerMove = vi.fn<(event: PointerEvent) => void>()
    const onPointerUp = vi.fn<(event: PointerEvent) => void>()
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    const wrapper = mount(Modal, {
      props: {
        visible: true
      },
      slots: {
        default: '<div data-ui-image-editor="true"><button data-test="drag-target">drag</button></div>'
      },
      attachTo: document.body
    })
    await wrapper.vm.$nextTick()
    const target = document.querySelector('[data-test="drag-target"]')!

    target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 }))
    target.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, buttons: 1, pointerId: 1 }))
    target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }))
    target.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, buttons: 1, pointerId: 1 }))

    expect(onPointerDown).not.toHaveBeenCalled()
    expect(onPointerMove).toHaveBeenCalledOnce()
    expect(onPointerUp).toHaveBeenCalledOnce()
    window.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    wrapper.unmount()
  })

  it('tracks pointer and mouse event families independently for third-party drag handlers', async () => {
    const onPointerMove = vi.fn<(event: PointerEvent) => void>()
    const onMouseMove = vi.fn<(event: MouseEvent) => void>()
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('mousemove', onMouseMove)
    const wrapper = mount(Modal, {
      props: {
        visible: true
      },
      slots: {
        default: '<div data-ui-table="true"><div data-test="scrollbar"><span data-test="thumb" /></div></div>'
      },
      attachTo: document.body
    })
    await wrapper.vm.$nextTick()
    const target = document.querySelector('[data-test="thumb"]')!

    target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 2 }))
    target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    target.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, buttons: 1, pointerId: 2 }))
    target.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, buttons: 1 }))
    target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 2 }))
    target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))

    expect(onPointerMove).toHaveBeenCalledOnce()
    expect(onMouseMove).toHaveBeenCalledOnce()
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('mousemove', onMouseMove)
    wrapper.unmount()
  })
})
