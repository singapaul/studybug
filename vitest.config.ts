import { defineConfig, configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    // Ignore nested git worktrees (each has its own node_modules, which would
    // otherwise pull duplicate React copies into the run and fail with hook errors).
    exclude: [...configDefaults.exclude, '**/.claude/**'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
