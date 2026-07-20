# Layout Components

Use this reference for resizable panel layouts built with `Splitter` and `SplitterPanel`.

## Imports

```ts
import { Splitter, SplitterPanel, type SplitterOrientation, type SplitterPanelCollapsible, type SplitterSize } from '@mcistudio/unoui-vue/splitter'
```

## Splitter

- `v-model` accepts `(number | string)[]`; numbers are px and strings may use percentages. Resize updates are emitted as px values.
- `defaultValue` provides uncontrolled initial sizes. When it is absent, each `SplitterPanel.defaultSize` is used and remaining space is distributed automatically.
- `orientation="horizontal|vertical"` controls the main axis. The default is `horizontal`.
- `lazy` moves only the preview line during a pointer drag and commits panel sizes on release.
- `keyboardStep` controls the px increment for separator arrow keys. Separators also support `Home` and `End`.
- `collapsible={{ motion: true }}` enables collapse/expand size transitions.
- `destroyOnHidden` unmounts content when a panel reaches size `0`; a panel can override it.
- Events are `resize-start`, `resize`, `resize-end`, `collapse`, and `dragger-double-click`.
- `#dragger="{ index, active }"` customizes the center of every separator.
- Exposed `reset()` restores `defaultValue` / panel defaults; `getSizes()` returns current px sizes.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Splitter, SplitterPanel, type SplitterSize } from '@mcistudio/unoui-vue/splitter'

const sizes = ref<SplitterSize[]>(['35%', '65%'])
</script>

<template>
  <Splitter v-model="sizes" :default-value="['35%', '65%']" class="h-64">
    <SplitterPanel min="20%" max="60%">Navigation</SplitterPanel>
    <SplitterPanel>Workspace</SplitterPanel>
  </Splitter>
</template>
```

## SplitterPanel

- `size` is the controlled panel size; `defaultSize` is the uncontrolled initial size.
- `min` and `max` accept px numbers or percentage strings.
- `resizable=false` disables both adjacent panels from resizing through their shared separator.
- `collapsible=true` enables both available edges. Object form supports `start`, `end`, and `showCollapsibleIcon: boolean | 'auto'`.
- `destroyOnHidden` overrides the parent setting.
- Splitter children should be direct `SplitterPanel` nodes; fragments such as `template v-for` are supported.

```vue
<Splitter :collapsible="{ motion: true }" class="h-64">
  <SplitterPanel
    default-size="30%"
    min="15%"
    :collapsible="{ end: true, showCollapsibleIcon: 'auto' }"
  >
    Navigation
  </SplitterPanel>
  <SplitterPanel>Workspace</SplitterPanel>
</Splitter>
```
