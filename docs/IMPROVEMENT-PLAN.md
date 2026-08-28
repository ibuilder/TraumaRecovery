# Healing Together — Improvement Plan

A staged plan for taking this from "a book that renders" to "a book people finish."
Written after a full audit of the repository on 2026-08-28.

Phase 0 is done and merged. A second pass has since integrated the author's
treatment journal — eight new subchapters and 22 new figures, covering chapters
1, 3, 4, 7, 8, 9, 10 and 13 — which changes a few of the numbers below and
front-loads part of Phase 3.

Phases 1–4 are proposals, ordered by value-per-effort. Nothing below requires
abandoning the current architecture.

---

## Phase 0 — Correctness and deployment (done)

| Fix | Why it mattered |
|-----|-----------------|
| `AttachmentStylesChart` data key renamed from `style` | Recharts spread `style: "Secure"` onto a DOM `<text>`; React threw and **three chapter pages rendered completely blank** (`childhood-trauma`, its `attachment-healing` subchapter, and `dysfunctional-families`) |
| CBT subchapter `id`/`order` de-duplicated | Two subchapters both had id `8-2`, causing React key collisions in the sidebar and the "Continue Reading" list |
| Chapter 13/14 order swapped to match array order | Badges read "Chapter 14" then "Chapter 13" while prev/next navigation followed array position |
| 36 bare URLs in the Resources chapter converted to markdown links | The chapter is a directory of experts and treatment centres; **none of its links were clickable** (GFM autolinks `www.x.com` but not `x.com`) |
| `package-lock.json` de-Replit-ed | 77 packages resolved to `http://package-firewall.replit.local`; `npm ci` failed for anyone outside that Replit workspace |
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

## Phase 1 — Make the first load fast (highest value)

The single largest chunk is now over 1 MB and it is **mostly book text**: all 14
chapters, ~119,000 words, are bundled into the entry chunk because
`chapters/index.ts` eagerly imports every chapter module, and the header, footer,
sidebar and home page all import `chapters` just to read titles and slugs. The
journal integration added roughly 12,000 words, so this has got worse, not
better — it is now the clearest single win available.

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

## Phase 2 — Make it a better reading experience

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

## Phase 3 — Accessibility and content safety

This is a mental-health resource, so both matter more than usual.

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

## Phase 4 — Project hygiene

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
- **Rename the package.** It is still `rest-express` from the Replit template.
- **Refresh `replit.md`.** It documents 12 chapters and stale subchapter counts.

---

## Suggested sequencing

| Phase | Effort | Reader-visible impact |
|-------|--------|----------------------|
| 1 — performance | ~1 day | Large. First paint on mobile goes from seconds to sub-second |
| 2 — reading experience | ~2–3 days | Large. Progress, search and per-chapter PDF are what make a long book usable |
| 3 — accessibility & safety | ~2 days | Large for the readers who need it most; also the right thing for this subject matter |
| 4 — hygiene | ~1 day | None directly, but it is what keeps phases 1–3 from regressing |

Phase 1 first: everything else is easier to build and test on a codebase that loads in a
second rather than five.
