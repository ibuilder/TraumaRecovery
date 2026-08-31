# Healing Together — Improvement Plan

A staged plan for taking this from "a book that renders" to "a book people finish."
Written after a full audit of the repository on 2026-08-28.

Phase 0 is done and merged. A second pass integrated the author's treatment
journal — eight new subchapters and 22 new figures, covering chapters 1, 3, 4,
7, 8, 9, 10 and 13.

**Phases 1–4 have since been worked through**, along with a fifth piece of work
that was not in the original plan: the printed book itself. Each phase below now
carries a status; items that are done say so and say what was built, and the ones
that are not carry the reason. The short version of what is left is at the end,
under [Still open](#still-open).

---

## Phase 0 — Correctness and deployment (done)

| Fix | Why it mattered |
|-----|-----------------|
| `AttachmentStylesChart` data key renamed from `style` | Recharts spread `style: "Secure"` onto a DOM `<text>`; React threw and **three chapter pages rendered completely blank** (`childhood-trauma`, its `attachment-healing` subchapter, and `dysfunctional-families`) |
| CBT subchapter `id`/`order` de-duplicated | Two subchapters both had id `8-2`, causing React key collisions in the sidebar and the "Continue Reading" list |
| Chapter 13/14 order swapped to match array order | Badges read "Chapter 14" then "Chapter 13" while prev/next navigation followed array position |
| 36 bare URLs in the Resources chapter converted to markdown links | The chapter is a directory of experts and treatment centres; **none of its links were clickable** (GFM autolinks `www.x.com` but not `x.com`) |
| `package-lock.json` repointed at the public registry | 77 packages resolved to a private package mirror, so `npm ci` failed for anyone outside the original hosting workspace |
| `nanoid` promoted to a real dependency | `server/vite.ts` imported it while only getting it transitively |
| Google Fonts request narrowed from 26 families to 1 | Only `Open Sans` is referenced by the theme; the rest were render-blocking downloads for fonts nothing used |
| `maximum-scale=1` removed from the viewport | Blocked pinch-zoom for low-vision readers |
| PDF: React roots unmounted after chart capture | 59 live roots leaked per export |
| PDF: only referenced charts captured | 3 orphan charts were rendered and screenshotted for nothing |
| PDF: ordered lists keep their numbers; GFM tables render as grids | ~640 numbered steps became bullets and ~350 table rows were dumped as raw `\|` text |
| PDF: image compression enabled | jsPDF was embedding each chart as a raw bitmap (1200x600x3 bytes); the book was **118 MB**, now 5.4 MB |
| PDF: charts captured at natural height and sized from their real aspect | A fixed 400px capture box and a hardcoded 2:1 ratio cropped the axis off the taller charts |
| PDF: chapter opener laid out before the tint band is painted | "CHAPTER 1" was drawn on top of the chapter title |
| PDF: multi-line blockquotes buffered before quoting | Each line got its own pair of quote marks, so quotes read `""..."` |
| `chapter-card` icon map completed | `HeartCrack`, `Sparkles` and `Video` were missing, so three chapters silently showed the generic heart |
| `LICENSE` added, scoped | `package.json` claimed MIT with no licence text, and the book prose is not MIT |
| `tsconfig` target set to `ES2022` | Was defaulting to ES5 while `lib` claimed `esnext` |
| Dead code removed | Unused `preprocessChartSyntax`, unused `chapterSlug` prop, unused `createServer` import, unused React hook imports |
| 404 page rewritten | Hardcoded `bg-gray-50`/`text-gray-900` broke in dark mode, and the copy read "Did you forget to add the page to the router?" |
| GitHub Pages deployment | Base-path-aware build + router, `404.html` SPA fallback, `.nojekyll`, CI and deploy workflows |
| `script/validate-content.ts` + CI | Locks in the invariants above so they cannot silently regress |

**Verification:** all 82 routes were loaded in headless Chromium against the production
build — every expected chart present, zero React errors, zero key warnings. The full-book
PDF was generated end to end and inspected: 679 pages, 56 embedded charts, 5.4 MB, no raw
markdown syntax left in the text layer.

---

## Phase 1 — Make the first load fast (done)

The single largest chunk is now over 1 MB and it is **mostly book text**: all 14
chapters, ~119,000 words, are bundled into the entry chunk because
`chapters/index.ts` eagerly imports every chapter module, and the header, footer,
sidebar and home page all import `chapters` just to read titles and slugs. The
journal integration added roughly 12,000 words, so this has got worse, not
better — it is now the clearest single win available.

**Done.** `manifest.ts` holds the metadata, `load.ts` resolves one chapter module
per `import.meta.glob` loader behind a cached promise, and every navigation surface
reads the manifest. `validate:content` fails if the manifest or the search index has
drifted from the chapter modules. Open Sans is **self-hosted** — four variable
WOFF2 faces split by `unicode-range`, no third-party request, and `check:pages`
fails the build if anything reaches off-origin again. `trauma-charts.tsx` is a
separate lazily-loaded chunk rather than split per figure, which remains worth
doing and is not on the critical path.

The original plan follows, for the reasoning.

**Split metadata from content.**

1. Add `client/src/lib/chapters/manifest.ts` — an array of `{ id, slug, title, description, icon, order, readingTime, subchapters: [{ id, slug, title, order }] }`. No prose. A few kB.
2. Change every navigation surface (`header`, `footer`, `chapter-sidebar`, `chapter-card`, `home`, `chapters`) to import the manifest.
3. Load the body of a chapter on demand:
   ```ts
   const loaders = import.meta.glob("./content/*.ts");   // one module per chapter
   ```
   and resolve it in `pages/chapter.tsx` behind a `<Suspense>` skeleton.
4. Keep `validate:content` cross-checking the manifest against the content modules, so the
   two cannot drift.

Expected result: entry chunk drops to roughly 150–250 kB; each chapter pulls 30–120 kB when
it is actually opened.

**Also worth doing in this phase**

- `trauma-charts.tsx` is now a single ~3,700-line module holding all 81 figures, so
  opening any chapter downloads all of them. Split it per figure (or per chapter
  group) and resolve the placeholder through `React.lazy`, since a typical chapter
  shows 1–4. The newer diagram components are plain SVG and markup with no Recharts
  dependency, so they are cheap — it is the Recharts plots that justify the split.
- Self-host the one Open Sans face with `font-display: swap` and `preload`, removing the
  third-party render-blocking request entirely.
- Add `rel="preload"` for the chapter chunk on hover of a chapter card.

---

## Phase 2 — Make it a better reading experience (mostly done)

**Done:** reading position, search, and heading anchors. **Not done:** read-state
marks, an in-page table of contents, reading preferences, and per-chapter PDF export.

Two notes on how the done ones landed, because they differ from the proposal:

- The bookmark is a *"continue reading"* link, not a restored scroll offset. Being
  dropped part-way down a page you do not remember opening is disorienting, and this
  is a book people put down mid-chapter and come back to days later.
- Search is a compile-time index of 980 entries with hand-written ranking (heading
  matches beat body matches, word-boundary matches beat substring ones, every term
  has to appear). `cmdk` provides the dialog but its own fuzzy filter is switched
  off — it scores against the item value, which here is a URL, and dropped every
  result.

The original proposals follow.

- **Persist reading position.** Store the last chapter/subchapter and scroll offset in
  `localStorage` and offer "Continue where you left off" on the home page. For a 107,000-word
  book read in sittings, this is the single biggest retention feature.
- **Mark chapters as read.** A checkmark on each chapter card plus an overall progress ring.
- **Search.** A client-side index (FlexSearch or MiniSearch, built at compile time) over
  chapter and subchapter text, opened with `⌘K` through the `cmdk` component that is already
  a dependency. Readers arrive looking for "window of tolerance" or "urge surfing", not for
  chapter 9.
- **In-page table of contents.** The sidebar lists subchapters but not the `##` headings
  inside the current page; several chapters are 3,000+ words.
- **Anchor links on headings.** Deep-linkable `#section` URLs so readers can share a
  specific technique.
- **Adjustable type size and measure.** A reading-preferences control (font size,
  line height, max width). Standard in a reader; cheap to add on top of the existing CSS
  variables.
- **Per-chapter PDF export.** The full-book export takes minutes; most readers want one
  chapter. The existing generator already works chapter-by-chapter internally.

---

## Phase 3 — Accessibility and content safety (done, bar the editorial part)

This is a mental-health resource, so both matter more than usual.

**Done:** every one of the 91 figures sits in a shared `ChartFrame` — a real
`<figure>` with a stated source — the crisis dialog is one click away in the header
on every page, `prefers-reduced-motion` is honoured in CSS and in the Recharts entry
animations, and there is a skip-to-content link before the sticky header.

Then the part that was open for a long time. **Every plotted figure now carries its
numbers as a real table** and the drawing is `inert`, and **axe-core runs over all 89
routes in CI**. Sweeping the whole site rather than a sample is what found the rest:
the book's one ASCII diagram sitting at a contrast ratio of 1.01 — invisible, to
everyone, in light mode — seven empty `<th>` corner cells, eight unlabelled `<nav>`
landmarks and two heading-order skips. `tests/a11y.spec.ts` also asserts what axe
cannot: that every figure is announced, that every drawing hands over its content,
and that none of them takes a Tab stop.

**Not done:** trigger warnings on the heaviest chapters. That one is editorial rather
than technical — a content note is the author's voice, not a component.

The original proposals follow.

- **Most charts have no text alternative.** The 13 figures added with the journal
  material are built as `<figure>` elements with real captions, `role="img"` with
  `<title>`/`<desc>` on the SVG, or as semantic tables — those are already readable.
  The original 59 Recharts plots are still inaccessible SVG blobs. Give each one a
  `<figure>`, a `<figcaption>`, and a visually hidden data table. The pattern to
  follow is already in the file.
- **Trigger warnings.** Chapters on childhood trauma, sexual compulsivity and self-harm
  should carry a short content note above the fold, with the crisis line adjacent.
- **A persistent, one-tap crisis affordance.** Crisis numbers are in the footer, which is
  ~10,000 words below the top of a chapter. A small fixed "Need help now?" control that opens
  a dialog with 988 / 741741 / SAMHSA belongs on every page.
- **Run axe-core in CI** against a sample of routes (Playwright + `@axe-core/playwright`)
  and fail on serious violations. Known items to check first: colour contrast of
  `text-muted-foreground` on `bg-muted/30`, focus-visible rings on the chapter cards,
  and the reading-progress bar's `role="progressbar"` announcement noise.
- **`prefers-reduced-motion`.** Recharts entry animations and `scroll-behavior: smooth`
  should both back off; motion is a common trigger for people with vestibular conditions.
- **Skip-to-content link** before the sticky header.

---

## Phase 4 — Project hygiene (partly done)

**Done:** the package metadata, licence and `tsconfig` target (in Phase 0), and 18
unused packages removed during the dependency upgrade. Everything else here is still
open and is listed under [Still open](#still-open) with the reason.

The original list follows.

- **No tests exist.** Start with the cheap, high-value ones:
  - Vitest unit tests for `markdown-renderer` (chart placeholder resolution, unknown chart
    handling) and the PDF markdown walker (headings, ordered lists, tables, chart blocks).
  - A Playwright smoke suite that walks every route asserting no console errors and the
    expected chart count — the same sweep used to verify Phase 0, promoted into CI.
- **No linter or formatter.** Add ESLint (`react-hooks`, `jsx-a11y`) and Prettier, and run
  both in CI. `jsx-a11y` would likely have caught several Phase 3 items already.
- **Decide what the Express server is for.** It currently serves one `/api/health` endpoint
  and a static directory. If Pages is the deployment target, either delete `server/`,
  `drizzle.config.ts`, the unused `MemStorage`/`users` table, and the ~15 unused backend
  dependencies (`passport`, `express-session`, `connect-pg-simple`, `pg`, `drizzle-orm`,
  `memorystore`, `ws`) — or keep it and give it a stated purpose. Right now it is scaffolding
  that implies a database that does not exist.
- **Prune unused UI.** ~45 shadcn/ui components are vendored; a handful are used. They are
  tree-shaken out of the bundle but they are still code to maintain and to audit.
- **`attached_assets/` (22 MB).** It holds two identical copies of a third-party treatment
  centre's outpatient manual plus eight scratch text files, none of which is imported by the
  app. **Publishing this repository publicly also publishes that manual.** Recommend deleting
  the directory and adding it to `.gitignore`; if the PDFs must go, they also need purging
  from git history (`git filter-repo`), which rewrites commit SHAs and so should be a
  deliberate, separate action.
- **Three orphan charts.** `IPVPTSDChart`, `MeadowsTreatmentModelChart` and
  `MeadowsOutcomeChart` are defined but referenced by no chapter. The two Meadows ones also
  survived the commit that set out to remove Meadows branding. Either place them in the text
  or delete them; `validate:content` warns about them today.
- **Photographs of the source journal are not committed**, deliberately: they are
  personal medical material. If they are ever needed for verification they live
  with the author, and `docs/source-notes/journal-transcription.md` is the record.
- ~~**Rename the package and clear the scaffolding**~~ — done: the package is now
  `healing-together` with real metadata, the original host's dev plugins and
  config file are gone, and the stale project notes became
  `docs/ARCHITECTURE.md`.

---

## Phase 5 — The printed book (done)

Not in the original plan, because the PDF was assumed to be a byproduct. It is the
form most of these readers will actually use, and it was the worst-typeset thing in
the repository.

| Fix | Why it mattered |
|-----|-----------------|
| Page grid rebuilt: 137.9 mm text block at 11.5 pt on US Letter | The median line ran **102 characters**, half again the length an eye tracks back from without losing its place. Now 76 |
| Running head and folio put on a real grid | They floated 15 mm and 23 mm clear of the text; the reclaimed space is three more lines a page |
| Figures and tables break the measure at 165 mm | Narrowing the line was for the prose; there was no reason to shrink every chart's axis labels with it |
| Figures float | A chart that did not fit took the heading above it to the next page and left up to 130 mm of blank paper behind |
| Widow and orphan control, and heading reserves that model it | 77 stranded headings at the start of this work, then 3, now **0** |
| Inline `## References` sections gathered into one bibliography at the back | 73 pages of references interrupting the reader 85 times |
| Contents and list of figures with page numbers, plus 88 PDF bookmarks | Neither existed; the contents had no page numbers at all |
| Front matter reserved and then filled | Every folio was two low against its physical page |
| Charts captured after their entry animation, not during | Pies and radars were screenshotted mid-sweep |
| Fabricated ISBN removed; invented colons in 66 paragraphs fixed | Both were printing in the book |

**Verification:** the book is generated end to end, every page's text geometry is read
back with pdfjs, and pages are rendered to PNG and looked at. A clean text layer is not
a clean book — mid-animation charts, stranded headings and the folio offset all extracted
perfectly and were visibly wrong on the page. Current state: 718 pages, 92 figure
placements, 0 stranded headings, every folio matching its physical page, all 14 contents
entries and all 78 figure-list entries resolving correctly.

---

## Phase 6 — Tests (done)

The verification harness that caught everything above existed only as scratch
scripts. It is now `tests/`, run by Playwright against a real production build
served the way Pages serves it, in its own CI job.

| Spec | What it holds |
|------|---------------|
| `site.spec.ts` | All 90 routes, derived from the manifest rather than listed: no console error, no React key warning, no blank `<main>`, no unresolved chart placeholder, and a figure count matching the route's own markdown. Then search, the skip link, and `prefers-reduced-motion` |
| `book.spec.ts` | The book generated through the site's own download button, then every page's geometry read back with pdf.js: folios against physical pages, stranded headings, characters per line, contents and figure-list entries resolving, references gathered at the back, no placeholder identifiers |

103 tests, about ninety seconds of which is generating the book.

Two things worth knowing about them. The book checks are measured rather than
eyeballed because a clean text layer is not a clean book — mid-animation charts,
stranded headings and an off-by-two folio all extracted perfectly. And the suite
was verified by putting two of the fixed defects back: widening the text block
and restoring the old widow reserve, both of which it caught.

It found one defect on its first run: the chapter page rendered a second
`<main>` inside the app shell's, so the page had two main landmarks and the new
skip link had no single target.

---

## Still open

Ordered by how much they matter, not by effort.

**Needs the author, not a developer**

- **Six references cite a 2024 edition beside an earlier one, and none of the 2024
  editions could be confirmed** — Harris *ACT Made Simple*, Hayes/Strosahl/Wilson,
  *A Liberated Mind*, Gottman *Seven Principles*, Walker *Battered Woman Syndrome*,
  WHO ICD-11. Outbound access to publisher and journal sites is blocked from CI, so
  they are left as they stand rather than guessed at.
- **Three orphan charts** — `IPVPTSDChart`, `MeadowsTreatmentModelChart`,
  `MeadowsOutcomeChart`. Complete, labelled, referenced by no chapter. Place them or
  delete them; `validate:content` warns about them every build.
- **Trigger warnings** on the childhood-trauma, sexual-compulsivity and self-harm
  chapters. A content note is the author's voice, which is why it has not been written.
- **Chapters 6 and 11 are thin** — three subchapters each, against a book average of
  five, on two subjects that carry a lot of weight.

**Needs a decision, then a deliberate action**

- **The paperback edition.** The export now passes eight of KDP's ten interior
  checks; the two it fails are the same fact twice, which is that 734 pages does
  not fit on US Letter (max 590) and a colour interior caps at 600 pages at every
  trim. See [PRINT-AND-PUBLISHING.md](./PRINT-AND-PUBLISHING.md) for the three
  ways out and a recommendation. The Kindle EPUB is **done** and depends on none of
  this — an ebook has no pages, so it has no page count, trim or margins. A cover and
  an ISBN are still outstanding, and both need the trim settled first.

- **`attached_assets/` (22 MB)** of unimported files, including two copies of a
  third-party treatment centre's manual. Publishing this repository publicly publishes
  that manual. Deleting the directory is easy; purging it from git history is a
  `git filter-repo` that rewrites every commit SHA, so it should be its own action on a
  quiet day, not folded into a feature branch.
- **What the Express server is for.** It serves one `/api/health` endpoint and a static
  directory, and `drizzle.config.ts` plus an unused `users` table imply a database that
  does not exist. Either give it a purpose or delete it and its dependencies.

**Straightforward work nobody has done**

- **No linter or formatter.** ESLint (`react-hooks`, `jsx-a11y`) and Prettier.
- **Split `trauma-charts.tsx`** — over 5,000 lines and 91 figures in one lazily-loaded
  chunk, where a typical chapter shows one to four.
- **Per-chapter PDF export.** The full book takes about 90 seconds; most readers want
  one chapter, and the generator already works chapter by chapter internally.
- **Prune the ~45 vendored shadcn/ui components** down to the handful in use.
