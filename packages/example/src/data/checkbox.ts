import type { ParamTableRow } from '@/components/ParamTable.vue'

export const checkboxProps: ParamTableRow[] = [
  { name: 'checked', type: 'boolean', default: 'undefined', desc: '单个非受控 Checkbox 的默认选中态' },
  { name: 'indeterminate', type: 'boolean', default: 'false', desc: '部分选中状态，只控制视觉和原生 input 中间态' },
  { name: 'value', type: 'string | number', default: 'undefined', desc: '当前选项代表值，选中时同步到 CheckboxGroup modelValue' },
  { name: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用当前选项' },
  { name: 'size', type: `'sm' | 'md' | 'lg'`, default: '继承 CheckboxGroup', desc: '当前选项尺寸，未传时继承组级设置' },
  { name: 'name', type: 'string', default: '继承 CheckboxGroup', desc: '当前选项原生 name' }
]

export const checkboxGroupProps: ParamTableRow[] = [
  { name: 'modelValue', type: `(string | number)[]`, default: '[]', desc: '组内当前选中值数组，使用 v-model 绑定' },
  { name: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用整组' },
  { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'`, desc: '组内默认尺寸' },
  { name: 'name', type: 'string', default: 'undefined', desc: '组内原生 checkbox name' },
  { name: 'direction', type: `'horizontal' | 'vertical'`, default: `'horizontal'`, desc: '组内排列方向' }
]

export const checkboxEmits: ParamTableRow[] = [
  { name: 'change', params: 'checked, Event', desc: '当前选项选中状态改变时触发' },
  { name: 'input', params: 'Event', desc: '原生 input 事件透传' },
  { name: 'focus', params: 'FocusEvent', desc: '获得焦点时触发' },
  { name: 'blur', params: 'FocusEvent', desc: '失去焦点时触发' }
]

export const checkboxGroupEmits: ParamTableRow[] = [
  { name: 'update:modelValue', params: `(string | number)[]`, desc: '组内选中值更新' },
  { name: 'change', params: 'value, Event', desc: '组内选中值改变时触发' }
]

export const checkboxSlots: ParamTableRow[] = [
  { name: 'default', scoped: '—', desc: '选择框后的内容，点击内容会切换复选框' }
]

export const checkboxGroupSlots: ParamTableRow[] = [
  { name: 'default', scoped: '—', desc: 'Checkbox 选项列表' }
]

export const checkboxCodeExample = `<script setup>
import { computed, ref } from 'vue'
import { Checkbox, CheckboxGroup } from '@mcistudio/unoui-vue/checkbox'

const checked = ref(true)
const fruits = ref(['apple', 'orange'])
const allFruits = ['apple', 'orange', 'banana']
const checkAll = computed(() => allFruits.every((fruit) => fruits.value.includes(fruit)))
const indeterminate = computed(() => fruits.value.length > 0 && !checkAll.value)

function setChecked(value) {
  checked.value = value
}

function toggleAll(value) {
  fruits.value = value ? [...allFruits] : []
}
</script>

<template>
  <!-- 单个复选框 -->
  <Checkbox :checked="checked" @change="setChecked">同意协议</Checkbox>

  <!-- 复选框组 -->
  <CheckboxGroup v-model="fruits" name="fruits">
    <Checkbox value="apple">苹果</Checkbox>
    <Checkbox value="orange">橙子</Checkbox>
    <Checkbox value="banana">香蕉</Checkbox>
  </CheckboxGroup>

  <!-- 不含禁用项的全选/部分选择 -->
  <Checkbox :checked="checkAll" :indeterminate="indeterminate" @change="toggleAll">
    全选
  </Checkbox>

  <!-- 不同尺寸 -->
  <CheckboxGroup v-model="fruits" size="lg" name="fruit-size">
    <Checkbox value="sm" size="sm">小号</Checkbox>
    <Checkbox value="md">中号</Checkbox>
    <Checkbox value="lg">大号</Checkbox>
  </CheckboxGroup>

  <!-- 禁用 -->
  <CheckboxGroup v-model="fruits" disabled>
    <Checkbox value="disabled">禁用选项</Checkbox>
  </CheckboxGroup>
</template>`
