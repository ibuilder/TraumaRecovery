# Changelog

What changed, and why it mattered. Newest first.

Dates are the day the work landed on the branch. Anything marked **author** is a
decision for Matthew rather than a change anyone can make in code.

## Unreleased

### A chapter downloads as its own PDF

From the chapter's own page. The chapter's cover under the book's name, its own
contents and list of figures, only the references its text cites, and the crisis
resources. Not a filtered copy of the book: nothing about the other thirteen
chapters is loaded, and only the figures on its own pages are captured.

Measured by clicking the real button on the built site:

| | figures | time |
|---|---|---|
| Whole book | 88 | **164 s** |
| Chapter 1, the figure-heaviest | 17 | 53 s |
| Chapter 12 | 4 | 8.8 s |
| Chapter 14 | 1 | 2.9 s |

The roadmap said the full book took "about 90 seconds". It takes 164 -- that
number dates from when the book was 679 pages and 56 figures, and it is now 734
and 88. Export time is almost all figure capture, so a chapter costs roughly two
seconds per figure it has.

The offprint drops the author's note, which speaks for the whole book, and keeps
the crisis resources, which is the point.

**The test that guards that was vacuous on its first draft**, and it is worth
recording why. It exported the Resources chapter -- the one whose own prose
lists crisis lines -- so deleting the entire back matter still left "Crisis
Resources" and "988" in the extracted text and the assertion passed. It now
exports a chapter that mentions neither, and reads only the back matter.
Negative-tested by removing the crisis block and watching it fail.

Two things fell out of the work, both mine and both pre-existing by a day:

- **The accessibility sweep had been under-covering since figures went lazy.**
  Its `settle()` counted `figure` elements and skipped its own wait when it
  found none -- which is exactly the state before a lazy chunk lands. It read 73
  figures instead of 90-odd under parallel load, and passed on a quiet machine.
  It now waits for every placeholder to resolve into a figure.
- **`data-chart` was two different attributes.** The vendored `ChartContainer`
  puts `data-chart={chartId}` on its own wrapper to scope the CSS variables it
  emits, so `[data-chart]` matched both figure placements and chart internals --
  and the internals live *inside* a figure, so a wait for "every one holds a
  figure" could never be satisfied. The EPUB build survived it only by filtering
  to known component names. The placement marker is `data-chart-slot` now.

Verified: 108 browser tests against a real production build, the Kindle edition
rebuilt (88 figures, 102 placements, 18/18 preflight), and the full book read
back with pdf.js -- 734 pages, 15 bookmarks, unchanged.

### Figures load only on the pages that show one

The chart registry is `import * as charts` over `trauma-charts`, so importing it
pulls all ninety-one figures and Recharts with them. The markdown renderer
imported it statically and every chapter page loads the markdown renderer, so **a
route with four figures and a route with none downloaded byte-identical
JavaScript**: 155.1 kB of chart registry out of 367.9 kB total on
`/chapter/basic-recovery/subchapter/what-is-trauma`, which has no figure on it.
42 per cent of the page, for nothing.

Now `lazy` per figure name -- memoised, because `lazy()` returns a new component
type each call and a new type at the same position remounts the figure and
replays its entry animation on every render of the prose around it -- behind a
placeholder that reserves the figure box so the prose below does not jump.

Measured across all 89 routes before and after, by driving a browser at the
built site and summing the gzipped bytes of every script it requests:

| | before | after |
|---|---|---|
| 33 routes with no figure | 326 kB avg | **181 kB avg** |
| 56 routes with figures | 343 kB avg | 343 kB avg |
| whole site | 29.3 MB | **24.6 MB** |

No route got heavier. The browser suite runs a minute faster for the same reason.

**`trauma-charts.tsx` was not split, and the measurement is why.** A probe build
carrying one chart instead of ninety-one came to 106.7 kB gzipped against 155.1
kB: Recharts is a 107 kB floor no chunking touches, and all ninety-one chart
definitions together are the other 48 kB -- about half a kilobyte each. Per-chart
chunks would save a figure-bearing route ~46 kB at best, in exchange for
ninety-one modules and a mechanical rewrite of 5,379 lines containing
sixty-eight working figures. The lever for those routes is Recharts itself,
which is a different and much larger job.

Verified: 107 browser tests against a real production build, the Pages preflight,
and the Kindle edition rebuilt -- 88 figures captured, 102 placements, 18/18
preflight checks.

### The Express server is gone, and with it two footguns

"Give it a purpose or delete it" resolved to delete. It served one `/api/health`
endpoint nothing called, a static directory GitHub Pages serves instead, a
`MemStorage` for a `users` table nothing imported, and a `drizzle.config.ts`
that threw unless `DATABASE_URL` was set -- for a database that never existed.
Its only live function was `npm run dev`, which is plain `vite` now, verified by
starting it and fetching the page. Port 5173 rather than 5000; the 5000 was the
original host's firewall constraint, not a choice.

`shared/schema.ts` keeps its content types and loses zod. Nothing ever called
`.parse()` on those schemas -- the chapter modules are TypeScript source checked
at compile time, not untrusted input off a wire -- so the validator was buying a
guarantee the compiler already gave.

**Nine dependencies** went with it: `express`, `@types/express`, `nanoid`,
`drizzle-orm`, `drizzle-zod`, `drizzle-kit`, `zod`, `pg`, `date-fns`. The last
two were reachable from nothing at all; the earlier prune missed them because
its glob did not cover `shared/schema.ts` or `drizzle.config.ts`.

Two footguns went with it as well:

- `script/build.ts` opened with `rm -rf dist` and rebuilt with no base path, so
  running it after `build:pages` left every route serving the 404 body and all
  107 tests failing for one reason that looked like 107. The README had to carry
  a warning about it. It existed only to bundle the server, so it is deleted and
  `build:pages` is the only build -- the warning is now a note that the trap is
  gone.
- `vite.config.ts` still aliased `@assets` to `attached_assets`, a directory
  removed in the history rewrite.

Verified: lint, typecheck, format, the Pages preflight, `npm run dev` fetched
and serving, and 107 browser tests against a real production build.

### A linter that guards the accessibility work, and a formatter

There was no lint config in the repository at all. That mattered more than it
sounds, because the accessibility work put invariants into the code that no type
can see: a chart drawing has to stay `inert`, landmarks have to keep their
labels, a figure has to carry its numbers somewhere a screen reader can reach,
and `role="application"` -- the attribute that made 68 figures unreadable --
must never be written by hand. Until now nothing caught a regression in any of
those until the axe sweep, six minutes into CI.

ESLint 10 with `jsx-a11y` and `react-hooks`, plus Prettier, with
`eslint-config-prettier` so the two never argue. Both run first in the `check`
job: they are the cheapest signal there by two orders of magnitude.

`role="application"` needed a rule of its own. No `jsx-a11y` rule flags it on a
`div` -- the element is generic, so none of them read the role as a downgrade --
so it is a `no-restricted-syntax` selector, negative-tested along with the rest
of the config before being trusted.

**Its first run found a hole in another guard.** `validate:content` matches
exported figure components with a regex ending `(?=^export |\Z)`. JavaScript has
no `\Z` anchor; it matched a literal "Z". So the last exported figure in the
file was never checked -- `AmendsKindsChart` could have been renamed out of the
registry and silently vanished from both the site and the book, which is the
exact failure that guard exists to prevent. Now `$(?![\s\S])`, and
negative-tested on that same figure.

Also from the first run, all verified before being changed:

- `chapter.tsx` cleared its loaded chapter to `null` inside an effect on every
  navigation -- a cascading render each time. The chapter is now stored beside
  the slug that fetched it and staleness is derived during render, which removes
  the extra render and keeps the guarantee it was there for: the previous
  chapter's prose never shows for a frame under the new chapter's heading.
- A dead `rightH` in the PDF chapter opener, left from before openers stopped
  carrying a running header.
- Eleven `any`s replaced by real types -- one shared type guard in
  `markdown-renderer` in place of six `as any` casts to reach `.props`, a typed
  OPF shape in `check-epub`, and `unknown` with an explicit read in the Express
  error handler.
- `tailwind.config.ts` used `require()` in an ESM package.

One suppression, with its reason in the code: `continue-reading` reads
localStorage in an effect on purpose, because it does not exist during the
static prerender and reading it during render would make the first paint
disagree with the prerendered HTML.

`eslint-plugin-react-refresh` was tried and dropped. Its only findings were the
seven places a component is exported beside its `cva` variants -- the convention
the vendored UI kit is written in -- and seven permanent warnings teach people to
ignore lint output.

Verified: 107 browser tests pass against a real production build, including the
axe sweep over all 89 routes and a full book generation.

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

### The scratch directory is out of history

`git filter-repo --path attached_assets --invert-paths`, force-pushed to both
branches. **79 commits kept, 0 touching the directory, `.git` 16 MB → 1.8 MB**,
and the working tree byte-identical to before — verified with an empty
`git diff` against the pre-rewrite head, and by cloning the published repository
fresh: no path under `attached_assets`, and no blob from it added by any commit.

Precisely, because the looser version of this claim is misleading: what is gone
is the directory and its blobs. The *name* "The Meadows" still appears in tracked
files, deliberately in every case but one. Outside the documentation of this
cleanup it is in three places: a bibliography citation in the sex-addiction
chapter; the rights-holder register in `docs/source-notes/COPYRIGHT-NOTES.md`,
which exists in order to name what must not be reproduced, so stripping the name
would defeat it; and the two orphan charts, which reach no reader and which the
roadmap now recommends deleting for an unrelated and better reason.

**This does not finish the job, and it is worth being blunt about that.**
Rewriting history does not delete anything from GitHub: the old commits become
unreferenced but are still served at their direct SHA URL, and those SHAs appear
in the pull-request pages and the public events feed. The manual stays
retrievable until GitHub garbage-collects, which only Support can force. The
ticket is drafted in `docs/GITHUB-SUPPORT-REQUEST.md`, along with the
pre-rewrite SHAs and a rollback procedure — GitHub holding those objects is what
makes rollback possible, so the two facts are the same fact.

### The full history has been swept for secrets, once

Per-push CI scans only the working tree, by design. So the history had never been
swept — and it is short and cheap to sweep exactly now. gitleaks 8.30.1, the same
build CI pins and checksum-verified, over every commit on every branch:
**no leaks, 4.15 MB scanned.**

The tool reports 69 commits against the repository's 80, which is accounted for
rather than a gap: 3 merge commits carry no diff of their own, and 8 are commits
`filter-repo` emptied when it took `attached_assets` — their only content — away.
Those eight were read by hand as well; all carry generic scaffolding messages
from the original host and name nothing.

### A secret scan on every push, and the scratch directory is gone from the tree

This book was written from photographed clinical notes. During transcription a
clinician's personal email address and a private file link were found in two of
the photographs and redacted by hand. Hand-redaction is not a control: it worked
once, and nothing stops the next paste. `gitleaks` now runs as its own CI job.

It scans the **working tree**, not history, deliberately. Per-push CI should
answer "did this change add a secret", which is a property of the tree. Scanning
all history on every push re-asks a question whose answer cannot change without a
rewrite, so it would fail every build from now until that rewrite rather than at
the commit that caused it. The binary is pinned to 8.30.1 and its SHA-256 checked
before it runs, and `--redact` keeps a finding out of a public log.

`.gitleaks.toml` extends the maintained default ruleset and adds two path
exemptions, both generated high-entropy files that a generic-secret rule matches
on entropy alone: `package-lock.json` (a `sha512-…` integrity hash per package)
and `book-fonts-data.ts` (191 kB of base64 font outlines). Exempting them keeps
the scan useful rather than permanently red; everything else is scanned,
including all chapter prose.

A local proxy scan first, because the CI run is the tool's first execution here:
nothing in the tree matches a credential format. Worth knowing for later — a
keyword scanner would be useless on this repository. The prose says "secret",
"password" and "token" constantly, because it is a recovery book: *"We are as sick
as our secrets"*, *"I don't share passwords."* Gitleaks matches formats and
entropy rather than words, which is why it is the right tool here.

`attached_assets/` is also **removed from the working tree and gitignored** — two
identical copies of a third-party treatment centre's outpatient manual, 22 MB, and
eight superseded chapter drafts, none of it imported by anything. A clone, a
`git archive` or a GitHub zip download no longer contains the manual.

**The blobs are still in history.** That is a `git filter-repo` which rewrites
every SHA, so it stays the top roadmap item and belongs on its own day, paired
with the one-time full-history sweep that per-push CI deliberately does not do.

### The vendored UI kit is down to what the site uses

47 shadcn/ui components were checked in; **12 were reachable from the app** and
35 were not. Reachability rather than "is it imported anywhere": four of them —
`input`, `label`, `separator`, `toggle` — looked used until you notice their
only importers were themselves unused, so a first pass that counted any import
would have kept them.

`<Toaster />` was mounted in `App.tsx` and `toast()` is called nowhere in the
codebase, so every page rendered an empty toast region and shipped the code for
it. That went too, along with the `use-mobile` hook nothing imported.

**4,806 lines of unused component code, and 30 unreferenced npm dependencies.**
The dependency list is 56 → 26. A first pass at that would have removed
`drizzle-orm`, `zod`, `pg` and `date-fns`, which are used by `shared/schema.ts`
and `drizzle.config.ts` — files the first scan did not look at. `npm ci` from
the pruned lockfile installs 459 packages and the whole suite still passes.

This changes nothing a reader downloads — unused components were already
tree-shaken out. It is repository hygiene: less code to audit and a smaller
supply-chain surface for a repository about to be public.

### The home page stopped downloading the whole book's figures

Measured, not guessed: the home page fetched **349 kB** gzipped and 44 per cent
of it was `trauma-charts` — all ninety-one figures, on a page that shows none.

The download button is lazily loaded, and its comment said the exporter is not
fetched "until someone actually asks for the PDF". That was half true. React
resolves a `lazy()` import when the component renders, and the button renders
on load, so the module arrived immediately — and it imported every chart
statically, because it needs them when someone clicks Download. The charts now
load inside the same dynamic import as jsPDF, where they were always meant to
be. **Home is 194 kB.**

The two registries — ninety-one entries in the markdown renderer, ninety-one
more in the exporter — are gone, replaced by one derived from the module's own
exports in `chart-registry.ts`. 282 lines removed. Adding a figure used to mean
editing three files, and a figure registered in one map but not the other would
render on the website and be silently missing from the printed book. They were
in sync; nothing was keeping them there.

`validate:content` now fails if a component renders a `<ChartFrame>` but the
registry cannot see it. The first version of that check was vacuous — it
compared the naming convention against itself and could never fail — so it
looks for what a figure *is* rather than what it is called.

Chapter pages are unchanged at 485 kB: a chapter with figures needs them. The
31 routes that carry none still pay for them, which is the next thing worth
doing and wants a Suspense boundary per figure.

### The fonts are served from this origin

Open Sans came from Google on every page load. Three reasons that is the wrong
trade for this book, in the order they matter: a reader was disclosing to a
third party which chapter of a trauma-recovery text they had opened, and the
book should not make that trade on their behalf; it cost two extra DNS-plus-TLS
handshakes and a render-blocking stylesheet round-trip before first paint; and
it failed closed on any network that blocks Google — the browser tests have to
abort those requests to run at all, which was the tell.

Four variable WOFF2 faces, 176 kB in total, split by `unicode-range` so a reader
who never meets an accented Central European character never downloads that
file. In practice most fetch the two `latin` ones. Verified in a browser: zero
requests to Google, Open Sans loading from our own origin, `latin-ext` staying
unloaded. `check:pages` now fails if anything reaches off-origin again — privacy
properties rot quietly, and one `<link>` added back for convenience would undo
it in silence.

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
