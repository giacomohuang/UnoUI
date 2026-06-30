<script setup lang="ts">
import { clsx } from 'clsx'
import { computed, nextTick, onMounted, onUnmounted, ref, useAttrs, useSlots, watch, type CSSProperties } from 'vue'

import { Dropdown } from '../dropdown'
import { Tag } from '../tag'

import { selectInner, selectOption, selectWrapper, type SelectModelValue, type SelectOption, type SelectProps, type SelectValue } from '.'

defineOptions({
  inheritAttrs: false
})

interface NormalizedOption {
  label: string
  value: SelectValue
  disabled: boolean
  raw: SelectOption
}

const props = withDefaults(
  defineProps<{
    /** modelValue 是 Select 受控值，multiple 为 true 时应传数组。 */
    modelValue?: SelectModelValue
    /** options 是选项数据源，可通过 labelKey/valueKey/disabledKey 适配字段名。 */
    options?: SelectOption[]
    /** placeholder 是未选择时展示的占位文案。 */
    placeholder?: string
    /** size 是选择器尺寸，可选，默认 md，并与 Input/Button 高度对齐。 */
    size?: SelectProps['size']
    /** width 是选择器触发器宽度；未传时默认撑满父级以适配 FormItem。 */
    width?: string | number
    /** disabled 表示是否禁用选择器交互。 */
    disabled?: boolean
    /** clearable 表示是否允许一键清空。 */
    clearable?: boolean
    /** multiple 表示是否启用多选模式。 */
    multiple?: boolean
    /** filterable 表示是否启用本地选项过滤。 */
    filterable?: boolean
    /** collapseTags 表示多选时是否折叠超出标签。 */
    collapseTags?: boolean
    /** maxCollapseTags 是 collapseTags 模式下最多展示标签数。 */
    maxCollapseTags?: number
    /** labelKey 是从 option 读取展示标签的字段名。 */
    labelKey?: string
    /** valueKey 是从 option 读取提交值的字段名。 */
    valueKey?: string
    /** disabledKey 是从 option 读取禁用状态的字段名。 */
    disabledKey?: string
    /** noDataText 是无选项时的文案。 */
    noDataText?: string
    /** noMatchText 是过滤后无匹配项时的文案。 */
    noMatchText?: string
    /** loading 表示选项加载中。 */
    loading?: boolean
    /** loadingText 是加载状态文案。 */
    loadingText?: string
    /** clearIcon 是清空按钮图标类名。 */
    clearIcon?: string
    /** suffixIcon 是右侧下拉图标类名。 */
    suffixIcon?: string
    /** maxHeight 是下拉滚动区域最大高度。 */
    maxHeight?: string
    /** teleportedWidth 是下拉层固定宽度，默认跟随触发器宽度。 */
    teleportedWidth?: string
    /** name 是隐藏 input 的原生 name，便于表单提交。 */
    name?: string
  }>(),
  {
    modelValue: undefined,
    options: () => [],
    placeholder: '请选择',
    size: 'md',
    width: undefined,
    disabled: false,
    clearable: false,
    multiple: false,
    filterable: false,
    collapseTags: false,
    maxCollapseTags: 1,
    labelKey: 'label',
    valueKey: 'value',
    disabledKey: 'disabled',
    noDataText: '暂无数据',
    noMatchText: '无匹配数据',
    loading: false,
    loadingText: '加载中',
    clearIcon: 'i-lucide:x',
    suffixIcon: 'i-lucide:chevron-down',
    maxHeight: '280px',
    teleportedWidth: undefined,
    name: undefined
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: SelectModelValue | undefined): void
  (e: 'change', value: SelectModelValue | undefined): void
  (e: 'clear'): void
  (e: 'remove-tag', value: SelectValue): void
  (e: 'visible-change', value: boolean): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}>()

const attrs = useAttrs()
const slots = useSlots()
const open = ref(false)
const query = ref('')
const focused = ref(false)
const triggerWidth = ref('')
const triggerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<InstanceType<typeof Dropdown> | null>(null)
let triggerResizeObserver: ResizeObserver | null = null
let triggerWidthFrame = 0

const normalizedOptions = computed<NormalizedOption[]>(() =>
  props.options.map((option) => ({
    label: String(option[props.labelKey] ?? ''),
    value: option[props.valueKey] as SelectValue,
    disabled: Boolean(option[props.disabledKey]),
    raw: option
  }))
)

const selectedValues = computed<SelectValue[]>(() => {
  if (props.multiple) return Array.isArray(props.modelValue) ? props.modelValue : []
  if (props.modelValue === undefined || Array.isArray(props.modelValue)) return []
  return [props.modelValue]
})

const selectedOptions = computed(() =>
  selectedValues.value.map((value) => {
    const option = normalizedOptions.value.find((item) => Object.is(item.value, value))
    return option ?? { label: String(value), value, disabled: false, raw: { label: String(value), value } }
  })
)

const visibleSelectedOptions = computed(() => {
  if (!props.multiple || !props.collapseTags) return selectedOptions.value
  return selectedOptions.value.slice(0, Math.max(0, props.maxCollapseTags))
})

const collapsedTagCount = computed(() => Math.max(0, selectedOptions.value.length - visibleSelectedOptions.value.length))
const hasValue = computed(() => selectedValues.value.length > 0)
const displayLabel = computed(() => selectedOptions.value[0]?.label || '')
const inputDisplayValue = computed(() => (props.filterable && open.value ? query.value : displayLabel.value))
const dropdownWidth = computed(() => props.teleportedWidth || triggerWidth.value || '180px')
const hiddenInputValue = computed(() => (props.multiple ? selectedValues.value.join(',') : (selectedValues.value[0] ?? '')))
const normalizedWidth = computed(() => (typeof props.width === 'number' ? `${props.width}px` : props.width))
const selectRootStyle = computed<CSSProperties | undefined>(() => (normalizedWidth.value === undefined ? undefined : { width: normalizedWidth.value }))

const filteredOptions = computed(() => {
  if (!props.filterable || !query.value.trim()) return normalizedOptions.value
  const keyword = query.value.trim().toLowerCase()
  return normalizedOptions.value.filter((option) => option.label.toLowerCase().includes(keyword))
})

const emptyText = computed(() => {
  if (props.loading) return props.loadingText
  if (!props.options.length) return props.noDataText
  return props.noMatchText
})

const dropdownValue = computed<SelectModelValue | undefined>({
  get: () => {
    if (props.multiple) return selectedValues.value
    return selectedValues.value[0]
  },
  set: (value) => commitValue(value)
})

const wrapperClass = computed(() =>
  clsx(
    attrs.class as string | undefined,
    selectWrapper({
      size: props.size,
      focused: open.value || focused.value,
      disabled: props.disabled,
      multiple: props.multiple
    })
  )
)

const valueTextClass = computed(() => clsx('min-w-0 truncate', hasValue.value ? 'text-primary' : 'text-tertiary/60'))

function syncTriggerWidth() {
  const width = triggerRef.value?.getBoundingClientRect().width
  if (width) triggerWidth.value = `${Math.round(width)}px`
}

const updateTriggerWidth = async () => {
  await nextTick()
  syncTriggerWidth()
}

function scheduleTriggerWidthUpdate() {
  if (triggerWidthFrame) cancelAnimationFrame(triggerWidthFrame)
  triggerWidthFrame = requestAnimationFrame(() => {
    triggerWidthFrame = 0
    void updateTriggerWidth()
  })
}

watch(open, (value) => {
  emit('visible-change', value)
  if (value) {
    query.value = ''
    void updateTriggerWidth()
  }
})

function normalizeModelValue(value: SelectModelValue | undefined): SelectModelValue | undefined {
  if (props.multiple) return Array.isArray(value) ? value : []
  if (Array.isArray(value)) return value[0]
  return value
}

function commitValue(value: SelectModelValue | undefined) {
  const normalizedValue = normalizeModelValue(value)
  emit('update:modelValue', normalizedValue)
  emit('change', normalizedValue)
  if (!props.multiple) {
    query.value = ''
    open.value = false
  }
}

function setOpen(value: boolean) {
  if (props.disabled) return
  open.value = value
}

function handleTriggerClick(event: MouseEvent) {
  if (props.filterable) {
    if (!(event.target instanceof HTMLInputElement)) {
      triggerRef.value?.querySelector<HTMLInputElement>('input')?.focus()
    }
    setOpen(true)
    return
  }
  setOpen(!open.value)
}

function handleFocus(event: FocusEvent) {
  focused.value = true
  if (props.filterable) setOpen(true)
  emit('focus', event)
}

function handleBlur(event: FocusEvent) {
  focused.value = false
  emit('blur', event)
}

function handleQueryInput(event: Event) {
  query.value = (event.target as HTMLInputElement).value
  setOpen(true)
}

function handleKeydown(event: KeyboardEvent) {
  if (props.disabled) return
  if (open.value && ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp'].includes(event.key)) {
    dropdownRef.value?.handleKeyDown(event)
    return
  }
  if (open.value && event.key === 'Enter') {
    if (dropdownRef.value?.handleKeyDown(event)) return
  }
  if (event.key === 'Escape') {
    open.value = false
    return
  }
  if (!props.filterable && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault()
    setOpen(!open.value)
    return
  }
  if (event.key !== 'Enter') return
  const option = filteredOptions.value.find((item) => !item.disabled)
  if (!option) return
  event.preventDefault()
  if (props.multiple) {
    const exists = selectedValues.value.some((value) => Object.is(value, option.value))
    commitValue(exists ? selectedValues.value.filter((value) => !Object.is(value, option.value)) : [...selectedValues.value, option.value])
  } else {
    commitValue(option.value)
  }
}

function clear(event?: MouseEvent) {
  event?.stopPropagation()
  if (props.disabled || !hasValue.value) return
  commitValue(props.multiple ? [] : undefined)
  emit('clear')
  query.value = ''
}

function removeTag(value: SelectValue, event: MouseEvent) {
  event.stopPropagation()
  if (props.disabled) return
  commitValue(selectedValues.value.filter((item) => !Object.is(item, value)))
  emit('remove-tag', value)
}

function getDropdownOption(item: unknown) {
  return item as NormalizedOption
}

function isSelected(item: unknown) {
  const option = getDropdownOption(item)
  return selectedValues.value.some((value) => Object.is(value, option.value))
}

onMounted(() => {
  void updateTriggerWidth()
  window.addEventListener('resize', scheduleTriggerWidthUpdate)

  if (typeof ResizeObserver !== 'undefined' && triggerRef.value) {
    triggerResizeObserver = new ResizeObserver(() => scheduleTriggerWidthUpdate())
    triggerResizeObserver.observe(triggerRef.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', scheduleTriggerWidthUpdate)
  triggerResizeObserver?.disconnect()
  if (triggerWidthFrame) cancelAnimationFrame(triggerWidthFrame)
})

defineExpose({
  blur: () => (document.activeElement instanceof HTMLElement ? document.activeElement.blur() : undefined),
  clear,
  focus: () => triggerRef.value?.querySelector<HTMLInputElement>('input')?.focus()
})
</script>

<template>
  <Dropdown ref="dropdownRef" v-model:value="dropdownValue" v-model:open="open" :items="filteredOptions" value-key="value" :width="dropdownWidth" :max-height="maxHeight" :focus-on-open="!filterable" content-class="ui-select-dropdown" full-width :style="selectRootStyle">
    <template #trigger>
      <div ref="triggerRef" :class="wrapperClass" :style="attrs.style" data-ui-select="true" :tabindex="disabled ? undefined : 0" @click.stop="handleTriggerClick" @focus="handleFocus" @blur="handleBlur" @keydown="handleKeydown">
        <span v-if="slots.prefix" class="flex shrink-0 items-center pl-2 text-tertiary">
          <slot name="prefix"></slot>
        </span>
        <div :class="selectInner({ size, multiple })">
          <template v-if="multiple">
            <template v-if="hasValue">
              <Tag v-for="option in visibleSelectedOptions" :key="String(option.value)" color="brand" size="sm" radius="sm" closable @close="removeTag(option.value, $event)">
                {{ option.label }}
              </Tag>
              <Tag v-if="collapsedTagCount > 0" color="gray" size="sm" radius="sm">+{{ collapsedTagCount }}</Tag>
            </template>
            <span v-else class="text-tertiary/60">{{ placeholder }}</span>
            <input
              v-if="filterable"
              class="min-w-12 flex-1 border-0 bg-transparent p-0 text-sm outline-none placeholder:text-tertiary/60"
              :value="query"
              :placeholder="hasValue ? '' : placeholder"
              :disabled="disabled"
              @input="handleQueryInput"
              @focus="handleFocus"
              @blur="handleBlur"
              @keydown.stop="handleKeydown"
            />
          </template>
          <template v-else>
            <input
              v-if="filterable"
              class="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-inherit outline-none placeholder:text-tertiary/60 disabled:cursor-not-allowed"
              :value="inputDisplayValue"
              :placeholder="placeholder"
              :disabled="disabled"
              @input="handleQueryInput"
              @focus="handleFocus"
              @blur="handleBlur"
              @keydown.stop="handleKeydown"
            />
            <span v-else :class="valueTextClass">{{ displayLabel || placeholder }}</span>
          </template>
        </div>
        <input v-if="name" type="hidden" :name="name" :value="hiddenInputValue" />
        <span class="flex shrink-0 items-center gap-1 pr-2 text-tertiary">
          <button
            v-if="clearable && hasValue && !disabled"
            type="button"
            aria-label="清空"
            class="flex size-4 items-center justify-center rounded-full bg-tertiary/90 text-tertiary/60 opacity-0 transition-all duration-150 hover:bg-tertiary hover:text-tertiary group-hover/ui-select:opacity-100 group-focus-within/ui-select:opacity-100"
            @click="clear"
          >
            <span :class="clearIcon" class="size-3"></span>
          </button>
          <span v-if="loading" class="i-lucide:loader-2 size-4 animate-spin"></span>
          <span v-else :class="[suffixIcon, open ? 'rotate-180' : '']" class="size-4 transition-transform"></span>
        </span>
      </div>
    </template>

    <template #item="{ item }">
      <slot name="option" :option="getDropdownOption(item).raw" :label="getDropdownOption(item).label" :value="getDropdownOption(item).value" :selected="isSelected(item)" :disabled="getDropdownOption(item).disabled">
        <div :class="selectOption({ selected: isSelected(item), disabled: getDropdownOption(item).disabled })">
          <span class="min-w-0 flex-1 truncate">{{ getDropdownOption(item).label }}</span>
          <span v-if="isSelected(item)" class="i-lucide:check size-4 shrink-0"></span>
        </div>
      </slot>
    </template>

    <template #footer>
      <div v-if="loading || filteredOptions.length === 0" class="border-t border-medium px-3 py-3 text-center text-sm text-tertiary">
        {{ emptyText }}
      </div>
    </template>
  </Dropdown>
</template>

<style>
.ui-select-dropdown {
  transition-property: opacity, box-shadow, border-color, background-color;
}
</style>
