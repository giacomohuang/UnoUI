# Buttons And Tags

Use this file for `Button`, `ButtonGroup`, and `Tag`.

## Button

```vue
<script setup lang="ts">
import { Button, ButtonGroup } from '@unoui/vue/button'
</script>

<template>
  <Button color="brand" icon="i-lucide:plus">Create</Button>
  <Button color="red" variant="outline">Delete</Button>
  <Button size="icon" icon="i-lucide:search" aria-label="Search" />
  <ButtonGroup>
    <Button variant="outline">A</Button>
    <Button variant="outline">B</Button>
  </ButtonGroup>
</template>
```

Props:

- `color`: `brand | gray | red | green | yellow | orange`; default `brand`
- `variant`: `default | outline | dashed | link | mono`; default `default`
- `icon`: UnoCSS/Iconify class string
- `iconSize`: pixel string; default `14`
- `size`: `sm | md | lg | icon | icon-md | icon-lg`; default `md`
- `radius`: `none | sm | md | lg | full`; default `md`
- `loading`: show loading icon
- `disabled`: disable click/pointer events
- `type`: native `button | submit | reset`; default `button`

Events:

- `click(MouseEvent)`

Slots:

- `default`: button content

Expose:

- None

## ButtonGroup

```vue
<script setup lang="ts">
import { Button, ButtonGroup } from '@unoui/vue/button'
</script>

<template>
  <ButtonGroup>
    <Button variant="outline">Left</Button>
    <Button variant="outline">Center</Button>
    <Button variant="outline">Right</Button>
  </ButtonGroup>
</template>
```

Props:

- None

Events:

- None

Slots:

- `default`: grouped buttons or button-like children

Expose:

- None

## Tag

```vue
<script setup lang="ts">
import { Tag } from '@unoui/vue/tag'
</script>

<template>
  <Tag color="green">Active</Tag>
  <Tag color="purple" variant="soft" radius="round">Group</Tag>
  <Tag color="red" variant="plain" closable @close="remove">Removed</Tag>
  <Tag radius="round" color="brand">Pill</Tag>
</template>
```

Props:

- `color`: `brand | blue | cyan | teal | green | lime | yellow | orange | red | pink | purple | indigo | gray`; default `brand`
- `variant`: `soft | light | dark | plain`; default `light`; `soft` uses a borderless tinted background with higher-contrast text
- `size`: `sm | md | lg`; default `sm`
- `radius`: `none | sm | md | lg | round`; default `md`
- `closable`: show close button
- `closeIcon`: default `i-lucide:x`
- `closeAriaLabel`: default `关闭`

Events:

- `close(MouseEvent)`

Slots:

- `default`: tag content

Expose:

- None
