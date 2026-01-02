import { Link } from "wouter";
import { BookOpen, Heart, Phone, ExternalLink } from "lucide-react";
import { bookInfo, chapters } from "@/lib/chapters";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-semibold">{bookInfo.title}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {bookInfo.subtitle}
            </p>
            <p className="text-sm text-muted-foreground">
              By {bookInfo.author}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <nav className="space-y-2">
              <Link href="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-home">
                Home
              </Link>
              <Link href="/chapters" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-chapters">
                All Chapters
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Chapters</h3>
            <nav className="space-y-2">
              {chapters.slice(0, 5).map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`/chapter/${chapter.slug}`}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors truncate"
                  data-testid={`link-footer-chapter-${chapter.slug}`}
                >
                  {chapter.order}. {chapter.title}
                </Link>
              ))}
            </nav>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Crisis Resources
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium">National Suicide Prevention</p>
                <p className="text-muted-foreground">988 (call or text)</p>
              </div>
              <div>
                <p className="font-medium">Crisis Text Line</p>
                <p className="text-muted-foreground">Text HOME to 741741</p>
              </div>
              <div>
                <p className="font-medium">SAMHSA Helpline</p>
                <p className="text-muted-foreground">1-800-662-4357</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p className="flex items-center gap-1 flex-wrap">
              Made with <Heart className="h-4 w-4 text-red-500" /> for those on the healing journey
            </p>
            <p>
              This content is for educational purposes and is not a substitute for professional mental health care.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
