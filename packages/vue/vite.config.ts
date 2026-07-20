import { existsSync, readdirSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

const sourceDirectory = fileURLToPath(new URL('./src', import.meta.url))
const sourceEntry = (path: string) => fileURLToPath(new URL(`./src/${path}`, import.meta.url))

const componentEntries = Object.fromEntries(
  readdirSync(sourceDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(sourceEntry(`${entry.name}/index.ts`)))
    .map((entry) => [`${entry.name}/index`, sourceEntry(`${entry.name}/index.ts`)])
)

const externalPackage = (id: string) => !id.startsWith('.') && !id.startsWith('/') && !id.startsWith('\0')

export default defineConfig({
  plugins: [vue(), UnoCSS()],
  resolve: {
    alias: {
      '@mcistudio/unoui-vue': fileURLToPath(new URL('./src/index.ts', import.meta.url))
    }
  },
  build: {
    lib: {
      entry: {
        index: sourceEntry('build.ts'),
        attrs: sourceEntry('attrs.ts'),
        config: sourceEntry('config.ts'),
        uno: sourceEntry('uno.ts'),
        ...componentEntries,
        'colorpicker/color': sourceEntry('colorpicker/color.ts'),
        'table/types': sourceEntry('table/types.ts')
      },
      name: 'UnoUI',
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
      cssFileName: 'style'
    },
    rollupOptions: {
      external: externalPackage,
      output: {
        chunkFileNames: 'chunks/[name]-[hash].js'
      }
    },
    sourcemap: true
  }
})
