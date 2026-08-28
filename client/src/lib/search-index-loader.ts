export interface SearchEntry {
  /** Section heading, or the page title for an opener. */
  title: string;
  /** Where the section sits — "Chapter 9 · Distress Tolerance". */
  context: string;
  /** Route, with a #heading fragment for anything below the opener. */
  url: string;
  /** Plain-text excerpt, used both for matching and for the result line. */
  text: string;
}

/**
 * The index is ~380 kB of prose excerpts, so it is fetched the first time it is
 * wanted and cached for the session. This module is deliberately tiny and free
 * of component imports: the header pulls it in eagerly to warm the fetch on
 * hover, and must not drag the search dialog into the entry bundle with it.
 */
let indexPromise: Promise<SearchEntry[]> | null = null;

export function loadSearchIndex(): Promise<SearchEntry[]> {
  indexPromise ??= import("./search-index.json").then(
    (m) => (m.default ?? m) as unknown as SearchEntry[]
  );
  return indexPromise;
}

/** Warms the fetch on hover, so the click usually opens onto results. */
export function prefetchSearchIndex() {
  void loadSearchIndex();
}
