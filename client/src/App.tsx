import { Route, Router as WouterRouter, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
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
              <Header />
              <main className="flex-1">
                <Router />
              </main>
              <Footer />
            </div>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
