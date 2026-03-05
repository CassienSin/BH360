import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
  ],

  // Transformers.js uses dynamic imports for WASM — exclude from pre-bundling
  optimizeDeps: {
    exclude: ['@xenova/transformers'],
    // Force-include heavy deps so Vite pre-bundles them once, not on every request
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@emotion/react',
      '@emotion/styled',
      '@reduxjs/toolkit',
      'react-redux',
      '@tanstack/react-query',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage',
    ],
  },

  build: {
    // Target modern browsers — avoids legacy polyfill bloat
    target: 'esnext',

    // Skip compressed-size reporting (saves ~200 ms per build)
    reportCompressedSize: false,

    // Inline assets ≤ 8 kB as base64 (icons, tiny images)
    assetsInlineLimit: 8192,

    rollupOptions: {
      output: {
        manualChunks: {
          // ── Core React runtime ────────────────────────────────────────────
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // ── MUI core (theme, components, emotion) ─────────────────────────
          'mui-core': ['@mui/material', '@emotion/react', '@emotion/styled', '@emotion/cache'],

          // ── MUI icons (large, rarely changes) ────────────────────────────
          'mui-icons': ['@mui/icons-material'],

          // ── MUI X (data-grid, date-pickers, charts) ──────────────────────
          'mui-x': ['@mui/x-charts', '@mui/x-data-grid', '@mui/x-date-pickers'],

          // ── State + data-fetching ─────────────────────────────────────────
          'state': ['@reduxjs/toolkit', 'react-redux', '@tanstack/react-query'],

          // ── Firebase (split by service so unused services tree-shake) ─────
          'firebase-core': ['firebase/app', 'firebase/auth'],
          'firebase-db': ['firebase/firestore', 'firebase/storage'],

          // ── Charting ──────────────────────────────────────────────────────
          'charts': ['recharts'],

          // ── Utilities ─────────────────────────────────────────────────────
          'utils': ['axios', 'date-fns', 'react-hook-form', 'react-toastify', 'lucide-react'],

          // ── Map (lazy-loaded pages only) ──────────────────────────────────
          'maps': ['leaflet', 'react-leaflet'],

          // ── Heavy ML libraries (loaded on-demand by AI pages only) ────────
          'ml-transformers': ['@xenova/transformers'],
          'ml-tensorflow': ['@tensorflow/tfjs'],
        },
      },
    },

    // ML chunks are very large — raise the warning threshold accordingly
    chunkSizeWarningLimit: 3000,
  },
})
