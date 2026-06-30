import rawQrcodegen from './qrcodegen'

import type { QRCodeErrorLevel, QRCodeIconSize } from '.'

const qrcodegen = rawQrcodegen

export interface QRCodeIconLayout {
  x: number
  y: number
  width: number
  height: number
  excavation: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface QRCodeRenderData {
  modules: boolean[][]
  margin: number
  numCells: number
  path: string
  iconLayout?: QRCodeIconLayout
}

const ERROR_LEVEL_MAP = {
  L: qrcodegen.QrCode.Ecc.LOW,
  M: qrcodegen.QrCode.Ecc.MEDIUM,
  Q: qrcodegen.QrCode.Ecc.QUARTILE,
  H: qrcodegen.QrCode.Ecc.HIGH
}

/** createQRCodeModules 使用本地 Nayuki QR 编码器生成模块矩阵。 */
export function createQRCodeModules(value: string, errorLevel: QRCodeErrorLevel, boostLevel: boolean) {
  const segments = qrcodegen.QrSegment.makeSegments(value)
  const code = qrcodegen.QrCode.encodeSegments(segments, ERROR_LEVEL_MAP[errorLevel], 1, 40, -1, boostLevel)
  return Array.from({ length: code.size }, (_, y) => Array.from({ length: code.size }, (_, x) => code.getModule(x, y)))
}

/** resolveQRCodeMargin 将 marginSize 归一成二维码模块单位留白。 */
export function resolveQRCodeMargin(marginSize?: number) {
  if (Number.isFinite(marginSize)) return Math.max(0, Math.floor(Number(marginSize)))
  return 0
}

/** generateQRCodePath 把连续黑色模块合并成 SVG/Path2D 路径，减少节点和绘制次数。 */
export function generateQRCodePath(modules: boolean[][], margin = 0) {
  const commands: string[] = []

  modules.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      if (!row[x]) {
        x += 1
        continue
      }

      const start = x
      while (x < row.length && row[x]) x += 1
      commands.push(`M${start + margin} ${y + margin}h${x - start}v1H${start + margin}z`)
    }
  })

  return commands.join('')
}

/** resolveIconSize 根据组件尺寸推导默认 logo 尺寸，并兼容数字和对象配置。 */
export function resolveIconSize(iconSize: QRCodeIconSize | undefined, size: number) {
  if (typeof iconSize === 'object') {
    return {
      width: Math.max(0, iconSize.width),
      height: Math.max(0, iconSize.height)
    }
  }

  if (Number.isFinite(iconSize)) {
    const value = Math.max(0, Number(iconSize))
    return { width: value, height: value }
  }

  const fallback = Math.max(16, Math.round(size * 0.25))
  return { width: fallback, height: fallback }
}

/** getIconLayout 将像素尺寸换算为 QR 模块坐标，并给 logo 预留白底区域。 */
export function getIconLayout(modules: boolean[][], size: number, margin: number, iconSize: QRCodeIconSize | undefined): QRCodeIconLayout {
  const resolvedSize = resolveIconSize(iconSize, size)
  const scale = (modules.length + margin * 2) / size
  const width = resolvedSize.width * scale
  const height = resolvedSize.height * scale
  const x = modules.length / 2 - width / 2
  const y = modules.length / 2 - height / 2
  const floorX = Math.floor(x)
  const floorY = Math.floor(y)

  return {
    x,
    y,
    width,
    height,
    excavation: {
      x: floorX,
      y: floorY,
      width: Math.ceil(width + x - floorX),
      height: Math.ceil(height + y - floorY)
    }
  }
}

/** excavateQRCodeModules 清空 logo 覆盖区域，避免二维码黑块压住中心图标。 */
export function excavateQRCodeModules(modules: boolean[][], layout: QRCodeIconLayout) {
  const { excavation } = layout
  return modules.map((row, y) => {
    if (y < excavation.y || y >= excavation.y + excavation.height) return row
    return row.map((cell, x) => {
      if (x < excavation.x || x >= excavation.x + excavation.width) return cell
      return false
    })
  })
}

/** createQRCodeRenderData 汇总二维码矩阵、留白、路径和可选 logo 布局。 */
export function createQRCodeRenderData(options: {
  value: string
  errorLevel: QRCodeErrorLevel
  boostLevel: boolean
  marginSize?: number
  size: number
  icon?: string
  iconSize?: QRCodeIconSize
}) {
  const rawModules = createQRCodeModules(options.value, options.errorLevel, options.boostLevel)
  const margin = resolveQRCodeMargin(options.marginSize)
  const iconLayout = options.icon ? getIconLayout(rawModules, options.size, margin, options.iconSize) : undefined
  const modules = iconLayout ? excavateQRCodeModules(rawModules, iconLayout) : rawModules

  return {
    modules,
    margin,
    numCells: modules.length + margin * 2,
    path: generateQRCodePath(modules, margin),
    iconLayout
  }
}
