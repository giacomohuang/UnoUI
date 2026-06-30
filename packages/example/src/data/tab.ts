import type { ParamTableRow } from '@/components/ParamTable.vue'

export const tabsProps: ParamTableRow[] = [
  { name: 'modelValue', type: 'string | number', default: 'undefined', desc: '受控当前激活的 Tab name' },
  { name: 'defaultValue', type: 'string | number', default: 'undefined', desc: '非受控默认激活的 Tab name' },
  { name: 'type', type: `'line' | 'card' | 'border-card'`, default: `'line'`, desc: '标签页类型' },
  { name: 'tabPosition', type: `'top' | 'right' | 'bottom' | 'left'`, default: `'top'`, desc: '标签栏位置' },
  { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'`, desc: '尺寸' },
  { name: 'stretch', type: 'boolean', default: 'false', desc: '标签是否拉伸填满容器' },
  { name: 'closable', type: 'boolean', default: 'false', desc: '全局可关闭（所有标签显示关闭按钮）' },
  { name: 'addable', type: 'boolean', default: 'false', desc: '是否显示新增标签按钮' },
  { name: 'editable', type: 'boolean', default: 'false', desc: '是否可编辑（addable + closable）' },
  { name: 'padded', type: 'boolean', default: 'true', desc: '内容区域是否留白' },
  { name: 'beforeLeave', type: '(newVal, oldVal) => boolean | void | Promise<boolean | void>', default: 'undefined', desc: '离开标签前回调，返回 false 阻止切换' },
  { name: 'ariaLabel', type: 'string', default: `'标签页'`, desc: '无障碍标签' },
  { name: 'addAriaLabel', type: 'string', default: `'新增标签'`, desc: '新增按钮无障碍标签' },
  { name: 'closeAriaLabel', type: 'string', default: `'关闭标签'`, desc: '关闭按钮无障碍标签' }
]

export const tabsEmits: ParamTableRow[] = [
  { name: 'update:modelValue', params: 'string | number', desc: '受控激活值更新' },
  { name: 'tab-click', params: '(pane, event)', desc: '点击标签时触发' },
  { name: 'tab-change', params: 'string | number', desc: '激活标签变化时触发' },
  { name: 'tab-add', params: '—', desc: '点击新增按钮时触发' },
  { name: 'tab-remove', params: 'string | number', desc: '关闭标签时触发' },
  { name: 'edit', params: '(targetName, action)', desc: '标签编辑（新增/移除）时触发' }
]

export const tabPaneProps: ParamTableRow[] = [
  { name: 'name', type: 'string | number', default: 'undefined (自动按顺序生成)', desc: '标签唯一标识' },
  { name: 'label', type: 'string', default: 'undefined', desc: '标签文本' },
  { name: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
  { name: 'closable', type: 'boolean', default: 'false', desc: '是否可关闭' },
  { name: 'lazy', type: 'boolean', default: 'false', desc: '是否懒加载（首次激活时才渲染内容）' }
]

export const tabPaneSlots: ParamTableRow[] = [
  { name: 'default', scoped: '—', desc: '标签页内容' },
  { name: 'label', scoped: '{ active, pane }', desc: '自定义标签头部' }
]

export const tabsCodeExample = `<script setup>
import { ref } from 'vue'
import { Tabs, TabPane } from '@unoui/vue/tab'

const active = ref('tab1')
</script>

<template>
  <!-- 基础 line 标签页 -->
  <Tabs v-model="active">
    <TabPane name="tab1" label="标签一">
      <p>内容一</p>
    </TabPane>
    <TabPane name="tab2" label="标签二">
      <p>内容二</p>
    </TabPane>
    <TabPane name="tab3" label="标签三" disabled>
      <p>禁用标签</p>
    </TabPane>
  </Tabs>

  <!-- card 类型 -->
  <Tabs type="card" v-model="active">
    <TabPane name="tab1" label="Tab A" />
    <TabPane name="tab2" label="Tab B" />
  </Tabs>

  <!-- 左侧标签栏 -->
  <Tabs tab-position="left" size="sm" v-model="active">
    <TabPane name="tab1" label="设置A" />
    <TabPane name="tab2" label="设置B" />
  </Tabs>

  <!-- editable 模式 -->
  <Tabs v-model="active" editable @tab-add="handleAdd"
        @tab-remove="handleRemove">
    <TabPane v-for="tab in tabs" :key="tab.name"
             :name="tab.name" :label="tab.label" />
  </Tabs>
</template>`
