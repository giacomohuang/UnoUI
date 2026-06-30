<script setup lang="ts">
import { clsx } from 'clsx'
import { computed, useSlots } from 'vue'
import type { CSSProperties } from 'vue'

import { badgeIndicator, badgeRoot, badgeStatusText, type BadgeSemanticClassNames, type BadgeSemanticStyles, type BadgeSize, type BadgeStatus } from '.'

const props = withDefaults(
  defineProps<{
    /** count 是展示的数字或文本，大于 overflowCount 时显示为 overflowCount+。 */
    count?: number | string
    /** dot 表示只展示小圆点，不展示数字。 */
    dot?: boolean
    /** overflowCount 是数字封顶值。 */
    overflowCount?: number
    /** showZero 控制 count 为 0 时是否仍展示徽标。 */
    showZero?: boolean
    /** status 将 Badge 切换为状态点模式。 */
    status?: BadgeStatus
    /** text 是状态点旁边的说明文本。 */
    text?: string | number
    /** color 自定义徽标或状态点背景色。 */
    color?: string
    /** size 在数字徽标模式下控制大小。 */
    size?: BadgeSize
    /** offset 设置徽标相对默认位置的 [x, y] 偏移，单位 px。 */
    offset?: [number, number]
    /** title 是徽标的原生 title。 */
    title?: string
    /** classNames 定义 root/indicator/text 语义结构类名。 */
    classNames?: BadgeSemanticClassNames
    /** styles 定义 root/indicator/text 语义结构样式。 */
    styles?: BadgeSemanticStyles
  }>(),
  {
    count: undefined,
    dot: false,
    overflowCount: 99,
    showZero: false,
    status: undefined,
    text: undefined,
    color: '',
    size: 'medium',
    offset: undefined,
    title: undefined,
    classNames: undefined,
    styles: undefined
  }
)

const slots = useSlots()
const hasDefaultSlot = computed(() => !!slots.default)
const hasCountSlot = computed(() => !!slots.count)
const isStatusMode = computed(() => !!props.status || !hasDefaultSlot.value && props.text !== undefined && props.count === undefined && !props.dot)
const isZeroCount = computed(() => props.count === 0 || props.count === '0')
const shouldRenderCount = computed(() => {
  if (isStatusMode.value) return false
  if (props.dot) return true
  if (hasCountSlot.value) return true
  if (props.count === undefined || props.count === null || props.count === '') return false
  if (isZeroCount.value && !props.showZero) return false
  return true
})
const displayCount = computed(() => {
  if (typeof props.count === 'number' && Number.isFinite(props.count) && props.count > props.overflowCount) return `${props.overflowCount}+`
  return props.count
})
const indicatorTitle = computed(() => props.title ?? (props.dot ? '' : String(displayCount.value ?? '')))
const rootClass = computed(() => clsx(badgeRoot({ statusMode: isStatusMode.value, standalone: !hasDefaultSlot.value }), props.classNames?.root))
const indicatorMode = computed(() => (isStatusMode.value ? 'status' : props.dot ? 'dot' : 'count'))
const indicatorClass = computed(() =>
  clsx(
    badgeIndicator({
      mode: indicatorMode.value,
      size: props.size,
      anchored: hasDefaultSlot.value && !isStatusMode.value,
      status: isStatusMode.value ? props.status ?? 'default' : 'error'
    }),
    props.classNames?.indicator
  )
)
const textClass = computed(() => clsx(badgeStatusText(), props.classNames?.text))

const normalizeStyle = (value: CSSProperties | string | undefined) => value
const customColorStyle = computed<CSSProperties>(() => (props.color ? { backgroundColor: props.color } : {}))
const indicatorStyle = computed<CSSProperties | string | undefined>(() => {
  const base: CSSProperties = {
    ...customColorStyle.value
  }
  if (hasDefaultSlot.value && !isStatusMode.value) {
    const [x = 0, y = 0] = props.offset ?? []
    base.transform = `translate(calc(50% + ${x}px), calc(-50% + ${y}px))`
  }
  if (typeof props.styles?.indicator === 'string') return props.styles.indicator
  return {
    ...base,
    ...props.styles?.indicator
  }
})
</script>

<template>
  <span data-ui-badge="true" :class="rootClass" :style="normalizeStyle(styles?.root)">
    <template v-if="isStatusMode">
      <span :class="indicatorClass" :style="indicatorStyle" data-ui-badge-indicator="true" :title="title" aria-hidden="true"></span>
      <span v-if="$slots.text || text !== undefined" :class="textClass" :style="normalizeStyle(styles?.text)" data-ui-badge-text="true">
        <slot name="text">{{ text }}</slot>
      </span>
    </template>

    <template v-else>
      <slot></slot>
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="scale-50 opacity-0" enter-to-class="scale-100 opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="scale-100 opacity-100" leave-to-class="scale-50 opacity-0">
        <sup v-if="shouldRenderCount" :class="indicatorClass" :style="indicatorStyle" data-ui-badge-indicator="true" :title="indicatorTitle">
          <span v-if="!dot">
            <slot name="count">{{ displayCount }}</slot>
          </span>
        </sup>
      </Transition>
    </template>
  </span>
</template>
