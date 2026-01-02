import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: 'public',  // ✅ Keeps this
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          clerk: ["@clerk/clerk-react"],
          stream: ["stream-chat-react"],
          ui: ["react-hot-toast"],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
    historyApiFallback: true,  // ✅ Added here
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
