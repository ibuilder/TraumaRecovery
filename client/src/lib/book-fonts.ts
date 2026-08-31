/**
 * The book's embedded typeface.
 *
 * Amazon KDP and every other print service reject an interior whose fonts are
 * not embedded, and jsPDF's default "times" is one of the PDF base-14 — a
 * reference to a font the reader's viewer is expected to supply, not the font
 * itself. Liberation Serif is metric-compatible with Times, so embedding it
 * changes what is inside the file and nothing about where the lines break.
 *
 * The face data lives in `book-fonts-data.ts`, which is a few hundred kilobytes
 * of base64 and is reachable only through the dynamic import below. Importing
 * it statically would put it in front of every reader, including the ones who
 * never export anything.
 */

/** The family name the exporter passes to `setFont`. */
export const BOOK_FONT = "liberationserif";

export interface BookFontFace {
  /** Filename inside jsPDF's virtual file system. */
  file: string;
  /** jsPDF font style — normal, bold, italic or bolditalic. */
  style: "normal" | "bold" | "italic" | "bolditalic";
  base64: string;
}

/** Fetches the subset faces. Called once, when a PDF is actually being built. */
export async function loadBookFontFaces(): Promise<BookFontFace[]> {
  const { bookFontFaces } = await import("./book-fonts-data");
  return bookFontFaces;
}
