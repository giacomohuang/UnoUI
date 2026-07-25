<script setup lang="ts">
import { clsx } from 'clsx'
import { computed, nextTick, ref, useAttrs, useSlots, useTemplateRef } from 'vue'

import { inputAddon, inputControl, inputGroup, inputWrapper, type InputProps } from '.'
import { Tag, type TagProps } from '../tag'

defineOptions({
  inheritAttrs: false
})

type TriggerKey = 'Enter' | 'Space' | 'Tab' | ',' | ';' | ' '

const props = withDefaults(
  defineProps<{
    /** modelValue 是标签数组，可选。 */
    modelValue?: string[]
    /** size 是输入框尺寸，可选，默认 md，并与 Input/Button 高度对齐。 */
    size?: InputProps['size']
    /** disabled 表示是否禁用输入和交互，可选，默认 false。 */
    disabled?: boolean
    /** readonly 表示是否只读，可选，默认 false。 */
    readonly?: boolean
    /** placeholder 是无标签时的占位文案，可选。 */
    placeholder?: string
    /** inputPlaceholder 是已有标签后的输入占位文案，可选。 */
    inputPlaceholder?: string
    /** clearable 表示是否显示一键清空按钮，可选，默认 false。 */
    clearable?: boolean
    /** clearIcon 是清空按钮自定义图标类名，可选，默认 lucide:x。 */
    clearIcon?: string
    /** closeIcon 是标签关闭按钮自定义图标类名，可选，默认 lucide:x。 */
    closeIcon?: string
    /** trigger 是创建标签的按键集合，可选，默认 Enter。 */
    trigger?: TriggerKey | TriggerKey[]
    /** delimiters 是粘贴或输入时可拆分标签的分隔符，可选。 */
    delimiters?: string[]
    /** max 是最多可创建的标签数量，可选。 */
    max?: number
    /** maxlength 是单个标签最大输入字数，可选。 */
    maxlength?: number
    /** validateTag 用于自定义标签是否允许创建，可选。 */
    validateTag?: (value: string) => boolean
    /** allowDuplicates 表示是否允许重复标签，可选，默认 false。 */
    allowDuplicates?: boolean
    /** tagColor 是内部标签语义色，可选，默认 gray。 */
    tagColor?: TagProps['color']
    /** tagVariant 是内部标签视觉效果，可选，默认 light。 */
    tagVariant?: TagProps['variant']
    /** tagRadius 是内部标签圆角，可选，默认 md。 */
    tagRadius?: TagProps['radius']
    /** name 是内部输入的原生 name，可选。 */
    name?: string
    /** autocomplete 是内部输入的原生 autocomplete，可选。 */
    autocomplete?: string
  }>(),
  {
    modelValue: () => [],
    size: 'md',
    disabled: false,
    readonly: false,
    placeholder: '',
    inputPlaceholder: '',
    clearable: false,
    clearIcon: 'i-lucide:x',
    closeIcon: 'i-lucide:x',
    trigger: 'Enter',
    delimiters: () => [','],
    max: undefined,
    maxlength: undefined,
    validateTag: undefined,
    allowDuplicates: false,
    tagColor: 'brand',
    tagVariant: 'light',
    tagRadius: 'md',
    name: undefined,
    autocomplete: undefined
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
  (e: 'input', value: string[]): void
  (e: 'change', value: string[]): void
  (e: 'add-tag', value: string): void
  (e: 'remove-tag', value: string, index: number): void
  (e: 'clear'): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'keydown', event: KeyboardEvent): void
}>()

const attrs = useAttrs()
const slots = useSlots()
const inputRef = useTemplateRef<HTMLInputElement>('inputRef')
const inputValue = ref('')
const focused = ref(false)
const composing = ref(false)

const hasPrepend = !!slots.prepend
const hasAppend = !!slots.append
const hasPrefix = () => !!slots.prefix
const hasSuffix = () => !!slots.suffix
const isReadonlyLike = () => props.disabled || props.readonly
const normalizedTags = computed(() => props.modelValue.filter((tag) => tag !== undefined && tag !== null))
const canCreateMore = () => props.max === undefined || normalizedTags.value.length < props.max
const showClearButton = () => props.clearable && !isReadonlyLike() && normalizedTags.value.length > 0
const tagSize = computed<TagProps['size']>(() => (props.size === 'lg' ? 'md' : 'sm'))
const currentPlaceholder = computed(() => (normalizedTags.value.length === 0 ? props.placeholder : props.inputPlaceholder))
const triggerKeys = computed(() => {
  const triggers = Array.isArray(props.trigger) ? props.trigger : [props.trigger]
  return new Set(triggers)
})
const activeDelimiters = computed(() => props.delimiters.filter(Boolean))

const getAttrClass = () => clsx(attrs.class as string | undefined)
const getAttrStyle = () => attrs.style
const wrapperStyle = computed(() => getAttrStyle())
const getExposeAttrs = () => {
  // class/style 绑定在外层容器，其余原生属性透传给内部 input。
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
      multiline: true
    }),
    'flex-wrap items-center! content-start overflow-visible! gap-1 px-2 py-1',
    props.size === 'sm' && 'px-1.5',
    props.size === 'lg' && 'px-2.5',
    showClearButton() && 'pr-7!',
    hasPrepend && '-ml-px rounded-l-none',
    hasAppend && '-mr-px rounded-r-none'
  )
)
const inputClass = computed(() =>
  clsx(
    inputControl({
      size: props.size,
      multiline: false,
      number: false
    }),
    'min-w-20 flex-[1_0_5rem]! self-center px-1! py-0!',
    props.size === 'sm' ? 'h-5! text-sm/5' : props.size === 'lg' ? 'h-7!' : 'h-6!'
  )
)
const clearButtonClass = computed(() =>
  clsx(
    'absolute right-2 top-1/2 flex size-4 -translate-y-1/2 items-center justify-center rounded-full bg-tertiary/90 text-tertiary/60 opacity-0 transition-all duration-150 hover:bg-tertiary hover:text-tertiary group-hover/ui-input:opacity-100 group-focus-within/ui-input:opacity-100'
  )
)

const focus = () => inputRef.value?.focus()
const blur = () => inputRef.value?.blur()

const emitTags = (tags: string[]) => {
  emit('update:modelValue', tags)
  emit('input', tags)
}

const commitTags = (tags: string[]) => {
  emitTags(tags)
  emit('change', tags)
}

const normalizeCandidate = (value: string) => value.trim()

const isTagAllowed = (value: string, existingTags: string[]) => {
  if (!value) return false
  if (!props.allowDuplicates && existingTags.includes(value)) return false
  if (props.validateTag && !props.validateTag(value)) return false
  return true
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const splitInputValue = (value: string) => {
  if (activeDelimiters.value.length === 0) return [value]
  return value.split(new RegExp(activeDelimiters.value.map(escapeRegExp).join('|')))
}

/** addTagsFromText 将输入文本标准化、去重并追加到标签数组。 */
const addTagsFromText = (value: string) => {
  if (isReadonlyLike() || !canCreateMore()) return false
  const nextTags = [...normalizedTags.value]
  let added = false

  for (const candidate of splitInputValue(value)) {
    if (props.max !== undefined && nextTags.length >= props.max) break
    const tagValue = normalizeCandidate(candidate)
    if (!isTagAllowed(tagValue, nextTags)) continue
    nextTags.push(tagValue)
    added = true
    emit('add-tag', tagValue)
    if (props.max !== undefined && nextTags.length >= props.max) break
  }

  if (added) {
    inputValue.value = ''
    commitTags(nextTags)
  }

  return added
}

const removeTag = (index: number) => {
  if (isReadonlyLike()) return
  const nextTags = [...normalizedTags.value]
  const [removed] = nextTags.splice(index, 1)
  commitTags(nextTags)
  if (removed !== undefined) emit('remove-tag', removed, index)
  void nextTick(focus)
}

const clear = () => {
  if (isReadonlyLike() || normalizedTags.value.length === 0) return
  inputValue.value = ''
  commitTags([])
  emit('clear')
  void nextTick(focus)
}

const handleWrapperPointerDown = (event: PointerEvent) => {
  if (event.target === inputRef.value) return
  if ((event.target as HTMLElement | null)?.closest('button')) return
  event.preventDefault()
  focus()
}

const handleInput = (event: Event) => {
  if (isReadonlyLike()) return
  inputValue.value = (event.target as HTMLInputElement).value
  if (!composing.value && activeDelimiters.value.some((delimiter) => inputValue.value.includes(delimiter))) addTagsFromText(inputValue.value)
}

const handlePaste = (event: ClipboardEvent) => {
  if (isReadonlyLike()) return
  const text = event.clipboardData?.getData('text')
  if (!text || !activeDelimiters.value.some((delimiter) => text.includes(delimiter))) return
  event.preventDefault()
  addTagsFromText(text)
}

const handleFocus = (event: FocusEvent) => {
  focused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  focused.value = false
  if (inputValue.value) addTagsFromText(inputValue.value)
  emit('blur', event)
}

const handleCompositionStart = () => {
  composing.value = true
}

const handleCompositionEnd = (event: CompositionEvent) => {
  composing.value = false
  inputValue.value = (event.target as HTMLInputElement).value
}

const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', event)
  if (isReadonlyLike() || composing.value) return

  const shouldTrigger = triggerKeys.value.has(event.key as TriggerKey) || (event.key === ' ' && triggerKeys.value.has('Space'))
  if (shouldTrigger) {
    if (event.key === 'Tab' && inputValue.value.trim()) event.preventDefault()
    const added = addTagsFromText(inputValue.value)
    if (added || inputValue.value.trim()) event.preventDefault()
    if (added && event.key === 'Tab') void nextTick(focus)
    return
  }

  if (event.key === 'Backspace' && inputValue.value === '' && normalizedTags.value.length > 0) {
    event.preventDefault()
    removeTag(normalizedTags.value.length - 1)
  }
}

defineExpose({
  blur,
  clear,
  focus
})
</script>

<template>
  <div :class="inputGroup({ size, multiline: true })">
    <div v-if="hasPrepend" :class="inputAddon({ position: 'prepend', size, disabled })">
      <slot name="prepend"></slot>
    </div>
    <div :class="wrapperClass" :style="wrapperStyle" data-ui-input-tag="true" @pointerdown="handleWrapperPointerDown">
      <span v-if="hasPrefix()" class="flex shrink-0 self-center items-center gap-1 text-tertiary">
        <slot name="prefix"></slot>
      </span>

      <Tag v-for="(item, index) in normalizedTags" :key="`${item}-${index}`" :color="tagColor" :variant="tagVariant" :size="tagSize" :radius="tagRadius" :closable="!disabled && !readonly" :close-icon="closeIcon" class="max-w-full self-center" @close="removeTag(index)">
        <slot name="tag" :tag="item" :index="index">{{ item }}</slot>
      </Tag>

      <input
        ref="inputRef"
        v-bind="getExposeAttrs()"
        data-ui-input-tag-control="true"
        :name="name"
        :value="inputValue"
        :maxlength="maxlength"
        :placeholder="currentPlaceholder"
        :disabled="disabled || !canCreateMore()"
        :readonly="readonly"
        :autocomplete="autocomplete"
        :class="inputClass"
        @input="handleInput"
        @paste="handlePaste"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        @compositionstart="handleCompositionStart"
        @compositionend="handleCompositionEnd"
      />

      <span v-if="hasSuffix()" class="ml-auto flex shrink-0 self-center items-center gap-1 text-tertiary">
        <slot name="suffix"></slot>
      </span>
      <button v-if="showClearButton()" type="button" aria-label="清空" :class="clearButtonClass" @click.stop="clear">
        <span :class="clearIcon" class="size-3"></span>
      </button>
    </div>
    <div v-if="hasAppend" :class="inputAddon({ position: 'append', size, disabled })">
      <slot name="append"></slot>
    </div>
  </div>
</template>
