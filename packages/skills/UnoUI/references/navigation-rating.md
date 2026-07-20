# Navigation And Rating

Use this file for `Tabs`, `TabPane`, and `Rate`.

## Contents

- Tabs
- TabPane
- Rate

## Tabs

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Tabs, TabPane } from '@mcistudio/unoui-vue/tab'

const active = ref('a')
</script>

<template>
  <Tabs v-model="active" type="card">
    <TabPane name="a" label="A">A content</TabPane>
    <TabPane name="b" label="B" lazy>B content</TabPane>
  </Tabs>
</template>
```

Props:

- `modelValue`
- `defaultValue`
- `type`: `line | card | border-card`
- `tabPosition`: `top | right | bottom | left`
- `size`: `sm | md | lg`
- `stretch`
- `closable`, `addable`, `editable`
- `padded`
- `beforeLeave(newValue, oldValue)`
- `ariaLabel`, `addAriaLabel`, `closeAriaLabel`

Events:

- `update:modelValue(value)`
- `tab-click(pane, event)`
- `tab-change(value)`
- `tab-add()`
- `tab-remove(value)`
- `edit(targetName, action)`

Slots:

- `default`: `TabPane` children

Expose:

- `panes`
- `activeValue`
- `setActiveValue(value)`

## TabPane

```vue
<TabPane name="a" label="A">A content</TabPane>
```

Props:

- `name`
- `label`
- `disabled`
- `closable`
- `lazy`

Events:

- None

Slots:

- `default`
- `label="{ active, pane }"`

Expose:

- None

## Rate

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Rate } from '@mcistudio/unoui-vue/rate'

const score = ref(3)
</script>

<template>
  <Rate v-model="score" allow-half :tooltips="['Bad', 'OK', 'Good']" />
</template>
```

Props:

- `modelValue`
- `count`: default `5`
- `allowHalf`
- `clearable`
- `autofocus`
- `character`
- `disabled`
- `tooltips`
- `size`: `sm | md | lg`
- `tabindex`

Events:

- `update:modelValue(number)`
- `change(number)`
- `hoverChange(number | undefined)`
- `focus(FocusEvent)`
- `blur(FocusEvent)`
- `keydown(KeyboardEvent)`

Slots:

- `character="{ index, count, value, active, half, disabled }"`

Expose:

- `focus()`, `blur()`
