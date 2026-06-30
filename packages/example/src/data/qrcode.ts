import type { ParamTableRow } from '@/components/ParamTable.vue'

export const qrcodeProps: ParamTableRow[] = [
  { name: 'value', type: 'string', default: '-', desc: '二维码编码内容' },
  { name: 'type', type: `'canvas' | 'svg'`, default: `'canvas'`, desc: '渲染类型' },
  { name: 'size', type: 'number', default: '160', desc: '二维码外框尺寸，单位 px' },
  { name: 'color', type: 'string', default: `'#111827'`, desc: '二维码前景色' },
  { name: 'bgColor', type: 'string', default: `'#ffffff'`, desc: '二维码背景色' },
  { name: 'icon', type: 'string', default: `''`, desc: '二维码中心 logo 图片地址' },
  { name: 'iconSize', type: `number | { width: number; height: number }`, default: 'undefined', desc: '中心 logo 尺寸' },
  { name: 'status', type: `'active' | 'expired' | 'loading' | 'scanned'`, default: `'active'`, desc: '二维码状态蒙层' },
  { name: 'bordered', type: 'boolean', default: 'true', desc: '是否显示边框和内边距' },
  { name: 'errorLevel', type: `'L' | 'M' | 'Q' | 'H'`, default: `'M'`, desc: '二维码纠错等级' },
  { name: 'marginSize', type: 'number', default: 'undefined', desc: '二维码安静区宽度，单位为模块格' },
  { name: 'boostLevel', type: 'boolean', default: 'true', desc: '是否在不增加版本的情况下自动提升纠错等级' },
  { name: 'title', type: 'string', default: 'undefined', desc: 'svg title 或 canvas 无障碍名称' },
  { name: 'expiredText', type: 'string', default: `'二维码已过期'`, desc: '过期状态文案' },
  { name: 'refreshText', type: 'string', default: `'刷新'`, desc: '刷新按钮文案' },
  { name: 'scannedText', type: 'string', default: `'已扫描'`, desc: '已扫描状态文案' },
  { name: 'loadingText', type: 'string', default: `'加载中'`, desc: '加载状态文案' },
  { name: 'statusRender', type: `(info: QRCodeStatusRenderInfo) => VNodeChild`, default: 'undefined', desc: '自定义状态蒙层内容' },
  { name: 'classNames', type: `Partial<Record<'root' | 'code' | 'mask' | 'status' | 'refresh', string>>`, default: 'undefined', desc: '语义结构类名' },
  { name: 'styles', type: `Partial<Record<'root' | 'code' | 'mask' | 'status' | 'refresh', CSSProperties | string>>`, default: 'undefined', desc: '语义结构样式' }
]

export const qrcodeEmits: ParamTableRow[] = [{ name: 'refresh', params: '(event?: MouseEvent)', desc: '点击过期状态刷新按钮时触发' }]

export const qrcodeSlots: ParamTableRow[] = [{ name: 'status', scoped: '{ status, locale, onRefresh }', desc: '自定义 loading / expired / scanned 状态蒙层' }]

export const qrcodeExposes: ParamTableRow[] = [{ name: 'toDataURL', signature: `(type?: string, quality?: number) => string | undefined`, desc: '导出当前二维码 data URL；canvas 默认 png，svg 返回 svg data URL' }]

export const qrcodeCodeExample = `<script setup lang="ts">
import { ref } from 'vue'

import { Button } from '@unoui/vue/button'
import { QRCode } from '@unoui/vue/qrcode'

const status = ref<'active' | 'expired'>('active')
</script>

<template>
  <QRCode
    value="https://vmap.example.com/project/10000"
    icon="/favicon.ico"
    :icon-size="36"
    error-level="H"
    :margin-size="2"
    :status="status"
    @refresh="status = 'active'"
  >
    <template #status="{ onRefresh }">
      <div class="flex flex-col items-center gap-2 text-xs text-secondary">
        <span>请重新生成二维码</span>
        <Button size="sm" variant="link" @click="onRefresh()">刷新</Button>
      </div>
    </template>
  </QRCode>
</template>`
