import { flushPromises, mount } from '@vue/test-utils'
import dayjs from 'dayjs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'

import TimePicker from '../TimePicker.vue'
import TimeRangePicker from '../TimeRangePicker.vue'
import { timePickerValue, timePickerWrapper } from '../index'

const cleanupBody = () => {
  document.body.innerHTML = ''
}

const openPanel = async (wrapper: ReturnType<typeof mount>) => {
  await wrapper.find('[data-ui-timepicker="true"]').trigger('click')
  await flushPromises()
}

const openRangePanel = async (wrapper: ReturnType<typeof mount>) => {
  await wrapper.find('[data-ui-time-range-picker="true"]').trigger('click')
  await flushPromises()
}

const findOption = (unit: string, value: string) => document.body.querySelector<HTMLButtonElement>(`[data-ui-timepicker-unit="${unit}"][data-ui-timepicker-value="${value}"]`)
const findRangeOption = (side: string, unit: string, value: string) => document.body.querySelector<HTMLButtonElement>(`[data-ui-time-range-picker-side="${side}"][data-ui-timepicker-unit="${unit}"][data-ui-timepicker-value="${value}"]`)
let originalScrollTo: typeof HTMLElement.prototype.scrollTo | undefined
let hasScrollToMock = false

const restoreScrollTo = () => {
  if (!hasScrollToMock) return
  if (!originalScrollTo) {
    Reflect.deleteProperty(HTMLElement.prototype, 'scrollTo')
    hasScrollToMock = false
    return
  }
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: originalScrollTo
  })
  originalScrollTo = undefined
  hasScrollToMock = false
}

describe('TimePicker', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    restoreScrollTo()
    cleanupBody()
  })

  it('uses padding instead of calculated heights for control sizes', () => {
    expect(timePickerWrapper()).toContain('border-control')
    expect(timePickerWrapper({ size: 'sm' })).not.toContain('calc(')
    expect(timePickerWrapper({ size: 'md' })).not.toContain('calc(')
    expect(timePickerWrapper({ size: 'lg' })).not.toContain('calc(')
    expect(timePickerValue({ size: 'sm' })).toContain('py-1')
    expect(timePickerValue({ size: 'md' })).toContain('py-2')
    expect(timePickerValue({ size: 'lg' })).toContain('py-2')
  })

  it('renders formatted value and clears it', async () => {
    const wrapper = mount(TimePicker, {
      props: {
        modelValue: '10:30:00',
        clearable: true
      },
      attachTo: document.body
    })

    expect(wrapper.text()).toContain('10:30:00')

    await wrapper.find('button[aria-label="清空"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null])
    expect(wrapper.emitted('change')?.[0]).toEqual([null, ''])
    expect(wrapper.emitted('clear')).toHaveLength(1)
    wrapper.unmount()
  })

  it('selects time units immediately by default', async () => {
    const wrapper = mount(TimePicker, {
      props: {
        modelValue: '10:30:00',
        valueFormat: 'HH:mm:ss'
      },
      attachTo: document.body
    })

    await openPanel(wrapper)
    findOption('hour', '11')?.click()
    await flushPromises()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['11:30:00'])

    findOption('minute', '45')?.click()
    await flushPromises()

    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual(['11:45:00'])
    wrapper.unmount()
  })

  it('keeps value pending until confirm when needConfirm is true', async () => {
    const wrapper = mount(TimePicker, {
      props: {
        modelValue: '10:30:00',
        needConfirm: true,
        valueFormat: 'HH:mm:ss'
      },
      attachTo: document.body
    })

    await openPanel(wrapper)
    findOption('hour', '12')?.click()
    await flushPromises()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    const okButton = Array.from(document.body.querySelectorAll<HTMLButtonElement>('button')).find((button) => button.textContent?.trim() === '确定')
    expect(okButton).toBeTruthy()
    okButton?.click()
    await flushPromises()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['12:30:00'])
    expect(wrapper.emitted('ok')?.[0]).toEqual(['12:30:00', '12:30:00'])
    wrapper.unmount()
  })

  it('hides seconds and disabled options by format and disabledTime', async () => {
    const wrapper = mount(TimePicker, {
      props: {
        modelValue: '10:15',
        format: 'HH:mm',
        valueFormat: 'HH:mm',
        minuteStep: 15,
        hideDisabledOptions: true,
        disabledTime: () => ({
          disabledMinutes: () => [30]
        })
      },
      attachTo: document.body
    })

    await openPanel(wrapper)

    expect(findOption('second', '00')).toBeNull()
    expect(findOption('minute', '30')).toBeNull()
    expect(findOption('minute', '45')).toBeTruthy()

    findOption('minute', '45')?.click()
    await flushPromises()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['10:45'])
    wrapper.unmount()
  })

  it('supports 12-hour meridiem selection with 24-hour output', async () => {
    const wrapper = mount(TimePicker, {
      props: {
        modelValue: '11:20:00',
        use12Hours: true,
        valueFormat: 'HH:mm:ss'
      },
      attachTo: document.body
    })

    await openPanel(wrapper)
    findOption('meridiem', 'pm')?.click()
    await flushPromises()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['23:20:00'])
    wrapper.unmount()
  })

  it('scrolls columns to current time after picking now', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-24T15:42:36'))
    const scrollTo = vi.fn()
    originalScrollTo = HTMLElement.prototype.scrollTo
    hasScrollToMock = true
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: scrollTo
    })
    const wrapper = mount(TimePicker, {
      props: {
        modelValue: '00:00:00',
        valueFormat: 'HH:mm:ss'
      },
      attachTo: document.body
    })

    await openPanel(wrapper)
    scrollTo.mockClear()

    const nowButton = Array.from(document.body.querySelectorAll<HTMLButtonElement>('button')).find((button) => button.textContent?.trim() === '此刻')
    expect(nowButton).toBeTruthy()
    nowButton?.click()
    await flushPromises()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['15:42:36'])
    expect(findOption('hour', '15')?.dataset.uiTimepickerSelected).toBe('true')
    expect(findOption('minute', '42')?.dataset.uiTimepickerSelected).toBe('true')
    expect(findOption('second', '36')?.dataset.uiTimepickerSelected).toBe('true')
    expect(scrollTo).toHaveBeenCalledTimes(3)
    wrapper.unmount()
  })

  it('does not scroll columns after selecting a time option', async () => {
    const scrollTo = vi.fn()
    originalScrollTo = HTMLElement.prototype.scrollTo
    hasScrollToMock = true
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: scrollTo
    })
    const wrapper = mount(
      defineComponent({
        components: { TimePicker },
        setup() {
          const value = ref('10:30:00')
          return { value }
        },
        template: '<TimePicker v-model="value" value-format="HH:mm:ss" />'
      }),
      {
        attachTo: document.body
      }
    )

    await openPanel(wrapper)
    scrollTo.mockClear()

    findOption('hour', '11')?.click()
    await flushPromises()

    expect(scrollTo).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('preserves Dayjs output type when the model is Dayjs', async () => {
    const value = dayjs('2026-06-24 10:30:00')
    const wrapper = mount(TimePicker, {
      props: {
        modelValue: value
      },
      attachTo: document.body
    })

    await openPanel(wrapper)
    findOption('second', '5')?.click()
    await flushPromises()

    const emitted = wrapper.emitted('update:modelValue')?.[0]?.[0]
    expect(dayjs.isDayjs(emitted)).toBe(true)
    expect((emitted as dayjs.Dayjs).format('HH:mm:ss')).toBe('10:30:05')
    wrapper.unmount()
  })
})

describe('TimeRangePicker', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    restoreScrollTo()
    cleanupBody()
  })

  it('renders range value with next-day label and clears it', async () => {
    const wrapper = mount(TimeRangePicker, {
      props: {
        modelValue: ['22:30:00', '02:15:00'],
        clearable: true,
        name: 'bookingTime'
      },
      attachTo: document.body
    })

    expect(wrapper.text()).toContain('22:30:00')
    expect(wrapper.text()).toContain('次日 02:15:00')
    expect(wrapper.find('input[name="bookingTime"]').element.value).toBe('22:30:00,02:15:00')

    await wrapper.find('button[aria-label="清空"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null])
    expect(wrapper.emitted('change')?.[0]).toEqual([null, ['', ''], { endDayOffset: 0, crossesDay: false }])
    expect(wrapper.emitted('clear')).toHaveLength(1)
    wrapper.unmount()
  })

  it('emits partial calendar-change value while selecting a range', async () => {
    const wrapper = mount(TimeRangePicker, {
      props: {
        modelValue: ['00:00:00', null],
        valueFormat: 'HH:mm:ss'
      },
      attachTo: document.body
    })

    await openRangePanel(wrapper)
    findRangeOption('start', 'hour', '9')?.click()
    await flushPromises()

    expect(wrapper.emitted('calendar-change')?.[0]).toEqual([['09:00:00', null], ['09:00:00', ''], { endDayOffset: 0, crossesDay: false }])
    wrapper.unmount()
  })

  it('selects and confirms an overnight range', async () => {
    const wrapper = mount(TimeRangePicker, {
      props: {
        modelValue: ['22:00:00', '23:00:00'],
        valueFormat: 'HH:mm:ss'
      },
      attachTo: document.body
    })

    await openRangePanel(wrapper)
    findRangeOption('start', 'hour', '23')?.click()
    await flushPromises()
    findRangeOption('end', 'hour', '2')?.click()
    await flushPromises()

    const daySwitchButtons = Array.from(document.body.querySelectorAll<HTMLButtonElement>('button')).filter((button) => ['当日', '次日'].includes(button.textContent?.trim() || ''))
    expect(daySwitchButtons).toHaveLength(0)

    const okButton = Array.from(document.body.querySelectorAll<HTMLButtonElement>('button')).find((button) => button.textContent?.trim() === '确定')
    expect(okButton?.disabled).toBe(false)
    okButton?.click()
    await flushPromises()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['23:00:00', '02:00:00']])
    expect(wrapper.emitted('change')?.[0]).toEqual([['23:00:00', '02:00:00'], ['23:00:00', '02:00:00'], { endDayOffset: 1, crossesDay: true }])
    expect(wrapper.emitted('ok')?.[0]).toEqual([['23:00:00', '02:00:00'], ['23:00:00', '02:00:00'], { endDayOffset: 1, crossesDay: true }])

    await wrapper.setProps({ modelValue: ['23:00:00', '02:00:00'] })
    expect(wrapper.text()).toContain('次日 02:00:00')
    wrapper.unmount()
  })

  it('does not scroll columns after selecting a range time option', async () => {
    const scrollTo = vi.fn()
    originalScrollTo = HTMLElement.prototype.scrollTo
    hasScrollToMock = true
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: scrollTo
    })
    const wrapper = mount(TimeRangePicker, {
      props: {
        modelValue: ['10:00:00', '12:00:00'],
        valueFormat: 'HH:mm:ss'
      },
      attachTo: document.body
    })

    await openRangePanel(wrapper)
    scrollTo.mockClear()

    findRangeOption('start', 'hour', '11')?.click()
    await flushPromises()

    expect(scrollTo).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('keeps same-day ranges unmarked when the end is not earlier', async () => {
    const wrapper = mount(TimeRangePicker, {
      props: {
        modelValue: ['10:00:00', '12:00:00'],
        valueFormat: 'HH:mm:ss'
      },
      attachTo: document.body
    })

    await openRangePanel(wrapper)

    const daySwitchButtons = Array.from(document.body.querySelectorAll<HTMLButtonElement>('button')).filter((button) => ['当日', '次日'].includes(button.textContent?.trim() || ''))
    expect(daySwitchButtons).toHaveLength(0)
    expect(wrapper.text()).not.toContain('次日 12:00:00')

    const okButton = Array.from(document.body.querySelectorAll<HTMLButtonElement>('button')).find((button) => button.textContent?.trim() === '确定')
    expect(okButton?.disabled).toBe(false)
    okButton?.click()
    await flushPromises()

    expect(wrapper.emitted('change')?.[0]).toEqual([['10:00:00', '12:00:00'], ['10:00:00', '12:00:00'], { endDayOffset: 0, crossesDay: false }])
    wrapper.unmount()
  })

  it('scrolls the active side to current time after picking now', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-24T06:42:36'))
    const scrollTo = vi.fn()
    originalScrollTo = HTMLElement.prototype.scrollTo
    hasScrollToMock = true
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: scrollTo
    })
    const wrapper = mount(TimeRangePicker, {
      props: {
        modelValue: ['00:00:00', '01:00:00'],
        valueFormat: 'HH:mm:ss'
      },
      attachTo: document.body
    })

    await openRangePanel(wrapper)
    scrollTo.mockClear()

    const endButton = Array.from(document.body.querySelectorAll<HTMLButtonElement>('button')).find((button) => button.textContent?.trim() === '结束时间')
    endButton?.click()
    await flushPromises()
    const nowButton = Array.from(document.body.querySelectorAll<HTMLButtonElement>('button')).find((button) => button.textContent?.trim() === '此刻')
    nowButton?.click()
    await flushPromises()

    expect(findRangeOption('end', 'hour', '6')?.dataset.uiTimeRangePickerSelected).toBe('true')
    expect(findRangeOption('end', 'minute', '42')?.dataset.uiTimeRangePickerSelected).toBe('true')
    expect(findRangeOption('end', 'second', '36')?.dataset.uiTimeRangePickerSelected).toBe('true')
    expect(scrollTo).toHaveBeenCalled()
    wrapper.unmount()
  })
})
