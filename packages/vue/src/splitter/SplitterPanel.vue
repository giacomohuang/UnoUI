<script setup lang="ts">
import { clsx } from 'clsx'
import { computed, useAttrs } from 'vue'
import type { StyleValue } from 'vue'

import { splitterPanel, type SplitterOrientation, type SplitterPanelCollapsible, type SplitterSize } from '.'
import { getUiExposeAttrs } from '../attrs'

defineOptions({
  inheritAttrs: false
})

const props = withDefaults(
  defineProps<{
    /** size 是受控面板大小，数字表示 px，字符串支持百分比。 */
    size?: SplitterSize
    /** defaultSize 是非受控初始大小，数字表示 px，字符串支持百分比。 */
    defaultSize?: SplitterSize
    /** min 是拖拽时允许的最小尺寸。 */
    min?: SplitterSize
    /** max 是拖拽时允许的最大尺寸。 */
    max?: SplitterSize
    /** resizable 表示相邻分隔条是否允许拖拽。 */
    resizable?: boolean
    /** collapsible 配置面板从起始侧或结束侧快速折叠。 */
    collapsible?: SplitterPanelCollapsible
    /** destroyOnHidden 覆盖父级折叠内容销毁策略。 */
    destroyOnHidden?: boolean
    /** @internal Splitter 注入的面板占比。 */
    splitterSize?: number
    /** @internal Splitter 注入的主轴方向。 */
    splitterOrientation?: SplitterOrientation
    /** @internal Splitter 注入的折叠状态。 */
    splitterCollapsed?: boolean
    /** @internal Splitter 注入的全局内容销毁策略。 */
    splitterDestroyOnHidden?: boolean
    /** @internal Splitter 注入的折叠动画状态。 */
    splitterMotion?: boolean
  }>(),
  {
    size: undefined,
    defaultSize: undefined,
    min: undefined,
    max: undefined,
    resizable: true,
    collapsible: false,
    destroyOnHidden: undefined,
    splitterSize: undefined,
    splitterOrientation: 'horizontal',
    splitterCollapsed: false,
    splitterDestroyOnHidden: false,
    splitterMotion: false
  }
)

const attrs = useAttrs()
const exposeAttrs = computed(() => getUiExposeAttrs(attrs))
const panelClass = computed(() => clsx(splitterPanel({ collapsed: props.splitterCollapsed }), attrs.class as string | undefined))
const panelStyle = computed<StyleValue>(() => {
  const basis = props.splitterSize === undefined ? undefined : `${props.splitterSize * 100}%`
  const dimensionStyle = basis ? (props.splitterOrientation === 'vertical' ? { flex: `0 0 ${basis}`, height: basis, width: '100%' } : { flex: `0 0 ${basis}`, height: '100%', width: basis }) : { flex: '1 1 0%' }
  const transitionStyle = props.splitterMotion ? { transition: 'flex-basis 180ms ease, width 180ms ease, height 180ms ease' } : undefined
  const attrsStyle = attrs.style as StyleValue | undefined

  return [dimensionStyle, transitionStyle, attrsStyle]
})
const shouldRenderContent = computed(() => !(props.splitterCollapsed && (props.destroyOnHidden ?? props.splitterDestroyOnHidden)))
</script>

<template>
  <div v-bind="exposeAttrs" data-ui-splitter-panel="true" :aria-hidden="splitterCollapsed || undefined" :class="panelClass" :style="panelStyle">
    <slot v-if="shouldRenderContent"></slot>
  </div>
</template>
