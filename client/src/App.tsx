import { Route, Router as WouterRouter, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Home from "@/pages/home";
import Chapters from "@/pages/chapters";
import Chapter from "@/pages/chapter";
import NotFound from "@/pages/not-found";

// import.meta.env.BASE_URL is "/" locally and "/<repo>/" on GitHub Pages.
// wouter expects a base without the trailing slash.
const routerBase = import.meta.env.BASE_URL.replace(/\/$/, "");

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/chapters" component={Chapters} />
      <Route path="/chapter/:slug" component={Chapter} />
      <Route path="/chapter/:slug/subchapter/:subSlug" component={Chapter} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <WouterRouter base={routerBase}>
            <div className="min-h-screen flex flex-col bg-background text-foreground">
              {/*
                The header is sticky and carries navigation, search and the
                crisis dialog, so a keyboard or screen-reader user tabs through
                all of it before reaching a word of the chapter. Off-screen
                until focused, then the first thing in the tab order.
              */}
              <a
                href="#main"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
                data-testid="link-skip-to-content"
              >
                Skip to content
              </a>
              <Header />
              <main id="main" tabIndex={-1} className="flex-1">
                <Router />
              </main>
              <Footer />
            </div>
          </WouterRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
