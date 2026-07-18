import { describe, expect, it } from 'vitest'

import { tag } from '../index'

describe('tag', () => {
  it('renders soft tags with a borderless tinted surface', () => {
    const purple = tag({ color: 'purple', variant: 'soft' })
    const blue = tag({ color: 'blue', variant: 'soft' })

    expect(purple).toContain('border-transparent')
    expect(purple).toContain('bg-purple-50')
    expect(purple).toContain('text-purple-600')
    expect(purple).toContain('dark:bg-purple-500/18')
    expect(blue).toContain('bg-blue-50')
    expect(blue).toContain('text-blue-600')
  })

  it('supports the expanded cool and warm color spectrum', () => {
    expect(tag({ color: 'cyan', variant: 'plain' })).toContain('border-cyan-500/40')
    expect(tag({ color: 'teal', variant: 'dark' })).toContain('bg-teal-500')
    expect(tag({ color: 'lime', variant: 'light' })).toContain('bg-lime-500/10')
    expect(tag({ color: 'pink', variant: 'soft' })).toContain('bg-pink-50')
    expect(tag({ color: 'indigo', variant: 'plain' })).toContain('text-indigo-400')
  })

  it('preserves existing light tag styling', () => {
    const className = tag({ color: 'brand', variant: 'light' })

    expect(className).toContain('border-brand-500/20')
    expect(className).toContain('bg-brand-500/10')
    expect(className).toContain('text-brand-400')
  })
})
