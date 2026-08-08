/**
 * Geräteliste + Playwright-Runner für die mobile Adaption.
 *
 * Warum als Datei im Repo und nicht ad hoc im Terminal: jede Iteration des
 * Gauntlet-Loops muss dieselben Viewports fahren, sonst bedeutet „grün" über
 * die Iterationen hinweg nicht dasselbe. Die Höhen sind die echten
 * Gerätehöhen — die 660px-Schwelle und die svh-Bühnen hängen daran, eine
 * Standardhöhe würde beides verfälschen.
 *
 * Aufruf:
 *   node scripts/mobile-matrix.mjs shots  <outDir>   Screenshots aller Profile
 *   node scripts/mobile-matrix.mjs bytes             Transferbudget 390x844
 *   node scripts/mobile-matrix.mjs overflow          Horizontaler Overflow
 *   node scripts/mobile-matrix.mjs perf              fps unter 4x CPU-Throttle
 *   node scripts/mobile-matrix.mjs vitals            LCP / CLS (Ersatzmessung)
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";

/** Telefone — nur hochkant. Das Querformat ist per Scope-Entscheid draussen. */
export const PHONES = [
  { name: "min-320", width: 320, height: 568, touch: true },
  { name: "iphone-se3", width: 375, height: 667, touch: true },
  { name: "iphone-16e", width: 390, height: 844, touch: true },
  { name: "iphone-16", width: 393, height: 852, touch: true },
  { name: "iphone-16-pro", width: 402, height: 874, touch: true },
  { name: "iphone-16-plus", width: 430, height: 932, touch: true },
  { name: "iphone-16-pro-max", width: 440, height: 956, touch: true },
];

/** iPads hochkant. 1024x1366 trifft die Pin-Grenze auf den Pixel. */
export const TABLETS_PORTRAIT = [
  { name: "ipad-mini-hoch", width: 744, height: 1133, touch: true },
  { name: "ipad-a16-hoch", width: 820, height: 1180, touch: true },
  { name: "ipad-pro11-hoch", width: 834, height: 1210, touch: true },
  { name: "ipad-pro13-hoch", width: 1024, height: 1366, touch: true },
];

/** iPads quer — laufen im Desktop-Modus, aber ohne Maus. */
export const TABLETS_LANDSCAPE = [
  { name: "ipad-mini-quer", width: 1133, height: 744, touch: true },
  { name: "ipad-a16-quer", width: 1180, height: 820, touch: true },
  { name: "ipad-pro11-quer", width: 1210, height: 834, touch: true },
  { name: "ipad-pro13-quer", width: 1366, height: 1024, touch: true },
];

/** Die unantastbare Zone: Breite UND feiner Zeiger.
 *  desktop-900 ist kein Zielgeraet, sondern ein Waechter: seit der Hero seine
 *  eigene 768er-Grenze aufgegeben hat und PIN_QUERY/STACK_QUERY benutzt, faellt
 *  ein Mausfenster unter 1024px in den mobilen Arm. Das ist gewollt und
 *  konsistent mit allen anderen Sections — aber es ist eine Verhaltensaenderung
 *  auf einem Mausgeraet, und die soll sichtbar sein statt unbemerkt. */
export const DESKTOP = [
  { name: "desktop-1440", width: 1440, height: 900, touch: false },
  { name: "desktop-900", width: 900, height: 900, touch: false },
];

export const ALL = [
  ...PHONES,
  ...TABLETS_PORTRAIT,
  ...TABLETS_LANDSCAPE,
  ...DESKTOP,
];

/** Pflichtprofile für Gate 4 (Performance). */
export const PERF_PROFILES = [
  { name: "iphone-16", width: 393, height: 852, touch: true },
  { name: "ipad-a16-hoch", width: 820, height: 1180, touch: true },
  { name: "ipad-pro13-hoch", width: 1024, height: 1366, touch: true },
  { name: "ipad-pro13-quer", width: 1366, height: 1024, touch: true },
];

/** Transferbudget aus bd49d0b, gemessen auf 390x844. */
export const BUDGET = { initialKB: 323, fullScrollKB: 451 };

async function newPage(browser, device) {
  const context = await browser.newContext({
    viewport: { width: device.width, height: device.height },
    hasTouch: device.touch,
    isMobile: device.touch,
    deviceScaleFactor: device.touch ? 3 : 2,
  });
  const page = await context.newPage();

  // Wächter gegen die teuerste Fehlmessung dieses Projekts: läuft noch ein
  // Server aus einem früheren Build auf Port 3000, liefert er HTML, die auf
  // CSS-Dateien zeigt, die der neue Build überschrieben hat. Die Seite kommt
  // dann mit Status 200, aber OHNE Styles — Pins weg, Bühnen ohne Höhe, die
  // Seite doppelt so lang. Das sieht wie eine massive Desktop-Regression aus
  // und ist keine. Lieber laut abbrechen als leise Unsinn messen.
  page.on("response", (res) => {
    if (res.request().resourceType() === "stylesheet" && !res.ok()) {
      throw new Error(
        `Stylesheet ${res.url()} kam mit ${res.status()} zurück. ` +
          `Läuft ein Server aus einem alten Build? → lsof -ti:3000 | xargs kill -9`,
      );
    }
  });

  return { context, page };
}

/** Scrollt die Seite in Schritten durch und lässt Animationen nachlaufen. */
async function scrollThrough(page, steps = 24) {
  await page.evaluate(async (n) => {
    const total = document.body.scrollHeight - window.innerHeight;
    for (let i = 0; i <= n; i++) {
      window.scrollTo(0, (total * i) / n);
      await new Promise((r) => setTimeout(r, 120));
    }
  }, steps);
  await page.waitForTimeout(400);
}

/** DEVICES=desktop-1440,iphone-16 grenzt den Lauf auf einzelne Profile ein. */
function selected() {
  const only = process.env.DEVICES?.split(",").map((s) => s.trim());
  return only?.length ? ALL.filter((d) => only.includes(d.name)) : ALL;
}

/**
 * Zeitbasierte Bewegung für die Aufnahme stilllegen.
 *
 * Ohne das ist der Vergleich zweier Läufe nicht aussagefähig. Nachgemessen:
 * 1.88 mittlerer Kanalabstand zwischen zwei Aufnahmen DESSELBEN Builds, und
 * 1.65 zwischen der Baseline und einer frisch gebauten, unveränderten Quelle.
 * Ein Grenzwert von 1.0 ist damit nicht erreichbar — und eine Schranke, die
 * jeder reisst, sagt nichts über Regressionen.
 *
 * Verursacher sind nicht die Animationen der Seite an sich: die GSAP-Bewegungen
 * hängen am Scroll und sind deshalb schon deterministisch. Es sind die vier
 * Prozess-Clips, das Filmkorn (8s) und das Kunden-Marquee (50s) — alle drei
 * zeitbasiert und in jedem Lauf an anderer Stelle.
 *
 * `animation: none` statt `animation-play-state: paused`: pausiert hält die
 * Animation an einer beliebigen Stelle fest, none setzt sie auf ihren
 * Ruhezustand zurück — und der ist in jedem Lauf derselbe.
 */
async function freeze(page) {
  await page.evaluate(() => {
    for (const v of document.querySelectorAll("video")) {
      v.pause();
      try {
        v.currentTime = 0;
      } catch {
        /* Clip noch nicht dekodiert — dann steht ohnehin das Standbild */
      }
    }
    if (!document.getElementById("shot-freeze")) {
      const el = document.createElement("style");
      el.id = "shot-freeze";
      el.textContent =
        "*, *::before, *::after { animation: none !important; transition: none !important; }";
      document.head.appendChild(el);
    }
  });
  await page.waitForTimeout(150);
}

async function shots(outDir) {
  mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  for (const device of selected()) {
    const { context, page } = await newPage(browser, device);
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(2200); // Entry-Timeline (delay 0.4 + 1.4s)
    const total = await page.evaluate(
      () => document.body.scrollHeight - window.innerHeight,
    );
    // Sieben Halte über die Seite: je einer pro Section.
    for (let i = 0; i < 7; i++) {
      await page.evaluate((y) => window.scrollTo(0, y), (total * i) / 6);
      await page.waitForTimeout(700);
      await freeze(page);
      await page.screenshot({
        path: join(outDir, `${device.name}-${i}.png`),
      });
    }
    await context.close();
  }
  await browser.close();
  console.log(`shots → ${outDir}`);
}

/**
 * Transferbudget auf 390x844.
 *
 * Zwei Entscheidungen, die die Messung erst reproduzierbar machen:
 *  - `waitUntil: "load"` plus feste Nachlaufzeit statt `networkidle`. Die Seite
 *    lädt Medien per IntersectionObserver nach, `networkidle` feuert deshalb je
 *    nach Timing an ganz verschiedenen Stellen — zwei Läufe hintereinander
 *    ergaben 733 und 2359 KB für denselben Zustand.
 *  - Deduplizierung nach URL. Die Prozess-Clips kommen als Range-Requests und
 *    tauchen sonst mehrfach in der Summe auf.
 */
async function bytes() {
  const browser = await chromium.launch();
  const device = { name: "iphone-16e", width: 390, height: 844, touch: true };
  const { context, page } = await newPage(browser, device);

  /** URL → grösster gesehener Betrag (Range-Requests zählen einmal). */
  const seen = new Map();
  page.on("response", async (res) => {
    const len = res.headers()["content-length"];
    let n = 0;
    if (len) n = Number(len);
    else {
      try {
        n = (await res.body()).length;
      } catch {
        return; // Redirect oder abgebrochen
      }
    }
    const url = res.url();
    seen.set(url, Math.max(seen.get(url) || 0, n));
  });

  const sum = () => [...seen.values()].reduce((a, b) => a + b, 0);

  await page.goto(BASE, { waitUntil: "load" });
  await page.waitForTimeout(2500);
  const initialKB = Math.round(sum() / 1024);

  await scrollThrough(page);
  await page.waitForTimeout(2500);
  const fullKB = Math.round(sum() / 1024);

  const top = [...seen.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(
      ([u, n]) =>
        `  ${String(Math.round(n / 1024)).padStart(5)} KB  ${u.replace(BASE, "")}`,
    );

  await context.close();
  await browser.close();

  console.log(`Aufruf      ${initialKB} KB`);
  console.log(`Voll-Scroll ${fullKB} KB`);
  console.log(`\nGrösste Einzelposten:\n${top.join("\n")}`);
}

/**
 * Was lädt auf 390x844, BEVOR der Nutzer scrollt — und welches <img> im DOM
 * steht wo. Die Spalte `top` ist die Position relativ zum 844px hohen Fenster:
 * alles mit vierstelligem top ist weit unter der Falte und hat nichts im
 * Erstaufruf zu suchen.
 */
async function assets() {
  const browser = await chromium.launch();
  const { context, page } = await newPage(browser, {
    width: 390,
    height: 844,
    touch: true,
  });

  const seen = new Map();
  page.on("response", async (res) => {
    const len = res.headers()["content-length"];
    let n = 0;
    if (len) n = Number(len);
    else {
      try {
        n = (await res.body()).length;
      } catch {
        return;
      }
    }
    seen.set(res.url(), Math.max(seen.get(res.url()) || 0, n));
  });

  await page.goto(BASE, { waitUntil: "load" });
  await page.waitForTimeout(2500);

  const imgs = [...seen.entries()]
    .filter(([u]) => /\.(webp|png|jpe?g|avif)|_next\/image/.test(u))
    .sort((a, b) => b[1] - a[1]);
  const totalKB = Math.round(imgs.reduce((a, x) => a + x[1], 0) / 1024);
  console.log(`Bilder vor jedem Scroll: ${totalKB} KB\n`);
  for (const [u, n] of imgs.slice(0, 12)) {
    console.log(
      `  ${String(Math.round(n / 1024)).padStart(5)} KB  ` +
        decodeURIComponent(u.replace(BASE, "")).slice(0, 92),
    );
  }

  const dom = await page.evaluate(() =>
    [...document.querySelectorAll("img")]
      .map((i) => ({
        src: (i.currentSrc || i.src).split("/").pop().slice(0, 42),
        loading: i.loading,
        top: Math.round(i.getBoundingClientRect().top),
      }))
      .filter((x) => x.src),
  );
  console.log("\n<img> im DOM (top relativ zum 844px-Fenster):");
  for (const m of dom) {
    console.log(
      `  top=${String(m.top).padStart(6)}  loading=${(m.loading || "-").padEnd(6)} ${m.src}`,
    );
  }

  await context.close();
  await browser.close();
}

/**
 * Bildvergleich zweier Screenshot-Ordner.
 *
 * Ein Hash-Vergleich ist hier wertlos: Filmkorn (8s), Marquee (50s) und der
 * Lampen-Sinus (8s) laufen dauerhaft, zwei Aufnahmen DESSELBEN Codes sind
 * deshalb nie byte-gleich. Verglichen wird daher der mittlere Kanalabstand und
 * der Anteil deutlich abweichender Pixel — und beides gegen einen Rauschboden,
 * den man mit zwei Läufen auf unverändertem Code selbst misst.
 *
 *   node scripts/mobile-matrix.mjs diff .baseline .after [namensprefix]
 */
async function diff(dirA, dirB, prefix) {
  const { default: sharp } = await import("sharp");
  const { readdirSync } = await import("node:fs");

  const files = readdirSync(dirA)
    .filter((f) => f.endsWith(".png") && (!prefix || f.startsWith(prefix)))
    .sort();

  let worstMean = 0;
  for (const f of files) {
    try {
      const [A, B] = await Promise.all([
        sharp(join(dirA, f)).raw().toBuffer(),
        sharp(join(dirB, f)).raw().toBuffer(),
      ]);
      if (A.length !== B.length) {
        console.log(`  ${f.padEnd(24)} MASSE VERSCHIEDEN`);
        worstMean = Infinity;
        continue;
      }
      let sum = 0;
      let changed = 0;
      for (let i = 0; i < A.length; i++) {
        const d = Math.abs(A[i] - B[i]);
        sum += d;
        if (d > 8) changed++;
      }
      const mean = sum / A.length;
      worstMean = Math.max(worstMean, mean);
      console.log(
        `  ${f.padEnd(24)} mean=${mean.toFixed(2).padStart(6)}  ` +
          `abweichende Pixel=${((100 * changed) / A.length).toFixed(2).padStart(6)}%`,
      );
    } catch (e) {
      console.log(`  ${f.padEnd(24)} ${String(e.message).slice(0, 50)}`);
    }
  }
  console.log(`\nGrösster mittlerer Abstand: ${worstMean.toFixed(2)}`);
}

async function overflow() {
  const browser = await chromium.launch();
  let bad = 0;
  for (const device of selected()) {
    const { context, page } = await newPage(browser, device);
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    await scrollThrough(page, 12);
    const res = await page.evaluate(() => {
      const de = document.documentElement;
      const over = [];
      if (de.scrollWidth > de.clientWidth + 1) {
        for (const el of document.querySelectorAll("*")) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          if (r.right > de.clientWidth + 1 || r.left < -1) {
            over.push(
              `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)}`,
            );
            if (over.length > 4) break;
          }
        }
      }
      return { doc: de.scrollWidth, client: de.clientWidth, over };
    });
    const ok = res.doc <= res.client + 1;
    if (!ok) bad++;
    console.log(
      `${ok ? "OK " : "ROT"} ${device.name.padEnd(20)} ${res.doc}/${res.client}` +
        (res.over.length ? `  ${res.over.join(" | ")}` : ""),
    );
    await context.close();
  }
  await browser.close();
  if (bad) process.exitCode = 1;
}

async function perf() {
  const browser = await chromium.launch();
  for (const device of PERF_PROFILES) {
    const { context, page } = await newPage(browser, device);
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    const frames = await page.evaluate(async () => {
      const stamps = [];
      let running = true;
      const tick = (t) => {
        stamps.push(t);
        if (running) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);

      const total = document.body.scrollHeight - window.innerHeight;
      const start = performance.now();
      // Gleichmässige Fahrt über die ganze Seite, ~6s.
      while (performance.now() - start < 6000) {
        const p = (performance.now() - start) / 6000;
        window.scrollTo(0, total * p);
        await new Promise((r) => requestAnimationFrame(r));
      }
      running = false;
      return stamps;
    });

    const deltas = [];
    for (let i = 1; i < frames.length; i++)
      deltas.push(frames[i] - frames[i - 1]);
    deltas.sort((a, b) => a - b);
    const avg = deltas.reduce((a, b) => a + b, 0) / deltas.length;
    const p95 = deltas[Math.floor(deltas.length * 0.95)] || 0;
    const fpsAvg = 1000 / avg;
    const fpsLow = 1000 / p95;
    const ok = fpsLow >= 50;
    console.log(
      `${ok ? "OK " : "ROT"} ${device.name.padEnd(20)} ` +
        `avg ${fpsAvg.toFixed(0)}fps  p95-worst ${fpsLow.toFixed(0)}fps`,
    );
    await context.close();
  }
  await browser.close();
}

async function vitals() {
  const browser = await chromium.launch();
  // Mit DEVICES=... lässt sich gezielt ein einzelnes Profil nachmessen.
  const profiles = process.env.DEVICES ? selected() : PERF_PROFILES;
  for (const device of profiles) {
    const { context, page } = await newPage(browser, device);
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    await scrollThrough(page, 16);
    const v = await page.evaluate(
      () =>
        new Promise((resolve) => {
          let cls = 0;
          let lcp = 0;
          new PerformanceObserver((l) => {
            for (const e of l.getEntries())
              if (!e.hadRecentInput) cls += e.value;
          }).observe({ type: "layout-shift", buffered: true });
          new PerformanceObserver((l) => {
            const es = l.getEntries();
            lcp = es[es.length - 1]?.startTime || 0;
          }).observe({ type: "largest-contentful-paint", buffered: true });
          setTimeout(() => resolve({ cls, lcp }), 600);
        }),
    );
    const ok = v.cls < 0.1;
    console.log(
      `${ok ? "OK " : "ROT"} ${device.name.padEnd(20)} ` +
        `CLS ${v.cls.toFixed(4)}  LCP ${Math.round(v.lcp)}ms`,
    );
    await context.close();
  }
  await browser.close();
  console.log(
    "\nHinweis: Ersatzmessung per PerformanceObserver, KEIN Lighthouse-Score.",
  );
}

const [cmd, arg, argB, argC] = process.argv.slice(2);
const tasks = {
  shots: () => shots(arg || ".shots"),
  diff: () => diff(arg, argB, argC),
  bytes,
  assets,
  overflow,
  perf,
  vitals,
};
if (!tasks[cmd]) {
  console.error(
    "Aufruf: node scripts/mobile-matrix.mjs " +
      "shots <dir> | diff <a> <b> [prefix] | bytes | assets | overflow | perf | vitals",
  );
  process.exit(2);
}
await tasks[cmd]();
