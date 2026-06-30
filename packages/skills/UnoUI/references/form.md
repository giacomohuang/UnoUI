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
- `rules`: `FormRule | FormRule[]`
- `required`: overrides rule required state
- `error`
- `validateStatus`: empty string, `success`, `error`, or `validating`
- `showMessage`
- `labelWidth`
- `reserveLabelSpace`
- `labelPosition`
- `size`

Slots:

- `default="{ validate, validateState, validateMessage }"`
- `label="{ label }"`
- `error="{ error, validateState }"`

Expose:

- `validate`
- `resetField`
- `clearValidate`
- `validateState`
- `validateMessage`

Events:

- None

## Rule Helpers

Import rule helpers from `@unoui/vue/form`:

```ts
import { createFormRule, type FormRules } from '@unoui/vue/form'
```

Use `createFormRule(preset, rule)` for built-in validator patterns such as `email`; inspect `packages/vue/src/form/index.ts` when a preset list is needed.
