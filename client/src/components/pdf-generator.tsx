import { useState } from "react";
import { createRoot } from "react-dom/client";
import type { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { chapters, bookInfo } from "@/lib/chapters";
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
} from "@/components/trauma-charts";

const ISBN = "978-0-000000-00-0";
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
};

/** Every chart placeholder the book actually references, in first-use order. */
function collectReferencedCharts(): string[] {
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
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .trim();
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

function checkPageBreak(state: DocState, neededHeight: number, leftHeader: string, rightHeader: string): DocState {
  if (state.y + neededHeight > PAGE_HEIGHT - MARGIN_BOTTOM - 10) {
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
  color: [number, number, number] = [26, 26, 26]
): DocState {
  if (!text.trim()) return state;
  const { doc } = state;
  doc.setFontSize(fontSize);
  doc.setFont("times", fontStyle);
  doc.setTextColor(...color);

  const lineH = fontSize <= 10 ? 5 : fontSize <= 12 ? LINE_HEIGHT_NORMAL : LINE_HEIGHT_HEADING;
  const availWidth = TEXT_WIDTH - indent;
  const lines = doc.splitTextToSize(text, availWidth);

  for (const line of lines) {
    state = checkPageBreak(state, lineH, leftHeader, rightHeader);
    doc.text(line, MARGIN_LEFT + indent, state.y);
    state.y += lineH;
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
  // Light border around chart
  state.doc.setDrawColor(220, 220, 230);
  state.doc.setLineWidth(0.3);
  state.doc.rect(MARGIN_LEFT + xOffset - 1, state.y - 1, imgW + 2, imgH + 2);
  state.doc.setLineWidth(0.2);
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

const TABLE_ROW_PADDING = 2;
const TABLE_CELL_LINE_HEIGHT = 4.6;

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

  state.y += 3;
  rows.forEach((row, rowIndex) => {
    const isHeaderRow = hasHeader && rowIndex === 0;
    doc.setFont("times", isHeaderRow ? "bold" : "normal");
    doc.setFontSize(FONT_SIZE_SMALL);

    const cells = Array.from({ length: columnCount }, (_, i) => row[i] ?? "");
    const wrapped = cells.map((cell) =>
      doc.splitTextToSize(cell, colWidth - 2 * TABLE_ROW_PADDING) as string[]
    );
    const rowHeight =
      Math.max(1, ...wrapped.map((lines) => lines.length)) * TABLE_CELL_LINE_HEIGHT +
      2 * TABLE_ROW_PADDING;

    state = checkPageBreak(state, rowHeight, leftHeader, rightHeader);

    if (isHeaderRow) {
      doc.setFillColor(240, 245, 255);
      doc.rect(MARGIN_LEFT, state.y, TEXT_WIDTH, rowHeight, "F");
    }
    doc.setDrawColor(210, 216, 228);
    doc.setLineWidth(0.2);
    doc.rect(MARGIN_LEFT, state.y, TEXT_WIDTH, rowHeight);

    doc.setTextColor(26, 26, 26);
    wrapped.forEach((lines, colIndex) => {
      const x = MARGIN_LEFT + colIndex * colWidth;
      if (colIndex > 0) doc.line(x, state.y, x, state.y + rowHeight);
      lines.forEach((line, lineIndex) => {
        doc.text(
          line,
          x + TABLE_ROW_PADDING,
          state.y + TABLE_ROW_PADDING + (lineIndex + 1) * TABLE_CELL_LINE_HEIGHT - 1
        );
      });
    });

    state.y += rowHeight;
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

  const flushPara = () => {
    if (paraBuffer.length === 0) return;
    const combined = paraBuffer.join(" ").trim();
    if (!combined) { paraBuffer = []; return; }
    const cleaned = stripMarkdownForPdf(combined);
    if (cleaned) {
      state.y += 2;
      state = addText(state, cleaned, FONT_SIZE_NORMAL, "normal", leftHeader, rightHeader);
      state.y += 2;
    }
    paraBuffer = [];
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
        state = addChartImage(state, chartImages[chartName], leftHeader, rightHeader);
      } else {
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
      if (rows.length) state = addTable(state, rows, hasHeader, leftHeader, rightHeader);
      continue;
    }

    if (/^######\s/.test(line) || /^#####\s/.test(line) || /^####\s/.test(line)) {
      flushPara();
      const text = stripMarkdownForPdf(line.replace(/^#{4,6}\s+/, ""));
      state.y += 4;
      state = addText(state, text, FONT_SIZE_H4, "bold", leftHeader, rightHeader);
      state.y += 2;
    } else if (/^###\s/.test(line)) {
      flushPara();
      const text = stripMarkdownForPdf(line.replace(/^###\s+/, ""));
      state.y += 6;
      state = addText(state, text, FONT_SIZE_H3, "bold", leftHeader, rightHeader);
      state.y += 3;
    } else if (/^##\s/.test(line)) {
      flushPara();
      const text = stripMarkdownForPdf(line.replace(/^##\s+/, ""));
      state.y += 8;
      state = addText(state, text, FONT_SIZE_H2, "bold", leftHeader, rightHeader);
      state.y += 4;
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
        state.y += 3;
        state = checkPageBreak(state, 8, leftHeader, rightHeader);
        state.doc.setDrawColor(180, 180, 180);
        state.doc.setLineWidth(0.8);
        const startY = state.y - 1;
        // Most quotes in the source already carry their own quotation marks;
        // add a pair only when neither end has one.
        const alreadyQuoted = /^["\u201c\u2018']/.test(text) || /["\u201d\u2019']$/.test(text);
        const quoted = alreadyQuoted ? text : `"${text}"`;
        state = addText(state, quoted, FONT_SIZE_NORMAL, "italic", leftHeader, rightHeader, 8, [80, 80, 80]);
        state.doc.line(MARGIN_LEFT + 2, startY, MARGIN_LEFT + 2, state.y);
        state.doc.setLineWidth(0.2);
        state.y += 3;
      }
    } else if (/^\s*[-*+]\s/.test(line) || /^\s*\d+\.\s/.test(line)) {
      flushPara();
      const ordered = /^\s*(\d+)\.\s/.exec(line);
      const marker = ordered ? `${ordered[1]}.` : "\u2022";
      const text = stripMarkdownForPdf(
        line.replace(/^\s*[-*+]\s+/, "").replace(/^\s*\d+\.\s+/, "")
      );
      const nested = /^\s{2,}/.test(line);
      state = addText(
        state,
        `${marker} ${text}`,
        FONT_SIZE_NORMAL,
        "normal",
        leftHeader,
        rightHeader,
        nested ? 12 : 6
      );
    } else if (/^---+$/.test(trimmed)) {
      flushPara();
      state.y += 4;
      state = checkPageBreak(state, 4, leftHeader, rightHeader);
      state.doc.setDrawColor(180, 180, 180);
      state.doc.line(MARGIN_LEFT, state.y, PAGE_WIDTH - MARGIN_RIGHT, state.y);
      state.y += 6;
    } else if (trimmed === "") {
      flushPara();
    } else {
      const hasBold = /\*\*/.test(line);
      if (hasBold && paraBuffer.length === 0 && /^\*\*[^*]+\*\*/.test(trimmed)) {
        const boldMatch = trimmed.match(/^\*\*([^*]+)\*\*[:\s]*(.*)/);
        if (boldMatch) {
          flushPara();
          state.y += 4;
          state = addText(state, boldMatch[1] + (boldMatch[2] ? ":" : ""), FONT_SIZE_NORMAL, "bold", leftHeader, rightHeader);
          if (boldMatch[2]) {
            state = addText(state, stripMarkdownForPdf(boldMatch[2]), FONT_SIZE_NORMAL, "normal", leftHeader, rightHeader, 4);
          }
          continue;
        }
      }
      paraBuffer.push(line);
    }
  }
  flushPara();
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
  doc.setFont("times", "normal");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`ISBN ${ISBN}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 2.5, { align: "center" });
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
  addLine("Printed in the United States of America");

  y += 10;
  doc.setDrawColor(180, 180, 180);
  doc.line(MARGIN_LEFT, y, PAGE_WIDTH - MARGIN_RIGHT, y);
  y += 8;
  doc.setFont("times", "bold");
  doc.text(`ISBN ${ISBN}`, MARGIN_LEFT, y);
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
          // Give Recharts time to lay out and finish its entry animation.
          setTimeout(resolve, 600);
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
    container.remove();
  }

  return chartImages;
}

async function generateBookPDF(onProgress: (msg: string) => void): Promise<void> {
  // jsPDF + html2canvas are ~600 kB; only pull them in when someone asks for the book.
  onProgress("Loading PDF tools...");
  const [{ jsPDF: JsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  const referencedCharts = collectReferencedCharts();
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
      doc.text(`${chapter.order}.${sub.order}`, MARGIN_LEFT, state.y + 4);
      state.y += 7;

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
  doc.text(`ISBN ${ISBN}`, MARGIN_LEFT, state.y); state.y += 6;
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
