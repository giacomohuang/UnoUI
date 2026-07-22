import type { ParamTableRow } from '@/components/ParamTable.vue'

export const imageEditorProps: ParamTableRow[] = [
  { name: 'src', type: 'string', default: '—', desc: '待编辑图片地址，支持普通 URL、Blob URL 和 Data URL' },
  { name: 'alt', type: 'string', default: `''`, desc: '原始图片的替代文本' },
  { name: 'aspectRatio', type: 'number', default: 'undefined', desc: '固定裁剪宽高比；不传或传非正数时自由裁剪' },
  { name: 'minWidth', type: 'number', default: '0', desc: '裁剪区域最小宽度，单位为原图像素' },
  { name: 'minHeight', type: 'number', default: '0', desc: '裁剪区域最小高度，单位为原图像素' },
  { name: 'height', type: 'number | string', default: '420', desc: '编辑画布高度，数字按 px 处理' },
  { name: 'zoomStep', type: 'number', default: '0.1', desc: '工具栏单次缩放比例和滚轮缩放步长' },
  { name: 'outputType', type: `'image/png' | 'image/jpeg' | 'image/webp'`, default: `'image/png'`, desc: '裁剪结果 MIME 类型' },
  { name: 'outputQuality', type: 'number', default: '0.92', desc: 'JPEG/WebP 输出质量，取值 0 到 1' },
  { name: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用画布交互和工具栏' },
  { name: 'showToolbar', type: 'boolean', default: 'true', desc: '是否显示内置工具栏' }
]

export const imageEditorEmits: ParamTableRow[] = [
  { name: 'ready', params: 'ImageEditorData', desc: '图片加载且裁剪引擎就绪时触发' },
  { name: 'change', params: 'ImageEditorData', desc: '裁剪区域、缩放或旋转发生变化时触发' },
  { name: 'crop', params: 'ImageEditorResult', desc: '点击内置裁剪按钮或调用 crop() 成功时触发' },
  { name: 'error', params: 'Error', desc: '图片加载或裁剪输出失败时触发' }
]

export const imageEditorSlots: ParamTableRow[] = []

export const imageEditorExposes: ParamTableRow[] = [
  { name: 'zoom', signature: '(ratio?: number) => void', desc: '按相对比例缩放图片，默认使用 zoomStep' },
  { name: 'rotate', signature: '(degrees: number) => void', desc: '按角度旋转图片' },
  { name: 'reset', signature: '() => void', desc: '恢复图片和裁剪区域初始状态' },
  { name: 'crop', signature: '() => Promise<ImageEditorResult>', desc: '生成 Blob、Data URL、输出尺寸和裁剪数据' },
  { name: 'getData', signature: '(rounded?: boolean) => ImageEditorData | undefined', desc: '读取当前裁剪区域数据' }
]

export const imageEditorCodeExample = `<script setup lang="ts">
import { ref } from 'vue'

import {
  ImageEditor,
  type ImageEditorResult
} from '@mcistudio/unoui-vue/imageeditor'

const editorRef = ref<InstanceType<typeof ImageEditor> | null>(null)
const result = ref<ImageEditorResult>()
</script>

<template>
  <ImageEditor
    ref="editorRef"
    src="/images/photo.jpg"
    :aspect-ratio="16 / 9"
    :min-width="640"
    :min-height="360"
    output-type="image/webp"
    :output-quality="0.9"
    @crop="result = $event"
  />

  <img v-if="result" :src="result.dataUrl" alt="裁剪结果" />
</template>`
