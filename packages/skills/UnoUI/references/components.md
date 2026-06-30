# UnoUI Vue Component Routing

Use this file as the first stop for component work. Load only the reference file that matches the components in the user's task.

## Reference Routing

| Task or component | Read |
| --- | --- |
| Setup, styles, UnoCSS preset, icons, theme, `configureUnoUI` | `integration.md` |
| `Button`, `ButtonGroup`, `Tag` | `buttons-tags.md` |
| `Input`, `Autocomplete`, `InputTag`, `InputI18n`, `InputOtp` | `inputs.md` |
| `Checkbox`, `Radio`, `Switch`, `Select` | `selection.md` |
| `DatePicker`, `RangePicker`, `Slider`, `ColorPicker` | `date-numeric.md` |
| `Form`, `FormItem`, validation rules/exposes | `form.md` |
| `Table`, `Pagination`, `DataSkeleton`, `Badge`, `BadgeRibbon`, `QRCode`, `MillerColumns` | `data-display.md` |
| `Alert`, `message`, `MessageContainer`, `Modal`, `Drawer`, `Tooltip`, `Popconfirm`, `Dropdown` | `feedback-overlays.md` |
| `Tabs`, `TabPane`, `Rate` | `navigation-rating.md` |

## Shared Conventions

- Prefer component subpath imports: `@unoui/vue/button`, `@unoui/vue/input`, `@unoui/vue/table`.
- Use kebab-case in templates: `prefix-icon`, `show-word-limit`, `v-model:current-page`, `@visible-change`.
- Most form controls support `size="sm|md|lg"`.
- Icon props take UnoCSS/Iconify class strings such as `i-lucide:search`.
- Controlled overlays usually use `v-model:open`; `Modal` uses `v-model:visible`; `Drawer` accepts `v-model` or `v-model:visible`.
- Type component refs with `InstanceType<typeof Component>` when calling exposed methods.
- If a detail conflicts with current source, prefer `packages/vue/src` over these references.

## Component Index

| Component | Import | Details |
| --- | --- | --- |
| `Alert` | `@unoui/vue/alert` | `feedback-overlays.md` |
| `Badge`, `BadgeRibbon` | `@unoui/vue/badge` | `data-display.md` |
| `Button`, `ButtonGroup` | `@unoui/vue/button` | `buttons-tags.md` |
| `Checkbox` | `@unoui/vue/checkbox` | `selection.md` |
| `ColorPicker` | `@unoui/vue/colorpicker` | `date-numeric.md` |
| `DatePicker`, `RangePicker` | `@unoui/vue/datepicker` | `date-numeric.md` |
| `Drawer` | `@unoui/vue/drawer` | `feedback-overlays.md` |
| `Dropdown` | `@unoui/vue/dropdown` | `feedback-overlays.md` |
| `Form`, `FormItem`, `createFormRule` | `@unoui/vue/form` | `form.md` |
| `Input`, `Autocomplete`, `InputTag`, `InputI18n` | `@unoui/vue/input` | `inputs.md` |
| `InputOtp` | `@unoui/vue/inputOtp` | `inputs.md` |
| `message`, `Message`, `MessageContainer` | `@unoui/vue/message` | `feedback-overlays.md` |
| `MillerColumns` | `@unoui/vue/millercolumns` | `data-display.md` |
| `Modal` | `@unoui/vue/modal` | `feedback-overlays.md` |
| `Pagination` | `@unoui/vue/pagination` | `data-display.md` |
| `Popconfirm` | `@unoui/vue/popconfirm` | `feedback-overlays.md` |
| `QRCode` | `@unoui/vue/qrcode` | `data-display.md` |
| `Radio` | `@unoui/vue/radio` | `selection.md` |
| `Rate` | `@unoui/vue/rate` | `navigation-rating.md` |
| `DataSkeleton` | `@unoui/vue/skeleton` | `data-display.md` |
| `Slider` | `@unoui/vue/slider` | `date-numeric.md` |
| `Switch` | `@unoui/vue/switch` | `selection.md` |
| `Tabs`, `TabPane` | `@unoui/vue/tab` | `navigation-rating.md` |
| `Table`, `TableColumn` types | `@unoui/vue/table` | `data-display.md` |
| `Tag` | `@unoui/vue/tag` | `buttons-tags.md` |
| `Tooltip` | `@unoui/vue/tooltip` | `feedback-overlays.md` |
