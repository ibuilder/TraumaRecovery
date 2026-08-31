# Publishing this book on Amazon

What KDP requires of a paperback interior, what the current export passes, and
what would have to change to put it on sale. Run `npm run check:print` against
an exported PDF to reproduce any of this.

Requirements below are Amazon's published paperback guidelines. They change;
`script/check-print-ready.ts` holds the numbers in one table so they can be
updated in one place.

---

## Where the export stands

```
[  ok  ] File size               23.6 MB, under the 650 MB limit
[  ok  ] Trim size               8.50 x 11.00 in is a supported KDP trim
[  ok  ] Uniform page size       every page matches page 1
[  ok  ] Page parity             734 pages, even
[ FAIL ] Page count              734 exceeds the 590-page maximum for 8.50 x 11.00 in
[  ok  ] Embedded fonts          4 font programs embedded in the file
[  ok  ] Image resolution        101 images, lowest 315 DPI at placed size
[ FAIL ] Colour page count       734 exceeds the 600-page maximum for a colour interior
[  ok  ] Side margins            narrowest is 1.081 in, clearing the 0.875 in gutter
[  ok  ] Top and bottom margins  narrowest is 0.606 in
```

Eight of ten. The two that fail are the same fact stated twice: **the book is
too long.**

---

## What was fixed

**Fonts are embedded.** This was the quiet one. jsPDF's `times` is one of the PDF
base-14 — a *reference* to a font the reader's viewer is expected to supply, not
the font itself. Every print service rejects that, and they are right to: the
same file can set differently on two machines. The book now carries Liberation
Serif, subset to the 147 characters it uses, at 140 kB across four faces.

Liberation Serif rather than something prettier for one decisive reason: it is
metric-compatible with Times, so every advance width matches and the swap
changed the page count by exactly zero. A book that took this long to typeset
does not get reflowed for a font change. It is SIL OFL 1.1, which explicitly
permits embedding.

**Images are 300 DPI at their placed size.** They were 185. Resolution is not a
property of a bitmap, it is a property of a bitmap *at a size*: the same 1200 px
capture is 300 DPI in a column and 150 across a spread. The capture scale is now
derived from `FIGURE_WIDTH` rather than hardcoded, so widening a figure cannot
quietly drop it back under the floor. Costs about 9 MB.

**The figures survive being printed in black.** Because a colour interior caps
at 600 pages at every trim and this book is past that, the paperback is black
ink whatever else gets decided — so the figures had to stop separating by hue
alone. Measured across all 101 figure placements, thirteen had two series within
8 luminance points of each other and three of those were within 1.5, which is
identical once the colour is gone.

The trap was that eight variables carry series identity, not just `--chart-N`:
`--primary` and `--destructive` are used more often than most of the numbered
ones, so re-tuning only the numbered ones moved some colours *onto* others — the
first attempt made it worse, not better. The palette now keeps every hue and
saturation and moves only lightness, putting the eight on a ladder from 17% to
80% luminance, 8.6 points apart at the closest. It is applied to the offscreen
host at capture time rather than to the site, which has colour and does not need
it. Thirteen collapsing figures became zero.

`--muted-foreground` is deliberately left where it is. It is the caption and
subtitle colour as well as a series colour, and lightening it to separate six
charts washed out the text under every one of the hundred.

**The page count is even.** A printed book is made from folded sheets and always
has an even number of sides. Print services either reject an odd count or insert
the blank themselves, after the last page rather than where the book would want
it.

All three are asserted in `tests/book.spec.ts`, so they cannot silently regress.

---

## What is left, and why it needs a decision

### The book is too long for the paper it is set on

| Trim | Max pages, black ink on white |
|---|---|
| 8.5 x 11 (current) | **590** |
| 8 x 10 | 600 |
| 7.5 x 9.25 | 750 |
| 7 x 10 | 780 |
| **6 x 9** | **828** |
| 6.14 x 9.21 | 828 |
| 5.5 x 8.5 | 828 |

At 734 pages the book does not fit on US Letter at all. That trim was chosen
deliberately — people print this at home, and a 6 x 9 would come out scaled or
cropped — but the decision only ever applied to the download. It cannot also be
the trim of a paperback.

### A colour interior caps at 600 pages, at every trim

So the paperback has to be **black ink**. That is handled: the exporter now
swaps in a palette spread across luminance rather than hue, and no figure in the
book collapses in greyscale. See "what was fixed" above.

### Three ways out

**1. A 6 x 9 edition.** The 828-page ceiling is the only one this book could fit
under. It will not fit at the current type size: 6 x 9 with the 0.875 in gutter
required at this thickness leaves about 4.6 in of measure, which at 11.5 pt is
roughly 68 characters and around 33 lines a page — call it 900+ pages. Dropping
to 10.5 pt with tighter leading brings it to roughly 770. That is a real edition
and a real piece of work: a second print profile in the exporter and figures
re-sized to a 120 mm measure.

**2. Two volumes.** Chapters 1–7 and 8–14 are roughly 380 and 350 pages. Both fit
comfortably at 6 x 9 without shrinking the type, both stay under the colour
ceiling, and each becomes a book somebody might actually finish. It is more
listing work and it splits the royalty, but it is by far the least destructive
option typographically — and a 734-page paperback is a brick nobody reads in bed.

**3. Do not print it.** The download is free, works on any device, prints at home
on the paper people own, and is already better typeset than most self-published
paperbacks. Nothing about the book's purpose requires an Amazon listing.

My recommendation is **two volumes at 6 x 9**, because it is the only option that
does not require making the type smaller in a book whose readers include people
reading it in distress.

---

## The Kindle edition is done

Amazon wants EPUB or KPF for a reflowable ebook, and a PDF uploaded as one
becomes a fixed-layout file that is miserable on a phone — pinching and
scrolling sideways through a column sized for paper. So the ebook is built
separately, from the chapter markdown rather than from the PDF:

```bash
npm run epub && npm run check:epub
```

87 sections, 88 figures across 102 placements, 4.8 MB, and it passes all 18
preflight checks. Two things about it are better than the PDF: the text reflows
to whatever size the reader has set, and every figure carries real alt text
taken from its own title and subtitle, which the PDF cannot do.

None of it depends on the trim decision — an EPUB has no pages, so it has no
page count, no trim and no margins. It is ready to upload now.

Both the build and the preflight run in CI, in their own job alongside the tests,
and the ebook is uploaded as an artifact on every push.

Every figure also arrives twice: as the picture, and as the numbers behind it in a
real table. An ebook is read on a phone as often as anywhere, and a reader who has
scaled the text up cannot scale up a bitmap of a bar chart — a screen reader cannot
read one at all.

---

## Not yet done, whichever route is taken

- **A cover.** KDP takes the cover as a separate upload, not as page 1 of the
  interior — spine width calculated from the final page count and paper stock,
  0.125 in bleed on all four sides, 300 DPI. The current page 1 is a title page
  for the download and would need removing from a print interior.
- **An ISBN.** KDP will assign one free, or you supply your own. The book
  deliberately carries none: it had a fabricated one, which is worse than
  nothing.
- **Mirrored margins.** The layout is symmetric, and the gutter requirement is
  met on both sides because the margins are generous. In a bound book the text
  block will sit slightly toward the outside edge. Not a rejection — a quality
  point that only matters once the trim is settled.
