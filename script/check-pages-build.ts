/**
 * Checks that a Pages build is actually servable before it is deployed.
 *
 * The failure this exists for is silent and total: build without
 * `VITE_BASE_PATH` and every asset URL comes out as `/assets/…` instead of
 * `/traumarecovery/assets/…`. The build succeeds, the HTML is valid, the files
 * are all there — and the deployed site is a blank white page, because the
 * browser asks the origin for a path Pages does not serve. Nothing in the build
 * log says a word about it.
 *
 *   npm run check:pages [--base /traumarecovery/]
 */
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import path from "path";

const OUT = path.resolve(import.meta.dirname, "..", "dist", "public");

interface Finding {
  ok: boolean;
  label: string;
  detail: string;
}
const findings: Finding[] = [];
const pass = (label: string, detail: string) => findings.push({ ok: true, label, detail });
const fail = (label: string, detail: string) => findings.push({ ok: false, label, detail });

function normalizeBase(value: string | undefined): string {
  if (!value || value === "/") return "/";
  return `/${value.replace(/^\/+|\/+$/g, "")}/`;
}

function main() {
  const flag = process.argv.indexOf("--base");
  const base = normalizeBase(flag === -1 ? process.env.VITE_BASE_PATH : process.argv[flag + 1]);

  if (!existsSync(OUT)) {
    console.error(`No build at ${OUT}. Run \`npm run build:pages\` first.`);
    process.exit(2);
  }

  const indexPath = path.join(OUT, "index.html");
  if (!existsSync(indexPath)) {
    console.error("dist/public/index.html is missing — the build did not finish.");
    process.exit(1);
  }
  const index = readFileSync(indexPath, "utf8");

  // Pages has no server: an unknown path is answered with 404.html, so that
  // file is what makes a deep link or a refresh work at all.
  for (const required of ["404.html", ".nojekyll"]) {
    if (existsSync(path.join(OUT, required))) pass("Required file", required);
    else fail("Required file", `${required} is missing — deep links would 404`);
  }

  if (existsSync(path.join(OUT, "404.html"))) {
    const notFound = readFileSync(path.join(OUT, "404.html"), "utf8");
    if (notFound === index) pass("404 fallback", "carries the SPA shell");
    else fail("404 fallback", "404.html differs from index.html; the router will not pick it up");
  }

  // The check this script exists for.
  const refs = [...index.matchAll(/(?:src|href)="(\/[^"]+)"/g)].map((m) => m[1]!);
  const assetRefs = refs.filter((r) => /\.(js|css)$/.test(r));
  if (assetRefs.length === 0) {
    fail("Asset references", "index.html references no script or stylesheet at all");
  } else {
    const wrongBase = assetRefs.filter((r) => !r.startsWith(base));
    if (wrongBase.length === 0) {
      pass("Base path", `all ${assetRefs.length} asset URLs start with "${base}"`);
    } else {
      fail(
        "Base path",
        `${wrongBase.length} asset URL(s) do not start with "${base}", first ${wrongBase[0]} — ` +
          `the deployed site would render blank. Build with VITE_BASE_PATH=${base}`
      );
    }

    // A reference that resolves to nothing on disk is the same blank page by a
    // different route.
    const missing = assetRefs.filter(
      (r) => !existsSync(path.join(OUT, r.slice(base.length)))
    );
    if (missing.length === 0) pass("Asset references", `all ${assetRefs.length} resolve on disk`);
    else fail("Asset references", `${missing.length} point at missing files, first ${missing[0]}`);
  }

  const assetDir = path.join(OUT, "assets");
  if (existsSync(assetDir)) {
    const chunks = readdirSync(assetDir).filter((f) => f.endsWith(".js"));
    const empty = chunks.filter((f) => statSync(path.join(assetDir, f)).size === 0);
    if (chunks.length < 10) fail("Chunks", `only ${chunks.length} JS chunks; the book is split per chapter`);
    else if (empty.length) fail("Chunks", `${empty.length} are zero bytes, first ${empty[0]}`);
    else pass("Chunks", `${chunks.length} JS chunks, none empty`);
  } else {
    fail("Chunks", "dist/public/assets is missing");
  }

  const width = Math.max(...findings.map((f) => f.label.length));
  console.log(`\nPages build — ${OUT} (base "${base}")\n`);
  for (const f of findings) {
    console.log(`[${f.ok ? "  ok  " : " FAIL "}] ${f.label.padEnd(width)}  ${f.detail}`);
  }
  const failed = findings.filter((f) => !f.ok);
  console.log(`\n${findings.length - failed.length} passed, ${failed.length} failed\n`);
  process.exit(failed.length ? 1 : 0);
}

main();
