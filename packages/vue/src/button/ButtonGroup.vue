<template>
  <div class="inline-flex items-center isolate">
    <slot />
  </div>
</template>

<style scoped>
:deep(button),
:deep(.button) {
  border-radius: 0 !important;
}

/* 按钮组内部取消中间圆角，仅首尾按钮保留外侧圆角。 */
:deep(> *:first-child),
:deep(> *:first-child button) {
  border-top-left-radius: 0.375rem !important;
  border-bottom-left-radius: 0.375rem !important;
}

:deep(> *:last-child),
:deep(> *:last-child button) {
  border-top-right-radius: 0.375rem !important;
  border-bottom-right-radius: 0.375rem !important;
}

/* 相邻按钮边框重叠，避免按钮组中间出现双边框。 */
:deep(> *:not(:first-child)) {
  margin-left: -1px;
}

/* 按钮组内的 default 表示已选中，hover 时保持选中态本色。 */
:deep([data-ui-button='true'][data-variant='default'][data-color='brand']:hover) {
  --at-apply: '!border-brand-500 !bg-brand-500';
}

:deep([data-ui-button='true'][data-variant='default'][data-color='red']:hover) {
  --at-apply: '!border-red-500 !bg-red-500';
}

:deep([data-ui-button='true'][data-variant='default'][data-color='gray']:hover) {
  --at-apply: '!border-gray-500 !bg-gray-500';
}

:deep([data-ui-button='true'][data-variant='default'][data-color='green']:hover) {
  --at-apply: '!border-green-500 !bg-green-500';
}

:deep([data-ui-button='true'][data-variant='default'][data-color='yellow']:hover) {
  --at-apply: '!border-amber-500 !bg-amber-500';
}

:deep([data-ui-button='true'][data-variant='default'][data-color='orange']:hover) {
  --at-apply: '!border-orange-500 !bg-orange-500';
}
</style>
