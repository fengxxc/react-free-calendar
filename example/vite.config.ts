import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署在 /<repo-name>/ 子路径下
  base: '/react-free-calendar/',
})
