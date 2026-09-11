import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt"],
      manifest: {
        name: "AK Fire Safety Service",
        short_name: "AK Fire Safety",
        description: "Fire safety products, AMC and inspection services in Navi Mumbai",
        theme_color: "#1B1F22",
        background_color: "#F0EEE7",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        // Only precache static app-shell assets — account/order data must
        // never be served from an offline cache (spec section 43).
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        navigateFallbackDenylist: [/^\/account/, /^\/orders/, /^\/checkout/],
      },
    }),
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: { port: 5173 },
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
