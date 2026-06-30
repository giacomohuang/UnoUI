<template>
  <section id="showcase-select" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">Select</h2>
      <p class="mt-1 text-xs text-tertiary">展示单选、多选、过滤、清空和折叠标签。</p>
    </div>
    <div class="grid gap-3 p-4 text-sm text-secondary xl:grid-cols-3">
      <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
        <h3 class="text-sm font-bold text-secondary">Select</h3>
        <Select v-model="selectValue" :options="selectOptions" clearable placeholder="选择模块" />
        <Select v-model="selectSmallValue" :options="selectOptions" size="sm" placeholder="小尺寸" />
        <Select v-model="selectFixedWidthValue" :options="selectOptions" width="220px" placeholder="固定宽度" />
        <Select v-model="selectDisabledValue" :options="selectOptions" disabled />
        <div class="text-xs text-tertiary">当前值：{{ selectValue || '空' }}</div>
      </div>

      <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
        <h3 class="text-sm font-bold text-secondary">Filterable</h3>
        <Select v-model="selectFilterValue" :options="selectOptions" filterable clearable placeholder="搜索组件" />
        <Select v-model="selectCustomValue" :options="selectOptions" filterable clearable>
          <template #prefix>
            <span class="i-lucide:search size-4"></span>
          </template>
          <template #option="{ label, selected, disabled }">
            <div class="flex min-h-9 cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-secondary" :class="[selected ? 'bg-brand/10 text-brand' : 'text-primary', disabled ? 'pointer-events-none opacity-50' : '']">
              <span class="i-lucide:component size-4"></span>
              <span class="min-w-0 flex-1 truncate">{{ label }}</span>
              <Tag v-if="disabled" color="gray" size="sm">disabled</Tag>
              <span v-if="selected" class="i-lucide:check size-4"></span>
            </div>
          </template>
        </Select>
        <div class="text-xs text-tertiary">过滤值：{{ selectFilterValue || '空' }}</div>
      </div>

      <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
        <h3 class="text-sm font-bold text-secondary">Multiple</h3>
        <Select v-model="selectMultipleValue" :options="selectOptions" multiple clearable placeholder="多选组件" />
        <Select v-model="selectCollapseValue" :options="selectOptions" multiple collapse-tags clearable placeholder="折叠标签" />
        <div class="text-xs text-tertiary">已选：{{ selectMultipleValue.join('、') || '无' }}</div>
      </div>
    </div>

    <!-- API 参数 -->
    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="selectApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="selectProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="selectEmits" />
          </TabPane>
          <TabPane name="slots" label="Slots">
            <ParamTable :columns="slotsColumns" :rows="selectSlots" />
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
        <CodeBlock :code="selectCodeExample" lang="html" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Select, type SelectOption } from '@unoui/vue/select'
import { Tag } from '@unoui/vue/tag'
import { Tabs, TabPane } from '@unoui/vue/tab'
import { propsColumns, emitsColumns, slotsColumns } from '@/data/shared'
import { selectProps, selectEmits, selectSlots, selectCodeExample } from '@/data/select'
import ParamTable from '@/components/ParamTable.vue'
import CodeBlock from '@/components/CodeBlock.vue'

const selectApiTab = ref('props')
const selectValue = ref('button')
const selectSmallValue = ref('tag')
const selectFixedWidthValue = ref('')
const selectDisabledValue = ref('modal')
const selectFilterValue = ref('')
const selectCustomValue = ref('table')
const selectMultipleValue = ref<string[]>(['button', 'input'])
const selectCollapseValue = ref<string[]>(['button', 'input', 'table'])
const selectOptions: SelectOption[] = [
  { label: 'Button 按钮', value: 'button' },
  { label: 'Input 输入框', value: 'input' },
  { label: 'Table 表格', value: 'table' },
  { label: 'Tag 标签', value: 'tag' },
  { label: 'Modal 弹窗', value: 'modal' },
  { label: 'Disabled 禁用', value: 'disabled', disabled: true }
]
</script>
