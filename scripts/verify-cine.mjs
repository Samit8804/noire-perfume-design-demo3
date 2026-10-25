/**
 * Verification for the NOIRÉ Collection cinematic 3D experience.
 * Covers: desktop choreography, mobile layout, reduced-motion fallback,
 * no-WebGL fallback, model loading, scroll reversal, and page errors.
 */
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = "http://localhost:4333";
const REPORTS_DIR = "reports";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function newPage(browser, viewport, reducedMotion = false) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  if (reducedMotion) {
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  }
  const errors = [];
  const glbs = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("response", (res) => {
    if (res.url().endsWith(".glb")) {
      glbs.push({ file: decodeURIComponent(res.url().split("/").pop() ?? ""), status: res.status() });
    }
  });
  await page.goto(BASE_URL, { waitUntil: "networkidle0", timeout: 180000 });
  await page.waitForSelector("#collection", { timeout: 45000 });
  await sleep(1200);
  return { page, errors, glbs };
}

async function stageMetrics(page) {
  return page.evaluate(() => {
    const stage = document.querySelector(".cine-stage");
    if (!stage) return null;
    return {
      top: window.scrollY + stage.getBoundingClientRect().top,
      range: Math.max(1, stage.offsetHeight - window.innerHeight),
      height: stage.offsetHeight,
    };
  });
}

async function scrollToProgress(page, metrics, progress) {
  await page.evaluate(
    (top) => window.scrollTo({ top, behavior: "instant" }),
    Math.round(metrics.top + metrics.range * progress),
  );
  await sleep(2200);
}

async function snapshot(page) {
  return page.evaluate(() => {
    const active = document.querySelector(".cine-copy-stack.is-active");
    const canvas = document.querySelector(".cine-canvas-wrapper canvas");
    return {
      active: active?.dataset.state ?? null,
      vignette: [...document.querySelectorAll(".cine-vignette")].findIndex((el) =>
        el.classList.contains("is-active"),
      ),
      canvasW: Math.round(canvas?.getBoundingClientRect().width ?? 0),
      canvasH: Math.round(canvas?.getBoundingClientRect().height ?? 0),
      loaded: document.querySelector(".cine-canvas-wrapper")?.getAttribute("data-loaded") ?? "",
      stagePresent: !!document.querySelector(".cine-stage"),
      listVisible: !!document.querySelector(".perfume-list")?.offsetParent,
      loaderChip: !!document.querySelector(".cine-model-loading"),
    };
  });
}

const STOPS = [
  { progress: 0, state: "hero" },
  { progress: 0.28, state: "noir" },
  { progress: 0.52, state: "golden-oud" },
  { progress: 0.76, state: "velvet-amber" },
  { progress: 0.98, state: "ending" },
];

async function verify3d(browser, label, viewport) {
  const { page, errors, glbs } = await newPage(browser, viewport);
  const metrics = await stageMetrics(page);
  check(`${label}: cinematic stage present`, !!metrics, metrics ? `${metrics.height}px` : "missing");
  if (!metrics) {
    await page.close();
    return;
  }

  const shots = {};
  for (const stop of STOPS) {
    await scrollToProgress(page, metrics, stop.progress);
    if (stop.progress >= 0.76) await sleep(6000);
    shots[stop.state] = await snapshot(page);
    check(`${label}: state ${stop.state}`, shots[stop.state].active === stop.state, `active=${shots[stop.state].active}`);
    await page.screenshot({ path: path.join(REPORTS_DIR, `cine-${label}-${stop.state}.png`) });
  }

  await sleep(6000);
  shots.ending = await snapshot(page);
  await page.screenshot({ path: path.join(REPORTS_DIR, `cine-${label}-ending-final.png`) });

  check(
    `${label}: canvas sized`,
    shots.hero.canvasW > 0 && shots.hero.canvasH > 0,
    `${shots.hero.canvasW}x${shots.hero.canvasH}`,
  );
  check(
    `${label}: all three models requested`,
    glbs.length === 3,
    glbs.map((g) => `${g.file}:${g.status}`).join(", ") || "none",
  );
  check(`${label}: all models 200`, glbs.length === 3 && glbs.every((g) => g.status === 200));
  check(
    `${label}: all models mounted`,
    shots.ending.loaded.split(",").filter(Boolean).length === 3,
    `loaded=${shots.ending.loaded}`,
  );
  check(`${label}: no WebGL page errors`, errors.length === 0, errors.join(" | "));

  await scrollToProgress(page, metrics, 0.28);
  const reversed = await snapshot(page);
  check(`${label}: reverse scroll returns to NOIR`, reversed.active === "noir", `active=${reversed.active}`);
  await page.screenshot({ path: path.join(REPORTS_DIR, `cine-${label}-reverse.png`) });

  await page.close();
}

async function verifyFallback(browser, label, { reducedMotion = false } = {}) {
  const { page, errors, glbs } = await newPage(browser, { width: 1440, height: 900 }, reducedMotion);
  await sleep(1500);
  const snap = await snapshot(page);
  check(`${label}: fallback list visible`, snap.listVisible, JSON.stringify({ list: snap.listVisible }));
  check(`${label}: 3D stage not mounted`, !snap.stagePresent);
  check(`${label}: no models fetched`, glbs.length === 0, `${glbs.length} request(s)`);
  check(`${label}: no page errors`, errors.length === 0, errors.join(" | "));
  await page.screenshot({ path: path.join(REPORTS_DIR, `cine-${label}.png`), fullPage: false });
  await page.close();
}

async function run() {
  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const desktop = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    protocolTimeout: 300000,
  });
  await verify3d(desktop, "desktop", { width: 1440, height: 900, deviceScaleFactor: 1 });
  await desktop.close();

  const mobile = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    protocolTimeout: 300000,
  });
  await verify3d(mobile, "mobile", { width: 390, height: 844, deviceScaleFactor: 2 });
  await mobile.close();

  const reduced = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    protocolTimeout: 300000,
  });
  await verifyFallback(reduced, "reduced-motion", { reducedMotion: true });
  await reduced.close();

  const noWebgl = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--disable-webgl",
      "--disable-dev-shm-usage",
    ],
    protocolTimeout: 300000,
  });
  await verifyFallback(noWebgl, "no-webgl");
  await noWebgl.close();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n=== ${results.length - failed.length}/${results.length} checks passed ===`);
  if (failed.length) {
    failed.forEach((r) => console.log(`FAILED: ${r.name}${r.detail ? ` — ${r.detail}` : ""}`));
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error("Verification crashed:", error);
  process.exit(1);
});
