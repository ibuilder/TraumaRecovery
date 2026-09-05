import { expect, test } from "@playwright/test";
import {
  bodyItems,
  countEmbeddedFontPrograms,
  downloadBook,
  layoutConstants,
  readBook,
  type BookPage,
} from "./helpers/book";

/**
 * The typeset invariants of the printed book.
 *
 * These exist because a clean text layer is not a clean book. Every defect
 * worth catching here — charts screenshotted mid-animation, headings stranded
 * at the foot of a page, folios two out from the page they were printed on —
 * extracted perfectly and was visibly wrong on paper. Each check below is a
 * bug that shipped.
 *
 * The book is generated once and every test reads the same copy.
 */
test.describe.configure({ mode: "serial" });

const LAYOUT = layoutConstants();

let pages: BookPage[];
let outline: number;
let embeddedFontPrograms: number;
let lowestImageDpi: number;

test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  const bytes = await downloadBook(page);
  embeddedFontPrograms = countEmbeddedFontPrograms(bytes);
  ({ pages, outline, lowestImageDpi } = await readBook(bytes));
  await page.close();
});

/** The running head, which openers and front matter deliberately lack. */
function hasRunningHead(page: BookPage): boolean {
  return page.items.some(
    (i) => Math.abs(i.size - 8) < 0.01 && Math.abs(i.y - LAYOUT.headerBaseline) < 0.5
  );
}

/** An opener carries its chapter number as an eyebrow above the title. */
function isChapterOpener(page: BookPage): boolean {
  return page.items.some((i) => /^CHAPTER \d+$/.test(i.text) && i.y < 80);
}

function body(page: BookPage) {
  return bodyItems(page, LAYOUT.textTop, LAYOUT.pageFloor);
}

test("the book is a whole book", () => {
  // A guard against the export silently truncating, not a target to hit.
  expect(pages.length).toBeGreaterThan(600);
  expect(outline, "PDF bookmarks, one per chapter").toBeGreaterThan(10);
});

test("every folio matches the page it is printed on", () => {
  const wrong: string[] = [];
  for (const page of pages) {
    const folio = page.items.find(
      (i) => Math.abs(i.y - LAYOUT.folioBaseline) < 0.6 && /^\d+$/.test(i.text)
    );
    if (folio && Number(folio.text) !== page.number) {
      wrong.push(`page ${page.number} is numbered ${folio.text}`);
    }
  }
  // The front matter is reserved and filled afterwards; get the arithmetic
  // wrong and every folio in the book is out by the same amount.
  expect(wrong).toEqual([]);
});

test("no heading is left stranded at the foot of a page", () => {
  const stranded: string[] = [];
  for (const page of pages) {
    // A heading followed by a figure is not stranded — the figure is under it.
    if (page.hasImage) continue;
    const items = body(page);
    const last = items[items.length - 1];
    if (last && last.size >= 13 && last.size <= 24) {
      stranded.push(`page ${page.number}: "${last.text.slice(0, 40)}"`);
    }
  }
  expect(stranded).toEqual([]);
});

test("the measure stays inside the range a book is read at", () => {
  const lengths = pages
    .flatMap((p) => p.items)
    .filter((i) => Math.abs(i.size - LAYOUT.bodySize) < 0.01 && i.text.length > 40)
    .map((i) => i.text.length)
    .sort((a, b) => a - b);

  expect(lengths.length).toBeGreaterThan(1000);
  const median = lengths[Math.floor(lengths.length / 2)]!;
  const p90 = lengths[Math.floor(lengths.length * 0.9)]!;

  // The book was set at a median of 102 characters, half again the length an
  // eye tracks back from without losing its place. Narrow enough is the point;
  // the ceiling is what regresses if someone widens the text block.
  expect(median, "median characters per line").toBeLessThanOrEqual(82);
  expect(median, "median characters per line").toBeGreaterThanOrEqual(60);
  expect(p90, "90th percentile characters per line").toBeLessThanOrEqual(90);
});

test("nothing is set outside the text block", () => {
  const strays: string[] = [];
  for (const page of pages) {
    for (const item of page.items) {
      const inHeader = Math.abs(item.y - LAYOUT.headerBaseline) < 1;
      const inFolio = Math.abs(item.y - LAYOUT.folioBaseline) < 1;
      if (inHeader || inFolio) continue;
      if (item.y < LAYOUT.textTop - 1 || item.y > LAYOUT.pageFloor + 2) {
        strays.push(
          `page ${page.number} at ${item.y.toFixed(1)}mm: "${item.text.slice(0, 30)}"`
        );
      }
    }
  }
  // The cover and the chapter openers sit on their own grid.
  expect(strays.filter((s) => !/page (1|2) /.test(s)).slice(0, 5)).toEqual([]);
});

test("chapter openers announce themselves", () => {
  const openers = pages.filter(isChapterOpener);
  expect(openers.length, "one opener per chapter").toBe(14);
  for (const opener of openers) {
    // A strap repeating the chapter title above the title is the mark of a
    // page produced by a loop rather than laid out.
    expect(hasRunningHead(opener), `page ${opener.number} carries a running head`).toBe(
      false
    );
  }
});

test("the contents and the list of figures point at the right pages", () => {
  const findList = (heading: string) => {
    const start = pages.findIndex((p) => p.items.some((i) => i.text === heading));
    expect(start, `"${heading}" is missing from the front matter`).toBeGreaterThan(-1);
    const entries: Array<{ label: string; page: number }> = [];
    for (let n = start; n < pages.length; n++) {
      // A front-matter list runs until the body starts. That is not simply the
      // next page with a running head — a chapter opener deliberately has
      // none, so the first opener has to end it too.
      if (n > start && (hasRunningHead(pages[n]!) || isChapterOpener(pages[n]!))) break;
      const items = pages[n]!.items;
      for (let i = 0; i < items.length - 1; i++) {
        if (/^\d+$/.test(items[i + 1]!.text) && !/^\d+$/.test(items[i]!.text)) {
          entries.push({ label: items[i]!.text, page: Number(items[i + 1]!.text) });
        }
      }
    }
    return entries;
  };

  const contents = findList("TABLE OF CONTENTS").filter((e) => /^\d+\.\s/.test(e.label));
  expect(contents.length, "chapter entries in the contents").toBe(14);
  for (const entry of contents) {
    const title = entry.label.replace(/^\d+\.\s+/, "");
    const target = pages.find((p) => p.number === entry.page);
    expect(
      target,
      `contents points at page ${entry.page}, which does not exist`
    ).toBeTruthy();
    const opener = target!.items.filter((i) => i.size > 18).map((i) => i.text.trim());
    expect(
      opener.some((line) => line && title.startsWith(line.slice(0, 12))),
      `"${entry.label}" points at page ${entry.page}, which opens with ${JSON.stringify(opener)}`
    ).toBe(true);
  }

  const figures = findList("LIST OF FIGURES");
  expect(figures.length, "entries in the list of figures").toBeGreaterThan(50);
  for (const entry of figures) {
    const target = pages.find((p) => p.number === entry.page);
    expect(
      target?.hasImage,
      `"${entry.label}" points at page ${entry.page}, which carries no figure`
    ).toBe(true);
  }
});

test("the references are gathered at the back, not scattered through the book", () => {
  const inline = pages.filter((p) =>
    p.items.some((i) => i.text.trim() === "References" && i.size >= 13)
  );
  // Eighty-five inline reference sections used to interrupt the reader.
  expect(inline.map((p) => p.number)).toEqual([]);

  // Its own running head, or its title on the opening page — not the contents
  // entry that names it in the front matter.
  const bibliography = pages.filter((p) =>
    p.items.some(
      (i) =>
        /Sources and Further Reading/.test(i.text) &&
        (i.size >= 16 || Math.abs(i.y - LAYOUT.headerBaseline) < 0.5)
    )
  );
  expect(bibliography.length, "bibliography pages").toBeGreaterThan(3);
  // And it belongs at the back.
  expect(bibliography[0]!.number).toBeGreaterThan(pages.length * 0.9);
});

test("the file is fit to hand to a printer", () => {
  // The checks a print service runs and a reader never notices. Trim and page
  // count are deliberately not asserted here — those depend on which edition is
  // being made, and `npm run check:print` reports them against KDP's table.
  // These three are true of any print-ready interior.
  expect(pages.length % 2, "a printed book has an even number of sides").toBe(0);
  expect(embeddedFontPrograms, "font programs embedded in the file").toBeGreaterThan(0);
  expect(
    Math.round(lowestImageDpi),
    "lowest image DPI at its placed size"
  ).toBeGreaterThanOrEqual(300);
});

test("no fabricated identifiers survive into print", () => {
  const text = pages.flatMap((p) => p.items.map((i) => i.text)).join("\n");
  // A placeholder ISBN and a placeholder article number both shipped.
  expect(text).not.toMatch(/978-0-000000-00-0/);
  expect(text).not.toMatch(/\b1234567\b/);
});
