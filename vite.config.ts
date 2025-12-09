import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // base: mode === "production" ? "/namarepoanda/" : "/", // Opsional: Hapus jika tidak perlu sub-path
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
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
          // Tambahan: Cache untuk aset gambar/statis lokal
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
          // Cache untuk Google Fonts (sudah ada)
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
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Penambahan: Mengatur ekstensi file yang diimpor
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'], 
  },
  build: {
    // Meningkatkan batas peringatan chunk menjadi 1000 kB (default 500 kB)
    chunkSizeWarningLimit: 1000, 
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Memisahkan library Inti (React)
            if (id.includes('/react') || id.includes('/react-dom')) {
              return 'vendor-react';
            }
            // Memisahkan library besar tertentu
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('@tanstack')) {
              return 'vendor-tanstack';
            }
            // Kembalikan sisa library node_modules ke chunk vendor umum
            return 'vendor';
          }
        },
      },
    },
  },
}));