import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";
import { sitePath } from "./routes";

const require_ = createRequire(import.meta.url);
const PDFJS = "pdfjs-dist/legacy/build/pdf.mjs";

/** Points per millimetre, which is how jsPDF laid the book out. */
export const PT_PER_MM = 72 / 25.4;
export const PAGE_HEIGHT_MM = 279.4;

/** One run of text, positioned from the top of the page in millimetres. */
export interface TextItem {
  text: string;
  /** Distance from the left edge. */
  x: number;
  /** Baseline, measured down from the top edge. */
  y: number;
  /** Font size in points. */
  size: number;
}

export interface BookPage {
  number: number;
  items: TextItem[];
  hasImage: boolean;
}

/**
 * Clicks the site's own download button and returns the bytes.
 *
 * Deliberately the real export path rather than calling the generator
 * directly: the charts are captured by rendering the actual components into an
 * offscreen React root, and defects have hidden in exactly that seam — charts
 * screenshotted part-way through their entry animation, for one.
 */
export async function downloadBook(page: Page): Promise<Uint8Array> {
  await page.route("**://fonts.g*/**", (r) => r.abort());
  await page.goto(sitePath("/"), { waitUntil: "load" });

  const button = page.getByTestId("button-download-pdf");
  await button.waitFor();
  const download = page.waitForEvent("download", { timeout: 4 * 60_000 });
  await button.click();

  const file = await (await download).createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of file) chunks.push(chunk as Buffer);
  return new Uint8Array(Buffer.concat(chunks));
}

/**
 * How many font programs the file carries.
 *
 * Must run before `readBook`: pdf.js detaches the array it is handed, and a
 * scan of the same bytes afterwards silently reads zeros. Zero here means the
 * text relies on the PDF base-14 — fonts the reader's viewer is expected to
 * supply — which every print service rejects.
 */
export function countEmbeddedFontPrograms(data: Uint8Array): number {
  return (Buffer.from(data).toString("latin1").match(/\/FontFile\d?\b/g) ?? []).length;
}

/** Reads back every page's text geometry, and whether it carries a figure. */
export async function readBook(data: Uint8Array): Promise<{
  pages: BookPage[];
  outline: number;
  /** Lowest image resolution at the size it is actually placed on the page. */
  lowestImageDpi: number;
}> {
  const { getDocument, OPS } = (await import(PDFJS)) as typeof import("pdfjs-dist");
  const standardFontDataUrl = path.join(
    path.dirname(require_.resolve("pdfjs-dist/package.json")),
    "standard_fonts/"
  );
  const task = getDocument({ data, standardFontDataUrl, useSystemFonts: false });
  const doc = await task.promise;

  const imageOps = new Set<number>([
    OPS.paintImageXObject,
    OPS.paintInlineImageXObject,
    OPS.paintImageMaskXObject,
  ]);
  const pages: BookPage[] = [];
  let lowestImageDpi = Infinity;

  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const [content, ops] = await Promise.all([page.getTextContent(), page.getOperatorList()]);

    // Resolution has to be measured against the size an image is placed at, not
    // its pixel count: the same bitmap is 300 DPI in a column and 150 across a
    // spread. Track the transform to find out which.
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
      else if (fn === OPS.paintImageXObject) {
        const [name, w] = ops.argsArray[i] as [string, number, number];
        const obj = page.objs.has(name) ? (page.objs.get(name) as { width?: number }) : null;
        const px = obj?.width ?? w;
        const placedIn = Math.abs(ctm[0]!) / 72;
        if (px && placedIn > 0.1) lowestImageDpi = Math.min(lowestImageDpi, px / placedIn);
      }
    }

    const items: TextItem[] = [];
    for (const item of content.items) {
      if (!("str" in item) || !item.str.trim()) continue;
      const [a, , , , e, f] = item.transform as number[];
      items.push({
        text: item.str,
        x: e! / PT_PER_MM,
        // pdf.js measures up from the bottom; a book is read from the top.
        y: PAGE_HEIGHT_MM - f! / PT_PER_MM,
        size: Math.abs(a!),
      });
    }
    pages.push({
      number: n,
      items: items.sort((p, q) => p.y - q.y),
      hasImage: ops.fnArray.some((fn) => imageOps.has(fn)),
    });
    page.cleanup();
  }

  const outline = (await doc.getOutline())?.length ?? 0;
  await task.destroy();
  return { pages, outline, lowestImageDpi };
}

/** Loads the constants the exporter typesets to, so the tests cannot drift. */
export function layoutConstants(): {
  textTop: number;
  pageFloor: number;
  bodySize: number;
  headerBaseline: number;
  folioBaseline: number;
} {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const src = readFileSync(
    path.resolve(here, "../../client/src/components/pdf-generator.tsx"),
    "utf8"
  );
  const num = (name: string, expr: RegExp): number => {
    const m = expr.exec(src);
    if (!m) throw new Error(`could not read ${name} out of pdf-generator.tsx`);
    return Number(m[1]);
  };
  const marginTop = num("MARGIN_TOP", /const MARGIN_TOP = ([\d.]+);/);
  const marginBottom = num("MARGIN_BOTTOM", /const MARGIN_BOTTOM = ([\d.]+);/);
  return {
    textTop: marginTop,
    pageFloor: PAGE_HEIGHT_MM - marginBottom,
    bodySize: num("FONT_SIZE_NORMAL", /const FONT_SIZE_NORMAL = ([\d.]+);/),
    headerBaseline: num("HEADER_BASELINE", /const HEADER_BASELINE = ([\d.]+);/),
    folioBaseline: num("FOLIO_BASELINE", /const FOLIO_BASELINE = ([\d.]+);/),
  };
}

/** Body text lines on a page — the running head and the folio excluded. */
export function bodyItems(page: BookPage, textTop: number, pageFloor: number): TextItem[] {
  return page.items.filter((i) => i.y > textTop - 5 && i.y <= pageFloor + 5);
}
