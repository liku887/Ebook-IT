import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Vite 配置
// base: './' 使构建产物可用相对路径访问，支持双击 index.html 直接打开
export default defineConfig({
  plugins: [vue()],
  base: './',
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
