import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/satisfactory-production-optimizer/",
  plugins: [
    react(),
    VitePWA({
      injectRegister: "auto",
      manifest: { theme_color: "#ffffff" },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
