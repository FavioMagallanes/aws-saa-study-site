import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

export default defineConfig({
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    { enforce: 'pre', ...mdx() },
    react(),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/app/tests/setup.ts'],
    include: ['src/**/tests/**/*.test.{ts,tsx}'],
  },
});
