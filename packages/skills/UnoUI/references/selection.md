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
  <div class="inline-flex">
    <Radio v-model="kind" value="a" name="kind-buttons" type="button" button-style="solid">A</Radio>
    <Radio v-model="kind" value="b" name="kind-buttons" type="button" button-style="solid">B</Radio>
    <Radio v-model="kind" value="c" name="kind-buttons" type="button" button-style="solid">C</Radio>
  </div>
</template>
```

Props:

- `modelValue`: `string | number | boolean`
- `checked`: uncontrolled checked state
- `value`: selected value emitted to `modelValue`; default `true`
- `disabled`
- `size`: `sm | md | lg`
- `border`
- `type`: `radio | button`; use `button` for button-style radio while keeping native radio semantics
- `buttonStyle`: `outline | solid`; only applies when `type="button"`
- `name`

Button-style grouping:

- Put adjacent `Radio type="button"` instances in an `inline-flex` or flex row without `gap`; adjacent button radios merge borders and keep only outer group corners.
- Keep the same `name` and shared scalar `v-model` for all options in the same button group.

Events:

- `update:modelValue(value)`
- `change(value)`
- `input(Event)`: native input event passthrough
- `focus(FocusEvent)`, `blur(FocusEvent)`

Slots:

- `default`: radio label/content

Expose:

- `focus()`
- `blur()`

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
- `width`: trigger/control width; accepts CSS length string or number-as-px
- `clearable`, `multiple`, `filterable`
- `collapseTags`, `maxCollapseTags`
- `labelKey`, `valueKey`, `disabledKey`
- `noDataText`, `noMatchText`, `loading`, `loadingText`
- `clearIcon`, `suffixIcon`
- `maxHeight`, `teleportedWidth`
- `name`

Width/layout:

- `Select` defaults to full width like `Input`, so it fits `FormItem` content columns without extra classes.
- Use `width` when the trigger should have a fixed or custom width, for example `width="240px"` or `:width="240"`.
- The popup width follows the trigger width by default; use `teleportedWidth` only when a fixed popup width is required.

Events:

- `update:modelValue(value)`
- `change(value)`
- `clear()`
- `remove-tag(SelectValue)`
- `visible-change(boolean)`
- `focus(FocusEvent)`, `blur(FocusEvent)`

Behavior:

- Single-select closes the dropdown after selecting an option by click or Enter.
- Multiple-select keeps the dropdown open while toggling options.
- Filterable select keeps input focus while open and forwards arrow/page navigation keys into `Dropdown`.

Slots:

- `prefix`
- `option="{ option, label, value, selected, disabled }"`

Expose:

- `focus()`
- `blur()`
- `clear()`
