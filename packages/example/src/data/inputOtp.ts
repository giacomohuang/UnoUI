import type { ParamTableRow } from '@/components/ParamTable.vue'

export const inputOtpProps: ParamTableRow[] = [
  { name: 'modelValue', type: 'string | number', default: 'undefined', desc: '默认 v-model 绑定值' },
  { name: 'digits', type: 'number', default: '6', desc: '验证码位数' },
  { name: 'autofocus', type: 'boolean', default: 'false', desc: '挂载后是否自动聚焦第一格' },
  { name: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用输入' },
  { name: 'readonly', type: 'boolean', default: 'false', desc: '是否只读展示' },
  { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'`, desc: '输入格尺寸' },
  { name: 'gap', type: `'sm' | 'md' | 'lg'`, default: `'md'`, desc: '输入格间距' },
  { name: 'name', type: 'string', default: 'undefined', desc: '隐藏 input 的原生 name' },
  { name: 'autocomplete', type: 'string', default: `'off'`, desc: '原生 autocomplete 属性' },
  { name: 'ariaLabel', type: 'string', default: `'验证码'`, desc: '每个输入格的无障碍标签前缀' }
]

export const inputOtpEmits: ParamTableRow[] = [
  { name: 'update:modelValue', params: 'string', desc: '默认 v-model 值更新' },
  { name: 'input', params: '(value, event)', desc: '输入值变化时触发' },
  { name: 'change', params: '(value, event?)', desc: '提交后清空时触发' },
  { name: 'finish', params: '(callback: (success: boolean) => void)', desc: '验证码填满后触发，调用 callback(false) 会展示错误态' },
  { name: 'focus', params: 'FocusEvent', desc: '任一输入格获得焦点时触发' },
  { name: 'blur', params: 'FocusEvent', desc: '任一输入格失去焦点时触发' }
]

export const inputOtpExposes: ParamTableRow[] = [
  { name: 'focus', signature: '() => void', desc: '聚焦第一格输入框' },
  { name: 'blur', signature: '() => void', desc: '移除所有输入格焦点' },
  { name: 'clear', signature: '() => void', desc: '清空输入并聚焦第一格' }
]

export const inputOtpCodeExample = `<script setup lang="ts">
import { ref } from 'vue'
import { InputOtp } from '@unoui/vue/inputOtp'

const code = ref('')
const status = ref('等待输入')

function verifyCode(callback: (success: boolean) => void) {
  const success = code.value === '123456'
  status.value = success ? '验证通过' : '验证码错误'
  callback(success)
}
</script>

<template>
  <InputOtp
    v-model="code"
    :digits="6"
    autofocus
    autocomplete="one-time-code"
    @finish="verifyCode"
  />

  <span>{{ status }}</span>
</template>`
