import { fileURLToPath, URL } from 'node:url'

import { defineConfig, transformerDirectives, transformerVariantGroup } from 'unocss'

import { presetUnoUI } from '../vue/src/uno'

const unoUISourceFiles = fileURLToPath(new URL('../vue/src/**/*.{vue,js,ts}', import.meta.url))

export default defineConfig({
  presets: [presetUnoUI()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  content: {
    filesystem: [unoUISourceFiles],
    pipeline: {
      include: [/\.(vue|svelte|[jt]sx|vine.ts|mdx?|astro|elm|php|phtml|marko|html)($|\?)/, 'src/**/*.{js,ts}', '../vue/src/**/*.{js,ts}'],
      exclude: ['uno.config.ts']
    }
  }
})
