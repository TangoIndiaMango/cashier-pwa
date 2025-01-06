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
      "id": "/pwa",
      "name": "Persianas Cashier",
      "short_name": "Persianas",
      "start_url": "/pwa/",
      "display": "standalone",
      "background_color": "#ffffff",
      "description": "A persianas retail app with offline support.",
      "icons": [
        {
          "src": "/pwa/pers-logo.svg",
          "sizes": "210x89",
          "type": "image/svg+xml",
          "purpose": "any"
        },
        {
          "src": "/pwa/pers-logo.svg",
          "sizes": "210x89",
          "type": "image/svg+xml",
          "purpose": "any"
        },
        {
          "src": "/pwa/pers-logo.svg",
          "sizes": "210x89",
          "type": "image/svg+xml",
          "purpose": "any"
        },
        {
          "src": "/pwa/pwa-square.webp",
          "sizes": "144x63",
        },
        {
          "src": "/pwa/pwa-512.png",
          "sizes": "512x512",
          "type": "image/png",
          "purpose": "maskable"
        },
        {
          "src": "/pwa/pwa-square-2.webp",
          "sizes": "144x144",
          "type": "image/webp",
          "purpose": "any"
        }
      ],
      "theme_color": "#2F3F9E",
      "orientation": "portrait",
      "lang": "en-US",
      "dir": "ltr",
      "screenshots": [
        {
          "src": "/pwa/screenshots/cashier.jpg",
          "sizes": "3044x1698",
          "type": "image/png",
          "form_factor": "narrow"
        },
        {
          "src": "/pwa/screenshots/auth-bg.svg",
          "sizes": "704x1024",
          "type": "image/png",
          "form_factor": "wide"
        }
      ],
      "related_applications": [
        {
          "platform": "web",
          "url": "https://prlerp.com/",
          // id?: string;
        }
      ]
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
  // esbuild:{
  //   drop: ['console', 'debugger'],
  // }
});
