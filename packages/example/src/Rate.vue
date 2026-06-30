<template>
  <section id="showcase-rate" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">Rate</h2>
      <p class="mt-1 text-xs text-tertiary">评分组件，支持半选、清除、自定义字符、tooltip、键盘操作和焦点方法。</p>
    </div>

    <div class="grid gap-5 p-4 text-sm text-secondary">
      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-center">
        <span class="text-xs font-medium text-tertiary">尺寸</span>
        <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div v-for="size in rateSizes" :key="size" class="flex items-center gap-3 rounded-md bg-secondary/60 px-3 py-2">
            <Rate v-model="rateSizeValues[size]" :size="size" />
            <span class="font-mono text-xs">{{ size }}</span>
          </div>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">状态</span>
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div class="grid min-h-20 content-center gap-2 rounded-md bg-secondary/60 px-3 py-2">
            <Rate v-model="basicValue" />
            <span class="text-xs text-tertiary">基础：{{ basicValue }}</span>
          </div>
          <div class="grid min-h-20 content-center gap-2 rounded-md bg-secondary/60 px-3 py-2">
            <Rate v-model="halfValue" allow-half :tooltips="rateTooltips" />
            <span class="text-xs text-tertiary">半选：{{ halfValue }}</span>
          </div>
          <div class="grid min-h-20 content-center gap-2 rounded-md bg-secondary/60 px-3 py-2">
            <Rate v-model="clearValue" />
            <span class="text-xs text-tertiary">点击当前值清空：{{ clearValue }}</span>
          </div>
          <div class="grid min-h-20 content-center gap-2 rounded-md bg-secondary/60 px-3 py-2">
            <Rate v-model="lockedValue" :clearable="false" />
            <span class="text-xs text-tertiary">不允许清空：{{ lockedValue }}</span>
          </div>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">提示</span>
        <div class="grid gap-3 lg:grid-cols-2">
          <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
            <span class="text-xs font-medium text-tertiary">Tooltip</span>
            <Rate v-model="tooltipValue" :tooltips="rateTooltips" />
            <span class="text-xs text-tertiary">悬浮星星查看提示：{{ tooltipValue }}</span>
          </div>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">字符</span>
        <div class="grid gap-3 lg:grid-cols-3">
          <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
            <span class="text-xs font-medium text-tertiary">文字字符</span>
            <Rate v-model="textValue" character="好" :count="4" />
            <span class="text-xs text-tertiary">当前：{{ textValue }}</span>
          </div>
          <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
            <span class="text-xs font-medium text-tertiary">插槽字符</span>
            <Rate v-model="slotValue" :count="5">
              <template #character="{ active, half }">
                <span class="i-lucide:map-pin size-[1em]" :class="active || half ? 'text-brand-500 dark:text-brand-400' : ''"></span>
              </template>
            </Rate>
            <span class="text-xs text-tertiary">当前：{{ slotValue }}</span>
          </div>
          <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
            <span class="text-xs font-medium text-tertiary">禁用展示</span>
            <Rate :model-value="3.5" allow-half disabled />
            <span class="text-xs text-tertiary">只读评分</span>
          </div>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">键盘</span>
        <div class="flex flex-wrap items-center gap-3 rounded-md bg-secondary/60 px-3 py-3">
          <Rate ref="rateFocusRef" v-model="keyboardValue" allow-half />
          <Button size="sm" variant="outline" icon="i-lucide:focus" @click="rateFocusRef?.focus()">聚焦</Button>
          <Button size="sm" variant="outline" icon="i-lucide:circle-slash" @click="rateFocusRef?.blur()">失焦</Button>
          <span class="text-xs text-tertiary">当前：{{ keyboardValue }}</span>
        </div>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="rateApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="rateProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="rateEmits" />
          </TabPane>
          <TabPane name="slots" label="Slots">
            <ParamTable :columns="slotsColumns" :rows="rateSlots" />
          </TabPane>
          <TabPane name="exposes" label="Exposes">
            <ParamTable :columns="exposedColumns" :rows="rateExposes" />
          </TabPane>
        </Tabs>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">示例代码</h3>
      </div>
      <div class="p-4">
        <CodeBlock :code="rateCodeExample" lang="html" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Button } from '@unoui/vue/button'
import { Rate, type RateSize } from '@unoui/vue/rate'
import { Tabs, TabPane } from '@unoui/vue/tab'
import { rateCodeExample, rateEmits, rateExposes, rateProps, rateSlots } from '@/data/rate'
import { emitsColumns, exposedColumns, propsColumns, slotsColumns } from '@/data/shared'
import CodeBlock from '@/components/CodeBlock.vue'
import ParamTable from '@/components/ParamTable.vue'

interface RateExpose {
  focus: () => void
  blur: () => void
}

const rateApiTab = ref('props')
const rateFocusRef = ref<RateExpose | null>(null)
const rateSizes: RateSize[] = ['sm', 'md', 'lg']
const rateSizeValues = ref<Record<RateSize, number>>({
  sm: 3,
  md: 3,
  lg: 3
})
const rateTooltips = ['很差', '较差', '一般', '不错', '很好']
const basicValue = ref(3)
const halfValue = ref(2.5)
const clearValue = ref(4)
const lockedValue = ref(3)
const tooltipValue = ref(3)
const textValue = ref(2)
const slotValue = ref(4)
const keyboardValue = ref(2.5)
</script>
