/**
 * Structural checks on the book content.
 *
 * The chapters are hand-authored TypeScript, so nothing but this script stops a
 * duplicate id (React key collisions in the sidebar), an out-of-sequence
 * `order` (chapter badges and PDF numbering disagree with reading order), or a
 * `chart:Name` placeholder that no component backs (silently renders nothing).
 */
import { readFile } from "fs/promises";
import { chapters } from "../client/src/lib/chapters/index";
import { buildManifestSource } from "./generate-manifest";
import { buildSearchIndexSource } from "./generate-search-index";

const CHART_SOURCE = new URL(
  "../client/src/components/trauma-charts.tsx",
  import.meta.url
);

const errors: string[] = [];
const warnings: string[] = [];

function check(condition: unknown, message: string) {
  if (!condition) errors.push(message);
}

const chartSource = await import("fs/promises").then((fs) =>
  fs.readFile(CHART_SOURCE, "utf-8")
);
const definedCharts = new Set(
  [...chartSource.matchAll(/^export function (\w+Chart)\b/gm)].map((m) => m[1])
);

const seenChapterIds = new Set<string>();
const seenChapterSlugs = new Set<string>();
const referencedCharts = new Set<string>();

chapters.forEach((chapter, index) => {
  const where = `chapter "${chapter.slug}"`;

  check(!seenChapterIds.has(chapter.id), `${where}: duplicate chapter id "${chapter.id}"`);
  seenChapterIds.add(chapter.id);

  check(!seenChapterSlugs.has(chapter.slug), `${where}: duplicate chapter slug`);
  seenChapterSlugs.add(chapter.slug);

  check(
    chapter.order === index + 1,
    `${where}: order is ${chapter.order} but it sits at position ${index + 1}; ` +
      `navigation follows array position while badges show order`
  );
  check(chapter.content.trimStart().startsWith("# "), `${where}: content has no H1`);
  check(chapter.title.trim().length > 0, `${where}: empty title`);
  check(chapter.description.trim().length > 0, `${where}: empty description`);
  check(/\d+\s*min read/.test(chapter.readingTime), `${where}: odd readingTime "${chapter.readingTime}"`);

  const seenSubIds = new Set<string>();
  const seenSubSlugs = new Set<string>();

  chapter.subchapters.forEach((sub, subIndex) => {
    const subWhere = `${where} / subchapter "${sub.slug}"`;

    check(!seenSubIds.has(sub.id), `${subWhere}: duplicate subchapter id "${sub.id}"`);
    seenSubIds.add(sub.id);

    check(!seenSubSlugs.has(sub.slug), `${subWhere}: duplicate subchapter slug`);
    seenSubSlugs.add(sub.slug);

    check(
      sub.order === subIndex + 1,
      `${subWhere}: order is ${sub.order} but it sits at position ${subIndex + 1}`
    );
    check(sub.content.trimStart().startsWith("# "), `${subWhere}: content has no H1`);
  });

  for (const source of [chapter.content, ...chapter.subchapters.map((s) => s.content)]) {
    for (const match of source.matchAll(/chart:(\w+)/g)) {
      referencedCharts.add(match[1]);
      check(
        definedCharts.has(match[1]),
        `${where}: references unknown chart "${match[1]}"`
      );
    }
  }
});

for (const chart of definedCharts) {
  if (!referencedCharts.has(chart)) {
    warnings.push(`chart "${chart}" is defined but never referenced by any chapter`);
  }
}

// The manifest is generated, and navigation reads it instead of the chapters.
// If it has drifted the site would render stale titles, so fail rather than warn.
const manifestPath = new URL(
  "../client/src/lib/chapters/manifest.ts",
  import.meta.url
);
const expected = await buildManifestSource();
const actual = await readFile(manifestPath, "utf-8").catch(() => "");
check(
  actual === expected,
  "manifest.ts is out of date with the chapter modules — run `npm run manifest`"
);

// Same for the search index: a stale one sends readers to headings that have
// been renamed or no longer exist.
const searchIndexPath = new URL(
  "../client/src/lib/search-index.json",
  import.meta.url
);
const expectedIndex = buildSearchIndexSource();
const actualIndex = await readFile(searchIndexPath, "utf-8").catch(() => "");
check(
  actualIndex === expectedIndex,
  "search-index.json is out of date with the chapter prose — run `npm run search-index`"
);

const subchapterCount = chapters.reduce((n, c) => n + c.subchapters.length, 0);
console.log(
  `${chapters.length} chapters, ${subchapterCount} subchapters, ` +
    `${referencedCharts.size}/${definedCharts.size} charts referenced`
);

for (const warning of warnings) console.warn(`warning: ${warning}`);

if (errors.length) {
  console.error(`\n${errors.length} content error(s):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log("content OK");
