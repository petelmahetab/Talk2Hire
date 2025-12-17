import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    chunkSizeWarningLimit: 2000, // remove 500kb warnings
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
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  publicDir: 'public',

});
