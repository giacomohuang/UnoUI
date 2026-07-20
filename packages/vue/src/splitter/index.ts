import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

export { default as Splitter } from './Splitter.vue'
export { default as SplitterPanel } from './SplitterPanel.vue'

export type SplitterOrientation = 'horizontal' | 'vertical'
export type SplitterSize = number | string
export type SplitterCollapsibleIconMode = boolean | 'auto'

export interface SplitterCollapsibleOptions {
  motion?: boolean
}

export interface SplitterPanelCollapsibleOptions {
  start?: boolean
  end?: boolean
  showCollapsibleIcon?: SplitterCollapsibleIconMode
}

export type SplitterPanelCollapsible = boolean | SplitterPanelCollapsibleOptions

/** splitterRoot 定义分割面板的主轴方向和基础容器约束。 */
export const splitterRoot = cva('relative flex min-h-0 min-w-0 overflow-hidden bg-primary text-primary', {
  variants: {
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col'
    }
  },
  defaultVariants: {
    orientation: 'horizontal'
  }
})

/** splitterPanel 定义面板内容的滚动和收缩边界。 */
export const splitterPanel = cva('relative min-h-0 min-w-0 overflow-auto', {
  variants: {
    collapsed: {
      true: 'overflow-hidden',
      false: ''
    }
  },
  defaultVariants: {
    collapsed: false
  }
})

/** splitterBar 扩大分隔线的拖拽命中区域，但不占用面板布局尺寸。 */
export const splitterBar = cva('group/ui-splitter-bar pointer-events-none absolute z-20', {
  variants: {
    orientation: {
      horizontal: 'inset-y-0 w-3 -translate-x-1/2',
      vertical: 'inset-x-0 h-3 -translate-y-1/2'
    }
  },
  defaultVariants: {
    orientation: 'horizontal'
  }
})

/** splitterDragger 定义可聚焦的 separator 命中区和光标状态。 */
export const splitterDragger = cva('group/ui-splitter-dragger pointer-events-auto absolute inset-0 touch-none select-none outline-none', {
  variants: {
    orientation: {
      horizontal: 'cursor-col-resize',
      vertical: 'cursor-row-resize'
    },
    resizable: {
      true: '',
      false: 'cursor-default'
    }
  },
  defaultVariants: {
    orientation: 'horizontal',
    resizable: true
  }
})

/** splitterLine 定义分隔线默认、悬浮、聚焦和拖拽状态。 */
export const splitterLine = cva('pointer-events-none absolute bg-zinc-200 transition-[background-color,width,height] duration-150 dark:bg-zinc-700', {
  variants: {
    orientation: {
      horizontal: 'inset-y-0 left-1/2 w-px -translate-x-1/2',
      vertical: 'inset-x-0 top-1/2 h-px -translate-y-1/2'
    },
    active: {
      true: 'bg-brand-500 dark:bg-brand-400',
      false: 'group-hover/ui-splitter-dragger:bg-brand-400 group-focus-visible/ui-splitter-dragger:bg-brand-500 dark:group-hover/ui-splitter-dragger:bg-brand-400'
    },
    resizable: {
      true: '',
      false: 'bg-zinc-200 opacity-70 dark:bg-zinc-700'
    }
  },
  compoundVariants: [
    { orientation: 'horizontal', active: true, class: 'w-0.5' },
    { orientation: 'vertical', active: true, class: 'h-0.5' }
  ],
  defaultVariants: {
    orientation: 'horizontal',
    active: false,
    resizable: true
  }
})

export type SplitterRootProps = VariantProps<typeof splitterRoot>
