import { clsx } from 'clsx'
import type { StyleValue } from 'vue'

type UiAttrs = Record<string, unknown>

/** 获取透传 class，供根节点样式计算复用。 */
export function getUiAttrClass(attrs: UiAttrs) {
  return clsx(attrs.class as string | undefined)
}

/** 获取透传 style，供根节点直接绑定。 */
export function getUiAttrStyle(attrs: UiAttrs) {
  return attrs.style as StyleValue | undefined
}

/** class/style 通常绑定在组件根节点，其余属性继续透传给内部原生节点。 */
export function getUiExposeAttrs(attrs: UiAttrs) {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
}
