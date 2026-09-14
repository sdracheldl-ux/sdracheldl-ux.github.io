import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 部署到 https://sdracheldl-ux.github.io/
  base: '/',
})
