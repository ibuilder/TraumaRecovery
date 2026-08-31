# Changelog

What changed, and why it mattered. Newest first.

Dates are the day the work landed on the branch. Anything marked **author** is a
decision for Matthew rather than a change anyone can make in code.

## Unreleased

### The figures are readable without seeing them

Recharts draws into an SVG it marks `role="application"`, the most hostile role
in ARIA: it tells a screen reader to stop interpreting the content and forward
keystrokes to the widget. What came out was the `<text>` nodes in paint order —
`"0%" "15%" "30%" "General Population" "Women" … "3.9%" "8%"` — categories and
values in separate runs with nothing tying them together. On the radars and pies
the values are not in the SVG at all. Each of those 68 surfaces also took a Tab
stop that announced nothing.

- Every plotted figure carries its numbers as a real table, behind a **Show the
  numbers** disclosure that is worth having sighted too.
- The drawing is `inert` — out of the accessibility tree *and* the tab order.
  `aria-hidden` alone leaves a focusable element that announces nothing, which is
  a trap rather than a fix.
- The figure title stops being an `<h4>`. It labels the figure rather than heading
  a section, and as a heading it put an order skip under every `<h2>` and buried
  the chapter outline under a hundred figure titles.
- The Three Circles pie is deliberately **not** tabulated: it is drawn at 20/35/45
  per cent for legibility and the sizes mean nothing, as its own source note says.
  It carries a written description instead.
- The ebook ships the same tables as XHTML, so they reflow and scale with the
  reader's type size the way a bitmap of a bar chart cannot.

Sweeping all 89 routes rather than a sample found three more:

- The CBT triangle at a contrast ratio of **1.01** — invisible, to everyone, in
  light mode, not merely hard to read.
- Seven empty `<th>` corner cells across five comparison tables, now rendered as
  the `<td>` HTML actually wants there.
- Eight unlabelled `<nav>` landmarks and two heading-order skips.

`tests/a11y.spec.ts` runs axe-core over every route and then checks what axe
cannot: that every figure is announced, that every drawing hands over its content,
and that none of them takes a Tab stop.

### The CBT triangle reaches the printed book

It was ASCII art in a fenced code block, and the PDF exporter dropped every fenced
block without a word — so the central diagram of the CBT chapter was missing from
the book entirely and nothing anywhere said so. It is now a drawn figure, which
also gives it a `<desc>` and arrows running both ways, which is the point of the
model. `validate:content` rejects any new non-chart fence, and the exporter warns
rather than skipping in silence.

### A deploy cannot ship a blank page

`npm run check:pages` reads the built `index.html`, resolves every asset URL
against the base path and against the disk, and checks the `404.html` fallback
and the chunking. It runs in CI and again in the deploy, before anything is
uploaded.

The failure it exists for is silent and total: build without `VITE_BASE_PATH`
and every asset URL comes out as `/assets/…` instead of `/traumarecovery/assets/…`.
The build succeeds, the HTML is valid, every file is present, and the deployed
site is a blank white page. Nothing in the build log says a word. Negative-tested
against three deliberately broken builds.

The EPUB build also stopped walking routes that hold no figure. It waited the
full 8-second timeout on each of them looking for one, and 31 of the book's 87
pages carry none. The build went from about thirteen minutes to 156 seconds. Which
route holds which figure is already written down in the placeholders, so it is
read rather than searched for. It moved into its own CI job as well: building
the ebook means screenshotting 87 figures out of a real browser, and running it
after the tests left the result anyone is waiting on stuck behind the slowest
thing in the pipeline.

### The Kindle edition (2026-08-31)

`npm run epub` builds a reflowable EPUB 3 from the chapter markdown — 87 sections,
88 figures across 102 placements, 4.8 MB — and `npm run check:epub` preflights it
against the 18 rules a reading system actually enforces. Both run in CI, which
uploads the ebook as an artifact.

None of it waits on the trim decision: an ebook has no pages, so it has no page
count, no trim and no margins.

Two bugs worth naming, both found by building the thing and looking at it:
matching figures to placements by guessing at titles resolved 39 of 101, so each
placement is now tagged with its component name; and `marked` emits HTML, not
XHTML, leaving 352 bare `<hr>` — each one a fatal error in a strict reader and
invisible in a lenient one.

### The printed book (2026-08-31)

- **Fonts are embedded.** jsPDF's `times` is one of the PDF base-14 — a reference
  to a font the reader's viewer is expected to supply. Every print service rejects
  that. The book now carries Liberation Serif, subset to the characters it uses,
  at 140 kB across four faces. Metric-compatible with Times, so the swap changed
  the page count by exactly zero.
- **Images are 300 DPI at their placed size**, up from 185. Resolution is a
  property of a bitmap *at a size*, so the capture scale is derived from the
  figure width rather than hardcoded.
- **The figures survive being printed in black.** A colour interior caps at 600
  pages at every trim and this book is past that, so the paperback is black ink
  whatever else is decided. Thirteen figures had two series within 8 luminance
  points; three were within 1.5, which is identical once the colour is gone. The
  print palette keeps every hue and moves only lightness.
- **The page count is even**, because a printed book is made from folded sheets.
- `npm run check:print` preflights an exported PDF against KDP's interior rules.

**author** — the book is 734 pages, which fits no trim it could be printed at.
See [docs/PRINT-AND-PUBLISHING.md](docs/PRINT-AND-PUBLISHING.md) for the three ways
out and a recommendation.

### Typesetting (2026-08-29)

The measure was 102 characters a line against a 66-line page — a technical manual's
proportions, not a book's. Measured across 743 real paragraphs and reset: median 76
characters, figures floating past the paragraph they interrupt rather than leaving
half a page white, chapter sinks, running heads, folios, a contents with real page
numbers, a list of figures, and one bibliography at the back instead of 85
interruptions. 744 pages became 734 with 53 fewer half-empty ones, and stranded
headings went from 3 to 0.

### The verification harness (2026-08-30)

104 Playwright tests against a real production build served the way GitHub Pages
serves it. `tests/book.spec.ts` generates the PDF through the site's own download
button and reads every page's geometry back with pdf.js. A clean text layer is not
a clean book: every one of the defects above extracted perfectly while being
visibly wrong on paper.

Building the harness immediately found that **548 of 1,528 sections were
unsearchable** — a one-line ` ```chart:X``` ` placeholder left the search indexer
stuck inside a code fence for the rest of the file.

### Content (2026-08-28 – 2026-08-31)

The author's treatment journal and relapse-prevention material worked into
chapters 1, 3, 4, 7, 8, 9, 10, 12 and 13 — eight new subchapters and 31 new
figures. Three citation years corrected and two invented article numbers dropped.

### Correctness and deployment (2026-08-28)

Three chapter pages rendered **completely blank** — Recharts spread a data key
named `style` onto a DOM `<text>` and React threw. The Resources chapter's 36
bare URLs were not clickable. `npm ci` failed for anyone outside the original
hosting workspace. The exported PDF was **118 MB** of raw bitmaps, lost the
numbering on ~640 ordered-list steps, and dumped ~350 table rows as raw `|` text.

Full detail of this and every phase since: [docs/IMPROVEMENT-PLAN.md](docs/IMPROVEMENT-PLAN.md).
