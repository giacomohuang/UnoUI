<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, useAttrs, watch } from 'vue'

import { Dropdown } from '../dropdown'

import Input from './Input.vue'
import type { AutocompleteDataSource, AutocompleteSuggestion, InputProps } from '.'

defineOptions({
  inheritAttrs: false
})

type AutocompleteModelValue = string | number

const props = withDefaults(
  defineProps<{
    /** modelValue 是 v-model 绑定值。 */
    modelValue?: AutocompleteModelValue
    /** dataSource 是自动补全建议源，可传静态数组或远程查询函数。 */
    dataSource: AutocompleteDataSource
    /** valueKey 是从建议项读取展示值的字段名。 */
    valueKey?: string
    /** triggerOnFocus 表示聚焦时是否立即触发建议查询。 */
    triggerOnFocus?: boolean
    /** debounce 是自动补全查询防抖时间，单位毫秒。 */
    debounce?: number
    /** size 是输入框尺寸，可选，默认 md，并与 Input 对齐。 */
    size?: InputProps['size']
    /** disabled 表示是否禁用输入和交互。 */
    disabled?: boolean
    /** readonly 是原生 readonly，可选。 */
    readonly?: boolean
    /** placeholder 是原生占位文案。 */
    placeholder?: string
    /** prefixIcon 是输入区前缀图标类名。 */
    prefixIcon?: string
    /** suffixIcon 是输入区后缀图标类名。 */
    suffixIcon?: string
    /** prefix 是输入区前缀文字；复杂内容请使用 prefix slot。 */
    prefix?: string
    /** suffix 是输入区后缀文字；复杂内容请使用 suffix slot。 */
    suffix?: string
    /** clearable 表示是否显示一键清空按钮。 */
    clearable?: boolean
    /** clearIcon 是清空按钮自定义图标类名。 */
    clearIcon?: string
    /** name 是原生 name。 */
    name?: string
    /** autocomplete 是原生 autocomplete 属性。 */
    autocomplete?: string
    /** teleportedWidth 是下拉层固定宽度，默认跟随输入框宽度。 */
    teleportedWidth?: string
    /** maxHeight 是自动补全下拉滚动区域最大高度。 */
    maxHeight?: string
    /** hideLoading 表示远程查询中是否隐藏加载状态文案。 */
    hideLoading?: boolean
    /** selectWhenUnmatched 表示回车时无匹配建议也提交当前输入值。 */
    selectWhenUnmatched?: boolean
    /** noDataText 是自动补全无数据文案。 */
    noDataText?: string
    /** loadingText 是自动补全加载文案。 */
    loadingText?: string
  }>(),
  {
    modelValue: '',
    valueKey: 'value',
    triggerOnFocus: true,
    debounce: 300,
    size: 'md',
    disabled: false,
    readonly: false,
    placeholder: '',
    prefixIcon: '',
    suffixIcon: '',
    prefix: '',
    suffix: '',
    clearable: false,
    clearIcon: 'i-lucide:x',
    name: undefined,
    autocomplete: undefined,
    teleportedWidth: undefined,
    maxHeight: '280px',
    hideLoading: false,
    selectWhenUnmatched: false,
    noDataText: '暂无数据',
    loadingText: '加载中'
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: AutocompleteModelValue): void
  (e: 'input', value: AutocompleteModelValue, event: Event): void
  (e: 'change', value: AutocompleteModelValue, event: Event): void
  (e: 'clear'): void
  (e: 'select', item: AutocompleteSuggestion): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'keydown', event: KeyboardEvent): void
}>()

const attrs = useAttrs()
const open = ref(false)
const loading = ref(false)
const inputValue = ref<AutocompleteModelValue>(props.modelValue)
const suggestions = ref<AutocompleteSuggestion[]>([])
const triggerRef = ref<HTMLElement | null>(null)
const inputRef = ref<InstanceType<typeof Input> | null>(null)
const dropdownRef = ref<InstanceType<typeof Dropdown> | null>(null)
const triggerWidth = ref('0px')
let queryTimer = 0
let queryRequestId = 0
let suppressNextFocusQuery = false
let suppressFocusQueryUntil = 0

const normalizedValue = computed(() => (props.modelValue === undefined || props.modelValue === null ? '' : String(props.modelValue)))
const dropdownWidth = computed(() => props.teleportedWidth || triggerWidth.value || '180px')
const emptyText = computed(() => (loading.value && !props.hideLoading ? props.loadingText : props.noDataText))

watch(
  () => props.modelValue,
  (value) => {
    inputValue.value = value ?? ''
  }
)

const updateTriggerWidth = async () => {
  await nextTick()
  const width = triggerRef.value?.getBoundingClientRect().width
  if (width) triggerWidth.value = `${Math.round(width)}px`
}

const getSuggestionValue = (item: AutocompleteSuggestion) => String(item[props.valueKey] ?? '')

const setOpen = (value: boolean) => {
  if (props.disabled || props.readonly) {
    open.value = false
    return
  }
  open.value = value
  if (value) void updateTriggerWidth()
}

const executeQuerySearch = (query: string) => {
  if (props.disabled || props.readonly) return
  const requestId = ++queryRequestId
  const commit = (items: AutocompleteSuggestion[]) => {
    if (requestId !== queryRequestId) return
    suggestions.value = items
    loading.value = false
    setOpen(true)
  }

  if (Array.isArray(props.dataSource)) {
    const keyword = query.trim().toLowerCase()
    const matched = keyword ? props.dataSource.filter((item) => getSuggestionValue(item).toLowerCase().includes(keyword)) : props.dataSource
    commit(matched)
    return
  }

  loading.value = true
  setOpen(true)
  props.dataSource(query, commit)
}

const querySearch = (query: string, immediate = false) => {
  if (props.disabled || props.readonly) return
  if (queryTimer) window.clearTimeout(queryTimer)
  queryTimer = 0
  if (immediate) {
    executeQuerySearch(query)
    return
  }
  queryTimer = window.setTimeout(() => {
    queryTimer = 0
    executeQuerySearch(query)
  }, Math.max(0, props.debounce))
}

const closeSuggestions = () => {
  if (queryTimer) window.clearTimeout(queryTimer)
  queryTimer = 0
  queryRequestId += 1
  loading.value = false
  open.value = false
}

const handleInput = (value: AutocompleteModelValue, event: Event) => {
  inputValue.value = value
  emit('update:modelValue', value)
  emit('input', value, event)
  querySearch(String(value))
}

const handleChange = (value: AutocompleteModelValue, event: Event) => {
  emit('change', value, event)
}

const handleFocus = (event: FocusEvent) => {
  if (suppressNextFocusQuery || Date.now() < suppressFocusQueryUntil) {
    suppressNextFocusQuery = false
    emit('focus', event)
    return
  }
  if (props.triggerOnFocus) querySearch(normalizedValue.value)
  emit('focus', event)
}

const handleClear = () => {
  inputValue.value = ''
  closeSuggestions()
  querySearch('', true)
  emit('clear')
}

const selectSuggestion = (item: AutocompleteSuggestion) => {
  if (props.disabled || props.readonly || item.disabled) return
  const value = getSuggestionValue(item)
  inputValue.value = value
  emit('update:modelValue', value)
  emit('input', value, new Event('input'))
  emit('change', value, new Event('change'))
  emit('select', item)
  closeSuggestions()
  suppressNextFocusQuery = true
  suppressFocusQueryUntil = Date.now() + 120
  inputRef.value?.focus()
}

const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', event)
  if (props.disabled) return
  if (open.value && ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp'].includes(event.key)) {
    dropdownRef.value?.handleKeyDown(event)
    return
  }
  if (open.value && event.key === 'Enter') {
    dropdownRef.value?.handleKeyDown(event)
    if (event.defaultPrevented) return
  }
  if (event.key === 'Escape') {
    closeSuggestions()
    return
  }
  if (event.key === 'Enter' && props.selectWhenUnmatched && normalizedValue.value) {
    event.preventDefault()
    emit('select', { value: normalizedValue.value })
    closeSuggestions()
  }
}

onUnmounted(closeSuggestions)

defineExpose({
  blur: () => inputRef.value?.blur(),
  clear: () => inputRef.value?.clear(),
  focus: () => inputRef.value?.focus(),
  select: () => inputRef.value?.select()
})
</script>

<template>
  <Dropdown
    ref="dropdownRef"
    v-model:open="open"
    :items="suggestions"
    value-key="value"
    :width="dropdownWidth"
    :max-height="maxHeight"
    :focus-on-open="false"
    content-class="ui-autocomplete-dropdown"
    class="w-full"
    @select="selectSuggestion($event as AutocompleteSuggestion)"
  >
    <template #trigger>
      <div ref="triggerRef" class="w-full" @click.stop>
        <Input
          ref="inputRef"
          v-bind="attrs"
          :model-value="inputValue"
          :size="size"
          :disabled="disabled"
          :readonly="readonly"
          :placeholder="placeholder"
          :prefix-icon="prefixIcon"
          :suffix-icon="suffixIcon"
          :prefix="prefix"
          :suffix="suffix"
          :clearable="clearable"
          :clear-icon="clearIcon"
          :name="name"
          :autocomplete="autocomplete"
          @input="handleInput"
          @change="handleChange"
          @clear="handleClear"
          @focus="handleFocus"
          @blur="emit('blur', $event)"
          @keydown="handleKeydown"
        >
          <template v-if="$slots.prepend" #prepend>
            <slot name="prepend"></slot>
          </template>
          <template v-if="$slots.append" #append>
            <slot name="append"></slot>
          </template>
          <template v-if="$slots.prefix" #prefix>
            <slot name="prefix"></slot>
          </template>
          <template v-if="$slots.suffix" #suffix>
            <slot name="suffix"></slot>
          </template>
        </Input>
      </div>
    </template>

    <template #item="{ item }">
      <slot name="suggestion" :item="item">
        <div class="flex min-h-9 cursor-pointer items-center gap-2 px-3 py-2 text-sm text-primary transition-colors hover:bg-secondary" :class="{ 'pointer-events-none text-tertiary opacity-50': (item as AutocompleteSuggestion).disabled }">
          <span class="min-w-0 flex-1 truncate">{{ getSuggestionValue(item as AutocompleteSuggestion) }}</span>
        </div>
      </slot>
    </template>

    <template #footer>
      <div v-if="(loading && !hideLoading) || suggestions.length === 0" class="border-t border-medium px-3 py-3 text-center text-sm text-tertiary">
        {{ emptyText }}
      </div>
    </template>
  </Dropdown>
</template>

<style>
.ui-autocomplete-dropdown {
  transition-property: opacity, box-shadow, border-color, background-color;
}
</style>
