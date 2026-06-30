/** MessageType 是消息提示的语义类型。 */
export type MessageType = 'info' | 'success' | 'warning' | 'error'

/** MessageOptions 是 message 函数支持的配置项。 */
export interface MessageOptions {
  message?: string
  type?: MessageType
  duration?: number
  showClose?: boolean
  offset?: number
  icon?: string
  id?: string
  onClose?: () => void
}

/** MessageParams 兼容字符串快捷调用和对象配置。 */
export type MessageParams = string | MessageOptions

/** MessageHandler 是 message 调用返回的关闭句柄。 */
export interface MessageHandler {
  close: () => void
}

export interface MessageRecord extends Required<Pick<MessageOptions, 'type' | 'duration' | 'showClose' | 'offset'>> {
  id: string
  message: string
  icon?: string
  onClose?: () => void
}
