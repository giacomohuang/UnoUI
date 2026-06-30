import type { ParamTableRow } from '@/components/ParamTable.vue'

export const messageOptions: ParamTableRow[] = [
  { name: 'message', type: 'string', default: 'undefined', desc: '消息文本内容' },
  { name: 'type', type: `'info' | 'success' | 'warning' | 'error'`, default: `'info'`, desc: '消息类型' },
  { name: 'duration', type: 'number', default: '3000', desc: '自动关闭毫秒数' },
  { name: 'showClose', type: 'boolean', default: 'false', desc: '是否显示关闭按钮' },
  { name: 'offset', type: 'number', default: 'undefined', desc: '消息距顶部偏移像素' },
  { name: 'icon', type: 'string', default: 'undefined', desc: '自定义图标类名' },
  { name: 'id', type: 'string', default: 'undefined', desc: '自定义消息 ID（用于手动关闭）' },
  { name: 'onClose', type: '() => void', default: 'undefined', desc: '关闭时回调' }
]

export const messageMethods: ParamTableRow[] = [
  { name: 'message.info(msg, opts?)', signature: 'MessageHandler', desc: '信息提示' },
  { name: 'message.success(msg, opts?)', signature: 'MessageHandler', desc: '成功提示' },
  { name: 'message.warning(msg, opts?)', signature: 'MessageHandler', desc: '警告提示' },
  { name: 'message.error(msg, opts?)', signature: 'MessageHandler', desc: '错误提示' },
  { name: 'message(msg)', signature: 'MessageHandler', desc: '通用消息（默认 type 为 info）' },
  { name: 'message.closeAll()', signature: 'void', desc: '关闭所有消息' }
]

export const messageCodeExample = `<script setup>
import { message } from '@unoui/vue/message'

function showMessages() {
  // 字符串快捷调用
  message.success('操作成功')
  message.error('操作失败')
  message.warning('请检查输入')
  message.info('这是一条普通消息')

  // 对象配置方式
  message.success({
    message: '保存成功',
    duration: 5000,
    showClose: true
  })

  // 带回调
  message.info({
    message: '可手动关闭',
    duration: 0,
    showClose: true,
    onClose: () => console.log('消息已关闭')
  })
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Button @click="message.success('操作成功')">成功</Button>
    <Button @click="message.error('操作失败')">错误</Button>
    <Button @click="message.warning('请检查输入')">警告</Button>
    <Button @click="message.info('提示信息')">信息</Button>
    <Button @click="message.closeAll()">关闭全部</Button>
  </div>
</template>`
