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
  },
  build: {
    // Meningkatkan batas peringatan chunk menjadi 1000 kB (default 500 kB)
    chunkSizeWarningLimit: 1000, 
    // --- PENAMBAHAN UNTUK CODE SPLITTING VENDOR ---
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Memisahkan library node_modules ke dalam chunk 'vendor'
          if (id.includes('node_modules')) {
            // Pisahkan library besar tertentu untuk dimuat terpisah
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
    // --- AKHIR PENAMBAHAN ---
  },
}));