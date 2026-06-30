<template>
  <section id="showcase-colorpicker" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">ColorPicker</h2>
      <p class="mt-1 text-xs text-tertiary">完整移植参考组件的纯色、线性渐变、径向渐变、透明度、渐变节点和屏幕取色能力，并支持关闭渐变或透明度。</p>
    </div>

    <div class="grid gap-5 p-4 text-sm text-secondary">
      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-center">
        <span class="text-xs font-medium text-tertiary">尺寸</span>
        <div class="flex flex-wrap items-center gap-x-5 gap-y-3">
          <div v-for="item in colorPickerSizes" :key="item.size" class="flex items-center gap-2 rounded-md bg-secondary/60 px-3 py-2">
            <ColorPicker v-model="item.value" :size="item.size" :allow-gradient="false" />
            <span class="font-mono text-xs">{{ item.size }}</span>
          </div>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">模式</span>
        <div class="grid gap-3 lg:grid-cols-3">
          <div class="grid gap-3 rounded-md border border-medium bg-secondary/40 p-3">
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-sm font-bold text-secondary">Solid</h3>
              <ColorPicker v-model="solidColor" />
            </div>
            <div class="h-20 rounded-md border border-medium ui-colorpicker-demo-checker">
              <div class="h-full rounded-[inherit]" :style="{ background: getColorPreview(solidColor) }"></div>
            </div>
            <code class="truncate rounded border border-medium bg-primary px-2 py-1 font-mono text-xs text-tertiary">{{ solidColor.hex || solidColor.css }}</code>
          </div>

          <div class="grid gap-3 rounded-md border border-medium bg-secondary/40 p-3">
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-sm font-bold text-secondary">Linear</h3>
              <ColorPicker v-model="linearColor" />
            </div>
            <div class="h-20 rounded-md border border-medium ui-colorpicker-demo-checker">
              <div class="h-full rounded-[inherit]" :style="{ background: getColorPreview(linearColor) }"></div>
            </div>
            <code class="truncate rounded border border-medium bg-primary px-2 py-1 font-mono text-xs text-tertiary">{{ linearColor.css }}</code>
          </div>

          <div class="grid gap-3 rounded-md border border-medium bg-secondary/40 p-3">
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-sm font-bold text-secondary">Radial</h3>
              <ColorPicker v-model="radialColor" />
            </div>
            <div class="h-20 rounded-md border border-medium ui-colorpicker-demo-checker">
              <div class="h-full rounded-[inherit]" :style="{ background: getColorPreview(radialColor) }"></div>
            </div>
            <code class="truncate rounded border border-medium bg-primary px-2 py-1 font-mono text-xs text-tertiary">{{ radialColor.css }}</code>
          </div>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">状态</span>
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div class="flex min-h-10 items-center gap-3 rounded-md bg-secondary/60 px-3">
            <ColorPicker v-model="solidOnlyColor" :allow-gradient="false" />
            <span>仅纯色</span>
          </div>
          <div class="flex min-h-10 items-center gap-3 rounded-md bg-secondary/60 px-3">
            <ColorPicker v-model="alphaColor" />
            <span>透明度</span>
          </div>
          <div class="flex min-h-10 items-center gap-3 rounded-md bg-secondary/60 px-3">
            <ColorPicker v-model="opaqueColor" :allow-alpha="false" />
            <span>不透明</span>
          </div>
          <div class="flex min-h-10 items-center gap-3 rounded-md bg-secondary/60 px-3">
            <ColorPicker v-model="disabledColor" disabled />
            <span>禁用</span>
          </div>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">数据</span>
        <pre class="max-h-72 min-w-0 overflow-auto whitespace-pre-wrap break-words rounded-md border border-medium bg-secondary/60 p-3 font-mono text-xs leading-5 text-tertiary">{{ colorPickerValuePreview }}</pre>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="colorPickerApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="colorPickerProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="colorPickerEmits" />
          </TabPane>
        </Tabs>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">示例代码</h3>
      </div>
      <div class="p-4">
        <CodeBlock :code="colorPickerCodeExample" lang="html" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { ColorPicker, type ColorPickerSize, type ColorPickerValue } from '@unoui/vue/colorpicker'
import { Tabs, TabPane } from '@unoui/vue/tab'
import CodeBlock from '@/components/CodeBlock.vue'
import ParamTable from '@/components/ParamTable.vue'
import { colorPickerCodeExample, colorPickerEmits, colorPickerProps } from '@/data/colorpicker'
import { propsColumns, emitsColumns } from '@/data/shared'

interface SizeDemo {
  size: ColorPickerSize
  value: ColorPickerValue
}

const colorPickerApiTab = ref('props')
const solidColor = ref<ColorPickerValue>({
  mode: 'solid',
  color: { r: 33, g: 137, b: 216, a: 1 }
})
const linearColor = ref<ColorPickerValue>({
  mode: 'linear',
  degree: 90,
  gradients: [
    { percent: 10, color: { r: 255, g: 10, b: 20, a: 0.5 } },
    { percent: 100, color: { r: 59, g: 50, b: 240, a: 1 } }
  ]
})
const radialColor = ref<ColorPickerValue>({
  mode: 'radial',
  gradients: [
    { percent: 0, color: { r: 255, g: 214, b: 102, a: 0.8 } },
    { percent: 100, color: { r: 14, g: 165, b: 233, a: 1 } }
  ]
})
const solidOnlyColor = ref<ColorPickerValue>({ mode: 'solid', color: { r: 22, g: 163, b: 74, a: 1 } })
const alphaColor = ref<ColorPickerValue>({ mode: 'solid', color: { r: 244, g: 63, b: 94, a: 0.45 } })
const opaqueColor = ref<ColorPickerValue>({ mode: 'solid', color: { r: 217, g: 119, b: 6, a: 0.35 } })
const disabledColor = ref<ColorPickerValue>({ mode: 'solid', color: { r: 22, g: 163, b: 74, a: 1 } })
const colorPickerSizes = ref<SizeDemo[]>([
  { size: 'sm', value: { mode: 'solid', color: { r: 239, g: 68, b: 68, a: 1 } } },
  { size: 'md', value: { mode: 'solid', color: { r: 59, g: 130, b: 246, a: 1 } } },
  { size: 'lg', value: { mode: 'solid', color: { r: 16, g: 185, b: 129, a: 1 } } }
])
const colorPickerValuePreview = computed(() =>
  JSON.stringify(
    {
      solid: solidColor.value,
      linear: linearColor.value,
      radial: radialColor.value
    },
    null,
    2
  )
)

const getColorPreview = (value: ColorPickerValue) => {
  if (value.css) return value.css.replace(/^background(?:-image|-color)?:/, '')
  if (typeof value.color === 'string') return value.color
  if (value.color) return `rgba(${value.color.r}, ${value.color.g}, ${value.color.b}, ${value.color.a})`
  return 'transparent'
}
</script>

<style scoped>
.ui-colorpicker-demo-checker {
  background-color: #fff;
  background-image:
    linear-gradient(45deg, rgba(148, 163, 184, 0.35) 25%, transparent 25%), linear-gradient(-45deg, rgba(148, 163, 184, 0.35) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(148, 163, 184, 0.35) 75%), linear-gradient(-45deg, transparent 75%, rgba(148, 163, 184, 0.35) 75%);
  background-position:
    0 0,
    0 8px,
    8px -8px,
    -8px 0;
  background-size: 16px 16px;
}
</style>
