import type { ParamTableRow } from '@/components/ParamTable.vue'

export const splitterProps: ParamTableRow[] = [
  { name: 'modelValue', type: '(number | string)[]', default: 'undefined', desc: '所有面板尺寸的本地 v-model；拖拽后更新为 px 数组' },
  { name: 'defaultValue', type: '(number | string)[]', default: 'undefined', desc: '所有面板的非受控初始尺寸' },
  { name: 'orientation', type: `'horizontal' | 'vertical'`, default: `'horizontal'`, desc: '面板排列方向' },
  { name: 'lazy', type: 'boolean', default: 'false', desc: '拖拽时只移动预览线，松开后再调整面板' },
  { name: 'keyboardStep', type: 'number', default: '10', desc: '分隔条通过方向键调整时的像素步长' },
  { name: 'collapsible', type: '{ motion?: boolean }', default: 'undefined', desc: '折叠配置；motion 控制折叠和展开动画' },
  { name: 'destroyOnHidden', type: 'boolean', default: 'false', desc: '面板折叠为 0 时是否销毁内容' },
  { name: 'ariaLabel', type: 'string', default: `'分割面板'`, desc: '根节点无障碍名称' }
]

export const splitterPanelProps: ParamTableRow[] = [
  { name: 'size', type: 'number | string', default: 'undefined', desc: '受控面板尺寸；数字表示 px，字符串支持百分比' },
  { name: 'defaultSize', type: 'number | string', default: 'undefined', desc: '非受控初始尺寸；数字表示 px，字符串支持百分比' },
  { name: 'min', type: 'number | string', default: 'undefined', desc: '拖拽允许的最小尺寸' },
  { name: 'max', type: 'number | string', default: 'undefined', desc: '拖拽允许的最大尺寸' },
  { name: 'resizable', type: 'boolean', default: 'true', desc: '相邻分隔条是否允许拖拽' },
  { name: 'collapsible', type: `boolean | { start?: boolean; end?: boolean; showCollapsibleIcon?: boolean | 'auto' }`, default: 'false', desc: '从起始侧或结束侧快速折叠，以及折叠按钮显示策略' },
  { name: 'destroyOnHidden', type: 'boolean', default: 'undefined', desc: '覆盖 Splitter 的折叠内容销毁策略' }
]

export const splitterEmits: ParamTableRow[] = [
  { name: 'update:modelValue', params: 'number[]', desc: '面板尺寸变化时更新本地 v-model，值为 px' },
  { name: 'resize-start', params: 'number[]', desc: '开始拖拽或键盘调整前触发' },
  { name: 'resize', params: 'number[]', desc: '面板尺寸改变时触发' },
  { name: 'resize-end', params: 'number[]', desc: '拖拽、键盘调整或 reset 完成时触发' },
  { name: 'collapse', params: '(collapsed: boolean[], sizes: number[])', desc: '面板折叠或展开时触发' },
  { name: 'dragger-double-click', params: 'index: number', desc: '双击指定分隔条时触发' }
]

export const splitterSlots: ParamTableRow[] = [
  { name: 'default', scoped: '—', desc: '仅支持 SplitterPanel 子组件' },
  { name: 'dragger', scoped: '{ index, active }', desc: '自定义分隔条中心图标' }
]

export const splitterPanelSlots: ParamTableRow[] = [{ name: 'default', scoped: '—', desc: '面板内容' }]

export const splitterExposes: ParamTableRow[] = [
  { name: 'reset', signature: '() => number[]', desc: '恢复 defaultValue 或各 Panel defaultSize，并返回 px 尺寸' },
  { name: 'getSizes', signature: '() => number[]', desc: '获取当前各面板的 px 尺寸' }
]

export const splitterCodeExample = `<script setup lang="ts">
import { ref } from 'vue'
import { Splitter, SplitterPanel, type SplitterSize } from '@unoui/vue/splitter'

const sizes = ref<SplitterSize[]>(['35%', '65%'])
const splitterRef = ref<InstanceType<typeof Splitter> | null>(null)
</script>

<template>
  <Splitter
    ref="splitterRef"
    v-model="sizes"
    :default-value="['35%', '65%']"
    class="h-64"
    @dragger-double-click="splitterRef?.reset()"
  >
    <SplitterPanel min="20%" max="60%" collapsible>
      导航面板
    </SplitterPanel>
    <SplitterPanel>
      内容面板
    </SplitterPanel>
  </Splitter>

  <Splitter orientation="vertical" lazy class="h-80">
    <SplitterPanel default-size="40%">上方面板</SplitterPanel>
    <SplitterPanel>下方面板</SplitterPanel>
  </Splitter>
</template>`
