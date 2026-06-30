<template>
  <section class="rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">概览</h2>
      <p class="mt-1 text-xs text-tertiary">按左侧目录进入单个组件页面，组件示例会随路由按需加载。</p>
    </div>
    <div class="grid gap-4 p-4 lg:grid-cols-3">
      <RouterLink v-for="item in overviewItems" :key="item.path" :to="item.path" class="rounded-md border border-medium bg-secondary/40 p-4 transition-colors hover:border-brand-400 hover:bg-secondary">
        <div class="flex items-center gap-2 text-sm font-bold text-secondary">
          <span :class="item.icon" class="size-4"></span>
          {{ item.label }}
        </div>
        <p class="mt-2 text-xs leading-5 text-tertiary">{{ item.description }}</p>
      </RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
const overviewItems = [
  { label: '基础样式', path: '/ui/palette', icon: 'i-lucide:palette', description: '查看配色、语义色和色阶覆盖。' },
  { label: '基础输入', path: '/ui/input', icon: 'i-lucide:text-cursor-input', description: '查看 Input、InputOtp、DatePicker、ColorPicker、Form、Checkbox、Radio、Rate、Slider、Switch 等输入控件。' },
  { label: '验证码输入', path: '/ui/input-otp', icon: 'i-lucide:binary', description: '查看 InputOtp 的尺寸、校验态、只读禁用和隐藏字段行为。' },
  { label: '操作控件', path: '/ui/button', icon: 'i-lucide:mouse-pointer-click', description: '查看 Button、Dropdown、Select、Pagination 等操作组件。' },
  { label: '内容展示', path: '/ui/badge', icon: 'i-lucide:badge', description: '查看 Badge、Tag、MillerColumns、Table、Skeleton 等展示组件。' },
  { label: '层级浏览', path: '/ui/millercolumns', icon: 'i-lucide:columns-3', description: '查看 MillerColumns 的多列路径选择、详情面板和拖拽排序。' },
  { label: '导航切换', path: '/ui/tab', icon: 'i-lucide:panel-top', description: '查看 Tab 的类型、位置和编辑交互。' },
  { label: '反馈浮层', path: '/ui/alert', icon: 'i-lucide:panels-top-left', description: '查看 Alert、Tooltip、Popconfirm、Modal、Drawer、Message 的反馈效果。' }
]
</script>
