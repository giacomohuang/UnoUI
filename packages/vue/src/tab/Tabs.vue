<script setup lang="ts">
import { clsx } from 'clsx'
import { computed, defineComponent, nextTick, provide, reactive, ref, watch } from 'vue'
import type { ComponentPublicInstance, PropType } from 'vue'

import { tabAddButton, tabsContent, tabsContextKey, tabsHeader, tabsNav, tabsRoot, tabTrigger, type RegisteredTabPane, type TabPanePublic, type TabPosition, type TabsBeforeLeave, type TabsEditAction, type TabsProps, type TabsType, type TabValue } from '.'

const props = withDefaults(
  defineProps<{
    /** modelValue 是当前激活标签页的受控值，可选。 */
    modelValue?: TabValue
    /** defaultValue 是非受控模式下的初始激活标签页。 */
    defaultValue?: TabValue
    /** type 是标签页视觉类型，参考 Element Plus Tabs 的 line、card、border-card。 */
    type?: TabsType
    /** tabPosition 是标签栏位置，可选，默认 top。 */
    tabPosition?: TabPosition
    /** size 是标签按钮尺寸，可选，默认 md。 */
    size?: TabsProps['size']
    /** stretch 兼容 Element Plus API，标签按钮默认保持自身宽度。 */
    stretch?: boolean
    /** closable 表示是否所有标签都显示关闭入口。 */
    closable?: boolean
    /** addable 表示是否显示新增标签入口。 */
    addable?: boolean
    /** editable 同时启用 closable 与 addable。 */
    editable?: boolean
    /** padded 表示内容区是否使用默认留白。 */
    padded?: boolean
    /** beforeLeave 在切换前执行，返回 false 可阻止切换。 */
    beforeLeave?: TabsBeforeLeave
    /** ariaLabel 是标签栏无障碍名称。 */
    ariaLabel?: string
    /** addAriaLabel 是新增标签按钮无障碍名称。 */
    addAriaLabel?: string
    /** closeAriaLabel 是关闭标签按钮无障碍名称前缀。 */
    closeAriaLabel?: string
  }>(),
  {
    modelValue: undefined,
    defaultValue: undefined,
    type: 'line',
    tabPosition: 'top',
    size: 'md',
    stretch: false,
    closable: false,
    addable: false,
    editable: false,
    padded: true,
    beforeLeave: undefined,
    ariaLabel: '标签页',
    addAriaLabel: '新增标签',
    closeAriaLabel: '关闭标签'
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: TabValue): void
  (e: 'tab-click', pane: TabPanePublic, event: MouseEvent | KeyboardEvent): void
  (e: 'tab-change', value: TabValue): void
  (e: 'tab-add'): void
  (e: 'tab-remove', value: TabValue): void
  (e: 'edit', targetName: TabValue | undefined, action: TabsEditAction): void
}>()

const tabsId = `ui-tabs-${Math.random().toString(36).slice(2, 9)}`
const panes = reactive(new Map<number, RegisteredTabPane>())
const internalValue = ref<TabValue | undefined>(props.defaultValue)
const switching = ref(false)
const tabButtonRefs = new Map<TabValue, Element>()

const orderedPanes = computed(() => Array.from(panes.values()).sort((prev, next) => prev.order - next.order))
const activeValue = computed(() => (props.modelValue === undefined ? internalValue.value : props.modelValue))
const isVertical = computed(() => props.tabPosition === 'left' || props.tabPosition === 'right')
const canAdd = computed(() => props.addable || props.editable)
const rootClass = computed(() => tabsRoot({ type: props.type, tabPosition: props.tabPosition }))
const headerClass = computed(() => tabsHeader({ type: props.type, tabPosition: props.tabPosition }))
const navClass = computed(() => tabsNav({ tabPosition: props.tabPosition }))
const contentClass = computed(() => tabsContent({ type: props.type, tabPosition: props.tabPosition, padded: props.padded }))

const createPublicPane = (pane: RegisteredTabPane): TabPanePublic => ({
  name: pane.name,
  label: pane.label,
  disabled: pane.disabled,
  closable: pane.closable,
  lazy: pane.lazy,
  index: orderedPanes.value.findIndex((item) => item.uid === pane.uid)
})

function isPaneActive(pane: RegisteredTabPane) {
  return activeValue.value === pane.name
}

function isPaneClosable(pane: RegisteredTabPane) {
  return !pane.disabled && (props.closable || props.editable || pane.closable)
}

const PaneLabel = defineComponent({
  name: 'PaneLabel',
  props: {
    pane: {
      type: Object as PropType<RegisteredTabPane>,
      required: true
    }
  },
  setup(labelProps) {
    return () => {
      const slotContent = labelProps.pane.slots.label?.({
        active: isPaneActive(labelProps.pane),
        pane: createPublicPane(labelProps.pane)
      })

      return slotContent ?? labelProps.pane.label ?? String(labelProps.pane.name)
    }
  }
})

function getTabId(name: TabValue) {
  return `${tabsId}-tab-${String(name)}`
}

function getPanelId(name: TabValue) {
  return `${tabsId}-panel-${String(name)}`
}

function registerPane(pane: RegisteredTabPane) {
  panes.set(pane.uid, pane)
}

function updatePane(uid: number, pane: RegisteredTabPane) {
  panes.set(uid, pane)
}

function unregisterPane(uid: number) {
  const pane = panes.get(uid)
  if (pane) tabButtonRefs.delete(pane.name)
  panes.delete(uid)
}

// TabPane 只声明内容和元信息，导航项由 Tabs 统一注册后生成。
provide(tabsContextKey, {
  activeValue,
  registerPane,
  updatePane,
  unregisterPane,
  getTabId,
  getPanelId
})

function getFallbackValue() {
  const panesList = orderedPanes.value
  const defaultPane = panesList.find((pane) => pane.name === props.defaultValue && !pane.disabled)
  return defaultPane?.name ?? panesList.find((pane) => !pane.disabled)?.name ?? panesList[0]?.name
}

watch(
  orderedPanes,
  () => {
    if (props.modelValue !== undefined) return
    if (activeValue.value !== undefined && orderedPanes.value.some((pane) => pane.name === activeValue.value)) return
    internalValue.value = getFallbackValue()
  },
  {
    immediate: true,
    flush: 'post'
  }
)

function triggerClass(pane: RegisteredTabPane, index: number) {
  return tabTrigger({
    type: props.type,
    tabPosition: props.tabPosition,
    size: props.size,
    active: isPaneActive(pane),
    disabled: pane.disabled,
    stretch: false,
    first: index === 0,
    last: index === orderedPanes.value.length - 1
  })
}

function setTabButtonRef(name: TabValue, element: Element | ComponentPublicInstance | null) {
  if (!element) {
    tabButtonRefs.delete(name)
    return
  }
  const current = element instanceof Element ? element : (element.$el as Element | undefined)
  if (current) tabButtonRefs.set(name, current)
}

async function setActiveValue(value: TabValue) {
  const oldValue = activeValue.value
  if (Object.is(value, oldValue)) return true
  if (switching.value) return false

  switching.value = true
  try {
    const canLeave = await props.beforeLeave?.(value, oldValue)
    if (canLeave === false) return false
    if (props.modelValue === undefined) internalValue.value = value
    emit('update:modelValue', value)
    emit('tab-change', value)
    return true
  } finally {
    switching.value = false
  }
}

async function handleTabClick(pane: RegisteredTabPane, event: MouseEvent | KeyboardEvent) {
  if (pane.disabled) return
  emit('tab-click', createPublicPane(pane), event)
  await setActiveValue(pane.name)
}

async function activatePaneByIndex(index: number, event: KeyboardEvent) {
  const enabledPanes = orderedPanes.value.filter((pane) => !pane.disabled)
  if (!enabledPanes.length) return

  event.preventDefault()
  const normalizedIndex = (index + enabledPanes.length) % enabledPanes.length
  const targetPane = enabledPanes[normalizedIndex]
  const switched = await setActiveValue(targetPane.name)
  if (!switched) return
  await nextTick()
  const targetElement = tabButtonRefs.get(targetPane.name)
  if (targetElement instanceof HTMLElement) targetElement.focus()
}

function handleTabKeydown(pane: RegisteredTabPane, event: KeyboardEvent) {
  if (pane.disabled) return
  const enabledPanes = orderedPanes.value.filter((item) => !item.disabled)
  const currentIndex = enabledPanes.findIndex((item) => item.uid === pane.uid)

  if ((isVertical.value && event.key === 'ArrowDown') || (!isVertical.value && event.key === 'ArrowRight')) {
    void activatePaneByIndex(currentIndex + 1, event)
    return
  }

  if ((isVertical.value && event.key === 'ArrowUp') || (!isVertical.value && event.key === 'ArrowLeft')) {
    void activatePaneByIndex(currentIndex - 1, event)
    return
  }

  if (event.key === 'Home') {
    void activatePaneByIndex(0, event)
    return
  }

  if (event.key === 'End') {
    void activatePaneByIndex(enabledPanes.length - 1, event)
    return
  }

  if ((event.key === 'Delete' || event.key === 'Backspace') && isPaneClosable(pane)) {
    event.preventDefault()
    handleTabRemove(pane)
  }
}

function handleTabAdd() {
  emit('tab-add')
  emit('edit', undefined, 'add')
}

function handleTabRemove(pane: RegisteredTabPane) {
  emit('tab-remove', pane.name)
  emit('edit', pane.name, 'remove')
}

defineExpose({
  panes: orderedPanes,
  activeValue,
  setActiveValue
})
</script>

<template>
  <div data-ui-tabs="true" :class="rootClass">
    <div :class="headerClass">
      <div :class="clsx(navClass, canAdd && 'pr-0')" role="tablist" :aria-label="ariaLabel" :aria-orientation="isVertical ? 'vertical' : 'horizontal'">
        <div
          v-for="(pane, index) in orderedPanes"
          :id="getTabId(pane.name)"
          :key="pane.uid"
          :ref="(element) => setTabButtonRef(pane.name, element)"
          role="tab"
          :aria-selected="isPaneActive(pane)"
          :aria-disabled="pane.disabled"
          :aria-controls="getPanelId(pane.name)"
          :tabindex="isPaneActive(pane) && !pane.disabled ? 0 : -1"
          :class="triggerClass(pane, index)"
          @click="handleTabClick(pane, $event)"
          @keydown="handleTabKeydown(pane, $event)"
        >
          <span class="inline-flex min-w-0 items-center justify-center truncate">
            <PaneLabel :pane="pane" />
          </span>
          <button
            v-if="isPaneClosable(pane)"
            type="button"
            tabindex="-1"
            :aria-label="`${closeAriaLabel} ${pane.label ?? pane.name}`"
            class="-mr-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full text-current opacity-60 transition-opacity hover:(bg-current/10 opacity-100)"
            @click.stop="handleTabRemove(pane)"
            @keydown.stop
          >
            <span class="i-lucide:x size-3.5"></span>
          </button>
        </div>
        <button v-if="canAdd" type="button" :aria-label="addAriaLabel" :class="tabAddButton({ tabPosition, size })" @click="handleTabAdd">
          <span class="i-lucide:plus"></span>
        </button>
      </div>
    </div>

    <div :class="contentClass">
      <slot></slot>
    </div>
  </div>
</template>
