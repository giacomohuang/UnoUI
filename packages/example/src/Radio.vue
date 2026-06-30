<template>
  <section id="showcase-radio" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">Radio</h2>
      <p class="mt-1 text-xs text-tertiary">单组件标量 v-model，多个 Radio 绑定同一个值即可组成单选组。</p>
    </div>
    <div class="grid gap-5 p-4 text-sm text-secondary">
      <div class="grid gap-2 md:grid-cols-[72px_minmax(0,1fr)] md:items-center">
        <span class="text-xs font-medium text-tertiary">尺寸</span>
        <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Radio v-for="size in radioSizes" :key="`radio-size-${size}`" checked :size="size" :value="size" :name="`radio-size-demo-${size}`">
            <span class="font-mono text-xs">{{ size }}</span>
          </Radio>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[72px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">状态</span>
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div class="flex min-h-9 items-center rounded-md bg-secondary/60 px-3">
            <Radio v-model="radioStatusValue" value="controlled" name="radio-status">受控：{{ radioStatusValue }}</Radio>
          </div>
          <div class="flex min-h-9 items-center rounded-md bg-secondary/60 px-3">
            <Radio checked value="default" name="radio-default">默认选中</Radio>
          </div>
          <div class="flex min-h-9 items-center rounded-md bg-secondary/60 px-3">
            <Radio disabled value="disabled" name="radio-disabled">禁用未选</Radio>
          </div>
          <div class="flex min-h-9 items-center rounded-md bg-secondary/60 px-3">
            <Radio checked disabled value="checked-disabled" name="radio-checked-disabled">禁用选中</Radio>
          </div>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[72px_minmax(0,1fr)] md:items-start">
        <span class="pt-1.5 text-xs font-medium text-tertiary">组</span>
        <div class="grid gap-3">
          <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Radio v-for="option in radioModeOptions" :key="option.value" v-model="radioModeValue" name="radio-mode" :value="option.value" :disabled="option.disabled">
              {{ option.label }}
            </Radio>
          </div>
          <div class="flex flex-wrap items-center gap-2 text-xs text-tertiary">
            <span>当前</span>
            <span class="rounded border border-medium bg-secondary px-2 py-1 text-secondary">{{ radioModeValue }}</span>
          </div>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[72px_minmax(0,1fr)] md:items-start">
        <span class="pt-1.5 text-xs font-medium text-tertiary">边框</span>
        <div class="flex flex-wrap items-center gap-2">
          <Radio v-for="option in radioBorderOptions" :key="option.value" v-model="radioBorderValue" border name="radio-border" :value="option.value" :disabled="option.disabled">
            {{ option.label }}
          </Radio>
        </div>
      </div>
    </div>

    <!-- API 参数 -->
    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="radioApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="radioProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="radioEmits" />
          </TabPane>
          <TabPane name="slots" label="Slots">
            <ParamTable :columns="slotsColumns" :rows="radioSlots" />
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
        <CodeBlock :code="radioCodeExample" lang="html" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Radio } from '@unoui/vue/radio'
import { Tabs, TabPane } from '@unoui/vue/tab'
import { propsColumns, emitsColumns, slotsColumns } from '@/data/shared'
import { radioProps, radioEmits, radioSlots, radioCodeExample } from '@/data/radio'
import ParamTable from '@/components/ParamTable.vue'
import CodeBlock from '@/components/CodeBlock.vue'

type RadioSize = 'sm' | 'md' | 'lg'

const radioApiTab = ref('props')
const radioSizes: RadioSize[] = ['sm', 'md', 'lg']
const radioStatusValue = ref('controlled')
const radioModeValue = ref('map')
const radioModeOptions = [
  { label: '地图视图', value: 'map' },
  { label: '列表视图', value: 'list' },
  { label: '统计视图', value: 'stats' },
  { label: '禁用项', value: 'disabled', disabled: true }
]
const radioBorderValue = ref('daily')
const radioBorderOptions = [
  { label: '日报', value: 'daily' },
  { label: '周报', value: 'weekly' },
  { label: '月报', value: 'monthly' },
  { label: '冻结', value: 'locked', disabled: true }
]
</script>
