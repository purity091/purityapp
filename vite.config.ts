import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  envDir: '.private',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/.test(id)) return 'react-vendor';
          if (/[\\/]node_modules[\\/]@supabase[\\/]supabase-js[\\/]/.test(id)) return 'supabase-vendor';
          if (/[\\/]node_modules[\\/]framer-motion[\\/]/.test(id)) return 'motion-vendor';
          if (/[\\/]node_modules[\\/](leaflet|react-leaflet)[\\/]/.test(id)) return 'map-vendor';
          return undefined;
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png'],
      manifest: {
        name: 'Purity Home Services',
        short_name: 'Purity',
        id: '/',
        description: 'Book trusted home cleaning services in Dubai.',
        theme_color: '#0f766e',
        background_color: '#ffffff',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone'],
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/logo.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,woff2}'],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
