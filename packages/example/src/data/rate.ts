import type { ParamTableRow } from '@/components/ParamTable.vue'

export const rateProps: ParamTableRow[] = [
  { name: 'modelValue', type: 'number', default: 'undefined', desc: '本地 v-model 受控评分值' },
  { name: 'count', type: 'number', default: '5', desc: '评分字符总数' },
  { name: 'allowHalf', type: 'boolean', default: 'false', desc: '是否允许半选' },
  { name: 'clearable', type: 'boolean', default: 'true', desc: '再次点击当前值时是否清空' },
  { name: 'autofocus', type: 'boolean', default: 'false', desc: '挂载后自动获取焦点' },
  { name: 'character', type: 'string', default: `''`, desc: '自定义评分字符；复杂内容建议使用 character 插槽' },
  { name: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用交互' },
  { name: 'tooltips', type: 'string[]', default: 'undefined', desc: '每个评分字符的提示文本' },
  { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'`, desc: '组件尺寸' },
  { name: 'tabindex', type: 'number | string', default: '0', desc: '根节点键盘聚焦顺序' }
]

export const rateEmits: ParamTableRow[] = [
  { name: 'update:modelValue', params: 'number', desc: '本地 v-model 值更新' },
  { name: 'change', params: 'number', desc: '选择评分时触发' },
  { name: 'hoverChange', params: 'number | undefined', desc: '鼠标经过评分项或离开时触发' },
  { name: 'focus', params: 'FocusEvent', desc: '获得焦点时触发' },
  { name: 'blur', params: 'FocusEvent', desc: '失去焦点时触发' },
  { name: 'keydown', params: 'KeyboardEvent', desc: '键盘按下时触发' }
]

export const rateSlots: ParamTableRow[] = [{ name: 'character', scoped: '{ index, count, value, active, half, disabled }', desc: '自定义评分字符内容' }]

export const rateExposes: ParamTableRow[] = [
  { name: 'focus', signature: '() => void', desc: '让评分组件获取焦点' },
  { name: 'blur', signature: '() => void', desc: '让评分组件失去焦点' }
]

export const rateCodeExample = `<script setup lang="ts">
import { ref } from 'vue'
import { Rate } from '@mcistudio/unoui-vue/rate'

const score = ref(3)
const halfScore = ref(2.5)
const tooltipScore = ref(3)
const textScore = ref(4)
</script>

<template>
  <!-- 基础评分 -->
  <Rate v-model="score" />

  <!-- 半星 -->
  <Rate
    v-model="halfScore"
    allow-half
  />

  <!-- Tooltip 提示 -->
  <Rate
    v-model="tooltipScore"
    :tooltips="['很差', '较差', '一般', '不错', '很好']"
  />

  <!-- 自定义字符 -->
  <Rate v-model="textScore" character="好" :count="3" />

  <!-- 禁用展示 -->
  <Rate :model-value="3.5" allow-half disabled />
</template>`
