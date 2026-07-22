# UnoUI Vue Media Components

Use this file for `ImageEditor`.

## ImageEditor

`ImageEditor` provides an interactive crop canvas with built-in zoom, rotate, reset, and crop controls. Its Cropper.js styles are included in the standard UnoUI stylesheet, so consumers only need the normal global `@mcistudio/unoui-vue/style.css` import.

```vue
<script setup lang="ts">
import { ref } from 'vue'

import { ImageEditor, type ImageEditorResult } from '@mcistudio/unoui-vue/imageeditor'

const editorRef = ref<InstanceType<typeof ImageEditor> | null>(null)
const result = ref<ImageEditorResult>()
</script>

<template>
  <ImageEditor ref="editorRef" src="/images/photo.jpg" :aspect-ratio="16 / 9" :min-width="640" :min-height="360" output-type="image/webp" :output-quality="0.9" @crop="result = $event" />

  <img v-if="result" :src="result.dataUrl" alt="Cropped preview" />
</template>
```

Props:

- `src`: image URL, Blob URL, or Data URL; required
- `alt`: source image alternative text
- `aspectRatio`: positive number for a fixed crop ratio; omit or pass a non-positive value for free crop
- `minWidth`, `minHeight`: minimum crop dimensions measured in source-image pixels
- `height`: editor canvas height as a number in pixels or a CSS string
- `zoomStep`: relative zoom amount used by the toolbar and mouse wheel
- `outputType`: `image/png | image/jpeg | image/webp`
- `outputQuality`: JPEG/WebP quality from `0` to `1`
- `disabled`: disables canvas and toolbar interaction
- `showToolbar`: shows the built-in toolbar

Events:

- `ready(data: ImageEditorData)`
- `change(data: ImageEditorData)`
- `crop(result: ImageEditorResult)`
- `error(error: Error)`

Expose:

- `zoom(ratio?)`
- `rotate(degrees)`
- `reset()`
- `crop(): Promise<ImageEditorResult>`
- `getData(rounded?): ImageEditorData | undefined`

`ImageEditorResult` contains `blob`, `dataUrl`, `width`, `height`, and the current crop `data`. The built-in crop button calls the same `crop()` method and emits the result.

For remote images, the image server must allow cross-origin canvas access. If it does not send suitable CORS headers, the editor can display the image but browsers will reject Blob/Data URL export and emit `error`.
