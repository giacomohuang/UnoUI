# UnoUI Vue Component Routing

Use this file as the first stop for component work. Load only the reference file that matches the components in the user's task.

## Reference Routing

| Task or component                                                                                | Read                   |
| ------------------------------------------------------------------------------------------------ | ---------------------- |
| Setup, styles, UnoCSS preset, icons, theme, `configureUnoUI`                                     | `integration.md`       |
| `Splitter`, `SplitterPanel`                                                                      | `layout.md`            |
| `Button`, `ButtonGroup`, `Tag`                                                                   | `buttons-tags.md`      |
| `Input`, `Autocomplete`, `InputTag`, `InputI18n`, `InputOtp`                                     | `inputs.md`            |
| `Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup`, `Switch`, `Select`                           | `selection.md`         |
| `DatePicker`, `RangePicker`, `TimePicker`, `TimeRangePicker`, `Slider`, `ColorPicker`            | `date-numeric.md`      |
| `ImageEditor`                                                                                    | `media.md`             |
| `Form`, `FormItem`, validation rules/exposes                                                     | `form.md`              |
| `Table`, `Pagination`, `Progress`, `Skeleton`, `Badge`, `BadgeRibbon`, `QRCode`, `MillerColumns` | `data-display.md`      |
| `Alert`, `message`, `MessageContainer`, `Modal`, `Drawer`, `Tooltip`, `Popconfirm`, `Dropdown`   | `feedback-overlays.md` |
| `Tabs`, `TabPane`, `Rate`                                                                        | `navigation-rating.md` |

## Shared Conventions

- Prefer component subpath imports: `@mcistudio/unoui-vue/button`, `@mcistudio/unoui-vue/input`, `@mcistudio/unoui-vue/table`.
- Use kebab-case in templates: `prefix-icon`, `show-word-limit`, `v-model:current-page`, `@visible-change`.
- For value-like component state, default to Vue's standard `v-model` contract: `modelValue` plus `update:modelValue`. Do not introduce `value` / `update:value` / `v-model:value` unless the current component source already defines that named model.
- Most form controls support `size="sm|md|lg"`.
- Icon props take UnoCSS/Iconify class strings such as `i-lucide:search`.
- Controlled overlays usually use `v-model:open`; `Modal` uses `v-model:visible`; `Drawer` accepts `v-model` or `v-model:visible`.
- Type component refs with `InstanceType<typeof Component>` when calling exposed methods.
- If a detail conflicts with current source, prefer `packages/vue/src` over these references.

## Component Index

| Component                                        | Import                               | Details                |
| ------------------------------------------------ | ------------------------------------ | ---------------------- |
| `Splitter`, `SplitterPanel`                      | `@mcistudio/unoui-vue/splitter`      | `layout.md`            |
| `Alert`                                          | `@mcistudio/unoui-vue/alert`         | `feedback-overlays.md` |
| `Badge`, `BadgeRibbon`                           | `@mcistudio/unoui-vue/badge`         | `data-display.md`      |
| `Button`, `ButtonGroup`                          | `@mcistudio/unoui-vue/button`        | `buttons-tags.md`      |
| `Checkbox`, `CheckboxGroup`                      | `@mcistudio/unoui-vue/checkbox`      | `selection.md`         |
| `ColorPicker`                                    | `@mcistudio/unoui-vue/colorpicker`   | `date-numeric.md`      |
| `DatePicker`, `RangePicker`                      | `@mcistudio/unoui-vue/datepicker`    | `date-numeric.md`      |
| `TimePicker`, `TimeRangePicker`                  | `@mcistudio/unoui-vue/timepicker`    | `date-numeric.md`      |
| `Drawer`                                         | `@mcistudio/unoui-vue/drawer`        | `feedback-overlays.md` |
| `Dropdown`                                       | `@mcistudio/unoui-vue/dropdown`      | `feedback-overlays.md` |
| `Form`, `FormItem`, `createFormRule`             | `@mcistudio/unoui-vue/form`          | `form.md`              |
| `Input`, `Autocomplete`, `InputTag`, `InputI18n` | `@mcistudio/unoui-vue/input`         | `inputs.md`            |
| `InputOtp`                                       | `@mcistudio/unoui-vue/inputOtp`      | `inputs.md`            |
| `ImageEditor`                                    | `@mcistudio/unoui-vue/imageeditor`   | `media.md`             |
| `message`, `Message`, `MessageContainer`         | `@mcistudio/unoui-vue/message`       | `feedback-overlays.md` |
| `MillerColumns`                                  | `@mcistudio/unoui-vue/millercolumns` | `data-display.md`      |
| `Modal`                                          | `@mcistudio/unoui-vue/modal`         | `feedback-overlays.md` |
| `Pagination`                                     | `@mcistudio/unoui-vue/pagination`    | `data-display.md`      |
| `Popconfirm`                                     | `@mcistudio/unoui-vue/popconfirm`    | `feedback-overlays.md` |
| `Progress`                                       | `@mcistudio/unoui-vue/progress`      | `data-display.md`      |
| `QRCode`                                         | `@mcistudio/unoui-vue/qrcode`        | `data-display.md`      |
| `Radio`, `RadioGroup`                            | `@mcistudio/unoui-vue/radio`         | `selection.md`         |
| `Rate`                                           | `@mcistudio/unoui-vue/rate`          | `navigation-rating.md` |
| `Skeleton`                                       | `@mcistudio/unoui-vue/skeleton`      | `data-display.md`      |
| `Slider`                                         | `@mcistudio/unoui-vue/slider`        | `date-numeric.md`      |
| `Switch`                                         | `@mcistudio/unoui-vue/switch`        | `selection.md`         |
| `Tabs`, `TabPane`                                | `@mcistudio/unoui-vue/tab`           | `navigation-rating.md` |
| `Table`, `TableColumn` types                     | `@mcistudio/unoui-vue/table`         | `data-display.md`      |
| `Tag`                                            | `@mcistudio/unoui-vue/tag`           | `buttons-tags.md`      |
| `Tooltip`                                        | `@mcistudio/unoui-vue/tooltip`       | `feedback-overlays.md` |
