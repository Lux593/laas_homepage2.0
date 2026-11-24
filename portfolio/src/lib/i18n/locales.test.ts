import test from "node:test";
import assert from "node:assert/strict";

import { hasLocale, localizePath, otherLocale, withHash } from "./locales.ts";

test("hasLocale", () => {
  assert.equal(hasLocale("de"), true);
  assert.equal(hasLocale("en"), true);
  assert.equal(hasLocale("EN"), false);
  assert.equal(hasLocale("wp-login.php"), false);
});

test("otherLocale", () => {
  assert.equal(otherLocale("de"), "en");
  assert.equal(otherLocale("en"), "de");
});

test("localizePath", () => {
  assert.equal(localizePath("/", "de"), "/");
  assert.equal(localizePath("/", "en"), "/en");
  assert.equal(localizePath("/impressum", "de"), "/impressum");
  assert.equal(localizePath("/impressum", "en"), "/en/impressum");
});

test("withHash", () => {
  assert.equal(withHash("/en", "#work"), "/en#work");
  assert.equal(withHash("/", ""), "/");
  assert.equal(withHash("/en", "#"), "/en");
});
