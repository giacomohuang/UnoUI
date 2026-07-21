import { readFileSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'

import { presetUnoUI } from '@mcistudio/unoui-vue/uno'
import { defineConfig, transformerDirectives, transformerVariantGroup } from 'unocss'

const require = createRequire(import.meta.url)
const unoUIPackageDirectory = dirname(require.resolve('@mcistudio/unoui-vue/package.json'))
const unoUIDistDirectory = resolve(unoUIPackageDirectory, 'dist')
const unoUIContent = readdirSync(unoUIDistDirectory, { encoding: 'utf8', recursive: true })
  .filter((file) => file.endsWith('.js'))
  .map((file) => readFileSync(resolve(unoUIDistDirectory, file), 'utf8'))
  .join('\n')

export default defineConfig({
  presets: [presetUnoUI()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  content: {
    inline: [unoUIContent],
    pipeline: {
      include: [/\.(vue|svelte|[jt]sx|vine.ts|mdx?|astro|elm|php|phtml|marko|html)($|\?)/, 'src/**/*.{js,ts}'],
      exclude: ['uno.config.ts']
    }
  }
})
