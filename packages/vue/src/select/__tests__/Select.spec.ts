import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'

import Select from '../Select.vue'

const options = [
  { label: '按钮', value: 'button' },
  { label: '输入框', value: 'input' },
  { label: '禁用项', value: 'disabled', disabled: true }
]

function mockRect(element: Element, getRect: () => Partial<DOMRect>) {
  element.getBoundingClientRect = () =>
    ({
      left: 100,
      top: 80,
      width: 180,
      height: 32,
      right: 280,
      bottom: 112,
      x: 100,
      y: 80,
      toJSON: () => ({}),
      ...getRect()
    }) as DOMRect
}

async function flushFrame() {
  await new Promise((resolve) => requestAnimationFrame(resolve))
  await flushPromises()
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('Select', () => {
  it('renders selected label and clears value', async () => {
    const wrapper = mount(Select, {
      props: {
        modelValue: 'button',
        options,
        clearable: true
      },
      attachTo: document.body
    })

    expect(wrapper.text()).toContain('按钮')

    await wrapper.find('button[aria-label="清空"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([undefined])
    expect(wrapper.emitted('clear')).toHaveLength(1)
    wrapper.unmount()
  })

  it('uses full width dropdown wrapper to match Input in form layouts', () => {
    const wrapper = mount(Select, {
      props: {
        options
      },
      attachTo: document.body
    })

    expect(wrapper.classes()).toContain('w-full')
    expect(wrapper.classes()).toContain('min-w-0')
    expect(wrapper.find('[data-ui-select="true"]').classes()).toContain('w-full')
    wrapper.unmount()
  })

  it('supports explicit trigger width while the control fills its wrapper', () => {
    const wrapper = mount(Select, {
      props: {
        options,
        width: 240
      },
      attachTo: document.body
    })

    expect((wrapper.element as HTMLElement).style.width).toBe('240px')
    expect(wrapper.classes()).toContain('w-full')
    expect(wrapper.find('[data-ui-select="true"]').classes()).toContain('w-full')
    wrapper.unmount()
  })

  it('renders multiple selected tags', () => {
    const wrapper = mount(Select, {
      props: {
        modelValue: ['button', 'input'],
        options,
        multiple: true
      },
      attachTo: document.body
    })

    expect(wrapper.text()).toContain('按钮')
    expect(wrapper.text()).toContain('输入框')
    wrapper.unmount()
  })

  it('keeps selected option background when the dropdown active item is selected', async () => {
    const wrapper = mount(Select, {
      props: {
        modelValue: 'button',
        options
      },
      attachTo: document.body
    })

    await wrapper.find('[data-ui-select="true"]').trigger('click')
    await flushPromises()

    const selectedItem = document.body.querySelector('.ui-select-dropdown .dropdown-item-wrapper') as HTMLElement
    const selectedContent = selectedItem.firstElementChild as HTMLElement
    expect(selectedItem.classList).toContain('is-selected')
    expect(selectedItem.classList).toContain('is-active')
    expect(selectedItem.dataset.selected).toBe('true')
    expect(selectedContent.dataset.uiSelectOptionSelected).toBe('true')
    expect(selectedContent.className).toContain('bg-brand/20')
    expect(selectedContent.className).toContain('ring-brand/25')
    expect(selectedContent.className).not.toContain('hover:bg-secondary')
    wrapper.unmount()
  })

  it('keeps a visible keyboard highlight when every multiple option is selected', async () => {
    const wrapper = mount(Select, {
      props: {
        modelValue: ['button', 'input'],
        options,
        multiple: true
      },
      attachTo: document.body
    })

    const trigger = wrapper.find('[data-ui-select="true"]')
    await trigger.trigger('click')
    await flushPromises()
    await trigger.trigger('keydown', { key: 'ArrowDown', code: 'ArrowDown' })
    await flushPromises()

    const activeSelectedItem = document.body.querySelector('.ui-select-dropdown .dropdown-item-wrapper.is-active.is-selected') as HTMLElement
    const activeSelectedContent = activeSelectedItem.firstElementChild as HTMLElement
    expect(activeSelectedItem.dataset.selected).toBe('true')
    expect(activeSelectedContent.className).toContain('bg-brand/20')
    expect(activeSelectedContent.className).toContain('ring-brand/25')
    expect(activeSelectedContent.className).not.toContain('bg-secondary')
    wrapper.unmount()
  })

  it('renders one placeholder in empty filterable multiple mode', () => {
    const wrapper = mount(Select, {
      props: {
        options,
        multiple: true,
        filterable: true,
        placeholder: '请选择'
      },
      attachTo: document.body
    })

    expect(wrapper.text()).not.toContain('请选择')
    expect(wrapper.find('input').attributes('placeholder')).toBe('请选择')
    wrapper.unmount()
  })

  it('selects filtered option with arrow keys', async () => {
    const wrapper = mount(Select, {
      props: {
        options,
        filterable: true
      },
      attachTo: document.body
    })

    const input = wrapper.find('input')
    await input.trigger('focus')
    await input.setValue('输入')
    await input.trigger('keydown', { key: 'ArrowDown', code: 'ArrowDown' })
    await input.trigger('keydown', { key: 'Enter', code: 'Enter' })

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['input'])
    expect(document.body.querySelector('.ui-select-dropdown')).toBeNull()
    wrapper.unmount()
  })

  it('selects the first available filtered option and closes with Enter', async () => {
    const wrapper = mount(Select, {
      props: {
        options,
        filterable: true
      },
      attachTo: document.body
    })

    const input = wrapper.find('input')
    await input.trigger('focus')
    await input.setValue('按钮')
    await input.trigger('keydown', { key: 'Enter', code: 'Enter' })
    await flushPromises()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['button'])
    expect(document.body.querySelector('.ui-select-dropdown')).toBeNull()
    wrapper.unmount()
  })

  it('closes dropdown after selecting an option in single mode', async () => {
    const wrapper = mount(Select, {
      props: {
        options
      },
      attachTo: document.body
    })

    await wrapper.find('[data-ui-select="true"]').trigger('click')
    await flushPromises()
    expect(document.body.querySelector('.ui-select-dropdown')).not.toBeNull()

    const firstOption = document.body.querySelector('.dropdown-item-wrapper') as HTMLElement
    firstOption.click()
    await flushPromises()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['button'])
    expect(document.body.querySelector('.ui-select-dropdown')).toBeNull()
    wrapper.unmount()
  })

  it('keeps input focused when filterable dropdown opens', async () => {
    const wrapper = mount(Select, {
      props: {
        options,
        filterable: true
      },
      attachTo: document.body
    })

    const input = wrapper.find('input')
    input.element.focus()
    await input.trigger('focus')
    await flushPromises()

    expect(document.activeElement).toBe(input.element)
    wrapper.unmount()
  })

  it('focuses input and keeps dropdown open when clicking filterable trigger edge', async () => {
    const wrapper = mount(Select, {
      props: {
        options,
        filterable: true
      },
      attachTo: document.body
    })

    const trigger = wrapper.find('[data-ui-select="true"]')
    const input = wrapper.find('input')
    await trigger.trigger('click')
    await flushPromises()

    expect(document.activeElement).toBe(input.element)
    expect(document.body.querySelector('.ui-select-dropdown')).not.toBeNull()
    wrapper.unmount()
  })

  it('updates dropdown width after window resize', async () => {
    const wrapper = mount(Select, {
      props: {
        options
      },
      attachTo: document.body
    })
    let triggerWidth = 180
    const trigger = wrapper.find('[data-ui-select="true"]')
    mockRect(trigger.element, () => ({
      width: triggerWidth,
      right: 100 + triggerWidth
    }))

    await trigger.trigger('click')
    await flushFrame()

    const dropdown = document.body.querySelector('.ui-select-dropdown') as HTMLElement
    expect(dropdown.style.width).toBe('180px')

    triggerWidth = 260
    window.dispatchEvent(new Event('resize'))
    await flushFrame()

    expect(dropdown.style.width).toBe('260px')
    wrapper.unmount()
  })
})
