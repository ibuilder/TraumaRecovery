import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Logo } from "@/components/logo";
import { LifeBuoy, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { bookInfo, chapters } from "@/lib/chapters";
import { prefetchSearchIndex } from "@/lib/search-index-loader";

// Both dialogs are opened rarely and neither belongs in the entry bundle; the
// search one drags the whole index in behind it.
const SearchDialog = lazy(() =>
  import("@/components/search-dialog").then((m) => ({ default: m.SearchDialog }))
);
const CrisisDialog = lazy(() =>
  import("@/components/crisis-dialog").then((m) => ({ default: m.CrisisDialog }))
);

export function Header() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [crisisOpen, setCrisisOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-2 flex-wrap">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                data-testid="button-mobile-menu"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="p-4 border-b">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2"
                >
                  <Logo className="h-6 w-6" />
                  <span className="font-semibold">{bookInfo.title}</span>
                </Link>
              </div>
              <ScrollArea className="h-[calc(100vh-5rem)]">
                <nav className="p-4 space-y-1" aria-label="Main menu">
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className={`block px-3 py-2 rounded-md text-sm transition-colors hover-elevate ${
                      location === "/" ? "bg-accent font-medium" : ""
                    }`}
                    data-testid="link-home-mobile"
                  >
                    Home
                  </Link>
                  {chapters.map((chapter) => (
                    <Link
                      key={chapter.id}
                      href={`/chapter/${chapter.slug}`}
                      onClick={() => setOpen(false)}
                      className={`block px-3 py-2 rounded-md text-sm transition-colors hover-elevate ${
                        location === `/chapter/${chapter.slug}`
                          ? "bg-accent font-medium"
                          : ""
                      }`}
                      data-testid={`link-chapter-mobile-${chapter.slug}`}
                    >
                      {chapter.order}. {chapter.title}
                    </Link>
                  ))}
                </nav>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          <Link
            href="/"
            className="flex items-center gap-2"
            data-testid="link-home-header"
          >
            <Logo className="h-6 w-6" />
            <span className="font-semibold hidden sm:inline-block">{bookInfo.title}</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1 flex-wrap" aria-label="Main">
          <Link href="/">
            <Button
              variant={location === "/" ? "secondary" : "ghost"}
              size="sm"
              data-testid="link-home-nav"
            >
              Home
            </Button>
          </Link>
          <Link href="/chapters">
            <Button
              variant={location === "/chapters" ? "secondary" : "ghost"}
              size="sm"
              data-testid="link-chapters-nav"
            >
              Chapters
            </Button>
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchOpen(true)}
            onMouseEnter={prefetchSearchIndex}
            onFocus={prefetchSearchIndex}
            className="gap-2 text-muted-foreground"
            data-testid="button-search"
          >
            <Search className="h-4 w-4" />
            <span className="hidden lg:inline">Search</span>
            <kbd className="hidden lg:inline rounded border bg-muted px-1.5 font-mono text-[10px]">
              ⌘K
            </kbd>
            <span className="sr-only lg:hidden">Search the book</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCrisisOpen(true)}
            className="gap-2"
            data-testid="button-crisis"
          >
            <LifeBuoy className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">Get help</span>
            <span className="sr-only sm:hidden">Get help now</span>
          </Button>

          <ThemeToggle />
        </div>
      </div>

      <Suspense fallback={null}>
        {searchOpen ? (
          <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
        ) : null}
        {crisisOpen ? (
          <CrisisDialog open={crisisOpen} onOpenChange={setCrisisOpen} />
        ) : null}
      </Suspense>
    </header>
  );
}
