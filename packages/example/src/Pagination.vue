<template>
  <section id="showcase-pagination" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">Pagination</h2>
      <p class="mt-1 text-xs text-tertiary">展示标准分页、紧凑分页和分页状态。</p>
    </div>
    <div class="grid gap-3 p-4 text-sm text-secondary">
      <div class="grid gap-3 rounded-md border border-medium bg-secondary/40 p-3">
        <Pagination v-model:current-page="paginationCurrentPage" v-model:page-size="paginationPageSize" :total="paginationTotal" />
        <Pagination v-model:current-page="paginationCompactPage" :total="48" layout="prev, pager, next" size="sm" />
        <div class="text-xs text-tertiary">当前：第 {{ paginationCurrentPage }} 页，每页 {{ paginationPageSize }} 条</div>
      </div>
    </div>

    <!-- API 参数 -->
    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="paginationApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="paginationProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="paginationEmits" />
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
        <CodeBlock :code="paginationCodeExample" lang="html" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Pagination } from '@mcistudio/unoui-vue/pagination'
import { Tabs, TabPane } from '@mcistudio/unoui-vue/tab'
import { propsColumns, emitsColumns } from '@/data/shared'
import { paginationProps, paginationEmits, paginationCodeExample } from '@/data/pagination'
import ParamTable from '@/components/ParamTable.vue'
import CodeBlock from '@/components/CodeBlock.vue'

const paginationApiTab = ref('props')
const paginationCurrentPage = ref(2)
const paginationCompactPage = ref(3)
const paginationPageSize = ref(20)
const paginationTotal = ref(186)
</script>
