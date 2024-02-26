/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['dist', '.idea', '.git', '.cache', '**/node_modules/**'],
    coverage: {
        enabled: true,
        thresholds: {
            statements: 13,
            branches: 54,
            functions: 21,
            lines: 13
        }
    }
  }
})