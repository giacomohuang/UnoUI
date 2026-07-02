<script setup lang="ts">
import { computed, inject, nextTick, onBeforeUnmount, provide, ref, watch, type CSSProperties } from 'vue'

import { drawerContextKey, drawerPanel, type DrawerDirection, type DrawerPush, type DrawerPushDistance } from '.'

type DrawerBeforeClose = (done: () => void) => void | boolean | Promise<void | boolean>

const DEFAULT_PUSH_DISTANCE = 180

const props = withDefaults(
  defineProps<{
    /** modelValue 控制抽屉显示状态，兼容 Element Plus v-model。 */
    modelValue?: boolean
    /** visible 控制抽屉显示状态，兼容本地 Modal 的 v-model:visible。 */
    visible?: boolean
    /** title 是默认标题文本。 */
    title?: string
    /** direction 是抽屉弹出方向，可选 rtl/ltr/ttb/btt。 */
    direction?: DrawerDirection
    /** size 是抽屉宽度或高度，数字按 px 处理。 */
    size?: number | string
    /** withHeader 表示是否渲染头部区域。 */
    withHeader?: boolean
    /** showClose 表示是否展示关闭按钮。 */
    showClose?: boolean
    /** closeOnClickModal 表示是否允许点击遮罩关闭。 */
    closeOnClickModal?: boolean
    /** closeOnPressEscape 表示是否允许 Esc 关闭。 */
    closeOnPressEscape?: boolean
    /** beforeClose 在关闭前执行，返回 false 或不调用 done 可阻止关闭。 */
    beforeClose?: DrawerBeforeClose
    /** destroyOnClose 表示关闭后是否销毁默认插槽内容。 */
    destroyOnClose?: boolean
    /** modal 表示是否展示遮罩。 */
    modal?: boolean
    /** lockScroll 表示打开时是否锁定 body 滚动。 */
    lockScroll?: boolean
    /** zIndex 控制抽屉层级。 */
    zIndex?: number | string
    /** bodyClass 是正文区域额外类名。 */
    bodyClass?: string
    /** push 控制多层 Drawer 打开时父级抽屉是否被推动。 */
    push?: DrawerPush
  }>(),
  {
    modelValue: undefined,
    visible: undefined,
    title: '',
    direction: 'rtl',
    size: '30%',
    withHeader: true,
    showClose: true,
    closeOnClickModal: true,
    closeOnPressEscape: true,
    beforeClose: undefined,
    destroyOnClose: false,
    modal: true,
    lockScroll: true,
    zIndex: 2000,
    bodyClass: '',
    push: true
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'update:visible', value: boolean): void
  (e: 'open'): void
  (e: 'opened'): void
  (e: 'close'): void
  (e: 'closed'): void
}>()

const isVisible = computed(() => props.modelValue ?? props.visible ?? false)
const shouldRender = ref(isVisible.value)
const drawerId = Symbol('ui-drawer')
const parentDrawer = inject(drawerContextKey, null)
const pushedChildIds = ref<symbol[]>([])
const isHorizontal = computed(() => props.direction === 'rtl' || props.direction === 'ltr')
const normalizedSize = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
const pushDistance = computed<DrawerPushDistance>(() => {
  if (props.push === false) return 0
  if (typeof props.push === 'object' && props.push.distance !== undefined) return props.push.distance
  if (parentDrawer) return parentDrawer.pushDistance.value
  return DEFAULT_PUSH_DISTANCE
})
const normalizedPushDistance = computed(() => normalizeCssSize(pushDistance.value))
const pushTransform = computed(() => {
  if (!pushedChildIds.value.length) return undefined

  const distance = normalizedPushDistance.value
  if (distance === '0px') return undefined

  switch (props.direction) {
    case 'rtl':
      return `translateX(-${distance})`
    case 'ltr':
      return `translateX(${distance})`
    case 'ttb':
      return `translateY(${distance})`
    case 'btt':
      return `translateY(-${distance})`
    default:
      return undefined
  }
})
const panelStyle = computed<CSSProperties>(() => ({
  width: isHorizontal.value ? normalizedSize.value : undefined,
  height: isHorizontal.value ? undefined : normalizedSize.value,
  transform: pushTransform.value
}))
const transitionName = computed(() => `ui-drawer-${props.direction}`)
let previousBodyOverflow = ''
let hasOpened = false
let hasPushedParent = false

function normalizeCssSize(value: DrawerPushDistance) {
  return typeof value === 'number' ? `${value}px` : value
}

function syncVisible(value: boolean) {
  emit('update:modelValue', value)
  emit('update:visible', value)
}

function closeNow() {
  syncVisible(false)
  emit('close')
}

async function requestClose() {
  if (!props.beforeClose) {
    closeNow()
    return
  }

  let doneCalled = false
  const done = () => {
    doneCalled = true
    closeNow()
  }

  const result = await props.beforeClose(done)
  if (result === false || doneCalled) return
  if (props.beforeClose.length === 0 || result !== undefined) closeNow()
}

function handleKeydown(event: KeyboardEvent) {
  if (!isVisible.value || !props.closeOnPressEscape || event.key !== 'Escape') return
  event.preventDefault()
  event.stopPropagation()
  void requestClose()
}

function lockBodyScroll() {
  if (!props.lockScroll || typeof document === 'undefined') return
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
}

function unlockBodyScroll() {
  if (!props.lockScroll || typeof document === 'undefined') return
  document.body.style.overflow = previousBodyOverflow
}

function pushChild(id: symbol) {
  if (props.push === false || pushedChildIds.value.includes(id)) return
  pushedChildIds.value = [...pushedChildIds.value, id]
}

function pullChild(id: symbol) {
  if (!pushedChildIds.value.includes(id)) return
  pushedChildIds.value = pushedChildIds.value.filter((childId) => childId !== id)
}

function pushParent() {
  if (!parentDrawer || hasPushedParent) return
  parentDrawer.push(drawerId)
  hasPushedParent = true
}

function pullParent() {
  if (!parentDrawer || !hasPushedParent) return
  parentDrawer.pull(drawerId)
  hasPushedParent = false
}

provide(drawerContextKey, {
  pushDistance,
  push: pushChild,
  pull: pullChild
})

watch(
  isVisible,
  (visible) => {
    if (visible) {
      shouldRender.value = true
      hasOpened = true
      pushParent()
      lockBodyScroll()
      emit('open')
      window.addEventListener('keydown', handleKeydown, { capture: true })
      nextTick(() => emit('opened'))
    } else {
      pullParent()
      pushedChildIds.value = []
      unlockBodyScroll()
      window.removeEventListener('keydown', handleKeydown, { capture: true })
      if (hasOpened) emit('closed')
      if (props.destroyOnClose) {
        window.setTimeout(() => {
          if (!isVisible.value) shouldRender.value = false
        }, 180)
      }
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  pullParent()
  unlockBodyScroll()
  window.removeEventListener('keydown', handleKeydown, { capture: true })
})
</script>

<template>
  <Teleport to="body">
    <Transition name="ui-drawer-fade">
      <div
        v-if="shouldRender"
        v-show="isVisible"
        class="fixed inset-0 pointer-events-auto"
        :style="{ zIndex }"
        @mousemove.stop
        @mousedown.stop
        @mouseup.stop
        @pointermove.stop
        @pointerdown.stop
        @pointerup.stop
        @wheel.stop
        @click.stop
        @dblclick.stop
        @contextmenu.stop
      >
        <div v-if="modal" class="absolute inset-0 bg-zinc-900/10 backdrop-blur-sm" @click="closeOnClickModal && requestClose()"></div>

        <Transition :name="transitionName" appear>
          <aside v-show="isVisible" :class="['ui-drawer-panel', drawerPanel({ direction })]" :style="panelStyle" data-ui-drawer="true">
            <header v-if="withHeader" class="flex min-h-12 items-center justify-between gap-3 border-b border-zinc-100/50 px-4 py-3 dark:border-zinc-800/50">
              <slot name="header">
                <h3 class="min-w-0 truncate text-xs font-bold uppercase tracking-widest text-zinc-500">
                  <slot name="icon"></slot>
                  {{ title }}
                </h3>
              </slot>
              <button v-if="showClose" type="button" aria-label="关闭" class="group flex size-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-brand-200 dark:hover:bg-brand-500" @click="requestClose">
                <span class="i-lucide:x size-4 text-zinc-400 group-hover:text-brand-600 dark:group-hover:text-brand-200"></span>
              </button>
            </header>

            <div class="min-h-0 flex-1 overflow-auto" :class="bodyClass">
              <slot v-if="!destroyOnClose || isVisible"></slot>
            </div>

            <footer v-if="$slots.footer" class="flex justify-end gap-2 border-t border-zinc-100/50 bg-zinc-50/30 px-3 py-2.5 dark:border-zinc-800/50 dark:bg-zinc-800/30">
              <slot name="footer"></slot>
            </footer>
          </aside>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.ui-drawer-fade-enter-active,
.ui-drawer-fade-leave-active {
  transition: opacity 160ms ease;
}

.ui-drawer-fade-enter-from,
.ui-drawer-fade-leave-to {
  opacity: 0;
}

.ui-drawer-panel {
  transition: transform 180ms ease;
}

.ui-drawer-rtl-enter-active,
.ui-drawer-rtl-leave-active,
.ui-drawer-ltr-enter-active,
.ui-drawer-ltr-leave-active,
.ui-drawer-ttb-enter-active,
.ui-drawer-ttb-leave-active,
.ui-drawer-btt-enter-active,
.ui-drawer-btt-leave-active {
  transition: transform 180ms ease;
}

.ui-drawer-rtl-enter-from,
.ui-drawer-rtl-leave-to {
  transform: translateX(100%);
}

.ui-drawer-ltr-enter-from,
.ui-drawer-ltr-leave-to {
  transform: translateX(-100%);
}

.ui-drawer-ttb-enter-from,
.ui-drawer-ttb-leave-to {
  transform: translateY(-100%);
}

.ui-drawer-btt-enter-from,
.ui-drawer-btt-leave-to {
  transform: translateY(100%);
}
</style>
