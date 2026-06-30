import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import Drawer from '../Drawer.vue'

describe('Drawer', () => {
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
})
