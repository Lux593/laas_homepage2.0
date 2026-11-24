import test from "node:test";
import assert from "node:assert/strict";

import { format, formatDate } from "./format.ts";

test("format", () => {
  assert.equal(
    format("Aufnahme {current} von {total}", { current: 2, total: 6 }),
    "Aufnahme 2 von 6",
  );
  assert.equal(format("{a} {b}", { a: "x" }), "x {b}");
});

test("formatDate", () => {
  assert.equal(formatDate("2026-08-12", "de"), "12. August 2026");
  assert.equal(formatDate("2026-08-12", "en"), "August 12, 2026");
});
