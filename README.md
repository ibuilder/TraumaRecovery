# Healing Together — Trauma Recovery Book Website

*A Practical Guide to Trauma Recovery for Ordinary People* by Matthew M. Emma.

A static-first React reading app that presents the full book: 14 chapters, 73 subchapters,
81 figures and data visualisations, and a downloadable print-ready PDF of the whole thing.

> **This content is educational and is not a substitute for professional mental health care.**
> If you are in crisis, call or text **988** (US Suicide & Crisis Lifeline).

---

## Features

- **14 chapters / 73 subchapters** of markdown content (~119,000 words) rendered with `react-markdown` + GFM
- **81 figures** embedded in the prose via a ` ```chart:ChartName``` ` placeholder — Recharts plots for data, and hand-built accessible SVG/markup for diagrams
- **Full-book PDF export** generated in the browser — a typeset 718-page book with a cover,
  copyright page, contents and list of figures with page numbers, PDF bookmarks, running heads,
  folios, floated figures, widow and orphan control, and one bibliography at the back
  (see [Architecture → The printed book](docs/ARCHITECTURE.md#the-printed-book))
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
| Server (optional) | Express — only needed for the `/api/health` endpoint |

## Getting started

Requires Node.js 20.19+ (CI and the deploy workflow run 22).

```bash
npm install
npm run dev          # http://localhost:5000
```

### Scripts

| Script | What it does |
|--------|--------------|
| `npm run dev` | Express + Vite middleware dev server on `PORT` (default 5000) |
| `npm run check` | TypeScript typecheck |
| `npm run validate:content` | Structural checks on the book content (see below) |
| `npm run manifest` | Regenerate `lib/chapters/manifest.ts` from the chapter modules |
| `npm run book-fonts` | Re-subset the embedded Liberation Serif from the system fonts |
| `npm run check:print` | Preflight an exported PDF against Amazon KDP's paperback rules |
| `npm run epub` | Build the reflowable Kindle edition into `dist/` |
| `npm run check:epub` | Preflight the EPUB against what a reading system enforces |
| `npm run search-index` | Regenerate `lib/search-index.json` from the chapter modules |
| `npm test` | Browser tests — see [Tests](#tests) |
| `npm run test:site` | Just the route sweep, search and accessibility checks (~35 s) |
| `npm run test:book` | Just the printed-book checks (~90 s) |
| `npm run serve:static` | Serve `dist/public` the way GitHub Pages does |
| `npm run build` | Full build: static client + bundled Express server → `dist/` |
| `npm run build:pages` | Static-only build for GitHub Pages → `dist/public/` |
| `npm start` | Run the production Express build |

## Tests

```bash
VITE_BASE_PATH=/traumarecovery/ npm run build:pages
npm test
```

Playwright, against a real production build served the way GitHub Pages serves it —
base path and `404.html` fallback included. Every defect these catch only appears in the
built, base-pathed site.

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
text its `ChartFrame` already provides.

`npm run check:epub` checks the things that fail silently and then totally: the
mimetype entry has to be first and stored or the file is not recognised as an
EPUB at all, and every XHTML document has to be well-formed XML, because one
unclosed `<hr>` is valid HTML and a fatal parse error. Both run in CI, which
also uploads the built ebook as an artifact.

If your sandbox ships a browser but cannot reach Playwright's CDN, point at the one you
have rather than downloading: `PLAYWRIGHT_CHROMIUM_PATH=/path/to/chrome npm test`.

## Deploying to GitHub Pages

The site is a pure SPA — nothing on the page needs the Express server — so it deploys to
GitHub Pages as static files.

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

Deploying anywhere that serves from the domain root (Netlify, Vercel, S3, the bundled Express
server) needs no base path — leave `VITE_BASE_PATH` unset and add a rewrite of all paths to
`index.html`.

## Project structure

```
client/
├── index.html
└── src/
    ├── App.tsx                     # routes, providers, base-path-aware router
    ├── components/
    │   ├── markdown-renderer.tsx   # markdown → React, resolves chart placeholders
    │   ├── pdf-generator.tsx       # full-book PDF export and typesetting
    │   ├── trauma-charts.tsx       # all 81 figure components
    │   ├── search-dialog.tsx       # ⌘K search over the compile-time index
    │   ├── crisis-dialog.tsx       # crisis resources, reachable from the header
    │   ├── continue-reading.tsx    # offers the reader's last position
    │   └── ui/                     # shadcn/ui primitives
    ├── lib/
    │   ├── chapters/               # the book: one module per chapter, lazily loaded
    │   │   ├── manifest.ts         # generated: slugs, titles, module names
    │   │   └── load.ts             # per-chapter dynamic import
    │   ├── search-index.json       # generated: 980 searchable entries
    │   ├── reading-position.ts     # the "continue reading" bookmark
    │   └── scroll-to-anchor.ts     # deep links into lazily-loaded chapters
    └── pages/                      # home, chapters index, chapter, 404
server/                             # Express host for the non-static deployment
shared/schema.ts                    # Chapter / Subchapter / BookInfo types
script/
├── build.ts                        # client + server build
├── build-pages.ts                  # static build for GitHub Pages
├── serve-static.ts                 # serves dist/public the way Pages does
├── generate-manifest.ts            # writes lib/chapters/manifest.ts
├── generate-search-index.ts        # writes lib/search-index.json
└── validate-content.ts             # content structure checks
tests/
├── site.spec.ts                    # every route, search, accessibility
├── book.spec.ts                    # the printed book's typeset invariants
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

The name must match an exported component in `client/src/components/trauma-charts.tsx`.
The same placeholder is understood by the PDF exporter, which renders the chart offscreen and
embeds it as an image.

### Content rules

`npm run validate:content` fails the build if any of these break — they are the mistakes that
previously shipped:

- chapter and subchapter `id`s are unique (duplicates cause React key collisions in the sidebar)
- `order` matches the position in the array (navigation follows the array, badges show `order`)
- every chapter and subchapter body starts with an `# H1`
- every `chart:Name` placeholder resolves to a real component
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
page in the generated PDF.
