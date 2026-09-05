/**
 * Checks that the URL people actually visit is serving the book.
 *
 *   npx tsx script/check-deployed-site.ts https://ibuilder.github.io/TraumaRecovery/
 *
 * `check:pages` proves the *build* is correct. It cannot prove the build is
 * what got published, and on 2026-09-05 those turned out to be different
 * things: GitHub Pages was set to "Deploy from a branch", so every push to
 * main started two deployments — this repository's workflow, uploading
 * dist/public, and GitHub's built-in Jekyll workflow, rendering README.md
 * from the repository root. They raced. Jekyll finished four seconds later
 * and won, so the live site was the README, not the application.
 *
 * Nothing failed. Both workflows were green, the deploy log said success, and
 * the only symptom was a reader saying the book was gone. This is the check
 * that turns that into a red build.
 *
 * Pointing it at localhost mostly works, but the share-card check will fail
 * there: og:image is an absolute production URL by necessity, so it is only
 * meaningful against the real origin.
 */

// Top-level await needs this file to be a module, and it has no imports.
export {};

const url = process.argv[2] ?? process.env.DEPLOY_URL;
if (!url) {
  console.error("usage: check-deployed-site.ts <url>");
  process.exit(2);
}
const base = url.endsWith("/") ? url : `${url}/`;

type Finding = { ok: boolean; label: string; detail: string };
const findings: Finding[] = [];
const pass = (label: string, detail: string) =>
  findings.push({ ok: true, label, detail });
const fail = (label: string, detail: string) =>
  findings.push({ ok: false, label, detail });

/**
 * A just-published deployment can take a few seconds to reach the CDN edge,
 * and a 404 in that window means "not yet", not "broken". Retrying only the
 * fetch — never the assertions — keeps that from masking a real failure.
 */
async function get(target: string, tries = 6): Promise<Response | null> {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(target, { redirect: "follow" });
      if (r.ok) return r;
      if (i === tries - 1) return r;
    } catch {
      if (i === tries - 1) return null;
    }
    await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
  }
  return null;
}

const res = await get(base);
if (!res) {
  fail("Reachable", `${base} could not be fetched at all`);
} else if (!res.ok) {
  fail("Reachable", `${base} returned HTTP ${res.status}`);
} else {
  pass("Reachable", `${base} returned HTTP ${res.status}`);
  const html = await res.text();

  // The application mounts into this. Jekyll's render of README.md has no such
  // element -- it is the single clearest "this is not the app" signal.
  if (html.includes('id="root"')) {
    pass("App mount", 'the page has <div id="root">');
  } else {
    // Name the failure mode that actually happened, because the generic
    // message sends you looking at the build, which is not where the bug is.
    const looksLikeReadme =
      /<article|class="markdown-body"|Healing Together<\/h1>/i.test(html) &&
      !html.includes('id="root"');
    fail(
      "App mount",
      looksLikeReadme
        ? "no app mount, and the page looks like a rendered README -- Pages is " +
            "probably set to Deploy from a branch, so the built-in Jekyll build " +
            "is publishing the repository root over this workflow's upload"
        : "no app mount; whatever is published here is not the built site"
    );
  }

  // A module script under the base path, which the README render cannot have.
  const script = /<script[^>]+type="module"[^>]+src="([^"]+)"/.exec(html)?.[1];
  if (!script) {
    fail("App bundle", "no <script type=module> in the served HTML");
  } else {
    const abs = new URL(script, base).toString();
    const js = await get(abs, 3);
    if (js?.ok) {
      const body = await js.text();
      if (body.length > 1000) pass("App bundle", `${script} serves ${body.length} bytes`);
      else fail("App bundle", `${script} served only ${body.length} bytes`);
    } else {
      fail("App bundle", `${abs} returned ${js ? `HTTP ${js.status}` : "nothing"}`);
    }
  }

  // The share card, on the live origin. check:pages proves it is in the build;
  // only this proves a reader's link preview will resolve.
  const og = /<meta[^>]+property="og:image"[^>]+content="([^"]+)"/.exec(html)?.[1];
  if (!og) {
    fail("Share card", "no og:image in the served HTML");
  } else {
    const img = await get(og, 3);
    if (img?.ok) pass("Share card", `og:image resolves (HTTP ${img.status})`);
    else
      fail(
        "Share card",
        `og:image ${og} returned ${img ? `HTTP ${img.status}` : "nothing"}`
      );
  }
}

const width = Math.max(...findings.map((f) => f.label.length));
console.log(`\nDeployed site — ${base}\n`);
for (const f of findings) {
  console.log(`[${f.ok ? "  ok  " : " FAIL "}] ${f.label.padEnd(width)}  ${f.detail}`);
}
const failed = findings.filter((f) => !f.ok);
console.log(`\n${findings.length - failed.length} passed, ${failed.length} failed\n`);
process.exit(failed.length ? 1 : 0);
