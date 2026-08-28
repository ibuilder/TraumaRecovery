/**
 * The kintsugi mark: a vessel that broke and was rejoined with gold rather than
 * having the seam hidden. The motif comes from the author's own treatment notes
 * — "kintsugi: the art of precious scars" — and it is the argument of the book
 * in one image: the repair is visible, and the object is worth more for it.
 *
 * Kept in sync with client/public/favicon.svg.
 */
export function Logo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Healing Together"
    >
      <defs>
        <linearGradient id="logo-vessel" x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor="#4a86c4" />
          <stop offset="1" stopColor="#2a5c8f" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#logo-vessel)" />
      <path
        d="M26.5 2.9 L30.2 19 L24.6 30.5 L34.4 39.4 L30.6 49.6 L35.4 61.4"
        fill="none"
        stroke="#f0bd57"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M30.2 19 L38.4 16.2" fill="none" stroke="#f0bd57" strokeWidth="1.7" strokeLinecap="round" opacity="0.9" />
      <path d="M34.4 39.4 L42.6 37.4" fill="none" stroke="#f0bd57" strokeWidth="1.7" strokeLinecap="round" opacity="0.9" />
      <circle cx="32" cy="32" r="30" fill="none" stroke="#ffffff" strokeWidth="1.4" opacity="0.16" />
    </svg>
  );
}
