/**
 * Prüfwerkzeug für die zweisprachige Seite (Deutsch ohne Präfix, Englisch
 * unter /en). Läuft gegen einen laufenden Server, nicht gegen den Code.
 *
 * Warum gegen den Server: ob eine Seite die richtige Sprache, den richtigen
 * Status und die richtigen Metadaten ausliefert, entscheiden Proxy, Routing
 * und Rendering zusammen. Das sieht nur, wer die fertige Antwort liest.
 *
 * Aufruf (Server vorher mit `pnpm build && pnpm start` starten):
 *   node scripts/check-i18n.mjs routing            Status, Location, lang je Pfad
 *   node scripts/check-i18n.mjs copy [pfad…]       deutsche Wörter auf EN-Seiten
 *   node scripts/check-i18n.mjs seo                canonical, hreflang, og:locale, Sitemap
 *   node scripts/check-i18n.mjs snapshot           DE-Text nach .i18n-baseline/de.json
 *   node scripts/check-i18n.mjs compare            DE-Text gegen die Baseline prüfen
 *
 * Exit-Code 1 bei jedem Fehlschlag, eine Zeile pro Fehler. BASE_URL setzt den
 * Server (Default http://localhost:3000).
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(
  /\/$/,
  "",
);
const SITE = "https://laas.website";
const BASELINE = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  ".i18n-baseline",
  "de.json",
);

/* -------------------------------------------------------------------------- */
/* Sollzustand                                                                */
/* -------------------------------------------------------------------------- */

const DE_PAGES = ["/", "/impressum", "/datenschutz", "/agb"];
const EN_PAGES = ["/en", "/en/impressum", "/en/datenschutz", "/en/agb"];

/** Jede Zeile ist eine Erwartung an genau einen Pfad. `location`/`lang` sind
 *  optional: was fehlt, wird nicht geprüft. */
const ROUTES = [
  ...DE_PAGES.map((path) => ({ path, status: 200, lang: "de" })),
  ...EN_PAGES.map((path) => ({ path, status: 200, lang: "en" })),
  { path: "/de", status: 301, location: "/" },
  { path: "/de/impressum", status: 301, location: "/impressum" },
  { path: "/de?x=1", status: 301, location: "/?x=1" },
  { path: "/en/", status: 308, location: "/en" },
  { path: "/gibtsnicht", status: 404, lang: "de", styled: true },
  { path: "/wp-login.php", status: 404, lang: "de", styled: true },
  { path: "/a/b.php", status: 404, lang: "de", styled: true },
  { path: "/en/gibtsnicht", status: 404, lang: "en", styled: true },
  { path: "/sitemap.xml", status: 200 },
  { path: "/favicon.ico", status: 200 },
  { path: "/og-image.jpg", status: 200 },
  { path: "/laas-logo.svg", status: 200 },
];

/** Seiten, deren DE-Text die Baseline festhält (die 404 gehört dazu). */
const SNAPSHOT_PAGES = [
  "/",
  "/impressum",
  "/datenschutz",
  "/agb",
  "/gibtsnicht",
];

const COPY_DEFAULT_PAGES = [
  "/en",
  "/en/gibtsnicht",
  "/en/impressum",
  "/en/datenschutz",
  "/en/agb",
];

/** Deutsche Funktions- und Seitenwörter, die auf einer EN-Seite nichts
 *  verloren haben. Groß-/Kleinschreibung egal, nur ganze Wörter. Wörter mit
 *  Umlaut oder ß braucht die Liste nicht, die fängt eine eigene Regel. */
const GERMAN_WORDS = [
  "und",
  "der",
  "das",
  "ich",
  "nicht",
  "mit",
  "für",
  "auf",
  "ist",
  "ein",
  "eine",
  "wir",
  "dein",
  "deine",
  "dich",
  "dir",
  "oder",
  "wie",
  "zum",
  "zur",
  "über",
  "noch",
  "werden",
  "Seite",
  "Startseite",
  "Projekt",
  "Projekte",
  "Leistungen",
  "Kontakt",
  "Stand",
  "Inhalt",
];

/** Phrasen, die auf EN-Seiten deutsch bleiben dürfen. Nur Eigennamen und
 *  Gesetzesbezeichnungen, nie Fließtext. Vor der Wortprüfung entfernt. */
const ALLOWED_PHRASES = [
  // Kunde, Firmenname mit Umlaut
  "Feldschlösschen Getränke AG",
  // Ortsname in der Anschrift
  "Weil am Rhein",
  // Name der Aufsichtsbehörde im Datenschutz-Kapitel
  "Landesbeauftragter für den Datenschutz und die Informationsfreiheit Baden-Württemberg",
  // Kundenname
  "Intersport Gemo",
  // Kundenname
  "La Cilentana Pastamanufaktur",
  // Firmenname des Betreibers
  "LAAS – Luca Arnoldi App Solutions",
  // Markenname
  "Luca Arnoldi App Studio",
  // Firmenname des Arbeitgebers
  "mobileObjects GmbH",
];

/** Attribute, deren Wert sichtbarer oder vorgelesener Text ist. */
const TEXT_ATTRS = ["aria-label", "alt", "title", "placeholder"];

/** <meta>-Tags, deren `content` Text für Suchergebnisse und Link-Vorschauen
 *  ist: [Attribut, das den Tag benennt, sein Wert]. Steht deutscher SEO-Text
 *  auf einer EN-Seite, sieht ihn kein Besucher, aber Google und jede
 *  Link-Vorschau. */
const META_TEXT = [
  ["name", "description"],
  ["property", "og:title"],
  ["property", "og:description"],
  ["name", "twitter:title"],
  ["name", "twitter:description"],
];

/* -------------------------------------------------------------------------- */
/* Abruf                                                                      */
/* -------------------------------------------------------------------------- */

/** Holt einen Pfad ohne Redirects zu folgen — die Weiterleitung ist selbst
 *  der Prüfgegenstand. */
async function load(path) {
  const res = await fetch(BASE + path, {
    redirect: "manual",
    signal: AbortSignal.timeout(30_000),
  });
  const body = await res.text();
  const location = res.headers.get("location");
  return {
    status: res.status,
    // Location kann absolut oder relativ sein; verglichen wird Pfad + Query.
    location: location
      ? (() => {
          const u = new URL(location, BASE);
          return u.pathname + u.search;
        })()
      : null,
    body,
    lang: /<html\b[^>]*\blang="([^"]*)"/i.exec(body)?.[1] ?? null,
  };
}

/* -------------------------------------------------------------------------- */
/* HTML lesen                                                                 */
/* -------------------------------------------------------------------------- */

const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
]);

const NAMED_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") {
      const code =
        e[1].toLowerCase() === "x"
          ? parseInt(e.slice(2), 16)
          : Number(e.slice(1));
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return NAMED_ENTITIES[e.toLowerCase()] ?? m;
  });
}

/** Attribute eines Start-Tags als Objekt (Namen klein, Werte dekodiert). */
function parseAttrs(tag) {
  const attrs = {};
  for (const m of tag.matchAll(
    /([a-zA-Z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g,
  )) {
    // Das erste Match ist der Tag-Name selbst; er hat keinen Wert und stört nicht.
    attrs[m[1].toLowerCase()] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? "");
  }
  return attrs;
}

/** Entfernt jedes Element samt Inhalt, dessen Start-Tag `attr` trägt. */
function removeByAttr(html, attr) {
  const start = new RegExp(
    `<([a-zA-Z][\\w:-]*)\\b[^>]*\\s${attr}(?=[\\s=/>])[^>]*>`,
    "i",
  );
  for (;;) {
    const m = start.exec(html);
    if (!m) return html;
    const tag = m[1].toLowerCase();
    let end = m.index + m[0].length;
    if (!VOID_TAGS.has(tag) && !m[0].endsWith("/>")) {
      // Passendes schließendes Tag über die Verschachtelung finden.
      const same = new RegExp(`<(/?)${tag}\\b[^>]*>`, "gi");
      same.lastIndex = end;
      let depth = 1;
      for (let t = same.exec(html); t; t = same.exec(html)) {
        if (t[0].endsWith("/>")) continue;
        depth += t[1] ? -1 : 1;
        if (depth === 0) {
          end = same.lastIndex;
          break;
        }
      }
    }
    html = html.slice(0, m.index) + " " + html.slice(end);
  }
}

/**
 * Sichtbarer Text einer Seite als Liste in Dokumentreihenfolge.
 *
 * Jeder Eintrag ist ein Textknoten, der Wert eines der TEXT_ATTRS (`@alt: …`)
 * oder das `content` eines META_TEXT-Tags (`@meta[og:title]: …`).
 * Zeilenumbrüche innerhalb eines Knotens bleiben erhalten, weil
 * sie Teil des Textes sind: verliert ein Umzug der Texte ein `\n`, soll das
 * im Vergleich auffallen. Nur Leerzeichen-Folgen werden zusammengezogen.
 *
 * Der Sprachschalter (`data-lang-switch`) fliegt raus: er zeigt absichtlich
 * die andere Sprache und wäre auf jeder Seite ein Fund.
 */
function extractTokens(html) {
  html = html
    .replace(/<(script|style|noscript)\b[\s\S]*?<\/\1\s*>/gi, " ")
    // React trennt benachbarte Textknoten mit <!-- -->; ohne Lücke
    // zusammenziehen, so steht der Text auch im Browser.
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<!doctype[^>]*>/gi, "");
  html = removeByAttr(html, "data-lang-switch");

  const tokens = [];
  const push = (prefix, raw) => {
    const text = decodeEntities(raw)
      .replace(/[ \t\r]+/g, " ")
      .replace(/ ?\n ?/g, "\n")
      .trim();
    if (text) tokens.push(prefix + text);
  };

  let last = 0;
  for (const m of html.matchAll(/<[a-zA-Z][^>]*>|<\/[a-zA-Z][^>]*>/g)) {
    push("", html.slice(last, m.index));
    last = m.index + m[0].length;
    if (m[0][1] === "/") continue;
    const attrs = parseAttrs(m[0]);
    for (const name of TEXT_ATTRS) {
      if (attrs[name]) push(`@${name}: `, attrs[name]);
    }
    if (m[0].startsWith("<meta") && attrs.content) {
      for (const [attr, value] of META_TEXT) {
        if (attrs[attr] === value) push(`@meta[${value}]: `, attrs.content);
      }
    }
  }
  push("", html.slice(last));
  return tokens;
}

/** Text zum Durchsuchen: Attribut-Kennungen weg, alles auf einer Zeile. */
function searchableText(tokens) {
  return tokens
    .map((t) => t.replace(/^@[\w-]+(?:\[[^\]]+\])?: /, ""))
    .join(" ")
    .replace(/\s+/g, " ");
}

/** `id`s aller <section> in Dokumentreihenfolge. */
function sectionIds(html) {
  return [...html.matchAll(/<section\b[^>]*\bid="([^"]*)"/gi)].map((m) => m[1]);
}

/* -------------------------------------------------------------------------- */
/* Befehle                                                                    */
/* -------------------------------------------------------------------------- */

/** Jede Prüfung meldet über `fail(…)`; der Befehl entscheidet am Ende. */
function reporter(name) {
  const errors = [];
  let checks = 0;
  return {
    check() {
      checks++;
    },
    fail(msg) {
      errors.push(`FAIL ${name} ${msg}`);
    },
    finish(extra = "") {
      for (const e of errors) console.log(e);
      console.log(
        errors.length
          ? `${name}: ${errors.length} Fehler bei ${checks} Prüfungen`
          : `${name}: ok (${checks} Prüfungen)${extra}`,
      );
      return errors.length === 0;
    },
  };
}

async function routing() {
  const r = reporter("routing");
  for (const want of ROUTES) {
    const got = await load(want.path);
    r.check();
    if (got.status !== want.status) {
      r.fail(`${want.path}: Status ${got.status}, erwartet ${want.status}`);
      continue; // alles Weitere wäre Folgefehler
    }
    if (want.location !== undefined && got.location !== want.location) {
      r.fail(
        `${want.path}: Location ${got.location ?? "(keine)"}, erwartet ${want.location}`,
      );
    }
    if (want.lang !== undefined && got.lang !== want.lang) {
      r.fail(
        `${want.path}: lang="${got.lang ?? "(keins)"}", erwartet "${want.lang}"`,
      );
    }
    // Gestylte 404 statt Nexts Default-Seite: die eigene Seite lädt ein
    // Stylesheet, die ungestylte nicht.
    if (want.styled && !/<link\b[^>]*\brel="stylesheet"/i.test(got.body)) {
      r.fail(`${want.path}: 404 ohne Stylesheet (Nexts Default-Seite?)`);
    }
  }
  return r.finish();
}

/** Erwarteter Status eines Pfads: laut Routing-Tabelle, sonst 200. */
function expectedStatus(path) {
  return ROUTES.find((x) => x.path === path)?.status ?? 200;
}

/** Wörter mit Umlaut/ß plus die Wörter aus GERMAN_WORDS, jeweils mit Kontext. */
function findGermanWords(text) {
  let rest = text;
  for (const phrase of ALLOWED_PHRASES) rest = rest.split(phrase).join(" ");

  const hits = new Map(); // Wort (klein) → { count, context }
  const add = (word, index) => {
    const key = word.toLowerCase();
    const hit = hits.get(key);
    if (hit) {
      hit.count++;
      return;
    }
    const ctx = rest
      .slice(Math.max(0, index - 24), index + word.length + 24)
      .trim();
    hits.set(key, { count: 1, context: ctx });
  };

  for (const m of rest.matchAll(/[\p{L}]*[äöüÄÖÜß][\p{L}]*/gu))
    add(m[0], m.index);
  // Wörter mit Umlaut/ß hat die erste Regel schon; hier nur der Rest, sonst
  // würde "über" doppelt gezählt.
  const list = GERMAN_WORDS.filter((w) => !/[äöüÄÖÜß]/.test(w)).join("|");
  const words = new RegExp(`(?<![\\p{L}])(?:${list})(?![\\p{L}])`, "giu");
  for (const m of rest.matchAll(words)) add(m[0], m.index);
  return hits;
}

async function copy(args) {
  const paths = args.length ? args : COPY_DEFAULT_PAGES;
  const r = reporter("copy");
  for (const path of paths) {
    const page = await load(path);
    r.check();
    const want = expectedStatus(path);
    if (page.status !== want) {
      r.fail(
        `${path}: Status ${page.status}, erwartet ${want} (Text dieser Antwort sagt nichts)`,
      );
      continue;
    }

    const text = searchableText(extractTokens(page.body));
    for (const [word, { count, context }] of findGermanWords(text)) {
      r.fail(`${path}: deutsches Wort "${word}" (${count}x) in "…${context}…"`);
    }

    // Rechtsseiten: dieselben Kapitel wie das deutsche Original, sonst
    // trägt ein Hash beim Sprachwechsel nicht.
    const slug = /^\/en\/([^/]+)$/.exec(path)?.[1];
    if (slug && want === 200) {
      const de = await load(`/${slug}`);
      const idsDe = sectionIds(de.body);
      const idsEn = sectionIds(page.body);
      if (de.status === 200 && idsDe.join() !== idsEn.join()) {
        r.fail(
          `${path}: Section-IDs weichen ab (DE: ${idsDe.join(",") || "-"} | EN: ${idsEn.join(",") || "-"})`,
        );
      }
    }
  }
  return r.finish();
}

/** Vergleichsform für URLs: ohne abschließenden Schrägstrich, damit
 *  `https://laas.website` und `https://laas.website/` dasselbe sind. */
const normUrl = (u) => u.replace(/\/+$/, "");

/** DE- und EN-Pfad zu einem Pfad der Routing-Tabelle. */
function pathPair(path) {
  const de =
    path === "/en" ? "/" : path.startsWith("/en/") ? path.slice(3) : path;
  return { de, en: de === "/" ? "/en" : `/en${de}` };
}

function linkTags(html) {
  return [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => parseAttrs(m[0]));
}

async function seo() {
  const r = reporter("seo");
  const pages = ROUTES.filter((x) => x.status === 200 && x.lang);

  for (const { path, lang } of pages) {
    const page = await load(path);
    r.check();
    if (page.status !== 200) {
      r.fail(`${path}: Status ${page.status}, kein SEO-Check möglich`);
      continue;
    }
    const { de, en } = pathPair(path);
    const links = linkTags(page.body);

    const canon = links.filter((l) => l.rel === "canonical");
    if (canon.length !== 1) {
      r.fail(`${path}: ${canon.length} canonical-Links, erwartet genau 1`);
    } else if (normUrl(canon[0].href ?? "") !== normUrl(SITE + path)) {
      r.fail(`${path}: canonical ${canon[0].href}, erwartet ${SITE}${path}`);
    }

    const alt = links.filter((l) => l.rel === "alternate" && l.hreflang);
    const expected = { de: SITE + de, en: SITE + en, "x-default": SITE + de };
    for (const [code, href] of Object.entries(expected)) {
      const found = alt.filter((l) => l.hreflang === code);
      if (found.length !== 1) {
        r.fail(`${path}: ${found.length} hreflang="${code}", erwartet genau 1`);
      } else if (normUrl(found[0].href ?? "") !== normUrl(href)) {
        r.fail(
          `${path}: hreflang="${code}" zeigt auf ${found[0].href}, erwartet ${href}`,
        );
      }
    }
    for (const l of alt) {
      if (!(l.hreflang in expected))
        r.fail(`${path}: unerwartetes hreflang="${l.hreflang}"`);
    }

    const og = [...page.body.matchAll(/<meta\b[^>]*>/gi)]
      .map((m) => parseAttrs(m[0]))
      .filter((m) => m.property === "og:locale");
    const wantOg = lang === "de" ? "de_DE" : "en_US";
    if (og.length !== 1 || og[0].content !== wantOg) {
      r.fail(
        `${path}: og:locale ${og.map((m) => m.content).join(",") || "(keins)"}, erwartet ${wantOg}`,
      );
    }
  }

  // Sitemap: jede der acht Seiten mit beiden Sprachvarianten.
  const map = await load("/sitemap.xml");
  r.check();
  if (map.status !== 200) {
    r.fail(`/sitemap.xml: Status ${map.status}, erwartet 200`);
  } else {
    const entries = [...map.body.matchAll(/<url>([\s\S]*?)<\/url>/gi)].map(
      (m) => ({
        loc: /<loc>\s*([^<\s]+)\s*<\/loc>/i.exec(m[1])?.[1] ?? "",
        alts: [...m[1].matchAll(/<xhtml:link\b[^>]*>/gi)].map((a) =>
          parseAttrs(a[0]),
        ),
      }),
    );
    for (const { path } of pages) {
      const entry = entries.find(
        (e) => normUrl(e.loc) === normUrl(SITE + path),
      );
      if (!entry) {
        r.fail(`/sitemap.xml: <loc> für ${path} fehlt`);
        continue;
      }
      const { de, en } = pathPair(path);
      for (const [code, p] of [
        ["de", de],
        ["en", en],
      ]) {
        const a = entry.alts.find((x) => x.hreflang === code);
        if (!a) r.fail(`/sitemap.xml: ${path} ohne hreflang="${code}"`);
        else if (normUrl(a.href ?? "") !== normUrl(SITE + p)) {
          r.fail(
            `/sitemap.xml: ${path} hreflang="${code}" zeigt auf ${a.href}, erwartet ${SITE}${p}`,
          );
        }
      }
    }
  }
  return r.finish();
}

/** Text einer Seite wie in der Baseline abgelegt. */
async function pageRecord(path) {
  const page = await load(path);
  return { status: page.status, lines: extractTokens(page.body) };
}

async function snapshot() {
  const r = reporter("snapshot");
  const out = {};
  for (const path of SNAPSHOT_PAGES) {
    out[path] = await pageRecord(path);
    r.check();
    // Eine kaputte Antwort als Baseline festzuhalten wäre schlimmer als keine.
    if (out[path].status !== expectedStatus(path)) {
      r.fail(
        `${path}: Status ${out[path].status}, erwartet ${expectedStatus(path)}`,
      );
    }
    if (out[path].lines.length === 0) r.fail(`${path}: kein Text gefunden`);
  }
  mkdirSync(dirname(BASELINE), { recursive: true });
  writeFileSync(BASELINE, JSON.stringify(out, null, 2) + "\n");
  const summary = SNAPSHOT_PAGES.map((p) => `${p}=${out[p].lines.length}`).join(
    " ",
  );
  return r.finish(
    ` → ${BASELINE.replace(process.cwd() + "/", "")} (${summary} Zeilen)`,
  );
}

/** Zeilendiff über die längste gemeinsame Teilfolge. */
function diffLines(a, b) {
  const n = a.length;
  const m = b.length;
  const lcs = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] =
        a[i] === b[j]
          ? lcs[i + 1][j + 1] + 1
          : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const out = [];
  let i = 0;
  let j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && a[i] === b[j]) {
      i++;
      j++;
    } else if (i < n && (j === m || lcs[i + 1][j] >= lcs[i][j + 1])) {
      out.push(`- ${JSON.stringify(a[i++])}`);
    } else {
      out.push(`+ ${JSON.stringify(b[j++])}`);
    }
  }
  return out;
}

const MAX_DIFF_LINES = 40;

async function compare() {
  let baseline;
  try {
    baseline = JSON.parse(readFileSync(BASELINE, "utf8"));
  } catch {
    console.log(
      `FAIL compare Baseline fehlt: erst "check:i18n snapshot" ausführen (${BASELINE})`,
    );
    return false;
  }

  const r = reporter("compare");
  for (const [path, before] of Object.entries(baseline)) {
    const now = await pageRecord(path);
    r.check();
    if (now.status !== before.status) {
      r.fail(`${path}: Status ${now.status}, Baseline ${before.status}`);
    }
    const diff = diffLines(before.lines, now.lines);
    for (const line of diff.slice(0, MAX_DIFF_LINES))
      r.fail(`${path}: ${line}`);
    if (diff.length > MAX_DIFF_LINES) {
      r.fail(`${path}: … ${diff.length - MAX_DIFF_LINES} weitere Abweichungen`);
    }
  }
  return r.finish();
}

/* -------------------------------------------------------------------------- */

const COMMANDS = { routing, copy, seo, snapshot, compare };
const [cmd, ...args] = process.argv.slice(2);

if (!COMMANDS[cmd]) {
  console.error(
    `Aufruf: node scripts/check-i18n.mjs <${Object.keys(COMMANDS).join("|")}> [pfad…]`,
  );
  process.exit(2);
}

try {
  const ok = await COMMANDS[cmd](args);
  process.exitCode = ok ? 0 : 1;
} catch (e) {
  const cause = e?.cause?.code ?? e?.cause?.message ?? e?.message;
  console.log(
    `FAIL ${cmd} Abruf gegen ${BASE} gescheitert: ${cause} (läuft der Server?)`,
  );
  process.exitCode = 1;
}
