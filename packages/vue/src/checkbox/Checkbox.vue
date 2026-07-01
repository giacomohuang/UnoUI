<script setup lang="ts">
import { clsx } from 'clsx'
import { computed, nextTick, onMounted, ref, useAttrs, watch } from 'vue'

import { getUiAttrClass, getUiAttrStyle, getUiExposeAttrs } from '../attrs'
import { checkbox, type CheckboxProps } from '.'

defineOptions({
  inheritAttrs: false
})

type CheckboxValue = string | number
type CheckboxModelValue = boolean | CheckboxValue[]

/**
 * Checkbox 是编辑器 UI 使用的原生复选框封装。
 *
 * 组件保留 input 原生事件，并通过 v-model 对外同步布尔或数组选中状态。
 */
const props = withDefaults(
  defineProps<{
    /** modelValue 是 v-model 绑定值，可选；传入时优先于 checked。 */
    modelValue?: CheckboxModelValue
    /** checked 是非受控默认选中态，可选。 */
    checked?: boolean
    /** indeterminate 表示部分选中状态，只控制视觉和原生 input 中间态。 */
    indeterminate?: boolean
    /** value 是原生 input value，可选。 */
    value?: string | number
    /** disabled 表示是否禁用交互，可选，默认 false。 */
    disabled?: boolean
    /** size 表示复选框尺寸，可选，默认 md。 */
    size?: CheckboxProps['size']
  }>(),
  {
    modelValue: undefined,
    checked: undefined,
    indeterminate: false,
    disabled: false,
    size: 'md'
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: CheckboxModelValue): void
  (e: 'change', event: Event): void
  (e: 'input', event: Event): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}>()

const attrs = useAttrs()
const inputRef = ref<HTMLInputElement | null>(null)
const internalChecked = ref(!!props.checked)
const hasSizeClass = computed(() => /(?:^|\s)!?(?:size|h|w)-/.test(getUiAttrClass(attrs)))
const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) return props.value !== undefined && props.modelValue.includes(props.value)
  return props.modelValue === undefined ? internalChecked.value : props.modelValue
})
const isIndeterminate = computed(() => props.indeterminate)
const isActive = computed(() => isChecked.value || isIndeterminate.value)
const ariaChecked = computed(() => (isIndeterminate.value ? 'mixed' : Boolean(isChecked.value)))
const checkboxClass = computed(() =>
  clsx(
    getUiAttrClass(attrs),
    checkbox({
      size: hasSizeClass.value ? null : props.size,
      checked: isActive.value,
      disabled: props.disabled
    })
  )
)

watch(
  () => props.checked,
  (checked) => {
    if (props.modelValue === undefined) {
      internalChecked.value = !!checked
    }
  }
)

function syncNativeInputState() {
  if (!inputRef.value) return
  inputRef.value.checked = Boolean(isChecked.value)
  inputRef.value.indeterminate = isIndeterminate.value
}

onMounted(syncNativeInputState)
watch([isChecked, isIndeterminate], () => nextTick(syncNativeInputState))

function syncInputChecked(event: Event) {
  const target = event.target as HTMLInputElement | null
  if (target) {
    target.checked = Boolean(isChecked.value)
    target.indeterminate = isIndeterminate.value
  }
}

function getNextArrayValue(checked: boolean) {
  if (!Array.isArray(props.modelValue) || props.value === undefined) return []
  if (checked) return props.modelValue.includes(props.value) ? props.modelValue : [...props.modelValue, props.value]
  return props.modelValue.filter((item) => item !== props.value)
}

function handleInput(event: Event) {
  if (props.disabled) {
    syncInputChecked(event)
    return
  }
  emit('input', event)
}

/**
 * 同步原生 change 事件到 v-model 和外部监听器。
 *
 * @param event 原生 change 事件，target 必须是复选框 input。
 * @returns 无返回值。
 */
function handleChange(event: Event) {
  if (props.disabled) {
    syncInputChecked(event)
    return
  }
  const checked = (event.target as HTMLInputElement).checked
  internalChecked.value = checked
  emit('update:modelValue', Array.isArray(props.modelValue) ? getNextArrayValue(checked) : checked)
  emit('change', event)
  void nextTick(syncNativeInputState)
}
</script>

<template>
  <label :class="['inline-flex w-fit items-center align-middle', disabled ? 'cursor-not-allowed text-tertiary opacity-70' : 'cursor-pointer text-secondary', $slots.default ? 'gap-2' : '']" :style="getUiAttrStyle(attrs)">
    <span :class="checkboxClass">
      <input
        ref="inputRef"
        v-bind="getUiExposeAttrs(attrs)"
        data-map-ui-checkbox="true"
        type="checkbox"
        :value="value"
        :checked="isChecked"
        :aria-checked="ariaChecked"
        :disabled="disabled"
        class="absolute inset-0 m-0 h-full w-full cursor-inherit opacity-0"
        @change="handleChange"
        @input="handleInput"
        @focus="emit('focus', $event)"
        @blur="emit('blur', $event)"
      />
      <svg v-if="isIndeterminate" aria-hidden="true" viewBox="0 0 16 16" fill="none" class="h-[82%] w-[82%]">
        <path d="M4 8H12" stroke="white" stroke-width="2.4" stroke-linecap="round" />
      </svg>
      <svg v-else-if="isChecked" aria-hidden="true" viewBox="0 0 16 16" fill="none" class="h-[82%] w-[82%]">
        <path d="M3.5 8.25L6.5 11L12.5 5" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
    <span v-if="$slots.default" class="select-none">
      <slot></slot>
    </span>
  </label>
</template>
