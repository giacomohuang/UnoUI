<template>
  <section id="showcase-badge" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">Badge</h2>
      <p class="mt-1 text-xs text-tertiary">徽标组件，支持数字、小红点、状态点、自定义颜色、偏移、封顶值和 Ribbon。</p>
    </div>

    <div class="grid gap-5 p-4 text-sm text-secondary">
      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-center">
        <span class="text-xs font-medium text-tertiary">数字</span>
        <div class="flex flex-wrap items-center gap-6 rounded-md bg-secondary/60 px-3 py-4">
          <Badge :count="5">
            <Button variant="outline">任务</Button>
          </Badge>
          <Badge :count="109" :overflow-count="99">
            <Button variant="outline">通知</Button>
          </Badge>
          <Badge :count="0" show-zero>
            <Button variant="outline">空状态</Button>
          </Badge>
          <Badge count="new">
            <Button variant="outline">文本</Button>
          </Badge>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-center">
        <span class="text-xs font-medium text-tertiary">变体</span>
        <div class="flex flex-wrap items-center gap-6 rounded-md bg-secondary/60 px-3 py-4">
          <Badge dot>
            <Button variant="outline">小红点</Button>
          </Badge>
          <Badge :count="7" size="small">
            <Button size="sm" variant="outline">小尺寸</Button>
          </Badge>
          <Badge :count="3" :offset="[8, 4]">
            <Button variant="outline">偏移</Button>
          </Badge>
          <Badge :count="12" color="#7c3aed">
            <Button variant="outline">自定义色</Button>
          </Badge>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">状态</span>
        <div class="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-md bg-secondary/60 px-3 py-4">
          <Badge v-for="item in badgeStatuses" :key="item.status" :status="item.status" :text="item.text" />
          <Badge color="#7c3aed" text="自定义" />
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">Ribbon</span>
        <div class="grid gap-3 lg:grid-cols-2">
          <BadgeRibbon text="审核中" color="orange" placement="start">
            <div class="min-h-24 rounded-md border border-medium bg-secondary/50 p-4">
              <div class="font-medium text-primary">资源包</div>
              <p class="mt-2 text-xs text-tertiary">等待 OSS 审核结果。</p>
            </div>
          </BadgeRibbon>
          <BadgeRibbon text="Beta" color="#7c3aed">
            <div class="min-h-24 rounded-md border border-medium bg-secondary/50 p-4">
              <div class="font-medium text-primary">实验功能</div>
              <p class="mt-2 text-xs text-tertiary">仅在测试环境启用。</p>
            </div>
          </BadgeRibbon>
        </div>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">Badge API 参数</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="badgeApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="badgeProps" />
          </TabPane>
          <TabPane name="slots" label="Slots">
            <ParamTable :columns="slotsColumns" :rows="badgeSlots" />
          </TabPane>
        </Tabs>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">RibbonBadge API 参数</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="ribbonBadgeApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="badgeRibbonProps" />
          </TabPane>
          <TabPane name="slots" label="Slots">
            <ParamTable :columns="slotsColumns" :rows="badgeRibbonSlots" />
          </TabPane>
        </Tabs>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">示例代码</h3>
      </div>
      <div class="p-4">
        <CodeBlock :code="badgeCodeExample" lang="html" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Badge, BadgeRibbon, type BadgeStatus } from '@mcistudio/unoui-vue/badge'
import { Button } from '@mcistudio/unoui-vue/button'
import { Tabs, TabPane } from '@mcistudio/unoui-vue/tab'
import CodeBlock from '@/components/CodeBlock.vue'
import ParamTable from '@/components/ParamTable.vue'
import { badgeCodeExample, badgeProps, badgeRibbonProps, badgeRibbonSlots, badgeSlots } from '@/data/badge'
import { propsColumns, slotsColumns } from '@/data/shared'

const badgeApiTab = ref('props')
const ribbonBadgeApiTab = ref('props')
const badgeStatuses: Array<{ status: BadgeStatus; text: string }> = [
  { status: 'success', text: '成功' },
  { status: 'processing', text: '处理中' },
  { status: 'default', text: '默认' },
  { status: 'error', text: '错误' },
  { status: 'warning', text: '警告' }
]
</script>
