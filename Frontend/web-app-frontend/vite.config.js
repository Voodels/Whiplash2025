import { defineConfig } from 'vite'
import react from "@vitejs/plugin-react"

import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0', // Allow external connections
    port: 5173,
    cors: true, // Enable CORS
    proxy: {
      // Proxy API requests to the backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})