import { Suspense, lazy, useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// MarkdownRenderer holds the chart registry, so it travels with the prose
// rather than with the shell.
const MarkdownRenderer = lazy(() =>
  import("@/components/markdown-renderer").then((m) => ({ default: m.MarkdownRenderer }))
);
import { ChapterSidebar } from "@/components/chapter-sidebar";
import { ReadingProgress } from "@/components/reading-progress";
import { BackToTop } from "@/components/back-to-top";
import { chapters, loadChapter } from "@/lib/chapters";
import { currentAnchor, scrollToAnchor } from "@/lib/scroll-to-anchor";
import { rememberPosition } from "@/lib/reading-position";
import type { Chapter as ChapterContent } from "@/lib/chapters";
import { Skeleton } from "@/components/ui/skeleton";

function ChapterSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading chapter…</span>
      <Skeleton className="h-9 w-2/3" />
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
      <Skeleton className="h-4 w-4/5" />
    </div>
  );
}

export default function Chapter() {
  const params = useParams<{ slug: string; subSlug?: string }>();
  const { slug, subSlug } = params;

  // Navigation renders from the manifest immediately; the prose for this one
  // chapter is fetched as its own chunk.
  const [loaded, setLoaded] = useState<ChapterContent | null>(null);

  useEffect(() => {
    // A search result or a shared link can point at a heading inside the page,
    // in which case jumping to the top would undo it.
    const anchor = currentAnchor();
    if (!anchor) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    return scrollToAnchor(anchor);
  }, [slug, subSlug]);

  useEffect(() => {
    let cancelled = false;
    setLoaded(null);
    loadChapter(slug).then((c) => {
      if (!cancelled) setLoaded(c);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const chapter = chapters.find((c) => c.slug === slug);

  // Note the page as read, so the home page can offer to pick the book back
  // up. Above the not-found branch below: hooks cannot sit after a return.
  useEffect(() => {
    if (!chapter) return;
    const sub = subSlug
      ? chapter.subchapters.find((s) => s.slug === subSlug)
      : undefined;
    rememberPosition({
      url: sub
        ? `/chapter/${chapter.slug}/subchapter/${sub.slug}`
        : `/chapter/${chapter.slug}`,
      title: sub ? sub.title : chapter.title,
      context: sub
        ? `Chapter ${chapter.order} · ${chapter.title}`
        : `Chapter ${chapter.order}`,
    });
  }, [chapter, subSlug]);

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Chapter Not Found</h1>
          <p className="text-muted-foreground">The chapter you're looking for doesn't exist.</p>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const subchapter = subSlug
    ? chapter.subchapters.find((s) => s.slug === subSlug)
    : null;

  // The markdown body of every chapter and subchapter opens with its own H1,
  // so the page heading comes from MarkdownRenderer rather than being repeated here.
  const loadedSub = subSlug
    ? loaded?.subchapters.find((s) => s.slug === subSlug)
    : null;
  const content = subSlug ? loadedSub?.content : loaded?.content;

  const currentIndex = chapters.findIndex((c) => c.slug === slug);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  const currentSubIndex = subchapter 
    ? chapter.subchapters.findIndex((s) => s.slug === subSlug)
    : -1;
  const prevSub = currentSubIndex > 0 ? chapter.subchapters[currentSubIndex - 1] : null;
  const nextSub = currentSubIndex >= 0 && currentSubIndex < chapter.subchapters.length - 1 
    ? chapter.subchapters[currentSubIndex + 1] 
    : null;

  return (
    <>
      <ReadingProgress />
      <div className="min-h-screen">
        <div className="container px-4 md:px-6 py-8">
          <nav className="mb-8 mx-auto max-w-6xl">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors" data-testid="breadcrumb-home">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/chapters" className="hover:text-foreground transition-colors" data-testid="breadcrumb-chapters">
                  Chapters
                </Link>
              </li>
              <li>/</li>
              <li>
                {subchapter ? (
                  <Link 
                    href={`/chapter/${chapter.slug}`}
                    className="hover:text-foreground transition-colors"
                    data-testid="breadcrumb-chapter"
                  >
                    {chapter.title}
                  </Link>
                ) : (
                  <span className="text-foreground" data-testid="breadcrumb-current">{chapter.title}</span>
                )}
              </li>
              {subchapter && (
                <>
                  <li>/</li>
                  <li className="text-foreground" data-testid="breadcrumb-subchapter">{subchapter.title}</li>
                </>
              )}
            </ol>
          </nav>

          <div className="flex gap-12 mx-auto max-w-6xl">
            <ChapterSidebar currentChapter={chapter} />

            {/*
              A div, not a second <main>: the app shell already provides the
              one main landmark, and two of them is ambiguous to a screen
              reader — "skip to main content" no longer has a single target.
            */}
            <div className="flex-1 min-w-0">
              <article className="max-w-3xl">
                <header className="mb-8 pb-8 border-b">
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <Badge variant="secondary">Chapter {chapter.order}</Badge>
                    {subchapter && (
                      <Badge variant="outline">{subchapter.title}</Badge>
                    )}
                  </div>
                  {!subchapter && (
                    <p className="text-lg text-muted-foreground">{chapter.description}</p>
                  )}
                </header>

                {content ? (
                  <Suspense fallback={<ChapterSkeleton />}>
                    <MarkdownRenderer content={content} />
                  </Suspense>
                ) : (
                  <ChapterSkeleton />
                )}

                {!subchapter && chapter.subchapters.length > 0 && (
                  <div className="mt-12 pt-8 border-t">
                    <h2 className="text-xl font-semibold mb-4">Continue Reading</h2>
                    <div className="grid gap-3">
                      {chapter.subchapters.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/chapter/${chapter.slug}/subchapter/${sub.slug}`}
                          className="group block p-4 rounded-md border hover-elevate transition-all"
                          data-testid={`link-subchapter-${sub.slug}`}
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-medium group-hover:text-primary transition-colors">
                              {sub.title}
                            </span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <nav className="mt-12 pt-8 border-t">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    {subchapter ? (
                      <>
                        {prevSub ? (
                          <Link href={`/chapter/${chapter.slug}/subchapter/${prevSub.slug}`}>
                            <Button variant="outline" className="gap-2" data-testid="button-prev-sub">
                              <ChevronLeft className="h-4 w-4" />
                              <span className="hidden sm:inline">{prevSub.title}</span>
                              <span className="sm:hidden">Previous</span>
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/chapter/${chapter.slug}`}>
                            <Button variant="outline" className="gap-2" data-testid="button-back-overview">
                              <ChevronLeft className="h-4 w-4" />
                              <span className="hidden sm:inline">Overview</span>
                              <span className="sm:hidden">Back</span>
                            </Button>
                          </Link>
                        )}
                        {nextSub ? (
                          <Link href={`/chapter/${chapter.slug}/subchapter/${nextSub.slug}`}>
                            <Button variant="outline" className="gap-2" data-testid="button-next-sub">
                              <span className="hidden sm:inline">{nextSub.title}</span>
                              <span className="sm:hidden">Next</span>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        ) : nextChapter ? (
                          <Link href={`/chapter/${nextChapter.slug}`}>
                            <Button className="gap-2" data-testid="button-next-chapter-from-sub">
                              <span className="hidden sm:inline">Next Chapter: {nextChapter.title}</span>
                              <span className="sm:hidden">Next Chapter</span>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        ) : (
                          <div />
                        )}
                      </>
                    ) : (
                      <>
                        {prevChapter ? (
                          <Link href={`/chapter/${prevChapter.slug}`}>
                            <Button variant="outline" className="gap-2" data-testid="button-prev-chapter">
                              <ChevronLeft className="h-4 w-4" />
                              <span className="hidden sm:inline">{prevChapter.title}</span>
                              <span className="sm:hidden">Previous</span>
                            </Button>
                          </Link>
                        ) : (
                          <div />
                        )}
                        {chapter.subchapters.length > 0 ? (
                          <Link href={`/chapter/${chapter.slug}/subchapter/${chapter.subchapters[0].slug}`}>
                            <Button className="gap-2" data-testid="button-continue-first-sub">
                              <span className="hidden sm:inline">Continue: {chapter.subchapters[0].title}</span>
                              <span className="sm:hidden">Continue</span>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        ) : nextChapter ? (
                          <Link href={`/chapter/${nextChapter.slug}`}>
                            <Button className="gap-2" data-testid="button-next-chapter">
                              <span className="hidden sm:inline">Next: {nextChapter.title}</span>
                              <span className="sm:hidden">Next</span>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        ) : (
                          <div />
                        )}
                      </>
                    )}
                  </div>
                </nav>
              </article>
            </div>
          </div>
        </div>
      </div>
      <BackToTop />
    </>
  );
}
