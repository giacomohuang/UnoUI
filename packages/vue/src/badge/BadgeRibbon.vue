<script setup lang="ts">
import { clsx } from 'clsx'
import { computed } from 'vue'
import type { CSSProperties } from 'vue'

import { badgeRibbonFold, badgeRibbonIndicator, badgeRibbonRoot, type BadgeRibbonColor, type BadgeRibbonPlacement, type BadgeRibbonSemanticClassNames, type BadgeRibbonSemanticStyles } from '.'

const props = withDefaults(
  defineProps<{
    /** text 是缎带中展示的内容；复杂内容可使用 text 插槽。 */
    text?: string | number
    /** color 支持内置颜色名或 CSS 颜色值。 */
    color?: BadgeRibbonColor | string
    /** placement 控制缎带贴在起始侧或结束侧。 */
    placement?: BadgeRibbonPlacement
    /** classNames 定义 root/indicator/content 语义结构类名。 */
    classNames?: BadgeRibbonSemanticClassNames
    /** styles 定义 root/indicator/content 语义结构样式。 */
    styles?: BadgeRibbonSemanticStyles
  }>(),
  {
    text: undefined,
    color: 'brand',
    placement: 'end',
    classNames: undefined,
    styles: undefined
  }
)

const namedColors: BadgeRibbonColor[] = ['brand', 'blue', 'red', 'green', 'yellow', 'orange', 'gray']
const resolvedColor = computed<BadgeRibbonColor>(() => (namedColors.includes(props.color as BadgeRibbonColor) ? (props.color as BadgeRibbonColor) : 'custom'))
const customColorStyle = computed<CSSProperties>(() => (resolvedColor.value === 'custom' && props.color ? { backgroundColor: props.color } : {}))
const rootClass = computed(() => clsx(badgeRibbonRoot(), props.classNames?.root))
const indicatorClass = computed(() => clsx(badgeRibbonIndicator({ color: resolvedColor.value, placement: props.placement }), props.classNames?.indicator))
const foldClass = computed(() => badgeRibbonFold({ placement: props.placement, color: resolvedColor.value }))
const normalizeStyle = (value: CSSProperties | string | undefined) => value
const darkenHexColor = (color: string, ratio = 0.78) => {
  const hex = color.trim().replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return ''
  const channels = [hex.slice(0, 2), hex.slice(2, 4), hex.slice(4, 6)].map((value) => Math.max(0, Math.round(Number.parseInt(value, 16) * ratio)))
  return `#${channels.map((value) => value.toString(16).padStart(2, '0')).join('')}`
}
const indicatorStyle = computed<CSSProperties | string | undefined>(() => {
  if (typeof props.styles?.indicator === 'string') return props.styles.indicator
  return {
    ...customColorStyle.value,
    ...props.styles?.indicator
  }
})
const foldStyle = computed<CSSProperties | string | undefined>(() => {
  if (typeof props.styles?.indicator === 'string') return undefined
  if (resolvedColor.value !== 'custom' || !props.color) return undefined
  const foldColor = darkenHexColor(props.color)
  if (foldColor) return { backgroundColor: foldColor }
  return {
    backgroundColor: props.color,
    filter: 'brightness(0.78)'
  }
})
</script>

<template>
  <div data-ui-badge-ribbon="true" :class="rootClass" :style="normalizeStyle(styles?.root)">
    <slot></slot>
    <div :class="indicatorClass" :style="indicatorStyle" data-ui-badge-ribbon-indicator="true">
      <span :class="classNames?.content" :style="normalizeStyle(styles?.content)" data-ui-badge-ribbon-content="true">
        <slot name="text">{{ text }}</slot>
      </span>
    </div>
    <span :class="foldClass" :style="foldStyle" aria-hidden="true"></span>
  </div>
</template>
