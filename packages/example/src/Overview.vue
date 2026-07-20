<template>
  <div class="flex min-w-0 flex-col gap-8">
    <section class="relative overflow-hidden rounded-lg border border-medium bg-primary">
      <div class="grid gap-7 p-6 lg:p-8">
        <div class="grid min-w-0 gap-6">
          <div class="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-4">
                <span class="flex size-20 shrink-0 items-center justify-center rounded-lg border border-brand-500/30 bg-brand-500/10 text-brand-500 shadow-[0_24px_60px_-36px_brand-500]">
                  <UnoUILogo class="size-16" />
                </span>
                <div class="min-w-0">
                  <div class="text-3xl font-black leading-none text-primary">UnoUI</div>
                  <div class="mt-2 text-sm font-bold text-brand-500">Vue + UnoCSS component system</div>
                </div>
              </div>
              <h1 class="mt-6 max-w-4xl text-4xl font-black leading-tight text-primary md:text-5xl">Composable admin interfaces, built with UnoCSS</h1>
              <p class="mt-5 max-w-3xl text-base leading-7 text-secondary">UnoUI 把主题令牌、表单控件、数据展示和反馈浮层收束成一套清晰的 Vue 组件系统，用于快速构建克制、稳定、可复用的后台界面。</p>
            </div>

            <div class="flex flex-wrap items-center gap-3 xl:justify-end">
              <Button size="lg" icon="i-lucide:rocket" @click="router.push('/ui/button')">浏览组件</Button>
              <Button size="lg" variant="outline" icon="i-lucide:palette" @click="router.push('/ui/palette')">查看主题</Button>
            </div>
          </div>

          <div class="grid gap-3 border-t border-medium pt-5 sm:grid-cols-3">
            <div v-for="item in heroMetrics" :key="item.label" class="rounded-md bg-secondary/70 p-4">
              <div class="flex items-end justify-between gap-4">
                <div class="text-2xl font-black text-primary">{{ item.value }}</div>
                <div class="text-xs font-medium text-tertiary">{{ item.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="min-w-0 rounded-lg border border-medium bg-secondary/80 p-4 shadow-[0_24px_70px_-52px_rgb(15_23_42)] dark:shadow-none">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span class="flex size-8 items-center justify-center rounded-md bg-primary text-brand-500">
                <span class="i-lucide:layout-dashboard size-4"></span>
              </span>
              <div>
                <div class="text-sm font-bold text-primary">Live component cockpit</div>
                <div class="text-xs text-tertiary">theme-aware preview</div>
              </div>
            </div>
            <Badge status="processing" text="实时预览" />
          </div>

          <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_210px]">
            <div class="min-w-0 rounded-md border border-medium bg-primary p-4">
              <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div class="text-sm font-bold text-primary">组件工作台</div>
                  <div class="mt-1 text-xs text-tertiary">Input / Button / Tag / Slider</div>
                </div>
                <ButtonGroup>
                  <Button size="sm" icon="i-lucide:panel-top">概览</Button>
                  <Button size="sm" variant="outline" icon="i-lucide:sliders-horizontal">配置</Button>
                </ButtonGroup>
              </div>

              <Input v-model="heroSearch" prefix-icon="i-lucide:search" clearable placeholder="搜索组件" />

              <div class="mt-4 grid gap-3">
                <div v-for="item in previewRows" :key="item.name" class="flex min-h-14 items-center justify-between gap-3 rounded-md bg-secondary/70 px-3">
                  <div class="flex min-w-0 items-center gap-3">
                    <span class="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-tertiary">
                      <span :class="item.icon" class="size-4"></span>
                    </span>
                    <div class="min-w-0">
                      <div class="truncate text-sm font-bold text-primary">{{ item.name }}</div>
                      <div class="truncate text-xs text-tertiary">{{ item.description }}</div>
                    </div>
                  </div>
                  <Tag :color="item.color" variant="light" radius="round">{{ item.state }}</Tag>
                </div>
              </div>
            </div>

            <div class="grid gap-4">
              <div class="rounded-md border border-medium bg-primary p-4">
                <div class="flex items-center justify-between gap-3">
                  <span class="text-sm font-bold text-primary">暗色适配</span>
                  <Switch v-model="heroOnline" inline-prompt active-text="ON" inactive-text="OFF" />
                </div>
                <div class="mt-4 flex items-end gap-2">
                  <div class="h-16 flex-1 rounded bg-brand-500"></div>
                  <div class="h-11 flex-1 rounded bg-green-500"></div>
                  <div class="h-8 flex-1 rounded bg-amber-500"></div>
                  <div class="h-13 flex-1 rounded bg-red-500"></div>
                </div>
              </div>

              <div class="rounded-md border border-medium bg-primary p-4">
                <div class="mb-3 flex items-center justify-between gap-3">
                  <span class="text-sm font-bold text-primary">密度控制</span>
                  <span class="font-mono text-xs text-tertiary">{{ heroDensity }}%</span>
                </div>
                <Slider v-model="heroDensity" :step="4" />
              </div>

              <div class="rounded-md border border-medium bg-primary p-4">
                <div class="mb-3 text-sm font-bold text-primary">状态语义</div>
                <div class="flex flex-wrap gap-2">
                  <Tag color="green" variant="light" radius="round">success</Tag>
                  <Tag color="yellow" variant="light" radius="round">warning</Tag>
                  <Tag color="red" variant="light" radius="round">danger</Tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="grid gap-4 lg:grid-cols-3">
      <RouterLink v-for="item in featureItems" :key="item.path" :to="item.path" class="group rounded-lg border border-medium bg-primary p-5 transition-colors hover:border-brand-400/70 hover:bg-secondary">
        <div class="flex items-center justify-between gap-3">
          <span class="flex size-10 items-center justify-center rounded-md bg-secondary text-brand-500 transition-colors group-hover:bg-brand-500 group-hover:text-white">
            <span :class="item.icon" class="size-5"></span>
          </span>
          <span class="i-lucide:arrow-up-right size-4 shrink-0 text-tertiary transition-colors group-hover:text-brand-500"></span>
        </div>
        <h2 class="mt-5 text-lg font-black text-primary">{{ item.title }}</h2>
        <p class="mt-2 text-sm leading-6 text-tertiary">{{ item.description }}</p>
      </RouterLink>
    </section>

    <section class="grid gap-5 xl:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
      <div class="rounded-lg border border-medium bg-primary p-5">
        <div class="inline-flex items-center gap-2 rounded border border-medium bg-secondary px-3 py-1.5 text-xs font-bold text-tertiary">
          <span class="i-lucide:route size-4"></span>
          <span>设计原则</span>
        </div>
        <h2 class="mt-5 text-2xl font-black text-primary">从控件状态到业务页面，一套令牌贯穿到底</h2>
        <p class="mt-3 text-sm leading-6 text-secondary">UnoUI 用语义色、尺寸、圆角和交互反馈约束组件，示例页则把这些约束放进真实场景里验证。</p>
        <div class="mt-5 grid gap-3">
          <div v-for="item in principleItems" :key="item.title" class="flex gap-3 rounded-md bg-secondary/70 p-3">
            <span :class="item.icon" class="mt-0.5 size-5 shrink-0 text-brand-500"></span>
            <div>
              <div class="text-sm font-bold text-primary">{{ item.title }}</div>
              <div class="mt-1 text-xs leading-5 text-tertiary">{{ item.text }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-medium bg-primary p-5">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 class="text-2xl font-black text-primary">组件入口矩阵</h2>
            <p class="mt-2 text-sm text-tertiary">按场景进入高频组件，快速跳到对应示例。</p>
          </div>
          <RouterLink to="/ui/table" class="inline-flex items-center gap-1.5 text-sm font-bold text-brand-500 hover:text-brand-600">
            查看 Table
            <span class="i-lucide:arrow-right size-4"></span>
          </RouterLink>
        </div>

        <div class="mt-5 grid gap-3 md:grid-cols-2">
          <div v-for="group in componentGroups" :key="group.title" class="rounded-md border border-medium bg-secondary/50 p-4">
            <div class="mb-4 flex items-center gap-3">
              <span class="flex size-9 items-center justify-center rounded-md bg-primary text-brand-500">
                <span :class="group.icon" class="size-4"></span>
              </span>
              <div>
                <div class="text-sm font-bold text-primary">{{ group.title }}</div>
                <div class="text-xs text-tertiary">{{ group.caption }}</div>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <RouterLink v-for="link in group.links" :key="link.path" :to="link.path" class="rounded border border-medium bg-primary px-2.5 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-brand-400/70 hover:text-brand-500">
                {{ link.label }}
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

import { Badge } from "@unoui/vue/badge";
import { Button, ButtonGroup } from "@unoui/vue/button";
import { Input } from "@unoui/vue/input";
import { Slider } from "@unoui/vue/slider";
import { Switch } from "@unoui/vue/switch";
import { Tag, type TagProps } from "@unoui/vue/tag";
import UnoUILogo from "@/components/UnoUILogo.vue";

interface PreviewRow {
  name: string;
  description: string;
  icon: string;
  state: string;
  color: TagProps["color"];
}

const router = useRouter();
const heroSearch = ref("MillerColumns");
const heroOnline = ref(true);
const heroDensity = ref(68);

const heroMetrics = [
  { value: "28+", label: "组件页面" },
  { value: "100%", label: "语义令牌驱动" },
  { value: "Vue 3", label: "组合式 API" },
];

const previewRows: PreviewRow[] = [
  { name: "MillerColumns", description: "多列路径、信息面板、拖拽排序", icon: "i-lucide:columns-3", state: "advanced", color: "brand" },
  { name: "InputI18n", description: "多语言输入和编辑弹窗", icon: "i-lucide:languages", state: "i18n", color: "blue" },
  { name: "Table", description: "筛选、排序、固定列和分页联动", icon: "i-lucide:table-2", state: "data", color: "green" },
];

const featureItems = [
  { title: "主题与令牌", path: "/ui/palette", icon: "i-lucide:palette", description: "检查品牌色、语义背景、文本层级、边框和暗色模式表现。" },
  { title: "表单与输入", path: "/ui/form", icon: "i-lucide:clipboard-list", description: "覆盖输入、选择、校验、日期、颜色、滑块和开关等高频交互。" },
  { title: "反馈与浮层", path: "/ui/alert", icon: "i-lucide:message-square-warning", description: "查看 Alert、Message、Tooltip、Popconfirm、Modal、Drawer 的组合效果。" },
];

const principleItems = [
  { title: "低噪声", icon: "i-lucide:audio-lines", text: "默认样式克制，强调内容和操作本身，适合密集后台界面。" },
  { title: "强状态", icon: "i-lucide:activity", text: "hover、focus、disabled、loading、checked 等状态在示例中集中验证。" },
  { title: "可迁移", icon: "i-lucide:package-check", text: "组件通过 subpath 导出，方便在多个 Vue 项目中按需引用。" },
];

const componentGroups = [
  {
    title: "布局容器",
    caption: "分区、调整、嵌套",
    icon: "i-lucide:panels-top-left",
    links: [{ label: "Splitter", path: "/ui/splitter" }],
  },
  {
    title: "基础输入",
    caption: "录入、选择、校验",
    icon: "i-lucide:text-cursor-input",
    links: [
      { label: "Input", path: "/ui/input" },
      { label: "InputOtp", path: "/ui/input-otp" },
      { label: "DatePicker", path: "/ui/datepicker" },
      { label: "TimePicker", path: "/ui/timepicker" },
      { label: "ColorPicker", path: "/ui/colorpicker" },
      { label: "Checkbox", path: "/ui/checkbox" },
      { label: "Radio", path: "/ui/radio" },
      { label: "Slider", path: "/ui/slider" },
      { label: "Switch", path: "/ui/switch" },
    ],
  },
  {
    title: "操作导航",
    caption: "命令、分页、切换",
    icon: "i-lucide:mouse-pointer-click",
    links: [
      { label: "Button", path: "/ui/button" },
      { label: "Dropdown", path: "/ui/dropdown" },
      { label: "Select", path: "/ui/select" },
      { label: "Pagination", path: "/ui/pagination" },
      { label: "Tab", path: "/ui/tab" },
    ],
  },
  {
    title: "数据展示",
    caption: "列表、徽标、层级",
    icon: "i-lucide:layout-list",
    links: [
      { label: "Table", path: "/ui/table" },
      { label: "Badge", path: "/ui/badge" },
      { label: "Tag", path: "/ui/tag" },
      { label: "Progress", path: "/ui/progress" },
      { label: "QRCode", path: "/ui/qrcode" },
      { label: "Skeleton", path: "/ui/skeleton" },
      { label: "MillerColumns", path: "/ui/millercolumns" },
    ],
  },
  {
    title: "反馈浮层",
    caption: "提醒、确认、容器",
    icon: "i-lucide:panels-top-left",
    links: [
      { label: "Alert", path: "/ui/alert" },
      { label: "Message", path: "/ui/message" },
      { label: "Tooltip", path: "/ui/tooltip" },
      { label: "Popconfirm", path: "/ui/popconfirm" },
      { label: "Modal", path: "/ui/modal" },
      { label: "Drawer", path: "/ui/drawer" },
    ],
  },
];
</script>
