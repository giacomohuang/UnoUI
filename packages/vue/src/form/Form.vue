<script setup lang="ts">
import type { ValidateFieldsError, Values } from 'async-validator'
import { clsx } from 'clsx'
import { computed, nextTick, provide, ref, shallowRef, toRef, useAttrs, watch } from 'vue'
import type { CSSProperties } from 'vue'

import { getUiExposeAttrs } from '../attrs'
import { defaultFormValidateMessages, formContextKey, formRoot, getValueByPath, normalizeFormProp, normalizeRules, setValueByPath, type FormContext, type FormItemContext, type FormItemRule, type FormLabelPosition, type FormProp, type FormRules, type FormSize, type FormValidateCallback, type FormValidateTrigger } from '.'

defineOptions({
  inheritAttrs: false
})

const props = withDefaults(
  defineProps<{
    /** model 是表单数据对象，字段校验会按 prop 从该对象取值。 */
    model?: Values
    /** rules 是表单级校验规则，语法兼容 async-validator，并扩展 preset/trigger。 */
    rules?: FormRules
    /** inline 表示行内表单布局。 */
    inline?: boolean
    /** labelPosition 是标签位置，支持 left/right/top。 */
    labelPosition?: FormLabelPosition
    /** labelWidth 是非 top 布局下的标签列宽。 */
    labelWidth?: string | number
    /** reserveLabelSpace 控制无 label 的 FormItem 是否保留标签列。 */
    reserveLabelSpace?: boolean
    /** itemGap 是字段之间的纵向间距，支持数字像素值或 CSS 长度。 */
    itemGap?: string | number
    /** size 统一控制 FormItem 标签尺寸，默认 md。 */
    size?: FormSize
    /** disabled 统一设置表单禁用语义，具体控件仍需绑定自身 disabled。 */
    disabled?: boolean
    /** showMessage 是否显示 FormItem 错误消息。 */
    showMessage?: boolean
    /** validateTrigger 设置字段默认自动校验时机；空数组表示仅显式校验。 */
    validateTrigger?: FormValidateTrigger | FormValidateTrigger[]
    /** validateOnRuleChange 是否在 rules 变化时重新校验。 */
    validateOnRuleChange?: boolean
    /** requireAsteriskPosition 设置必填星号位置。 */
    requireAsteriskPosition?: 'left' | 'right'
    /** hideRequiredAsterisk 是否隐藏必填星号。 */
    hideRequiredAsterisk?: boolean
  }>(),
  {
    model: undefined,
    rules: undefined,
    inline: false,
    labelPosition: 'right',
    labelWidth: '96px',
    reserveLabelSpace: true,
    itemGap: '16px',
    size: 'md',
    disabled: false,
    showMessage: true,
    validateTrigger: () => ['change', 'blur'],
    validateOnRuleChange: true,
    requireAsteriskPosition: 'left',
    hideRequiredAsterisk: false
  }
)

const emit = defineEmits<{
  (e: 'validate', prop: FormProp | undefined, valid: boolean, message: string): void
  (e: 'submit', event: SubmitEvent): void
  (e: 'reset', event: Event): void
}>()

const attrs = useAttrs()
const fields = shallowRef<FormItemContext[]>([])

const rootClass = computed(() => clsx(attrs.class as string | undefined, formRoot({ inline: props.inline, size: props.size, disabled: props.disabled })))
const rootStyle = computed<CSSProperties>(() => ({
  ...(attrs.style as CSSProperties | undefined),
  '--ui-form-item-gap': typeof props.itemGap === 'number' ? `${props.itemGap}px` : props.itemGap
}))

function getLabelWidthValue() {
  if (props.labelPosition === 'top') return 'auto'
  return typeof props.labelWidth === 'number' ? `${props.labelWidth}px` : props.labelWidth
}

function getFieldRules(prop?: FormProp, localRules?: FormItemRule) {
  const normalizedProp = normalizeFormProp(prop)
  return [...normalizeRules(normalizedProp ? props.rules?.[normalizedProp] : undefined), ...normalizeRules(localRules)]
}

function getFieldValue(prop?: FormProp) {
  return getValueByPath(props.model, prop)
}

function setFieldValue(prop: FormProp | undefined, value: unknown) {
  setValueByPath(props.model, prop, value)
}

function getTargetFields(propsValue?: FormProp | FormProp[]) {
  if (!propsValue) return [...fields.value]
  const propList = (Array.isArray(propsValue) && typeof propsValue[0] !== 'string' ? propsValue : [propsValue]) as FormProp[]
  const propSet = new Set(propList.map((prop) => normalizeFormProp(prop)))
  return fields.value.filter((field) => field.prop && propSet.has(normalizeFormProp(field.prop)))
}

async function validateField(propsValue?: FormProp | FormProp[], callback?: FormValidateCallback) {
  const targetFields = getTargetFields(propsValue)
  const invalidFields: ValidateFieldsError = {}
  let valid = true

  for (const field of targetFields) {
    const result = await field.validate()
    const prop = normalizeFormProp(field.prop)
    if (!result.valid && prop) {
      valid = false
      invalidFields[prop] = result.errors ?? []
    }
  }

  await callback?.(valid, valid ? undefined : invalidFields)
  return valid
}

function clearValidate(propsValue?: FormProp | FormProp[]) {
  getTargetFields(propsValue).forEach((field) => field.clearValidate())
}

function resetFields(propsValue?: FormProp | FormProp[]) {
  getTargetFields(propsValue).forEach((field) => field.resetField())
}

function registerField(field: FormItemContext) {
  fields.value = [...fields.value, field]
}

function unregisterField(field: FormItemContext) {
  fields.value = fields.value.filter((item) => item !== field)
}

function emitValidate(prop: FormProp | undefined, valid: boolean, message: string) {
  emit('validate', prop, valid, message)
}

function handleSubmit(event: SubmitEvent) {
  emit('submit', event)
}

function handleReset(event: Event) {
  resetFields()
  emit('reset', event)
}

watch(
  () => props.rules,
  () => {
    if (props.validateOnRuleChange) void nextTick(() => validateField())
  },
  { deep: true }
)

provide<FormContext>(formContextKey, {
  get model() {
    return props.model
  },
  get rules() {
    return props.rules
  },
  size: toRef(props, 'size'),
  disabled: toRef(props, 'disabled'),
  inline: toRef(props, 'inline'),
  labelPosition: toRef(props, 'labelPosition'),
  labelWidth: computed(getLabelWidthValue),
  reserveLabelSpace: toRef(props, 'reserveLabelSpace'),
  itemGap: toRef(props, 'itemGap'),
  showMessage: toRef(props, 'showMessage'),
  validateTrigger: toRef(props, 'validateTrigger'),
  requireAsteriskPosition: toRef(props, 'requireAsteriskPosition'),
  hideRequiredAsterisk: toRef(props, 'hideRequiredAsterisk'),
  validateOnRuleChange: toRef(props, 'validateOnRuleChange'),
  registerField,
  unregisterField,
  getFieldRules,
  getFieldValue,
  setFieldValue,
  validateField,
  clearValidate,
  resetFields,
  emitValidate
})

defineExpose({
  validate: (callback?: FormValidateCallback) => validateField(undefined, callback),
  validateField,
  resetFields,
  clearValidate,
  fields,
  defaultValidateMessages: ref(defaultFormValidateMessages)
})
</script>

<template>
  <form v-bind="getUiExposeAttrs(attrs)" :class="rootClass" :style="rootStyle" :data-disabled="disabled || undefined" @submit="handleSubmit" @reset="handleReset">
    <slot></slot>
  </form>
</template>
