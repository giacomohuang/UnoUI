import type { ParamTableRow } from '@/components/ParamTable.vue'

export const modalProps: ParamTableRow[] = [
  { name: 'visible', type: 'boolean', default: '（必填）', desc: '控制弹窗显示/隐藏' },
  { name: 'title', type: 'string', default: 'undefined', desc: '弹窗标题' },
  { name: 'width', type: 'string | number', default: '400', desc: '弹窗宽度' },
  { name: 'closeOnEsc', type: 'boolean', default: 'true', desc: '按 Esc 是否关闭' },
  { name: 'closeOnBackdrop', type: 'boolean', default: 'true', desc: '点击遮罩是否关闭' },
  { name: 'showClose', type: 'boolean', default: 'true', desc: '是否显示右上角关闭按钮' },
  { name: 'zIndex', type: 'number | string', default: '2000', desc: '弹窗层级' }
]

export const modalEmits: ParamTableRow[] = [
  { name: 'update:visible', params: 'boolean', desc: '弹窗显示/隐藏状态更新' }
]

export const modalSlots: ParamTableRow[] = [
  { name: 'default', scoped: '—', desc: '弹窗主体内容' },
  { name: 'header', scoped: '—', desc: '自定义标题区域' },
  { name: 'icon', scoped: '—', desc: '标题栏图标区域' },
  { name: 'footer', scoped: '—', desc: '底部操作区' }
]

export const modalCodeExample = `<script setup>
import { ref } from 'vue'
import { Modal } from '@unoui/vue/modal'
import { Button } from '@unoui/vue/button'

const visible = ref(false)
</script>

<template>
  <Button @click="visible = true">打开弹窗</Button>

  <Modal v-model:visible="visible" title="确认操作" width="420px">
    <div class="p-4 text-sm text-secondary">
      <p>确定要执行此操作吗？</p>
    </div>
    <template #footer>
      <Button variant="outline" @click="visible = false">取消</Button>
      <Button @click="visible = false">确认</Button>
    </template>
  </Modal>
</template>`
