# UnoUI

An UnoCSS component library for Vue 3 admin applications.

[Live demo](https://giacomohuang.github.io/UnoUI/) · [简体中文](./README.md)

![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883)
![UnoCSS](https://img.shields.io/badge/UnoCSS-66-333333)
![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6)

UnoUI provides common admin components for forms, data display, selection, and feedback overlays. It uses UnoCSS for styling and icons, semantic colors for light and dark themes, and focused package subpaths with TypeScript types for every component group.

## Features

- Designed for admin consoles, operations platforms, and dashboards
- Vue 3 Composition API with complete TypeScript types
- UnoCSS utilities, Iconify icons, and semantic theme tokens
- Light and dark themes controlled through `data-theme`
- Component subpath imports that keep dependency boundaries focused
- Compact controls for forms and data-dense interfaces

## Requirements

| Dependency             | Version                   |
| ---------------------- | ------------------------- |
| Vue                    | `^3.5.0`                  |
| Vue I18n               | `^11.0.0`                 |
| UnoCSS                 | `^66.7.3`                 |
| `@unocss/preset-icons` | `^66.7.3`                 |
| Node.js                | `^20.19.0` or `>=22.12.0` |

## Installation

```bash
pnpm add @mcistudio/unoui-vue
```

## Quick Start

### 1. Configure the application entry

Import the generated UnoCSS output and UnoUI component styles once in the application entry. Global language configuration is optional; the default locale is `zh-CN`.

```ts
import { configureUnoUI } from '@mcistudio/unoui-vue/config'
import { createApp } from 'vue'

import App from './App.vue'

import 'virtual:uno.css'
import '@mcistudio/unoui-vue/style.css'

configureUnoUI({
  locale: 'en'
})

createApp(App).mount('#app')
```

### 2. Configure UnoCSS

Enable `presetUnoUI()` in `uno.config.ts` and include the class names from the compiled component package in UnoCSS scanning.

```ts
import { defineConfig, transformerDirectives, transformerVariantGroup } from 'unocss'
import { presetUnoUI } from '@mcistudio/unoui-vue/uno'

export default defineConfig({
  presets: [presetUnoUI()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  content: {
    pipeline: {
      include: [/\.(vue|svelte|[jt]sx|vine.ts|mdx?|astro|elm|php|phtml|marko|html)($|\?)/, 'src/**/*.{js,ts}', 'node_modules/@mcistudio/unoui-vue/dist/**/*.js'],
      exclude: ['uno.config.ts']
    }
  }
})
```

### 3. Use components

```vue
<script setup lang="ts">
import { ref } from 'vue'

import { Button } from '@mcistudio/unoui-vue/button'
import { Input } from '@mcistudio/unoui-vue/input'
import { Tag } from '@mcistudio/unoui-vue/tag'

const keyword = ref('')
</script>

<template>
  <div class="flex items-center gap-3">
    <Input v-model="keyword" clearable placeholder="Search projects" />
    <Button icon="i-lucide:search">Search</Button>
    <Tag color="green" variant="soft">Running</Tag>
  </div>
</template>
```

## Imports

Prefer component subpaths for components and public types:

```ts
import { DatePicker, RangePicker } from '@mcistudio/unoui-vue/datepicker'
import { Form, FormItem, type FormRules } from '@mcistudio/unoui-vue/form'
import { Table, type TableColumn } from '@mcistudio/unoui-vue/table'
```

The root entry is available when a module intentionally groups several components:

```ts
import { Button, Input, Table } from '@mcistudio/unoui-vue'
```

## Themes

UnoUI uses `data-theme` to select a theme. The light theme is used when the attribute is absent.

```ts
document.documentElement.dataset.theme = 'dark'
```

Component styles use semantic tokens such as `bg-primary`, `text-secondary`, `border-medium`, and `text-brand`, so theme switching does not require per-component color overrides.

## Components

| Category              | Components                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------------- |
| Layout                | `Splitter`, `SplitterPanel`                                                                   |
| General               | `Button`, `ButtonGroup`, `Tag`, `Badge`, `BadgeRibbon`                                        |
| Form                  | `Form`, `FormItem`, `Input`, `Autocomplete`, `InputTag`, `InputI18n`, `InputOtp`              |
| Selection             | `Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup`, `Switch`, `Select`                        |
| Date and numeric      | `DatePicker`, `RangePicker`, `TimePicker`, `TimeRangePicker`, `Slider`, `ColorPicker`, `Rate` |
| Data display          | `Table`, `Pagination`, `Progress`, `Skeleton`, `QRCode`, `MillerColumns`                      |
| Feedback and overlays | `Alert`, `message`, `Modal`, `Drawer`, `Tooltip`, `Popconfirm`, `Dropdown`                    |
| Navigation            | `Tabs`, `TabPane`                                                                             |

See the [live demo](https://giacomohuang.github.io/UnoUI/) for component examples, API tables, and interaction states.
