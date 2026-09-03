import type { ComponentType } from "react";
import * as charts from "./trauma-charts";

/**
 * Every figure in the book, by the name the prose refers to it by.
 *
 * Derived from the module's own exports rather than written out. It used to be
 * two hand-maintained maps of ninety-one entries — one in the markdown
 * renderer, one in the PDF exporter — so adding a figure meant editing three
 * files, and a figure registered in one map but not the other would render on
 * the website and be silently missing from the printed book. They happened to
 * be in sync; nothing was keeping them there.
 *
 * The convention this relies on is that a figure component's name ends in
 * `Chart`, which every one of them already did. `validate:content` enforces it
 * from the other side: anything that renders a `<ChartFrame>` and is not in
 * here fails the build, so a figure named otherwise cannot quietly vanish.
 */
export const ALL_CHART_COMPONENTS: Record<string, ComponentType> = Object.fromEntries(
  Object.entries(charts).filter(
    ([name, value]) => name.endsWith("Chart") && typeof value === "function"
  )
) as Record<string, ComponentType>;

// The exporter reaches the charts only through this module, so what it needs
// alongside them comes through here too — otherwise a static import of
// `trauma-charts` would pull all ninety-one back onto the home page.
export { setChartCaptureMode, PRINT_CHART_PALETTE } from "./trauma-charts";
