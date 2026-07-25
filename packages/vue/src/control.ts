export const controlSizeClasses = {
  sm: 'text-sm/5 py-1',
  md: 'text-base/4 py-2',
  lg: 'text-lg/5 py-2'
} as const

export type ControlSize = keyof typeof controlSizeClasses
