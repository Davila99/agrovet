import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Escuchar en todas las interfaces
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // Necesario para Docker en Windows/Mac
      interval: 300, // Poll cada 300ms para mejor rendimiento
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
    },
    hmr: {
      host: 'localhost', // Host para HMR (el navegador se conecta aquí)
      port: 5173,
      clientPort: 5173, // Puerto del cliente HMR
      protocol: 'ws',
      overlay: true, // Mostrar errores en overlay
    },
    fs: {
      strict: false, // Permitir servir archivos fuera de la raíz
    },
  },
  // Optimizar para desarrollo
  optimizeDeps: {
    exclude: [],
  },
  // Mejorar hot-reload
  build: {
    watch: {},
  },
})
