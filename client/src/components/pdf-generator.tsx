import { useState } from "react";
import { createRoot } from "react-dom/client";
import type { jsPDF } from "jspdf";
import { BOOK_FONT, loadBookFontFaces } from "@/lib/book-fonts";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import {
  bookInfo,
  chapters as chapterManifest,
  loadAllChapters,
  loadChapter,
} from "@/lib/chapters";
import type { Chapter } from "@/lib/chapters";

/**
 * The page grid.
 *
 * US Letter, because the people who print this book print it at home on a
 * domestic printer and a 6 x 9 trim would come out either scaled or cropped.
 * The margins are wide for a reason rather than by neglect: at the old
 * 25.4 mm the measure ran to a median of 102 characters a line, roughly half
 * again the length the eye can track back to the next line without losing its
 * place, which is the single worst thing about reading a page. Pulling the
 * text block in to 137.9 mm and setting it at 11.5 pt brings that to about 81,
 * inside the range books have used since they were set by hand. The space it
 * costs is not wasted: this is a workbook, and readers write in it.
 */
const PAGE_WIDTH = 215.9;
const PAGE_HEIGHT = 279.4;
const MARGIN_LEFT = 39;
const MARGIN_RIGHT = 39;
const MARGIN_TOP = 27;
const MARGIN_BOTTOM = 27.4;
const TEXT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
/** First baseline of the text block. */
const TEXT_TOP = MARGIN_TOP;
const LINE_HEIGHT_NORMAL = 6;
const LINE_HEIGHT_HEADING = 8;
const FONT_SIZE_NORMAL = 11.5;
const FONT_SIZE_H1 = 22;
const FONT_SIZE_H2 = 15.5;
const FONT_SIZE_H3 = 13;
const FONT_SIZE_H4 = 11.5;
const FONT_SIZE_SMALL = 9;

/** Every chart placeholder the book actually references, in first-use order. */
function collectReferencedCharts(
  chapters: Chapter[],
  components: Record<string, React.ComponentType>
): string[] {
  const seen = new Set<string>();
  for (const chapter of chapters) {
    const sources = [chapter.content, ...chapter.subchapters.map((s) => s.content)];
    for (const source of sources) {
      for (const match of source.matchAll(/chart:(\w+)/g)) {
        if (components[match[1]]) seen.add(match[1]);
      }
    }
  }
  return [...seen];
}

function stripMarkdownForPdf(text: string): string {
  return (
    text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\*\*(.+?)\*\*/gs, "$1")
      .replace(/\*(.+?)\*/gs, "$1")
      .replace(/_(.+?)_/g, "$1")
      .replace(/`(.+?)`/g, "$1")
      // Anything left is an unpaired marker; it should never reach the page.
      .replace(/\*\*/g, "")
      .trim()
  );
}

/**
 * Puts the book's typeface inside the file.
 *
 * jsPDF's "times" is one of the PDF base-14: a reference to a font the reader's
 * viewer is expected to supply, not the font itself. That is why print services
 * reject it — the same file can set differently on two machines. Liberation
 * Serif is metric-compatible with Times, so embedding it changes what is in the
 * file and changes nothing about where the lines break.
 *
 * The faces are subset to the characters this book uses and loaded with the
 * exporter rather than the app, so a reader who never exports never fetches
 * them.
 */
async function embedBookFont(doc: jsPDF): Promise<void> {
  for (const face of await loadBookFontFaces()) {
    doc.addFileToVFS(face.file, face.base64);
    doc.addFont(face.file, BOOK_FONT, face.style);
  }
}

interface DocState {
  doc: jsPDF;
  y: number;
  pageNum: number;
}

/**
 * How far an opening page drops before its first line. Chapter openers have
 * carried a sink since books were bound: the white space is what tells the eye
 * a new thing has started, before it has read a word.
 */
const CHAPTER_SINK = 22;
/**
 * A pulled quote is set in from both margins, not just the left. Indented on
 * one side only it reads as a stray paragraph; inset on both it reads as
 * somebody else speaking.
 */
/**
 * Figures are allowed out past the text block, centred on the paper.
 *
 * Narrowing the measure was for the prose; shrinking every chart's axis labels
 * by the same 17% was not the point. A figure is looked at rather than read
 * along, so it may break the measure, which is what books have always done
 * with plates and tables.
 */
const FIGURE_WIDTH = 165;
const FIGURE_MAX_HEIGHT = 110;

/**
 * How many pixels a captured figure needs.
 *
 * Print services want 300 DPI at the size an image is actually placed, and a
 * figure here is placed up to FIGURE_WIDTH across. Captured at 1.5x the 800 px
 * layout width it came out at 185 DPI — perfectly good on a screen, and a
 * rejection from Amazon KDP. Derived rather than hardcoded so widening a figure
 * cannot quietly drop the resolution under the floor again.
 */
const PRINT_DPI = 300;
/** A little over, so rounding at the printer's end never lands under the floor. */
const PRINT_DPI_HEADROOM = 1.05;
const CAPTURE_CSS_WIDTH = 800;
const CAPTURE_SCALE =
  (PRINT_DPI * PRINT_DPI_HEADROOM * (FIGURE_WIDTH / 25.4)) / CAPTURE_CSS_WIDTH;
const FIGURE_GAP_ABOVE = 4;
const FIGURE_GAP_BELOW = 6;
/** Tables are a grid to scan, not a line to read, so they get the same room. */
const TABLE_WIDTH = FIGURE_WIDTH;
const TABLE_LEFT = (PAGE_WIDTH - TABLE_WIDTH) / 2;

const QUOTE_INSET = 8;
const QUOTE_GAP = 4;
const SUBCHAPTER_SINK = 12;

const HEADER_BASELINE = 16;
const HEADER_RULE = 18.5;
const FOLIO_BASELINE = 264;

function addRunningHeader(state: DocState, leftText: string, rightText: string) {
  const { doc } = state;
  doc.setFontSize(8);
  doc.setFont(BOOK_FONT, "italic");
  doc.setTextColor(150, 150, 150);
  doc.text(leftText, MARGIN_LEFT, HEADER_BASELINE);
  doc.text(rightText, PAGE_WIDTH - MARGIN_RIGHT, HEADER_BASELINE, { align: "right" });
  doc.setDrawColor(200, 200, 200);
  doc.line(MARGIN_LEFT, HEADER_RULE, PAGE_WIDTH - MARGIN_RIGHT, HEADER_RULE);
  doc.setTextColor(26, 26, 26);
}

function addPageNumber(state: DocState) {
  const { doc, pageNum } = state;
  doc.setFontSize(9);
  doc.setFont(BOOK_FONT, "normal");
  doc.setTextColor(150, 150, 150);
  doc.text(String(pageNum), PAGE_WIDTH / 2, FOLIO_BASELINE, { align: "center" });
  doc.setTextColor(26, 26, 26);
}

function newPage(state: DocState, leftHeader: string, rightHeader: string): DocState {
  addPageNumber(state);
  state.doc.addPage("letter");
  state.pageNum++;
  state.y = TEXT_TOP;
  addRunningHeader(state, leftHeader, rightHeader);
  return state;
}

/** Last baseline that still sits inside the text block. */
const PAGE_FLOOR = PAGE_HEIGHT - MARGIN_BOTTOM;

function lineHeightFor(fontSize: number): number {
  if (fontSize <= FONT_SIZE_SMALL + 0.5) return 5;
  if (fontSize <= FONT_SIZE_NORMAL + 0.5) return LINE_HEIGHT_NORMAL;
  return LINE_HEIGHT_HEADING;
}

/** How many more lines of this height fit below y. */
function linesLeft(y: number, lineH: number): number {
  return Math.max(0, Math.floor((PAGE_FLOOR - y) / lineH));
}

/**
 * Widow and orphan control.
 *
 * A paragraph that has to split leaves at least this many lines behind and
 * carries at least this many forward. One line stranded at the foot of a page,
 * or alone at the top of the next, is the classic sign of unattended
 * typesetting and the book was full of both.
 */
const MIN_ORPHAN = 2;
const MIN_WIDOW = 2;

function checkPageBreak(
  state: DocState,
  neededHeight: number,
  leftHeader: string,
  rightHeader: string
): DocState {
  if (state.y + neededHeight > PAGE_FLOOR) {
    return newPage(state, leftHeader, rightHeader);
  }
  return state;
}

function addText(
  state: DocState,
  text: string,
  fontSize: number,
  fontStyle: "normal" | "bold" | "italic",
  leftHeader: string,
  rightHeader: string,
  indent = 0,
  color: [number, number, number] = [26, 26, 26],
  /** Never split this block when it would fit on a page of its own. */
  atomic = false,
  /** Pulls the right edge in as well, for a block set off from the text. */
  rightInset = 0
): DocState {
  if (!text.trim()) return state;
  const { doc } = state;
  doc.setFontSize(fontSize);
  doc.setFont(BOOK_FONT, fontStyle);
  doc.setTextColor(...color);

  const lineH = lineHeightFor(fontSize);
  const availWidth = TEXT_WIDTH - indent - rightInset;
  const lines = doc.splitTextToSize(text, availWidth) as string[];

  // Decide where this block may break before placing a single line of it.
  let roomHere = linesLeft(state.y, lineH);
  if (lines.length > roomHere) {
    const wholePage = linesLeft(TEXT_TOP, lineH);
    const orphaned = roomHere < MIN_ORPHAN;
    const widowed = lines.length - roomHere < MIN_WIDOW;
    if (atomic && lines.length <= wholePage) {
      state = newPage(state, leftHeader, rightHeader);
      roomHere = linesLeft(state.y, lineH);
    } else if (orphaned || widowed) {
      // Pulling one more line over the break often fixes a widow on its own.
      if (!orphaned && roomHere - 1 >= MIN_ORPHAN) {
        roomHere -= 1;
      } else {
        state = newPage(state, leftHeader, rightHeader);
        roomHere = linesLeft(state.y, lineH);
      }
    }
  }

  for (const line of lines) {
    if (roomHere <= 0) {
      state = newPage(state, leftHeader, rightHeader);
      roomHere = linesLeft(state.y, lineH);
    }
    doc.text(line, MARGIN_LEFT + indent, state.y);
    state.y += lineH;
    roomHere--;
  }
  doc.setTextColor(26, 26, 26);
  return state;
}

/**
 * Height a figure occupies. Sized from the captured pixels rather than an
 * assumed ratio, so a tall chart is scaled down instead of squeezed or cropped.
 */
function figureHeight(image: ChartImage): number {
  const aspect = image.aspect > 0 ? image.aspect : 2;
  return Math.min(FIGURE_MAX_HEIGHT, FIGURE_WIDTH / aspect);
}

/** Total room a figure needs, including the air above and below it. */
function figureSpace(image: ChartImage): number {
  return FIGURE_GAP_ABOVE + figureHeight(image) + FIGURE_GAP_BELOW;
}

/** Draws a figure at the current position. Never breaks the page itself. */
function addChartImage(state: DocState, image: ChartImage): DocState {
  const imgAspect = image.aspect > 0 ? image.aspect : 2;
  const imgH = figureHeight(image);
  const imgW = imgH * imgAspect;
  const xLeft = (PAGE_WIDTH - imgW) / 2;

  state.y += FIGURE_GAP_ABOVE;
  // No border is drawn here: the captured image is a ChartFrame, which already
  // carries its own. Adding one put every figure in the book inside a box
  // inside a box.
  // Without an explicit compression level jsPDF embeds the decoded bitmap raw
  // (width x height x 3 bytes per chart), which pushed the book past 100 MB.
  state.doc.addImage(
    image.dataUrl,
    "PNG",
    xLeft,
    state.y,
    imgW,
    imgH,
    undefined,
    "MEDIUM"
  );
  state.y += imgH + FIGURE_GAP_BELOW;
  return state;
}

/**
 * Most quotes in the source already carry their own quotation marks; add a
 * pair only when neither end has one.
 */
function quotedText(text: string): string {
  const already = /^["\u201c\u2018']/.test(text) || /["\u201d\u2019']$/.test(text);
  return already ? text : `"${text}"`;
}

function isTableRow(line: string): boolean {
  const t = line.trim();
  return t.startsWith("|") && t.endsWith("|") && t.length > 2;
}

function isTableDivider(line: string): boolean {
  return isTableRow(line) && /^\|[\s:|-]+\|$/.test(line.trim());
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .slice(1, -1)
    .split("|")
    .map((cell) => stripMarkdownForPdf(cell.trim()));
}

/** Tables up to this many rows move to the next page rather than split. */
const SMALL_TABLE_ROWS = 5;
const TABLE_ROW_PADDING = 2;
const TABLE_CELL_LINE_HEIGHT = 4.6;

/** Height of a list item, which never splits across a page. */
function listItemHeight(state: DocState, text: string, indent: number): number {
  state.doc.setFontSize(FONT_SIZE_NORMAL);
  state.doc.setFont(BOOK_FONT, "normal");
  const n = (state.doc.splitTextToSize(text, TEXT_WIDTH - indent) as string[]).length;
  return n * LINE_HEIGHT_NORMAL;
}

/**
 * Every reference in the book, deduplicated and alphabetised.
 *
 * The prose carries 85 separate `## References` sections, a median of three
 * entries each — a reader is interrupted by one every few pages. In print they
 * belong at the back: the inline author–year citations are what a reader needs
 * mid-paragraph, and the list is for looking things up afterwards. The website
 * keeps rendering them per section, where a reader arriving from a search
 * result has no back matter to turn to.
 */
function collectBibliography(chaps: Chapter[]): string[] {
  const byKey = new Map<string, string>();

  const harvest = (markdown: string) => {
    for (const section of markdown.split(/^## /m)) {
      if (!/^References\s*$/m.test(section.split("\n")[0] ?? "")) continue;
      for (const raw of section.split("\n").slice(1)) {
        const line = stripMarkdownForPdf(raw.replace(/^\s*[-*+]\s*/, "")).trim();
        if (!line || line.length < 12) continue;

        // The same work is cited with different initials in different chapters
        // — "van der Kolk, B. A. (2014)" and "van der Kolk, B. (2014)". Key on
        // the surname, the year and the opening of the title so those merge,
        // but two different works by one author in one year do not.
        const year = /\((\d{4}[a-z]?)\)/.exec(line)?.[1] ?? "";
        const surname = line
          .split(",")[0]!
          .toLowerCase()
          .replace(/[^a-z ]/g, "");
        // Key on the main title — everything before the subtitle colon or the
        // sentence stop. The same book is cited both in full and short form
        // ("No bad parts: Healing trauma…" and "No bad parts."), which a
        // word-count key splits in two; a main-title key merges those while
        // keeping Linehan's manual apart from her handouts.
        const title = line
          .slice(line.indexOf(`(${year})`) + year.length + 2)
          .replace(/\([^)]*\)/g, " ")
          // The slice starts on the full stop that closes the year, so trim it
          // before splitting — otherwise the main title comes out empty and
          // everything by one author in one year merges into a single entry.
          .replace(/^[\s.,;:]+/, "")
          .split(/[:.]/)[0]!
          .toLowerCase()
          .replace(/[^a-z0-9 ]/g, " ")
          .split(/\s+/)
          .filter(Boolean)
          .join(" ");
        const key = `${surname}|${year}|${title}`;

        // Keep the fullest version — the one that spells out more initials.
        const existing = byKey.get(key);
        if (!existing || line.length > existing.length) byKey.set(key, line);
      }
    }
  };

  for (const chapter of chaps) {
    harvest(chapter.content);
    for (const sub of chapter.subchapters) harvest(sub.content);
  }

  return [...byKey.values()].sort((a, b) =>
    a.localeCompare(b, "en", { sensitivity: "base" })
  );
}

/** A reference, set with the hanging indent a bibliography uses. */
function addHangingEntry(
  state: DocState,
  text: string,
  leftHeader: string,
  rightHeader: string
): DocState {
  const { doc } = state;
  doc.setFont(BOOK_FONT, "normal");
  doc.setFontSize(FONT_SIZE_SMALL);
  doc.setTextColor(26, 26, 26);
  const indent = 6;
  const lines = doc.splitTextToSize(text, TEXT_WIDTH - indent) as string[];
  const lineH = 4.6;

  // Keep an entry whole; a citation split across a page is unreadable.
  if (state.y + lines.length * lineH > PAGE_FLOOR) {
    state = newPage(state, leftHeader, rightHeader);
  }
  lines.forEach((line, i) => {
    doc.text(line, MARGIN_LEFT + (i === 0 ? 0 : indent), state.y);
    state.y += lineH;
  });
  state.y += 1.6;
  return state;
}

/** Height of one laid-out table row. */
function tableRowHeight(
  state: DocState,
  row: string[],
  columns: number,
  bold: boolean
): number {
  const { doc } = state;
  doc.setFont(BOOK_FONT, bold ? "bold" : "normal");
  doc.setFontSize(FONT_SIZE_SMALL);
  const colWidth = TABLE_WIDTH / columns;
  const lines = Array.from(
    { length: columns },
    (_, i) =>
      (doc.splitTextToSize(row[i] ?? "", colWidth - 2 * TABLE_ROW_PADDING) as string[])
        .length
  );
  return Math.max(1, ...lines) * TABLE_CELL_LINE_HEIGHT + 2 * TABLE_ROW_PADDING;
}

/**
 * How much room a heading must leave for the table under it.
 *
 * A short table moves to the next page whole rather than splitting, so the
 * heading has to clear all of it; a long one only needs its header and first
 * row of data to come along.
 */
function tableReserve(state: DocState, rows: string[][], hasHeader: boolean): number {
  const columns = Math.max(...rows.map((r) => r.length));
  if (columns === 0) return 0;
  const heights = rows.map((r, i) =>
    tableRowHeight(state, r, columns, hasHeader && i === 0)
  );
  const lead = heights.slice(0, hasHeader ? 2 : 1).reduce((a, b) => a + b, 0);
  const total = heights.reduce((a, b) => a + b, 0);
  return 3 + (rows.length <= SMALL_TABLE_ROWS ? total : lead);
}

/** Renders a GFM table as a bordered grid instead of dumping raw pipe syntax. */
function addTable(
  state: DocState,
  rows: string[][],
  hasHeader: boolean,
  leftHeader: string,
  rightHeader: string
): DocState {
  const columnCount = Math.max(...rows.map((r) => r.length));
  if (columnCount === 0) return state;

  const colWidth = TABLE_WIDTH / columnCount;
  const { doc } = state;

  /** Lays a row out without drawing it, so its height is known in advance. */
  const layout = (row: string[], isHeaderRow: boolean) => {
    doc.setFont(BOOK_FONT, isHeaderRow ? "bold" : "normal");
    doc.setFontSize(FONT_SIZE_SMALL);
    const cells = Array.from({ length: columnCount }, (_, i) => row[i] ?? "");
    const wrapped = cells.map(
      (cell) => doc.splitTextToSize(cell, colWidth - 2 * TABLE_ROW_PADDING) as string[]
    );
    const height =
      Math.max(1, ...wrapped.map((lines) => lines.length)) * TABLE_CELL_LINE_HEIGHT +
      2 * TABLE_ROW_PADDING;
    return { wrapped, height };
  };

  const draw = (laid: { wrapped: string[][]; height: number }, isHeaderRow: boolean) => {
    doc.setFont(BOOK_FONT, isHeaderRow ? "bold" : "normal");
    doc.setFontSize(FONT_SIZE_SMALL);
    if (isHeaderRow) {
      doc.setFillColor(240, 245, 255);
      doc.rect(TABLE_LEFT, state.y, TABLE_WIDTH, laid.height, "F");
    }
    doc.setDrawColor(210, 216, 228);
    doc.setLineWidth(0.2);
    doc.rect(TABLE_LEFT, state.y, TABLE_WIDTH, laid.height);
    doc.setTextColor(26, 26, 26);
    laid.wrapped.forEach((lines, colIndex) => {
      const x = TABLE_LEFT + colIndex * colWidth;
      if (colIndex > 0) doc.line(x, state.y, x, state.y + laid.height);
      lines.forEach((line, lineIndex) => {
        doc.text(
          line,
          x + TABLE_ROW_PADDING,
          state.y + TABLE_ROW_PADDING + (lineIndex + 1) * TABLE_CELL_LINE_HEIGHT - 1
        );
      });
    });
    state.y += laid.height;
  };

  const laidOut = rows.map((row, i) => layout(row, hasHeader && i === 0));
  const header = hasHeader ? laidOut[0] : null;
  const total = laidOut.reduce((sum, r) => sum + r.height, 0);

  state.y += 3;

  // A short table splits worse than it moves. Send the whole thing to the next
  // page when it would fit there.
  if (
    state.y + total > PAGE_FLOOR &&
    total <= PAGE_FLOOR - TEXT_TOP &&
    rows.length <= SMALL_TABLE_ROWS
  ) {
    state = newPage(state, leftHeader, rightHeader);
  }

  laidOut.forEach((laid, rowIndex) => {
    const isHeaderRow = hasHeader && rowIndex === 0;
    if (state.y + laid.height > PAGE_FLOOR) {
      state = newPage(state, leftHeader, rightHeader);
      // Repeat the header, or the continuation is an unlabelled grid of cells.
      if (header && !isHeaderRow) draw(header, true);
    }
    draw(laid, isHeaderRow);
  });

  state.y += 5;
  return state;
}

async function renderMarkdownContent(
  state: DocState,
  content: string,
  leftHeader: string,
  rightHeader: string,
  chartImages: Record<string, ChartImage>,
  /** Collects where each figure landed, for the list of figures. */
  figureLog?: TocEntry[]
): Promise<DocState> {
  const lines = content.split("\n");
  let paraBuffer: string[] = [];

  /**
   * Headings are held back until the height of what follows them is known.
   *
   * Reserving a generic two lines is not enough: what comes next is often a
   * list item, a table or a figure, and those move as a unit — leaving the
   * heading behind at the foot of the page. Deferring lets the heading break
   * with the block it introduces.
   */
  type Heading = { text: string; size: number; before: number; after: number };

  // A run of consecutive headings — a section title immediately followed by
  // its first sub-heading — is placed as one unit, or the outer one is left
  // stranded when the inner one moves.
  let pending: Heading[] = [];

  const headingHeight = (head: Heading) => {
    const { doc } = state;
    doc.setFontSize(head.size);
    doc.setFont(BOOK_FONT, "bold");
    const count = (doc.splitTextToSize(head.text, TEXT_WIDTH) as string[]).length;
    return head.before + count * lineHeightFor(head.size) + head.after;
  };

  const pendingHeight = () => pending.reduce((sum, h) => sum + headingHeight(h), 0);

  const placeHeading = (followHeight: number) => {
    if (pending.length === 0) return;
    const group = pending;
    pending = [];
    const needed = group.reduce((sum, h) => sum + headingHeight(h), 0) + followHeight;
    const breaking = state.y + needed > PAGE_FLOOR;
    if (breaking) state = newPage(state, leftHeader, rightHeader);
    group.forEach((head, i) => {
      // The gap above the first heading is swallowed by the page break.
      if (!(breaking && i === 0)) state.y += head.before;
      state = addText(
        state,
        head.text,
        head.size,
        "bold",
        leftHeader,
        rightHeader,
        0,
        [26, 26, 26],
        true
      );
      state.y += head.after;
    });
  };

  /**
   * Height a heading must clear for the text that follows it: the leading gap
   * plus as much of the paragraph as will actually come with it. Leaving the
   * gap out of the reserve was enough on its own to strand a heading on a page
   * that was almost full — and so was assuming a paragraph can always leave
   * `MIN_ORPHAN` lines behind. One of three lines cannot: two here and one
   * over the break is a widow, one here and two over is an orphan, so the
   * paragraph moves whole and the heading is left on its own.
   */
  const openingHeight = (text: string, indent = 0, gap = 2) => {
    state.doc.setFontSize(FONT_SIZE_NORMAL);
    state.doc.setFont(BOOK_FONT, "normal");
    const n = (state.doc.splitTextToSize(text, TEXT_WIDTH - indent) as string[]).length;
    const carried = n < MIN_ORPHAN + MIN_WIDOW ? n : MIN_ORPHAN;
    return gap + carried * LINE_HEIGHT_NORMAL;
  };

  /**
   * The same, for a pulled quote — which is set atomic, so it comes with the
   * heading whole or not at all.
   */
  const quoteOpeningHeight = (text: string) => {
    state.doc.setFontSize(FONT_SIZE_NORMAL);
    state.doc.setFont(BOOK_FONT, "italic");
    const n = (state.doc.splitTextToSize(text, TEXT_WIDTH - 2 * QUOTE_INSET) as string[])
      .length;
    const carried =
      n <= linesLeft(TEXT_TOP, LINE_HEIGHT_NORMAL) || n < MIN_ORPHAN + MIN_WIDOW
        ? n
        : MIN_ORPHAN;
    return QUOTE_GAP + carried * LINE_HEIGHT_NORMAL;
  };

  /**
   * A figure waiting for room.
   *
   * A chart is up to 110 mm tall and never splits, so setting it in sequence
   * meant that whenever it did not fit, it and the heading above it both moved
   * to the next page and left the rest of this one blank — up to 130 mm of it.
   * Books have always handled this by floating the plate to the next page that
   * can take it and letting the prose close up behind. That is what this does:
   * the figure is held, the text carries on filling the page, and the figure
   * is set at the first point it fits whole.
   */
  let floating: { image: ChartImage; label: string } | null = null;

  const logFigure = (label: string) => {
    // Fourteen figures are referenced by two chapters. A list of figures names
    // each one once, at its first appearance — and that keeps the list the same
    // length as the reservation made for it up front.
    if (figureLog && !figureLog.some((f) => f.label === label)) {
      figureLog.push({ label, page: state.pageNum, isChapter: false });
    }
  };

  /** Sets the held figure if it fits here whole. */
  const tryFloat = () => {
    if (!floating || paraBuffer.length > 0) return;
    if (state.y + figureSpace(floating.image) > PAGE_FLOOR) return;
    state = addChartImage(state, floating.image);
    logFigure(floating.label);
    floating = null;
  };

  /** Sets the held figure now, taking a new page if that is what it needs. */
  const flushFloat = () => {
    if (!floating) return;
    if (state.y + figureSpace(floating.image) > PAGE_FLOOR) {
      state = newPage(state, leftHeader, rightHeader);
    }
    state = addChartImage(state, floating.image);
    logFigure(floating.label);
    floating = null;
  };

  const flushPara = () => {
    if (paraBuffer.length === 0) return;
    const combined = paraBuffer.join(" ").trim();
    if (!combined) {
      paraBuffer = [];
      return;
    }
    paraBuffer = [];

    // A paragraph that opens with a bold run — "**The Functional Adult is the
    // middle.** Roughly sixty-five percent…" — keeps that run as its own bold
    // line, which is how the book uses the pattern throughout. The split has to
    // happen on the whole joined paragraph: doing it per source line broke every
    // hard-wrapped one, stranding the second half as a separate paragraph.
    const lead = /^\*\*([^*]+)\*\*\s*(.*)$/s.exec(combined);
    if (lead) {
      const label = stripMarkdownForPdf(lead[1]).trim();
      const rest = stripMarkdownForPdf(lead[2]).trim();
      if (label) {
        // The lead-in is a heading in all but name, so it defers the same way.
        pending.push({ text: label, size: FONT_SIZE_NORMAL, before: 4, after: 0 });
        if (rest) {
          placeHeading(openingHeight(rest));
          state = addText(
            state,
            rest,
            FONT_SIZE_NORMAL,
            "normal",
            leftHeader,
            rightHeader
          );
          state.y += 2;
        }
        return;
      }
    }

    const cleaned = stripMarkdownForPdf(combined);
    if (cleaned) {
      placeHeading(openingHeight(cleaned));
      state.y += 2;
      state = addText(
        state,
        cleaned,
        FONT_SIZE_NORMAL,
        "normal",
        leftHeader,
        rightHeader
      );
      state.y += 2;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    tryFloat();

    // The references are gathered into one bibliography at the back; skip the
    // section here rather than interrupting the reader 85 times.
    if (/^##\s+References\s*$/.test(trimmed)) {
      flushPara();
      pending = [];
      while (i + 1 < lines.length && !/^#{1,3}\s/.test(lines[i + 1])) i++;
      continue;
    }

    // Chart blocks: ```chart:Name``` on one line, or a ```chart:Name fence.
    const chartMatch = /^```chart:(\w+)(?:```)?$/.exec(trimmed);
    if (chartMatch) {
      flushPara();
      const chartName = chartMatch[1];
      // Skip the closing fence of a multi-line ```chart:Name block.
      if (!trimmed.endsWith("```") || trimmed === "```chart:" + chartName) {
        while (i < lines.length - 1 && lines[i + 1].trim() !== "```") i++;
        i++;
      }
      const image = chartImages[chartName];
      if (image) {
        // Only one figure floats at a time; a second one setting off before the
        // first has landed would reverse them.
        flushFloat();
        const label = figureTitle(chartName);
        // A heading above a figure is only set here if the figure is going to
        // land under it. Otherwise it stays pending and is set against the
        // text that follows instead, which is what keeps it off the foot of
        // the page on its own while the figure floats on ahead.
        if (state.y + pendingHeight() + figureSpace(image) <= PAGE_FLOOR) {
          placeHeading(figureSpace(image));
          state = addChartImage(state, image);
          logFigure(label);
        } else {
          floating = { image, label };
        }
      } else {
        placeHeading(LINE_HEIGHT_NORMAL);
        state.y += 2;
        state = addText(
          state,
          `[Chart: ${chartName}]`,
          FONT_SIZE_SMALL,
          "italic",
          leftHeader,
          rightHeader,
          4,
          [120, 120, 120]
        );
        state.y += 2;
      }
      continue;
    }
    if (trimmed.startsWith("```")) {
      // A fence that is not a chart. The exporter has no monospace face — the
      // embedded fonts are Liberation Serif only — so it cannot set one, and it
      // used to drop them without a word: the CBT triangle, an ASCII drawing,
      // was missing from the printed book entirely and nothing said so.
      // `validate:content` now rejects these at build time; this is the belt to
      // that pair of braces, and it is loud.
      flushPara();
      const start = i;
      // Scan to the closing fence. The body is empty on purpose: the work is
      // the increment in the condition.
      while (i < lines.length - 1 && !lines[++i].trim().startsWith("```")) {
        /* advance */
      }
      console.warn(
        `pdf-generator: skipped a fenced block at line ${start + 1} — the ` +
          `exporter cannot typeset one. Make it a chart component instead.`
      );
      continue;
    }

    // GFM tables: buffer the whole block, then draw it as a grid.
    if (isTableRow(line)) {
      flushPara();
      const block: string[] = [];
      while (i < lines.length && isTableRow(lines[i])) block.push(lines[i++]);
      i--;
      const hasHeader = block.length > 1 && isTableDivider(block[1]);
      const rows = block.filter((r) => !isTableDivider(r)).map(splitTableRow);
      if (rows.length) {
        placeHeading(tableReserve(state, rows, hasHeader));
        state = addTable(state, rows, hasHeader, leftHeader, rightHeader);
      }
      continue;
    }

    if (/^######\s/.test(line) || /^#####\s/.test(line) || /^####\s/.test(line)) {
      flushPara();
      const text = stripMarkdownForPdf(line.replace(/^#{4,6}\s+/, ""));
      pending.push({ text, size: FONT_SIZE_H4, before: 5, after: 1 });
    } else if (/^###\s/.test(line)) {
      flushPara();
      const text = stripMarkdownForPdf(line.replace(/^###\s+/, ""));
      pending.push({ text, size: FONT_SIZE_H3, before: 6, after: 3 });
    } else if (/^##\s/.test(line)) {
      flushPara();
      const text = stripMarkdownForPdf(line.replace(/^##\s+/, ""));
      pending.push({ text, size: FONT_SIZE_H2, before: 9, after: 4 });
    } else if (/^#\s/.test(line)) {
      flushPara();
    } else if (/^>\s?/.test(line)) {
      // Buffer the whole blockquote: quoting each line separately produced
      // stray quote marks in the middle of multi-line quotes.
      flushPara();
      const quoteLines: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, "").trim());
        i++;
      }
      i--;
      const text = stripMarkdownForPdf(quoteLines.join(" ").replace(/\s+/g, " "));
      if (text) {
        placeHeading(quoteOpeningHeight(quotedText(text)));
        state.y += QUOTE_GAP;
        state = checkPageBreak(state, 8, leftHeader, rightHeader);
        state.doc.setDrawColor(180, 180, 180);
        state.doc.setLineWidth(0.8);
        const startY = state.y - 1;
        const quoted = quotedText(text);
        state = addText(
          state,
          quoted,
          FONT_SIZE_NORMAL,
          "italic",
          leftHeader,
          rightHeader,
          QUOTE_INSET,
          [80, 80, 80],
          true,
          QUOTE_INSET
        );
        // Only rule the margin when the quote stayed on one page; a split one
        // would otherwise draw its bar from the old y to the new.
        if (state.y > startY) {
          state.doc.line(MARGIN_LEFT + 2, startY, MARGIN_LEFT + 2, state.y);
        }
        state.doc.setLineWidth(0.2);
        state.y += QUOTE_GAP;
      }
    } else if (/^\s*[-*+]\s/.test(line) || /^\s*\d+\.\s/.test(line)) {
      flushPara();
      const ordered = /^\s*(\d+)\.\s/.exec(line);
      const marker = ordered ? `${ordered[1]}.` : "\u2022";
      // A wrapped list item continues on the following lines. Join them before
      // stripping, or inline markup spanning the break survives into the PDF.
      const parts = [line.replace(/^\s*[-*+]\s+/, "").replace(/^\s*\d+\.\s+/, "")];
      while (
        i + 1 < lines.length &&
        lines[i + 1].trim() !== "" &&
        !/^\s*([-*+]|\d+\.)\s/.test(lines[i + 1]) &&
        !/^\s*(#{1,6}\s|>|\||```|---+$)/.test(lines[i + 1])
      ) {
        parts.push(lines[++i].trim());
      }
      const text = stripMarkdownForPdf(parts.join(" "));
      const nested = /^\s{2,}/.test(line);
      // A list item is atomic, so the heading has to clear the whole item.
      placeHeading(listItemHeight(state, `${marker} ${text}`, nested ? 12 : 6));
      state = addText(
        state,
        `${marker} ${text}`,
        FONT_SIZE_NORMAL,
        "normal",
        leftHeader,
        rightHeader,
        nested ? 12 : 6,
        [26, 26, 26],
        // A list item is short; breaking one across a page turns a bullet into
        // two half-bullets.
        true
      );
    } else if (/^---+$/.test(trimmed)) {
      flushPara();
      placeHeading(LINE_HEIGHT_NORMAL);
      state.y += 4;
      state = checkPageBreak(state, 4, leftHeader, rightHeader);
      state.doc.setDrawColor(180, 180, 180);
      state.doc.line(MARGIN_LEFT, state.y, PAGE_WIDTH - MARGIN_RIGHT, state.y);
      state.y += 6;
    } else if (trimmed === "") {
      flushPara();
    } else {
      // Bold lead-ins are handled in flushPara, once the whole paragraph is
      // in hand — see the note there.
      paraBuffer.push(line);
    }
  }
  flushPara();
  // A section that ends on a heading still has to print it.
  placeHeading(0);
  // A figure held back at the end of a section is set before the section ends,
  // not carried into the next one.
  flushFloat();
  return state;
}

/**
 * The cover. `chapter` set means this is a single-chapter export, so the
 * chapter's own title is the headline and the book's title becomes the line
 * above it -- an offprint of one chapter, not a copy of the book that happens
 * to be short.
 */
function buildCoverPage(doc: jsPDF, chapter?: Chapter): void {
  doc.setFillColor(245, 247, 250);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, PAGE_WIDTH, 8, "F");

  if (chapter) {
    doc.setFont(BOOK_FONT, "normal");
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(bookInfo.title.toUpperCase(), PAGE_WIDTH / 2, 62, { align: "center" });
    doc.setFontSize(10);
    doc.text(`CHAPTER ${chapter.order}`, PAGE_WIDTH / 2, 70, { align: "center" });
  }

  doc.setFont(BOOK_FONT, "bold");
  doc.setFontSize(chapter ? 26 : 32);
  doc.setTextColor(15, 23, 42);
  const headlineLines = doc.splitTextToSize(
    chapter ? chapter.title : bookInfo.title,
    150
  ) as string[];
  headlineLines.forEach((line, i) => {
    doc.text(line, PAGE_WIDTH / 2, 84 + i * 12, { align: "center" });
  });
  const ruleY = 84 + headlineLines.length * 12;

  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(1);
  doc.line(60, ruleY, PAGE_WIDTH - 60, ruleY);
  doc.setLineWidth(0.2);

  doc.setFont(BOOK_FONT, "italic");
  doc.setFontSize(14);
  doc.setTextColor(71, 85, 105);
  const subtitleLines = doc.splitTextToSize(
    chapter ? chapter.description : bookInfo.subtitle,
    140
  );
  subtitleLines.forEach((line: string, i: number) => {
    doc.text(line, PAGE_WIDTH / 2, ruleY + 12 + i * 8, { align: "center" });
  });

  if (!chapter) {
    doc.setFont(BOOK_FONT, "normal");
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    const descLines = doc.splitTextToSize(bookInfo.description, 130);
    descLines.slice(0, 4).forEach((line: string, i: number) => {
      doc.text(line, PAGE_WIDTH / 2, 130 + i * 6.5, { align: "center" });
    });
  }

  doc.setFont(BOOK_FONT, "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(bookInfo.author, PAGE_WIDTH / 2, 185, { align: "center" });

  doc.setFont(BOOK_FONT, "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("Recovery Works Publishing", PAGE_WIDTH / 2, 230, { align: "center" });
  doc.text("2025", PAGE_WIDTH / 2, 237, { align: "center" });

  doc.setFillColor(59, 130, 246);
  doc.rect(0, PAGE_HEIGHT - 8, PAGE_WIDTH, 8, "F");
}

function buildCopyrightPage(doc: jsPDF): void {
  doc.setFont(BOOK_FONT, "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  let y = 60;
  const addLine = (text: string, gap = 6) => {
    const lines = doc.splitTextToSize(text, TEXT_WIDTH);
    lines.forEach((l: string) => {
      doc.text(l, MARGIN_LEFT, y);
      y += gap;
    });
    y += 2;
  };

  doc.setFont(BOOK_FONT, "bold");
  doc.setFontSize(12);
  doc.text(bookInfo.title, MARGIN_LEFT, y);
  y += 8;
  doc.setFont(BOOK_FONT, "italic");
  doc.setFontSize(10);
  doc.text(bookInfo.subtitle, MARGIN_LEFT, y);
  y += 10;
  doc.setFont(BOOK_FONT, "normal");

  addLine(`By ${bookInfo.author}`, 8);
  addLine(`Copyright © 2025 ${bookInfo.author}. All rights reserved.`);
  addLine(
    "No part of this publication may be reproduced, distributed, or transmitted in any form or by any means, " +
      "including photocopying, recording, or other electronic or mechanical methods, without the prior written " +
      "permission of the publisher, except in the case of brief quotations embodied in critical reviews and " +
      "certain other noncommercial uses permitted by copyright law."
  );
  addLine(
    "This book is intended for educational and informational purposes only. It is not a substitute for " +
      "professional medical or mental health advice, diagnosis, or treatment. Always seek the guidance of " +
      "your physician or other qualified health provider with any questions regarding a medical or mental health condition."
  );
  y += 6;
  doc.setFont(BOOK_FONT, "bold");
  doc.setFontSize(11);
  doc.setTextColor(26, 26, 26);
  doc.text("If you need help right now", MARGIN_LEFT, y);
  y += 7;
  doc.setFont(BOOK_FONT, "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  // These belong at the front as well as the back. A reader who needs them
  // should not have to reach the end of a seven-hundred-page book to find them.
  [
    "988 Suicide and Crisis Lifeline — call or text 988",
    "Crisis Text Line — text HOME to 741741",
    "SAMHSA National Helpline — 1-800-662-4357",
    "National Domestic Violence Hotline — 1-800-799-7233",
  ].forEach((line) => {
    doc.text(line, MARGIN_LEFT, y);
    y += 5.5;
  });
  y += 2;
  doc.setFontSize(9);
  addLine(
    "These numbers are for the United States. Elsewhere, findahelpline.com lists services by country."
  );

  doc.setFontSize(10);
  y += 8;
  addLine("Published by Recovery Works Publishing");
  addLine("First Edition, 2025");
}

interface TocEntry {
  label: string;
  page: number;
  isChapter: boolean;
}

const TOC_CHAPTER_LINE = 7;
const TOC_SUB_LINE = 5.5;
const TOC_TOP = 62;

/** One row of the contents, with a leader and a folio. */
function tocRowHeight(doc: jsPDF, entry: TocEntry): number {
  const lineH = entry.isChapter ? TOC_CHAPTER_LINE : TOC_SUB_LINE;
  doc.setFont(BOOK_FONT, entry.isChapter ? "bold" : "normal");
  doc.setFontSize(entry.isChapter ? 12 : 10);
  const indent = entry.isChapter ? 0 : 10;
  const lines = doc.splitTextToSize(entry.label, TEXT_WIDTH - indent - 20) as string[];
  return lines.length * lineH + (entry.isChapter ? 4 : 2);
}

/**
 * How many pages a list of this shape will need.
 *
 * The contents has to carry real page numbers, which are only known once the
 * book is set — but the number of pages the contents itself needs depends only
 * on how many entries there are. Measuring first lets those pages be reserved
 * up front, so the folios printed on the chapters are right the first time and
 * the contents can be drawn onto the reserved pages afterwards.
 */
function measureListPages(doc: jsPDF, entries: TocEntry[], gapEvery: number): number {
  let pages = 1;
  let y = TOC_TOP;
  entries.forEach((entry, i) => {
    const h = tocRowHeight(doc, entry);
    if (y + h > PAGE_HEIGHT - MARGIN_BOTTOM - 10) {
      pages++;
      y = TEXT_TOP;
    }
    y += h;
    if (gapEvery && (i + 1) % gapEvery === 0) y += 2;
  });
  return pages;
}

/** Draws a contents-style list onto pages already reserved for it. */
function drawList(
  doc: jsPDF,
  firstPage: number,
  heading: string,
  entries: TocEntry[]
): void {
  let page = firstPage;
  doc.setPage(page);
  doc.setFont(BOOK_FONT, "bold");
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text(heading, PAGE_WIDTH / 2, 45, { align: "center" });
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_LEFT, 50, PAGE_WIDTH - MARGIN_RIGHT, 50);
  doc.setLineWidth(0.2);

  let y = TOC_TOP;
  for (const entry of entries) {
    const h = tocRowHeight(doc, entry);
    if (y + h > PAGE_HEIGHT - MARGIN_BOTTOM - 10) {
      page++;
      doc.setPage(page);
      y = TEXT_TOP;
    }
    const lineH = entry.isChapter ? TOC_CHAPTER_LINE : TOC_SUB_LINE;
    doc.setFont(BOOK_FONT, entry.isChapter ? "bold" : "normal");
    doc.setFontSize(entry.isChapter ? 12 : 10);
    doc.setTextColor(
      entry.isChapter ? 15 : 70,
      entry.isChapter ? 23 : 80,
      entry.isChapter ? 42 : 90
    );
    const indent = entry.isChapter ? 0 : 10;
    const lines = doc.splitTextToSize(entry.label, TEXT_WIDTH - indent - 20) as string[];
    lines.forEach((l, i) => doc.text(l, MARGIN_LEFT + indent, y + i * lineH));

    // The folio sits hard against the right margin with a dotted leader, so
    // the eye can travel from a long title to its number without losing the row.
    const folio = String(entry.page);
    const lastY = y + (lines.length - 1) * lineH;
    doc.text(folio, PAGE_WIDTH - MARGIN_RIGHT, lastY, { align: "right" });
    const textEnd = MARGIN_LEFT + indent + doc.getTextWidth(lines[lines.length - 1]!);
    const folioStart = PAGE_WIDTH - MARGIN_RIGHT - doc.getTextWidth(folio) - 2;
    if (folioStart - textEnd > 6) {
      doc.setLineDashPattern([0.4, 1.4], 0);
      doc.setDrawColor(170, 175, 185);
      doc.line(textEnd + 2, lastY - 1, folioStart, lastY - 1);
      doc.setLineDashPattern([], 0);
    }
    y += h;
  }
  doc.setTextColor(26, 26, 26);
}

/** "PTSDPrevalenceChart" reads as "PTSD Prevalence" in a list of figures. */
function figureTitle(componentName: string): string {
  return componentName
    .replace(/Chart$/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .trim();
}

type Html2Canvas = typeof import("html2canvas").default;

/**
 * The figures, loaded when someone asks for the PDF rather than imported.
 *
 * A static import here put all ninety-one of them — 154 kB gzipped, the single
 * largest thing on the page — onto the home page, because the download button
 * is lazy but its module is not. Measured: the home page fetched 349 kB and 44
 * per cent of it was charts nobody had asked to see.
 */
type ChartsModule = typeof import("@/components/chart-registry");

/** A captured chart plus its real pixel aspect, so the PDF can size it without guessing. */
interface ChartImage {
  dataUrl: string;
  aspect: number;
}

async function captureCharts(
  chartNames: string[],
  html2canvas: Html2Canvas,
  charts: ChartsModule,
  onProgress: (msg: string) => void
): Promise<Record<string, ChartImage>> {
  const { ALL_CHART_COMPONENTS, PRINT_CHART_PALETTE, setChartCaptureMode } = charts;
  const chartImages: Record<string, ChartImage> = {};

  // Offscreen host for the charts we mount one at a time.
  const container = document.createElement("div");
  container.style.cssText =
    `position:fixed;left:-9999px;top:0;width:${CAPTURE_CSS_WIDTH}px;background:#fff;` +
    "z-index:-1;pointer-events:none;";
  // The book prints in black ink, so the series colours are swapped here for a
  // set spread evenly across luminance. Set on the host rather than on the
  // document: the site keeps its own palette, which has colour and does not
  // need to survive being turned grey.
  for (const [name, value] of Object.entries(PRINT_CHART_PALETTE)) {
    container.style.setProperty(name, value);
  }
  document.body.appendChild(container);

  // Charts must be captured with their entry animation off: at 600ms a pie is
  // still a sliver and a radar is still growing, and Recharts does not paint
  // its value labels until the animation lands. The same switch drops the
  // website's "Show the numbers" disclosure, which has nothing to say on paper.
  setChartCaptureMode(true);

  try {
    for (let i = 0; i < chartNames.length; i++) {
      const name = chartNames[i];
      const ChartComponent = ALL_CHART_COMPONENTS[name];
      if (!ChartComponent) continue;
      onProgress(`Rendering chart ${i + 1}/${chartNames.length}: ${name}`);

      // Height is left to the content: a fixed 400px box cropped the taller
      // charts (axis labels and the last series were cut off in the PDF).
      const chartDiv = document.createElement("div");
      chartDiv.style.cssText = `width:${CAPTURE_CSS_WIDTH}px;padding:16px;background:#fff;`;
      container.appendChild(chartDiv);

      const root = createRoot(chartDiv);
      try {
        await new Promise<void>((resolve) => {
          root.render(<ChartComponent />);
          // Enough for Recharts to measure the container and lay the chart
          // out. With animation off there is nothing further to wait for.
          setTimeout(resolve, 350);
        });

        const canvas = await html2canvas(chartDiv, {
          scale: CAPTURE_SCALE,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        });
        chartImages[name] = {
          dataUrl: canvas.toDataURL("image/png"),
          aspect: canvas.width / canvas.height,
        };
      } catch (err) {
        console.warn(`Failed to capture chart ${name}:`, err);
      } finally {
        // Unmount before detaching, or every chart leaks a live React root.
        root.unmount();
        chartDiv.remove();
      }
    }
  } finally {
    setChartCaptureMode(false);
    container.remove();
  }

  return chartImages;
}

/**
 * Renders the book, or one chapter of it.
 *
 * `chapterSlug` set produces an offprint: that chapter's own cover, its own
 * contents and figures, and only the references its text actually cites. It is
 * not a filtered copy of the whole book -- nothing about the other thirteen
 * chapters is loaded, so the wait is a few seconds rather than the ninety the
 * full book takes, and the charts captured are only the ones on its pages.
 *
 * The crisis resources are in the back matter of both. An excerpt of a
 * trauma-recovery book that drops them is worse than no excerpt.
 */
async function generateBookPDF(
  onProgress: (msg: string) => void,
  chapterSlug?: string
): Promise<void> {
  // jsPDF + html2canvas are ~600 kB, and the full book text is over a megabyte.
  // None of it is fetched until someone actually asks for the PDF.
  onProgress(chapterSlug ? "Loading the chapter..." : "Loading the book...");
  const [{ jsPDF: JsPDF }, { default: html2canvas }, charts, loaded] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
    import("@/components/chart-registry"),
    chapterSlug
      ? loadChapter(chapterSlug).then((c) => (c ? [c] : []))
      : loadAllChapters(),
  ]);

  const chapters = loaded;
  if (chapterSlug && chapters.length === 0) {
    throw new Error(`No chapter with slug "${chapterSlug}"`);
  }
  const only = chapterSlug ? chapters[0] : undefined;

  const referencedCharts = collectReferencedCharts(chapters, charts.ALL_CHART_COMPONENTS);
  onProgress(`Capturing ${referencedCharts.length} charts (this takes a minute)...`);
  const chartImages = await captureCharts(
    referencedCharts,
    html2canvas,
    charts,
    onProgress
  );

  onProgress("Building PDF...");
  const doc = new JsPDF({ unit: "mm", format: "letter", orientation: "portrait" });
  await embedBookFont(doc);

  buildCoverPage(doc, only);
  doc.addPage("letter");
  buildCopyrightPage(doc);

  // The contents and the list of figures need page numbers that only exist
  // once the book is set. Measure how many pages each will take, reserve them
  // now, and draw onto them at the end — that way the folios printed on the
  // chapters are right the first time, with no second pass over the book.
  const tocShape: TocEntry[] = chapters.flatMap((c) => [
    { label: `${c.order}. ${c.title}`, page: 0, isChapter: true },
    ...c.subchapters.map((sub) => ({
      label: `${c.order}.${sub.order}  ${sub.title}`,
      page: 0,
      isChapter: false,
    })),
  ]);
  if (collectBibliography(chapters).length) {
    tocShape.push({ label: "Sources and Further Reading", page: 0, isChapter: true });
  }

  const figureShape: TocEntry[] = referencedCharts.map((name) => ({
    label: figureTitle(name),
    page: 0,
    isChapter: false,
  }));

  const tocPages = measureListPages(doc, tocShape, 0);
  const figurePages = measureListPages(doc, figureShape, 0);
  const reserved = tocPages + figurePages;
  for (let i = 0; i < reserved; i++) doc.addPage("letter");

  const toc: TocEntry[] = [];
  const figures: TocEntry[] = [];

  let state: DocState = {
    doc,
    y: TEXT_TOP,
    pageNum: 2 + reserved,
  };

  let firstChapter = true;
  for (const chapter of chapters) {
    onProgress(`Writing chapter ${chapter.order}: ${chapter.title}`);

    // The reserved pages already exist; stamping a folio on the last of them
    // would print a page number on the contents.
    if (!firstChapter) addPageNumber(state);
    firstChapter = false;
    doc.addPage("letter");
    state.pageNum++;
    state.y = TEXT_TOP + CHAPTER_SINK;
    toc.push({
      label: `${chapter.order}. ${chapter.title}`,
      page: state.pageNum,
      isChapter: true,
    });

    // No running header on an opener: the page announces the chapter itself,
    // and a strap repeating it above the title is the mark of a page produced
    // by a loop rather than laid out.
    const leftH = bookInfo.title;

    // Lay the opener out before painting the tint, so the band always fits its
    // contents and the eyebrow never collides with the title baseline.
    doc.setFont(BOOK_FONT, "bold");
    doc.setFontSize(FONT_SIZE_H1);
    const titleLines = doc.splitTextToSize(chapter.title, TEXT_WIDTH) as string[];
    doc.setFont(BOOK_FONT, "italic");
    doc.setFontSize(12);
    const descLines = doc.splitTextToSize(chapter.description, TEXT_WIDTH) as string[];

    const bandTop = state.y - 3;
    const bandHeight = 6 + 8 + titleLines.length * 11 + descLines.length * 6.5 + 6;
    doc.setFillColor(240, 245, 255);
    doc.rect(MARGIN_LEFT - 2, bandTop, TEXT_WIDTH + 4, bandHeight, "F");

    doc.setFont(BOOK_FONT, "normal");
    doc.setFontSize(10);
    doc.setTextColor(59, 130, 246);
    state.y += 5;
    doc.text(`CHAPTER ${chapter.order}`, MARGIN_LEFT, state.y);
    state.y += 12;

    doc.setFont(BOOK_FONT, "bold");
    doc.setFontSize(FONT_SIZE_H1);
    doc.setTextColor(15, 23, 42);
    titleLines.forEach((l) => {
      doc.text(l, MARGIN_LEFT, state.y);
      state.y += 11;
    });

    doc.setFont(BOOK_FONT, "italic");
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    descLines.forEach((l) => {
      doc.text(l, MARGIN_LEFT, state.y);
      state.y += 6.5;
    });
    state.y = bandTop + bandHeight + 8;

    doc.setTextColor(26, 26, 26);
    doc.setDrawColor(200, 210, 230);
    doc.line(MARGIN_LEFT, state.y, PAGE_WIDTH - MARGIN_RIGHT, state.y);
    state.y += 8;

    state = await renderMarkdownContent(
      state,
      chapter.content,
      leftH,
      chapter.title,
      chartImages,
      figures
    );

    for (const sub of chapter.subchapters) {
      addPageNumber(state);
      doc.addPage("letter");
      state.pageNum++;
      state.y = TEXT_TOP + SUBCHAPTER_SINK;
      toc.push({
        label: `${chapter.order}.${sub.order}  ${sub.title}`,
        page: state.pageNum,
        isChapter: false,
      });

      const subLeftH = chapter.title;
      const subRightH = sub.title;

      doc.setFont(BOOK_FONT, "normal");
      doc.setFontSize(9);
      doc.setTextColor(59, 130, 246);
      // The label needs clearance: at +4/+7 its baseline sat inside the 18pt
      // title's ascenders and the two printed on top of each other.
      doc.text(`${chapter.order}.${sub.order}`, MARGIN_LEFT, state.y + 4);
      state.y += 12;

      doc.setFont(BOOK_FONT, "bold");
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      const subTitleLines = doc.splitTextToSize(sub.title, TEXT_WIDTH);
      subTitleLines.forEach((l: string) => {
        doc.text(l, MARGIN_LEFT, state.y);
        state.y += 8;
      });

      doc.setDrawColor(200, 210, 230);
      doc.line(MARGIN_LEFT, state.y, PAGE_WIDTH - MARGIN_RIGHT, state.y);
      state.y += 8;

      doc.setTextColor(26, 26, 26);
      state = await renderMarkdownContent(
        state,
        sub.content,
        subLeftH,
        subRightH,
        chartImages,
        figures
      );
    }
  }

  // ---- Sources and further reading ----
  const bibliography = collectBibliography(chapters);
  if (bibliography.length) {
    const bibHeader = "Sources and Further Reading";
    addPageNumber(state);
    doc.addPage("letter");
    state.pageNum++;
    state.y = TEXT_TOP + SUBCHAPTER_SINK;
    toc.push({ label: bibHeader, page: state.pageNum, isChapter: true });

    doc.setFont(BOOK_FONT, "bold");
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text(bibHeader, MARGIN_LEFT, state.y + 8);
    state.y += 16;
    doc.setDrawColor(200, 210, 230);
    doc.line(MARGIN_LEFT, state.y, PAGE_WIDTH - MARGIN_RIGHT, state.y);
    state.y += 8;

    doc.setFont(BOOK_FONT, "italic");
    doc.setFontSize(FONT_SIZE_SMALL);
    doc.setTextColor(90, 90, 90);
    const bibNote = doc.splitTextToSize(
      "Works cited across the book, in one list. Where the text names an author and a year, the full reference is here.",
      TEXT_WIDTH
    ) as string[];
    bibNote.forEach((l) => {
      doc.text(l, MARGIN_LEFT, state.y);
      state.y += 5;
    });
    state.y += 5;

    for (const entry of bibliography) {
      state = addHangingEntry(state, entry, bookInfo.title, bibHeader);
    }
  }

  addPageNumber(state);
  doc.addPage("letter");
  state.pageNum++;
  state.y = TEXT_TOP;

  // The author's note speaks for the whole book, so a single-chapter offprint
  // does not carry it. The crisis resources below are carried by both: an
  // excerpt of a trauma-recovery book that drops them is worse than no excerpt.
  if (!only) {
    doc.setFont(BOOK_FONT, "bold");
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text("A Note from the Author", PAGE_WIDTH / 2, state.y + 15, { align: "center" });
    state.y += 28;

    doc.setDrawColor(180, 180, 180);
    doc.line(MARGIN_LEFT + 20, state.y, PAGE_WIDTH - MARGIN_RIGHT - 20, state.y);
    state.y += 10;

    const noteText = `Writing this book has been a labor of love, born from witnessing the profound courage it takes for ordinary people to face extraordinary pain. Healing is not linear, and it is rarely neat — but it is always possible.\n\nIf even one person finds comfort, clarity, or hope in these pages, the work has been worthwhile. You are not alone. Recovery is possible. You deserve to heal.`;
    doc.setFont(BOOK_FONT, "italic");
    doc.setFontSize(FONT_SIZE_NORMAL);
    doc.setTextColor(60, 60, 60);
    const noteLines = doc.splitTextToSize(noteText, TEXT_WIDTH);
    noteLines.forEach((l: string) => {
      doc.text(l, MARGIN_LEFT, state.y);
      state.y += 6.5;
    });

    state.y += 8;
    doc.setFont(BOOK_FONT, "bold");
    doc.setFontSize(11);
    doc.setTextColor(26, 26, 26);
    doc.text(`— ${bookInfo.author}`, MARGIN_LEFT + 20, state.y);
    state.y += 20;
  } else {
    // An offprint says what it is an offprint of, and where the rest lives.
    doc.setFont(BOOK_FONT, "italic");
    doc.setFontSize(FONT_SIZE_NORMAL);
    doc.setTextColor(60, 60, 60);
    const provenance = doc.splitTextToSize(
      `This is chapter ${only.order} of ${bookInfo.title} by ${bookInfo.author}, ` +
        `printed on its own. The other ${chapterManifest.length - 1} chapters, the full ` +
        `bibliography and the complete book are on the website.`,
      TEXT_WIDTH
    ) as string[];
    provenance.forEach((l) => {
      doc.text(l, MARGIN_LEFT, state.y);
      state.y += 6.5;
    });
    state.y += 14;
  }

  doc.setFont(BOOK_FONT, "bold");
  doc.setFontSize(13);
  doc.text("Crisis Resources", MARGIN_LEFT, state.y);
  state.y += 8;
  doc.setFont(BOOK_FONT, "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const resources = [
    "988 Suicide and Crisis Lifeline: Call or text 988",
    "Crisis Text Line: Text HOME to 741741",
    "National Domestic Violence Hotline: 1-800-799-7233",
    "SAMHSA National Helpline: 1-800-662-4357",
    "Sex Addicts Anonymous: www.saa-recovery.org",
  ];
  resources.forEach((r) => {
    doc.text(r, MARGIN_LEFT, state.y);
    state.y += 6;
  });

  state.y += 15;
  doc.setDrawColor(180, 180, 180);
  doc.line(MARGIN_LEFT, state.y, PAGE_WIDTH - MARGIN_RIGHT, state.y);
  state.y += 10;

  doc.setFont(BOOK_FONT, "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(bookInfo.title, MARGIN_LEFT, state.y);
  state.y += 7;
  doc.setFont(BOOK_FONT, "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`By ${bookInfo.author}`, MARGIN_LEFT, state.y);
  state.y += 6;
  doc.text("Recovery Works Publishing • 2025", MARGIN_LEFT, state.y);

  addPageNumber(state);

  // ---- Fill in the pages reserved at the front ----
  drawList(doc, 3, "TABLE OF CONTENTS", toc);
  if (figures.length) {
    drawList(doc, 3 + tocPages, "LIST OF FIGURES", figures);
  }

  // ---- Bookmarks, so the digital copy has a sidebar ----
  for (const entry of toc) {
    if (entry.isChapter) {
      const parent = doc.outline.add(null, entry.label, { pageNumber: entry.page });
      for (const sub of toc) {
        // Subchapters sit between this chapter and the next one.
        if (sub.isChapter || sub.page < entry.page) continue;
        const nextChapter = toc.find((t) => t.isChapter && t.page > entry.page);
        if (nextChapter && sub.page >= nextChapter.page) continue;
        doc.outline.add(parent, sub.label, { pageNumber: sub.page });
      }
    }
  }

  // A printed book is made from folded sheets, so it always has an even number
  // of sides. Print services either reject an odd count or insert the blank
  // themselves, in which case it lands after the last page rather than where
  // the book would want it. Better to own it.
  if (doc.getNumberOfPages() % 2 === 1) doc.addPage("letter");

  onProgress("Saving PDF...");
  doc.save(
    only
      ? `healing-together-${String(only.order).padStart(2, "0")}-${only.slug}.pdf`
      : "healing-together-matthew-emma.pdf"
  );
}

/**
 * Shared by both download buttons: the loading flag, the progress line, and
 * turning a thrown error into something a reader can act on rather than a
 * button that silently goes back to idle.
 */
function usePdfDownload(chapterSlug?: string) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [failed, setFailed] = useState(false);

  const start = async () => {
    setLoading(true);
    setFailed(false);
    setStatus("Starting...");
    try {
      await generateBookPDF((msg) => setStatus(msg), chapterSlug);
      setStatus("");
    } catch (err) {
      console.error("PDF generation failed:", err);
      setFailed(true);
      setStatus("Could not build the PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { loading, status, failed, start };
}

/**
 * One chapter as its own PDF.
 *
 * The full book takes about ninety seconds, nearly all of it capturing
 * ninety-one charts through an offscreen React root. A reader who wants the
 * grounding-techniques chapter should not wait for the other thirteen, and
 * mostly will not: a chapter captures only the figures on its own pages.
 */
export function ChapterPDFButton({ slug, title }: { slug: string; title: string }) {
  const { loading, status, failed, start } = usePdfDownload(slug);

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        disabled={loading}
        onClick={start}
        data-testid="button-download-chapter-pdf"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Building PDF...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" aria-hidden="true" />
            Download this chapter (PDF)
          </>
        )}
        <span className="sr-only">: {title}</span>
      </Button>
      {status ? (
        <p
          className={`max-w-xs text-xs ${failed ? "text-destructive" : "text-muted-foreground"}`}
          role="status"
          aria-live="polite"
        >
          {status}
        </p>
      ) : null}
    </div>
  );
}

export function PDFDownloadButton() {
  const { loading, status, failed, start } = usePdfDownload();

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        size="lg"
        variant="outline"
        className="gap-2"
        disabled={loading}
        onClick={start}
        data-testid="button-download-pdf"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Generating PDF...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" aria-hidden="true" />
            Download Full Book (PDF)
          </>
        )}
      </Button>
      {status ? (
        <p
          className={`max-w-xs text-center text-xs ${failed ? "text-destructive" : "text-muted-foreground"}`}
          role="status"
          aria-live="polite"
        >
          {status}
        </p>
      ) : null}
    </div>
  );
}
