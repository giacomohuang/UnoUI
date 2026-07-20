import type { ParamTableRow } from '@/components/ParamTable.vue'

export const colorPickerProps: ParamTableRow[] = [
  { name: 'modelValue', type: 'ColorPickerValue', default: 'undefined', desc: '对象式颜色值，支持 solid、linear、radial' },
  { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'`, desc: '触发器尺寸' },
  { name: 'allowGradient', type: 'boolean', default: 'true', desc: '是否允许选择 linear/radial 渐变模式' },
  { name: 'allowAlpha', type: 'boolean', default: 'true', desc: '是否允许选择透明度；关闭后 alpha 固定为 1' },
  { name: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用交互' }
]

export const colorPickerEmits: ParamTableRow[] = [
  { name: 'update:modelValue', params: 'ColorPickerValue', desc: '受控颜色值更新' },
  { name: 'changed', params: 'ColorPickerValue', desc: '颜色值改变时触发' }
]

export const colorPickerCodeExample = `<script setup lang="ts">
import { ref } from 'vue'
import { ColorPicker, type ColorPickerValue } from '@mcistudio/unoui-vue/colorpicker'

const solid = ref<ColorPickerValue>({
  mode: 'solid',
  color: { r: 33, g: 137, b: 216, a: 1 }
})
const linear = ref<ColorPickerValue>({
  mode: 'linear',
  degree: 90,
  gradients: [
    { percent: 10, color: { r: 255, g: 10, b: 20, a: 0.5 } },
    { percent: 100, color: { r: 59, g: 50, b: 240, a: 1 } }
  ]
})
</script>

<template>
  <!-- 纯色 -->
  <ColorPicker v-model="solid" size="md" />

  <!-- 渐变 -->
  <ColorPicker v-model="linear" />

  <!-- 仅纯色模式 -->
  <ColorPicker v-model="solid" :allow-gradient="false" />

  <!-- 不允许透明度 -->
  <ColorPicker v-model="solid" :allow-alpha="false" />
</template>`
