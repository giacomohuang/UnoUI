import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue(), UnoCSS()],
  resolve: {
    alias: {
      '@unoui/vue': fileURLToPath(new URL('./src/index.ts', import.meta.url))
    }
  },
  test: {
    environment: 'jsdom',
    globals: true
  }
})
