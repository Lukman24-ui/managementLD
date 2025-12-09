import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Membersihkan penggunaan filter(Boolean)
    mode === "development" ? componentTagger() : null, 
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "icons/*.png"],
      manifest: {
        name: "CoupleSync",
        short_name: "CoupleSync",
        description: "Track money, habits, fitness, mood, and relationship goals together",
        theme_color: "#31C6D4",
        background_color: "#0F1419",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable any",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable any",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
    }),
  ].filter(Boolean), // ✅ Perbaikan: Tetap gunakan filter(Boolean) untuk membersihkan null
  build: {
    // ✅ PERBAIKAN: Konfigurasi Code Splitting untuk mengurangi ukuran chunk
    rollupOptions: {
        output: {
            manualChunks(id) {
                // Kelompokkan library besar yang sering digunakan
                if (id.includes('node_modules')) {
                    // Pisahkan vendor inti
                    if (id.includes('react') || id.includes('zod')) {
                        return 'vendor-core';
                    }
                    // Pisahkan Supabase dan date-fns ke chunk terpisah
                    if (id.includes('@supabase') || id.includes('date-fns')) {
                        return 'vendor-supabase-util';
                    }
                    // Sisanya masuk ke vendor
                    return 'vendor';
                }
            },
        },
        // Opsional: Menaikkan batas peringatan ukuran chunk (Misalnya 1500kB)
        chunkSizeWarningLimit: 1500,
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));