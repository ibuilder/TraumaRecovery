/**
 * Preflights the EPUB against the rules a reading system actually enforces.
 *
 * An EPUB is a zip with a great deal of load-bearing convention in it, and
 * almost all of it fails silently-then-totally: get the mimetype entry wrong and
 * the file is not recognised as an EPUB at all; leave one `<hr>` unclosed and a
 * strict reader rejects the document, because XHTML is XML and XML does not
 * forgive. Nothing here is visible when you open the file in a lenient viewer,
 * which is exactly why it needs checking mechanically.
 *
 *   npm run check:epub [path/to/book.epub]
 */
import { execFileSync } from "child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { XMLParser, XMLValidator } from "fast-xml-parser";

/**
 * The bits of an EPUB package document this preflight reads. Attributes carry
 * the parser's `@` prefix. Everything is optional on purpose -- a missing
 * field is the failure being reported, not a reason to crash.
 */
type OpfNode = Record<string, unknown>;

/** The parser yields a bare object for one child and an array for several. */
function asNodes(value: OpfNode | OpfNode[] | undefined): OpfNode[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/** Read an attribute as a string; a missing one reads as empty, not "undefined". */
function attr(node: OpfNode, name: string): string {
  const v = node[name];
  return v === undefined || v === null ? "" : String(v);
}
type OpfDocument = {
  package?: {
    metadata?: Record<string, unknown>;
    manifest?: { item?: OpfNode | OpfNode[] };
    spine?: { itemref?: OpfNode | OpfNode[] };
  };
};

const DEFAULT = path.resolve(import.meta.dirname, "..", "dist", "healing-together.epub");

interface Finding {
  ok: boolean;
  label: string;
  detail: string;
}
const findings: Finding[] = [];
const pass = (label: string, detail: string) =>
  findings.push({ ok: true, label, detail });
const fail = (label: string, detail: string) =>
  findings.push({ ok: false, label, detail });

/** Entry names in zip order, with the compression method of the first one. */
function zipEntries(file: string): {
  names: string[];
  mimetypeStored: boolean;
  first: string;
} {
  const listing = execFileSync("unzip", ["-lv", file], { encoding: "utf8" });
  const rows = listing
    .split("\n")
    .filter((l) => /^\s*\d+\s+\S+/.test(l))
    .map((l) => l.trim().split(/\s+/));
  const names = rows.map((r) => r[r.length - 1]!);
  // `unzip -lv` columns are: Length, Method, Size, Cmpr, Date, Time, CRC, Name.
  // Find the mimetype row rather than assuming it is the first one, so the two
  // checks stay independent and a misordered file reports both faults truly.
  const mimetypeRow = rows.find((r) => r[r.length - 1] === "mimetype");
  return {
    names,
    mimetypeStored: mimetypeRow?.[1] === "Stored",
    first: names[0] ?? "",
  };
}

function main() {
  const file = process.argv[2] ?? DEFAULT;
  if (!existsSync(file)) {
    console.error(`No EPUB at ${file}. Run \`npm run epub\` first.`);
    process.exit(2);
  }

  const work = mkdtempSync(path.join(tmpdir(), "epub-check-"));
  try {
    execFileSync("unzip", ["-q", file, "-d", work]);
    const { names, mimetypeStored, first } = zipEntries(file);
    const read = (rel: string) => readFileSync(path.join(work, rel), "utf8");
    const has = (rel: string) => existsSync(path.join(work, rel));

    // ---- the container ----
    if (first === "mimetype") pass("mimetype first", "it is the first zip entry");
    else
      fail(
        "mimetype first",
        `first entry is "${first}" — readers will not recognise the file`
      );

    if (mimetypeStored) pass("mimetype stored", "uncompressed, as the spec requires");
    else fail("mimetype stored", "it is deflated; the spec requires it stored");

    const mimetype = has("mimetype") ? read("mimetype") : "";
    if (mimetype === "application/epub+zip") pass("mimetype content", mimetype);
    else fail("mimetype content", `got ${JSON.stringify(mimetype)}`);

    for (const required of [
      "META-INF/container.xml",
      "OEBPS/content.opf",
      "OEBPS/nav.xhtml",
    ]) {
      if (has(required)) pass("Required file", required);
      else fail("Required file", `${required} is missing`);
    }

    // ---- well-formedness, which is where a lenient build silently fails ----
    const xmlFiles = names.filter((n) => /\.(xhtml|opf|xml|ncx)$/.test(n));
    const malformed: string[] = [];
    for (const n of xmlFiles) {
      const result = XMLValidator.validate(read(n), { allowBooleanAttributes: false });
      if (result !== true)
        malformed.push(`${n} (${result.err.msg} at line ${result.err.line})`);
    }
    if (malformed.length === 0) {
      pass("XML well-formed", `all ${xmlFiles.length} documents parse`);
    } else {
      fail("XML well-formed", `${malformed.length} malformed, first: ${malformed[0]}`);
    }

    // ---- the package document ----
    const opf = read("OEBPS/content.opf");
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@" });
    // fast-xml-parser returns whatever the document contained; the shape is
    // exactly what this script is checking, so it cannot be asserted up front.
    const pkg = parser.parse(opf) as Record<string, unknown> as OpfDocument;
    const meta = pkg?.package?.metadata ?? {};

    for (const [label, present] of [
      ["dc:title", !!meta["dc:title"]],
      ["dc:creator", !!meta["dc:creator"]],
      ["dc:language", !!meta["dc:language"]],
      ["dc:identifier", !!meta["dc:identifier"]],
      ["dcterms:modified", opf.includes("dcterms:modified")],
    ] as const) {
      if (present) pass("Metadata", `${label} present`);
      else fail("Metadata", `${label} is required by EPUB 3 and is missing`);
    }

    const items = asNodes(pkg?.package?.manifest?.item);
    const refs = asNodes(pkg?.package?.spine?.itemref);

    if (items.some((i) => attr(i, "@properties").split(/\s+/).includes("nav"))) {
      pass("Navigation", 'a manifest item is declared properties="nav"');
    } else {
      fail("Navigation", 'no manifest item carries properties="nav"');
    }

    const broken = items.filter((i) => !has(path.posix.join("OEBPS", attr(i, "@href"))));
    if (broken.length === 0) pass("Manifest", `all ${items.length} hrefs resolve`);
    else
      fail(
        "Manifest",
        `${broken.length} point at missing files, first ${attr(broken[0], "@href")}`
      );

    const hrefs = new Set(items.map((i) => attr(i, "@href")));
    const payload = names.filter(
      (n) => n.startsWith("OEBPS/") && !n.endsWith("/") && n !== "OEBPS/content.opf"
    );
    const unlisted = payload.filter((n) => !hrefs.has(n.slice("OEBPS/".length)));
    if (unlisted.length === 0) pass("Manifest", "every file in OEBPS is declared");
    else fail("Manifest", `${unlisted.length} undeclared, first ${unlisted[0]}`);

    const ids = new Set(items.map((i) => i["@id"]));
    const dangling = refs.filter((r) => !ids.has(r["@idref"]));
    if (refs.length === 0) fail("Spine", "the spine is empty");
    else if (dangling.length === 0)
      pass("Spine", `${refs.length} items, every idref resolves`);
    else fail("Spine", `${dangling.length} idrefs match no manifest id`);

    // ---- images ----
    let images = 0;
    let missingAlt = 0;
    const brokenSrc: string[] = [];
    for (const n of names.filter((x) => x.endsWith(".xhtml"))) {
      const html = read(n);
      for (const tag of html.match(/<img\b[^>]*>/g) ?? []) {
        images++;
        if (!/\salt="[^"]+"/.test(tag)) missingAlt++;
        const src = /\ssrc="([^"]+)"/.exec(tag)?.[1];
        if (src && !src.startsWith("http")) {
          const resolved = path.posix.normalize(
            path.posix.join(path.posix.dirname(n), src)
          );
          if (!has(resolved)) brokenSrc.push(src);
        }
      }
    }
    if (images === 0) pass("Images", "none");
    else {
      if (missingAlt === 0) pass("Images", `all ${images} carry alt text`);
      else fail("Images", `${missingAlt} of ${images} have no alt text`);
      if (brokenSrc.length === 0) pass("Images", "every src resolves");
      else fail("Images", `${brokenSrc.length} broken, first ${brokenSrc[0]}`);
    }

    const width = Math.max(...findings.map((f) => f.label.length));
    console.log(
      `\nEPUB preflight — ${path.basename(file)} (${(statSync(file).size / 1e6).toFixed(1)} MB)\n`
    );
    for (const f of findings) {
      console.log(
        `[${f.ok ? "  ok  " : " FAIL "}] ${f.label.padEnd(width)}  ${f.detail}`
      );
    }
    const failed = findings.filter((f) => !f.ok);
    console.log(`\n${findings.length - failed.length} passed, ${failed.length} failed\n`);
    process.exit(failed.length ? 1 : 0);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

main();
