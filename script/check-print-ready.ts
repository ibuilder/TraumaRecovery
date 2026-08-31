/**
 * Preflights the exported book against Amazon KDP's paperback interior rules.
 *
 * A PDF that opens correctly is not a PDF a printer will accept. KDP rejects on
 * things a reader never sees — a font referenced rather than embedded, an image
 * that is 185 DPI at the size it is actually placed, a page count one over the
 * limit for the trim, an odd number of pages. Every check below is one of those,
 * measured from the file rather than assumed from the code that wrote it.
 *
 *   npx tsx script/check-print-ready.ts path/to/book.pdf
 *
 * Requirements are KDP's published paperback guidelines. They do change; the
 * numbers are in one table at the top so they can be updated in one place.
 */
import { readFileSync, statSync } from "fs";
import path from "path";
import { createRequire } from "module";

const require_ = createRequire(import.meta.url);

/** Points per inch, and per millimetre. */
const PT_PER_IN = 72;

/**
 * KDP trim sizes, with the maximum page count for black ink on white paper.
 * Cream paper and colour interiors are lower; the strictest that applies to a
 * given book is what matters, so colour is tracked separately below.
 */
const TRIMS: { w: number; h: number; maxBlackWhite: number }[] = [
  { w: 5, h: 8, maxBlackWhite: 828 },
  { w: 5.06, h: 7.81, maxBlackWhite: 828 },
  { w: 5.25, h: 8, maxBlackWhite: 828 },
  { w: 5.5, h: 8.5, maxBlackWhite: 828 },
  { w: 6, h: 9, maxBlackWhite: 828 },
  { w: 6.14, h: 9.21, maxBlackWhite: 828 },
  { w: 6.69, h: 9.61, maxBlackWhite: 828 },
  { w: 7, h: 10, maxBlackWhite: 780 },
  { w: 7.44, h: 9.69, maxBlackWhite: 750 },
  { w: 7.5, h: 9.25, maxBlackWhite: 750 },
  { w: 8, h: 10, maxBlackWhite: 600 },
  { w: 8.25, h: 6, maxBlackWhite: 800 },
  { w: 8.25, h: 8.25, maxBlackWhite: 600 },
  { w: 8.5, h: 8.5, maxBlackWhite: 590 },
  { w: 8.5, h: 11, maxBlackWhite: 590 },
  { w: 8.27, h: 11.69, maxBlackWhite: 780 },
];

const MIN_PAGES = 24;
/** Colour interiors are capped well below the black-and-white maximum. */
const MAX_PAGES_COLOUR = 600;
const MIN_DPI = 300;
const MAX_FILE_BYTES = 650 * 1024 * 1024;
/** Minimum outside, top and bottom margin for an interior without bleed. */
const MIN_OUTER_IN = 0.25;

/** Inside (gutter) margin, which grows with the thickness of the spine. */
function requiredGutterIn(pages: number): number {
  if (pages <= 150) return 0.375;
  if (pages <= 300) return 0.5;
  if (pages <= 500) return 0.625;
  if (pages <= 700) return 0.75;
  return 0.875;
}

interface Finding {
  ok: boolean;
  /** A hard rejection rather than something to look at. */
  blocking: boolean;
  label: string;
  detail: string;
}

const findings: Finding[] = [];
const pass = (label: string, detail: string) =>
  findings.push({ ok: true, blocking: false, label, detail });
const fail = (label: string, detail: string, blocking = true) =>
  findings.push({ ok: false, blocking, label, detail });

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("usage: tsx script/check-print-ready.ts <book.pdf>");
    process.exit(2);
  }

  // Read the bytes twice on purpose: pdf.js detaches the buffer it is handed,
  // and a raw scan of the same array afterwards silently reads zeros.
  const bytes = readFileSync(file);
  const forPdfJs = new Uint8Array(bytes);

  const { getDocument, OPS } = (await import(
    "pdfjs-dist/legacy/build/pdf.mjs"
  )) as typeof import("pdfjs-dist");
  const standardFontDataUrl = path.join(
    path.dirname(require_.resolve("pdfjs-dist/package.json")),
    "standard_fonts/"
  );
  const doc = await getDocument({
    data: forPdfJs,
    standardFontDataUrl,
    useSystemFonts: false,
    verbosity: 0,
  }).promise;

  // ---- file size ----
  const size = statSync(file).size;
  if (size <= MAX_FILE_BYTES) {
    pass("File size", `${(size / 1e6).toFixed(1)} MB, under the 650 MB limit`);
  } else {
    fail("File size", `${(size / 1e6).toFixed(1)} MB exceeds the 650 MB limit`);
  }

  // ---- trim ----
  const view = (await doc.getPage(1)).view;
  const wIn = (view[2] - view[0]) / PT_PER_IN;
  const hIn = (view[3] - view[1]) / PT_PER_IN;
  const trim = TRIMS.find(
    (t) => Math.abs(t.w - wIn) < 0.02 && Math.abs(t.h - hIn) < 0.02
  );
  const trimLabel = `${wIn.toFixed(2)} x ${hIn.toFixed(2)} in`;
  if (trim) pass("Trim size", `${trimLabel} is a supported KDP trim`);
  else fail("Trim size", `${trimLabel} is not one of KDP's trim sizes`);

  // Every page must be the same size as the first.
  const odd: number[] = [];
  for (let n = 2; n <= doc.numPages; n++) {
    const v = (await doc.getPage(n)).view;
    if (v[2] - v[0] !== view[2] - view[0] || v[3] - v[1] !== view[3] - view[1]) odd.push(n);
  }
  if (odd.length === 0) pass("Uniform page size", "every page matches page 1");
  else fail("Uniform page size", `${odd.length} pages differ, first is page ${odd[0]}`);

  // ---- page count ----
  const pages = doc.numPages;
  if (pages % 2 === 0) pass("Page parity", `${pages} pages, even`);
  else fail("Page parity", `${pages} pages — KDP requires an even count`);

  if (pages < MIN_PAGES) fail("Page count", `${pages} is below the ${MIN_PAGES}-page minimum`);
  else if (trim && pages > trim.maxBlackWhite) {
    fail(
      "Page count",
      `${pages} exceeds the ${trim.maxBlackWhite}-page maximum for ${trimLabel} ` +
        `in black ink on white paper. A 6 x 9 trim allows 828.`
    );
  } else if (trim) {
    pass("Page count", `${pages} within the ${trim.maxBlackWhite}-page maximum for this trim`);
  }

  // ---- fonts ----
  const raw = bytes.toString("latin1");
  const programs = (raw.match(/\/FontFile\d?\b/g) ?? []).length;
  if (programs > 0) {
    pass("Embedded fonts", `${programs} font programs embedded in the file`);
  } else {
    fail(
      "Embedded fonts",
      "no /FontFile entries — the text relies on the PDF base-14, which KDP rejects"
    );
  }

  // ---- images: DPI at the size each is actually placed ----
  const imageOps = new Set<number>([OPS.paintImageXObject, OPS.paintInlineImageXObject]);
  let placements = 0;
  let worstDpi = Infinity;
  let worstAt = 0;
  let colour = false;

  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const ops = await page.getOperatorList();

    // Track the current transform so the placed size is measured, not guessed.
    let ctm = [1, 0, 0, 1, 0, 0];
    const stack: number[][] = [];
    const mul = (m: number[], o: number[]) => [
      m[0]! * o[0]! + m[2]! * o[1]!,
      m[1]! * o[0]! + m[3]! * o[1]!,
      m[0]! * o[2]! + m[2]! * o[3]!,
      m[1]! * o[2]! + m[3]! * o[3]!,
      m[0]! * o[4]! + m[2]! * o[5]! + m[4]!,
      m[1]! * o[4]! + m[3]! * o[5]! + m[5]!,
    ];

    for (let i = 0; i < ops.fnArray.length; i++) {
      const fn = ops.fnArray[i]!;
      if (fn === OPS.save) stack.push(ctm.slice());
      else if (fn === OPS.restore) ctm = stack.pop() ?? ctm;
      else if (fn === OPS.transform) ctm = mul(ctm, ops.argsArray[i] as number[]);
      else if (imageOps.has(fn)) {
        placements++;
        const args = ops.argsArray[i] as [string, number, number];
        const obj = page.objs.has(args[0]) ? (page.objs.get(args[0]) as { width?: number; kind?: number }) : null;
        const px = obj?.width ?? args[1];
        // An image is drawn into a unit square scaled by the CTM.
        const placedIn = Math.abs(ctm[0]!) / PT_PER_IN;
        if (px && placedIn > 0.1) {
          const dpi = px / placedIn;
          if (dpi < worstDpi) {
            worstDpi = dpi;
            worstAt = n;
          }
        }
        // kind 3 is RGBA, 2 is RGB — anything but grayscale means colour ink.
        if (obj?.kind && obj.kind !== 1) colour = true;
      }
    }
    page.cleanup();
  }

  if (placements === 0) {
    pass("Image resolution", "no raster images in the interior");
  } else if (Math.round(worstDpi) >= MIN_DPI) {
    pass(
      "Image resolution",
      `${placements} images, lowest ${Math.round(worstDpi)} DPI at placed size`
    );
  } else {
    fail(
      "Image resolution",
      `lowest is ${Math.round(worstDpi)} DPI on page ${worstAt}, against a ${MIN_DPI} DPI minimum ` +
        `(${placements} images placed)`
    );
  }

  if (colour && trim && pages > MAX_PAGES_COLOUR) {
    fail(
      "Colour page count",
      `the interior contains colour images, and ${pages} pages exceeds the ` +
        `${MAX_PAGES_COLOUR}-page maximum for a colour interior. Printing black and white ` +
        `raises the limit but turns every figure grey.`
    );
  } else if (colour) {
    pass("Colour page count", `colour interior within the ${MAX_PAGES_COLOUR}-page maximum`);
  }

  // ---- margins ----
  const gutterIn = requiredGutterIn(pages);
  let closestOuter = Infinity;
  let closestOuterAt = 0;
  let closestVertical = Infinity;
  let closestVerticalAt = 0;

  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const content = await page.getTextContent();
    for (const item of content.items) {
      if (!("str" in item) || !item.str.trim()) continue;
      const x = item.transform[4]! / PT_PER_IN;
      const y = item.transform[5]! / PT_PER_IN;
      const right = wIn - (x + item.width / PT_PER_IN);
      const left = x;
      const outer = Math.min(left, right);
      if (outer < closestOuter) {
        closestOuter = outer;
        closestOuterAt = n;
      }
      const vertical = Math.min(y, hIn - y);
      if (vertical < closestVertical) {
        closestVertical = vertical;
        closestVerticalAt = n;
      }
    }
    page.cleanup();
  }

  const need = Math.max(MIN_OUTER_IN, gutterIn);
  if (closestOuter >= need) {
    pass(
      "Side margins",
      `narrowest is ${closestOuter.toFixed(3)} in, clearing the ${gutterIn} in gutter ` +
        `required at ${pages} pages`
    );
  } else if (closestOuter >= MIN_OUTER_IN) {
    fail(
      "Side margins",
      `narrowest is ${closestOuter.toFixed(3)} in on page ${closestOuterAt}. The outside ` +
        `minimum of ${MIN_OUTER_IN} in is met, but the inside edge needs ${gutterIn} in at ` +
        `${pages} pages, and the layout is symmetric so both sides must clear it`,
      true
    );
  } else {
    fail(
      "Side margins",
      `content sits ${closestOuter.toFixed(3)} in from the edge on page ${closestOuterAt}`
    );
  }

  if (closestVertical >= MIN_OUTER_IN) {
    pass("Top and bottom margins", `narrowest is ${closestVertical.toFixed(3)} in`);
  } else {
    fail(
      "Top and bottom margins",
      `content sits ${closestVertical.toFixed(3)} in from the edge on page ${closestVerticalAt}, ` +
        `against a ${MIN_OUTER_IN} in minimum`
    );
  }

  // ---- report ----
  const width = Math.max(...findings.map((f) => f.label.length));
  console.log(`\nKDP paperback preflight — ${path.basename(file)}\n`);
  for (const f of findings) {
    const mark = f.ok ? "  ok  " : f.blocking ? " FAIL " : " warn ";
    console.log(`[${mark}] ${f.label.padEnd(width)}  ${f.detail}`);
  }
  const blocking = findings.filter((f) => !f.ok && f.blocking);
  console.log(
    `\n${findings.filter((f) => f.ok).length} passed, ${blocking.length} blocking\n`
  );
  process.exit(blocking.length ? 1 : 0);
}

main();
