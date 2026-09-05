# Healing Together — Roadmap

Started as a staged plan for taking this from "a book that renders" to "a book people
finish", written after a full audit on 2026-08-28. Most of it is now history.

**→ [Where to start](#where-to-start) is the live queue, ordered top-first.**
Everything before it is the record of what was done and why, kept because the reasoning
is worth more than the checkmarks. [Reviewed and not taken](#reviewed-and-not-taken)
lists what was considered and rejected, so the same ground is not walked twice.

## Done

| Phase | Status |
|---|---|
| [0 — Correctness and deployment](#phase-0--correctness-and-deployment-done) | Done |
| [1 — Make the first load fast](#phase-1--make-the-first-load-fast-done) | Done |
| [2 — A better reading experience](#phase-2--make-it-a-better-reading-experience-mostly-done) | Mostly done |
| [3 — Accessibility and content safety](#phase-3--accessibility-and-content-safety-done-bar-the-editorial-part) | Done, bar the editorial part |
| [4 — Project hygiene](#phase-4--project-hygiene-partly-done) | Partly done |
| [5 — The printed book](#phase-5--the-printed-book-done) | Done |
| [6 — Tests](#phase-6--tests-done) | Done |

Not in the original plan and also done: the **printed book** as an object (embedded
fonts, 300 DPI figures, a greyscale-safe palette, KDP preflight), the **Kindle EPUB**
with its own preflight, **axe-core over all 89 routes** plus figure data tables, the
**fonts served from this origin**, and a **Pages preflight** that makes a blank-page
deploy impossible to ship, a **secret scan** on every push, and the vendored UI kit
cut to the twelve components the site reaches. `CHANGELOG.md` has the detail.

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
unused packages removed during the dependency upgrade. Since then the vendored UI kit
went from 47 components to the 12 the site actually reaches — 4,806 lines — and another
30 unreferenced dependencies went with them, taking the list from 56 to 26. Everything
else here is still open and is listed under [Where to start](#where-to-start) with the reason.

The original list follows.

- **No tests exist.** Start with the cheap, high-value ones:
  - Vitest unit tests for `markdown-renderer` (chart placeholder resolution, unknown chart
    handling) and the PDF markdown walker (headings, ordered lists, tables, chart blocks).
  - A Playwright smoke suite that walks every route asserting no console errors and the
    expected chart count — the same sweep used to verify Phase 0, promoted into CI.
- ~~**No linter or formatter**~~ and ~~**decide what the Express server is for**~~ — both
  done on 2026-09-04; see the two entries at the end of this phase.
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
  survived the commit that set out to remove Meadows branding, and carry unsupported
  efficacy percentages for a named treatment provider; see the queue entry above for why
  the recommendation is to delete those two rather than place them.
  `validate:content` warns about all three today.
- **Photographs of the source journal are not committed**, deliberately: they are
  personal medical material. If they are ever needed for verification they live
  with the author, and `docs/source-notes/journal-transcription.md` is the record.
- ~~**Rename the package and clear the scaffolding**~~ — done: the package is now
  `healing-together` with real metadata, the original host's dev plugins and
  config file are gone, and the stale project notes became
  `docs/ARCHITECTURE.md`.

---

### A linter and a formatter (done, 2026-09-04)

ESLint 10 with `jsx-a11y` and `react-hooks`, plus Prettier and
`eslint-config-prettier`; both run first in the CI `check` job, being the
cheapest signal there by two orders of magnitude. The config is a guard rather
than a style council: what it protects is the accessibility work, none of which
a typecheck can see. `role="application"` needed a hand-written
`no-restricted-syntax` selector, since no `jsx-a11y` rule flags it on a `div`.

The whole config was negative-tested before being trusted — a probe file with
one deliberate violation per rule, checked to fail, then deleted.

Its first run over the codebase found nine things, of which one was a real hole
in another guard: `validate:content` ended its figure-matching regex with `\Z`,
which is not a JavaScript anchor and matched a literal "Z", so the last exported
figure in the file was never checked. Also a cascading render on every chapter
navigation, a dead variable in the PDF chapter opener, eleven `any`s, and
`require()` in an ESM package. All fixed and verified; 107 tests pass.

`eslint-plugin-react-refresh` was tried and dropped — its only findings were the
vendored UI kit's own convention, and seven permanent warnings teach people to
ignore lint output.

### The Express server is gone (done, 2026-09-04)

The answer to "give it a purpose or delete it" was delete. It served one
`/api/health` endpoint that nothing called, a static directory that GitHub Pages
serves instead, a `MemStorage` for a `users` table nothing imported, and a
`drizzle.config.ts` that threw unless `DATABASE_URL` was set — for a database
that never existed. The only live function was `npm run dev`, which is plain
`vite` now (port 5173 rather than 5000; the 5000 was the original host's
firewall constraint, not a choice).

`shared/schema.ts` kept its content types but lost zod. Nothing ever called
`.parse()` on those schemas — the chapter modules are TypeScript source checked
at compile time, not untrusted input off a wire — so the runtime validator was
buying a guarantee the compiler already gave. They are plain types.

Nine dependencies went with it: `express`, `@types/express`, `nanoid`,
`drizzle-orm`, `drizzle-zod`, `drizzle-kit`, `zod`, `pg` and `date-fns`. The last
two were reachable from nothing at all — the earlier prune missed them because
its glob did not cover `shared/schema.ts` and `drizzle.config.ts`.

Two footguns went too. `script/build.ts` opened with `rm -rf dist` and rebuilt
without a base path, so running it after `build:pages` made every route serve
the 404 body and all 107 tests fail for one reason that looked like 107 — the
trap the README had to warn about. It only existed to bundle the server, so it
is deleted and `build:pages` is the only build. And `vite.config.ts` still
aliased `@assets` to `attached_assets`, a directory removed in the history
rewrite.

Verified: lint, typecheck, format, the Pages preflight, `npm run dev` fetched
and serving, and 107 browser tests against a real production build.

### Figures load only on the pages that show one (done, 2026-09-04)

The chart registry is `import * as charts` over `trauma-charts`, so anything
importing it pulls all ninety-one figures and Recharts with them. The markdown
renderer imported it statically, and every chapter page loads the markdown
renderer — so **a route with four figures and a route with none downloaded
byte-identical JavaScript**. Measured against the real built site rather than
inferred: 155.1 kB of chart registry on
`/chapter/basic-recovery/subchapter/what-is-trauma`, which has no figure on it,
out of 367.9 kB total. 42 per cent of the page, for nothing.

Now `lazy` per figure name, memoised so a re-render of the surrounding prose
does not remount the figure and replay its entry animation, behind a
placeholder that reserves the figure box so the prose below does not jump.

Measured across all 89 routes, before and after, by driving a browser at the
built site and summing the gzipped bytes of every script it requests:

| | before | after |
|---|---|---|
| 33 routes with no figure | 326 kB avg | **181 kB avg** |
| 56 routes with figures | 343 kB avg | 343 kB avg |
| whole site | 29.3 MB | **24.6 MB** |

No route got heavier. The test suite also runs a minute faster, for the same
reason.

**The file was not split, and the measurement is why.** Splitting it would only
help the figure-bearing routes, and a probe build carrying one chart instead of
ninety-one came to 106.7 kB gzipped against 155.1 kB. Recharts is a 107 kB floor
that no amount of chunking touches; all ninety-one chart definitions together
are the other 48 kB, about half a kilobyte each. So per-chart chunks would save
a figure route ~46 kB at best — 13 per cent — in exchange for ninety-one modules
and a mechanical rewrite of 5,379 lines with sixty-eight working figures in it.
Not worth it at that price. The lever for figure routes is Recharts itself, and
that is a different and much larger job.

What remains is a maintainability argument rather than a reader-facing one:
`trauma-charts.tsx` is still 5,379 lines. Worth splitting when something else
needs to touch it, not on its own account.

### Per-chapter PDF export (done, 2026-09-05)

A chapter downloads as its own PDF from its own page: the chapter's cover under
the book's name, its own contents and list of figures, only the references its
text cites, and the crisis resources. Not a filtered copy of the book — nothing
about the other thirteen chapters is loaded, and only the figures on its pages
are captured.

Measured by clicking the real button on the built site:

| | figures | time |
|---|---|---|
| Whole book | 88 | **164 s** |
| Chapter 1, the figure-heaviest | 17 | 53 s |
| Chapter 12 | 4 | 8.8 s |
| Chapter 14 | 1 | 2.9 s |

The item said the full book takes "about 90 seconds". It takes 164; that number
was written when the book was 679 pages and 56 figures, and it is now 734 and 88.
Export time is almost entirely figure capture, so a chapter costs roughly two
seconds per figure it contains.

The offprint drops the author's note, which speaks for the whole book, and keeps
the crisis resources, which is the point — an excerpt of a trauma-recovery book
that loses the 988 line is worse than no excerpt. `tests/chapter-pdf.spec.ts`
holds that, and the first draft of it did not: it exported the Resources chapter,
whose own prose lists crisis lines, so the assertion passed with the back matter
deleted. It now exports a chapter that mentions neither, and reads the back
matter specifically. Negative-tested by removing the crisis block and watching
it fail.

Two things fell out of the work:

- **The accessibility sweep had been quietly under-covering since figures went
  lazy.** `settle()` counted `figure` elements and skipped its own wait when it
  found none — which is what happens before the chunk lands. It read 73 figures
  instead of 90-odd under parallel load and passed anyway on a quiet machine. It
  now waits for every placeholder to resolve.
- **`data-chart` was two different attributes.** The vendored `ChartContainer`
  puts `data-chart={chartId}` on its own wrapper to scope the CSS variables it
  emits, so `[data-chart]` matched both figure placements and chart internals.
  The EPUB build only survived it by filtering to known component names. The
  placement marker is `data-chart-slot` now and the collision is gone.

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
perfectly and were visibly wrong on the page. Current state, measured 2026-09-05:
734 pages, 102 figure placements, 15 PDF bookmarks, 0 stranded headings, and every folio
matching its physical page.

---

## Phase 6 — Tests (done)

The verification harness that caught everything above existed only as scratch
scripts. It is now `tests/`, run by Playwright against a real production build
served the way Pages serves it, in its own CI job.

| Spec | What it holds |
|------|---------------|
| `site.spec.ts` | All 89 routes, derived from the manifest rather than listed: no console error, no React key warning, no blank `<main>`, no unresolved chart placeholder, and a figure count matching the route's own markdown. Then search, the skip link, and `prefers-reduced-motion` |
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

## Where to start

Everything above is history. This is the queue, top first. Each item says why it is
where it is, so the order can be argued with.

**Every item left needs the author.** The developer queue emptied on 2026-09-05: the
linter, the Express server, the figure payload and per-chapter PDF export all landed,
and nothing remaining can be done by reading the code. Item 1 is one email. Items 2 and
3 are decisions only Matthew can make, and item 4 needs a budget.

### 1. Ask GitHub to garbage-collect the old objects

**The history rewrite is done; this is the half that finishes it.**
`git filter-repo` ran on 2026-09-04 and was force-pushed to both branches. 79
commits kept, 0 touching `attached_assets`, `.git` 16 MB → 1.8 MB, working tree
byte-identical. A fresh clone contains no trace of the directory.

But rewriting history does not delete anything from GitHub. The old commits are
unreferenced and still served at their direct SHA URL, and those SHAs are not
secret — they are in the pull-request pages and the public events feed. **Until
GitHub garbage-collects, the third-party manual is still retrievable.** Only
Support can force that.

The ticket is drafted, with the pre-rewrite SHAs and a rollback procedure, in
[GITHUB-SUPPORT-REQUEST.md](./GITHUB-SUPPORT-REQUEST.md). **Sending it is the only
step left, and only the author can take it.**

The fork check it depended on is done: the API reports `forks_count: 0` as of
2026-09-04, so the ticket's "there are no forks of this repository" is true as
written and it can go as-is. Worth a re-check if time passes before it is sent —
the repository is public and forkable, and a fork would keep its own copy of the
objects that GitHub will not delete for you.

The one-time full-history secret sweep is also done, and clean: gitleaks 8.30.1
over every commit that carries content, **no leaks**, 4.15 MB scanned. The result
and the reason the tool's commit count (69) is lower than the repository's (80)
are recorded in the same file.

### 2. Trigger warnings on the heaviest chapters

Childhood trauma, sexual compulsivity, self-harm. The crisis dialog is one click away
on every page and the figures are all sourced, but a reader can still arrive at the
middle of chapter 4 from a search result with no warning. **Needs the author** — a
content note is a voice, not a component. Second because it affects readers in distress
and nothing else on this list does.

### 3. The paperback trim

The export passes eight of KDP's ten interior checks. The two failures are one fact
stated twice: 734 pages fits no trim it could be printed at. See
[PRINT-AND-PUBLISHING.md](./PRINT-AND-PUBLISHING.md) for three ways out and a
recommendation (two volumes at 6×9). A cover and an ISBN both wait on it. **Needs the
author.** The Kindle EPUB depends on none of this and can go up today.

### 4. An audio edition

A trauma-recovery book has readers who cannot comfortably read: people mid-crisis,
people with dyslexia, people who would listen on a commute and never open a browser.
The chapter markdown is already clean, sectioned and figure-tagged, so the text side is
done — what is open is which voice, and whether a synthetic one is acceptable for this
material. Lowest on the list because it is the largest new surface and the only item
here that needs a budget. **Needs the author.**

### Waiting on the author, no developer work

- **Six references cite an unconfirmable 2024 edition** beside an earlier one — Harris
  *ACT Made Simple*, Hayes/Strosahl/Wilson *A Liberated Mind*, Gottman *Seven
  Principles*, Walker *Battered Woman Syndrome*, WHO ICD-11. Outbound access to
  publisher and journal sites is blocked from CI, so they stand rather than being
  guessed at.
- **Three orphan charts** — `IPVPTSDChart`, `MeadowsTreatmentModelChart`,
  `MeadowsOutcomeChart`. Complete, labelled, referenced by no chapter.
  `validate:content` warns about them every build. The answer differs per chart,
  and for two of them it is *delete*, not *place* — see below.
  - `IPVPTSDChart` cites a real meta-analysis (Golding 1999) and hedges its
    magnitudes. Placeable, if the published figures replace the illustrative ones.
  - `MeadowsTreatmentModelChart` and `MeadowsOutcomeChart` **should not be placed
    as written.** Each attributes percentages to a named commercial treatment
    provider — an axis reading "Patient-Reported Benefit (%)" with Trauma Therapy
    at 87%, and one reading "Sobriety Maintenance (%)" reaching 85% at two years.
    The figcaption underneath says the numbers are illustrative, which contradicts
    the axis label rather than qualifying it; a reader takes the axis. The cited
    sources (Mellody 1989 *Facing Codependence*, Carnes 2005 *Facing the Shadow*)
    describe the *model* and contain no outcome data, so they cannot support those
    numbers even in principle. Publishing invented efficacy figures for a real,
    named treatment centre in a book readers may use to choose care is a liability
    to both the reader and the author. They reach no reader today, being orphans.
    Recommend deleting both; keep the underlying model in prose, where it is
    already taught with attribution.
- **Chapters 6 and 11 are thin** — three subchapters each against a book average of
  five, on two subjects that carry a lot of weight.

---

## Reviewed and not taken

A batch of twenty-five tools and products was put forward for the roadmap. Twenty-two
of them are for the built environment — BIM, IFC, construction takeoff, site capture —
or are tooling for languages this repository does not contain. They are recorded here
so the same links are not re-reviewed later.

**Built-environment and BIM** — `aussieBIMguru/Pickles` (a C# Dynamo package of Revit
utility nodes), `LTplus-AG/ifc-lite` (TypeScript and Rust IFC parsing over WASM),
`ifc-ids.com` (IFC Information Delivery Specification), `bimviewer.space`,
`hefestolab`, `open-reality.io`, `clearhandoff.com`, `caliperd.com`, `usevawn.com`
(agent-native construction takeoff, per its own description), `buildwithpunch.com`,
`dev-xcel.com`, `construction-mu-seven.vercel.app`, `kunifujiwara/VoxCity` (urban
voxel modelling), and a LinkedIn article on multimodal AI for construction drawings.

`ifc-lite` was the closest call: its IDS validation engine and columnar store are not
in themselves construction-specific. But this repository validates prose and figures,
not property-rich 3D models, and `validate:content` already does that in 130 lines.

**Tooling for languages this repository does not use** — `astral.sh/ruff` and
`pypa/hatch` (Python: there are no `.py` files), `sqlfluff` (SQL: there are no `.sql`
files — Drizzle generates them), `vinta/awesome-python`.

**Not applicable** — `parapet.app` is enterprise governance-risk-and-compliance
software. `RyanCodrai/turbovec` is a Rust vector index for corpora around ten million
documents; the search index here is 1,528 sections and 147 kB, and the compile-time
index it already uses is the right tool at that size. `iShape-Rust/xOverlay` is Rust
polygon boolean geometry. `DenverCoder1/github-readme-streak-stats` decorates a
personal GitHub profile, not a book. `charlax/professional-programming` is a reading
list rather than a tool.

**Taken** — `gitleaks/gitleaks` is now the `secrets` job in CI. `assemblyai.com` is
speech-to-text rather than text-to-speech, so it is not the vendor for the audio
edition, but raising it is what put that on the list at all. `ruff` and `sqlfluff`
have no Python or SQL to lint here; the equivalent for this codebase is the ESLint
and Prettier setup, which is done.
