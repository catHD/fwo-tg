import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  plugins: [react(), tsconfigPaths({ projects: ['./tsconfig.json'] })],
  // publicDir: './assets',
  server: {
    host: true,
  },
});
