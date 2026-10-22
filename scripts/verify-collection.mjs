/**
 * Visual + geometric verification of the Collection section.
 * Usage: node scripts/verify-collection.mjs [port]
 * - scrolls the section through the viewport (loads lazy images, fires reveals)
 * - screenshots #collection at desktop / tablet / mobile (local + live)
 * - asserts uniform card geometry at desktop
 */
import puppeteer from "puppeteer-core";
import { spawn, execSync } from "node:child_process";
import { setTimeout as wait } from "node:timers/promises";
import { mkdirSync } from "node:fs";

const PORT = Number(process.argv[2] ?? 4333);
const BASE = process.env.USE_LIVE
  ? "https://noire-perfume-design-demo3.vercel.app/"
  : `http://127.0.0.1:${PORT}`;
const EDGE =
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUT = "reports";
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { tag: "desktop-1440", width: 1440, height: 1000 },
  { tag: "tablet-834", width: 834, height: 1000 },
  { tag: "mobile-390", width: 390, height: 844, isMobile: true, hasTouch: true },
];

let failures = 0;
function check(name, ok, detail) {
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"} — ${name}${detail ? ` (${detail})` : ""}`);
}

async function shootSection(browser, vp, suffix) {
  const page = await browser.newPage();
  await page.setViewport({ width: vp.width, height: vp.height });
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForSelector("#collection", { timeout: 30000 });
  await page.evaluate(() => {
    document
      .querySelector("#collection")
      .scrollIntoView({ behavior: "instant", block: "start" });
  });
  /* Crawl down through the section so every lazy image loads and every
     reveal completes before the shot. */
  await page.evaluate(
    async (vpH) => {
      const el = document.querySelector("#collection");
      const start = document.documentElement.scrollHeight - vpH;
      for (let y = 0; y <= start; y += Math.round(vpH * 0.62)) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 260));
      }
      const bottom = el.offsetTop;
      for (let y = bottom; y <= bottom + el.offsetHeight; y += Math.round(vpH * 0.55)) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 240));
      }
    },
    vp.height
  );
  await wait(1200);
  const el = await page.$("#collection");
  const path = `${OUT}/collection-${suffix}-${vp.tag}.png`;
  await el.screenshot({ path });
  await page.close();
  return path;
}

async function measure(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForSelector("#collection", { timeout: 30000 });
  /* Per-row stable settle: commit each image's srcset choice during a
     calm layout window, like a user reading down the page. */
  await page.evaluate(async () => {
    const anchor = document.querySelector("#collection .perfume-row");
    anchor.scrollIntoView({ behavior: "instant", block: "start" });
    await new Promise((r) => setTimeout(r, 400));
    for (const row of document.querySelectorAll("#collection .perfume-row")) {
      row.scrollIntoView({ behavior: "instant", block: "center" });
      await new Promise((r) => setTimeout(r, 2400));
    }
    anchor.scrollIntoView({ behavior: "instant", block: "start" });
  }, 1000);
  /* Warning-level completion check (capped). */
  await page
    .waitForFunction(
      () =>
        [...document.querySelectorAll("#collection img")].every(
          (img) => img.complete && img.naturalWidth > 0
        ),
      { timeout: 12000 }
    )
    .catch(() => null);
  await wait(2000);
  const cards = await page.evaluate(() => {
    return [...document.querySelectorAll("#collection .perfume-row")].map(
      (row) => {
        const name = row.querySelector("h3")?.textContent?.trim() ?? "";
        const media = row
          .querySelector(".perfume-media")
          .getBoundingClientRect();
        const body = row.querySelector(".perfume-body").getBoundingClientRect();
        const num = row.querySelector(".perfume-num").getBoundingClientRect();
        const img = row.querySelector(".perfume-media img");
        const styles = getComputedStyle(row);
        const imgOk = img && img.complete && img.naturalWidth > 0;
        return {
          name,
          mediaX: Math.round(media.x),
          mediaW: Math.round(media.width),
          mediaH: Math.round(media.height),
          bodyX: Math.round(body.x),
          bodyW: Math.round(body.width),
          numX: Math.round(num.x),
          numR: Math.round(num.right),
          areas: styles.gridTemplateAreas,
          imgOk,
        };
      }
    );
  });
  return { page, cards };
}

async function main() {
  const server = spawn(`npx next start -p ${PORT}`, {
    cwd: process.cwd(),
    shell: true,
    stdio: ["ignore", "ignore", "ignore"],
  });
  try {
    let up = false;
    for (let i = 0; i < 60 && !up; i += 1) {
      await wait(500);
      try {
        const res = await fetch(BASE);
        up = res.ok;
      } catch {}
    }
    if (!up) throw new Error("server did not start on port " + PORT);

    const browser = await puppeteer.launch({
      executablePath: EDGE,
      headless: "new",
      args: ["--no-first-run"],
    });
    try {
      /* Geometry assertions at desktop */
      const { cards, page } = await measure(browser);
      console.log(
        "geometry:",
        cards.map((c) => `${c.name} media(x=${c.mediaX},w=${c.mediaW}) body(x=${c.bodyX},w=${c.bodyW}) numR=${c.numR} img=${c.imgOk}`).join(" | ")
      );
      const mediaXs = new Set(cards.map((c) => c.mediaX));
      const mediaWs = new Set(cards.map((c) => c.mediaW));
      const bodyXs = new Set(cards.map((c) => c.bodyX));
      const bodyWs = new Set(cards.map((c) => c.bodyW));
      const numRs = new Set(cards.map((c) => c.numR));
      check(
        "all three cards share identical image column geometry",
        mediaXs.size === 1 && mediaWs.size === 1,
        [...mediaXs, ...mediaWs].join("/")
      );
      check(
        "all three cards share identical text column geometry",
        bodyXs.size === 1 && bodyWs.size === 1,
        [...bodyXs, ...bodyWs].join("/")
      );
      check(
        "numeral right edges align across cards",
        numRs.size === 1,
        [...numRs].join("/")
      );
      check(
        "every card shows the same uniform layout (no alternating relic)",
        cards.every((c) => !c.areas.includes("--flip")) &&
          cards.every((c) => c.areas.split("(").length === 2 ||
            (c.areas.includes('"body media"') && c.areas.includes('"num'))),
        cards.map((c) => c.areas).join(" | ")
      );
      check(
        "all three perfume images rendered",
        cards.every((c) => c.imgOk),
        cards.map((c) => `${c.name}=${c.imgOk}`).join(",")
      );
      await page.close();

      /* Screenshots, local + live for visual eyeballing */
      for (const vp of VIEWPORTS) {
        await shootSection(browser, vp, "local");
      }
    } finally {
      await browser.close();
    }
  } finally {
    try {
      execSync(`taskkill /pid ${server.pid} /T /F`, { stdio: "ignore" });
    } catch {}
  }

  console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main().catch((err) => {
  console.error("Runner error:", err);
  process.exitCode = 1;
});
