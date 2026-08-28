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
- **Full-book PDF export** generated in the browser (cover, copyright page, table of contents,
  running headers, page numbers, captured chart images)
- **Dark / light theme** with system-preference detection
- **Reading progress bar**, per-chapter sidebar, and prev/next chapter navigation
- **Responsive** layout with a mobile navigation drawer
- **Crisis resources** surfaced in the footer on every page

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
| UI | React 18, TypeScript, Tailwind CSS, shadcn/ui (Radix) |
| Routing | wouter (base-path aware, so it works from a subdirectory) |
| Content | TypeScript modules holding markdown strings |
| Charts | Recharts |
| PDF | jsPDF + html2canvas, both lazy-loaded on demand |
| Build | Vite 7 |
| Server (optional) | Express — only needed for the `/api/health` endpoint |

## Getting started

Requires Node.js 20+.

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
| `npm run build` | Full build: static client + bundled Express server → `dist/` |
| `npm run build:pages` | Static-only build for GitHub Pages → `dist/public/` |
| `npm start` | Run the production Express build |

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
    │   ├── pdf-generator.tsx       # full-book PDF export
    │   ├── trauma-charts.tsx       # all 81 figure components
    │   └── ui/                     # shadcn/ui primitives
    ├── lib/chapters/               # the book: one module per chapter
    └── pages/                      # home, chapters index, chapter, 404
server/                             # Express host for the non-static deployment
shared/schema.ts                    # Chapter / Subchapter / BookInfo types
script/
├── build.ts                        # client + server build
├── build-pages.ts                  # static build for GitHub Pages
└── validate-content.ts             # content structure checks
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

It also warns about charts that are defined but never referenced.

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
