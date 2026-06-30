<script setup lang="ts">
import { ref } from 'vue'

import type { MessageHandler, MessageOptions, MessageRecord, MessageType } from './types'

const typeIcons: Record<MessageType, string> = {
  info: 'i-lucide:info',
  success: 'i-lucide:circle-check',
  warning: 'i-lucide:triangle-alert',
  error: 'i-lucide:circle-x'
}

const typeClasses: Record<MessageType, string> = {
  info: 'border-brand-500/20 bg-brand-500/10 text-brand-500 dark:border-brand-400/30 dark:bg-brand-400/20 dark:text-brand-200',
  success: 'border-green-500/20 bg-green-500/10 text-green-500 dark:border-green-400/30 dark:bg-green-400/20 dark:text-green-200',
  warning: 'border-amber-500/25 bg-amber-500/10 text-amber-500 dark:border-amber-400/30 dark:bg-amber-400/20 dark:text-amber-200',
  error: 'border-red-500/20 bg-red-500/10 text-red-500 dark:border-red-400/30 dark:bg-red-400/20 dark:text-red-200'
}

const messages = ref<MessageRecord[]>([])
const timers = new Map<string, number>()
let seed = 0

function normalizeOptions(options: MessageOptions): MessageRecord {
  const type = options.type ?? 'info'
  return {
    id: options.id || `ui-message-${Date.now()}-${++seed}`,
    message: options.message ?? '',
    type,
    duration: options.duration ?? 3000,
    showClose: options.showClose ?? false,
    offset: options.offset ?? 16,
    icon: options.icon,
    onClose: options.onClose
  }
}

function close(id: string) {
  const index = messages.value.findIndex((item) => item.id === id)
  if (index === -1) return
  const [record] = messages.value.splice(index, 1)
  const timer = timers.get(id)
  if (timer) window.clearTimeout(timer)
  timers.delete(id)
  record?.onClose?.()
}

function add(options: MessageOptions): MessageHandler {
  const record = normalizeOptions(options)
  messages.value.push(record)
  if (record.duration > 0) {
    timers.set(
      record.id,
      window.setTimeout(() => close(record.id), record.duration)
    )
  }
  return {
    close: () => close(record.id)
  }
}

function closeAll() {
  ;[...messages.value].forEach((item) => close(item.id))
}

defineExpose({
  add,
  close,
  closeAll
})
</script>

<template>
  <div class="pointer-events-none fixed left-1/2 top-0 z-[3000] flex w-[min(92vw,520px)] -translate-x-1/2 flex-col items-stretch gap-2" data-ui-message-container="true" :style="{ paddingTop: `${messages[0]?.offset ?? 16}px` }">
    <TransitionGroup name="ui-message" tag="div" class="grid gap-2">
      <div v-for="item in messages" :key="item.id" class="pointer-events-auto flex min-h-10 items-center gap-2 rounded-md border px-3 py-2 text-sm shadow-lg backdrop-blur-md" :class="typeClasses[item.type]" data-ui-message="true">
        <span :class="item.icon || typeIcons[item.type]" class="size-4 shrink-0"></span>
        <span class="min-w-0 flex-1 break-words text-primary">{{ item.message }}</span>
        <button v-if="item.showClose" type="button" aria-label="关闭" class="-mr-1 flex size-6 shrink-0 items-center justify-center rounded transition-colors hover:bg-current/10" @click="close(item.id)">
          <span class="i-lucide:x size-3.5"></span>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.ui-message-enter-active,
.ui-message-leave-active,
.ui-message-move {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.ui-message-enter-from,
.ui-message-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
