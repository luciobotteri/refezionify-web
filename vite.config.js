import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/refezionify-web/',
  plugins: [react()],
  server: {
    proxy: {
      '/comune-proxy': {
        target: 'https://www.comune.napoli.it',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/comune-proxy/, ''),
      },
    },
  },
})