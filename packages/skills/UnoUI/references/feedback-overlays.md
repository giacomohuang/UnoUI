# Feedback And Overlays

Use this file for `Alert`, `message`, `MessageContainer`, `Modal`, `Drawer`, `Tooltip`, `Popconfirm`, and `Dropdown`.

## Contents

- Alert
- message
- MessageContainer
- Modal
- Drawer
- Tooltip
- Popconfirm
- Dropdown

## Alert

```vue
<Alert title="Saved" type="success" show-icon />
<Alert banner title="Maintenance tonight" />
```

Props:

- `title`, `description`
- `type`: `success | info | warning | error`
- `variant`: `outlined | filled`
- `banner`, `showIcon`, `icon`
- `action`
- `closable`
- `closeAriaLabel`
- semantic `classNames`, `styles`

Events:

- `close(MouseEvent)`
- `afterClose()`

Slots:

- `title`, `description`, `icon`, `action`, `closeIcon`

Expose:

- None

## message

```ts
import { message } from '@unoui/vue/message'

message.success('Saved')
message.error({ message: 'Failed', duration: 0, showClose: true })
message.closeAll()
```

Options:

- `message`
- `type`: `info | success | warning | error`
- `duration`
- `showClose`
- `offset`
- `icon`
- `id`
- `onClose`

Methods:

- `message.info(msg, opts?)`
- `message.success(msg, opts?)`
- `message.warning(msg, opts?)`
- `message.error(msg, opts?)`
- callable `message(params)`
- `message.closeAll()`

Component export:

- `MessageContainer` is exported for low-level mounting. It exposes `add`, `close`, and `closeAll`; prefer the `message` handler unless writing infrastructure.

## MessageContainer

Use `MessageContainer` only for low-level message infrastructure. Prefer `message` or `Message` for application code.

Props:

- None

Events:

- None

Slots:

- None

Expose:

- `add(options: MessageOptions): MessageHandler`
- `close(id: string)`
- `closeAll()`

## Modal

```vue
<Modal v-model:visible="visible" title="Confirm" width="420px">
  Content
  <template #footer>Actions</template>
</Modal>
```

Props:

- `visible`
- `title`
- `width`
- `closeOnEsc`
- `closeOnBackdrop`
- `showClose`
- `zIndex`

Events:

- `update:visible(boolean)`

Slots:

- `default`, `header`, `icon`, `footer`

Expose:

- None

## Drawer

```vue
<Drawer v-model:visible="visible" title="Settings" direction="rtl" size="400px" />
```

Props:

- `modelValue`, `visible`
- `title`
- `direction`: `rtl | ltr | ttb | btt`
- `size`
- `withHeader`, `showClose`
- `closeOnClickModal`, `closeOnPressEscape`
- `beforeClose(done)`
- `destroyOnClose`
- `modal`, `lockScroll`
- `zIndex`, `bodyClass`
- `push`: `boolean | { distance?: number | string }`, controls whether nested drawers push the parent drawer; default distance is `180px`

Events:

- `update:modelValue(boolean)`
- `update:visible(boolean)`
- `open()`, `opened()`, `close()`, `closed()`

Slots:

- `default`, `header`, `icon`, `footer`

Expose:

- None

## Tooltip

```vue
<Tooltip title="Help" placement="right">
  <Button variant="outline">Hover</Button>
</Tooltip>
```

Props:

- `title`
- `placement`: see `TooltipPlacement`
- `trigger`: `hover | focus | click | contextMenu` or array
- `open`, `defaultOpen`
- `disabled`
- `arrow`
- `color`
- `autoAdjustOverflow`
- `destroyOnHidden`, `fresh`
- `mouseEnterDelay`, `mouseLeaveDelay`
- `zIndex`
- semantic `classNames`, `styles`
- `contentClass`

Events:

- `update:open(boolean)`
- `openChange(boolean)`

Slots:

- `default`, `title`

Expose:

- None

## Popconfirm

```vue
<Popconfirm title="Delete?" ok-type="danger" @confirm="remove">
  <Button color="red" variant="outline">Delete</Button>
</Popconfirm>
```

Props:

- Tooltip-like overlay props: `placement`, `trigger`, `open`, `defaultOpen`, `arrow`, `autoAdjustOverflow`, `destroyOnHidden`, delays, `zIndex`, `color`
- `title`, `description`
- `disabled`
- `icon`
- `okText`, `cancelText`
- `okType`: `primary | danger | default`
- `showCancel`
- `okButtonProps`, `cancelButtonProps`
- semantic `classNames`, `styles`

Events:

- `update:open(boolean)`
- `openChange(boolean)`
- `confirm(MouseEvent)`
- `cancel(MouseEvent)`
- `popupClick(MouseEvent)`

Slots:

- `default`, `title`, `description`, `icon`

Expose:

- None

## Dropdown

```vue
<Dropdown :items="items" value-key="value" trigger="hover" @select="selectItem">
  <template #trigger="{ open }">
    <Button icon="i-lucide:chevron-down">Actions</Button>
  </template>
</Dropdown>
```

Props:

- `items`
- `valueKey`
- `align`: `left | right`
- `placement`
- `trigger`: `click | hover | contextMenu` or array
- `arrow`
- `autoAdjustOverflow`
- `disabled`
- `destroyOnHidden`
- `closeOnSelect`
- `minWidth`, `width`, `maxHeight`
- `contentClass`, `popupStyle`
- `focusOnOpen`
- `fullWidth`: make the trigger wrapper `w-full min-w-0`; use for form-control-like dropdown triggers

Keyboard state:

- Dropdown owns the keyboard active row state; item slot content may use hover classes, but the active row background remains the priority while navigating with arrow keys.

Models:

- `v-model:value`
- `v-model:open`

Events:

- `select(item)`
- `openChange(open, info)`
- `visible-change(open)`
- `visibleChange(open)`: camelCase compatibility event

Slots:

- `trigger="{ open }"`
- `header`
- `item="{ item, index, active, selected }"`
- `footer`

Expose:

- `open()`
- `close()`
- `handleKeyDown(event)`
