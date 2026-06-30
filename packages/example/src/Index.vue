<template>
  <main class="h-screen overflow-hidden bg-secondary px-6 py-6 text-primary">
    <div class="mx-auto grid h-full max-w-[1680px] grid-rows-[auto_minmax(0,1fr)] gap-6 xl:grid-cols-[240px_minmax(0,1fr)] xl:grid-rows-none">
      <aside class="min-w-0 xl:min-h-0">
        <nav class="max-h-[30vh] overflow-y-auto rounded-lg border border-medium bg-primary p-3 xl:h-full xl:max-h-none">
          <div class="mb-2 px-3 text-sm font-bold uppercase text-tertiary">目录</div>
          <RouterLink v-for="item in showcaseIndex" :key="item.slug" :to="item.path" class="flex h-9 items-center rounded px-3 text-base text-secondary transition-colors hover:bg-secondary hover:text-brand" :class="item.slug === currentPage.slug ? 'bg-secondary text-brand' : ''">
            {{ item.label }}
          </RouterLink>
        </nav>
      </aside>

      <div ref="contentScrollRef" class="min-h-0 overflow-y-auto pr-1">
        <div class="flex min-w-0 flex-col gap-6 pb-6">
          <header class="flex flex-wrap items-end justify-between gap-4 border-b border-medium pb-5">
            <div class="flex flex-wrap items-center gap-3">
              <h1 class="text-2xl font-bold">{{ currentPage.label }}</h1>
            </div>
            <div class="flex flex-wrap items-center justify-end gap-3">
              <ButtonGroup>
                <Button size="sm" :variant="store.theme === 'light' ? 'default' : 'outline'" icon="i-lucide:sun" @click="store.changeTheme('light')">Light</Button>
                <Button size="sm" :variant="store.theme === 'dark' ? 'default' : 'outline'" icon="i-lucide:moon-star" @click="store.changeTheme('dark')">Dark</Button>
              </ButtonGroup>
            </div>
          </header>

          <component :is="currentPage.component" :key="currentPage.slug" />
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, ref, watch, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { Button, ButtonGroup } from '@unoui/vue/button'
import { useThemeStore } from './theme'

interface ShowcaseNavItem {
  slug: string
  label: string
  path: string
  component: Component
}

const store = useThemeStore()
const route = useRoute()
const router = useRouter()
const contentScrollRef = ref<HTMLElement | null>(null)

const showcaseIndex: ShowcaseNavItem[] = [
  { slug: 'overview', label: 'Overview 概览', path: '/ui', component: defineAsyncComponent(() => import('./Overview.vue')) },
  { slug: 'palette', label: 'Palette 配色', path: '/ui/palette', component: defineAsyncComponent(() => import('./Palette.vue')) },
  { slug: 'button', label: 'Button 按钮', path: '/ui/button', component: defineAsyncComponent(() => import('./Button.vue')) },
  { slug: 'input', label: 'Input 输入框', path: '/ui/input', component: defineAsyncComponent(() => import('./Input.vue')) },
  { slug: 'input-otp', label: 'InputOtp 验证码', path: '/ui/input-otp', component: defineAsyncComponent(() => import('./InputOtp.vue')) },
  { slug: 'datepicker', label: 'DatePicker 日期选择器', path: '/ui/datepicker', component: defineAsyncComponent(() => import('./DatePicker.vue')) },
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
