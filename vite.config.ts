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
    // Only run componentTagger in development mode
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
            // Cache rule for local images/assets
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
            // Cache rule for Google Fonts (existing)
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
      // CRITICAL FIX: Force all modules to use the same React/React-DOM instance
      // This prevents the 'forwardRef' dependency conflict error.
      'react': path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
    },
    // Ensure common extensions are included
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },
    // --- Rollup/Code Splitting Optimization ---
  build: {
    chunkSizeWarningLimit: 1000, 
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
                // IMPORTANT: We DO NOT explicitly split react/react-dom here.
                // It falls back to 'vendor' chunk, ensuring all core UI libraries load together.

            // Split Supabase (large library)
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            // Split other large libraries (e.g., TanStack/React Query)
            if (id.includes('@tanstack')) {
              return 'vendor-tanstack';
            }
            // Return remaining libraries (including core React) to the common vendor chunk
            return 'vendor'; 
          }
        },
      },
    },
  },
}));