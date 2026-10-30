import { chmodSync } from 'node:fs';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/setup.ts'],
  format: ['esm'],
  target: 'node20',
  outDir: 'build',
  clean: true,
  banner: { js: '#!/usr/bin/env node' },
  onSuccess() {
    chmodSync('build/index.js', 0o755);
    chmodSync('build/setup.js', 0o755);
  },
});
