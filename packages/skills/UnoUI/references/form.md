# Form

Use this file for `Form`, `FormItem`, validation rules, and exposed validation methods.

## Contents

- Basic Usage
- Form
- FormItem
- Types
- Rule Helpers

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Form, FormItem, createFormRule } from '@unoui/vue/form'
import { Input } from '@unoui/vue/input'

const formRef = ref<InstanceType<typeof Form>>()
const model = ref({ email: '' })
const rules = {
  email: [
    { required: true, message: 'Required' },
    createFormRule('email', { message: 'Invalid email' })
  ]
}

async function submit() {
  const valid = await formRef.value?.validate()
  if (!valid) return
}
</script>

<template>
  <Form ref="formRef" :model="model" :rules="rules">
    <FormItem label="Email" prop="email">
      <Input v-model="model.email" />
    </FormItem>
  </Form>
</template>
```

## Form

Props:

- `model`: form data object
- `rules`: `FormRules`
- `inline`
- `labelPosition`: `left | right | top`
- `labelWidth`: default `96px`
- `reserveLabelSpace`: default `true`
- `itemGap`: default `16px`
- `size`: `sm | md | lg`
- `disabled`
- `showMessage`: default `true`
- `validateTrigger`: `blur | change | (blur | change)[]`; defaults to `['change', 'blur']`; use an empty array to validate only through explicit `validate()` / `validateField()` calls
- `validateOnRuleChange`: default `true`
- `requireAsteriskPosition`: `left | right`
- `hideRequiredAsterisk`

Events:

- `validate(prop, valid, message)`
- `submit(Event)`
- `reset(Event)`

Slots:

- `default`: usually `FormItem` children

Expose:

- `validate(callback?)`
- `validateField`
- `resetFields`
- `clearValidate`
- `fields`
- `defaultValidateMessages`

## FormItem

Props:

- `prop`: `string | string[]`; supports dot paths
- `label`
- `info`: renders an info icon beside the built-in label and shows the content in a hover/focus tooltip
- `rules`: `FormRule | FormRule[]`
- `required`: overrides rule required state
- `error`
- `validateStatus`: empty string, `success`, `error`, or `validating`
- `showMessage`
- `validateTrigger`: overrides the parent Form trigger for this field; an empty array disables automatic validation
- `labelWidth`
- `reserveLabelSpace`
- `labelPosition`
- `size`

Slots:

- `default="{ validate, validateState, validateMessage }"`
- `label="{ label }"`
- `info`: custom rich Tooltip content; providing this slot shows the info icon without requiring the `info` prop
- `error="{ error, validateState }"`

Expose:

- `validate`
- `resetField`
- `clearValidate`
- `validateState`
- `validateMessage`

Events:

- None

Trigger rules:

- `Form.validateTrigger` supplies the default automatic validation events.
- `FormItem.validateTrigger` overrides the Form setting for one field.
- A rule's `trigger` filters which automatic event runs that rule.
- Explicit `Form.validate()` and `Form.validateField()` ignore automatic triggers and always evaluate all applicable rules.

## Types

`FormRule` contains the following `async-validator` rule fields plus UnoUI's `trigger` and `preset` extensions:

| Field | Type | Meaning |
| --- | --- | --- |
| `type` | `'string' \| 'number' \| 'boolean' \| 'method' \| 'regexp' \| 'integer' \| 'float' \| 'array' \| 'object' \| 'enum' \| 'date' \| 'url' \| 'hex' \| 'email' \| 'pattern' \| 'any'` | Expected value type |
| `required` | `boolean` | Requires a value |
| `pattern` | `RegExp \| string` | Pattern the value must match |
| `min` / `max` / `len` | `number` | Length constraint for strings/arrays or value constraint for numbers |
| `enum` | `Array<string \| number \| boolean \| null \| undefined>` | Allowed values for an `enum` rule |
| `whitespace` | `boolean` | Rejects strings containing only whitespace |
| `fields` | `Record<string, RuleItem \| RuleItem[]>` | `async-validator` rules for nested object or array fields |
| `defaultField` | `RuleItem \| RuleItem[]` | Default rule for undeclared object or array children |
| `options` | `ValidateOption` | Rule-level `async-validator` options |
| `transform` | `(value: any) => any` | Transforms the value before validation |
| `message` | `string \| ((value?: string) => string)` | Validation failure message |
| `validator` | `(rule, value, callback, source, options) => boolean \| Error \| string \| Array<Error \| string> \| void` | Custom synchronous or callback validator |
| `asyncValidator` | `(rule, value, callback, source, options) => void \| Promise<void>` | Custom asynchronous validator |
| `trigger` | `FormValidateTrigger \| FormValidateTrigger[]` | Automatic events that run this rule; explicit validation ignores it |
| `preset` | `FormRulePreset` | UnoUI built-in pattern; an explicit `pattern` or `message` wins |

Related types:

```ts
type Values = Record<string, any>
type FormValidateTrigger = 'blur' | 'change' | (string & {})
type FormItemRule = FormRule | FormRule[]
type FormRules<T extends Values = Values> =
  Partial<Record<keyof T | string, FormItemRule>>
type FormProp = string | string[]
type FormValidateStatus = '' | 'validating' | 'success' | 'error'
```

`FormValidateTrigger | FormValidateTrigger[]` accepts one trigger or an array of triggers. The built-in triggers are `blur` and `change`; custom string triggers are also accepted. An empty array disables automatic validation.

`FormRulePreset` is one of `email`, `phoneCN`, `url`, `ipv4`, `idCardCN`, `postalCodeCN`, `integer`, `positiveInteger`, `number`, `decimal2`, `alpha`, `alphaNum`, `projectId`, `slug`, `hexColor`, `chinese`, or `password`.

## Rule Helpers

Import rule helpers from `@unoui/vue/form`:

```ts
import { createFormRule, type FormRules } from '@unoui/vue/form'
```

Use `createFormRule(preset, rule)` for built-in validator patterns such as `email`; inspect `packages/vue/src/form/index.ts` when a preset list is needed.
