import { describe, expect, it } from 'vitest'

import { button } from '../index'

describe('button', () => {
  it('keeps the brand default classes', () => {
    const className = button({ color: 'brand', variant: 'default' })

    expect(className).toContain('font-normal')
    expect(className).toContain('whitespace-nowrap')
    expect(className).toContain('shrink-0')
    expect(className).toContain('border-brand-500')
    expect(className).toContain('bg-brand-500')
    expect(className).toContain('text-brand-50')
    expect(className).toContain('hover:(border-brand-400 bg-brand-400)')
    expect(className).toContain('active:after:shadow-[0_0_0_0_brand-500]')
  })

  it('keeps outline and mono hover colors clear without darkening', () => {
    const outline = button({ color: 'red', variant: 'outline' })
    const mono = button({ color: 'red', variant: 'mono' })

    expect(outline).toContain('border-red-500')
    expect(outline).toContain('text-red-500')
    expect(outline).toContain('hover:(border-red-400 bg-red-400/15 text-red-400)')
    expect(mono).toContain('hover:(border-red-400 bg-red-400/15 text-red-400)')
    expect(outline).toContain('active:after:shadow-[0_0_0_0_red-500]')
    expect(mono).toContain('active:after:shadow-[0_0_0_0_red-500]')
    expect(outline).toContain('bg-transparent')
    expect(mono).toContain('bg-primary')
    expect(mono).toContain('border-control')
    expect(mono).not.toContain('border-zinc-300')
    expect(mono).not.toContain('dark:border-zinc-500')
  })

  it('keeps dashed and link color classes distinct', () => {
    const dashed = button({ color: 'orange', variant: 'dashed' })
    const link = button({ color: 'orange', variant: 'link' })

    expect(dashed).toContain('border-orange-500')
    expect(dashed).toContain('text-orange-500')
    expect(dashed).toContain('hover:(border-orange-400 bg-orange-400/15 text-orange-400)')
    expect(link).toContain('text-orange-500')
    expect(link).toContain('hover:text-orange-600')
    expect(link.split(/\s+/)).not.toContain('underline')
    expect(link).toContain('hover:underline')
    expect(link).toContain('underline-dashed')
    expect(link).not.toContain('active:after')
    expect(link).not.toContain('shadow-[0_0_0_7px_transparent]')
  })
})
