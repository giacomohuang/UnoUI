import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import type { CSSProperties, VNodeChild } from 'vue'

export { default as QRCode } from './QRCode.vue'

export type QRCodeType = 'canvas' | 'svg'
export type QRCodeStatus = 'active' | 'expired' | 'loading' | 'scanned'
export type QRCodeMaskStatus = Exclude<QRCodeStatus, 'active'>
export type QRCodeErrorLevel = 'L' | 'M' | 'Q' | 'H'
export type QRCodeIconSize = number | { width: number; height: number }
export type QRCodeSemanticName = 'root' | 'code' | 'mask' | 'status' | 'refresh'
export type QRCodeSemanticClassNames = Partial<Record<QRCodeSemanticName, string>>
export type QRCodeSemanticStyles = Partial<Record<QRCodeSemanticName, CSSProperties | string>>

export interface QRCodeStatusLocale {
  expired: string
  refresh: string
  scanned: string
  loading: string
}

export interface QRCodeStatusRenderInfo {
  status: QRCodeMaskStatus
  locale: QRCodeStatusLocale
  onRefresh: (event?: MouseEvent) => void
}

export type QRCodeStatusRender = (info: QRCodeStatusRenderInfo) => VNodeChild

/** qrcodeRoot 定义二维码外框、边框和固定尺寸容器。 */
export const qrcodeRoot = cva('relative inline-flex shrink-0 items-center justify-center overflow-hidden transition-colors duration-150', {
  variants: {
    bordered: {
      true: 'rounded-md border border-medium bg-white p-2 shadow-sm dark:bg-white',
      false: 'bg-transparent'
    }
  },
  defaultVariants: {
    bordered: true
  }
})

/** qrcodeCode 定义 canvas/svg 二维码主体尺寸与渲染质量。 */
export const qrcodeCode = cva('block shrink-0 [image-rendering:pixelated]')

/** qrcodeMask 定义非 active 状态下覆盖二维码的蒙层。 */
export const qrcodeMask = cva('absolute inset-0 z-1 flex flex-col items-center justify-center gap-2 bg-white/95 px-3 text-center backdrop-blur-[1px]')

/** qrcodeStatus 定义状态图标和说明文本的垂直布局。 */
export const qrcodeStatus = cva('flex flex-col items-center justify-center gap-2 text-xs/5 font-medium text-zinc-700')

/** qrcodeStatusIcon 定义二维码状态图标的语义色。 */
export const qrcodeStatusIcon = cva('inline-flex size-6 items-center justify-center text-xl', {
  variants: {
    status: {
      loading: 'text-brand-500',
      expired: 'text-amber-500',
      scanned: 'text-green-500'
    }
  },
  defaultVariants: {
    status: 'loading'
  }
})

/** qrcodeRefreshButton 定义过期状态下的刷新操作。 */
export const qrcodeRefreshButton = cva('inline-flex h-7 items-center gap-1 rounded px-2 text-xs/5 font-medium text-brand-600 transition-colors hover:bg-brand-500/10 hover:text-brand-500 focus-visible:(outline-none ring-2 ring-brand-500/30)')

export type QRCodeRootProps = VariantProps<typeof qrcodeRoot>
