import { defineConfig, devices } from "@playwright/test";

/**
 * Tests run against a real production build served the way GitHub Pages
 * serves it, base path and 404 fallback included — not against the dev
 * server. Every defect these tests exist to catch (a chunk that fails to
 * load, a deep link that 404s, a chart captured mid-animation) only appears
 * in the built, base-pathed site.
 */
// The casing matters and is not cosmetic: GitHub Pages serves a project site
// from /<repo>/ and those paths are case-sensitive, so testing "/traumarecovery"
// while deploying "/TraumaRecovery" exercises a configuration that is not the one
// that ships. Everything else derives from here.
export const BASE_PATH = "/TraumaRecovery";
const PORT = 4173;

/**
 * Escape hatch for sandboxes that ship a browser but cannot reach Playwright's
 * CDN, where `npx playwright install` fails and the bundled revision is not the
 * one on disk. CI installs the matching browser and leaves this unset.
 *
 *   PLAYWRIGHT_CHROMIUM_PATH=/path/to/chrome npm test
 */
const chromiumPath = process.env.PLAYWRIGHT_CHROMIUM_PATH;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  // Generating the book walks 78 charts through an offscreen React root and
  // screenshots each one; it takes about a minute and a half.
  timeout: 5 * 60_000,
  expect: { timeout: 10_000 },

  use: {
    // Without the base path: a leading-slash goto would drop it anyway, so the
    // tests prepend it explicitly through `sitePath()`.
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(chromiumPath ? { launchOptions: { executablePath: chromiumPath } } : {}),
      },
    },
  ],

  webServer: {
    command: `npx tsx script/serve-static.ts --port ${PORT} --base ${BASE_PATH}`,
    url: `http://localhost:${PORT}${BASE_PATH}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
