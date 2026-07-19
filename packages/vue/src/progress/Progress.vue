<script setup lang="ts">
import { clsx } from 'clsx'
import { computed, useAttrs, useId } from 'vue'
import type { CSSProperties } from 'vue'

import type { ProgressFormat, ProgressGapPlacement, ProgressGradient, ProgressInfoSlotProps, ProgressSemanticClassNames, ProgressSemanticStyles, ProgressSize, ProgressStatus, ProgressStrokeColor, ProgressStrokeLinecap, ProgressSuccess, ProgressType } from '.'
import { getUiAttrClass, getUiAttrStyle, getUiExposeAttrs } from '../attrs'

defineOptions({
  inheritAttrs: false
})

const props = withDefaults(
  defineProps<{
    /** percent 是当前完成百分比，渲染时限制在 0 到 100。 */
    percent?: number
    /** type 指定线形、圆形或仪表盘形态。 */
    type?: ProgressType
    /** status 指定语义状态；未传时，达到 100% 会自动切换为 success。 */
    status?: ProgressStatus
    /** showInfo 控制是否展示百分比或状态图标。 */
    showInfo?: boolean
    /** strokeColor 定义进度色；步骤模式支持颜色数组，其余模式支持渐变对象。 */
    strokeColor?: ProgressStrokeColor
    /** railColor 定义未完成轨道颜色。 */
    railColor?: string
    /** strokeLinecap 定义进度端点形状。 */
    strokeLinecap?: ProgressStrokeLinecap
    /** strokeWidth 定义轨道宽度；未传时由 size 决定。 */
    strokeWidth?: number
    /** size 定义组件预设尺寸。 */
    size?: ProgressSize
    /** success 定义已经成功完成的进度分段。 */
    success?: ProgressSuccess
    /** steps 将线形进度拆分为指定数量的步骤。 */
    steps?: number
    /** gapDegree 定义仪表盘缺口角度。 */
    gapDegree?: number
    /** gapPlacement 定义仪表盘缺口位置。 */
    gapPlacement?: ProgressGapPlacement
    /** format 自定义信息文案；复杂内容建议使用 info 插槽。 */
    format?: ProgressFormat
    /** classNames 定义 root/rail/track/success/info 语义结构类名。 */
    classNames?: ProgressSemanticClassNames
    /** styles 定义 root/rail/track/success/info 语义结构样式。 */
    styles?: ProgressSemanticStyles
  }>(),
  {
    percent: 0,
    type: 'line',
    status: undefined,
    showInfo: true,
    strokeColor: undefined,
    railColor: undefined,
    strokeLinecap: 'round',
    strokeWidth: undefined,
    size: 'md',
    success: undefined,
    steps: undefined,
    gapDegree: 75,
    gapPlacement: 'bottom',
    format: undefined,
    classNames: undefined,
    styles: undefined
  }
)

defineSlots<{
  info(props: ProgressInfoSlotProps): unknown
}>()

const attrs = useAttrs()
const exposeAttrs = computed(() => getUiExposeAttrs(attrs))
const gradientId = `unoui-progress-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

const circleSizes: Record<ProgressSize, number> = {
  sm: 64,
  md: 96,
  lg: 120,
  xl: 144,
  xxl: 168
}

const lineStrokeWidths: Record<ProgressSize, number> = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20
}

const infoSizeClasses: Record<ProgressSize, string> = {
  sm: 'text-xs/4',
  md: 'text-sm/5',
  lg: 'text-sm/5',
  xl: 'text-base/6',
  xxl: 'text-lg/7'
}

const lineInfoHeightClasses: Record<ProgressSize, string> = {
  sm: 'h-4',
  md: 'h-5',
  lg: 'h-5',
  xl: 'h-6',
  xxl: 'h-7'
}

const statusTrackClasses: Record<ProgressStatus, string> = {
  normal: 'bg-brand-500',
  active: 'bg-brand-500',
  success: 'bg-green-500',
  exception: 'bg-red-500'
}

const statusStrokeClasses: Record<ProgressStatus, string> = {
  normal: 'stroke-brand-500',
  active: 'stroke-brand-500',
  success: 'stroke-green-500',
  exception: 'stroke-red-500'
}

const normalizedPercent = computed(() => clampNumber(props.percent, 0, 100, 0))
const resolvedStatus = computed<ProgressStatus>(() => props.status ?? (normalizedPercent.value >= 100 ? 'success' : 'normal'))
const successPercent = computed(() => Math.min(normalizedPercent.value, clampNumber(props.success?.percent, 0, 100, 0)))
const stepCount = computed(() => Math.max(0, Math.floor(finiteNumber(props.steps, 0))))
const completedSteps = computed(() => Math.round((normalizedPercent.value / 100) * stepCount.value))
const successfulSteps = computed(() => Math.round((successPercent.value / 100) * stepCount.value))
const resolvedStrokeWidth = computed(() => {
  const fallback = props.type === 'line' ? lineStrokeWidths[props.size] : 8
  return clampNumber(props.strokeWidth, 1, props.type === 'line' ? 40 : 50, fallback)
})
const circleSize = computed(() => circleSizes[props.size])
const circleRadius = computed(() => 50 - resolvedStrokeWidth.value / 2)
const gapDegree = computed(() => (props.type === 'dashboard' ? clampNumber(props.gapDegree, 0, 295, 75) : 0))
const arcRatio = computed(() => (360 - gapDegree.value) / 360)
const railDashArray = computed(() => `${roundDash(arcRatio.value * 100)} ${roundDash((1 - arcRatio.value) * 100)}`)
const trackDashArray = computed(() => {
  const length = arcRatio.value * normalizedPercent.value
  return `${roundDash(length)} ${roundDash(100 - length)}`
})
const successDashArray = computed(() => {
  const length = arcRatio.value * successPercent.value
  return `${roundDash(length)} ${roundDash(100 - length)}`
})
const circleRotation = computed(() => {
  if (props.type !== 'dashboard') return -90
  const centers: Record<ProgressGapPlacement, number> = {
    top: -90,
    bottom: 90,
    start: 180,
    end: 0
  }
  return centers[props.gapPlacement] + gapDegree.value / 2
})
const circleTransform = computed(() => `rotate(${circleRotation.value} 50 50)`)
const gradient = computed<ProgressGradient | undefined>(() => (isGradient(props.strokeColor) ? props.strokeColor : undefined))
const plainStrokeColor = computed(() => (typeof props.strokeColor === 'string' ? props.strokeColor : undefined))
const formattedInfo = computed(() => props.format?.(normalizedPercent.value, successPercent.value))
const infoSlotProps = computed<ProgressInfoSlotProps>(() => ({
  percent: normalizedPercent.value,
  status: resolvedStatus.value,
  successPercent: successPercent.value
}))
const ariaValueText = computed(() => (formattedInfo.value === undefined ? `${normalizedPercent.value}%` : String(formattedInfo.value)))

const rootClass = computed(() => clsx('text-secondary', props.type === 'line' ? 'flex w-full min-w-0 items-center gap-2' : 'relative inline-flex shrink-0 items-center justify-center', getUiAttrClass(attrs), props.classNames?.root))
const railClass = computed(() => clsx(props.type === 'line' ? 'relative min-w-0 flex-1 overflow-hidden bg-tertiary' : 'fill-none stroke-[var(--color-bg-tertiary)]', props.type === 'line' && linecapClass.value, props.classNames?.rail))
const trackClass = computed(() =>
  clsx(
    props.type === 'line' ? 'absolute inset-y-0 left-0 transition-[width] duration-300 ease-out' : 'fill-none transition-[stroke-dasharray] duration-300 ease-out',
    props.type === 'line' ? statusTrackClasses[resolvedStatus.value] : statusStrokeClasses[resolvedStatus.value],
    props.type === 'line' && linecapClass.value,
    resolvedStatus.value === 'active' && props.type === 'line' && stepCount.value === 0 && 'progress-track-active overflow-hidden',
    props.classNames?.track
  )
)
const successClass = computed(() =>
  clsx(props.type === 'line' ? 'absolute inset-y-0 left-0 bg-green-500 transition-[width] duration-300 ease-out' : 'fill-none stroke-green-500 transition-[stroke-dasharray] duration-300 ease-out', props.type === 'line' && linecapClass.value, props.classNames?.success)
)
const infoClass = computed(() =>
  clsx(
    'inline-flex shrink-0 items-center justify-center font-medium tabular-nums',
    props.type === 'line' ? clsx('min-w-10 text-right', lineInfoHeightClasses[props.size]) : 'absolute inset-0 text-center',
    infoSizeClasses[props.size],
    resolvedStatus.value === 'success' && 'text-green-500',
    resolvedStatus.value === 'exception' && 'text-red-500',
    props.classNames?.info
  )
)
const linecapClass = computed(() => (props.strokeLinecap === 'round' ? 'rounded-full' : props.strokeLinecap === 'square' ? 'rounded-[1px]' : 'rounded-none'))

const rootStyle = computed<CSSProperties | undefined>(() =>
  props.type === 'line'
    ? undefined
    : {
        width: `${circleSize.value}px`,
        height: `${circleSize.value}px`
      }
)
const railStyle = computed<CSSProperties>(() => ({
  ...(props.type === 'line' ? { height: `${resolvedStrokeWidth.value}px` } : undefined),
  ...(props.railColor ? (props.type === 'line' ? { backgroundColor: props.railColor } : { stroke: props.railColor }) : undefined)
}))
const trackStyle = computed<CSSProperties>(() => ({
  ...(props.type === 'line' ? { width: `${normalizedPercent.value}%` } : undefined),
  ...resolveTrackStyle()
}))
const successStyle = computed<CSSProperties>(() => ({
  ...(props.type === 'line' ? { width: `${successPercent.value}%` } : undefined),
  ...(props.success?.strokeColor ? (props.type === 'line' ? { backgroundColor: props.success.strokeColor } : { stroke: props.success.strokeColor }) : undefined)
}))

function finiteNumber(value: number | undefined, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function clampNumber(value: number | undefined, min: number, max: number, fallback: number) {
  return Math.min(max, Math.max(min, finiteNumber(value, fallback)))
}

function roundDash(value: number) {
  return Number(value.toFixed(4))
}

function isGradient(value: ProgressStrokeColor | undefined): value is ProgressGradient {
  return typeof value === 'object' && !Array.isArray(value) && value !== null && typeof value.from === 'string' && typeof value.to === 'string'
}

function resolveTrackStyle(): CSSProperties {
  if (plainStrokeColor.value) return props.type === 'line' ? { backgroundColor: plainStrokeColor.value } : { stroke: plainStrokeColor.value }
  if (!gradient.value) return {}
  if (props.type === 'line') {
    return {
      backgroundImage: `linear-gradient(${gradient.value.direction || 'to right'}, ${gradient.value.from}, ${gradient.value.to})`
    }
  }
  return { stroke: `url(#${gradientId})` }
}

function getStepClass(index: number) {
  return clsx(
    'block min-w-0 flex-1 transition-colors duration-300',
    linecapClass.value,
    index < successfulSteps.value ? 'bg-green-500' : index < completedSteps.value ? statusTrackClasses[resolvedStatus.value] : 'bg-tertiary',
    index < successfulSteps.value ? props.classNames?.success : index < completedSteps.value ? props.classNames?.track : props.classNames?.rail
  )
}

function getStepStyle(index: number): CSSProperties {
  const colors = Array.isArray(props.strokeColor) ? props.strokeColor : undefined
  const completed = index < completedSteps.value
  const successful = index < successfulSteps.value
  return {
    height: `${resolvedStrokeWidth.value}px`,
    backgroundColor: successful ? props.success?.strokeColor : completed ? colors?.[index % colors.length] : props.railColor
  }
}

function getStepSemanticStyle(index: number) {
  if (index < successfulSteps.value) return normalizeStyle(props.styles?.success)
  if (index < completedSteps.value) return normalizeStyle(props.styles?.track)
  return normalizeStyle(props.styles?.rail)
}

function normalizeStyle(value: CSSProperties | string | undefined) {
  return value
}
</script>

<template>
  <div
    v-bind="exposeAttrs"
    data-ui-progress="true"
    :data-type="type"
    :data-status="resolvedStatus"
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="normalizedPercent"
    :aria-valuetext="ariaValueText"
    :class="rootClass"
    :style="[rootStyle, getUiAttrStyle(attrs), normalizeStyle(styles?.root)]"
  >
    <template v-if="type === 'line'">
      <div v-if="stepCount > 0" data-ui-progress-rail="true" class="flex min-w-0 flex-1" :style="{ gap: `${resolvedStrokeWidth <= 4 ? 2 : 3}px` }">
        <span v-for="index in stepCount" :key="index" data-ui-progress-step="true" :class="getStepClass(index - 1)" :style="[getStepStyle(index - 1), getStepSemanticStyle(index - 1)]"></span>
      </div>
      <div v-else data-ui-progress-rail="true" :class="railClass" :style="[railStyle, normalizeStyle(styles?.rail)]">
        <div data-ui-progress-track="true" :class="trackClass" :style="[trackStyle, normalizeStyle(styles?.track)]"></div>
        <div v-if="successPercent > 0" data-ui-progress-success="true" :class="successClass" :style="[successStyle, normalizeStyle(styles?.success)]"></div>
      </div>
    </template>

    <template v-else>
      <svg data-ui-progress-circle="true" class="block size-full" viewBox="0 0 100 100" aria-hidden="true">
        <defs v-if="gradient">
          <linearGradient :id="gradientId" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" :stop-color="gradient.from"></stop>
            <stop offset="100%" :stop-color="gradient.to"></stop>
          </linearGradient>
        </defs>
        <circle
          data-ui-progress-rail="true"
          cx="50"
          cy="50"
          :r="circleRadius"
          pathLength="100"
          :stroke-width="resolvedStrokeWidth"
          :stroke-linecap="strokeLinecap"
          :stroke-dasharray="railDashArray"
          :transform="circleTransform"
          :class="railClass"
          :style="[railStyle, normalizeStyle(styles?.rail)]"
        ></circle>
        <circle
          data-ui-progress-track="true"
          cx="50"
          cy="50"
          :r="circleRadius"
          pathLength="100"
          :stroke-width="resolvedStrokeWidth"
          :stroke-linecap="strokeLinecap"
          :stroke-dasharray="trackDashArray"
          :transform="circleTransform"
          :class="trackClass"
          :style="[trackStyle, normalizeStyle(styles?.track)]"
        ></circle>
        <circle
          v-if="successPercent > 0"
          data-ui-progress-success="true"
          cx="50"
          cy="50"
          :r="circleRadius"
          pathLength="100"
          :stroke-width="resolvedStrokeWidth"
          :stroke-linecap="strokeLinecap"
          :stroke-dasharray="successDashArray"
          :transform="circleTransform"
          :class="successClass"
          :style="[successStyle, normalizeStyle(styles?.success)]"
        ></circle>
      </svg>
    </template>

    <span v-if="showInfo" data-ui-progress-info="true" :class="infoClass" :style="normalizeStyle(styles?.info)">
      <slot name="info" v-bind="infoSlotProps">
        <span v-if="format !== undefined">{{ formattedInfo }}</span>
        <span v-else-if="resolvedStatus === 'success'" class="inline-flex size-4 items-center justify-center leading-none" :class="type === 'line' ? 'rounded-full bg-green-500 text-white' : 'text-green-500'" aria-hidden="true">
          <span class="i-lucide:check" :class="type === 'line' ? 'size-3' : 'size-4'"></span>
        </span>
        <span v-else-if="resolvedStatus === 'exception'" class="inline-flex size-4 items-center justify-center leading-none" :class="type === 'line' ? 'rounded-full bg-red-500 text-white' : 'text-red-500'" aria-hidden="true">
          <span class="i-lucide:x" :class="type === 'line' ? 'size-3' : 'size-4'"></span>
        </span>
        <span v-else>{{ normalizedPercent }}%</span>
      </slot>
    </span>
  </div>
</template>

<style scoped>
.progress-track-active::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgb(255 255 255 / 45%), transparent);
  content: '';
  transform: translateX(-100%);
  animation: progress-active 1.6s ease-in-out infinite;
}

@keyframes progress-active {
  to {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .progress-track-active::after {
    animation: none;
  }
}
</style>
