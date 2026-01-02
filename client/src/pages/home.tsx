import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChapterCard } from "@/components/chapter-card";
import { bookInfo, chapters } from "@/lib/chapters";
import { ArrowRight, BookOpen, Heart, Users, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
        
        <div className="container relative px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <BookOpen className="h-4 w-4" />
              <span>Your Guide to Healing</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight" data-testid="text-book-title">
              {bookInfo.title}
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground font-light" data-testid="text-book-subtitle">
              {bookInfo.subtitle}
            </p>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {bookInfo.description}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href={`/chapter/${chapters[0].slug}`}>
                <Button size="lg" className="gap-2" data-testid="button-begin-reading">
                  Begin Reading
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/chapters">
                <Button variant="outline" size="lg" data-testid="button-view-chapters">
                  View All Chapters
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Compassionate Approach</h3>
              <p className="text-sm text-muted-foreground">
                Written with understanding and care for those on the healing journey
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">For Everyone</h3>
              <p className="text-sm text-muted-foreground">
                Practical guidance accessible to ordinary people, not just professionals
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Evidence-Based</h3>
              <p className="text-sm text-muted-foreground">
                Grounded in CBT, DBT, ACT and other proven therapeutic approaches
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore the Chapters</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From understanding trauma basics to specific therapeutic techniques, find the guidance you need.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {chapters.map((chapter) => (
              <ChapterCard key={chapter.id} chapter={chapter} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Begin?</h2>
            <p className="text-lg text-muted-foreground">
              Healing is a journey, not a destination. Take the first step today and discover practical tools for recovery.
            </p>
            <Link href={`/chapter/${chapters[0].slug}`}>
              <Button size="lg" className="gap-2" data-testid="button-start-journey">
                Start Your Journey
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
