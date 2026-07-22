# @mcistudio/unoui-vue

An UnoCSS component library for Vue 3 admin applications.

[Live demo](https://giacomohuang.github.io/UnoUI/) · [Repository](https://github.com/giacomohuang/UnoUI)

UnoUI provides common admin components for forms, data display, selection, and feedback overlays. It supports focused component imports, TypeScript types, semantic theme tokens, and light and dark themes.

## Features

- Vue 3 Composition API with TypeScript types
- UnoCSS utilities and Iconify icons
- Light and dark themes controlled through `data-theme`
- Focused component subpath imports
- Compact controls for data-dense admin interfaces

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

Import the generated UnoCSS output and UnoUI component styles once in the application entry:

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

Enable the UnoUI preset and scan the compiled package entries in `uno.config.ts`:

```ts
import { readFileSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'

import { defineConfig, transformerDirectives, transformerVariantGroup } from 'unocss'
import { presetUnoUI } from '@mcistudio/unoui-vue/uno'

const require = createRequire(import.meta.url)
const unoUIPackageDirectory = dirname(require.resolve('@mcistudio/unoui-vue/package.json'))
const unoUIDistDirectory = resolve(unoUIPackageDirectory, 'dist')
const unoUIContent = readdirSync(unoUIDistDirectory, { encoding: 'utf8', recursive: true })
  .filter((file) => file.endsWith('.js'))
  .map((file) => readFileSync(resolve(unoUIDistDirectory, file), 'utf8'))
  .join('\n')

export default defineConfig({
  presets: [presetUnoUI()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  content: {
    inline: [unoUIContent],
    pipeline: {
      include: ['src/**/*.{vue,js,ts}']
    }
  }
})
```

Import components and types from focused subpaths:

```ts
import { Button } from '@mcistudio/unoui-vue/button'
import { Input } from '@mcistudio/unoui-vue/input'
import { Table, type TableColumn } from '@mcistudio/unoui-vue/table'
```

## Themes

Set `data-theme="dark"` on the document root to enable the dark theme. The light theme is used when the attribute is absent.

## Components

| Category              | Components                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------------- |
| Layout                | `Splitter`, `SplitterPanel`                                                                   |
| General               | `Button`, `ButtonGroup`, `Tag`, `Badge`, `BadgeRibbon`                                        |
| Form                  | `Form`, `FormItem`, `Input`, `Autocomplete`, `InputTag`, `InputI18n`, `InputOtp`              |
| Selection             | `Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup`, `Switch`, `Select`                        |
| Date and numeric      | `DatePicker`, `RangePicker`, `TimePicker`, `TimeRangePicker`, `Slider`, `ColorPicker`, `Rate` |
| Media                 | `ImageEditor`                                                                                 |
| Data display          | `Table`, `Pagination`, `Progress`, `Skeleton`, `QRCode`, `MillerColumns`                      |
| Feedback and overlays | `Alert`, `message`, `Modal`, `Drawer`, `Tooltip`, `Popconfirm`, `Dropdown`                    |
| Navigation            | `Tabs`, `TabPane`                                                                             |

See the [live demo](https://giacomohuang.github.io/UnoUI/) for complete examples, API tables, and interaction states.
