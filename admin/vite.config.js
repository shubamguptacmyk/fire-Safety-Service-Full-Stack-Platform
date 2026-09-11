import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        port: 5174,
    },
    build: {
        chunkSizeWarningLimit: 800,
        rollupOptions: {
            output: {
                manualChunks: {
                    "vendor-react": ["react", "react-dom", "react-router-dom"],
                    "vendor-charts": ["recharts"],
                    "vendor-motion": ["framer-motion"],
                    "vendor-icons": ["lucide-react"],
                    "vendor-query": ["@tanstack/react-query", "axios", "zustand"],
                },
            },
        },
    },
});
