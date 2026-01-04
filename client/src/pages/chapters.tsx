import { useEffect } from "react";
import { ChapterCard } from "@/components/chapter-card";
import { chapters, bookInfo } from "@/lib/chapters";

export default function Chapters() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-chapters-title">
            All Chapters
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore all {chapters.length} chapters of {bookInfo.title}. Each chapter builds on the previous, but you can also jump to topics most relevant to your journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {chapters.map((chapter) => (
            <ChapterCard key={chapter.id} chapter={chapter} />
          ))}
        </div>
      </div>
    </div>
  );
}
