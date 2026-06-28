import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("recharts")) return "recharts";
          if (id.includes("@tanstack/react-router")) return "router";
          if (id.includes("@tanstack/react-query")) return "query";
          if (id.includes("react-dom") || id.includes("\\react\\") || id.includes("/react/"))
            return "react-core";
          return "vendor";
        },
      },
    },
  },
});
