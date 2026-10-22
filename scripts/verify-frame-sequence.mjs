/**
 * Scroll-verification for the hero frame sequence.
 * Usage: node scripts/verify-frame-sequence.mjs
 * Spawns `next start`, drives system Edge headless, asserts the fixed behavior.
 */
import puppeteer from "puppeteer-core";
import { spawn, execSync } from "node:child_process";
import { setTimeout as wait } from "node:timers/promises";

const PORT = 4323;
const BASE = `http://127.0.0.1:${PORT}`;
const EDGE =
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const results = [];
let failures = 0;

function check(name, ok, detail) {
  results.push({ name, ok, detail });
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"} — ${name}${detail ? ` (${detail})` : ""}`);
}

function frameOf(src) {
  const match = /ezgif-frame-(\d{3})\.jpg/.exec(src ?? "");
  return match ? Number(match[1]) : 0;
}

async function atReady(page, timeout = 20000) {
  await page.waitForFunction(
    () =>
      document
        .querySelector(".hero-frame-sequence")
        ?.getAttribute("data-video-state") === "ready",
    { timeout }
  );
}

async function state(page) {
  return page.evaluate(
    () => ({
      state: document
        .querySelector(".hero-frame-sequence")
        ?.getAttribute("data-video-state"),
      src: document.querySelector(".hero-frame-sequence-media")?.src ?? "",
      heroRange: (() => {
        const hero = document.querySelector(".hero");
        return hero ? hero.offsetHeight - window.innerHeight : 0;
      })(),
      scrollY: Math.round(window.scrollY),
    })
  );
}

async function scrollToProgress(page, p, steps = 10, pause = 70) {
  await page.evaluate(
    async ({ p, steps, pause }) => {
      const hero = document.querySelector(".hero");
      const target = Math.round((hero.offsetHeight - window.innerHeight) * p);
      const from = window.scrollY;
      for (let i = 1; i <= steps; i += 1) {
        window.scrollTo(0, Math.round(from + ((target - from) * i) / steps));
        await new Promise((r) => setTimeout(r, pause));
      }
      window.scrollTo(0, target);
    },
    { p, steps, pause }
  );
  await wait(350);
}

async function newPage(browser, options = {}) {
  const page = await browser.newPage();
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  await page.setViewport({ width: 1440, height: 900, ...options });
  return { page, errors };
}

async function main() {
  const server = spawn("npx next start -p " + PORT, {
    cwd: process.cwd(),
    shell: true,
    stdio: ["ignore", "ignore", "pipe"],
  });

  try {
    let up = false;
    for (let i = 0; i < 60 && !up; i += 1) {
      await wait(500);
      try {
        const res = await fetch(BASE);
        up = res.ok;
      } catch {
        /* not up yet */
      }
    }
    if (!up) throw new Error("next start did not come up on port " + PORT);

    const browser = await puppeteer.launch({
      executablePath: EDGE,
      headless: "new",
      args: ["--disable-features=msEdgeSmartScreen", "--no-first-run"],
    });

    try {
      /* ---------- Desktop: fresh load ---------- */
      {
        const { page, errors } = await newPage(browser);
        await page.goto(BASE, { waitUntil: "domcontentloaded" });
        await atReady(page);
        const s = await state(page);
        const f = frameOf(s.src);
        check(
          "fresh load paints the first frame (not the final one)",
          s.state === "ready" && f >= 1 && f <= 3,
          `state=${s.state} frame=${f}`
        );
        check("no console errors during load", errors.length === 0, errors.join(" | "));

        /* ---------- Initial-fluctuation guard: first slow crawl ---------- */
        const seen = [];
        {
          const total = await page.evaluate(() => {
            const hero = document.querySelector(".hero");
            return hero.offsetHeight - window.innerHeight;
          });
          for (let step = 1; step <= 22; step += 1) {
            await page.evaluate(
              (y) => window.scrollTo(0, Math.round(y)),
              (total * 0.4 * step) / 22
            );
            await wait(120);
            seen.push(frameOf((await state(page)).src));
          }
          let backward = 0;
          for (let i = 1; i < seen.length; i += 1) {
            if (seen[i] < seen[i - 1]) backward += 1;
          }
          check(
            "first crawl paints frames monotonically (no fluctuation)",
            backward <= 1 && seen[seen.length - 1] >= 40,
            `backwardHops=${backward} trail=${seen.join(",")}`
          );
        }

        /* ---------- Scrub down through the hero ---------- */
        await scrollToProgress(page, 1, 14, 90);
        /* The end anchor must be reachable even on a cold preload: exact
           frame 151 paints via the catch-up listener, no freeze/jump. */
        const reachedEnd = await page
          .waitForFunction(
            () =>
              /ezgif-frame-151\.jpg/.test(
                document.querySelector(".hero-frame-sequence-media")?.src ?? ""
              ),
            { timeout: 5000 }
          )
          .then(() => true)
          .catch(() => false);
        const down = await state(page);
        const fDown = frameOf(down.src);
        check(
          "scrubbing to the hero end reaches the final frame (catch-up works)",
          down.scrollY > 100 && reachedEnd,
          `scrollY=${down.scrollY} heroRange=${down.heroRange} frame=${fDown}`
        );

        /* ---------- Fast scroll back up to the top ---------- */
        await scrollToProgress(page, 0, 8, 40);
        const up2 = await state(page);
        const fUp = frameOf(up2.src);
        check(
          "fast scroll back to top restores the opening frame",
          up2.scrollY <= 2 && fUp <= 3,
          `scrollY=${up2.scrollY} frame=${fUp}`
        );

        /* ---------- Regression: refresh while scrubbed mid-hero ---------- */
        await scrollToProgress(page, 0.65, 10, 60);
        await wait(400);
        await page.setViewport({ width: 1440, height: 700 });
        await wait(700);
        await scrollToProgress(page, 0, 8, 40);
        const afterResize = await state(page);
        const fResize = frameOf(afterResize.src);
        check(
          "resize-triggered refresh keeps the mapping anchored (frame ~0 at top)",
          afterResize.scrollY <= 2 && fResize <= 5,
          `scrollY=${afterResize.scrollY} frame=${fResize}`
        );

        /* ---------- Browser refresh at a mid-hero position ---------- */
        await scrollToProgress(page, 0.55, 10, 60);
        const before = await state(page);
        await page.reload({ waitUntil: "domcontentloaded" });
        await atReady(page);
        await wait(2500);
        const reloaded = await state(page);
        const fRel = frameOf(reloaded.src);
        const expected = Math.max(
          1,
          Math.round(reloaded.framesExpected ?? (reloaded.scrollY <= 0 ? 1 : 0))
        );
        check(
          "reload at a scrolled position never shows the final frame",
          fRel < 140 && fRel > 0,
          `scrollY=${reloaded.scrollY} frame=${fRel} (was ${frameOf(before.src)} )` +
            (reloaded.scrollY <= 0 ? " (restored to top)" : "")
        );
        void expected;
        await page.close();
      }

      /* ---------- Mobile viewport ---------- */
      {
        const { page, errors } = await newPage(browser, {
          width: 390,
          height: 844,
          isMobile: true,
          hasTouch: true,
        });
        await page.goto(BASE, { waitUntil: "domcontentloaded" });
        await atReady(page);
        const s = await state(page);
        await scrollToProgress(page, 0.5, 10, 70);
        /* Exact-frame catch-up must still land the target around p=0.5 */
        const reached = await page
          .waitForFunction(
            () => {
              const match = /ezgif-frame-(\d{3})\.jpg/.exec(
                document.querySelector(".hero-frame-sequence-media")?.src ?? ""
              );
              return match ? Number(match[1]) >= 62 : false;
            },
            { timeout: 5000 }
          )
          .then(() => true)
          .catch(() => false);
        const mid = await state(page);
        const fMid = frameOf(mid.src);
        check(
          "mobile viewport scrubs and stays responsive",
          s.state === "ready" &&
            mid.scrollY >= 100 &&
            fMid >= 62 &&
            fMid < 140,
          `state=${s.state} reached=${reached} scrollY=${mid.scrollY} heroRange=${mid.heroRange} frame=${fMid}`
        );
        check("no console errors on mobile", errors.length === 0, errors.join(" | "));
        await page.close();
      }

      /* ---------- Reduced motion: static fallback ---------- */
      {
        const { page, errors } = await newPage(browser);
        await page.emulateMediaFeatures([
          { name: "prefers-reduced-motion", value: "reduce" },
        ]);
        await page.goto(BASE, { waitUntil: "domcontentloaded" });
        await wait(3000);
        const s = await state(page);
        const f = frameOf(s.src);
        check(
          "reduced-motion keeps the static poster fallback",
          s.state !== "ready" && f === 0,
          `state=${s.state} frame=${f}`
        );
        check("no console errors with reduced motion", errors.length === 0, errors.join(" | "));
        await page.close();
      }
    } finally {
      await browser.close();
    }
  } finally {
    try {
      execSync(`taskkill /pid ${server.pid} /T /F`, { stdio: "ignore" });
    } catch {
      /* already gone */
    }
  }

  console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main().catch((err) => {
  console.error("Runner error:", err);
  process.exitCode = 1;
});
