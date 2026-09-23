/**
 * Builds the Kindle edition as a reflowable EPUB 3.
 *
 * The PDF is a fixed-layout artefact: a page is a page, and on a phone that
 * means pinching and scrolling sideways through a 6-inch-wide column. Amazon
 * accepts a PDF as an ebook and produces exactly that, which is why they ask for
 * EPUB instead. This is a different rendering of the same book, not a conversion
 * of the PDF — it comes from the chapter markdown, so the text reflows to
 * whatever the reader's device and font size happen to be.
 *
 * Figures are screenshotted from the real components, the same way the PDF
 * captures them, because they are React and Recharts rather than static assets.
 * Each one carries the alt text its `ChartFrame` already provides, which makes
 * the ebook rather more accessible than the PDF.
 *
 *   npm run build:pages && npm run epub
 *
 * Needs the built site because the figures are captured from it.
 */
import { execFileSync } from "child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import path from "path";
import { marked } from "marked";
import { chromium } from "playwright";
import { chapters } from "../client/src/lib/chapters/index";
import { bookInfo } from "../client/src/lib/chapters/types";

const ROOT = path.resolve(import.meta.dirname, "..");
const STAGE = path.join(ROOT, "dist", "epub");
const OUT = path.join(ROOT, "dist", "healing-together.epub");
const PORT = 4181;
const BASE = "/TraumaRecovery";

/** Stable across rebuilds so a reader's library entry is not duplicated. */
const BOOK_ID = "urn:uuid:6f1b9e2c-3d47-4a58-9c1e-2b7f0a5d8e34";

const xml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

interface Section {
  /** File name inside OEBPS/text. */
  file: string;
  title: string;
  markdown: string;
  /** Chapter openers get a level-1 entry in the navigation, subchapters a nested one. */
  isChapter: boolean;
}

function sections(): Section[] {
  const out: Section[] = [];
  for (const chapter of chapters) {
    out.push({
      file: `ch${String(chapter.order).padStart(2, "0")}.xhtml`,
      title: `${chapter.order}. ${chapter.title}`,
      markdown: chapter.content,
      isChapter: true,
    });
    for (const sub of chapter.subchapters) {
      out.push({
        file: `ch${String(chapter.order).padStart(2, "0")}-${String(sub.order).padStart(2, "0")}.xhtml`,
        title: `${chapter.order}.${sub.order} ${sub.title}`,
        markdown: sub.content,
        isChapter: false,
      });
    }
  }
  return out;
}

/**
 * One step of a walk over a diagram's own markup: an element opening, a run of
 * text, or an element closing. Collected in the page and assembled into XHTML
 * here, so that nothing has to be escaped inside the browser callback.
 */
type TextToken =
  | { t: "open"; tag: string; scope?: string }
  | { t: "text"; v: string }
  | { t: "close"; tag: string };

interface Figure {
  name: string;
  file: string;
  alt: string;
  /** Header row then body rows, when the figure has tabular data behind it. */
  table?: { head: string[]; rows: string[][] };
  /**
   * What the drawing says, for a figure with no data table behind it.
   *
   * Nineteen of the book's figures are not plots but diagrams laid out in HTML
   * — boxes, ladders, a side-by-side table — so their content is text on the
   * website and reaches a screen reader as text. Screenshotting one turns that
   * text into pixels, which would be the one place in this build where the
   * ebook is less accessible than the page it was made from. The other five are
   * hand-drawn SVGs, and this carries the written description each already
   * holds.
   */
  text?: TextToken[];
}

/**
 * Screenshots every referenced figure from the built site.
 *
 * Rendered rather than re-implemented: the figures are React components with a
 * Recharts runtime, and the only honest way to get a picture of one is to let a
 * browser draw it. Alt text comes from the figure's own title and subtitle.
 *
 * The numbers behind each figure come across as a real table rather than only
 * as pixels. An ebook is read on a phone as often as anywhere, and a reader who
 * has scaled the text up cannot scale up a bitmap of a bar chart; a screen
 * reader cannot read one at all. A figure with no table behind it is a diagram
 * drawn in markup, and its own words come across the same way — as its markup
 * where it has any, and as the written description a hand-drawn SVG carries.
 */
async function captureFigures(
  names: string[],
  imageDir: string
): Promise<Map<string, Figure>> {
  const found = new Map<string, Figure>();
  const server = execFileSync;
  void server;

  const browser = await chromium.launch({
    ...(process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
      : {}),
  });
  const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
  await page.route("**://fonts.g*/**", (r) => r.abort());

  // Walk the chapters rather than mounting components directly: the site is
  // already the harness that renders them, and it is the rendering readers see.
  //
  // Which route holds which figure is already written down, in the placeholders
  // in the prose. Reading it here rather than walking every route is worth
  // several minutes of CI: a route with no figure on it used to sit out the
  // whole 8-second wait for one to appear before moving on, and roughly a third
  // of the book's pages carry none.
  const routeCharts = new Map<string, string[]>();
  const placements = (markdown: string) =>
    [...markdown.matchAll(/^```chart:(\w+)/gm)].map((m) => m[1]!);
  for (const chapter of chapters) {
    routeCharts.set(`/chapter/${chapter.slug}`, placements(chapter.content));
    for (const sub of chapter.subchapters) {
      routeCharts.set(
        `/chapter/${chapter.slug}/subchapter/${sub.slug}`,
        placements(sub.content)
      );
    }
  }

  const wanted = new Set(names);
  for (const [route, charts] of routeCharts) {
    if (found.size === wanted.size) break;
    // Nothing here that is both wanted and still missing.
    if (!charts.some((c) => wanted.has(c) && !found.has(c))) continue;

    await page.goto(`http://localhost:${PORT}${BASE}${route}`, { waitUntil: "load" });
    await page
      .locator("main figure")
      .first()
      .waitFor({ timeout: 8000 })
      .catch(() => null);
    // Long enough for the entry animations to land; a chart caught mid-sweep is
    // a chart with the wrong numbers drawn on it.
    await page.waitForTimeout(1800);

    // `data-chart-slot`, not `data-chart`: the vendored ChartContainer uses
    // the latter for its own CSS scoping, so the bare name also matches chart
    // internals. This only ever worked because unknown names are skipped below.
    const tagged = await page.locator("main [data-chart-slot]").all();
    for (const holder of tagged) {
      const component = (await holder.getAttribute("data-chart-slot")) ?? "";
      if (!component || !wanted.has(component) || found.has(component)) continue;
      const fig = holder.locator("figure").first();
      if (!(await fig.count())) continue;
      const text = async (sel: string) =>
        (
          await fig
            .locator(sel)
            .first()
            .textContent()
            .catch(() => "")
        )?.trim() ?? "";
      const title = await text("[data-chart-title]");
      const subtitle = await text("[data-chart-subtitle]");

      // No named helper inside this callback: tsx builds with esbuild's
      // keepNames, which wraps a named function in a `__name` call that does
      // not exist in the page — the evaluate throws `__name is not defined`.
      const table = await fig.evaluate((el) => {
        const t = el.querySelector("[data-chart-data] table");
        if (!t) return undefined;
        const rows = Array.from(t.querySelectorAll("tr")).map((row) =>
          Array.from(row.children).map((c) => c.textContent?.trim() ?? "")
        );
        const [head, ...body] = rows;
        if (!head) return undefined;
        return { head, rows: body };
      });

      // No table means the figure is a diagram made of markup rather than a
      // plot, and the words inside it are the figure. Walk the drawing and
      // keep the structure worth keeping — its lists, its tables, its
      // paragraphs — dropping the wrapper divs and the arrows the page itself
      // marks `aria-hidden`. Tokens rather than a string: escaping happens
      // where `xml` lives.
      const diagramText = table
        ? undefined
        : await fig.evaluate((el) => {
            const drawing = el.querySelector(":scope > div");
            if (!drawing) return undefined;
            const keep: Record<string, string> = {
              TABLE: "table",
              THEAD: "thead",
              TBODY: "tbody",
              TFOOT: "tbody",
              TR: "tr",
              TH: "th",
              TD: "td",
              CAPTION: "caption",
              UL: "ul",
              OL: "ol",
              LI: "li",
              DL: "ul",
              DT: "li",
              DD: "li",
              BLOCKQUOTE: "blockquote",
              CODE: "code",
              EM: "em",
              I: "em",
              STRONG: "strong",
              B: "strong",
              P: "p",
              H1: "p",
              H2: "p",
              H3: "p",
              H4: "p",
              H5: "p",
              H6: "p",
            };
            const tokens: TextToken[] = [];
            // A figure whose meaning no table can carry writes it out for a
            // screen reader instead, in a paragraph the `<figure>` points at.
            // On the website that is enough; here it would be thrown away with
            // the rest of the page, so it goes in first.
            const describedBy = el.getAttribute("aria-describedby");
            const written = describedBy
              ? (document.getElementById(describedBy)?.textContent ?? "")
                  .replace(/\s+/g, " ")
                  .trim()
              : "";
            if (written) {
              tokens.push({ t: "open", tag: "p" });
              tokens.push({ t: "text", v: written });
              tokens.push({ t: "close", tag: "p" });
            }
            // An explicit stack, not recursion: a named inner function would be
            // wrapped in the `__name` call described above and never run.
            const stack: { node?: Node; close?: string }[] = [];
            for (let i = drawing.childNodes.length - 1; i >= 0; i--)
              stack.push({ node: drawing.childNodes[i]! });
            while (stack.length) {
              const item = stack.pop()!;
              if (item.close) {
                tokens.push({ t: "close", tag: item.close });
                continue;
              }
              const node = item.node!;
              if (node.nodeType === Node.TEXT_NODE) {
                const v = (node.nodeValue ?? "").replace(/\s+/g, " ");
                if (v.trim()) tokens.push({ t: "text", v });
                continue;
              }
              if (node.nodeType !== Node.ELEMENT_NODE) continue;
              const child = node as HTMLElement;
              if (child.getAttribute("aria-hidden") === "true") continue;
              if (child.tagName === "SCRIPT" || child.tagName === "STYLE") continue;
              // A hand-drawn SVG has no markup to lift out — its labels are
              // `<text>` nodes in paint order, which is how the drawing looks
              // and not how it reads. It carries a written description instead,
              // and that is the thing worth keeping.
              if (child.tagName.toLowerCase() === "svg") {
                const said =
                  child.querySelector("desc")?.textContent ??
                  child.querySelector("title")?.textContent ??
                  "";
                const v = said.replace(/\s+/g, " ").trim();
                if (v) {
                  tokens.push({ t: "open", tag: "p" });
                  tokens.push({ t: "text", v });
                  tokens.push({ t: "close", tag: "p" });
                }
                continue;
              }
              if (child.tagName === "BR") {
                tokens.push({ t: "text", v: " " });
                continue;
              }
              const tag = keep[child.tagName];
              if (tag) {
                const scope = child.getAttribute("scope");
                tokens.push(
                  tag === "th" && scope ? { t: "open", tag, scope } : { t: "open", tag }
                );
                // Pushed before the children so it pops after them.
                stack.push({ close: tag });
              }
              for (let i = child.childNodes.length - 1; i >= 0; i--)
                stack.push({ node: child.childNodes[i]! });
            }
            return tokens.length ? tokens : undefined;
          });

      // The disclosure is a website affordance; in the ebook the table is laid
      // out as its own element, so it must not also appear inside the picture.
      await fig.evaluate((el) =>
        el.querySelectorAll<HTMLElement>("[data-chart-data]").forEach((d) => {
          d.style.display = "none";
        })
      );

      const file = `${component}.png`;
      await fig.screenshot({ path: path.join(imageDir, file) });
      found.set(component, {
        name: component,
        file,
        alt: subtitle ? `${title}. ${subtitle}` : title || component,
        table,
        text: diagramText,
      });
    }
  }
  await browser.close();
  return found;
}

/**
 * HTML from a markdown parser is not XHTML, and an EPUB reader will refuse the
 * whole file over it. `marked` leaves void elements open — 352 bare `<hr>` in
 * this book — which is valid HTML and a fatal XML parse error.
 */
const VOID_ELEMENTS = "area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr";

function toXhtml(html: string): string {
  return html.replace(
    new RegExp(`<(${VOID_ELEMENTS})\\b([^>]*?)\\s*/?>`, "gi"),
    (_all, tag: string, attrs: string) => `<${tag}${attrs.trimEnd()}/>`
  );
}

/** The figure's numbers as XHTML, so they reflow and can be read aloud. */
function renderFigureTable(fig: Figure): string {
  if (!fig.table || fig.table.rows.length === 0) return "";
  const { head, rows } = fig.table;
  const cell = (tag: string, scope: string, value: string) =>
    `<${tag} scope="${scope}">${xml(value)}</${tag}>`;
  const body = rows
    .map(
      (row) =>
        "<tr>" +
        row
          .map((value, i) =>
            i === 0 ? cell("th", "row", value) : `<td>${xml(value)}</td>`
          )
          .join("") +
        "</tr>"
    )
    .join("\n");
  // No caption: the image's alt text directly above already names the figure,
  // and a caption repeating it would have a reader hear the title twice.
  return (
    `\n<table class="chart-data">` +
    `<thead><tr>${head.map((h) => cell("th", "col", h)).join("")}</tr></thead>` +
    `<tbody>\n${body}\n</tbody></table>\n`
  );
}

/** Tags that sit inside a paragraph rather than replacing one. */
const INLINE_TAGS = new Set(["em", "strong", "code"]);

/**
 * The diagram's own words as XHTML, so they reflow and can be read aloud.
 *
 * The picture stays: it is the layout, and losing it would cost a sighted
 * reader the shape of the thing. This goes underneath it, the same way the
 * numbers do for a plot.
 */
function renderFigureText(fig: Figure): string {
  if (!fig.text || fig.text.length === 0) return "";
  let out = "";
  let pending = "";
  let depth = 0;
  // Text that ended up outside any block — a bare run inside a layout div —
  // still has to land in one, or the fragment is a paragraph the reader's
  // stylesheet cannot touch.
  const flush = () => {
    if (pending.trim()) out += `<p>${pending.trim()}</p>`;
    pending = "";
  };
  const write = (html: string) => {
    if (depth === 0) pending += html;
    else out += html;
  };
  for (const token of fig.text) {
    if (token.t === "text") {
      write(xml(token.v));
    } else if (INLINE_TAGS.has(token.tag)) {
      write(token.t === "open" ? `<${token.tag}>` : `</${token.tag}>`);
    } else if (token.t === "open") {
      if (depth === 0) flush();
      depth++;
      out += token.scope ? `<${token.tag} scope="${token.scope}">` : `<${token.tag}>`;
    } else {
      depth--;
      out += `</${token.tag}>`;
    }
  }
  flush();
  return out.trim() ? `\n<div class="chart-text">${out}</div>\n` : "";
}

/** Renders one section's markdown, swapping chart placeholders for the images. */
function renderSection(
  section: Section,
  figures: Map<string, Figure>,
  missing: Set<string>
): string {
  const withImages = section.markdown.replace(
    /^```chart:(\w+)```?\s*$/gm,
    (_all, component: string) => {
      const fig = figures.get(component);
      if (!fig) {
        missing.add(component);
        return "";
      }
      return (
        `\n<figure class="chart">` +
        `<img src="../images/${fig.file}" alt="${xml(fig.alt)}"/>` +
        renderFigureTable(fig) +
        renderFigureText(fig) +
        `</figure>\n`
      );
    }
  );

  const body = toXhtml(marked.parse(withImages, { async: false, gfm: true }) as string);
  return `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en">
<head>
  <meta charset="utf-8"/>
  <title>${xml(section.title)}</title>
  <link rel="stylesheet" type="text/css" href="../style.css"/>
</head>
<body>
<section epub:type="${section.isChapter ? "chapter" : "subchapter"}">
${body}
</section>
</body>
</html>
`;
}

const STYLESHEET = `/* Deliberately restrained: a reading system's own defaults for size and
   leading are the reader's preference, and overriding them is rude. */
body { margin: 0 5%; line-height: 1.5; }
h1 { font-size: 1.6em; margin: 1.2em 0 0.6em; line-height: 1.25; }
h2 { font-size: 1.25em; margin: 1.6em 0 0.5em; line-height: 1.3; }
h3 { font-size: 1.1em; margin: 1.4em 0 0.4em; }
h4 { font-size: 1em; margin: 1.2em 0 0.3em; }
p { margin: 0 0 0.9em; text-align: left; }
blockquote {
  margin: 1.2em 1.4em; padding-left: 0.9em;
  border-left: 3px solid #999; font-style: italic; color: #444;
}
figure.chart { margin: 1.4em 0; text-align: center; page-break-inside: avoid; }
figure.chart img { max-width: 100%; height: auto; }
/* The figure's own numbers. Left-aligned inside a centred figure, and allowed
   to break across pages — some of these run to a dozen rows. */
table.chart-data { text-align: left; page-break-inside: auto; margin-top: 0.6em; }
/* The words of a diagram that is markup rather than a plot. Left-aligned
   inside a centred figure, like the tables, and set slightly back so it reads
   as the figure's content and not as the chapter resuming. */
div.chart-text { text-align: left; margin-top: 0.6em; font-size: 0.95em; }
div.chart-text p { margin: 0 0 0.5em; }
div.chart-text > :last-child { margin-bottom: 0; }
table { border-collapse: collapse; width: 100%; margin: 1.2em 0; font-size: 0.9em; }
th, td { border: 1px solid #bbb; padding: 0.35em 0.5em; text-align: left; vertical-align: top; }
th { background: #f2f2f2; }
ul, ol { margin: 0 0 0.9em 1.3em; padding: 0; }
li { margin-bottom: 0.3em; }
hr { border: 0; border-top: 1px solid #ccc; margin: 1.6em 0; }
code { font-size: 0.9em; }
`;

async function main() {
  if (!existsSync(path.join(ROOT, "dist", "public", "index.html"))) {
    console.error("No built site. Run `npm run build:pages` first.");
    process.exit(1);
  }

  rmSync(STAGE, { recursive: true, force: true });
  const textDir = path.join(STAGE, "OEBPS", "text");
  const imageDir = path.join(STAGE, "OEBPS", "images");
  mkdirSync(textDir, { recursive: true });
  mkdirSync(imageDir, { recursive: true });
  mkdirSync(path.join(STAGE, "META-INF"), { recursive: true });

  // Serve the built site for the figure capture.
  const serve = execFileSync;
  void serve;
  const { spawn } = await import("child_process");
  const server = spawn(
    "npx",
    [
      "tsx",
      path.join(ROOT, "script", "serve-static.ts"),
      "--port",
      String(PORT),
      "--base",
      BASE,
    ],
    { cwd: ROOT, stdio: "ignore", detached: false }
  );
  await new Promise((r) => setTimeout(r, 4000));

  let figuresByTitle: Map<string, Figure>;
  try {
    const referenced = new Set<string>();
    for (const s of sections()) {
      for (const m of s.markdown.matchAll(/^```chart:(\w+)/gm)) referenced.add(m[1]!);
    }
    console.log(`capturing ${referenced.size} figures...`);
    figuresByTitle = await captureFigures([...referenced], imageDir);
    console.log(`captured ${figuresByTitle.size}`);
  } finally {
    server.kill();
  }

  const all = sections();
  let placed = 0;
  const missing = new Set<string>();
  for (const section of all) {
    const html = renderSection(section, figuresByTitle, missing);
    placed += (html.match(/<figure class="chart">/g) ?? []).length;
    writeFileSync(path.join(textDir, section.file), html, "utf8");
  }
  if (missing.size) {
    console.error(
      `\nnot captured, so dropped from the ebook: ${[...missing].join(", ")}`
    );
    process.exitCode = 1;
  }

  writeFileSync(path.join(STAGE, "OEBPS", "style.css"), STYLESHEET, "utf8");
  writeFileSync(path.join(STAGE, "mimetype"), "application/epub+zip");
  writeFileSync(
    path.join(STAGE, "META-INF", "container.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
`,
    "utf8"
  );

  // ---- navigation ----
  const navItems: string[] = [];
  for (let i = 0; i < all.length; i++) {
    const s = all[i]!;
    if (!s.isChapter) continue;
    const subs = all.slice(i + 1).filter((x, j) => !x.isChapter && all[i + 1 + j] === x);
    const nested = subs
      .map((x) => `        <li><a href="text/${x.file}">${xml(x.title)}</a></li>`)
      .join("\n");
    navItems.push(
      `      <li><a href="text/${s.file}">${xml(s.title)}</a>` +
        (nested ? `\n      <ol>\n${nested}\n      </ol>\n      ` : "") +
        `</li>`
    );
  }
  writeFileSync(
    path.join(STAGE, "OEBPS", "nav.xhtml"),
    `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en">
<head><meta charset="utf-8"/><title>Contents</title></head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Contents</h1>
    <ol>
${navItems.join("\n")}
    </ol>
  </nav>
</body>
</html>
`,
    "utf8"
  );

  // ---- package ----
  const manifest = [
    `    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
    `    <item id="css" href="style.css" media-type="text/css"/>`,
    ...all.map(
      (s, i) =>
        `    <item id="s${i}" href="text/${s.file}" media-type="application/xhtml+xml"/>`
    ),
    ...[...figuresByTitle.values()].map(
      (f, i) => `    <item id="img${i}" href="images/${f.file}" media-type="image/png"/>`
    ),
  ].join("\n");
  const spine = all.map((_, i) => `    <itemref idref="s${i}"/>`).join("\n");

  writeFileSync(
    path.join(STAGE, "OEBPS", "content.opf"),
    `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="book-id">${BOOK_ID}</dc:identifier>
    <dc:title>${xml(bookInfo.title)}</dc:title>
    <dc:creator>${xml(bookInfo.author)}</dc:creator>
    <dc:language>en</dc:language>
    <dc:description>${xml(bookInfo.description)}</dc:description>
    <dc:rights>Copyright ${new Date().getFullYear()} ${xml(bookInfo.author)}</dc:rights>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, "Z")}</meta>
    <meta property="schema:accessMode">textual</meta>
    <meta property="schema:accessMode">visual</meta>
    <meta property="schema:accessibilityFeature">tableOfContents</meta>
    <meta property="schema:accessibilityFeature">alternativeText</meta>
  </metadata>
  <manifest>
${manifest}
  </manifest>
  <spine>
${spine}
  </spine>
</package>
`,
    "utf8"
  );

  // ---- zip ----
  // The mimetype has to be the first entry and stored uncompressed, or a
  // reading system will not recognise the file as an EPUB at all.
  rmSync(OUT, { force: true });
  execFileSync("zip", ["-X", "-0", OUT, "mimetype"], { cwd: STAGE, stdio: "ignore" });
  execFileSync("zip", ["-X", "-9", "-r", OUT, ".", "-x", "mimetype"], {
    cwd: STAGE,
    stdio: "ignore",
  });

  const { statSync } = await import("fs");
  console.log(
    `wrote ${OUT} — ${all.length} sections, ${figuresByTitle.size} figures ` +
      `(${placed} placements), ${(statSync(OUT).size / 1e6).toFixed(1)} MB`
  );
}

main();
