import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import MessageContainer from '../MessageContainer.vue'

describe('MessageContainer', () => {
  it('adds and closes a message', async () => {
    const onClose = vi.fn()
    const wrapper = mount(MessageContainer)

    const handler = wrapper.vm.add({
      message: '保存成功',
      type: 'success',
      duration: 0,
      showClose: true,
      onClose
    })
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('保存成功')
    handler.close()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).not.toContain('保存成功')
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
