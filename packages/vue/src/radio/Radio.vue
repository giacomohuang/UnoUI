<script setup lang="ts">
import { clsx } from 'clsx'
import { computed, ref, useAttrs, watch } from 'vue'

import { getUiAttrClass, getUiAttrStyle, getUiExposeAttrs } from '../attrs'
import { radio, radioDot, radioLabel, type RadioProps } from '.'

defineOptions({
  inheritAttrs: false
})

type RadioValue = string | number | boolean

const props = withDefaults(
  defineProps<{
    /** modelValue 是 v-model 绑定的当前选中值，可选；传入时优先于 checked。 */
    modelValue?: RadioValue
    /** checked 是非受控默认选中态，可选。 */
    checked?: boolean
    /** value 是当前 Radio 代表的值，可选，默认 true。 */
    value?: RadioValue
    /** disabled 表示是否禁用交互，可选，默认 false。 */
    disabled?: boolean
    /** size 表示单选框尺寸，可选，默认 md。 */
    size?: RadioProps['size']
    /** border 表示是否展示带边框样式，可选，默认 false。 */
    border?: boolean
    /** name 是原生 radio name，可选；同组建议使用相同 name。 */
    name?: string
  }>(),
  {
    modelValue: undefined,
    checked: undefined,
    value: true,
    disabled: false,
    size: 'md',
    border: false,
    name: undefined
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: RadioValue): void
  (e: 'change', value: RadioValue, event: Event): void
  (e: 'input', event: Event): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}>()

const attrs = useAttrs()
const internalChecked = ref(!!props.checked)
const isChecked = computed(() => (props.modelValue === undefined ? internalChecked.value : props.modelValue === props.value))
const labelClass = computed(() =>
  clsx(
    getUiAttrClass(attrs),
    radioLabel({
      size: props.size,
      border: props.border,
      checked: isChecked.value,
      disabled: props.disabled
    })
  )
)
const radioClass = computed(() =>
  radio({
    size: props.size,
    checked: isChecked.value,
    disabled: props.disabled
  })
)
const dotClass = computed(() =>
  radioDot({
    size: props.size,
    disabled: props.disabled
  })
)

watch(
  () => props.checked,
  (checked) => {
    if (props.modelValue === undefined) {
      internalChecked.value = !!checked
    }
  }
)

function syncInputChecked(event: Event) {
  const target = event.target as HTMLInputElement | null
  if (target) target.checked = isChecked.value
}

function handleInput(event: Event) {
  if (props.disabled) {
    syncInputChecked(event)
    return
  }
  emit('input', event)
}

/**
 * handleChange 将原生 radio 选中变化同步到 v-model。
 *
 * 多个 Radio 绑定同一个 modelValue 时，原生单选语义和 v-model 共同组成单选组。
 */
function handleChange(event: Event) {
  if (props.disabled) {
    syncInputChecked(event)
    return
  }
  const checked = (event.target as HTMLInputElement).checked
  if (!checked) return
  internalChecked.value = true
  emit('update:modelValue', props.value)
  emit('change', props.value, event)
}
</script>

<template>
  <label :class="labelClass" :style="getUiAttrStyle(attrs)">
    <span :class="radioClass">
      <input
        v-bind="getUiExposeAttrs(attrs)"
        data-map-ui-radio="true"
        type="radio"
        :name="name"
        :value="String(value)"
        :checked="isChecked"
        :disabled="disabled"
        class="absolute inset-0 m-0 h-full w-full cursor-inherit opacity-0"
        @change="handleChange"
        @input="handleInput"
        @focus="emit('focus', $event)"
        @blur="emit('blur', $event)"
      />
      <span v-if="isChecked" aria-hidden="true" :class="dotClass"></span>
    </span>
    <span v-if="$slots.default" class="select-none">
      <slot></slot>
    </span>
  </label>
</template>
