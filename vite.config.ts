import { defineConfig, Plugin } from 'vite';
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
  plugins: [react(), backendApiPlugin()],
  server: {
    port: 5173,
    host: true,
  },
});
