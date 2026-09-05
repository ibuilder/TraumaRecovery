# Healing Together — Trauma Recovery Book Website

*A Practical Guide to Trauma Recovery for Ordinary People* by Matthew M. Emma.

A static-first React reading app that presents the full book: 14 chapters, 73 subchapters,
91 figures and data visualisations, a downloadable print-ready PDF of the whole thing, and
a reflowable EPUB for Kindle.

> **This content is educational and is not a substitute for professional mental health care.**
> If you are in crisis, call or text **988** (US Suicide & Crisis Lifeline).

[Changelog](CHANGELOG.md) · [Architecture](docs/ARCHITECTURE.md) ·
[Print and publishing](docs/PRINT-AND-PUBLISHING.md) · [Roadmap](docs/IMPROVEMENT-PLAN.md)

---

## Features

- **14 chapters / 73 subchapters** of markdown content (~119,000 words) rendered with `react-markdown` + GFM
- **91 figures** embedded in the prose via a ` ```chart:ChartName``` ` placeholder — Recharts plots for data, and hand-built SVG/markup for diagrams. Every one is readable without seeing it: the plots carry their numbers as a table, the diagrams describe themselves (see [Reading the figures](#reading-the-figures-without-seeing-them))
- **PDF export** generated in the browser — a typeset 734-page book with a cover,
  copyright page, contents and list of figures with page numbers, PDF bookmarks, running heads,
  folios, floated figures, widow and orphan control, and one bibliography at the back
  (see [Architecture → The printed book](docs/ARCHITECTURE.md#the-printed-book)).
  **Any single chapter exports the same way**, from its own page: its own cover, its own
  contents, only the references its text cites, and the crisis resources. The whole book takes
  about 164 seconds because it screenshots 88 figures; one chapter takes 3 to 53, depending on
  how many figures are in it
- **Full-text search** over every chapter and heading (`⌘K` / `Ctrl-K`), against a search index
  built at compile time and loaded on first use
- **Continue reading** — the last place you were is offered on the home page, kept in the browser
  and never sent anywhere
- **Crisis help** one click away in the header on every page, and in the footer
- **Linkable headings** — every `##` and `###` has a stable anchor, so search results and shared
  links land on the right paragraph
- **Dark / light theme** with system-preference detection
- **Reading progress bar**, per-chapter sidebar, and prev/next chapter navigation
- **Responsive** layout with a mobile navigation drawer
- **No third-party requests.** Open Sans is served from this origin, so nobody
  outside learns which chapter a reader opened; `check:pages` fails the build if
  that ever changes
- **Kindle edition** — a reflowable EPUB 3 built from the same chapters, with the figures
  as images *and* as reflowable data tables (see [The Kindle edition](#the-kindle-edition))

## Chapters

| # | Chapter | Subchapters |
|---|---------|-------------|
| 1 | Understanding Trauma & Basic Recovery | 10 |
| 2 | The Neuroscience of Trauma | 5 |
| 3 | Addiction Recovery | 7 |
| 4 | Dysfunctional Families | 5 |
| 5 | Childhood Trauma | 4 |
| 6 | Adult Trauma | 3 |
| 7 | Relationship Trauma | 5 |
| 8 | Cognitive Behavioral Therapy (CBT) | 6 |
| 9 | Dialectical Behavior Therapy (DBT) | 7 |
| 10 | Acceptance & Commitment Therapy (ACT) | 5 |
| 11 | Alternative Therapies | 3 |
| 12 | Spirituality in Recovery | 4 |
| 13 | Sex & Love Addiction | 7 |
| 14 | Resources & Video Library | 2 |

`npm run validate:content` keeps this structure honest — see [Content rules](#content-rules).

## Tech stack

| Layer | Choice |
|-------|--------|
| UI | React 19, TypeScript 5.9, Tailwind CSS 3, shadcn/ui (Radix) |
| Routing | wouter (base-path aware, so it works from a subdirectory) |
| Content | TypeScript modules holding markdown strings |
| Charts | Recharts 3 |
| Search | Compile-time index + `cmdk`, both lazy-loaded on first `⌘K` |
| PDF | jsPDF + html2canvas, both lazy-loaded on demand |
| Build | Vite 8 (Rolldown) |
| Server | None. The site is static files; `npm run dev` is plain Vite |

## Getting started

Requires Node.js 20.19+ (CI and the deploy workflow run 22).

```bash
npm install
npm run dev          # http://localhost:5173
```

### Scripts

| Script | What it does |
|--------|--------------|
| `npm run dev` | Vite dev server on 5173 (`npm run dev -- --port 3000` to change it) |
| `npm run check` | TypeScript typecheck |
| `npm run lint` | ESLint — see [Lint](#lint) for what it is guarding |
| `npm run lint:fix` | The same, applying what can be fixed automatically |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Fail if anything is unformatted (this is what CI runs) |
| `npm run validate:content` | Structural checks on the book content (see below) |
| `npm run manifest` | Regenerate `lib/chapters/manifest.ts` from the chapter modules |
| `npm run book-fonts` | Re-subset the embedded Liberation Serif from the system fonts |
| `npm run check:print` | Preflight an exported PDF against Amazon KDP's paperback rules |
| `npm run epub` | Build the reflowable Kindle edition into `dist/` |
| `npm run check:epub` | Preflight the EPUB against what a reading system enforces |
| `npm run check:pages` | Check a built site is servable from Pages before deploying it |
| `npm run search-index` | Regenerate `lib/search-index.json` from the chapter modules |
| `npm test` | Browser tests — see [Tests](#tests) |
| `npm run test:site` | Just the route sweep and search (~35 s) |
| `npm run test:book` | Just the printed-book checks (~90 s) |
| `npm run serve:static` | Serve `dist/public` the way GitHub Pages does |
| `npm run build:pages` | The build. Static site → `dist/public/`; set `VITE_BASE_PATH` for a project site |

## Tests

```bash
VITE_BASE_PATH=/traumarecovery/ npm run build:pages
npm test
```

Playwright, against a real production build served the way GitHub Pages serves it —
base path and `404.html` fallback included. Every defect these catch only appears in the
built, base-pathed site.

The build has to be the base-pathed one, so build with `VITE_BASE_PATH` set and run
`npm run check:pages` between the build and the tests. A base-path mistake makes the
static server answer every route with its 404 body, and all 107 tests fail for one
reason that looks like 107 reasons.

There used to be a second way into that state: a `npm run build` that opened with
`rm -rf dist` and rebuilt without a base path, silently undoing `build:pages`. It
built the Express server, which no longer exists, so it is gone and `build:pages` is
the only build.

- **`tests/site.spec.ts`** walks all 89 routes, derived from the manifest rather than
  listed, and fails on a console error, a React key warning, a blank `<main>`, an
  unresolved chart placeholder, or a page whose figure count does not match its markdown.
  Then search, the skip link, and `prefers-reduced-motion`.
- **`tests/book.spec.ts`** generates the full PDF through the site's own download button
  and reads every page's geometry back with pdf.js: folios against physical pages,
  stranded headings, the measure in characters per line, contents and list-of-figures
  entries resolving to the right page, references gathered at the back, no placeholder
  identifiers in print. A clean text layer is not a clean book — every one of these
  extracted perfectly while being visibly wrong on paper, which is why they are measured
  rather than eyeballed.

- **`tests/a11y.spec.ts`** runs axe-core over all 89 routes, then checks what axe
  cannot: that every figure has an accessible name, that every drawing hands over
  its content — as a data table or as its own `<desc>` — and that no drawing takes
  a Tab stop.

### Lint

`eslint.config.js` is a guard, not a style council — formatting is Prettier's job
and `eslint-config-prettier` turns off everything that would argue with it.

What it is actually protecting is the accessibility work, because none of it is
visible to a typecheck. A chart drawing has to stay `inert`, every landmark has to
keep its label, a figure has to carry its numbers somewhere a screen reader can
reach, and `role="application"` — the attribute that made 68 figures unreadable —
must never be written by hand. `jsx-a11y` catches most of that at the keystroke
instead of six minutes into CI, where the axe sweep runs.

One rule is spelled out by hand: no `jsx-a11y` rule flags `role="application"` on
a `div`, because a `div` is generic and no rule treats the role as a downgrade. It
is a `no-restricted-syntax` selector instead.

Lint and format run first in the `check` job. They are the cheapest signal there by
two orders of magnitude, so a bad push fails in seconds rather than after a build.

```bash
npm run check:pages     # is the built site actually servable from Pages?
```

A base-path mistake is the one deployment failure that is silent and total: the
build succeeds, the HTML is valid, every file is present, and the site is a blank
white page because the browser asks the origin for a path Pages does not serve.
`check:pages` reads the built `index.html`, resolves every asset URL against the
base and against the disk, and checks the `404.html` fallback, the chunking, that
the fonts were emitted, and that nothing on the page reaches off-origin. It runs
in CI and again in the deploy, before anything is uploaded.

Generating the book takes about two minutes; `npm run test:site` skips it.

### Reading the figures without seeing them

This book is largely made of statistics, and until recently a screen reader got
almost none of them. Recharts draws into an SVG it marks `role="application"`,
which is the most hostile role in ARIA: it tells the reader to stop interpreting
the content and forward keystrokes to the widget. What came out of one was the
`<text>` nodes in paint order —

```
"0%" "15%" "30%" "45%" "60%" "General Population" "Women" "Men" ... "3.9%" "8%"
```

— the categories and their values in separate runs with nothing tying them
together. On the radars and pies the values are not in the SVG at all, so the
data was simply absent. Every one of those surfaces also took a Tab stop that
announced nothing.

So each of the 67 plotted figures now carries its own numbers as a real table,
behind a **Show the numbers** disclosure, and the drawing is marked `inert` —
which takes it out of both the accessibility tree and the tab order, rather than
hiding it from a screen reader while leaving it focusable. The figure is named
by its title, so it announces as "figure, PTSD Prevalence by Population".

The remaining 22 figures needed nothing: they are hand-drawn, and every one that
is SVG already carries a `<title>` and `<desc>` while the rest are laid out in
plain HTML that reads as it stands.

One figure is deliberately not tabulated. The Three Circles pie is drawn at 20,
35 and 45 per cent for legibility and the sizes mean nothing, as its own source
note says; a table of those numbers would present an illustration as a
measurement. It carries a written description instead.

The table is worth having sighted too — the exact figure behind a bar used to
require hovering it — and the ebook now ships the same tables as XHTML, so they
reflow and scale with the reader's type size in a way a bitmap of a bar chart
cannot.

Sweeping all 89 routes rather than a sample also turned up two things a spot
check missed: five comparison tables whose empty corner cells — seven of them —
were marked up as a `<th>` that heads nothing, and the CBT triangle — the book's one ASCII diagram —
sitting at a contrast ratio of **1.01**, which is to say invisible to everyone in
light mode, not merely hard to read.

### Print readiness

```bash
npm run check:print ~/Downloads/healing-together-matthew-emma.pdf
```

Checks the exported PDF against Amazon KDP's paperback interior rules — trim
size, page count against the maximum for that trim, even page count, embedded
fonts, image DPI measured at the size each image is actually placed, and the
gutter required at that thickness. A PDF that opens correctly is not a PDF a
printer will accept, and none of what KDP rejects on is visible to a reader.

`docs/PRINT-AND-PUBLISHING.md` records what the current export passes, what it
does not, and what would have to change.

### The Kindle edition

```bash
VITE_BASE_PATH=/traumarecovery/ npm run build:pages
npm run epub && npm run check:epub
```

A reflowable EPUB 3, built from the same chapter markdown rather than converted
from the PDF — a PDF uploaded as an ebook becomes a fixed-layout file that is
miserable on a phone. Figures are screenshotted from the real components, since
they are React and Recharts rather than static assets, and each carries the alt
text its `ChartFrame` already provides — plus, for the plotted ones, the same data
table the site shows, as XHTML that reflows with the reader's type size.

`npm run check:epub` checks the things that fail silently and then totally: the
mimetype entry has to be first and stored or the file is not recognised as an
EPUB at all, and every XHTML document has to be well-formed XML, because one
unclosed `<hr>` is valid HTML and a fatal parse error. Both run in CI, in their
own job alongside the tests rather than after them — screenshotting 87 figures out
of a browser takes longer than everything else put together — and the built ebook
is uploaded as an artifact.

If your sandbox ships a browser but cannot reach Playwright's CDN, point at the one you
have rather than downloading: `PLAYWRIGHT_CHROMIUM_PATH=/path/to/chrome npm test`.

## Deploying to GitHub Pages

The site is a pure SPA with no backend at all, so it deploys to GitHub Pages as
static files.

1. In the repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
2. Push to `main`. [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml)
   builds and publishes automatically.

The workflow handles the three things a SPA needs on Pages:

- **Base path.** Project sites live at `https://<owner>.github.io/<repo>/`, so the build is run
  with `VITE_BASE_PATH=/<repo>/`. Vite rewrites the asset URLs and the router reads the same
  value from `import.meta.env.BASE_URL`.
- **Deep links.** `dist/public/404.html` is a copy of `index.html`, so refreshing
  `/chapter/cbt` hands the URL back to the client router instead of showing a Pages 404.
- **`.nojekyll`.** Stops Pages from stripping files whose names begin with an underscore.

To build the static site locally:

```bash
VITE_BASE_PATH=/traumarecovery/ npm run build:pages
```

Deploying anywhere that serves from the domain root (Netlify, Vercel, S3) needs no base
path — leave `VITE_BASE_PATH` unset and add a rewrite of all paths to `index.html`.

## Project structure

```
client/
├── index.html
└── src/
    ├── App.tsx                     # routes, providers, base-path-aware router
    ├── components/
    │   ├── markdown-renderer.tsx   # markdown → React, resolves chart placeholders
    │   ├── pdf-generator.tsx       # PDF export and typesetting, book or one chapter
    │   ├── trauma-charts.tsx       # all 81 figure components
    │   ├── search-dialog.tsx       # ⌘K search over the compile-time index
    │   ├── crisis-dialog.tsx       # crisis resources, reachable from the header
    │   ├── continue-reading.tsx    # offers the reader's last position
    │   └── ui/                     # the 12 shadcn/ui primitives the site uses
    ├── lib/
    │   ├── chapters/               # the book: one module per chapter, lazily loaded
    │   │   ├── manifest.ts         # generated: slugs, titles, module names
    │   │   └── load.ts             # per-chapter dynamic import
    │   ├── search-index.json       # generated: 980 searchable entries
    │   ├── reading-position.ts     # the "continue reading" bookmark
    │   └── scroll-to-anchor.ts     # deep links into lazily-loaded chapters
    └── pages/                      # home, chapters index, chapter, 404
shared/schema.ts                    # Chapter / Subchapter / BookInfo types
script/
├── build-pages.ts                  # static build for GitHub Pages
├── serve-static.ts                 # serves dist/public the way Pages does
├── generate-manifest.ts            # writes lib/chapters/manifest.ts
├── generate-search-index.ts        # writes lib/search-index.json
└── validate-content.ts             # content structure checks
tests/
├── site.spec.ts                    # every route, search, the skip link
├── book.spec.ts                    # the printed book's typeset invariants
├── a11y.spec.ts                    # axe over every route; figures and tab order
└── helpers/                        # route list, chapter content, PDF reader
```

## Authoring content

Each chapter is a TypeScript module in `client/src/lib/chapters/` exporting a `Chapter`
(typed in `shared/schema.ts`) and registered in `client/src/lib/chapters/index.ts`.

Content is a markdown string. To place a chart, put its component name on its own line:

```md
## What Is CBT?

Some prose.

```chart:TherapyEffectivenessChart```
```

The name must match an exported component in `client/src/components/trauma-charts.tsx`, and
it has to end in `Chart` — `chart-registry.ts` finds the figures by that convention rather
than by a hand-written map, so a component named otherwise is invisible to it. The same
placeholder is understood by the PDF exporter, which renders the chart offscreen and embeds
it as an image, and by the EPUB builder.

Nothing else needs editing. There used to be two registries of ninety-one entries — one in
the renderer, one in the exporter — so a new figure had to be added in three places, and one
added to only one of them would appear on the website and be silently absent from the book.

### Content rules

`npm run validate:content` fails the build if any of these break — they are the mistakes that
previously shipped:

- chapter and subchapter `id`s are unique (duplicates cause React key collisions in the sidebar)
- `order` matches the position in the array (navigation follows the array, badges show `order`)
- every chapter and subchapter body starts with an `# H1`
- every `chart:Name` placeholder resolves to a real component, and every component that
  renders a `<ChartFrame>` is one the registry can actually see
- `manifest.ts` and `search-index.json` are in step with the chapter modules — both are
  generated, and a stale one means chapters go missing from navigation or from search

It also warns about charts that are defined but never referenced. Three currently are
(`IPVPTSDChart`, `MeadowsTreatmentModelChart`, `MeadowsOutcomeChart`); they are complete
and labelled, and are waiting on an editorial decision about whether they belong in the book.

## Source notes

`docs/source-notes/` holds the transcription of the author's handwritten
treatment-program journal, which several chapters are written from, plus
`COPYRIGHT-NOTES.md` recording which photographed pages are third-party handouts
that cannot be reproduced and which primary sources to cite instead. Nothing in
that directory is published to the site.

## Crisis resources

- **988 Suicide & Crisis Lifeline** — call or text **988** (24/7)
- **Crisis Text Line** — text **HOME** to **741741** (24/7)
- **SAMHSA National Helpline** — **1-800-662-4357** (24/7)
- **National Domestic Violence Hotline** — **1-800-799-7233** (24/7)
- **Veterans Crisis Line** — **988**, then press **1** (24/7)

## License

The application code is MIT-licensed. The book text is © Matthew M. Emma; see the copyright
page in the generated PDF. Two bundled typefaces — Open Sans on the website, Liberation Serif
embedded in the PDF — are SIL OFL 1.1, which permits both. See [LICENSE](LICENSE).
