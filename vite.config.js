import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-core': ['@mui/material', '@emotion/react', '@emotion/styled'],
          'mui-icons': ['@mui/icons-material'],
          'mui-x': ['@mui/x-charts', '@mui/x-data-grid', '@mui/x-date-pickers'],
          'state-management': ['@reduxjs/toolkit', 'react-redux', '@tanstack/react-query'],
          'utils': ['axios', 'date-fns', 'react-hook-form', 'react-toastify'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
