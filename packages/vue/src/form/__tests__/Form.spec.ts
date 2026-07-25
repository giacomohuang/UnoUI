import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, reactive, ref } from 'vue'

import { Button } from '../../button'
import { Input } from '../../input'
import { Switch } from '../../switch'
import { Tooltip } from '../../tooltip'
import Form from '../Form.vue'
import FormItem from '../FormItem.vue'
import { createFormRule, formItem, formItemContent, formItemLabel, formRoot, formValidatorPatterns } from '../index'

describe('Form', () => {
  it('exports layout classes aligned to shared ui tokens', () => {
    expect(formRoot({ inline: true })).toContain('flex')
    expect(formItem()).toContain('mb-[var(--ui-form-item-gap,16px)]')
    expect(formItem()).toContain('self-start')
    expect(formItem()).toContain('content-start')
    expect(formItem({ inline: true })).toContain('inline-flex')
    expect(formItem({ labelPosition: 'top' })).toContain('gap-1')
    expect(formItem({ inline: true, labelPosition: 'top' })).toContain('flex-col')
    expect(formItemContent()).toContain('justify-center')
    expect(formItemContent({ labelPosition: 'right', size: 'md' })).toContain('min-h-8.5')
    expect(formItemContent({ labelPosition: 'top', size: 'md' })).toContain('justify-center')
    expect(formItemContent({ labelPosition: 'top', size: 'md' })).toContain('min-h-8.5')
    expect(formItemContent({ labelPosition: 'top', size: 'md' })).not.toContain('min-h-0')
    expect(formItemContent({ labelPosition: 'top', size: 'md' })).not.toContain('justify-start')
    expect(formItemLabel({ required: true, requiredPosition: 'left' })).toContain("before:content-['*']")
    expect(formItemLabel({ labelPosition: 'right', size: 'md' })).toContain('py-1.5')
    expect(formItemLabel({ labelPosition: 'right', size: 'md' })).toContain('border-transparent')
    expect(formItemLabel({ labelPosition: 'right', size: 'md' })).toContain('items-center')
    expect(formItemLabel({ labelPosition: 'top', size: 'md' })).not.toContain('py-1.5')
    expect(formItemLabel({ labelPosition: 'top', size: 'md' })).not.toContain('items-center')
  })

  it('validates required and preset rules with async-validator', async () => {
    const wrapper = mount(
      defineComponent({
        components: { Form, FormItem, Input },
        setup() {
          const formRef = ref<InstanceType<typeof Form>>()
          const model = reactive({ email: '' })
          const rules = {
            email: [{ required: true, message: '请输入邮箱' }, createFormRule('email')]
          }
          return { formRef, model, rules }
        },
        template: `
          <Form ref="formRef" :model="model" :rules="rules">
            <FormItem prop="email" label="邮箱">
              <Input v-model="model.email" />
            </FormItem>
          </Form>
        `
      })
    )

    const form = wrapper.vm.$refs.formRef as InstanceType<typeof Form>
    expect(await form.validate()).toBe(false)
    expect(wrapper.text()).toContain('请输入邮箱')

    await wrapper.find('input').setValue('bad-email')
    expect(await form.validate()).toBe(false)
    expect(wrapper.text()).toContain(formValidatorPatterns.email.message)

    await wrapper.find('input').setValue('user@example.com')
    expect(await form.validate()).toBe(true)
  })

  it('resets fields and clears validation state', async () => {
    const wrapper = mount(
      defineComponent({
        components: { Button, Form, FormItem, Input },
        setup() {
          const formRef = ref<InstanceType<typeof Form>>()
          const model = reactive({ name: '入口' })
          const rules = { name: [{ required: true, message: '请输入名称' }] }
          return { formRef, model, rules }
        },
        template: `
          <Form ref="formRef" :model="model" :rules="rules">
            <FormItem prop="name" label="名称">
              <Input v-model="model.name" />
            </FormItem>
          </Form>
        `
      })
    )

    const form = wrapper.vm.$refs.formRef as InstanceType<typeof Form>
    await wrapper.find('input').setValue('')
    expect(await form.validate()).toBe(false)

    form.resetFields()
    await wrapper.vm.$nextTick()

    expect((wrapper.vm as unknown as { model: { name: string } }).model.name).toBe('入口')
    expect(wrapper.text()).not.toContain('请输入名称')
  })

  it('resets reactive array fields without cloning proxy values', async () => {
    const wrapper = mount(
      defineComponent({
        components: { Form, FormItem },
        setup() {
          const formRef = ref<InstanceType<typeof Form>>()
          const model = reactive({ modules: ['viewer', 'editor'] })
          return { formRef, model }
        },
        template: `
          <Form ref="formRef" :model="model">
            <FormItem prop="modules" label="模块">
              <div>{{ model.modules.join(',') }}</div>
            </FormItem>
          </Form>
        `
      })
    )

    const form = wrapper.vm.$refs.formRef as InstanceType<typeof Form>
    ;(wrapper.vm as unknown as { model: { modules: string[] } }).model.modules = ['audit']

    form.resetFields()
    await wrapper.vm.$nextTick()

    expect((wrapper.vm as unknown as { model: { modules: string[] } }).model.modules).toEqual(['viewer', 'editor'])

    ;(wrapper.vm as unknown as { model: { modules: string[] } }).model.modules.push('resource')
    form.resetFields()
    await wrapper.vm.$nextTick()

    expect((wrapper.vm as unknown as { model: { modules: string[] } }).model.modules).toEqual(['viewer', 'editor'])
  })

  it('validates a single field by prop', async () => {
    const wrapper = mount(
      defineComponent({
        components: { Form, FormItem, Input },
        setup() {
          const formRef = ref<InstanceType<typeof Form>>()
          const model = reactive({ name: '', code: '' })
          const rules = {
            name: [{ required: true, message: '请输入名称' }],
            code: [{ required: true, message: '请输入编码' }]
          }
          return { formRef, model, rules }
        },
        template: `
          <Form ref="formRef" :model="model" :rules="rules">
            <FormItem prop="name" label="名称"><Input v-model="model.name" /></FormItem>
            <FormItem prop="code" label="编码"><Input v-model="model.code" /></FormItem>
          </Form>
        `
      })
    )

    const form = wrapper.vm.$refs.formRef as InstanceType<typeof Form>
    expect(await form.validateField('code')).toBe(false)
    expect(wrapper.text()).toContain('请输入编码')
    expect(wrapper.text()).not.toContain('请输入名称')
  })

  it('validates direct controls on configured change and blur triggers', async () => {
    const wrapper = mount(
      defineComponent({
        components: { Form, FormItem, Input },
        setup() {
          const model = reactive({ name: '入口', code: 'CODE' })
          const rules = {
            name: [{ required: true, message: '请输入名称', trigger: 'change' }],
            code: [{ required: true, message: '请输入编码', trigger: 'blur' }]
          }
          return { model, rules }
        },
        template: `
          <Form :model="model" :rules="rules">
            <FormItem prop="name" label="名称"><Input v-model="model.name" /></FormItem>
            <FormItem prop="code" label="编码"><Input v-model="model.code" /></FormItem>
          </Form>
        `
      })
    )

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('')
    await flushPromises()
    expect(wrapper.text()).toContain('请输入名称')

    await inputs[1].setValue('')
    await flushPromises()
    expect(wrapper.text()).not.toContain('请输入编码')

    await inputs[1].trigger('blur')
    await flushPromises()
    expect(wrapper.text()).toContain('请输入编码')
  })

  it('supports submit-only validation with an empty form validate trigger', async () => {
    const wrapper = mount(
      defineComponent({
        components: { Form, FormItem, Input },
        setup() {
          const formRef = ref<InstanceType<typeof Form>>()
          const model = reactive({ name: '入口' })
          const rules = { name: [{ required: true, message: '请输入名称' }] }
          return { formRef, model, rules }
        },
        template: `
          <Form ref="formRef" :model="model" :rules="rules" :validate-trigger="[]">
            <FormItem prop="name" label="名称"><Input v-model="model.name" /></FormItem>
          </Form>
        `
      })
    )

    const input = wrapper.find('input')
    await input.setValue('')
    await input.trigger('blur')
    await flushPromises()
    expect(wrapper.text()).not.toContain('请输入名称')

    const form = wrapper.vm.$refs.formRef as InstanceType<typeof Form>
    expect(await form.validate()).toBe(false)
    expect(wrapper.text()).toContain('请输入名称')
  })

  it('lets FormItem override the form validate trigger', async () => {
    const wrapper = mount(
      defineComponent({
        components: { Form, FormItem, Input },
        setup() {
          const model = reactive({ name: '入口' })
          const rules = { name: [{ required: true, message: '请输入名称' }] }
          return { model, rules }
        },
        template: `
          <Form :model="model" :rules="rules" validate-trigger="change">
            <FormItem prop="name" label="名称" validate-trigger="blur"><Input v-model="model.name" /></FormItem>
          </Form>
        `
      })
    )

    const input = wrapper.find('input')
    await input.setValue('')
    await flushPromises()
    expect(wrapper.text()).not.toContain('请输入名称')

    await input.trigger('blur')
    await flushPromises()
    expect(wrapper.text()).toContain('请输入名称')
  })

  it('reserves empty label space only when requested', () => {
    const wrapper = mount(
      defineComponent({
        components: { Form, FormItem, Button },
        template: `
          <Form>
            <FormItem data-test="default-action">
              <Button>默认按钮</Button>
            </FormItem>
            <FormItem reserve-label-space data-test="reserved-action">
              <Button>对齐按钮</Button>
            </FormItem>
          </Form>
          <Form reserve-label-space>
            <FormItem :reserve-label-space="false" data-test="override-action">
              <Button>整行按钮</Button>
            </FormItem>
          </Form>
        `
      })
    )

    expect(wrapper.find('[data-test="default-action"] > [aria-hidden="true"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="default-action"] > :last-child').classes()).toContain('col-start-2')
    expect(wrapper.find('[data-test="reserved-action"] > [aria-hidden="true"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="reserved-action"] > :last-child').classes()).toContain('col-start-2')
    expect(wrapper.find('[data-test="override-action"] > [aria-hidden="true"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="override-action"] > :last-child').classes()).toContain('col-span-full')
  })

  it('aligns unlabeled actions with controls in inline top-label forms', () => {
    const wrapper = mount(
      defineComponent({
        components: { Form, FormItem, Button, Input },
        template: `
          <Form inline label-position="top">
            <FormItem label="关键词"><Input /></FormItem>
            <FormItem data-test="aligned-action"><Button>查询</Button></FormItem>
            <FormItem :reserve-label-space="false" data-test="unaligned-action"><Button>重置</Button></FormItem>
          </Form>
          <Form label-position="top">
            <FormItem data-test="block-action"><Button>提交</Button></FormItem>
          </Form>
        `
      })
    )

    const alignedAction = wrapper.find('[data-test="aligned-action"]')
    expect(alignedAction.classes()).toContain('flex-col')
    expect(alignedAction.find('[aria-hidden="true"]').classes()).toContain('h-[1lh]')
    expect(wrapper.find('[data-test="unaligned-action"] > [aria-hidden="true"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="block-action"] > [aria-hidden="true"]').exists()).toBe(false)
  })

  it('wraps long labels instead of truncating them', () => {
    const wrapper = mount(
      defineComponent({
        components: { Form, FormItem, Input },
        template: `
          <Form label-width="80px">
            <FormItem label="这是一个很长很长需要换行显示的字段标签">
              <Input />
            </FormItem>
          </Form>
        `
      })
    )

    const label = wrapper.find('label')
    const labelText = label.find('span')
    expect(label.classes()).toContain('whitespace-normal')
    expect(label.classes()).toContain('break-words')
    expect(labelText.classes()).not.toContain('truncate')
    expect(labelText.classes()).toContain('whitespace-normal')
    expect(labelText.classes()).toContain('break-words')
  })

  it('shows an accessible info tooltip beside the built-in label', async () => {
    const wrapper = mount(FormItem, {
      props: {
        label: '项目 ID',
        info: '用于接口调用的唯一标识'
      },
      slots: {
        default: '<input />'
      }
    })

    const tooltip = wrapper.findComponent(Tooltip)
    const icon = wrapper.find('[data-ui-form-item-info="true"]')

    expect(tooltip.props('title')).toBe('用于接口调用的唯一标识')
    expect(tooltip.props('trigger')).toEqual(['hover', 'focus'])
    expect(icon.attributes('role')).toBe('img')
    expect(icon.attributes('tabindex')).toBe('0')
    expect(icon.attributes('aria-label')).toBe('用于接口调用的唯一标识')

    await tooltip.find('[data-ui-tooltip-trigger="true"]').trigger('focusin')
    await wrapper.vm.$nextTick()

    expect(document.body.querySelector('[role="tooltip"]')?.textContent).toContain('用于接口调用的唯一标识')
    wrapper.unmount()
  })

  it('centers a top-label info icon within the first text line', () => {
    const wrapper = mount(FormItem, {
      props: {
        label: '领取后延迟生效',
        info: '领取后按配置时间生效',
        labelPosition: 'top'
      },
      slots: {
        default: '<input />'
      }
    })

    const infoWrapper = wrapper.find('[data-ui-form-item-info-wrapper="true"]')
    expect(infoWrapper.classes()).toContain('items-center')
    expect(infoWrapper.classes()).toContain('h-[1lh]')
    expect(infoWrapper.classes()).toContain('self-start')
  })

  it('uses the info slot for complex tooltip content without requiring the info prop', async () => {
    const wrapper = mount(FormItem, {
      props: {
        label: '自动发布'
      },
      slots: {
        default: '<input />',
        info: '<strong data-test="complex-info">审核通过后自动发布</strong>'
      }
    })

    const tooltip = wrapper.findComponent(Tooltip)
    const icon = wrapper.find('[data-ui-form-item-info="true"]')

    expect(tooltip.exists()).toBe(true)
    expect(icon.attributes('aria-label')).toBe('自动发布说明')

    await tooltip.find('[data-ui-tooltip-trigger="true"]').trigger('focusin')
    await wrapper.vm.$nextTick()

    expect(document.body.querySelector('[data-test="complex-info"]')?.textContent).toBe('审核通过后自动发布')
    wrapper.unmount()
  })

  it('centers compact controls like switches against the form label row', () => {
    const wrapper = mount(
      defineComponent({
        components: { Form, FormItem, Switch },
        setup() {
          const model = reactive({ enabled: true })
          return { model }
        },
        template: `
          <Form :model="model">
            <FormItem prop="enabled" label="状态">
              <Switch v-model="model.enabled" active-text="开" inactive-text="关" />
            </FormItem>
          </Form>
        `
      })
    )

    const content = wrapper.find('[id="ui-form-item-enabled-content"]')
    expect(content.classes()).toContain('flex')
    expect(content.classes()).toContain('justify-center')
    expect(content.classes()).toContain('min-h-8.5')
    expect(wrapper.findComponent(Switch).exists()).toBe(true)
  })

  it('keeps top-label compact controls on the same control baseline', () => {
    const wrapper = mount(
      defineComponent({
        components: { Form, FormItem, Switch },
        setup() {
          const model = reactive({ enabled: true })
          return { model }
        },
        template: `
          <Form :model="model" label-position="top">
            <FormItem prop="enabled" label="启用">
              <Switch v-model="model.enabled" />
            </FormItem>
          </Form>
        `
      })
    )

    const content = wrapper.find('[id="ui-form-item-enabled-content"]')
    expect(content.classes()).toContain('justify-center')
    expect(content.classes()).toContain('min-h-8.5')
    expect(content.classes()).not.toContain('min-h-0')
    expect(content.classes()).not.toContain('justify-start')
  })
})
