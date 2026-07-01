import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, reactive, ref } from 'vue'

import { Button } from '../../button'
import { Input } from '../../input'
import { Switch } from '../../switch'
import Form from '../Form.vue'
import FormItem from '../FormItem.vue'
import { createFormRule, formItem, formItemContent, formItemLabel, formRoot, formValidatorPatterns } from '../index'

describe('Form', () => {
  it('exports layout classes aligned to shared ui tokens', () => {
    expect(formRoot({ inline: true })).toContain('flex')
    expect(formItem()).toContain('mb-[var(--ui-form-item-gap,16px)]')
    expect(formItem({ inline: true })).toContain('inline-flex')
    expect(formItemContent()).toContain('justify-center')
    expect(formItemLabel({ required: true, requiredPosition: 'left' })).toContain("before:content-['*']")
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
    expect(content.classes()).toContain('min-h-[calc(2rem+3px)]')
    expect(wrapper.findComponent(Switch).exists()).toBe(true)
  })
})
