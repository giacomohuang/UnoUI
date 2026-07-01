import type { ParamTableRow } from '@/components/ParamTable.vue'

export const checkboxProps: ParamTableRow[] = [
  { name: 'modelValue', type: `boolean | (string | number)[]`, default: 'undefined', desc: '受控选中状态，复选框组传数组' },
  { name: 'checked', type: 'boolean', default: 'undefined', desc: '非受控选中状态（与 modelValue 二选一）' },
  { name: 'indeterminate', type: 'boolean', default: 'false', desc: '部分选中状态，只控制视觉和原生 input 中间态' },
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

export const checkboxSlots: ParamTableRow[] = [{ name: 'default', scoped: '—', desc: '选择框后的内容，点击内容会切换复选框' }]

export const checkboxCodeExample = `<script setup>
import { computed, ref } from 'vue'
import { Checkbox } from '@unoui/vue/checkbox'

const checked = ref(true)
const fruits = ref(['apple', 'orange'])
const allFruits = ['apple', 'orange', 'banana']
const checkAll = computed(() => allFruits.every((fruit) => fruits.value.includes(fruit)))
const indeterminate = computed(() => fruits.value.length > 0 && !checkAll.value)

function toggleAll(event) {
  fruits.value = event.target.checked ? [...allFruits] : []
}
</script>

<template>
  <!-- 单个复选框 -->
  <Checkbox v-model="checked">同意协议</Checkbox>

  <!-- 复选框组 -->
  <Checkbox v-model="fruits" value="apple" size="md">苹果</Checkbox>
  <Checkbox v-model="fruits" value="orange" size="md">橙子</Checkbox>
  <Checkbox v-model="fruits" value="banana" size="md">香蕉</Checkbox>

  <!-- 不含禁用项的全选/部分选择 -->
  <Checkbox :checked="checkAll" :indeterminate="indeterminate" @change="toggleAll">
    全选
  </Checkbox>

  <!-- 不同尺寸 -->
  <Checkbox size="sm">小号</Checkbox>
  <Checkbox size="md">中号</Checkbox>
  <Checkbox size="lg">大号</Checkbox>

  <!-- 禁用 -->
  <Checkbox v-model="checked" disabled>禁用选项</Checkbox>
</template>`
