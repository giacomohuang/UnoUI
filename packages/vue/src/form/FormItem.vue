<script setup lang="ts">
import type { ValidateOption } from 'async-validator'
import { clsx } from 'clsx'
import { computed, getCurrentInstance, inject, onBeforeUnmount, onMounted, ref, shallowRef, toRaw, useAttrs, watch } from 'vue'
import type { CSSProperties } from 'vue'

import { getUiExposeAttrs } from '../attrs'

import { formContextKey, formItem, formItemContent, formItemLabel, formItemMessage, normalizeFormProp, validateFormValue, type FormItemContext, type FormItemRule, type FormLabelPosition, type FormProp, type FormSize, type FormValidateStatus, type FormValidateTrigger } from '.'

defineOptions({
  inheritAttrs: false
})

const props = withDefaults(
  defineProps<{
    /** prop 是 model 字段路径，支持 a.b 或路径数组。 */
    prop?: FormProp
    /** label 是字段标签文本，可选。 */
    label?: string
    /** rules 是字段局部规则，会与 Form.rules[prop] 合并。 */
    rules?: FormItemRule
    /** required 可单独控制必填星号；未设置时从规则推导。 */
    required?: boolean
    /** error 是外部传入的错误消息，会覆盖内部校验结果。 */
    error?: string
    /** validateStatus 是外部传入的校验状态。 */
    validateStatus?: FormValidateStatus
    /** showMessage 是否显示本字段错误消息，默认继承 Form。 */
    showMessage?: boolean
    /** labelWidth 覆盖 Form.labelWidth。 */
    labelWidth?: string | number
    /** reserveLabelSpace 控制无 label 时是否保留标签列，默认继承 Form。 */
    reserveLabelSpace?: boolean
    /** labelPosition 覆盖 Form.labelPosition。 */
    labelPosition?: FormLabelPosition
    /** size 覆盖 Form.size。 */
    size?: FormSize
  }>(),
  {
    prop: undefined,
    label: '',
    rules: undefined,
    required: undefined,
    error: '',
    validateStatus: '',
    showMessage: undefined,
    labelWidth: undefined,
    reserveLabelSpace: undefined,
    labelPosition: undefined,
    size: undefined
  }
)

const attrs = useAttrs()
const instance = getCurrentInstance()
const form = inject(formContextKey, undefined)
const validateState = ref<FormValidateStatus>('')
const validateMessage = ref('')
const localInitialValue = shallowRef<unknown>()
const localInitialValueReady = ref(false)

const currentSize = computed(() => props.size ?? form?.size.value ?? 'md')
const currentLabelPosition = computed(() => props.labelPosition ?? form?.labelPosition.value ?? 'right')
const currentLabelWidth = computed(() => {
  if (currentLabelPosition.value === 'top') return 'auto'
  const width = props.labelWidth ?? form?.labelWidth.value ?? '96px'
  return typeof width === 'number' ? `${width}px` : width
})
const currentShowMessage = computed(() => props.showMessage ?? form?.showMessage.value ?? true)
const fieldRules = computed(() => form?.getFieldRules(props.prop, props.rules) ?? [])
const isRequired = computed(() => props.required ?? fieldRules.value.some((rule) => rule.required))
const showRequiredAsterisk = computed(() => isRequired.value && !(form?.hideRequiredAsterisk.value ?? false))
const hasOwnReserveLabelSpace = computed(() => {
  const vnodeProps = instance?.vnode.props
  return !!vnodeProps && ('reserveLabelSpace' in vnodeProps || 'reserve-label-space' in vnodeProps)
})
const currentReserveLabelSpace = computed(() => (hasOwnReserveLabelSpace.value ? props.reserveLabelSpace : (form?.reserveLabelSpace.value ?? true)))
const shouldReserveLabelSpace = computed(() => !props.label && currentLabelPosition.value !== 'top' && currentReserveLabelSpace.value)
const shownValidateState = computed(() => props.validateStatus || (props.error ? 'error' : validateState.value))
const shownValidateMessage = computed(() => props.error || validateMessage.value)
const labelId = computed(() => (props.label ? `ui-form-item-${normalizeFormProp(props.prop) ?? Math.random().toString(36).slice(2)}-label` : undefined))
const contentId = computed(() => (props.prop ? `ui-form-item-${normalizeFormProp(props.prop)}-content` : undefined))
const itemClass = computed(() =>
  clsx(
    attrs.class as string | undefined,
    formItem({
      inline: form?.inline.value ?? false,
      labelPosition: currentLabelPosition.value,
      size: currentSize.value,
      error: shownValidateState.value === 'error'
    })
  )
)
const itemStyle = computed<CSSProperties>(() => ({
  ...(attrs.style as CSSProperties | undefined),
  '--ui-form-item-gap': typeof form?.itemGap.value === 'number' ? `${form.itemGap.value}px` : form?.itemGap.value,
  '--ui-form-label-width': currentLabelWidth.value
}))
const labelClass = computed(() =>
  formItemLabel({
    labelPosition: currentLabelPosition.value,
    size: currentSize.value,
    required: showRequiredAsterisk.value,
    requiredPosition: form?.requireAsteriskPosition.value ?? 'left'
  })
)
const contentClass = computed(() => clsx(formItemContent({ labelPosition: currentLabelPosition.value, size: currentSize.value }), !props.label && currentLabelPosition.value !== 'top' && (shouldReserveLabelSpace.value ? 'col-start-2' : 'col-span-full')))
const messageClass = computed(() => formItemMessage({ status: shownValidateState.value }))

function isObjectValue(value: unknown): value is object {
  return value !== null && typeof value === 'object'
}

function cloneInitialFieldValue(value: unknown): unknown {
  const rawValue = toRaw(value)
  if (Array.isArray(rawValue)) return rawValue.map((item) => cloneInitialFieldValue(item))
  if (!isObjectValue(rawValue)) return rawValue
  if (rawValue instanceof Date) return new Date(rawValue)
  if (rawValue instanceof RegExp) {
    const clonedValue = new RegExp(rawValue.source, rawValue.flags)
    clonedValue.lastIndex = rawValue.lastIndex
    return clonedValue
  }
  if (rawValue instanceof ArrayBuffer || ArrayBuffer.isView(rawValue)) return structuredClone(rawValue)
  if (rawValue instanceof Map) return new Map(Array.from(rawValue.entries(), ([key, item]) => [cloneInitialFieldValue(key), cloneInitialFieldValue(item)]))
  if (rawValue instanceof Set) return new Set(Array.from(rawValue.values(), (item) => cloneInitialFieldValue(item)))

  const prototype = Object.getPrototypeOf(rawValue)
  if (prototype !== Object.prototype && prototype !== null) {
    try {
      return structuredClone(rawValue)
    } catch {
      return rawValue
    }
  }

  const cloneableValue: Record<PropertyKey, unknown> = {}
  Reflect.ownKeys(rawValue).forEach((key) => {
    cloneableValue[key] = cloneInitialFieldValue((rawValue as Record<PropertyKey, unknown>)[key])
  })
  return cloneableValue
}

function shouldValidateByTrigger(ruleTrigger: FormValidateTrigger | FormValidateTrigger[] | undefined, trigger?: FormValidateTrigger) {
  if (!trigger) return true
  if (!ruleTrigger) return true
  return Array.isArray(ruleTrigger) ? ruleTrigger.includes(trigger) : ruleTrigger === trigger
}

async function validate(trigger?: FormValidateTrigger, options: ValidateOption = {}) {
  const rules = fieldRules.value.filter((rule) => shouldValidateByTrigger(rule.trigger, trigger))
  if (!props.prop || rules.length === 0) {
    validateState.value = ''
    validateMessage.value = ''
    return { valid: true }
  }

  validateState.value = 'validating'
  const result = await validateFormValue(props.prop, form?.getFieldValue(props.prop), rules, options)
  validateState.value = result.valid ? 'success' : 'error'
  validateMessage.value = result.errors?.[0]?.message ?? ''
  form?.emitValidate(props.prop, result.valid, validateMessage.value)
  return result
}

function resetField() {
  if (props.prop && form && localInitialValueReady.value) form.setFieldValue(props.prop, cloneInitialFieldValue(localInitialValue.value))
  clearValidate()
}

function clearValidate() {
  validateState.value = ''
  validateMessage.value = ''
}

const fieldContext: FormItemContext = {
  prop: props.prop,
  validateState,
  validateMessage,
  validate,
  resetField,
  clearValidate,
  isRequired
}

watch(
  () => props.error,
  (error) => {
    if (error) {
      validateState.value = 'error'
      validateMessage.value = error
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (props.prop && form) {
    const value = form.getFieldValue(props.prop)
    localInitialValue.value = cloneInitialFieldValue(value)
    localInitialValueReady.value = true
    form.registerField(fieldContext)
  }
})

onBeforeUnmount(() => {
  form?.unregisterField(fieldContext)
})

defineExpose({
  validate,
  resetField,
  clearValidate,
  validateState,
  validateMessage
})
</script>

<template>
  <div v-bind="getUiExposeAttrs(attrs)" :class="itemClass" :style="itemStyle" :data-status="shownValidateState || undefined">
    <slot name="label" :label="label">
      <label v-if="label" :id="labelId" :for="contentId" :class="labelClass">
        <span class="min-w-0 whitespace-normal break-words text-inherit">{{ label }}</span>
      </label>
      <div v-else-if="shouldReserveLabelSpace" aria-hidden="true"></div>
    </slot>

    <div :id="contentId" :class="contentClass" :aria-labelledby="labelId">
      <slot :validate="validate" :validate-state="shownValidateState" :validate-message="shownValidateMessage"></slot>
      <slot v-if="currentShowMessage && shownValidateMessage" name="error" :error="shownValidateMessage" :validate-state="shownValidateState">
        <div :class="messageClass">{{ shownValidateMessage }}</div>
      </slot>
    </div>
  </div>
</template>
