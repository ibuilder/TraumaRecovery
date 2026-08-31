const KEY = "healing-together:last-read";

export interface ReadingPosition {
  url: string;
  title: string;
  context: string;
  at: number;
}

/**
 * Where the reader got to last time.
 *
 * Deliberately a "continue reading" link rather than a restored scroll offset:
 * being silently dropped part-way down a page you do not remember opening is
 * disorienting, and this is a book people put down mid-chapter and come back to
 * days later. Storage is per-browser and never leaves the device; every access
 * is guarded because private windows can throw on read as well as write.
 */
export function rememberPosition(position: Omit<ReadingPosition, "at">) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...position, at: Date.now() }));
  } catch {
    // Storage disabled or full. Losing the bookmark is not worth an error.
  }
}

export function lastPosition(): ReadingPosition | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ReadingPosition;
    if (typeof parsed?.url !== "string" || typeof parsed?.title !== "string") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function forgetPosition() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // As above.
  }
}
