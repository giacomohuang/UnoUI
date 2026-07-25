import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

const unoUISourceDirectory = fileURLToPath(new URL('../vue/src', import.meta.url))

export default defineConfig({
  base: process.env.VITE_UNOUI_BASE || '/',
  plugins: [vue(), UnoCSS()],
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      { find: /^@mcistudio\/unoui-vue$/, replacement: `${unoUISourceDirectory}/index.ts` },
      { find: /^@mcistudio\/unoui-vue\/style\.css$/, replacement: `${unoUISourceDirectory}/style.css` },
      { find: /^@mcistudio\/unoui-vue\/(attrs|config|uno)$/, replacement: `${unoUISourceDirectory}/$1.ts` },
      { find: /^@mcistudio\/unoui-vue\/(colorpicker\/color|table\/types)$/, replacement: `${unoUISourceDirectory}/$1.ts` },
      { find: /^@mcistudio\/unoui-vue\/([^/]+)$/, replacement: `${unoUISourceDirectory}/$1/index.ts` }
    ],
    dedupe: ['vue']
  },
  optimizeDeps: {
    exclude: ['@mcistudio/unoui-vue']
  }
})
