import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'out', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: [
        'src/lib/**/*.{ts,tsx}',
        'src/services/**/*.{ts,tsx}',
        'src/stores/**/*.{ts,tsx}',
      ],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/lib/db/**',
      ],
    },
  },
});
