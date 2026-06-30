import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { tabTrigger, TabPane, Tabs } from '..'

describe('Tabs', () => {
  it('activates the first available pane by default', async () => {
    const wrapper = mount({
      components: { Tabs, TabPane },
      template: `
        <Tabs>
          <TabPane name="first" label="First">First content</TabPane>
          <TabPane name="second" label="Second">Second content</TabPane>
        </Tabs>
      `
    })

    await flushPromises()

    expect(wrapper.find('[role="tab"][aria-selected="true"]').text()).toContain('First')
    expect(wrapper.find('[role="tabpanel"]:not([style*="display: none"])').text()).toContain('First content')
  })

  it('updates model value and emits tab-change when clicking a tab', async () => {
    const wrapper = mount({
      components: { Tabs, TabPane },
      setup() {
        const active = ref('first')
        return { active }
      },
      template: `
        <Tabs v-model="active">
          <TabPane name="first" label="First">First content</TabPane>
          <TabPane name="second" label="Second">Second content</TabPane>
        </Tabs>
      `
    })

    await flushPromises()
    await wrapper.findAll('[role="tab"]')[1].trigger('click')
    await flushPromises()

    const tabs = wrapper.findComponent(Tabs)
    expect(wrapper.vm.active).toBe('second')
    expect(tabs.emitted('update:modelValue')?.[0]).toEqual(['second'])
    expect(tabs.emitted('tab-change')?.[0]).toEqual(['second'])
  })

  it('does not activate disabled panes', async () => {
    const wrapper = mount({
      components: { Tabs, TabPane },
      setup() {
        const active = ref('first')
        return { active }
      },
      template: `
        <Tabs v-model="active">
          <TabPane name="first" label="First">First content</TabPane>
          <TabPane name="second" label="Second" disabled>Second content</TabPane>
        </Tabs>
      `
    })

    await flushPromises()
    await wrapper.findAll('[role="tab"]')[1].trigger('click')
    await flushPromises()

    expect(wrapper.vm.active).toBe('first')
    expect(wrapper.findComponent(Tabs).emitted('update:modelValue')).toBeUndefined()
  })

  it('blocks switching when beforeLeave returns false', async () => {
    const beforeLeave = vi.fn(() => false)
    const wrapper = mount(Tabs, {
      props: {
        modelValue: 'first',
        beforeLeave
      },
      slots: {
        default: [
          h(TabPane, { name: 'first', label: 'First' }, () => 'First content'),
          h(TabPane, { name: 'second', label: 'Second' }, () => 'Second content')
        ]
      }
    })

    await flushPromises()
    await wrapper.findAll('[role="tab"]')[1].trigger('click')
    await flushPromises()

    expect(beforeLeave).toHaveBeenCalledWith('second', 'first')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('emits add, remove and edit events', async () => {
    const wrapper = mount(Tabs, {
      props: {
        modelValue: 'first',
        editable: true
      },
      slots: {
        default: [
          h(TabPane, { name: 'first', label: 'First' }, () => 'First content'),
          h(TabPane, { name: 'second', label: 'Second' }, () => 'Second content')
        ]
      }
    })

    await wrapper.find('button[aria-label="新增标签"]').trigger('click')
    await wrapper.find('button[aria-label="关闭标签 First"]').trigger('click')

    expect(wrapper.emitted('tab-add')).toHaveLength(1)
    expect(wrapper.emitted('tab-remove')?.[0]).toEqual(['first'])
    expect(wrapper.emitted('edit')?.[0]).toEqual([undefined, 'add'])
    expect(wrapper.emitted('edit')?.[1]).toEqual(['first', 'remove'])
  })

  it('renders lazy panes only after first activation', async () => {
    const LazyContent = defineComponent({
      name: 'LazyContent',
      setup() {
        return () => h('div', 'Lazy content')
      }
    })
    const wrapper = mount({
      components: { LazyContent, Tabs, TabPane },
      setup() {
        const active = ref('first')
        return { active }
      },
      template: `
        <Tabs v-model="active">
          <TabPane name="first" label="First">First content</TabPane>
          <TabPane name="lazy" label="Lazy" lazy><LazyContent /></TabPane>
        </Tabs>
      `
    })

    await flushPromises()
    expect(wrapper.findComponent(LazyContent).exists()).toBe(false)

    await wrapper.findAll('[role="tab"]')[1].trigger('click')
    await flushPromises()

    expect(wrapper.findComponent(LazyContent).exists()).toBe(true)
  })

  it('keeps card active trigger visually connected to content', () => {
    const className = tabTrigger({
      type: 'card',
      tabPosition: 'top',
      active: true,
      first: true,
      last: true
    })

    expect(className).toContain('border-medium')
    expect(className).toContain('border-b-0')
    expect(className).toContain('after:(content-empty absolute inset-x-0 -bottom-px h-px bg-primary)')
    expect(className).toContain('rounded-tl-md')
    expect(className).toContain('rounded-tr-md')
    expect(className).not.toContain('border-b-primary')
  })

  it('draws line active markers without changing trigger box metrics', () => {
    const top = tabTrigger({
      type: 'line',
      tabPosition: 'top',
      active: true
    })
    const left = tabTrigger({
      type: 'line',
      tabPosition: 'left',
      active: true
    })

    expect(top).toContain('after:(content-empty absolute inset-x-0 -bottom-px h-0.5 bg-brand-500)')
    expect(top).not.toContain('border-b-2')
    expect(left).toContain('after:(content-empty absolute inset-y-0 -right-px w-0.5 bg-brand-500)')
    expect(left).not.toContain('border-r-2')
  })

  it('keeps border-card active trigger bordered without overlapping the content seam', () => {
    const top = tabTrigger({
      type: 'border-card',
      tabPosition: 'top',
      active: true,
      first: true,
      last: true
    })
    const bottom = tabTrigger({
      type: 'border-card',
      tabPosition: 'bottom',
      active: true,
      first: true,
      last: true
    })
    const left = tabTrigger({
      type: 'border-card',
      tabPosition: 'left',
      active: true,
      first: true,
      last: true
    })
    const right = tabTrigger({
      type: 'border-card',
      tabPosition: 'right',
      active: true,
      first: true,
      last: true
    })

    expect(top).toContain('border-x')
    expect(top).toContain('border-y-0')
    expect(top).toContain('border-l-0')
    expect(top).not.toContain('border-r-0')
    expect(top).toContain('[--ui-tab-pl:calc(var(--ui-tab-px)+1px)]')
    expect(bottom).toContain('border-x')
    expect(bottom).toContain('border-y-0')
    expect(bottom).toContain('border-l-0')
    expect(bottom).not.toContain('border-r-0')
    expect(bottom).toContain('[--ui-tab-pl:calc(var(--ui-tab-px)+1px)]')
    expect(left).toContain('border-x-0')
    expect(left).toContain('border-y')
    expect(left).toContain('border-t-0')
    expect(left).not.toContain('border-b-0')
    expect(left).toContain('[--ui-tab-pl:calc(var(--ui-tab-px)+1px)]')
    expect(left).toContain('[--ui-tab-pr:calc(var(--ui-tab-px)+1px)]')
    expect(left).toContain('[--ui-tab-pt:calc(var(--ui-tab-py)+1px)]')
    expect(right).toContain('border-x-0')
    expect(right).toContain('border-y')
    expect(right).toContain('border-t-0')
    expect(right).not.toContain('border-b-0')
    expect(right).toContain('[--ui-tab-pl:calc(var(--ui-tab-px)+1px)]')
    expect(right).toContain('[--ui-tab-pr:calc(var(--ui-tab-px)+1px)]')
    expect(right).toContain('[--ui-tab-pt:calc(var(--ui-tab-py)+1px)]')
    expect(top).not.toContain('border-b-primary')
    expect(bottom).not.toContain('border-t-primary')
    expect(left).not.toContain('border-r-primary')
    expect(right).not.toContain('border-l-primary')
    expect(top).not.toContain('shadow')
  })

  it('only transitions text color changes on triggers', () => {
    const className = tabTrigger({
      type: 'border-card',
      tabPosition: 'right',
      active: true
    })

    expect(className).toContain('transition-[color]')
    expect(className).not.toContain('transition-colors')
    expect(className).not.toContain('transition-all')
  })

  it('keeps trigger width intrinsic when stretch is passed', async () => {
    const line = mount(Tabs, {
      props: {
        modelValue: 'first',
        stretch: true
      },
      slots: {
        default: [
          h(TabPane, { name: 'first', label: 'First' }, () => 'First content'),
          h(TabPane, { name: 'second', label: 'Second' }, () => 'Second content')
        ]
      }
    })
    const card = mount(Tabs, {
      props: {
        modelValue: 'first',
        type: 'card',
        stretch: true
      },
      slots: {
        default: [
          h(TabPane, { name: 'first', label: 'First' }, () => 'First content'),
          h(TabPane, { name: 'second', label: 'Second' }, () => 'Second content')
        ]
      }
    })
    const borderCard = mount(Tabs, {
      props: {
        modelValue: 'first',
        type: 'border-card',
        tabPosition: 'bottom',
        stretch: true
      },
      slots: {
        default: [
          h(TabPane, { name: 'first', label: 'First' }, () => 'First content'),
          h(TabPane, { name: 'second', label: 'Second' }, () => 'Second content')
        ]
      }
    })

    await flushPromises()

    expect(line.findAll('[role="tab"]')[0].classes()).not.toContain('flex-1')
    expect(card.findAll('[role="tab"]')[0].classes()).not.toContain('flex-1')
    expect(borderCard.findAll('[role="tab"]')[0].classes()).not.toContain('flex-1')
  })

  it('marks the last pane independently from the add button', async () => {
    const wrapper = mount(Tabs, {
      props: {
        modelValue: 'second',
        addable: true,
        type: 'border-card'
      },
      slots: {
        default: [
          h(TabPane, { name: 'first', label: 'First' }, () => 'First content'),
          h(TabPane, { name: 'second', label: 'Second' }, () => 'Second content')
        ]
      }
    })

    await flushPromises()

    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs[1].classes()).not.toContain('border-r-0')
    expect(wrapper.find('button[aria-label="新增标签"]').exists()).toBe(true)
  })
})
