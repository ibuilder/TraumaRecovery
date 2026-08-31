import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { sitePath, allRoutes } from "./helpers/routes";

/**
 * The site read aloud.
 *
 * This book is largely made of statistics — 101 figures across fourteen
 * chapters — and until these tests existed a screen reader got almost none of
 * them. Recharts draws into an SVG it marks `role="application"`, the most
 * hostile role in ARIA: it tells the reader to stop interpreting the content
 * and forward keystrokes to the widget. What came out was the `<text>` nodes in
 * paint order — "0%", "15%", "30%", "General Population", "Women", …, "3.9%",
 * "8%" — categories and values in separate runs with nothing tying them
 * together. On the radars and pies the values were not in the SVG at all.
 *
 * Every plotted figure now carries its data as a real table — bar one, whose
 * proportions are illustrative and which is described in prose instead — and
 * every drawing is inert, so none of them takes a Tab stop either.
 */

/** Charts mount after Recharts has measured the container, so wait them out. */
async function settle(page: import("@playwright/test").Page) {
  await page.waitForFunction(() => !!document.querySelector("h1"), null, { timeout: 20_000 });
  const figures = await page.locator("figure").count();
  if (figures > 0) {
    await page
      .locator("figure svg")
      .first()
      .waitFor({ state: "attached", timeout: 20_000 })
      .catch(() => {});
  }
}

test.describe("accessibility", () => {
  // Ninety routes at roughly a second each.
  test.setTimeout(10 * 60_000);

  test("no axe violations on any route", async ({ page }) => {
    await page.route("**://fonts.g*/**", (r) => r.abort());

    const offenders: string[] = [];
    for (const route of allRoutes()) {
      await page.goto(sitePath(route.path), { waitUntil: "load" });
      await settle(page);
      const { violations } = await new AxeBuilder({ page }).analyze();
      for (const v of violations) {
        offenders.push(
          `${route.path}  [${v.impact}] ${v.id} (${v.nodes.length})` +
            `\n      ${v.nodes[0]?.html?.slice(0, 160).replace(/\s+/g, " ")}`
        );
      }
    }
    expect(offenders, `axe violations:\n  ${offenders.join("\n  ")}`).toEqual([]);
  });

  test("every figure is announced, and its numbers are readable", async ({ page }) => {
    await page.route("**://fonts.g*/**", (r) => r.abort());

    let figures = 0;
    let tables = 0;
    const unnamed: string[] = [];
    const undescribed: string[] = [];

    for (const route of allRoutes().filter((r) => r.path.includes("/chapter/"))) {
      await page.goto(sitePath(route.path), { waitUntil: "load" });
      await settle(page);

      const found = await page.evaluate(() =>
        Array.from(document.querySelectorAll("figure")).map((f) => {
          const labelledBy = f.getAttribute("aria-labelledby");
          const name = labelledBy ? document.getElementById(labelledBy)?.textContent?.trim() : "";
          const describedBy = f.getAttribute("aria-describedby");
          const drawing = f.querySelector("svg");
          return {
            name: name ?? "",
            hasTable: !!f.querySelector("table"),
            // A figure whose proportions are illustrative rather than measured
            // says so in prose instead; a table of those numbers would read as
            // data it is not.
            described: !!(describedBy && document.getElementById(describedBy)?.textContent?.trim()),
            // Some figures are laid out in HTML rather than drawn. Their text
            // is already in the document and needs nothing added to it.
            hasDrawing: !!drawing,
            // A hand-drawn diagram describes itself; a Recharts surface cannot.
            selfDescribing: !!drawing?.querySelector(":scope > title, :scope > desc"),
            drawingReachable: !!f.querySelector(':scope > div:not([inert]) svg[role="application"]'),
          };
        })
      );

      for (const f of found) {
        figures++;
        if (f.hasTable) tables++;
        if (!f.name) unnamed.push(`${route.path}: a figure has no accessible name`);
        // A drawing has to hand over its content somehow: either the figure
        // carries the numbers as a table, or the SVG explains itself in a
        // `<desc>`. A Recharts surface reachable in the a11y tree is neither —
        // it reads out as loose axis labels with no values attached.
        if (f.hasDrawing && !f.hasTable && !f.selfDescribing && !f.described) {
          undescribed.push(`${route.path}: "${f.name}" has neither a data table nor a description`);
        }
        if (f.drawingReachable) {
          undescribed.push(`${route.path}: "${f.name}" leaves role="application" in the a11y tree`);
        }
      }
    }

    expect(unnamed).toEqual([]);
    expect(undescribed, undescribed.join("\n")).toEqual([]);
    // A floor, so deleting the tables cannot quietly pass this test.
    expect(figures).toBeGreaterThan(90);
    expect(tables).toBeGreaterThan(60);
  });

  test("the chart drawings take no tab stops", async ({ page }) => {
    await page.route("**://fonts.g*/**", (r) => r.abort());

    // Not every page carries a Recharts figure — some chapters illustrate
    // themselves in plain HTML — so find one that does rather than assume.
    const drawings = page.locator('[inert] [tabindex="0"], [inert] a, [inert] button');
    let focusableInDrawings = 0;
    for (const route of allRoutes().filter((r) => r.path.includes("/chapter/")).slice(0, 12)) {
      await page.goto(sitePath(route.path), { waitUntil: "load" });
      await settle(page);
      focusableInDrawings = await drawings.count();
      if (focusableInDrawings > 0) break;
    }

    // Recharts leaves `tabindex="0"` on the surface. Hiding it from a screen
    // reader while it still takes a Tab stop is a trap, so it must be inert.
    // Confirm `inert` is load-bearing before trusting the walk below: if
    // Recharts ever stopped marking the surface focusable, the walk would pass
    // for the wrong reason.
    expect(
      focusableInDrawings,
      "nothing inside a drawing is focusable — this test proves nothing"
    ).toBeGreaterThan(0);

    await page.locator("figure").first().locator("summary").focus();
    for (let i = 0; i < 8; i++) {
      const inside = await page.evaluate(() => !!document.activeElement?.closest("[inert]"));
      expect(inside, "Tab landed inside a drawing that announces nothing").toBe(false);
      await page.keyboard.press("Tab");
    }
  });
});
