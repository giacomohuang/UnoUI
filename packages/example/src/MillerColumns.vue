<template>
  <section id="showcase-miller-columns" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">MillerColumns</h2>
      <p class="mt-1 text-xs text-tertiary">用于资源、角色等扁平层级数据的多列浏览、路径选择、详情展示和同级拖拽排序。</p>
    </div>

    <div class="grid gap-5 p-4">
      <MillerColumns v-model="selectedIds" :data-source="resourceMap" id-key="id" parent-id-key="pid" order-key="order" width="100%" height="360px" min-height="360px" column-width="15rem" info-panel-width="280px" sortable @select="handleSelect" @reorder="handleReorder">
        <template #col-title="{ colIndex }">
          <span>{{ `第 ${colIndex + 1} 层` }}</span>
        </template>

        <template #item-left="{ item, active }">
          <span :class="getNodeIcon(item, active)" class="size-4 shrink-0" />
          <span class="min-w-0 truncate">{{ item.name }}</span>
        </template>

        <template #info-panel="{ item }">
          <div v-if="item" class="flex h-full flex-col">
            <div class="border-b border-medium p-5">
              <div class="flex items-center gap-3">
                <div class="flex size-12 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                  <span :class="getNodeIcon(item)" class="size-6" />
                </div>
                <div class="min-w-0">
                  <div class="truncate text-lg font-bold text-primary">{{ item.name }}</div>
                  <div class="mt-1 text-xs text-tertiary">{{ item.code }}</div>
                </div>
              </div>
            </div>
            <div class="grid gap-3 p-5 text-sm">
              <div class="flex items-center justify-between gap-3">
                <span class="text-tertiary">类型</span>
              </div>
              <div class="flex items-center justify-between gap-3">
                <span class="text-tertiary">状态</span>
              </div>
              <div class="flex items-center justify-between gap-3">
                <span class="text-tertiary">排序</span>
                <code class="rounded bg-secondary px-1.5 py-0.5 text-xs text-brand">{{ item.order }}</code>
              </div>
              <div class="rounded-md border border-medium bg-secondary/40 px-3 py-2 text-xs leading-5 text-secondary">当前路径：{{ selectedPathText }}</div>
            </div>
          </div>
          <div v-else class="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-tertiary">
            <span class="i-lucide:panels-top-left size-10 text-quaternary" />
            <span class="text-sm font-semibold">选择一个节点查看详情</span>
          </div>
        </template>
      </MillerColumns>
      <div class="flex flex-wrap items-center gap-3 rounded-md border border-medium bg-secondary/40 px-3 py-2 text-xs text-secondary">
        <span class="font-semibold text-tertiary">当前路径</span>
        <code class="rounded bg-primary px-1.5 py-0.5 text-brand">{{ selectedPathText || '未选择' }}</code>
        <span class="font-semibold text-tertiary">最近事件</span>
        <code class="rounded bg-primary px-1.5 py-0.5 text-brand">{{ lastAction || '—' }}</code>
      </div>

      <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <h3 class="mb-3 text-sm font-bold text-secondary">无详情面板</h3>
          <MillerColumns v-model="compactSelectedIds" :data-source="resourceMap" id-key="id" parent-id-key="pid" order-key="order" :show-info-panel="false" width="100%" height="260px" min-height="260px" column-width="14rem">
            <template #col-title="{ colIndex, itemCount }">
              <span>{{ `Level ${colIndex + 1}` }}</span>
              <span class="text-xs text-tertiary">{{ itemCount }}</span>
            </template>
            <template #item-left="{ item, active }">
              <span :class="getNodeIcon(item, active)" class="size-4 shrink-0" />
              <span class="truncate">{{ item.name }}</span>
            </template>
          </MillerColumns>
        </div>
      </div>
    </div>

    <!-- API 参数 -->
    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="apiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="millerColumnsProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="millerColumnsEmits" />
          </TabPane>
          <TabPane name="slots" label="Slots">
            <ParamTable :columns="slotsColumns" :rows="millerColumnsSlots" />
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
        <CodeBlock :code="millerColumnsCodeExample" lang="html" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { MillerColumns, type MillerColumnsId, type MillerColumnsSelectEvent } from '@mcistudio/unoui-vue/millercolumns'
import { TabPane, Tabs } from '@mcistudio/unoui-vue/tab'
import CodeBlock from '@/components/CodeBlock.vue'
import ParamTable from '@/components/ParamTable.vue'
import { millerColumnsCodeExample, millerColumnsEmits, millerColumnsProps, millerColumnsSlots } from '@/data/millercolumns'
import { emitsColumns, propsColumns, slotsColumns } from '@/data/shared'

type ResourceStatus = '启用' | '维护中' | '停用'

interface ResourceNode extends Record<string, unknown> {
  id: number
  pid: number | null
  order: number
  name: string
  code: string
  type: '目录' | '页面' | '操作'
  status: ResourceStatus
}

const apiTab = ref('props')
const selectedIds = ref<MillerColumnsId[]>([1, 4])
const compactSelectedIds = ref<MillerColumnsId[]>([2])

const lastAction = ref('')

const resourceMap = ref(
  new Map<MillerColumnsId, ResourceNode>([
    [1, { id: 1, pid: null, order: 0, name: '系统管理', code: 'sys', type: '目录', status: '启用' }],
    [2, { id: 2, pid: null, order: 1, name: '地图管理', code: 'map', type: '目录', status: '启用' }],
    [3, { id: 3, pid: null, order: 2, name: '运营看板', code: 'dashboard', type: '页面', status: '维护中' }],
    [4, { id: 4, pid: 1, order: 0, name: '角色管理', code: 'sys.role', type: '页面', status: '启用' }],
    [5, { id: 5, pid: 1, order: 1, name: '资源管理', code: 'sys.resource', type: '页面', status: '启用' }],
    [6, { id: 6, pid: 1, order: 2, name: '账号管理', code: 'sys.account', type: '页面', status: '停用' }],
    [7, { id: 7, pid: 4, order: 0, name: '新增角色', code: 'sys.role.add', type: '操作', status: '启用' }],
    [8, { id: 8, pid: 4, order: 1, name: '编辑角色', code: 'sys.role.edit', type: '操作', status: '启用' }],
    [9, { id: 9, pid: 4, order: 2, name: '删除角色', code: 'sys.role.delete', type: '操作', status: '维护中' }],
    [10, { id: 10, pid: 2, order: 0, name: '项目列表', code: 'map.project', type: '页面', status: '启用' }],
    [11, { id: 11, pid: 2, order: 1, name: '图层编辑', code: 'map.builder', type: '页面', status: '启用' }]
  ])
)

const selectedPathText = computed(() =>
  selectedIds.value
    .map((id) => resourceMap.value.get(id)?.name)
    .filter(Boolean)
    .join(' / ')
)

function getNodeIcon(item: ResourceNode, active = false) {
  const iconMap: Record<ResourceNode['type'], string> = {
    目录: 'i-lucide:folder text-yellow-500',
    页面: 'i-lucide:file-text text-brand-500',
    操作: 'i-lucide:mouse-pointer-click text-green-500'
  }
  return `${iconMap[item.type]} ${active ? 'text-white!' : ''}`
}

function handleSelect(event: MillerColumnsSelectEvent<ResourceNode>) {
  lastAction.value = `select:${event.id}`
}

function handleReorder(ids: MillerColumnsId[]) {
  lastAction.value = `reorder:${ids.join(',')}`
}
</script>
