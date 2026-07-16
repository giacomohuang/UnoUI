<script setup lang="ts">
import { clsx } from 'clsx'
import { computed, inject, ref, useAttrs, watch } from 'vue'

import { getUiAttrClass, getUiAttrStyle, getUiExposeAttrs } from '../attrs'
import { radio, radioButton, radioDot, radioGroupContextKey, radioLabel, type RadioButtonStyle, type RadioSize, type RadioType, type RadioValue } from '.'

defineOptions({
  inheritAttrs: false
})

const props = withDefaults(
  defineProps<{
    /** checked 是非受控单个 Radio 的默认选中态；组内选中态由 RadioGroup 控制。 */
    checked?: boolean
    /** value 是当前 Radio 代表的值，组内选中时会同步到 RadioGroup modelValue。 */
    value?: RadioValue
    /** disabled 表示是否禁用交互，可选，默认 false。 */
    disabled?: boolean
    /** size 表示单选框尺寸；未传时继承 RadioGroup，组外默认 md。 */
    size?: RadioSize
    /** border 表示是否展示带边框样式，可选，默认 false。 */
    border?: boolean
    /** type 表示视觉形态；未传时继承 RadioGroup，组外默认 radio。 */
    type?: RadioType
    /** buttonStyle 表示按钮形态的选中样式；未传时继承 RadioGroup，组外默认 outline。 */
    buttonStyle?: RadioButtonStyle
    /** name 是原生 radio name；未传时继承 RadioGroup。 */
    name?: string
  }>(),
  {
    checked: undefined,
    value: true,
    disabled: false,
    border: false
  }
)

const emit = defineEmits<{
  (e: 'change', value: RadioValue, event: Event): void
  (e: 'input', event: Event): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}>()

const attrs = useAttrs()
const groupContext = inject(radioGroupContextKey, null)
const inputRef = ref<HTMLInputElement>()
const internalChecked = ref(!!props.checked)
const resolvedDisabled = computed(() => props.disabled || !!groupContext?.disabled.value)
const resolvedSize = computed(() => props.size ?? groupContext?.size.value ?? 'md')
const resolvedType = computed(() => props.type ?? groupContext?.type.value ?? 'radio')
const resolvedButtonStyle = computed(() => props.buttonStyle ?? groupContext?.buttonStyle.value ?? 'outline')
const resolvedName = computed(() => props.name ?? groupContext?.name.value)
const isChecked = computed(() => (groupContext ? groupContext.modelValue.value === props.value : internalChecked.value))
const labelClass = computed(() =>
  clsx(
    getUiAttrClass(attrs),
    resolvedType.value === 'button'
      ? radioButton({
          size: resolvedSize.value,
          buttonStyle: resolvedButtonStyle.value,
          checked: isChecked.value,
          disabled: resolvedDisabled.value
        })
      : radioLabel({
          size: resolvedSize.value,
          border: props.border,
          checked: isChecked.value,
          disabled: resolvedDisabled.value
        })
  )
)
const radioClass = computed(() =>
  radio({
    size: resolvedSize.value,
    checked: isChecked.value,
    disabled: resolvedDisabled.value
  })
)
const dotClass = computed(() =>
  radioDot({
    size: resolvedSize.value,
    disabled: resolvedDisabled.value
  })
)

watch(
  () => props.checked,
  (checked) => {
    if (!groupContext) {
      internalChecked.value = !!checked
    }
  }
)

function syncInputChecked(event: Event) {
  const target = event.target as HTMLInputElement | null
  if (target) target.checked = isChecked.value
}

function handleInput(event: Event) {
  if (resolvedDisabled.value) {
    syncInputChecked(event)
    return
  }
  emit('input', event)
}

/**
 * handleChange 将原生 radio 选中变化同步给 RadioGroup。
 *
 * 单个 Radio 只维护自身非受控选中态；组内受控值由 RadioGroup 统一管理。
 */
function handleChange(event: Event) {
  if (resolvedDisabled.value) {
    syncInputChecked(event)
    return
  }
  const checked = (event.target as HTMLInputElement).checked
  if (!checked) return
  internalChecked.value = true
  emit('change', props.value, event)
  groupContext?.updateValue(props.value, event)
}

function focus() {
  inputRef.value?.focus()
}

function blur() {
  inputRef.value?.blur()
}

defineExpose({
  blur,
  focus
})
</script>

<template>
  <label
    :class="labelClass"
    :data-checked="resolvedType === 'button' ? isChecked : undefined"
    :data-disabled="resolvedType === 'button' ? resolvedDisabled : undefined"
    :style="getUiAttrStyle(attrs)"
  >
    <input
      v-if="resolvedType === 'button'"
      ref="inputRef"
      v-bind="getUiExposeAttrs(attrs)"
      data-map-ui-radio="true"
      type="radio"
      :name="resolvedName"
      :value="String(value)"
      :checked="isChecked"
      :disabled="resolvedDisabled"
      class="absolute inset-0 m-0 h-full w-full cursor-inherit opacity-0"
      @change="handleChange"
      @input="handleInput"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    />
    <span v-if="resolvedType === 'radio'" :class="radioClass">
      <input
        ref="inputRef"
        v-bind="getUiExposeAttrs(attrs)"
        data-map-ui-radio="true"
        type="radio"
        :name="resolvedName"
        :value="String(value)"
        :checked="isChecked"
        :disabled="resolvedDisabled"
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
