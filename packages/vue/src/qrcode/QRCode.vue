<script setup lang="ts">
import { clsx } from 'clsx'
import { computed, defineComponent, nextTick, onMounted, ref, watch } from 'vue'
import type { CSSProperties, PropType } from 'vue'

import {
  qrcodeCode,
  qrcodeMask,
  qrcodeRefreshButton,
  qrcodeRoot,
  qrcodeStatus,
  qrcodeStatusIcon,
  type QRCodeErrorLevel,
  type QRCodeIconSize,
  type QRCodeMaskStatus,
  type QRCodeSemanticClassNames,
  type QRCodeSemanticStyles,
  type QRCodeStatus,
  type QRCodeStatusLocale,
  type QRCodeStatusRender,
  type QRCodeStatusRenderInfo,
  type QRCodeType
} from '.'
import { createQRCodeRenderData } from './qr'

const QRCodeStatusRenderBridge = defineComponent({
  name: 'QRCodeStatusRenderBridge',
  props: {
    render: {
      type: Function as PropType<QRCodeStatusRender>,
      required: true
    },
    info: {
      type: Object as PropType<QRCodeStatusRenderInfo>,
      required: true
    }
  },
  setup(props) {
    return () => props.render(props.info)
  }
})

const props = withDefaults(
  defineProps<{
    /** value 是二维码编码内容。 */
    value: string
    /** type 指定渲染为 canvas 或 svg。 */
    type?: QRCodeType
    /** size 是二维码外框尺寸，单位 px。 */
    size?: number
    /** color 是二维码前景色。 */
    color?: string
    /** bgColor 是二维码背景色。 */
    bgColor?: string
    /** icon 是二维码中间的 logo 图片地址。 */
    icon?: string
    /** iconSize 是 logo 尺寸，可传数字或宽高对象。 */
    iconSize?: QRCodeIconSize
    /** status 控制二维码状态蒙层。 */
    status?: QRCodeStatus
    /** bordered 控制是否展示边框和内边距。 */
    bordered?: boolean
    /** errorLevel 是二维码纠错等级。 */
    errorLevel?: QRCodeErrorLevel
    /** marginSize 是二维码安静区宽度，单位为模块格。 */
    marginSize?: number
    /** boostLevel 控制编码器是否在不增加版本的情况下提升纠错等级。 */
    boostLevel?: boolean
    /** title 是 svg title 或 canvas 无障碍名称。 */
    title?: string
    /** expiredText 是过期状态文案。 */
    expiredText?: string
    /** refreshText 是过期状态刷新按钮文案。 */
    refreshText?: string
    /** scannedText 是已扫描状态文案。 */
    scannedText?: string
    /** loadingText 是加载状态文案。 */
    loadingText?: string
    /** statusRender 自定义状态蒙层内容。 */
    statusRender?: QRCodeStatusRender
    /** classNames 定义 root/code/mask/status/refresh 语义结构类名。 */
    classNames?: QRCodeSemanticClassNames
    /** styles 定义 root/code/mask/status/refresh 语义结构样式。 */
    styles?: QRCodeSemanticStyles
  }>(),
  {
    type: 'canvas',
    size: 160,
    color: '#111827',
    bgColor: '#ffffff',
    icon: '',
    iconSize: undefined,
    status: 'active',
    bordered: true,
    errorLevel: 'M',
    marginSize: undefined,
    boostLevel: true,
    title: undefined,
    expiredText: '二维码已过期',
    refreshText: '刷新',
    scannedText: '已扫描',
    loadingText: '加载中',
    statusRender: undefined,
    classNames: undefined,
    styles: undefined
  }
)

const emit = defineEmits<{
  (e: 'refresh', event?: MouseEvent): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const svgRef = ref<SVGSVGElement | null>(null)
const imageRef = ref<HTMLImageElement | null>(null)
const imageLoaded = ref(false)

const rootSize = computed(() => Math.max(32, Math.floor(props.size)))
const codeSize = computed(() => Math.max(24, rootSize.value - (props.bordered ? 18 : 0)))
const rootClass = computed(() => clsx(qrcodeRoot({ bordered: props.bordered }), props.classNames?.root))
const codeClass = computed(() => clsx(qrcodeCode(), props.classNames?.code))
const maskClass = computed(() => clsx(qrcodeMask(), props.classNames?.mask))
const statusClass = computed(() => clsx(qrcodeStatus(), props.classNames?.status))
const refreshClass = computed(() => clsx(qrcodeRefreshButton(), props.classNames?.refresh))
const maskStatus = computed<QRCodeMaskStatus | undefined>(() => (props.status === 'active' ? undefined : props.status))
const shouldUseIcon = computed(() => !!props.icon && (props.type === 'svg' || imageLoaded.value))
const renderData = computed(() =>
  createQRCodeRenderData({
    value: props.value,
    errorLevel: props.errorLevel,
    boostLevel: props.boostLevel,
    marginSize: props.marginSize,
    size: codeSize.value,
    icon: shouldUseIcon.value ? props.icon : '',
    iconSize: props.iconSize
  })
)

const locale = computed<QRCodeStatusLocale>(() => ({
  expired: props.expiredText,
  refresh: props.refreshText,
  scanned: props.scannedText,
  loading: props.loadingText
}))
const statusInfo = computed<QRCodeStatusRenderInfo>(() => ({
  status: maskStatus.value ?? 'loading',
  locale: locale.value,
  onRefresh: handleRefresh
}))
const rootStyle = computed<CSSProperties>(() => ({
  width: `${rootSize.value}px`,
  height: `${rootSize.value}px`,
  backgroundColor: props.bordered ? props.bgColor : undefined
}))
const codeStyle = computed<CSSProperties>(() => ({
  width: `${codeSize.value}px`,
  height: `${codeSize.value}px`
}))
const ariaLabel = computed(() => props.title || (props.value ? `二维码：${props.value}` : '二维码'))
const iconHref = computed(() => props.icon || undefined)

const normalizeStyle = (value: CSSProperties | string | undefined) => value

function handleRefresh(event?: MouseEvent) {
  emit('refresh', event)
}

function handleIconLoad() {
  imageLoaded.value = true
}

function handleIconError() {
  imageLoaded.value = false
}

/** drawCanvas 根据当前矩阵和设备像素比绘制高清 canvas 二维码。 */
function drawCanvas() {
  if (props.type !== 'canvas') return
  const canvas = canvasRef.value
  if (!canvas) return

  let context: CanvasRenderingContext2D | null = null
  try {
    context = canvas.getContext('2d')
  } catch {
    return
  }
  if (!context) return

  const data = renderData.value
  const pixelRatio = window.devicePixelRatio || 1
  const size = codeSize.value
  const scale = size / data.numCells

  canvas.width = Math.floor(size * pixelRatio)
  canvas.height = Math.floor(size * pixelRatio)
  context.setTransform(pixelRatio * scale, 0, 0, pixelRatio * scale, 0, 0)
  context.fillStyle = props.bgColor
  context.fillRect(0, 0, data.numCells, data.numCells)
  context.fillStyle = props.color

  if (typeof Path2D !== 'undefined') {
    context.fill(new Path2D(data.path))
  } else {
    data.modules.forEach((row: boolean[], y: number) => {
      row.forEach((cell: boolean, x: number) => {
        if (cell) context?.fillRect(x + data.margin, y + data.margin, 1, 1)
      })
    })
  }

  if (data.iconLayout && imageRef.value?.complete && imageRef.value.naturalWidth > 0 && imageRef.value.naturalHeight > 0) {
    context.drawImage(imageRef.value, data.iconLayout.x + data.margin, data.iconLayout.y + data.margin, data.iconLayout.width, data.iconLayout.height)
  }
}

function toDataURL(type = 'image/png', quality?: number) {
  if (props.type === 'canvas') return canvasRef.value?.toDataURL(type, quality)
  if (!svgRef.value) return undefined
  const source = new XMLSerializer().serializeToString(svgRef.value)
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`
}

watch(
  () => [props.type, props.value, props.color, props.bgColor, props.errorLevel, props.marginSize, props.boostLevel, props.icon, props.iconSize, codeSize.value, imageLoaded.value],
  () => nextTick(drawCanvas),
  { immediate: true, deep: true }
)

onMounted(drawCanvas)

defineExpose({
  toDataURL
})
</script>

<template>
  <div data-ui-qrcode="true" :data-status="status" :class="rootClass" :style="[rootStyle, normalizeStyle(styles?.root)]">
    <canvas v-if="type === 'canvas'" ref="canvasRef" data-ui-qrcode-code="true" role="img" :aria-label="ariaLabel" :class="codeClass" :style="[codeStyle, normalizeStyle(styles?.code)]"></canvas>

    <svg v-else ref="svgRef" data-ui-qrcode-code="true" role="img" :aria-label="ariaLabel" :width="codeSize" :height="codeSize" :viewBox="`0 0 ${renderData.numCells} ${renderData.numCells}`" :class="codeClass" :style="[codeStyle, normalizeStyle(styles?.code)]">
      <title v-if="title">{{ title }}</title>
      <path :fill="bgColor" :d="`M0 0h${renderData.numCells}v${renderData.numCells}H0z`" shape-rendering="crispEdges"></path>
      <path :fill="color" :d="renderData.path" shape-rendering="crispEdges"></path>
      <image v-if="renderData.iconLayout && iconHref" :href="iconHref" :x="renderData.iconLayout.x + renderData.margin" :y="renderData.iconLayout.y + renderData.margin" :width="renderData.iconLayout.width" :height="renderData.iconLayout.height" preserveAspectRatio="xMidYMid meet"></image>
    </svg>

    <img v-if="type === 'canvas' && icon" ref="imageRef" :src="icon" alt="" class="hidden" @load="handleIconLoad" @error="handleIconError" />

    <div v-if="maskStatus" data-ui-qrcode-mask="true" :class="maskClass" :style="normalizeStyle(styles?.mask)">
      <slot v-if="$slots.status" name="status" v-bind="statusInfo"></slot>
      <QRCodeStatusRenderBridge v-else-if="statusRender" :render="statusRender" :info="statusInfo" />
      <div v-else data-ui-qrcode-status="true" :class="statusClass" :style="normalizeStyle(styles?.status)">
        <span v-if="maskStatus === 'loading'" :class="qrcodeStatusIcon({ status: 'loading' })" aria-hidden="true">
          <span class="i-lucide:loader-2 animate-spin"></span>
        </span>
        <span v-else-if="maskStatus === 'expired'" :class="qrcodeStatusIcon({ status: 'expired' })" aria-hidden="true">
          <span class="i-lucide:circle-alert"></span>
        </span>
        <span v-else :class="qrcodeStatusIcon({ status: 'scanned' })" aria-hidden="true">
          <span class="i-lucide:circle-check"></span>
        </span>

        <span>{{ maskStatus === 'loading' ? locale.loading : maskStatus === 'expired' ? locale.expired : locale.scanned }}</span>

        <button v-if="maskStatus === 'expired'" type="button" data-ui-qrcode-refresh="true" :class="refreshClass" :style="normalizeStyle(styles?.refresh)" @click="handleRefresh">
          <span class="i-lucide:rotate-cw size-3.5" aria-hidden="true"></span>
          <span>{{ locale.refresh }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
