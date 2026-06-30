<script setup lang="ts">
import { clsx } from 'clsx'
import { computed, ref, useAttrs, watch } from 'vue'
import type { CSSProperties } from 'vue'

import { getUiAttrClass, getUiAttrStyle, getUiExposeAttrs } from '../attrs'
import { switchAction, switchLabel, switchPrompt, switchTrack, switchWrapper, type SwitchProps } from '.'

defineOptions({
  inheritAttrs: false
})

type SwitchValue = string | number | boolean
type BeforeChange = () => boolean | Promise<boolean>

const props = withDefaults(
  defineProps<{
    /** modelValue 是 v-model 绑定值，可选；传入时优先于 checked。 */
    modelValue?: SwitchValue
    /** checked 是非受控默认开启态，可选。 */
    checked?: boolean
    /** activeValue 是开启态提交值，可选，默认 true。 */
    activeValue?: SwitchValue
    /** inactiveValue 是关闭态提交值，可选，默认 false。 */
    inactiveValue?: SwitchValue
    /** disabled 表示是否禁用交互，可选，默认 false。 */
    disabled?: boolean
    /** loading 表示是否展示加载态，并暂时禁用交互，可选，默认 false。 */
    loading?: boolean
    /** size 表示开关尺寸，可选，默认 md。 */
    size?: SwitchProps['size']
    /** width 是轨道宽度，可选；数字会按 px 处理。 */
    width?: number | string
    /** activeText 是开启态文案，可选。 */
    activeText?: string
    /** inactiveText 是关闭态文案，可选。 */
    inactiveText?: string
    /** activeIcon 是开启态轨道内图标类名，可选。 */
    activeIcon?: string
    /** inactiveIcon 是关闭态轨道内图标类名，可选。 */
    inactiveIcon?: string
    /** activeActionIcon 是开启态圆点内图标类名，可选。 */
    activeActionIcon?: string
    /** inactiveActionIcon 是关闭态圆点内图标类名，可选。 */
    inactiveActionIcon?: string
    /** inlinePrompt 表示是否把 activeText/inactiveText 或图标展示在轨道内。 */
    inlinePrompt?: boolean
    /** activeColor 是开启态轨道自定义颜色，可选。 */
    activeColor?: string
    /** inactiveColor 是关闭态轨道自定义颜色，可选。 */
    inactiveColor?: string
    /** beforeChange 在切换前执行，返回 false 或 reject 时阻止切换。 */
    beforeChange?: BeforeChange
    /** name 是原生 input name，可选。 */
    name?: string
    /** id 是原生 input id，可选。 */
    id?: string
  }>(),
  {
    modelValue: undefined,
    checked: undefined,
    activeValue: true,
    inactiveValue: false,
    disabled: false,
    loading: false,
    size: 'md',
    width: undefined,
    activeText: '',
    inactiveText: '',
    activeIcon: '',
    inactiveIcon: '',
    activeActionIcon: '',
    inactiveActionIcon: '',
    inlinePrompt: false,
    activeColor: '',
    inactiveColor: '',
    beforeChange: undefined,
    name: undefined,
    id: undefined
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: SwitchValue): void
  (e: 'input', value: SwitchValue, event: Event): void
  (e: 'change', value: SwitchValue, event: Event): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}>()

const attrs = useAttrs()
const internalChecked = ref(!!props.checked)
const switching = ref(false)
const isDisabled = computed(() => props.disabled || props.loading || switching.value)
const isChecked = computed(() => (props.modelValue === undefined ? internalChecked.value : Object.is(props.modelValue, props.activeValue)))
const currentValue = computed(() => (isChecked.value ? props.activeValue : props.inactiveValue))
const currentPromptText = computed(() => (isChecked.value ? props.activeText : props.inactiveText))
const currentPromptIcon = computed(() => (isChecked.value ? props.activeIcon : props.inactiveIcon))
const currentActionIcon = computed(() => (isChecked.value ? props.activeActionIcon : props.inactiveActionIcon))
const hasInlinePrompt = computed(() => props.inlinePrompt && (!!currentPromptText.value || !!currentPromptIcon.value))

const wrapperClass = computed(() =>
  clsx(
    getUiAttrClass(attrs),
    switchWrapper({
      size: props.size,
      disabled: isDisabled.value
    })
  )
)
const trackClass = computed(() =>
  switchTrack({
    size: props.size,
    checked: isChecked.value,
    disabled: isDisabled.value
  })
)
const actionClass = computed(() =>
  switchAction({
    size: props.size,
    checked: isChecked.value,
    disabled: isDisabled.value
  })
)
const promptClass = computed(() =>
  switchPrompt({
    size: props.size,
    checked: isChecked.value
  })
)
const inactiveLabelClass = computed(() =>
  switchLabel({
    checked: !isChecked.value,
    disabled: isDisabled.value
  })
)
const activeLabelClass = computed(() =>
  switchLabel({
    checked: isChecked.value,
    disabled: isDisabled.value
  })
)

const getSizeValue = (value: number | string | undefined) => {
  if (value === undefined || value === '') return undefined
  return typeof value === 'number' ? `${value}px` : value
}

const trackStyle = computed<CSSProperties>(() => {
  const color = isChecked.value ? props.activeColor : props.inactiveColor
  return {
    width: getSizeValue(props.width),
    backgroundColor: color || undefined,
    borderColor: color || undefined
  }
})

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

async function canSwitch() {
  if (!props.beforeChange) return true
  try {
    const result = await props.beforeChange()
    return result !== false
  } catch {
    return false
  }
}

function commitChecked(checked: boolean, event: Event) {
  internalChecked.value = checked
  const nextValue = checked ? props.activeValue : props.inactiveValue
  emit('update:modelValue', nextValue)
  emit('input', nextValue, event)
  emit('change', nextValue, event)
}

function handleInput(event: Event) {
  if (isDisabled.value) {
    syncInputChecked(event)
  }
}

/**
 * handleChange 在提交切换前执行 beforeChange，确保异步阻止时原生 input 状态被回滚。
 */
async function handleChange(event: Event) {
  if (isDisabled.value) {
    syncInputChecked(event)
    return
  }

  const checked = (event.target as HTMLInputElement).checked
  if (props.beforeChange) {
    syncInputChecked(event)
    switching.value = true
    const approved = await canSwitch()
    switching.value = false
    if (!approved) return
  }
  commitChecked(checked, event)
}
</script>

<template>
  <label :class="wrapperClass" :style="getUiAttrStyle(attrs)">
    <span v-if="inactiveText && !inlinePrompt" :class="inactiveLabelClass">{{ inactiveText }}</span>
    <span :class="trackClass" :style="trackStyle">
      <input
        v-bind="getUiExposeAttrs(attrs)"
        :id="id"
        data-map-ui-switch="true"
        type="checkbox"
        role="switch"
        :aria-checked="isChecked"
        :name="name"
        :value="String(currentValue)"
        :checked="isChecked"
        :disabled="isDisabled"
        class="absolute inset-0 z-20 m-0 h-full w-full cursor-inherit opacity-0"
        @change="handleChange"
        @input="handleInput"
        @focus="emit('focus', $event)"
        @blur="emit('blur', $event)"
      />
      <span v-if="hasInlinePrompt" :class="promptClass">
        <slot v-if="isChecked && $slots.active" name="active"></slot>
        <slot v-else-if="!isChecked && $slots.inactive" name="inactive"></slot>
        <span v-else-if="currentPromptIcon" :class="currentPromptIcon" class="size-3 shrink-0"></span>
        <span v-else class="truncate">{{ currentPromptText }}</span>
      </span>
      <span :class="actionClass" aria-hidden="true">
        <span v-if="loading || switching" class="i-lucide:loader-2 size-[82%] animate-spin"></span>
        <slot v-else-if="isChecked && $slots['active-action']" name="active-action"></slot>
        <slot v-else-if="!isChecked && $slots['inactive-action']" name="inactive-action"></slot>
        <span v-else-if="currentActionIcon" :class="currentActionIcon" class="size-[82%]"></span>
      </span>
    </span>
    <span v-if="activeText && !inlinePrompt" :class="activeLabelClass">{{ activeText }}</span>
  </label>
</template>
