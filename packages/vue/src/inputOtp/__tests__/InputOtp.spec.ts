import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

import InputOtp from '../InputOtp.vue'
import { inputOtpCell, inputOtpGroup } from '../index'

describe('InputOtp', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders configured cells and size tokens', () => {
    const wrapper = mount(InputOtp, {
      props: {
        digits: 4,
        size: 'md',
        gap: 'md'
      }
    })

    expect(wrapper.findAll('[data-ui-input-otp-cell="true"]')).toHaveLength(4)
    expect(inputOtpCell({ size: 'md' })).toContain('size-[50px]')
    expect(inputOtpGroup({ gap: 'md' })).toContain('gap-2.5')
  })

  it('emits model updates and finish after all digits are entered', async () => {
    vi.useFakeTimers()
    const wrapper = mount(InputOtp, {
      props: {
        digits: 3
      }
    })
    const inputs = wrapper.findAll<HTMLInputElement>('[data-ui-input-otp-cell="true"]')

    await inputs[0].trigger('keydown', { key: '1' })
    await inputs[1].trigger('keydown', { key: '2' })
    await inputs[2].trigger('keydown', { key: '3' })

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['123'])

    vi.advanceTimersByTime(150)
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('finish')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([''])
  })

  it('fills digits from pasted text', async () => {
    vi.useFakeTimers()
    const wrapper = mount(InputOtp, {
      props: {
        digits: 4
      }
    })

    await wrapper.find('[data-ui-input-otp-cell="true"]').trigger('paste', {
      clipboardData: {
        getData: () => '12 3-4'
      }
    })

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['1234'])
    vi.advanceTimersByTime(150)
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('finish')).toHaveLength(1)
  })
})
