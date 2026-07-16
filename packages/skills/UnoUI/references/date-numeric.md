# Date And Numeric Inputs

Use this file for `DatePicker`, `RangePicker`, `TimePicker`, `TimeRangePicker`, `Slider`, and `ColorPicker`.

## Contents

- DatePicker
- RangePicker
- TimePicker
- TimeRangePicker
- Slider
- ColorPicker

## DatePicker

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker } from '@unoui/vue/datepicker'

const date = ref('2026-06-24')
const datetime = ref('2026-06-24 10:30:00')
</script>

<template>
  <DatePicker v-model="date" clearable />
  <DatePicker v-model="date" picker="month" />
  <DatePicker v-model="datetime" show-time value-format="YYYY-MM-DD HH:mm:ss" />
</template>
```

Props:

- `modelValue`: `string | number | Date | Dayjs | null`
- `picker`: `date | month | year`
- `format`, `valueFormat`
- `placeholder`
- `size`: `sm | md | lg`
- `disabled`, `clearable`
- `showTime`: boolean or time options
- `disabledDate(date: Dayjs)`
- `minDate`, `maxDate`
- `suffixIcon`, `clearIcon`
- `teleportedWidth`, `name`

Events:

- `update:modelValue(value)`
- `change(value, dateString)`
- `clear()`
- `ok(value, dateString)`
- `visible-change(boolean)`
- `panel-change(Dayjs)`
- `focus(FocusEvent)`, `blur(FocusEvent)`

Expose:

- `focus()`, `blur()`, `clear(event?)`

Slots:

- None

## RangePicker

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { RangePicker } from '@unoui/vue/datepicker'

const range = ref(['2026-06-01', '2026-06-24'])
const datetimeRange = ref(['2026-06-01 08:30:00', '2026-06-24 18:00:00'])
</script>

<template>
  <RangePicker v-model="range" clearable />
  <RangePicker v-model="datetimeRange" show-time value-format="YYYY-MM-DD HH:mm:ss" />
  <RangePicker v-model="range" picker="month" />
</template>
```

Props:

- `modelValue`: `[DatePickerModelValue, DatePickerModelValue] | null`
- `picker`: `date | month | year`
- `format`, `valueFormat`
- `placeholder`: `[string, string]`
- `separatorIcon`
- `size`, `disabled`, `clearable`
- `showTime`: boolean or time options; date ranges are confirmed before submission
- `disabledDate`, `minDate`, `maxDate`
- `suffixIcon`, `clearIcon`
- `teleportedWidth`, `name`

Events:

- `update:modelValue(value)`
- `change(value, [startString, endString])`
- `clear()`
- `ok(value, [startString, endString])`
- `calendar-change(value, [startString, endString])`
- `visible-change(boolean)`
- `panel-change([Dayjs, Dayjs])`
- `focus(FocusEvent)`, `blur(FocusEvent)`

Expose:

- `focus()`, `blur()`, `clear()`

Slots:

- None

## TimePicker

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { TimePicker, TimeRangePicker } from '@unoui/vue/timepicker'

const time = ref('10:30:00')
const minute = ref('09:15')
const range = ref(['09:00:00', '18:00:00'])
const overnight = ref(['22:30:00', '02:15:00'])
</script>

<template>
  <TimePicker v-model="time" clearable />
  <TimePicker v-model="minute" format="HH:mm" value-format="HH:mm" :minute-step="15" />
  <TimePicker v-model="time" use12-hours need-confirm />
  <TimeRangePicker v-model="range" clearable />
  <TimeRangePicker v-model="overnight" />
</template>
```

Props:

- `modelValue`: `string | number | Date | Dayjs | null`
- `format`, `valueFormat`
- `placeholder`
- `size`: `sm | md | lg`
- `disabled`, `clearable`
- `hourStep`, `minuteStep`, `secondStep`
- `use12Hours`, `showSecond`
- `disabledTime(time: Dayjs)`, `hideDisabledOptions`
- `needConfirm`, `showNow`
- `suffixIcon`, `clearIcon`
- `teleportedWidth`, `name`

Events:

- `update:modelValue(value)`
- `change(value, timeString)`
- `clear()`
- `ok(value, timeString)`
- `visible-change(boolean)`
- `focus(FocusEvent)`, `blur(FocusEvent)`

Expose:

- `focus()`, `blur()`, `clear(event?)`

Slots:

- None

## TimeRangePicker

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { TimeRangePicker } from '@unoui/vue/timepicker'

const range = ref(['09:00:00', '18:00:00'])
const overnight = ref(['22:30:00', '02:15:00'])
</script>

<template>
  <TimeRangePicker v-model="range" clearable />
  <TimeRangePicker v-model="overnight" />
  <TimeRangePicker v-model="range" format="HH:mm" value-format="HH:mm" :minute-step="15" />
</template>
```

Props:

- `modelValue`: `[TimePickerModelValue, TimePickerModelValue] | null`
- `format`, `valueFormat`
- `placeholder`: `[string, string]`
- `separatorIcon`
- `size`, `disabled`, `clearable`
- `hourStep`, `minuteStep`, `secondStep`
- `use12Hours`, `showSecond`
- `disabledTime(time: Dayjs, side: 'start' | 'end')`, `hideDisabledOptions`
- `suffixIcon`, `clearIcon`
- `teleportedWidth`, `name`

Events:

- `update:modelValue(value)`
- `change(value, [startString, endString], info)`
- `clear()`
- `ok(value, [startString, endString], info)`
- `calendar-change(value, [startString, endString], info)`
- `visible-change(boolean)`
- `focus(FocusEvent)`, `blur(FocusEvent)`

Expose:

- `focus()`, `blur()`, `clear(event?)`

Slots:

- None

## Slider

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Slider } from '@unoui/vue/slider'

const value = ref(36)
const range = ref([20, 60])
const marks = { 0: '0', 50: '50', 100: '100' }
</script>

<template>
  <Slider v-model="value" />
  <Slider v-model="range" range />
  <Slider v-model="value" :marks="marks" :step="null" />
</template>
```

Props:

- `modelValue`, `defaultValue`: `number | number[]`
- `min`, `max`, `step`
- `range`: boolean or range options
- `marks`, `dots`, `included`
- `color`
- `disabled`: boolean or boolean array
- `keyboard`, `vertical`, `reverse`
- `tooltip`
- `size`: `sm | md | lg`
- `tabindex`, `ariaLabel`, `name`

Events:

- `update:modelValue(value)`
- `change(value)`
- `changeComplete(value)`
- `focus(event, index)`
- `blur(event, index)`

Expose:

- `focus()`, `blur()`

Slots:

- None

## ColorPicker

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ColorPicker, type ColorPickerValue } from '@unoui/vue/colorpicker'

const color = ref<ColorPickerValue>({
  mode: 'solid',
  color: { r: 33, g: 137, b: 216, a: 1 }
})
</script>

<template>
  <ColorPicker v-model="color" :allow-gradient="false" />
</template>
```

Props:

- `modelValue`: `ColorPickerValue`
- `size`: `sm | md | lg`
- `allowGradient`
- `allowAlpha`
- `disabled`

`ColorPickerValue` supports `solid`, `linear`, and `radial`.

Events:

- `update:modelValue(value)`
- `changed(value)`

Slots:

- None

Expose:

- None
