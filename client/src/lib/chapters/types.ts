import type { Chapter, BookInfo } from "@shared/schema";

export type { Chapter, BookInfo };

export const bookInfo: BookInfo = {
  title: "Healing Together",
  subtitle: "A Practical Guide to Trauma Recovery for Ordinary People",
  author: "Matthew M. Emma",
  description:
    "A comprehensive guide to understanding and healing from trauma, written for everyday people seeking practical, compassionate support on their healing journey.",
};

/**
 * Everything navigation needs about a chapter, and nothing it does not.
 * The prose lives in the chapter module named by `module`, and is loaded on
 * demand — see `load.ts`.
 */
export interface SubchapterMeta {
  id: string;
  slug: string;
  title: string;
  order: number;
}

export interface ChapterMeta {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  readingTime: string;
  /** Basename of the module in this directory that holds the chapter. */
  module: string;
  subchapters: SubchapterMeta[];
}

/**
 * How a content note opens.
 *
 * The heaviest chapters carry a short note above the fold saying what is in
 * them and where the crisis line is. They are authored as ordinary markdown
 * blockquotes, which is what gets them into the web page, the PDF and the
 * EPUB without any of the three needing to know they exist.
 *
 * The PDF is the exception. It wraps blockquotes in quotation marks, which is
 * right for the epigraphs the book opens some chapters with and wrong for a
 * safety notice — a reader should not have to wonder who is being quoted about
 * the domestic violence hotline. So the exporter needs to tell the two apart,
 * and neither heuristic available is safe: 43 blockquotes already open with
 * bold (the prayers in chapter 12), and chapter 10's epigraph sits directly
 * under the H1 exactly where a note does.
 *
 * This constant is the discriminator, and it lives here so the prose and the
 * exporter cannot drift: `validate:content` fails if a note does not open with
 * it. Rewording the lead-in means changing it here, and the build will say so.
 */
export const CONTENT_NOTE_LEAD = "A note before you begin.";
