<template>
  <div id="showcase-skeleton" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">Skeleton</h2>
    </div>
    <div class="divide-y divide-light">
      <section class="grid gap-3 p-4">
        <h3 class="font-mono text-xs font-bold text-tertiary">line</h3>
        <Skeleton variant="line" width="220px" height="12px" />
      </section>

      <section class="grid gap-3 p-4">
        <h3 class="font-mono text-xs font-bold text-tertiary">list</h3>
        <Skeleton variant="list" :rows="3" item-height="34px" />
      </section>

      <section class="grid gap-3 p-4">
        <h3 class="font-mono text-xs font-bold text-tertiary">grid</h3>
        <Skeleton variant="grid" :rows="4" column-width="96px" />
      </section>

      <section class="grid gap-3 p-4">
        <h3 class="font-mono text-xs font-bold text-tertiary">article</h3>
        <Skeleton variant="article" :rows="6" />
      </section>

      <section class="grid gap-3 p-4">
        <h3 class="font-mono text-xs font-bold text-tertiary">table</h3>
        <Skeleton variant="table" :rows="4" :columns="4" />
      </section>

      <section class="grid gap-3 p-4">
        <h3 class="font-mono text-xs font-bold text-tertiary">columns</h3>
        <Skeleton variant="columns" :rows="4" :columns="3" column-width="13rem" min-height="240px" item-height="40px" />
      </section>
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
import { Skeleton } from '@unoui/vue/skeleton'

import CodeBlock from '@/components/CodeBlock.vue'
import ParamTable from '@/components/ParamTable.vue'
import { propsColumns } from '@/data/shared'
import { skeletonProps, skeletonCodeExample } from '@/data/skeleton'
</script>
