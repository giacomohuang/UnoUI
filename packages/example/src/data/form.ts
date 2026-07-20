import type { ParamTableColumn, ParamTableRow } from '@/components/ParamTable.vue'

export const formRuleColumns: ParamTableColumn[] = [
  { key: 'name', title: '字段名', width: '150px' },
  { key: 'type', title: '类型', mono: true, width: '55%' },
  { key: 'desc', title: '说明' }
]

export const formTypeColumns: ParamTableColumn[] = [
  { key: 'name', title: '类型名', width: '220px' },
  { key: 'definition', title: '完整定义', mono: true, width: '55%' },
  { key: 'desc', title: '说明' }
]

export const formProps: ParamTableRow[] = [
  { name: 'model', type: 'Values', default: 'undefined', desc: '表单数据对象' },
  { name: 'rules', type: 'FormRules', default: 'undefined', desc: '表单验证规则对象，key 对应 model 字段' },
  { name: 'inline', type: 'boolean', default: 'false', desc: '是否行内表单模式' },
  { name: 'labelPosition', type: `'left' | 'right' | 'top'`, default: `'right'`, desc: '标签对齐方向' },
  { name: 'labelWidth', type: 'string | number', default: `'96px'`, desc: '标签宽度' },
  { name: 'reserveLabelSpace', type: 'boolean', default: 'true', desc: '无标签字段是否保留标签占位空间' },
  { name: 'itemGap', type: 'string | number', default: `'16px'`, desc: '表单项之间的间距' },
  { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'`, desc: '全局表单项尺寸' },
  { name: 'disabled', type: 'boolean', default: 'false', desc: '全局禁用' },
  { name: 'showMessage', type: 'boolean', default: 'true', desc: '是否显示校验消息' },
  { name: 'validateTrigger', type: `FormValidateTrigger | FormValidateTrigger[]`, default: `['change', 'blur']`, desc: '字段默认自动校验时机；传空数组时仅显式 validate() 校验' },
  { name: 'validateOnRuleChange', type: 'boolean', default: 'true', desc: '规则变化时是否触发校验' },
  { name: 'requireAsteriskPosition', type: `'left' | 'right'`, default: `'left'`, desc: '必填星号位置' },
  { name: 'hideRequiredAsterisk', type: 'boolean', default: 'false', desc: '是否隐藏必填星号' }
]

export const formEmits: ParamTableRow[] = [
  { name: 'validate', params: '(prop, valid, message)', desc: '任意字段校验完成后触发' },
  { name: 'submit', params: 'Event', desc: '表单提交事件（需 <form> 嵌套）' },
  { name: 'reset', params: 'Event', desc: '表单重置事件（需 <form> 嵌套）' }
]

export const formSlots: ParamTableRow[] = [
  { name: 'default', scoped: '—', desc: '表单主体内容，应包含 FormItem 子组件' }
]

export const formItemProps: ParamTableRow[] = [
  { name: 'prop', type: 'string | string[]', default: 'undefined', desc: '对应 model 中的字段路径，支持 "." 嵌套' },
  { name: 'label', type: 'string', default: `''`, desc: '标签文本' },
  { name: 'info', type: 'string', default: `''`, desc: '显示在标签旁的悬浮信息提示' },
  { name: 'rules', type: 'FormRule | FormRule[]', default: 'undefined', desc: '当前字段的校验规则，会与 Form.rules 合并' },
  { name: 'required', type: 'boolean', default: 'undefined', desc: '是否必填（优先级高于 rules 中的 required）' },
  { name: 'error', type: 'string', default: `''`, desc: '手动设置错误信息' },
  { name: 'validateStatus', type: `'' | 'success' | 'error' | 'validating'`, default: `''`, desc: '手动设置校验状态' },
  { name: 'showMessage', type: 'boolean', default: 'undefined', desc: '是否显示校验消息（继承 Form）' },
  { name: 'validateTrigger', type: `FormValidateTrigger | FormValidateTrigger[]`, default: 'undefined', desc: '当前字段自动校验时机（继承 Form）；传空数组时仅显式校验' },
  { name: 'labelWidth', type: 'string | number', default: 'undefined', desc: '自定义标签宽度（覆盖 Form）' },
  { name: 'reserveLabelSpace', type: 'boolean', default: 'undefined', desc: '无标签时是否保留占位（继承 Form）' },
  { name: 'labelPosition', type: `'left' | 'right' | 'top'`, default: 'undefined', desc: '自定义标签位置（覆盖 Form）' },
  { name: 'size', type: `'sm' | 'md' | 'lg'`, default: 'undefined', desc: '自定义表单项尺寸（覆盖 Form）' }
]

export const formItemSlots: ParamTableRow[] = [
  { name: 'default', scoped: '{ validate, validateState, validateMessage }', desc: '表单控件区域' },
  { name: 'label', scoped: '{ label }', desc: '自定义标签内容' },
  { name: 'info', scoped: '—', desc: '自定义标签旁 Tooltip 的复杂内容' },
  { name: 'error', scoped: '{ error, validateState }', desc: '自定义错误提示区域' }
]

export const formRuleFields: ParamTableRow[] = [
  { name: 'type', type: `'string' | 'number' | 'boolean' | 'method' | 'regexp' | 'integer' | 'float' | 'array' | 'object' | 'enum' | 'date' | 'url' | 'hex' | 'email' | 'pattern' | 'any'`, desc: '期望的数据类型' },
  { name: 'required', type: 'boolean', desc: '是否必填' },
  { name: 'pattern', type: 'RegExp | string', desc: '值必须匹配的正则表达式' },
  { name: 'min', type: 'number', desc: '字符串或数组的最小长度，或数字的最小值' },
  { name: 'max', type: 'number', desc: '字符串或数组的最大长度，或数字的最大值' },
  { name: 'len', type: 'number', desc: '字符串或数组的精确长度，或数字的精确值' },
  { name: 'enum', type: 'Array<string | number | boolean | null | undefined>', desc: 'type 为 enum 时允许的值列表' },
  { name: 'whitespace', type: 'boolean', desc: '字符串是否禁止仅包含空白字符' },
  { name: 'fields', type: 'Record<string, RuleItem | RuleItem[]>', desc: 'object 或 array 子字段的 async-validator 规则' },
  { name: 'defaultField', type: 'RuleItem | RuleItem[]', desc: 'array 或 object 中未单独声明子字段时使用的规则' },
  { name: 'options', type: 'ValidateOption', desc: '传给 async-validator 的规则级校验选项' },
  { name: 'transform', type: '(value: any) => any', desc: '校验前转换当前值' },
  { name: 'message', type: 'string | ((value?: string) => string)', desc: '规则校验失败时的提示信息' },
  { name: 'validator', type: '(rule, value, callback, source, options) => boolean | Error | string | Array<Error | string> | void', desc: '自定义同步校验器；也可通过 callback 返回错误' },
  { name: 'asyncValidator', type: '(rule, value, callback, source, options) => void | Promise<void>', desc: '自定义异步校验器' },
  { name: 'trigger', type: 'FormValidateTrigger | FormValidateTrigger[]', desc: '该规则参与自动校验的触发时机；显式 validate() 不受此项限制' },
  { name: 'preset', type: 'FormRulePreset', desc: '使用 UnoUI 内置正则；同一规则显式提供的 pattern 或 message 会覆盖 preset 默认值' }
]

export const formTypes: ParamTableRow[] = [
  { name: 'Values', definition: 'Record<string, any>', desc: 'async-validator 使用的表单数据对象' },
  { name: 'FormValidateTrigger', definition: `'blur' | 'change' | (string & {})`, desc: '内置 blur、change，并允许控件提供自定义字符串触发器' },
  { name: 'FormValidateTrigger | FormValidateTrigger[]', definition: `('blur' | 'change' | (string & {})) | Array<'blur' | 'change' | (string & {})>`, desc: '可传一个触发时机或多个触发时机；传 [] 表示关闭自动校验' },
  { name: 'FormRulePreset', definition: `'email' | 'phoneCN' | 'url' | 'ipv4' | 'idCardCN' | 'postalCodeCN' | 'integer' | 'positiveInteger' | 'number' | 'decimal2' | 'alpha' | 'alphaNum' | 'projectId' | 'slug' | 'hexColor' | 'chinese' | 'password'`, desc: 'UnoUI 当前提供的内置正则名称' },
  { name: 'FormItemRule', definition: 'FormRule | FormRule[]', desc: '单条字段规则或按顺序执行的规则数组' },
  { name: 'FormRules<T>', definition: 'Partial<Record<keyof T | string, FormItemRule>>', desc: '表单级规则对象；key 对应 model 字段或嵌套字段路径' },
  { name: 'FormProp', definition: 'string | string[]', desc: '字段路径；可使用 "user.name" 或 ["user", "name"]' },
  { name: 'FormValidateStatus', definition: `'' | 'validating' | 'success' | 'error'`, desc: '字段当前校验状态' }
]

export const formCodeExample = `<script setup>
import { ref } from 'vue'
import { Form, FormItem, createFormRule } from '@mcistudio/unoui-vue/form'
import { Input } from '@mcistudio/unoui-vue/input'
import { Button } from '@mcistudio/unoui-vue/button'

interface FormModel {
  name: string
  email: string
}

const formRef = ref<InstanceType<typeof Form>>()
const model = ref<FormModel>({ name: '', email: '' })

const rules = {
  name: [{ required: true, message: '请输入名称' }],
  email: [
    { required: true, message: '请输入邮箱' },
    createFormRule('email', { message: '邮箱格式不正确' })
  ]
}

async function handleSubmit() {
  const valid = await formRef.value?.validate()
  if (valid) {
    console.log('提交数据:', model.value)
  }
}
</script>

<template>
  <Form ref="formRef" :model="model" :rules="rules" label-width="80px">
    <FormItem label="名称" prop="name" info="用于展示项目的名称">
      <Input v-model="model.name" placeholder="请输入名称" />
    </FormItem>
    <FormItem label="邮箱" prop="email">
      <template #info>
        <span>用于接收<strong>项目告警</strong>与审核通知</span>
      </template>
      <Input v-model="model.email" placeholder="请输入邮箱" />
    </FormItem>
    <FormItem>
      <Button @click="handleSubmit">提交</Button>
    </FormItem>
  </Form>
</template>`
