import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss()
  ],
  server: {
    watch: {
      usePolling: true, // Bắt buộc Vite kiểm tra thay đổi file liên tục
    },
  },
})
