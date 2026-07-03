<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { Button } from '../button'
import { Input } from '../input'
import { Select, type SelectOption, type SelectValue } from '../select'

import type { PaginationLayoutToken, PaginationProps } from '.'

const props = withDefaults(
  defineProps<{
    /** total 是数据总数。 */
    total?: number
    /** pageSize 是受控每页条数。 */
    pageSize?: number
    /** defaultPageSize 是非受控每页条数初始值。 */
    defaultPageSize?: number
    /** currentPage 是受控当前页码。 */
    currentPage?: number
    /** defaultCurrentPage 是非受控当前页码初始值。 */
    defaultCurrentPage?: number
    /** pageSizes 是每页条数选项。 */
    pageSizes?: number[]
    /** pagerCount 是连续页码按钮数量，应为大于等于 5 的奇数。 */
    pagerCount?: number
    /** layout 控制子组件顺序，兼容 Element Plus 常用 layout 写法。 */
    layout?: string
    /** size 控制分页器尺寸。 */
    size?: PaginationProps['size']
    /** disabled 表示禁用所有分页交互。 */
    disabled?: boolean
    /** hideOnSinglePage 表示仅一页时隐藏分页器。 */
    hideOnSinglePage?: boolean
    /** background 表示页码按钮使用更明显的背景。 */
    background?: boolean
    /** totalText 是总数文案前缀。 */
    totalText?: string
    /** pageSizeSuffix 是每页条数文案后缀。 */
    pageSizeSuffix?: string
    /** jumperText 是跳转输入前缀。 */
    jumperText?: string
    /** prevText 是上一页文字，空值时展示图标。 */
    prevText?: string
    /** nextText 是下一页文字，空值时展示图标。 */
    nextText?: string
  }>(),
  {
    total: 0,
    pageSize: undefined,
    defaultPageSize: 10,
    currentPage: undefined,
    defaultCurrentPage: 1,
    pageSizes: () => [10, 20, 50, 100],
    pagerCount: 7,
    layout: 'prev, pager, next, jumper, ->, total, sizes',
    size: 'md',
    disabled: false,
    hideOnSinglePage: false,
    background: false,
    totalText: '共',
    pageSizeSuffix: '条/页',
    jumperText: '前往',
    prevText: '',
    nextText: ''
  }
)

const emit = defineEmits<{
  (e: 'update:currentPage', value: number): void
  (e: 'update:pageSize', value: number): void
  (e: 'current-change', value: number): void
  (e: 'size-change', value: number): void
  (e: 'change', currentPage: number, pageSize: number): void
}>()

const internalPageSize = ref(props.defaultPageSize)
const internalCurrentPage = ref(props.defaultCurrentPage)
const jumperValue = ref(String(props.currentPage ?? props.defaultCurrentPage))

const activePageSize = computed(() => props.pageSize ?? internalPageSize.value)
const pageCount = computed(() => Math.max(1, Math.ceil(props.total / Math.max(1, activePageSize.value))))
const activeCurrentPage = computed(() => clampPage(props.currentPage ?? internalCurrentPage.value))
const shouldRender = computed(() => !(props.hideOnSinglePage && pageCount.value <= 1))
const layoutTokens = computed(() => props.layout.split(',').map((item) => item.trim()).filter(Boolean) as PaginationLayoutToken[])
const pageSizeOptions = computed<SelectOption[]>(() => props.pageSizes.map((size) => ({ label: `${size} ${props.pageSizeSuffix}`, value: size })))
const controlHeightClass = computed(() => paginationControlHeightClasses[props.size ?? 'md'])
const pagerMinWidthClass = computed(() => paginationPagerMinWidthClasses[props.size ?? 'md'])
const iconButtonClass = computed(() => ['px-0!', controlHeightClass.value, pagerMinWidthClass.value])
const textButtonClass = computed(() => [controlHeightClass.value])

const normalizedPagerCount = computed(() => {
  const count = Math.max(5, props.pagerCount)
  return count % 2 === 0 ? count + 1 : count
})

const pagers = computed(() => {
  const count = pageCount.value
  const current = activeCurrentPage.value
  const pagerCount = normalizedPagerCount.value

  if (count <= pagerCount) {
    return Array.from({ length: count }, (_, index) => index + 1)
  }

  const sideCount = (pagerCount - 3) / 2
  const showPrevMore = current > sideCount + 2
  const showNextMore = current < count - sideCount - 1

  if (!showPrevMore && showNextMore) {
    return [...Array.from({ length: pagerCount - 2 }, (_, index) => index + 1), 'more-next', count]
  }

  if (showPrevMore && !showNextMore) {
    return [1, 'more-prev', ...Array.from({ length: pagerCount - 2 }, (_, index) => count - (pagerCount - 3) + index)]
  }

  return [1, 'more-prev', ...Array.from({ length: sideCount * 2 + 1 }, (_, index) => current - sideCount + index), 'more-next', count]
})

watch(activeCurrentPage, (value) => {
  jumperValue.value = String(value)
})

watch(pageCount, () => {
  const page = clampPage(activeCurrentPage.value)
  if (page !== activeCurrentPage.value) setCurrentPage(page)
})

function clampPage(page: number) {
  if (!Number.isFinite(page)) return 1
  return Math.min(Math.max(1, Math.trunc(page)), pageCount.value)
}

function clampPageBySize(page: number, pageSize: number) {
  const count = Math.max(1, Math.ceil(props.total / Math.max(1, pageSize)))
  if (!Number.isFinite(page)) return 1
  return Math.min(Math.max(1, Math.trunc(page)), count)
}

function setCurrentPage(page: number) {
  if (props.disabled) return
  const nextPage = clampPage(page)
  if (props.currentPage === undefined) internalCurrentPage.value = nextPage
  emit('update:currentPage', nextPage)
  emit('current-change', nextPage)
  emit('change', nextPage, activePageSize.value)
}

function syncCurrentPageForSize(nextPage: number) {
  if (nextPage === activeCurrentPage.value) return
  if (props.currentPage === undefined) internalCurrentPage.value = nextPage
  emit('update:currentPage', nextPage)
  emit('current-change', nextPage)
}

function setPageSize(value: SelectValue) {
  if (props.disabled) return
  const nextSize = Number(value)
  if (!Number.isFinite(nextSize) || nextSize <= 0) return
  if (props.pageSize === undefined) internalPageSize.value = nextSize
  emit('update:pageSize', nextSize)
  emit('size-change', nextSize)
  const nextPage = clampPageBySize(activeCurrentPage.value, nextSize)
  syncCurrentPageForSize(nextPage)
  emit('change', nextPage, nextSize)
}

function handlePageSizeChange(value: SelectValue | SelectValue[] | undefined) {
  if (Array.isArray(value) || value === undefined) return
  setPageSize(value)
}

function commitJumper() {
  const nextPage = Number(jumperValue.value)
  if (!Number.isFinite(nextPage)) {
    jumperValue.value = String(activeCurrentPage.value)
    return
  }
  setCurrentPage(nextPage)
}

const paginationControlHeightClasses = {
  sm: 'h-[calc(1.75rem+2px)]',
  md: 'h-[calc(2rem+2px)]',
  lg: 'h-[calc(2.25rem+2px)]'
} as const

const paginationPagerMinWidthClasses = {
  sm: 'min-w-[calc(1.75rem+2px)]',
  md: 'min-w-[calc(2rem+2px)]',
  lg: 'min-w-[calc(2.25rem+2px)]'
} as const
</script>

<template>
  <nav v-if="shouldRender" class="flex min-w-0 flex-wrap items-center gap-2 text-sm text-secondary" :class="{ 'opacity-70': disabled }" data-ui-pagination="true">
    <template v-for="(token, index) in layoutTokens" :key="`${token}-${index}`">
      <span v-if="token === '->'" class="min-w-2 flex-1"></span>

      <span v-else-if="token === 'total'" class="whitespace-nowrap text-tertiary">{{ totalText }} {{ total }} 条</span>

      <Select
        v-else-if="token === 'sizes'"
        width="7rem"
        :model-value="activePageSize"
        :options="pageSizeOptions"
        :size="size"
        :disabled="disabled"
        @update:model-value="handlePageSizeChange"
      />

      <Button
        v-else-if="token === 'prev'"
        color="gray"
        variant="mono"
        :size="prevText ? size : 'icon'"
        :icon="prevText ? undefined : 'i-lucide:chevron-left'"
        :class="prevText ? textButtonClass : iconButtonClass"
        :disabled="disabled || activeCurrentPage <= 1"
        @click="setCurrentPage(activeCurrentPage - 1)"
      >
        {{ prevText }}
      </Button>

      <div v-else-if="token === 'pager'" class="flex items-center gap-1">
        <Button
          v-for="pager in pagers"
          :key="String(pager)"
          :color="pager === activeCurrentPage ? 'brand' : 'gray'"
          :variant="pager === activeCurrentPage ? 'default' : 'mono'"
          :size="typeof pager === 'number' ? size : 'icon'"
          :icon="typeof pager === 'number' ? undefined : 'i-lucide:ellipsis'"
          :icon-size="typeof pager === 'number' ? '14' : '16'"
          :class="[controlHeightClass, pagerMinWidthClass, typeof pager !== 'number' ? 'px-0!' : 'px-2!']"
          :disabled="disabled || typeof pager !== 'number'"
          @click="typeof pager === 'number' && setCurrentPage(pager)"
        >
          <template v-if="typeof pager === 'number'">{{ pager }}</template>
        </Button>
      </div>

      <Button
        v-else-if="token === 'next'"
        color="gray"
        variant="mono"
        :size="nextText ? size : 'icon'"
        :icon="nextText ? undefined : 'i-lucide:chevron-right'"
        :class="nextText ? textButtonClass : iconButtonClass"
        :disabled="disabled || activeCurrentPage >= pageCount"
        @click="setCurrentPage(activeCurrentPage + 1)"
      >
        {{ nextText }}
      </Button>

      <span v-else-if="token === 'jumper'" class="inline-flex items-center gap-2 whitespace-nowrap text-tertiary">
        {{ jumperText }}
        <Input
          v-model="jumperValue"
          class="w-16"
          type="number"
          :size="size"
          :min="1"
          :max="pageCount"
          :disabled="disabled"
          @change="commitJumper"
          @keydown.enter="commitJumper"
        />
        页
      </span>
    </template>
  </nav>
</template>
