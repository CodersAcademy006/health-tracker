import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

const rootDir = import.meta.dirname

export default defineConfig({
  plugins: [react()],
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
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})