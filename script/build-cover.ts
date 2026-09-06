/**
 * Renders the Kindle cover.
 *
 *   npm run cover
 *
 * KDP takes the cover as a separate upload rather than as page 1 of the file,
 * so it is the one asset the EPUB build cannot produce and the one thing
 * standing between a finished ebook and a published one.
 *
 * 1600x2560 is Amazon's recommended size and the 1:1.6 ratio its store pages
 * are laid out for. Anything squarer gets letterboxed in the carousel.
 *
 * Built from the book's own tokens rather than a stock template -- the same
 * --background, --foreground and --sidebar-primary the site uses, copied from
 * client/src/index.css -- so the cover, the share card and the site are
 * recognisably one object.
 *
 * The hard constraint on a cover is not the full-size render: it is the
 * thumbnail. In a search result this is about 80px wide, at which point the
 * subtitle is unreadable and only the title and the author survive. So the
 * title is set very large and everything else is subordinate to it, and
 * `npm run cover` writes a thumbnail alongside the full render so that claim
 * can be checked rather than assumed.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { bookInfo } from "../client/src/lib/chapters/types";

const OUT = "dist/cover";
mkdirSync(OUT, { recursive: true });

const W = 1600;
const H = 2560;

const html = `
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${W}px; height: ${H}px;
    background: hsl(210 3% 98%);
    color: hsl(210 5% 12%);
    font-family: Georgia, "Times New Roman", serif;
    padding: 150px 140px 130px;
    position: relative;
    display: flex; flex-direction: column;
  }
  /* The one strong horizontal, echoing the rule on the share card. */
  .band { position: absolute; top: 0; left: 0; right: 0; height: 34px;
          background: hsl(210 65% 42%); }
  .eyebrow { font-family: "Segoe UI", -apple-system, Helvetica, Arial, sans-serif;
             font-size: 40px; letter-spacing: .22em; text-transform: uppercase;
             color: hsl(210 65% 42%); font-weight: 600; }
  /* The title group is centred in the space between the eyebrow and the foot.
     Left as a top-aligned block it stranded roughly a third of the cover as
     dead white below the subtitle -- fine on a desk, but on a store page the
     eye reads that as an unfinished file. */
  .mid { flex: 1; display: flex; flex-direction: column; justify-content: center; }
  h1 { font-size: 232px; line-height: .92; font-weight: 700;
       letter-spacing: -.03em; }
  .rule { width: 240px; height: 10px; background: hsl(210 65% 42%);
          margin: 78px 0 64px; }
  .sub { font-size: 68px; line-height: 1.28; color: hsl(210 5% 35%);
         font-weight: 400; max-width: 17ch; }
  .foot { border-top: 3px solid hsl(210 4% 84%); padding-top: 46px; }
  .free { font-family: "Segoe UI", -apple-system, Helvetica, Arial, sans-serif;
          font-size: 34px; letter-spacing: .1em; text-transform: uppercase;
          color: hsl(210 5% 45%); margin-bottom: 30px; }
  .author { font-size: 82px; font-weight: 700; letter-spacing: -.012em; }
</style>
<div class="band"></div>
<div class="eyebrow">Trauma Recovery</div>
<div class="mid">
  <h1>Healing<br>Together</h1>
  <div class="rule"></div>
  <p class="sub">${bookInfo.subtitle}</p>
</div>
<div class="foot">
  <div class="free">14 chapters &middot; 88 figures &middot; free to read</div>
  <div class="author">${bookInfo.author}</div>
</div>
`;

const browser = await chromium.launch({
  ...(process.env.PLAYWRIGHT_CHROMIUM_PATH
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
    : {}),
});
const ctx = await browser.newContext({ viewport: { width: W, height: H } });
const page = await ctx.newPage();
await page.setContent(html);
await page.waitForTimeout(300);

await page.screenshot({ path: path.join(OUT, "healing-together-cover.png") });

// The thumbnail is the real test: if the title is not readable here, the cover
// does not work where people actually meet it.
await ctx.close();
const thumbCtx = await browser.newContext({
  viewport: { width: W, height: H },
  deviceScaleFactor: 80 / W,
});
const thumb = await thumbCtx.newPage();
await thumb.setContent(html);
await thumb.waitForTimeout(200);
await thumb.screenshot({ path: path.join(OUT, "thumbnail-80px.png") });

await browser.close();
console.log(`wrote ${OUT}/healing-together-cover.png (${W}x${H})`);
console.log(`wrote ${OUT}/thumbnail-80px.png (80px wide, the search-result size)`);
