import { defineConfig, transformerDirectives, transformerVariantGroup } from 'unocss'

import { presetUnoUI } from '@unoui/vue/uno'

export default defineConfig({
  presets: [presetUnoUI()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  content: {
    pipeline: {
      include: [
        /\.(vue|svelte|[jt]sx|vine.ts|mdx?|astro|elm|php|phtml|marko|html)($|\?)/,
        'src/**/*.{js,ts}',
        '../vue/src/**/*.{vue,js,ts}'
      ],
      exclude: ['uno.config.ts']
    }
  }
})
