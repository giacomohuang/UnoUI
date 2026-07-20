<template>
  <main class="h-screen overflow-hidden bg-secondary text-primary">
    <div class="flex h-full min-h-0 flex-col">
      <header class="shrink-0 border-b border-medium bg-primary/90 backdrop-blur-xl">
        <div class="mx-auto flex min-h-16 max-w-[1680px] flex-wrap items-center justify-between gap-4 px-6 py-3">
          <RouterLink to="/ui" class="group flex min-w-0 items-center gap-3">
            <span class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-brand-500/30 bg-brand-500/10 text-brand-500 shadow-[0_14px_30px_-18px_brand-500] transition-colors group-hover:border-brand-400/60 group-hover:bg-brand-500/15">
              <UnoUILogo class="size-8" />
            </span>
            <span class="min-w-0">
              <span class="block text-lg font-black text-primary">UnoUI</span>
              <span class="block truncate text-xs font-medium text-tertiary">Vue + UnoCSS component system</span>
            </span>
          </RouterLink>

          <div class="flex min-w-0 items-center justify-end gap-3">
            <span class="hidden max-w-52 truncate rounded border border-medium bg-secondary px-2.5 py-1.5 text-xs font-medium text-tertiary lg:inline-flex">
              {{ currentPage.label }}
            </span>
            <a
              href="https://github.com/giacomohuang/UnoUI"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="打开 UnoUI GitHub 仓库"
              class="inline-flex shrink-0 items-center justify-center rounded-md border border-medium bg-primary p-1.5 text-secondary transition-colors hover:border-brand-400/70 hover:bg-secondary hover:text-brand"
            >
              <span class="i-lucide:github size-4"></span>
            </a>
            <ButtonGroup>
              <Button size="sm" :variant="store.theme === 'light' ? 'default' : 'outline'" icon="i-lucide:sun" @click="store.changeTheme('light')">Light</Button>
              <Button size="sm" :variant="store.theme === 'dark' ? 'default' : 'outline'" icon="i-lucide:moon-star" @click="store.changeTheme('dark')">Dark</Button>
            </ButtonGroup>
          </div>
        </div>
      </header>

      <div class="mx-auto grid min-h-0 w-full max-w-[1680px] flex-1 grid-rows-[auto_minmax(0,1fr)] gap-6 px-6 py-6 xl:grid-cols-[240px_minmax(0,1fr)] xl:grid-rows-none">
        <aside class="min-w-0 xl:min-h-0">
          <nav class="flex max-w-full items-stretch gap-4 overflow-x-auto rounded-lg border border-medium bg-primary p-3 xl:block xl:h-full xl:max-h-none xl:overflow-y-auto">
            <div class="flex shrink-0 items-center gap-2 px-3 text-sm font-bold text-tertiary xl:mb-3">
              <span class="i-lucide:list-tree size-4"></span>
              <span>组件目录</span>
            </div>
            <div v-for="group in showcaseGroups" :key="group.title" class="flex shrink-0 items-stretch gap-2 xl:block xl:shrink xl:pb-3">
              <div class="flex shrink-0 items-center gap-2 px-3 text-xs font-bold text-tertiary xl:mb-1 xl:mt-3">
                <span :class="group.icon" class="size-4"></span>
                <span>{{ group.title }}</span>
              </div>
              <RouterLink v-for="item in group.items" :key="item.slug" :to="item.path" class="flex h-9 shrink-0 items-center rounded px-3 text-sm font-medium text-secondary transition-colors hover:bg-secondary hover:text-brand xl:shrink" :class="item.slug === currentPage.slug ? 'bg-secondary text-brand' : ''">
                {{ item.label }}
              </RouterLink>
            </div>
          </nav>
        </aside>

        <div ref="contentScrollRef" class="min-h-0 overflow-y-auto pr-1">
          <div class="flex min-w-0 flex-col gap-6 pb-6">
            <header v-if="currentPage.slug !== 'overview'" class="flex flex-wrap items-end justify-between gap-4 border-b border-medium pb-5">
              <div class="flex min-w-0 flex-col gap-1">
                <h1 class="truncate text-2xl font-bold">{{ currentPage.label }}</h1>
                <p class="text-sm text-tertiary">组件示例、API 参数和可复制代码集中在当前页面。</p>
              </div>
            </header>

            <component :is="currentPage.component" :key="currentPage.slug" />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, ref, watch, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { Button, ButtonGroup } from '@mcistudio/unoui-vue/button'
import UnoUILogo from '@/components/UnoUILogo.vue'
import { useThemeStore } from './theme'

interface ShowcaseNavItem {
  slug: string
  label: string
  path: string
  component: Component
}

interface ShowcaseNavGroup {
  title: string
  icon: string
  items: ShowcaseNavItem[]
}

const store = useThemeStore()
const route = useRoute()
const router = useRouter()
const contentScrollRef = ref<HTMLElement | null>(null)

const showcaseIndex: ShowcaseNavItem[] = [
  { slug: 'overview', label: 'Overview 概览', path: '/ui', component: defineAsyncComponent(() => import('./Overview.vue')) },
  { slug: 'palette', label: 'Palette 配色', path: '/ui/palette', component: defineAsyncComponent(() => import('./Palette.vue')) },
  { slug: 'splitter', label: 'Splitter 分隔面板', path: '/ui/splitter', component: defineAsyncComponent(() => import('./Splitter.vue')) },
  { slug: 'button', label: 'Button 按钮', path: '/ui/button', component: defineAsyncComponent(() => import('./Button.vue')) },
  { slug: 'input', label: 'Input 输入框', path: '/ui/input', component: defineAsyncComponent(() => import('./Input.vue')) },
  { slug: 'input-otp', label: 'InputOtp 验证码', path: '/ui/input-otp', component: defineAsyncComponent(() => import('./InputOtp.vue')) },
  { slug: 'datepicker', label: 'DatePicker 日期选择器', path: '/ui/datepicker', component: defineAsyncComponent(() => import('./DatePicker.vue')) },
  { slug: 'timepicker', label: 'TimePicker 时间选择器', path: '/ui/timepicker', component: defineAsyncComponent(() => import('./TimePicker.vue')) },
  { slug: 'colorpicker', label: 'ColorPicker 取色器', path: '/ui/colorpicker', component: defineAsyncComponent(() => import('./ColorPicker.vue')) },
  { slug: 'form', label: 'Form 表单', path: '/ui/form', component: defineAsyncComponent(() => import('./Form.vue')) },
  { slug: 'checkbox', label: 'Checkbox 复选框', path: '/ui/checkbox', component: defineAsyncComponent(() => import('./Checkbox.vue')) },
  { slug: 'radio', label: 'Radio 单选框', path: '/ui/radio', component: defineAsyncComponent(() => import('./Radio.vue')) },
  { slug: 'rate', label: 'Rate 评分', path: '/ui/rate', component: defineAsyncComponent(() => import('./Rate.vue')) },
  { slug: 'slider', label: 'Slider 滑动输入条', path: '/ui/slider', component: defineAsyncComponent(() => import('./Slider.vue')) },
  { slug: 'switch', label: 'Switch 开关', path: '/ui/switch', component: defineAsyncComponent(() => import('./Switch.vue')) },
  { slug: 'alert', label: 'Alert 警告提示', path: '/ui/alert', component: defineAsyncComponent(() => import('./Alert.vue')) },
  { slug: 'badge', label: 'Badge 徽标', path: '/ui/badge', component: defineAsyncComponent(() => import('./Badge.vue')) },
  { slug: 'qrcode', label: 'QRCode 二维码', path: '/ui/qrcode', component: defineAsyncComponent(() => import('./QRCode.vue')) },
  { slug: 'tag', label: 'Tag 标签', path: '/ui/tag', component: defineAsyncComponent(() => import('./Tag.vue')) },
  { slug: 'tab', label: 'Tab 标签页', path: '/ui/tab', component: defineAsyncComponent(() => import('./Tab.vue')) },
  { slug: 'modal', label: 'Modal 弹窗', path: '/ui/modal', component: defineAsyncComponent(() => import('./Modal.vue')) },
  { slug: 'select', label: 'Select 选择器', path: '/ui/select', component: defineAsyncComponent(() => import('./Select.vue')) },
  { slug: 'pagination', label: 'Pagination 分页', path: '/ui/pagination', component: defineAsyncComponent(() => import('./Pagination.vue')) },
  { slug: 'progress', label: 'Progress 进度条', path: '/ui/progress', component: defineAsyncComponent(() => import('./Progress.vue')) },
  { slug: 'drawer', label: 'Drawer 抽屉', path: '/ui/drawer', component: defineAsyncComponent(() => import('./Drawer.vue')) },
  { slug: 'message', label: 'Message 消息提示', path: '/ui/message', component: defineAsyncComponent(() => import('./Message.vue')) },
  { slug: 'tooltip', label: 'Tooltip 文字提示', path: '/ui/tooltip', component: defineAsyncComponent(() => import('./Tooltip.vue')) },
  { slug: 'popconfirm', label: 'Popconfirm 气泡确认', path: '/ui/popconfirm', component: defineAsyncComponent(() => import('./Popconfirm.vue')) },
  { slug: 'dropdown', label: 'Dropdown 下拉菜单', path: '/ui/dropdown', component: defineAsyncComponent(() => import('./Dropdown.vue')) },
  { slug: 'skeleton', label: 'Skeleton 骨架屏', path: '/ui/skeleton', component: defineAsyncComponent(() => import('./Skeleton.vue')) },
  { slug: 'millercolumns', label: 'MillerColumns 层级列', path: '/ui/millercolumns', component: defineAsyncComponent(() => import('./MillerColumns.vue')) },
  { slug: 'table', label: 'Table 表格', path: '/ui/table', component: defineAsyncComponent(() => import('./Table.vue')) }
]

const componentPageMap = new Map(showcaseIndex.map((item) => [item.slug, item]))
const pickShowcaseItems = (slugs: string[]) => slugs.map((slug) => componentPageMap.get(slug)).filter((item): item is ShowcaseNavItem => Boolean(item))

const showcaseGroups: ShowcaseNavGroup[] = [
  { title: '概览', icon: 'i-lucide:home', items: pickShowcaseItems(['overview', 'palette']) },
  { title: '布局', icon: 'i-lucide:panels-top-left', items: pickShowcaseItems(['splitter']) },
  { title: '基础输入', icon: 'i-lucide:text-cursor-input', items: pickShowcaseItems(['input', 'input-otp', 'select', 'datepicker', 'timepicker', 'colorpicker', 'form', 'checkbox', 'radio', 'switch', 'slider', 'rate']) },
  { title: '操作导航', icon: 'i-lucide:mouse-pointer-click', items: pickShowcaseItems(['button', 'dropdown', 'tab', 'pagination']) },
  { title: '反馈浮层', icon: 'i-lucide:message-square-warning', items: pickShowcaseItems(['alert', 'message', 'tooltip', 'popconfirm', 'modal', 'drawer']) },
  { title: '数据展示', icon: 'i-lucide:table-2', items: pickShowcaseItems(['badge', 'tag', 'progress', 'qrcode', 'skeleton', 'millercolumns', 'table']) }
]

const overviewPage = showcaseIndex[0]

const routeComponentSlug = computed(() => {
  const value = route.params.component
  if (Array.isArray(value)) return value[0] ?? 'overview'
  return value || 'overview'
})
const currentPage = computed(() => componentPageMap.get(routeComponentSlug.value) ?? overviewPage)

watch(
  routeComponentSlug,
  (slug) => {
    if (!componentPageMap.has(slug)) router.replace('/ui')
  },
  { immediate: true }
)

watch(currentPage, async () => {
  await nextTick()
  contentScrollRef.value?.scrollTo({ top: 0 })
})
</script>
