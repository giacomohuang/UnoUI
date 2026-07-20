<template>
  <div id="showcase-dropdown" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">Dropdown</h2>
    </div>
    <div class="flex flex-wrap items-center gap-4 p-4">
      <Dropdown v-model:value="dropdownValue" :items="dropdownItems" value-key="value" width="220px">
        <template #trigger="{ open }">
          <Button variant="outline" icon="i-lucide:chevron-down" :class="open ? 'text-brand!' : ''">单选：{{ dropdownValue }}</Button>
        </template>
        <template #item="{ item, selected }">
          <div class="flex min-h-9 cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm">
            <span>{{ getDropdownLabel(item) }}</span>
            <span v-if="selected" class="i-lucide:check size-4"></span>
          </div>
        </template>
      </Dropdown>

      <Dropdown v-model:value="dropdownMultiValue" :items="dropdownItems" value-key="value" align="right" width="240px">
        <template #trigger="{ open }">
          <Button variant="mono" icon="i-lucide:list-checks" :class="open ? 'text-brand!' : ''">多选：{{ dropdownMultiValue.length }}</Button>
        </template>
        <template #item="{ item, selected }">
          <div class="flex min-h-9 cursor-pointer items-center gap-2 px-3 py-2 text-sm">
            <span class="flex size-4 items-center justify-center rounded border border-medium bg-primary">
              <span v-if="selected" class="i-lucide:check size-3 text-brand"></span>
            </span>
            <span>{{ getDropdownLabel(item) }}</span>
            <Tag v-if="isDropdownDisabled(item)" color="gray" size="sm" class="ml-auto">disabled</Tag>
          </div>
        </template>
        <template #footer>
          <div class="border-t border-medium px-3 py-2 text-xs text-tertiary">包含禁用项和右对齐菜单。</div>
        </template>
      </Dropdown>

      <Dropdown :items="dropdownItems" value-key="value" trigger="hover" placement="bottom" arrow width="220px" @open-change="handleOpenChange">
        <template #trigger="{ open }">
          <Button variant="outline" icon="i-lucide:mouse-pointer-click" :class="open ? 'text-brand!' : ''">悬停触发</Button>
        </template>
        <template #item="{ item }">
          <div class="flex min-h-9 cursor-pointer items-center gap-3 px-3 py-2 text-sm">
            <span class="i-lucide:sparkles size-4 shrink-0 text-brand"></span>
            <span>{{ getDropdownLabel(item) }}</span>
          </div>
        </template>
      </Dropdown>

      <Dropdown :items="dropdownItems" value-key="value" trigger="contextMenu" placement="bottomLeft" :arrow="{ pointAtCenter: true }" width="220px">
        <template #trigger="{ open }">
          <Button variant="mono" icon="i-lucide:mouse-pointer-2" :class="open ? 'text-brand!' : ''">右键菜单</Button>
        </template>
        <template #item="{ item }">
          <div class="flex min-h-9 cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm">
            <span>{{ getDropdownLabel(item) }}</span>
            <span class="text-xs text-tertiary">{{ getDropdownValue(item) }}</span>
          </div>
        </template>
      </Dropdown>

      <Dropdown :items="dropdownItems" value-key="value" placement="topRight" arrow width="220px" content-class="ui-showcase-dropdown-popup">
        <template #trigger="{ open }">
          <Button variant="outline" icon="i-lucide:arrow-up-right" :class="open ? 'text-brand!' : ''">上方右对齐</Button>
        </template>
        <template #item="{ item }">
          <div class="flex min-h-9 cursor-pointer items-center gap-3 px-3 py-2 text-sm">
            <span>{{ getDropdownLabel(item) }}</span>
          </div>
        </template>
      </Dropdown>
    </div>

    <div class="border-t border-medium px-4 py-3">
      <h3 class="text-sm font-bold text-secondary">弹出方向</h3>
    </div>
    <div class="grid gap-3 p-4 sm:grid-cols-3">
      <div v-for="placement in placementExamples" :key="placement.value" class="flex min-h-20 items-center justify-center rounded border border-dashed border-medium bg-secondary/30">
        <Dropdown :items="dropdownItems" value-key="value" :placement="placement.value" arrow width="200px" :auto-adjust-overflow="false">
          <template #trigger="{ open }">
            <Button size="sm" variant="outline" :class="open ? 'text-brand!' : ''">{{ placement.label }}</Button>
          </template>
          <template #item="{ item }">
            <div class="flex min-h-8 cursor-pointer items-center px-3 py-1.5 text-sm">
              {{ getDropdownLabel(item) }}
            </div>
          </template>
        </Dropdown>
      </div>
    </div>

    <!-- API 参数 -->
    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="dropdownApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="dropdownProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="dropdownEmits" />
          </TabPane>
          <TabPane name="slots" label="Slots">
            <ParamTable :columns="slotsColumns" :rows="dropdownSlots" />
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
        <CodeBlock :code="dropdownCodeExample" lang="html" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@mcistudio/unoui-vue/button'
import { Dropdown } from '@mcistudio/unoui-vue/dropdown'
import { Tabs, TabPane } from '@mcistudio/unoui-vue/tab'
import { Tag } from '@mcistudio/unoui-vue/tag'
import { ref } from 'vue'

import CodeBlock from '@/components/CodeBlock.vue'
import ParamTable from '@/components/ParamTable.vue'
import { dropdownProps, dropdownEmits, dropdownSlots, dropdownCodeExample } from '@/data/dropdown'
import { propsColumns, emitsColumns, slotsColumns } from '@/data/shared'

const dropdownApiTab = ref('props')

interface DropdownOption {
  label: string
  value: string
  disabled?: boolean
}

const dropdownValue = ref('brand')
const dropdownMultiValue = ref<string[]>(['brand', 'green'])

const dropdownItems: DropdownOption[] = [
  { label: '品牌色', value: 'brand' },
  { label: '成功态', value: 'green' },
  { label: '警告态', value: 'yellow' },
  { label: '禁用项', value: 'disabled', disabled: true }
]

const placementExamples = [
  { label: 'topLeft', value: 'topLeft' },
  { label: 'top', value: 'top' },
  { label: 'topRight', value: 'topRight' },
  { label: 'bottomLeft', value: 'bottomLeft' },
  { label: 'bottom', value: 'bottom' },
  { label: 'bottomRight', value: 'bottomRight' }
] as const

const getDropdownLabel = (item: object) => ('label' in item ? String(item.label) : '')
const getDropdownValue = (item: object) => ('value' in item ? String(item.value) : '')
const isDropdownDisabled = (item: object) => ('disabled' in item ? Boolean(item.disabled) : false)
const handleOpenChange = (_open: boolean, _info: { source: 'trigger' | 'menu' }) => {}
</script>
