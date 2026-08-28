import { useEffect, useState } from "react";
import { Link } from "wouter";
import { BookMarked, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  forgetPosition,
  lastPosition,
  type ReadingPosition,
} from "@/lib/reading-position";

/**
 * Offers to pick the book back up where the reader left it.
 *
 * Read in an effect rather than during render: the value comes from
 * localStorage, which is unavailable to a static prerender and can differ
 * between the server-shaped first paint and the browser.
 */
export function ContinueReading() {
  const [position, setPosition] = useState<ReadingPosition | null>(null);

  useEffect(() => {
    setPosition(lastPosition());
  }, []);

  if (!position) return null;

  return (
    <div
      className="flex items-center gap-3 rounded-md border bg-card px-4 py-3 text-left"
      data-testid="continue-reading"
    >
      <BookMarked className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">Continue reading</p>
        <Link
          href={position.url}
          className="block truncate font-medium hover:underline"
          data-testid="link-continue-reading"
        >
          {position.title}
        </Link>
        <p className="truncate text-xs text-muted-foreground">{position.context}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={() => {
          forgetPosition();
          setPosition(null);
        }}
        data-testid="button-forget-position"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Forget where I was</span>
      </Button>
    </div>
  );
}
