import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  outDir: 'build',
  clean: true,
  banner: { js: '#!/usr/bin/env node' },
});
