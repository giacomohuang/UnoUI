import type { ParamTableRow } from '@/components/ParamTable.vue'

export const radioProps: ParamTableRow[] = [
  { name: 'modelValue', type: 'string | number | boolean', default: 'undefined', desc: '受控选中值，同组 Radio 绑定同一 modelValue' },
  { name: 'checked', type: 'boolean', default: 'undefined', desc: '非受控选中状态（与 modelValue 二选一）' },
  { name: 'value', type: 'string | number | boolean', default: 'true', desc: '当前 Radio 的代表值，选中时同步到 modelValue' },
  { name: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
  { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'`, desc: '尺寸' },
  { name: 'border', type: 'boolean', default: 'false', desc: '是否显示外边框（卡片风格）' },
  { name: 'type', type: `'radio' | 'button'`, default: `'radio'`, desc: '视觉形态；button 为按钮式单选' },
  { name: 'buttonStyle', type: `'outline' | 'solid'`, default: `'outline'`, desc: '按钮式单选的选中样式，仅 type="button" 时生效' },
  { name: 'name', type: 'string', default: 'undefined', desc: '原生 name 属性，同组 Radio 需同名' }
]

export const radioEmits: ParamTableRow[] = [
  { name: 'update:modelValue', params: 'string | number | boolean', desc: '受控值更新' },
  { name: 'change', params: 'string | number | boolean', desc: '选中值改变时触发' },
  { name: 'input', params: 'Event', desc: '原生 input 事件透传' },
  { name: 'focus', params: 'FocusEvent', desc: '获得焦点时触发' },
  { name: 'blur', params: 'FocusEvent', desc: '失去焦点时触发' }
]

export const radioSlots: ParamTableRow[] = [
  { name: 'default', scoped: '—', desc: 'Radio 标签文本' }
]

export const radioExposes: ParamTableRow[] = [
  { name: 'focus', signature: '() => void', desc: '让原生 radio input 获取焦点' },
  { name: 'blur', signature: '() => void', desc: '让原生 radio input 失去焦点' }
]

export const radioCodeExample = `<script setup>
import { ref } from 'vue'
import { Radio } from '@unoui/vue/radio'

const selected = ref('apple')
const view = ref('map')
</script>

<template>
  <!-- 单选组 -->
  <Radio v-model="selected" value="apple" size="md">苹果</Radio>
  <Radio v-model="selected" value="orange" size="md">橙子</Radio>
  <Radio v-model="selected" value="banana" size="md" disabled>香蕉</Radio>

  <!-- 不同尺寸 -->
  <Radio v-model="selected" value="sm" size="sm">小号</Radio>
  <Radio v-model="selected" value="md" size="md">中号</Radio>
  <Radio v-model="selected" value="lg" size="lg">大号</Radio>

  <!-- 带边框 -->
  <Radio v-model="selected" value="border" border size="md">
    卡片风格
  </Radio>

  <!-- 按钮式单选 -->
  <div class="inline-flex">
    <Radio v-model="view" type="button" value="map" name="view">
      地图
    </Radio>
    <Radio v-model="view" type="button" value="list" name="view">
      列表
    </Radio>
    <Radio
      v-model="view"
      type="button"
      button-style="solid"
      value="stats"
      name="view"
    >
      统计
    </Radio>
  </div>
</template>`
