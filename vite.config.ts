import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const rootDir = import.meta.dirname

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
      '@/components': path.resolve(rootDir, './src/components'),
      '@/lib': path.resolve(rootDir, './src/lib'),
      '@/services': path.resolve(rootDir, './src/services'),
      '@/types': path.resolve(rootDir, './src/types'),
      '@/hooks': path.resolve(rootDir, './src/hooks'),
      '@/store': path.resolve(rootDir, './src/store'),
      '@/utils': path.resolve(rootDir, './src/lib/utils'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})