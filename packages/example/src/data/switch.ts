import type { ParamTableRow } from '@/components/ParamTable.vue'

export const switchProps: ParamTableRow[] = [
  { name: 'modelValue', type: 'string | number | boolean', default: 'undefined', desc: '受控开关值' },
  { name: 'checked', type: 'boolean', default: 'undefined', desc: '非受控选中状态（与 modelValue 二选一）' },
  { name: 'activeValue', type: 'string | number | boolean', default: 'true', desc: '开启时的值' },
  { name: 'inactiveValue', type: 'string | number | boolean', default: 'false', desc: '关闭时的值' },
  { name: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
  { name: 'loading', type: 'boolean', default: 'false', desc: '是否加载中' },
  { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'`, desc: '尺寸' },
  { name: 'width', type: 'number | string', default: 'undefined', desc: '开关宽度' },
  { name: 'activeText', type: 'string', default: `''`, desc: '开启时文字' },
  { name: 'inactiveText', type: 'string', default: `''`, desc: '关闭时文字' },
  { name: 'activeIcon', type: 'string', default: `''`, desc: '开启时图标类名' },
  { name: 'inactiveIcon', type: 'string', default: `''`, desc: '关闭时图标类名' },
  { name: 'activeActionIcon', type: 'string', default: `''`, desc: '开启时圆点内图标' },
  { name: 'inactiveActionIcon', type: 'string', default: `''`, desc: '关闭时圆点内图标' },
  { name: 'inlinePrompt', type: 'boolean', default: 'false', desc: '文字/图标是否内嵌在轨道中' },
  { name: 'activeColor', type: 'string', default: `''`, desc: '开启时轨道自定义颜色' },
  { name: 'inactiveColor', type: 'string', default: `''`, desc: '关闭时轨道自定义颜色' },
  { name: 'beforeChange', type: '() => boolean | Promise<boolean>', default: 'undefined', desc: '切换前回调，返回 false 阻止切换' },
  { name: 'name', type: 'string', default: 'undefined', desc: '原生 name 属性' },
  { name: 'id', type: 'string', default: 'undefined', desc: '原生 id 属性' }
]

export const switchEmits: ParamTableRow[] = [
  { name: 'update:modelValue', params: 'string | number | boolean', desc: '受控值更新' },
  { name: 'input', params: 'string | number | boolean', desc: '开关值改变时触发' },
  { name: 'change', params: 'string | number | boolean', desc: '开关值改变时触发' },
  { name: 'focus', params: 'FocusEvent', desc: '获得焦点时触发' },
  { name: 'blur', params: 'FocusEvent', desc: '失去焦点时触发' }
]

export const switchSlots: ParamTableRow[] = [
  { name: 'active', scoped: '—', desc: '开启状态自定义内容' },
  { name: 'inactive', scoped: '—', desc: '关闭状态自定义内容' },
  { name: 'active-action', scoped: '—', desc: '开启时圆点内自定义内容' },
  { name: 'inactive-action', scoped: '—', desc: '关闭时圆点内自定义内容' }
]

export const switchCodeExample = `<script setup>
import { ref } from 'vue'
import { Switch } from '@mcistudio/unoui-vue/switch'

const value = ref(true)
const loading = ref(false)

async function beforeChange() {
  // 模拟异步确认
  return true
}
</script>

<template>
  <!-- 基础 -->
  <Switch v-model="value" />

  <!-- 尺寸 -->
  <Switch v-model="value" size="sm" />
  <Switch v-model="value" size="md" />
  <Switch v-model="value" size="lg" />

  <!-- 带文字 -->
  <Switch v-model="value"
          active-text="开" inactive-text="关" />

  <!-- 内嵌提示 -->
  <Switch v-model="value" inline-prompt
          active-icon="i-lucide:check"
          inactive-icon="i-lucide:x" />

  <!-- 加载 / 禁用 -->
  <Switch v-model="value" loading />
  <Switch v-model="value" disabled />

  <!-- 异步切换确认 -->
  <Switch v-model="value" :before-change="beforeChange" />
</template>`
