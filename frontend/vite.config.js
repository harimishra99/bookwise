/**
 * Vite Configuration for BookWise
 * =================================
 * - React plugin for JSX support
 * - PWA plugin for installable web app (Android Play Store via TWA)
 * - Path aliases for cleaner imports
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),

    // ── PWA Configuration ──────────────────────────────────────────
    // This makes BookWise installable as a web app.
    // For Play Store: Use PWABuilder or Bubblewrap to wrap as TWA (Trusted Web Activity)
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'BookSuggestion — Book Discovery',
        short_name: 'BookSuggestion',
        description: 'Discover your next favourite book. Personalized recommendations, trending books, and more.',
        theme_color: '#1a1a2e',
        background_color: '#ffffff',
        display: 'standalone',        // Makes it feel like a native app
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        categories: ['books', 'education', 'lifestyle'],
        screenshots: [
          {
            src: '/screenshots/mobile-home.png',
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow',
          },
        ],
      },
      workbox: {
        // Cache strategy: network first for API calls, cache first for static assets
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/covers\.openlibrary\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'book-covers',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\/api\/v1\/books\/trending\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'trending-books',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
            },
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: {
      // Use @/ for clean imports e.g. import Button from '@/components/ui/Button'
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173,
    // Proxy API calls to Django in development (avoids CORS issues)
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
