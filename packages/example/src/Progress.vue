<template>
  <section id="showcase-progress" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">Progress</h2>
      <p class="mt-1 text-xs text-tertiary">展示任务完成比例和处理状态，支持线形、圆形、仪表盘、步骤与成功分段。</p>
    </div>

    <div class="grid gap-6 p-4 text-sm text-secondary">
      <section class="grid gap-3">
        <h3 class="text-xs font-bold text-tertiary">基础进度</h3>
        <div class="grid max-w-3xl gap-3">
          <Progress :percent="30" />
          <Progress :percent="70" status="active" />
          <Progress :percent="100" />
          <Progress :percent="62" :success="{ percent: 24 }" />
        </div>
      </section>

      <section class="grid gap-3">
        <h3 class="text-xs font-bold text-tertiary">状态与动态值</h3>
        <div class="grid max-w-3xl gap-3">
          <Progress :percent="dynamicPercent" status="active" />
          <Progress :percent="56" status="exception" />
          <div class="flex items-center gap-2">
            <Button size="icon" variant="outline" icon="i-lucide:minus" aria-label="减少进度" :disabled="dynamicPercent <= 0" @click="changePercent(-10)" />
            <Button size="icon" variant="outline" icon="i-lucide:plus" aria-label="增加进度" :disabled="dynamicPercent >= 100" @click="changePercent(10)" />
            <span class="ml-1 text-xs font-medium tabular-nums text-tertiary">{{ dynamicPercent }}%</span>
          </div>
        </div>
      </section>

      <section class="grid gap-3">
        <h3 class="text-xs font-bold text-tertiary">圆形与仪表盘</h3>
        <div class="flex flex-wrap items-end gap-6">
          <Progress type="circle" :percent="75" size="sm" />
          <Progress type="circle" :percent="100" />
          <Progress type="circle" :percent="68" status="exception" size="lg" />
          <Progress type="dashboard" :percent="72" :format="(value) => `${value} 分`" />
        </div>
      </section>

      <section class="grid gap-3">
        <h3 class="text-xs font-bold text-tertiary">尺寸</h3>
        <div class="grid max-w-3xl gap-4">
          <div class="grid gap-2">
            <span class="text-xs text-tertiary">线形</span>
            <div v-for="size in progressSizes" :key="`line-${size}`" class="grid grid-cols-[32px_minmax(0,1fr)] items-center gap-3">
              <span class="text-xs text-tertiary">{{ size }}</span>
              <Progress :percent="58" :size="size" />
            </div>
          </div>
          <div class="flex flex-wrap items-end gap-6">
            <div v-for="size in progressSizes" :key="`circle-${size}`" class="grid justify-items-center gap-2">
              <Progress type="circle" :percent="58" :size="size" />
              <span class="text-xs text-tertiary">{{ size }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="grid gap-3">
        <h3 class="text-xs font-bold text-tertiary">步骤与渐变</h3>
        <div class="grid max-w-3xl gap-4">
          <Progress :percent="64" :steps="8" />
          <Progress :percent="72" :stroke-color="['#0ea5e9', '#06b6d4', '#14b8a6', '#22c55e']" :steps="10" />
          <Progress :percent="78" :stroke-color="progressGradient" :stroke-width="10" />
          <div class="flex flex-wrap gap-6">
            <Progress type="circle" :percent="82" :stroke-color="progressGradient" />
            <Progress type="dashboard" :percent="66" :stroke-color="progressGradient" gap-placement="start" />
          </div>
        </div>
      </section>

      <section class="grid gap-3">
        <h3 class="text-xs font-bold text-tertiary">自定义信息</h3>
        <div class="grid max-w-3xl gap-4">
          <Progress :percent="48" :format="(value) => `${value} / 100`" />
          <Progress type="circle" :percent="42">
            <template #info="{ percent }">
              <span class="grid gap-0.5">
                <strong class="text-base/5 text-primary">{{ percent }}%</strong>
                <small class="text-[10px]/3 text-tertiary">已同步</small>
              </span>
            </template>
          </Progress>
        </div>
      </section>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="progressApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="progressProps" />
          </TabPane>
          <TabPane name="slots" label="Slots">
            <ParamTable :columns="slotsColumns" :rows="progressSlots" />
          </TabPane>
        </Tabs>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">示例代码</h3>
      </div>
      <div class="p-4">
        <CodeBlock :code="progressCodeExample" lang="html" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Button } from '@unoui/vue/button'
import { Progress, type ProgressGradient, type ProgressSize } from '@unoui/vue/progress'
import { Tabs, TabPane } from '@unoui/vue/tab'
import { ref } from 'vue'

import CodeBlock from '@/components/CodeBlock.vue'
import ParamTable from '@/components/ParamTable.vue'
import { progressCodeExample, progressProps, progressSlots } from '@/data/progress'
import { propsColumns, slotsColumns } from '@/data/shared'

const progressApiTab = ref('props')
const progressSizes: ProgressSize[] = ['sm', 'md', 'lg', 'xl', 'xxl']
const dynamicPercent = ref(40)
const progressGradient: ProgressGradient = {
  from: '#0ea5e9',
  to: '#22c55e',
  direction: 'to right'
}

function changePercent(offset: number) {
  dynamicPercent.value = Math.min(100, Math.max(0, dynamicPercent.value + offset))
}
</script>
