<template>
  <section id="showcase-button" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="flex items-center justify-between border-b border-medium px-4 py-3">
      <div>
        <h2 class="text-base font-bold text-primary">Button</h2>
        <p class="mt-1 text-xs text-tertiary">展示颜色、变体、尺寸、圆角和常见交互状态。</p>
      </div>
    </div>
    <div class="overflow-x-auto p-4">
      <div class="min-w-[940px] overflow-hidden rounded-md border border-medium">
        <div class="grid grid-cols-[132px_repeat(6,minmax(128px,1fr))] bg-secondary text-xs font-bold uppercase text-tertiary">
          <div class="border-r border-medium px-3 py-2">variant / color</div>
          <div v-for="color in buttonColors" :key="`button-head-${color}`" class="border-r border-medium px-3 py-2 last:border-r-0">{{ color }}</div>
        </div>
        <div v-for="variant in buttonVariants" :key="`button-row-${variant}`" class="grid grid-cols-[132px_repeat(6,minmax(128px,1fr))] border-t border-medium">
          <div class="flex items-center border-r border-medium bg-secondary/60 px-3 py-3 text-sm font-bold text-secondary">{{ variant }}</div>
          <div v-for="color in buttonColors" :key="`button-${variant}-${color}`" class="flex min-h-16 items-center border-r border-medium bg-secondary/70 px-3 py-3 last:border-r-0">
            <Button :variant="variant" :color="color" size="md" radius="md">按钮</Button>
          </div>
        </div>
      </div>
    </div>
    <div class="grid gap-5 border-t border-medium p-4 xl:grid-cols-3">
      <div class="flex flex-col gap-3">
        <h3 class="text-sm font-bold text-secondary">尺寸</h3>
        <div class="flex flex-wrap items-center gap-3">
          <Button v-for="size in buttonSizes" :key="`button-size-${size}`" :size="size" icon="i-lucide:settings" :icon-size="size.includes('icon') ? '16' : '14'">
            <template v-if="!size.includes('icon')">{{ size }}</template>
          </Button>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <h3 class="text-sm font-bold text-secondary">圆角</h3>
        <div class="flex flex-wrap items-center gap-3">
          <Button v-for="radius in buttonRadii" :key="`button-radius-${radius}`" :radius="radius" variant="outline">{{ radius }}</Button>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <h3 class="text-sm font-bold text-secondary">状态</h3>
        <div class="flex flex-wrap items-center gap-3">
          <Button icon="i-lucide:plus">带图标</Button>
          <Button loading>加载中</Button>
          <Button disabled>禁用</Button>
          <Button variant="outline" disabled>禁用描边</Button>
          <ButtonGroup>
            <Button variant="outline" icon="i-lucide:align-left">左</Button>
            <Button variant="outline" icon="i-lucide:align-center">中</Button>
            <Button variant="outline" icon="i-lucide:align-right">右</Button>
          </ButtonGroup>
        </div>
      </div>
    </div>

    <!-- API 参数 -->
    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="buttonApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="buttonProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="buttonEmits" />
          </TabPane>
          <TabPane name="slots" label="Slots">
            <ParamTable :columns="slotsColumns" :rows="buttonSlots" />
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
        <CodeBlock :code="buttonCodeExample" lang="html" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Button, ButtonGroup, type ButtonProps } from '@mcistudio/unoui-vue/button'
import { Tabs, TabPane } from '@mcistudio/unoui-vue/tab'
import { propsColumns, emitsColumns, slotsColumns } from '@/data/shared'
import { buttonProps, buttonEmits, buttonSlots, buttonCodeExample } from '@/data/button'
import ParamTable from '@/components/ParamTable.vue'
import CodeBlock from '@/components/CodeBlock.vue'

type ButtonColor = NonNullable<ButtonProps['color']>
type ButtonVariant = NonNullable<ButtonProps['variant']>
type ButtonSize = NonNullable<ButtonProps['size']>
type ButtonRadius = NonNullable<ButtonProps['radius']>

const buttonColors: ButtonColor[] = ['brand', 'gray', 'red', 'green', 'yellow', 'orange']
const buttonVariants: ButtonVariant[] = ['default', 'outline', 'dashed', 'link', 'mono']
const buttonSizes: ButtonSize[] = ['sm', 'md', 'lg', 'icon', 'icon-md', 'icon-lg']
const buttonRadii: ButtonRadius[] = ['none', 'sm', 'md', 'lg', 'full']
const buttonApiTab = ref('props')
</script>
