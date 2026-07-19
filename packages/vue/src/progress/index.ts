import type { CSSProperties } from 'vue'

export { default as Progress } from './Progress.vue'

export type ProgressType = 'line' | 'circle' | 'dashboard'
export type ProgressStatus = 'normal' | 'active' | 'success' | 'exception'
export type ProgressSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
export type ProgressStrokeLinecap = 'round' | 'butt' | 'square'
export type ProgressGapPlacement = 'top' | 'bottom' | 'start' | 'end'
export type ProgressSemanticName = 'root' | 'rail' | 'track' | 'success' | 'info'
export type ProgressSemanticClassNames = Partial<Record<ProgressSemanticName, string>>
export type ProgressSemanticStyles = Partial<Record<ProgressSemanticName, CSSProperties | string>>

export interface ProgressGradient {
  from: string
  to: string
  direction?: string
}

export interface ProgressSuccess {
  percent: number
  strokeColor?: string
}

export interface ProgressInfoSlotProps {
  percent: number
  status: ProgressStatus
  successPercent: number
}

export type ProgressStrokeColor = string | string[] | ProgressGradient
export type ProgressFormat = (percent: number, successPercent: number) => string | number
