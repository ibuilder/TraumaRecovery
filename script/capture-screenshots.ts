/**
 * Regenerates the README screenshots and the social card.
 *
 *   npm run build:pages && npm run screenshots
 *
 * The shots are taken against a real production build served the way GitHub
 * Pages serves it, for the same reason the tests are: a screenshot of the dev
 * server is a screenshot of something nobody visits. This spawns its own static
 * server on a port the test suite does not use, so it can run alongside them.
 *
 * Page screenshots are 1.5x rather than 2x — GitHub renders them about 900px
 * wide, so 2x is a megabyte of weight for detail nobody sees. The social card
 * stays at 2x: it is a published asset, not a thumbnail.
 */
import { chromium, type Page } from "@playwright/test";
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const PORT = 4188;
const BASE_PATH = "/TraumaRecovery";
const BASE = `http://localhost:${PORT}${BASE_PATH}`;
const OUT = "docs/images";
const CHAPTER = `${BASE}/chapter/basic-recovery/subchapter/window-of-tolerance`;

const server = spawn(
  "npx",
  ["tsx", "script/serve-static.ts", "--port", String(PORT), "--base", BASE_PATH],
  { stdio: "ignore" }
);
process.on("exit", () => server.kill());

async function waitForServer() {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`${BASE}/`);
      if (r.ok) return;
    } catch {
      /* not up yet */
    }
    await sleep(250);
  }
  throw new Error(`static server never came up on ${PORT} — run build:pages first`);
}
await waitForServer();

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH,
});

async function newPage(
  opts: { dark?: boolean; height?: number; scale?: number } = {}
): Promise<Page> {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: opts.height ?? 800 },
    deviceScaleFactor: opts.scale ?? 1.5,
    colorScheme: opts.dark ? "dark" : "light",
    reducedMotion: "reduce",
  });
  const p = await ctx.newPage();
  await p.route("**://fonts.g*/**", (r) => r.abort());
  return p;
}

/** Figures load lazily, so wait until every placement holds a real one. */
async function settle(p: Page) {
  await p.waitForFunction(() => !!document.querySelector("h1"), null, {
    timeout: 20_000,
  });
  await p
    .waitForFunction(
      () => {
        const slots = document.querySelectorAll("[data-chart-slot]");
        return (
          slots.length === 0 || Array.from(slots).every((s) => s.querySelector("figure"))
        );
      },
      null,
      { timeout: 30_000 }
    )
    .catch(() => {});
  await p.waitForTimeout(1200);
}

// ---- the home page -------------------------------------------------------
{
  const p = await newPage({ height: 700 });
  await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${OUT}/home.png` });
  await p.context().close();
  console.log("home.png");
}

// ---- the reading view, with a whole figure in frame ----------------------
{
  const p = await newPage({ height: 880 });
  await p.goto(CHAPTER, { waitUntil: "networkidle" });
  await settle(p);
  await p.evaluate(() => {
    const fig = document.querySelector("main figure");
    if (fig) {
      window.scrollTo({
        top: fig.getBoundingClientRect().top - 210,
        behavior: "instant",
      });
    }
  });
  await p.waitForTimeout(700);
  await p.screenshot({ path: `${OUT}/reading.png` });
  await p.context().close();
  console.log("reading.png");
}

// ---- a figure with its numbers open --------------------------------------
{
  const p = await newPage();
  await p.goto(CHAPTER, { waitUntil: "networkidle" });
  await settle(p);
  const fig = p
    .locator("figure")
    .filter({ has: p.locator("[data-chart-data]") })
    .first();
  await fig.locator("summary").click();
  await p.waitForTimeout(600);
  // The header is sticky and would otherwise land on top of the figure.
  await p.addStyleTag({ content: "header { visibility: hidden !important; }" });
  await fig.scrollIntoViewIfNeeded();
  await p.waitForTimeout(400);
  await fig.screenshot({ path: `${OUT}/figure-data-table.png` });
  await p.context().close();
  console.log("figure-data-table.png");
}

// ---- search, in dark mode ------------------------------------------------
{
  const p = await newPage({ dark: true, height: 720 });
  await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  await p.getByTestId("button-search").click();
  await p.getByTestId("input-search").fill("window of tolerance");
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${OUT}/search.png` });
  await p.context().close();
  console.log("search.png");
}

// ---- the social card -----------------------------------------------------
// 1280x640, what GitHub and most link unfurlers want. Built from the book's own
// tokens rather than a stock template: --background, --foreground and
// --sidebar-primary, copied from client/src/index.css.
{
  const p = await newPage({ height: 640, scale: 2 });
  await p.setContent(`
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: 1280px; height: 640px;
        background: hsl(210 3% 98%); color: hsl(210 5% 12%);
        font-family: "Segoe UI", -apple-system, "Helvetica Neue", Arial, sans-serif;
        display: flex; flex-direction: column; justify-content: center;
        padding: 0 96px; position: relative;
      }
      .rule { position: absolute; top: 0; left: 0; right: 0; height: 10px;
              background: hsl(210 65% 42%); }
      .eyebrow { font-size: 21px; letter-spacing: .16em; text-transform: uppercase;
                 color: hsl(210 65% 42%); font-weight: 600; margin-bottom: 30px; }
      h1 { font-size: 82px; line-height: 1.03; font-weight: 700; letter-spacing: -.022em; }
      .sub { font-size: 34px; line-height: 1.32; color: hsl(210 5% 34%);
             margin-top: 26px; font-weight: 400; max-width: 27ch; }
      .foot { position: absolute; left: 96px; right: 96px; bottom: 54px;
              display: flex; justify-content: space-between; align-items: baseline;
              font-size: 22px; color: hsl(210 5% 42%);
              border-top: 1px solid hsl(210 4% 88%); padding-top: 26px; }
      .foot strong { color: hsl(210 5% 20%); font-weight: 600; }
    </style>
    <div class="rule"></div>
    <div class="eyebrow">Free to read &middot; Free to download</div>
    <h1>Healing&nbsp;Together</h1>
    <p class="sub">A Practical Guide to Trauma Recovery for Ordinary People</p>
    <div class="foot">
      <span><strong>Matthew M. Emma</strong></span>
      <span>14 chapters &middot; 88 figures &middot; web, PDF and Kindle</span>
    </div>
  `);
  await p.waitForTimeout(400);
  await p.screenshot({ path: `${OUT}/social-card.png` });
  await p.context().close();
  console.log("social-card.png");
}

await browser.close();
server.kill();
