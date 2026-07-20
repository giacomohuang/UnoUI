<template>
  <section id="showcase-splitter" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">Splitter</h2>
      <p class="mt-1 text-xs text-tertiary">参考 Ant Design Splitter 的分隔面板，支持受控尺寸、方向、约束、折叠、延迟拖拽、嵌套和键盘操作。</p>
    </div>

    <div class="grid gap-5 p-4 text-sm text-secondary">
      <div class="grid gap-3">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="text-sm font-bold text-secondary">基础与受控尺寸</h3>
            <p class="mt-1 font-mono text-xs text-tertiary">{{ formatSizes(controlledSizes) }}</p>
          </div>
          <Button size="sm" variant="outline" icon="i-lucide:rotate-ccw" @click="controlledSplitterRef?.reset()">重置</Button>
        </div>
        <Splitter ref="controlledSplitterRef" v-model="controlledSizes" :default-value="['34%', '66%']" class="h-56 rounded-md border border-medium" @dragger-double-click="controlledSplitterRef?.reset()">
          <SplitterPanel min="20%" max="60%">
            <div class="flex h-full min-h-36 items-center justify-center bg-secondary/70 p-4">
              <div class="text-center">
                <span class="i-lucide:panel-left-close mx-auto block size-5 text-brand-500"></span>
                <div class="mt-2 font-bold text-primary">资源目录</div>
                <div class="mt-1 text-xs text-tertiary">20% - 60%</div>
              </div>
            </div>
          </SplitterPanel>
          <SplitterPanel>
            <div class="flex h-full min-h-36 items-center justify-center bg-primary p-4">
              <div class="text-center">
                <span class="i-lucide:layout-dashboard mx-auto block size-5 text-green-500"></span>
                <div class="mt-2 font-bold text-primary">工作区</div>
                <div class="mt-1 text-xs text-tertiary">双击分隔条恢复默认尺寸</div>
              </div>
            </div>
          </SplitterPanel>
          <template #dragger="{ active }">
            <span class="i-lucide:grip-vertical size-3" :class="active ? 'text-brand-500' : 'text-tertiary'"></span>
          </template>
        </Splitter>
      </div>

      <div class="grid gap-4 xl:grid-cols-2">
        <div class="grid gap-3">
          <div>
            <h3 class="text-sm font-bold text-secondary">垂直方向</h3>
            <p class="mt-1 text-xs text-tertiary">方向键上下调整，Home / End 跳到约束边界。</p>
          </div>
          <Splitter orientation="vertical" :default-value="['38%', '62%']" class="h-72 rounded-md border border-medium">
            <SplitterPanel min="24%">
              <div class="flex h-full min-h-0 items-center justify-center bg-secondary/60 font-bold text-primary">预览</div>
            </SplitterPanel>
            <SplitterPanel>
              <div class="flex h-full min-h-0 items-center justify-center bg-primary font-bold text-primary">时间线</div>
            </SplitterPanel>
          </Splitter>
        </div>

        <div class="grid gap-3">
          <div>
            <h3 class="text-sm font-bold text-secondary">延迟拖拽</h3>
            <p class="mt-1 text-xs text-tertiary">拖动期间显示品牌色预览线，松开后提交尺寸。</p>
          </div>
          <Splitter lazy :default-value="['42%', '58%']" class="h-72 rounded-md border border-medium">
            <SplitterPanel min="25%" max="65%">
              <div class="flex h-full min-h-0 items-center justify-center bg-primary font-bold text-primary">查询条件</div>
            </SplitterPanel>
            <SplitterPanel>
              <div class="flex h-full min-h-0 items-center justify-center bg-secondary/60 font-bold text-primary">结果列表</div>
            </SplitterPanel>
          </Splitter>
        </div>
      </div>

      <div class="grid gap-3">
        <div>
          <h3 class="text-sm font-bold text-secondary">多面板与折叠</h3>
          <p class="mt-1 text-xs text-tertiary">折叠按钮固定显示，面板恢复时遵守 min / max 约束。</p>
        </div>
        <Splitter :default-value="['24%', '48%', '28%']" :collapsible="{ motion: true }" class="h-60 rounded-md border border-medium">
          <SplitterPanel min="15%" :collapsible="{ end: true, showCollapsibleIcon: true }">
            <div class="flex h-full items-center justify-center bg-secondary/70 font-bold text-primary">图层</div>
          </SplitterPanel>
          <SplitterPanel min="30%">
            <div class="flex h-full items-center justify-center bg-primary font-bold text-primary">画布</div>
          </SplitterPanel>
          <SplitterPanel min="18%" :collapsible="{ start: true, showCollapsibleIcon: true }">
            <div class="flex h-full items-center justify-center bg-secondary/70 font-bold text-primary">属性</div>
          </SplitterPanel>
        </Splitter>
      </div>

      <div class="grid gap-3">
        <div>
          <h3 class="text-sm font-bold text-secondary">嵌套布局</h3>
          <p class="mt-1 text-xs text-tertiary">每层 Splitter 独立计算约束和拖拽状态。</p>
        </div>
        <Splitter :default-value="['28%', '72%']" class="h-72 rounded-md border border-medium">
          <SplitterPanel min="18%">
            <div class="flex h-full items-center justify-center bg-secondary/70 font-bold text-primary">导航</div>
          </SplitterPanel>
          <SplitterPanel>
            <Splitter orientation="vertical" :default-value="['58%', '42%']" class="h-full">
              <SplitterPanel min="30%">
                <div class="flex h-full items-center justify-center bg-primary font-bold text-primary">编辑器</div>
              </SplitterPanel>
              <SplitterPanel min="22%">
                <div class="flex h-full items-center justify-center bg-secondary/50 font-bold text-primary">控制台</div>
              </SplitterPanel>
            </Splitter>
          </SplitterPanel>
        </Splitter>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="splitterApiTab" size="sm">
          <TabPane name="splitter-props" label="Splitter Props">
            <ParamTable min-table-width="820px" :columns="propsColumns" :rows="splitterProps" />
          </TabPane>
          <TabPane name="panel-props" label="Panel Props">
            <ParamTable min-table-width="900px" :columns="propsColumns" :rows="splitterPanelProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="splitterEmits" />
          </TabPane>
          <TabPane name="slots" label="Slots">
            <ParamTable :columns="slotsColumns" :rows="[...splitterSlots, ...splitterPanelSlots]" />
          </TabPane>
          <TabPane name="exposes" label="Exposes">
            <ParamTable :columns="exposedColumns" :rows="splitterExposes" />
          </TabPane>
        </Tabs>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">示例代码</h3>
      </div>
      <div class="p-4">
        <CodeBlock :code="splitterCodeExample" lang="html" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Button } from '@unoui/vue/button'
import { Splitter, SplitterPanel, type SplitterSize } from '@unoui/vue/splitter'
import { TabPane, Tabs } from '@unoui/vue/tab'
import { ref } from 'vue'

import CodeBlock from '@/components/CodeBlock.vue'
import ParamTable from '@/components/ParamTable.vue'
import { exposedColumns, emitsColumns, propsColumns, slotsColumns } from '@/data/shared'
import { splitterCodeExample, splitterEmits, splitterExposes, splitterPanelProps, splitterPanelSlots, splitterProps, splitterSlots } from '@/data/splitter'

interface SplitterExpose {
  reset: () => number[]
  getSizes: () => number[]
}

const splitterApiTab = ref('splitter-props')
const controlledSizes = ref<SplitterSize[]>(['34%', '66%'])
const controlledSplitterRef = ref<SplitterExpose | null>(null)

function formatSizes(sizes: SplitterSize[]) {
  return sizes.map((size) => (typeof size === 'number' ? `${Math.round(size)}px` : size)).join(' / ')
}
</script>
