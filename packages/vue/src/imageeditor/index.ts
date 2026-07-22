export { default as ImageEditor } from './ImageEditor.vue'

export type ImageEditorOutputType = 'image/png' | 'image/jpeg' | 'image/webp'

export interface ImageEditorData {
  x: number
  y: number
  width: number
  height: number
  rotate: number
  scaleX: number
  scaleY: number
}

export interface ImageEditorResult {
  blob: Blob
  dataUrl: string
  width: number
  height: number
  data: ImageEditorData
}

export interface ImageEditorExpose {
  zoom: (ratio?: number) => void
  rotate: (degrees: number) => void
  reset: () => void
  crop: () => Promise<ImageEditorResult>
  getData: (rounded?: boolean) => ImageEditorData | undefined
}
