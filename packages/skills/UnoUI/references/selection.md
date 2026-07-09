# Selection Controls

Use this file for `Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup`, `Switch`, and `Select`.

## Contents

- Checkbox
- CheckboxGroup
- Radio
- RadioGroup
- Switch
- Select

## Checkbox

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { Checkbox, CheckboxGroup } from '@unoui/vue/checkbox'

const checked = ref(true)
const selected = ref(['apple'])
const allValues = ['apple', 'orange']
const allChecked = computed(() => allValues.every((value) => selected.value.includes(value)))
const indeterminate = computed(() => selected.value.length > 0 && !allChecked.value)

function setChecked(value) {
  checked.value = value
}

function toggleAll(value) {
  selected.value = value ? [...allValues] : []
}
</script>

<template>
  <Checkbox :checked="checked" @change="setChecked">Accept</Checkbox>
  <Checkbox :checked="allChecked" :indeterminate="indeterminate" @change="toggleAll">All</Checkbox>
  <CheckboxGroup v-model="selected" name="fruit">
    <Checkbox value="apple">Apple</Checkbox>
    <Checkbox value="orange">Orange</Checkbox>
  </CheckboxGroup>
</template>
```

CheckboxGroup props:

- `modelValue`: `(string | number)[]`
- `disabled`: disables the whole group
- `size`: `sm | md | lg`; inherited by child checkboxes unless a child overrides it
- `name`: native checkbox name inherited by children when provided
- `direction`: `horizontal | vertical`

Checkbox props:

- `checked`: uncontrolled checked state for a standalone checkbox or computed check-all control
- `indeterminate`: visual/native mixed state for partial selection; does not change `CheckboxGroup` by itself
- `value`: selected value emitted to `CheckboxGroup`
- `disabled`
- `size`: `sm | md | lg`; overrides group size when provided
- `name`: overrides group native name when provided

Partial selection:

- Use `indeterminate` for check-all patterns when some but not all child options are selected.
- Keep `checked` derived from “all options selected”; disabled unchecked options still mean the group is not fully selected.
- Keep `indeterminate` derived from “some selected but not all”.
- Clicking an indeterminate checkbox emits the next normal checked boolean; update the child array yourself in `change`.
- If a group includes disabled options, include them when deriving “all selected”; when toggling a parent checkbox, preserve disabled option values instead of silently selecting disabled unchecked items.
- Keep the array `v-model` on `CheckboxGroup`; child `Checkbox` components only need `value`.

Events:

- `CheckboxGroup`: `update:modelValue(value[])`, `change(value[], Event)`
- `Checkbox`: `change(checked, Event)`, `input(Event)`, `focus(FocusEvent)`, `blur(FocusEvent)`

Slots:

- `CheckboxGroup.default`: `Checkbox` options
- `Checkbox.default`: content rendered after the checkbox box; the component root is a label, so clicking this content toggles the checkbox

Expose:

- None

## Radio

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Radio, RadioGroup } from '@unoui/vue/radio'

const kind = ref('a')
</script>

<template>
  <RadioGroup v-model="kind" name="kind">
    <Radio value="a">A</Radio>
    <Radio value="b" border>B</Radio>
  </RadioGroup>

  <RadioGroup v-model="kind" name="kind-buttons" type="button" button-style="solid">
    <Radio value="a">A</Radio>
    <Radio value="b">B</Radio>
    <Radio value="c">C</Radio>
  </RadioGroup>
</template>
```

RadioGroup props:

- `modelValue`: `string | number | boolean`
- `disabled`: disables the whole group
- `size`: `sm | md | lg`; inherited by child radios unless a child overrides it
- `type`: `radio | button`; use `button` for segmented button-style radio
- `buttonStyle`: `outline | solid`; only applies when `type="button"`
- `name`: native radio name; generated automatically when omitted
- `direction`: `horizontal | vertical`

Radio props:

- `checked`: uncontrolled checked state for a standalone radio
- `value`: selected value emitted to `RadioGroup`; default `true`
- `disabled`
- `size`: `sm | md | lg`; overrides group size when provided
- `border`
- `type`: `radio | button`; overrides group type when provided
- `buttonStyle`: `outline | solid`; overrides group button style when provided
- `name`: overrides group native name when provided

Button-style grouping:

- Use `RadioGroup type="button"` instead of hand-written `inline-flex` wrappers.
- Adjacent button radios only merge borders inside `.ui-radio-group`, so standalone button radios keep complete rounded corners.
- Keep the scalar `v-model` on `RadioGroup`; child `Radio` components only need `value`.

Events:

- `RadioGroup`: `update:modelValue(value)`, `change(value, Event)`
- `Radio`: `change(value, Event)`, `input(Event)`, `focus(FocusEvent)`, `blur(FocusEvent)`

Slots:

- `RadioGroup.default`: `Radio` options
- `Radio.default`: radio label/content

Expose:

- `Radio.focus()`
- `Radio.blur()`

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
- `footer="{ loading, empty, emptyText, query, options }"`: fixed dropdown footer for pagination or custom actions

Expose:

- `focus()`
- `blur()`
- `clear()`
