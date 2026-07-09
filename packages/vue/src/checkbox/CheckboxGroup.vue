<script setup lang="ts">
import { clsx } from 'clsx'
import { computed, provide, toRef, useAttrs } from 'vue'

import { getUiAttrClass, getUiAttrStyle, getUiExposeAttrs } from '../attrs'
import { checkboxGroup, checkboxGroupContextKey, type CheckboxGroupDirection, type CheckboxSize, type CheckboxValue } from '.'

defineOptions({
  inheritAttrs: false
})

const props = withDefaults(
  defineProps<{
    /** modelValue 是组内当前选中值数组。 */
    modelValue?: CheckboxValue[]
    /** disabled 会禁用组内所有 Checkbox。 */
    disabled?: boolean
    /** size 统一设置组内 Checkbox 尺寸，可被子项显式 size 覆盖。 */
    size?: CheckboxSize
    /** name 统一设置组内原生 checkbox name。 */
    name?: string
    /** direction 控制组内排列方向。 */
    direction?: CheckboxGroupDirection
  }>(),
  {
    modelValue: () => [],
    disabled: false,
    size: 'md',
    name: undefined,
    direction: 'horizontal'
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: CheckboxValue[]): void
  (e: 'change', value: CheckboxValue[], event: Event): void
}>()

const attrs = useAttrs()
const groupClass = computed(() =>
  clsx(
    getUiAttrClass(attrs),
    checkboxGroup({
      direction: props.direction,
      size: props.size,
      disabled: props.disabled
    })
  )
)

function updateValue(value: CheckboxValue, checked: boolean, event: Event) {
  const currentValue = props.modelValue ?? []
  const nextValue = checked
    ? currentValue.includes(value)
      ? currentValue
      : [...currentValue, value]
    : currentValue.filter((item) => item !== value)
  emit('update:modelValue', nextValue)
  emit('change', nextValue, event)
}

provide(checkboxGroupContextKey, {
  modelValue: toRef(props, 'modelValue'),
  disabled: toRef(props, 'disabled'),
  size: toRef(props, 'size'),
  name: toRef(props, 'name'),
  updateValue
})
</script>

<template>
  <div
    v-bind="getUiExposeAttrs(attrs)"
    role="group"
    data-ui-checkbox-group="true"
    :data-direction="direction"
    :aria-disabled="disabled || undefined"
    :class="groupClass"
    :style="getUiAttrStyle(attrs)"
  >
    <slot></slot>
  </div>
</template>
