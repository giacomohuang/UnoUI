<template>
  <section id="showcase-popconfirm" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">Popconfirm</h2>
      <p class="mt-1 text-xs text-tertiary">气泡确认框，支持位置、触发方式、受控显隐、按钮配置、危险确认和溢出修正。</p>
    </div>

    <div class="grid gap-5 p-4 text-sm text-secondary">
      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-center">
        <span class="text-xs font-medium text-tertiary">基础</span>
        <div class="flex flex-wrap items-center gap-3 rounded-md bg-secondary/60 px-3 py-3">
          <Popconfirm title="确认发布当前项目？" description="发布后终端用户将看到最新地图。" @confirm="lastAction = '已确认发布'">
            <Button variant="outline" icon="i-lucide:upload-cloud">发布</Button>
          </Popconfirm>
          <Popconfirm title="确认删除该资源？" description="删除后不可恢复。" ok-text="删除" ok-type="danger" @confirm="lastAction = '已确认删除'">
            <Button color="red" variant="outline" icon="i-lucide:trash-2">删除</Button>
          </Popconfirm>
          <Popconfirm title="无需取消按钮" :show-cancel="false" @confirm="lastAction = '单按钮确认'">
            <Button variant="outline">单按钮</Button>
          </Popconfirm>
          <span class="text-xs text-tertiary">{{ lastAction }}</span>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">位置</span>
        <div class="grid max-w-2xl grid-cols-3 gap-2 rounded-md bg-secondary/60 p-3">
          <Popconfirm v-for="placement in placements" :key="placement" :placement="placement" :title="placement">
            <Button variant="outline" size="sm" class="w-full">{{ placement }}</Button>
          </Popconfirm>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">触发</span>
        <div class="flex flex-wrap items-center gap-3 rounded-md bg-secondary/60 px-3 py-3">
          <Popconfirm title="点击触发" trigger="click">
            <Button variant="outline">Click</Button>
          </Popconfirm>
          <Popconfirm title="悬浮触发" trigger="hover" :mouse-enter-delay="0">
            <Button variant="outline">Hover</Button>
          </Popconfirm>
          <Popconfirm title="聚焦触发" trigger="focus">
            <Button variant="outline">Focus</Button>
          </Popconfirm>
          <Popconfirm title="右键触发" trigger="contextMenu">
            <Button variant="outline">ContextMenu</Button>
          </Popconfirm>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">控制</span>
        <div class="grid gap-3 lg:grid-cols-3">
          <div class="flex min-h-16 flex-wrap items-center gap-3 rounded-md bg-secondary/60 px-3 py-3">
            <Popconfirm v-model:open="controlledOpen" title="受控确认框" description="外部按钮也可以控制显隐。">
              <Button variant="outline">受控</Button>
            </Popconfirm>
            <Button size="sm" variant="mono" @click="controlledOpen = !controlledOpen">{{ controlledOpen ? '关闭' : '打开' }}</Button>
          </div>
          <div class="flex min-h-16 flex-wrap items-center gap-3 rounded-md bg-secondary/60 px-3 py-3">
            <Popconfirm title="确认继续？" :ok-button-props="{ loading: true }">
              <Button variant="outline">加载态</Button>
            </Popconfirm>
          </div>
          <div class="flex min-h-16 flex-wrap items-center gap-3 rounded-md bg-secondary/60 px-3 py-3">
            <Popconfirm title="自定义图标" icon="i-lucide:shield-alert" color="#312e81">
              <Button variant="outline">自定义</Button>
            </Popconfirm>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="popconfirmApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="popconfirmProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="popconfirmEmits" />
          </TabPane>
          <TabPane name="slots" label="Slots">
            <ParamTable :columns="slotsColumns" :rows="popconfirmSlots" />
          </TabPane>
        </Tabs>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">示例代码</h3>
      </div>
      <div class="p-4">
        <CodeBlock :code="popconfirmCodeExample" lang="html" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Button } from '@unoui/vue/button'
import { Popconfirm, type PopconfirmPlacement } from '@unoui/vue/popconfirm'
import { Tabs, TabPane } from '@unoui/vue/tab'
import CodeBlock from '@/components/CodeBlock.vue'
import ParamTable from '@/components/ParamTable.vue'
import { popconfirmCodeExample, popconfirmEmits, popconfirmProps, popconfirmSlots } from '@/data/popconfirm'
import { emitsColumns, propsColumns, slotsColumns } from '@/data/shared'

const popconfirmApiTab = ref('props')
const controlledOpen = ref(false)
const lastAction = ref('等待操作')
const placements: PopconfirmPlacement[] = ['topLeft', 'top', 'topRight', 'leftTop', 'left', 'leftBottom', 'rightTop', 'right', 'rightBottom', 'bottomLeft', 'bottom', 'bottomRight']
</script>
