<script setup lang="ts">
import { clsx } from 'clsx'
import { computed, nextTick, onMounted, ref, useAttrs, useTemplateRef, watch } from 'vue'

import { getUiAttrClass, getUiAttrStyle, getUiExposeAttrs } from '../attrs'
import { inputOtpCell, inputOtpGroup, inputOtpRoot, type InputOtpProps } from '.'

defineOptions({
  inheritAttrs: false
})

type InputOtpModelValue = string | number
type InputOtpFinishCallback = (success: boolean) => void

const props = withDefaults(
  defineProps<{
    /** modelValue 是默认 v-model 绑定值。 */
    modelValue?: InputOtpModelValue
    /** digits 是验证码位数，默认 6 位。 */
    digits?: number
    /** autofocus 表示挂载后是否自动聚焦首个输入格。 */
    autofocus?: boolean
    /** disabled 表示是否禁用输入。 */
    disabled?: boolean
    /** readonly 表示是否只读展示。 */
    readonly?: boolean
    /** size 是输入格尺寸，可选，默认 md。 */
    size?: InputOtpProps['size']
    /** gap 是输入格之间的间距，可选，默认 md。 */
    gap?: InputOtpProps['gap']
    /** name 是表单提交时隐藏字段的名称。 */
    name?: string
    /** autocomplete 是原生自动填充策略，可选，默认 off。 */
    autocomplete?: string
    /** ariaLabel 是每个输入格的无障碍标签前缀。 */
    ariaLabel?: string
  }>(),
  {
    modelValue: undefined,
    digits: 6,
    autofocus: false,
    disabled: false,
    readonly: false,
    size: 'md',
    gap: 'md',
    name: undefined,
    autocomplete: 'off',
    ariaLabel: '验证码'
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'input', value: string, event: Event): void
  (e: 'change', value: string, event?: Event): void
  (e: 'finish', callback: InputOtpFinishCallback): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}>()

const attrs = useAttrs()
const inputRefs = useTemplateRef<HTMLInputElement[]>('inputRefs')
const cells = ref<string[]>([])
const focusedIndex = ref<number>()
const invalid = ref(false)
const loading = ref(false)

const digitCount = computed(() => Math.max(1, Math.floor(props.digits || 1)))
const indexes = computed(() => Array.from({ length: digitCount.value }, (_, index) => index))
const disabled = computed(() => props.disabled || loading.value)
const normalizedExternalValue = computed(() => String(props.modelValue ?? ''))
const codeValue = computed(() => cells.value.join(''))
const isComplete = computed(() => codeValue.value.length === digitCount.value && cells.value.every(Boolean))

const rootClass = computed(() => clsx(getUiAttrClass(attrs), inputOtpRoot({ disabled: disabled.value })))

function createEmptyCells() {
  return Array.from({ length: digitCount.value }, () => '')
}

function getDigitList(value: string) {
  return (value.match(/\d/g) || []).slice(0, digitCount.value)
}

/**
 * syncCellsFromValue 将外部受控值同步到分格数组。
 *
 * 外部值只保留数字字符，避免短信验证码中的空格或连接符进入输入状态。
 */
function syncCellsFromValue(value: string) {
  const nextCells = createEmptyCells()
  getDigitList(value).forEach((digit, index) => {
    nextCells[index] = digit
  })
  cells.value = nextCells
}

function getInput(index: number) {
  return inputRefs.value?.[index]
}

async function focusAt(index: number) {
  await nextTick()
  const targetIndex = Math.min(Math.max(index, 0), digitCount.value - 1)
  getInput(targetIndex)?.focus()
}

function emitValue(event: Event) {
  const value = codeValue.value
  emit('update:modelValue', value)
  emit('input', value, event)
}

function clearInvalidState() {
  invalid.value = false
}

function resetValue(event?: Event) {
  cells.value = createEmptyCells()
  const emptyValue = ''
  emit('update:modelValue', emptyValue)
  if (event) emit('input', emptyValue, event)
}

/**
 * submitCode 保留验证码完成后由调用方异步判定成功与否的协议。
 *
 * 组件先发出完整验证码，再延迟触发 finish，确保调用方能读取到最新 v-model 值。
 */
function submitCode(event?: Event) {
  if (loading.value || !isComplete.value) return
  loading.value = true
  window.setTimeout(() => {
    emit('finish', (success: boolean) => {
      if (success) return
      invalid.value = true
      void focusAt(0)
    })
    resetValue(event)
    emit('change', '', event)
    loading.value = false
  }, 150)
}

function writeDigits(digits: string[], startIndex: number, event: Event) {
  if (!digits.length) return
  clearInvalidState()
  const nextCells = [...cells.value]
  digits.slice(0, digitCount.value - startIndex).forEach((digit, offset) => {
    nextCells[startIndex + offset] = digit
  })
  cells.value = nextCells
  emitValue(event)
  const nextIndex = Math.min(startIndex + digits.length, digitCount.value - 1)
  void focusAt(nextIndex)
  if (isComplete.value) submitCode(event)
}

function handleKeydown(event: KeyboardEvent, index: number) {
  if (disabled.value || props.readonly) return
  if (event.metaKey || event.ctrlKey) return

  if (/^\d$/.test(event.key)) {
    event.preventDefault()
    writeDigits([event.key], index, event)
    return
  }

  if (event.key === 'Backspace') {
    event.preventDefault()
    clearInvalidState()
    cells.value[index] = ''
    emitValue(event)
    void focusAt(index - 1)
    return
  }

  if (event.key === 'Delete') {
    event.preventDefault()
    clearInvalidState()
    cells.value[index] = ''
    emitValue(event)
    return
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    void focusAt(index - 1)
    return
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    void focusAt(index + 1)
    return
  }

  if (event.key === 'Home') {
    event.preventDefault()
    void focusAt(0)
    return
  }

  if (event.key === 'End') {
    event.preventDefault()
    void focusAt(digitCount.value - 1)
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    submitCode(event)
    return
  }

  if (event.key.length === 1) event.preventDefault()
}

function handleInput(event: Event, index: number) {
  if (disabled.value || props.readonly) return
  const target = event.target as HTMLInputElement
  const digits = getDigitList(target.value)
  if (digits.length) {
    writeDigits(digits, index, event)
    return
  }
  cells.value[index] = ''
  emitValue(event)
}

function handlePaste(event: ClipboardEvent, index: number) {
  if (disabled.value || props.readonly) return
  event.preventDefault()
  const text = event.clipboardData?.getData('text') || ''
  writeDigits(getDigitList(text), index, event)
}

function handleFocus(event: FocusEvent, index: number) {
  focusedIndex.value = index
  emit('focus', event)
}

function handleBlur(event: FocusEvent, index: number) {
  if (focusedIndex.value === index) focusedIndex.value = undefined
  emit('blur', event)
}

function handleAnimationEnd() {
  invalid.value = false
}

function focus() {
  void focusAt(0)
}

function blur() {
  inputRefs.value?.forEach((input) => input.blur())
}

function clear() {
  resetValue()
  void focusAt(0)
}

watch(
  () => [normalizedExternalValue.value, digitCount.value] as const,
  ([value]) => {
    syncCellsFromValue(value)
  },
  { immediate: true }
)

onMounted(() => {
  if (props.autofocus) focus()
})

defineExpose({
  blur,
  clear,
  focus
})
</script>

<template>
  <div :class="rootClass" :style="getUiAttrStyle(attrs)" data-ui-input-otp="true">
    <div :class="inputOtpGroup({ gap })">
      <input
        v-for="index in indexes"
        :key="index"
        ref="inputRefs"
        v-bind="index === 0 ? getUiExposeAttrs(attrs) : undefined"
        data-ui-input-otp-cell="true"
        :data-invalid="invalid ? 'true' : undefined"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        maxlength="1"
        :aria-label="`${ariaLabel}第 ${index + 1} 位`"
        :autocomplete="autocomplete"
        :value="cells[index]"
        :disabled="disabled"
        :readonly="readonly"
        :class="inputOtpCell({ size, focused: focusedIndex === index, invalid, disabled })"
        @keydown="handleKeydown($event, index)"
        @input="handleInput($event, index)"
        @paste="handlePaste($event, index)"
        @focus="handleFocus($event, index)"
        @blur="handleBlur($event, index)"
        @animationend="handleAnimationEnd"
      />
    </div>
    <input v-if="name" type="hidden" :name="name" :value="codeValue" />
    <span aria-hidden="true" class="i-lucide:loader-2 absolute top-1/2 size-5 -translate-y-1/2 animate-spin text-brand-500 transition-all duration-200" :class="loading ? '-right-8 opacity-100' : '-right-5 opacity-0'"></span>
  </div>
</template>

<style scoped>
[data-ui-input-otp-cell='true'][readonly] {
  cursor: default;
}

[data-ui-input-otp-cell='true'] {
  appearance: textfield;
}

[data-ui-input-otp-cell='true'].animate-shake,
[data-ui-input-otp-cell='true'][data-invalid='true'] {
  animation: input-otp-shake 0.5s ease-in-out;
}

@keyframes input-otp-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-2px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(2px);
  }
}
</style>
