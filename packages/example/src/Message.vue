<template>
  <section id="showcase-message" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">Message</h2>
      <p class="mt-1 text-xs text-tertiary">展示函数式消息提示。</p>
    </div>
    <div class="grid gap-5 p-4 text-sm text-secondary">
      <div class="grid gap-3 rounded-md border border-medium bg-secondary/40 p-3">
        <h3 class="text-sm font-bold text-secondary">类型</h3>
        <div class="flex flex-wrap items-center gap-2">
          <Button variant="outline" color="gray" icon="i-lucide:info" @click="showMessage('info')">Info</Button>
          <Button variant="outline" color="green" icon="i-lucide:circle-check" @click="showMessage('success')">Success</Button>
          <Button variant="outline" color="yellow" icon="i-lucide:triangle-alert" @click="showMessage('warning')">Warning</Button>
          <Button variant="outline" color="red" icon="i-lucide:circle-x" @click="showMessage('error')">Error</Button>
        </div>
      </div>
    </div>

    <!-- API 参数 -->
    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数 — MessageOptions</h3>
      </div>
      <div class="p-4">
        <ParamTable :columns="propsColumns" :rows="messageOptions" />
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 方法</h3>
      </div>
      <div class="p-4">
        <ParamTable :columns="[
          { key: 'name', title: '方法', width: '240px' },
          { key: 'signature', title: '返回值', mono: true },
          { key: 'desc', title: '说明' }
        ]" :rows="messageMethods" />
      </div>
    </div>

    <!-- 示例代码 -->
    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">示例代码</h3>
      </div>
      <div class="p-4">
        <CodeBlock :code="messageCodeExample" lang="html" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Button } from '@unoui/vue/button'
import { message, type MessageType } from '@unoui/vue/message'
import { propsColumns } from '@/data/shared'
import { messageOptions, messageMethods, messageCodeExample } from '@/data/message'
import ParamTable from '@/components/ParamTable.vue'
import CodeBlock from '@/components/CodeBlock.vue'

const showMessage = (type: MessageType) => {
  const content: Record<MessageType, string> = {
    info: '这是一条普通提示',
    success: '操作已完成',
    warning: '请检查当前配置',
    error: '保存失败，请稍后重试'
  }
  message[type]({ message: content[type], showClose: true })
}
</script>
