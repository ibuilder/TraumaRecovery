import type { Chapter } from "./types";
import { chapterManifest } from "./manifest";

/**
 * One lazy loader per chapter module. Vite turns each into its own chunk, so a
 * reader downloads the chapter they opened and nothing else.
 */
const loaders = import.meta.glob<Record<string, unknown>>([
  "./*.ts",
  "!./index.ts",
  "!./types.ts",
  "!./manifest.ts",
  "!./load.ts",
]);

const cache = new Map<string, Promise<Chapter | null>>();

async function importChapter(slug: string): Promise<Chapter | null> {
  const meta = chapterManifest.find((c) => c.slug === slug);
  if (!meta) return null;

  const load = loaders[`./${meta.module}.ts`];
  if (!load) return null;

  const mod = await load();
  // Each module has a single chapter export; match on slug so a manifest that
  // has drifted fails loudly rather than rendering the wrong chapter.
  const chapter = Object.values(mod).find(
    (v): v is Chapter =>
      !!v && typeof v === "object" && (v as Chapter).slug === slug
  );
  return chapter ?? null;
}

/** Loads one chapter's full content, caching the promise so remounts are free. */
export function loadChapter(slug: string): Promise<Chapter | null> {
  let pending = cache.get(slug);
  if (!pending) {
    pending = importChapter(slug);
    cache.set(slug, pending);
  }
  return pending;
}

/** Loads every chapter. Only the PDF export needs this. */
export async function loadAllChapters(): Promise<Chapter[]> {
  const all = await Promise.all(chapterManifest.map((c) => loadChapter(c.slug)));
  return all.filter((c): c is Chapter => c !== null);
}
