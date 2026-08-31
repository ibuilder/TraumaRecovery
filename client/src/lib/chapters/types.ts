import type { Chapter, BookInfo } from "@shared/schema";

export type { Chapter, BookInfo };

export const bookInfo: BookInfo = {
  title: "Healing Together",
  subtitle: "A Practical Guide to Trauma Recovery for Ordinary People",
  author: "Matthew M. Emma",
  description: "A comprehensive guide to understanding and healing from trauma, written for everyday people seeking practical, compassionate support on their healing journey.",
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
