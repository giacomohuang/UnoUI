import { createApp } from 'vue'

import MessageContainer from './MessageContainer.vue'
import type { MessageHandler, MessageOptions, MessageParams, MessageType } from './types'

export type { MessageHandler, MessageOptions, MessageParams, MessageType }
export { default as MessageContainer } from './MessageContainer.vue'

type MessageContainerExpose = {
  add: (options: MessageOptions) => MessageHandler
  closeAll: () => void
}

let messageVm: MessageContainerExpose | null = null

function normalizeParams(params: MessageParams, type?: MessageType): MessageOptions {
  if (typeof params === 'string') {
    return { message: params, type }
  }
  return {
    ...params,
    type: params.type ?? type
  }
}

function getMessageVm() {
  if (messageVm) return messageVm
  if (typeof document === 'undefined') return null

  const container = document.createElement('div')
  document.body.appendChild(container)
  const app = createApp(MessageContainer)
  messageVm = app.mount(container) as unknown as MessageContainerExpose
  return messageVm
}

function openMessage(params: MessageParams): MessageHandler {
  const vm = getMessageVm()
  if (!vm) return { close: () => undefined }
  return vm.add(normalizeParams(params))
}

/** message 是管理端轻量消息提示函数，兼容 Element Plus 常用快捷调用。 */
export const message = Object.assign(openMessage, {
  info: (params: MessageParams) => getMessageVm()?.add(normalizeParams(params, 'info')) ?? { close: () => undefined },
  success: (params: MessageParams) => getMessageVm()?.add(normalizeParams(params, 'success')) ?? { close: () => undefined },
  warning: (params: MessageParams) => getMessageVm()?.add(normalizeParams(params, 'warning')) ?? { close: () => undefined },
  error: (params: MessageParams) => getMessageVm()?.add(normalizeParams(params, 'error')) ?? { close: () => undefined },
  closeAll: () => {
    messageVm?.closeAll()
  }
})

/** Message 保留大写导出，方便在业务侧按组件名风格引入。 */
export const Message = message
