import type { ParamTableRow } from '@/components/ParamTable.vue'

export const inputProps: ParamTableRow[] = [
  { name: 'modelValue', type: 'string | number', default: `''`, desc: '受控输入值' },
  { name: 'type', type: `'text' | 'password' | 'search' | 'email' | 'url' | 'tel' | 'number'`, default: `'text'`, desc: '输入框类型' },
  { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'`, desc: '尺寸' },
  { name: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
  { name: 'placeholder', type: 'string', default: `''`, desc: '占位文本' },
  { name: 'prefixIcon', type: 'string', default: `''`, desc: '左侧 Iconify 图标类名' },
  { name: 'suffixIcon', type: 'string', default: `''`, desc: '右侧 Iconify 图标类名' },
  { name: 'prefix', type: 'string', default: `''`, desc: '左侧文字前缀' },
  { name: 'suffix', type: 'string', default: `''`, desc: '右侧文字后缀' },
  { name: 'password', type: 'boolean', default: 'false', desc: '是否密码模式（切换明文/密文）' },
  { name: 'showPassword', type: 'boolean', default: 'false', desc: '是否初始显示密码明文' },
  { name: 'clearable', type: 'boolean', default: 'false', desc: '是否显示清空按钮' },
  { name: 'clearIcon', type: 'string', default: `'i-lucide:x'`, desc: '清空按钮图标类名' },
  { name: 'rows', type: 'number', default: 'undefined', desc: '多行模式行数（与 multiline 配合）' },
  { name: 'multiline', type: 'boolean', default: 'false', desc: '是否为多行文本域' },
  { name: 'maxlength', type: 'number', default: 'undefined', desc: '最大字符数' },
  { name: 'showWordLimit', type: 'boolean', default: 'false', desc: '是否显示字数统计' },
  { name: 'formatter', type: '(value: string) => string', default: 'undefined', desc: '输入格式化函数' },
  { name: 'parser', type: '(value: string) => string', default: 'undefined', desc: '反格式化函数，还原 modelValue' },
  { name: 'precision', type: 'number', default: 'undefined', desc: 'number 模式下保留小数位数' },
  { name: 'step', type: 'number | string', default: '1', desc: 'number 模式下步进值' },
  { name: 'min', type: 'number | string', default: 'undefined', desc: 'number 模式下最小值' },
  { name: 'max', type: 'number | string', default: 'undefined', desc: 'number 模式下最大值' },
  { name: 'draggable', type: 'boolean', default: 'false', desc: '是否可拖拽改变数值（number 模式）' },
  { name: 'dragIcon', type: 'string', default: `'i-lucide:grip-horizontal'`, desc: '拖拽图标类名' },
  { name: 'dragStep', type: 'number', default: 'undefined', desc: '拖拽步长（不传则使用 step）' },
  { name: 'name', type: 'string', default: 'undefined', desc: '原生 name 属性' },
  { name: 'autocomplete', type: 'string', default: 'undefined', desc: '原生 autocomplete 属性' },
  { name: 'readonly', type: 'boolean', default: 'false', desc: '是否只读' },
  { name: 'modelModifiers', type: '{ trim?, number? }', default: 'undefined', desc: 'v-model 修饰符（.trim / .number）' }
]

export const inputEmits: ParamTableRow[] = [
  { name: 'update:modelValue', params: 'string | number', desc: '受控值更新' },
  { name: 'input', params: '(value, event)', desc: '输入值变化时触发' },
  { name: 'change', params: '(value, event)', desc: '值确认时触发' },
  { name: 'clear', params: '—', desc: '点击清空按钮时触发' },
  { name: 'focus', params: 'FocusEvent', desc: '获得焦点时触发' },
  { name: 'blur', params: 'FocusEvent', desc: '失去焦点时触发' },
  { name: 'keydown', params: 'KeyboardEvent', desc: '键盘按下时触发' },
  { name: 'drag-start', params: '(value, event)', desc: '拖拽开始时触发' },
  { name: 'drag-end', params: '(value, event)', desc: '拖拽结束时触发' }
]

export const inputSlots: ParamTableRow[] = [
  { name: 'prepend', scoped: '—', desc: '复合输入框前置区域（带边框）' },
  { name: 'append', scoped: '—', desc: '复合输入框后置区域（带边框）' },
  { name: 'prefix', scoped: '—', desc: '输入域内左侧自定义内容' },
  { name: 'suffix', scoped: '—', desc: '输入域内右侧自定义内容' }
]

export const autocompleteProps: ParamTableRow[] = [
  { name: 'modelValue', type: 'string | number', default: `''`, desc: '受控输入值' },
  { name: 'data-source', type: 'AutocompleteSuggestion[] | (query, cb) => void', default: '必填', desc: '建议源，支持静态数组和回调式远程查询' },
  { name: 'valueKey', type: 'string', default: `'value'`, desc: '建议项展示字段名' },
  { name: 'triggerOnFocus', type: 'boolean', default: 'true', desc: '聚焦时是否触发建议查询' },
  { name: 'debounce', type: 'number', default: '300', desc: '查询防抖时间，单位毫秒' },
  { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'`, desc: '尺寸' },
  { name: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
  { name: 'readonly', type: 'boolean', default: 'false', desc: '是否只读' },
  { name: 'placeholder', type: 'string', default: `''`, desc: '占位文本' },
  { name: 'prefixIcon', type: 'string', default: `''`, desc: '左侧 Iconify 图标类名' },
  { name: 'suffixIcon', type: 'string', default: `''`, desc: '右侧 Iconify 图标类名' },
  { name: 'clearable', type: 'boolean', default: 'false', desc: '是否显示清空按钮' },
  { name: 'teleportedWidth', type: 'string', default: 'undefined', desc: '下拉层固定宽度，默认跟随输入框' },
  { name: 'maxHeight', type: 'string', default: `'280px'`, desc: '下拉滚动区域最大高度' },
  { name: 'hideLoading', type: 'boolean', default: 'false', desc: '远程查询中是否隐藏加载文案' },
  { name: 'selectWhenUnmatched', type: 'boolean', default: 'false', desc: '回车时无匹配项也触发 select' },
  { name: 'noDataText', type: 'string', default: `'暂无数据'`, desc: '无数据文案' },
  { name: 'loadingText', type: 'string', default: `'加载中'`, desc: '加载文案' }
]

export const autocompleteEmits: ParamTableRow[] = [
  { name: 'update:modelValue', params: 'string | number', desc: '受控值更新' },
  { name: 'input', params: '(value, event)', desc: '输入值变化时触发' },
  { name: 'change', params: '(value, event)', desc: '值确认时触发' },
  { name: 'clear', params: '—', desc: '点击清空按钮时触发' },
  { name: 'select', params: 'AutocompleteSuggestion', desc: '选择建议项或提交未匹配值时触发' },
  { name: 'focus', params: 'FocusEvent', desc: '获得焦点时触发' },
  { name: 'blur', params: 'FocusEvent', desc: '失去焦点时触发' },
  { name: 'keydown', params: 'KeyboardEvent', desc: '键盘按下时触发' }
]

export const autocompleteSlots: ParamTableRow[] = [
  { name: 'prepend', scoped: '—', desc: '复合输入框前置区域（带边框）' },
  { name: 'append', scoped: '—', desc: '复合输入框后置区域（带边框）' },
  { name: 'prefix', scoped: '—', desc: '输入域内左侧自定义内容' },
  { name: 'suffix', scoped: '—', desc: '输入域内右侧自定义内容' },
  { name: 'suggestion', scoped: '{ item }', desc: '自定义建议项内容' }
]

export const inputTagProps: ParamTableRow[] = [
  { name: 'modelValue', type: 'string[]', default: '[]', desc: '标签数组' },
  { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'`, desc: '尺寸' },
  { name: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
  { name: 'readonly', type: 'boolean', default: 'false', desc: '是否只读' },
  { name: 'placeholder', type: 'string', default: `''`, desc: '无标签时的占位文本' },
  { name: 'inputPlaceholder', type: 'string', default: `''`, desc: '输入框占位文本' },
  { name: 'clearable', type: 'boolean', default: 'false', desc: '是否显示清空按钮' },
  { name: 'clearIcon', type: 'string', default: `'i-lucide:x'`, desc: '清空按钮图标' },
  { name: 'closeIcon', type: 'string', default: `'i-lucide:x'`, desc: '标签关闭图标' },
  { name: 'trigger', type: `'Enter' | 'Space' | 'Tab' | ',' | ';' | ' ' | ('Enter' | ...)[]`, default: `'Enter'`, desc: '确认标签创建的按键' },
  { name: 'delimiters', type: 'string[]', default: `[',']`, desc: '批量粘贴时分隔符列表' },
  { name: 'max', type: 'number', default: 'undefined', desc: '最大标签数' },
  { name: 'maxlength', type: 'number', default: 'undefined', desc: '单个标签最大字符数' },
  { name: 'validateTag', type: '(value: string) => boolean', default: 'undefined', desc: '标签校验函数' },
  { name: 'allowDuplicates', type: 'boolean', default: 'false', desc: '是否允许重复标签' },
  { name: 'tagColor', type: `'brand' | 'blue' | 'red' | 'green' | 'gray' | 'yellow' | 'orange'`, default: `'brand'`, desc: '标签色彩' },
  { name: 'tagVariant', type: `'light' | 'dark' | 'plain'`, default: `'light'`, desc: '标签变体' },
  { name: 'tagRadius', type: `'none' | 'sm' | 'md' | 'lg' | 'round'`, default: `'md'`, desc: '标签圆角' },
  { name: 'name', type: 'string', default: 'undefined', desc: '原生 name 属性' },
  { name: 'autocomplete', type: 'string', default: 'undefined', desc: '原生 autocomplete 属性' }
]

export const inputI18nProps: ParamTableRow[] = [
  { name: 'modelValue', type: 'Record<string, string>', default: '{}', desc: '多语言值映射' },
  { name: 'languages', type: 'string[]', default: '内置列表', desc: '语言列表，默认包含 zh-CN、en 等' },
  { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'`, desc: '尺寸' },
  { name: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
  { name: 'readonly', type: 'boolean', default: 'false', desc: '是否只读' },
  { name: 'placeholder', type: 'string', default: `''`, desc: '输入框占位文本' },
  { name: 'clearable', type: 'boolean', default: 'false', desc: '是否显示清空按钮' },
  { name: 'prefixIcon', type: 'string', default: `''`, desc: '左侧图标' },
  { name: 'suffixIcon', type: 'string', default: `''`, desc: '右侧图标' },
  { name: 'prefix', type: 'string', default: `''`, desc: '左侧文字前缀' },
  { name: 'suffix', type: 'string', default: `''`, desc: '右侧文字后缀' },
  { name: 'modalZIndex', type: 'number | string', default: '2000', desc: '编辑弹窗层级' }
]

export const inputCodeExample = `<script setup>
import { ref } from 'vue'
import { Autocomplete, Input, InputTag, InputI18n } from '@unoui/vue/input'

const text = ref('')
const password = ref('')
const number = ref(0)
const point = ref('')
const tags = ref<string[]>([])
const i18n = ref<Record<string, string>>({})
const points = [
  { value: '主入口', type: '入口' },
  { value: '中庭扶梯', type: '设施' },
  { value: '服务台', type: '服务' }
]
</script>

<template>
  <!-- 基础输入 -->
  <Input v-model="text" placeholder="请输入内容" size="md" />

  <!-- 带图标和清空 -->
  <Input v-model="text" prefix-icon="i-lucide:search"
         clearable placeholder="搜索" />

  <!-- 密码输入 -->
  <Input v-model="password" password clearable
         placeholder="请输入密码" />

  <!-- 前后缀 -->
  <Input v-model="number" type="number"
         prefix="¥" suffix="元" :precision="2" />

  <!-- 多行文本 -->
  <Input v-model="text" multiline :rows="4"
         :maxlength="200" show-word-limit />

  <!-- 拖拽数值 -->
  <Input v-model.number="number" type="number"
         draggable :step="0.1" :min="0" :max="100" />

  <!-- 自动补全 -->
  <Autocomplete v-model="point" :data-source="points"
                clearable prefix-icon="i-lucide:search"
                placeholder="搜索点位" />

  <!-- 标签输入 -->
  <InputTag v-model="tags" placeholder="输入后回车"
            clearable :max="5" />

  <!-- 多语言输入 -->
  <InputI18n v-model="i18n" prefix-icon="i-lucide:languages"
             placeholder="多语言名称" />
</template>`
