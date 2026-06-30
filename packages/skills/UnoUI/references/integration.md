# UnoUI Vue Integration

Use this reference when setting up `@unoui/vue` in a Vue 3 project or diagnosing missing styles, icons, theme tokens, or global language behavior.

## Contents

- Package Shape
- App Entry
- UnoCSS Config
- Theme And Icons
- Global Config
- Import Rules
- Validation Checklist

## Package Shape

- Package name: `@unoui/vue`
- Source package in this repository: `packages/vue`
- Package currently declares `"private": true`; in other projects, verify whether it is available through the workspace, an internal registry, or a local path dependency before adding it.
- Peer dependencies: `vue ^3.5.0`, `vue-i18n ^11.0.0`
- Main exports:
  - Root: `@unoui/vue`
  - Styles: `@unoui/vue/style.css`
  - UnoCSS preset: `@unoui/vue/uno`
  - Global config: `@unoui/vue/config`
  - Component subpaths: `@unoui/vue/button`, `@unoui/vue/input`, etc.

## App Entry

Import the base CSS exactly once:

```ts
import '@unoui/vue/style.css'
```

Place it in `main.ts`, `main.js`, or a single global stylesheet import. Do not import it repeatedly in leaf components.

## UnoCSS Config

Use `presetUnoUI()` so UnoUI semantic colors, icons, preflights, dark-mode selectors, and custom rules exist.

```ts
import { defineConfig, transformerDirectives, transformerVariantGroup } from 'unocss'
import { presetUnoUI } from '@unoui/vue/uno'

export default defineConfig({
  presets: [presetUnoUI()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  content: {
    pipeline: {
      include: [
        /\.(vue|svelte|[jt]sx|vine.ts|mdx?|astro|elm|php|phtml|marko|html)($|\?)/,
        'src/**/*.{js,ts}',
        'node_modules/@unoui/vue/src/**/*.{vue,js,ts}'
      ],
      exclude: ['uno.config.ts']
    }
  }
})
```

For a monorepo workspace where UnoUI is linked from source, replace the `node_modules` include with the actual relative path, for example `../UnoUI/packages/vue/src/**/*.{vue,js,ts}` or `../vue/src/**/*.{vue,js,ts}`.

## Theme And Icons

- UnoUI uses semantic classes such as `bg-primary`, `text-secondary`, `border-medium`, and `text-brand`.
- Dark mode is driven by `[data-theme="dark"]`; light mode is `[data-theme="light"]` or `:root`.
- Icons are Iconify/UnoCSS classes such as `i-lucide:search`, `i-lucide:x`, and `i-ant-design:swap-right-outlined`.
- If icons render as blank boxes, check `presetUnoUI()` is active and UnoCSS is scanning the file that contains the icon class.

## Global Config

Use `configureUnoUI` when components need host app language, language options, RTL language keys, or translation service.

```ts
import { configureUnoUI } from '@unoui/vue/config'

configureUnoUI({
  locale: () => i18n.global.locale.value,
  languages: [
    { key: 'zh-CN', code: 'ZH', label: 'Simplified Chinese', baidu: 'zh' },
    { key: 'en', code: 'EN', label: 'English', baidu: 'en' }
  ],
  rtlLanguages: ['ar', 'he', 'fa', 'ur'],
  translate: async ({ q, from, to }) => {
    const result = await translateText({ q, from, to })
    return result.text
  }
})
```

Defaults include many languages and `zh-CN` as the default locale. `InputI18n` uses this config.

## Import Rules

Prefer subpath imports because they make ownership and types clear:

```ts
import { Button } from '@unoui/vue/button'
import { Input, Autocomplete } from '@unoui/vue/input'
import { Table, type TableColumn } from '@unoui/vue/table'
```

Use root imports only when a module intentionally collects many UnoUI components:

```ts
import { Button, Input, Table } from '@unoui/vue'
```

Do not import `.vue` source files directly from package internals unless fixing UnoUI itself.

## Validation Checklist

- Typecheck target app after changes.
- Run the app and inspect the page if styles, layout, overlay positioning, keyboard behavior, or theme switching are involved.
- For missing classes, check UnoCSS content includes target files and UnoUI source.
- For missing component CSS, check `@unoui/vue/style.css` is imported once.
- For overlay controls (`Dropdown`, `Tooltip`, `Popconfirm`, `Select`, `DatePicker`), verify z-index and clipping in the actual page.
