import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import type { ComputedRef, InjectionKey, Slots } from 'vue'

export { default as TabPane } from './TabPane.vue'
export { default as Tabs } from './Tabs.vue'

export type TabValue = string | number
export type TabsType = 'line' | 'card' | 'border-card'
export type TabPosition = 'top' | 'right' | 'bottom' | 'left'
export type TabsBeforeLeave = (newValue: TabValue, oldValue: TabValue | undefined) => boolean | void | Promise<boolean | void>
export type TabsEditAction = 'add' | 'remove'

export interface RegisteredTabPane {
  uid: number
  order: number
  name: TabValue
  label?: string
  disabled: boolean
  closable: boolean
  lazy: boolean
  slots: Slots
}

export interface TabPanePublic {
  name: TabValue
  label?: string
  disabled: boolean
  closable: boolean
  lazy: boolean
  index: number
}

export interface TabsContext {
  activeValue: ComputedRef<TabValue | undefined>
  registerPane: (pane: RegisteredTabPane) => void
  updatePane: (uid: number, pane: RegisteredTabPane) => void
  unregisterPane: (uid: number) => void
  getTabId: (name: TabValue) => string
  getPanelId: (name: TabValue) => string
}

/** tabsContextKey 连接 Tabs 与 TabPane，避免业务层手动维护导航项。 */
export const tabsContextKey: InjectionKey<TabsContext> = Symbol('ui-tabs-context')

/** tabsRoot 定义 Tabs 根布局，支持顶部、底部、左右侧标签栏。 */
export const tabsRoot = cva('min-w-0 text-primary', {
  variants: {
    type: {
      line: '',
      card: '',
      'border-card': 'overflow-hidden rounded-md border border-medium bg-primary'
    },
    tabPosition: {
      top: 'flex flex-col',
      bottom: 'flex flex-col',
      left: 'flex flex-row',
      right: 'flex flex-row'
    }
  },
  defaultVariants: {
    type: 'line',
    tabPosition: 'top'
  }
})

/** tabsHeader 定义标签栏边界和 border-card 背景。 */
export const tabsHeader = cva('relative shrink-0', {
  variants: {
    type: {
      line: '',
      card: '',
      'border-card': 'bg-secondary/60'
    },
    tabPosition: {
      top: 'border-b border-medium',
      bottom: 'order-2 border-t border-medium',
      left: 'border-r border-medium',
      right: 'order-2 border-l border-medium'
    }
  },
  defaultVariants: {
    type: 'line',
    tabPosition: 'top'
  }
})

/** tabsNav 定义标签按钮排列方向。 */
export const tabsNav = cva('relative flex min-w-0', {
  variants: {
    tabPosition: {
      top: 'flex-row',
      bottom: 'flex-row',
      left: 'flex-col',
      right: 'flex-col'
    }
  },
  defaultVariants: {
    tabPosition: 'top'
  }
})

/** tabTrigger 定义单个标签按钮的类型、位置、尺寸和状态样式。 */
export const tabTrigger = cva('relative inline-flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap border border-transparent font-medium outline-none transition-[color] duration-150 focus-visible:(ring-2 ring-brand-400 ring-offset-1 ring-offset-primary)', {
  variants: {
    type: {
      line: '',
      card: '',
      'border-card': ''
    },
    tabPosition: {
      top: '',
      bottom: '',
      left: '',
      right: ''
    },
    size: {
      sm: 'h-8 pl-[var(--ui-tab-pl,var(--ui-tab-px))] pr-[var(--ui-tab-pr,var(--ui-tab-px))] pt-[var(--ui-tab-pt,var(--ui-tab-py))] pb-[var(--ui-tab-pb,var(--ui-tab-py))] text-xs/5 [--ui-tab-px:0.75rem] [--ui-tab-py:0rem]',
      md: 'h-10 pl-[var(--ui-tab-pl,var(--ui-tab-px))] pr-[var(--ui-tab-pr,var(--ui-tab-px))] pt-[var(--ui-tab-pt,var(--ui-tab-py))] pb-[var(--ui-tab-pb,var(--ui-tab-py))] text-sm/5 [--ui-tab-px:1rem] [--ui-tab-py:0rem]',
      lg: 'h-12 pl-[var(--ui-tab-pl,var(--ui-tab-px))] pr-[var(--ui-tab-pr,var(--ui-tab-px))] pt-[var(--ui-tab-pt,var(--ui-tab-py))] pb-[var(--ui-tab-pb,var(--ui-tab-py))] text-base/6 [--ui-tab-px:1.25rem] [--ui-tab-py:0rem]'
    },
    active: {
      true: '',
      false: ''
    },
    disabled: {
      true: 'cursor-not-allowed text-tertiary opacity-50',
      false: 'cursor-pointer'
    },
    stretch: {
      true: 'flex-1',
      false: ''
    },
    first: {
      true: '',
      false: ''
    },
    last: {
      true: '',
      false: ''
    }
  },
  compoundVariants: [
    { active: false, disabled: false, class: 'text-secondary hover:(bg-secondary/70 text-brand-500)' },
    { active: true, disabled: false, class: 'text-brand-500 dark:text-brand-400' },
    { type: 'line', tabPosition: 'top', active: true, class: '-mb-px after:(content-empty absolute inset-x-0 -bottom-px h-0.5 bg-brand-500)' },
    { type: 'line', tabPosition: 'bottom', active: true, class: '-mt-px after:(content-empty absolute inset-x-0 -top-px h-0.5 bg-brand-500)' },
    { type: 'line', tabPosition: 'left', active: true, class: '-mr-px after:(content-empty absolute inset-y-0 -right-px w-0.5 bg-brand-500)' },
    { type: 'line', tabPosition: 'right', active: true, class: '-ml-px after:(content-empty absolute inset-y-0 -left-px w-0.5 bg-brand-500)' },
    { type: 'card', tabPosition: 'top', class: '-ml-px border-medium border-b-0' },
    { type: 'card', tabPosition: 'bottom', class: '-ml-px border-medium border-t-0' },
    { type: 'card', tabPosition: 'left', class: '-mt-px border-medium border-r-0' },
    { type: 'card', tabPosition: 'right', class: '-mt-px border-medium border-l-0' },
    { type: 'card', tabPosition: 'top', first: true, class: 'ml-0 rounded-tl-md' },
    { type: 'card', tabPosition: 'top', last: true, class: 'rounded-tr-md' },
    { type: 'card', tabPosition: 'bottom', first: true, class: 'ml-0 rounded-bl-md' },
    { type: 'card', tabPosition: 'bottom', last: true, class: 'rounded-br-md' },
    { type: 'card', tabPosition: 'left', first: true, class: 'mt-0 rounded-tl-md' },
    { type: 'card', tabPosition: 'left', last: true, class: 'rounded-bl-md' },
    { type: 'card', tabPosition: 'right', first: true, class: 'mt-0 rounded-tr-md' },
    { type: 'card', tabPosition: 'right', last: true, class: 'rounded-br-md' },
    { type: 'card', tabPosition: 'top', active: true, class: 'z-1 -mb-px bg-primary after:(content-empty absolute inset-x-0 -bottom-px h-px bg-primary)' },
    { type: 'card', tabPosition: 'bottom', active: true, class: 'z-1 -mt-px bg-primary after:(content-empty absolute inset-x-0 -top-px h-px bg-primary)' },
    { type: 'card', tabPosition: 'left', active: true, class: 'z-1 -mr-px bg-primary after:(content-empty absolute inset-y-0 -right-px w-px bg-primary)' },
    { type: 'card', tabPosition: 'right', active: true, class: 'z-1 -ml-px bg-primary after:(content-empty absolute inset-y-0 -left-px w-px bg-primary)' },
    { type: 'card', active: false, disabled: false, class: 'bg-secondary/50 hover:bg-secondary/70' },
    { type: 'border-card', active: true, class: 'bg-primary text-brand-500 dark:text-brand-400' },
    { type: 'border-card', tabPosition: 'top', active: true, class: 'z-1 -mb-px border-x border-y-0 border-medium' },
    { type: 'border-card', tabPosition: 'bottom', active: true, class: 'z-1 -mt-px border-x border-y-0 border-medium' },
    { type: 'border-card', tabPosition: 'left', active: true, class: 'z-1 -mr-px border-x-0 border-y border-medium [--ui-tab-pl:calc(var(--ui-tab-px)+1px)] [--ui-tab-pr:calc(var(--ui-tab-px)+1px)]' },
    { type: 'border-card', tabPosition: 'right', active: true, class: 'z-1 -ml-px border-x-0 border-y border-medium [--ui-tab-pl:calc(var(--ui-tab-px)+1px)] [--ui-tab-pr:calc(var(--ui-tab-px)+1px)]' },
    { type: 'border-card', tabPosition: 'top', active: true, first: true, class: 'border-l-0 [--ui-tab-pl:calc(var(--ui-tab-px)+1px)]' },
    { type: 'border-card', tabPosition: 'bottom', active: true, first: true, class: 'border-l-0 [--ui-tab-pl:calc(var(--ui-tab-px)+1px)]' },
    { type: 'border-card', tabPosition: 'left', active: true, first: true, class: 'border-t-0 [--ui-tab-pt:calc(var(--ui-tab-py)+1px)]' },
    { type: 'border-card', tabPosition: 'right', active: true, first: true, class: 'border-t-0 [--ui-tab-pt:calc(var(--ui-tab-py)+1px)]' },
    { type: 'border-card', active: false, disabled: false, class: 'text-secondary hover:bg-primary/80' }
  ],
  defaultVariants: {
    type: 'line',
    tabPosition: 'top',
    size: 'md',
    active: false,
    disabled: false,
    stretch: false,
    first: false,
    last: false
  }
})

/** tabAddButton 定义 addable/editable 模式下的新增标签按钮。 */
export const tabAddButton = cva('inline-flex shrink-0 items-center justify-center border border-transparent text-tertiary outline-none transition-colors duration-150 hover:(bg-secondary text-brand-500) focus-visible:(ring-2 ring-brand-400 ring-offset-1 ring-offset-primary)', {
  variants: {
    tabPosition: {
      top: '',
      bottom: '',
      left: '',
      right: ''
    },
    size: {
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-12 w-12 text-lg'
    }
  },
  defaultVariants: {
    tabPosition: 'top',
    size: 'md'
  }
})

/** tabsContent 定义标签内容区域留白和方向布局。 */
export const tabsContent = cva('min-w-0 flex-1', {
  variants: {
    type: {
      line: '',
      card: '',
      'border-card': 'bg-primary'
    },
    tabPosition: {
      top: 'pt-4',
      bottom: 'order-1 pb-4',
      left: 'pl-4',
      right: 'order-1 pr-4'
    },
    padded: {
      true: '',
      false: 'p-0!'
    }
  },
  compoundVariants: [
    { type: 'border-card', tabPosition: 'top', padded: true, class: 'p-4' },
    { type: 'border-card', tabPosition: 'bottom', padded: true, class: 'p-4' },
    { type: 'border-card', tabPosition: 'left', padded: true, class: 'p-4' },
    { type: 'border-card', tabPosition: 'right', padded: true, class: 'p-4' }
  ],
  defaultVariants: {
    type: 'line',
    tabPosition: 'top',
    padded: true
  }
})

/** tabPanel 定义每个 TabPane 的内容容器。 */
export const tabPanel = cva('min-w-0 text-sm/6 text-secondary outline-none', {
  variants: {
    active: {
      true: '',
      false: ''
    }
  },
  defaultVariants: {
    active: false
  }
})

export type TabsProps = VariantProps<typeof tabTrigger>
