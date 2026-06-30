<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-100 flex items-center justify-center p-4 pointer-events-auto"
      :style="{ zIndex }"
      @mousemove="handleInteractionEvent"
      @mousedown="handleInteractionEvent"
      @mouseup="handleInteractionEvent"
      @pointermove="handleInteractionEvent"
      @pointerdown="handleInteractionEvent"
      @pointerup="handleInteractionEvent"
      @wheel="handleInteractionEvent"
      @click="handleInteractionEvent"
      @dblclick="handleInteractionEvent"
      @contextmenu="handleInteractionEvent"
    >
      <!-- 遮罩层负责背景点击关闭，交互是否生效由 closeOnBackdrop 控制。 -->
      <div class="absolute inset-0 bg-zinc-900/10 backdrop-blur-sm" @click="closeOnBackdrop && close()"></div>

      <!-- 对话框容器拦截编辑器画布事件，避免弹窗内操作穿透到底层。 -->
      <div
        class="relative bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 dark:border-zinc-800/50 overflow-hidden flex flex-col"
        :style="{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height
        }"
      >
        <!-- 头部支持默认标题和自定义 header 插槽。 -->
        <div v-if="title || $slots.header" class="px-4 py-3 flex items-center justify-between border-b border-zinc-100/50 dark:border-zinc-800/50">
          <slot name="header">
            <h3 class="text-base font-bold text-secondary uppercase tracking-widest flex items-center gap-2">
              <slot name="icon"></slot>
              {{ title }}
            </h3>
          </slot>
          <div v-if="showClose" @click="close" class="group flex items-center p-1 rounded-full hover:bg-brand-200 dark:hover:bg-brand-500 transition-colors">
            <span class="i-lucide:x size-4 text-zinc-400 group-hover:text-brand-600 dark:group-hover:text-brand-200"></span>
          </div>
        </div>

        <!-- 主体区域由调用方提供内容并独立滚动。 -->
        <div class="flex-1 overflow-auto">
          <slot></slot>
        </div>

        <!-- 底部操作区只在提供 footer 插槽时渲染。 -->
        <div v-if="$slots.footer" class="px-3 py-2.5 bg-zinc-50/30 dark:bg-zinc-800/30 flex justify-end gap-2 border-t border-zinc-100/50 dark:border-zinc-800/50">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'

/**
 * Modal 是轻量弹窗容器。
 */
const props = withDefaults(
  defineProps<{
    /** visible 控制弹窗显示状态，必填。 */
    visible: boolean
    /** title 是默认标题文本，可选。 */
    title?: string
    /** width 是弹窗宽度，可选，支持数字像素或 CSS 长度。 */
    width?: string | number
    /** height 是弹窗高度，可选，支持数字像素或 CSS 长度。 */
    height?: string | number
    /** closeOnEsc 表示是否允许 Esc 关闭，可选，默认 true。 */
    closeOnEsc?: boolean
    /** closeOnBackdrop 表示是否允许点击遮罩关闭，可选，默认 true。 */
    closeOnBackdrop?: boolean
    /** showClose 表示是否展示右上角关闭按钮，可选，默认 true。 */
    showClose?: boolean
    /** zIndex 控制弹窗层级，嵌套在 Drawer 等浮层内时可显式提高。 */
    zIndex?: number | string
    /** eventPropagationSelector 允许特定嵌入式组件把鼠标事件继续交给 document/window 级监听器。 */
    eventPropagationSelector?: string
  }>(),
  {
    width: 400,
    height: undefined,
    closeOnEsc: true,
    closeOnBackdrop: true,
    showClose: true,
    zIndex: 2000,
    eventPropagationSelector: ''
  }
)

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

/** 关闭弹窗并同步 v-model 状态。 */
const close = () => {
  emit('update:visible', false)
}

const shouldAllowEventPropagation = (event: Event) => {
  if (!props.eventPropagationSelector || !(event.target instanceof Element)) return false
  return event.target.closest(props.eventPropagationSelector) !== null
}

/** 默认拦截编辑器事件；少数嵌入式地图可通过选择器放行事件冒泡。 */
const handleInteractionEvent = (event: Event) => {
  if (shouldAllowEventPropagation(event)) return
  event.stopPropagation()
}

const handleKeydown: EventListener = (event) => {
  if (!(event instanceof KeyboardEvent)) return
  if (!props.visible || !props.closeOnEsc || event.key !== 'Escape') return
  // 使用捕获阶段拦截 Esc，避免编辑器快捷键在弹窗打开时继续响应。
  event.preventDefault()
  event.stopPropagation()
  close()
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) window.addEventListener('keydown', handleKeydown, { capture: true })
    else window.removeEventListener('keydown', handleKeydown, { capture: true })
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown, { capture: true })
})
</script>
