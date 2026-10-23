import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/fizzy-bot-Ai-Robot/',
  plugins: [react()],
  server: { host: '0.0.0.0', allowedHosts: true },
  preview: { host: '0.0.0.0', allowedHosts: true },
  build: {
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('/@react-three/') || id.includes('/three-')) return 'three-addons'
          if (id.includes('/three/')) return 'three-core'
          if (id.includes('/react/') || id.includes('/react-dom/')) return 'react-vendor'
          if (id.includes('/lucide-react/')) return 'icon-vendor'
          return 'vendor'
        },
      },
    },
  },
})
