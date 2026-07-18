<template>
  <span :class="clsx(tag({ color, variant, size, radius }), closable && 'gap-1')">
    <slot></slot>
    <button
      v-if="closable"
      type="button"
      :aria-label="closeAriaLabel"
      class="-mr-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full text-current opacity-70 transition-opacity hover:bg-current/10 hover:opacity-100"
      @click.stop="handleClose"
    >
      <span :class="closeIcon" class="size-3"></span>
    </button>
  </span>
</template>

<script setup lang="ts">
import { clsx } from 'clsx'

import { tag, type TagProps } from '.'

/**
 * Tag 是管理端轻量标签组件，统一语义色、尺寸和圆角。
 * variant 提供 dark、light、plain 和无描边柔和底色 soft 四种效果。
 */
withDefaults(
  defineProps<{
    /** color 是标签语义色，可选，默认 brand。 */
    color?: TagProps['color']
    /** variant 是标签视觉效果，可选，默认 light。 */
    variant?: TagProps['variant']
    /** size 是标签尺寸，可选，默认 sm。 */
    size?: TagProps['size']
    /** radius 是标签圆角，可选，默认 md。 */
    radius?: TagProps['radius']
    /** closable 表示是否显示关闭按钮，可选，默认 false。 */
    closable?: boolean
    /** closeIcon 是关闭按钮图标类名，可选，默认 lucide:x。 */
    closeIcon?: string
    /** closeAriaLabel 是关闭按钮无障碍文案，可选。 */
    closeAriaLabel?: string
  }>(),
  {
    color: 'brand',
    variant: 'light',
    size: 'sm',
    radius: 'md',
    closable: false,
    closeIcon: 'i-lucide:x',
    closeAriaLabel: '关闭'
  }
)

const emit = defineEmits<{
  (e: 'close', event: MouseEvent): void
}>()

/** handleClose 将内部关闭按钮点击透出给业务组件处理。 */
const handleClose = (event: MouseEvent) => {
  emit('close', event)
}
</script>
