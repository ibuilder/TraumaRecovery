import { Suspense, lazy, type ComponentType, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  showCharts?: boolean;
}

/**
 * Chart placeholders are authored as a single-line ```chart:Name``` span, which
 * CommonMark parses as an inline code span. Fenced `\`\`\`chart:Name` blocks are also
 * supported; those arrive wrapped in a <pre>, so `pre` is unwrapped below to keep
 * the chart out of the prose code-block styling.
 */
/**
 * Figures are fetched only by the pages that show one.
 *
 * The registry is a `import * as charts` over `trauma-charts`, so importing it
 * pulls all ninety-one figures and Recharts with them -- 155 kB gzipped, which
 * is 42 per cent of a chapter page's JavaScript. This module is what every
 * chapter page loads to render its prose, so until now it dragged that in
 * whether the page had a figure on it or not: a route with four figures and a
 * route with none downloaded byte-identical JavaScript. Thirty-three of the
 * eighty-nine routes have no figure at all.
 *
 * `lazy` per figure name defers it to the pages that ask. They resolve to the
 * same chunk, so a page with nine figures still fetches it once.
 *
 * Memoised because `lazy()` returns a new component type on every call, and a
 * new type at the same position is a remount -- the figure would be torn down
 * and rebuilt, replaying its entry animation, on every render of the prose
 * around it.
 */
const lazyCharts = new Map<string, ComponentType>();

function chartComponent(name: string): ComponentType {
  const cached = lazyCharts.get(name);
  if (cached) return cached;
  const Chart = lazy(async (): Promise<{ default: ComponentType }> => {
    const { ALL_CHART_COMPONENTS } = await import("@/components/chart-registry");
    const Found = ALL_CHART_COMPONENTS[name];
    if (!Found) {
      if (import.meta.env.DEV) {
        console.warn(`Unknown chart referenced in content: "${name}"`);
      }
      return { default: () => null };
    }
    return { default: Found };
  });
  lazyCharts.set(name, Chart);
  return Chart;
}

/**
 * Holds the figure's place while its chunk arrives, so the prose below does not
 * jump when it lands. 300px is the height fifty of the sixty-eight plotted
 * figures use; the rest are within 50px of it bar one.
 */
function ChartPlaceholder() {
  return (
    <div className="my-8 rounded-md border bg-card p-6" aria-hidden="true">
      <div className="mb-4 h-5 w-2/5 animate-pulse rounded bg-muted" />
      <div className="h-[300px] w-full animate-pulse rounded bg-muted" />
    </div>
  );
}

const CHART_INLINE_RE = /^chart:(\w+)$/;
const CHART_FENCE_RE = /language-chart:(\w+)/;

/**
 * react-markdown hands children through as `ReactNode`, which is a union wide
 * enough that nothing can be read off it directly. This narrows to the one
 * shape the callers below care about -- an element with props -- so they can
 * stop casting to `any` to reach `.props`.
 */
type NodeWithProps = {
  type?: unknown;
  props?: { className?: unknown; children?: ReactNode };
};

function hasProps(node: unknown): node is NodeWithProps {
  return !!node && typeof node === "object" && "props" in node;
}

function isChartElement(node: unknown): boolean {
  return hasProps(node) && CHART_FENCE_RE.test(String(node.props?.className ?? ""));
}

/**
 * Anchor slug for a heading. Kept in step with `slugifyHeading` in
 * script/generate-search-index.ts — search results deep-link to these ids, so
 * the two have to agree character for character.
 */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** The visible text of a heading, so it can be turned into an anchor. */
function headingText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(headingText).join("");
  if (hasProps(node)) return headingText(node.props?.children);
  return "";
}

export function MarkdownRenderer({ content, showCharts = true }: MarkdownRendererProps) {
  // Two sections in a chapter can both be called "What it is". The counter is
  // recreated on every render and react-markdown walks the document in order,
  // so repeats get -2, -3 and stay stable between renders.
  const seen = new Map<string, number>();
  const anchor = (children: ReactNode) => {
    const base = slugifyHeading(headingText(children));
    if (!base) return undefined;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: ({ className, children }) => {
            const fencedMatch = CHART_FENCE_RE.exec(className || "");
            const inlineMatch = CHART_INLINE_RE.exec(String(children).trim());
            const chartName = fencedMatch?.[1] ?? inlineMatch?.[1];

            if (chartName && showCharts) {
              const ChartComponent = chartComponent(chartName);
              // Tagged with the component name so tooling can map a rendered
              // figure back to the placeholder that asked for it. Guessing
              // the mapping from the figure's visible title silently lost
              // sixty of the hundred placements in the EPUB build.
              return (
                <div data-chart={chartName} className="contents">
                  <Suspense fallback={<ChartPlaceholder />}>
                    <ChartComponent />
                  </Suspense>
                </div>
              );
            }

            return <code className={className}>{children}</code>;
          },
          th: ({ children, ...props }) => {
            // A comparison table's corner cell heads nothing, and an empty
            // `<th>` claims to. HTML's answer is a `<td>`; markdown has no way
            // to say it, so it is said here. Five tables in the book have one.
            const empty =
              children == null || (Array.isArray(children) && children.length === 0);
            return empty ? <td /> : <th {...props}>{children}</th>;
          },
          pre: ({ children }) => {
            // A fenced chart block renders a full-width figure, not a code block.
            const kids = Array.isArray(children) ? children : [children];
            if (showCharts && kids.some(isChartElement)) {
              return <>{children}</>;
            }
            // `text-foreground` is load-bearing: the typography plugin styles
            // `pre` for a dark block and sets the code colour to gray-200,
            // which against `bg-muted` measured a contrast ratio of 1.01 — the
            // book's one ASCII diagram was invisible in light mode, not merely
            // hard to read.
            return (
              <pre className="mb-6 overflow-x-auto rounded-md bg-muted p-4 text-sm text-foreground">
                {children}
              </pre>
            );
          },
          h1: ({ children }) => (
            <h1
              className="text-3xl md:text-4xl font-bold mt-0 mb-6 text-foreground"
              data-testid="text-chapter-title"
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              id={anchor(children)}
              className="text-2xl md:text-3xl font-semibold mt-12 mb-4 text-foreground border-b pb-2 scroll-mt-20"
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              id={anchor(children)}
              className="text-xl md:text-2xl font-semibold mt-8 mb-3 text-foreground scroll-mt-20"
            >
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg md:text-xl font-medium mt-6 mb-2 text-foreground">
              {children}
            </h4>
          ),
          p: ({ children }) => {
            const childArr = Array.isArray(children) ? children : [children];
            // A block-level child inside a paragraph: react-markdown will
            // have produced <p><div>…</div></p>, which is invalid HTML and
            // which browsers silently reshuffle. Render a <div> instead.
            const hasBlock = childArr.some(
              (child) =>
                !!child &&
                typeof child === "object" &&
                "type" in child &&
                typeof (child as NodeWithProps).type !== "string"
            );
            if (hasBlock) {
              return <div className="mb-6">{children}</div>;
            }
            return <p className="mb-6 leading-relaxed text-foreground/90">{children}</p>;
          },
          ul: ({ children }) => (
            <ul className="mb-6 ml-6 space-y-2 list-disc marker:text-primary/60">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-6 ml-6 space-y-2 list-decimal marker:text-primary/60">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed text-foreground/90">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/40 pl-6 my-8 italic text-muted-foreground bg-muted/30 py-4 pr-4 rounded-r-md">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,
          hr: () => <hr className="my-8 border-border" />,
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
