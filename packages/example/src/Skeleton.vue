<template>
  <div id="showcase-skeleton" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">Skeleton</h2>
    </div>
    <div class="grid gap-4 p-4">
      <DataSkeleton variant="line" width="220px" height="12px" />
      <DataSkeleton variant="list" :rows="3" item-height="34px" />
      <DataSkeleton variant="grid" :rows="4" column-width="96px" />
    </div>

    <!-- API 参数 -->
    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数</h3>
      </div>
      <div class="p-4">
        <ParamTable :columns="propsColumns" :rows="skeletonProps" />
      </div>
    </div>

    <!-- 示例代码 -->
    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">示例代码</h3>
      </div>
      <div class="p-4">
        <CodeBlock :code="skeletonCodeExample" lang="html" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DataSkeleton } from '@unoui/vue/skeleton'
import { propsColumns } from '@/data/shared'
import { skeletonProps, skeletonCodeExample } from '@/data/skeleton'
import ParamTable from '@/components/ParamTable.vue'
import CodeBlock from '@/components/CodeBlock.vue'
</script>
