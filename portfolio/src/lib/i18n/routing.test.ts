import test from "node:test";
import assert from "node:assert/strict";

import { resolveProxy, type ProxyDecision } from "./routing.ts";

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
