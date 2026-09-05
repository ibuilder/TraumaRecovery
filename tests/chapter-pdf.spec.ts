import { expect, test } from "@playwright/test";
import { downloadChapter, readBook } from "./helpers/book";

/**
 * One chapter as its own PDF.
 *
 * The checks that matter for an offprint are not the ones that matter for the
 * book: that it is one chapter rather than the whole book under a different
 * name, that it says what it is an offprint of, and that the crisis resources
 * came with it. The last is the reason this file exists — an excerpt of a
 * trauma-recovery book that drops the 988 line is worse than no excerpt, and
 * nothing else in the suite would notice.
 *
 * Two choices here are deliberate, and the first version of this test got both
 * wrong. `alternative-therapies` is the subject because it is cheap to export
 * (two figures, about five seconds) *and* its own prose contains neither "988"
 * nor "Crisis Resources" — the first draft used `resources`, which is the
 * chapter that lists crisis lines, so the assertion passed on the chapter's own
 * text with the back matter deleted. And the crisis check reads the back matter
 * specifically rather than the whole document, so no future chapter that
 * happens to mention a hotline can satisfy it by accident.
 */
test("a chapter exports as its own book", async ({ page }) => {
  const { bytes, filename } = await downloadChapter(page, "alternative-therapies");

  expect(filename, "the file says which chapter it is").toBe(
    "healing-together-11-alternative-therapies.pdf"
  );

  const { pages, outline } = await readBook(bytes);
  const textOf = (p: (typeof pages)[number]) => p.items.map((i) => i.text).join(" ");
  const all = pages.map(textOf).join("\n");

  // One chapter, not fourteen. The full book is 734 pages. The bound is loose
  // on purpose: it is catching "the whole book came out", not pinning a length
  // that legitimately moves as the prose is edited.
  expect(pages.length).toBeGreaterThan(2);
  expect(pages.length).toBeLessThan(150);

  // Print services either reject an odd sheet count or add the blank
  // themselves, in the wrong place.
  expect(pages.length % 2, "even page count").toBe(0);

  expect(outline, "at least the chapter itself is bookmarked").toBeGreaterThan(0);

  // The cover is the chapter's, under the book's name.
  const cover = textOf(pages[0]);
  expect(cover).toContain("HEALING TOGETHER");
  expect(cover).toContain("CHAPTER 11");

  // It says what it is, so a loose PDF is not mistaken for the whole book.
  expect(all).toContain("printed on its own");

  // The author's note speaks for the whole book, so an offprint omits it.
  expect(all).not.toContain("A Note from the Author");

  // The safety net travels with the excerpt. Read only the back matter — the
  // last three pages, which is the colophon page plus any blank — so that this
  // cannot be satisfied by a chapter that discusses hotlines in its own text.
  const backMatter = pages.slice(-3).map(textOf).join("\n");
  expect(backMatter, "crisis resources in the back matter").toContain("Crisis Resources");
  expect(backMatter, "the 988 lifeline in the back matter").toContain("988");
});
