<template>
  <section id="showcase-checkbox" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">Checkbox</h2>
      <p class="mt-1 text-xs text-tertiary">原生 input 封装，展示尺寸、状态和数组绑定的分组选项。</p>
    </div>
    <div class="grid gap-5 p-4 text-sm text-secondary">
      <div class="grid gap-2 md:grid-cols-[72px_minmax(0,1fr)] md:items-center">
        <span class="text-xs font-medium text-tertiary">尺寸</span>
        <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
          <label v-for="size in checkboxSizes" :key="size" class="flex items-center gap-2">
            <Checkbox checked :size="size" />
            <span class="font-mono text-xs">{{ size }}</span>
          </label>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[72px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">状态</span>
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label class="flex min-h-9 items-center gap-2 rounded-md bg-secondary/60 px-3">
            <Checkbox v-model="checkboxEnabled" />
            <span>受控：{{ checkboxEnabled ? 'true' : 'false' }}</span>
          </label>
          <label class="flex min-h-9 items-center gap-2 rounded-md bg-secondary/60 px-3">
            <Checkbox checked />
            <span>默认选中</span>
          </label>
          <label class="flex min-h-9 items-center gap-2 rounded-md bg-secondary/60 px-3">
            <Checkbox disabled />
            <span>禁用未选</span>
          </label>
          <label class="flex min-h-9 items-center gap-2 rounded-md bg-secondary/60 px-3">
            <Checkbox checked disabled />
            <span>禁用选中</span>
          </label>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[72px_minmax(0,1fr)] md:items-start">
        <span class="pt-1.5 text-xs font-medium text-tertiary">组</span>
        <div class="grid gap-3">
          <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
            <label v-for="option in checkboxGroupOptions" :key="option.value" class="flex items-center gap-2">
              <Checkbox v-model="checkboxGroupValue" :value="option.value" :disabled="option.disabled" />
              <span>{{ option.label }}</span>
            </label>
          </div>
          <div class="flex flex-wrap items-center gap-2 text-xs text-tertiary">
            <span>已选</span>
            <span class="rounded border border-medium bg-secondary px-2 py-1 text-secondary">{{ checkboxGroupValue.join('、') || '无' }}</span>
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
        <Tabs v-model="checkboxApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="checkboxProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="checkboxEmits" />
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
        <CodeBlock :code="checkboxCodeExample" lang="html" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Checkbox } from '@unoui/vue/checkbox'
import { Tabs, TabPane } from '@unoui/vue/tab'
import { propsColumns, emitsColumns } from '@/data/shared'
import { checkboxProps, checkboxEmits, checkboxCodeExample } from '@/data/checkbox'
import ParamTable from '@/components/ParamTable.vue'
import CodeBlock from '@/components/CodeBlock.vue'

type CheckboxSize = 'sm' | 'md' | 'lg'

const checkboxApiTab = ref('props')
const checkboxEnabled = ref(true)
const checkboxSizes: CheckboxSize[] = ['sm', 'md', 'lg']
const checkboxGroupValue = ref<string[]>(['地图编辑', '路径规划'])
const checkboxGroupOptions = [
  { label: '地图编辑', value: '地图编辑' },
  { label: '路径规划', value: '路径规划' },
  { label: '资源管理', value: '资源管理' },
  { label: '禁用项', value: '禁用项', disabled: true }
]
</script>
