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
    // Recharts, jsPDF and html2canvas are the bulk of the bundle; splitting them
    // out keeps the first paint of a chapter from waiting on the PDF toolchain.
    // Vite 8 bundles with Rolldown, whose `advancedChunks.groups` replaces
    // Rollup's object-form `manualChunks`.
    rollupOptions: {
      output: {
        advancedChunks: {
          groups: [
            { name: "charts", test: /[\\/]node_modules[\\/](recharts|d3-[^/\\]+|victory-vendor)[\\/]/ },
            { name: "markdown", test: /[\\/]node_modules[\\/](react-markdown|remark-.*|rehype-.*|mdast-.*|micromark.*|unist-.*|hast-.*|vfile.*|unified)[\\/]/ },
            { name: "react", test: /[\\/]node_modules[\\/](react|react-dom|scheduler|wouter)[\\/]/ },
          ],
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
