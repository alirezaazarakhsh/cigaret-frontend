import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { getPosSessionsRealtimeHub } from './src/server/posSessionsWs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'pos-sessions-realtime-ws',
      configureServer(server) {
        const hub = getPosSessionsRealtimeHub();
        if (server.httpServer) {
          hub.attachToServer(server.httpServer as any);
        }
        server.middlewares.use((req, res, next) => {
          hub.handleHttpRequest(req, res, next);
        });
      },
      configurePreviewServer(server) {
        const hub = getPosSessionsRealtimeHub();
        if (server.httpServer) {
          hub.attachToServer(server.httpServer as any);
        }
        server.middlewares.use((req, res, next) => {
          hub.handleHttpRequest(req, res, next);
        });
      },
    }
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: false
  },
  resolve: {
    alias: {
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom')
    },
    dedupe: ['react', 'react-dom']
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react', 'axios']
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-icons': ['lucide-react'],
          'vendor-charts': ['recharts'],
          'vendor-utils': ['axios', 'jspdf']
        }
      }
    }
  }
});
