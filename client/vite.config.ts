import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: false,
      includeAssets: ["favicon.svg", "robots.txt"],
      workbox: {
        // Only precache static app-shell assets — account/order data must
        // never be served from an offline cache (spec section 43).
        globPatterns: ["**/*.{js,css,html,svg,png,ico,webmanifest}"],
        navigateFallbackDenylist: [/^\/account/, /^\/orders/, /^\/checkout/],
      },
    }),
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: { host: true, port: 5173 },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-icons": ["lucide-react"],
          "vendor-i18n": ["i18next", "react-i18next"],
        },
      },
    },
  },
});
