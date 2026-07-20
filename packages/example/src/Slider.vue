<template>
  <section id="showcase-slider" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">Slider</h2>
      <p class="mt-1 text-xs text-tertiary">参考 Ant Design Slider 的滑动输入条，支持单值、范围、刻度、dots、垂直、反向、tooltip、键盘和可编辑范围节点。</p>
    </div>

    <div class="grid gap-5 p-4 text-sm text-secondary">
      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-center">
        <span class="text-xs font-medium text-tertiary">尺寸</span>
        <div class="grid gap-4 lg:grid-cols-3">
          <div v-for="size in sliderSizes" :key="size" class="grid gap-2 rounded-md bg-secondary/60 px-3 py-3">
            <Slider v-model="sliderSizeValues[size]" :size="size" />
            <span class="font-mono text-xs text-tertiary">{{ size }} / {{ sliderSizeValues[size] }}</span>
          </div>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">状态</span>
        <div class="grid gap-4 xl:grid-cols-2">
          <div class="grid gap-3 rounded-md bg-secondary/60 px-3 py-3">
            <div class="flex items-center justify-between gap-3 text-xs text-tertiary">
              <span>基础</span>
              <span class="font-mono">{{ basicValue }}</span>
            </div>
            <Slider v-model="basicValue" />
          </div>
          <div class="grid gap-3 rounded-md bg-secondary/60 px-3 py-3">
            <div class="flex items-center justify-between gap-3 text-xs text-tertiary">
              <span>禁用</span>
              <span class="font-mono">42</span>
            </div>
            <Slider :model-value="42" disabled />
          </div>
          <div class="grid gap-3 rounded-md bg-secondary/60 px-3 py-3">
            <div class="flex items-center justify-between gap-3 text-xs text-tertiary">
              <span>隐藏 included</span>
              <span class="font-mono">{{ unincludedValue }}</span>
            </div>
            <Slider v-model="unincludedValue" :included="false" />
          </div>
          <div class="grid gap-3 rounded-md bg-secondary/60 px-3 py-3">
            <div class="flex items-center justify-between gap-3 text-xs text-tertiary">
              <span>步长 10</span>
              <span class="font-mono">{{ stepValue }}</span>
            </div>
            <Slider v-model="stepValue" :step="10" dots />
          </div>
          <div class="grid gap-3 rounded-md bg-secondary/60 px-3 py-3 xl:col-span-2">
            <div class="flex items-center justify-between gap-3 text-xs text-tertiary">
              <span>自定义颜色</span>
              <span class="font-mono">{{ colorValue }}</span>
            </div>
            <Slider v-model="colorValue" color="#16a34a" :step="10" dots />
          </div>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">范围</span>
        <div class="grid gap-4 xl:grid-cols-2">
          <div class="grid gap-3 rounded-md bg-secondary/60 px-3 py-3">
            <div class="flex items-center justify-between gap-3 text-xs text-tertiary">
              <span>双节点范围</span>
              <span class="font-mono">{{ rangeValue.join(' - ') }}</span>
            </div>
            <Slider v-model="rangeValue" range />
          </div>
          <div class="grid gap-3 rounded-md bg-secondary/60 px-3 py-3">
            <div class="flex items-center justify-between gap-3 text-xs text-tertiary">
              <span>拖拽整段</span>
              <span class="font-mono">{{ draggableRange.join(' - ') }}</span>
            </div>
            <Slider v-model="draggableRange" :range="{ draggableTrack: true }" />
          </div>
          <div class="grid gap-3 rounded-md bg-secondary/60 px-3 py-3 xl:col-span-2">
            <div class="flex items-center justify-between gap-3 text-xs text-tertiary">
              <span>可编辑节点</span>
              <span class="font-mono">{{ editableRange.join(' / ') }}</span>
            </div>
            <Slider v-model="editableRange" :range="{ editable: true, minCount: 1, maxCount: 4 }" />
          </div>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">刻度</span>
        <div class="grid gap-4 xl:grid-cols-2">
          <div class="grid gap-3 rounded-md bg-secondary/60 px-3 pb-8 pt-3">
            <div class="flex items-center justify-between gap-3 text-xs text-tertiary">
              <span>marks-only</span>
              <span class="font-mono">{{ markValue }}</span>
            </div>
            <Slider v-model="markValue" :marks="temperatureMarks" :step="null" />
          </div>
          <div class="grid gap-3 rounded-md bg-secondary/60 px-3 pb-8 pt-3">
            <div class="flex items-center justify-between gap-3 text-xs text-tertiary">
              <span>dots + marks</span>
              <span class="font-mono">{{ dotValue }}</span>
            </div>
            <Slider v-model="dotValue" :marks="dotMarks" :step="10" dots />
          </div>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">方向</span>
        <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div class="grid gap-4 rounded-md bg-secondary/60 px-3 py-3">
            <div class="flex items-center justify-between gap-3 text-xs text-tertiary">
              <span>反向</span>
              <span class="font-mono">{{ reverseValue }}</span>
            </div>
            <Slider v-model="reverseValue" reverse />
          </div>
          <div class="flex min-h-48 items-center justify-center gap-10 rounded-md bg-secondary/60 px-3 py-4">
            <div class="grid justify-items-center gap-3">
              <Slider v-model="verticalValue" vertical />
              <span class="text-xs text-tertiary">垂直 {{ verticalValue }}</span>
            </div>
            <div class="grid justify-items-center gap-3">
              <Slider v-model="verticalReverseValue" vertical reverse />
              <span class="text-xs text-tertiary">反向 {{ verticalReverseValue }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">Tooltip</span>
        <div class="grid gap-4 xl:grid-cols-2">
          <div class="grid gap-3 rounded-md bg-secondary/60 px-3 py-3">
            <div class="flex items-center justify-between gap-3 text-xs text-tertiary">
              <span>格式化</span>
              <span class="font-mono">{{ tooltipValue }}%</span>
            </div>
            <Slider v-model="tooltipValue" :tooltip="{ formatter: formatPercent }" />
          </div>
          <div class="grid gap-3 rounded-md bg-secondary/60 px-3 py-3">
            <div class="flex items-center justify-between gap-3 text-xs text-tertiary">
              <span>常显</span>
              <span class="font-mono">{{ openTooltipValue }}</span>
            </div>
            <Slider v-model="openTooltipValue" :tooltip="{ open: true, formatter: formatStorage }" />
          </div>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">键盘</span>
        <div class="flex flex-wrap items-center gap-3 rounded-md bg-secondary/60 px-3 py-3">
          <Slider ref="sliderFocusRef" v-model="keyboardValue" :step="5" class="max-w-96" />
          <Button size="sm" variant="outline" icon="i-lucide:focus" @click="sliderFocusRef?.focus()">聚焦</Button>
          <Button size="sm" variant="outline" icon="i-lucide:circle-slash" @click="sliderFocusRef?.blur()">失焦</Button>
          <span class="text-xs text-tertiary">当前：{{ keyboardValue }}</span>
        </div>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="sliderApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="sliderProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="sliderEmits" />
          </TabPane>
          <TabPane name="slots" label="Slots">
            <ParamTable :columns="slotsColumns" :rows="sliderSlots" />
          </TabPane>
          <TabPane name="exposes" label="Exposes">
            <ParamTable :columns="exposedColumns" :rows="sliderExposes" />
          </TabPane>
        </Tabs>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">示例代码</h3>
      </div>
      <div class="p-4">
        <CodeBlock :code="sliderCodeExample" lang="html" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Button } from '@mcistudio/unoui-vue/button'
import { Slider, type SliderMarks, type SliderSize } from '@mcistudio/unoui-vue/slider'
import { Tabs, TabPane } from '@mcistudio/unoui-vue/tab'
import { sliderCodeExample, sliderEmits, sliderExposes, sliderProps, sliderSlots } from '@/data/slider'
import { emitsColumns, exposedColumns, propsColumns, slotsColumns } from '@/data/shared'
import CodeBlock from '@/components/CodeBlock.vue'
import ParamTable from '@/components/ParamTable.vue'

interface SliderExpose {
  focus: () => void
  blur: () => void
}

const sliderApiTab = ref('props')
const sliderFocusRef = ref<SliderExpose | null>(null)
const sliderSizes: SliderSize[] = ['sm', 'md', 'lg']
const sliderSizeValues = ref<Record<SliderSize, number>>({
  sm: 24,
  md: 48,
  lg: 72
})
const basicValue = ref(36)
const unincludedValue = ref(54)
const stepValue = ref(30)
const colorValue = ref(70)
const rangeValue = ref([20, 64])
const draggableRange = ref([28, 58])
const editableRange = ref([18, 45, 78])
const markValue = ref(26)
const dotValue = ref(40)
const reverseValue = ref(62)
const verticalValue = ref(38)
const verticalReverseValue = ref(68)
const tooltipValue = ref(45)
const openTooltipValue = ref(512)
const keyboardValue = ref(25)
const temperatureMarks: SliderMarks = {
  0: '0°C',
  26: '26°C',
  37: {
    label: '37°C',
    style: {
      color: '#ef4444'
    }
  },
  100: '100°C'
}
const dotMarks: SliderMarks = {
  0: '0',
  30: '低',
  60: '中',
  100: '高'
}
const formatPercent = (value: number) => `${value}%`
const formatStorage = (value: number) => `${value} MB`
</script>
