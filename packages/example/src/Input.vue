<template>
  <section id="showcase-input" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">Input</h2>
      <p class="mt-1 text-xs text-tertiary">展示尺寸、禁用、前后缀、密码、清空、多行、复合插槽、字数限制、formatter 和 number 拖拽。</p>
    </div>
    <div class="grid gap-5 p-4 text-sm text-secondary">
      <div class="grid gap-3 xl:grid-cols-3">
        <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="text-sm font-bold text-secondary">尺寸</h3>
          <Input v-model="inputSizeValues.sm" size="sm" placeholder="sm" prefix-icon="i-lucide:minus" />
          <Input v-model="inputSizeValues.md" size="md" placeholder="md" prefix-icon="i-lucide:equal" />
          <Input v-model="inputSizeValues.lg" size="lg" placeholder="lg" prefix-icon="i-lucide:plus" />
        </div>

        <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="text-sm font-bold text-secondary">状态</h3>
          <Input v-model="inputBasicValue" placeholder="普通输入" />
          <Input model-value="禁用内容" disabled prefix-icon="i-lucide:lock" />
          <Input v-model="inputReadonlyValue" readonly suffix="readonly" />
        </div>

        <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="text-sm font-bold text-secondary">前缀 / 后缀</h3>
          <Input v-model="inputIconValue" prefix-icon="i-lucide:search" suffix-icon="i-lucide:command" placeholder="图标前后缀" />
          <Input v-model="inputUnitValue" prefix="X" suffix="m" placeholder="文字前后缀" />
          <Input v-model="inputSlotValue" placeholder="slot 前后缀">
            <template #prefix>
              <Tag color="brand" size="sm" radius="sm" class="px-1.5! py-0.5!">ID</Tag>
            </template>
            <template #suffix>
              <span class="font-mono text-[10px] text-tertiary">.json</span>
            </template>
          </Input>
        </div>
      </div>

      <div class="grid gap-3 xl:grid-cols-3">
        <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="text-sm font-bold text-secondary">密码 / 清空</h3>
          <Input v-model="inputPasswordValue" password clearable placeholder="密码输入" autocomplete="current-password" />
          <Input v-model="inputClearValue" clearable placeholder="默认清空图标" />
          <Input v-model="inputCustomClearValue" clearable clear-icon="i-lucide:trash-2" placeholder="自定义清空图标" />
        </div>

        <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="text-sm font-bold text-secondary">单行 / 多行</h3>
          <Input v-model="inputSingleLineValue" placeholder="单行文本" />
          <Input v-model="inputMultilineValue" multiline :rows="4" :maxlength="120" show-word-limit placeholder="多行文本" />
        </div>

        <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="text-sm font-bold text-secondary">复合输入框</h3>
          <Input v-model="inputCompoundUrl">
            <template #prepend><span>https://</span></template>
            <template #append>.unoui.local</template>
          </Input>
          <Input v-model="inputCompoundAmount" type="number" :precision="2">
            <template #prepend>
              <span class="i-lucide:wallet size-4"></span>
            </template>
            <template #append>CNY</template>
          </Input>
        </div>
      </div>

      <div class="grid gap-3 xl:grid-cols-4">
        <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="text-sm font-bold text-secondary">字数限制</h3>
          <Input v-model="inputLimitedValue" :maxlength="24" show-word-limit clearable placeholder="最多 24 个字符" />
          <div class="text-xs text-tertiary">当前值：{{ inputLimitedValue || '空' }}</div>
        </div>

        <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="text-sm font-bold text-secondary">Formatter</h3>
          <Input v-model="inputFormatterValue" :formatter="formatCurrencyInput" :parser="parseCurrencyInput" prefix="¥" clearable />
          <div class="text-xs text-tertiary">modelValue：{{ inputFormatterValue || '空' }}</div>
        </div>

        <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3 xl:col-span-2">
          <h3 class="text-sm font-bold text-secondary">Autocomplete</h3>
          <Autocomplete v-model="inputAutocompleteValue" :data-source="inputAutocompleteOptions" clearable prefix-icon="i-lucide:search" placeholder="搜索点位" />
          <Autocomplete v-model="inputRemoteAutocompleteValue" :data-source="queryInputRemoteAutocomplete" :debounce="150" clearable prefix-icon="i-lucide:map-pin" placeholder="远程搜索点位">
            <template #suggestion="{ item }">
              <div class="flex min-h-9 cursor-pointer items-center gap-2 px-3 py-2 text-sm text-primary transition-colors hover:bg-secondary">
                <span class="min-w-0 flex-1 truncate">{{ getInputSuggestionValue(item) }}</span>
                <Tag color="gray" size="sm" radius="sm">{{ getInputSuggestionType(item) }}</Tag>
              </div>
            </template>
          </Autocomplete>
          <div class="text-xs text-tertiary">当前点位：{{ inputAutocompleteValue || inputRemoteAutocompleteValue || '空' }}</div>
        </div>

        <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="text-sm font-bold text-secondary">Number / 拖拽</h3>
          <Input v-model.number="inputNumberValue" type="number" draggable drag-icon="i-mdi:alpha-x" :step="0.1" :precision="2" :min="-10" :max="10" suffix="m" />
          <Input v-model.number="inputRotateValue" type="number" draggable drag-icon="i-lucide:rotate-cw" :step="0.001" :drag-step="0.01" :precision="3" suffix="°" />
          <div class="text-xs text-tertiary">拖动左侧图标改变数值：{{ inputNumberValue }} / {{ inputRotateValue }}</div>
        </div>

        <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3 xl:col-span-2">
          <h3 class="text-sm font-bold text-secondary">Tag 输入</h3>
          <InputTag v-model="inputTags" clearable placeholder="输入标签后回车" input-placeholder="继续添加" />
          <InputTag v-model="inputLayerTags" size="sm" :trigger="['Enter', 'Tab', ',']" :delimiters="[',', '，']" clearable placeholder="支持逗号分隔" tag-color="blue" tag-variant="plain">
            <template #prefix>
              <span class="i-lucide:tags size-4"></span>
            </template>
          </InputTag>
          <InputTag v-model="inputStatusTags" size="lg" :max="4" placeholder="最多 4 个标签" tag-color="green" clearable>
            <template #tag="{ tag }">
              <span class="font-mono">{{ tag }}</span>
            </template>
          </InputTag>
          <div class="text-xs text-tertiary">当前标签：{{ inputTags.join(' / ') || '空' }}</div>
        </div>

        <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3 xl:col-span-2">
          <h3 class="text-sm font-bold text-secondary">I18n 输入</h3>
          <InputI18n v-model="inputI18nName" :languages="inputI18nLanguages" clearable prefix-icon="i-lucide:languages" placeholder="多语言名称" />
          <InputI18n v-model="inputI18nDescription" :languages="inputI18nLanguages" size="sm" placeholder="多语言描述" />
          <div class="grid grid-cols-2 gap-2 text-xs text-tertiary">
            <span class="truncate rounded border border-medium bg-secondary px-2 py-1">ZH：{{ inputI18nName['zh-CN'] || '空' }}</span>
            <span class="truncate rounded border border-medium bg-secondary px-2 py-1">EN：{{ inputI18nName.en || '空' }}</span>
          </div>
        </div>

        <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3 xl:col-span-4">
          <h3 class="text-sm font-bold text-secondary">与 Button 并列</h3>
          <div class="flex min-w-0 flex-wrap items-center gap-2 xl:flex-nowrap">
            <Input v-model="inputInlineActions.smCode" size="sm" prefix-icon="i-lucide:search" placeholder="编号" />
            <Input v-model="inputInlineActions.smKeyword" size="sm" placeholder="关键词" />
            <Button size="icon" icon="i-lucide:search"></Button>
            <Button size="sm" icon="i-lucide:search">查询</Button>
            <Button size="sm" variant="outline" icon="i-lucide:rotate-ccw">重置</Button>
            <Button size="sm" variant="mono" icon="i-lucide:settings">设置</Button>
          </div>
          <div class="flex min-w-0 flex-wrap items-center gap-2 xl:flex-nowrap">
            <Input v-model="inputInlineActions.mdName" size="md" clearable placeholder="名称" />
            <Input v-model="inputInlineActions.mdFloor" size="md" prefix="F" placeholder="楼层" />
            <Button size="icon-md" icon="i-lucide:search"></Button>
            <Button size="md" icon="i-lucide:plus">新增</Button>
            <Button size="md" variant="outline" icon="i-lucide:upload">导入</Button>
            <Button size="md" variant="mono" icon="i-lucide:download">导出</Button>
          </div>
          <div class="flex min-w-0 flex-wrap items-center gap-2 xl:flex-nowrap">
            <Input v-model="inputInlineActions.lgWidth" size="lg" suffix="m" placeholder="宽度" />
            <Input v-model="inputInlineActions.lgHeight" size="lg" suffix="m" placeholder="高度" />
            <Button size="icon-lg" icon="i-lucide:search"></Button>
            <Button size="lg" icon="i-lucide:save">保存</Button>
            <Button size="lg" variant="outline" icon="i-lucide:copy">复制</Button>
            <Button size="lg" variant="mono" icon="i-lucide:trash-2">删除</Button>
          </div>
        </div>
      </div>
    </div>

    <!-- API 参数 -->
    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数 — Input</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="inputApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="inputProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="inputEmits" />
          </TabPane>
          <TabPane name="slots" label="Slots">
            <ParamTable :columns="slotsColumns" :rows="inputSlots" />
          </TabPane>
        </Tabs>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数 — Autocomplete</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="autocompleteApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="autocompleteProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="autocompleteEmits" />
          </TabPane>
          <TabPane name="slots" label="Slots">
            <ParamTable :columns="slotsColumns" :rows="autocompleteSlots" />
          </TabPane>
        </Tabs>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数 — InputTag</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="inputTagApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="inputTagProps" />
          </TabPane>
        </Tabs>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数 — InputI18n</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="inputI18nApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="inputI18nProps" />
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
        <CodeBlock :code="inputCodeExample" lang="html" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Button } from '@mcistudio/unoui-vue/button'
import { Autocomplete, Input, InputI18n, InputTag } from '@mcistudio/unoui-vue/input'
import { Tabs, TabPane } from '@mcistudio/unoui-vue/tab'
import { Tag } from '@mcistudio/unoui-vue/tag'
import { ref } from 'vue'

import CodeBlock from '@/components/CodeBlock.vue'
import ParamTable from '@/components/ParamTable.vue'
import { inputProps, inputEmits, inputSlots, autocompleteProps, autocompleteEmits, autocompleteSlots, inputTagProps, inputI18nProps, inputCodeExample } from '@/data/input'
import { propsColumns, emitsColumns, slotsColumns } from '@/data/shared'

const inputApiTab = ref('props')
const autocompleteApiTab = ref('props')
const inputTagApiTab = ref('props')
const inputI18nApiTab = ref('props')
const inputSizeValues = ref({
  sm: 'Small',
  md: 'Medium',
  lg: 'Large'
})
const inputBasicValue = ref('管理端输入框')
const inputReadonlyValue = ref('只读输入')
const inputIconValue = ref('search-key')
const inputUnitValue = ref('12.5')
const inputSlotValue = ref('layout-001')
const inputPasswordValue = ref('unoui-admin')
const inputClearValue = ref('可一键清空')
const inputCustomClearValue = ref('自定义图标')
const inputSingleLineValue = ref('单行文本内容')
const inputMultilineValue = ref('多行文本可以用于备注、说明或长描述。')
const inputCompoundUrl = ref('admin')
const inputCompoundAmount = ref(128.8)
const inputLimitedValue = ref('字数统计')
const inputFormatterValue = ref('1234567')
const inputAutocompleteValue = ref('')
const inputRemoteAutocompleteValue = ref('')
const inputNumberValue = ref(1.5)
const inputRotateValue = ref(0.125)
const inputTags = ref(['入口', '扶梯'])
const inputLayerTags = ref(['L1', 'B1'])
const inputStatusTags = ref(['stable', 'review'])
const inputI18nLanguages = ['zh-CN', 'en', 'zh-HK']
const inputI18nName = ref({
  'zh-CN': '主入口',
  en: 'Main Entrance',
  'zh-HK': '主入口'
})
const inputI18nDescription = ref({
  'zh-CN': '靠近中庭的主入口',
  en: 'Main entrance near the atrium',
  'zh-HK': '靠近中庭的主入口'
})
const inputInlineActions = ref({
  smCode: 'A-102',
  smKeyword: '入口',
  mdName: '主入口',
  mdFloor: 'L1',
  lgWidth: '36.50',
  lgHeight: '12.00'
})
const inputAutocompleteOptions = [
  { value: '主入口', type: '入口' },
  { value: '中庭扶梯', type: '设施' },
  { value: '服务台', type: '服务' },
  { value: 'B1 停车场入口', type: '停车' },
  { value: '会员中心', type: '服务' }
]

const formatCurrencyInput = (value: string) => value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
const parseCurrencyInput = (value: string) => value.replaceAll(',', '')
const getInputSuggestionValue = (item: unknown) => String((item as { value?: unknown }).value ?? '')
const getInputSuggestionType = (item: unknown) => String((item as { type?: unknown }).type ?? '')
const queryInputRemoteAutocomplete = (query: string, callback: (items: typeof inputAutocompleteOptions) => void) => {
  window.setTimeout(() => {
    const keyword = query.trim().toLowerCase()
    callback(keyword ? inputAutocompleteOptions.filter((item) => item.value.toLowerCase().includes(keyword)) : inputAutocompleteOptions)
  }, 180)
}
</script>
