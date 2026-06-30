<template>
  <section id="showcase-drawer" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">Drawer</h2>
      <p class="mt-1 text-xs text-tertiary">展示抽屉方向、插槽和遮罩关闭。</p>
    </div>
    <div class="grid gap-5 p-4 text-sm text-secondary">
      <div class="grid gap-3 rounded-md border border-medium bg-secondary/40 p-3">
        <h3 class="text-sm font-bold text-secondary">方向</h3>
        <div class="flex flex-wrap items-center gap-2">
          <Button icon="i-lucide:panel-right-open" @click="openDrawer('rtl')">右侧</Button>
          <Button variant="outline" icon="i-lucide:panel-left-open" @click="openDrawer('ltr')">左侧</Button>
          <Button variant="mono" icon="i-lucide:panel-top-open" @click="openDrawer('ttb')">顶部</Button>
          <Button variant="mono" icon="i-lucide:panel-bottom-open" @click="openDrawer('btt')">底部</Button>
        </div>
      </div>
    </div>

    <Drawer v-model="drawerVisible" title="组件抽屉" :direction="drawerDirection" :size="drawerSize">
      <div class="grid gap-4 p-4 text-sm text-secondary">
        <p>抽屉方向：{{ drawerDirection }}</p>
        <Input v-model="drawerForm.name" placeholder="名称" prefix-icon="i-lucide:tag" />
        <Select v-model="drawerForm.status" :options="drawerStatusOptions" placeholder="状态" />
        <div class="rounded-md border border-medium bg-secondary p-3 text-xs text-tertiary">Drawer 使用 Teleport、遮罩、Esc 和 footer 插槽，视觉继承 Modal 的浮层语言。</div>
      </div>
      <template #footer>
        <Button variant="outline" @click="drawerVisible = false">取消</Button>
        <Button @click="drawerVisible = false">保存</Button>
      </template>
    </Drawer>

    <!-- API 参数 -->
    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="drawerApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="drawerProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="drawerEmits" />
          </TabPane>
          <TabPane name="slots" label="Slots">
            <ParamTable :columns="slotsColumns" :rows="drawerSlots" />
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
        <CodeBlock :code="drawerCodeExample" lang="html" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Button } from '@unoui/vue/button'
import { Drawer, type DrawerDirection } from '@unoui/vue/drawer'
import { Input } from '@unoui/vue/input'
import { Select, type SelectOption } from '@unoui/vue/select'
import { Tabs, TabPane } from '@unoui/vue/tab'
import { propsColumns, emitsColumns, slotsColumns } from '@/data/shared'
import { drawerProps, drawerEmits, drawerSlots, drawerCodeExample } from '@/data/drawer'
import ParamTable from '@/components/ParamTable.vue'
import CodeBlock from '@/components/CodeBlock.vue'

const drawerApiTab = ref('props')
const drawerVisible = ref(false)
const drawerDirection = ref<DrawerDirection>('rtl')
const drawerForm = ref({
  name: '组件设置',
  status: 'button'
})
const drawerStatusOptions: SelectOption[] = [
  { label: 'Button 按钮', value: 'button' },
  { label: 'Input 输入框', value: 'input' },
  { label: 'Table 表格', value: 'table' },
  { label: 'Tag 标签', value: 'tag' },
  { label: 'Modal 弹窗', value: 'modal' },
  { label: 'Disabled 禁用', value: 'disabled', disabled: true }
]
const drawerSize = ref('420px')
const openDrawer = (direction: DrawerDirection) => {
  drawerDirection.value = direction
  drawerSize.value = direction === 'ttb' || direction === 'btt' ? '320px' : '420px'
  drawerVisible.value = true
}
</script>
