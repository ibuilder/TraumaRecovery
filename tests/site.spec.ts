import { expect, test, type Page } from "@playwright/test";
import { allRoutes, isRealConsoleError, sitePath } from "./helpers/routes";
import { contentForRoute, figureCount } from "./helpers/content";

/** Records everything the page complains about while a test runs. */
function watchConsole(page: Page): string[] {
  const problems: string[] = [];
  page.on("pageerror", (e) => problems.push(`[pageerror] ${e.message}`));
  page.on("console", (m) => {
    const text = m.text();
    if (m.type() === "error" && isRealConsoleError(text)) {
      problems.push(`[error] ${text}`);
    }
    // React logs duplicate keys and bad props as warnings; both have shipped
    // here before and both blank out a page in the right circumstances.
    if (m.type() === "warning" && /key|Warning:/.test(text)) {
      problems.push(`[warning] ${text}`);
    }
  });
  return problems;
}

test.describe("every route", () => {
  for (const route of allRoutes()) {
    test(`${route.path} — ${route.label}`, async ({ page }) => {
      const problems = watchConsole(page);
      // The fonts come from Google and are unreachable in a sandbox; failing
      // the request beats waiting out the timeout on every single route.
      await page.route("**://fonts.g*/**", (r) => r.abort());

      const response = await page.goto(sitePath(route.path), { waitUntil: "load" });
      // A deep link is served as the SPA shell under a 404 status, which is
      // how GitHub Pages works and is not an error.
      expect(response, `no response for ${route.path}`).not.toBeNull();

      // Something must actually render. Three chapter pages once went
      // completely blank on a React error and nothing caught it.
      await expect(page.locator("main")).not.toBeEmpty();

      const markdown = contentForRoute(route.path);
      if (markdown) {
        const expected = figureCount(markdown);
        if (expected > 0) {
          await expect(page.locator("main figure")).toHaveCount(expected);
        }
        // A placeholder that failed to resolve leaks its own syntax.
        await expect(page.locator("main")).not.toContainText("```chart:");
        await expect(page.locator("main")).not.toContainText("[Chart:");
      }

      expect(problems, `console output on ${route.path}`).toEqual([]);
    });
  }
});

test.describe("search", () => {
  test("finds a term by its heading and lands on the anchor", async ({ page }) => {
    await page.route("**://fonts.g*/**", (r) => r.abort());
    await page.goto(sitePath("/"), { waitUntil: "load" });

    await page.keyboard.press("ControlOrMeta+k");
    const input = page.getByTestId("input-search");
    await expect(input).toBeVisible();

    await input.fill("urge surfing");
    const result = page.getByRole("option").first();
    await expect(result).toContainText(/urge surfing/i);
    await result.click();

    await expect(page).toHaveURL(/\/chapter\/addiction-recovery/);
    await expect(
      page.getByRole("heading", { name: /urge surfing/i }).first()
    ).toBeVisible();
  });

  test("says so rather than showing nothing when a term is absent", async ({ page }) => {
    await page.route("**://fonts.g*/**", (r) => r.abort());
    await page.goto(sitePath("/"), { waitUntil: "load" });
    await page.keyboard.press("ControlOrMeta+k");
    await page.getByTestId("input-search").fill("zzzzqqqx");
    await expect(page.getByText(/nothing matched/i)).toBeVisible();
  });
});

test.describe("accessibility", () => {
  test("the skip link is the first tab stop and moves focus to the content", async ({
    page,
  }) => {
    await page.route("**://fonts.g*/**", (r) => r.abort());
    await page.goto(sitePath("/chapter/dbt"), { waitUntil: "load" });

    const skip = page.getByTestId("link-skip-to-content");
    // Off-screen until focused, or it would sit above the header for everyone.
    expect((await skip.boundingBox())!.width).toBeLessThan(2);

    await page.keyboard.press("Tab");
    await expect(skip).toBeFocused();
    expect((await skip.boundingBox())!.width).toBeGreaterThan(40);

    await page.keyboard.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
  });

  test.describe("charts", () => {
    /**
     * True if the first bar's geometry ever changes.
     *
     * Sampling before and after will not do: the sweep is over in about a
     * tenth of a second on a short bar, so a poll from Node races it and reads
     * the settled value both times. Watch for the mutations instead, from
     * before the bundle has even mounted React.
     */
    async function barAnimates(page: Page): Promise<boolean> {
      await page.route("**://fonts.g*/**", (r) => r.abort());
      await page.goto(sitePath("/chapter/basic-recovery"), { waitUntil: "commit" });
      await page.evaluate(() => {
        const seen = new Set<string>();
        (window as unknown as { __barGeometry: Set<string> }).__barGeometry = seen;
        const record = () => {
          const bar = document.querySelector(".recharts-rectangle");
          if (bar) seen.add(`${bar.getAttribute("width")}x${bar.getAttribute("height")}`);
        };
        new MutationObserver(record).observe(document.documentElement, {
          subtree: true,
          attributes: true,
          childList: true,
        });
      });
      await page.waitForSelector(".recharts-rectangle");
      // Comfortably past Recharts' default entry duration.
      await page.waitForTimeout(2_000);
      return (
        (await page.evaluate(
          () => (window as unknown as { __barGeometry: Set<string> }).__barGeometry.size
        )) > 1
      );
    }

    test("animate in normally", async ({ page }) => {
      expect(await barAnimates(page)).toBe(true);
    });

    test.describe("with reduced motion", () => {
      test.use({ contextOptions: { reducedMotion: "reduce" } });
      test("do not animate", async ({ page }) => {
        // Recharts animates in JavaScript, so the CSS rule cannot reach it and
        // the chart module has to read the media query itself.
        expect(await barAnimates(page)).toBe(false);
      });
    });
  });
});
