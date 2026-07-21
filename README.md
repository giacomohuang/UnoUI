# UnoUI

面向 Vue 3 管理端应用的 UnoCSS 组件库。

[在线示例](https://giacomohuang.github.io/UnoUI/) · [English](./README.en.md)

![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883)
![UnoCSS](https://img.shields.io/badge/UnoCSS-66-333333)
![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6)

UnoUI 提供表单、数据展示、选择控件和反馈浮层等常用管理端组件。它使用 UnoCSS 管理样式与图标，通过语义化颜色统一亮色、暗色主题，并为每个组件提供独立的导入路径和 TypeScript 类型。

## 特性

- 为后台管理、运营平台和工作台场景设计
- Vue 3 Composition API 与完整 TypeScript 类型
- UnoCSS 原子化样式、Iconify 图标和语义化主题 token
- 亮色与暗色主题，使用 `data-theme` 切换
- 支持组件子路径导入，避免引入无关组件
- 紧凑、稳定，适合表单和数据密集型界面

## 环境要求

| 依赖                   | 版本                      |
| ---------------------- | ------------------------- |
| Vue                    | `^3.5.0`                  |
| Vue I18n               | `^11.0.0`                 |
| UnoCSS                 | `^66.7.3`                 |
| `@unocss/preset-icons` | `^66.7.3`                 |
| Node.js                | `^20.19.0` 或 `>=22.12.0` |

## 安装

```bash
pnpm add @mcistudio/unoui-vue
```

## 快速开始

### 1. 配置应用入口

在应用入口引入 UnoCSS 生成样式和 UnoUI 组件样式。全局语言配置是可选的，未配置时默认使用 `zh-CN`。

```ts
import { configureUnoUI } from '@mcistudio/unoui-vue/config'
import { createApp } from 'vue'

import App from './App.vue'

import 'virtual:uno.css'
import '@mcistudio/unoui-vue/style.css'

configureUnoUI({
  locale: 'zh-CN'
})

createApp(App).mount('#app')
```

### 2. 配置 UnoCSS

在 `uno.config.ts` 中启用 `presetUnoUI()`，并让 UnoCSS 扫描组件库构建产物中的类名。

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
      include: [/\.(vue|svelte|[jt]sx|vine.ts|mdx?|astro|elm|php|phtml|marko|html)($|\?)/, 'src/**/*.{js,ts}'],
      exclude: ['uno.config.ts']
    }
  }
})
```

### 3. 使用组件

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
    <Input v-model="keyword" clearable placeholder="搜索项目" />
    <Button icon="i-lucide:search">搜索</Button>
    <Tag color="green" variant="soft">运行中</Tag>
  </div>
</template>
```

## 导入方式

推荐从组件子路径导入组件和类型，使依赖边界更清晰：

```ts
import { DatePicker, RangePicker } from '@mcistudio/unoui-vue/datepicker'
import { Form, FormItem, type FormRules } from '@mcistudio/unoui-vue/form'
import { Table, type TableColumn } from '@mcistudio/unoui-vue/table'
```

需要集中使用多个组件时，也可以从根入口导入：

```ts
import { Button, Input, Table } from '@mcistudio/unoui-vue'
```

## 主题

UnoUI 使用 `data-theme` 控制主题。未设置时使用亮色主题。

```ts
document.documentElement.dataset.theme = 'dark'
```

组件样式优先使用 `bg-primary`、`text-secondary`、`border-medium` 和 `text-brand` 等语义化 token，主题切换时无需逐个覆盖组件颜色。

## 组件

| 分类       | 组件                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------- |
| 布局       | `Splitter`, `SplitterPanel`                                                                   |
| 通用       | `Button`, `ButtonGroup`, `Tag`, `Badge`, `BadgeRibbon`                                        |
| 表单       | `Form`, `FormItem`, `Input`, `Autocomplete`, `InputTag`, `InputI18n`, `InputOtp`              |
| 选择       | `Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup`, `Switch`, `Select`                        |
| 日期和数值 | `DatePicker`, `RangePicker`, `TimePicker`, `TimeRangePicker`, `Slider`, `ColorPicker`, `Rate` |
| 数据展示   | `Table`, `Pagination`, `Progress`, `Skeleton`, `QRCode`, `MillerColumns`                      |
| 反馈和浮层 | `Alert`, `message`, `Modal`, `Drawer`, `Tooltip`, `Popconfirm`, `Dropdown`                    |
| 导航       | `Tabs`, `TabPane`                                                                             |

组件示例、API 参数和交互状态请查看[在线示例](https://giacomohuang.github.io/UnoUI/)。
