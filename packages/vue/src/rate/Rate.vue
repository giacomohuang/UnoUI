<script setup lang="ts">
import { clsx } from 'clsx'
import { computed, nextTick, onMounted, ref, useAttrs, watch } from 'vue'

import { getUiAttrClass, getUiAttrStyle, getUiExposeAttrs } from '../attrs'
import { Tooltip } from '../tooltip'

import { rateActiveLayer, rateCharacter, rateCharacterLayer, rateItem, rateRoot, type RateCharacterSlotProps, type RateProps } from '.'

defineOptions({
  inheritAttrs: false
})

interface RateItemState extends RateCharacterSlotProps {
  fillPercent: number
  fullActive: boolean
  tooltip?: string
}

const props = withDefaults(
  defineProps<{
    /** modelValue 是本地 v-model 绑定值。 */
    modelValue?: number
    /** count 是评分字符总数。 */
    count?: number
    /** allowHalf 表示是否允许半选。 */
    allowHalf?: boolean
    /** clearable 表示再次点击当前值时是否清空。 */
    clearable?: boolean
    /** autofocus 表示挂载后自动聚焦。 */
    autofocus?: boolean
    /** character 是自定义评分字符；更复杂内容可使用 character 插槽。 */
    character?: string
    /** disabled 表示只读禁用。 */
    disabled?: boolean
    /** tooltips 是每个评分字符对应的悬浮提示。 */
    tooltips?: string[]
    /** size 表示评分字符尺寸。 */
    size?: RateProps['size']
    /** tabindex 是根节点键盘聚焦顺序，禁用时固定为 -1。 */
    tabindex?: number | string
  }>(),
  {
    modelValue: undefined,
    count: 5,
    allowHalf: false,
    clearable: true,
    autofocus: false,
    character: '',
    disabled: false,
    tooltips: undefined,
    size: 'md',
    tabindex: 0
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'change', value: number, event?: MouseEvent | KeyboardEvent): void
  (e: 'hoverChange', value: number | undefined): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'keydown', event: KeyboardEvent): void
}>()

const attrs = useAttrs()
const rateRef = ref<HTMLElement | null>(null)
const focused = ref(false)
const hoverValue = ref<number | undefined>(undefined)
const internalValue = ref(0)

const normalizedCount = computed(() => {
  if (!Number.isFinite(props.count)) return 0
  return Math.max(0, Math.floor(props.count))
})
const currentValue = computed(() => (props.modelValue === undefined ? internalValue.value : normalizeValue(props.modelValue)))
const displayValue = computed(() => hoverValue.value ?? currentValue.value)
const rootTabindex = computed(() => (props.disabled ? -1 : props.tabindex))
const rootClass = computed(() =>
  clsx(
    getUiAttrClass(attrs),
    rateRoot({
      size: props.size,
      disabled: props.disabled,
      focused: focused.value
    })
  )
)
const items = computed<RateItemState[]>(() =>
  Array.from({ length: normalizedCount.value }, (_, index) => {
    const itemValue = index + 1
    const active = displayValue.value >= itemValue
    const half = props.allowHalf && displayValue.value + 0.5 >= itemValue && displayValue.value < itemValue
    return {
      index,
      count: normalizedCount.value,
      value: displayValue.value,
      active,
      half,
      disabled: props.disabled,
      fillPercent: active ? 100 : half ? 50 : 0,
      fullActive: active,
      tooltip: props.tooltips?.[index]
    }
  })
)

watch(
  [() => props.modelValue, normalizedCount],
  () => {
    if (props.modelValue !== undefined) {
      internalValue.value = normalizeValue(props.modelValue)
      return
    }
    internalValue.value = normalizeValue(internalValue.value)
  },
  { immediate: true }
)

onMounted(() => {
  if (!props.autofocus || props.disabled) return
  void nextTick(() => focus())
})

function normalizeValue(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(normalizedCount.value, Math.max(0, value))
}

function getItemClass(item: RateItemState) {
  return rateItem({
    size: props.size,
    active: item.active || item.half,
    disabled: props.disabled
  })
}

function getBaseLayerClass() {
  return rateCharacterLayer({
    tone: props.disabled ? 'disabledBase' : 'base'
  })
}

function getActiveLayerClass() {
  return rateCharacterLayer({
    tone: props.disabled ? 'disabledActive' : 'active'
  })
}

function getHalfLayerClass() {
  return rateActiveLayer({
    kind: 'half'
  })
}

function getFullLayerClass() {
  return rateActiveLayer({
    kind: 'full'
  })
}

function getHalfLayerStyle(item: RateItemState) {
  return {
    opacity: item.half ? 1 : 0
  }
}

function getFullLayerStyle(item: RateItemState) {
  return {
    opacity: item.fullActive ? 1 : 0
  }
}

function getItemAriaLabel(item: RateItemState) {
  return item.tooltip || `${item.index + 1} 分`
}

function getBaseSlotProps(item: RateItemState): RateItemState {
  return {
    ...item,
    active: false,
    half: false
  }
}

function getStarValue(index: number, event: MouseEvent) {
  if (!props.allowHalf) return normalizeValue(index + 1)
  const target = event.currentTarget as HTMLElement | null
  const rect = target?.getBoundingClientRect()
  const width = rect?.width || target?.offsetWidth || 1
  const left = rect?.left ?? 0
  return normalizeValue(event.clientX - left <= width / 2 ? index + 0.5 : index + 1)
}

function commitValue(value: number, event?: MouseEvent | KeyboardEvent) {
  const nextValue = normalizeValue(value)
  internalValue.value = nextValue
  emit('update:modelValue', nextValue)
  emit('change', nextValue, event)
}

function handleMouseMove(event: MouseEvent, index: number) {
  if (props.disabled) return
  const nextValue = getStarValue(index, event)
  hoverValue.value = nextValue
  emit('hoverChange', nextValue)
}

function handleMouseLeave() {
  if (props.disabled) return
  hoverValue.value = undefined
  emit('hoverChange', undefined)
}

function handleClick(event: MouseEvent, index: number) {
  if (props.disabled) return
  rateRef.value?.focus()
  const nextValue = getStarValue(index, event)
  const shouldClear = props.clearable && nextValue === currentValue.value
  hoverValue.value = undefined
  emit('hoverChange', undefined)
  commitValue(shouldClear ? 0 : nextValue, event)
}

/**
 * 键盘交互按评分组件常见语义推进：方向键调整值，Home/End 快速清零或满分。
 */
function handleKeydown(event: KeyboardEvent) {
  if (props.disabled) return
  const step = props.allowHalf ? 0.5 : 1
  let nextValue = currentValue.value
  if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
    nextValue += step
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
    nextValue -= step
  } else if (event.key === 'Home') {
    nextValue = 0
  } else if (event.key === 'End') {
    nextValue = normalizedCount.value
  } else {
    emit('keydown', event)
    return
  }
  nextValue = normalizeValue(nextValue)
  if (nextValue !== currentValue.value) {
    event.preventDefault()
    commitValue(nextValue, event)
  }
  emit('keydown', event)
}

function handleFocus(event: FocusEvent) {
  focused.value = true
  emit('focus', event)
}

function handleBlur(event: FocusEvent) {
  focused.value = false
  emit('blur', event)
}

function focus() {
  if (props.disabled) return
  rateRef.value?.focus()
}

function blur() {
  if (props.disabled) return
  rateRef.value?.blur()
}

defineExpose({
  focus,
  blur
})
</script>

<template>
  <div
    v-bind="getUiExposeAttrs(attrs)"
    ref="rateRef"
    data-ui-rate="true"
    role="radiogroup"
    :aria-disabled="disabled"
    :tabindex="rootTabindex"
    :class="rootClass"
    :style="getUiAttrStyle(attrs)"
    @mouseleave="handleMouseLeave"
    @focus="handleFocus"
    @blur="handleBlur"
    @keydown="handleKeydown"
  >
    <Tooltip v-for="item in items" :key="item.index" :title="item.tooltip" :disabled="disabled || !item.tooltip" :mouse-enter-delay="0" :mouse-leave-delay="0" placement="top">
      <button
        type="button"
        data-ui-rate-item="true"
        role="radio"
        :aria-checked="displayValue > item.index"
        :aria-label="getItemAriaLabel(item)"
        :aria-posinset="item.index + 1"
        :aria-setsize="item.count"
        :tabindex="-1"
        :disabled="disabled"
        :class="getItemClass(item)"
        @mousemove="handleMouseMove($event, item.index)"
        @click="handleClick($event, item.index)"
      >
        <span :class="rateCharacter({ disabled })">
          <span :class="getBaseLayerClass()" aria-hidden="true">
            <slot name="character" v-bind="getBaseSlotProps(item)">
              <span v-if="character" class="inline-grid size-[1em] place-items-center">{{ character }}</span>
              <span v-else class="i-ant-design:star-filled block size-[1em]"></span>
            </slot>
          </span>
          <span aria-hidden="true" :class="getHalfLayerClass()" :style="getHalfLayerStyle(item)">
            <span :class="getActiveLayerClass()">
              <slot name="character" v-bind="item">
                <span v-if="character" class="inline-grid size-[1em] place-items-center">{{ character }}</span>
                <span v-else class="i-ant-design:star-filled block size-[1em]"></span>
              </slot>
            </span>
          </span>
          <span aria-hidden="true" :class="getFullLayerClass()" :style="getFullLayerStyle(item)">
            <span :class="getActiveLayerClass()">
              <slot name="character" v-bind="item">
                <span v-if="character" class="inline-grid size-[1em] place-items-center">{{ character }}</span>
                <span v-else class="i-ant-design:star-filled block size-[1em]"></span>
              </slot>
            </span>
          </span>
        </span>
      </button>
    </Tooltip>
  </div>
</template>
