// Not `lib/chapters` — that file shadows the directory and exports the
// manifest, which is metadata with no prose in it. `chapters/index.ts` is the
// eager list the app deliberately stopped using, and it is the right one here:
// nothing is being shipped to a browser, and a test that walked the lazy
// loader would be testing the loader rather than the content.
import { chapters } from "../../client/src/lib/chapters/index";

/** The markdown a given route renders, or null if the route renders none. */
export function contentForRoute(path: string): string | null {
  const sub = /^\/chapter\/([^/]+)\/subchapter\/([^/]+)$/.exec(path);
  if (sub) {
    const chapter = chapters.find((c) => c.slug === sub[1]);
    return chapter?.subchapters.find((s) => s.slug === sub[2])?.content ?? null;
  }
  const top = /^\/chapter\/([^/]+)$/.exec(path);
  if (top) return chapters.find((c) => c.slug === top[1])?.content ?? null;
  return null;
}

/** How many figures a piece of markdown should render. */
export function figureCount(markdown: string): number {
  return [...markdown.matchAll(/^```chart:\w+/gm)].length;
}
