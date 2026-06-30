<template>
  <section id="showcase-switch" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">Switch</h2>
      <p class="mt-1 text-xs text-tertiary">展示尺寸、状态、文字、inline prompt、自定义值和 before-change。</p>
    </div>
    <div class="grid gap-5 p-4 text-sm text-secondary">
      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-center">
        <span class="text-xs font-medium text-tertiary">尺寸</span>
        <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Switch v-for="size in switchSizes" :key="`switch-size-${size}`" checked :size="size" active-text="ON" inactive-text="OFF" />
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">状态</span>
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div class="flex min-h-10 items-center rounded-md bg-secondary/60 px-3">
            <Switch v-model="switchEnabled" active-text="启用" inactive-text="停用" />
          </div>
          <div class="flex min-h-10 items-center rounded-md bg-secondary/60 px-3">
            <Switch checked active-text="默认开启" inactive-text="默认关闭" />
          </div>
          <div class="flex min-h-10 items-center rounded-md bg-secondary/60 px-3">
            <Switch disabled active-text="启用" inactive-text="禁用未开" />
          </div>
          <div class="flex min-h-10 items-center rounded-md bg-secondary/60 px-3">
            <Switch checked loading active-text="加载中" inactive-text="关闭" />
          </div>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">样式</span>
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div class="flex min-h-10 items-center rounded-md bg-secondary/60 px-3">
            <Switch v-model="switchInlineText" inline-prompt active-text="开" inactive-text="关" />
          </div>
          <div class="flex min-h-10 items-center rounded-md bg-secondary/60 px-3">
            <Switch v-model="switchInlineIcon" inline-prompt active-icon="i-lucide:check" inactive-icon="i-lucide:x" />
          </div>
          <div class="flex min-h-10 items-center rounded-md bg-secondary/60 px-3">
            <Switch v-model="switchActionIcon" active-action-icon="i-lucide:sun" inactive-action-icon="i-lucide:moon-star" />
          </div>
          <div class="flex min-h-10 items-center rounded-md bg-secondary/60 px-3">
            <Switch v-model="switchCustomColor" :width="56" active-color="#16a34a" inactive-color="#64748b" inline-prompt active-text="Y" inactive-text="N" />
          </div>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">值</span>
        <div class="grid gap-3 xl:grid-cols-2">
          <div class="flex min-h-10 flex-wrap items-center gap-3 rounded-md bg-secondary/60 px-3">
            <Switch v-model="switchModeValue" active-value="online" inactive-value="offline" active-text="online" inactive-text="offline" />
            <span class="text-xs text-tertiary">当前值：{{ switchModeValue }}</span>
          </div>
          <div class="flex min-h-10 flex-wrap items-center gap-3 rounded-md bg-secondary/60 px-3">
            <Switch v-model="switchBeforeValue" active-text="允许" inactive-text="阻止" :before-change="confirmSwitchChange" />
            <span class="text-xs text-tertiary">before-change：{{ switchBeforeValue ? '已切换' : '未切换' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- API 参数 -->
    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="switchApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="switchProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="switchEmits" />
          </TabPane>
          <TabPane name="slots" label="Slots">
            <ParamTable :columns="slotsColumns" :rows="switchSlots" />
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
        <CodeBlock :code="switchCodeExample" lang="html" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Switch, type SwitchProps } from '@unoui/vue/switch'
import { Tabs, TabPane } from '@unoui/vue/tab'
import { propsColumns, emitsColumns, slotsColumns } from '@/data/shared'
import { switchProps, switchEmits, switchSlots, switchCodeExample } from '@/data/switch'
import ParamTable from '@/components/ParamTable.vue'
import CodeBlock from '@/components/CodeBlock.vue'

type SwitchSize = NonNullable<SwitchProps['size']>

const switchApiTab = ref('props')
const switchSizes: SwitchSize[] = ['sm', 'md', 'lg']
const switchEnabled = ref(true)
const switchInlineText = ref(true)
const switchInlineIcon = ref(true)
const switchActionIcon = ref(true)
const switchCustomColor = ref(true)
const switchModeValue = ref('online')
const switchBeforeValue = ref(false)
const confirmSwitchChange = () => window.confirm('是否允许本次切换？')
</script>
