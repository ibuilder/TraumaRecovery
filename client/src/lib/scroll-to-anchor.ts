/**
 * Scrolls to a heading that may not exist yet.
 *
 * Chapter prose is fetched as its own chunk, so a link into `#wise-mind`
 * arrives before the heading is in the document. Polling on animation frames
 * costs nothing while we wait and gives up rather than spinning forever.
 *
 * Returns a cancel function.
 */
export function scrollToAnchor(id: string, timeoutMs = 5000): () => void {
  let frame = 0;
  const deadline = Date.now() + timeoutMs;

  const attempt = () => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (Date.now() < deadline) frame = requestAnimationFrame(attempt);
  };

  frame = requestAnimationFrame(attempt);
  return () => cancelAnimationFrame(frame);
}

/** The current URL fragment, decoded, or "" when there is none. */
export function currentAnchor(): string {
  try {
    return decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return window.location.hash.slice(1);
  }
}
