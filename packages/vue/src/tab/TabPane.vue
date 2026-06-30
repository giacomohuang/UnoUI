<script setup lang="ts">
import { computed, getCurrentInstance, inject, onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue'

import { tabPanel, tabsContextKey, type RegisteredTabPane, type TabValue } from '.'

let tabPaneOrderSeed = 0

const props = withDefaults(
  defineProps<{
    /** name 是标签页唯一值；未传入时使用声明顺序。 */
    name?: TabValue
    /** label 是标签栏展示文案；复杂内容可使用 #label 插槽。 */
    label?: string
    /** disabled 表示标签页不可切换。 */
    disabled?: boolean
    /** closable 表示当前标签页单独显示关闭入口。 */
    closable?: boolean
    /** lazy 表示内容首次激活后才渲染。 */
    lazy?: boolean
  }>(),
  {
    name: undefined,
    label: undefined,
    disabled: false,
    closable: false,
    lazy: false
  }
)

const instance = getCurrentInstance()
const tabs = inject(tabsContextKey)
const slots = useSlots()
const order = tabPaneOrderSeed++
const loaded = ref(false)
const paneName = computed(() => props.name ?? order)
const isActive = computed(() => tabs?.activeValue.value === paneName.value)
const shouldRender = computed(() => !props.lazy || loaded.value || isActive.value)
const panelClass = computed(() => tabPanel({ active: isActive.value }))

// TabPane 的元信息注册到父级 Tabs，由父级统一生成标签栏。
const createPaneRecord = (): RegisteredTabPane => ({
  uid: instance?.uid ?? order,
  order,
  name: paneName.value,
  label: props.label,
  disabled: props.disabled,
  closable: props.closable,
  lazy: props.lazy,
  slots
})

watch(isActive, (active) => {
  if (active) loaded.value = true
})

watch(
  () => [paneName.value, props.label, props.disabled, props.closable, props.lazy] as const,
  () => {
    if (!tabs || !instance) return
    tabs.updatePane(instance.uid, createPaneRecord())
  }
)

onMounted(() => {
  if (!tabs || !instance) return
  if (isActive.value) loaded.value = true
  tabs.registerPane(createPaneRecord())
})

onBeforeUnmount(() => {
  if (!tabs || !instance) return
  tabs.unregisterPane(instance.uid)
})
</script>

<template>
  <div v-if="shouldRender" v-show="isActive" :id="tabs?.getPanelId(paneName)" role="tabpanel" :aria-labelledby="tabs?.getTabId(paneName)" :class="panelClass" tabindex="0">
    <slot></slot>
  </div>
</template>
