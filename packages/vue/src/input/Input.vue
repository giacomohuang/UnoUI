<script setup lang="ts">
import { clsx } from 'clsx'
import { computed, nextTick, onUnmounted, ref, useAttrs, useSlots, useTemplateRef, watch } from 'vue'

import { inputAddon, inputControl, inputGroup, inputSizer, inputWrapper, type InputProps } from '.'

defineOptions({
  inheritAttrs: false
})

type InputModelValue = string | number
type NativeInputType = 'text' | 'password' | 'search' | 'email' | 'url' | 'tel' | 'number'
type InputExposeElement = HTMLInputElement | HTMLTextAreaElement

const props = withDefaults(
  defineProps<{
    /** modelValue 是 v-model 绑定值，可选。 */
    modelValue?: InputModelValue
    /** type 是原生 input 类型，可选，默认 text；textarea 会忽略该属性。 */
    type?: NativeInputType
    /** size 是输入框尺寸，可选，默认 md，并与 Button 的 sm/md/lg 高度对齐。 */
    size?: InputProps['size']
    /** disabled 表示是否禁用输入和交互，可选，默认 false。 */
    disabled?: boolean
    /** placeholder 是原生占位文案，可选。 */
    placeholder?: string
    /** prefixIcon 是输入区前缀图标类名，可选。 */
    prefixIcon?: string
    /** suffixIcon 是输入区后缀图标类名，可选。 */
    suffixIcon?: string
    /** prefix 是输入区前缀文字，可选；复杂内容请使用 prefix slot。 */
    prefix?: string
    /** suffix 是输入区后缀文字，可选；复杂内容请使用 suffix slot。 */
    suffix?: string
    /** password 表示是否启用密码显示/隐藏按钮，可选，默认 false。 */
    password?: boolean
    /** showPassword 兼容 Element Plus 的 show-password 命名，可选，默认 false。 */
    showPassword?: boolean
    /** clearable 表示是否显示一键清空按钮，可选，默认 false。 */
    clearable?: boolean
    /** clearIcon 是清空按钮自定义图标类名，可选，默认 lucide:x。 */
    clearIcon?: string
    /** rows 是多行输入行数，可选；存在时自动渲染 textarea。 */
    rows?: number
    /** multiline 表示是否渲染 textarea，可选，默认 false。 */
    multiline?: boolean
    /** maxlength 是最大输入字数，可选。 */
    maxlength?: number
    /** showWordLimit 表示是否展示字数统计，可选，默认 false。 */
    showWordLimit?: boolean
    /** formatter 在展示时格式化输入值，可选；提交值会通过 parser 还原。 */
    formatter?: (value: string) => string
    /** parser 将格式化展示值还原为提交值，可选。 */
    parser?: (value: string) => string
    /** precision 是 number 输入的小数精度，可选。 */
    precision?: number
    /** step 是 number 输入和拖拽步长，可选，默认 1。 */
    step?: number | string
    /** min 是 number 输入最小值，可选。 */
    min?: number | string
    /** max 是 number 输入最大值，可选。 */
    max?: number | string
    /** draggable 表示 number 输入是否支持左右拖拽改值，可选，默认 false。 */
    draggable?: boolean
    /** dragIcon 是 number 拖拽手柄图标类名，可选。 */
    dragIcon?: string
    /** dragStep 是拖拽每像素变化值，可选；默认使用 step。 */
    dragStep?: number
    /** name 是原生 name，可选。 */
    name?: string
    /** autocomplete 是原生 autocomplete，可选。 */
    autocomplete?: string
    /** readonly 是原生 readonly，可选，默认 false。 */
    readonly?: boolean
    /** modelModifiers 接收 v-model.trim / v-model.number 修饰符。 */
    modelModifiers?: {
      trim?: boolean
      number?: boolean
    }
  }>(),
  {
    modelValue: '',
    type: 'text',
    size: 'md',
    disabled: false,
    placeholder: '',
    prefixIcon: '',
    suffixIcon: '',
    prefix: '',
    suffix: '',
    password: false,
    showPassword: false,
    clearable: false,
    clearIcon: 'i-lucide:x',
    rows: undefined,
    multiline: false,
    maxlength: undefined,
    showWordLimit: false,
    formatter: undefined,
    parser: undefined,
    precision: undefined,
    step: 1,
    min: undefined,
    max: undefined,
    draggable: false,
    dragIcon: 'i-lucide:grip-horizontal',
    dragStep: undefined,
    name: undefined,
    autocomplete: undefined,
    readonly: false
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: InputModelValue): void
  (e: 'input', value: InputModelValue, event: Event): void
  (e: 'change', value: InputModelValue, event: Event): void
  (e: 'clear'): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'keydown', event: KeyboardEvent): void
  (e: 'drag-start', value: number, event: PointerEvent): void
  (e: 'drag-end', value: number, event: PointerEvent): void
}>()

const attrs = useAttrs()
const slots = useSlots()
const controlRef = useTemplateRef<InputExposeElement>('controlRef')
const focused = ref(false)
const passwordVisible = ref(false)
const composing = ref(false)
const numberInputDraft = ref<string | null>(null)
const hasPrepend = !!slots.prepend
const hasAppend = !!slots.append

const isTextarea = () => props.multiline || props.rows !== undefined
const isNumber = () => !isTextarea() && props.type === 'number'
const hasPasswordToggle = () => props.password || props.showPassword || props.type === 'password'
const showWordLimit = () => props.showWordLimit && props.maxlength !== undefined
const showWordLimitInline = () => showWordLimit() && !isTextarea()
const showClearButton = () => props.clearable && !props.disabled && !props.readonly && normalizedValue.value.length > 0
const hasPrefix = () => !!slots.prefix || !!props.prefix || !!props.prefixIcon || (isNumber() && props.draggable)
const hasSuffix = () => !!slots.suffix || !!props.suffix || !!props.suffixIcon || hasPasswordToggle() || showClearButton() || showWordLimitInline()
const normalizedValue = computed(() => (props.modelValue === undefined || props.modelValue === null ? '' : String(props.modelValue)))
const displayValue = computed(() => (props.formatter ? props.formatter(normalizedValue.value) : normalizedValue.value))
const controlValue = computed(() => (isNumber() && numberInputDraft.value !== null ? numberInputDraft.value : displayValue.value))
const valueLength = computed(() => normalizedValue.value.length)

const nativeType = computed(() => {
  if (isTextarea()) return undefined
  if (hasPasswordToggle()) return passwordVisible.value ? 'text' : 'password'
  return props.type
})

const getAttrClass = () => clsx(attrs.class as string | undefined)
const getAttrStyle = () => attrs.style
const getExposeAttrs = () => {
  // class/style 需要绑定在外层容器，其余原生属性继续透传给 input/textarea。
  const { class: _class, style: _style, ...rest } = attrs
  return rest
}
const wrapperClass = computed(() =>
  clsx(
    getAttrClass(),
    inputWrapper({
      size: props.size,
      focused: focused.value,
      disabled: props.disabled,
      multiline: isTextarea()
    }),
    hasPrepend && '-ml-px rounded-l-none',
    hasAppend && '-mr-px rounded-r-none'
  )
)
const getControlClass = () =>
  clsx(
    inputControl({
      size: props.size,
      multiline: isTextarea(),
      number: isNumber()
    }),
    !isTextarea() && 'absolute inset-0 w-full'
  )

const parseNumber = (value: string | number | undefined) => {
  if (value === undefined || value === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}
const getMinValue = () => parseNumber(props.min)
const getMaxValue = () => parseNumber(props.max)
const getStepValue = () => parseNumber(props.step) ?? 1
const getDragStepValue = () => props.dragStep ?? getStepValue()

const getStepPrecision = (value: number) => {
  const normalized = String(value)
  const exponentMatch = normalized.match(/e-(\d+)$/i)
  if (exponentMatch) return Number(exponentMatch[1])
  if (!normalized.includes('.')) return 0
  return normalized.split('.')[1]?.length || 0
}

const clampNumber = (value: number) => {
  let nextValue = value
  const minValue = getMinValue()
  const maxValue = getMaxValue()
  if (minValue !== undefined) nextValue = Math.max(minValue, nextValue)
  if (maxValue !== undefined) nextValue = Math.min(maxValue, nextValue)
  return nextValue
}

const applyPrecision = (value: number) => {
  const precision = props.precision ?? getStepPrecision(getStepValue())
  return Number(clampNumber(value).toFixed(precision))
}

const shouldEmitNumber = () => isNumber() && (props.modelModifiers?.number || typeof props.modelValue === 'number')
const formatNumberForModel = (value: number): InputModelValue => {
  const nextValue = applyPrecision(value)
  if (shouldEmitNumber()) return nextValue
  return props.precision === undefined ? String(nextValue) : nextValue.toFixed(props.precision)
}

const normalizeInputValue = (value: string): InputModelValue => {
  const rawText = props.modelModifiers?.trim ? value.trim() : value
  const parsedText = props.parser ? props.parser(rawText) : rawText
  if (!isNumber()) return parsedText
  if (parsedText === '') return ''
  const parsedNumber = Number(parsedText)
  if (!Number.isFinite(parsedNumber)) return parsedText
  return formatNumberForModel(parsedNumber)
}

const setControlValue = async () => {
  await nextTick()
  const control = controlRef.value
  if (control && control.value !== displayValue.value) control.value = displayValue.value
}

watch(displayValue, () => {
  if (focused.value && numberInputDraft.value !== null) return
  if (!composing.value) void setControlValue()
})

const emitValue = (value: InputModelValue, event: Event) => {
  emit('update:modelValue', value)
  emit('input', value, event)
}

const handleBeforeInput = (event: InputEvent) => {
  if (!isNumber() || props.disabled || props.readonly || !event.data?.includes('。')) return
  event.preventDefault()
  document.execCommand('insertText', false, event.data.replaceAll('。', '.'))
}

const handleInput = (event: Event) => {
  if (props.disabled) return
  const control = event.target as InputExposeElement
  if (isNumber() && control.tagName === 'INPUT') numberInputDraft.value = control.value
  if (composing.value) {
    emit('input', normalizeInputValue(control.value), event)
    return
  }
  emitValue(normalizeInputValue(control.value), event)
}

const handleChange = (event: Event) => {
  if (props.disabled) return
  emit('change', normalizeInputValue((event.target as InputExposeElement).value), event)
}

const handleFocus = (event: FocusEvent) => {
  focused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  focused.value = false
  numberInputDraft.value = null
  emit('blur', event)
  void setControlValue()
}

const handleCompositionStart = () => {
  composing.value = true
}

const handleCompositionEnd = (event: CompositionEvent) => {
  composing.value = false
  const control = event.target as InputExposeElement
  if (isNumber() && control.tagName === 'INPUT') numberInputDraft.value = control.value
  emitValue(normalizeInputValue(control.value), event)
}

const clear = () => {
  if (props.disabled || props.readonly) return
  const value = ''
  numberInputDraft.value = null
  emit('update:modelValue', value)
  emit('input', value, new Event('input'))
  emit('clear')
  void setControlValue()
  controlRef.value?.focus()
}

const focus = () => controlRef.value?.focus()
const blur = () => controlRef.value?.blur()
const select = () => controlRef.value?.select()

type NumberDragSession = {
  pointerId: number
  startX: number
  startValue: number
  lastValue: number
}

let numberDragSession: NumberDragSession | null = null

const stopNumberDragListeners = () => {
  window.removeEventListener('pointermove', handleNumberDragMove)
  window.removeEventListener('pointerup', handleNumberDragEnd)
  window.removeEventListener('pointercancel', handleNumberDragEnd)
}

const getCurrentNumber = () => {
  const parsed = parseNumber(props.modelValue)
  if (parsed !== undefined) return parsed
  const displayParsed = parseNumber(normalizeInputValue(controlRef.value?.value || '') as string)
  return displayParsed ?? 0
}

const updateNumberFromDrag = (value: number, event: PointerEvent) => {
  const nextValue = applyPrecision(value)
  const modelValue = formatNumberForModel(nextValue)
  numberInputDraft.value = null
  if (numberDragSession) numberDragSession.lastValue = nextValue
  emit('update:modelValue', modelValue)
  emit('input', modelValue, event)
}

function handleNumberDragMove(event: PointerEvent) {
  const session = numberDragSession
  if (!session || event.pointerId !== session.pointerId) return
  event.preventDefault()
  const delta = event.clientX - session.startX
  updateNumberFromDrag(session.startValue + delta * getDragStepValue(), event)
}

function handleNumberDragEnd(event: PointerEvent) {
  const session = numberDragSession
  if (!session || event.pointerId !== session.pointerId) return
  event.preventDefault()
  stopNumberDragListeners()
  numberDragSession = null
  const value = session.lastValue
  emit('change', formatNumberForModel(value), event)
  emit('drag-end', value, event)
}

const startNumberDrag = (event: PointerEvent) => {
  if (!isNumber() || !props.draggable || props.disabled || props.readonly || event.button !== 0) return
  event.preventDefault()
  stopNumberDragListeners()
  const startValue = getCurrentNumber()
  numberDragSession = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startValue,
    lastValue: startValue
  }
  ;(event.currentTarget as HTMLElement | null)?.setPointerCapture?.(event.pointerId)
  emit('drag-start', startValue, event)
  window.addEventListener('pointermove', handleNumberDragMove)
  window.addEventListener('pointerup', handleNumberDragEnd)
  window.addEventListener('pointercancel', handleNumberDragEnd)
}

onUnmounted(() => {
  stopNumberDragListeners()
})

defineExpose({
  blur,
  clear,
  focus,
  select
})
</script>

<template>
  <div :class="inputGroup({ size, multiline: isTextarea() })">
    <div v-if="hasPrepend" :class="inputAddon({ position: 'prepend', size, disabled })">
      <slot name="prepend"></slot>
    </div>
    <div :class="wrapperClass" :style="getAttrStyle()" data-ui-input="true">
      <span v-if="hasPrefix()" class="flex shrink-0 items-center gap-1 pl-2 text-tertiary" :class="{ 'cursor-ew-resize select-none': isNumber() && draggable && !disabled && !readonly }" @pointerdown="startNumberDrag">
        <span v-if="isNumber() && draggable" :class="dragIcon" class="size-4"></span>
        <span v-if="prefixIcon" :class="prefixIcon" class="size-4"></span>
        <span v-if="prefix" class="text-xs">{{ prefix }}</span>
        <slot name="prefix"></slot>
      </span>

      <textarea
        v-if="isTextarea()"
        ref="controlRef"
        v-bind="getExposeAttrs()"
        data-ui-input-control="true"
        :name="name"
        :value="displayValue"
        :rows="rows"
        :maxlength="maxlength"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :autocomplete="autocomplete"
        :class="getControlClass()"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="emit('keydown', $event)"
        @compositionstart="handleCompositionStart"
        @compositionend="handleCompositionEnd"
      ></textarea>
      <span v-else class="relative min-w-0 flex-auto self-stretch">
        <span aria-hidden="true" :class="inputSizer({ size })">x</span>
        <input
          ref="controlRef"
          v-bind="getExposeAttrs()"
          data-ui-input-control="true"
          :name="name"
          :type="nativeType"
          :value="controlValue"
          :step="isNumber() ? step : undefined"
          :min="isNumber() ? min : undefined"
          :max="isNumber() ? max : undefined"
          :maxlength="maxlength"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :autocomplete="autocomplete"
          :class="getControlClass()"
          @beforeinput="handleBeforeInput"
          @input="handleInput"
          @change="handleChange"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="emit('keydown', $event)"
          @compositionstart="handleCompositionStart"
          @compositionend="handleCompositionEnd"
        />
      </span>

      <span v-if="hasSuffix()" class="flex shrink-0 items-center gap-1 pr-2 text-tertiary">
        <slot name="suffix"></slot>
        <span v-if="suffixIcon" :class="suffixIcon" class="size-4"></span>
        <span v-if="suffix" class="text-xs">{{ suffix }}</span>
        <span v-if="showWordLimitInline()" class="whitespace-nowrap text-[10px] text-tertiary/70">{{ valueLength }} / {{ maxlength }}</span>
        <button
          v-if="showClearButton()"
          type="button"
          aria-label="清空"
          class="flex size-4 items-center justify-center rounded-full bg-tertiary/90 text-tertiary/60 opacity-0 transition-all duration-150 hover:bg-tertiary hover:text-tertiary group-hover/ui-input:opacity-100 group-focus-within/ui-input:opacity-100"
          @click.stop="clear"
        >
          <span :class="clearIcon" class="size-3"></span>
        </button>
        <button
          v-if="hasPasswordToggle()"
          type="button"
          :aria-label="passwordVisible ? '隐藏密码' : '显示密码'"
          class="flex size-5 items-center justify-center rounded text-tertiary transition-colors hover:bg-secondary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="disabled"
          @click.stop="passwordVisible = !passwordVisible"
        >
          <span :class="passwordVisible ? 'i-lucide:eye-off' : 'i-lucide:eye'" class="size-3.5"></span>
        </button>
      </span>
    </div>
    <div v-if="hasAppend" :class="inputAddon({ position: 'append', size, disabled })">
      <slot name="append"></slot>
    </div>
  </div>
  <div v-if="showWordLimit() && isTextarea()" class="mt-1 text-right text-[10px] text-tertiary/70">{{ valueLength }} / {{ maxlength }}</div>
</template>

<style scoped>
[data-ui-input='true'] {
  --ui-input-autofill-background: var(--color-bg-primary);
  --ui-input-autofill-color: var(--color-text-primary);
}

/* 覆盖浏览器自动填充底色，避免原生 input 与前后缀区域产生色块断层。 */
input[data-ui-input-control='true']:autofill {
  color: var(--ui-input-autofill-color);
  caret-color: var(--ui-input-autofill-color);
  box-shadow: 0 0 0 1000px var(--ui-input-autofill-background) inset;
}

input[data-ui-input-control='true']:-webkit-autofill,
input[data-ui-input-control='true']:-webkit-autofill:hover,
input[data-ui-input-control='true']:-webkit-autofill:focus,
input[data-ui-input-control='true']:-webkit-autofill:active {
  color: var(--ui-input-autofill-color);
  -webkit-text-fill-color: var(--ui-input-autofill-color);
  caret-color: var(--ui-input-autofill-color);
  box-shadow: 0 0 0 1000px var(--ui-input-autofill-background) inset;
  -webkit-box-shadow: 0 0 0 1000px var(--ui-input-autofill-background) inset;
}

input[data-ui-input-control='true']::-ms-clear,
input[data-ui-input-control='true']::-ms-reveal {
  display: none;
}
</style>
