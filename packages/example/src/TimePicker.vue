<template>
  <section id="showcase-timepicker" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">TimePicker</h2>
      <p class="mt-1 text-xs text-tertiary">时间选择组件，支持单时间、时间范围、跨次日时段、步长、12 小时制、禁用时间、清空、此刻和确认后提交。</p>
    </div>

    <div class="grid gap-5 p-4 text-sm text-secondary">
      <div class="grid gap-3 xl:grid-cols-3">
        <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="text-sm font-bold text-secondary">基础时间</h3>
          <TimePicker v-model="timeValue" clearable />
          <TimePicker v-model="timeSmallValue" size="sm" placeholder="小尺寸时间" />
          <TimePicker v-model="timeLargeValue" size="lg" placeholder="大尺寸时间" />
          <div class="text-xs text-tertiary">当前值：{{ timeValue || '空' }}</div>
        </div>

        <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="text-sm font-bold text-secondary">时分 / 步长</h3>
          <TimePicker v-model="minuteValue" format="HH:mm" value-format="HH:mm" :minute-step="15" clearable />
          <TimePicker v-model="steppedValue" :hour-step="2" :minute-step="10" :second-step="15" value-format="HH:mm:ss" />
          <div class="text-xs text-tertiary">时分：{{ minuteValue || '空' }}</div>
        </div>

        <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="text-sm font-bold text-secondary">12 小时制</h3>
          <TimePicker v-model="twelveHourValue" use12-hours clearable />
          <TimePicker v-model="twelveHourMinuteValue" use12-hours format="h:mm A" value-format="HH:mm" />
          <div class="text-xs text-tertiary">12 小时：{{ twelveHourValue || '空' }}</div>
        </div>
      </div>

      <div class="grid gap-3 xl:grid-cols-3">
        <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="text-sm font-bold text-secondary">确认提交</h3>
          <TimePicker v-model="confirmValue" need-confirm value-format="HH:mm:ss" />
          <TimePicker v-model="confirmMinuteValue" need-confirm format="HH:mm" value-format="HH:mm" :show-now="false" />
          <div class="text-xs text-tertiary">确认值：{{ confirmValue || '空' }}</div>
        </div>

        <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="text-sm font-bold text-secondary">禁用时间</h3>
          <TimePicker v-model="disabledRangeValue" :disabled-time="disabledWorkBreak" value-format="HH:mm:ss" />
          <TimePicker v-model="hiddenDisabledValue" :disabled-time="disabledOddMinutes" hide-disabled-options format="HH:mm" value-format="HH:mm" :minute-step="5" />
          <div class="text-xs text-tertiary">可选值：{{ hiddenDisabledValue || '空' }}</div>
        </div>

        <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="text-sm font-bold text-secondary">状态</h3>
          <TimePicker v-model="disabledValue" disabled />
          <TimePicker v-model="noNowValue" :show-now="false" clearable />
          <div class="text-xs text-tertiary">无快捷：{{ noNowValue || '空' }}</div>
        </div>
      </div>

      <div class="grid gap-3 xl:grid-cols-3">
        <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="text-sm font-bold text-secondary">时间范围</h3>
          <TimeRangePicker v-model="rangeValue" clearable />
          <TimeRangePicker v-model="rangeMinuteValue" format="HH:mm" value-format="HH:mm" :minute-step="15" />
          <div class="text-xs text-tertiary">范围：{{ rangeValue.join(' ~ ') }}</div>
        </div>

        <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="text-sm font-bold text-secondary">跨次日范围</h3>
          <TimeRangePicker v-model="overnightRangeValue" value-format="HH:mm:ss" />
          <TimeRangePicker v-model="overnightMinuteRangeValue" format="HH:mm" value-format="HH:mm" />
          <div class="text-xs text-tertiary">跨天：{{ overnightRangeValue[0] }} ~ {{ getRangeEndPrefix(overnightRangeValue) }}{{ overnightRangeValue[1] }}</div>
        </div>

        <div class="grid gap-2 rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="text-sm font-bold text-secondary">范围状态</h3>
          <TimeRangePicker v-model="rangeDisabledValue" disabled />
          <TimeRangePicker v-model="sameDayRangeValue" />
          <div class="text-xs text-tertiary">当日范围：{{ sameDayRangeValue.join(' ~ ') }}</div>
        </div>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数 — TimePicker</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="timePickerApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="timePickerProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="timePickerEmits" />
          </TabPane>
          <TabPane name="exposes" label="Expose">
            <ParamTable :columns="exposedColumns" :rows="timePickerExposes" />
          </TabPane>
        </Tabs>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数 — TimeRangePicker</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="timeRangePickerApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="timeRangePickerProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="timeRangePickerEmits" />
          </TabPane>
          <TabPane name="exposes" label="Expose">
            <ParamTable :columns="exposedColumns" :rows="timeRangePickerExposes" />
          </TabPane>
        </Tabs>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">示例代码</h3>
      </div>
      <div class="p-4">
        <CodeBlock :code="timePickerCodeExample" lang="html" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Tabs, TabPane } from '@unoui/vue/tab'
import { TimePicker, TimeRangePicker } from '@unoui/vue/timepicker'
import type { Dayjs } from 'dayjs'
import { ref } from 'vue'

import CodeBlock from '@/components/CodeBlock.vue'
import ParamTable from '@/components/ParamTable.vue'
import { propsColumns, emitsColumns, exposedColumns } from '@/data/shared'
import { timePickerCodeExample, timePickerEmits, timePickerExposes, timePickerProps, timeRangePickerEmits, timeRangePickerExposes, timeRangePickerProps } from '@/data/timepicker'

const timePickerApiTab = ref('props')
const timeRangePickerApiTab = ref('props')
const timeValue = ref('10:30:00')
const timeSmallValue = ref('09:00:00')
const timeLargeValue = ref('18:45:00')
const minuteValue = ref('09:15')
const steppedValue = ref('10:20:30')
const twelveHourValue = ref('03:45:00 PM')
const twelveHourMinuteValue = ref('15:30')
const confirmValue = ref('10:30:00')
const confirmMinuteValue = ref('11:15')
const disabledRangeValue = ref('14:30:00')
const hiddenDisabledValue = ref('10:20')
const disabledValue = ref('10:30:00')
const noNowValue = ref('08:00:00')
const rangeValue = ref<[string, string]>(['09:00:00', '18:00:00'])
const rangeMinuteValue = ref<[string, string]>(['09:15', '18:45'])
const overnightRangeValue = ref<[string, string]>(['22:30:00', '02:15:00'])
const overnightMinuteRangeValue = ref<[string, string]>(['23:00', '06:30'])
const rangeDisabledValue = ref<[string, string]>(['09:00:00', '18:00:00'])
const sameDayRangeValue = ref<[string, string]>(['10:00:00', '12:00:00'])

const getTimeSeconds = (time: string) => {
  const [hour = 0, minute = 0, second = 0] = time.split(':').map(Number)
  return hour * 60 * 60 + minute * 60 + second
}

const getRangeEndPrefix = (range: [string, string]) => (getTimeSeconds(range[1]) < getTimeSeconds(range[0]) ? '次日 ' : '')

const disabledWorkBreak = (time: Dayjs) => ({
  disabledHours: () => [0, 1, 2, 3, 4, 5, 22, 23],
  disabledMinutes: (hour: number) => (hour === 12 ? [0, 15, 30, 45] : []),
  disabledSeconds: () => (time.hour() === 14 ? [30, 31, 32] : [])
})

const disabledOddMinutes = () => ({
  disabledMinutes: () => Array.from({ length: 60 }, (_, index) => index).filter((value) => value % 2 === 1)
})
</script>
