# Inputs

Use this file for `Input`, `Autocomplete`, `InputTag`, `InputI18n`, and `InputOtp`.

## Contents

- Input
- Autocomplete
- InputTag
- InputI18n
- InputOtp

## Input

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@mcistudio/unoui-vue/input'

const text = ref('')
const amount = ref(0)
</script>

<template>
  <Input v-model="text" prefix-icon="i-lucide:search" clearable />
  <Input v-model.number="amount" type="number" prefix="$" :precision="2" draggable />
  <Input v-model="text" multiline :rows="4" :maxlength="200" show-word-limit />
</template>
```

Props:

- `modelValue`: `string | number`
- `type`: `text | password | search | email | url | tel | number`
- `size`: `sm | md | lg`
- `disabled`, `readonly`, `placeholder`
- `prefixIcon`, `suffixIcon`, `prefix`, `suffix`
- `password`, `showPassword`
- `clearable`, `clearIcon`
- `multiline`, `rows`, `maxlength`, `showWordLimit`
- `formatter`, `parser`
- `precision`, `step`, `min`, `max`
- `draggable`, `dragIcon`, `dragStep`
- `name`, `autocomplete`, `modelModifiers`

Events:

- `update:modelValue(value)`
- `input(value, event)`
- `change(value, event)`
- `clear()`
- `focus(FocusEvent)`, `blur(FocusEvent)`, `keydown(KeyboardEvent)`
- `drag-start(value, event)`, `drag-end(value, event)`

Slots:

- `prepend`, `append`, `prefix`, `suffix`

Expose:

- `focus()`, `blur()`, `clear()`, `select()`

## Autocomplete

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Autocomplete, type AutocompleteSuggestion } from '@mcistudio/unoui-vue/input'

const point = ref('')
const options: AutocompleteSuggestion[] = [{ value: 'Main entrance' }]
</script>

<template>
  <Autocomplete v-model="point" :data-source="options" clearable @select="choose" />
</template>
```

Props:

- `modelValue`: `string | number`
- `data-source`: required `AutocompleteSuggestion[] | (query, callback) => void`
- `valueKey`: default `value`
- `triggerOnFocus`: default `true`
- `debounce`: default `300`
- Common input props: `size`, `disabled`, `readonly`, `placeholder`, icon props, `clearable`
- Overlay props: `teleportedWidth`, `maxHeight`
- Text/behavior props: `hideLoading`, `selectWhenUnmatched`, `noDataText`, `loadingText`

Events:

- Same as `Input`
- `select(AutocompleteSuggestion)`

Slots:

- `prepend`, `append`, `prefix`, `suffix`
- `suggestion="{ item }"`

Expose:

- `focus()`, `blur()`, `clear()`, `select()`

## InputTag

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { InputTag } from '@mcistudio/unoui-vue/input'

const tags = ref<string[]>([])
</script>

<template>
  <InputTag v-model="tags" clearable :max="5" :validate-tag="isValidTag" />
</template>
```

Props:

- `modelValue`: `string[]`
- `size`: `sm | md | lg`; default `md`
- `disabled`: default `false`
- `readonly`: default `false`
- `placeholder`: text shown when there are no tags
- `inputPlaceholder`: text shown in the inline input after tags exist
- `clearable`: default `false`
- `clearIcon`: default `i-lucide:x`
- `closeIcon`: default `i-lucide:x`
- `trigger`: `Enter | Space | Tab | , | ; | ' '` or array; default `Enter`
- `delimiters`: split pasted/input text; default `[',']`
- `max`: maximum tag count
- `maxlength`: maximum length for a single tag
- `validateTag(value)`: custom tag validator
- `allowDuplicates`: default `false`
- `tagColor`: `brand | blue | red | green | gray | yellow | orange`; default `brand`
- `tagVariant`: `light | dark | plain`; default `light`
- `tagRadius`: `none | sm | md | lg | round`; default `md`
- `name`, `autocomplete`

Events:

- `update:modelValue(string[])`
- `input(string[])`
- `change(string[])`
- `add-tag(value)`
- `remove-tag(value, index)`
- `clear()`
- `focus(FocusEvent)`
- `blur(FocusEvent)`
- `keydown(KeyboardEvent)`

Slots:

- `prepend`, `append`, `prefix`, `suffix`

Expose:

- `focus()`, `blur()`, `clear()`

## InputI18n

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { InputI18n } from '@mcistudio/unoui-vue/input'

const nameI18n = ref<Record<string, string>>({})
</script>

<template>
  <InputI18n v-model="nameI18n" prefix-icon="i-lucide:languages" />
</template>
```

Props:

- `modelValue`: `Record<string, string>`
- `languages`: string language keys; defaults come from `configureUnoUI`
- `size`: `sm | md | lg`; default `md`
- `disabled`: default `false`
- `readonly`: default `false`
- `placeholder`
- `name`
- `clearable`
- `prefixIcon`, `suffixIcon`, `prefix`, `suffix`
- `autocomplete`: default `new-password`
- `modalZIndex`

Configure app-wide languages, locale, RTL languages, and translation adapter with `configureUnoUI()` from `@mcistudio/unoui-vue/config`; see `integration.md`.

Events:

- `update:modelValue(Record<string, string>)`
- `input(value, event?)`
- `change(value, event?)`
- `clear()`
- `focus(FocusEvent)`
- `blur(FocusEvent)`

Slots:

- None

Expose:

- None

## InputOtp

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { InputOtp } from '@mcistudio/unoui-vue/inputOtp'

const code = ref('')

function verifyCode(callback: (success: boolean) => void) {
  callback(code.value === '123456')
}
</script>

<template>
  <InputOtp v-model="code" :digits="6" autocomplete="one-time-code" @finish="verifyCode" />
</template>
```

Props:

- `modelValue`: `string | number`
- `digits`: default `6`
- `autofocus`, `disabled`, `readonly`
- `size`: `sm | md | lg`
- `gap`: `sm | md | lg`
- `name`, `autocomplete`
- `ariaLabel`

Events:

- `update:modelValue(string)`
- `input(value, event)`
- `change(value, event?)`
- `finish(callback)`: call `callback(false)` to show error state
- `focus(FocusEvent)`, `blur(FocusEvent)`

Slots:

- None

Expose:

- `focus()`, `blur()`, `clear()`
