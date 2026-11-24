import test from "node:test";
import assert from "node:assert/strict";

import {
  localeFromHeader,
  localeFromPath,
  resolveProxy,
  type ProxyDecision,
} from "./routing.ts";

const cases: [string, ProxyDecision][] = [
  ["/", { kind: "rewrite", pathname: "/de" }],
  ["/impressum", { kind: "rewrite", pathname: "/de/impressum" }],
  ["/gibtsnicht", { kind: "rewrite", pathname: "/de/gibtsnicht" }],
  ["/english", { kind: "rewrite", pathname: "/de/english" }],
  ["/deutsch", { kind: "rewrite", pathname: "/de/deutsch" }],
  ["/en", { kind: "next" }],
  ["/en/", { kind: "next" }],
  ["/en/impressum", { kind: "next" }],
  ["/de", { kind: "redirect", pathname: "/" }],
  ["/de/", { kind: "redirect", pathname: "/" }],
  ["/de/agb", { kind: "redirect", pathname: "/agb" }],
];

for (const [input, expected] of cases) {
  test(`resolveProxy ${input}`, () => {
    assert.deepEqual(resolveProxy(input), expected);
  });
}

test("resolveProxy: /de//host wird kein protokollrelativer Redirect", () => {
  assert.deepEqual(resolveProxy("/de//evil.com"), {
    kind: "redirect",
    pathname: "/evil.com",
  });
});

const localeCases: [string, "de" | "en"][] = [
  ["/", "de"],
  ["/gibtsnicht", "de"],
  ["/english", "de"],
  ["/de/impressum", "de"],
  ["/en", "en"],
  ["/en/", "en"],
  ["/en/gibtsnicht", "en"],
];

for (const [input, expected] of localeCases) {
  test(`localeFromPath ${input}`, () => {
    assert.equal(localeFromPath(input), expected);
  });
}

// Ohne Proxy (Pfade mit Endung) fehlt der Header; ein selbst gesetzter Wert
// zählt nur, wenn er genau eines der zwei Kürzel ist.
const headerCases: [string | null, "de" | "en"][] = [
  [null, "de"],
  ["", "de"],
  ["de", "de"],
  ["en", "en"],
  ["EN", "de"],
  ["fr", "de"],
  ["en-US", "de"],
];

for (const [input, expected] of headerCases) {
  test(`localeFromHeader ${JSON.stringify(input)}`, () => {
    assert.equal(localeFromHeader(input), expected);
  });
}
