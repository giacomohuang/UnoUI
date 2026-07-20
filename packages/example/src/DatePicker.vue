<template>
  <section id="showcase-datepicker" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">DatePicker</h2>
      <p class="mt-1 text-xs text-tertiary">日期选择组件，支持单日期、日期时间、月份、年份和范围选择，展示尺寸、清空、禁用、格式化和范围限制。</p>
    </div>

    <div class="grid gap-5 p-4 text-sm text-secondary">
      <div class="grid gap-3 xl:grid-cols-3">
        <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="text-sm font-bold text-secondary">基础日期</h3>
          <DatePicker v-model="dateValue" clearable />
          <DatePicker v-model="dateSmallValue" size="sm" placeholder="小尺寸日期" />
          <DatePicker v-model="dateLargeValue" size="lg" placeholder="大尺寸日期" />
          <div class="text-xs text-tertiary">当前值：{{ dateValue || '空' }}</div>
        </div>

        <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="text-sm font-bold text-secondary">日期时间</h3>
          <DatePicker v-model="datetimeValue" show-time clearable value-format="YYYY-MM-DD HH:mm:ss" />
          <DatePicker v-model="datetimeMinuteValue" :show-time="{ format: 'HH:mm', minuteStep: 15, showSecond: false }" format="YYYY-MM-DD HH:mm" value-format="YYYY-MM-DD HH:mm" />
          <div class="text-xs text-tertiary">时间值：{{ datetimeValue || '空' }}</div>
        </div>

        <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="text-sm font-bold text-secondary">状态</h3>
          <DatePicker v-model="dateDisabledValue" disabled />
          <DatePicker v-model="dateRangeValue" min-date="2026-06-10" max-date="2026-06-20" placeholder="仅 6 月 10-20 日可选" />
          <DatePicker v-model="dateWeekendValue" :disabled-date="disabledWeekend" placeholder="禁用周末" />
          <div class="text-xs text-tertiary">范围值：{{ dateRangeValue || '空' }}</div>
        </div>
      </div>

      <div class="grid gap-3 xl:grid-cols-3">
        <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="text-sm font-bold text-secondary">年 / 月快速选择</h3>
          <DatePicker v-model="monthValue" picker="month" clearable />
          <DatePicker v-model="yearValue" picker="year" clearable />
          <DatePicker v-model="limitedMonthValue" picker="month" min-date="2026-03" max-date="2026-09" placeholder="仅 2026-03 到 2026-09" />
          <div class="text-xs text-tertiary">月份：{{ monthValue || '空' }} / 年份：{{ yearValue || '空' }}</div>
        </div>

        <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="text-sm font-bold text-secondary">日期范围</h3>
          <RangePicker v-model="dateRangePair" clearable />
          <RangePicker v-model="datetimeRangePair" show-time clearable value-format="YYYY-MM-DD HH:mm:ss" />
          <RangePicker v-model="limitedDateRangePair" min-date="2026-06-01" max-date="2026-06-30" :placeholder="['开始', '结束']" />
          <div class="text-xs text-tertiary">范围：{{ datetimeRangePair.join(' ~ ') || '空' }}</div>
        </div>

        <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="text-sm font-bold text-secondary">月份 / 年份范围</h3>
          <RangePicker v-model="monthRangePair" picker="month" clearable />
          <RangePicker v-model="yearRangePair" picker="year" clearable />
          <div class="text-xs text-tertiary">月份范围：{{ monthRangePair.join(' ~ ') || '空' }}</div>
        </div>

        <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="text-sm font-bold text-secondary">连接图标</h3>
          <RangePicker v-model="iconRangePair" clearable />
          <RangePicker v-model="iconMonthRangePair" picker="month" separator-icon="i-ant-design:swap-right-outlined" />
          <div class="text-xs text-tertiary">图标范围：{{ iconRangePair.join(' ~ ') || '空' }}</div>
        </div>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数 — DatePicker</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="datePickerApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="datePickerProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="datePickerEmits" />
          </TabPane>
          <TabPane name="exposes" label="Expose">
            <ParamTable :columns="exposedColumns" :rows="datePickerExposes" />
          </TabPane>
        </Tabs>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数 — RangePicker</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="rangePickerApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="rangePickerProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="rangePickerEmits" />
          </TabPane>
        </Tabs>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">示例代码</h3>
      </div>
      <div class="p-4">
        <CodeBlock :code="datePickerCodeExample" lang="html" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Dayjs } from 'dayjs'
import { ref } from 'vue'

import { DatePicker, RangePicker } from '@mcistudio/unoui-vue/datepicker'
import { Tabs, TabPane } from '@mcistudio/unoui-vue/tab'
import { propsColumns, emitsColumns, exposedColumns } from '@/data/shared'
import { datePickerCodeExample, datePickerEmits, datePickerExposes, datePickerProps, rangePickerEmits, rangePickerProps } from '@/data/datepicker'
import CodeBlock from '@/components/CodeBlock.vue'
import ParamTable from '@/components/ParamTable.vue'

const datePickerApiTab = ref('props')
const rangePickerApiTab = ref('props')
const dateValue = ref('2026-06-24')
const dateSmallValue = ref('2026-06-01')
const dateLargeValue = ref('2026-06-30')
const datetimeValue = ref('2026-06-24 10:30:00')
const datetimeMinuteValue = ref('2026-06-24 15:45')
const dateDisabledValue = ref('2026-06-24')
const dateRangeValue = ref('2026-06-12')
const dateWeekendValue = ref('')
const monthValue = ref('2026-06')
const yearValue = ref('2026')
const limitedMonthValue = ref('2026-06')
const dateRangePair = ref<[string, string]>(['2026-06-01', '2026-06-24'])
const datetimeRangePair = ref<[string, string]>(['2026-06-01 08:30:00', '2026-06-24 18:00:00'])
const limitedDateRangePair = ref<[string, string]>(['2026-06-10', '2026-06-20'])
const monthRangePair = ref<[string, string]>(['2026-03', '2026-09'])
const yearRangePair = ref<[string, string]>(['2024', '2026'])
const iconRangePair = ref<[string, string]>(['2026-07-01', '2026-07-18'])
const iconMonthRangePair = ref<[string, string]>(['2026-08', '2026-10'])

const disabledWeekend = (date: Dayjs) => date.day() === 0 || date.day() === 6
</script>
