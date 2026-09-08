import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import itinerary from './api/itinerary';
import subscribe from './api/subscribe';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  return {
  plugins: [react(), {
    name: 'traveling-api',
    configureServer(server) {
      server.middlewares.use('/api/itinerary', (req, res) => { void itinerary(req, res); });
      server.middlewares.use('/api/subscribe', (req, res) => { void subscribe(req, res); });
    },
  }],
  server: {
    port: 5173,
    host: '127.0.0.1',
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-three': ['three'],
          'vendor-gsap': ['gsap'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
}; });
