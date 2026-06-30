# Selection Controls

Use this file for `Checkbox`, `Radio`, `Switch`, and `Select`.

## Contents

- Checkbox
- Radio
- Switch
- Select

## Checkbox

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox } from '@unoui/vue/checkbox'

const checked = ref(true)
const selected = ref(['apple'])
</script>

<template>
  <Checkbox v-model="checked">Accept</Checkbox>
  <Checkbox v-model="selected" value="apple">Apple</Checkbox>
  <Checkbox v-model="selected" value="orange">Orange</Checkbox>
</template>
```

Props:

- `modelValue`: `boolean | (string | number)[]`
- `checked`: uncontrolled checked state
- `value`: option value for group usage
- `disabled`
- `size`: `sm | md | lg`

Events:

- `update:modelValue(value)`
- `change(value)`
- `input(value)`
- `focus(FocusEvent)`, `blur(FocusEvent)`

Slots:

- `default`: checkbox label/content

Expose:

- None

## Radio

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Radio } from '@unoui/vue/radio'

const kind = ref('a')
</script>

<template>
  <Radio v-model="kind" value="a" name="kind">A</Radio>
  <Radio v-model="kind" value="b" name="kind" border>B</Radio>
</template>
```

Props:

- `modelValue`: `string | number | boolean`
- `checked`: uncontrolled checked state
- `value`: selected value emitted to `modelValue`; default `true`
- `disabled`
- `size`: `sm | md | lg`
- `border`
- `name`

Events:

- `update:modelValue(value)`
- `change(value)`
- `input(value)`
- `focus(FocusEvent)`, `blur(FocusEvent)`

Slots:

- `default`: radio label/content

Expose:

- None

## Switch

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Switch } from '@unoui/vue/switch'

const enabled = ref(true)
const status = ref('active')
</script>

<template>
  <Switch v-model="enabled" active-text="On" inactive-text="Off" />
  <Switch v-model="status" active-value="active" inactive-value="disabled" :before-change="confirmChange" />
</template>
```

Props:

- `modelValue`: `string | number | boolean`
- `checked`: uncontrolled checked state
- `activeValue`, `inactiveValue`
- `disabled`, `loading`
- `size`: `sm | md | lg`
- `width`
- `activeText`, `inactiveText`
- `activeIcon`, `inactiveIcon`
- `activeActionIcon`, `inactiveActionIcon`
- `inlinePrompt`
- `activeColor`, `inactiveColor`
- `beforeChange`: `() => boolean | Promise<boolean>`; return false to block
- `name`, `id`

Events:

- `update:modelValue(value)`
- `input(value)`
- `change(value)`
- `focus(FocusEvent)`, `blur(FocusEvent)`

Slots:

- `active`
- `inactive`
- `active-action`
- `inactive-action`

Expose:

- None

## Select

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Select, type SelectOption } from '@unoui/vue/select'

const value = ref('')
const multiple = ref<string[]>([])
const options: SelectOption[] = [{ label: 'Input', value: 'input' }]
</script>

<template>
  <Select v-model="value" :options="options" clearable filterable />
  <Select v-model="multiple" :options="options" multiple collapse-tags />
</template>
```

Props:

- `modelValue`: `SelectValue | SelectValue[]`
- `options`: `SelectOption[]`
- `placeholder`, `size`, `disabled`
- `clearable`, `multiple`, `filterable`
- `collapseTags`, `maxCollapseTags`
- `labelKey`, `valueKey`, `disabledKey`
- `noDataText`, `noMatchText`, `loading`, `loadingText`
- `clearIcon`, `suffixIcon`
- `maxHeight`, `teleportedWidth`
- `name`

Events:

- `update:modelValue(value)`
- `change(value)`
- `clear()`
- `remove-tag(SelectValue)`
- `visible-change(boolean)`
- `focus(FocusEvent)`, `blur(FocusEvent)`

Slots:

- `prefix`
- `option="{ option, label, value, selected, disabled }"`

Expose:

- `focus()`
- `blur()`
- `clear()`
