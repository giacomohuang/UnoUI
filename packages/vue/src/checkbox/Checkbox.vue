<script setup lang="ts">
import { clsx } from 'clsx'
import { computed, inject, nextTick, onMounted, ref, useAttrs, watch } from 'vue'

import { getUiAttrClass, getUiAttrStyle, getUiExposeAttrs } from '../attrs'
import { checkbox, checkboxGroupContextKey, type CheckboxSize, type CheckboxValue } from '.'

defineOptions({
  inheritAttrs: false
})

/**
 * Checkbox 是编辑器 UI 使用的原生复选框封装。
 *
 * 组件保留 input 原生事件；组内受控值由 CheckboxGroup 统一管理。
 */
const props = withDefaults(
  defineProps<{
    /** checked 是非受控单个 Checkbox 的默认选中态；组内选中态由 CheckboxGroup 控制。 */
    checked?: boolean
    /** indeterminate 表示部分选中状态，只控制视觉和原生 input 中间态。 */
    indeterminate?: boolean
    /** value 是当前 Checkbox 代表的值，组内选中时会同步到 CheckboxGroup modelValue。 */
    value?: CheckboxValue
    /** disabled 表示是否禁用交互，可选，默认 false。 */
    disabled?: boolean
    /** size 表示复选框尺寸；未传时继承 CheckboxGroup，组外默认 md。 */
    size?: CheckboxSize
    /** name 是原生 checkbox name；未传时继承 CheckboxGroup。 */
    name?: string
  }>(),
  {
    checked: undefined,
    indeterminate: false,
    disabled: false
  }
)

const emit = defineEmits<{
  (e: 'change', checked: boolean, event: Event): void
  (e: 'input', event: Event): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}>()

const attrs = useAttrs()
const groupContext = inject(checkboxGroupContextKey, null)
const inputRef = ref<HTMLInputElement | null>(null)
const internalChecked = ref(!!props.checked)
const hasSizeClass = computed(() => /(?:^|\s)!?(?:size|h|w)-/.test(getUiAttrClass(attrs)))
const resolvedDisabled = computed(() => props.disabled || !!groupContext?.disabled.value)
const resolvedSize = computed(() => props.size ?? groupContext?.size.value ?? 'md')
const resolvedName = computed(() => props.name ?? groupContext?.name.value)
const isChecked = computed(() => (groupContext && props.value !== undefined ? groupContext.modelValue.value.includes(props.value) : internalChecked.value))
const isIndeterminate = computed(() => props.indeterminate)
const isActive = computed(() => isChecked.value || isIndeterminate.value)
const ariaChecked = computed(() => (isIndeterminate.value ? 'mixed' : Boolean(isChecked.value)))
const checkboxClass = computed(() =>
  clsx(
    getUiAttrClass(attrs),
    checkbox({
      size: hasSizeClass.value ? null : resolvedSize.value,
      checked: isActive.value,
      disabled: resolvedDisabled.value
    })
  )
)

watch(
  () => props.checked,
  (checked) => {
    if (!groupContext) {
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

function handleInput(event: Event) {
  if (resolvedDisabled.value) {
    syncInputChecked(event)
    return
  }
  emit('input', event)
}

/**
 * 同步原生 change 事件到 CheckboxGroup 和外部监听器。
 *
 * @param event 原生 change 事件，target 必须是复选框 input。
 * @returns 无返回值。
 */
function handleChange(event: Event) {
  if (resolvedDisabled.value) {
    syncInputChecked(event)
    return
  }
  const checked = (event.target as HTMLInputElement).checked
  internalChecked.value = checked
  emit('change', checked, event)
  if (groupContext && props.value !== undefined) {
    groupContext.updateValue(props.value, checked, event)
  }
  void nextTick(syncNativeInputState)
}
</script>

<template>
  <label :class="['inline-flex w-fit items-center align-middle', resolvedDisabled ? 'cursor-not-allowed text-tertiary opacity-70' : 'cursor-pointer text-secondary', $slots.default ? 'gap-2' : '']" :style="getUiAttrStyle(attrs)">
    <span :class="checkboxClass">
      <input
        ref="inputRef"
        v-bind="getUiExposeAttrs(attrs)"
        data-map-ui-checkbox="true"
        type="checkbox"
        :name="resolvedName"
        :value="value"
        :checked="isChecked"
        :aria-checked="ariaChecked"
        :disabled="resolvedDisabled"
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
