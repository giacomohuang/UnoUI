<script setup lang="ts">
import { clsx } from 'clsx'
import { computed, onBeforeUnmount, ref, useSlots } from 'vue'
import type { CSSProperties } from 'vue'

import {
  alertActions,
  alertCloseButton,
  alertDescription,
  alertIcon,
  alertRoot,
  alertSection,
  alertTitle,
  type AlertClosableOptions,
  type AlertSemanticClassNames,
  type AlertSemanticStyles,
  type AlertType,
  type AlertVariant
} from '.'

const props = withDefaults(
  defineProps<{
    /** title 是警告提示主内容。 */
    title?: string | number
    /** description 是警告提示辅助说明。 */
    description?: string | number
    /** type 指定 success、info、warning、error 四种语义状态。 */
    type?: AlertType
    /** variant 指定边框样式或填充样式。 */
    variant?: AlertVariant
    /** banner 表示顶部公告形态，默认展示图标且类型为 warning。 */
    banner?: boolean
    /** showIcon 控制是否展示状态图标，banner 模式默认展示。 */
    showIcon?: boolean
    /** icon 是自定义 UnoCSS/Iconify 图标类名，仅 showIcon 生效。 */
    icon?: string
    /** action 是简短操作文本；复杂操作建议使用 action 插槽。 */
    action?: string | number
    /** closable 控制关闭按钮；对象形式可配置关闭图标和回调。 */
    closable?: boolean | AlertClosableOptions
    /** closeAriaLabel 是关闭按钮无障碍文案。 */
    closeAriaLabel?: string
    /** classNames 定义 root/icon/section/title/description/actions/close 语义结构类名。 */
    classNames?: AlertSemanticClassNames
    /** styles 定义 root/icon/section/title/description/actions/close 语义结构样式。 */
    styles?: AlertSemanticStyles
  }>(),
  {
    title: undefined,
    description: undefined,
    type: undefined,
    variant: 'outlined',
    banner: false,
    showIcon: undefined,
    icon: '',
    action: undefined,
    closable: false,
    closeAriaLabel: '关闭',
    classNames: undefined,
    styles: undefined
  }
)

const emit = defineEmits<{
  (e: 'close', event: MouseEvent): void
  (e: 'afterClose'): void
}>()

const slots = useSlots()
const rendered = ref(true)
const closing = ref(false)
let closeTimer: number | undefined

const resolvedType = computed<AlertType>(() => props.type ?? (props.banner ? 'warning' : 'info'))
const resolvedShowIcon = computed(() => props.showIcon ?? props.banner)
const hasDescription = computed(() => !!slots.description || props.description !== undefined && props.description !== null && String(props.description) !== '')
const hasAction = computed(() => !!slots.action || props.action !== undefined && props.action !== null && String(props.action) !== '')
const closableOptions = computed(() => (typeof props.closable === 'object' ? props.closable : undefined))
const isClosable = computed(() => !!props.closable)
const resolvedCloseIcon = computed(() => closableOptions.value?.closeIcon || 'i-lucide:x')
const resolvedCloseAriaLabel = computed(() => closableOptions.value?.closeAriaLabel || props.closeAriaLabel)
const defaultIcon = computed(() => {
  const iconMap: Record<AlertType, string> = {
    success: 'i-lucide:circle-check',
    info: 'i-lucide:info',
    warning: 'i-lucide:triangle-alert',
    error: 'i-lucide:circle-x'
  }
  return props.icon || iconMap[resolvedType.value]
})

const normalizeStyle = (value: CSSProperties | string | undefined) => value
const rootClass = computed(() =>
  clsx(
    alertRoot({
      type: resolvedType.value,
      variant: props.variant,
      banner: props.banner,
      withDescription: hasDescription.value,
      closing: closing.value
    }),
    props.classNames?.root
  )
)
const iconClass = computed(() => clsx(alertIcon({ type: resolvedType.value, withDescription: hasDescription.value }), props.classNames?.icon))
const sectionClass = computed(() => clsx(alertSection(), props.classNames?.section))
const titleClass = computed(() => clsx(alertTitle({ withDescription: hasDescription.value }), props.classNames?.title))
const descriptionClass = computed(() => clsx(alertDescription(), props.classNames?.description))
const actionsClass = computed(() => clsx(alertActions(), props.classNames?.actions))
const closeClass = computed(() => clsx(alertCloseButton(), props.classNames?.close))

/** close 执行关闭动画并派发结束事件。 */
function close(event: MouseEvent) {
  if (closing.value) return
  closableOptions.value?.onClose?.(event)
  emit('close', event)
  closing.value = true
  closeTimer = window.setTimeout(() => {
    rendered.value = false
    closableOptions.value?.afterClose?.()
    emit('afterClose')
  }, 200)
}

onBeforeUnmount(() => {
  if (closeTimer) window.clearTimeout(closeTimer)
})
</script>

<template>
  <div v-if="rendered" data-ui-alert="true" role="alert" :data-type="resolvedType" :class="rootClass" :style="normalizeStyle(styles?.root)">
    <span v-if="resolvedShowIcon" :class="iconClass" :style="normalizeStyle(styles?.icon)" data-ui-alert-icon="true" aria-hidden="true">
      <slot name="icon">
        <span :class="defaultIcon" class="size-[1em]"></span>
      </slot>
    </span>

    <div :class="sectionClass" :style="normalizeStyle(styles?.section)">
      <div :class="titleClass" :style="normalizeStyle(styles?.title)" data-ui-alert-title="true">
        <slot name="title">{{ title }}</slot>
      </div>
      <div v-if="hasDescription" :class="descriptionClass" :style="normalizeStyle(styles?.description)" data-ui-alert-description="true">
        <slot name="description">{{ description }}</slot>
      </div>
    </div>

    <div v-if="hasAction" :class="actionsClass" :style="normalizeStyle(styles?.actions)" data-ui-alert-actions="true">
      <slot name="action">{{ action }}</slot>
    </div>

    <button v-if="isClosable" type="button" :aria-label="resolvedCloseAriaLabel" :class="closeClass" :style="normalizeStyle(styles?.close)" data-ui-alert-close="true" @click="close">
      <slot name="closeIcon">
        <span :class="resolvedCloseIcon" class="size-3.5"></span>
      </slot>
    </button>
  </div>
</template>
