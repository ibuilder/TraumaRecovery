import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// GitHub Pages serves project sites from /<repo>/, so the asset base has to be
// injected at build time. Defaults to "/" for local dev and any root deployment.
const base = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // Recharts, the markdown pipeline, jsPDF and every chapter's prose are
    // reached only through dynamic imports, so the bundler splits them out on
    // its own. Grouping them by hand would pull them back into the entry graph
    // and get them preloaded. Only the framework is worth pinning: it is shared
    // by every route and always needed.
    // (Vite 8 bundles with Rolldown, whose `advancedChunks.groups` replaces
    // Rollup's object-form `manualChunks`.)
    rollupOptions: {
      output: {
        advancedChunks: {
          groups: [
            {
              name: "react",
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|wouter)[\\/]/,
            },
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
