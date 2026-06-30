import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), UnoCSS()],
  resolve: {
    alias: {
      '@unoui/vue': fileURLToPath(new URL('./src/index.ts', import.meta.url))
    }
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'UnoUI',
      formats: ['es'],
      fileName: () => 'index.js'
    },
    rollupOptions: {
      external: ['vue', 'vue-i18n']
    }
  }
})
