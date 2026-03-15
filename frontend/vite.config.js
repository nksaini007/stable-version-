import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // Listen on all local IPs
    proxy: {
      // Forward /api requests to the backend server
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      // Forward /uploads requests to the backend server
      '/uploads': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      }
    }
  }
})
