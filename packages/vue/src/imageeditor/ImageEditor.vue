<template>
  <div data-ui-image-editor="true" class="min-w-0 overflow-hidden rounded-lg border border-medium bg-primary" :aria-busy="loading">
    <div class="relative overflow-hidden bg-zinc-950" :style="stageStyle">
      <img ref="imageRef" data-ui-image-editor-image="true" class="block size-full max-w-full object-contain" :src="src" :alt="alt" @error="handleImageError" />

      <div v-if="loading && !errorMessage" class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/75 text-zinc-200">
        <span class="i-lucide:loader-circle size-5 animate-spin" aria-hidden="true"></span>
        <span class="sr-only">图片加载中</span>
      </div>

      <div v-if="errorMessage" data-ui-image-editor-error="true" class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-zinc-950 px-4 text-center text-zinc-200">
        <span class="i-lucide:image-off size-7 text-zinc-400" aria-hidden="true"></span>
        <span class="text-sm">{{ errorMessage }}</span>
      </div>
    </div>

    <div v-if="showToolbar" data-ui-image-editor-toolbar="true" class="flex min-h-12 flex-wrap items-center gap-2 border-t border-medium bg-primary px-3 py-2">
      <div class="flex items-center gap-1" role="group" aria-label="图片缩放">
        <Tooltip title="缩小">
          <Button aria-label="缩小" icon="i-lucide:zoom-out" size="icon" variant="mono" :disabled="controlsDisabled" @click="zoom(-zoomStep)" />
        </Tooltip>
        <Tooltip title="放大">
          <Button aria-label="放大" icon="i-lucide:zoom-in" size="icon" variant="mono" :disabled="controlsDisabled" @click="zoom(zoomStep)" />
        </Tooltip>
      </div>

      <span class="h-5 w-px bg-medium" aria-hidden="true"></span>

      <div class="flex items-center gap-1" role="group" aria-label="图片旋转">
        <Tooltip title="向左旋转">
          <Button aria-label="向左旋转" icon="i-lucide:rotate-ccw" size="icon" variant="mono" :disabled="controlsDisabled" @click="rotate(-90)" />
        </Tooltip>
        <Tooltip title="向右旋转">
          <Button aria-label="向右旋转" icon="i-lucide:rotate-cw" size="icon" variant="mono" :disabled="controlsDisabled" @click="rotate(90)" />
        </Tooltip>
        <Tooltip title="重置">
          <Button aria-label="重置" icon="i-lucide:refresh-cw" size="icon" variant="mono" :disabled="controlsDisabled" @click="reset" />
        </Tooltip>
      </div>

      <div class="ml-auto flex min-w-0 items-center gap-3">
        <span v-if="currentData" class="hidden whitespace-nowrap font-mono text-xs text-tertiary sm:inline"> {{ Math.round(currentData.width) }} x {{ Math.round(currentData.height) }} px </span>
        <Button icon="i-lucide:crop" size="sm" :disabled="controlsDisabled" :loading="cropping" @click="handleCrop">裁剪</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Cropper from 'cropperjs'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { CSSProperties } from 'vue'

import type { ImageEditorData, ImageEditorOutputType, ImageEditorResult } from '.'
import { Button } from '../button'
import { Tooltip } from '../tooltip'

const props = withDefaults(
  defineProps<{
    /** src 是待编辑图片地址，支持普通 URL、Blob URL 和 Data URL。 */
    src: string
    /** alt 是原始图片的替代文本。 */
    alt?: string
    /** aspectRatio 固定裁剪宽高比；不传或传非正数时为自由比例。 */
    aspectRatio?: number
    /** minWidth 是最终裁剪区域的最小宽度，单位为原图像素。 */
    minWidth?: number
    /** minHeight 是最终裁剪区域的最小高度，单位为原图像素。 */
    minHeight?: number
    /** height 是编辑画布高度。 */
    height?: number | string
    /** zoomStep 是工具栏每次缩放的比例。 */
    zoomStep?: number
    /** outputType 是裁剪结果的图片 MIME 类型。 */
    outputType?: ImageEditorOutputType
    /** outputQuality 是 JPEG/WebP 输出质量，取值 0 到 1。 */
    outputQuality?: number
    /** disabled 禁用画布交互和工具栏操作。 */
    disabled?: boolean
    /** showToolbar 控制内置工具栏是否显示。 */
    showToolbar?: boolean
  }>(),
  {
    alt: '',
    aspectRatio: undefined,
    minWidth: 0,
    minHeight: 0,
    height: 420,
    zoomStep: 0.1,
    outputType: 'image/png',
    outputQuality: 0.92,
    disabled: false,
    showToolbar: true
  }
)

const emit = defineEmits<{
  (e: 'ready', data: ImageEditorData): void
  (e: 'change', data: ImageEditorData): void
  (e: 'crop', result: ImageEditorResult): void
  (e: 'error', error: Error): void
}>()

const imageRef = ref<HTMLImageElement | null>(null)
const loading = ref(true)
const cropping = ref(false)
const errorMessage = ref('')
const currentData = ref<ImageEditorData>()
let cropper: Cropper | undefined
let mounted = false
let applyingConstraints = false

const stageStyle = computed<CSSProperties>(() => ({
  height: typeof props.height === 'number' ? `${Math.max(240, props.height)}px` : props.height
}))
const controlsDisabled = computed(() => props.disabled || loading.value || cropping.value || !!errorMessage.value)
const normalizedAspectRatio = computed(() => (Number.isFinite(props.aspectRatio) && Number(props.aspectRatio) > 0 ? Number(props.aspectRatio) : Number.NaN))

function toImageEditorData(data: Cropper.Data): ImageEditorData {
  return {
    x: data.x,
    y: data.y,
    width: data.width,
    height: data.height,
    rotate: data.rotate,
    scaleX: data.scaleX,
    scaleY: data.scaleY
  }
}

function minimumCropSize() {
  let width = Math.max(0, Number.isFinite(props.minWidth) ? props.minWidth : 0)
  let height = Math.max(0, Number.isFinite(props.minHeight) ? props.minHeight : 0)
  const ratio = normalizedAspectRatio.value

  if (Number.isFinite(ratio)) {
    width = Math.max(width, height * ratio)
    height = width / ratio
  }

  return { width, height }
}

function enforceMinimumCropSize() {
  if (!cropper || applyingConstraints) return

  const data = cropper.getData()
  const minimum = minimumCropSize()
  if (data.width + 0.5 >= minimum.width && data.height + 0.5 >= minimum.height) return

  const width = Math.max(data.width, minimum.width)
  const height = Math.max(data.height, minimum.height)
  applyingConstraints = true
  cropper.setData({
    x: data.x - (width - data.width) / 2,
    y: data.y - (height - data.height) / 2,
    width,
    height
  })
  applyingConstraints = false
}

function syncData(shouldEmit = true) {
  if (!cropper) return
  enforceMinimumCropSize()
  const data = toImageEditorData(cropper.getData())
  currentData.value = data
  if (shouldEmit) emit('change', data)
  return data
}

function reportError(error: unknown, fallback: string, blocking = false) {
  const normalizedError = error instanceof Error ? error : new Error(fallback)
  if (blocking) {
    errorMessage.value = normalizedError.message || fallback
    loading.value = false
  }
  cropping.value = false
  emit('error', normalizedError)
  return normalizedError
}

function destroyCropper() {
  cropper?.destroy()
  cropper = undefined
  currentData.value = undefined
}

function initializeCropper() {
  if (!mounted || !imageRef.value) return
  destroyCropper()
  errorMessage.value = ''
  loading.value = true

  if (!props.src.trim()) {
    reportError(new Error('图片地址不能为空'), '图片地址不能为空', true)
    return
  }

  cropper = new Cropper(imageRef.value, {
    aspectRatio: normalizedAspectRatio.value,
    autoCropArea: 0.86,
    background: false,
    center: true,
    dragMode: 'move',
    guides: true,
    highlight: false,
    modal: true,
    responsive: true,
    restore: false,
    rotatable: true,
    toggleDragModeOnDblclick: false,
    viewMode: 1,
    wheelZoomRatio: Math.max(0.01, Math.abs(props.zoomStep)),
    zoomOnTouch: true,
    zoomOnWheel: true,
    zoomable: true,
    ready: () => {
      if (!cropper) return
      loading.value = false
      if (props.disabled) cropper.disable()
      const data = syncData(false)
      if (data) emit('ready', data)
    },
    crop: () => {
      if (!cropper || loading.value) return
      syncData()
    },
    cropend: () => enforceMinimumCropSize()
  })
}

function handleImageError() {
  destroyCropper()
  reportError(new Error('图片加载失败，请检查图片地址或跨域配置'), '图片加载失败', true)
}

function zoom(ratio = props.zoomStep) {
  if (controlsDisabled.value || !Number.isFinite(ratio) || ratio === 0) return
  cropper?.zoom(ratio)
}

function rotate(degrees: number) {
  if (controlsDisabled.value || !Number.isFinite(degrees) || degrees === 0) return
  cropper?.rotate(degrees)
  enforceMinimumCropSize()
}

function reset() {
  if (controlsDisabled.value) return
  cropper?.reset()
  cropper?.setAspectRatio(normalizedAspectRatio.value)
  syncData()
}

function getData(rounded = false) {
  if (!cropper) return
  enforceMinimumCropSize()
  return toImageEditorData(cropper.getData(rounded))
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('无法生成裁剪图片'))
      },
      props.outputType,
      Math.min(1, Math.max(0, props.outputQuality))
    )
  })
}

async function crop(): Promise<ImageEditorResult> {
  if (!cropper || loading.value || errorMessage.value) throw new Error('图片编辑器尚未就绪')

  try {
    cropping.value = true
    const minimum = minimumCropSize()
    enforceMinimumCropSize()
    const canvas = cropper.getCroppedCanvas({
      minWidth: Math.ceil(minimum.width),
      minHeight: Math.ceil(minimum.height),
      fillColor: props.outputType === 'image/jpeg' ? '#ffffff' : undefined,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    })
    if (!canvas) throw new Error('无法创建裁剪画布')

    const quality = Math.min(1, Math.max(0, props.outputQuality))
    const [blob, dataUrl] = await Promise.all([canvasToBlob(canvas), Promise.resolve(canvas.toDataURL(props.outputType, quality))])
    const result: ImageEditorResult = {
      blob,
      dataUrl,
      width: canvas.width,
      height: canvas.height,
      data: toImageEditorData(cropper.getData())
    }
    emit('crop', result)
    return result
  } catch (error) {
    throw reportError(error, '图片裁剪失败')
  } finally {
    cropping.value = false
  }
}

async function handleCrop() {
  try {
    await crop()
  } catch {
    // crop() 已通过 error 事件报告失败原因。
  }
}

watch(
  () => props.src,
  async () => {
    await nextTick()
    initializeCropper()
  }
)

watch(normalizedAspectRatio, (ratio) => {
  cropper?.setAspectRatio(ratio)
  syncData()
})

watch(
  () => [props.minWidth, props.minHeight],
  () => syncData()
)

watch(
  () => props.disabled,
  (disabled) => {
    if (!cropper) return
    if (disabled) cropper.disable()
    else cropper.enable()
  }
)

onMounted(() => {
  mounted = true
  initializeCropper()
})

onBeforeUnmount(() => {
  mounted = false
  destroyCropper()
})

defineExpose({ zoom, rotate, reset, crop, getData })
</script>

<style scoped>
:deep(.cropper-container) {
  height: 100% !important;
  width: 100% !important;
}

:deep(.cropper-view-box) {
  outline-color: oklch(68.98% 0.1679 252.18 / 0.9);
}

:deep(.cropper-line),
:deep(.cropper-point) {
  background-color: oklch(68.98% 0.1679 252.18);
}

:deep(.cropper-point) {
  height: 8px;
  opacity: 1;
  width: 8px;
}

:deep(.cropper-modal) {
  background-color: #09090b;
  opacity: 0.66;
}
</style>
