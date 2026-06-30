<template>
  <button data-ui-button="true" :data-color="color" :data-variant="variant" :type="type" :class="button({ color, variant, size, radius, disabled })" :disabled="disabled">
    <span v-if="loading" class="i-lucide:loader-2 animate-spin" :style="`font-size: ${iconSize}px`"></span>
    <span v-else-if="icon" :class="icon" :style="`font-size: ${iconSize}px`"></span>
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { button, type ButtonProps } from '.'

/**
 * Button 是管理端轻量按钮组件，统一颜色、尺寸、圆角、图标和加载态样式。
 */
withDefaults(
  defineProps<{
    /** color 是按钮色彩语义，可选，默认 brand。 */
    color?: ButtonProps['color']
    /** variant 是按钮视觉变体，可选，默认 default。 */
    variant?: ButtonProps['variant']
    /** icon 是 UnoCSS/Iconify 图标类名，可选。 */
    icon?: string
    /** iconSize 是图标字号像素值字符串，可选，默认 14。 */
    iconSize?: string
    /** size 是按钮尺寸，可选，默认 md。 */
    size?: ButtonProps['size']
    /** radius 是按钮圆角尺寸，可选，默认 md。 */
    radius?: ButtonProps['radius']
    /** loading 表示是否展示加载图标，可选，默认 false。 */
    loading?: boolean
    /** disabled 表示是否禁用点击和指针事件，可选，默认 false。 */
    disabled?: boolean
    /** type 是原生 button 类型，可选，默认 button，避免表单内误触发提交。 */
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    color: 'brand',
    variant: 'default',
    iconSize: '14',
    size: 'md',
    radius: 'md',
    loading: false,
    disabled: false,
    type: 'button'
  }
)
</script>
