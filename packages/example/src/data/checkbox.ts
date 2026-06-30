import type { ParamTableRow } from '@/components/ParamTable.vue'

export const checkboxProps: ParamTableRow[] = [
  { name: 'modelValue', type: `boolean | (string | number)[]`, default: 'undefined', desc: '受控选中状态，复选框组传数组' },
  { name: 'checked', type: 'boolean', default: 'undefined', desc: '非受控选中状态（与 modelValue 二选一）' },
  { name: 'value', type: 'string | number', default: 'undefined', desc: '复选框组的选项值，单个复选框不需要' },
  { name: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
  { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'`, desc: '复选框尺寸' }
]

export const checkboxEmits: ParamTableRow[] = [
  { name: 'update:modelValue', params: `boolean | (string | number)[]`, desc: '受控值更新' },
  { name: 'change', params: `boolean | (string | number)[]`, desc: '选中状态改变时触发' },
  { name: 'input', params: `boolean | (string | number)[]`, desc: '输入值改变时触发' },
  { name: 'focus', params: 'FocusEvent', desc: '获得焦点时触发' },
  { name: 'blur', params: 'FocusEvent', desc: '失去焦点时触发' }
]

export const checkboxSlots: ParamTableRow[] = []

export const checkboxCodeExample = `<script setup>
import { ref } from 'vue'
import { Checkbox } from '@unoui/vue/checkbox'

const checked = ref(true)
const fruits = ref(['apple', 'orange'])
</script>

<template>
  <!-- 单个复选框 -->
  <Checkbox v-model="checked">同意协议</Checkbox>

  <!-- 复选框组 -->
  <Checkbox v-model="fruits" value="apple" size="md">苹果</Checkbox>
  <Checkbox v-model="fruits" value="orange" size="md">橙子</Checkbox>
  <Checkbox v-model="fruits" value="banana" size="md" disabled>香蕉</Checkbox>

  <!-- 不同尺寸 -->
  <Checkbox size="sm">小号</Checkbox>
  <Checkbox size="md">中号</Checkbox>
  <Checkbox size="lg">大号</Checkbox>

  <!-- 禁用 -->
  <Checkbox v-model="checked" disabled>禁用选项</Checkbox>
</template>`
