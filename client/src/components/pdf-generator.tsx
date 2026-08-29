import { useState } from "react";
import { createRoot } from "react-dom/client";
import type { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { bookInfo, loadAllChapters } from "@/lib/chapters";
import type { Chapter } from "@/lib/chapters";
import {
  PTSDPrevalenceChart, ACEsPrevalenceChart, RecoveryTimelineChart,
  TraumaAddictionChart, TherapyEffectivenessChart, AttachmentStylesChart,
  ACEsHealthRiskChart, PostTraumaticGrowthChart, IPVPTSDChart,
  DBTSkillsChart, PhysicalWellnessChart, ExerciseImpactChart,
  FourPillarsChart, EmotionalRegulationChart, MentalWellnessChart,
  SocialConnectionChart, NutritionImpactChart, SleepRecoveryChart,
  AmygdalaActivityChart, BrainRegionsTraumaChart, NeurotransmitterLevelsChart,
  CortisolPatternChart, PolyvagalStatesChart, PTSDSymptomsChart,
  ComplexPTSDChart, BrainHealingChart, WindowToleranceChart,
  ACTHexaflexChart, FamilyDysfunctionChart, ChildhoodTraumaTimelineChart,
  RelationshipSafetyChart, AdultTraumaTypesChart, GroundingTechniquesChart,
  CopingStrategiesChart, ResilienceFactorsChart, SpiritualPracticesChart,
  RecoveryValuesChart, TreatmentModalitiesChart, CognitiveDistortionsChart,
  MindfulnessBenefitsChart, SomaticTherapyChart, EMDRPhasesChart,
  BoundaryTypesChart, InnerChildHealingChart, DistressToleranceSkillsChart,
  InterpersonalEffectivenessChart, SexAddictionPrevalenceChart,
  SexAddictionBrainChart, SexAddictionTraumaChart, CarnesAddictionCycleChart,
  SexAddictionBeliefsChart, ThreeCirclesChart, LoveAddictionPatternsChart,
  TraumaBondingCycleChart, MeadowsTreatmentModelChart, MeadowsOutcomeChart,
  SexAddictionRecoveryProgressChart, SexAddictionRecoveryRoadmapChart,
  TreatmentAccessChart,
  AddictionHeritabilityChart,
  DopamineRateChart,
  AlcoholGabaGlutamateChart,
  RelationshipTypesChart,
  SobrietyChallengesChart,
  CarnesRecoveryStagesChart,
  WorryWindowChart,
  FunctionalAdultCurveChart,
  DramaTriangleChart,
  ACATreeChart,
  CoreSymptomsChart,
  FourHorsemenChart,
  BoundaryLadderChart,
  AttachmentMapChart,
  CatastrophizingIcebergChart,
  CoreBeliefCycleChart,
  AskIntensityChart,
  MiddlePathChart,
  BullseyeChart,
  FearDareChart,
  AddictiveSystemChart,
  ThreeCirclesGuideChart,
  setStaticCharts,
} from "@/components/trauma-charts";

const PAGE_WIDTH = 215.9;
const PAGE_HEIGHT = 279.4;
const MARGIN_LEFT = 25.4;
const MARGIN_RIGHT = 25.4;
const MARGIN_TOP = 25.4;
const MARGIN_BOTTOM = 25.4;
const TEXT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
const LINE_HEIGHT_NORMAL = 6;
const LINE_HEIGHT_HEADING = 8;
const FONT_SIZE_NORMAL = 11;
const FONT_SIZE_H1 = 24;
const FONT_SIZE_H2 = 16;
const FONT_SIZE_H3 = 13;
const FONT_SIZE_H4 = 12;
const FONT_SIZE_SMALL = 9;

const ALL_CHART_COMPONENTS: Record<string, React.ComponentType> = {
  PTSDPrevalenceChart, ACEsPrevalenceChart, RecoveryTimelineChart,
  TraumaAddictionChart, TherapyEffectivenessChart, AttachmentStylesChart,
  ACEsHealthRiskChart, PostTraumaticGrowthChart, IPVPTSDChart,
  DBTSkillsChart, PhysicalWellnessChart, ExerciseImpactChart,
  FourPillarsChart, EmotionalRegulationChart, MentalWellnessChart,
  SocialConnectionChart, NutritionImpactChart, SleepRecoveryChart,
  AmygdalaActivityChart, BrainRegionsTraumaChart, NeurotransmitterLevelsChart,
  CortisolPatternChart, PolyvagalStatesChart, PTSDSymptomsChart,
  ComplexPTSDChart, BrainHealingChart, WindowToleranceChart,
  ACTHexaflexChart, FamilyDysfunctionChart, ChildhoodTraumaTimelineChart,
  RelationshipSafetyChart, AdultTraumaTypesChart, GroundingTechniquesChart,
  CopingStrategiesChart, ResilienceFactorsChart, SpiritualPracticesChart,
  RecoveryValuesChart, TreatmentModalitiesChart, CognitiveDistortionsChart,
  MindfulnessBenefitsChart, SomaticTherapyChart, EMDRPhasesChart,
  BoundaryTypesChart, InnerChildHealingChart, DistressToleranceSkillsChart,
  InterpersonalEffectivenessChart, SexAddictionPrevalenceChart,
  SexAddictionBrainChart, SexAddictionTraumaChart, CarnesAddictionCycleChart,
  SexAddictionBeliefsChart, ThreeCirclesChart, LoveAddictionPatternsChart,
  TraumaBondingCycleChart, MeadowsTreatmentModelChart, MeadowsOutcomeChart,
  SexAddictionRecoveryProgressChart, SexAddictionRecoveryRoadmapChart,
  TreatmentAccessChart,
  AddictionHeritabilityChart,
  DopamineRateChart,
  AlcoholGabaGlutamateChart,
  RelationshipTypesChart,
  SobrietyChallengesChart,
  CarnesRecoveryStagesChart,
  WorryWindowChart,
  FunctionalAdultCurveChart,
  DramaTriangleChart,
  ACATreeChart,
  CoreSymptomsChart,
  FourHorsemenChart,
  BoundaryLadderChart,
  AttachmentMapChart,
  CatastrophizingIcebergChart,
  CoreBeliefCycleChart,
  AskIntensityChart,
  MiddlePathChart,
  BullseyeChart,
  FearDareChart,
  AddictiveSystemChart,
  ThreeCirclesGuideChart,
};

/** Every chart placeholder the book actually references, in first-use order. */
function collectReferencedCharts(chapters: Chapter[]): string[] {
  const seen = new Set<string>();
  for (const chapter of chapters) {
    const sources = [chapter.content, ...chapter.subchapters.map((s) => s.content)];
    for (const source of sources) {
      for (const match of source.matchAll(/chart:(\w+)/g)) {
        if (ALL_CHART_COMPONENTS[match[1]]) seen.add(match[1]);
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

interface DocState {
  doc: jsPDF;
  y: number;
  pageNum: number;
}

function addRunningHeader(state: DocState, leftText: string, rightText: string) {
  const { doc } = state;
  doc.setFontSize(8);
  doc.setFont("times", "italic");
  doc.setTextColor(150, 150, 150);
  doc.text(leftText, MARGIN_LEFT, 18);
  doc.text(rightText, PAGE_WIDTH - MARGIN_RIGHT, 18, { align: "right" });
  doc.setDrawColor(200, 200, 200);
  doc.line(MARGIN_LEFT, 20, PAGE_WIDTH - MARGIN_RIGHT, 20);
  doc.setTextColor(26, 26, 26);
}

function addPageNumber(state: DocState) {
  const { doc, pageNum } = state;
  doc.setFontSize(9);
  doc.setFont("times", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text(String(pageNum), PAGE_WIDTH / 2, PAGE_HEIGHT - 12, { align: "center" });
  doc.setTextColor(26, 26, 26);
}

function newPage(state: DocState, leftHeader: string, rightHeader: string): DocState {
  addPageNumber(state);
  state.doc.addPage("letter");
  state.pageNum++;
  state.y = MARGIN_TOP + 10;
  addRunningHeader(state, leftHeader, rightHeader);
  return state;
}

/** Last baseline that still sits inside the text block. */
const PAGE_FLOOR = PAGE_HEIGHT - MARGIN_BOTTOM - 10;

function lineHeightFor(fontSize: number): number {
  return fontSize <= 10 ? 5 : fontSize <= 12 ? LINE_HEIGHT_NORMAL : LINE_HEIGHT_HEADING;
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

function checkPageBreak(state: DocState, neededHeight: number, leftHeader: string, rightHeader: string): DocState {
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
  atomic = false
): DocState {
  if (!text.trim()) return state;
  const { doc } = state;
  doc.setFontSize(fontSize);
  doc.setFont("times", fontStyle);
  doc.setTextColor(...color);

  const lineH = lineHeightFor(fontSize);
  const availWidth = TEXT_WIDTH - indent;
  const lines = doc.splitTextToSize(text, availWidth) as string[];

  // Decide where this block may break before placing a single line of it.
  let roomHere = linesLeft(state.y, lineH);
  if (lines.length > roomHere) {
    const wholePage = linesLeft(MARGIN_TOP + 10, lineH);
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

function addChartImage(
  state: DocState,
  image: ChartImage,
  leftHeader: string,
  rightHeader: string
): DocState {
  const maxW = TEXT_WIDTH;
  const maxH = 110; // max chart height in mm
  // Size from the captured pixels rather than an assumed ratio, so a tall chart
  // is scaled down instead of being squeezed or cropped.
  const imgAspect = image.aspect > 0 ? image.aspect : 2;
  const imgH = Math.min(maxH, maxW / imgAspect);
  const imgW = imgH * imgAspect;
  const xOffset = (TEXT_WIDTH - imgW) / 2;

  state = checkPageBreak(state, imgH + 8, leftHeader, rightHeader);
  state.y += 4;
  // No border is drawn here: the captured image is a ChartFrame, which already
  // carries its own. Adding one put every figure in the book inside a box
  // inside a box.
  // Without an explicit compression level jsPDF embeds the decoded bitmap raw
  // (width x height x 3 bytes per chart), which pushed the book past 100 MB.
  state.doc.addImage(
    image.dataUrl,
    "PNG",
    MARGIN_LEFT + xOffset,
    state.y,
    imgW,
    imgH,
    undefined,
    "MEDIUM"
  );
  state.y += imgH + 6;
  return state;
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

/** Height a captured chart will occupy, so a heading can reserve it. */
function chartHeight(image: ChartImage): number {
  const aspect = image.aspect > 0 ? image.aspect : 2;
  return Math.min(110, TEXT_WIDTH / aspect);
}

/** Height of a list item, which never splits across a page. */
function listItemHeight(state: DocState, text: string, indent: number): number {
  state.doc.setFontSize(FONT_SIZE_NORMAL);
  state.doc.setFont("times", "normal");
  const n = (state.doc.splitTextToSize(text, TEXT_WIDTH - indent) as string[]).length;
  return n * LINE_HEIGHT_NORMAL;
}

/** Height of one laid-out table row. */
function tableRowHeight(state: DocState, row: string[], columns: number, bold: boolean): number {
  const { doc } = state;
  doc.setFont("times", bold ? "bold" : "normal");
  doc.setFontSize(FONT_SIZE_SMALL);
  const colWidth = TEXT_WIDTH / columns;
  const lines = Array.from({ length: columns }, (_, i) =>
    (doc.splitTextToSize(row[i] ?? "", colWidth - 2 * TABLE_ROW_PADDING) as string[]).length
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
  const heights = rows.map((r, i) => tableRowHeight(state, r, columns, hasHeader && i === 0));
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

  const colWidth = TEXT_WIDTH / columnCount;
  const { doc } = state;

  /** Lays a row out without drawing it, so its height is known in advance. */
  const layout = (row: string[], isHeaderRow: boolean) => {
    doc.setFont("times", isHeaderRow ? "bold" : "normal");
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

  const draw = (
    laid: { wrapped: string[][]; height: number },
    isHeaderRow: boolean
  ) => {
    doc.setFont("times", isHeaderRow ? "bold" : "normal");
    doc.setFontSize(FONT_SIZE_SMALL);
    if (isHeaderRow) {
      doc.setFillColor(240, 245, 255);
      doc.rect(MARGIN_LEFT, state.y, TEXT_WIDTH, laid.height, "F");
    }
    doc.setDrawColor(210, 216, 228);
    doc.setLineWidth(0.2);
    doc.rect(MARGIN_LEFT, state.y, TEXT_WIDTH, laid.height);
    doc.setTextColor(26, 26, 26);
    laid.wrapped.forEach((lines, colIndex) => {
      const x = MARGIN_LEFT + colIndex * colWidth;
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
    total <= PAGE_FLOOR - (MARGIN_TOP + 10) &&
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
  chartImages: Record<string, ChartImage>
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
    doc.setFont("times", "bold");
    const count = (doc.splitTextToSize(head.text, TEXT_WIDTH) as string[]).length;
    return head.before + count * lineHeightFor(head.size) + head.after;
  };

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
      state = addText(state, head.text, head.size, "bold", leftHeader, rightHeader, 0, [26, 26, 26], true);
      state.y += head.after;
    });
  };

  /**
   * Height a heading must clear for the text that follows it: the leading gap
   * plus the first `MIN_ORPHAN` lines. Leaving the gap out of the reserve was
   * enough on its own to strand a heading on a page that was almost full.
   */
  const openingHeight = (text: string, indent = 0, gap = 2) => {
    state.doc.setFontSize(FONT_SIZE_NORMAL);
    state.doc.setFont("times", "normal");
    const n = (state.doc.splitTextToSize(text, TEXT_WIDTH - indent) as string[]).length;
    return gap + Math.min(n, MIN_ORPHAN) * LINE_HEIGHT_NORMAL;
  };

  const flushPara = () => {
    if (paraBuffer.length === 0) return;
    const combined = paraBuffer.join(" ").trim();
    if (!combined) { paraBuffer = []; return; }
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
          state = addText(state, rest, FONT_SIZE_NORMAL, "normal", leftHeader, rightHeader);
          state.y += 2;
        }
        return;
      }
    }

    const cleaned = stripMarkdownForPdf(combined);
    if (cleaned) {
      placeHeading(openingHeight(cleaned));
      state.y += 2;
      state = addText(state, cleaned, FONT_SIZE_NORMAL, "normal", leftHeader, rightHeader);
      state.y += 2;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

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
      if (chartImages[chartName]) {
        placeHeading(chartHeight(chartImages[chartName]) + 8);
        state = addChartImage(state, chartImages[chartName], leftHeader, rightHeader);
      } else {
        placeHeading(LINE_HEIGHT_NORMAL);
        state.y += 2;
        state = addText(state, `[Chart: ${chartName}]`, FONT_SIZE_SMALL, "italic", leftHeader, rightHeader, 4, [120, 120, 120]);
        state.y += 2;
      }
      continue;
    }
    if (trimmed.startsWith("```")) {
      flushPara();
      while (i < lines.length - 1 && !lines[++i].trim().startsWith("```")) {}
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
      pending.push({ text, size: FONT_SIZE_H4, before: 4, after: 2 });
    } else if (/^###\s/.test(line)) {
      flushPara();
      const text = stripMarkdownForPdf(line.replace(/^###\s+/, ""));
      pending.push({ text, size: FONT_SIZE_H3, before: 6, after: 3 });
    } else if (/^##\s/.test(line)) {
      flushPara();
      const text = stripMarkdownForPdf(line.replace(/^##\s+/, ""));
      pending.push({ text, size: FONT_SIZE_H2, before: 8, after: 4 });
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
        placeHeading(openingHeight(text, 8, 3));
        state.y += 3;
        state = checkPageBreak(state, 8, leftHeader, rightHeader);
        state.doc.setDrawColor(180, 180, 180);
        state.doc.setLineWidth(0.8);
        const startY = state.y - 1;
        // Most quotes in the source already carry their own quotation marks;
        // add a pair only when neither end has one.
        const alreadyQuoted = /^["\u201c\u2018']/.test(text) || /["\u201d\u2019']$/.test(text);
        const quoted = alreadyQuoted ? text : `"${text}"`;
        state = addText(state, quoted, FONT_SIZE_NORMAL, "italic", leftHeader, rightHeader, 8, [80, 80, 80], true);
        // Only rule the margin when the quote stayed on one page; a split one
        // would otherwise draw its bar from the old y to the new.
        if (state.y > startY) {
          state.doc.line(MARGIN_LEFT + 2, startY, MARGIN_LEFT + 2, state.y);
        }
        state.doc.setLineWidth(0.2);
        state.y += 3;
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
  return state;
}

function buildCoverPage(doc: jsPDF): void {
  doc.setFillColor(245, 247, 250);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, PAGE_WIDTH, 8, "F");

  doc.setFont("times", "bold");
  doc.setFontSize(32);
  doc.setTextColor(15, 23, 42);
  doc.text(bookInfo.title, PAGE_WIDTH / 2, 80, { align: "center" });

  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(1);
  doc.line(60, 92, PAGE_WIDTH - 60, 92);
  doc.setLineWidth(0.2);

  doc.setFont("times", "italic");
  doc.setFontSize(14);
  doc.setTextColor(71, 85, 105);
  const subtitleLines = doc.splitTextToSize(bookInfo.subtitle, 140);
  subtitleLines.forEach((line: string, i: number) => {
    doc.text(line, PAGE_WIDTH / 2, 104 + i * 8, { align: "center" });
  });

  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  const descLines = doc.splitTextToSize(bookInfo.description, 130);
  descLines.slice(0, 4).forEach((line: string, i: number) => {
    doc.text(line, PAGE_WIDTH / 2, 130 + i * 6.5, { align: "center" });
  });

  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(bookInfo.author, PAGE_WIDTH / 2, 185, { align: "center" });

  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("Recovery Works Publishing", PAGE_WIDTH / 2, 230, { align: "center" });
  doc.text("2025", PAGE_WIDTH / 2, 237, { align: "center" });

  doc.setFillColor(59, 130, 246);
  doc.rect(0, PAGE_HEIGHT - 8, PAGE_WIDTH, 8, "F");
}

function buildCopyrightPage(doc: jsPDF): void {
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  let y = 60;
  const addLine = (text: string, gap = 6) => {
    const lines = doc.splitTextToSize(text, TEXT_WIDTH);
    lines.forEach((l: string) => { doc.text(l, MARGIN_LEFT, y); y += gap; });
    y += 2;
  };

  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.text(bookInfo.title, MARGIN_LEFT, y); y += 8;
  doc.setFont("times", "italic");
  doc.setFontSize(10);
  doc.text(bookInfo.subtitle, MARGIN_LEFT, y); y += 10;
  doc.setFont("times", "normal");

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
  addLine("If you are in crisis, please contact the 988 Suicide and Crisis Lifeline by calling or texting 988.");

  y += 10;
  addLine("Published by Recovery Works Publishing");
  addLine("First Edition, 2025");
}

function buildTOCPage(doc: jsPDF, chaps: Chapter[]): void {
  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text("TABLE OF CONTENTS", PAGE_WIDTH / 2, 45, { align: "center" });

  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_LEFT, 50, PAGE_WIDTH - MARGIN_RIGHT, 50);
  doc.setLineWidth(0.2);

  let y = 62;
  const addTOCEntry = (text: string, isChapter: boolean) => {
    if (y > PAGE_HEIGHT - MARGIN_BOTTOM - 10) {
      doc.addPage("letter");
      y = MARGIN_TOP + 10;
    }
    doc.setFont("times", isChapter ? "bold" : "normal");
    doc.setFontSize(isChapter ? 12 : 10);
    doc.setTextColor(isChapter ? 15 : 70, isChapter ? 23 : 80, isChapter ? 42 : 90);
    const indent = isChapter ? 0 : 10;
    const lines = doc.splitTextToSize(text, TEXT_WIDTH - indent - 20);
    lines.forEach((l: string, i: number) => {
      doc.text(l, MARGIN_LEFT + indent, y + i * (isChapter ? 7 : 5.5));
    });
    y += lines.length * (isChapter ? 7 : 5.5) + (isChapter ? 4 : 2);
  };

  chaps.forEach((chapter) => {
    addTOCEntry(`${chapter.order}. ${chapter.title}`, true);
    chapter.subchapters.forEach((sub) => {
      addTOCEntry(`${chapter.order}.${sub.order}  ${sub.title}`, false);
    });
    y += 2;
  });
}

type Html2Canvas = typeof import("html2canvas").default;

/** A captured chart plus its real pixel aspect, so the PDF can size it without guessing. */
interface ChartImage {
  dataUrl: string;
  aspect: number;
}

async function captureCharts(
  chartNames: string[],
  html2canvas: Html2Canvas,
  onProgress: (msg: string) => void
): Promise<Record<string, ChartImage>> {
  const chartImages: Record<string, ChartImage> = {};

  // Offscreen host for the charts we mount one at a time.
  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;left:-9999px;top:0;width:800px;background:#fff;z-index:-1;pointer-events:none;";
  document.body.appendChild(container);

  // Charts must be captured with their entry animation off: at 600ms a pie is
  // still a sliver and a radar is still growing, and Recharts does not paint
  // its value labels until the animation lands.
  setStaticCharts(true);

  try {
    for (let i = 0; i < chartNames.length; i++) {
      const name = chartNames[i];
      const ChartComponent = ALL_CHART_COMPONENTS[name];
      if (!ChartComponent) continue;
      onProgress(`Rendering chart ${i + 1}/${chartNames.length}: ${name}`);

      // Height is left to the content: a fixed 400px box cropped the taller
      // charts (axis labels and the last series were cut off in the PDF).
      const chartDiv = document.createElement("div");
      chartDiv.style.cssText = "width:800px;padding:16px;background:#fff;";
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
          scale: 1.5,
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
    setStaticCharts(false);
    container.remove();
  }

  return chartImages;
}

async function generateBookPDF(onProgress: (msg: string) => void): Promise<void> {
  // jsPDF + html2canvas are ~600 kB, and the full book text is over a megabyte.
  // None of it is fetched until someone actually asks for the PDF.
  onProgress("Loading the book...");
  const [{ jsPDF: JsPDF }, { default: html2canvas }, chapters] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
    loadAllChapters(),
  ]);

  const referencedCharts = collectReferencedCharts(chapters);
  onProgress(`Capturing ${referencedCharts.length} charts (this takes a minute)...`);
  const chartImages = await captureCharts(referencedCharts, html2canvas, onProgress);

  onProgress("Building PDF...");
  const doc = new JsPDF({ unit: "mm", format: "letter", orientation: "portrait" });

  buildCoverPage(doc);
  doc.addPage("letter");
  buildCopyrightPage(doc);
  doc.addPage("letter");
  buildTOCPage(doc, chapters);

  let state: DocState = {
    doc,
    y: MARGIN_TOP + 10,
    pageNum: 4,
  };

  for (const chapter of chapters) {
    onProgress(`Writing chapter ${chapter.order}: ${chapter.title}`);

    addPageNumber(state);
    doc.addPage("letter");
    state.pageNum++;
    state.y = MARGIN_TOP + 10;

    const leftH = bookInfo.title;
    const rightH = `Chapter ${chapter.order}`;
    addRunningHeader(state, leftH, rightH);

    // Lay the opener out before painting the tint, so the band always fits its
    // contents and the eyebrow never collides with the title baseline.
    doc.setFont("times", "bold");
    doc.setFontSize(FONT_SIZE_H1);
    const titleLines = doc.splitTextToSize(chapter.title, TEXT_WIDTH) as string[];
    doc.setFont("times", "italic");
    doc.setFontSize(12);
    const descLines = doc.splitTextToSize(chapter.description, TEXT_WIDTH) as string[];

    const bandTop = state.y - 3;
    const bandHeight = 6 + 8 + titleLines.length * 11 + descLines.length * 6.5 + 6;
    doc.setFillColor(240, 245, 255);
    doc.rect(MARGIN_LEFT - 2, bandTop, TEXT_WIDTH + 4, bandHeight, "F");

    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.setTextColor(59, 130, 246);
    state.y += 5;
    doc.text(`CHAPTER ${chapter.order}`, MARGIN_LEFT, state.y);
    state.y += 12;

    doc.setFont("times", "bold");
    doc.setFontSize(FONT_SIZE_H1);
    doc.setTextColor(15, 23, 42);
    titleLines.forEach((l) => {
      doc.text(l, MARGIN_LEFT, state.y);
      state.y += 11;
    });

    doc.setFont("times", "italic");
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

    state = await renderMarkdownContent(state, chapter.content, leftH, chapter.title, chartImages);

    for (const sub of chapter.subchapters) {
      addPageNumber(state);
      doc.addPage("letter");
      state.pageNum++;
      state.y = MARGIN_TOP + 10;

      const subLeftH = chapter.title;
      const subRightH = sub.title;
      addRunningHeader(state, subLeftH, subRightH);

      doc.setFont("times", "normal");
      doc.setFontSize(9);
      doc.setTextColor(59, 130, 246);
      // The label needs clearance: at +4/+7 its baseline sat inside the 18pt
      // title's ascenders and the two printed on top of each other.
      doc.text(`${chapter.order}.${sub.order}`, MARGIN_LEFT, state.y + 4);
      state.y += 12;

      doc.setFont("times", "bold");
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
      state = await renderMarkdownContent(state, sub.content, subLeftH, subRightH, chartImages);
    }
  }

  addPageNumber(state);
  doc.addPage("letter");
  state.pageNum++;
  state.y = MARGIN_TOP + 10;

  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text("A Note from the Author", PAGE_WIDTH / 2, state.y + 15, { align: "center" });
  state.y += 28;

  doc.setDrawColor(180, 180, 180);
  doc.line(MARGIN_LEFT + 20, state.y, PAGE_WIDTH - MARGIN_RIGHT - 20, state.y);
  state.y += 10;

  const noteText = `Writing this book has been a labor of love, born from witnessing the profound courage it takes for ordinary people to face extraordinary pain. Healing is not linear, and it is rarely neat — but it is always possible.\n\nIf even one person finds comfort, clarity, or hope in these pages, the work has been worthwhile. You are not alone. Recovery is possible. You deserve to heal.`;
  doc.setFont("times", "italic");
  doc.setFontSize(FONT_SIZE_NORMAL);
  doc.setTextColor(60, 60, 60);
  const noteLines = doc.splitTextToSize(noteText, TEXT_WIDTH);
  noteLines.forEach((l: string) => { doc.text(l, MARGIN_LEFT, state.y); state.y += 6.5; });

  state.y += 8;
  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.setTextColor(26, 26, 26);
  doc.text(`— ${bookInfo.author}`, MARGIN_LEFT + 20, state.y);
  state.y += 20;

  doc.setFont("times", "bold");
  doc.setFontSize(13);
  doc.text("Crisis Resources", MARGIN_LEFT, state.y);
  state.y += 8;
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const resources = [
    "988 Suicide and Crisis Lifeline: Call or text 988",
    "Crisis Text Line: Text HOME to 741741",
    "National Domestic Violence Hotline: 1-800-799-7233",
    "SAMHSA National Helpline: 1-800-662-4357",
    "Sex Addicts Anonymous: www.saa-recovery.org",
  ];
  resources.forEach((r) => { doc.text(r, MARGIN_LEFT, state.y); state.y += 6; });

  state.y += 15;
  doc.setDrawColor(180, 180, 180);
  doc.line(MARGIN_LEFT, state.y, PAGE_WIDTH - MARGIN_RIGHT, state.y);
  state.y += 10;

  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(bookInfo.title, MARGIN_LEFT, state.y); state.y += 7;
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`By ${bookInfo.author}`, MARGIN_LEFT, state.y); state.y += 6;
  doc.text("Recovery Works Publishing • 2025", MARGIN_LEFT, state.y);

  addPageNumber(state);

  onProgress("Saving PDF...");
  doc.save("healing-together-matthew-emma.pdf");
}

export function PDFDownloadButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleDownload = async () => {
    setLoading(true);
    setStatus("Starting...");
    try {
      await generateBookPDF((msg) => setStatus(msg));
    } catch (err) {
      console.error("PDF generation failed:", err);
      setStatus("Error generating PDF. Please try again.");
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        size="lg"
        variant="outline"
        className="gap-2"
        disabled={loading}
        onClick={handleDownload}
        data-testid="button-download-pdf"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating PDF...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Download Full Book (PDF)
          </>
        )}
      </Button>
      {loading && status && (
        <p className="text-xs text-muted-foreground max-w-xs text-center">{status}</p>
      )}
    </div>
  );
}
