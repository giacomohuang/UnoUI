# UnoUI

> Vue 3 admin UI components powered by UnoCSS.

[English](./README.en.md) | 简体中文

![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883)
![UnoCSS](https://img.shields.io/badge/UnoCSS-66-333333)
![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6)

UnoUI 是一套面向 Vue 3 + UnoCSS 的后台管理组件库，覆盖表单、数据展示、选择器、反馈浮层和常见工作台控件。组件从真实后台业务界面中抽取，适合需要稳定、紧凑、可定制管理端 UI 的项目。

- 示例站点: [https://giacomohuang.github.io/UnoUI/](https://giacomohuang.github.io/UnoUI/)
- 组件包: `@unoui/vue`
- Vue 版本: `^3.5.0`
- 样式方案: UnoCSS + 语义化主题 token
- 暗色模式: `[data-theme="dark"]`

### 特性

- Vue 3 Composition API + TypeScript
- 基于 UnoCSS 的原子化样式和图标能力
- 支持亮色/暗色主题
- 支持组件子路径导入，例如 `@unoui/vue/button`
- 内置表单、表格、弹窗、抽屉、选择器、日期选择器、颜色选择器、分页等后台常用组件

### 安装

```bash
pnpm add @unoui/vue vue vue-i18n
pnpm add -D unocss @unocss/preset-icons
```

> 当前仓库中的 `@unoui/vue` 仍是 workspace/private package。如果你在本地仓库中试用，请通过 workspace 或本地路径依赖接入。

### 引入样式

在应用入口中引入 UnoCSS 生成样式和 UnoUI 基础样式：

```ts
import { createApp } from 'vue'
import { configureUnoUI } from '@unoui/vue'

import App from './App.vue'

import 'virtual:uno.css'
import '@unoui/vue/style.css'

configureUnoUI({
  locale: 'zh-CN'
})

createApp(App).mount('#app')
```

### 配置 UnoCSS

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

如果你通过 monorepo workspace 或本地路径使用 UnoUI，请把 `node_modules/@unoui/vue/src` 替换为实际源码路径，例如：

```ts
'../UnoUI/packages/vue/src/**/*.{vue,js,ts}'
```

### 使用组件

推荐使用组件子路径导入，便于控制依赖边界和类型来源：

```vue
<script setup lang="ts">
import { Button, ButtonGroup } from '@unoui/vue/button'
import { Input } from '@unoui/vue/input'
import { Select } from '@unoui/vue/select'
</script>

<template>
  <ButtonGroup>
    <Button icon="i-lucide:save">保存</Button>
    <Button variant="outline">取消</Button>
  </ButtonGroup>

  <Input placeholder="项目名称" />
  <Select placeholder="选择状态" :options="[]" />
</template>
```

### 组件

| 分类       | 组件                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------- |
| 布局       | `Splitter`, `SplitterPanel`                                                                   |
| 通用       | `Button`, `ButtonGroup`, `Tag`, `Badge`, `BadgeRibbon`                                        |
| 表单       | `Form`, `FormItem`, `Input`, `Autocomplete`, `InputTag`, `InputI18n`, `InputOtp`              |
| 选择       | `Checkbox`, `Radio`, `Switch`, `Select`                                                       |
| 日期和数值 | `DatePicker`, `RangePicker`, `TimePicker`, `TimeRangePicker`, `Slider`, `ColorPicker`, `Rate` |
| 数据展示   | `Table`, `Pagination`, `Progress`, `Skeleton`, `QRCode`, `MillerColumns`                      |
| 反馈和浮层 | `Alert`, `message`, `Modal`, `Drawer`, `Tooltip`, `Popconfirm`, `Dropdown`                    |
| 导航       | `Tabs`, `TabPane`                                                                             |

### 本地示例

```bash
pnpm install
pnpm dev:ex
```
