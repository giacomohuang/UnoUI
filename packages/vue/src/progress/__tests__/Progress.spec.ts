import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import Progress from '../Progress.vue'

describe('Progress', () => {
  it('renders a line progressbar and clamps percent', async () => {
    const wrapper = mount(Progress, {
      props: {
        percent: 160
      }
    })

    expect(wrapper.attributes('role')).toBe('progressbar')
    expect(wrapper.attributes('aria-valuenow')).toBe('100')
    expect(wrapper.attributes('data-status')).toBe('success')
    expect(wrapper.find('[data-ui-progress-track="true"]').attributes('style')).toContain('width: 100%')
    const successIcon = wrapper.find('[data-ui-progress-info="true"] .i-lucide\\:check')
    expect(successIcon.exists()).toBe(true)
    expect(Array.from(successIcon.element.parentElement?.classList ?? [])).toEqual(expect.arrayContaining(['size-4', 'rounded-full', 'bg-green-500', 'text-white']))
    expect(wrapper.find('[data-ui-progress-info="true"]').classes()).toContain('h-5')

    await wrapper.setProps({ percent: -10 })
    expect(wrapper.attributes('aria-valuenow')).toBe('0')
    expect(wrapper.find('[data-ui-progress-track="true"]').attributes('style')).toContain('width: 0%')

    await wrapper.setProps({ size: 'xxl' })
    expect(wrapper.find('[data-ui-progress-rail="true"]').attributes('style')).toContain('height: 20px')
    expect(wrapper.find('[data-ui-progress-info="true"]').classes()).toEqual(expect.arrayContaining(['h-7', 'text-lg/7']))
  })

  it('supports statuses, hidden info, and custom formatting', async () => {
    const wrapper = mount(Progress, {
      props: {
        percent: 35,
        status: 'active',
        format: (percent: number) => `${percent} / 100`
      }
    })

    expect(wrapper.find('[data-ui-progress-track="true"]').classes()).toContain('progress-track-active')
    expect(wrapper.find('[data-ui-progress-info="true"]').text()).toBe('35 / 100')
    expect(wrapper.attributes('aria-valuetext')).toBe('35 / 100')

    await wrapper.setProps({ showInfo: false, status: 'exception' })
    expect(wrapper.find('[data-ui-progress-info="true"]').exists()).toBe(false)
    expect(wrapper.attributes('data-status')).toBe('exception')

    await wrapper.setProps({ showInfo: true, format: undefined })
    const exceptionIcon = wrapper.find('[data-ui-progress-info="true"] .i-lucide\\:x')
    expect(Array.from(exceptionIcon.element.parentElement?.classList ?? [])).toEqual(expect.arrayContaining(['size-4', 'rounded-full', 'bg-red-500', 'text-white']))
  })

  it('renders success progress and exposes info slot state', () => {
    const wrapper = mount(Progress, {
      props: {
        percent: 70,
        success: { percent: 30, strokeColor: '#16a34a' }
      },
      slots: {
        info: ({ percent, successPercent }: { percent: number; successPercent: number }) => `${successPercent}/${percent}`
      }
    })

    const success = wrapper.find('[data-ui-progress-success="true"]')
    expect(success.attributes('style')).toContain('width: 30%')
    expect(success.attributes('style')).toContain('background-color: rgb(22, 163, 74)')
    expect(wrapper.find('[data-ui-progress-info="true"]').text()).toBe('30/70')
  })

  it('renders colored steps according to current and success progress', () => {
    const wrapper = mount(Progress, {
      props: {
        percent: 60,
        steps: 5,
        strokeColor: ['#0284c7', '#0891b2'],
        success: { percent: 20 }
      }
    })

    const steps = wrapper.findAll('[data-ui-progress-step="true"]')
    expect(steps).toHaveLength(5)
    expect(steps[0].classes()).toContain('bg-green-500')
    expect(steps[1].attributes('style')).toContain('background-color: rgb(8, 145, 178)')
    expect(steps[2].attributes('style')).toContain('background-color: rgb(2, 132, 199)')
    expect(steps[3].classes()).toContain('bg-tertiary')
  })

  it('renders circle and dashboard geometry with a gradient', async () => {
    const wrapper = mount(Progress, {
      props: {
        percent: 75,
        type: 'circle',
        size: 'sm',
        strokeColor: { from: '#0ea5e9', to: '#22c55e' }
      }
    })

    expect(wrapper.attributes('style')).toContain('width: 64px')
    expect(wrapper.find('linearGradient').exists()).toBe(true)
    expect(wrapper.find('[data-ui-progress-info="true"]').classes()).not.toContain('h-4')
    expect(wrapper.find('[data-ui-progress-info="true"]').classes()).toContain('inset-0')
    expect(wrapper.find('[data-ui-progress-track="true"]').attributes('stroke-dasharray')).toBe('75 25')
    expect(wrapper.find('[data-ui-progress-track="true"]').attributes('transform')).toBe('rotate(-90 50 50)')

    await wrapper.setProps({ size: 'xl' })
    expect(wrapper.attributes('style')).toContain('width: 144px')
    await wrapper.setProps({ size: 'xxl' })
    expect(wrapper.attributes('style')).toContain('width: 168px')

    await wrapper.setProps({ status: 'success' })
    const circleSuccessIcon = wrapper.find('[data-ui-progress-info="true"] .i-lucide\\:check')
    expect(Array.from(circleSuccessIcon.element.parentElement?.classList ?? [])).toEqual(expect.arrayContaining(['text-green-500']))
    expect(Array.from(circleSuccessIcon.element.parentElement?.classList ?? [])).not.toEqual(expect.arrayContaining(['rounded-full', 'bg-green-500', 'text-white']))

    await wrapper.setProps({ type: 'dashboard', gapDegree: 400, gapPlacement: 'top', status: 'exception' })
    expect(wrapper.find('[data-ui-progress-info="true"]').classes()).not.toContain('h-4')
    expect(wrapper.find('[data-ui-progress-rail="true"]').attributes('stroke-dasharray')).toBe('18.0556 81.9444')
    expect(wrapper.find('[data-ui-progress-track="true"]').attributes('transform')).toBe('rotate(57.5 50 50)')
    const dashboardExceptionIcon = wrapper.find('[data-ui-progress-info="true"] .i-lucide\\:x')
    expect(Array.from(dashboardExceptionIcon.element.parentElement?.classList ?? [])).toEqual(expect.arrayContaining(['text-red-500']))
    expect(Array.from(dashboardExceptionIcon.element.parentElement?.classList ?? [])).not.toEqual(expect.arrayContaining(['rounded-full', 'bg-red-500', 'text-white']))
  })

  it('passes root attributes and semantic classes through', () => {
    const wrapper = mount(Progress, {
      attrs: {
        class: 'custom-root',
        'aria-label': '上传进度'
      },
      props: {
        percent: 40,
        classNames: {
          track: 'custom-track'
        }
      }
    })

    expect(wrapper.classes()).toContain('custom-root')
    expect(wrapper.attributes('aria-label')).toBe('上传进度')
    expect(wrapper.find('[data-ui-progress-track="true"]').classes()).toContain('custom-track')
  })
})
