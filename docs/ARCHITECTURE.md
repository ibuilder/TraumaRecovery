# Architecture

How the site is put together, for anyone working on it. For how to run it, see
the [README](../README.md); for the plan of what to do next, see
[IMPROVEMENT-PLAN.md](./IMPROVEMENT-PLAN.md).

## Overview

*Healing Together* is a single-page React application that presents a book. The
entire book lives in the repository as TypeScript modules holding markdown, so
there is no CMS, no database and no server requirement — the production
deployment is static files on GitHub Pages.

Built with React 19, TypeScript, Tailwind CSS and Vite 8, with a design
deliberately kept calm and low-stimulation for sensitive mental health content.

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── back-to-top.tsx       # Scroll-to-top button
│   │   ├── chapter-card.tsx      # Chapter navigation cards
│   │   ├── chapter-sidebar.tsx   # Sidebar navigation for chapters
│   │   ├── continue-reading.tsx  # Offers the reader's last position
│   │   ├── crisis-dialog.tsx     # Crisis resources, one click from the header
│   │   ├── footer.tsx            # Site footer with resources
│   │   ├── header.tsx            # Site header, search and crisis entry points
│   │   ├── markdown-renderer.tsx # Markdown content renderer, heading anchors
│   │   ├── pdf-generator.tsx     # Full-book PDF export and typesetting
│   │   ├── reading-progress.tsx  # Reading progress bar
│   │   ├── search-dialog.tsx     # Cmd-K search over the compile-time index
│   │   ├── theme-provider.tsx    # Dark/light theme context
│   │   ├── theme-toggle.tsx      # Theme toggle button
│   │   ├── trauma-charts.tsx     # Data visualization components
│   │   └── ui/                   # shadcn/ui components
│   ├── lib/
│   │   ├── chapters/             # Book content, one module per chapter
│   │   │   ├── index.ts          # Chapter exports
│   │   │   ├── types.ts          # Chapter type definitions
│   │   │   ├── manifest.ts       # Generated: slugs, titles, module names
│   │   │   ├── load.ts           # Per-chapter dynamic import, promise-cached
│   │   │   ├── basicRecovery.ts  # Chapter 1 (10 subchapters)
│   │   │   ├── neuroscience.ts   # Chapter 2 (5 subchapters)
│   │   │   ├── addictionRecovery.ts # Chapter 3 (7 subchapters)
│   │   │   ├── dysfunctionalFamilies.ts # Chapter 4 (5 subchapters)
│   │   │   ├── childhoodTrauma.ts # Chapter 5 (4 subchapters)
│   │   │   ├── adultTrauma.ts    # Chapter 6 (3 subchapters)
│   │   │   ├── relationshipTrauma.ts # Chapter 7 (5 subchapters)
│   │   │   ├── cbt.ts            # Chapter 8 (6 subchapters)
│   │   │   ├── dbt.ts            # Chapter 9 (7 subchapters)
│   │   │   ├── act.ts            # Chapter 10 (5 subchapters)
│   │   │   ├── alternativeTherapies.ts # Chapter 11 (3 subchapters)
│   │   │   ├── spirituality.ts   # Chapter 12 (4 subchapters)
│   │   │   ├── sexAddiction.ts   # Chapter 13 (7 subchapters)
│   │   │   └── resources.ts      # Chapter 14 (2 subchapters)
│   │   ├── search-index.json     # Generated: 980 searchable entries
│   │   ├── search-index-loader.ts # Lazy loader, kept out of the entry bundle
│   │   ├── reading-position.ts   # The "continue reading" bookmark
│   │   ├── scroll-to-anchor.ts   # Deep links into lazily-loaded chapters
│   │   ├── queryClient.ts        # React Query setup
│   │   └── utils.ts              # Utility functions
│   ├── pages/
│   │   ├── chapter.tsx           # Chapter reading view
│   │   ├── chapters.tsx          # All chapters listing
│   │   ├── home.tsx              # Homepage with hero
│   │   └── not-found.tsx         # 404 page
│   └── App.tsx                   # Main app component
├── index.html                    # HTML entry point
└── index.css                     # Global styles

server/
├── routes.ts                     # API routes
├── storage.ts                    # Storage interface
└── index.ts                      # Server entry

shared/
└── schema.ts                     # Shared types/schemas

script/
├── build.ts                      # Client + server production build
├── build-pages.ts                # Static build for GitHub Pages
├── serve-static.ts               # Serves dist/public the way Pages does
├── generate-manifest.ts          # Writes lib/chapters/manifest.ts
├── generate-search-index.ts      # Writes lib/search-index.json
└── validate-content.ts           # Content structure checks

tests/
├── site.spec.ts                  # Every route, search, accessibility
├── book.spec.ts                  # The printed book's typeset invariants
└── helpers/                      # Route list, chapter content, PDF reader
```

## Key Features
- **14 comprehensive chapters** (73 subchapters) covering trauma recovery topics
- **81 figures** — Recharts plots for data, accessible inline SVG and markup for diagrams
- **Full-book PDF export** generated client-side (jsPDF + html2canvas, lazy-loaded)
- **Markdown rendering** with react-markdown and remark-gfm
- **Dark/light theme** with system preference detection
- **Reading progress bar** for tracking position
- **Responsive sidebar** navigation on desktop
- **Mobile-friendly** with hamburger menu
- **Back-to-top button** for long content
- **Full-text search** (Cmd-K) over a compile-time index, ranked heading-first
- **Continue reading** from where the reader left off, stored in the browser only
- **Crisis resources** in the footer and one click away in the header

## Book Chapters
1. Understanding Trauma & Basic Recovery (10 subchapters: Four Pillars Framework, Addiction & Self-Harm, Types of Trauma, Window of Tolerance, and more)
2. The Neuroscience of Trauma (5 subchapters: Brain Anatomy, Neurochemistry, Nervous System & Polyvagal Theory, Trauma-Related Disorders, Neurobiology of Healing)
3. Addiction Recovery (7 subchapters: Disease Model, Brain Chemistry, SUD, Recovery Programs, Relapse Prevention, Urge Surfing)
4. Dysfunctional Families (5 subchapters: Family Patterns, Healthy Boundaries, Inner Child Work, Breaking Generational Cycles)
5. Childhood Trauma (4 subchapters: Inner Child Work, Breaking From Shame, Attachment Healing, Developmental Impact of Trauma)
6. Adult Trauma (3 subchapters: Processing Trauma, Rebuilding Life, Coping Strategies)
7. Relationship Trauma (5 subchapters: Toxic Patterns, Rebuilding Trust, Safety Planning, Building Healthy Relationships)
8. Cognitive Behavioral Therapy (6 subchapters: Challenging Negative Thoughts, Behavioral Strategies, The CBT Triangle, Cognitive Distortions, Competent Protectors/IFS)
9. Dialectical Behavior Therapy (7 subchapters: Mindfulness, Wise Mind, Distress Tolerance, Emotion Regulation, Interpersonal Effectiveness, DBT Acronyms Guide)
10. Acceptance & Commitment Therapy (5 subchapters: Values Clarification, Defusion Techniques, The ACT Hexaflex, Acceptance in Practice)
11. Alternative Therapies (3 subchapters: Somatic Therapy, EMDR, TMS)
12. Spirituality in Recovery (4 subchapters: Higher Powers, Serenity Prayer, Recovery Prayers, Spiritual Practices)
13. Sex & Love Addiction (7 subchapters: Neuroscience, Carnes' Addiction Cycle, Three Circles, Love Addiction & Trauma Bonding, Clinical Models, Recovery & Sexual Sobriety)
14. Resources & Video Library (2 subchapters: Expert Videos, Treatment Centers)

Chapter order, ids and chart references are enforced by `npm run validate:content`.

## YouTube Video Library Features
- Dr. Gabor Maté videos and podcast appearances
- Dr. Bessel van der Kolk lectures and resources
- Triangle Wellness / Dr. Sara Koenig information
- The Refuge trauma treatment center
- Sierra Tucson treatment programs
- Additional recommended channels (Patrick Teahan, Crappy Childhood Fairy, Therapy in a Nutshell)
- Online courses and apps for recovery
- Crisis resources

## Running the Project
The application runs on port 5000 with `npm run dev`.

Other entry points:
- `npm run check` — TypeScript typecheck
- `npm run validate:content` — content structure checks
- `npm run manifest` / `npm run search-index` — regenerate the two generated files
- `npm test` — the browser suite (see the [README](../README.md#tests))
- `npm run check:print` — preflight an exported PDF against Amazon KDP's rules
- `npm run build` — client + bundled Express server
- `npm run build:pages` — static build for GitHub Pages (see README)

The tech stack is listed in the [README](../README.md#tech-stack); it is kept in one
place because it went stale here first.

The site is also published to GitHub Pages from `main`; nothing on the page needs
the Express server.

## The printed book

`client/src/components/pdf-generator.tsx` is not a dump of the site into a PDF. It
typesets a 718-page book in the browser, and most of what is in it is there because
the alternative produced a page a reader would notice. The constants at the top of
that file are the whole design; changing one of them changes the book, so a note on
what each is for:

**The page grid.** US Letter, because the people who print this print it at home and
a 6 x 9 trim would come out scaled or cropped. The text block is 137.9 mm wide, set
in 11.5 pt Times, which gives a median line of 76 characters. That number is the
point of the whole grid: at the original 165 mm block set in 11 pt the median ran
102 characters, roughly half again the length an eye can track back to the start of
the next line without losing its place. The margins that buys are not waste — this
is a workbook and readers write in it. `TEXT_TOP` and `PAGE_FLOOR` put the running
head and the folio on a real grid rather than floating clear of the text, which is
worth three extra lines a page.

**Figures break the measure.** `FIGURE_WIDTH` is 165 mm, wider than the text block
and centred on the paper, and tables use the same width. Narrowing the line was for
the prose; there was never a reason to shrink every chart's axis labels with it.

**Figures float.** A chart is up to 110 mm tall and never splits, so setting it in
sequence meant that whenever it did not fit, it and the heading above it both moved
and left up to 130 mm of blank paper behind. It is held instead, the prose carries on
filling the page, and it is set at the first point it fits whole — which is what a
book has always done with a plate.

**Widows, orphans and reserves.** `addText` decides where a block may break before it
places a single line of it, and `placeHeading` holds a heading back until it knows how
tall the thing under it is. Two rules there are easy to get wrong and both strand
headings: a three-line paragraph cannot leave two lines behind a break (two here and
one over is a widow, one here and two over is an orphan, so it moves whole and the
heading has to clear all three), and a pulled quote is set atomic, so it comes with
its heading entire or not at all.

**Front matter is reserved, then filled.** The contents and the list of figures are
measured first, that many blank pages are inserted, the body is set, and only then
are the two lists drawn into the pages held for them. That is what lets every folio
match its physical page and every contents entry point at the right one.

**References.** Each chapter's inline `## References` section is skipped during export
and the whole book's citations are gathered into one bibliography at the back,
de-duplicated on surname, year and main title.

**The fonts are in the file.** `client/src/lib/book-fonts-data.ts` is Liberation
Serif, subset to the characters the book uses. jsPDF's `times` is one of the PDF
base-14, which is a reference to a font rather than a font, and print services
reject it. Liberation Serif is metric-compatible with Times, so the swap changed
nothing about where the lines break. Regenerate with `npm run book-fonts`; see
[PRINT-AND-PUBLISHING.md](./PRINT-AND-PUBLISHING.md) for why it matters.

Verifying a change here means looking at pages, not at the text layer: mid-animation
charts, stranded headings and an off-by-two folio all produced a clean extraction and
a visibly wrong book. `tests/book.spec.ts` holds the measurable half of that —
`npm run test:book` generates the book and reads every page back. It will not tell
you a page is ugly, so still look at one.

## Design Philosophy
- Calm, professional aesthetic suitable for mental health content
- High contrast and accessibility compliance
- Content-forward design with minimal distractions
- Generous spacing for readability
- Subtle animations that don't overwhelm
