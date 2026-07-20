<template>
  <section id="showcase-modal" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">Modal</h2>
    </div>
    <div class="flex flex-wrap items-center gap-3 p-4">
      <Button icon="i-lucide:panel-top-open" @click="modalVisible = true">打开弹窗</Button>
      <Button variant="outline" @click="compactModalVisible = true">紧凑弹窗</Button>
    </div>

    <Modal v-model:visible="modalVisible" title="普通弹窗" width="520px">
      <div class="space-y-4 p-4 text-sm text-secondary">
        <p>这里展示 Modal 的默认标题、关闭按钮、正文区域和 footer 插槽。</p>
        <div class="rounded-md border border-medium bg-secondary p-3">
          <div class="mb-2 text-xs font-bold uppercase text-tertiary">状态标签</div>
          <div class="flex flex-wrap gap-2">
            <Tag color="brand">默认</Tag>
            <Tag color="green">成功</Tag>
            <Tag color="red">风险</Tag>
          </div>
        </div>
      </div>
      <template #footer>
        <Button variant="outline" @click="modalVisible = false">取消</Button>
        <Button @click="modalVisible = false">确认</Button>
      </template>
    </Modal>

    <Modal v-model:visible="compactModalVisible" title="紧凑弹窗" :width="360" :close-on-backdrop="false">
      <div class="p-4 text-sm text-secondary">关闭遮罩点击，只保留 Esc、右上角关闭和底部按钮关闭。</div>
      <template #footer>
        <Button size="sm" variant="outline" @click="compactModalVisible = false">关闭</Button>
      </template>
    </Modal>

    <!-- API 参数 -->
    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="modalApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="modalProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="modalEmits" />
          </TabPane>
          <TabPane name="slots" label="Slots">
            <ParamTable :columns="slotsColumns" :rows="modalSlots" />
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
        <CodeBlock :code="modalCodeExample" lang="html" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Button } from '@mcistudio/unoui-vue/button'
import { Modal } from '@mcistudio/unoui-vue/modal'
import { Tag } from '@mcistudio/unoui-vue/tag'
import { Tabs, TabPane } from '@mcistudio/unoui-vue/tab'
import { propsColumns, emitsColumns, slotsColumns } from '@/data/shared'
import { modalProps, modalEmits, modalSlots, modalCodeExample } from '@/data/modal'
import ParamTable from '@/components/ParamTable.vue'
import CodeBlock from '@/components/CodeBlock.vue'

const modalApiTab = ref('props')
const modalVisible = ref(false)
const compactModalVisible = ref(false)
</script>
