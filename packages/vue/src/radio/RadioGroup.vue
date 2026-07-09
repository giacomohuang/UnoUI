<script setup lang="ts">
import { clsx } from 'clsx'
import { computed, provide, toRef, useAttrs, useId } from 'vue'

import { getUiAttrClass, getUiAttrStyle, getUiExposeAttrs } from '../attrs'
import { radioGroup, radioGroupContextKey, type RadioButtonStyle, type RadioGroupDirection, type RadioSize, type RadioType, type RadioValue } from '.'

defineOptions({
  inheritAttrs: false
})

const props = withDefaults(
  defineProps<{
    /** modelValue 是组内当前选中值。 */
    modelValue?: RadioValue
    /** disabled 会禁用组内所有 Radio。 */
    disabled?: boolean
    /** size 统一设置组内 Radio 尺寸，可被子项显式 size 覆盖。 */
    size?: RadioSize
    /** type 统一设置组内 Radio 视觉形态，可被子项显式 type 覆盖。 */
    type?: RadioType
    /** buttonStyle 统一设置按钮形态选中样式，可被子项显式 buttonStyle 覆盖。 */
    buttonStyle?: RadioButtonStyle
    /** name 统一设置原生 radio name。 */
    name?: string
    /** direction 控制组内排列方向。 */
    direction?: RadioGroupDirection
  }>(),
  {
    modelValue: undefined,
    disabled: false,
    size: 'md',
    type: 'radio',
    buttonStyle: 'outline',
    name: undefined,
    direction: 'horizontal'
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: RadioValue): void
  (e: 'change', value: RadioValue, event: Event): void
}>()

const attrs = useAttrs()
const fallbackName = `ui-radio-group-${useId()}`
const resolvedName = computed(() => props.name ?? fallbackName)
const groupClass = computed(() =>
  clsx(
    getUiAttrClass(attrs),
    radioGroup({
      type: props.type,
      direction: props.direction,
      size: props.size,
      disabled: props.disabled
    })
  )
)

function updateValue(value: RadioValue, event: Event) {
  emit('update:modelValue', value)
  emit('change', value, event)
}

provide(radioGroupContextKey, {
  modelValue: toRef(props, 'modelValue'),
  disabled: toRef(props, 'disabled'),
  size: toRef(props, 'size'),
  type: toRef(props, 'type'),
  buttonStyle: toRef(props, 'buttonStyle'),
  name: resolvedName,
  updateValue
})
</script>

<template>
  <div
    v-bind="getUiExposeAttrs(attrs)"
    role="radiogroup"
    data-ui-radio-group="true"
    :data-type="type"
    :data-direction="direction"
    :aria-disabled="disabled || undefined"
    :class="groupClass"
    :style="getUiAttrStyle(attrs)"
  >
    <slot></slot>
  </div>
</template>

<style scoped>
.ui-radio-group--button[data-direction='horizontal'] :deep(> .ui-radio-button:has(+ .ui-radio-button)) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.ui-radio-group--button[data-direction='horizontal'] :deep(> .ui-radio-button + .ui-radio-button) {
  margin-left: -1px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.ui-radio-group--button[data-direction='horizontal'] :deep(> .ui-radio-button + .ui-radio-button:has(+ .ui-radio-button)) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.ui-radio-group--button[data-direction='vertical'] :deep(> .ui-radio-button:has(+ .ui-radio-button)) {
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

.ui-radio-group--button[data-direction='vertical'] :deep(> .ui-radio-button + .ui-radio-button) {
  margin-top: -1px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.ui-radio-group--button[data-direction='vertical'] :deep(> .ui-radio-button + .ui-radio-button:has(+ .ui-radio-button)) {
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}
</style>
