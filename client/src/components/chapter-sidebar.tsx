import { Link, useLocation } from "wouter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { chapters } from "@/lib/chapters";
import type { Chapter, Subchapter } from "@shared/schema";

interface ChapterSidebarProps {
  currentChapter: Chapter;
}

export function ChapterSidebar({ currentChapter }: ChapterSidebarProps) {
  const [location] = useLocation();

  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-20">
        <ScrollArea className="h-[calc(100vh-6rem)]">
          <div className="pr-4 pb-8">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
              In This Chapter
            </h3>
            <nav className="space-y-1">
              <Link
                href={`/chapter/${currentChapter.slug}`}
                className={`block px-3 py-2 rounded-md text-sm transition-colors hover-elevate ${
                  location === `/chapter/${currentChapter.slug}` && !location.includes("/subchapter/")
                    ? "bg-accent font-medium"
                    : "text-muted-foreground"
                }`}
                data-testid={`link-sidebar-main-${currentChapter.slug}`}
              >
                Overview
              </Link>
              {currentChapter.subchapters.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/chapter/${currentChapter.slug}/subchapter/${sub.slug}`}
                  className={`block px-3 py-2 rounded-md text-sm transition-colors hover-elevate ${
                    location.includes(`/subchapter/${sub.slug}`)
                      ? "bg-accent font-medium"
                      : "text-muted-foreground"
                  }`}
                  data-testid={`link-sidebar-sub-${sub.slug}`}
                >
                  {sub.title}
                </Link>
              ))}
            </nav>

            <div className="mt-8 pt-8 border-t">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
                All Chapters
              </h3>
              <nav className="space-y-1">
                {chapters.map((chapter) => (
                  <Link
                    key={chapter.id}
                    href={`/chapter/${chapter.slug}`}
                    className={`block px-3 py-2 rounded-md text-sm transition-colors hover-elevate ${
                      chapter.slug === currentChapter.slug
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground"
                    }`}
                    data-testid={`link-sidebar-chapter-${chapter.slug}`}
                  >
                    {chapter.order}. {chapter.title}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}
