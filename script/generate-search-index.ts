/**
 * Generates client/src/lib/search-index.json from the chapter prose.
 *
 * The book is ~119,000 words across 90 routes; without search the only way to
 * find "wise mind" or "urge surfing" is to remember which chapter it was in.
 *
 * One entry per section — a chapter or subchapter opener, then each `##` and
 * `###` heading inside it — so a result lands the reader on the paragraph they
 * were looking for rather than at the top of a 12,000-word page. The excerpt is
 * capped so the whole index stays small enough to fetch in one go; it is loaded
 * lazily when the palette first opens, never in the entry bundle.
 *
 * Run `npm run search-index` after editing chapter prose.
 * `npm run validate:content` fails if it has drifted.
 */
import { writeFile } from "fs/promises";
import path from "path";
import { chapters } from "../client/src/lib/chapters/index";

const OUT = path.resolve(
  import.meta.dirname,
  "..",
  "client",
  "src",
  "lib",
  "search-index.json"
);

/** Matches the ids the markdown renderer puts on headings. */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export interface SearchEntry {
  /** Section heading, or the page title for an opener. */
  title: string;
  /** Where the section sits — "Chapter 9 · Distress Tolerance". */
  context: string;
  /** Route, with a #heading fragment for anything below the opener. */
  url: string;
  /** Plain-text excerpt, used both for matching and for the result line. */
  text: string;
}

/** Strips the markup that would otherwise show up in an excerpt. */
function toPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^\s*\|.*$/gm, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const EXCERPT = 260;

/** Splits one page's markdown into its opener and each `##`/`###` section. */
function sectionsOf(markdown: string): { heading: string | null; body: string }[] {
  const out: { heading: string | null; body: string }[] = [];
  let heading: string | null = null;
  let body: string[] = [];
  let inFence = false;

  const push = () => {
    const text = toPlainText(body.join("\n"));
    if (heading !== null || text) out.push({ heading, body: text });
  };

  for (const line of markdown.split("\n")) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    const m = !inFence && /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (m) {
      push();
      heading = toPlainText(m[2]);
      body = [];
      continue;
    }
    // The `# ` title is the page's own, already carried by the opener entry.
    if (!inFence && /^#\s/.test(line)) continue;
    body.push(line);
  }
  push();
  return out;
}

export function buildSearchIndex(): SearchEntry[] {
  const entries: SearchEntry[] = [];

  const addPage = (
    title: string,
    context: string,
    url: string,
    markdown: string
  ) => {
    // Repeated headings on one page get -2, -3, matching how the renderer
    // disambiguates the ids it emits.
    const seen = new Map<string, number>();
    for (const section of sectionsOf(markdown)) {
      const isOpener = section.heading === null;
      if (isOpener && !section.body) continue;
      let anchor = "";
      if (!isOpener) {
        const base = slugifyHeading(section.heading!);
        const n = (seen.get(base) ?? 0) + 1;
        seen.set(base, n);
        anchor = `#${n === 1 ? base : `${base}-${n}`}`;
      }
      entries.push({
        title: isOpener ? title : section.heading!,
        context: isOpener ? context : `${context} · ${title}`,
        url: `${url}${anchor}`,
        text: section.body.slice(0, EXCERPT),
      });
    }
  };

  for (const chapter of chapters) {
    const label = `Chapter ${chapter.order}`;
    addPage(chapter.title, label, `/chapter/${chapter.slug}`, chapter.content);
    for (const sub of chapter.subchapters) {
      addPage(
        sub.title,
        `${label} · ${chapter.title}`,
        `/chapter/${chapter.slug}/subchapter/${sub.slug}`,
        sub.content
      );
    }
  }

  return entries;
}

export function buildSearchIndexSource(): string {
  return JSON.stringify(buildSearchIndex()) + "\n";
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const source = buildSearchIndexSource();
  await writeFile(OUT, source, "utf-8");
  const kb = (Buffer.byteLength(source) / 1024).toFixed(0);
  console.log(`wrote ${OUT} (${JSON.parse(source).length} entries, ${kb} kB)`);
}
