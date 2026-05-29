import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    proxy: {
      '/api': {
        // target: 'https://tz-strategy-vote.pages.dev',
        target: 'https://pre.tz-strategy-vote.pages.dev',
        changeOrigin: true,
      },
    },
  },
})
