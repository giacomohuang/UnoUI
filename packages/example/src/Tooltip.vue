<template>
  <section id="showcase-tooltip" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">Tooltip</h2>
      <p class="mt-1 text-xs text-tertiary">文字提示浮层，支持位置、触发方式、受控显隐、颜色、箭头和自动溢出修正。</p>
    </div>

    <div class="grid gap-5 p-4 text-sm text-secondary">
      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-center">
        <span class="text-xs font-medium text-tertiary">基础</span>
        <div class="flex flex-wrap items-center gap-3 rounded-md bg-secondary/60 px-3 py-3">
          <Tooltip title="地图编辑器的轻量提示">
            <Button variant="outline" icon="i-lucide:info">Hover</Button>
          </Tooltip>
          <Tooltip placement="bottom" title="底部提示">
            <Button variant="outline" icon="i-lucide:arrow-down">Bottom</Button>
          </Tooltip>
          <Tooltip :arrow="false" title="无箭头提示">
            <Button variant="outline">无箭头</Button>
          </Tooltip>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">位置</span>
        <div class="grid max-w-2xl grid-cols-3 gap-2 rounded-md bg-secondary/60 p-3">
          <Tooltip v-for="placement in tooltipPlacements" :key="placement" :title="placement" :placement="placement" :mouse-enter-delay="0">
            <Button variant="outline" size="sm" class="w-full">{{ placement }}</Button>
          </Tooltip>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">触发</span>
        <div class="flex flex-wrap items-center gap-3 rounded-md bg-secondary/60 px-3 py-3">
          <Tooltip title="鼠标悬浮触发" trigger="hover">
            <Button variant="outline">Hover</Button>
          </Tooltip>
          <Tooltip title="焦点触发" trigger="focus">
            <Button variant="outline">Focus</Button>
          </Tooltip>
          <Tooltip title="点击切换提示" trigger="click">
            <Button variant="outline">Click</Button>
          </Tooltip>
          <Tooltip title="右键菜单触发" trigger="contextMenu">
            <Button variant="outline">ContextMenu</Button>
          </Tooltip>
          <Tooltip title="悬浮或聚焦触发" :trigger="['hover', 'focus']">
            <Button variant="outline">组合触发</Button>
          </Tooltip>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">颜色</span>
        <div class="flex flex-wrap items-center gap-3 rounded-md bg-secondary/60 px-3 py-3">
          <Tooltip v-for="item in colorTooltips" :key="item.color" :title="item.label" :color="item.color">
            <Button variant="outline" :style="{ borderColor: item.color, color: item.color }">{{ item.label }}</Button>
          </Tooltip>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">控制</span>
        <div class="grid gap-3 lg:grid-cols-3">
          <div class="flex min-h-16 flex-wrap items-center gap-3 rounded-md bg-secondary/60 px-3 py-3">
            <Tooltip v-model:open="controlledOpen" title="受控 Tooltip" trigger="click">
              <Button variant="outline">受控</Button>
            </Tooltip>
            <Button size="sm" variant="mono" @click="controlledOpen = !controlledOpen">{{ controlledOpen ? '关闭' : '打开' }}</Button>
          </div>
          <div class="flex min-h-16 flex-wrap items-center gap-3 rounded-md bg-secondary/60 px-3 py-3">
            <Tooltip title="关闭后销毁 DOM" destroy-on-hidden>
              <Button variant="outline">destroyOnHidden</Button>
            </Tooltip>
          </div>
          <div class="flex min-h-16 flex-wrap items-center gap-3 rounded-md bg-secondary/60 px-3 py-3">
            <Tooltip placement="top" :arrow="{ pointAtCenter: true }">
              <template #title>
                <div class="grid gap-1">
                  <strong>自定义内容</strong>
                  <span class="text-white/80 dark:text-zinc-700">支持 title 插槽。</span>
                </div>
              </template>
              <Button variant="outline">Slot</Button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="tooltipApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="tooltipProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="tooltipEmits" />
          </TabPane>
          <TabPane name="slots" label="Slots">
            <ParamTable :columns="slotsColumns" :rows="tooltipSlots" />
          </TabPane>
        </Tabs>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">示例代码</h3>
      </div>
      <div class="p-4">
        <CodeBlock :code="tooltipCodeExample" lang="html" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Button } from '@unoui/vue/button'
import { Tabs, TabPane } from '@unoui/vue/tab'
import { Tooltip, type TooltipPlacement } from '@unoui/vue/tooltip'
import CodeBlock from '@/components/CodeBlock.vue'
import ParamTable from '@/components/ParamTable.vue'
import { emitsColumns, propsColumns, slotsColumns } from '@/data/shared'
import { tooltipCodeExample, tooltipEmits, tooltipProps, tooltipSlots } from '@/data/tooltip'

const tooltipApiTab = ref('props')
const controlledOpen = ref(false)
const tooltipPlacements: TooltipPlacement[] = ['topLeft', 'top', 'topRight', 'leftTop', 'left', 'leftBottom', 'rightTop', 'right', 'rightBottom', 'bottomLeft', 'bottom', 'bottomRight']
const colorTooltips = [
  { label: '成功', color: '#16a34a' },
  { label: '警告', color: '#d97706' },
  { label: '危险', color: '#dc2626' },
  { label: '品牌', color: '#3b82f6' }
]
</script>
