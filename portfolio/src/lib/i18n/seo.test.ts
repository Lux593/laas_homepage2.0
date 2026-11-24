import test from "node:test";
import assert from "node:assert/strict";

import { PAGE_PATHS, absoluteUrl, buildAlternates } from "./seo.ts";

test("buildAlternates home en", () =>
  assert.deepEqual(buildAlternates("/", "en"), {
    canonical: "/en",
    languages: { de: "/", en: "/en", "x-default": "/" },
  }));

test("buildAlternates impressum de", () =>
  assert.deepEqual(buildAlternates("/impressum", "de"), {
    canonical: "/impressum",
    languages: {
      de: "/impressum",
      en: "/en/impressum",
      "x-default": "/impressum",
    },
  }));

test("buildAlternates: x-default ist immer die deutsche Fassung", () => {
  for (const path of PAGE_PATHS) {
    const { languages } = buildAlternates(path, "en");
    assert.equal(languages["x-default"], languages.de);
  }
});

test("PAGE_PATHS: Startseite und die drei Rechtsseiten", () => {
  assert.deepEqual(PAGE_PATHS, ["/", "/impressum", "/datenschutz", "/agb"]);
});

test("absoluteUrl: Startseite ohne Schrägstrich, Unterseiten mit Pfad", () => {
  assert.equal(absoluteUrl("/"), "https://laas.website");
  assert.equal(absoluteUrl("/en"), "https://laas.website/en");
  assert.equal(
    absoluteUrl("/en/impressum"),
    "https://laas.website/en/impressum",
  );
});
