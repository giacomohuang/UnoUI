<template>
  <section id="showcase-alert" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">Alert</h2>
      <p class="mt-1 text-xs text-tertiary">提示组件，支持状态色、图标、描述、公告条、操作区、关闭和语义样式扩展。</p>
    </div>

    <div class="grid gap-5 p-4 text-sm text-secondary">
      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">状态</span>
        <div class="grid gap-3 lg:grid-cols-2">
          <Alert v-for="item in alertTypes" :key="item.type" :type="item.type" :title="item.title" show-icon />
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">描述</span>
        <div class="grid gap-3 lg:grid-cols-2">
          <Alert title="云端版本冲突" description="当前项目已经被其他成员提交，请刷新后再继续编辑。" type="warning" show-icon />
          <Alert title="图标资源导出失败" description="请检查 OSS 配置和 iconfont 导出脚本输出，再重新尝试。" type="error" show-icon variant="filled" />
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">操作</span>
        <div class="grid gap-3">
          <Alert title="检测到未保存的编辑内容" type="info" show-icon>
            <template #action>
              <Button size="sm" variant="outline" icon="i-lucide:save">保存</Button>
            </template>
          </Alert>
          <Alert title="系统将在 22:00 维护" banner closable @after-close="bannerClosed = true" />
          <div v-if="bannerClosed" class="text-xs text-tertiary">公告条已关闭。</div>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">自定义</span>
        <div class="grid gap-3 lg:grid-cols-2">
          <Alert type="success" show-icon closable>
            <template #icon>
              <span class="i-lucide:sparkles size-[1em]"></span>
            </template>
            <template #title>自动标注完成</template>
            <template #description>已识别 128 个铺位标签，可进入预览确认。</template>
          </Alert>
          <Alert title="自定义背景" type="info" show-icon :styles="{ root: { borderColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.1)' }, icon: { color: '#7c3aed' } }" />
        </div>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="alertApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="alertProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="alertEmits" />
          </TabPane>
          <TabPane name="slots" label="Slots">
            <ParamTable :columns="slotsColumns" :rows="alertSlots" />
          </TabPane>
        </Tabs>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">示例代码</h3>
      </div>
      <div class="p-4">
        <CodeBlock :code="alertCodeExample" lang="html" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Alert, type AlertType } from '@unoui/vue/alert'
import { Button } from '@unoui/vue/button'
import { Tabs, TabPane } from '@unoui/vue/tab'
import CodeBlock from '@/components/CodeBlock.vue'
import ParamTable from '@/components/ParamTable.vue'
import { alertCodeExample, alertEmits, alertProps, alertSlots } from '@/data/alert'
import { emitsColumns, propsColumns, slotsColumns } from '@/data/shared'

const alertApiTab = ref('props')
const bannerClosed = ref(false)
const alertTypes: Array<{ type: AlertType; title: string }> = [
  { type: 'success', title: '数据同步成功' },
  { type: 'info', title: '当前地图使用默认语言展示' },
  { type: 'warning', title: '存在未发布的项目版本' },
  { type: 'error', title: '路径规划网络生成失败' }
]
</script>
