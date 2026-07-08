import { useState } from "react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { chapters, bookInfo } from "@/lib/chapters";
import type { Chapter } from "@/lib/chapters";

const ISBN = "978-0-000000-00-0";
const PAGE_WIDTH = 215.9; // Letter width mm
const PAGE_HEIGHT = 279.4; // Letter height mm
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
  tocEntries: Array<{ title: string; level: number; page: number }>;
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

function renderMarkdownContent(
  state: DocState,
  content: string,
  leftHeader: string,
  rightHeader: string
): DocState {
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

    // Skip chart blocks
    if (/^```chart:\w+```/.test(trimmed)) {
      flushPara();
      state.y += 2;
      state = addText(state, "[Interactive chart — see web version at healingtogether.app]",
        FONT_SIZE_SMALL, "italic", leftHeader, rightHeader, 4, [120, 120, 120]);
      state.y += 2;
      continue;
    }
    if (trimmed.startsWith("```")) {
      flushPara();
      while (i < lines.length - 1 && !lines[++i].trim().startsWith("```")) {}
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
      // Top-level heading already shown in chapter header, skip
    } else if (/^>\s/.test(line)) {
      flushPara();
      const text = stripMarkdownForPdf(line.replace(/^>\s+/, ""));
      state.y += 3;
      // Draw left border for blockquote
      state = checkPageBreak(state, 8, leftHeader, rightHeader);
      state.doc.setDrawColor(180, 180, 180);
      state.doc.setLineWidth(0.8);
      const startY = state.y - 1;
      state = addText(state, `"${text}"`, FONT_SIZE_NORMAL, "italic", leftHeader, rightHeader, 8, [80, 80, 80]);
      state.doc.line(MARGIN_LEFT + 2, startY, MARGIN_LEFT + 2, state.y);
      state.doc.setLineWidth(0.2);
      state.y += 3;
    } else if (/^[-*+]\s/.test(line) || /^\d+\.\s/.test(line)) {
      flushPara();
      const text = stripMarkdownForPdf(line.replace(/^[-*+]\s+/, "").replace(/^\d+\.\s+/, ""));
      state = addText(state, `• ${text}`, FONT_SIZE_NORMAL, "normal", leftHeader, rightHeader, 6);
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
      // Check if line contains bold text (**...**)
      const hasBold = /\*\*/.test(line);
      if (hasBold && paraBuffer.length === 0 && /^\*\*[^*]+\*\*/.test(trimmed)) {
        // Bold prefix line — treat as sub-heading
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
  // Background
  doc.setFillColor(245, 247, 250);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");

  // Top decorative bar
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, PAGE_WIDTH, 8, "F");

  // Title
  doc.setFont("times", "bold");
  doc.setFontSize(32);
  doc.setTextColor(15, 23, 42);
  doc.text(bookInfo.title, PAGE_WIDTH / 2, 80, { align: "center" });

  // Divider
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(1);
  doc.line(60, 92, PAGE_WIDTH - 60, 92);
  doc.setLineWidth(0.2);

  // Subtitle
  doc.setFont("times", "italic");
  doc.setFontSize(14);
  doc.setTextColor(71, 85, 105);
  const subtitleLines = doc.splitTextToSize(bookInfo.subtitle, 140);
  subtitleLines.forEach((line: string, i: number) => {
    doc.text(line, PAGE_WIDTH / 2, 104 + i * 8, { align: "center" });
  });

  // Description
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  const descLines = doc.splitTextToSize(bookInfo.description, 130);
  descLines.slice(0, 4).forEach((line: string, i: number) => {
    doc.text(line, PAGE_WIDTH / 2, 130 + i * 6.5, { align: "center" });
  });

  // Author
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(bookInfo.author, PAGE_WIDTH / 2, 185, { align: "center" });

  // Publisher info
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("Recovery Works Publishing", PAGE_WIDTH / 2, 230, { align: "center" });
  doc.text("2025", PAGE_WIDTH / 2, 237, { align: "center" });

  // Bottom bar
  doc.setFillColor(59, 130, 246);
  doc.rect(0, PAGE_HEIGHT - 8, PAGE_WIDTH, 8, "F");

  // ISBN on bottom
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
  addLine(
    "If you are in crisis, please contact the 988 Suicide and Crisis Lifeline by calling or texting 988."
  );

  y += 10;
  doc.setFont("times", "normal");
  doc.setFontSize(10);
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

async function generateBookPDF(): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "letter", orientation: "portrait" });

  // Page 1: Cover
  buildCoverPage(doc);

  // Page 2: Copyright
  doc.addPage("letter");
  buildCopyrightPage(doc);

  // Page 3+: Table of Contents
  doc.addPage("letter");
  buildTOCPage(doc, chapters);

  // Chapter pages
  let state: DocState = {
    doc,
    y: MARGIN_TOP + 10,
    pageNum: 4, // cover + copyright + TOC pages before chapters
    tocEntries: [],
  };

  for (const chapter of chapters) {
    // New page for each chapter
    addPageNumber(state);
    doc.addPage("letter");
    state.pageNum++;
    state.y = MARGIN_TOP + 10;

    const leftH = bookInfo.title;
    const rightH = `Chapter ${chapter.order}`;
    addRunningHeader(state, leftH, rightH);

    // Chapter header
    doc.setFillColor(240, 245, 255);
    doc.rect(MARGIN_LEFT - 2, state.y - 3, TEXT_WIDTH + 4, 35, "F");

    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.setTextColor(59, 130, 246);
    doc.text(`CHAPTER ${chapter.order}`, MARGIN_LEFT, state.y + 5);
    state.y += 9;

    doc.setFont("times", "bold");
    doc.setFontSize(FONT_SIZE_H1);
    doc.setTextColor(15, 23, 42);
    const titleLines = doc.splitTextToSize(chapter.title, TEXT_WIDTH);
    titleLines.forEach((l: string) => {
      doc.text(l, MARGIN_LEFT, state.y);
      state.y += 10;
    });

    doc.setFont("times", "italic");
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    const descLines = doc.splitTextToSize(chapter.description, TEXT_WIDTH);
    descLines.forEach((l: string) => {
      doc.text(l, MARGIN_LEFT, state.y);
      state.y += 6.5;
    });
    state.y += 8;

    doc.setTextColor(26, 26, 26);
    doc.setDrawColor(200, 210, 230);
    doc.line(MARGIN_LEFT, state.y, PAGE_WIDTH - MARGIN_RIGHT, state.y);
    state.y += 8;

    // Chapter overview content
    state = renderMarkdownContent(state, chapter.content, leftH, chapter.title);

    // Subchapters
    for (const sub of chapter.subchapters) {
      addPageNumber(state);
      doc.addPage("letter");
      state.pageNum++;
      state.y = MARGIN_TOP + 10;

      const subLeftH = chapter.title;
      const subRightH = sub.title;
      addRunningHeader(state, subLeftH, subRightH);

      // Subchapter header
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
      state = renderMarkdownContent(state, sub.content, subLeftH, subRightH);
    }
  }

  // Back matter page
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

  doc.save("healing-together-matthew-emma.pdf");
}

export function PDFDownloadButton() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      await generateBookPDF();
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
}
