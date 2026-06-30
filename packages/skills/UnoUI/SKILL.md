---
name: use-unoui-vue
description: Use when integrating or modifying @unoui/vue components in Vue 3 projects, including installing UnoUI, configuring UnoCSS with presetUnoUI, importing component styles, choosing the correct component subpath imports, wiring v-model/events/slots/exposed methods, and replacing local UI code with UnoUI primitives.
---

# Use UnoUI Vue

## Core Workflow

1. Inspect the target project before editing:
   - Confirm it uses Vue 3.
   - Check package manager and existing UnoCSS/Vite setup.
   - Search for existing `@unoui/vue`, `presetUnoUI`, `style.css`, and local UI wrappers.

2. Add runtime integration:
   - Install/use `@unoui/vue` plus Vue peer dependencies already present in the app.
   - Import `@unoui/vue/style.css` once in the app entry or global stylesheet.
   - Configure UnoCSS with `presetUnoUI()` from `@unoui/vue/uno`.
   - Ensure UnoCSS content scanning includes the app source and, in monorepos/local workspace use, the UnoUI package source.

3. Use component subpath imports for clarity:
   - Prefer `import { Button } from '@unoui/vue/button'` and similar subpaths.
   - Use root import `@unoui/vue` only when a file intentionally groups many components.
   - Import public types from the matching subpath, for example `TableColumn` from `@unoui/vue/table`.

4. Implement with the real API:
   - Use Vue `v-model` names exactly as documented: `v-model`, `v-model:open`, `v-model:visible`, `v-model:current-page`, `v-model:page-size`, etc.
   - Use kebab-case event names in templates, for example `@visible-change`, `@row-click`, `@change-complete`.
   - Do not invent compatibility props/events from Element Plus, Ant Design, or local legacy components unless this repository explicitly exposes them.
   - Do not rely on exported `cva` style helpers as the main integration API; they are low-level styling utilities.

5. Validate narrowly:
   - Run the target project's typecheck/build command when available.
   - If changing visual behavior, run the app or story/demo surface and inspect the component.

## References

- Read `references/integration.md` when setting up UnoUI in a project, fixing missing styles/icons/theme tokens, configuring global language/translation, or choosing validation commands.
- Read `references/components.md` first when implementing specific components. It is a routing index; then load only the component-group reference needed for the task.
- Keep component API lookup narrow. For example, read `references/form.md` for `Form/FormItem`, not the entire reference set.

## Source Of Truth

This skill is maintained in the UnoUI repository:

- Component package: `packages/vue`
- Example/API tables: `packages/example/src/data`

If the package has changed, inspect the current source first and prefer current code over this skill.
