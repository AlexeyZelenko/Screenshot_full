import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './', // Use relative paths for Chrome extension
  build: {
    // Chrome extension specific settings
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        editor: resolve(__dirname, 'public/editor.html')
      },
      output: {
        entryFileNames: '[name].js'
      }
    }
  }
})