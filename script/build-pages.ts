/**
 * Static build for GitHub Pages.
 *
 * Pages has no server, so the SPA needs three things the Express build gives it
 * for free: a base path baked into the asset URLs, a 404.html that hands deep
 * links back to the SPA router, and a .nojekyll marker so Pages does not strip
 * files and directories that start with an underscore.
 */
import { build as viteBuild } from "vite";
import { copyFile, mkdir, rm, writeFile } from "fs/promises";
import path from "path";

const OUT_DIR = path.resolve(import.meta.dirname, "..", "dist", "public");

function normalizeBase(value: string | undefined): string {
  if (!value || value === "/") return "/";
  return `/${value.replace(/^\/+|\/+$/g, "")}/`;
}

async function buildPages() {
  const base = normalizeBase(process.env.VITE_BASE_PATH);
  process.env.VITE_BASE_PATH = base;
  process.env.NODE_ENV = "production";

  console.log(`building static site with base "${base}"...`);
  await rm(OUT_DIR, { recursive: true, force: true });
  await viteBuild();

  await mkdir(OUT_DIR, { recursive: true });
  // GitHub Pages serves 404.html for any unknown path; serving the SPA shell
  // there makes /chapter/<slug> deep links and refreshes work.
  await copyFile(path.join(OUT_DIR, "index.html"), path.join(OUT_DIR, "404.html"));
  await writeFile(path.join(OUT_DIR, ".nojekyll"), "");

  console.log(`static site ready in ${OUT_DIR}`);
}

buildPages().catch((err) => {
  console.error(err);
  process.exit(1);
});
