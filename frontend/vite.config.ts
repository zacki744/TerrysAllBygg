/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },

  // In dev, proxy API calls to the .NET backend so you don't need CORS
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:7026",
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: "http://localhost:7026",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
  },

  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});