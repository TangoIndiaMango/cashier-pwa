import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// const isProduction = process.env.NODE_ENV === "production";
// const base = isProduction ? "/pwa/" : "/";

export default defineConfig({
  // base: '/pwa/',
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
      name: 'Persianas Cashier',
      short_name: 'Persianas',
      start_url: '.',
      display: 'standalone',
      background_color: '#ffffff',
      description: 'A persianas retail app with offline support.',
      icons: [
        {
          src: '/icons/settings.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/pers-logo.svg',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: '/pers-logo.svg',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        }
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
        src: "/screenshots/auth-bg.svg",
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
      external: ["src/help/**/*"],
    },
  },
});
