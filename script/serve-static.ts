/**
 * Serves `dist/public` the way GitHub Pages does.
 *
 * The difference that matters is the fallback: Pages serves real files as-is
 * and hands everything else to `404.html`, which is the SPA shell. A plain
 * static server that rewrites unknown paths to `index.html` would let a broken
 * deep link pass locally and fail in production, so this mirrors the real
 * behaviour instead — including the base path, since a project site lives at
 * `https://<owner>.github.io/<repo>/` and the router reads that prefix.
 *
 *   npx tsx script/serve-static.ts [--port 4173] [--base /TraumaRecovery]
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..", "dist", "public");

function arg(name: string, fallback: string): string {
  const at = process.argv.indexOf(`--${name}`);
  return at > -1 && process.argv[at + 1] ? process.argv[at + 1]! : fallback;
}

const PORT = Number(arg("port", "4173"));
/** Normalised to a leading slash and no trailing one; "" serves from the root. */
const BASE = arg("base", "/TraumaRecovery").replace(/\/+$/, "");

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

if (!fs.existsSync(ROOT)) {
  console.error(`No build at ${ROOT}. Run \`npm run build:pages\` first.`);
  process.exit(1);
}

const server = http.createServer((req, res) => {
  let pathname: string;
  try {
    pathname = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
  } catch {
    res.writeHead(400).end("bad request");
    return;
  }

  if (BASE && !pathname.startsWith(BASE)) {
    res.writeHead(404).end("outside the base path");
    return;
  }
  const rest = BASE ? pathname.slice(BASE.length) || "/" : pathname;

  // Resolve inside ROOT and check afterwards, so `..` cannot escape it.
  let asset = path.resolve(ROOT, `.${rest}`);
  if (!asset.startsWith(ROOT)) {
    res.writeHead(403).end("forbidden");
    return;
  }
  if (fs.existsSync(asset) && fs.statSync(asset).isDirectory()) {
    asset = path.join(asset, "index.html");
  }

  const isFile = fs.existsSync(asset) && fs.statSync(asset).isFile();
  const file = isFile ? asset : path.join(ROOT, "404.html");
  if (!fs.existsSync(file)) {
    res.writeHead(404).end("not found");
    return;
  }

  res.writeHead(isFile ? 200 : 404, {
    "Content-Type": TYPES[path.extname(file)] ?? "application/octet-stream",
  });
  res.end(fs.readFileSync(file));
});

server.listen(PORT, () => {
  console.log(`serving ${ROOT} at http://localhost:${PORT}${BASE}/`);
});
