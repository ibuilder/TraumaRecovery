import { chapterManifest } from "../../client/src/lib/chapters/manifest";
import { BASE_PATH } from "../../playwright.config";

/**
 * The site is served from a subdirectory on GitHub Pages, and a `goto` with a
 * leading slash would resolve against the origin and drop it. Every navigation
 * goes through here so a test path reads like the route the router sees.
 */
export function sitePath(path: string): string {
  return `${BASE_PATH}${path === "/" ? "/" : path}`;
}

export interface Route {
  /** Path relative to the base, as the router sees it. */
  path: string;
  label: string;
}

/** Every page the site can serve, derived from the manifest rather than listed. */
export function allRoutes(): Route[] {
  const routes: Route[] = [
    { path: "/", label: "home" },
    { path: "/chapters", label: "chapters index" },
  ];
  for (const chapter of chapterManifest) {
    routes.push({
      path: `/chapter/${chapter.slug}`,
      label: `${chapter.order}. ${chapter.title}`,
    });
    for (const sub of chapter.subchapters) {
      routes.push({
        path: `/chapter/${chapter.slug}/subchapter/${sub.slug}`,
        label: `${chapter.order}.${sub.order} ${sub.title}`,
      });
    }
  }
  return routes;
}

/**
 * Console output that is noise rather than a defect: the fonts are fetched
 * from Google and blocked in a sandbox, and Pages answers a deep link with a
 * real 404 status carrying the SPA shell, which the browser logs.
 */
export function isRealConsoleError(text: string): boolean {
  return !/ERR_|fonts\.(googleapis|gstatic)|status of 404|Failed to load resource/.test(
    text
  );
}
