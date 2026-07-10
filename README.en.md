# UnoUI

> Vue 3 admin UI components powered by UnoCSS.

English | [简体中文](./README.md)

![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883)
![UnoCSS](https://img.shields.io/badge/UnoCSS-66-333333)
![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6)

UnoUI is a Vue 3 + UnoCSS component library for admin interfaces. It focuses on compact, practical UI primitives for forms, data display, selection, feedback overlays, and dashboard-style workflows.

- Demo: [https://giacomohuang.github.io/UnoUI/](https://giacomohuang.github.io/UnoUI/)
- Package: `@unoui/vue`
- Vue version: `^3.5.0`
- Styling: UnoCSS with semantic theme tokens
- Dark mode: `[data-theme="dark"]`

### Features

- Vue 3 Composition API and TypeScript
- UnoCSS powered utility styles and icons
- Light and dark theme support
- Component subpath imports, for example `@unoui/vue/button`
- Admin-ready primitives including forms, tables, modals, drawers, selects, date pickers, color pickers, and pagination

### Installation

```bash
pnpm add @unoui/vue vue vue-i18n
pnpm add -D unocss @unocss/preset-icons
```

> The `@unoui/vue` package in this repository is currently a workspace/private package. For local usage, consume it through a workspace dependency or a local path dependency.

### Import Styles

Import UnoCSS output and UnoUI base styles once in your app entry:

```ts
import { createApp } from 'vue'
import { configureUnoUI } from '@unoui/vue'

import App from './App.vue'

import 'virtual:uno.css'
import '@unoui/vue/style.css'

configureUnoUI({
  locale: 'en'
})

createApp(App).mount('#app')
```

### Configure UnoCSS

```ts
import { defineConfig, transformerDirectives, transformerVariantGroup } from 'unocss'
import { presetUnoUI } from '@unoui/vue/uno'

export default defineConfig({
  presets: [presetUnoUI()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  content: {
    pipeline: {
      include: [/\.(vue|svelte|[jt]sx|vine.ts|mdx?|astro|elm|php|phtml|marko|html)($|\?)/, 'src/**/*.{js,ts}', 'node_modules/@unoui/vue/src/**/*.{vue,js,ts}'],
      exclude: ['uno.config.ts']
    }
  }
})
```

If you consume UnoUI from a monorepo workspace or local path dependency, replace `node_modules/@unoui/vue/src` with the actual source path, for example:

```ts
'../UnoUI/packages/vue/src/**/*.{vue,js,ts}'
```

### Use Components

Component subpath imports are recommended for clearer ownership and type boundaries:

```vue
<script setup lang="ts">
import { Button, ButtonGroup } from '@unoui/vue/button'
import { Input } from '@unoui/vue/input'
import { Select } from '@unoui/vue/select'
</script>

<template>
  <ButtonGroup>
    <Button icon="i-lucide:save">Save</Button>
    <Button variant="outline">Cancel</Button>
  </ButtonGroup>

  <Input placeholder="Project name" />
  <Select placeholder="Select status" :options="[]" />
</template>
```

### Components

| Category              | Components                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------------- |
| General               | `Button`, `ButtonGroup`, `Tag`, `Badge`, `BadgeRibbon`                                        |
| Form                  | `Form`, `FormItem`, `Input`, `Autocomplete`, `InputTag`, `InputI18n`, `InputOtp`              |
| Selection             | `Checkbox`, `Radio`, `Switch`, `Select`                                                       |
| Date and numeric      | `DatePicker`, `RangePicker`, `TimePicker`, `TimeRangePicker`, `Slider`, `ColorPicker`, `Rate` |
| Data display          | `Table`, `Pagination`, `Skeleton`, `QRCode`, `MillerColumns`                                  |
| Feedback and overlays | `Alert`, `message`, `Modal`, `Drawer`, `Tooltip`, `Popconfirm`, `Dropdown`                    |
| Navigation            | `Tabs`, `TabPane`                                                                             |

### Local Demo

```bash
pnpm install
pnpm dev:ex
```
