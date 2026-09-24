import type { Plugin } from 'vite';
import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { apiHandler } from './src/server/app';

const backendApiPlugin = (): Plugin => ({
  name: 'backend-api-plugin',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      apiHandler(req, res, next);
    });
  },
});

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, 'chain/**'],
  },
  plugins: [react(), backendApiPlugin()],
  server: {
    port: 5173,
    host: true,
  },
});
