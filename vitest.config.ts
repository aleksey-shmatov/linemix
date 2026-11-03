// vitest.config.ts  (repo root)
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'model',
          root: './packages/model',
          include: ['src/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'db',
          root: './apps/web',
          include: ['tests/db/**/*.test.ts'],
          environment: 'node',
          setupFiles: ['./tests/db/setup.ts'],
          fileParallelism: false,
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['packages/model/src/**'],
    },
  },
});
