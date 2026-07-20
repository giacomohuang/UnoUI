<template>
  <section id="showcase-tag" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">Tag</h2>
      <p class="mt-1 text-xs text-tertiary">展示完整色谱、视觉变体、尺寸和圆角。</p>
    </div>
    <div class="flex flex-wrap items-center gap-3 border-b border-medium px-4 py-3">
      <Tag color="purple" variant="soft" size="md" radius="round">集团</Tag>
      <Tag color="blue" variant="soft" size="md" radius="round">园区</Tag>
      <Tag color="green" variant="soft" size="md" radius="round">已启用</Tag>
      <Tag color="orange" variant="soft" size="md" radius="round">待处理</Tag>
      <Tag color="red" variant="soft" size="md" radius="round">异常</Tag>
    </div>
    <div class="overflow-x-auto p-4">
      <div class="overflow-hidden rounded-md border border-medium" :style="{ minWidth: tagGridMinWidth }">
        <div class="grid bg-secondary text-xs font-bold uppercase text-tertiary" :style="{ gridTemplateColumns: tagGridColumns }">
          <div class="border-r border-medium px-3 py-2">variant / color</div>
          <div v-for="color in tagColors" :key="`tag-head-${color}`" class="border-r border-medium px-3 py-2 last:border-r-0">{{ color }}</div>
        </div>
        <div v-for="variant in tagVariants" :key="`tag-row-${variant}`" class="grid border-t border-medium" :style="{ gridTemplateColumns: tagGridColumns }">
          <div class="flex items-center border-r border-medium bg-secondary/60 px-3 py-3 text-sm font-bold text-secondary">{{ variant }}</div>
          <div v-for="color in tagColors" :key="`tag-${variant}-${color}`" class="flex min-h-14 items-center border-r border-medium px-3 py-3 last:border-r-0">
            <Tag :variant="variant" :color="color" size="md" radius="md">{{ color }}</Tag>
          </div>
        </div>
      </div>
    </div>
    <div class="grid gap-5 border-t border-medium p-4 lg:grid-cols-2">
      <div class="flex flex-col gap-3">
        <h3 class="text-sm font-bold text-secondary">尺寸</h3>
        <div class="flex flex-wrap items-center gap-3">
          <Tag v-for="size in tagSizes" :key="`tag-size-${size}`" :size="size" color="brand">{{ size }}</Tag>
        </div>
      </div>
      <div class="flex flex-col gap-3">
        <h3 class="text-sm font-bold text-secondary">圆角</h3>
        <div class="flex flex-wrap items-center gap-3">
          <Tag v-for="radius in tagRadii" :key="`tag-radius-${radius}`" :radius="radius" color="blue" variant="plain">{{ radius }}</Tag>
        </div>
      </div>
    </div>

    <!-- API 参数 -->
    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="tagApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="tagProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="tagEmits" />
          </TabPane>
          <TabPane name="slots" label="Slots">
            <ParamTable :columns="slotsColumns" :rows="tagSlots" />
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
        <CodeBlock :code="tagCodeExample" lang="html" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Tag, type TagProps } from '@mcistudio/unoui-vue/tag'
import { Tabs, TabPane } from '@mcistudio/unoui-vue/tab'
import { propsColumns, emitsColumns, slotsColumns } from '@/data/shared'
import { tagProps, tagEmits, tagSlots, tagCodeExample } from '@/data/tag'
import ParamTable from '@/components/ParamTable.vue'
import CodeBlock from '@/components/CodeBlock.vue'

type TagColor = NonNullable<TagProps['color']>
type TagVariant = NonNullable<TagProps['variant']>
type TagSize = NonNullable<TagProps['size']>
type TagRadius = NonNullable<TagProps['radius']>

const tagApiTab = ref('props')
const tagColors: TagColor[] = ['brand', 'blue', 'cyan', 'teal', 'green', 'lime', 'yellow', 'orange', 'red', 'pink', 'purple', 'indigo', 'gray']
const tagVariants: TagVariant[] = ['soft', 'light', 'dark', 'plain']
const tagSizes: TagSize[] = ['sm', 'md', 'lg']
const tagRadii: TagRadius[] = ['none', 'sm', 'md', 'lg', 'round']
const tagGridColumns = `132px repeat(${tagColors.length}, minmax(100px, 1fr))`
const tagGridMinWidth = `${132 + tagColors.length * 100}px`
</script>
