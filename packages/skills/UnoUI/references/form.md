# Form

Use this file for `Form`, `FormItem`, validation rules, and exposed validation methods.

## Contents

- Basic Usage
- Form
- FormItem
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

## Rule Helpers

Import rule helpers from `@unoui/vue/form`:

```ts
import { createFormRule, type FormRules } from '@unoui/vue/form'
```

Use `createFormRule(preset, rule)` for built-in validator patterns such as `email`; inspect `packages/vue/src/form/index.ts` when a preset list is needed.
