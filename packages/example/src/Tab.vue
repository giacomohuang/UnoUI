<template>
  <section id="showcase-tab" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">Tab</h2>
      <p class="mt-1 text-xs text-tertiary">展示 line、card、border-card、位置、禁用、关闭、新增和自定义 label。</p>
    </div>
    <div class="grid gap-5 p-4 text-sm text-secondary">
      <div class="grid gap-4 xl:grid-cols-2">
        <div class="rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="mb-3 text-sm font-bold text-secondary">基础标签</h3>
          <Tabs v-model="tabLineValue">
            <TabPane name="overview" label="概览">
              <div class="rounded border border-medium bg-primary p-3">概览页保持默认 line 样式，适合轻量设置区块。</div>
            </TabPane>
            <TabPane name="routes">
              <template #label>
                <span class="inline-flex items-center gap-1">
                  <span class="i-lucide:route size-4"></span>
                  路线
                </span>
              </template>
              <div class="rounded border border-medium bg-primary p-3">label 插槽可以放图标、计数或状态标签。</div>
            </TabPane>
            <TabPane name="disabled" label="禁用" disabled>
              <div class="rounded border border-medium bg-primary p-3">禁用标签不会响应点击和键盘切换。</div>
            </TabPane>
          </Tabs>
          <div class="mt-3 text-xs text-tertiary">当前：{{ tabLineValue }}</div>
        </div>

        <div class="rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="mb-3 text-sm font-bold text-secondary">卡片编辑</h3>
          <Tabs v-model="tabCardValue" type="card" editable @tab-add="handleTabAdd" @tab-remove="handleTabRemove">
            <TabPane name="base" label="基础信息">
              <div class="rounded border border-medium bg-primary p-3">editable 同时显示新增和关闭入口。</div>
            </TabPane>
            <TabPane name="style" label="样式配置" closable>
              <div class="rounded border border-medium bg-primary p-3">单个 TabPane 也可以独立声明 closable。</div>
            </TabPane>
            <TabPane name="publish" label="发布记录">
              <div class="rounded border border-medium bg-primary p-3">关闭、新增事件由外层业务决定是否真正增删数据。</div>
            </TabPane>
          </Tabs>
          <div class="mt-3 text-xs text-tertiary">事件：{{ tabEditLog }}</div>
        </div>
      </div>

      <div class="rounded-md border border-medium bg-secondary/40 p-3">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 class="text-sm font-bold text-secondary">类型与位置</h3>
          <div class="flex flex-wrap items-center gap-2">
            <ButtonGroup>
              <Button v-for="type in tabTypes" :key="`tab-type-${type}`" :variant="tabDemoType === type ? 'default' : 'outline'" @click="tabDemoType = type">{{ type }}</Button>
            </ButtonGroup>
            <ButtonGroup>
              <Button v-for="position in tabPositions" :key="`tab-position-${position}`" :variant="tabDemoPosition === position ? 'default' : 'outline'" @click="tabDemoPosition = position">{{ position }}</Button>
            </ButtonGroup>
          </div>
        </div>
        <Tabs v-model="tabDemoValue" :type="tabDemoType" :tab-position="tabDemoPosition" class="min-h-[180px]" stretch>
          <TabPane name="map" label="地图">
            <div class="rounded border border-medium bg-secondary px-3 py-2">地图页签使用当前选择的位置和类型。</div>
          </TabPane>
          <TabPane name="route" label="路径" lazy>
            <div class="rounded border border-medium bg-secondary px-3 py-2">lazy 内容首次激活后才渲染。</div>
          </TabPane>
          <TabPane name="audit" label="审计">
            <div class="rounded border border-medium bg-secondary px-3 py-2">border-card 会给整体容器增加边框和内容背景。</div>
          </TabPane>
        </Tabs>
      </div>
    </div>

    <!-- API 参数 -->
    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数 — Tabs</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="tabsApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="tabsProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="tabsEmits" />
          </TabPane>
        </Tabs>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数 — TabPane</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="tabPaneApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="tabPaneProps" />
          </TabPane>
          <TabPane name="slots" label="Slots">
            <ParamTable :columns="slotsColumns" :rows="tabPaneSlots" />
          </TabPane>
        </Tabs>
      </div>
    </div>

    <!-- 示例代码 -->
    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">示例代码</h3>
      </div>
      <div class="p-4">
        <CodeBlock :code="tabsCodeExample" lang="html" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Button, ButtonGroup } from '@mcistudio/unoui-vue/button'
import { TabPane, Tabs, type TabPosition, type TabsType, type TabValue } from '@mcistudio/unoui-vue/tab'
import CodeBlock from '@/components/CodeBlock.vue'
import ParamTable from '@/components/ParamTable.vue'
import { propsColumns, emitsColumns, slotsColumns } from '@/data/shared'
import { tabsProps, tabsEmits, tabPaneProps, tabPaneSlots, tabsCodeExample } from '@/data/tab'

const tabsApiTab = ref('props')
const tabPaneApiTab = ref('props')
const tabLineValue = ref<TabValue>('overview')
const tabCardValue = ref<TabValue>('base')
const tabDemoValue = ref<TabValue>('map')
const tabDemoType = ref<TabsType>('border-card')
const tabDemoPosition = ref<TabPosition>('top')
const tabTypes: TabsType[] = ['line', 'card', 'border-card']
const tabPositions: TabPosition[] = ['top', 'right', 'bottom', 'left']
const tabEditLog = ref('等待操作')
const handleTabAdd = () => {
  tabEditLog.value = '点击新增标签'
}
const handleTabRemove = (value: TabValue) => {
  tabEditLog.value = `关闭标签：${value}`
}
</script>
