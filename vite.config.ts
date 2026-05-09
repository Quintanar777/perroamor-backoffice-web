import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('react-dom') || /\/react\//.test(id)) {
            return 'vendor-react'
          }
          if (id.includes('react-router')) return 'vendor-router'
          if (id.includes('@tanstack')) return 'vendor-query'
          if (id.includes('radix-ui') || id.includes('@radix-ui')) {
            return 'vendor-radix'
          }
          if (id.includes('lucide-react')) return 'vendor-icons'
          if (id.includes('date-fns') || id.includes('react-day-picker')) {
            return 'vendor-dates'
          }
          if (
            id.includes('react-hook-form') ||
            id.includes('@hookform') ||
            id.includes('zod')
          ) {
            return 'vendor-forms'
          }
          return 'vendor-misc'
        },
      },
    },
  },
})
