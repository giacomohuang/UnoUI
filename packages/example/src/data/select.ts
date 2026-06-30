import type { ParamTableRow } from '@/components/ParamTable.vue'

export const selectProps: ParamTableRow[] = [
  { name: 'modelValue', type: 'SelectValue | SelectValue[]', default: 'undefined', desc: '受控选中值，multiple 为 true 时传数组' },
  { name: 'options', type: 'SelectOption[]', default: '[]', desc: '选项数据源' },
  { name: 'placeholder', type: 'string', default: `'请选择'`, desc: '未选择时的占位文案' },
  { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'`, desc: '尺寸' },
  { name: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
  { name: 'clearable', type: 'boolean', default: 'false', desc: '是否允许一键清空' },
  { name: 'multiple', type: 'boolean', default: 'false', desc: '是否启用多选模式' },
  { name: 'filterable', type: 'boolean', default: 'false', desc: '是否启用本地过滤搜索' },
  { name: 'collapseTags', type: 'boolean', default: 'false', desc: '多选时是否折叠超出标签' },
  { name: 'maxCollapseTags', type: 'number', default: '1', desc: 'collapseTags 模式下最多显示标签数' },
  { name: 'labelKey', type: 'string', default: `'label'`, desc: '从 option 读取展示标签的字段名' },
  { name: 'valueKey', type: 'string', default: `'value'`, desc: '从 option 读取提交值的字段名' },
  { name: 'disabledKey', type: 'string', default: `'disabled'`, desc: '从 option 读取禁用状态的字段名' },
  { name: 'noDataText', type: 'string', default: `'暂无数据'`, desc: '无选项时的文案' },
  { name: 'noMatchText', type: 'string', default: `'无匹配数据'`, desc: '过滤后无匹配项时的文案' },
  { name: 'loading', type: 'boolean', default: 'false', desc: '选项加载中状态' },
  { name: 'loadingText', type: 'string', default: `'加载中'`, desc: '加载中文案' },
  { name: 'clearIcon', type: 'string', default: `'i-lucide:x'`, desc: '清空按钮图标类名' },
  { name: 'suffixIcon', type: 'string', default: `'i-lucide:chevron-down'`, desc: '右侧下拉图标类名' },
  { name: 'maxHeight', type: 'string', default: `'280px'`, desc: '下拉滚动区域最大高度' },
  { name: 'teleportedWidth', type: 'string', default: 'undefined', desc: '下拉层固定宽度，默认跟随触发器' },
  { name: 'name', type: 'string', default: 'undefined', desc: '隐藏 input 的原生 name' }
]

export const selectEmits: ParamTableRow[] = [
  { name: 'update:modelValue', params: 'SelectValue | SelectValue[]', desc: '受控值更新' },
  { name: 'change', params: 'SelectValue | SelectValue[]', desc: '选中值改变时触发' },
  { name: 'clear', params: '—', desc: '点击清空按钮时触发' },
  { name: 'remove-tag', params: 'SelectValue', desc: '多选模式下移除标签时触发' },
  { name: 'visible-change', params: 'boolean', desc: '下拉可见性变化时触发' },
  { name: 'focus', params: 'FocusEvent', desc: '获得焦点时触发' },
  { name: 'blur', params: 'FocusEvent', desc: '失去焦点时触发' }
]

export const selectSlots: ParamTableRow[] = [
  { name: 'prefix', scoped: '—', desc: '选择器输入框左侧内容' },
  { name: 'option', scoped: '{ option, label, value, selected, disabled }', desc: '自定义选项渲染' }
]

export const selectCodeExample = `<script setup>
import { ref } from 'vue'
import { Select, type SelectOption } from '@unoui/vue/select'

const value = ref('')
const multiple = ref<string[]>([])
const options: SelectOption[] = [
  { label: 'Button 按钮', value: 'button' },
  { label: 'Input 输入框', value: 'input' },
  { label: 'Table 表格', value: 'table' },
  { label: 'Disabled', value: 'disabled', disabled: true }
]
</script>

<template>
  <!-- 单选 -->
  <Select v-model="value" :options="options"
          clearable placeholder="选择组件" />

  <!-- 可过滤 -->
  <Select v-model="value" :options="options"
          filterable clearable placeholder="搜索组件" />

  <!-- 多选 -->
  <Select v-model="multiple" :options="options"
          multiple clearable placeholder="多选组件" />

  <!-- 多选折叠标签 -->
  <Select v-model="multiple" :options="options"
          multiple collapse-tags :max-collapse-tags="2"
          placeholder="折叠标签" />

  <!-- 自定义选项 -->
  <Select v-model="value" :options="options" filterable>
    <template #option="{ label, selected, disabled }">
      <div class="flex items-center gap-2 px-3 py-2"
           :class="selected ? 'text-brand' : ''">
        <span>{{ label }}</span>
        <span v-if="selected" class="i-lucide:check size-4" />
      </div>
    </template>
  </Select>
</template>`
