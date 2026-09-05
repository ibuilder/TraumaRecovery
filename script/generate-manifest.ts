/**
 * Generates client/src/lib/chapters/manifest.ts from the chapter modules.
 *
 * The manifest holds only what navigation needs — titles, slugs, order, icons,
 * reading times — and none of the prose. Every navigation surface imports it
 * instead of the chapters themselves, so opening one chapter no longer pulls
 * the whole book into the entry bundle.
 *
 * Run `npm run manifest` after adding a chapter or changing its metadata.
 * `npm run validate:content` fails if it has drifted.
 */
import { writeFile, readdir } from "fs/promises";
import path from "path";
import { chapters } from "../client/src/lib/chapters/index";

const CHAPTERS_DIR = path.resolve(
  import.meta.dirname,
  "..",
  "client",
  "src",
  "lib",
  "chapters"
);
const OUT = path.join(CHAPTERS_DIR, "manifest.ts");

/** Maps each chapter to the module file it lives in, by matching on slug. */
async function moduleForSlug(): Promise<Map<string, string>> {
  const skip = new Set(["index.ts", "types.ts", "manifest.ts", "load.ts"]);
  const files = (await readdir(CHAPTERS_DIR)).filter(
    (f) => f.endsWith(".ts") && !skip.has(f)
  );
  const map = new Map<string, string>();
  for (const file of files) {
    const mod = await import(path.join(CHAPTERS_DIR, file));
    for (const value of Object.values(mod)) {
      if (value && typeof value === "object" && "slug" in (value as object)) {
        map.set((value as { slug: string }).slug, file.replace(/\.ts$/, ""));
      }
    }
  }
  return map;
}

export async function buildManifestSource(): Promise<string> {
  const modules = await moduleForSlug();
  const entries = chapters.map((c) => {
    const module = modules.get(c.slug);
    if (!module) throw new Error(`No module file found for chapter "${c.slug}"`);
    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      icon: c.icon,
      order: c.order,
      readingTime: c.readingTime,
      module,
      subchapters: c.subchapters.map((s) => ({
        id: s.id,
        slug: s.slug,
        title: s.title,
        order: s.order,
      })),
    };
  });

  return `// GENERATED FILE — do not edit by hand.
// Run \`npm run manifest\` to regenerate from the chapter modules.
//
// Navigation reads this instead of the chapters themselves, so the prose stays
// out of the entry bundle and loads only when a chapter is opened.
import type { ChapterMeta } from "./types";

export const chapterManifest: ChapterMeta[] = ${JSON.stringify(entries, null, 2)};
`;
}

if (import.meta.filename === process.argv[1]) {
  const source = await buildManifestSource();
  await writeFile(OUT, source, "utf-8");
  console.log(`wrote ${path.relative(process.cwd(), OUT)} (${chapters.length} chapters)`);
}
