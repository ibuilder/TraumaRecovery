import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { loadSearchIndex, type SearchEntry } from "@/lib/search-index-loader";
import { scrollToAnchor } from "@/lib/scroll-to-anchor";


const MAX_RESULTS = 24;

function normalise(s: string) {
  return s.toLowerCase();
}

/**
 * Scores an entry against the terms.
 *
 * Every term has to appear somewhere, otherwise searching "wise mind" would
 * return everything that merely says "mind". Where a term appears decides the
 * rank: a heading match beats a body match, and a match at a word boundary
 * beats one buried inside a longer word.
 */
function score(entry: SearchEntry, terms: string[]): number {
  const title = normalise(entry.title);
  const context = normalise(entry.context);
  const text = normalise(entry.text);
  let total = 0;

  for (const term of terms) {
    let best = 0;
    const boundary = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
    if (title.includes(term)) best = boundary.test(title) ? 100 : 60;
    else if (context.includes(term)) best = boundary.test(context) ? 40 : 25;
    else if (text.includes(term)) best = boundary.test(text) ? 20 : 8;
    if (best === 0) return 0;
    total += best;
  }

  // An exact run of the whole phrase is what the reader usually meant.
  const phrase = terms.join(" ");
  if (terms.length > 1) {
    if (title.includes(phrase)) total += 120;
    else if (text.includes(phrase)) total += 40;
  }
  // Openers are more useful landing places than a sub-section of the same name.
  if (!entry.url.includes("#")) total += 6;
  return total;
}

/** The window of the excerpt around the first hit, rather than its opening. */
function excerptAround(text: string, term: string): string {
  if (!text) return "";
  const at = normalise(text).indexOf(term);
  if (at < 0) return text.slice(0, 120);
  const from = Math.max(0, at - 40);
  return (from > 0 ? "…" : "") + text.slice(from, from + 140);
}

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<SearchEntry[] | null>(null);
  const loading = useRef(false);

  useEffect(() => {
    if (!open || entries || loading.current) return;
    loading.current = true;
    let cancelled = false;
    loadSearchIndex().then((data) => {
      if (!cancelled) setEntries(data);
      loading.current = false;
    });
    return () => {
      cancelled = true;
    };
  }, [open, entries]);

  const terms = useMemo(
    () => normalise(query).split(/\s+/).filter((t) => t.length > 1),
    [query]
  );

  const results = useMemo(() => {
    if (!entries || terms.length === 0) return [];
    return entries
      .map((entry) => ({ entry, s: score(entry, terms) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, MAX_RESULTS)
      .map((r) => r.entry);
  }, [entries, terms]);

  const go = (url: string) => {
    onOpenChange(false);
    setQuery("");
    // Navigate with the fragment intact so the result is a shareable link and
    // survives a reload. The chapter page scrolls to the anchor when the route
    // changes; do it here too, for a result inside the page already open.
    const hash = url.includes("#") ? url.slice(url.indexOf("#") + 1) : "";
    navigate(url);
    if (hash) scrollToAnchor(hash);
    else window.scrollTo({ top: 0 });
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search the book"
      // Results arrive already ranked; cmdk's own fuzzy filter would score
      // them against the url we use as the item value and drop every one.
      shouldFilter={false}
    >
      <CommandInput
        placeholder="Search the book…"
        value={query}
        onValueChange={setQuery}
        data-testid="input-search"
      />
      <CommandList>
        {terms.length === 0 ? (
          <div className="px-4 py-6 text-sm text-muted-foreground">
            Search every chapter — a skill, a term, a phrase you half remember.
          </div>
        ) : !entries ? (
          <div className="px-4 py-6 text-sm text-muted-foreground">Loading…</div>
        ) : results.length === 0 ? (
          <CommandEmpty>Nothing matched “{query}”.</CommandEmpty>
        ) : (
          <CommandGroup heading={`${results.length} result${results.length === 1 ? "" : "s"}`}>
            {results.map((entry) => (
              <CommandItem
                key={entry.url}
                value={entry.url}
                onSelect={() => go(entry.url)}
                className="flex-col items-start gap-0.5 py-2"
                data-testid={`result-${entry.url}`}
              >
                <span className="font-medium">{entry.title}</span>
                <span className="text-xs text-muted-foreground">{entry.context}</span>
                {entry.text ? (
                  <span className="text-xs text-muted-foreground/80 line-clamp-2">
                    {excerptAround(entry.text, terms[0])}
                  </span>
                ) : null}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
