import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    environmentMatchGlobs: [
      ['__tests__/api/**', 'node'],
      ['__tests__/integration/**', 'jsdom'],
      ['__tests__/unit/**', 'jsdom'],
    ],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
