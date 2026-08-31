/**
 * Subsets Liberation Serif and writes it as a base64 module for the exporter.
 *
 * The PDF has to carry its own fonts. Amazon KDP rejects an interior whose
 * fonts are not embedded, and jsPDF's default Times is one of the PDF base-14 —
 * a *reference* to a font the reader's viewer is expected to supply, not the
 * font itself. Every print service treats that as a substitution risk, and they
 * are right to: the same file can set differently on two machines.
 *
 * Liberation Serif rather than something prettier, for one decisive reason: it
 * is metric-compatible with Times. Every advance width matches, so embedding it
 * changes which glyphs are in the file and changes nothing at all about where
 * the lines break. A book that took this long to typeset does not get reflowed
 * for a font swap. It is SIL OFL 1.1, which explicitly permits embedding.
 *
 * The four faces are 1.5 MB whole; subset to the characters the book actually
 * uses they are a fraction of that, which matters because they ship to the
 * browser. Regenerate with `npm run book-fonts` after adding a chapter that
 * introduces a new character — `npm run validate:content` fails if the coverage
 * has drifted.
 */
import { execFileSync } from "child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { chapters } from "../client/src/lib/chapters/index";
import { bookInfo } from "../client/src/lib/chapters/types";

const SOURCE_DIR = "/usr/share/fonts/truetype/liberation";
const FACES = [
  { file: "LiberationSerif-Regular.ttf", style: "normal" },
  { file: "LiberationSerif-Bold.ttf", style: "bold" },
  { file: "LiberationSerif-Italic.ttf", style: "italic" },
  { file: "LiberationSerif-BoldItalic.ttf", style: "bolditalic" },
] as const;

const OUT = path.resolve(
  import.meta.dirname,
  "..",
  "client",
  "src",
  "lib",
  "book-fonts-data.ts"
);

/**
 * Every character the exporter can put on a page.
 *
 * The chapter prose, plus the strings the exporter generates itself — folios,
 * "CHAPTER 4", the dotted leaders in the contents, the bullet it substitutes
 * for a markdown dash. Printable ASCII goes in wholesale because leaving out
 * one bracket is not worth the bytes saved.
 */
export function bookCharacters(): string {
  const parts: string[] = [
    // Printable ASCII.
    Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join(""),
    // Typography the renderer emits or the prose uses.
    "‘’“”–—…•· ­",
    // Common in the citations and the clinical vocabulary.
    "éèêëáàâäåçíîï",
    "ñóöôúüûßÉÁÖÜÇ",
    "°±×½¼¾®©™£€¢",
    bookInfo.title,
    bookInfo.subtitle,
    bookInfo.author,
    bookInfo.description,
  ];
  for (const chapter of chapters) {
    parts.push(chapter.title, chapter.description, chapter.content);
    for (const sub of chapter.subchapters) parts.push(sub.title, sub.content);
  }
  return [...new Set(parts.join(""))].sort().join("");
}

function subset(file: string, characters: string, workDir: string): Buffer {
  const out = path.join(workDir, file);
  const textFile = path.join(workDir, "chars.txt");
  writeFileSync(textFile, characters, "utf8");
  execFileSync(
    "pyftsubset",
    [
      path.join(SOURCE_DIR, file),
      `--text-file=${textFile}`,
      `--output-file=${out}`,
      // Kept deliberately: the exporter relies on real advance widths matching
      // Times, and drops nothing that affects them.
      "--layout-features=kern,liga",
      "--notdef-outline",
      "--recommended-glyphs",
      "--drop-tables+=DSIG",
    ],
    { stdio: ["ignore", "ignore", "inherit"] }
  );
  return readFileSync(out);
}

async function main() {
  const characters = bookCharacters();
  const workDir = mkdtempSync(path.join(tmpdir(), "book-fonts-"));
  let total = 0;

  const entries = FACES.map(({ file, style }) => {
    const data = subset(file, characters, workDir);
    total += data.length;
    console.log(`  ${style.padEnd(10)} ${(data.length / 1024).toFixed(0)} kB`);
    return { file, style, base64: data.toString("base64") };
  });
  rmSync(workDir, { recursive: true, force: true });

  const body = `// GENERATED FILE — do not edit by hand.
// Run \`npm run book-fonts\` to regenerate from the system Liberation Serif.
//
// Liberation Serif, subset to the ${characters.length} characters this book uses
// and base64-encoded so jsPDF can embed it. Metric-compatible with Times, so it
// sets identically to what the exporter was typeset against.
//
// Kept apart from book-fonts.ts because this file is a few hundred kilobytes of
// base64: nothing may import it statically, or it lands in a chunk that readers
// who never export a PDF still have to download.
//
// SIL Open Font License 1.1. Copyright (c) 2012 Red Hat, Inc. with Reserved
// Font Name Liberation. Digitized data copyright (c) 2010 Google Corporation
// with Reserved Font Name Arimo, Tinos and Cousine.
import type { BookFontFace } from "./book-fonts";

export const bookFontFaces: BookFontFace[] = [
${entries
  .map(
    (e) =>
      `  {\n    file: ${JSON.stringify(e.file)},\n    style: ${JSON.stringify(
        e.style
      )},\n    base64:\n      ${JSON.stringify(e.base64)},\n  },`
  )
  .join("\n")}
];

/** Characters the faces were subset to; \`validate:content\` checks coverage. */
export const bookFontCoverage = ${JSON.stringify(characters)};
`;

  writeFileSync(OUT, body, "utf8");
  console.log(
    `wrote ${OUT} (${characters.length} characters, ${(total / 1024).toFixed(0)} kB of font, ` +
      `${(body.length / 1024).toFixed(0)} kB of module)`
  );
}

main();
