import type { ParamTableRow } from '@/components/ParamTable.vue'

export const radioProps: ParamTableRow[] = [
  { name: 'value', type: 'string | number | boolean', default: 'true', desc: '当前选项代表值，选中时同步到 RadioGroup modelValue' },
  { name: 'checked', type: 'boolean', default: 'undefined', desc: '单个非受控 Radio 的默认选中态' },
  { name: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用当前选项' },
  { name: 'size', type: `'sm' | 'md' | 'lg'`, default: '继承 RadioGroup', desc: '当前选项尺寸，未传时继承组级设置' },
  { name: 'border', type: 'boolean', default: 'false', desc: '是否显示外边框（卡片风格）' },
  { name: 'type', type: `'radio' | 'button'`, default: '继承 RadioGroup', desc: '当前选项视觉形态，未传时继承组级设置' },
  { name: 'buttonStyle', type: `'outline' | 'solid'`, default: '继承 RadioGroup', desc: '当前按钮式选项的选中样式' },
  { name: 'name', type: 'string', default: '继承 RadioGroup', desc: '当前选项原生 name' }
]

export const radioGroupProps: ParamTableRow[] = [
  { name: 'modelValue', type: 'string | number | boolean', default: 'undefined', desc: '组内当前选中值，使用 v-model 绑定' },
  { name: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用整组' },
  { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'`, desc: '组内默认尺寸' },
  { name: 'type', type: `'radio' | 'button'`, default: `'radio'`, desc: '组内默认视觉形态；button 为按钮式单选' },
  { name: 'buttonStyle', type: `'outline' | 'solid'`, default: `'outline'`, desc: '按钮式单选的选中样式' },
  { name: 'name', type: 'string', default: '自动生成', desc: '原生 radio name；未传时自动生成同组 name' },
  { name: 'direction', type: `'horizontal' | 'vertical'`, default: `'horizontal'`, desc: '组内排列方向' }
]

export const radioEmits: ParamTableRow[] = [
  { name: 'change', params: 'value, Event', desc: '当前选项被选中时触发' },
  { name: 'input', params: 'Event', desc: '原生 input 事件透传' },
  { name: 'focus', params: 'FocusEvent', desc: '获得焦点时触发' },
  { name: 'blur', params: 'FocusEvent', desc: '失去焦点时触发' }
]

export const radioGroupEmits: ParamTableRow[] = [
  { name: 'update:modelValue', params: 'string | number | boolean', desc: '组内选中值更新' },
  { name: 'change', params: 'value, Event', desc: '组内选中值改变时触发' }
]

export const radioSlots: ParamTableRow[] = [
  { name: 'default', scoped: '—', desc: 'Radio 标签文本' }
]

export const radioGroupSlots: ParamTableRow[] = [
  { name: 'default', scoped: '—', desc: 'Radio 选项列表' }
]

export const radioExposes: ParamTableRow[] = [
  { name: 'focus', signature: '() => void', desc: '让原生 radio input 获取焦点' },
  { name: 'blur', signature: '() => void', desc: '让原生 radio input 失去焦点' }
]

export const radioCodeExample = `<script setup>
import { ref } from 'vue'
import { Radio, RadioGroup } from '@mcistudio/unoui-vue/radio'

const selected = ref('apple')
const view = ref('map')
</script>

<template>
  <!-- 单选组 -->
  <RadioGroup v-model="selected" name="fruit">
    <Radio value="apple">苹果</Radio>
    <Radio value="orange">橙子</Radio>
    <Radio value="banana" disabled>香蕉</Radio>
  </RadioGroup>

  <!-- 不同尺寸 -->
  <RadioGroup v-model="selected" size="lg" name="fruit-size">
    <Radio value="sm" size="sm">小号</Radio>
    <Radio value="md">中号</Radio>
    <Radio value="lg">大号</Radio>
  </RadioGroup>

  <!-- 带边框 -->
  <RadioGroup v-model="selected" name="fruit-border">
    <Radio value="border" border>卡片风格</Radio>
  </RadioGroup>

  <!-- 按钮式单选 -->
  <RadioGroup v-model="view" type="button" button-style="solid" name="view">
    <Radio value="map">地图</Radio>
    <Radio value="list">列表</Radio>
    <Radio value="stats">统计</Radio>
  </RadioGroup>
</template>`
