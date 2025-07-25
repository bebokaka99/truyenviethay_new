// frontend/vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "TruyenVietHay",
        short_name: "TVH",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#42b983",
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]

      }

    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // Cho phép truy cập qua IP
    port: 5173, // Hoặc cổng em muốn
    proxy: {
      // Proxy cho auth
      "/api/auth": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr, // Giữ nguyên đường dẫn
      },

      // Proxy cho stories
      "/api/truyen": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr, // Giữ nguyên đường dẫn
      },

      // Proxy cho category
      "/api/theloai": { // Match '/api/theloai' và '/api/theloai/'
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr, // Giữ nguyên đường dẫn
      },
      "/api/chuong": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr,
      },
      "/api/upload-truyen": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr,
      },
      "/api/upload-files": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr,
      },
      "/api/history": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr,
      },
      "/api/comments": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr,
      },
      "/api/follow": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr,
      },
      "/api/like": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr,
      },
      // user level
      "/api/levels": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr,
      },
      "/api/levels/history": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr,
      },
      "/api/points": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr,
      },
      "/api/tasks": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr,
      },
      "/api/rewards": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr,
      },
      "/api/user-rewards": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr,
      },
      "/api/ratings": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr,
      },
    },
  },
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});