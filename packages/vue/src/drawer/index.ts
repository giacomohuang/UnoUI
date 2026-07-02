import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import type { ComputedRef, InjectionKey } from 'vue'

export { default as Drawer } from './Drawer.vue'

/** DrawerDirection 是抽屉弹出方向，命名兼容 Element Plus。 */
export type DrawerDirection = 'rtl' | 'ltr' | 'ttb' | 'btt'

/** DrawerPushDistance 是多层 Drawer 推动父级抽屉的距离。 */
export type DrawerPushDistance = number | string

/** DrawerPush 控制多层 Drawer 打开时父级抽屉是否被推动。 */
export type DrawerPush = boolean | { distance?: DrawerPushDistance }

export interface DrawerContext {
  pushDistance: ComputedRef<DrawerPushDistance>
  push: (id: symbol) => void
  pull: (id: symbol) => void
}

export const drawerContextKey: InjectionKey<DrawerContext> = Symbol('ui-drawer-context')

/** drawerPanel 定义 Drawer 面板基础位置和布局。 */
export const drawerPanel = cva('fixed z-10 flex bg-white/95 shadow-2xl backdrop-blur-md dark:bg-zinc-900/95', {
  variants: {
    direction: {
      rtl: 'inset-y-0 right-0 flex-col border-l border-white/20 dark:border-zinc-800/50',
      ltr: 'inset-y-0 left-0 flex-col border-r border-white/20 dark:border-zinc-800/50',
      ttb: 'inset-x-0 top-0 flex-col border-b border-white/20 dark:border-zinc-800/50',
      btt: 'inset-x-0 bottom-0 flex-col border-t border-white/20 dark:border-zinc-800/50'
    }
  },
  defaultVariants: {
    direction: 'rtl'
  }
})

/** DrawerProps 是 drawerPanel 变体推导出的组件属性类型。 */
export type DrawerProps = VariantProps<typeof drawerPanel>
