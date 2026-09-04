import { Link } from "wouter";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 space-y-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Compass className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold" data-testid="text-not-found-title">
            We couldn't find that page
          </h1>
          <p className="text-sm text-muted-foreground">
            The link may be out of date, or the chapter may have moved. Everything is
            still here — start from the table of contents.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/chapters">
              <Button data-testid="link-not-found-chapters">Browse all chapters</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" data-testid="link-not-found-home">
                Return home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
