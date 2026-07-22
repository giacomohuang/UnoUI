<template>
  <section id="showcase-image-editor" class="scroll-mt-6 overflow-hidden rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">ImageEditor</h2>
      <p class="mt-1 text-xs text-tertiary">在同一画布中完成缩放、旋转和裁剪，并以原图像素约束最小裁剪尺寸和固定宽高比。</p>
    </div>

    <div class="border-b border-medium bg-secondary/35 px-4 py-3">
      <div class="flex flex-wrap items-end gap-x-5 gap-y-3">
        <div class="grid gap-1.5">
          <span class="text-xs font-medium text-tertiary">宽高比</span>
          <RadioGroup v-model="aspectMode" type="button" button-style="solid" size="sm" name="image-editor-aspect-ratio">
            <Radio v-for="option in aspectOptions" :key="option.value" :value="option.value">{{ option.label }}</Radio>
          </RadioGroup>
        </div>

        <label class="grid w-32 gap-1.5">
          <span class="text-xs font-medium text-tertiary">最小宽度</span>
          <Input v-model.number="minWidth" type="number" :min="0" :step="20" size="sm" suffix="px" />
        </label>

        <label class="grid w-32 gap-1.5">
          <span class="text-xs font-medium text-tertiary">最小高度</span>
          <Input v-model.number="minHeight" type="number" :min="0" :step="20" size="sm" suffix="px" />
        </label>

        <span class="pb-2 text-xs text-tertiary">裁剪框不会小于 {{ effectiveMinimum }}</span>
      </div>
    </div>

    <div class="grid min-w-0 gap-0 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div class="min-w-0 p-4">
        <ImageEditor :src="sourceImage" alt="山谷和湖泊风景" :aspect-ratio="aspectRatio" :min-width="minWidth" :min-height="minHeight" :height="460" output-type="image/webp" :output-quality="0.9" @crop="handleCrop" @error="handleError" />
      </div>

      <aside class="min-w-0 border-t border-medium p-4 lg:border-l lg:border-t-0">
        <div class="flex items-center justify-between gap-3">
          <h3 class="text-sm font-bold text-secondary">裁剪结果</h3>
          <Button v-if="cropResult" aria-label="下载裁剪结果" icon="i-lucide:download" size="icon" variant="mono" @click="downloadResult" />
        </div>

        <div class="mt-3 flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-medium bg-secondary/50 lg:aspect-[4/5]">
          <img v-if="cropResult" :src="cropResult.dataUrl" alt="裁剪结果预览" class="size-full object-contain" />
          <div v-else class="grid justify-items-center gap-2 px-6 text-center text-tertiary">
            <span class="i-lucide:scan-line size-7" aria-hidden="true"></span>
            <span class="text-xs">完成裁剪后在此预览输出</span>
          </div>
        </div>

        <dl v-if="cropResult" class="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <dt class="text-tertiary">输出尺寸</dt>
          <dd class="text-right font-mono text-secondary">{{ cropResult.width }} x {{ cropResult.height }}</dd>
          <dt class="text-tertiary">文件类型</dt>
          <dd class="text-right font-mono text-secondary">{{ cropResult.blob.type }}</dd>
          <dt class="text-tertiary">文件大小</dt>
          <dd class="text-right font-mono text-secondary">{{ formatBytes(cropResult.blob.size) }}</dd>
        </dl>

        <p v-if="statusMessage" class="mt-3 text-xs text-tertiary" role="status">{{ statusMessage }}</p>
      </aside>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="apiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="imageEditorProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="imageEditorEmits" />
          </TabPane>
          <TabPane name="slots" label="Slots">
            <ParamTable :columns="slotsColumns" :rows="imageEditorSlots" />
          </TabPane>
          <TabPane name="exposes" label="Exposes">
            <ParamTable :columns="exposedColumns" :rows="imageEditorExposes" />
          </TabPane>
        </Tabs>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">示例代码</h3>
      </div>
      <div class="p-4">
        <CodeBlock :code="imageEditorCodeExample" lang="html" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Button } from '@mcistudio/unoui-vue/button'
import { ImageEditor, type ImageEditorResult } from '@mcistudio/unoui-vue/imageeditor'
import { Input } from '@mcistudio/unoui-vue/input'
import { Radio, RadioGroup } from '@mcistudio/unoui-vue/radio'
import { TabPane, Tabs } from '@mcistudio/unoui-vue/tab'
import { computed, ref } from 'vue'

import CodeBlock from '@/components/CodeBlock.vue'
import ParamTable from '@/components/ParamTable.vue'
import { imageEditorCodeExample, imageEditorEmits, imageEditorExposes, imageEditorProps, imageEditorSlots } from '@/data/imageEditor'
import { emitsColumns, exposedColumns, propsColumns, slotsColumns } from '@/data/shared'

const apiTab = ref('props')
const aspectMode = ref('16:9')
const minWidth = ref(640)
const minHeight = ref(360)
const cropResult = ref<ImageEditorResult>()
const statusMessage = ref('')
const sourceImage = `${import.meta.env.BASE_URL}assets/image-editor-landscape.jpg`
const aspectOptions = [
  { label: '自由', value: 'free' },
  { label: '1:1', value: '1:1' },
  { label: '4:3', value: '4:3' },
  { label: '16:9', value: '16:9' }
]
const aspectRatio = computed(() => {
  if (aspectMode.value === 'free') return undefined
  const [width, height] = aspectMode.value.split(':').map(Number)
  return width / height
})
const effectiveMinimum = computed(() => {
  const ratio = aspectRatio.value
  if (!ratio) return `${minWidth.value} x ${minHeight.value} px`
  const width = Math.max(minWidth.value, minHeight.value * ratio)
  return `${Math.round(width)} x ${Math.round(width / ratio)} px`
})

function handleCrop(result: ImageEditorResult) {
  cropResult.value = result
  statusMessage.value = `已生成 ${result.width} x ${result.height} 的裁剪图片`
}

function handleError(error: Error) {
  statusMessage.value = error.message
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

function downloadResult() {
  if (!cropResult.value) return
  const link = document.createElement('a')
  link.href = cropResult.value.dataUrl
  link.download = `unoui-crop-${cropResult.value.width}x${cropResult.value.height}.webp`
  link.click()
}
</script>
