# Data Display

Use this file for `Table`, `Pagination`, `Skeleton`, `Badge`, `BadgeRibbon`, `QRCode`, and `MillerColumns`.

## Contents

- Table
- Pagination
- Skeleton
- Badge
- BadgeRibbon
- QRCode
- MillerColumns

## Table

```vue
<script setup lang="ts">
import { Table, type TableColumn } from '@unoui/vue/table'

interface Row {
  id: number
  name: string
  status: string
}
const rows: Row[] = [{ id: 1, name: 'Main', status: 'active' }]
const columns: TableColumn<Row>[] = [
  { key: 'name', title: 'Name', sortable: true },
  { key: 'status', title: 'Status', filters: [{ text: 'Active', value: 'active' }] }
]
</script>

<template>
  <Table :rows="rows" :columns="columns" row-key="id" stripe>
    <template #cell-status="{ value }">{{ value }}</template>
  </Table>
</template>
```

Props:

- `rows`: required `T[]`
- `columns`: required `TableColumn<T>[]`
- `rowKey`: required string key or function
- `sort`, `defaultSort`
- `filters`, `defaultFilters`
- `maxHeight`, `minWidth`
- `stickyHeader`, `allowClearSort`, `stripe`
- `radius`: `none | sm | md | lg`
- `size`: `md | lg`
- `showHorizontalLines`, `showVerticalLines`, `bordered`
- `autoHideScrollbar`
- `emptyText`, `filterResetText`, `filterEmptyText`

Column config:

- `key`, `title`, `dataIndex`
- `width`, `minWidth`, `maxWidth`
- `align`: `left | center | right`
- `fixed`: `left | right`
- `sortable`: boolean or compare function
- `defaultSortDirection`
- `filters`, `filterMultiple`, `filterFn`
- `formatter`
- `class`, `headerClass`, `wrap`

Events:

- `update:sort(TableSortState | null)`
- `sort-change(TableSortState | null)`
- `update:filters(TableFiltersState)`
- `filter-change(TableFiltersState)`
- `row-click(row, index)`

Slots:

- `header-{key}="{ column }"`
- `cell-{key}="{ row, column, value, index }"`
- `cell="{ row, column, value, index }"`
- `empty`

Expose:

- None

## Pagination

```vue
<Pagination :total="total" v-model:current-page="page" v-model:page-size="pageSize" @change="load" />
```

Props:

- `total`
- `pageSize`, `defaultPageSize`
- `currentPage`, `defaultCurrentPage`
- `pageSizes`
- `pagerCount`: odd number, at least 5
- `layout`, default `prev, pager, next, jumper, ->, total, sizes`
- `size`: `sm | md | lg`
- `disabled`, `hideOnSinglePage`, `background`
- `totalText`, `pageSizeSuffix`, `jumperText`, `prevText`, `nextText`

Events:

- `update:currentPage(number)`
- `update:pageSize(number)`
- `current-change(number)`
- `size-change(number)`
- `change(currentPage, pageSize)`

Slots:

- None

Expose:

- None

## Skeleton

```vue
<Skeleton variant="table" :rows="6" :columns="5" />
<Skeleton variant="columns" show-info-panel />
```

Props:

- `variant`: `line | list | grid | table | columns`
- `rows`, `columns`, `infoRows`
- `width`, `height`, `minHeight`
- `itemHeight`
- `columnWidth`, `infoPanelWidth`
- `showInfoPanel`
- `padded`

Events:

- None

Slots:

- None

Expose:

- None

## Badge

```vue
<Badge :count="12"><Button>Notifications</Button></Badge>
<Badge status="processing" text="Syncing" />
```

Props:

- `count`, `dot`, `overflowCount`, `showZero`
- `status`: `success | processing | default | error | warning`
- `text`, `color`, `size`, `offset`, `title`
- semantic `classNames`, `styles`

Events:

- None

Slots:

- `default`, `count`, `text`

Expose:

- None

## BadgeRibbon

```vue
<BadgeRibbon text="New"><div>Card</div></BadgeRibbon>
```

Props:

- `text`
- `color`: built-in color or CSS color
- `placement`: `start | end`
- semantic `classNames`, `styles`

Events:

- None

Slots:

- `default`, `text`

Expose:

- None

## QRCode

```vue
<QRCode value="https://example.com" status="expired" @refresh="refresh" />
```

Props:

- `value`
- `type`: `canvas | svg`
- `size`, `color`, `bgColor`
- `icon`, `iconSize`
- `status`: `active | expired | loading | scanned`
- `bordered`
- `errorLevel`: `L | M | Q | H`
- `marginSize`, `boostLevel`
- `title`
- `expiredText`, `refreshText`, `scannedText`, `loadingText`
- `statusRender`
- semantic `classNames`, `styles`

Events:

- `refresh(event?)`

Slots:

- `status="{ status, locale, onRefresh }"`

Expose:

- `toDataURL(type?, quality?)`

## MillerColumns

```vue
<MillerColumns v-model="selectedIds" :data-source="resourceMap" id-key="id" parent-id-key="pid" order-key="order" sortable />
```

Props:

- `modelValue`: selected path ids, required
- `dataSource`: `Map<string | number, T> | T[]`, required
- `idKey`, `parentIdKey`, `orderKey`
- `width`, `height`, `minHeight`
- `columnWidth`, `colWidth`
- `showInfoPanel`, `infoPanelWidth`
- `sortable`
- `emptyText`, `noDataText`
- `radius`, `bordered`, `autoHideScrollbar`
- `ariaLabel`

Events:

- `update:modelValue(ids)`
- `select(MillerColumnsSelectEvent<T>)`
- `reorder(ids)`

Slots:

- `col-title="{ colIndex, itemCount, parentId }"`
- `item-left="{ item, active, colIndex }"`
- `item-right="{ item, active, colIndex }"`
- `info-panel="{ item }"`

Expose:

- None
