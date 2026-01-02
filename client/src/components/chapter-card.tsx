import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronRight, Heart, Shield, Home, Baby, User, Brain, Waves, Compass, Sun } from "lucide-react";
import type { Chapter } from "@shared/schema";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart,
  Shield,
  Home,
  Baby,
  User,
  Brain,
  Waves,
  Compass,
  Sun,
};

interface ChapterCardProps {
  chapter: Chapter;
}

export function ChapterCard({ chapter }: ChapterCardProps) {
  const IconComponent = iconMap[chapter.icon] || Heart;

  return (
    <Link href={`/chapter/${chapter.slug}`} data-testid={`card-chapter-${chapter.slug}`}>
      <Card className="h-full transition-all duration-300 hover-elevate active-elevate-2 cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="p-2 rounded-md bg-primary/10">
              <IconComponent className="h-5 w-5 text-primary" />
            </div>
            <Badge variant="secondary" className="text-xs">
              Chapter {chapter.order}
            </Badge>
          </div>
          <CardTitle className="text-lg leading-tight mt-3">{chapter.title}</CardTitle>
          <CardDescription className="text-sm line-clamp-2">
            {chapter.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between gap-2 flex-wrap text-muted-foreground">
            <div className="flex items-center gap-1 text-xs">
              <Clock className="h-3.5 w-3.5" />
              <span>{chapter.readingTime}</span>
            </div>
            <div className="flex items-center gap-1 text-xs group-hover:text-primary transition-colors">
              <span>Read chapter</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
