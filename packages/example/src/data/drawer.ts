import type { ParamTableRow } from '@/components/ParamTable.vue'

export const drawerProps: ParamTableRow[] = [
  { name: 'modelValue', type: 'boolean', default: 'undefined', desc: '受控显示/隐藏（与 visible 二选一）' },
  { name: 'visible', type: 'boolean', default: 'undefined', desc: '非受控显示/隐藏' },
  { name: 'title', type: 'string', default: `''`, desc: '抽屉标题' },
  { name: 'direction', type: `'rtl' | 'ltr' | 'ttb' | 'btt'`, default: `'rtl'`, desc: '弹出方向：rtl 右侧、ltr 左侧、ttb 顶部、btt 底部' },
  { name: 'size', type: 'number | string', default: `'30%'`, desc: '抽屉宽度或高度' },
  { name: 'withHeader', type: 'boolean', default: 'true', desc: '是否显示标题栏' },
  { name: 'showClose', type: 'boolean', default: 'true', desc: '是否显示关闭按钮' },
  { name: 'closeOnClickModal', type: 'boolean', default: 'true', desc: '点击遮罩层是否关闭' },
  { name: 'closeOnPressEscape', type: 'boolean', default: 'true', desc: '按 Esc 是否关闭' },
  { name: 'beforeClose', type: '(done: () => void) => void | boolean | Promise<void | boolean>', default: 'undefined', desc: '关闭前回调，返回 false 可阻止关闭' },
  { name: 'destroyOnClose', type: 'boolean', default: 'false', desc: '关闭时是否销毁内容' },
  { name: 'modal', type: 'boolean', default: 'true', desc: '是否显示遮罩层' },
  { name: 'lockScroll', type: 'boolean', default: 'true', desc: '是否锁定 body 滚动' },
  { name: 'zIndex', type: 'number | string', default: '2000', desc: '层级' },
  { name: 'bodyClass', type: 'string', default: `''`, desc: '内容区域额外 CSS 类名' },
  { name: 'push', type: 'boolean | { distance?: number | string }', default: 'true', desc: '多层抽屉打开时是否推动父级抽屉，默认距离 180px' }
]

export const drawerEmits: ParamTableRow[] = [
  { name: 'update:modelValue', params: 'boolean', desc: '受控显示/隐藏更新' },
  { name: 'update:visible', params: 'boolean', desc: '非受控显示/隐藏更新' },
  { name: 'open', params: '—', desc: '打开动画开始前触发' },
  { name: 'opened', params: '—', desc: '打开动画结束后触发' },
  { name: 'close', params: '—', desc: '关闭动画开始前触发' },
  { name: 'closed', params: '—', desc: '关闭动画结束后触发' }
]

export const drawerSlots: ParamTableRow[] = [
  { name: 'default', scoped: '—', desc: '抽屉主体内容' },
  { name: 'header', scoped: '—', desc: '自定义标题区域（替换默认 header）' },
  { name: 'icon', scoped: '—', desc: '标题栏图标区域' },
  { name: 'footer', scoped: '—', desc: '底部操作区' }
]

export const drawerCodeExample = `<script setup>
import { ref } from 'vue'
import { Drawer } from '@unoui/vue/drawer'
import { Button } from '@unoui/vue/button'

const visible = ref(false)
const parentVisible = ref(false)
const childVisible = ref(false)
</script>

<template>
  <Button @click="visible = true">打开抽屉</Button>
  <Button @click="parentVisible = true">打开多层抽屉</Button>

  <Drawer v-model:visible="visible" title="设置" direction="rtl" size="400px">
    <div class="p-4 text-sm text-secondary">
      <p>抽屉内容区域</p>
    </div>
    <template #footer>
      <Button variant="outline" @click="visible = false">取消</Button>
      <Button @click="visible = false">确定</Button>
    </template>
  </Drawer>

  <Drawer v-model:visible="parentVisible" title="父级抽屉" :push="{ distance: 180 }">
    <Button @click="childVisible = true">打开子级抽屉</Button>
    <Drawer v-model:visible="childVisible" title="子级抽屉">
      子级内容
    </Drawer>
  </Drawer>
</template>`
