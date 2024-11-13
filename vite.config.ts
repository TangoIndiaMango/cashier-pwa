import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from "path"
// https://vite.dev/config/

export default defineConfig({
  plugins: [react(),
  VitePWA({
    registerType: 'autoUpdate',
    workbox: {
      globPatterns: ['**/*.{js,ts,css,html,ico,png,svg}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\./i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'pos-cache',
            networkTimeoutSeconds: 10,
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    },
    manifest: {
      id: '/pos-app',
      name: 'My POS App',
      short_name: 'POS',
      start_url: '.',
      display: 'standalone',
      background_color: '#ffffff',
      description: 'A point-of-sale app with offline support.',
      icons: [
        {
          src: '/icons/settings.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icons/computer.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
      theme_color: '#2196f3',
      orientation: 'portrait',
      lang: 'en-US',
      dir: 'ltr',
      screenshots: [{
        src: "/screenshots/cashier.jpg",
        sizes: "1080x1920",
        type: "image/png",
        form_factor: 'narrow',
      },
      {
        src: "/screenshots/pos.jpg",
        sizes: "1080x1920",
        type: "image/png",
        form_factor: 'wide',
      }]
    },
  })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: ['src/help/**/*'],
    }
  }
})
