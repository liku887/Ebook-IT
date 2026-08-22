import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Vite 配置
// base: './' 使构建产物可用相对路径访问
// viteSingleFile: 将所有 JS/CSS 内联到单个 HTML 文件，支持双击 index.html 离线打开（file:// 协议）
export default defineConfig({
  plugins: [vue(), viteSingleFile()],
  base: './',
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 2000
  }
})
