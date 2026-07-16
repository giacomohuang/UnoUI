import { flushPromises, mount } from '@vue/test-utils'
import dayjs from 'dayjs'
import { afterEach, describe, expect, it } from 'vitest'

import DatePicker from '../DatePicker.vue'
import RangePicker from '../RangePicker.vue'

const cleanupBody = () => {
  document.body.innerHTML = ''
}

const openPanel = async (wrapper: ReturnType<typeof mount>) => {
  await wrapper.find('[data-ui-datepicker="true"]').trigger('click')
  await flushPromises()
}

const findDateButton = (day: string) => {
  const buttons = Array.from(document.body.querySelectorAll<HTMLButtonElement>('.ui-datepicker-dropdown button'))
  return buttons.find((button) => button.textContent?.trim() === day && !button.disabled)
}

const findPanelButton = (text: string) => {
  const buttons = Array.from(document.body.querySelectorAll<HTMLButtonElement>('.ui-datepicker-dropdown button'))
  return buttons.find((button) => button.textContent?.trim() === text && !button.disabled)
}

describe('DatePicker', () => {
  afterEach(() => cleanupBody())

  it('renders formatted value and clears it', async () => {
    const wrapper = mount(DatePicker, {
      props: {
        modelValue: '2026-06-24',
        clearable: true
      },
      attachTo: document.body
    })

    expect(wrapper.text()).toContain('2026-06-24')

    await wrapper.find('button[aria-label="清空"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null])
    expect(wrapper.emitted('change')?.[0]).toEqual([null, ''])
    expect(wrapper.emitted('clear')).toHaveLength(1)
    wrapper.unmount()
  })

  it('selects a date and closes the dropdown', async () => {
    const wrapper = mount(DatePicker, {
      props: {
        modelValue: '2026-06-24'
      },
      attachTo: document.body
    })

    await openPanel(wrapper)
    const target = findDateButton('25')
    expect(target).toBeTruthy()
    target?.click()
    await flushPromises()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2026-06-25'])
    expect(document.body.querySelector('.ui-datepicker-dropdown')).toBeNull()
    wrapper.unmount()
  })

  it('keeps datetime pending until confirm', async () => {
    const wrapper = mount(DatePicker, {
      props: {
        modelValue: '2026-06-24 10:30:00',
        showTime: true,
        valueFormat: 'YYYY-MM-DD HH:mm:ss'
      },
      attachTo: document.body
    })

    await openPanel(wrapper)
    const target = findDateButton('25')
    expect(target).toBeTruthy()
    target?.click()
    await flushPromises()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    const okButton = Array.from(document.body.querySelectorAll<HTMLButtonElement>('button')).find((button) => button.textContent?.trim() === '确定')
    expect(okButton).toBeTruthy()
    okButton?.click()
    await flushPromises()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2026-06-25 10:30:00'])
    expect(wrapper.emitted('ok')?.[0]).toEqual(['2026-06-25 10:30:00', '2026-06-25 10:30:00'])
    wrapper.unmount()
  })

  it('does not select disabled dates', async () => {
    const wrapper = mount(DatePicker, {
      props: {
        modelValue: '2026-06-24',
        disabledDate: (date: dayjs.Dayjs) => date.date() === 25
      },
      attachTo: document.body
    })

    await openPanel(wrapper)
    const disabledTarget = Array.from(document.body.querySelectorAll<HTMLButtonElement>('.ui-datepicker-dropdown button')).find((button) => button.textContent?.trim() === '25')
    expect(disabledTarget?.disabled).toBe(true)
    disabledTarget?.click()
    await flushPromises()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('selects month and year by picker mode', async () => {
    const monthWrapper = mount(DatePicker, {
      props: {
        modelValue: '2026-06',
        picker: 'month'
      },
      attachTo: document.body
    })

    await openPanel(monthWrapper)
    findPanelButton('7月')?.click()
    await flushPromises()

    expect(monthWrapper.emitted('update:modelValue')?.[0]).toEqual(['2026-07'])
    monthWrapper.unmount()
    cleanupBody()

    const yearWrapper = mount(DatePicker, {
      props: {
        modelValue: '2026',
        picker: 'year'
      },
      attachTo: document.body
    })

    await openPanel(yearWrapper)
    findPanelButton('2027')?.click()
    await flushPromises()

    expect(yearWrapper.emitted('update:modelValue')?.[0]).toEqual(['2027'])
    yearWrapper.unmount()
  })

  it('drills from date header year to month panel before date panel', async () => {
    const wrapper = mount(DatePicker, {
      props: {
        modelValue: '2026-06-24'
      },
      attachTo: document.body
    })

    await openPanel(wrapper)
    findPanelButton('2026年')?.click()
    await flushPromises()
    expect(findPanelButton('2027')).toBeTruthy()

    findPanelButton('2027')?.click()
    await flushPromises()
    expect(findPanelButton('7月')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    findPanelButton('7月')?.click()
    await flushPromises()
    expect(findDateButton('24')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })
})

describe('RangePicker', () => {
  afterEach(() => cleanupBody())

  it('renders and clears range value', async () => {
    const wrapper = mount(RangePicker, {
      props: {
        modelValue: ['2026-06-01', '2026-06-24'],
        clearable: true
      },
      attachTo: document.body
    })

    expect(wrapper.text()).toContain('2026-06-01')
    expect(wrapper.text()).toContain('2026-06-24')
    expect(wrapper.find('[class*="i-ant-design:swap-right-outlined"]').exists()).toBe(true)

    await wrapper.find('button[aria-label="清空"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null])
    expect(wrapper.emitted('change')?.[0]).toEqual([null, ['', '']])
    expect(wrapper.emitted('clear')).toHaveLength(1)
    wrapper.unmount()
  })

  it('selects a date range and closes the dropdown', async () => {
    const wrapper = mount(RangePicker, {
      props: {
        modelValue: ['2026-06-01', '2026-06-24']
      },
      attachTo: document.body
    })

    await wrapper.find('[data-ui-range-picker="true"]').trigger('click')
    await flushPromises()
    findDateButton('10')?.click()
    await flushPromises()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    findDateButton('12')?.click()
    await flushPromises()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['2026-06-10', '2026-06-12']])
    expect(wrapper.emitted('change')?.[0]).toEqual([
      ['2026-06-10', '2026-06-12'],
      ['2026-06-10', '2026-06-12']
    ])
    expect(document.body.querySelector('.ui-datepicker-dropdown')).toBeNull()
    wrapper.unmount()
  })

  it('edits the endpoint clicked in the range trigger', async () => {
    const wrapper = mount(RangePicker, {
      props: {
        modelValue: ['2026-06-01', '2026-06-24']
      },
      attachTo: document.body
    })

    await wrapper.find('[data-ui-range-picker-side="end"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-ui-range-picker-side="end"]').attributes('data-ui-range-picker-side-active')).toBe('true')
    document.body.querySelector<HTMLButtonElement>('[data-ui-range-picker-date-cell="2026-06-20"]')?.click()
    await flushPromises()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['2026-06-01', '2026-06-20']])
    expect(document.body.querySelector('.ui-datepicker-dropdown')).toBeNull()
    wrapper.unmount()
  })

  it('opens the clicked date-time endpoint at its selected month', async () => {
    const wrapper = mount(RangePicker, {
      props: {
        modelValue: ['2026-06-01 08:15:30', '2026-08-24 18:45:50'],
        showTime: true,
        valueFormat: 'YYYY-MM-DD HH:mm:ss'
      },
      attachTo: document.body
    })

    await wrapper.find('[data-ui-range-picker-side="end"]').trigger('click')
    await flushPromises()

    expect(document.body.querySelector('[data-ui-range-picker-time-column="hour"]')?.getAttribute('data-ui-range-picker-time-side')).toBe('end')
    expect(document.body.querySelector('[data-ui-range-picker-panel="active"] [data-ui-range-picker-date-selected="true"]')?.getAttribute('data-ui-range-picker-date-cell')).toBe('2026-08-24')
    wrapper.unmount()
  })

  it('disables dates before the start when editing the end endpoint', async () => {
    const wrapper = mount(RangePicker, {
      props: {
        modelValue: ['2026-06-10', '2026-06-24']
      },
      attachTo: document.body
    })

    await wrapper.find('[data-ui-range-picker-side="end"]').trigger('click')
    await flushPromises()

    const previousDate = document.body.querySelector<HTMLButtonElement>('[data-ui-range-picker-date-cell="2026-06-09"]')
    const startDate = document.body.querySelector<HTMLButtonElement>('[data-ui-range-picker-date-cell="2026-06-10"]')
    expect(previousDate?.disabled).toBe(true)
    expect(startDate?.disabled).toBe(false)
    wrapper.unmount()
  })

  it('does not highlight adjacent-month dates in either range panel', async () => {
    const wrapper = mount(RangePicker, {
      props: {
        modelValue: ['2026-07-31', '2026-08-03']
      },
      attachTo: document.body
    })

    await wrapper.find('[data-ui-range-picker="true"]').trigger('click')
    await flushPromises()

    const leftStart = document.body.querySelector('[data-ui-range-picker-panel="left"] [data-ui-range-picker-date-cell="2026-07-31"]')
    const leftAdjacentEnd = document.body.querySelector('[data-ui-range-picker-panel="left"] [data-ui-range-picker-date-cell="2026-08-03"]')
    const rightAdjacentStart = document.body.querySelector('[data-ui-range-picker-panel="right"] [data-ui-range-picker-date-cell="2026-07-31"]')
    const rightEnd = document.body.querySelector('[data-ui-range-picker-panel="right"] [data-ui-range-picker-date-cell="2026-08-03"]')

    expect(leftStart?.getAttribute('data-ui-range-picker-date-selected')).toBe('true')
    expect(rightEnd?.getAttribute('data-ui-range-picker-date-selected')).toBe('true')
    expect(leftAdjacentEnd?.getAttribute('data-ui-range-picker-date-selected')).toBeNull()
    expect(leftAdjacentEnd?.getAttribute('data-ui-range-picker-date-in-range')).toBeNull()
    expect(rightAdjacentStart?.getAttribute('data-ui-range-picker-date-selected')).toBeNull()
    expect(rightAdjacentStart?.getAttribute('data-ui-range-picker-date-in-range')).toBeNull()
    wrapper.unmount()
  })

  it('shows and confirms a date-time range to seconds', async () => {
    const wrapper = mount(RangePicker, {
      props: {
        modelValue: ['2026-06-01 08:15:30', '2026-06-24 18:45:50'],
        showTime: true,
        valueFormat: 'YYYY-MM-DD HH:mm:ss'
      },
      attachTo: document.body
    })

    expect(wrapper.find('[data-ui-range-picker="true"] [title]').attributes('title')).toContain('2026-06-01 08:15:30')
    expect(wrapper.find('[data-ui-range-picker="true"] [title]').attributes('title')).toContain('2026-06-24 18:45:50')

    await wrapper.find('[data-ui-range-picker="true"]').trigger('click')
    await flushPromises()
    findDateButton('10')?.click()
    await flushPromises()

    expect(wrapper.find('[data-ui-range-picker-side="start"]').text()).toBe('2026-06-10 08:15:30')
    expect(document.body.querySelector('[data-ui-range-picker-time-column="hour"]')?.getAttribute('data-ui-range-picker-time-side')).toBe('start')

    const okButton = Array.from(document.body.querySelectorAll<HTMLButtonElement>('button')).find((button) => button.textContent?.trim() === '确定')
    expect(okButton).toBeTruthy()
    okButton?.click()
    await flushPromises()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('ok')).toBeUndefined()
    expect(document.body.querySelector('[data-ui-range-picker-time-column="hour"]')?.getAttribute('data-ui-range-picker-time-side')).toBe('end')

    findDateButton('12')?.click()
    await flushPromises()

    expect(wrapper.find('[data-ui-range-picker-side="end"]').text()).toBe('2026-06-12 18:45:50')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    const secondOption = document.body.querySelector<HTMLButtonElement>('[data-ui-range-picker-time-option="second"][data-ui-range-picker-time-value="55"]')
    expect(secondOption).toBeTruthy()
    secondOption?.click()
    await flushPromises()

    expect(wrapper.find('[data-ui-range-picker-side="end"]').text()).toBe('2026-06-12 18:45:55')

    okButton?.click()
    await flushPromises()

    const expectedValue = ['2026-06-10 08:15:30', '2026-06-12 18:45:55']
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([expectedValue])
    expect(wrapper.emitted('change')?.[0]).toEqual([expectedValue, expectedValue])
    expect(wrapper.emitted('ok')?.[0]).toEqual([expectedValue, expectedValue])
    expect(document.body.querySelector('.ui-datepicker-dropdown')).toBeNull()
    wrapper.unmount()
  })

  it('updates only the active endpoint when selecting range time', async () => {
    const wrapper = mount(RangePicker, {
      props: {
        modelValue: ['2026-06-01 08:15:30', '2026-06-24 18:45:50'],
        showTime: true,
        valueFormat: 'YYYY-MM-DD HH:mm:ss'
      },
      attachTo: document.body
    })

    await wrapper.find('[data-ui-range-picker="true"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-ui-range-picker-side="start"]').text()).toBe('2026-06-01 08:15:30')
    expect(document.body.querySelector('[data-ui-range-picker-date-selected="true"]')?.getAttribute('data-ui-range-picker-date-cell')).toBe('2026-06-01')

    const startSecond = document.body.querySelector<HTMLButtonElement>('[data-ui-range-picker-time-option="second"][data-ui-range-picker-time-value="35"]')
    startSecond?.click()
    await flushPromises()
    expect(wrapper.emitted('calendar-change')?.at(-1)?.[0]).toEqual(['2026-06-01 08:15:35', '2026-06-24 18:45:50'])

    await wrapper.find('[data-ui-range-picker-side="end"]').trigger('click')
    await flushPromises()
    expect(document.body.querySelector('[data-ui-range-picker-date-selected="true"]')?.getAttribute('data-ui-range-picker-date-cell')).toBe('2026-06-24')
    const endSecond = document.body.querySelector<HTMLButtonElement>('[data-ui-range-picker-time-option="second"][data-ui-range-picker-time-value="45"]')
    endSecond?.click()
    await flushPromises()
    expect(wrapper.emitted('calendar-change')?.at(-1)?.[0]).toEqual(['2026-06-01 08:15:35', '2026-06-24 18:45:45'])
    wrapper.unmount()
  })

  it('selects month and year ranges', async () => {
    const monthWrapper = mount(RangePicker, {
      props: {
        modelValue: ['2026-03', '2026-09'],
        picker: 'month'
      },
      attachTo: document.body
    })

    await monthWrapper.find('[data-ui-range-picker="true"]').trigger('click')
    await flushPromises()
    findPanelButton('4月')?.click()
    await flushPromises()
    findPanelButton('6月')?.click()
    await flushPromises()

    expect(monthWrapper.emitted('update:modelValue')?.[0]).toEqual([['2026-04', '2026-06']])
    monthWrapper.unmount()
    cleanupBody()

    const yearWrapper = mount(RangePicker, {
      props: {
        modelValue: ['2024', '2026'],
        picker: 'year'
      },
      attachTo: document.body
    })

    await yearWrapper.find('[data-ui-range-picker="true"]').trigger('click')
    await flushPromises()
    findPanelButton('2025')?.click()
    await flushPromises()
    findPanelButton('2027')?.click()
    await flushPromises()

    expect(yearWrapper.emitted('update:modelValue')?.[0]).toEqual([['2025', '2027']])
    yearWrapper.unmount()
  })

  it('drills range date header through year and month panels', async () => {
    const wrapper = mount(RangePicker, {
      props: {
        modelValue: ['2026-06-01', '2026-06-24']
      },
      attachTo: document.body
    })

    await wrapper.find('[data-ui-range-picker="true"]').trigger('click')
    await flushPromises()
    findPanelButton('2026年')?.click()
    await flushPromises()
    expect(findPanelButton('2027')).toBeTruthy()

    findPanelButton('2027')?.click()
    await flushPromises()
    expect(findPanelButton('7月')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    findPanelButton('7月')?.click()
    await flushPromises()
    expect(findDateButton('24')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })
})
