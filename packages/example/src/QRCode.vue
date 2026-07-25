<template>
  <section id="showcase-qrcode" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">QRCode</h2>
      <p class="mt-1 text-xs text-tertiary">二维码组件，支持 canvas/svg、颜色、图标、尺寸、纠错等级、安静区、状态蒙层和自定义状态渲染。</p>
    </div>

    <div class="grid gap-5 p-4 text-sm text-secondary">
      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-center">
        <span class="text-xs font-medium text-tertiary">基础</span>
        <div class="flex flex-wrap items-center gap-4 rounded-md bg-secondary/60 px-3 py-4">
          <QRCode value="https://unoui.example.com/project/10000" />
          <QRCode value="https://unoui.example.com/project/10000?render=svg" type="svg" />
          <QRCode value="https://unoui.example.com/project/10000?borderless=1" :bordered="false" />
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-center">
        <span class="text-xs font-medium text-tertiary">颜色与图标</span>
        <div class="flex flex-wrap items-center gap-4 rounded-md bg-secondary/60 px-3 py-4">
          <QRCode value="https://unoui.example.com/project/brand" color="#1677ff" bg-color="#f0f7ff" :margin-size="2" />
          <QRCode value="https://unoui.example.com/project/icon" icon="/favicon.ico" :icon-size="36" error-level="H" :margin-size="2" />
          <QRCode value="https://unoui.example.com/project/large" :size="192" icon="/favicon.ico" :icon-size="{ width: 44, height: 44 }" error-level="H" />
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-center">
        <span class="text-xs font-medium text-tertiary">状态</span>
        <div class="flex flex-wrap items-center gap-4 rounded-md bg-secondary/60 px-3 py-4">
          <QRCode value="https://unoui.example.com/project/loading" status="loading" />
          <QRCode value="https://unoui.example.com/project/expired" status="expired" @refresh="lastRefresh = '已触发刷新'" />
          <QRCode value="https://unoui.example.com/project/scanned" status="scanned" />
          <span class="text-xs text-tertiary">{{ lastRefresh }}</span>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">自定义</span>
        <div class="flex flex-wrap items-center gap-4 rounded-md bg-secondary/60 px-3 py-4">
          <QRCode value="https://unoui.example.com/project/custom-status" status="expired" :status-render="renderCustomStatus" />
          <QRCode value="https://unoui.example.com/project/slot-status" status="scanned">
            <template #status="{ locale }">
              <div class="flex flex-col items-center gap-2 text-xs font-medium text-green-600">
                <span class="i-lucide:badge-check text-2xl"></span>
                <span>{{ locale.scanned }}</span>
              </div>
            </template>
          </QRCode>
        </div>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="qrcodeApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="qrcodeProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="qrcodeEmits" />
          </TabPane>
          <TabPane name="slots" label="Slots">
            <ParamTable :columns="slotsColumns" :rows="qrcodeSlots" />
          </TabPane>
          <TabPane name="exposes" label="Exposes">
            <ParamTable :columns="exposedColumns" :rows="qrcodeExposes" />
          </TabPane>
        </Tabs>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">示例代码</h3>
      </div>
      <div class="p-4">
        <CodeBlock :code="qrcodeCodeExample" lang="html" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Button } from '@mcistudio/unoui-vue/button'
import { QRCode, type QRCodeStatusRender } from '@mcistudio/unoui-vue/qrcode'
import { Tabs, TabPane } from '@mcistudio/unoui-vue/tab'
import { h, ref } from 'vue'

import CodeBlock from '@/components/CodeBlock.vue'
import ParamTable from '@/components/ParamTable.vue'
import { qrcodeCodeExample, qrcodeEmits, qrcodeExposes, qrcodeProps, qrcodeSlots } from '@/data/qrcode'
import { emitsColumns, exposedColumns, propsColumns, slotsColumns } from '@/data/shared'

const qrcodeApiTab = ref('props')
const lastRefresh = ref('等待刷新')

const renderCustomStatus: QRCodeStatusRender = ({ locale, onRefresh }) =>
  h('div', { class: 'flex flex-col items-center gap-2 text-xs font-medium text-amber-600' }, [
    h('span', { class: 'i-lucide:scan-line text-2xl' }),
    h('span', locale.expired),
    h(
      Button,
      {
        size: 'sm',
        variant: 'link',
        onClick: () => onRefresh()
      },
      () => locale.refresh
    )
  ])
</script>
